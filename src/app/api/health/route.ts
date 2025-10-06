import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const buildTime = process.env.BUILD_TIME || new Date().toISOString();
const version = process.env.APP_VERSION || '0.1.0';

export function GET() {
  return NextResponse.json({ ok: true, status: 'ok', version, buildTime, timestamp: new Date().toISOString() });
}
