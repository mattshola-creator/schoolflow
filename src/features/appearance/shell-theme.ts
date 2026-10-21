import type { CSSProperties } from "react";
import { appearanceThemes, type AppearanceTheme } from "./themes";

/** Presentation only: no application-wide variables or tenant configuration. */
export function shellThemeStyle(theme: AppearanceTheme): CSSProperties {
  const t = appearanceThemes[theme];
  const light = theme === "classic-light";
  return {
    "--shell-canvas": t.canvas,
    "--shell-surface": t.surface,
    "--shell-ink": t.ink,
    "--shell-muted": t.muted,
    "--shell-border": t.border,
    "--shell-focus": t.focus,
    "--shell-primary": t.primary,
    "--shell-primary-ink": t.primaryInk,
    "--shell-nav": light ? t.surface : t.forest,
    "--shell-nav-ink": light ? t.ink : "#EDF7F1",
    "--shell-nav-muted": light ? t.muted : "#B4C9BF",
    "--shell-nav-selected": light ? "#E9F7F0" : "#125139",
    "--shell-nav-focus": light ? t.focus : "#D6AE62",
  } as CSSProperties;
}
