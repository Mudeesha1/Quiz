/**
 * Input Components - Quiz Master Design System
 */

export function TextInput({ label = '', placeholder = '', error = '', disabled = false, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-label-lg text-on-surface block">{label}</label>}
      <input
        className={`input-field ${error ? 'border-error focus:ring-error' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-body-md text-error">{error}</p>}
    </div>
  );
}

export function Select({ label = '', options = [], error = '', disabled = false, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-label-lg text-on-surface block">{label}</label>}
      <select
        className={`input-field ${error ? 'border-error focus:ring-error' : ''}`}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-body-md text-error">{error}</p>}
    </div>
  );
}
