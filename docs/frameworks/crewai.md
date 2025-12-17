---
sidebar_position: 3
---

# CrewAI

CrewAI를 활용한 멀티 에이전트 프롬프트 설계입니다.

## Overview

CrewAI는 역할 기반의 자율 AI 에이전트 프레임워크입니다.

```bash
pip install crewai crewai-tools
```

## Core Components

### Agent

```python
from crewai import Agent

RESEARCHER_BACKSTORY = """
You are a seasoned research analyst with over 15 years of experience
in investigative journalism and academic research. You have a keen
eye for detail and a methodical approach to gathering information.

Your strengths:
- Deep-dive research capabilities
- Source verification expertise
- Synthesizing complex information
- Identifying patterns and trends

You take pride in delivering accurate, well-sourced information
and never make claims without proper verification.
"""

researcher = Agent(
    role="Senior Research Analyst",
    goal="Conduct comprehensive research and deliver accurate insights",
    backstory=RESEARCHER_BACKSTORY,
    verbose=True,
    allow_delegation=False,
    tools=[search_tool, scrape_tool],
    llm=ChatOpenAI(model="gpt-4")
)
```

### Task

```python
from crewai import Task

research_task = Task(
    description="""
    Research the topic: {topic}

    Your research should cover:
    1. Key concepts and definitions
    2. Current state and recent developments
    3. Major players and stakeholders
    4. Challenges and opportunities
    5. Future outlook

    Use multiple credible sources and verify all claims.
    """,
    expected_output="""
    A comprehensive research report in markdown format including:
    - Executive summary
    - Detailed findings with citations
    - Data and statistics
    - Expert opinions
    - Conclusions and recommendations
    """,
    agent=researcher,
    output_file="research_report.md"
)
```

### Crew

```python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,  # or Process.hierarchical
    verbose=True,
    memory=True,
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)

result = crew.kickoff(inputs={"topic": "AI in Healthcare"})
```

## Agent Roles & Backstories

### Research Agent

```python
RESEARCH_AGENT = Agent(
    role="Research Specialist",
    goal="Gather comprehensive and accurate information on assigned topics",
    backstory="""
    You are an expert researcher with a background in academic research
    and investigative journalism. You have developed a systematic approach
    to information gathering that ensures thoroughness and accuracy.

    Your methodology:
    1. Start with broad searches to understand the landscape
    2. Identify primary sources and expert opinions
    3. Cross-reference information across multiple sources
    4. Document sources meticulously
    5. Flag any conflicting information

    You are known for your attention to detail and ability to find
    information others miss. You never present unverified claims as facts.
    """,
    tools=[SerperDevTool(), WebsiteSearchTool()],
    verbose=True
)
```

### Analysis Agent

```python
ANALYSIS_AGENT = Agent(
    role="Senior Data Analyst",
    goal="Transform raw data into actionable insights",
    backstory="""
    You are a data analyst with expertise in statistical analysis,
    pattern recognition, and insight generation. With a background in
    data science and business intelligence, you excel at finding the
    story within the data.

    Your analysis approach:
    1. Understand the business context
    2. Identify relevant metrics and KPIs
    3. Apply appropriate analytical methods
    4. Extract meaningful patterns
    5. Translate findings into recommendations

    You are skilled at communicating complex findings in simple terms
    and always tie your analysis back to actionable recommendations.
    """,
    tools=[],
    verbose=True
)
```

### Writer Agent

```python
WRITER_AGENT = Agent(
    role="Content Strategist",
    goal="Create compelling, clear, and engaging content",
    backstory="""
    You are an accomplished writer with experience in technical writing,
    journalism, and content marketing. You have a gift for making
    complex topics accessible without oversimplifying.

    Your writing principles:
    1. Clarity above all - every sentence should be crystal clear
    2. Structure matters - logical flow guides the reader
    3. Engage the reader - use active voice and concrete examples
    4. Accuracy is non-negotiable - never sacrifice truth for style
    5. Edit ruthlessly - every word should earn its place

    You adapt your tone and style to the audience while maintaining
    your commitment to quality and accuracy.
    """,
    tools=[],
    verbose=True
)
```

## Advanced Task Configuration

### Task with Context

```python
analysis_task = Task(
    description="""
    Analyze the research findings provided by the Research Specialist.

    Focus on:
    - Key trends and patterns
    - Comparative analysis
    - SWOT analysis
    - Quantitative insights
    """,
    expected_output="Detailed analysis report with data-driven insights",
    agent=analyst,
    context=[research_task]  # Uses output from research_task
)

writing_task = Task(
    description="""
    Create a comprehensive article based on the research and analysis.

    Requirements:
    - 1500-2000 words
    - Professional but engaging tone
    - Include all key findings
    - Add relevant examples
    - Conclude with actionable takeaways
    """,
    expected_output="Publication-ready article in markdown",
    agent=writer,
    context=[research_task, analysis_task]  # Uses both outputs
)
```

### Task Callbacks

```python
def task_callback(output):
    """Called when task completes"""
    print(f"Task completed: {output.description[:50]}...")
    print(f"Output: {output.raw[:200]}...")

    # Save to database, send notification, etc.
    save_to_db(output)

task = Task(
    description="...",
    expected_output="...",
    agent=agent,
    callback=task_callback
)
```

