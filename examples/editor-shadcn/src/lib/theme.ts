export const UI_THEME_STORAGE_KEY = 'editor:ui-theme';

export type TUiTheme = 'light' | 'dark';

export function getInitialUiTheme(): TUiTheme {
  try {
    const stored = localStorage.getItem(UI_THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // fallback
  }
  return 'light';
}

export function applyUiTheme(theme: TUiTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(UI_THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export function toggleUiTheme(): TUiTheme {
  const next: TUiTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyUiTheme(next);
  return next;
}
