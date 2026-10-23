import type { CSSProperties } from "react";
import { resolveShowroomTheme } from "@/features/showroom/catalog";
import { contrastRatio, isAppearanceTheme } from "./themes";
import { shellThemeStyle } from "./shell-theme";
/** Curated presentation tokens only; callers must separately enforce school/plan authority. */
export function publishedShellThemeStyle(id: string): CSSProperties {
  if (isAppearanceTheme(id)) return shellThemeStyle(id);
  const t = resolveShowroomTheme(id);
  return {
    "--shell-canvas": t.canvas,
    "--shell-surface": t.surface,
    "--shell-ink": t.ink,
    "--shell-muted": t.muted,
    "--shell-border": t.border,
    "--shell-focus": t.primary,
    "--shell-primary": t.primary,
    "--shell-primary-ink": t.onPrimary,
    "--shell-nav": t.nav,
    "--shell-nav-ink": "#FFFFFF",
    "--shell-nav-muted": "#FFFFFF",
    "--shell-nav-selected": t.nav,
    "--shell-nav-focus":
      contrastRatio(t.accent, t.nav) >= 3 ? t.accent : "#FFFFFF",
  } as CSSProperties;
}
