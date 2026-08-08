import type { ScriptHTMLAttributes } from 'react';
import { createThemeBootstrapScript } from './theme-state.js';

export interface ThemeScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'children'> {
  storageKey?: string | undefined;
}

export function ThemeScript({ storageKey, ...props }: ThemeScriptProps) {
  return (
    <script
      {...props}
      dangerouslySetInnerHTML={{ __html: createThemeBootstrapScript(storageKey) }}
    />
  );
}
