/**
 * Card Components - Quiz Master Design System
 * Reusable card containers for content
 */

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function QuizCard({ children, className = '', ...props }) {
  return (
    <div className={`quiz-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 border-b border-outline-variant ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 border-t border-outline-variant flex gap-4 ${className}`}>
      {children}
    </div>
  );
}
