"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isAlwaysAccessible =
    pathname === "/" || pathname.startsWith("/opportunity/");

  useEffect(() => {
    if (!loading && !user && !isAlwaysAccessible && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (!loading && user && isAuthRoute) {
      router.replace("/");
    }
  }, [isAlwaysAccessible, isAuthRoute, loading, router, user]);

  if (loading && !isAlwaysAccessible && !isAuthRoute) {
    return <p className="p-6 text-sm text-center text-gray-500">Loading...</p>;
  }

  if (!loading && !user && !isAlwaysAccessible && !isAuthRoute) return null;
  if (!loading && user && isAuthRoute) return null;

  return <>{children}</>;
}
