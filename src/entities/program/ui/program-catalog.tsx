'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Program } from '@/entities/program/model';
import type { ProgramEnrollment } from '@/entities/program/model/progress';
import {
  filterPrograms,
  PROGRAM_CATEGORIES,
  type ProgramCategory,
} from '@/entities/program/lib/filter-programs';
import { loadProgress } from '@/entities/program/lib/progress-storage';
import { EmptyState } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { ProgramCard } from './program-card';

interface ProgramCatalogProps {
  programs: Program[];
}

export function ProgramCatalog({ programs }: ProgramCatalogProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ProgramCategory>('All');
  const [enrollments, setEnrollments] = useState<Record<number, ProgramEnrollment>>({});

  useEffect(() => {
    setEnrollments(loadProgress().enrollments);
  }, []);

  const filtered = useMemo(
    () => filterPrograms(programs, { query, category }),
    [programs, query, category],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 12,
        }}
      >
        <Input
          label="Search programs"
          placeholder="Search by title or description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#444' }}>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProgramCategory)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 14,
              minWidth: 140,
            }}
          >
            {PROGRAM_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No programs match your search." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              enrollment={enrollments[program.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
