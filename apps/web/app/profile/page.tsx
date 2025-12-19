"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "@brightpath/ui/src/auth";

export default function ProfilePage() {
  const { user, loading, refresh } = useSession();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="max-w-xl space-y-4 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-slate-700">Loading your profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl space-y-4 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-slate-700">You are currently logged out.</p>
        <Link href="/login" className="inline-block text-white bg-nhs-blue px-4 py-2 rounded-full font-semibold">
          Log in to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="text-slate-700">Manage your BrightPath details and see quick links to your account.</p>
      </div>

      <div className="space-y-3 text-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Preferred name</p>
            <p className="text-sm text-slate-600">{user.name || "Not provided"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            user.emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {user.emailVerified ? "Email verified" : "Verify email"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
          <div className="text-sm text-slate-600 capitalize">Role: {user.role}</div>
        </div>
      </div>

      {user.needsConsent && (
        <div className="space-y-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm font-semibold text-amber-800">Consent needed</p>
          <p className="text-sm text-amber-800">
            We need recorded consent for child accounts before sharing dashboards.
          </p>
          <Link href="/consent" className="inline-block text-white bg-nhs-blue px-4 py-2 rounded-full font-semibold">
            Provide consent
          </Link>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-slate-700">Want to switch accounts?</p>
        <Link href="/logout" className="inline-block text-white bg-nhs-blue px-4 py-2 rounded-full font-semibold">
          Log out
        </Link>
      </div>
    </div>
  );
}
