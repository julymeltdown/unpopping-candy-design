export const referenceColors = {
  neutral0: '#ffffff',
  neutral25: '#fbfbf9',
  neutral50: '#f7f7f5',
  neutral100: '#f1f1ee',
  neutral200: '#dfdfda',
  neutral300: '#c8c8c1',
  neutral500: '#77776f',
  neutral600: '#666661',
  neutral800: '#30302e',
  neutral950: '#161616',
  neutral1000: '#0f0f0e',
  blue500: '#0f62fe',
  blue600: '#0353e9',
  green600: '#198754',
  amber700: '#9a6700',
  red600: '#c9362b',
  violet600: '#6f4bd8',
} as const;

export const space = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;

export const radii = {
  none: '0',
  sm: '0.375rem',
  md: '0.625rem',
  lg: '1rem',
  xl: '1.25rem',
  round: '999px',
} as const;

export const typography = {
  family: {
    sans: 'Inter, Pretendard, "IBM Plex Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
  },
  size: {
    xs: '0.75rem',
    sm: '0.8125rem',
    md: '0.875rem',
    body: '0.9375rem',
    lg: '1.125rem',
    xl: '1.25rem',
    display: '1.75rem',
  },
  lineHeight: {
    tight: 1.25,
    ui: 1.4,
    body: 1.55,
  },
} as const;

export const motion = {
  duration: {
    fast: '120ms',
    normal: '180ms',
    slow: '260ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    enter: 'cubic-bezier(0, 0, 0, 1)',
    exit: 'cubic-bezier(0.3, 0, 1, 1)',
  },
} as const;

export const componentTokens = {
  button: {
    heightSm: '2rem',
    heightMd: '2.5rem',
    heightLg: '3rem',
    paddingInlineSm: '0.75rem',
    paddingInlineMd: '1rem',
    paddingInlineLg: '1.375rem',
  },
  field: {
    height: '2.75rem',
  },
  dialog: {
    widthSm: '26.25rem',
    widthMd: '35rem',
    widthLg: '47.5rem',
  },
  shell: {
    maximum: '78.75rem',
  },
} as const;

export type ReferenceColors = typeof referenceColors;
export type SpaceTokens = typeof space;
export type RadiusTokens = typeof radii;
export type TypographyTokens = typeof typography;
export type MotionTokens = typeof motion;
export type ComponentTokens = typeof componentTokens;
