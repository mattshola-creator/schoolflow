export const appearanceThemes = {
  "premium-emerald": {
    name: "Premium Emerald",
    canvas: "#F1F5F3",
    surface: "#FFFFFF",
    ink: "#15392D",
    muted: "#50675D",
    forest: "#073D2B",
    primary: "#087C57",
    primaryInk: "#FFFFFF",
    vibrant: "#16A36B",
    gold: "#D6AE62",
    border: "#CBDAD1",
    focus: "#087C57",
  },
  "classic-light": {
    name: "Classic Light",
    canvas: "#F5F7F7",
    surface: "#FFFFFF",
    ink: "#17211D",
    muted: "#52615A",
    forest: "#073D2B",
    primary: "#146B4C",
    primaryInk: "#FFFFFF",
    vibrant: "#16A36B",
    gold: "#D6AE62",
    border: "#D8E0DC",
    focus: "#146B4C",
  },
  "midnight-emerald": {
    name: "Midnight Emerald",
    canvas: "#071F18",
    surface: "#102F25",
    ink: "#EDF7F1",
    muted: "#B4C9BF",
    forest: "#073D2B",
    primary: "#90DBB8",
    primaryInk: "#073D2B",
    vibrant: "#16A36B",
    gold: "#D6AE62",
    border: "#3D6353",
    focus: "#90DBB8",
  },
} as const;

export type AppearanceTheme = keyof typeof appearanceThemes;
export const defaultAppearanceTheme: AppearanceTheme = "premium-emerald";

export function isAppearanceTheme(value: string): value is AppearanceTheme {
  return Object.hasOwn(appearanceThemes, value);
}

/** WCAG relative luminance for canonical six-digit tokens, not arbitrary CSS. */
function luminance(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error("Invalid color token");
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}
