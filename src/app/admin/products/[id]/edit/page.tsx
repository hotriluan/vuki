import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EditProductForm from './editFormClient';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { categories: true, variants: true } });
  const categories = await prisma.category.findMany();
  if (!product) return <div className="p-8">Không tìm thấy sản phẩm</div>;
  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">Sửa sản phẩm</h1>
      <EditProductForm product={product as any} categories={categories} />
    </div>
  );
}
