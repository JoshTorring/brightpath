import Link from "next/link";
import { Card } from "@brightpath/ui/src/Card";

export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="For families">
        <p className="mb-3">A calm place to track progress and learn together.</p>
        <Link className="inline-block bg-nhs-blue text-white px-4 py-2 rounded-2xl" href="/family/dashboard">
          Go to dashboard
        </Link>
      </Card>
      <Card title="For practitioners">
        <p className="mb-3">See your patients and their PROM history.</p>
        <Link className="inline-block bg-nhs-blue text-white px-4 py-2 rounded-2xl" href="/practitioner">
          Open practitioner panel
        </Link>
      </Card>
    </div>
  );
}
