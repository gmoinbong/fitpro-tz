// Task 4: Implement this endpoint.
// See README.md for requirements.

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return new Response(JSON.stringify({ todo: 'Implement Task 4' }), {
    status: 501,
  });
}
