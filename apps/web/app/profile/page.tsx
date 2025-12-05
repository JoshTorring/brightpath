"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readAuthStatus } from "@brightpath/ui/src/auth";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(readAuthStatus());
  }, []);

  if (!isLoggedIn) {
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
            <p className="text-sm text-slate-600">Pat Example</p>
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">Verified</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-slate-600">pat@example.nhs.uk</p>
          </div>
          <Link className="text-nhs-blue font-semibold" href="/login">
            Update details
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-700">Want to switch accounts?</p>
        <Link href="/logout" className="inline-block text-white bg-nhs-blue px-4 py-2 rounded-full font-semibold">
          Log out
        </Link>
      </div>
    </div>
  );
}
