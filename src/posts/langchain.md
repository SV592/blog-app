---
title: LangChain- From Two Line Chains to Tool Using Agents
date: "2026-07-13"
description: A practical tour of LangChain, from composing chains with LCEL to retrieval-augmented generation and tool-using agents.
tags: ["LangChain", "AI", "Orchestration"]
image: "/blogImages/langchain-logo.png"
slug: langchain
---

# Building with LangChain

Large language models are strong reasoners, but on their own they are stateless text predictors. They can't read your documents, call your APIs, remember a conversation, or act in the world. LangChain wires models into applications that can. It gives you a common interface over models, prompts, and tools, plus a composition language for stitching them into pipelines you can read, test, and swap out.

We'll go through the core building blocks, the LangChain Expression Language (LCEL) that connects them, memory, retrieval-augmented generation (RAG), and agents that decide which tools to call. The examples use the Python packages; the same ideas carry over to the JavaScript library.

## Core Building Blocks

Almost everything in LangChain reduces to three primitives: a **prompt** that formats input, a **model** that generates text, and an **output parser** that shapes the result into something your code can use. Each is a standalone object with a consistent interface, which is what makes them composable.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# The model: a thin, provider-agnostic wrapper around the chat API
model = ChatOpenAI(model="gpt-4o", temperature=0)

# The prompt: a reusable template with named variables
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a concise technical writer."),
    ("human", "Explain {topic} in two sentences."),
])

# The parser: turn the model's message object into a plain string
parser = StrOutputParser()
```

Because the model is just an interface, swapping `ChatOpenAI` for `ChatAnthropic` or a local model is a one-line change. Your prompts, parsers, and downstream logic stay exactly the same. That is what the interface buys you.

## Composing with LCEL

The LangChain Expression Language lets you connect these primitives with the pipe operator, the same way you would pipe commands in a shell. Each component implements the `Runnable` interface, so the output of one becomes the input of the next.

```python
# prompt -> model -> parser, read left to right
chain = prompt | model | parser

result = chain.invoke({"topic": "vector embeddings"})
print(result)
```

Every LCEL chain is itself a `Runnable`, which means it inherits a uniform set of methods for free:

- `invoke()` runs the chain on a single input.
- `batch()` runs it over a list of inputs, with concurrency handled for you.
- `stream()` yields tokens as they are generated, ideal for responsive UIs.
- `ainvoke()`, `abatch()`, and `astream()` are the async equivalents.

```python
# Stream the response token by token
for chunk in chain.stream({"topic": "the CAP theorem"}):
    print(chunk, end="", flush=True)
```

You can also run steps in parallel and reshape data mid-pipeline. `RunnableParallel` fans out to multiple branches, and `RunnablePassthrough` forwards the original input alongside computed values.

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

# Produce a summary and a title from the same input, concurrently
summary_prompt = ChatPromptTemplate.from_template("Summarize: {text}")
title_prompt = ChatPromptTemplate.from_template("Write a title for: {text}")

pipeline = RunnableParallel(
    summary=summary_prompt | model | parser,
    title=title_prompt | model | parser,
    original=RunnablePassthrough(),
)

output = pipeline.invoke({"text": "..."})
# -> {"summary": "...", "title": "...", "original": {"text": "..."}}
```

## Adding Memory

Chains are stateless by default: each call knows nothing about the last one. To hold a conversation you need to feed prior turns back into the prompt. The modern pattern wraps a chain with `RunnableWithMessageHistory`, which loads and saves history keyed by a session id.

```python
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import MessagesPlaceholder

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

chain = chat_prompt | model | parser

# A store mapping session ids to their message history
store = {}

def get_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

conversation = RunnableWithMessageHistory(
    chain,
    get_history,
    input_messages_key="input",
    history_messages_key="history",
)

# The session id ties turns together
config = {"configurable": {"session_id": "user-42"}}
conversation.invoke({"input": "My name is Sam."}, config=config)
conversation.invoke({"input": "What is my name?"}, config=config)  # -> "Your name is Sam."
```

In production you would back `get_history` with Redis, Postgres, or another store instead of an in-memory dictionary, but the chain code never changes.

## Retrieval-Augmented Generation

A model only knows what was in its training data. RAG fixes that by retrieving relevant text at query time and injecting it into the prompt, grounding answers in your own documents and cutting down on hallucination. The pipeline has four stages: **load**, **split**, **embed and store**, then **retrieve and generate**. The examples below also expect `beautifulsoup4` (for `WebBaseLoader`) and `faiss-cpu` (for the vector store) installed alongside the core packages.

