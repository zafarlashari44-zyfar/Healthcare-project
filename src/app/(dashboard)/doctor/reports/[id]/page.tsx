import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Calendar,
  Download,
  FileText,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function getRiskStyle(risk?: string | null) {
  const value = (risk ?? "").toLowerCase();

  if (value.includes("high")) {
    return {
      badge: "bg-red-100 text-red-700 border-red-200",
      card: "border-red-200 bg-red-50/60",
      text: "text-red-700",
      label: "High Risk",
    };
  }

  if (value.includes("medium") || value.includes("moderate")) {
    return {
      badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
      card: "border-yellow-200 bg-yellow-50/60",
      text: "text-yellow-700",
      label: "Moderate Risk",
    };
  }

  return {
    badge: "bg-green-100 text-green-700 border-green-200",
    card: "border-green-200 bg-green-50/60",
    text: "text-green-700",
    label: "Low Risk",
  };
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report, error } = await supabase
    .from("agent_outputs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !report) {
    return <p className="text-red-500">Report not found.</p>;
  }

  const riskStyle = getRiskStyle(report.risk_flag ?? report.urgency_level);
  const confidence =
    typeof report.confidence === "number"
      ? `${Math.round(report.confidence * 100)}%`
      : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/doctor/reports"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">ECG Report</h1>
          <span className={`rounded-full border px-3 py-1 text-sm ${riskStyle.badge}`}>
            {riskStyle.label}
          </span>
        </div>
        <p className="mt-2 text-muted-foreground">
          Patient ID: {report.patient_external_id}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className={`rounded-2xl border p-6 ${riskStyle.card}`}>
          <HeartPulse className={`mb-4 h-8 w-8 ${riskStyle.text}`} />
          <p className="text-sm text-muted-foreground">Prediction</p>
          <h2 className={`mt-2 text-2xl font-bold ${riskStyle.text}`}>
            {report.prediction ?? "Unknown"}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">Confidence</p>
          <p className={`text-xl font-bold ${riskStyle.text}`}>{confidence}</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <ShieldCheck className="mb-4 h-8 w-8 text-blue-600" />
          <p className="text-sm text-muted-foreground">Urgency</p>
          <h2 className="mt-2 text-2xl font-bold">
            {report.urgency_level ?? "Routine"}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">Risk Flag</p>
          <p className="font-semibold">{report.risk_flag ?? "N/A"}</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <FileText className="mb-4 h-8 w-8 text-purple-600" />
          <p className="text-sm text-muted-foreground">ECG Region</p>
          <h2 className="mt-2 text-2xl font-bold">
            {report.dominant_ecg_region ?? "N/A"}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">ECG Lead</p>
          <p className="font-semibold">{report.ecg_lead ?? "N/A"}</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <Calendar className="mb-4 h-8 w-8 text-indigo-600" />
          <p className="text-sm text-muted-foreground">Generated At</p>
          <h2 className="mt-2 text-xl font-bold">
            {new Date(report.generated_at ?? report.created_at).toLocaleString()}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">Sample ID</p>
          <p className="font-semibold">{report.sample_id ?? "N/A"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Clinical Summary</h2>

          <p className="mt-4 text-sm font-medium">EHR Triage Note</p>
          <div className="mt-2 rounded-xl border bg-muted/40 p-4 text-sm">
            {report.ehr_triage_note ?? "No triage note available."}
          </div>

          <p className="mt-4 text-sm font-medium">Suggested Next Action</p>
          <div className="mt-2 rounded-xl border bg-muted/40 p-4 text-sm">
            {report.suggested_next_action ?? "No action suggested."}
          </div>

          <p className="mt-4 text-sm font-medium">Family Reassurance Message</p>
          <div className="mt-2 rounded-xl border bg-muted/40 p-4 text-sm">
            {report.family_reassurance_message ?? "No message available."}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">AI Technical Insights</h2>
          </div>

          <p className="mt-4 text-sm font-medium">Doctor Technical Alert</p>
          <div className="mt-2 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
            {report.doctor_technical_alert ?? "No technical alert available."}
          </div>

          <p className="mt-4 text-sm font-medium">Extracted Medical Entities</p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-xl border bg-muted/40 p-4 text-xs">
            {JSON.stringify(report.extracted_medical_entities, null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        This report was AI-generated and should be reviewed with clinical judgment.
      </div>
    </div>
  );
}