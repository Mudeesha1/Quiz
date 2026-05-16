/**
 * Chip Components - Quiz Master Design System
 * Multiple choice selection chips with states
 */

export function Chip({
  children,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  className = '',
  ...props
}) {
  let chipClass = 'chip';

  if (selected) chipClass += ' chip-selected';
  if (correct) chipClass += ' chip-correct';
  if (incorrect) chipClass += ' chip-incorrect';
  if (disabled) chipClass += ' opacity-50 cursor-not-allowed';

  return (
    <button
      className={`${chipClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function ChipGroup({ children, className = '', ...props }) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
