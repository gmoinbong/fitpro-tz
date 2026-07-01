'use client';

import type { ProgramDay } from '@/entities/program/model';

interface DayViewerProps {
  day: ProgramDay;
}

export function DayViewer({ day }: DayViewerProps) {
  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>
          Day {day.dayNumber}
        </p>
        <h2 style={{ margin: 0, fontSize: 22 }}>{day.title}</h2>
      </header>

      {day.videoUrl ? (
        <video
          controls
          src={day.videoUrl}
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            background: '#f3f4f6',
            borderRadius: 8,
            color: '#6b7280',
          }}
        >
          Video not available
        </div>
      )}

      <section>
        <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Exercise</h3>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>
          {day.exerciseDescription}
        </p>
      </section>

      <section
        style={{
          padding: 16,
          borderRadius: 8,
          background: '#fffbeb',
          border: '1px solid #fde68a',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#92400e' }}>
          Coach tip
        </h3>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#78350f' }}>{day.coachTip}</p>
      </section>
    </article>
  );
}
