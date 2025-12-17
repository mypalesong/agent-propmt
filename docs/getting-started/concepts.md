---
sidebar_position: 2
---

# Core Concepts

멀티 에이전트 시스템의 핵심 개념을 이해합니다.

![AI Concepts](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=400&fit=crop&q=80)

## Agent란?

Agent는 환경을 인식하고, 목표를 달성하기 위해 자율적으로 행동하는 AI 엔티티입니다.

```mermaid
flowchart TB
    subgraph Agent["🤖 Agent"]
        direction TB
        SP["📝 System Prompt<br/>(Role, Goal, Constraints)"]
        LLM["🧠 LLM<br/>(Reasoning Engine)"]
        Tools["🔧 Tools<br/>(Actions & Capabilities)"]
        Memory["💾 Memory<br/>(Context & History)"]
    end

    Input["📥 Input"] --> SP
    SP --> LLM
    LLM --> Tools
    Tools --> Memory
    Memory --> Output["📤 Output"]

    style Agent fill:#2c3e50,stroke:#fff
    style SP fill:#3498db,stroke:#fff,color:#fff
    style LLM fill:#e74c3c,stroke:#fff,color:#fff
    style Tools fill:#27ae60,stroke:#fff,color:#fff
    style Memory fill:#f39c12,stroke:#fff,color:#fff
```

### Agent Components

| 구성요소 | 설명 | 예시 |
|---------|------|------|
| **System Prompt** | 에이전트의 역할, 목표, 제약 정의 | "You are a code reviewer..." |
| **LLM** | 추론 엔진 | GPT-4, Claude, Gemini |
| **Tools** | 외부 시스템과 상호작용 | Web search, DB query |
| **Memory** | 컨텍스트 및 대화 기록 | Short-term, Long-term |

## Prompt의 역할

프롬프트는 에이전트의 "두뇌"를 구성합니다:

```mermaid
mindmap
  root((Agent<br/>Prompt))
    Role
      Identity
      Expertise
      Personality
    Goals
      Objectives
      Success Criteria
      Priorities
    Constraints
      Limitations
      Boundaries
      Safety Rules
    Instructions
      Process
      Guidelines
      Examples
```

```python
AGENT_PROMPT = """
# Role Definition
You are a [ROLE] specialized in [DOMAIN].

# Goals
Your primary objectives are:
1. [Goal 1]
2. [Goal 2]

# Constraints
You must:
- [Constraint 1]
- [Constraint 2]

# Available Tools
[tools]

# Output Format
[format_instructions]
"""
```

## Multi-Agent vs Single-Agent

### Single-Agent System

```mermaid
flowchart LR
    U["👤 User"] --> A["🤖 Agent"]
    A --> T["🔧 Tools"]
    T --> A
    A --> R["📄 Response"]
    R --> U

    style A fill:#3498db,stroke:#fff,color:#fff
```

**장점**: 간단함, 빠른 개발
**단점**: 복잡한 작업에 한계

### Multi-Agent System

```mermaid
flowchart TB
    U["👤 User"] --> O["🎯 Orchestrator"]

    subgraph Agents["Agent Team"]
        A1["🔍 Agent 1"]
        A2["📊 Agent 2"]
        A3["✍️ Agent 3"]
    end

    O --> A1 & A2 & A3
    A1 --> T1["🔧 Tools"]
    A2 --> T2["🔧 Tools"]
    A3 --> T3["🔧 Tools"]

    A1 & A2 & A3 --> R["📄 Response"]
    R --> U

    style O fill:#e74c3c,stroke:#fff,color:#fff
    style A1 fill:#3498db,stroke:#fff,color:#fff
    style A2 fill:#3498db,stroke:#fff,color:#fff
    style A3 fill:#3498db,stroke:#fff,color:#fff
```

**장점**: 전문화, 확장성, 병렬 처리
**단점**: 복잡성 증가, 조율 필요

## Key Concepts

### 1. Role Definition

```mermaid
flowchart LR
    subgraph Bad["❌ 불명확"]
        B["Developer"]
    end

    subgraph Good["✅ 명확"]
        G["Senior Python Developer<br/>with expertise in FastAPI"]
    end

    Bad -.-> |Improve| Good
```

에이전트에게 명확한 역할 부여:

```python
# Good: Specific role
role="Senior Python Developer with expertise in FastAPI"

# Bad: Vague role
role="Developer"
```

### 2. Goal Setting

측정 가능한 목표 설정:

```mermaid
flowchart TB
    subgraph Goals["🎯 Goal Types"]
        direction LR
        Specific["Specific<br/>구체적"]
        Measurable["Measurable<br/>측정 가능"]
        Achievable["Achievable<br/>달성 가능"]
    end

    Task["Task"] --> Goals
    Goals --> Action["Action"]
```

```python
# Good: Clear, measurable goal
goal="Review code for security vulnerabilities and suggest fixes"

# Bad: Vague goal
goal="Help with code"
```

### 3. Context Sharing

에이전트 간 효과적인 정보 공유:

```mermaid
sequenceDiagram
    participant R as Researcher
    participant A as Analyst
    participant W as Writer

    R->>A: Research Results
    Note over R,A: Context Transfer
    A->>W: Analysis + Research
    Note over A,W: Accumulated Context
    W->>W: Create Final Output
```

