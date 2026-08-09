import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UnpoppingCandyProvider } from '@unpopping-candy/theme';
import { FeedbackProvider } from '@unpopping-candy/ui';
import '@unpopping-candy/tokens/styles.css';
import '@unpopping-candy/icons/styles.css';
import '@unpopping-candy/ui/styles.css';
import './styles.css';
import { App } from './app';

const root = document.getElementById('root');
if (!root) throw new Error('Expected #root application mount.');

createRoot(root).render(
  <StrictMode>
    <UnpoppingCandyProvider scope="document" theme="system" density="comfortable">
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </UnpoppingCandyProvider>
  </StrictMode>,
);
