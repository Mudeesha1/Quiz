/**
 * Badge Component - Quiz Master Design System
 */

export function Badge({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'badge',
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    error: 'badge badge-error',
  };

  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
