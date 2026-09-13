import React, { useState, useEffect } from 'react';

export interface CountdownProps {
  initialSeconds: number;
  onExpire?: () => void;
  prefix?: string;
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  initialSeconds,
  onExpire,
  prefix,
  className = ''
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <span className={`font-[var(--font-mono)] tabular-nums ${className}`}>
      {prefix ? `${prefix} ` : ''}{formatted}
    </span>
  );
};
