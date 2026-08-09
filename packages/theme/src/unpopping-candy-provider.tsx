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

export interface UnpoppingCandyThemeController extends ThemeState {
  setTheme(theme: ThemeName): void;
  setDensity(density: DensityName): void;
  setAccent(accent: AccentName): void;
  reset(): void;
}

const ThemeContext = createContext<UnpoppingCandyThemeController | null>(null);

export interface UnpoppingCandyProviderProps
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
  variables?: Readonly<Record<`--popcandy-${string}`, string>> | undefined;
}

function useInitialState(
  storageKey: string | false,
  defaults: ThemeState,
): ThemeState {
  return useMemo(() => {
    if (typeof window === 'undefined' || storageKey === false) return defaults;
    const serialized = window.localStorage.getItem(storageKey);
    return serialized ? parseStoredThemeState(serialized) : defaults;
  }, [defaults, storageKey]);
}

export function UnpoppingCandyProvider({
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
  storageKey = 'popcandy:theme:v1',
  style,
  theme: controlledTheme,
  variables,
  ...props
}: UnpoppingCandyProviderProps) {
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
      theme: root.dataset.popcandyTheme,
      density: root.dataset.popcandyDensity,
      accent: root.dataset.popcandyAccent,
    };
    Object.assign(root.dataset, {
      popcandyTheme: theme,
      popcandyDensity: density,
      popcandyAccent: accent,
    });
    return () => {
      if (previous.theme) root.dataset.popcandyTheme = previous.theme;
      else delete root.dataset.popcandyTheme;
      if (previous.density) root.dataset.popcandyDensity = previous.density;
      else delete root.dataset.popcandyDensity;
      if (previous.accent) root.dataset.popcandyAccent = previous.accent;
      else delete root.dataset.popcandyAccent;
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
      className={className ? `popcandy-theme-scope ${className}` : 'popcandy-theme-scope'}
      style={mergedStyle}
    >
      {children}
    </div>
  ) : (
    <Fragment>{children}</Fragment>
  );

  return <ThemeContext.Provider value={controller}>{content}</ThemeContext.Provider>;
}

export function useUnpoppingCandyTheme(): UnpoppingCandyThemeController {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useUnpoppingCandyTheme must be used inside UnpoppingCandyProvider.');
  }
  return value;
}
