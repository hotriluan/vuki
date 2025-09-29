import { NextResponse } from 'next/server';

// Endpoint mock: nhận Web Vitals và logging.
// Có thể thay bằng gửi đến external observability platform (Datadog, New Relic...).

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (process.env.NODE_ENV !== 'production') {
      // Chỉ log ở dev để tránh noise
      console.log('[web-vitals]', body.metric, body.value, body.label);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
