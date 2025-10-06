"use client";
import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = (searchParams.get('from') || '/admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));

  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (s?.user && (s.user as any).role === 'ADMIN') router.replace('/admin');
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { redirect: false, email, password, callbackUrl: from });
    if (res?.error) {
      setError(res.error === 'CredentialsSignin' ? 'Sai email hoặc mật khẩu.' : 'Đăng nhập thất bại.');
      setLoading(false);
      return;
    }
    if (res?.ok) {
      router.replace(res.url || '/admin');
    } else {
      setLoading(false);
      setError('Không thể đăng nhập.');
    }
  };

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-xl font-semibold mb-4">Đăng nhập quản trị</h1>
      {error && (
        <div className="mb-4 text-sm text-red-600 border border-red-300 bg-red-50 px-3 py-2 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" type="email" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <input value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" type="password" required className="w-full border rounded px-3 py-2" />
        </div>
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-60" type="submit">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-6 text-xs text-gray-500 leading-relaxed">
        Mẹo: đảm bảo <code>NEXTAUTH_SECRET</code> & <code>NEXTAUTH_URL</code> đã thiết lập; user admin đã seed.
      </p>
    </div>
  );
}
