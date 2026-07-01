import { NextRequest } from 'next/server';

export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function normalizeLocale(raw: string): SupportedLocale {
  return SUPPORTED_LOCALES.includes(raw as SupportedLocale)
    ? (raw as SupportedLocale)
    : 'en';
}

export function resolveLocale(value?: string | null): SupportedLocale {
  return normalizeLocale(value ?? 'en');
}

export function parseLocale(req: NextRequest): SupportedLocale {
  return normalizeLocale(req.nextUrl.searchParams.get('locale') ?? 'en');
}
