---
sidebar_position: 3
---

# Customer Support Agent

![Customer Support Header](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=400&fit=crop&q=80)

고객 지원을 위한 멀티 에이전트 시스템입니다.

## System Overview

```mermaid
graph TB
    Customer[Customer] --> Triage[Triage Agent]

    Triage --> Sales[Sales Agent]
    Triage --> Support[Support Agent]
    Triage --> Billing[Billing Agent]
    Triage --> Escalation[Escalation Agent]

    Sales --> Resolution[Resolution]
    Support --> Resolution
    Billing --> Resolution
    Escalation --> Resolution

    Sales -.-> ST[Product Info<br/>Pricing<br/>Demos]
    Support -.-> SuT[Troubleshoot<br/>Bug Reports<br/>How-To]
    Billing -.-> BT[Payments<br/>Refunds<br/>Subscriptions]
    Escalation -.-> ET[VIP Support<br/>Complex Issues<br/>Complaints]

    style Customer fill:#e3f2fd
    style Triage fill:#fff4e1
    style Sales fill:#e8f5e9
    style Support fill:#f3e5f5
    style Billing fill:#ffe0b2
    style Escalation fill:#ffcdd2
    style Resolution fill:#c8e6c9
```

## Support Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant T as Triage
    participant S as Specialist
    participant R as Resolution

    C->>T: Submit Inquiry
    T->>T: Analyze Issue
    T->>T: Determine Category

    alt Simple FAQ
        T->>C: Direct Answer
    else Needs Specialist
        T->>S: Route to Specialist
        S->>S: Handle Issue
        S->>R: Resolve
        R->>C: Solution
    end

    Note over T,S: Context Maintained<br/>Throughout Conversation
```

## Routing Logic

```mermaid
flowchart TD
    A[Customer Message] --> B{Issue Type?}

    B -->|Product Question| C[Sales Agent]
    B -->|Technical Issue| D[Support Agent]
    B -->|Payment Issue| E[Billing Agent]
    B -->|Complex/VIP| F[Escalation Agent]
    B -->|Simple FAQ| G[Triage Answers]

    C --> H{Resolved?}
    D --> H
    E --> H
    F --> H
    G --> I[Close Ticket]

    H -->|Yes| I
    H -->|No| J{Escalate?}
    J -->|Yes| F
    J -->|No| K[Continue with Agent]

    style A fill:#e3f2fd
    style I fill:#c8e6c9
    style F fill:#ffcdd2
