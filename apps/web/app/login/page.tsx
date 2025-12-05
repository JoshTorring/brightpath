"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { writeAuthStatus } from "@brightpath/ui/src/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    writeAuthStatus(true);
    router.push("/profile");
  };

  return (
    <div className="max-w-xl space-y-6 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-slate-700">Use this simple form to sign in to your BrightPath account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-800">
            Name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
            placeholder="Pat Example"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
            placeholder="pat@example.nhs.uk"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-nhs-blue text-white font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#024ca1]"
        >
          Continue to profile
        </button>
      </form>

      <p className="text-sm text-slate-700">
        New here? Visit the <Link className="text-nhs-blue underline" href="/">homepage</Link> to learn more.
      </p>
    </div>
  );
}
