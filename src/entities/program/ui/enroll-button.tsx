'use client';

import { Button } from '@/shared/ui';

interface EnrollButtonProps {
  isEnrolled: boolean;
  currentDay: number;
  onEnroll: () => void;
}

export function EnrollButton({ isEnrolled, currentDay, onEnroll }: EnrollButtonProps) {
  if (isEnrolled) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 6,
          background: '#ecfdf5',
          color: '#047857',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Enrolled · Continue Day {currentDay}
      </div>
    );
  }

  return <Button onClick={onEnroll}>Enroll in program</Button>;
}
