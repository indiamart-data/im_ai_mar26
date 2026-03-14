import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Architecture',
      items: ['architecture/overview', 'architecture/monorepo'],
    },
    {
      type: 'category',
      label: 'API',
      items: ['api/overview', 'api/endpoints', 'api/data-model'],
    },
    {
      type: 'category',
      label: 'Web App',
      items: ['web/overview', 'web/components', 'web/hooks'],
    },
    {
      type: 'category',
      label: 'Development',
      items: ['development/setup', 'development/testing'],
    },
  ],
};

export default sidebars;