```python
# Task with context from previous task
writing_task = Task(
    description="Write article based on research",
    agent=writer,
    context=[research_task]  # 이전 태스크 결과 참조
)
```

### 4. Tool Binding

에이전트에게 필요한 도구 제공:

```mermaid
flowchart LR
    subgraph Agent["🤖 Research Agent"]
        A["Agent Core"]
    end

    subgraph Tools["🔧 Available Tools"]
        T1["🔍 Web Search"]
        T2["📄 Doc Reader"]
        T3["📊 Data Analyzer"]
    end

    A --> T1 & T2 & T3

    style Agent fill:#3498db,stroke:#fff,color:#fff
```

```python
from crewai_tools import SerperDevTool, WebsiteSearchTool

researcher = Agent(
    role="Researcher",
    tools=[
        SerperDevTool(),      # 웹 검색
        WebsiteSearchTool()   # 웹사이트 스크래핑
    ]
)
```

## Agent Communication Patterns

### Direct Communication

```mermaid
flowchart LR
    A["🤖 Agent A"] <--> B["🤖 Agent B"]
    style A fill:#3498db,stroke:#fff,color:#fff
    style B fill:#27ae60,stroke:#fff,color:#fff
```

에이전트가 직접 소통:

```python
# Agent A → Agent B
agent_b.receive_message(agent_a.send_message())
```

### Blackboard Pattern

```mermaid
flowchart TB
    subgraph Agents
        A["🤖 Agent A"]
        B["🤖 Agent B"]
        C["🤖 Agent C"]
    end

    BB["📋 Blackboard<br/>(Shared Memory)"]

    A <--> BB
    B <--> BB
    C <--> BB

    style BB fill:#f39c12,stroke:#fff,color:#fff
```

공유 메모리 사용:

```python
# All agents read/write to shared memory
blackboard.write("research_results", data)
other_agent.read("research_results")
```

### Message Queue

```mermaid
flowchart LR
    subgraph Producers
        P1["🤖 Producer 1"]
        P2["🤖 Producer 2"]
    end

    Q["📫 Queue"]

    subgraph Consumers
        C1["🤖 Consumer 1"]
        C2["🤖 Consumer 2"]
    end

    P1 & P2 --> Q
    Q --> C1 & C2

    style Q fill:#9b59b6,stroke:#fff,color:#fff
```

비동기 메시지 전달:

```python
# Producer-Consumer pattern
queue.put({"from": "agent_a", "data": results})
message = queue.get()
```

## State Management

### Stateless Agents

```mermaid
flowchart LR
    R1["Request 1"] --> A["🤖 Agent"]
    A --> O1["Output 1"]
    R2["Request 2"] --> A
    A --> O2["Output 2"]

    Note["No memory<br/>between calls"]

    style A fill:#3498db,stroke:#fff,color:#fff
```

각 호출이 독립적:

```python
# No memory between calls
response = agent.run("Analyze this data")
```

### Stateful Agents

```mermaid
flowchart TB
    R1["Request 1"] --> A["🤖 Agent"]
    A --> M["💾 Memory"]
    M --> A
    A --> O1["Output 1"]

    R2["Request 2"] --> A
    M --> A
    A --> O2["Output 2<br/>(with context)"]

    style A fill:#3498db,stroke:#fff,color:#fff
    style M fill:#f39c12,stroke:#fff,color:#fff
```

상태 유지:

```python
# Memory persists across calls
agent = Agent(
    role="Assistant",
    memory=True,  # Enable memory
    memory_config={
        "provider": "redis",
        "ttl": 3600
    }
)
```

## Error Handling

```mermaid
flowchart TB
    Start["🚀 Start"] --> Execute["Execute Task"]
    Execute --> Check{"Success?"}

    Check -->|Yes| Complete["✅ Complete"]
    Check -->|No| Retry{"Retry < Max?"}

    Retry -->|Yes| Execute
    Retry -->|No| Fallback["🔄 Fallback Agent"]
    Fallback --> Complete

    style Complete fill:#27ae60,stroke:#fff,color:#fff
    style Fallback fill:#e74c3c,stroke:#fff,color:#fff
```

### Retry Strategy

```python
agent = Agent(
    role="Researcher",
    max_iter=5,        # 최대 시도 횟수
    max_retry=3,       # 오류 시 재시도
    timeout=120        # 타임아웃 (초)
)
```

### Fallback Agent

```python
# 주 에이전트 실패 시 백업 에이전트 사용
try:
    result = primary_agent.run(task)
except AgentError:
    result = fallback_agent.run(task)
```

## Summary

```mermaid
mindmap
  root((Core<br/>Concepts))
    Agent
      Autonomous AI entity
      Prompt-driven
      Tool-enabled
    Prompt
      Defines behavior
      Role & Goals
      Constraints
    Tools
      External capabilities
      APIs & Services
      Data sources
    Memory
      Context management
      State persistence
      History tracking
    Orchestration
      Multi-agent coordination
      Task routing
      Result aggregation
```

| Concept | Description |
|---------|-------------|
| Agent | 자율적으로 작업을 수행하는 AI 엔티티 |
| Prompt | 에이전트의 역할과 행동을 정의 |
| Tools | 에이전트가 사용할 수 있는 기능 |
| Memory | 컨텍스트와 히스토리 관리 |
| Orchestration | 다중 에이전트 조율 |
