---
sidebar_position: 3
---

# Hierarchical Pattern

다층 구조로 에이전트들을 조직화하는 패턴입니다.

![Hierarchical Organization](https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop&q=80)

## Pattern Overview

```mermaid
flowchart TB
    E["👔 Executive Agent"]

    subgraph ManagerLevel["Manager Level"]
        M1["📊 Manager A<br/>(Research)"]
        M2["📈 Manager B<br/>(Analysis)"]
        M3["📝 Manager C<br/>(Output)"]
    end

    subgraph WorkerLevel["Worker Level"]
        W1["👷 W1-1"]
        W2["👷 W1-2"]
        W3["👷 W2-1"]
        W4["👷 W2-2"]
        W5["👷 W3-1"]
        W6["👷 W3-2"]
    end

    E --> M1 & M2 & M3
    M1 --> W1 & W2
    M2 --> W3 & W4
    M3 --> W5 & W6

    style E fill:#c0392b,stroke:#fff,color:#fff
    style M1 fill:#e74c3c,stroke:#fff,color:#fff
    style M2 fill:#e74c3c,stroke:#fff,color:#fff
    style M3 fill:#e74c3c,stroke:#fff,color:#fff
```

## When to Use

```mermaid
mindmap
  root((Hierarchical<br/>Pattern))
    Large Scale
      Complex projects
      Many agents
      Multiple domains
    Clear Hierarchy
      Defined roles
      Accountability
      Delegation
    Scalability
      Add teams easily
      Parallel departments
      Independent units
```

- 대규모 복잡한 프로젝트
- 전문 영역별 분리가 필요할 때
- 명확한 책임 분리가 필요할 때
- 확장 가능한 팀 구조가 필요할 때

## Level Definitions

### Executive Level

```mermaid
flowchart TB
    subgraph Executive["👔 Executive Level"]
        E["Executive Agent"]
        E1["Strategic Planning"]
        E2["Resource Allocation"]
        E3["Quality Assurance"]
    end

    E --> E1 & E2 & E3

    style Executive fill:#c0392b,stroke:#fff,color:#fff
```

```python
EXECUTIVE_PROMPT = """
# Identity

You are the Executive Agent, the highest-level decision maker
in this multi-agent organization.

## Authority
- Define strategic direction
- Allocate resources across departments
- Make cross-department decisions
- Approve major deliverables

## Direct Reports
- Research Manager: Oversees information gathering
- Analysis Manager: Oversees data processing
- Output Manager: Oversees content creation

## Responsibilities

### Strategic Planning
- Understand the overall objective
- Break down into departmental goals
- Set priorities and timelines

### Resource Allocation
- Assign projects to managers
- Balance workload across departments
- Resolve resource conflicts

### Quality Assurance
- Review manager-level outputs
- Ensure alignment with objectives
- Approve final deliverables
"""
```

### Manager Level

```mermaid
flowchart TB
    subgraph Manager["📊 Manager Level"]
        M["Department Manager"]
        M1["Task Management"]
        M2["Team Coordination"]
        M3["Quality Control"]
    end

    M --> M1 & M2 & M3

    E["👔 Executive"] --> M
    M --> W1["👷 Worker 1"] & W2["👷 Worker 2"]

    style Manager fill:#e74c3c,stroke:#fff,color:#fff
```

### Worker Level

```mermaid
flowchart TB
    subgraph Worker["👷 Worker Level"]
        W["Specialized Worker"]
        W1["Execute Tasks"]
        W2["Report Progress"]
        W3["Request Help"]
    end

    W --> W1 & W2 & W3

    M["📊 Manager"] --> W

    style Worker fill:#3498db,stroke:#fff,color:#fff
```

## Implementation

### LangGraph Hierarchical Implementation

```mermaid
stateDiagram-v2
    [*] --> Executive
    Executive --> ResearchManager
    Executive --> AnalysisManager
    Executive --> OutputManager

    ResearchManager --> WebSearcher
    ResearchManager --> DocAnalyzer

    AnalysisManager --> DataProcessor
    AnalysisManager --> InsightGenerator

    OutputManager --> Writer
    OutputManager --> Editor

    WebSearcher --> ResearchManager
    DocAnalyzer --> ResearchManager
    DataProcessor --> AnalysisManager
    InsightGenerator --> AnalysisManager
    Writer --> OutputManager
    Editor --> OutputManager

    ResearchManager --> Executive
    AnalysisManager --> Executive
    OutputManager --> Executive

    Executive --> [*]
```

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Optional

