import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const COOKIE_NAME = 'sid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionContext {
  sessionId: string;
  userId: string;
  isNewSession: boolean;
}

function generateId(len = 32) {
  return crypto.randomBytes(len).toString('hex');
}

export async function getOrCreateSession(): Promise<SessionContext> {
  const store = await cookies();
  let sid = store.get(COOKIE_NAME)?.value;
  let isNew = false;
  if (!sid) {
    sid = generateId(16);
    isNew = true;
  }
  // Tìm session hiện có
  let session = await prisma.session.findUnique({ where: { id: sid } });
  if (!session) {
    // tạo user ẩn danh (email giả để unique) – có thể dùng prefix anon_
    const anonEmail = `anon_${sid}@example.local`; // không dùng cho gửi mail
    const user = await prisma.user.create({ data: { email: anonEmail, passwordHash: '' } });
    session = await prisma.session.create({ data: { id: sid, userId: user.id } });
    isNew = true;
  }
  // cập nhật lastSeen implicit qua @updatedAt
  await prisma.session.update({ where: { id: session.id }, data: { userId: session.userId } });
  // set cookie (httpOnly)
  if (isNew) {
    store.set({
      name: COOKIE_NAME,
      value: sid,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });
  }
  return { sessionId: session.id, userId: session.userId, isNewSession: isNew };
}

export async function requireSession(): Promise<SessionContext> {
  return getOrCreateSession();
}
