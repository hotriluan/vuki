import { NextResponse } from 'next/server';

const buildTime = process.env.BUILD_TIME || new Date().toISOString();
const version = process.env.APP_VERSION || '0.1.0';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    version,
    buildTime,
    timestamp: new Date().toISOString()
  });
}
