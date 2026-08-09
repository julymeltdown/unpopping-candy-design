import type { Preview } from '@storybook/react-vite';
import { UnpoppingCandyProvider } from '@unpopping-candy/theme';
import { FeedbackProvider } from '@unpopping-candy/ui';
import '@unpopping-candy/tokens/styles.css';
import '@unpopping-candy/icons/styles.css';
import '@unpopping-candy/ui/styles.css';
import '@unpopping-candy/social/styles.css';
import './preview.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Unpopping Candy theme',
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
      <UnpoppingCandyProvider
        theme={context.globals.theme}
        density={context.globals.density}
        accent={context.globals.accent}
        storageKey={false}
        className="popcandy-docs-canvas"
      >
        <FeedbackProvider>
          <Story />
        </FeedbackProvider>
      </UnpoppingCandyProvider>
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
