---
title: Model Context Protocol (MCP)
date: "2025-10-27"
description: Understanding how the Model Context Protocol enables language models to interact with external tools, data sources, and applications.
tags: ["MCP", "AI", "Integration"]
image: "/blogImages/mcp.webp"
slug: mcp
---

# Understanding the Model Context Protocol

The Model Context Protocol (MCP) is a standard for connecting language models to external tools, databases, and applications. Language models excel at reasoning but operate in isolation without access to realtime data or specialized systems. MCP bridges this gap by establishing a clear contract for how AI and external tools communicate.

## Browser Automation for Testing (A Practical Example)

Imagine a QA team testing a web application. An MCP server wraps Playwright and exposes tools that Claude can invoke. Given a test specification like "verify checkout with a discount code," Claude orchestrates the entire workflow: navigating the site, filling forms, clicking buttons, and validating results.

This transforms testing from manual scripting into AI guided exploration. Claude analyzes screenshots, reasons about failures, and adapts when UI elements change. Organizations expose their existing tools as servers, enabling models to perform complex work autonomously.

## MCP Clients and Servers

### MCP Servers

MCP servers expose capabilities from existing tools, APIs, databases, and applications. A server could provide access to a knowledge base, database, Slack integration, or Playwright for browser automation. Multiple servers run simultaneously, each offering distinct capabilities that organizations compose based on their needs.

A server initializes with configuration, advertises its capabilities (tools, resources, sampling functions), and waits for client requests. Here's a Python MCP server wrapping Playwright:

```python
import asyncio
import base64
from mcp.server import Server
from mcp.types import Tool, TextContent, ImageContent
from playwright.async_api import async_playwright

# Create MCP server
server = Server("playwright-server")
browser = None
page = None

@server.call_tool()
async def handle_tool_call(name: str, arguments: dict) -> list:
    """Handle tool calls from Claude"""
    global browser, page
    
    if name == "navigate":
        if page is None:
            playwright = await async_playwright().start()
            browser = await playwright.chromium.launch()
            context = await browser.new_context()
            page = await context.new_page()
        
        await page.goto(arguments["url"])
        return [TextContent(type="text", text=f"Navigated to {arguments['url']}")]
    
    elif name == "fill":
        await page.fill(arguments["selector"], arguments["text"])
        return [TextContent(type="text", text=f"Filled {arguments['selector']}")]
    
    elif name == "click":
        await page.click(arguments["selector"])
        return [TextContent(type="text", text=f"Clicked {arguments['selector']}")]
    
    elif name == "screenshot":
        screenshot_bytes = await page.screenshot()
        encoded = base64.b64encode(screenshot_bytes).decode("utf-8")
        return [ImageContent(type="image", data=encoded, mimeType="image/png")]

# Register tools
server.register_tool(
    Tool(
        name="navigate",
        description="Navigate to a URL",
        inputSchema={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to navigate to"}
            },
            "required": ["url"]
        }
    )
)

server.register_tool(
    Tool(
        name="screenshot",
        description="Take a screenshot",
        inputSchema={"type": "object", "properties": {}}
    )
)

if __name__ == "__main__":
    from mcp.server.stdio import stdio_server
    asyncio.run(stdio_server(server))
```

### MCP Clients

Claude and other language models act as clients, orchestrating requests across multiple servers and synthesizing responses with realtime data. The client maintains a registry of available servers, routes requests appropriately, and handles errors transparently. This separation allows servers to be deployed, updated, and scaled independently from the AI model.

## Capabilities

### Tools 

Tools represent functions that servers expose. When Claude needs to perform an action, it invokes a tool through the client, the server executes the operation, and results return for further processing. This creates a feedback loop where reasoning, action, and analysis happen continuously.

### Resources 

Resources provide read only access to data documents, database records, or API responses. Unlike tools, they don't perform actions. In the Playwright example, screenshots are resources Claude uses to validate test results.

### Sampling 

Sampling allows servers to access the language model through the MCP client. A server can send a screenshot to Claude and ask it to identify form fields, enabling more sophisticated workflows through back and forth collaboration.

```python
# Server asks Claude to analyze a screenshot
async def analyze_page_with_sampling(client, screenshot_base64):
    """Request Claude's analysis of a screenshot"""
    
    response = await client.create_message(
        model="claude-opus-4-1",
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": screenshot_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": "What form fields do you see? List each with its label and type."
                    }
                ],
            }
        ],
    )
    
    return response.content[0].text
```

## Coordination and Control

### Logging and Notifications

Every interaction gets logged for compliance and debugging. Notifications alert on state changes, errors, or completion events. Together they provide transparency into system behavior.

### Roots

Roots define what each server can access. A file server might restrict access to specific directories, while a database server only uses certain schemas. This prevents unauthorized access and accidental breaches.

```python
from mcp.server import Server

server = Server("playwright-server")

# Define accessible domains
roots = [
    {
        "uri": "https://app.example.com",
        "name": "Application Under Test",
        "description": "Test domain"
    },
    {
        "uri": "https://staging.example.com",
        "name": "Staging Environment",
        "description": "Pre-release testing"
    }
]

server.set_roots(roots)

@server.call_tool()
async def handle_tool_call(name: str, arguments: dict) -> list:
    """Validate requests against roots"""
    
    if name == "navigate":
        url = arguments["url"]
        allowed = any(url.startswith(root["uri"]) for root in roots)
        
        if not allowed:
            return [TextContent(
                type="text",
                text=f"Error: URL {url} is not within allowed roots"
            )]
        
        await page.goto(url)
        return [TextContent(type="text", text=f"Navigated to {url}")]
```

## Summary

The Model Context Protocol standardizes AI integration with external systems through client/server architecture, distributed capabilities, and flexible transport. Logging, notifications, and roots provide safety and coordination. The Playwright example demonstrates the real value: a single MCP server enables autonomous testing with adaptive reasoning.

## References and Further Reading

- **[Official MCP Website](https://modelcontextprotocol.io/)**
  The central hub for MCP resources, documentation, and getting started guides.

- **[MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18)**
  The authoritative technical specification defining protocol requirements and standards.

- **[MCP GitHub Organization](https://github.com/modelcontextprotocol)**
  Official code repository with SDKs in multiple languages and the open source project.

- **[TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)**
  Complete guide for building MCP servers and clients with TypeScript.

- **[MCP Server Registry](https://registry.modelcontextprotocol.io/)**
  Catalog of publicly available MCP servers for discovery and integration.

- **[Community MCP Servers](https://github.com/modelcontextprotocol/servers)**
  Open source implementations for Google Drive, Slack, GitHub, Postgres, Puppeteer, and Stripe.