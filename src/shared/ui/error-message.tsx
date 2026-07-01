'use client';

import { Button } from './button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      style={{
        padding: 16,
        borderRadius: 8,
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
      }}
    >
      <p style={{ margin: '0 0 12px' }}>{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
