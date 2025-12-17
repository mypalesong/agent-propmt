import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/agent-propmt/en/markdown-page',
    component: ComponentCreator('/agent-propmt/en/markdown-page', '0a1'),
    exact: true
  },
  {
    path: '/agent-propmt/en/docs',
    component: ComponentCreator('/agent-propmt/en/docs', 'f9a'),
    routes: [
      {
        path: '/agent-propmt/en/docs',
        component: ComponentCreator('/agent-propmt/en/docs', 'd22'),
        routes: [
          {
            path: '/agent-propmt/en/docs',
            component: ComponentCreator('/agent-propmt/en/docs', '26d'),
            routes: [
              {
                path: '/agent-propmt/en/docs/best-practices/debugging',
                component: ComponentCreator('/agent-propmt/en/docs/best-practices/debugging', 'd19'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/best-practices/evaluation',
                component: ComponentCreator('/agent-propmt/en/docs/best-practices/evaluation', 'e09'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/best-practices/prompt-engineering',
                component: ComponentCreator('/agent-propmt/en/docs/best-practices/prompt-engineering', '6dc'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/best-practices/security',
                component: ComponentCreator('/agent-propmt/en/docs/best-practices/security', '55d'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/examples/code-review-agent',
                component: ComponentCreator('/agent-propmt/en/docs/examples/code-review-agent', '1fd'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/examples/customer-support',
                component: ComponentCreator('/agent-propmt/en/docs/examples/customer-support', 'eba'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/examples/research-agent',
                component: ComponentCreator('/agent-propmt/en/docs/examples/research-agent', '389'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/frameworks/autogen',
                component: ComponentCreator('/agent-propmt/en/docs/frameworks/autogen', '294'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/frameworks/crewai',
                component: ComponentCreator('/agent-propmt/en/docs/frameworks/crewai', '82e'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/frameworks/langchain',
                component: ComponentCreator('/agent-propmt/en/docs/frameworks/langchain', '9fa'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/frameworks/langgraph',
                component: ComponentCreator('/agent-propmt/en/docs/frameworks/langgraph', '58f'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/frameworks/openai-swarm',
                component: ComponentCreator('/agent-propmt/en/docs/frameworks/openai-swarm', '45a'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/getting-started/architecture',
                component: ComponentCreator('/agent-propmt/en/docs/getting-started/architecture', 'd1c'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/getting-started/concepts',
                component: ComponentCreator('/agent-propmt/en/docs/getting-started/concepts', '39e'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/getting-started/quick-start',
                component: ComponentCreator('/agent-propmt/en/docs/getting-started/quick-start', 'a7c'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/intro',
                component: ComponentCreator('/agent-propmt/en/docs/intro', '6b5'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/patterns/hierarchical',
                component: ComponentCreator('/agent-propmt/en/docs/patterns/hierarchical', '12f'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/patterns/orchestrator',
                component: ComponentCreator('/agent-propmt/en/docs/patterns/orchestrator', 'ac1'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/patterns/peer-to-peer',
                component: ComponentCreator('/agent-propmt/en/docs/patterns/peer-to-peer', '1f2'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/patterns/supervisor',
                component: ComponentCreator('/agent-propmt/en/docs/patterns/supervisor', '21a'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/patterns/swarm',
                component: ComponentCreator('/agent-propmt/en/docs/patterns/swarm', 'ec5'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/prompt-design/context-management',
                component: ComponentCreator('/agent-propmt/en/docs/prompt-design/context-management', '367'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/prompt-design/output-formatting',
                component: ComponentCreator('/agent-propmt/en/docs/prompt-design/output-formatting', '13c'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/prompt-design/principles',
                component: ComponentCreator('/agent-propmt/en/docs/prompt-design/principles', 'a8b'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/prompt-design/role-definition',
                component: ComponentCreator('/agent-propmt/en/docs/prompt-design/role-definition', '9a8'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/prompt-design/system-prompts',
                component: ComponentCreator('/agent-propmt/en/docs/prompt-design/system-prompts', '12d'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/tools/mcp',
                component: ComponentCreator('/agent-propmt/en/docs/tools/mcp', '3f3'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/tools/tool-calling',
                component: ComponentCreator('/agent-propmt/en/docs/tools/tool-calling', '343'),
                exact: true,
                sidebar: "guideSidebar"
              },
              {
                path: '/agent-propmt/en/docs/tools/tool-definition',
                component: ComponentCreator('/agent-propmt/en/docs/tools/tool-definition', 'eb6'),
                exact: true,
                sidebar: "guideSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/agent-propmt/en/',
    component: ComponentCreator('/agent-propmt/en/', 'af7'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
