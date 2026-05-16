/**
 * Progress Bar Component - Quiz Master Design System
 * Shows quiz progress with smooth animations
 */

export function ProgressBar({ value = 0, max = 100, label = '', showLabel = true, className = '' }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && label && (
        <div className="flex justify-between items-center">
          <label className="text-label-lg text-on-surface">{label}</label>
          <span className="text-body-md text-on-surface-variant">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
