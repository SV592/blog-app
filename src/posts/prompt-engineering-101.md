---
title: Prompt Engineering 101
date: "2025-07-09"
description: Learn the essential techniques for effective prompt engineering to get the best results from AI models.
tags: ["Prompt Engineering", "LLM", "Gen AI"]
image: "/blogImages/chatgpt.jpg"
slug: prompt-engineering-101
---

## Task:

- **Clear Instructions:** Directly tell the AI what to do because ambiguity leads to unpredictable results. Example: Instead of "Tell me about vacuums," instruct the AI: "List the top three benefits of owning a robot vacuum." This precise instruction guides the AI to provide specific, actionable information.

- **Adopt a Persona:** Giving the AI a role can significantly enhance the output by guiding it's tone, style, and content.
  Example: To make your list more engaging, give the AI a role: "Act as a busy parent who relies on technology to simplify household chores. List the top three benefits of owning a robot vacuum." This **persona** ensures the AI's response resonates with your target audience's experience and priorities.

- **Specify the Format:** Define how you want the AI to structure its response because they can be sometimes unpredictable. Example: To make the benefits easy to read and understand, specify the format. The prompt now includes: "Act as a busy parent who relies on technology to simplify household chores. Provide a numbered list detailing the top three benefits of owning a robot vacuum, with each benefit described in a single sentence." This ensures a clear, structured **format** that meets your needs.

## Context:

Include details about the target audience or the background of the request. This helps the AI align its response with the intended recipient's interests and age group.

**Example:** You want your robot vacuum benefits to specifically appeal to families. Refine the prompt: "Act as a busy parent who relies on technology to simplify household chores. Provide a numbered list detailing the top three benefits of owning a robot vacuum, with each benefit described in a single sentence. This information is for an online ad targeting other parents aged 30-45 with toddlers and shedding pets, highlighting how the vacuum solves their common cleaning struggles." This **context** helps the AI emphasize benefits like pet hair removal and quiet operation for sleeping children.

## References:

Providing specific examples of the desired output is incredibly powerful. This acts as a direct reference for the AI.

**Example:** To ensure the AI matches your desired tone and style. For example "Act as a busy parent who relies on technology to simplify household chores. Provide a numbered list detailing the top three benefits of owning a robot vacuum, with each benefit described in a single sentence. This information is for an online ad targeting other parents aged 30-45 with toddlers and shedding pets, highlighting how the vacuum solves their common cleaning struggles. \_For example, phrase benefits with an empathetic, problem-solving tone, such as: 'Reclaim your precious free time by letting the robot handle daily floor duty.'" This specific phrasing acts as a **reference** for the desired stylistic flair and emotional connection.

## Evaluate:

AI models can **hallucinate**, meaning they generate information that sounds plausible but is factually incorrect or completely fabricated. Always responses, especially for critical information. This happens because AI models learn patterns from vast amounts of data but lack true understanding or real-world experience. They predict the next most probable word or phrase, which sometimes leads to confident but inaccurate statements.

**Example:** If your AI, using the previous prompt, were to include a benefit like, "This robot vacuum also washes your dishes while it cleans the floors," this would be a **hallucination**. While convenient, a vacuum cleaner doesn't have dishwashing capabilities. Always check the accuracy of the AI's output, especially when it sounds too good to be true.

## Iterate

Prompt engineering is an iterative process. Rarely will your first attempt yield a perfect result. Embrace refinement through these steps:

### Revisit Your Framework (More Context and References)

Add more context and references, considering what additional information would help the AI.

**Example:** Our previous prompt produced good features, but we want to emphasize smart home integration and quietness.

- **Revised Prompt (Adding More Context/References):** "Act as a busy parent who relies on technology to simplify household chores. Provide a numbered list detailing the top three benefits of owning a robot vacuum, with each benefit described in a single sentence. Specifically highlight its _quiet operation for napping children and seamless integration with smart home voice assistants_. This information is for an online ad targeting other parents aged 30-45 with toddlers and shedding pets, highlighting how the vacuum solves their common cleaning struggles. For example, phrase benefits with an empathetic, problem-solving tone, such as: 'Reclaim your precious free time by letting the robot handle daily floor duty.'"

### Split Prompts into Shorter Sentences

Break down complex requests into shorter, more manageable sentences or even separate prompts. This reduces the cognitive load on the AI and improves accuracy.

**Example of Splitting:** Instead of one long prompt, we could split the task for the robot vacuum advertisement:

- **Prompt 1:** "Act as a busy parent. Draft a short, engaging headline for an online ad about a new robot vacuum for families."
- **Prompt 2:** "Now, list three key benefits of this robot vacuum for parents with young children and pets, focusing on time-saving and quiet operation, in a numbered list format."
- **Prompt 3:** "Write a single sentence call to action encouraging parents to learn more about the vacuum."

### Try Different Phrasing or Switching to an Analogous Task

Experiment with synonyms and alternative sentence structures. Sometimes a slight change in wording can make a big difference.

**Example:** If your direct "benefits" list isn't compelling enough, you can try an analogous task for your robot vacuum:

- **Revised Prompt (Analogous Task - Testimonial):** "Write a short, enthusiastic testimonial from a busy parent (aged 35) about how a new robot vacuum has transformed their chaotic home into a clean sanctuary. Focus on how it saves time, handles pet hair, and integrates seamlessly with their smart home."

### Introduce Constraints

Define limitations or boundaries for the AI's response. This guides the AI to focus on specific aspects and prevents it from generating irrelevant or undesirable content.

**Example:** To keep your robot vacuum content concise and impactful:

- **Previous Prompt:** "...Provide a numbered list detailing the top three benefits of owning a robot vacuum, with each benefit described in a single sentence..."
- **Revised Prompt (Adding Constraints):** "Act as a busy parent who relies on technology to simplify household chores. Provide a numbered list of exactly **three** compelling benefits of owning a robot vacuum. Each benefit must be a single sentence, under 10 words, focusing only on 'time saved' or 'cleanliness.' Do not mention price or brand names." This guides the AI within specific creative boundaries, ensuring brevity and focus.

## Conclusion

Mastering prompt engineering elevates your interactions with AI from basic commands to sophisticated conversations. By consistently applying clear instructions, adopting personas, specifying formats, and providing rich context and references, you direct AI with precision. Remember to always evaluate the AI's output for accuracy and be ready to iterate, splitting complex tasks, trying different phrasings, and introducing constraints. With these techniques, you can harness the full power of AI to achieve remarkable results
