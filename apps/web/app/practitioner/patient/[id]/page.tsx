import { Card } from "@brightpath/ui/src/Card";

export default function PatientProfile({ params }: { params: { id: string }}) {
  const { id } = params;
  return (
    <div className="space-y-4">
      <Card title={`Patient • ${id}`}>
        <p>Demographics, contacts, consent status...</p>
      </Card>
      <Card title="PROM history">
        <p>Timeline chart and subscales (wireframe).</p>
      </Card>
    </div>
  );
}
