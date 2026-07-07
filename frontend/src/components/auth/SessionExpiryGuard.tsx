"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthSession,
  getAuthSessionExpiresAt,
  hasValidAuthSession,
} from "@/lib/auth/auth-session";

const protectedRoutes = [
  "/dashboard",
  "/dashboard-candidato",
  "/candidaturas/nova",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function SessionExpiryGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isProtectedRoute(pathname)) {
      return;
    }

    function redirectToLogin() {
      clearAuthSession();
      const redirect = `${pathname}${window.location.search}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }

    if (!hasValidAuthSession()) {
      redirectToLogin();
      return;
    }

    const expiresAt = getAuthSessionExpiresAt();
    if (!expiresAt) {
      redirectToLogin();
      return;
    }

    const delay = Math.max(expiresAt - Date.now(), 0);
    const timeoutId = window.setTimeout(redirectToLogin, delay);
    const intervalId = window.setInterval(() => {
      if (!hasValidAuthSession()) {
        redirectToLogin();
      }
    }, 30_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [pathname, router]);

  return null;
}
