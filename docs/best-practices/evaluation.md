---
sidebar_position: 3
---

# Evaluation

멀티 에이전트 시스템의 성능을 평가하는 방법입니다.

## Evaluation Framework

```
┌─────────────────────────────────────────────────────────────┐
│                   Evaluation Dimensions                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐            │
│   │ Accuracy  │   │ Efficiency│   │  Quality  │            │
│   │           │   │           │   │           │            │
│   │ - Correct │   │ - Tokens  │   │ - Format  │            │
│   │ - Complete│   │ - Latency │   │ - Clarity │            │
│   │ - Verified│   │ - Steps   │   │ - Useful  │            │
│   └───────────┘   └───────────┘   └───────────┘            │
│                                                              │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐            │
│   │ Robustness│   │Coordination│  │   Safety  │            │
│   │           │   │           │   │           │            │
│   │ - Errors  │   │ - Handoffs│   │ - No Harm │            │
│   │ - Edge    │   │ - Context │   │ - Guardrails│          │
│   │ - Recovery│   │ - Conflict│   │ - Privacy │            │
│   └───────────┘   └───────────┘   └───────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Metrics

### Accuracy Metrics

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class AccuracyResult:
    correct: bool
    score: float  # 0-1
    errors: List[str]

class AccuracyEvaluator:
    def evaluate_factual(
        self,
        response: str,
        ground_truth: str
    ) -> AccuracyResult:
        """Evaluate factual correctness"""
        # Extract claims from response
        claims = self.extract_claims(response)

        # Verify each claim
        correct = 0
        errors = []
        for claim in claims:
            if self.verify_claim(claim, ground_truth):
                correct += 1
            else:
                errors.append(f"Incorrect: {claim}")

        score = correct / len(claims) if claims else 0
        return AccuracyResult(
            correct=score > 0.9,
            score=score,
            errors=errors
        )

    def evaluate_completeness(
        self,
        response: str,
        requirements: List[str]
    ) -> AccuracyResult:
        """Evaluate if all requirements are met"""
        met = []
        missing = []

        for req in requirements:
            if self.requirement_satisfied(response, req):
                met.append(req)
            else:
                missing.append(req)

        score = len(met) / len(requirements)
        return AccuracyResult(
            correct=len(missing) == 0,
            score=score,
            errors=[f"Missing: {r}" for r in missing]
        )
```

### Efficiency Metrics

```python
@dataclass
class EfficiencyMetrics:
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    latency_ms: float
    agent_steps: int
    tool_calls: int

class EfficiencyEvaluator:
    def __init__(self, baselines: dict):
        self.baselines = baselines

    def evaluate(self, metrics: EfficiencyMetrics) -> dict:
        return {
            "token_efficiency": self._score_tokens(metrics.total_tokens),
            "latency_score": self._score_latency(metrics.latency_ms),
            "step_efficiency": self._score_steps(metrics.agent_steps),
            "overall": self._calculate_overall(metrics)
        }

    def _score_tokens(self, tokens: int) -> float:
        baseline = self.baselines.get("tokens", 1000)
        return min(1.0, baseline / tokens)

    def _score_latency(self, latency: float) -> float:
        baseline = self.baselines.get("latency_ms", 5000)
        return min(1.0, baseline / latency)

    def _score_steps(self, steps: int) -> float:
        baseline = self.baselines.get("steps", 3)
        return min(1.0, baseline / steps)
```

### Quality Metrics