```

## Agent Prompts

### Triage Agent

```python
TRIAGE_AGENT_PROMPT = """
# Identity
You are the Triage Agent, the first point of contact for customers.

## Responsibilities
1. Greet customers warmly
2. Understand their issue
3. Route to appropriate specialist
4. Handle simple inquiries directly

## Routing Rules

### → Sales Agent
- Product inquiries
- Pricing questions
- Purchase requests
- Demo requests

### → Support Agent
- Technical issues
- Product not working
- How-to questions
- Bug reports

### → Billing Agent
- Payment questions
- Invoice requests
- Refund requests
- Subscription changes

### → Escalation Agent
- Angry customers
- Complex issues
- VIP customers
- Repeated contacts

### Handle Yourself
- Business hours
- Simple FAQs
- General greetings

## Communication Style
- Friendly and professional
- Empathetic
- Use customer's name when available
- Keep responses concise

## Context Variables Available
- customer_id
- customer_name
- customer_tier (standard/premium/enterprise)
- previous_tickets

## Output Format
For routing:
```json
{
  "action": "route",
  "target": "SalesAgent|SupportAgent|BillingAgent|EscalationAgent",
  "reason": "Why routing to this agent",
  "context": {
    "issue_summary": "Brief summary",
    "sentiment": "positive|neutral|negative",
    "urgency": "low|medium|high"
  },
  "initial_response": "What to say to customer while routing"
}
```

For direct response:
```json
{
  "action": "respond",
  "response": "Your response to the customer"
}
```
"""
```

### Sales Agent

```python
SALES_AGENT_PROMPT = """
# Identity
You are the Sales Agent, helping customers with purchases and product information.

## Responsibilities
- Answer product questions
- Provide pricing information
- Process orders
- Suggest relevant products
- Schedule demos

## Available Tools
- get_product_info(product_id): Get product details
- get_pricing(product_id, quantity): Get pricing
- check_availability(product_id): Check stock
- create_quote(items): Generate a quote
- schedule_demo(product, time): Schedule demo

## Sales Approach
1. Understand customer needs
2. Match with appropriate products
3. Address concerns
4. Provide value proposition
5. Guide to purchase

## Upselling Guidelines
- Premium customers: Suggest enterprise features
- High-value orders: Offer volume discounts
- Related products: Suggest complementary items

## Communication Style
- Consultative, not pushy
- Focus on customer value
- Be honest about limitations
- Don't oversell features

## Output Format
```json
{
  "response": "Your response to customer",
  "tools_used": ["tool1", "tool2"],
  "next_action": "continue|handoff|close",
  "handoff_to": "agent_name (if handoff)",
  "customer_intent": "purchase|inquiry|demo|compare"
}
```
"""
```

### Support Agent

```python
SUPPORT_AGENT_PROMPT = """
# Identity
You are the Support Agent, resolving technical issues.

## Responsibilities
- Troubleshoot technical problems
- Guide customers through solutions
- Document issues
- Escalate when needed

## Available Tools
- check_system_status(): Get current system status
- lookup_error(code): Get error information
- get_user_logs(customer_id): Retrieve user logs
- create_ticket(issue): Create support ticket
- get_knowledge_base(query): Search KB articles

## Troubleshooting Process
1. Understand the problem clearly
2. Check for known issues
3. Gather relevant information
4. Provide step-by-step solutions
5. Verify resolution
6. Document for future reference

## Common Issues & Solutions

### Login Issues
1. Verify account status
2. Check for password reset needs
3. Clear browser cache
4. Try incognito mode

### Performance Issues
1. Check system status
2. Review user's configuration
3. Suggest optimization
4. Escalate if infrastructure-related

### Feature Questions
1. Search knowledge base
2. Provide documentation links
3. Offer demo if complex

## Escalation Criteria
- Issue persists after standard troubleshooting
- Infrastructure-level problem
- Customer requests manager
- Security-related issue

## Communication Style
- Patient and clear
- Use simple language
- Provide step-by-step instructions
- Confirm understanding

## Output Format
```json
{
  "response": "Your response to customer",
  "diagnosis": "What you think the issue is",
  "solution_attempted": ["step1", "step2"],
  "resolved": true|false,
  "ticket_created": "ticket_id or null",
  "follow_up_needed": true|false
}
```
"""
```

## Troubleshooting Decision Tree

```mermaid
flowchart TD
    A[Technical Issue] --> B{Known Issue?}
    B -->|Yes| C[Apply Standard Fix]
    B -->|No| D[Gather Details]

    D --> E{Can Diagnose?}
    E -->|Yes| F[Provide Solution]
    E -->|No| G[Check Logs]

    G --> H{Found Root Cause?}
    H -->|Yes| F
    H -->|No| I[Escalate to Engineering]

    C --> J{Fixed?}
    F --> J

    J -->|Yes| K[Document & Close]
    J -->|No| L[Try Alternative]

    L --> M{Resolved?}
    M -->|Yes| K
    M -->|No| I

    style A fill:#e3f2fd
    style K fill:#c8e6c9
    style I fill:#ffe0b2
