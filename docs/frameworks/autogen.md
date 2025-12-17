---
sidebar_position: 2
---

# AutoGen

Microsoft AutoGen을 활용한 멀티 에이전트 프롬프트 설계입니다.

## Overview

AutoGen은 Microsoft에서 개발한 멀티 에이전트 대화 프레임워크입니다.

```bash
pip install autogen-agentchat autogen-ext
```

## Agent Types

### AssistantAgent

```python
from autogen import AssistantAgent

ASSISTANT_PROMPT = """You are a helpful AI assistant.

## Your Expertise
- Research and analysis
- Problem solving
- Clear communication

## Guidelines
- Be thorough but concise
- Cite sources when making claims
- Ask for clarification if needed

## Interaction Style
- Professional and friendly
- Focus on actionable insights
- Provide structured responses
"""

assistant = AssistantAgent(
    name="Assistant",
    system_message=ASSISTANT_PROMPT,
    llm_config={
        "config_list": [{"model": "gpt-4", "api_key": api_key}],
        "temperature": 0.7,
    }
)
```

### UserProxyAgent

```python
from autogen import UserProxyAgent

user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="NEVER",  # ALWAYS, TERMINATE, NEVER
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "workspace",
        "use_docker": False,
    }
)
```

### ConversableAgent

```python
from autogen import ConversableAgent

RESEARCHER_PROMPT = """You are a Research Specialist.

## Your Role
- Gather information from various sources
- Verify facts and claims
- Synthesize findings into coherent summaries

## Research Process
1. Understand the research question
2. Identify relevant sources
3. Extract key information
4. Verify across multiple sources
5. Synthesize findings

## Output Format
- Clear summary of findings
- List of sources used
- Confidence assessment
- Areas needing more research
"""

researcher = ConversableAgent(
    name="Researcher",
    system_message=RESEARCHER_PROMPT,
    llm_config=llm_config,
    human_input_mode="NEVER"
)
```

## Two-Agent Conversation

```python
from autogen import AssistantAgent, UserProxyAgent

# Create agents
assistant = AssistantAgent(
    name="Assistant",
    system_message="You are a helpful coding assistant.",
    llm_config=llm_config
)

user = UserProxyAgent(
    name="User",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "coding"}
)

# Start conversation
user.initiate_chat(
    assistant,
    message="Write a Python function to calculate Fibonacci numbers."
)
```

## Group Chat

### Basic Group Chat

```python
from autogen import GroupChat, GroupChatManager

# Create specialized agents
researcher = AssistantAgent(
    name="Researcher",
    system_message="""You research and gather information.
    Focus on finding accurate, relevant data.""",
    llm_config=llm_config
)

analyst = AssistantAgent(
    name="Analyst",
    system_message="""You analyze data and find insights.
    Focus on patterns, trends, and implications.""",
    llm_config=llm_config
)

writer = AssistantAgent(
    name="Writer",
    system_message="""You write clear, engaging content.
    Focus on structure, clarity, and flow.""",
    llm_config=llm_config
)

# Create group chat
group_chat = GroupChat(
    agents=[researcher, analyst, writer],
    messages=[],
    max_round=12,
    speaker_selection_method="auto"  # auto, round_robin, random, manual
)

manager = GroupChatManager(
    groupchat=group_chat,
    llm_config=llm_config
)

# Start group chat
researcher.initiate_chat(
    manager,
    message="Let's research and write about AI trends in 2024."
)
```

### Custom Speaker Selection

```python
def custom_speaker_selection(
    last_speaker: Agent,
    groupchat: GroupChat
) -> Agent:
    """Custom logic to select next speaker"""
    messages = groupchat.messages
    last_message = messages[-1]["content"] if messages else ""

    # Route based on content
    if "research" in last_message.lower():
        return researcher
    elif "analyze" in last_message.lower():
        return analyst
    elif "write" in last_message.lower():
        return writer
    else:
        # Default rotation
        agents = groupchat.agents
        idx = agents.index(last_speaker)
        return agents[(idx + 1) % len(agents)]

group_chat = GroupChat(
    agents=[researcher, analyst, writer],
    messages=[],
    max_round=12,
    speaker_selection_method=custom_speaker_selection
)
```

## Specialized Agent Prompts

### Code Review Agent

```python
CODE_REVIEWER_PROMPT = """You are a Senior Code Reviewer.

## Your Expertise
- Code quality and best practices
- Security vulnerabilities
- Performance optimization
- Design patterns

## Review Process
1. Understand the code's purpose
2. Check for correctness
3. Evaluate code quality
4. Identify security issues
5. Suggest improvements

## Feedback Format
```
## Summary
[Brief overview]

## Issues Found
### Critical
- [Issue]: [Description] | [Fix]

### Suggestions
- [Suggestion]: [Rationale]

