import moonIcon from "../assets/Moon.png";
import sunIcon from "../assets/light mode.png";
import { resolveTheme, useSettings } from "../utils/settings";

function ThemeToggle() {
  const [settings, updateSettings] = useSettings();
  const isDark = resolveTheme(settings.theme) === "dark";

  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <img src={isDark ? sunIcon : moonIcon} alt="" />
    </button>
  );
}

export default ThemeToggle;