```python
class QualityEvaluator:
    def __init__(self, llm):
        self.llm = llm

    async def evaluate_response_quality(
        self,
        response: str,
        task: str
    ) -> dict:
        """Use LLM to evaluate response quality"""
        evaluation_prompt = f"""
Evaluate this response on a scale of 1-5 for each criterion:

Task: {task}
Response: {response}

Criteria:
1. Relevance: Does it address the task?
2. Clarity: Is it clearly written?
3. Completeness: Does it fully answer?
4. Accuracy: Is the information correct?
5. Usefulness: Is it actionable/helpful?

Respond with JSON:
{{
  "relevance": {{"score": X, "reason": "..."}},
  "clarity": {{"score": X, "reason": "..."}},
  "completeness": {{"score": X, "reason": "..."}},
  "accuracy": {{"score": X, "reason": "..."}},
  "usefulness": {{"score": X, "reason": "..."}}
}}
"""
        result = await self.llm.invoke(evaluation_prompt)
        return json.loads(result.content)
```

## Test Suite

### Unit Tests for Prompts

```python
import pytest

class TestAgentPrompts:
    @pytest.fixture
    def researcher_agent(self):
        return Agent(role="Researcher", prompt=RESEARCHER_PROMPT)

    def test_follows_output_format(self, researcher_agent):
        """Agent should output in expected format"""
        result = researcher_agent.run("Research AI trends")

        # Check structure
        assert "summary" in result.lower()
        assert "sources" in result.lower()

    def test_uses_tools_when_needed(self, researcher_agent):
        """Agent should use search for current info"""
        with patch("search_tool") as mock_search:
            result = researcher_agent.run("What is today's stock price of AAPL?")
            assert mock_search.called

    def test_handles_ambiguous_input(self, researcher_agent):
        """Agent should ask for clarification"""
        result = researcher_agent.run("Tell me about it")
        assert any(word in result.lower() for word in
                   ["clarify", "which", "what do you mean"])
```

### Integration Tests

```python
class TestMultiAgentWorkflow:
    @pytest.fixture
    def crew(self):
        return Crew(
            agents=[researcher, analyst, writer],
            tasks=[research_task, analysis_task, writing_task]
        )

    async def test_end_to_end_workflow(self, crew):
        """Complete workflow should produce quality output"""
        result = await crew.kickoff({"topic": "AI Ethics"})

        # Check final output exists
        assert result is not None
        assert len(result) > 500

        # Check quality
        quality = await quality_evaluator.evaluate(result, "AI Ethics article")
        assert quality["overall_score"] >= 4.0

    async def test_handoff_context_preservation(self, crew):
        """Context should be preserved through handoffs"""
        with capture_trace() as trace:
            await crew.kickoff({"topic": "Quantum Computing"})

        # Verify context passed
        handoffs = [e for e in trace if e["type"] == "handoff"]
        for handoff in handoffs:
            assert "topic" in handoff["context"]
            assert handoff["context"]["topic"] == "Quantum Computing"

    async def test_error_recovery(self, crew):
        """System should recover from agent failures"""
        with patch("analyst.run", side_effect=Exception("API Error")):
            result = await crew.kickoff({"topic": "Climate Change"})

        # Should still produce output (with degraded quality)
        assert result is not None
```

### Benchmark Suite

```python
class AgentBenchmark:
    def __init__(self, test_cases: List[dict]):
        self.test_cases = test_cases
        self.results = []

    async def run_benchmark(self, agent) -> dict:
        for case in self.test_cases:
            start = time.time()

            result = await agent.run(case["input"])
            latency = time.time() - start

            accuracy = self.evaluate_accuracy(result, case["expected"])
            tokens = self.count_tokens(result)

            self.results.append({
                "case_id": case["id"],
                "accuracy": accuracy,
                "latency": latency,
                "tokens": tokens,
                "passed": accuracy >= case.get("min_accuracy", 0.8)
            })

        return self.summarize()

    def summarize(self) -> dict:
        return {
            "total_cases": len(self.results),
            "passed": sum(1 for r in self.results if r["passed"]),
            "avg_accuracy": sum(r["accuracy"] for r in self.results) / len(self.results),
            "avg_latency": sum(r["latency"] for r in self.results) / len(self.results),
            "total_tokens": sum(r["tokens"] for r in self.results)
        }

# Example test cases
BENCHMARK_CASES = [
    {
        "id": "research_1",
        "input": "Research the latest developments in quantum computing",
        "expected": ["quantum supremacy", "error correction", "IBM", "Google"],
        "min_accuracy": 0.8
    },
    {
        "id": "analysis_1",
        "input": "Analyze the competitive landscape of cloud providers",
        "expected": ["AWS", "Azure", "GCP", "market share"],
        "min_accuracy": 0.75
    }
]
```

