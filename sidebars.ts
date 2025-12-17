import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
        'getting-started/concepts',
        'getting-started/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Prompt Design',
      items: [
        'prompt-design/principles',
        'prompt-design/system-prompts',
        'prompt-design/role-definition',
        'prompt-design/context-management',
        'prompt-design/output-formatting',
      ],
    },
    {
      type: 'category',
      label: 'Multi-Agent Patterns',
      items: [
        'patterns/orchestrator',
        'patterns/supervisor',
        'patterns/hierarchical',
        'patterns/peer-to-peer',
        'patterns/swarm',
      ],
    },
    {
      type: 'category',
      label: 'Frameworks',
      items: [
        'frameworks/langchain',
        'frameworks/autogen',
        'frameworks/crewai',
        'frameworks/openai-swarm',
        'frameworks/langgraph',
      ],
    },
    {
      type: 'category',
      label: 'Tools & Integration',
      items: [
        'tools/tool-definition',
        'tools/tool-calling',
        'tools/mcp',
      ],
    },
    {
      type: 'category',
      label: 'Best Practices',
      items: [
        'best-practices/prompt-engineering',
        'best-practices/debugging',
        'best-practices/evaluation',
        'best-practices/security',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/research-agent',
        'examples/code-review-agent',
        'examples/customer-support',
      ],
    },
  ],
};

export default sidebars;
