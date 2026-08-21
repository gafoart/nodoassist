// Control UI module implements theme behavior.
export type ThemeName = "nodo" | "custom";
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "dark" | "light" | "custom" | "custom-light";

const VALID_THEME_NAMES = new Set<ThemeName>(["nodo", "custom"]);
const VALID_THEME_MODES = new Set<ThemeMode>(["system", "light", "dark"]);

type ThemeSelection = { theme: ThemeName; mode: ThemeMode };

// Browser-local settings survive upgrades, so every theme id we ever shipped
// still lands in storage. Retired families collapse onto "nodo" and keep only
// the light/dark intent they implied.
const LEGACY_MAP: Record<string, ThemeSelection> = {
  claw: { theme: "nodo", mode: "system" },
  knot: { theme: "nodo", mode: "dark" },
  dash: { theme: "nodo", mode: "dark" },
  defaultTheme: { theme: "nodo", mode: "dark" },
  docsTheme: { theme: "nodo", mode: "light" },
  lightTheme: { theme: "nodo", mode: "dark" },
  landingTheme: { theme: "nodo", mode: "dark" },
  newTheme: { theme: "nodo", mode: "dark" },
  dark: { theme: "nodo", mode: "dark" },
  light: { theme: "nodo", mode: "light" },
  openknot: { theme: "nodo", mode: "dark" },
  fieldmanual: { theme: "nodo", mode: "dark" },
  clawdash: { theme: "nodo", mode: "light" },
  system: { theme: "nodo", mode: "system" },
};

function prefersLightScheme(): boolean {
  if (typeof globalThis.matchMedia !== "function") {
    return false;
  }
  return globalThis.matchMedia("(prefers-color-scheme: light)").matches;
}

export function parseThemeSelection(
  themeRaw: unknown,
  modeRaw: unknown,
): { theme: ThemeName; mode: ThemeMode } {
  const theme = typeof themeRaw === "string" ? themeRaw : "";
  const mode = typeof modeRaw === "string" ? modeRaw : "";

  const normalizedTheme = VALID_THEME_NAMES.has(theme as ThemeName)
    ? (theme as ThemeName)
    : (LEGACY_MAP[theme]?.theme ?? "nodo");
  const normalizedMode = VALID_THEME_MODES.has(mode as ThemeMode)
    ? (mode as ThemeMode)
    : (LEGACY_MAP[theme]?.mode ?? "system");

  return { theme: normalizedTheme, mode: normalizedMode };
}

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return prefersLightScheme() ? "light" : "dark";
  }
  return mode;
}

export function resolveTheme(theme: ThemeName, mode: ThemeMode): ResolvedTheme {
  const resolvedMode = resolveMode(mode);
  if (theme === "custom") {
    return resolvedMode === "light" ? "custom-light" : "custom";
  }
  return resolvedMode === "light" ? "light" : "dark";
}
