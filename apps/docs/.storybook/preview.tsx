import type { Preview } from '@storybook/react-vite';
import { CommonspaceProvider } from '@commonspace/theme';
import { FeedbackProvider } from '@commonspace/ui';
import '@commonspace/tokens/styles.css';
import '@commonspace/icons/styles.css';
import '@commonspace/ui/styles.css';
import '@commonspace/social/styles.css';
import './preview.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Commonspace theme',
      defaultValue: 'light',
      toolbar: { icon: 'paintbrush', items: ['light', 'dark', 'system', 'high-contrast'] },
    },
    density: {
      description: 'Component density',
      defaultValue: 'comfortable',
      toolbar: { icon: 'sidebar', items: ['comfortable', 'compact'] },
    },
    accent: {
      description: 'Accent role',
      defaultValue: 'blue',
      toolbar: { icon: 'circlehollow', items: ['blue', 'violet', 'neutral'] },
    },
  },
  decorators: [
    (Story, context) => (
      <CommonspaceProvider
        theme={context.globals.theme}
        density={context.globals.density}
        accent={context.globals.accent}
        storageKey={false}
        className="cs-docs-canvas"
      >
        <FeedbackProvider>
          <Story />
        </FeedbackProvider>
      </CommonspaceProvider>
    ),
  ],
  parameters: {
    a11y: { test: 'error' },
    controls: { expanded: true },
    layout: 'centered',
    options: { storySort: { order: ['Introduction', 'Foundations', 'UI', 'Social'] } },
  },
};
export default preview;
