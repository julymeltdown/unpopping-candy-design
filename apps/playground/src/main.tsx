import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@unpopping-candy/tokens/styles.css';
import '@unpopping-candy/icons/styles.css';
import '@unpopping-candy/ui/styles.css';
import '@unpopping-candy/social/styles.css';
import { App } from './App';
import './playground.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root application mount.');
}

createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
