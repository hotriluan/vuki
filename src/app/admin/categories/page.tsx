import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DeleteCategoryForm from './DeleteCategoryForm';

export default async function CategoriesPage() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  // Đếm số sản phẩm mỗi danh mục (dùng join bảng trung gian)
  const productCounts = await prisma.productCategory.groupBy({ by: ['categoryId'], _count: { categoryId: true } });
  const countMap: Record<string, number> = {};
  productCounts.forEach(pc => { countMap[pc.categoryId] = pc._count.categoryId; });
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <a href="/admin/categories/create" className="bg-black text-white px-4 py-2 rounded text-sm">+ Thêm</a>
      </div>
      <table className="w-full text-sm border divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Slug</th>
            <th className="p-2 text-left">Sản phẩm</th>
            <th className="p-2 text-left">Sửa</th>
            <th className="p-2 text-left">Xoá</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.slug}</td>
              <td className="p-2">{countMap[c.id] || 0}</td>
              <td className="p-2"><a href={`/admin/categories/${c.id}/edit`} className="text-blue-600 underline">Sửa</a></td>
              <td className="p-2"><DeleteCategoryForm id={c.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
