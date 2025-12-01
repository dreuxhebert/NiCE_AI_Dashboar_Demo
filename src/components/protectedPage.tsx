"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

interface ProtectedPageProps {
  children: ReactNode;
  required?: string[];  // optional, defaults to []
}

export default function ProtectedPage({
  children,
  required = []
}: ProtectedPageProps) {
  const { permissions, authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "guest") {
      router.replace("/no-access?reason=login");
      return;
    }

    const allowed = required.every((p) => permissions.includes(p));
    if (!allowed) {
      router.replace("/no-access?reason=permissions");
    }
  }, [authStatus, permissions]);

  return children;
}
