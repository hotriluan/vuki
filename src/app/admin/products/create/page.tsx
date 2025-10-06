import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CreateProductForm from './createFormClient';

export default async function CreateProductPage() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  const categories = await prisma.category.findMany();
  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h1>
      <CreateProductForm categories={categories} />
    </div>
  );
}
