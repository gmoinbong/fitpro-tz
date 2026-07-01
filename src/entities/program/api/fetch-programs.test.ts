import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPrograms } from './fetch-programs';
import { getPrograms } from './get-programs';

vi.mock('./get-programs', () => ({
  getPrograms: vi.fn(),
}));

const mockedGetPrograms = vi.mocked(getPrograms);

const samplePrograms = [{ id: 1, title: 'Test Program' }];

describe('fetchPrograms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns programs on success', async () => {
    mockedGetPrograms.mockResolvedValue(samplePrograms as never);

    const result = await fetchPrograms('en');

    expect(result).toEqual({ ok: true, programs: samplePrograms });
  });

  it('returns error when data layer fails', async () => {
    mockedGetPrograms.mockRejectedValue(new Error('CMS down'));

    const result = await fetchPrograms('en');

    expect(result).toEqual({
      ok: false,
      error: 'Programs are temporarily unavailable. Please try again later.',
    });
  });
});
