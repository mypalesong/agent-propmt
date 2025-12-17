---
sidebar_position: 5
---

# Swarm Pattern

다수의 경량 에이전트가 협력하는 창발적 패턴입니다.

## Pattern Overview

```
        ┌─────────────────────────────────────────┐
        │              Swarm Network              │
        │                                         │
        │    ○───○     ○───○     ○───○          │
        │     \ /       \ /       \ /            │
        │      ○────────○────────○               │
        │     / \       / \       / \            │
        │    ○───○     ○───○     ○───○          │
        │                                         │
        │    ○ = Lightweight Agent               │
        │    ─ = Handoff Connection              │
        │                                         │
        └─────────────────────────────────────────┘
```

## What is Swarm?

OpenAI Swarm에서 영감을 받은 패턴으로, 경량 에이전트들이 핸드오프(handoff)를 통해 협력합니다.

### Key Concepts

| Concept | Description |
|---------|-------------|
| Agent | 특정 작업을 수행하는 경량 단위 |
| Handoff | 다른 에이전트로 제어권 이전 |
| Context Variables | 에이전트 간 공유 상태 |
| Routines | 재사용 가능한 작업 패턴 |

## When to Use

- 유연한 대화 흐름이 필요할 때
- 동적 에이전트 전환이 필요할 때
- 가벼운 오케스트레이션이 필요할 때
- 확장 가능한 에이전트 네트워크 구축 시

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

Handoff format:
```json
{{
  "handoff_to": "agent_name",
  "reason": "Why this agent is better suited",
  "context": {{
    "completed": "What you've done",
    "pending": "What still needs to be done",
    "data": "Any relevant data"
  }}
}}
```

## Context Variables

You have access to these shared variables:
[context_variables placeholder]

You can update context:
```json
{{
  "update_context": {{
    "key": "value"
  }}
}}
```
"""
```

## Swarm Examples

### Customer Service Swarm

```python
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

## Handoff Options
- TriageAgent: For non-billing issues
- RefundAgent: For refund processing
- TechnicalAgent: For payment system errors

## Tools Available
- lookup_invoice(customer_id)
- check_payment_status(invoice_id)
- update_payment_method(customer_id, method)

## Handle Yourself When
- Invoice questions
- Payment status checks
- Subscription changes
- Payment method updates

## Handoff When
- Customer wants refund → RefundAgent
- Payment system technical error → TechnicalAgent
- Unrelated question → TriageAgent
"""

TECHNICAL_AGENT = """
# Identity
You are TechnicalAgent, handling technical issues.

## Your Specialty
- Product troubleshooting
- Bug reports
- Technical guidance
- System status

## Handoff Options
- TriageAgent: For non-technical issues
- BillingAgent: For payment-related issues
- SalesAgent: For feature requests/upgrades

## Tools Available
- check_system_status()
- lookup_error_code(code)
- create_support_ticket(details)
- get_documentation(topic)

## Handle Yourself When
- Technical troubleshooting
- Error resolution
- Product usage questions
- Bug reports

## Handoff When
- Customer has billing issue → BillingAgent
- Customer wants to upgrade → SalesAgent
- Issue unrelated to tech → TriageAgent
"""
```

### Research Swarm

```python
SEARCH_AGENT = """
# Identity
You are SearchAgent, finding information.

## Your Specialty
- Web search
- Source discovery
- Initial information gathering

## Handoff Options
- AnalysisAgent: When raw data needs analysis
- WriterAgent: When findings need formatting
- FactCheckAgent: When claims need verification

## Handle Yourself When
- Finding sources
- Gathering raw information
- Discovering relevant content

## Handoff When
- Data needs deeper analysis → AnalysisAgent
- Need to verify specific claims → FactCheckAgent
- Ready to write final output → WriterAgent
"""

ANALYSIS_AGENT = """
# Identity
You are AnalysisAgent, processing information.

## Your Specialty
- Data analysis
- Pattern recognition
- Insight extraction

## Handoff Options
- SearchAgent: When more data is needed
- FactCheckAgent: When findings need verification
- WriterAgent: When analysis is complete

## Handle Yourself When
- Analyzing data
- Finding patterns
- Drawing conclusions

## Handoff When
- Need more source data → SearchAgent
- Conclusions need verification → FactCheckAgent
- Analysis complete → WriterAgent
"""
```

## Implementation

### OpenAI Swarm Style

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
                else:
                    # Function result
                    history.append({
                        "role": "function",
                        "name": message.function_call.name,
                        "content": str(result)
                    })
                    continue

            # No function call, conversation complete
            break

        return Response(
            agent=current_agent,
            messages=history,
            context_variables=context_variables
        )

    def _build_prompt(self, agent: Agent, context: dict) -> str:
        handoff_info = "\n".join([
            f"- {h.name}: {h.instructions[:100]}..."
            for h in agent.handoffs
        ])

        return f"""
{agent.instructions}

## Available Handoffs
{handoff_info}

## Context Variables
{json.dumps(context, indent=2)}

To handoff, call the transfer_to_[agent_name] function.
"""

    def _get_functions(self, agent: Agent) -> List[dict]:
        functions = []

        # Add agent's functions
        for func in agent.functions:
            functions.append(function_to_schema(func))

        # Add handoff functions
        for handoff_agent in agent.handoffs:
            functions.append({
                "name": f"transfer_to_{handoff_agent.name.lower()}",
                "description": f"Transfer to {handoff_agent.name}",
                "parameters": {"type": "object", "properties": {}}
            })

        return functions

    def _handle_function(
        self,
        agent: Agent,
        function_call,
        context: dict
    ) -> Union[Agent, str]:
        name = function_call.name

        # Check for handoff
        if name.startswith("transfer_to_"):
            target_name = name.replace("transfer_to_", "")
            for handoff_agent in agent.handoffs:
                if handoff_agent.name.lower() == target_name:
                    return handoff_agent

        # Execute regular function
        for func in agent.functions:
            if func.__name__ == name:
                args = json.loads(function_call.arguments)
                return func(**args, context=context)

        return f"Unknown function: {name}"
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
print(f"Messages: {len(result.messages)}")
```

## Context Variables

```python
# Shared state across agents
context = {
    "customer_id": "12345",
    "session_start": "2024-01-15T10:00:00Z",
    "previous_agents": ["Triage"],
    "customer_info": {
        "name": "John Doe",
        "tier": "premium",
        "history": ["support_ticket_123"]
    },
    "current_issue": {
        "type": "billing",
        "severity": "medium"
    }
}

# Agents can read and update
def update_context(context: dict, updates: dict) -> dict:
    context.update(updates)
    return context
```

## Best Practices

### Agent Design

- Keep agents focused and lightweight
- Clear handoff criteria
- Minimal state in each agent
- Well-defined interfaces

### Handoff Design

- Explicit handoff conditions
- Context preservation
- Graceful degradation
- Circular handoff prevention

### Monitoring

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
