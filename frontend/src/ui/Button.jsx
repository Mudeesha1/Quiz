/**
 * Button Components - Quiz Master Design System
 * Demonstrates primary, secondary, and tertiary button variations
 */

export function ButtonPrimary({ children, disabled = false, className = '', ...props }) {
  return (
    <button
      className={`btn-primary ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonSecondary({ children, disabled = false, className = '', ...props }) {
  return (
    <button
      className={`btn-secondary ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonTertiary({ children, disabled = false, className = '', ...props }) {
  return (
    <button
      className={`btn-tertiary ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
