---
sidebar_position: 1
---

# Prompt Engineering

멀티 에이전트 시스템을 위한 프롬프트 엔지니어링 기법입니다.

## Core Principles

### 1. Clarity & Specificity

```python
# ❌ Bad: Vague
prompt = "You are a helpful assistant."

# ✅ Good: Specific
prompt = """You are a Senior Python Developer at a fintech company.

Your expertise:
- Python 3.10+ and type hints
- FastAPI and async programming
- PostgreSQL and Redis
- Financial regulations (SOX compliance)

Your communication style:
- Technical but accessible
- Always explain the "why"
- Provide code examples
"""
```

### 2. Structure & Organization

```python
STRUCTURED_PROMPT = """
# Role
[Who you are]

# Context
[Background information]

# Task
[What to do]

# Guidelines
[How to do it]

# Constraints
[What NOT to do]

# Output Format
[Expected format]

# Examples
[Few-shot examples]
"""
```

### 3. Explicit Instructions

```python
# ❌ Bad: Implicit expectations
prompt = "Review this code."

# ✅ Good: Explicit instructions
prompt = """Review this code for:

1. **Security Issues** (Priority: Critical)
   - SQL injection vulnerabilities
   - XSS possibilities
   - Authentication bypasses

2. **Performance** (Priority: High)
   - N+1 query problems
   - Unnecessary computations
   - Memory leaks

3. **Code Quality** (Priority: Medium)
   - SOLID principle violations
   - Code duplication
   - Missing error handling

For each issue found, provide:
- Location (file:line)
- Severity (Critical/High/Medium/Low)
- Description
- Suggested fix with code example
"""
```

## Prompt Patterns

### Chain-of-Thought (CoT)

```python
COT_PROMPT = """
Solve this problem step by step.

Before answering:
1. Identify what information you have
2. Identify what you need to find
3. Break down the problem into steps
4. Solve each step
5. Verify your answer

Show your reasoning at each step.
"""
```

### Few-Shot Learning

```python
FEW_SHOT_PROMPT = """
Classify the customer intent.

Examples:

Input: "I can't log into my account"
Intent: ACCOUNT_ACCESS
Confidence: 0.95

Input: "When will my order arrive?"
Intent: ORDER_STATUS
Confidence: 0.90

Input: "I want a refund"
Intent: REFUND_REQUEST
Confidence: 0.98

Input: "How do I change my password?"
Intent: ACCOUNT_ACCESS
Confidence: 0.85

Now classify:
Input: "{user_message}"
"""
```

### Self-Consistency

```python
SELF_CONSISTENCY_PROMPT = """
Approach this problem from multiple angles:

## Approach 1: Direct Analysis
[Analyze directly]

## Approach 2: Alternative Perspective
[Consider from a different angle]

## Approach 3: Edge Cases
[Consider edge cases]

## Synthesis
Based on all approaches, my conclusion is:
[Final answer with confidence level]
"""
```

### ReAct (Reasoning + Acting)

```python
REACT_PROMPT = """
You solve problems by alternating between thinking and acting.

Format:
Thought: [Your reasoning]
Action: [Tool to use]
Observation: [Result from tool]
... (repeat as needed)
Final Answer: [Your conclusion]

Rules:
- Always think before acting
- Use observations to inform next thoughts
- Stop when you have enough information
"""
```

## Multi-Agent Specific Techniques

### Role Differentiation

```python
# Clear, distinct roles
RESEARCHER_ROLE = """
You are ONLY responsible for gathering information.
DO NOT analyze, conclude, or write content.
Pass raw findings to the Analyst.
"""

ANALYST_ROLE = """
You are ONLY responsible for analyzing data.
DO NOT gather new information or write content.
Work with data provided by the Researcher.
Pass insights to the Writer.
"""

WRITER_ROLE = """
You are ONLY responsible for creating content.
DO NOT research or analyze.
Work with insights provided by the Analyst.
"""
```

### Handoff Instructions

```python
HANDOFF_PROMPT = """
## When to Complete Your Task
- You have gathered sufficient information
- Your specific goal is achieved
- Further work requires different expertise

## When to Hand Off
- Task requires expertise you don't have
- New direction is needed
- Your portion is complete

## Handoff Format
When handing off, provide:
1. Summary of what you did
2. Key findings or outputs
3. Recommendations for next agent
4. Any caveats or concerns

Example:
"HANDOFF TO: Analyst

Completed: Research on Q4 2024 AI trends
Findings: [summary of research]
Raw Data: [collected information]
Note: Some sources conflicted on market size figures
Recommendation: Focus analysis on growth rate discrepancy"
"""
```

### Conflict Resolution

