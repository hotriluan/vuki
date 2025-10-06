import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function CreateCategoryPage() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">Thêm danh mục</h1>
      <form method="post" action="/api/admin/categories/create" className="space-y-4">
        <div>
          <label className="block mb-1">Tên</label>
          <input name="name" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Slug</label>
          <input name="slug" required className="w-full border rounded px-3 py-2" />
        </div>
        <button className="bg-black text-white px-4 py-2 rounded w-full" type="submit">Tạo</button>
      </form>
    </div>
  );
}
