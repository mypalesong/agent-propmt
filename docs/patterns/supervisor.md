---
sidebar_position: 2
---

# Supervisor Pattern

감독자가 작업자 에이전트들을 관리하고 품질을 보장하는 패턴입니다.

![Supervisor Pattern](https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop&q=80)

## Pattern Overview

```mermaid
flowchart TB
    subgraph Phase1["📋 Distribution Phase"]
        S1["🎯 Supervisor"]
        W1["👷 Worker 1"]
        W2["👷 Worker 2"]
        W3["👷 Worker 3"]
    end

    subgraph Phase2["✅ Review Phase"]
        S2["🎯 Supervisor<br/>(Review & Merge)"]
    end

    S1 --> W1 & W2 & W3
    W1 & W2 & W3 --> |Outputs| S2

    style S1 fill:#e74c3c,stroke:#fff,color:#fff
    style S2 fill:#e74c3c,stroke:#fff,color:#fff
    style W1 fill:#3498db,stroke:#fff,color:#fff
    style W2 fill:#3498db,stroke:#fff,color:#fff
    style W3 fill:#3498db,stroke:#fff,color:#fff
```

## When to Use

```mermaid
mindmap
  root((Supervisor<br/>Pattern))
    Quality Control
      Output review
      Standards enforcement
      Consistency check
    Multiple Workers
      Parallel execution
      Independent tasks
      Result validation
    Iterative Improvement
      Feedback loops
      Revision cycles
      Continuous refinement
```

- 출력 품질 보장이 중요할 때
- 복수의 독립적인 작업을 수행할 때
- 결과 검증이 필요할 때
- 반복적인 개선이 필요할 때

## Supervisor Prompt Template

```python
SUPERVISOR_PROMPT = """
# Identity

You are a Supervisor Agent responsible for managing a team of
worker agents and ensuring high-quality outputs.

## Your Role

### Task Distribution
- Assign appropriate tasks to workers
- Balance workload
- Prioritize based on urgency and importance

### Quality Control
- Review all worker outputs
- Verify accuracy and completeness
- Ensure consistency across outputs

### Feedback & Improvement
- Provide constructive feedback
- Request revisions when needed
- Track improvement over time

## Worker Team

### Worker-Researcher
- Skills: Information gathering, source verification
- Quality metrics: Accuracy, source credibility, completeness

### Worker-Analyst
- Skills: Data analysis, insight generation
- Quality metrics: Depth of analysis, actionable insights

### Worker-Writer
- Skills: Content creation, summarization
- Quality metrics: Clarity, structure, engagement

## Review Framework

For each worker output, evaluate:

### Accuracy (1-5)
- 5: Completely accurate, verified facts
- 3: Mostly accurate, minor issues
- 1: Significant inaccuracies

### Completeness (1-5)
- 5: Fully addresses requirements
- 3: Partially complete
- 1: Missing major components

### Quality (1-5)
- 5: Exceptional quality
- 3: Acceptable quality
- 1: Below standards

### Minimum Threshold
- All scores must be ≥ 3 to pass
- If any score < 3, request revision
"""
```

## Review Workflow

```mermaid
sequenceDiagram
    participant S as Supervisor
    participant W as Worker
    participant Q as Quality Check

    S->>W: Assign Task
    W->>W: Execute Task
    W-->>S: Submit Output

    S->>Q: Evaluate Output
    Q-->>S: Scores & Feedback

    alt All Scores >= 3
        S->>S: ✅ Approve
    else Any Score < 3
        S->>W: Request Revision
        W->>W: Revise
        W-->>S: Resubmit
    end

    S->>S: Integrate Results
```

## Implementation

### LangGraph Implementation

```mermaid
stateDiagram-v2
    [*] --> Supervisor
    Supervisor --> Researcher : assign
    Supervisor --> Analyst : assign
    Supervisor --> Writer : assign

    Researcher --> Review
    Analyst --> Review
    Writer --> Review

    Review --> Researcher : revise needed
    Review --> Analyst : revise needed
    Review --> Writer : revise needed

    Review --> Finalize : all approved
    Finalize --> [*]
```

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class SupervisorState(TypedDict):
    task: str
    worker_outputs: dict
    reviews: dict
    approved: list
    final_output: str
    iteration: int

def supervisor_route(state: SupervisorState) -> str:
    """Determine next action"""
    if len(state["approved"]) == 3:  # All workers approved
        return "finalize"

    pending = [w for w in ["researcher", "analyst", "writer"]
               if w not in state["approved"]]

    if pending:
        return pending[0]

    return "finalize"

def supervisor_review(state: SupervisorState, worker: str) -> SupervisorState:
    """Review worker output"""
    output = state["worker_outputs"].get(worker)

    if not output:
        return state  # Worker hasn't submitted yet

    # Review with LLM
    review = llm.invoke(
        SUPERVISOR_PROMPT +
        f"\n\nReview this {worker} output:\n{output}\n\nProvide review:"
    )

    review_data = parse_json(review)
    state["reviews"][worker] = review_data

    if review_data["action"] == "approve":
        state["approved"].append(worker)
    else:
        state["iteration"] += 1
        if state["iteration"] > 3:
            # Force approval after 3 iterations
            state["approved"].append(worker)

    return state
```

### AutoGen Implementation

```python
from autogen import AssistantAgent, GroupChat, GroupChatManager

