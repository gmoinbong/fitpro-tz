import type { Program } from '@/entities/program/model';
import type { SupportedLocale } from '@/shared/lib';

const inflight = new Map<SupportedLocale, Promise<Program[]>>();

export function dedupe(
  locale: SupportedLocale,
  fn: () => Promise<Program[]>
): Promise<Program[]> {
  const existing = inflight.get(locale);
  if (existing) {
    return existing;
  }

  const promise = fn().finally(() => inflight.delete(locale));
  inflight.set(locale, promise);

  return promise;
}

export function clearInflight(): void {
  inflight.clear();
}
