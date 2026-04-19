'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = new Set(['/login', '/signup']);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_ROUTES.has(pathname);

    if (!user && !isPublic) {
      router.replace('/login');
      return;
    }

    if (user && isPublic) {
      router.replace('/');
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return <p className="p-6 text-sm text-center text-gray-500">Loading...</p>;
  }

  const isPublic = PUBLIC_ROUTES.has(pathname);
  if (!user && !isPublic) return null;
  if (user && isPublic) return null;

  return <>{children}</>;
}
