import type { CSSProperties } from 'react';

/**
 * Pastel folder palette.
 *
 * - `solid`: the pastel fill (checkboxes, dots, buttons)
 * - `deep`:  a darker shade of the same hue, used for text and icons so they
 *            stay readable (>= 4.5:1 on white) against the soft backgrounds
 * - `tint`:  a very light wash used for selected/active backgrounds
 */
export const FOLDER_COLORS = [
  { key: 'teal', name: 'Teal', solid: '#7fd1c7', deep: '#25766f', tint: '#e6f6f4' },
  { key: 'mint', name: 'Mint', solid: '#a8e0b8', deep: '#327a4c', tint: '#e9f7ee' },
  { key: 'sky', name: 'Sky', solid: '#9fd0f0', deep: '#2f6f9e', tint: '#e8f3fb' },
  { key: 'periwinkle', name: 'Periwinkle', solid: '#aab7f0', deep: '#4452a5', tint: '#ecefff' },
  { key: 'lavender', name: 'Lavender', solid: '#cdb8f0', deep: '#6a46a3', tint: '#f3ecfc' },
  { key: 'pink', name: 'Pink', solid: '#f5b8d2', deep: '#a63a6f', tint: '#fdeef5' },
  { key: 'coral', name: 'Coral', solid: '#f4a9a8', deep: '#a03f3f', tint: '#fdeded' },
  { key: 'peach', name: 'Peach', solid: '#f8c6a6', deep: '#9a5328', tint: '#fdf0e7' },
  { key: 'butter', name: 'Butter', solid: '#f3e08f', deep: '#7a6410', tint: '#fdf8e0' },
  { key: 'sage', name: 'Sage', solid: '#bcd3a8', deep: '#4f6a39', tint: '#f0f5ea' },
] as const;

export type ColorKey = (typeof FOLDER_COLORS)[number]['key'];

/** Teal is the app's signature accent and the default for every new folder. */
export const DEFAULT_COLOR: ColorKey = 'teal';

export function isColorKey(value: unknown): value is ColorKey {
  return FOLDER_COLORS.some((c) => c.key === value);
}

/** CSS custom properties that re-theme everything inside an element to one folder color. */
export function colorVars(key: ColorKey | undefined): CSSProperties {
  const c = FOLDER_COLORS.find((x) => x.key === key) ?? FOLDER_COLORS[0];
  return { '--accent': c.solid, '--accent-deep': c.deep, '--accent-tint': c.tint } as CSSProperties;
}