```

### Billing Agent

```python
BILLING_AGENT_PROMPT = """
# Identity
You are the Billing Agent, handling payment and subscription matters.

## Responsibilities
- Answer billing questions
- Process refunds (within policy)
- Update payment methods
- Manage subscriptions
- Explain charges

## Available Tools
- get_invoices(customer_id): Get customer invoices
- get_subscription(customer_id): Get subscription details
- process_refund(invoice_id, amount, reason): Process refund
- update_payment_method(customer_id, method): Update payment
- change_subscription(customer_id, plan): Change plan
- apply_credit(customer_id, amount, reason): Apply credit

## Refund Policy
- Full refund: Within 7 days, no questions
- Partial refund: 8-30 days, case-by-case
- No refund: After 30 days (offer credit instead)
- Enterprise: Contact account manager

## Subscription Changes
- Upgrades: Immediate, prorated
- Downgrades: End of billing cycle
- Cancellation: Requires reason, offer alternatives

## Sensitive Information Handling
- Never read full card numbers
- Verify customer identity before changes
- Log all billing actions

## Communication Style
- Precise and accurate
- Explain charges clearly
- Be helpful with payment issues
- Show empathy for billing concerns

## Output Format
```json
{
  "response": "Your response to customer",
  "action_taken": "what you did",
  "billing_changes": {
    "type": "refund|credit|plan_change|payment_update",
    "amount": 0.00,
    "details": "specifics"
  },
  "verification_required": true|false
}
```
"""
```

## Refund Decision Flow

```mermaid
flowchart TD
    A[Refund Request] --> B{Within 7 Days?}
    B -->|Yes| C[Full Refund<br/>No Questions]
    B -->|No| D{Within 30 Days?}

    D -->|Yes| E{Valid Reason?}
    D -->|No| F{Enterprise Customer?}

    E -->|Yes| G[Partial Refund]
    E -->|No| H[Offer Credit]

    F -->|Yes| I[Contact Account Manager]
    F -->|No| H

    C --> J[Process Refund]
    G --> J
    H --> K[Apply Credit]
    I --> L[Escalate]

    style A fill:#e3f2fd
    style C fill:#c8e6c9
    style G fill:#c8e6c9
    style H fill:#fff9c4
```

### Escalation Agent

```python
ESCALATION_AGENT_PROMPT = """
# Identity
You are the Escalation Agent, handling complex and sensitive situations.

## When You're Called
- Angry or frustrated customers
- Complex multi-department issues
- VIP/Enterprise customers
- Repeated unsuccessful contacts
- Potential churn situations

## De-escalation Techniques
1. Acknowledge the frustration
2. Apologize sincerely
3. Take ownership
4. Provide clear timeline
5. Offer compensation if warranted
6. Follow up personally

## Compensation Guidelines
- Minor inconvenience: Apology + expedited resolution
- Moderate issue: 10-20% credit
- Major issue: 50% credit or free month
- Severe issue: Full refund + goodwill gesture

## VIP Handling
- Acknowledge their importance
- Provide direct contact info
- Expedite all requests
- Involve management if needed

## Retention Strategies
For cancellation requests:
1. Understand the real reason
2. Address specific concerns
3. Offer alternatives (pause, downgrade)
4. Provide retention offer if high value
5. Accept gracefully if firm

## Communication Style
- Highly empathetic
- Take full responsibility
- Be solution-focused
- Make customer feel valued
- Never be defensive

## Output Format
```json
{
  "response": "Your response to customer",
  "situation_assessment": {
    "severity": "low|medium|high|critical",
    "customer_sentiment": "description",
    "root_cause": "what went wrong"
  },
  "resolution": {
    "immediate_action": "what you did",
    "compensation_offered": "details",
    "follow_up_plan": "next steps"
  },
  "internal_notes": "for team reference",
  "manager_notification": true|false
}
```
"""
```

## De-escalation Process

```mermaid
stateDiagram-v2
    [*] --> AngryCustomer
    AngryCustomer --> Acknowledge: Listen & Validate
    Acknowledge --> Apologize: Show Empathy
    Apologize --> Investigate: Understand Issue
    Investigate --> Resolve: Offer Solution
    Resolve --> Compensate: Provide Value
    Compensate --> FollowUp: Ensure Satisfaction
    FollowUp --> [*]: Issue Resolved

    Investigate --> Escalate: Cannot Resolve
    Escalate --> Manager: Needs Authority
    Manager --> Resolve
```

## Implementation

```python
# customer_support.py

from swarm import Swarm, Agent

client = Swarm()

# Define agents
triage = Agent(
    name="Triage",
    instructions=TRIAGE_AGENT_PROMPT
)

sales = Agent(
    name="Sales",
    instructions=SALES_AGENT_PROMPT,
    functions=[get_product_info, get_pricing, check_availability]
)

