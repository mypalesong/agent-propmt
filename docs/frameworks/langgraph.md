---
sidebar_position: 5
---

# LangGraph

![LangGraph Framework](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop&q=80)

LangGraph를 활용한 상태 기반 멀티 에이전트 워크플로우입니다.

## Overview

LangGraph는 LangChain 팀에서 개발한 상태 기반 에이전트 그래프 프레임워크입니다.

```bash
pip install langgraph langchain-openai
```

## State Machine Architecture

```mermaid
stateDiagram-v2
    [*] --> Researcher
    Researcher --> Writer: Research Complete
    Writer --> [*]: Draft Complete

    state Researcher {
        [*] --> Gathering
        Gathering --> Analyzing
        Analyzing --> Synthesizing
        Synthesizing --> [*]
    }

    state Writer {
        [*] --> Drafting
        Drafting --> Editing
        Editing --> [*]
    }
```

## Core Concepts

### State Graph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# Define state schema
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    current_agent: str
    task_complete: bool
    context: dict

# Create graph
workflow = StateGraph(AgentState)
```

### Nodes

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4")

RESEARCHER_PROMPT = """You are a research specialist.
Your job is to gather information on the given topic.
Be thorough and cite your sources."""

def researcher_node(state: AgentState) -> dict:
    """Research node that gathers information"""
    messages = state["messages"]

    response = llm.invoke([
        SystemMessage(content=RESEARCHER_PROMPT),
        *messages
    ])

    return {
        "messages": [response],
        "current_agent": "researcher"
    }

WRITER_PROMPT = """You are a content writer.
Based on the research provided, create engaging content.
Focus on clarity and structure."""

def writer_node(state: AgentState) -> dict:
    """Writer node that creates content"""
    messages = state["messages"]

    response = llm.invoke([
        SystemMessage(content=WRITER_PROMPT),
        *messages
    ])

    return {
        "messages": [response],
        "current_agent": "writer",
        "task_complete": True
    }

# Add nodes
workflow.add_node("researcher", researcher_node)
workflow.add_node("writer", writer_node)
```

### Edges

```python
# Simple edge
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", END)

# Set entry point
workflow.set_entry_point("researcher")

# Compile
app = workflow.compile()
```

## Conditional Routing

### Routing Flow

```mermaid
flowchart TD
    Start([Start]) --> Supervisor[Supervisor Node]
    Supervisor --> Route{Route Decision}

    Route -->|Need Research| Researcher[Researcher]
    Route -->|Need Writing| Writer[Writer]
    Route -->|Task Complete| End([End])

    Researcher --> Supervisor
    Writer --> Supervisor

    style Supervisor fill:#9B59B6
    style Route fill:#F39C12
    style Researcher fill:#3498DB
    style Writer fill:#E74C3C
```

### Route Function

```python
def route_decision(state: AgentState) -> str:
    """Determine next node based on state"""
    messages = state["messages"]
    last_message = messages[-1].content if messages else ""

    # Route based on content
    if "need more research" in last_message.lower():
        return "researcher"
    elif "ready to write" in last_message.lower():
        return "writer"
    elif state.get("task_complete"):
        return END
    else:
        return "supervisor"

# Add conditional edges
workflow.add_conditional_edges(
    "supervisor",
    route_decision,
    {
        "researcher": "researcher",
        "writer": "writer",
        "supervisor": "supervisor",
        END: END
    }
)
```

### Router Node

```python
ROUTER_PROMPT = """You are a task router.

Based on the conversation, decide the next action:
- If research is needed: respond with "ROUTE: researcher"
- If writing is needed: respond with "ROUTE: writer"
- If review is needed: respond with "ROUTE: reviewer"
- If task is complete: respond with "ROUTE: end"

Current conversation:
{messages}
"""

def router_node(state: AgentState) -> dict:
    """Route to appropriate agent"""
    messages_str = "\n".join([
        f"{m.type}: {m.content}" for m in state["messages"]
    ])

    response = llm.invoke(
        ROUTER_PROMPT.format(messages=messages_str)
    )

    return {"messages": [response]}

def parse_route(state: AgentState) -> str:
    """Parse routing decision from response"""
    last_message = state["messages"][-1].content

    if "ROUTE: researcher" in last_message:
        return "researcher"
    elif "ROUTE: writer" in last_message:
        return "writer"
    elif "ROUTE: reviewer" in last_message:
        return "reviewer"
    else:
        return END
```

