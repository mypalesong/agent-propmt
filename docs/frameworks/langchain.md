---
sidebar_position: 1
---

# LangChain

LangChain을 활용한 멀티 에이전트 프롬프트 설계입니다.

## Overview

LangChain은 LLM 애플리케이션 개발을 위한 프레임워크로, 에이전트 구축에 강력한 도구를 제공합니다.

```bash
pip install langchain langchain-openai langgraph
```

## Agent Prompt Structure

### Basic Agent with LangChain

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# System prompt template
AGENT_PROMPT = """You are a helpful research assistant.

## Your Capabilities
- Search the web for information
- Read and analyze documents
- Summarize findings

## Guidelines
- Always cite your sources
- Be concise but thorough
- Ask for clarification if needed

## Output Format
Provide structured responses with clear sections.
"""

# Create prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", AGENT_PROMPT),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Create agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = create_openai_tools_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run
result = executor.invoke({"input": "Research AI trends in 2024"})
```

### Structured Output Agent

```python
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List

class ResearchResult(BaseModel):
    summary: str = Field(description="Executive summary")
    findings: List[str] = Field(description="Key findings")
    sources: List[str] = Field(description="Source URLs")
    confidence: float = Field(description="Confidence score 0-1")

parser = PydanticOutputParser(pydantic_object=ResearchResult)

STRUCTURED_PROMPT = """You are a research assistant.

{format_instructions}

Research the given topic and provide structured output.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", STRUCTURED_PROMPT),
    ("human", "{input}"),
]).partial(format_instructions=parser.get_format_instructions())
```

## Custom Tools

### Defining Tools

```python
from langchain.tools import tool
from typing import Optional

@tool
def search_web(query: str, num_results: int = 5) -> str:
    """
    Search the web for information.

    Args:
        query: The search query
        num_results: Number of results to return

    Returns:
        Search results as formatted text
    """
    # Implementation
    results = web_search_api(query, num_results)
    return format_results(results)

@tool
def read_document(url: str) -> str:
    """
    Read and extract content from a document URL.

    Args:
        url: URL of the document to read

    Returns:
        Extracted document content
    """
    content = fetch_and_parse(url)
    return content

# Create tools list
tools = [search_web, read_document]
```

### Tool with Schema

```python
from langchain.tools import StructuredTool
from pydantic import BaseModel

class AnalysisInput(BaseModel):
    data: str
    analysis_type: str
    options: Optional[dict] = None

def analyze_data(data: str, analysis_type: str, options: dict = None) -> str:
    """Perform data analysis"""
    # Implementation
    pass

analysis_tool = StructuredTool.from_function(
    func=analyze_data,
    name="analyze_data",
    description="Analyze data with specified method",
    args_schema=AnalysisInput
)
```

## Multi-Agent with LangGraph

### State Graph Agent

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    current_agent: str
    task_complete: bool

# Agent nodes
def researcher_node(state: AgentState) -> dict:
    messages = state["messages"]
    last_message = messages[-1]["content"]

    response = researcher_llm.invoke([
        {"role": "system", "content": RESEARCHER_PROMPT},
        {"role": "user", "content": last_message}
    ])

    return {
        "messages": [{"role": "assistant", "content": response.content}],
        "current_agent": "researcher"
    }

def writer_node(state: AgentState) -> dict:
    messages = state["messages"]
    context = "\n".join([m["content"] for m in messages])

    response = writer_llm.invoke([
        {"role": "system", "content": WRITER_PROMPT},
        {"role": "user", "content": f"Based on this research:\n{context}\n\nWrite the article."}
    ])

    return {
        "messages": [{"role": "assistant", "content": response.content}],
        "current_agent": "writer",
        "task_complete": True
    }

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("researcher", researcher_node)
workflow.add_node("writer", writer_node)

workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", END)

app = workflow.compile()

# Run
result = app.invoke({
    "messages": [{"role": "user", "content": "Write about AI trends"}],
    "current_agent": "",
    "task_complete": False
})
```

### Conditional Routing

```python
def route_agent(state: AgentState) -> str:
    """Determine next agent based on state"""
    last_message = state["messages"][-1]["content"]

    if "need more research" in last_message.lower():
        return "researcher"
    elif "ready to write" in last_message.lower():
        return "writer"
    elif state["task_complete"]:
        return END
    else:
        return "supervisor"

workflow.add_conditional_edges(
    "supervisor",
    route_agent,
    {
        "researcher": "researcher",
        "writer": "writer",
        END: END
    }
)
```

## Memory Management

### Conversation Memory

```python
from langchain.memory import ConversationBufferWindowMemory
from langchain.memory import ConversationSummaryMemory

# Window memory - keeps last K messages
window_memory = ConversationBufferWindowMemory(
    k=10,
    return_messages=True
)

# Summary memory - summarizes older messages
summary_memory = ConversationSummaryMemory(
    llm=llm,
    return_messages=True
)

# In agent prompt
MEMORY_PROMPT = """
## Conversation History
{chat_history}

