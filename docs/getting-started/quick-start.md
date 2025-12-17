---
sidebar_position: 1
---

# Quick Start

멀티 에이전트 프롬프트 설계를 빠르게 시작하는 가이드입니다.

![Getting Started](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&q=80)

## Prerequisites

```bash
# Python 3.10+
python --version

# pip or uv package manager
pip --version
```

## Installation

선호하는 프레임워크를 설치하세요:

```mermaid
flowchart LR
    subgraph Frameworks["🔧 Choose Your Framework"]
        LC["LangChain<br/>+ LangGraph"]
        AG["AutoGen"]
        CA["CrewAI"]
    end

    Start["🚀 Start"] --> Frameworks
    LC --> Build["Build Agents"]
    AG --> Build
    CA --> Build

    style LC fill:#3498db,stroke:#fff,color:#fff
    style AG fill:#27ae60,stroke:#fff,color:#fff
    style CA fill:#e74c3c,stroke:#fff,color:#fff
```

```bash
# LangChain + LangGraph
pip install langchain langgraph langchain-openai

# AutoGen
pip install autogen-agentchat autogen-ext

# CrewAI
pip install crewai crewai-tools
```

## Environment Setup

```bash
# .env 파일 생성
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"
```

## Your First Multi-Agent System

```mermaid
flowchart TB
    subgraph Setup["📋 Setup Process"]
        direction TB
        S1["1️⃣ Define Prompts"]
        S2["2️⃣ Create Agents"]
        S3["3️⃣ Define Tasks"]
        S4["4️⃣ Run Crew"]
    end

    S1 --> S2 --> S3 --> S4
    S4 --> Result["🎉 Result"]

    style S1 fill:#3498db,stroke:#fff,color:#fff
    style S2 fill:#27ae60,stroke:#fff,color:#fff
    style S3 fill:#f39c12,stroke:#fff,color:#fff
    style S4 fill:#e74c3c,stroke:#fff,color:#fff
```

### Step 1: Define Agent Prompts

각 에이전트의 역할을 명확히 정의합니다:

```python
# prompts.py

RESEARCHER_PROMPT = """
You are a Research Analyst specialized in gathering information.

## Your Role
- Search for relevant information on given topics
- Verify facts from multiple sources
- Summarize findings concisely

## Guidelines
- Always cite your sources
- Prioritize recent information
- Flag any conflicting information

## Output Format
Provide findings in structured markdown format.
"""

WRITER_PROMPT = """
You are a Content Writer who creates engaging articles.

## Your Role
- Transform research into readable content
- Maintain consistent tone and style
- Ensure accuracy of information

## Guidelines
- Use clear, simple language
- Break complex topics into digestible sections
- Include relevant examples

## Output Format
Deliver content in markdown with proper headings.
"""
```

### Step 2: Create Agents

```mermaid
flowchart LR
    subgraph Agents["🤖 Agent Team"]
        R["🔍 Researcher<br/>Research Analyst"]
        W["✍️ Writer<br/>Content Writer"]
    end

    R --> |findings| W
    W --> Output["📄 Final Content"]

    style R fill:#3498db,stroke:#fff,color:#fff
    style W fill:#27ae60,stroke:#fff,color:#fff
```

```python
# agents.py
from crewai import Agent

researcher = Agent(
    role="Research Analyst",
    goal="Find accurate and relevant information",
    backstory=RESEARCHER_PROMPT,
    verbose=True,
    allow_delegation=False
)

writer = Agent(
    role="Content Writer",
    goal="Create engaging and accurate content",
    backstory=WRITER_PROMPT,
    verbose=True,
    allow_delegation=False
)
```

### Step 3: Define Tasks

```python
# tasks.py
from crewai import Task

research_task = Task(
    description="""
    Research the topic: {topic}

    Find:
    - Key concepts and definitions
    - Recent developments (2024-2025)
    - Expert opinions and insights
    - Relevant statistics
    """,
    expected_output="Comprehensive research summary in markdown",
    agent=researcher
)

writing_task = Task(
    description="""
    Based on the research, write an article about: {topic}

    Requirements:
    - 800-1000 words
    - Include introduction and conclusion
    - Use subheadings for organization
    - Cite sources appropriately
    """,
    expected_output="Complete article in markdown format",
    agent=writer,
    context=[research_task]
)
```