## Multi-Agent Patterns

### Supervisor Pattern Architecture

```mermaid
graph TB
    User[User Input] --> Supervisor[Supervisor Agent]

    Supervisor --> Decision{Delegate To}

    Decision -->|Research Task| Researcher[Researcher]
    Decision -->|Analysis Task| Analyst[Analyst]
    Decision -->|Writing Task| Writer[Writer]
    Decision -->|Complete| End([Done])

    Researcher --> Supervisor
    Analyst --> Supervisor
    Writer --> Supervisor

    style Supervisor fill:#9B59B6
    style Researcher fill:#3498DB
    style Analyst fill:#27AE60
    style Writer fill:#E74C3C
```

### Supervisor Pattern

```python
from langgraph.graph import StateGraph, END

class SupervisorState(TypedDict):
    messages: Annotated[list, operator.add]
    next_agent: str
    results: dict

SUPERVISOR_PROMPT = """You are a supervisor managing a team.

Your team:
- Researcher: Gathers information
- Analyst: Analyzes data
- Writer: Creates content

Based on the current state, decide who should work next.
If the task is complete, say "DONE".

Respond with just the agent name or "DONE".
"""

def supervisor_node(state: SupervisorState) -> dict:
    response = llm.invoke([
        SystemMessage(content=SUPERVISOR_PROMPT),
        HumanMessage(content=f"Current results: {state.get('results', {})}")
    ])

    next_agent = response.content.strip().lower()

    return {"next_agent": next_agent}

def route_from_supervisor(state: SupervisorState) -> str:
    next_agent = state.get("next_agent", "")

    if next_agent == "done":
        return END
    elif next_agent in ["researcher", "analyst", "writer"]:
        return next_agent
    else:
        return "supervisor"  # Re-evaluate

# Build graph
workflow = StateGraph(SupervisorState)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("analyst", analyst_node)
workflow.add_node("writer", writer_node)

workflow.set_entry_point("supervisor")
workflow.add_conditional_edges("supervisor", route_from_supervisor)

# Workers return to supervisor
for worker in ["researcher", "analyst", "writer"]:
    workflow.add_edge(worker, "supervisor")
```

### Parallel Execution

```mermaid
flowchart LR
    Input[Input] --> Split{Split Tasks}

    Split --> Research[Research Node]
    Split --> Analysis[Analysis Node]

    Research --> Combine[Combine Node]
    Analysis --> Combine

    Combine --> Output[Final Output]

    style Split fill:#F39C12
    style Research fill:#3498DB
    style Analysis fill:#27AE60
    style Combine fill:#9B59B6
```

```python
from langgraph.graph import StateGraph

class ParallelState(TypedDict):
    input: str
    research_result: str
    analysis_result: str
    combined_result: str

def research_node(state: ParallelState) -> dict:
    # Research task
    result = llm.invoke(f"Research: {state['input']}")
    return {"research_result": result.content}

def analysis_node(state: ParallelState) -> dict:
    # Analysis task
    result = llm.invoke(f"Analyze: {state['input']}")
    return {"analysis_result": result.content}

def combine_node(state: ParallelState) -> dict:
    # Combine results
    combined = f"""
    Research: {state['research_result']}
    Analysis: {state['analysis_result']}
    """
    result = llm.invoke(f"Synthesize:\n{combined}")
    return {"combined_result": result.content}

# Build parallel graph
workflow = StateGraph(ParallelState)
workflow.add_node("research", research_node)
workflow.add_node("analysis", analysis_node)
workflow.add_node("combine", combine_node)

workflow.set_entry_point("research")  # Start with research
workflow.add_edge("research", "analysis")  # Can run in parallel with proper setup
workflow.add_edge("analysis", "combine")
workflow.add_edge("combine", END)
```

## Checkpointing & Memory

### Add Checkpointer

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Create checkpointer
memory = SqliteSaver.from_conn_string(":memory:")

# Compile with checkpointer
app = workflow.compile(checkpointer=memory)

# Run with thread ID
config = {"configurable": {"thread_id": "user-123"}}
result = app.invoke(initial_state, config=config)

# Resume later
new_result = app.invoke({"messages": [new_message]}, config=config)
```

### State Persistence

```python
from langgraph.checkpoint.postgres import PostgresSaver

# Production-grade checkpointer
checkpointer = PostgresSaver.from_conn_string(
    "postgresql://user:pass@localhost/db"
)

