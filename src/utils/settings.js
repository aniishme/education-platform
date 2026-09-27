import { useSyncExternalStore } from "react";

const SETTINGS_KEY = "studyflowSettings";
const LEGACY_THEME_KEY = "studyflowTheme"; // the navbar toggle saved this before Settings existed

export const THEMES = ["light", "dark", "system"];
export const TEXT_SIZES = ["small", "default", "large", "xlarge"];

export const defaultSettings = {
  theme: "light",
  textSize: "default",
  highContrast: false,
  dyslexiaFont: false,
  reduceMotion: false,
  focusOutlines: true,
  notifications: {
    deadlines: true,
    newLessons: true,
    weeklyEmail: false,
  },
};

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

// merge saved values over the defaults, dropping anything that isn't valid
function normalise(saved) {
  const value = saved && typeof saved === "object" ? saved : {};
  const notifications = value.notifications && typeof value.notifications === "object" ? value.notifications : {};

  return {
    theme: THEMES.includes(value.theme) ? value.theme : defaultSettings.theme,
    textSize: TEXT_SIZES.includes(value.textSize) ? value.textSize : defaultSettings.textSize,
    highContrast: typeof value.highContrast === "boolean" ? value.highContrast : defaultSettings.highContrast,
    dyslexiaFont: typeof value.dyslexiaFont === "boolean" ? value.dyslexiaFont : defaultSettings.dyslexiaFont,
    reduceMotion: typeof value.reduceMotion === "boolean" ? value.reduceMotion : defaultSettings.reduceMotion,
    focusOutlines: typeof value.focusOutlines === "boolean" ? value.focusOutlines : defaultSettings.focusOutlines,
    notifications: {
      deadlines:
        typeof notifications.deadlines === "boolean" ? notifications.deadlines : defaultSettings.notifications.deadlines,
      newLessons:
        typeof notifications.newLessons === "boolean" ? notifications.newLessons : defaultSettings.notifications.newLessons,
      weeklyEmail:
        typeof notifications.weeklyEmail === "boolean" ? notifications.weeklyEmail : defaultSettings.notifications.weeklyEmail,
    },
  };
}

function loadSettings() {
  const raw = readStorage(SETTINGS_KEY);

  if (raw) {
    try {
      return normalise(JSON.parse(raw));
    } catch {
      return normalise(null);
    }
  }

  // first run after this feature shipped: keep the theme the user already picked
  return normalise({ theme: readStorage(LEGACY_THEME_KEY) });
}

let current = loadSettings();
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const systemDarkQuery = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

// "system" follows the operating system's current preference
export function resolveTheme(theme) {
  if (theme === "system") return systemDarkQuery?.matches ? "dark" : "light";
  return theme;
}

export function applySettings(settings) {
  const root = document.documentElement;

  root.dataset.theme = resolveTheme(settings.theme);
  root.dataset.textSize = settings.textSize;

  // switches are only present on <html> while they're turned on
  const flags = {
    contrast: settings.highContrast ? "high" : null,
    font: settings.dyslexiaFont ? "dyslexia" : null,
    motion: settings.reduceMotion ? "reduce" : null,
    focus: settings.focusOutlines ? "visible" : null,
  };

  Object.entries(flags).forEach(([name, value]) => {
    if (value) root.dataset[name] = value;
    else delete root.dataset[name];
  });
}

export function getSettings() {
  return current;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateSettings(patch) {
  current = normalise({
    ...current,
    ...patch,
    notifications: { ...current.notifications, ...patch.notifications },
  });

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
  } catch {
    // the choice still applies for this visit if storage is unavailable
  }

  applySettings(current);
  notify();
}

// call once at startup, before the first render, so the page never flashes the wrong look
export function initSettings() {
  applySettings(current);

  systemDarkQuery?.addEventListener("change", () => {
    if (current.theme !== "system") return;
    current = { ...current }; // new object so subscribers re-render
    applySettings(current);
    notify();
  });

  // keep other open tabs in step
  window.addEventListener("storage", (event) => {
    if (event.key !== SETTINGS_KEY) return;
    current = loadSettings();
    applySettings(current);
    notify();
  });
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSettings);
  return [settings, updateSettings];
}
