"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginRequest } from "@brightpath/ui/src/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await loginRequest({ email, password });
      const needsConsentRedirect = user.needsConsent && (user.role === "parent" || user.role === "patient");
      if (needsConsentRedirect) {
        router.push("/consent");
        return;
      }

      if (user.role === "practitioner") {
        router.push("/practitioner");
      } else if (user.role === "admin") {
        router.push("/profile");
      } else {
        router.push("/family/dashboard");
      }
    } catch (err) {
      setError((err as Error).message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-slate-700">Use this simple form to sign in to your BrightPath account.</p>
        <p className="text-sm text-slate-600 mt-1">Check your inbox to verify your email before signing in.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
            placeholder="Enter your secure password"
          />
          <p className="text-sm text-slate-600">
            Passwords must include 12+ characters, upper/lowercase letters, a number, and a symbol.
          </p>
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-nhs-blue text-white font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#024ca1] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>

      <p className="text-sm text-slate-700">
        New here? Visit the <Link className="text-nhs-blue underline" href="/">homepage</Link> to learn more.
      </p>
    </div>
  );
}
