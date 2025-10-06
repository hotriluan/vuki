import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DeleteProductForm from './DeleteProductForm'; // legacy single delete (kept if needed elsewhere)
import dynamic from 'next/dynamic';
const BulkActionsClient = dynamic(() => import('./BulkActionsClient').then(m => m.BulkActionsClient), { ssr: false });
const ValidationWarningsPanel = dynamic(() => import('./ValidationWarningsPanel').then(m => m.ValidationWarningsPanel), { ssr: false });

export default async function AdminProductsPage() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  // Cast to any in case generated types haven't picked up deletedAt yet after schema change
  const products: any[] = await prisma.product.findMany({
    where: { deletedAt: null } as any,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      status: true,
      featured: true,
      publishedAt: true,
      categories: { include: { category: true } },
      variants: true,
    },
  });
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
      <a href="/admin/products/create" className="inline-block mb-4 bg-black text-white px-4 py-2 rounded">+ Thêm sản phẩm</a>
      <div className="space-y-6">
        <div className="w-full">
          <BulkActionsClient products={products} />
        </div>
        <div className="w-full">
          <ValidationWarningsPanel />
        </div>
      </div>
    </div>
  );
}