class HierarchicalState(TypedDict):
    objective: str
    executive_plan: dict
    manager_tasks: dict
    worker_outputs: dict
    final_output: str

def executive_node(state: HierarchicalState) -> HierarchicalState:
    """Executive creates strategic plan"""
    objective = state["objective"]

    plan = executive_llm.invoke(
        EXECUTIVE_PROMPT +
        f"\n\nObjective: {objective}\n\nCreate strategic plan:"
    )

    return {"executive_plan": parse_json(plan)}

def manager_router(state: HierarchicalState) -> str:
    """Route to appropriate manager"""
    plan = state["executive_plan"]

    # Find next manager with pending work
    for manager in ["research", "analysis", "output"]:
        if manager_has_pending_work(plan, manager):
            return f"{manager}_manager"

    return "executive_review"

# Build graph
workflow = StateGraph(HierarchicalState)

# Add nodes
workflow.add_node("executive", executive_node)
workflow.add_node("research_manager", research_manager_node)
workflow.add_node("analysis_manager", analysis_manager_node)
workflow.add_node("output_manager", output_manager_node)
workflow.add_node("executive_review", executive_review_node)

# Add edges
workflow.set_entry_point("executive")
workflow.add_conditional_edges("executive", manager_router)
workflow.add_edge("executive_review", END)

app = workflow.compile()
```

## Communication Protocols

### Top-Down Communication

```mermaid
sequenceDiagram
    participant E as Executive
    participant M as Manager
    participant W as Worker

    E->>M: Directive
    Note over E,M: Strategic goals<br/>Resource allocation
    M->>W: Task Assignment
    Note over M,W: Specific tasks<br/>Context & deadlines
```

### Bottom-Up Communication

```mermaid
sequenceDiagram
    participant W as Worker
    participant M as Manager
    participant E as Executive

    W->>M: Progress Report
    Note over W,M: Status updates<br/>Completion notice
    W->>M: Escalation
    Note over W,M: Blockers<br/>Issues
    M->>E: Summary Report
    Note over M,E: Aggregated status<br/>Strategic issues
```

## Benefits & Trade-offs

```mermaid
quadrantChart
    title Hierarchical Pattern Trade-offs
    x-axis Low Complexity --> High Complexity
    y-axis Low Benefit --> High Benefit
    quadrant-1 Sweet Spot
    quadrant-2 Overkill
    quadrant-3 Simple Tasks
    quadrant-4 Technical Debt

    Scalability: [0.7, 0.9]
    Specialization: [0.5, 0.85]
    Accountability: [0.4, 0.8]
    Coordination: [0.8, 0.6]
    Latency: [0.6, 0.4]
```

| Benefit | Description |
|---------|-------------|
| **Scalability** | Easy to add more workers/managers |
| **Specialization** | Each level focuses on appropriate scope |
| **Clear Accountability** | Defined responsibilities |
| **Parallel Execution** | Departments work independently |

## Use Cases

### Enterprise Document Generation

```mermaid
flowchart TB
    E["👔 Executive<br/>Define requirements"]

    subgraph Research["📚 Research Department"]
        RM["Research Manager"]
        WS["Web Searcher"]
        DA["Doc Analyzer"]
    end

    subgraph Analysis["📊 Analysis Department"]
        AM["Analysis Manager"]
        DE["Data Extractor"]
        IG["Insight Generator"]
    end

    subgraph Output["📝 Output Department"]
        OM["Output Manager"]
        WR["Writer"]
        ED["Editor"]
    end

    E --> RM & AM & OM
    RM --> WS & DA
    AM --> DE & IG
    OM --> WR & ED

    style E fill:#c0392b,stroke:#fff,color:#fff
    style RM fill:#e74c3c,stroke:#fff,color:#fff
    style AM fill:#e74c3c,stroke:#fff,color:#fff
    style OM fill:#e74c3c,stroke:#fff,color:#fff
```

### Software Development

```mermaid
flowchart TB
    TL["👔 Tech Lead<br/>Define features"]

    subgraph Design["🎨 Design Team"]
        DM["Design Manager"]
        AR["Architect"]
        UX["UX Designer"]
    end

    subgraph Dev["💻 Development Team"]
        DevM["Dev Manager"]
        FE["Frontend Dev"]
        BE["Backend Dev"]
    end

    subgraph QA["🧪 QA Team"]
        QAM["QA Manager"]
        TE["Tester"]
        RE["Reviewer"]
    end

    TL --> DM & DevM & QAM
    DM --> AR & UX
    DevM --> FE & BE
    QAM --> TE & RE

    style TL fill:#c0392b,stroke:#fff,color:#fff
```
