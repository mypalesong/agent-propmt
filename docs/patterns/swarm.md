---
sidebar_position: 5
---

# Swarm Pattern

다수의 경량 에이전트가 협력하는 창발적 패턴입니다.

![Swarm Intelligence](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&q=80)

## Pattern Overview

```mermaid
flowchart TB
    subgraph Swarm["🐝 Swarm Network"]
        A1(("○")) --- A2(("○"))
        A2 --- A3(("○"))
        A3 --- A4(("○"))
        A4 --- A5(("○"))
        A5 --- A1
        A1 --- A3
        A2 --- A4
    end

    User["👤 User"] --> A1
    A5 --> Result["📄 Result"]

    style A1 fill:#3498db,stroke:#fff,color:#fff
    style A2 fill:#27ae60,stroke:#fff,color:#fff
    style A3 fill:#e74c3c,stroke:#fff,color:#fff
    style A4 fill:#9b59b6,stroke:#fff,color:#fff
    style A5 fill:#f39c12,stroke:#fff,color:#fff
```

## What is Swarm?

OpenAI Swarm에서 영감을 받은 패턴으로, 경량 에이전트들이 핸드오프(handoff)를 통해 협력합니다.

```mermaid
mindmap
  root((Swarm<br/>Pattern))
    Lightweight Agents
      Single responsibility
      Minimal state
      Fast execution
    Handoff Mechanism
      Dynamic routing
      Context passing
      Seamless transfer
    Emergent Behavior
      No central control
      Self-organizing
      Adaptive
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | 특정 작업을 수행하는 경량 단위 |
| **Handoff** | 다른 에이전트로 제어권 이전 |
| **Context Variables** | 에이전트 간 공유 상태 |
| **Routines** | 재사용 가능한 작업 패턴 |

## When to Use

- 유연한 대화 흐름이 필요할 때
- 동적 에이전트 전환이 필요할 때
- 가벼운 오케스트레이션이 필요할 때
- 확장 가능한 에이전트 네트워크 구축 시

## Customer Service Swarm Example

```mermaid
flowchart TB
    User["👤 Customer"] --> Triage["🎯 Triage Agent"]

    Triage --> Billing["💳 Billing Agent"]
    Triage --> Tech["🔧 Technical Agent"]
    Triage --> Sales["🛒 Sales Agent"]
    Triage --> Refund["↩️ Refund Agent"]

    Billing <--> Tech
    Billing <--> Refund
    Tech <--> Sales

    style Triage fill:#e74c3c,stroke:#fff,color:#fff
    style Billing fill:#3498db,stroke:#fff,color:#fff
    style Tech fill:#27ae60,stroke:#fff,color:#fff
    style Sales fill:#9b59b6,stroke:#fff,color:#fff
    style Refund fill:#f39c12,stroke:#fff,color:#fff
```

## Swarm Agent Prompt

```python
SWARM_AGENT_TEMPLATE = """
# Identity

You are {agent_name}, a specialized agent in the swarm.

## Your Specialty
{specialty_description}

## Available Handoffs

You can hand off to these agents when appropriate:
{handoff_options}

## When to Handle vs Handoff

### Handle Yourself When:
{handle_criteria}

### Handoff When:
{handoff_criteria}

## Handoff Protocol

When you need to handoff:

1. Complete your current subtask if possible
2. Summarize what you've done
3. Explain why handoff is needed
4. Provide context for receiving agent

## Context Variables

You have access to shared context variables.
You can read and update context as needed.
"""

TRIAGE_AGENT = """
# Identity
You are TriageAgent, the first point of contact.

## Your Role
- Understand customer intent
- Route to appropriate specialist
- Handle simple queries directly

## Handoff Options
- BillingAgent: Payment and invoice issues
- TechnicalAgent: Product technical problems
- SalesAgent: Purchases and upgrades
- RefundAgent: Return and refund requests

## Decision Rules
- Billing keywords → BillingAgent
- Technical/error keywords → TechnicalAgent
- Purchase/upgrade keywords → SalesAgent
- Refund/return keywords → RefundAgent
- Simple FAQ → Handle yourself
"""

BILLING_AGENT = """
# Identity
You are BillingAgent, handling payment issues.

## Your Specialty
- Invoice inquiries
- Payment processing
- Subscription management
- Payment method updates

## Tools Available
- lookup_invoice(customer_id)
- check_payment_status(invoice_id)
- update_payment_method(customer_id, method)

## Handoff Options
- TriageAgent: For non-billing issues
- RefundAgent: For refund processing
- TechnicalAgent: For payment system errors
"""
```

## Research Swarm Example

```mermaid
flowchart LR
    Search["🔍 Search Agent"] --> Analysis["📊 Analysis Agent"]
    Analysis --> FactCheck["✅ Fact Check Agent"]
    FactCheck --> Writer["✍️ Writer Agent"]

    Search <--> FactCheck
    Analysis <--> Writer

    style Search fill:#3498db,stroke:#fff,color:#fff
    style Analysis fill:#27ae60,stroke:#fff,color:#fff
    style FactCheck fill:#e74c3c,stroke:#fff,color:#fff
    style Writer fill:#9b59b6,stroke:#fff,color:#fff
```

## Implementation

### OpenAI Swarm Style

```mermaid
sequenceDiagram
    participant U as User
    participant T as Triage
    participant B as Billing
    participant R as Refund

    U->>T: "I want a refund"
    T->>T: Analyze intent
    T->>B: Handoff (billing context)
    B->>B: Check invoice
    B->>R: Handoff (refund needed)
    R->>R: Process refund
    R-->>U: Refund confirmed
