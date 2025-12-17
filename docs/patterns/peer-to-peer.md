---
sidebar_position: 4
---

# Peer-to-Peer Pattern

동등한 에이전트들이 직접 협력하는 패턴입니다.

![Peer-to-Peer Collaboration](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop&q=80)

## Pattern Overview

```mermaid
flowchart TB
    subgraph Network["🌐 Peer Network"]
        A["🤖 Agent A"] <--> B["🤖 Agent B"]
        B <--> C["🤖 Agent C"]
        C <--> A

        MB["📫 Shared Message Bus"]
    end

    A & B & C <--> MB

    style A fill:#3498db,stroke:#fff,color:#fff
    style B fill:#27ae60,stroke:#fff,color:#fff
    style C fill:#9b59b6,stroke:#fff,color:#fff
    style MB fill:#f39c12,stroke:#fff,color:#fff
```

## When to Use

```mermaid
mindmap
  root((Peer-to-Peer<br/>Pattern))
    Expert Discussion
      Multiple perspectives
      Debate & challenge
      Consensus building
    No Hierarchy
      Equal authority
      Democratic decisions
      Collaborative
    Dynamic Collaboration
      Flexible roles
      Ad-hoc teams
      Real-time adaptation
```

- 전문가 간 토론/논쟁이 필요할 때
- 합의 기반 의사결정이 필요할 때
- 계층 구조가 적합하지 않을 때
- 동적 협업이 필요할 때

## Technical Review Panel Example

```mermaid
flowchart TB
    subgraph Panel["🔍 Technical Review Panel"]
        SE["🔒 Security<br/>Expert"]
        PE["⚡ Performance<br/>Expert"]
        ME["🔧 Maintainability<br/>Expert"]
    end

    Code["📝 Code to Review"] --> Panel
    SE <--> PE
    PE <--> ME
    ME <--> SE
    Panel --> Decision["📋 Consolidated Review"]

    style SE fill:#e74c3c,stroke:#fff,color:#fff
    style PE fill:#3498db,stroke:#fff,color:#fff
    style ME fill:#27ae60,stroke:#fff,color:#fff
```

## Research Debate Panel

```mermaid
flowchart LR
    subgraph Debate["💬 Research Debate"]
        O["🌟 Optimist<br/>Researcher"]
        P["⚠️ Pessimist<br/>Researcher"]
        M["⚖️ Moderator<br/>Researcher"]
    end

    Topic["📋 Topic"] --> Debate
    O <--> P
    M --> O & P
    Debate --> Conclusion["📝 Balanced Conclusion"]

    style O fill:#27ae60,stroke:#fff,color:#fff
    style P fill:#e74c3c,stroke:#fff,color:#fff
    style M fill:#3498db,stroke:#fff,color:#fff
```

## Peer Agent Prompt Template

```python
PEER_AGENT_TEMPLATE = """
# Identity

You are {agent_name}, a peer agent in a collaborative team.

## Your Expertise
{expertise_description}

## Your Peers
{peer_descriptions}

## Collaboration Protocol

### Communication
- Address peers by name
- Share your perspective clearly
- Ask clarifying questions
- Acknowledge valid points from others

### Discussion
- Present your analysis based on your expertise
- Challenge ideas constructively
- Build on others' contributions
- Propose compromises when disagreements arise

### Consensus Building
- Look for common ground
- Identify areas of agreement
- Propose solutions that address concerns
- Vote on final decisions when needed

## Discussion Stages

1. **Opening**: Each peer presents initial analysis
2. **Discussion**: Peers exchange views and challenge ideas
3. **Synthesis**: Peers work toward common understanding
4. **Resolution**: Reach consensus or vote

Always be respectful and constructive.
"""
```

## Implementation

### AutoGen Group Chat

```mermaid
sequenceDiagram
    participant SE as Security Expert
    participant PE as Performance Expert
    participant ME as Maintainability Expert

    Note over SE,ME: Code Review Discussion

    SE->>PE: I found SQL injection risk
    PE->>SE: How does the fix affect query performance?
    SE->>ME: Here's my suggested fix
    ME->>SE: Let me check if it follows our patterns
    ME->>PE: The fix is clean, minimal impact
    PE->>SE: Agree, performance hit is acceptable
    SE->>ME: Let's finalize the review
```

```python
from autogen import AssistantAgent, GroupChat, GroupChatManager

# Create peer agents
security_expert = AssistantAgent(
    name="SecurityExpert",
    system_message=SECURITY_EXPERT,
    llm_config=llm_config
)

performance_expert = AssistantAgent(
    name="PerformanceExpert",
    system_message=PERFORMANCE_EXPERT,
    llm_config=llm_config
)

maintainability_expert = AssistantAgent(
    name="MaintainabilityExpert",
    system_message=MAINTAINABILITY_EXPERT,
    llm_config=llm_config
)

# Create group chat
group_chat = GroupChat(
    agents=[security_expert, performance_expert, maintainability_expert],
    messages=[],
    max_round=15,
    speaker_selection_method="round_robin"  # Equal speaking time
)

manager = GroupChatManager(
    groupchat=group_chat,
    llm_config=llm_config
)

# Start discussion
security_expert.initiate_chat(
    manager,
    message="""
    Let's review this code change:

    ```python
    def get_user(user_id: str):
        query = f"SELECT * FROM users WHERE id = '{user_id}'"
        return db.execute(query)
    ```

    Each expert, please provide your perspective.
    """
)
```

