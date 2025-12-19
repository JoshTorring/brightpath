"use client";
import { Card } from "@brightpath/ui/src/Card";
import Link from "next/link";
import { useSession } from "@brightpath/ui/src/auth";

const patients = [
  { id: "c1", name: "Alex", lastProm: "2025-10-20", change: "+5%" },
  { id: "c2", name: "Maya", lastProm: "2025-10-15", change: "-2%" },
];

export default function PractitionerPanel() {
  const { user, loading } = useSession();

  if (loading) {
    return <Card title="Checking access">Loading your practitioner workspace…</Card>;
  }

  if (!user) {
    return <Card title="Please sign in">You need to sign in to view patient panels.</Card>;
  }

  if (user.role !== "practitioner" && user.role !== "admin") {
    return <Card title="Access restricted">This workspace is limited to practitioner accounts.</Card>;
  }

  return (
    <Card title="Your patients">
      <table className="w-full text-left">
        <thead>
          <tr><th className="py-2">Name</th><th>Last PROM</th><th>Change</th><th></th></tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.id} className="border-t">
              <td className="py-2">{p.name}</td>
              <td>{p.lastProm}</td>
              <td>{p.change}</td>
              <td><Link className="text-nhs-blue underline" href={`/practitioner/patient/${p.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
