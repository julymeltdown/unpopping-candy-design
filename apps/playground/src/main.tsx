import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@commonspace/tokens/styles.css';
import '@commonspace/icons/styles.css';
import '@commonspace/ui/styles.css';
import '@commonspace/social/styles.css';
import { App } from './App';
import './playground.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
