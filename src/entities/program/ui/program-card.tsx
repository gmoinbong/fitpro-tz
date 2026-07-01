'use client';

import Link from 'next/link';
import type { Program } from '@/entities/program/model';
import type { ProgramEnrollment } from '@/entities/program/model/progress';

interface ProgramCardProps {
  program: Program;
  enrollment: ProgramEnrollment | null;
}

export function ProgramCard({ program, enrollment }: ProgramCardProps) {
  return (
    <Link
      href={`/programs/${program.id}`}
      style={{
        display: 'block',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #e5e5e5',
        textDecoration: 'none',
        color: 'inherit',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{program.title}</h2>
          <p style={{ margin: '0 0 8px', color: '#666', fontSize: 14 }}>
            {program.description}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: '#f3f4f6',
                color: '#374151',
              }}
            >
              {program.category}
            </span>
            <span style={{ color: '#888' }}>{program.daysCount} days</span>
          </div>
        </div>
        {enrollment ? (
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '4px 10px',
              borderRadius: 999,
              background: '#ecfdf5',
              color: '#047857',
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Continue · Day {enrollment.currentDay} of {program.daysCount}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