### Load and Split

Documents are loaded from a source, then chopped into overlapping chunks small enough to fit alongside a question in the model's context window.

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

docs = WebBaseLoader("https://example.com/handbook").load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,       # characters per chunk
    chunk_overlap=200,     # overlap preserves context across boundaries
)
chunks = splitter.split_documents(docs)
```

### Embed and Store

Each chunk is turned into a vector embedding, a numeric fingerprint of its meaning, and saved in a vector store. Similar text lands near similar text, which is what makes semantic search possible.

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = FAISS.from_documents(chunks, embeddings)

# A retriever exposes the store as a Runnable that returns top-k matches
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
```

### Retrieve and Generate

Finally, LCEL ties it together: the retriever pulls context, `RunnablePassthrough` carries the question through, and the prompt formats both for the model.

```python
from langchain_core.runnables import RunnablePassthrough

rag_prompt = ChatPromptTemplate.from_template(
    """Answer the question using only the context below.
If the answer isn't in the context, say you don't know.

Context:
{context}

Question: {question}"""
)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | model
    | parser
)

rag_chain.invoke("What is the company's remote work policy?")
```

The question flows into both branches at once: the retriever finds the four most relevant chunks while the raw question is passed straight through, and both arrive at the prompt ready to be answered.

## Agents and Tools

RAG retrieves information, but sometimes a model needs to *act*, run a calculation, query a database, or hit an API, and decide for itself which action to take. That is what agents do. You give the model a set of **tools**, and it reasons about which to call, inspects the result, and repeats until it can answer.

Defining a tool is as simple as decorating a function. The docstring and type hints become the tool's description, which the model reads to decide when to use it.

```python
from langchain_core.tools import tool

@tool
def multiply(a: int, b: int) -> int:
    """Multiply two integers together."""
    return a * b

@tool
def get_weather(city: str) -> str:
    """Return the current weather for a given city."""
    # In reality this would call a weather API
    return f"It is 22C and sunny in {city}."

tools = [multiply, get_weather]
```

An agent wraps a model that supports tool calling together with these tools. The `AgentExecutor` runs the loop: the model picks a tool, the executor calls it, the result is fed back, and the cycle continues until the model produces a final answer.

```python
from langchain.agents import create_tool_calling_agent, AgentExecutor

agent_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Use tools when needed."),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),  # holds intermediate steps
])

agent = create_tool_calling_agent(model, tools, agent_prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke({"input": "What is 12 times 8, and what's the weather in Tokyo?"})
```

Behind the scenes the model calls `multiply(12, 8)` and `get_weather("Tokyo")`, reads both results, and composes a single reply. The `agent_scratchpad` is where LangChain accumulates each tool call and its output so the model can reason over the running state.

For anything beyond a simple loop, LangChain now steers users toward **LangGraph**, a companion library that models agents as explicit state machines. Graphs give you branching, cycles, human-in-the-loop pauses, and persistence, the control you need once an agent grows past a handful of steps.

## Summary

LangChain's value is composition. A small set of primitives, models, prompts, and parsers, share one interface, so LCEL can pipe them into chains that stream, batch, and run in parallel without extra work. From there you add capabilities in layers: message history gives a chain memory, a retriever grounds it in your own data through RAG, and a set of tools turns it into an agent that decides what to do. Because every layer is swappable, a two-line chain can grow into a retrieval-backed, tool-using system without rewriting what came before.

## References and Further Reading

- **[LangChain Documentation](https://python.langchain.com/)**
  The official docs, with conceptual guides, how-tos, and API reference for the Python library.

- **[LangChain Expression Language (LCEL)](https://python.langchain.com/docs/concepts/lcel/)**
  Deep dive into the Runnable interface and how components compose with the pipe operator.

- **[Retrieval-Augmented Generation Tutorial](https://python.langchain.com/docs/tutorials/rag/)**
  A step-by-step walkthrough of building a RAG application from loaders to retrieval chains.

- **[Build an Agent](https://python.langchain.com/docs/tutorials/agents/)**
  Official tutorial on creating tool-calling agents and running the agent loop.

- **[LangGraph Documentation](https://langchain-ai.github.io/langgraph/)**
  The graph-based framework for building stateful, controllable multi-step agents.

- **[LangChain GitHub](https://github.com/langchain-ai/langchain)**
  The open source repository, including integrations, examples, and release notes.
