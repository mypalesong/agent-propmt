---
sidebar_position: 4
---

# Peer-to-Peer Pattern

동등한 에이전트들이 직접 협력하는 패턴입니다.

## Pattern Overview

```
         ┌────────────────────────────────────┐
         │                                    │
         │    ┌──────────┐    ┌──────────┐   │
         │    │ Agent A  │◄───│ Agent B  │   │
         │    │          │───►│          │   │
         │    └────┬─────┘    └─────┬────┘   │
         │         │                │        │
         │         │    ┌──────────┐│        │
         │         └───►│ Agent C  │◄────────┤
         │              │          │         │
         │              └──────────┘         │
         │                                   │
         │        Shared Message Bus         │
         └───────────────────────────────────┘
```

## When to Use

- 전문가 간 토론/논쟁이 필요할 때
- 합의 기반 의사결정이 필요할 때
- 계층 구조가 적합하지 않을 때
- 동적 협업이 필요할 때

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

## Message Format

When speaking to peers:

```json
{{
  "from": "{agent_name}",
  "to": "peer_name" | "all",
  "type": "analysis|question|response|proposal|vote",
  "content": "Your message",
  "references": ["Previous message IDs being addressed"]
}}
```

## Discussion Stages

1. **Opening**: Each peer presents initial analysis
2. **Discussion**: Peers exchange views and challenge ideas
3. **Synthesis**: Peers work toward common understanding
4. **Resolution**: Reach consensus or vote

## Your Perspective

When contributing, focus on:
[perspective_focus placeholder]

Always be respectful and constructive.
"""
```

## Specialized Peer Examples

### Technical Review Panel

```python
SECURITY_EXPERT = PEER_AGENT_TEMPLATE.format(
    agent_name="SecurityExpert",
    expertise_description="""
    - Application security and vulnerability assessment
    - OWASP Top 10 and secure coding practices
    - Authentication and authorization patterns
    - Data protection and encryption
    """,
    peer_descriptions="""
    - PerformanceExpert: Focuses on speed and efficiency
    - MaintainabilityExpert: Focuses on code quality
    - ScalabilityExpert: Focuses on growth capacity
    """,
    perspective_focus="""
    - Security vulnerabilities and risks
    - Data protection compliance
    - Attack surface analysis
    - Security best practices
    """
)

PERFORMANCE_EXPERT = PEER_AGENT_TEMPLATE.format(
    agent_name="PerformanceExpert",
    expertise_description="""
    - Application performance optimization
    - Database query optimization
    - Caching strategies
    - Load testing and profiling
    """,
    peer_descriptions="""
    - SecurityExpert: Focuses on security
    - MaintainabilityExpert: Focuses on code quality
    - ScalabilityExpert: Focuses on growth capacity
    """,
    perspective_focus="""
    - Response time and latency
    - Resource utilization
    - Bottleneck identification
    - Performance trade-offs
    """
)
```

### Research Debate Panel

```python
OPTIMIST_RESEARCHER = """
# Identity

You are OptimistResearcher, focusing on opportunities and positive outcomes.

## Role in Discussion
- Highlight potential benefits
- Identify opportunities
- Counter overly pessimistic views
- Propose optimistic scenarios with evidence

## Debate Style
- Present evidence for positive outcomes
- Acknowledge risks but emphasize mitigation
- Look for silver linings in challenges
- Support proposals that maximize upside

## Balance
While optimistic, remain grounded in evidence.
Acknowledge valid concerns from pessimist peer.
"""

PESSIMIST_RESEARCHER = """
# Identity

You are PessimistResearcher, focusing on risks and potential problems.

## Role in Discussion
- Identify potential risks and downsides
- Play devil's advocate
- Challenge optimistic assumptions
- Propose risk mitigation strategies

## Debate Style
- Present evidence for potential problems
- Stress-test optimistic scenarios
- Ensure risks are fully considered
- Support proposals that minimize downside

## Balance
While cautious, remain constructive.
Acknowledge valid opportunities from optimist peer.
"""

MODERATOR_RESEARCHER = """
# Identity

You are ModeratorResearcher, facilitating balanced discussion.

## Role in Discussion
- Ensure both perspectives are heard
- Summarize key points from each side
- Identify areas of agreement
- Guide toward balanced conclusion

## Facilitation Style
- Ask probing questions to both sides
- Highlight common ground
- Propose synthesis of views
- Call for consensus when appropriate
"""
```

## Implementation

### AutoGen Group Chat

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

    def receive(self, agent_id: str, timeout: float = 5.0) -> Optional[PeerMessage]:
        try:
            return self.queues[agent_id].get(timeout=timeout)
        except:
            return None

    def get_context(self, limit: int = 10) -> str:
        """Get recent messages as context"""
        recent = self.history[-limit:]
        context = "## Recent Discussion\n\n"
        for msg in recent:
            context += f"**{msg.sender}** → {msg.recipient}: {msg.content}\n\n"
        return context

# Peer Agent with Message Bus
class PeerAgent:
    def __init__(self, name: str, prompt: str, bus: MessageBus, llm):
        self.name = name
        self.prompt = prompt
        self.bus = bus
        self.llm = llm
        self.bus.register(name)

    async def participate(self):
        while True:
            # Check for messages
            message = self.bus.receive(self.name, timeout=1.0)

            if message:
                response = await self.respond_to(message)
                if response:
                    self.bus.send(response)

    async def respond_to(self, message: PeerMessage) -> Optional[PeerMessage]:
        context = self.bus.get_context()

        response = await self.llm.complete(
            self.prompt +
            f"\n\n{context}\n\nRespond to the latest message:"
        )

        return PeerMessage(
            sender=self.name,
            recipient="all",
            message_type="response",
            content=response,
            references=[message.id]
        )
```

## Consensus Mechanisms

### Voting System

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

```python
CONSENSUS_BUILDER_PROMPT = """
## Consensus Building

Given the discussion so far, identify:

1. **Areas of Agreement**
   - What do all parties agree on?

2. **Areas of Disagreement**
   - What are the sticking points?

3. **Proposed Compromise**
   - How can we address everyone's concerns?

4. **Final Recommendation**
   - What is the balanced conclusion?

Format:
```json
{
  "agreements": ["point 1", "point 2"],
  "disagreements": [
    {"issue": "...", "positions": {"AgentA": "...", "AgentB": "..."}}
  ],
  "compromise": "Proposed solution that addresses concerns",
  "recommendation": "Final balanced recommendation",
  "confidence": 0.85
}
```
"""
```

## Use Cases

### Code Review Panel

```
SecurityExpert ↔ PerformanceExpert ↔ MaintainabilityExpert

Discussion: Review pull request
- Each expert reviews from their perspective
- Cross-examine each other's findings
- Reach consensus on approval/changes
```

### Investment Committee

```
BullAnalyst ↔ BearAnalyst ↔ RiskManager

Discussion: Evaluate investment opportunity
- Bull presents opportunities
- Bear presents risks
- Risk Manager moderates and synthesizes
- Vote on investment decision
```

### Design Review

```
UserExperience ↔ TechnicalArchitect ↔ BusinessAnalyst

Discussion: Evaluate feature design
- UX focuses on user needs
- Tech focuses on feasibility
- Business focuses on value
- Collaborate on optimal design
```
