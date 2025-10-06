import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'product.duplicate'
  | 'product.restore'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'order.status.update'
  | 'user.role.update'
  | 'search.rebuild';

interface AuditMetaBase {
  userId?: string;
  ip?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function logAdminAction(action: AuditAction, meta: AuditMetaBase = {}) {
  try {
    await prisma.auditLog.create({ data: { action, meta } });
  } catch (e) {
    // Avoid throwing in audit to not break main flow.
    console.error('[audit] failed', action, e);
  }
}
