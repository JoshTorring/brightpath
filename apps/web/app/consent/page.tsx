"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitConsentRequest, useSession } from "@brightpath/ui/src/auth";

export default function ConsentPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [childName, setChildName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [childDob, setChildDob] = useState("");
  const [method, setMethod] = useState("digital");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "parent" && user.role !== "admin") {
      router.push("/");
    }
    if (user && !user.needsConsent && user.role !== "admin") {
      router.push("/family/dashboard");
    }
  }, [loading, router, user]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitConsentRequest({
        childName,
        preferredName,
        childDob,
        consentKind: "guardian-consent",
        method,
        details,
      });
      router.push("/family/dashboard");
    } catch (err) {
      setError((err as Error).message || "Unable to save consent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5 bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">Consent for child accounts</p>
        <h1 className="text-2xl font-semibold">Confirm parental consent</h1>
        <p className="text-slate-700">
          We need consent from a parent or guardian before creating or activating a child account. This keeps children’s data safe
          and ensures the right adult is involved.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="childName" className="block text-sm font-medium text-slate-800">
              Child&apos;s full name
            </label>
            <input
              id="childName"
              name="childName"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
              placeholder="Alex Example"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="preferredName" className="block text-sm font-medium text-slate-800">
              Preferred name (optional)
            </label>
            <input
              id="preferredName"
              name="preferredName"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
              placeholder="Lex"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="childDob" className="block text-sm font-medium text-slate-800">
            Date of birth
          </label>
          <input
            id="childDob"
            name="childDob"
            type="date"
            value={childDob}
            onChange={(e) => setChildDob(e.target.value)}
            required
            className="w-full md:w-1/2 rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="method" className="block text-sm font-medium text-slate-800">
            Consent method
          </label>
          <select
            id="method"
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full md:w-1/2 rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
          >
            <option value="digital">Digital consent</option>
            <option value="in-person">In person</option>
            <option value="phone">Phone confirmation</option>
          </select>
          <p className="text-sm text-slate-600">We capture the consent method and any supporting context.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="details" className="block text-sm font-medium text-slate-800">
            Notes (optional)
          </label>
          <textarea
            id="details"
            name="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-nhs-blue"
            placeholder="E.g. Verified identity via phone call on 2025-10-12"
          />
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-nhs-blue text-white font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#024ca1] disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save consent"}
          </button>
          <Link href="/family/dashboard" className="text-sm text-nhs-blue underline">
            Skip for now
          </Link>
        </div>
      </form>
    </div>
  );
}