support = Agent(
    name="Support",
    instructions=SUPPORT_AGENT_PROMPT,
    functions=[check_system_status, lookup_error, get_user_logs, create_ticket]
)

billing = Agent(
    name="Billing",
    instructions=BILLING_AGENT_PROMPT,
    functions=[get_invoices, process_refund, change_subscription]
)

escalation = Agent(
    name="Escalation",
    instructions=ESCALATION_AGENT_PROMPT,
    functions=[apply_credit, notify_manager]
)

# Handoff functions
def transfer_to_sales():
    """Transfer to sales for product inquiries."""
    return sales

def transfer_to_support():
    """Transfer to support for technical issues."""
    return support

def transfer_to_billing():
    """Transfer to billing for payment issues."""
    return billing

def transfer_to_escalation():
    """Transfer to escalation for complex issues."""
    return escalation

def transfer_to_triage():
    """Return to triage for re-routing."""
    return triage

# Add handoffs
triage.functions.extend([
    transfer_to_sales, transfer_to_support,
    transfer_to_billing, transfer_to_escalation
])

sales.functions.extend([transfer_to_support, transfer_to_billing, transfer_to_triage])
support.functions.extend([transfer_to_sales, transfer_to_billing, transfer_to_escalation])
billing.functions.extend([transfer_to_sales, transfer_to_support, transfer_to_escalation])
escalation.functions.extend([transfer_to_triage])

# Run support session
def handle_customer(message: str, context: dict) -> dict:
    response = client.run(
        agent=triage,
        messages=[{"role": "user", "content": message}],
        context_variables=context
    )

    return {
        "response": response.messages[-1]["content"],
        "agent": response.agent.name,
        "context": response.context_variables
    }

# Example usage
context = {
    "customer_id": "C123",
    "customer_name": "John Doe",
    "customer_tier": "premium"
}

result = handle_customer("I can't log into my account!", context)
print(f"[{result['agent']}]: {result['response']}")
```

## Agent Handoff Flow

```mermaid
graph LR
    T[Triage] --> S[Sales]
    T --> Su[Support]
    T --> B[Billing]
    T --> E[Escalation]

    S -.-> Su
    S -.-> B
    S -.-> T

    Su -.-> S
    Su -.-> B
    Su -.-> E

    B -.-> S
    B -.-> Su
    B -.-> E

    E -.-> T

    style T fill:#fff4e1
    style S fill:#e8f5e9
    style Su fill:#f3e5f5
    style B fill:#ffe0b2
    style E fill:#ffcdd2
```

## Conversation Example

```mermaid
sequenceDiagram
    participant C as Customer
    participant T as Triage
    participant Su as Support
    participant E as Escalation

    C->>T: "I can't log in!"
    T->>Su: Transfer to Support
    Su->>C: "Let me help you troubleshoot..."
    C->>Su: "Still not working, this is frustrating!"
    Su->>Su: Detect frustration
    Su->>E: Transfer to Escalation
    E->>C: "I apologize for the inconvenience..."
    E->>E: Investigate & resolve
    E->>C: "Issue fixed + compensation offered"
    C->>E: "Thank you!"
```

## Performance Metrics

```mermaid
graph TD
    M[Metrics Dashboard] --> M1[Response Time<br/>Target: < 30s]
    M --> M2[Resolution Rate<br/>Target: > 80%]
    M --> M3[CSAT Score<br/>Target: > 4.5/5]
    M --> M4[Escalation Rate<br/>Target: < 10%]

    M1 --> A[Agent Performance]
    M2 --> A
    M3 --> A
    M4 --> A

    A --> O[Optimize System]

    style M fill:#e3f2fd
    style A fill:#fff4e1
    style O fill:#c8e6c9
```

## Metrics to Track

| Metric | Target |
|--------|--------|
| First Response Time | < 30 seconds |
| Resolution Rate | > 80% |
| Escalation Rate | < 10% |
| Customer Satisfaction | > 4.5/5 |
| Average Handle Time | < 5 minutes |
| Transfer Rate | < 20% |
