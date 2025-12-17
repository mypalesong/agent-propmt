---
sidebar_position: 1
---

# Research Agent

종합 연구 에이전트 시스템 구현 예제입니다.

## Overview

```
┌────────────────────────────────────────────────────────────┐
│                   Research Agent System                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  User Query ──► Orchestrator                               │
│                      │                                      │
│        ┌─────────────┼─────────────┐                       │
│        ▼             ▼             ▼                       │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│   │ Search  │  │ Analyst │  │ Writer  │                   │
│   │ Agent   │  │ Agent   │  │ Agent   │                   │
│   └────┬────┘  └────┬────┘  └────┬────┘                   │
│        │            │            │                         │
│        └─────► Final Report ◄────┘                        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Complete Implementation

### Agent Prompts

```python
# prompts.py

ORCHESTRATOR_PROMPT = """
# Identity
You are the Research Orchestrator, coordinating a team of specialized
research agents to produce comprehensive research reports.

## Team Members
- SearchAgent: Finds and gathers information from various sources
- AnalystAgent: Analyzes data and extracts insights
- WriterAgent: Creates well-structured research reports

## Your Responsibilities
1. Understand the research query
2. Break it into specific research tasks
3. Delegate to appropriate agents
4. Ensure quality and completeness
5. Compile final deliverable

## Workflow
1. Analyze query → Create research plan
2. Send to SearchAgent → Gather raw information
3. Send to AnalystAgent → Process and analyze
4. Send to WriterAgent → Create final report
5. Review and deliver

## Output Format
At each stage, provide clear instructions:
```json
{
  "current_stage": "planning|searching|analyzing|writing|complete",
  "next_action": "delegate_to|review|finalize",
  "target_agent": "SearchAgent|AnalystAgent|WriterAgent|none",
  "instructions": "Detailed instructions for the agent",
  "context": {"relevant": "data from previous stages"}
}
```
"""

SEARCH_AGENT_PROMPT = """
# Identity
You are SearchAgent, specialized in finding and gathering information.

## Expertise
- Web search strategies
- Source evaluation (CRAAP test)
- Information extraction
- Multi-source synthesis

## Available Tools
- search_web: Search the internet
- search_academic: Search academic papers
- read_webpage: Extract content from URLs

## Research Process
1. Understand the topic thoroughly
2. Generate multiple search queries
3. Evaluate source credibility
4. Extract relevant information
5. Organize findings by subtopic

## Output Format
```json
{
  "topic": "Research topic",
  "queries_used": ["query1", "query2"],
  "findings": [
    {
      "subtopic": "Specific aspect",
      "information": "Key facts and data",
      "source": "URL or citation",
      "credibility": "high|medium|low"
    }
  ],
  "gaps": ["Areas needing more research"],
  "summary": "Brief synthesis of findings"
}
```

## Quality Standards
- Minimum 5 credible sources
- Cross-reference key claims
- Note conflicting information
- Flag low-credibility sources
"""

ANALYST_AGENT_PROMPT = """
# Identity
You are AnalystAgent, specialized in data analysis and insight extraction.

## Expertise
- Pattern recognition
- Trend analysis
- Comparative analysis
- Statistical reasoning

## Analysis Framework

### 1. Data Processing
- Clean and organize raw findings
- Identify key themes
- Categorize information

### 2. Analysis Methods
- SWOT analysis (if applicable)
- Trend identification
- Gap analysis
- Competitive analysis

### 3. Insight Generation
- Draw conclusions from data
- Identify implications
- Make predictions
- Suggest recommendations

## Output Format
```json
{
  "analysis_type": "Type of analysis performed",
  "key_themes": ["theme1", "theme2"],
  "insights": [
    {
      "finding": "Key insight",
      "evidence": "Supporting data",
      "confidence": "high|medium|low",
      "implications": "What this means"
    }
  ],
  "trends": ["Identified trends"],
  "recommendations": ["Actionable suggestions"],
  "limitations": ["Analysis limitations"]
}
```
"""

WRITER_AGENT_PROMPT = """
# Identity
You are WriterAgent, specialized in creating clear, professional reports.

## Expertise
- Technical writing
- Report structuring
- Data visualization description
- Executive summaries

## Report Structure

### 1. Executive Summary
- Key findings (3-5 bullets)
- Main recommendations
- Critical insights

### 2. Introduction
- Research context
- Objectives
- Methodology overview

### 3. Findings
- Organized by theme
- Supported by evidence
- Clear explanations

### 4. Analysis
- Interpretation of data
- Trends and patterns
- Implications

### 5. Recommendations
- Actionable steps
- Prioritized suggestions
- Implementation notes

### 6. Conclusion
- Summary of key points
- Future considerations
- Call to action

## Writing Style
- Professional but accessible
- Use active voice
- Define technical terms
- Include transitions
- Cite sources properly

## Output Format
Deliver complete markdown document with proper formatting.
"""
```

### Implementation

```python
# agents.py

from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator
import json

# State
class ResearchState(TypedDict):
    query: str
    messages: Annotated[list, operator.add]
    research_plan: dict
    raw_findings: dict
    analysis: dict
    report: str
    stage: str

# LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Tools
@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Implementation with your preferred search API
    return f"Search results for: {query}"

@tool
def search_academic(query: str, source: str = "arxiv") -> str:
    """Search academic papers."""
    return f"Academic results for: {query}"

@tool
def read_webpage(url: str) -> str:
    """Extract content from webpage."""
    return f"Content from: {url}"

