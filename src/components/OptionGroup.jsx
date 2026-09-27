// Radio buttons in a fieldset: Tab enters the group, arrow keys move between options.
function OptionGroup({ name, legend, description, options, value, onChange }) {
  return (
    <fieldset className="option-group">
      <legend>{legend}</legend>
      {description && <p className="option-description">{description}</p>}

      <div className="option-list">
        {options.map((option) => (
          <label className="option" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="option-card">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default OptionGroup;
