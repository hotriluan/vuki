import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

interface WarningItem { productId: string; slug: string; name: string; type: string; message: string }

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const products = await (prisma as any).product.findMany({ include: { media: true, categories: true } });
    const warnings: WarningItem[] = [];
    const now = new Date();
    for (const p of products) {
      const hasCategory = (p.categories || []).length > 0;
      const primaryMedia = p.media?.find((m: any) => m.isPrimary) || null;
      const primary = p.primaryImage || primaryMedia?.url || (Array.isArray(p.images) ? p.images[0] : null);
      if (!primary) {
        warnings.push({ productId: p.id, slug: p.slug, name: p.name, type: 'primaryImage.missing', message: 'Thiếu ảnh đại diện (primaryImage).' });
      } else {
        // Enforce alt presence for chosen primary media if media record exists
        if (primaryMedia && primaryMedia.type === 'IMAGE' && !primaryMedia.alt) {
          warnings.push({ productId: p.id, slug: p.slug, name: p.name, type: 'primaryImage.alt.missing', message: 'Thiếu alt cho ảnh đại diện.' });
        }
      }
      if (p.media && p.media.length) {
        for (const m of p.media) {
          if (m.type === 'IMAGE' && !m.alt) {
            warnings.push({ productId: p.id, slug: p.slug, name: p.name, type: 'media.alt.missing', message: 'Media thiếu alt text.' });
            break;
          }
        }
      }
      if (p.status === 'DRAFT' && hasCategory === false) {
        warnings.push({ productId: p.id, slug: p.slug, name: p.name, type: 'draft.noCategory', message: 'Sản phẩm DRAFT chưa gán danh mục.' });
      }
      if (p.status === 'SCHEDULED' && (!p.publishedAt || new Date(p.publishedAt) <= now)) {
        warnings.push({ productId: p.id, slug: p.slug, name: p.name, type: 'scheduled.invalid', message: 'SCHEDULED nhưng thời gian publish không hợp lệ.' });
      }
    }
    return NextResponse.json({ count: warnings.length, warnings });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to compute warnings', detail: e?.message || 'unknown' }, { status: 500 });
  }
}
