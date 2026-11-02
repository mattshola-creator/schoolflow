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
    "--shell-hero":
      theme === "premium-emerald"
        ? "#145C4A"
        : light
          ? t.surface
          : theme === "midnight-emerald"
            ? "#17283A"
            : t.forest,
    "--shell-hero-ink": light ? t.ink : "#FFFFFF",
    "--shell-accent": t.gold,
    "--shell-nav": light ? t.surface : t.forest,
    "--shell-nav-ink": light ? t.ink : "#EDF7F1",
    "--shell-nav-muted": light ? t.muted : "#B4C9BF",
    "--shell-nav-selected": light
      ? "#E9F7F0"
      : theme === "ocean"
        ? "#164E81"
        : "#145C4A",
    "--shell-nav-focus": light ? t.focus : "#D6AE62",
  } as CSSProperties;
}
