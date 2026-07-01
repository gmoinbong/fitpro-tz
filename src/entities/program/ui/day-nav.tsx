'use client';

import { Button } from '@/shared/ui';

interface DayNavProps {
  currentDay: number;
  totalDays: number;
  onDayChange: (day: number) => void;
}

export function DayNav({ currentDay, totalDays, onDayChange }: DayNavProps) {
  const isFirst = currentDay <= 1;
  const isLast = currentDay >= totalDays;

  return (
    <nav
      aria-label="Day navigation"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Button
          variant="secondary"
          disabled={isFirst}
          onClick={() => onDayChange(currentDay - 1)}
        >
          Previous
        </Button>
        <span style={{ alignSelf: 'center', fontSize: 14, color: '#666' }}>
          Day {currentDay} of {totalDays}
        </span>
        <Button
          variant="secondary"
          disabled={isLast}
          onClick={() => onDayChange(currentDay + 1)}
        >
          Next
        </Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => onDayChange(day)}
            aria-current={day === currentDay ? 'page' : undefined}
            style={{
              minWidth: 36,
              height: 36,
              borderRadius: 6,
              border: day === currentDay ? '2px solid #111' : '1px solid #ccc',
              background: day === currentDay ? '#111' : '#fff',
              color: day === currentDay ? '#fff' : '#111',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: day === currentDay ? 600 : 400,
            }}
          >
            {day}
          </button>
        ))}
      </div>
    </nav>
  );
}
