---
sidebar_position: 2
---

# Supervisor Pattern

감독자가 작업자 에이전트들을 관리하고 품질을 보장하는 패턴입니다.

## Pattern Overview

```
              ┌────────────────────────┐
              │      Supervisor        │
              │  (Quality Control)     │
              └───────────┬────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
    ┌────────────┐ ┌────────────┐ ┌────────────┐
    │  Worker 1  │ │  Worker 2  │ │  Worker 3  │
    │            │ │            │ │            │
    │   Output   │ │   Output   │ │   Output   │
    └─────┬──────┘ └──────┬─────┘ └─────┬──────┘
          │               │             │
          └───────────────┼─────────────┘
                          │
              ┌───────────▼───────────┐
              │      Supervisor       │
              │    (Review & Merge)   │
              └───────────────────────┘
```

## When to Use

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

## Revision Request Format

```json
{
  "worker": "worker_name",
  "scores": {
    "accuracy": 2,
    "completeness": 4,
    "quality": 3
  },
  "feedback": {
    "issues": ["List of specific issues"],
    "suggestions": ["How to improve"],
    "must_fix": ["Required changes"]
  },
  "action": "revise"
}
```

## Approval Format

```json
{
  "worker": "worker_name",
  "scores": {
    "accuracy": 5,
    "completeness": 4,
    "quality": 4
  },
  "feedback": {
    "strengths": ["What was done well"],
    "suggestions": ["Optional improvements"]
  },
  "action": "approve"
}
```

## Final Integration

After all workers are approved:
1. Combine outputs coherently
2. Resolve any conflicts
3. Ensure consistent formatting
4. Add executive summary
"""
```

## Implementation

### LangGraph Implementation

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

def worker_node(state: SupervisorState, worker_type: str) -> SupervisorState:
    """Execute worker agent"""
    task = state["task"]
    previous_feedback = state["reviews"].get(worker_type, {}).get("feedback")

    worker_prompt = get_worker_prompt(worker_type)

    if previous_feedback:
        worker_prompt += f"\n\nPrevious feedback to address:\n{previous_feedback}"

    output = workers[worker_type].invoke(task)
    state["worker_outputs"][worker_type] = output

    return state

def finalize_node(state: SupervisorState) -> SupervisorState:
    """Integrate all approved outputs"""
    outputs = state["worker_outputs"]

    final = llm.invoke(
        SUPERVISOR_PROMPT +
        f"\n\nIntegrate these approved outputs:\n{outputs}\n\nFinal output:"
    )

    return {"final_output": final}

# Build workflow
workflow = StateGraph(SupervisorState)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("researcher", lambda s: worker_node(s, "researcher"))
workflow.add_node("analyst", lambda s: worker_node(s, "analyst"))
workflow.add_node("writer", lambda s: worker_node(s, "writer"))
workflow.add_node("finalize", finalize_node)

workflow.set_entry_point("supervisor")
workflow.add_conditional_edges("supervisor", supervisor_route)
```

### AutoGen Implementation

```python
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

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
    llm_config=llm_config,
    system_message="""
    Manage the conversation flow:
    1. Supervisor assigns tasks to workers
    2. Workers complete and submit
    3. Supervisor reviews and provides feedback
    4. Repeat until all approved
    5. Supervisor integrates final output
    """
)

# Execute
result = supervisor.initiate_chat(
    manager,
    message="Complete this task: Research AI trends and create a report"
)
```

## Quality Control Strategies

### Rubric-Based Evaluation

```python
QUALITY_RUBRIC = """
## Evaluation Rubric

### Research Quality
| Score | Criteria |
|-------|----------|
| 5 | Multiple credible sources, comprehensive coverage |
| 4 | Good sources, covers main points |
| 3 | Adequate sources, basic coverage |
| 2 | Limited sources, gaps in coverage |
| 1 | Unreliable sources, poor coverage |

### Analysis Depth
| Score | Criteria |
|-------|----------|
| 5 | Deep insights, novel connections |
| 4 | Meaningful analysis, good insights |
| 3 | Basic analysis, expected insights |
| 2 | Surface-level analysis |
| 1 | No meaningful analysis |

### Writing Quality
| Score | Criteria |
|-------|----------|
| 5 | Exceptional clarity, perfect structure |
| 4 | Clear and well-organized |
| 3 | Readable, adequate structure |
| 2 | Unclear in places, weak structure |
| 1 | Confusing, poor structure |
"""
```

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

    def check_structure(self, output: str) -> dict:
        headings = re.findall(r'^#+\s+.+$', output, re.MULTILINE)
        return {
            "check": "structure",
            "pass": len(headings) >= 3,
            "value": len(headings),
            "message": f"Headings found: {len(headings)}"
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

    def record_iteration(self, worker: str, review: dict):
        self.history.append({
            "worker": worker,
            "review": review,
            "timestamp": datetime.now()
        })

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

```python
CODE_REVIEW_SUPERVISOR = """
You supervise a team of code reviewers.

## Workers
- SecurityReviewer: Checks for vulnerabilities
- PerformanceReviewer: Checks for performance issues
- StyleReviewer: Checks code style and conventions

## Review Process
1. Assign PR to all reviewers
2. Collect their feedback
3. Evaluate severity of issues
4. Decide: Approve, Request Changes, or Need Discussion
5. Compile consolidated review

## Severity Levels
- CRITICAL: Block merge, must fix
- HIGH: Should fix before merge
- MEDIUM: Consider fixing
- LOW: Optional improvement
"""
```

### Document Review Supervisor

```python
DOCUMENT_REVIEW_SUPERVISOR = """
You supervise document creation and review.

## Workers
- ContentWriter: Creates initial draft
- FactChecker: Verifies facts and claims
- Editor: Improves clarity and style

## Review Process
1. Writer creates draft
2. FactChecker verifies claims
3. Editor improves prose
4. You review for consistency
5. Final approval or revision cycle
"""
```