## LLM-as-Judge

```python
class LLMJudge:
    def __init__(self, judge_llm):
        self.judge = judge_llm

    async def compare_responses(
        self,
        task: str,
        response_a: str,
        response_b: str
    ) -> dict:
        """Compare two responses using LLM"""
        prompt = f"""
Compare these two responses to the task.

Task: {task}

Response A:
{response_a}

Response B:
{response_b}

Evaluate on:
1. Accuracy (which is more correct?)
2. Completeness (which covers more?)
3. Clarity (which is clearer?)
4. Overall (which is better?)

For each, respond with "A", "B", or "TIE" and explain why.

JSON format:
{{
  "accuracy": {{"winner": "A/B/TIE", "reason": "..."}},
  "completeness": {{"winner": "A/B/TIE", "reason": "..."}},
  "clarity": {{"winner": "A/B/TIE", "reason": "..."}},
  "overall": {{"winner": "A/B/TIE", "reason": "..."}}
}}
"""
        result = await self.judge.invoke(prompt)
        return json.loads(result.content)

    async def evaluate_against_rubric(
        self,
        response: str,
        rubric: dict
    ) -> dict:
        """Evaluate response against detailed rubric"""
        prompt = f"""
Evaluate this response against the rubric.

Response:
{response}

Rubric:
{json.dumps(rubric, indent=2)}

Score each criterion and explain your reasoning.
"""
        result = await self.judge.invoke(prompt)
        return json.loads(result.content)
```

## Continuous Evaluation

```python
class ContinuousEvaluator:
    def __init__(self, agents: List, sample_rate: float = 0.1):
        self.agents = agents
        self.sample_rate = sample_rate
        self.metrics = defaultdict(list)

    async def evaluate_sample(self, interaction: dict):
        """Randomly sample and evaluate interactions"""
        if random.random() > self.sample_rate:
            return

        evaluation = await self.evaluate(interaction)
        self.metrics[interaction["agent"]].append(evaluation)

        # Alert on quality drop
        if self.detect_quality_drop(interaction["agent"]):
            await self.send_alert(interaction["agent"])

    def detect_quality_drop(self, agent: str) -> bool:
        """Detect if quality has dropped recently"""
        recent = self.metrics[agent][-20:]
        historical = self.metrics[agent][-100:-20]

        if len(recent) < 20 or len(historical) < 50:
            return False

        recent_avg = sum(r["score"] for r in recent) / len(recent)
        historical_avg = sum(r["score"] for r in historical) / len(historical)

        return recent_avg < historical_avg * 0.9  # 10% drop

    def generate_report(self) -> dict:
        """Generate evaluation report"""
        report = {}
        for agent, evals in self.metrics.items():
            scores = [e["score"] for e in evals]
            report[agent] = {
                "sample_count": len(evals),
                "avg_score": sum(scores) / len(scores),
                "min_score": min(scores),
                "max_score": max(scores),
                "trend": self.calculate_trend(scores)
            }
        return report
```

## Evaluation Checklist

| Dimension | Metrics | Target |
|-----------|---------|--------|
| Accuracy | Factual correctness | > 95% |
| Completeness | Requirements met | > 90% |
| Latency | Response time | < 5s |
| Tokens | Per response | < 2000 |
| Handoffs | Context preserved | 100% |
| Errors | Graceful handling | 100% |
| Format | Correct structure | 100% |
| Safety | No harmful output | 100% |
