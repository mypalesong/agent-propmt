---
sidebar_position: 3
---

# Hierarchical Pattern

다층 구조로 에이전트들을 조직화하는 패턴입니다.

## Pattern Overview

```
                    ┌─────────────────┐
                    │   Executive     │
                    │     Agent       │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   Manager A   │ │  Manager B  │ │  Manager C  │
    │  (Research)   │ │ (Analysis)  │ │  (Output)   │
    └───────┬───────┘ └──────┬──────┘ └──────┬──────┘
            │                │                │
      ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
      │           │    │           │    │           │
   ┌──▼──┐    ┌──▼──┐ ┌▼─┐    ┌──▼──┐ ┌▼─┐    ┌──▼──┐
   │W1-1 │    │W1-2 │ │W2│    │W2-2 │ │W3│    │W3-2 │
   └─────┘    └─────┘ └──┘    └─────┘ └──┘    └─────┘
```

## When to Use

- 대규모 복잡한 프로젝트
- 전문 영역별 분리가 필요할 때
- 명확한 책임 분리가 필요할 때
- 확장 가능한 팀 구조가 필요할 때

## Level Definitions

### Executive Level

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

## Communication Protocol

When delegating to managers:
```json
{
  "directive": "Clear description of what's needed",
  "priority": "high|medium|low",
  "deadline": "timeframe",
  "constraints": ["Any limitations"],
  "success_criteria": ["How to measure success"]
}
```

When escalation is received:
1. Assess the issue
2. Provide guidance
3. If needed, involve other managers
4. Document decision rationale

## Decision Framework

For each decision:
1. Does this align with overall objective?
2. What are the trade-offs?
3. Which departments are affected?
4. What resources are required?
5. What are the risks?
"""
```

### Manager Level

```python
MANAGER_PROMPT_TEMPLATE = """
# Identity

You are the {department} Manager, responsible for your team's
performance and deliverables.

## Reporting Structure
- Reports to: Executive Agent
- Direct Reports: {worker_list}

## Authority
- Assign tasks to workers
- Make tactical decisions within scope
- Escalate strategic issues to Executive
- Approve worker-level outputs

## Responsibilities

### Task Management
- Receive directives from Executive
- Break down into worker tasks
- Assign and track progress
- Aggregate worker outputs

### Team Coordination
- Ensure workers have needed context
- Facilitate inter-worker communication
- Resolve worker-level conflicts
- Provide feedback and coaching

### Quality Control
- Review worker outputs
- Request revisions when needed
- Ensure meets department standards
- Report progress to Executive

## Escalation Criteria

Escalate to Executive when:
- Issue affects other departments
- Resource requirements change significantly
- Timeline cannot be met
- Strategic decision needed

## Task Assignment Format

```json
{{
  "worker": "worker_name",
  "task": "task description",
  "context": "relevant background",
  "expected_output": "what success looks like",
  "deadline": "relative timeframe"
}}
```
"""

# Specific Manager Instances
RESEARCH_MANAGER_PROMPT = MANAGER_PROMPT_TEMPLATE.format(
    department="Research",
    worker_list="WebSearcher, DocumentAnalyzer, FactChecker"
)

ANALYSIS_MANAGER_PROMPT = MANAGER_PROMPT_TEMPLATE.format(
    department="Analysis",
    worker_list="DataProcessor, PatternFinder, InsightGenerator"
)

OUTPUT_MANAGER_PROMPT = MANAGER_PROMPT_TEMPLATE.format(
    department="Output",
    worker_list="ContentWriter, Editor, Formatter"
)
```

### Worker Level

```python
WORKER_PROMPT_TEMPLATE = """
# Identity

You are {worker_name}, a specialized worker in the {department} team.

## Reporting Structure
- Reports to: {manager_name}

## Specialization
{specialization}

## Responsibilities
- Execute assigned tasks
- Report progress to manager
- Request clarification when needed
- Flag blockers immediately

## Task Reception

When receiving a task:
1. Acknowledge receipt
2. Clarify any ambiguities
3. Estimate completion time
4. Execute the task
5. Submit output for review