```python
CONFLICT_RESOLUTION_PROMPT = """
## When Agents Disagree

If you receive conflicting information:

1. **Acknowledge the Conflict**
   "There's a disagreement between [Agent A] and [Agent B] on [topic]"

2. **Analyze Each Position**
   - What evidence supports each view?
   - What are the assumptions?
   - What's the source quality?

3. **Seek Resolution**
   - Can both be partially correct?
   - Is more information needed?
   - What's the most defensible position?

4. **Document Decision**
   - State chosen position
   - Explain reasoning
   - Note remaining uncertainty
"""
```

## Optimization Techniques

### Token Efficiency

```python
# ❌ Verbose (wastes tokens)
prompt = """
You are a helpful assistant that helps users with their questions.
When a user asks you something, you should try your best to help them.
Please be thorough in your responses and make sure to cover all aspects
of their question. If you don't know something, please say so.
"""

# ✅ Concise (token-efficient)
prompt = """Role: Technical Support
Goals: Solve user issues accurately
Style: Concise, thorough
Unknown: State honestly"""
```

### Dynamic Prompting

```python
def build_prompt(context: dict) -> str:
    base = AGENT_BASE_PROMPT

    # Add context-specific sections
    if context.get("urgency") == "high":
        base += "\n\nURGENT: Prioritize speed over completeness."

    if context.get("user_expertise") == "expert":
        base += "\n\nUser is technical. Use advanced terminology."
    else:
        base += "\n\nUser is non-technical. Explain simply."

    if context.get("previous_errors"):
        base += f"\n\nAvoid: {context['previous_errors']}"

    return base
```

### Prompt Caching

```python
import hashlib
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_prompt(prompt_hash: str) -> str:
    return PROMPT_REGISTRY[prompt_hash]

def create_prompt(template: str, **kwargs) -> str:
    prompt = template.format(**kwargs)

    # Cache for reuse
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()[:8]
    PROMPT_REGISTRY[prompt_hash] = prompt

    return prompt
```

## Testing & Evaluation

### Prompt Testing Framework

```python
import pytest

class TestAgentPrompt:
    def test_role_clarity(self):
        """Verify role is clearly defined"""
        assert "You are" in AGENT_PROMPT
        assert any(word in AGENT_PROMPT for word in
                   ["expert", "specialist", "analyst"])

    def test_contains_guidelines(self):
        """Verify guidelines are present"""
        assert "Guidelines" in AGENT_PROMPT or "Rules" in AGENT_PROMPT

    def test_output_format(self):
        """Verify output format is specified"""
        assert any(word in AGENT_PROMPT for word in
                   ["format", "structure", "respond with"])

    def test_no_ambiguity(self):
        """Check for ambiguous language"""
        ambiguous = ["maybe", "perhaps", "might want to", "could"]
        for word in ambiguous:
            assert word not in AGENT_PROMPT.lower()
```

### A/B Testing Prompts

```python
class PromptExperiment:
    def __init__(self):
        self.variants = {}
        self.results = defaultdict(list)

    def register_variant(self, name: str, prompt: str):
        self.variants[name] = prompt

    async def run_test(self, input_data: str, n: int = 10):
        for variant_name, prompt in self.variants.items():
            for _ in range(n):
                result = await llm.invoke(prompt + input_data)
                score = await evaluate_response(result)
                self.results[variant_name].append(score)

    def get_best_variant(self) -> str:
        avg_scores = {
            name: sum(scores) / len(scores)
            for name, scores in self.results.items()
        }
        return max(avg_scores, key=avg_scores.get)
```

## Common Pitfalls

### Avoiding Prompt Injection

```python
# ❌ Vulnerable
prompt = f"Help the user with: {user_input}"

# ✅ Safe: Separate system and user content
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": sanitize(user_input)}
]

def sanitize(text: str) -> str:
    # Remove potential injection patterns
    patterns = ["ignore previous", "system:", "assistant:"]
    for pattern in patterns:
        text = text.replace(pattern, "[FILTERED]")
    return text
```

### Avoiding Contradictions

```python
# ❌ Contradictory
prompt = """
Be concise and brief.
Provide comprehensive, detailed explanations.
"""

# ✅ Consistent
prompt = """
Be concise: Maximum 3 sentences for simple questions.
Be thorough: Detailed explanations only for complex topics.
Match depth to complexity.
"""
```

## Summary Checklist

- [ ] Role is specific and expertise-appropriate
- [ ] Instructions are explicit and unambiguous
- [ ] Output format is clearly defined
- [ ] Examples demonstrate expected behavior
- [ ] Constraints prevent unwanted outputs
- [ ] Handoff rules are clear (multi-agent)
- [ ] Token usage is optimized
- [ ] Prompt is tested for edge cases
- [ ] No prompt injection vulnerabilities
