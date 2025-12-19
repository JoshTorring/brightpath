"use client";
import { Card } from "@brightpath/ui/src/Card";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSession } from "@brightpath/ui/src/auth";
import Link from "next/link";

const data = [
  { week: "W1", score: 10, inattention: 12, hyperactivity: 8 },
  { week: "W2", score: 11, inattention: 13, hyperactivity: 9 },
  { week: "W3", score: 12, inattention: 14, hyperactivity: 10 },
  { week: "W4", score: 13, inattention: 15, hyperactivity: 11 },
];

export default function FamilyDashboard() {
  const { user, loading } = useSession();

  if (loading) {
    return <Card title="Loading">Checking your session…</Card>;
  }

  if (!user) {
    return (
      <Card title="Log in required">
        <p className="text-sm text-slate-700">Sign in to view your family dashboard.</p>
        <Link className="text-nhs-blue underline" href="/login">
          Go to login
        </Link>
      </Card>
    );
  }

  if (user.role !== "parent" && user.role !== "patient") {
    return <Card title="Access restricted">The family dashboard is only available to family accounts.</Card>;
  }

  return (
    <div className="space-y-4">
      <Card title="Progress over time">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="score" />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Focus areas">
        <ul className="list-disc ml-6">
          <li>Try short movement breaks every 20 minutes.</li>
          <li>Use a visual schedule for mornings.</li>
        </ul>
      </Card>
    </div>
  );
}
