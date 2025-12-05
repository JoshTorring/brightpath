"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { writeAuthStatus } from "@brightpath/ui/src/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    writeAuthStatus(false);
    const timer = setTimeout(() => router.push("/"), 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-xl space-y-4 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Logging out</h1>
      <p className="text-slate-700">We are ending your session and taking you back to the homepage.</p>
    </div>
  );
}
