import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/entities/program/server', () => ({
  getProgramsByLocale: vi.fn().mockResolvedValue([{ id: 1, title: 'Test' }]),
}));

function makeRequest(url: string, headers?: Record<string, string>): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), { headers });
}

describe('GET /api/programs', () => {
  it('returns 401 without Authorization header', async () => {
    const response = await GET(makeRequest('/api/programs'));
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body).toEqual({ ok: false, error: 'Unauthorized' });
  });

  it('returns 401 with invalid token', async () => {
    const response = await GET(
      makeRequest('/api/programs', { Authorization: 'Bearer invalid' })
    );
    expect(response.status).toBe(401);
  });

  it('returns 200 with valid Bearer token', async () => {
    const response = await GET(
      makeRequest('/api/programs?locale=en', { Authorization: 'Bearer validtoken' })
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      ok: true,
      programs: [{ id: 1, title: 'Test' }],
    });
  });
});
