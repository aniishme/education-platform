function FormField({
  label,
  id,
  type,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
