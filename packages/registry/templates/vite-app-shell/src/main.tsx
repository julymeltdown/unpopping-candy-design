import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CommonspaceProvider } from '@commonspace/theme';
import { FeedbackProvider } from '@commonspace/ui';
import '@commonspace/tokens/styles.css';
import '@commonspace/icons/styles.css';
import '@commonspace/ui/styles.css';
import './styles.css';
import { App } from './app';

const root = document.getElementById('root');
if (!root) throw new Error('Expected #root application mount.');

createRoot(root).render(
  <StrictMode>
    <CommonspaceProvider scope="document" theme="system" density="comfortable">
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </CommonspaceProvider>
  </StrictMode>,
);
