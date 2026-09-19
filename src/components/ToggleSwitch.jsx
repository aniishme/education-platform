// A native checkbox exposed as a switch, so Space toggles it and screen readers announce on/off.
function ToggleSwitch({ id, label, description, checked, onChange }) {
  return (
    <label className="setting-row" htmlFor={id}>
      <span className="setting-text">
        <span className="setting-title">{label}</span>
        <span className="setting-description" id={`${id}-description`}>
          {description}
        </span>
      </span>

      <span className="switch">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={`${id}-description`}
        />
        <span className="switch-track" aria-hidden="true" />
      </span>
    </label>
  );
}

export default ToggleSwitch;
