// Task 1: Implement this endpoint.
// See README.md for requirements.

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ todo: 'Implement Task 1' }), {
    status: 501,
  });
}