### Message Bus Implementation

```mermaid
flowchart TB
    subgraph Agents["Peer Agents"]
        A["Agent A"]
        B["Agent B"]
        C["Agent C"]
    end

    subgraph Bus["📫 Message Bus"]
        Q["Queue"]
        H["History"]
    end

    A --> |send| Q
    B --> |send| Q
    C --> |send| Q

    Q --> |receive| A & B & C
    Q --> |log| H

    style Q fill:#f39c12,stroke:#fff,color:#fff
```

```python
from dataclasses import dataclass
from typing import List, Optional
from queue import Queue
import threading

@dataclass
class PeerMessage:
    id: str
    sender: str
    recipient: str  # "all" for broadcast
    message_type: str
    content: str
    references: List[str] = None
    timestamp: float = None

class MessageBus:
    def __init__(self):
        self.queues: dict[str, Queue] = {}
        self.history: List[PeerMessage] = []
        self.lock = threading.Lock()

    def register(self, agent_id: str):
        self.queues[agent_id] = Queue()

    def send(self, message: PeerMessage):
        with self.lock:
            message.id = str(uuid4())
            message.timestamp = time.time()
            self.history.append(message)

            if message.recipient == "all":
                for agent_id, queue in self.queues.items():
                    if agent_id != message.sender:
                        queue.put(message)
            else:
                if message.recipient in self.queues:
                    self.queues[message.recipient].put(message)

    def get_context(self, limit: int = 10) -> str:
        """Get recent messages as context"""
        recent = self.history[-limit:]
        context = "## Recent Discussion\n\n"
        for msg in recent:
            context += f"**{msg.sender}** → {msg.recipient}: {msg.content}\n\n"
        return context
```

## Consensus Mechanisms

### Voting System

```mermaid
flowchart TB
    subgraph Voting["🗳️ Voting Process"]
        V1["Agent A: Option 1"]
        V2["Agent B: Option 2"]
        V3["Agent C: Option 1"]
    end

    Voting --> Tally["📊 Tally"]
    Tally --> Result{"Result"}

    Result -->|Majority| Winner["✅ Option 1 Wins"]
    Result -->|Tie| Discussion["💬 More Discussion"]

    style Winner fill:#27ae60,stroke:#fff,color:#fff
    style Discussion fill:#f39c12,stroke:#fff,color:#fff
```

```python
class VotingSystem:
    def __init__(self, agents: List[str]):
        self.agents = agents
        self.votes = {}

    def cast_vote(self, agent: str, option: str):
        self.votes[agent] = option

    def tally(self) -> dict:
        results = {}
        for vote in self.votes.values():
            results[vote] = results.get(vote, 0) + 1
        return results

    def get_winner(self) -> Optional[str]:
        results = self.tally()
        if not results:
            return None

        max_votes = max(results.values())
        winners = [k for k, v in results.items() if v == max_votes]

        if len(winners) == 1:
            return winners[0]
        return None  # Tie

    def has_consensus(self, threshold: float = 0.66) -> bool:
        results = self.tally()
        total = len(self.votes)
        if total == 0:
            return False

        max_votes = max(results.values())
        return (max_votes / total) >= threshold
```

### Consensus Builder

```mermaid
flowchart TB
    Discussion["💬 Discussion"] --> Identify["🔍 Identify"]

    subgraph Identify["Identify Areas"]
        Agree["✅ Agreements"]
        Disagree["❌ Disagreements"]
    end

    Identify --> Compromise["🤝 Propose Compromise"]
    Compromise --> Final["📋 Final Recommendation"]

    style Agree fill:#27ae60,stroke:#fff,color:#fff
    style Disagree fill:#e74c3c,stroke:#fff,color:#fff
    style Compromise fill:#f39c12,stroke:#fff,color:#fff
```

## Use Cases

### Code Review Panel

```mermaid
flowchart LR
    subgraph Review["Code Review"]
        SE["🔒 Security"] <--> PE["⚡ Performance"]
        PE <--> ME["🔧 Maintainability"]
        ME <--> SE
    end

    PR["Pull Request"] --> Review
    Review --> Decision["Approve / Request Changes"]
```

### Investment Committee

```mermaid
flowchart LR
    subgraph Committee["Investment Committee"]
        Bull["📈 Bull Analyst"] <--> Bear["📉 Bear Analyst"]
        Bull <--> RM["⚖️ Risk Manager"]
        Bear <--> RM
    end

    Opportunity["Investment Opportunity"] --> Committee
    Committee --> Decision["Invest / Pass"]
```

### Design Review

```mermaid
flowchart LR
    subgraph Review["Design Review"]
        UX["👤 UX Expert"] <--> TA["🏗️ Tech Architect"]
        TA <--> BA["💼 Business Analyst"]
        BA <--> UX
    end

    Design["Feature Design"] --> Review
    Review --> Approval["Optimal Design"]
```
