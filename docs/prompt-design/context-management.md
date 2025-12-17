---
sidebar_position: 4
---

# Context Management

멀티 에이전트 시스템에서 컨텍스트를 효과적으로 관리합니다.

## Context Types

```
┌─────────────────────────────────────────────────────────────┐
│                     Context Types                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Static    │  │  Dynamic    │  │   Shared    │         │
│  │  Context    │  │  Context    │  │  Context    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│        │                │                │                  │
│   System Info       User Session     Inter-Agent           │
│   Config Data       Conversation     Communication         │
│   Base Knowledge    Task Progress    Shared Memory         │
└─────────────────────────────────────────────────────────────┘
```

## Context Hierarchy

### 1. System Context (Static)

```python
SYSTEM_CONTEXT = """
## System Information
- Platform: Multi-Agent Orchestration System v2.0
- Environment: {environment}  # production/staging/dev
- Region: {region}
- Timestamp: {timestamp}

## System Capabilities
- Max context window: 128K tokens
- Available tools: {tool_list}
- Rate limits: {rate_limits}

## Global Configuration
- Language: {language}
- Response format: {format}
- Verbosity level: {verbosity}
"""
```

### 2. Session Context (Dynamic)

```python
SESSION_CONTEXT = """
## Session Information
- Session ID: {session_id}
- User ID: {user_id}
- Started: {start_time}
- Duration: {duration}

## User Preferences
- Expertise level: {expertise_level}
- Preferred language: {language}
- Output format: {format}

## Conversation History
{conversation_summary}

## Current Task
- Task ID: {task_id}
- Description: {task_description}
- Progress: {progress}%
"""
```

### 3. Task Context (Per-Request)

```python
TASK_CONTEXT = """
## Current Task
{task_description}

## Input Data
{input_data}

## Expected Output
{expected_output}

## Constraints
- Time limit: {time_limit}
- Max tokens: {max_tokens}
- Required accuracy: {accuracy_threshold}

## Dependencies
- Previous tasks: {completed_tasks}
- Blocked by: {blocking_tasks}
"""
```

## Context Window Management

### Token Budgeting

```python
class ContextManager:
    def __init__(self, max_tokens: int = 128000):
        self.max_tokens = max_tokens
        self.reserved_output = 4000  # Reserve for response

    def allocate_budget(self) -> dict:
        available = self.max_tokens - self.reserved_output

        return {
            "system_prompt": int(available * 0.15),   # 15%
            "role_context": int(available * 0.10),   # 10%
            "task_context": int(available * 0.25),   # 25%
            "history": int(available * 0.30),        # 30%
            "retrieved_docs": int(available * 0.15), # 15%
            "buffer": int(available * 0.05)          # 5% buffer
        }

    def count_tokens(self, text: str) -> int:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))

    def fit_to_budget(self, content: str, budget: int) -> str:
        tokens = self.count_tokens(content)
        if tokens <= budget:
            return content

        # Truncate with summarization
        return self.summarize_to_fit(content, budget)
```

### Sliding Window

```python
class ConversationBuffer:
    def __init__(self, max_messages: int = 20):
        self.messages = []
        self.max_messages = max_messages

    def add(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now()
        })
        self._trim()

    def _trim(self):
        if len(self.messages) > self.max_messages:
            # Keep system message and recent messages
            system_msgs = [m for m in self.messages if m["role"] == "system"]
            recent_msgs = self.messages[-self.max_messages+len(system_msgs):]
            self.messages = system_msgs + recent_msgs

    def get_context(self) -> list:
        return [{"role": m["role"], "content": m["content"]}
                for m in self.messages]
```

## Inter-Agent Context Sharing

### Message Passing

```python
class AgentMessage:
    def __init__(self, sender: str, content: str, metadata: dict = None):
        self.id = str(uuid4())
        self.sender = sender
        self.content = content
        self.metadata = metadata or {}
        self.timestamp = datetime.now()

    def to_context_string(self) -> str:
        return f"""
## Message from {self.sender}
**Time**: {self.timestamp.isoformat()}
**Content**: {self.content}
"""

class ContextBus:
    def __init__(self):
        self.messages = defaultdict(list)

    def send(self, sender: str, receiver: str, message: AgentMessage):
        self.messages[receiver].append(message)

    def receive(self, agent_id: str) -> list[AgentMessage]:
        messages = self.messages[agent_id]
        self.messages[agent_id] = []  # Clear after reading
        return messages

    def broadcast(self, sender: str, message: AgentMessage):
        for agent_id in self.agents:
            if agent_id != sender:
                self.send(sender, agent_id, message)
```