## Current Task
{input}
"""
```

### Vector Store Memory

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(
    collection_name="agent_memory",
    embedding_function=embeddings
)

# Retriever for context
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5}
)

# RAG prompt
RAG_PROMPT = """
Use the following context to answer the question.

## Retrieved Context
{context}

## Question
{question}

Answer based on the context provided.
"""
```

## Chains and LCEL

### LangChain Expression Language

```python
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser

# Research chain
research_chain = (
    {"input": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(RESEARCHER_PROMPT + "\n\n{input}")
    | llm
    | StrOutputParser()
)

# Writing chain
writing_chain = (
    {"research": research_chain, "input": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(
        WRITER_PROMPT + "\n\nResearch:\n{research}\n\nTopic: {input}"
    )
    | llm
    | StrOutputParser()
)

# Execute
result = writing_chain.invoke("AI trends in 2024")
```

### Parallel Execution

```python
from langchain_core.runnables import RunnableParallel

# Parallel research from different angles
parallel_research = RunnableParallel(
    technical=ChatPromptTemplate.from_template(
        TECHNICAL_RESEARCHER + "\n\n{input}"
    ) | llm | StrOutputParser(),

    business=ChatPromptTemplate.from_template(
        BUSINESS_RESEARCHER + "\n\n{input}"
    ) | llm | StrOutputParser(),

    social=ChatPromptTemplate.from_template(
        SOCIAL_RESEARCHER + "\n\n{input}"
    ) | llm | StrOutputParser()
)

# Combine results
synthesis_chain = (
    parallel_research
    | RunnableLambda(lambda x: f"""
        Technical: {x['technical']}
        Business: {x['business']}
        Social: {x['social']}
    """)
    | ChatPromptTemplate.from_template(
        SYNTHESIS_PROMPT + "\n\n{input}"
    )
    | llm
    | StrOutputParser()
)
```

## Best Practices

### Prompt Templates

```python
# Use templates for consistency
from langchain.prompts import PromptTemplate

AGENT_TEMPLATE = PromptTemplate(
    input_variables=["role", "goal", "tools", "constraints"],
    template="""
# Role
{role}

# Goal
{goal}

# Available Tools
{tools}

# Constraints
{constraints}

# Instructions
Complete the task using available tools.
"""
)

# Generate prompt
prompt = AGENT_TEMPLATE.format(
    role="Research Analyst",
    goal="Find accurate information on the given topic",
    tools="search_web, read_document, analyze_data",
    constraints="Only use verified sources, cite all claims"
)
```

### Error Handling

```python
from langchain.callbacks import get_openai_callback
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
def run_agent_with_retry(executor, input_data):
    with get_openai_callback() as cb:
        try:
            result = executor.invoke(input_data)
            print(f"Tokens used: {cb.total_tokens}")
            return result
        except Exception as e:
            print(f"Error: {e}")
            raise
```

## Resources

- [LangChain Documentation](https://python.langchain.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Hub](https://smith.langchain.com/hub)