```

```python
from dataclasses import dataclass
from typing import Callable, List, Optional, Union

@dataclass
class Agent:
    name: str
    instructions: str
    functions: List[Callable] = None
    handoffs: List['Agent'] = None

    def __post_init__(self):
        self.functions = self.functions or []
        self.handoffs = self.handoffs or []

@dataclass
class Response:
    agent: Agent
    messages: List[dict]
    context_variables: dict

class Swarm:
    def __init__(self, client):
        self.client = client

    def run(
        self,
        agent: Agent,
        messages: List[dict],
        context_variables: dict = None,
        max_turns: int = 10
    ) -> Response:
        context_variables = context_variables or {}
        current_agent = agent
        history = messages.copy()

        for _ in range(max_turns):
            # Build prompt with handoff info
            prompt = self._build_prompt(current_agent, context_variables)

            # Get response
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "system", "content": prompt}] + history,
                functions=self._get_functions(current_agent)
            )

            message = response.choices[0].message
            history.append(message.model_dump())

            # Check for handoff
            if message.function_call:
                result = self._handle_function(
                    current_agent,
                    message.function_call,
                    context_variables
                )

                if isinstance(result, Agent):
                    # Handoff to new agent
                    current_agent = result
                    continue

            # No function call, conversation complete
            break

        return Response(
            agent=current_agent,
            messages=history,
            context_variables=context_variables
        )
```

### Usage Example

```python
# Define agents
triage = Agent(
    name="Triage",
    instructions=TRIAGE_AGENT
)

billing = Agent(
    name="Billing",
    instructions=BILLING_AGENT,
    functions=[lookup_invoice, check_payment]
)

technical = Agent(
    name="Technical",
    instructions=TECHNICAL_AGENT,
    functions=[check_status, lookup_error]
)

# Set up handoffs
triage.handoffs = [billing, technical]
billing.handoffs = [triage, technical]
technical.handoffs = [triage, billing]

# Run swarm
swarm = Swarm(openai_client)
result = swarm.run(
    agent=triage,
    messages=[{
        "role": "user",
        "content": "I'm having trouble with my payment"
    }],
    context_variables={"customer_id": "12345"}
)

print(f"Final agent: {result.agent.name}")
```

## Context Variables

```mermaid
flowchart TB
    subgraph Context["📦 Shared Context"]
        CV["Context Variables"]
        CID["customer_id: 12345"]
        Session["session_start: ..."]
        History["previous_agents: [...]"]
        Info["customer_info: {...}"]
    end

    A1["Agent 1"] --> |read/write| Context
    A2["Agent 2"] --> |read/write| Context
    A3["Agent 3"] --> |read/write| Context

    style Context fill:#f39c12,stroke:#fff,color:#fff
```

## Best Practices

### Agent Design

```mermaid
flowchart LR
    subgraph Good["✅ Good Design"]
        G1["Focused"]
        G2["Clear handoffs"]
        G3["Minimal state"]
    end

    subgraph Bad["❌ Bad Design"]
        B1["Too broad"]
        B2["Unclear routing"]
        B3["Heavy state"]
    end
```

- Keep agents focused and lightweight
- Clear handoff criteria
- Minimal state in each agent
- Well-defined interfaces

### Monitoring

```mermaid
flowchart LR
    Agents["🤖 Swarm Agents"] --> Monitor["📊 Monitor"]
    Monitor --> Flows["Handoff Flows"]
    Monitor --> Usage["Agent Usage"]
    Monitor --> Metrics["Performance Metrics"]
```

```python
class SwarmMonitor:
    def __init__(self):
        self.handoffs = []
        self.agent_usage = defaultdict(int)

    def record_handoff(self, from_agent: str, to_agent: str, reason: str):
        self.handoffs.append({
            "from": from_agent,
            "to": to_agent,
            "reason": reason,
            "timestamp": datetime.now()
        })
        self.agent_usage[to_agent] += 1

    def get_flow_diagram(self) -> str:
        """Generate handoff flow visualization"""
        flows = defaultdict(int)
        for h in self.handoffs:
            key = f"{h['from']} → {h['to']}"
            flows[key] += 1

        diagram = "Handoff Flows:\n"
        for flow, count in sorted(flows.items(), key=lambda x: -x[1]):
            diagram += f"  {flow}: {count}x\n"
        return diagram
```

## Swarm vs Other Patterns

```mermaid
quadrantChart
    title Pattern Comparison
    x-axis Lightweight --> Heavyweight
    y-axis Rigid --> Flexible
    quadrant-1 Adaptive Systems
    quadrant-2 Enterprise
    quadrant-3 Simple Tasks
    quadrant-4 Structured Workflows

    Swarm: [0.2, 0.9]
    Orchestrator: [0.6, 0.5]
    Supervisor: [0.7, 0.4]
    Hierarchical: [0.9, 0.3]
    PeerToPeer: [0.4, 0.8]
```

| Pattern | Best For | Complexity |
|---------|----------|------------|
| **Swarm** | Dynamic routing, customer service | ⭐ Low |
| **Orchestrator** | Complex workflows | ⭐⭐ Medium |
| **Supervisor** | Quality-critical tasks | ⭐⭐ Medium |
| **Hierarchical** | Enterprise scale | ⭐⭐⭐ High |
| **Peer-to-Peer** | Expert discussions | ⭐⭐ Medium |