### Shared Memory

```python
class SharedMemory:
    def __init__(self):
        self.store = {}
        self.locks = {}

    async def write(self, key: str, value: Any, ttl: int = None):
        """Write to shared memory with optional TTL"""
        self.store[key] = {
            "value": value,
            "timestamp": datetime.now(),
            "ttl": ttl
        }

    async def read(self, key: str) -> Any:
        """Read from shared memory"""
        if key not in self.store:
            return None

        entry = self.store[key]

        # Check TTL
        if entry["ttl"]:
            age = (datetime.now() - entry["timestamp"]).seconds
            if age > entry["ttl"]:
                del self.store[key]
                return None

        return entry["value"]

    def get_context_snapshot(self) -> str:
        """Get shared memory as context string"""
        context = "## Shared Memory State\n"
        for key, entry in self.store.items():
            context += f"- **{key}**: {entry['value']}\n"
        return context
```

## RAG Integration

### Document Context

```python
class RAGContext:
    def __init__(self, vector_store):
        self.vector_store = vector_store

    async def retrieve(self, query: str, k: int = 5) -> str:
        """Retrieve relevant documents for context"""
        docs = await self.vector_store.similarity_search(query, k=k)

        context = "## Relevant Documents\n\n"
        for i, doc in enumerate(docs, 1):
            context += f"""
### Document {i}
**Source**: {doc.metadata.get('source', 'Unknown')}
**Relevance**: {doc.score:.2f}

{doc.content[:1000]}...
---
"""
        return context

    def format_for_prompt(self, docs: list) -> str:
        """Format retrieved docs for prompt injection"""
        return f"""
Use the following retrieved documents to answer the question.
If the documents don't contain relevant information, say so.

{self._format_docs(docs)}

Based on the above documents, please answer:
"""
```

## Context Compression

### Summarization Strategy

```python
class ContextCompressor:
    def __init__(self, llm):
        self.llm = llm

    async def compress(self, context: str, max_tokens: int) -> str:
        """Compress context while preserving key information"""
        prompt = f"""
Summarize the following context, preserving:
- Key facts and data
- Important decisions
- Action items
- Critical constraints

Keep the summary under {max_tokens} tokens.

Context:
{context}

Summary:
"""
        return await self.llm.complete(prompt)

    async def progressive_compress(self, contexts: list[str]) -> str:
        """Progressively compress multiple context chunks"""
        if len(contexts) == 1:
            return contexts[0]

        # Compress pairs until single context remains
        while len(contexts) > 1:
            new_contexts = []
            for i in range(0, len(contexts), 2):
                if i + 1 < len(contexts):
                    combined = contexts[i] + "\n" + contexts[i+1]
                    compressed = await self.compress(combined, max_tokens=500)
                    new_contexts.append(compressed)
                else:
                    new_contexts.append(contexts[i])
            contexts = new_contexts

        return contexts[0]
```

## Best Practices

### Context Ordering

```python
def build_optimal_context(components: dict) -> str:
    """Build context with optimal ordering for attention"""
    # Important info at beginning and end (primacy/recency effect)
    order = [
        "system_prompt",      # Beginning - always seen
        "role_context",
        "constraints",        # Important limitations
        "retrieved_docs",     # RAG context
        "conversation_history",
        "task_context",       # End - most recent
        "current_question"    # Final prompt
    ]

    context_parts = []
    for key in order:
        if key in components and components[key]:
            context_parts.append(components[key])

    return "\n\n---\n\n".join(context_parts)
```

### Context Validation

```python
def validate_context(context: str, max_tokens: int) -> dict:
    """Validate context before sending to LLM"""
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")

    tokens = len(enc.encode(context))

    return {
        "valid": tokens <= max_tokens,
        "token_count": tokens,
        "max_tokens": max_tokens,
        "utilization": f"{tokens/max_tokens*100:.1f}%",
        "recommendation": (
            "OK" if tokens <= max_tokens * 0.9
            else "Consider compression" if tokens <= max_tokens
            else "Must compress"
        )
    }
```