### Step 4: Run the Crew

```mermaid
sequenceDiagram
    participant U as User
    participant C as Crew
    participant R as Researcher
    participant W as Writer

    U->>C: kickoff(topic)
    C->>R: research_task
    R->>R: 🔍 Searching...
    R-->>C: Research Results
    C->>W: writing_task + context
    W->>W: ✍️ Writing...
    W-->>C: Final Article
    C-->>U: 📄 Complete Result
```

```python
# main.py
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff(inputs={"topic": "Multi-Agent AI Systems"})
print(result)
```

## Expected Output

```
[Researcher] Starting research on Multi-Agent AI Systems...
[Researcher] Found 15 relevant sources...
[Researcher] Research complete. Summary ready.

[Writer] Received research data...
[Writer] Creating article structure...
[Writer] Writing content...
[Writer] Article complete.

=== Final Output ===
# Multi-Agent AI Systems: A Comprehensive Guide
...
```

## Framework Comparison

```mermaid
quadrantChart
    title Framework Comparison
    x-axis Low Complexity --> High Complexity
    y-axis Low Flexibility --> High Flexibility
    quadrant-1 Production Ready
    quadrant-2 Power Users
    quadrant-3 Quick Start
    quadrant-4 Enterprise

    CrewAI: [0.3, 0.6]
    LangGraph: [0.7, 0.9]
    AutoGen: [0.6, 0.7]
```

| Framework | Best For | Learning Curve |
|-----------|----------|----------------|
| **CrewAI** | 빠른 시작, 직관적 API | ⭐ Easy |
| **LangGraph** | 복잡한 워크플로우, 상태 관리 | ⭐⭐⭐ Advanced |
| **AutoGen** | 대화형 에이전트, 그룹 채팅 | ⭐⭐ Medium |

## Next Steps

```mermaid
graph LR
    A["✅ Quick Start<br/>Complete"] --> B["💡 Core Concepts"]
    B --> C["🏗️ Architecture"]
    C --> D["📝 Prompt Design"]

    click B "/docs/getting-started/concepts"
    click C "/docs/getting-started/architecture"
    click D "/docs/prompt-design/principles"

    style A fill:#27ae60,stroke:#fff,color:#fff
    style B fill:#3498db,stroke:#fff,color:#fff
    style C fill:#9b59b6,stroke:#fff,color:#fff
    style D fill:#e74c3c,stroke:#fff,color:#fff
```

- [Core Concepts](/docs/getting-started/concepts) - 핵심 개념 깊이 이해
- [Architecture Patterns](/docs/getting-started/architecture) - 아키텍처 패턴 학습
- [Prompt Design Principles](/docs/prompt-design/principles) - 프롬프트 설계 원칙

## Troubleshooting

### API Key Issues

```python
import os
from dotenv import load_dotenv

load_dotenv()  # .env 파일 로드
assert os.getenv("OPENAI_API_KEY"), "API key not found!"
```

### Agent Not Responding

```python
# Timeout 설정
agent = Agent(
    role="Research Analyst",
    goal="...",
    max_iter=10,  # 최대 반복 횟수
    max_rpm=10,   # 분당 최대 요청
)
```

### Common Errors

```mermaid
flowchart TB
    E1["❌ API Key Error"] --> S1["Check .env file"]
    E2["❌ Timeout Error"] --> S2["Increase max_iter"]
    E3["❌ Rate Limit"] --> S3["Add delays / Reduce max_rpm"]

    style E1 fill:#e74c3c,stroke:#fff,color:#fff
    style E2 fill:#e74c3c,stroke:#fff,color:#fff
    style E3 fill:#e74c3c,stroke:#fff,color:#fff
    style S1 fill:#27ae60,stroke:#fff,color:#fff
    style S2 fill:#27ae60,stroke:#fff,color:#fff
    style S3 fill:#27ae60,stroke:#fff,color:#fff
```