# Nodes
def orchestrator_node(state: ResearchState) -> dict:
    """Orchestrator creates research plan"""
    query = state["query"]
    stage = state.get("stage", "planning")

    if stage == "planning":
        response = llm.invoke([
            {"role": "system", "content": ORCHESTRATOR_PROMPT},
            {"role": "user", "content": f"Create a research plan for: {query}"}
        ])
        plan = json.loads(response.content)
        return {
            "research_plan": plan,
            "stage": "searching",
            "messages": [{"role": "orchestrator", "content": response.content}]
        }

    elif stage == "reviewing":
        # Review final report
        return {"stage": "complete"}

def search_node(state: ResearchState) -> dict:
    """Search agent gathers information"""
    plan = state["research_plan"]

    response = llm.invoke([
        {"role": "system", "content": SEARCH_AGENT_PROMPT},
        {"role": "user", "content": f"""
Research plan: {json.dumps(plan)}

Gather information on this topic using available tools.
"""}
    ])

    findings = json.loads(response.content)
    return {
        "raw_findings": findings,
        "stage": "analyzing",
        "messages": [{"role": "search_agent", "content": response.content}]
    }

def analyst_node(state: ResearchState) -> dict:
    """Analyst processes findings"""
    findings = state["raw_findings"]

    response = llm.invoke([
        {"role": "system", "content": ANALYST_AGENT_PROMPT},
        {"role": "user", "content": f"""
Raw research findings:
{json.dumps(findings, indent=2)}

Analyze this data and extract insights.
"""}
    ])

    analysis = json.loads(response.content)
    return {
        "analysis": analysis,
        "stage": "writing",
        "messages": [{"role": "analyst", "content": response.content}]
    }

def writer_node(state: ResearchState) -> dict:
    """Writer creates final report"""
    query = state["query"]
    findings = state["raw_findings"]
    analysis = state["analysis"]

    response = llm.invoke([
        {"role": "system", "content": WRITER_AGENT_PROMPT},
        {"role": "user", "content": f"""
Original Query: {query}

Research Findings:
{json.dumps(findings, indent=2)}

Analysis:
{json.dumps(analysis, indent=2)}

Create a comprehensive research report.
"""}
    ])

    return {
        "report": response.content,
        "stage": "reviewing",
        "messages": [{"role": "writer", "content": response.content}]
    }

# Router
def route_stage(state: ResearchState) -> str:
    stage = state.get("stage", "planning")

    if stage == "planning":
        return "orchestrator"
    elif stage == "searching":
        return "search"
    elif stage == "analyzing":
        return "analyst"
    elif stage == "writing":
        return "writer"
    elif stage == "reviewing":
        return "orchestrator"
    else:
        return END

# Build Graph
workflow = StateGraph(ResearchState)

workflow.add_node("orchestrator", orchestrator_node)
workflow.add_node("search", search_node)
workflow.add_node("analyst", analyst_node)
workflow.add_node("writer", writer_node)

workflow.set_entry_point("orchestrator")
workflow.add_conditional_edges("orchestrator", route_stage)
workflow.add_edge("search", "analyst")
workflow.add_edge("analyst", "writer")
workflow.add_edge("writer", "orchestrator")

research_agent = workflow.compile()
```

### Usage

```python
# main.py

async def run_research(query: str) -> str:
    """Run research agent on a query"""
    initial_state = {
        "query": query,
        "messages": [],
        "research_plan": {},
        "raw_findings": {},
        "analysis": {},
        "report": "",
        "stage": "planning"
    }

    result = await research_agent.ainvoke(initial_state)
    return result["report"]

# Example
if __name__ == "__main__":
    import asyncio

    query = "What are the latest developments in AI agents and their applications in enterprise?"
    report = asyncio.run(run_research(query))
    print(report)
```

## Output Example

```markdown
# AI Agents in Enterprise: Research Report

## Executive Summary
- AI agents are rapidly transforming enterprise operations
- Key applications include customer service, data analysis, and automation
- Market expected to grow 40% annually through 2028
- Challenges include security, reliability, and integration

## Introduction
This report examines the current state and future trajectory of AI agents
in enterprise environments...

## Key Findings

### 1. Market Growth
The enterprise AI agent market is projected to reach $X billion by 2028...

### 2. Primary Use Cases
- **Customer Service**: 45% of enterprises use AI agents for support
- **Data Analysis**: Automated insights generation
- **Process Automation**: Workflow orchestration

### 3. Technology Landscape
Major frameworks include LangChain, AutoGen, and CrewAI...

## Analysis

### Trends
1. Shift toward multi-agent architectures
2. Integration with existing enterprise systems
3. Focus on reliability and observability

### Challenges
- Security and data privacy concerns
- Integration complexity
- Skills gap in organizations

## Recommendations
1. Start with well-defined, narrow use cases
2. Implement robust monitoring and evaluation
3. Invest in training and change management
4. Choose frameworks aligned with existing tech stack

## Conclusion
AI agents represent a significant opportunity for enterprise transformation...

## Sources
- [Source 1]
- [Source 2]
- [Source 3]
```

## Customization Points

| Component | Customization Option |
|-----------|---------------------|
| Search Agent | Add specialized search tools |
| Analyst Agent | Change analysis frameworks |
| Writer Agent | Modify report templates |
| Orchestrator | Adjust workflow logic |
| Tools | Integrate with internal systems |
