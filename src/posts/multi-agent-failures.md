---
title: Understanding Multi-Agent System Failures
date: "2025-07-18"
description: Dive deep into the pitfalls of multi-agent LLM systems, categorized for clearer understanding and better system design.
tags: ["Multi-Agent", "AI", "Failures"]
image: "/blogImages/n8n.png"
slug: multi-agent-failures
---

## What are Multi-Agent Systems?

Multi-agent systems (MAS) involve multiple interacting intelligent agents that collaborate or compete to achieve complex goals. These systems, often powered by Large Language Models (LLMs), hold immense promise across various applications, from complex simulations to automated decision-making.

## Unpacking the Core Failure Categories

Despite their potential, the deployment of multi-agent systems encounters significant hurdles due to various inherent failures. A recent empirical analysis of 200 MAS execution traces across seven task domains reveals a foundational understanding of these breakdowns. This study identifies 14 distinct failure modes, grouping them into three categories based on the fundamental nature of the breakdown.

This article dives into these critical failure types, as understood through the Multi-Agent System Failure Taxonomy (MAST), a comprehensive framework detailed in the paper "Why do multi-agent llm systems fail?" by Cemri, Mert, et al. (2025).

### 1. Specification Issues

Failures in this category trace their roots to system design decisions and ambiguous prompt specifications. These issues, while manifesting during execution, reflect inherent flaws in pre-execution design choices. Consider system architecture, prompt instructions, or state management, these elements lay the groundwork for potential problems.

- **Disobey Task Specification (10.98%)**: An agent receives instructions to summarize a document in 500 words but produces a 200-word summary. The agent fails to adhere to the given word count.
- **Disobey Role Specification (0.5%)**: A "code reviewer" agent begins writing new code instead of strictly focusing on reviewing and providing feedback on existing code. The agent steps outside its defined role.
- **Step Repetition (17.14%)**: A customer service bot repeatedly asks a user for their account number, even after the user has provided it multiple times in the conversation. The bot gets stuck in a loop.
- **Loss of Conversation History (3.33%)**: A design agent asks about the user's preferred color scheme for a website, and then minutes later asks the same question again, forgetting the previous input. The system loses track of past interactions.
- **Unaware of Termination Conditions (9.82%)**: A project management MAS is tasked with planning a marketing campaign. After all tasks are assigned and deadlines set, the system continues generating new, unnecessary planning steps instead of recognizing the task's completion.

**Addressing Specification Issues:**
Failure to follow specifications runs deeper than simple instruction following. For instance, to prevent agents from being "Unaware of Termination Conditions," the system design can incorporate explicit "completion checkpoints" or a dedicated "monitor agent" that actively checks predefined success criteria. This stops reliance solely on the task-executing agents to self-terminate. Refining agent role specifications also boosts success rates. An example of this involves explicitly limiting an agent's scope: for a content creation task, a "feature writer" agent could be instructed to _only_ include product features from the provided brief, preventing it from pulling in irrelevant trending topics.

### 2. Inter-Agent Misalignment

This category encompasses breakdowns with inter-agent interaction and coordination during execution. Agents, despite individual capabilities, fail to align towards a common objective.

- **Conversation Reset (2.33%)**: Two agents are discussing a complex problem, and suddenly one agent acts as if the conversation just started, asking for context already provided. The conversation abruptly restarts without explanation.
- **Fail to Ask for Clarification (11.65%)**: An agent is told to "find the best restaurant." Instead of asking for criteria like cuisine or price range, it defaults to a random choice, making an unverified assumption.
- **Task Derailment (7.15%)**: A team of agents is building a website. One agent, tasked with front-end development, starts researching new AI models instead, shifting away from the core task.
- **Information Withholding (1.66%)**: An agent discovers a crucial API key is incorrect but proceeds with tasks that require it without informing other agents or attempting to fix the issue. Vital information remains siloed.
- **Ignored Other Agent's Input (0.17%)**: One agent suggests a specific approach to solving a problem, but another agent completely disregards this suggestion and pursues an alternative, less efficient method.
- **Reasoning-Action Mismatch (13.98%)**: An agent correctly identifies that a user wants to book a flight to Paris, but then attempts to search for flights to London. The agent's action contradicts its stated reasoning.

**Mitigating Inter-Agent Misalignment:**
It's often challenging to diagnose inter-agent coordination failures because different underlying issues can lead to similar observable problems. For instance, to combat "Information Withholding," you could implement a information-sharing protocol where agents are required to explicitly summarize and confirm critical findings or API responses to relevant peers. To address "Fail to Ask for Clarification," the system can enforce a "clarification loop": if an agent detects ambiguity in instructions or inputs, it must explicitly query the orchestrator or user for more details before proceeding with assumptions.

### 3. Task Verification

Failures in this category stem from inadequate verification processes, or premature task termination, compromising the final output quality. These issues highlight challenges in ensuring the correctness and reliability of the end result.

- **Premature Termination (7.82%)**: An agent tasked with writing a comprehensive report finishes after only a few paragraphs, declaring completion even though much of the required content is missing.
- **No or Incomplete Verification (6.82%)**: A coding agent generates a program, and the system declares it "done" without running any test cases or checking for obvious syntax errors. The verification step is either absent or superficial.
- **Incorrect Verification (6.66%)**: An agent's verification process falsely marks a bug-ridden piece of code as "correct" because its checks are limited to superficial elements like code formatting, missing actual functional flaws. The verification gives a false positive.

**Enhancing Task Verification:**
Current verification in multi-agent systems is often superficial, typically checking only basic functionality or syntax without deeply validating complex task objectives or nuanced scenarios. For instance to prevent "No or incomplete Verification" issues, consider a multi-agent system generating a chess program, its verifier shouldn't just confirm the code compiles. Instead, it should integrate with a dedicated chess engine (an external knowledge source) to validate move legality and game states according to actual chess rules. This goes beyond basic checks, implementing a multi-level approach that ensures true functionality and adherence to high-level game objectives.

## Conclusion

The Multi-Agent System Failure Taxonomy (MAST) provides a vital framework for understanding the intricate pitfalls of multi-agent LLM systems. By dissecting failures into distinct categories, Specification Issues, Inter-Agent Misalignment, and Task Verification. MAST offers a clear path for diagnosing and addressing system shortcomings. Its detailed failure modes and empirical grounding establish a common language for researchers and developers. MAST’s insights confirm the necessity of robust system design, effective inter-agent coordination, and comprehensive, multi-level verification strategies. Moving forward, continued research and development, guided by taxonomies like MAST, will be crucial for unlocking the full potential of reliable and efficient multi-agent AI.

**References:**

Cemri, M., Pan, M. Z., Yang, S., Agrawal, L. A., Chopra, B., Tiwari, R., Keutzer, K., Parameswaran, A., Klein, D., Ramchandran, K., et al. (2025). Why do multi-agent llm systems fail?. _arXiv preprint arXiv:2503.13657_.