app = workflow.compile(checkpointer=checkpointer)

# List checkpoints
checkpoints = list(checkpointer.list(config))
for cp in checkpoints:
    print(f"Checkpoint: {cp.checkpoint_id} at {cp.created_at}")
```

## Tools Integration

### Tool-Enabled Agent

```python
from langchain.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression."""
    return str(eval(expression))

tools = [search_web, calculate]

# Create tool node
tool_node = ToolNode(tools)

# Agent with tools
def agent_node(state: AgentState) -> dict:
    response = llm.bind_tools(tools).invoke(state["messages"])
    return {"messages": [response]}

def should_use_tools(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_use_tools)
workflow.add_edge("tools", "agent")
```

## Complete Example

### Research & Writing Workflow

```mermaid
flowchart LR
    Start([Start]) --> Research[Research Node]
    Research --> Outline[Outline Node]
    Outline --> Write[Write Node]
    Write --> Edit[Edit Node]
    Edit --> End([Complete])

    Research -.->|research| State[(State)]
    Outline -.->|outline| State
    Write -.->|draft| State
    Edit -.->|final| State

    style Research fill:#3498DB
    style Outline fill:#27AE60
    style Write fill:#E74C3C
    style Edit fill:#F39C12
    style State fill:#95A5A6
```

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator

# State
class ResearchState(TypedDict):
    topic: str
    messages: Annotated[list, operator.add]
    research: str
    outline: str
    draft: str
    final: str
    stage: str

# LLM
llm = ChatOpenAI(model="gpt-4")

# Prompts
RESEARCHER_PROMPT = """Research the following topic thoroughly.
Provide key facts, statistics, and insights.
Topic: {topic}"""

OUTLINER_PROMPT = """Based on this research, create an outline.
Research: {research}"""

WRITER_PROMPT = """Write content based on this outline.
Outline: {outline}
Research: {research}"""

EDITOR_PROMPT = """Edit and polish this draft.
Draft: {draft}"""

# Nodes
def research_node(state: ResearchState) -> dict:
    response = llm.invoke(
        RESEARCHER_PROMPT.format(topic=state["topic"])
    )
    return {
        "research": response.content,
        "messages": [response],
        "stage": "researched"
    }

def outline_node(state: ResearchState) -> dict:
    response = llm.invoke(
        OUTLINER_PROMPT.format(research=state["research"])
    )
    return {
        "outline": response.content,
        "messages": [response],
        "stage": "outlined"
    }

def write_node(state: ResearchState) -> dict:
    response = llm.invoke(
        WRITER_PROMPT.format(
            outline=state["outline"],
            research=state["research"]
        )
    )
    return {
        "draft": response.content,
        "messages": [response],
        "stage": "drafted"
    }

def edit_node(state: ResearchState) -> dict:
    response = llm.invoke(
        EDITOR_PROMPT.format(draft=state["draft"])
    )
    return {
        "final": response.content,
        "messages": [response],
        "stage": "complete"
    }

# Build workflow
workflow = StateGraph(ResearchState)

workflow.add_node("research", research_node)
workflow.add_node("outline", outline_node)
workflow.add_node("write", write_node)
workflow.add_node("edit", edit_node)

workflow.set_entry_point("research")
workflow.add_edge("research", "outline")
workflow.add_edge("outline", "write")
workflow.add_edge("write", "edit")
workflow.add_edge("edit", END)

app = workflow.compile()

# Run
result = app.invoke({
    "topic": "The Future of AI Agents",
    "messages": [],
    "research": "",
    "outline": "",
    "draft": "",
    "final": "",
    "stage": "start"
})

print(result["final"])
```

## Best Practices

### State Design

```python
# Good: Clear, typed state
class WellDefinedState(TypedDict):
    input: str
    intermediate_results: dict
    final_output: str
    error: Optional[str]
    metadata: dict

# Bad: Untyped, unclear state
state = {"data": ..., "stuff": ...}
```

### Error Handling

```python
def safe_node(state: AgentState) -> dict:
    try:
        result = llm.invoke(...)
        return {"messages": [result]}
    except Exception as e:
        return {
            "messages": [AIMessage(content=f"Error: {str(e)}")],
            "error": str(e)
        }

def error_router(state: AgentState) -> str:
    if state.get("error"):
        return "error_handler"
    return "next_node"
```

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples)
- [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio)
