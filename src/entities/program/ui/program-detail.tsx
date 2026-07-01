'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Program } from '@/entities/program/model';
import type { ProgramEnrollment } from '@/entities/program/model/progress';
import {
  enroll,
  getEnrollment,
  setCurrentDay,
} from '@/entities/program/lib/progress-storage';
import { DayNav } from './day-nav';
import { DayViewer } from './day-viewer';
import { EnrollButton } from './enroll-button';

interface ProgramDetailProps {
  program: Program;
  initialDay?: string;
}

function clampDay(day: number, totalDays: number): number {
  if (totalDays <= 0) return 1;
  return Math.min(Math.max(day, 1), totalDays);
}

function parseInitialDay(
  raw: string | undefined,
  enrollment: ProgramEnrollment | null,
  totalDays: number,
): number {
  const fromUrl = raw ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isNaN(fromUrl)) {
    return clampDay(fromUrl, totalDays);
  }
  if (enrollment) {
    return clampDay(enrollment.currentDay, totalDays);
  }
  return 1;
}

export function ProgramDetail({ program, initialDay }: ProgramDetailProps) {
  const router = useRouter();
  const totalDays = program.daysCount || program.days.length;

  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = getEnrollment(program.id);
    setEnrollment(stored);
    setActiveDay(parseInitialDay(initialDay, stored, totalDays));
    setHydrated(true);
  }, [program.id, initialDay, totalDays]);

  const currentDayData = useMemo(
    () => program.days.find((d) => d.dayNumber === activeDay) ?? program.days[0],
    [program.days, activeDay],
  );

  const handleDayChange = useCallback(
    (day: number) => {
      const nextDay = clampDay(day, totalDays);
      setActiveDay(nextDay);
      router.replace(`/programs/${program.id}?day=${nextDay}`, { scroll: false });

      if (enrollment) {
        const updated = setCurrentDay(program.id, nextDay);
        if (updated) setEnrollment(updated);
      }
    },
    [enrollment, program.id, router, totalDays],
  );

  const handleEnroll = useCallback(() => {
    const next = enroll(program.id);
    setCurrentDay(program.id, activeDay);
    setEnrollment(getEnrollment(program.id) ?? next);
  }, [activeDay, program.id]);

  if (!hydrated) {
    return <p style={{ color: '#666' }}>Loading progress…</p>;
  }

  if (!currentDayData) {
    return <p>This program has no training days yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Link href="/programs" style={{ color: '#2563eb', fontSize: 14, textDecoration: 'none' }}>
        ← Back to catalog
      </Link>

      <header>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>{program.category}</p>
        <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>{program.title}</h1>
        <p style={{ margin: '0 0 16px', color: '#444', lineHeight: 1.6 }}>
          {program.description}
        </p>
        <EnrollButton
          isEnrolled={Boolean(enrollment)}
          currentDay={enrollment?.currentDay ?? activeDay}
          onEnroll={handleEnroll}
        />
      </header>

      <DayNav
        currentDay={activeDay}
        totalDays={totalDays}
        onDayChange={handleDayChange}
      />

      <DayViewer day={currentDayData} />
    </div>
  );
}