# Supervisor Agent
supervisor = AssistantAgent(
    name="Supervisor",
    system_message=SUPERVISOR_PROMPT,
    llm_config=llm_config
)

# Worker Agents
researcher = AssistantAgent(
    name="Researcher",
    system_message=RESEARCHER_PROMPT,
    llm_config=llm_config
)

analyst = AssistantAgent(
    name="Analyst",
    system_message=ANALYST_PROMPT,
    llm_config=llm_config
)

writer = AssistantAgent(
    name="Writer",
    system_message=WRITER_PROMPT,
    llm_config=llm_config
)

# Group Chat with Supervisor as Manager
group_chat = GroupChat(
    agents=[supervisor, researcher, analyst, writer],
    messages=[],
    max_round=20,
    speaker_selection_method="auto"
)

manager = GroupChatManager(
    groupchat=group_chat,
    llm_config=llm_config
)
```

## Quality Control Strategies

### Rubric-Based Evaluation

```mermaid
flowchart LR
    subgraph Rubric["📊 Quality Rubric"]
        R["Research<br/>Quality"]
        A["Analysis<br/>Depth"]
        W["Writing<br/>Quality"]
    end

    subgraph Scores["Score Range"]
        S5["⭐⭐⭐⭐⭐ Exceptional"]
        S4["⭐⭐⭐⭐ Good"]
        S3["⭐⭐⭐ Acceptable"]
        S2["⭐⭐ Needs Work"]
        S1["⭐ Poor"]
    end

    R & A & W --> Scores
```

| Score | Research | Analysis | Writing |
|-------|----------|----------|---------|
| **5** | Multiple credible sources | Deep insights, novel connections | Exceptional clarity |
| **4** | Good sources, main points | Meaningful analysis | Clear and organized |
| **3** | Adequate sources | Basic analysis | Readable |
| **2** | Limited sources | Surface-level | Unclear in places |
| **1** | Unreliable sources | No meaningful analysis | Confusing |

### Automated Checks

```python
class QualityChecker:
    def __init__(self):
        self.checks = [
            self.check_length,
            self.check_sources,
            self.check_structure,
            self.check_factual
        ]

    def check_length(self, output: str) -> dict:
        words = len(output.split())
        return {
            "check": "length",
            "pass": 100 <= words <= 2000,
            "value": words,
            "message": f"Word count: {words}"
        }

    def check_sources(self, output: str) -> dict:
        urls = re.findall(r'https?://\S+', output)
        return {
            "check": "sources",
            "pass": len(urls) >= 2,
            "value": len(urls),
            "message": f"Sources cited: {len(urls)}"
        }

    def run_all(self, output: str) -> dict:
        results = [check(output) for check in self.checks]
        passed = all(r["pass"] for r in results)
        return {
            "passed": passed,
            "checks": results
        }
```

## Iteration Management

```mermaid
flowchart TB
    Submit["📤 Submit Output"] --> Review["🔍 Review"]
    Review --> Score{"Score >= 3?"}

    Score -->|Yes| Approve["✅ Approved"]
    Score -->|No| Check{"Iteration < Max?"}

    Check -->|Yes| Feedback["💬 Provide Feedback"]
    Feedback --> Revise["✏️ Revise"]
    Revise --> Submit

    Check -->|No| ForceApprove["⚠️ Force Approve"]

    style Approve fill:#27ae60,stroke:#fff,color:#fff
    style ForceApprove fill:#f39c12,stroke:#fff,color:#fff
```

```python
class IterationManager:
    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations
        self.history = []

    def should_continue(self, worker: str, review: dict) -> bool:
        worker_history = [h for h in self.history if h["worker"] == worker]

        if len(worker_history) >= self.max_iterations:
            return False

        if review["action"] == "approve":
            return False

        return True

    def get_improvement_trend(self, worker: str) -> str:
        history = [h for h in self.history if h["worker"] == worker]
        if len(history) < 2:
            return "insufficient_data"

        scores = [h["review"]["scores"]["overall"] for h in history]
        if scores[-1] > scores[0]:
            return "improving"
        elif scores[-1] < scores[0]:
            return "declining"
        return "stable"
```

## Use Cases

### Code Review Supervisor

```mermaid
flowchart TB
    PR["📝 Pull Request"] --> S["🎯 Code Review Supervisor"]

    S --> Security["🔒 Security Reviewer"]
    S --> Performance["⚡ Performance Reviewer"]
    S --> Style["✨ Style Reviewer"]

    Security & Performance & Style --> S

    S --> Decision{"Decision"}
    Decision -->|All Pass| Approve["✅ Approve"]
    Decision -->|Issues Found| Changes["🔄 Request Changes"]

    style S fill:#e74c3c,stroke:#fff,color:#fff
    style Approve fill:#27ae60,stroke:#fff,color:#fff
    style Changes fill:#f39c12,stroke:#fff,color:#fff
```

### Document Review Supervisor

```mermaid
flowchart LR
    Draft["📄 Draft"] --> Writer["✍️ Writer"]
    Writer --> Fact["🔍 Fact Checker"]
    Fact --> Editor["✏️ Editor"]
    Editor --> Supervisor["🎯 Supervisor"]
    Supervisor --> Final["📑 Final Document"]

    style Supervisor fill:#e74c3c,stroke:#fff,color:#fff
```
