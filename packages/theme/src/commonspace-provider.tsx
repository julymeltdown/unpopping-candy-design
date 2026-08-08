import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  defaultThemeState,
  parseStoredThemeState,
  themeDataAttributes,
  type AccentName,
  type DensityName,
  type ThemeName,
  type ThemeState,
} from './theme-state.js';

export interface CommonspaceThemeController extends ThemeState {
  setTheme(theme: ThemeName): void;
  setDensity(density: DensityName): void;
  setAccent(accent: AccentName): void;
  reset(): void;
}

const ThemeContext = createContext<CommonspaceThemeController | null>(null);

export interface CommonspaceProviderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onChange'> {
  children: ReactNode;
  theme?: ThemeName | undefined;
  defaultTheme?: ThemeName | undefined;
  density?: DensityName | undefined;
  defaultDensity?: DensityName | undefined;
  accent?: AccentName | undefined;
  defaultAccent?: AccentName | undefined;
  scope?: 'local' | 'document' | undefined;
  storageKey?: string | false | undefined;
  onThemeChange?: ((theme: ThemeName) => void) | undefined;
  onDensityChange?: ((density: DensityName) => void) | undefined;
  onAccentChange?: ((accent: AccentName) => void) | undefined;
  variables?: Readonly<Record<`--cs-${string}`, string>> | undefined;
}

function useInitialState(
  storageKey: CommonspaceProviderProps['storageKey'],
  defaults: ThemeState,
): ThemeState {
  return useMemo(() => {
    if (typeof window === 'undefined' || storageKey === false) return defaults;
    const stored = parseStoredThemeState(window.localStorage.getItem(storageKey));
    return {
      theme: stored.theme ?? defaults.theme,
      density: stored.density ?? defaults.density,
      accent: stored.accent ?? defaults.accent,
    };
  }, [defaults, storageKey]);
}

export function CommonspaceProvider({
  accent: controlledAccent,
  children,
  className,
  defaultAccent = defaultThemeState.accent,
  defaultDensity = defaultThemeState.density,
  defaultTheme = defaultThemeState.theme,
  density: controlledDensity,
  onAccentChange,
  onDensityChange,
  onThemeChange,
  scope = 'local',
  storageKey = 'commonspace:theme:v1',
  style,
  theme: controlledTheme,
  variables,
  ...props
}: CommonspaceProviderProps) {
  const defaults = useMemo(
    () => ({ theme: defaultTheme, density: defaultDensity, accent: defaultAccent }),
    [defaultAccent, defaultDensity, defaultTheme],
  );
  const initial = useInitialState(storageKey, defaults);
  const [internalTheme, setInternalTheme] = useState(initial.theme);
  const [internalDensity, setInternalDensity] = useState(initial.density);
  const [internalAccent, setInternalAccent] = useState(initial.accent);

  const theme = controlledTheme ?? internalTheme;
  const density = controlledDensity ?? internalDensity;
  const accent = controlledAccent ?? internalAccent;
  const state = useMemo(() => ({ theme, density, accent }), [accent, density, theme]);

  useEffect(() => {
    if (storageKey === false || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (scope !== 'document' || typeof document === 'undefined') return;
    const root = document.documentElement;
    const previous = {
      theme: root.dataset.csTheme,
      density: root.dataset.csDensity,
      accent: root.dataset.csAccent,
    };
    Object.assign(root.dataset, {
      csTheme: theme,
      csDensity: density,
      csAccent: accent,
    });
    return () => {
      if (previous.theme) root.dataset.csTheme = previous.theme;
      else delete root.dataset.csTheme;
      if (previous.density) root.dataset.csDensity = previous.density;
      else delete root.dataset.csDensity;
      if (previous.accent) root.dataset.csAccent = previous.accent;
      else delete root.dataset.csAccent;
    };
  }, [accent, density, scope, theme]);

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (controlledTheme === undefined) setInternalTheme(next);
      onThemeChange?.(next);
    },
    [controlledTheme, onThemeChange],
  );
  const setDensity = useCallback(
    (next: DensityName) => {
      if (controlledDensity === undefined) setInternalDensity(next);
      onDensityChange?.(next);
    },
    [controlledDensity, onDensityChange],
  );
  const setAccent = useCallback(
    (next: AccentName) => {
      if (controlledAccent === undefined) setInternalAccent(next);
      onAccentChange?.(next);
    },
    [controlledAccent, onAccentChange],
  );
  const reset = useCallback(() => {
    setTheme(defaultTheme);
    setDensity(defaultDensity);
    setAccent(defaultAccent);
  }, [defaultAccent, defaultDensity, defaultTheme, setAccent, setDensity, setTheme]);

  const controller = useMemo(
    () => ({ ...state, setTheme, setDensity, setAccent, reset }),
    [reset, setAccent, setDensity, setTheme, state],
  );

  const mergedStyle = { ...style, ...variables } as CSSProperties;
  const content = scope === 'local' ? (
    <div
      {...props}
      {...themeDataAttributes(state)}
      className={className ? `cs-theme-scope ${className}` : 'cs-theme-scope'}
      style={mergedStyle}
    >
      {children}
    </div>
  ) : (
    <Fragment>{children}</Fragment>
  );

  return <ThemeContext.Provider value={controller}>{content}</ThemeContext.Provider>;
}

export function useCommonspaceTheme(): CommonspaceThemeController {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useCommonspaceTheme must be used inside CommonspaceProvider.');
  }
  return value;
}