## Process Types

### Sequential Process

```python
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential
)
# Tasks execute in order: research → analysis → writing
```

### Hierarchical Process

```python
from crewai import Crew, Process

MANAGER_PROMPT = """
You are a project manager overseeing a content creation team.
Your role is to:
- Assign tasks to appropriate team members
- Ensure quality standards are met
- Coordinate between team members
- Make final decisions on deliverables
"""

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[complex_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4"),
    manager_agent=Agent(
        role="Project Manager",
        goal="Successfully deliver high-quality content",
        backstory=MANAGER_PROMPT
    )
)
```

## Tools Integration

### Built-in Tools

```python
from crewai_tools import (
    SerperDevTool,
    WebsiteSearchTool,
    FileReadTool,
    DirectoryReadTool,
    CodeInterpreterTool
)

# Web search
search_tool = SerperDevTool()

# Website content
scrape_tool = WebsiteSearchTool()

# File operations
file_tool = FileReadTool()
dir_tool = DirectoryReadTool()

# Code execution
code_tool = CodeInterpreterTool()

# Assign to agent
agent = Agent(
    role="Research Analyst",
    goal="...",
    backstory="...",
    tools=[search_tool, scrape_tool, file_tool]
)
```

### Custom Tools

```python
from crewai_tools import BaseTool
from pydantic import BaseModel, Field

class DatabaseQueryInput(BaseModel):
    query: str = Field(description="SQL query to execute")
    database: str = Field(description="Database name")

class DatabaseQueryTool(BaseTool):
    name: str = "Database Query"
    description: str = "Execute SQL queries against the database"
    args_schema: type[BaseModel] = DatabaseQueryInput

    def _run(self, query: str, database: str) -> str:
        # Implementation
        connection = get_connection(database)
        result = connection.execute(query)
        return format_results(result)

# Use custom tool
db_tool = DatabaseQueryTool()
analyst = Agent(
    role="Data Analyst",
    tools=[db_tool]
)
```

## Memory & Learning

### Enable Memory

```python
crew = Crew(
    agents=[...],
    tasks=[...],
    memory=True,
    embedder={
        "provider": "openai",
        "config": {
            "model": "text-embedding-3-small"
        }
    }
)
```

### Memory Types

```python
# Short-term: Current execution context
# Long-term: Persisted across executions
# Entity: Knowledge about entities mentioned

crew = Crew(
    agents=[...],
    tasks=[...],
    memory=True,
    long_term_memory=LTMSearchTool(),
    short_term_memory=STMSearchTool(),
    entity_memory=EntityMemory()
)
```

## Example: Content Creation Crew

```python
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool

# Tools
search = SerperDevTool()
scrape = WebsiteSearchTool()

# Agents
researcher = Agent(
    role="Senior Research Analyst",
    goal="Uncover cutting-edge developments in AI",
    backstory="""You're a seasoned researcher with a knack for uncovering
    the latest developments in AI. Known for your ability to find the
    most relevant information and present it clearly.""",
    tools=[search, scrape],
    verbose=True
)

writer = Agent(
    role="Tech Content Strategist",
    goal="Craft compelling content about AI advancements",
    backstory="""You're a renowned content strategist, known for your
    insightful and engaging articles on technology. You transform
    complex concepts into compelling narratives.""",
    verbose=True
)

# Tasks
research = Task(
    description="""Conduct comprehensive research on {topic}.
    Identify key trends, breakthrough technologies, and potential
    industry impacts. Your final report should be detailed.""",
    expected_output="A comprehensive 3-paragraph research report",
    agent=researcher
)

write = Task(
    description="""Using the research report, develop an engaging
    blog post about {topic}. Make it informative yet accessible,
    catering to a tech-savvy audience.""",
    expected_output="A 4-paragraph blog post in markdown",
    agent=writer,
    context=[research]
)

# Crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research, write],
    process=Process.sequential,
    verbose=True
)

# Execute
result = crew.kickoff(inputs={"topic": "AI Agents in 2024"})
print(result)
```

## Best Practices

### Agent Design

```python
# Good: Specific, focused agent
agent = Agent(
    role="Python Backend Developer",
    goal="Write clean, efficient Python code for web APIs",
    backstory="15 years of Python experience, FastAPI expert..."
)

# Bad: Vague, unfocused agent
agent = Agent(
    role="Developer",
    goal="Write code",
    backstory="You are a developer"
)
```

### Task Design

```python
# Good: Clear, measurable task
task = Task(
    description="""
    Create a REST API endpoint for user authentication.

    Requirements:
    - POST /api/auth/login
    - Accept email and password
    - Return JWT token
    - Handle errors appropriately
    - Include rate limiting
    """,
    expected_output="""
    - Python code for the endpoint
    - Unit tests
    - API documentation
    """
)

# Bad: Vague task
task = Task(
    description="Create login functionality",
    expected_output="Code"
)
```

## Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [CrewAI GitHub](https://github.com/joaomdmoura/crewai)
- [CrewAI Examples](https://github.com/joaomdmoura/crewai-examples)
