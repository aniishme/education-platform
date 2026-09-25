import { useEffect, useRef } from "react";
import { NavLink, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import ChangePasswordForm from "../components/ChangePasswordForm";
import OptionGroup from "../components/OptionGroup";
import ToggleSwitch from "../components/ToggleSwitch";
import { getRole } from "../utils/auth";
import { useSettings } from "../utils/settings";
import useFocusTrap from "../utils/useFocusTrap";
import "../Settings.css";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const textSizeOptions = [
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra large" },
];

const allSections = [
  { id: "security", label: "Security", intro: "Change the password you use to log in." },
  { id: "notifications", label: "Notifications", intro: "Choose what StudyFlow tells you about." },
  { id: "appearance", label: "Appearance", intro: "Pick a colour theme, or follow your device's setting." },
  { id: "accessibility", label: "Accessibility", intro: "Make StudyFlow easier to read and use." },
];

function Settings() {
  const { section: sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, updateSettings] = useSettings();
  const cardRef = useRef(null);

  // the security tab changes the student demo password, which isn't how an admin logs in
  const sections = getRole() === "admin" ? allSections.filter((item) => item.id !== "security") : allSections;
  const section = sections.find((item) => item.id === sectionId);

  // go back to the page the card was opened over (or home if it was opened directly)
  const close = () => {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate("/", { replace: true });
  };

  // Tab stays inside the card, Escape closes it, focus returns afterwards
  useFocusTrap(cardRef, Boolean(section), close);

  // stop the blurred page behind from scrolling
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // /settings and unknown sections open the first one
  if (!section) {
    return <Navigate to={`/settings/${sections[0].id}`} replace state={location.state} />;
  }

  const updateNotification = (key) => (checked) => updateSettings({ notifications: { [key]: checked } });

  return (
    <div className="settings-overlay" onMouseDown={close}>
      <div
        ref={cardRef}
        className="settings-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-shell-header">
          <div>
            <p className="settings-kicker">Account</p>
            <h1 id="settings-title">Settings</h1>
            <p>Changes are saved automatically.</p>
          </div>
          <button type="button" className="settings-close" onClick={close} aria-label="Close settings">
            &times;
          </button>
        </header>

        <div className="settings-body">
          <nav className="settings-sidebar" aria-label="Settings sections">
            {sections.map((item) => (
              <NavLink
                key={item.id}
                to={`/settings/${item.id}`}
                state={location.state}
                replace
                className="settings-tab"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="settings-panel">
            <h2>{section.label}</h2>
            <p className="settings-card-intro">{section.intro}</p>

            {section.id === "security" && <ChangePasswordForm />}

            {section.id === "notifications" && (
              <>
                <ToggleSwitch
                  id="notify-deadlines"
                  label="Deadlines"
                  description="Reminders before lessons and coursework are due."
                  checked={settings.notifications.deadlines}
                  onChange={updateNotification("deadlines")}
                />
                <ToggleSwitch
                  id="notify-lessons"
                  label="New lessons"
                  description="Tell me when a course I'm taking adds a lesson."
                  checked={settings.notifications.newLessons}
                  onChange={updateNotification("newLessons")}
                />
                <ToggleSwitch
                  id="notify-weekly-email"
                  label="Weekly email"
                  description="A weekly summary of your progress sent to your email."
                  checked={settings.notifications.weeklyEmail}
                  onChange={updateNotification("weeklyEmail")}
                />
              </>
            )}

            {section.id === "appearance" && (
              <OptionGroup
                name="theme"
                legend="Theme"
                options={themeOptions}
                value={settings.theme}
                onChange={(theme) => updateSettings({ theme })}
              />
            )}

            {section.id === "accessibility" && (
              <>
                <OptionGroup
                  name="text-size"
                  legend="Text size"
                  options={textSizeOptions}
                  value={settings.textSize}
                  onChange={(textSize) => updateSettings({ textSize })}
                />

                <ToggleSwitch
                  id="high-contrast"
                  label="High contrast"
                  description="Stronger text and border colours for easier reading."
                  checked={settings.highContrast}
                  onChange={(highContrast) => updateSettings({ highContrast })}
                />
                <ToggleSwitch
                  id="dyslexia-font"
                  label="Dyslexia-friendly font"
                  description="Use a font with clearer letter shapes and extra spacing."
                  checked={settings.dyslexiaFont}
                  onChange={(dyslexiaFont) => updateSettings({ dyslexiaFont })}
                />
                <ToggleSwitch
                  id="reduce-motion"
                  label="Reduce motion"
                  description="Turn off animations and transitions."
                  checked={settings.reduceMotion}
                  onChange={(reduceMotion) => updateSettings({ reduceMotion })}
                />
                <ToggleSwitch
                  id="focus-outlines"
                  label="Visible focus outlines"
                  description="Show a clear outline around whatever you've selected with the keyboard."
                  checked={settings.focusOutlines}
                  onChange={(focusOutlines) => updateSettings({ focusOutlines })}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
