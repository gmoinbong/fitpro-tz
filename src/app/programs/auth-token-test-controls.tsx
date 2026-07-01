'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';

const AUTH_TOKEN_KEY = 'fitplan_auth_token';

type TestTokenPreset = 'valid' | 'invalid' | 'none';

function applyTestTokenPreset(preset: TestTokenPreset): void {
  const value =
    preset === 'valid' ? 'validtoken' : preset === 'invalid' ? 'invalid' : '';

  localStorage.setItem(AUTH_TOKEN_KEY, value);
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(value)}; path=/; max-age=86400`;
}

export function AuthTokenTestControls() {
  const router = useRouter();

  function handleTestTokenChange(preset: TestTokenPreset) {
    applyTestTokenPreset(preset);
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <Button type="button" variant="secondary" onClick={() => handleTestTokenChange('valid')}>
        Valid token
      </Button>
      <Button type="button" variant="secondary" onClick={() => handleTestTokenChange('invalid')}>
        Invalid token
      </Button>
      <Button type="button" variant="secondary" onClick={() => handleTestTokenChange('none')}>
        No token
      </Button>
    </div>
  );
}