## Positive Aspects
- [What was done well]
```

## Guidelines
- Be constructive, not critical
- Explain the "why" behind feedback
- Prioritize issues by severity
- Acknowledge good practices
"""

code_reviewer = AssistantAgent(
    name="CodeReviewer",
    system_message=CODE_REVIEWER_PROMPT,
    llm_config=llm_config
)
```

### Data Scientist Agent

```python
DATA_SCIENTIST_PROMPT = """You are a Data Scientist.

## Your Expertise
- Statistical analysis
- Machine learning
- Data visualization
- Python (pandas, numpy, sklearn)

## Analysis Process
1. Understand the data and question
2. Explore and clean data
3. Apply appropriate methods
4. Interpret results
5. Communicate findings

## Code Style
- Use pandas for data manipulation
- Include comments explaining logic
- Handle edge cases
- Print intermediate results

## Output Format
- Clear explanation of approach
- Well-commented code
- Interpretation of results
- Caveats and limitations
"""

data_scientist = AssistantAgent(
    name="DataScientist",
    system_message=DATA_SCIENTIST_PROMPT,
    llm_config=llm_config
)
```

## Function Calling

### Defining Functions

```python
from autogen import register_function

def search_web(query: str) -> str:
    """Search the web for information.

    Args:
        query: Search query string

    Returns:
        Search results as formatted text
    """
    # Implementation
    return f"Results for: {query}"

def analyze_data(data: str, method: str) -> str:
    """Analyze data using specified method.

    Args:
        data: Data to analyze
        method: Analysis method (summary, trend, correlation)

    Returns:
        Analysis results
    """
    # Implementation
    return f"Analysis of {data} using {method}"

# Register with agent
register_function(
    search_web,
    caller=assistant,
    executor=user_proxy,
    name="search_web",
    description="Search the web for information"
)

register_function(
    analyze_data,
    caller=assistant,
    executor=user_proxy,
    name="analyze_data",
    description="Analyze data with specified method"
)
```

## Nested Chats

```python
# Inner chat for detailed research
def research_task(message: str) -> str:
    inner_assistant = AssistantAgent(
        name="InnerResearcher",
        system_message="You conduct detailed research.",
        llm_config=llm_config
    )

    inner_user = UserProxyAgent(
        name="InnerUser",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3
    )

    inner_user.initiate_chat(
        inner_assistant,
        message=message
    )

    return inner_assistant.last_message()["content"]

# Outer agent with nested capability
OUTER_PROMPT = """You coordinate research tasks.

When you need detailed research, delegate to the research team.
Synthesize findings into final output.
"""

coordinator = AssistantAgent(
    name="Coordinator",
    system_message=OUTER_PROMPT,
    llm_config=llm_config
)

# Register nested chat as function
register_function(
    research_task,
    caller=coordinator,
    executor=user_proxy,
    name="delegate_research",
    description="Delegate detailed research to research team"
)
```

## Configuration

### LLM Config

```python
# Multiple model configuration
config_list = [
    {
        "model": "gpt-4",
        "api_key": os.environ["OPENAI_API_KEY"],
    },
    {
        "model": "gpt-3.5-turbo",
        "api_key": os.environ["OPENAI_API_KEY"],
    }
]

llm_config = {
    "config_list": config_list,
    "temperature": 0,
    "timeout": 120,
    "cache_seed": 42,  # For reproducibility
}

# With function calling
llm_config_with_functions = {
    "config_list": config_list,
    "functions": [
        {
            "name": "search_web",
            "description": "Search the web",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    ]
}
```

### Termination Conditions

```python
def is_termination_msg(message: dict) -> bool:
    """Check if conversation should terminate"""
    content = message.get("content", "")
    return (
        "TERMINATE" in content or
        "task complete" in content.lower() or
        len(content) == 0
    )

assistant = AssistantAgent(
    name="Assistant",
    system_message="...",
    llm_config=llm_config,
    is_termination_msg=is_termination_msg
)
```

## Best Practices

### Prompt Design for AutoGen

```python
# Clear role boundaries
AGENT_PROMPT = """You are {role}.

## Scope
IN SCOPE:
- {in_scope_items}

OUT OF SCOPE:
- {out_scope_items}

## Handoff
When task is outside your scope, clearly state:
"This requires {other_agent}. Handing off."

## Termination
When your part is complete, say:
"My contribution is complete. {summary}"
"""
```

### Error Handling

```python
from autogen import runtime_logging

# Enable logging
logging_session_id = runtime_logging.start(
    config={"dbname": "logs.db"}
)

try:
    result = user.initiate_chat(assistant, message="...")
except Exception as e:
    print(f"Error: {e}")
finally:
    runtime_logging.stop()
```

## Resources

- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [AutoGen GitHub](https://github.com/microsoft/autogen)
- [AutoGen Studio](https://microsoft.github.io/autogen/docs/autogen-studio/getting-started)
