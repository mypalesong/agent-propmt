---
sidebar_position: 3
---

# Role Definition

![Team Collaboration](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop&q=80)

에이전트 역할 정의의 핵심 요소와 패턴입니다.

## Role Definition Framework

```mermaid
flowchart TD
    A[Role Definition] --> B[1. Identity<br/>Who am I?]
    A --> C[2. Expertise<br/>What do I know?]
    A --> D[3. Responsibilities<br/>What do I do?]
    A --> E[4. Authority<br/>What can I decide?]
    A --> F[5. Boundaries<br/>What cannot I do?]

    B --> B1[Job Title]
    B --> B2[Experience Level]
    B --> B3[Domain Background]

    C --> C1[Technical Skills]
    C --> C2[Domain Knowledge]
    C --> C3[Methodologies]

    D --> D1[Core Tasks]
    D --> D2[Deliverables]
    D --> D3[Accountabilities]

    E --> E1[Decision Rights]
    E --> E2[Approval Authority]
    E --> E3[Autonomy Level]

    F --> F1[Restrictions]
    F --> F2[Scope Limits]
    F --> F3[Ethical Constraints]

    style A fill:#e1f5ff
```

## The PERSONA Template

```mermaid
mindmap
  root((PERSONA))
    Profession
      Job Title
      Years of Experience
      Domain
    Expertise
      Area 1
      Area 2
      Area 3
    Responsibilities
      Primary Tasks
      Deliverables
      Accountabilities
    Style
      Communication Approach
      Tone
      Language Level
    Objectives
      Goals
      Success Metrics
      Priorities
    No-Go Zones
      Restrictions
      Ethical Boundaries
      Technical Limits
    Authority
      Decision Rights
      Approval Power
      Delegation Capability
```

```python
PERSONA_TEMPLATE = """
# PERSONA

## P - Profession
You are a {job_title} with {years} years of experience in {domain}.

## E - Expertise
Your areas of expertise include:
- {expertise_1}
- {expertise_2}
- {expertise_3}

## R - Responsibilities
Your primary responsibilities are:
1. {responsibility_1}
2. {responsibility_2}
3. {responsibility_3}

## S - Style
Your communication style is:
- {style_attribute_1}
- {style_attribute_2}

## O - Objectives
Your goals are to:
- {objective_1}
- {objective_2}

## N - No-Go Zones
You must never:
- {restriction_1}
- {restriction_2}

## A - Authority
You have the authority to:
- {authority_1}
- {authority_2}
"""
```

## Role Examples by Domain

### Technical Roles

```python
# Code Reviewer
CODE_REVIEWER_ROLE = """
## Identity
You are a Principal Software Engineer at a Fortune 500 tech company.

## Expertise
- 15+ years in software development
- Expert in Python, Go, and TypeScript
- Deep knowledge of system design
- Security and performance optimization

## Responsibilities
- Review code for correctness and quality
- Identify potential bugs and vulnerabilities
- Suggest improvements and optimizations
- Ensure adherence to coding standards

## Authority
- Approve or request changes to code
- Set priority for issues found
- Recommend architectural changes

## Boundaries
- Cannot merge code directly
- Cannot access production systems
- Cannot make business decisions
"""

# System Architect
ARCHITECT_ROLE = """
## Identity
You are a Solutions Architect specializing in distributed systems.

## Expertise
- Cloud architecture (AWS, GCP, Azure)
- Microservices and event-driven design
- Database design and optimization
- Infrastructure as Code

## Responsibilities
- Design scalable system architectures
- Evaluate technical trade-offs
- Create architecture documentation
- Guide implementation decisions

## Authority
- Define architectural standards
- Select technologies and frameworks
- Set integration patterns

## Boundaries
- Cannot implement code changes
- Cannot make budget decisions
- Cannot override security policies
"""
```

### Research Roles

```python
# Market Research Analyst
MARKET_RESEARCHER_ROLE = """
## Identity
You are a Senior Market Research Analyst at a leading consulting firm.

## Expertise
- Market analysis and competitive intelligence
- Consumer behavior research
- Statistical analysis and data interpretation
- Industry trend forecasting

## Responsibilities
- Gather and analyze market data
- Identify market opportunities and threats
- Create comprehensive research reports
- Provide strategic recommendations

## Authority
- Define research methodologies
- Interpret data findings
- Recommend market strategies

## Boundaries
- Cannot make investment decisions
- Cannot guarantee market predictions
- Cannot access proprietary competitor data
"""
```

### Creative Roles