## Output Format

```json
{{
  "status": "complete|blocked|in_progress",
  "output": "task result",
  "notes": "any observations or issues",
  "time_spent": "duration"
}}
```

## Escalation

Escalate to manager when:
- Task is unclear after clarification
- Required resources unavailable
- Unexpected complexity discovered
- Output quality concerns
"""
```

## Implementation

### LangGraph Hierarchical Implementation

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

def research_manager_node(state: HierarchicalState) -> HierarchicalState:
    """Research manager coordinates research workers"""
    tasks = get_manager_tasks(state["executive_plan"], "research")

    for task in tasks:
        worker = assign_worker(task)
        output = workers[worker].invoke(task)
        state["worker_outputs"][worker] = output

    return state

def executive_review_node(state: HierarchicalState) -> HierarchicalState:
    """Executive reviews and integrates"""
    all_outputs = state["worker_outputs"]

    final = executive_llm.invoke(
        EXECUTIVE_PROMPT +
        f"\n\nReview and integrate:\n{all_outputs}"
    )

    return {"final_output": final}

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
workflow.add_edge("research_manager", manager_router)
workflow.add_edge("analysis_manager", manager_router)
workflow.add_edge("output_manager", manager_router)
workflow.add_edge("executive_review", END)

app = workflow.compile()
```

## Communication Protocols

### Top-Down Communication

```python
class Directive:
    """Communication from higher to lower level"""
    def __init__(
        self,
        sender: str,
        receiver: str,
        content: dict
    ):
        self.sender = sender
        self.receiver = receiver
        self.content = content
        self.timestamp = datetime.now()

    def to_context(self) -> str:
        return f"""
## Directive from {self.sender}
**Time**: {self.timestamp}
**To**: {self.receiver}
**Content**:
{json.dumps(self.content, indent=2)}
"""
```

### Bottom-Up Communication

```python
class Report:
    """Communication from lower to higher level"""
    def __init__(
        self,
        sender: str,
        receiver: str,
        report_type: str,
        content: dict
    ):
        self.sender = sender
        self.receiver = receiver
        self.report_type = report_type  # progress|completion|escalation
        self.content = content
        self.timestamp = datetime.now()

class Escalation(Report):
    """Escalation to higher level"""
    def __init__(
        self,
        sender: str,
        receiver: str,
        issue: str,
        impact: str,
        recommendation: str
    ):
        super().__init__(
            sender=sender,
            receiver=receiver,
            report_type="escalation",
            content={
                "issue": issue,
                "impact": impact,
                "recommendation": recommendation
            }
        )
```

## Benefits & Trade-offs

### Benefits

| Benefit | Description |
|---------|-------------|
| Scalability | Easy to add more workers/managers |
| Specialization | Each level focuses on appropriate scope |
| Clear Accountability | Defined responsibilities |
| Parallel Execution | Departments work independently |

### Trade-offs

| Trade-off | Mitigation |
|-----------|------------|
| Latency | Optimize communication protocols |
| Coordination Overhead | Clear escalation paths |
| Information Loss | Standardized reporting formats |
| Complexity | Start simple, add layers as needed |

## Use Cases

### Enterprise Document Generation

```
Executive → Define document requirements
├── Research Manager → Gather source material
│   ├── WebSearcher → Find online sources
│   └── DocumentAnalyzer → Process existing docs
├── Analysis Manager → Process information
│   ├── DataExtractor → Extract key data
│   └── InsightGenerator → Create insights
└── Output Manager → Create final document
    ├── Writer → Draft content
    └── Editor → Polish and format
```

### Software Development

```
Executive (Tech Lead) → Define feature requirements
├── Design Manager → Create technical design
│   ├── Architect → System design
│   └── UX Designer → User experience
├── Development Manager → Implement features
│   ├── Frontend Dev → UI components
│   └── Backend Dev → API endpoints
└── QA Manager → Ensure quality
    ├── Tester → Write and run tests
    └── Reviewer → Code review
```
