export const themeNames = ['light', 'dark', 'system', 'high-contrast'] as const;
export const densityNames = ['comfortable', 'compact'] as const;
export const accentNames = ['blue', 'violet', 'neutral'] as const;

export type ThemeName = (typeof themeNames)[number];
export type DensityName = (typeof densityNames)[number];
export type AccentName = (typeof accentNames)[number];

export interface ThemeState {
  theme: ThemeName;
  density: DensityName;
  accent: AccentName;
}

export const defaultThemeState: ThemeState = {
  theme: 'system',
  density: 'comfortable',
  accent: 'blue',
};

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === 'string' && values.includes(value);
}

export function sanitizeThemeState(value: unknown): ThemeState {
  if (!value || typeof value !== 'object') return { ...defaultThemeState };
  const candidate = value as Partial<Record<keyof ThemeState, unknown>>;
  return {
    theme: isOneOf(themeNames, candidate.theme) ? candidate.theme : defaultThemeState.theme,
    density: isOneOf(densityNames, candidate.density) ? candidate.density : defaultThemeState.density,
    accent: isOneOf(accentNames, candidate.accent) ? candidate.accent : defaultThemeState.accent,
  };
}

export function parseStoredThemeState(serialized: string | null): ThemeState {
  if (!serialized) return { ...defaultThemeState };
  try {
    return sanitizeThemeState(JSON.parse(serialized));
  } catch {
    return { ...defaultThemeState };
  }
}

export function themeDataAttributes(state: ThemeState): Record<string, string> {
  return {
    'data-cs-theme': state.theme,
    'data-cs-density': state.density,
    'data-cs-accent': state.accent,
  };
}

export function createThemeBootstrapScript(storageKey = 'commonspace:theme:v1'): string {
  const safeKey = JSON.stringify(storageKey).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `(function(){try{var key=${safeKey};var raw=localStorage.getItem(key);var value=raw?JSON.parse(raw):{};var root=document.documentElement;var themes=['light','dark','system','high-contrast'];var densities=['comfortable','compact'];var accents=['blue','violet','neutral'];root.dataset.csTheme=themes.includes(value.theme)?value.theme:'system';root.dataset.csDensity=densities.includes(value.density)?value.density:'comfortable';root.dataset.csAccent=accents.includes(value.accent)?value.accent:'blue';}catch(_){}})();`;
}