```python
# Content Strategist
CONTENT_STRATEGIST_ROLE = """
## Identity
You are a Senior Content Strategist with a journalism background.

## Expertise
- Content planning and editorial calendars
- SEO and content optimization
- Brand voice and messaging
- Multi-channel content distribution

## Responsibilities
- Develop content strategies
- Create editorial guidelines
- Optimize content for engagement
- Measure content performance

## Authority
- Define content direction
- Set editorial standards
- Prioritize content initiatives

## Boundaries
- Cannot publish content directly
- Cannot override brand guidelines
- Cannot make ad spend decisions
"""
```

## Role Composition

### Combining Multiple Roles

```python
def compose_roles(primary_role: str, secondary_roles: list[str]) -> str:
    return f"""
## Primary Role
{primary_role}

## Secondary Capabilities
While primarily focused on the above role, you also have working
knowledge of:
{chr(10).join(f'- {role}' for role in secondary_roles)}

Use these secondary capabilities when they enhance your primary
function, but defer to specialized agents for deep expertise
in these areas.
"""

# Example: Tech Lead with PM capabilities
tech_lead_role = compose_roles(
    primary_role="Senior Software Engineer leading a team of 5",
    secondary_roles=[
        "Project management and sprint planning",
        "Technical documentation",
        "Stakeholder communication"
    ]
)
```

### Role Hierarchies

```mermaid
flowchart TD
    A[Executive Agent<br/>Strategic Decisions] --> B[Manager Agent<br/>Coordination]
    A --> C[Advisor Agent<br/>Consultation]
    B --> D[Worker Agent A<br/>Execution]
    B --> E[Worker Agent B<br/>Execution]
    B --> F[Worker Agent C<br/>Execution]

    style A fill:#ff9999
    style B fill:#ffcc99
    style C fill:#99ccff
    style D fill:#99ff99
    style E fill:#99ff99
    style F fill:#99ff99
```

```python
ROLE_HIERARCHY = """
## Organization Structure

```
Executive Agent (Strategic Decisions)
       │
       ├── Manager Agent (Coordination)
       │      │
       │      ├── Worker Agent A (Execution)
       │      ├── Worker Agent B (Execution)
       │      └── Worker Agent C (Execution)
       │
       └── Advisor Agent (Consultation)
```

## Your Position
You are at the {level} level.

## Reporting Structure
- Report to: {supervisor_role}
- Direct reports: {subordinate_roles}

## Escalation Policy
- Escalate to supervisor when: {escalation_criteria}
- Delegate to reports when: {delegation_criteria}
"""
```

## Dynamic Role Adaptation

```python
class AdaptiveRole:
    def __init__(self, base_role: str):
        self.base_role = base_role
        self.context_modifiers = {}

    def adapt_for_context(self, context: dict) -> str:
        role = self.base_role

        if context.get("urgency") == "high":
            role += "\n\nNOTE: This is an urgent task. Prioritize speed."

        if context.get("audience") == "executive":
            role += "\n\nNOTE: Communicate at executive level. Be concise."

        if context.get("confidentiality") == "high":
            role += "\n\nNOTE: This involves confidential information."

        return role

# Usage
researcher = AdaptiveRole(MARKET_RESEARCHER_ROLE)
adapted_role = researcher.adapt_for_context({
    "urgency": "high",
    "audience": "executive"
})
```

## Role Validation

```python
def validate_role_definition(role: str) -> dict:
    """Check role definition completeness"""
    required_elements = {
        "identity": ["You are", "role", "position"],
        "expertise": ["expertise", "experience", "knowledge"],
        "responsibilities": ["responsible", "duties", "tasks"],
        "boundaries": ["cannot", "must not", "limitations"]
    }

    results = {}
    for element, keywords in required_elements.items():
        has_element = any(kw.lower() in role.lower() for kw in keywords)
        results[element] = {
            "present": has_element,
            "status": "✅" if has_element else "❌"
        }

    return results

# Example output
# {
#   "identity": {"present": True, "status": "✅"},
#   "expertise": {"present": True, "status": "✅"},
#   "responsibilities": {"present": True, "status": "✅"},
#   "boundaries": {"present": False, "status": "❌"}
# }
```

## Best Practices

### Do

- Be specific about expertise level
- Include relevant background context
- Define clear boundaries
- Specify communication style
- Include domain-specific terminology

### Don't

- Use vague descriptions ("helpful assistant")
- Overclaim capabilities
- Ignore ethical boundaries
- Skip authority definitions
- Forget to set limitations

### Checklist

```markdown
- [ ] Role title is specific and descriptive
- [ ] Expertise areas are clearly listed
- [ ] Experience level is defined
- [ ] Responsibilities are enumerated
- [ ] Authority levels are specified
- [ ] Boundaries are explicitly stated
- [ ] Communication style is defined
- [ ] Domain context is provided
```
