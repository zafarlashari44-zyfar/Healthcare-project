import Link from "next/link";
import { Eye, FileText, HeartPulse, Search } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

function riskColor(risk?: string | null) {
  const value = (risk ?? "").toLowerCase();

  if (value.includes("high") || value.includes("critical")) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (value.includes("medium") || value.includes("moderate")) {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }

  if (value.includes("low")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (value.includes("normal")) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
}

function formatConfidence(confidence: unknown) {
  if (typeof confidence !== "number") return "N/A";
  return `${Math.round(confidence * 100)}%`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString();
}

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from("agent_outputs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load ECG reports: ${error.message}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ECG Reports</h1>
          <p className="text-muted-foreground">
            AI generated ECG analysis reports.
          </p>
        </div>

        <div className="rounded-xl border px-5 py-3">
          <p className="text-xs text-muted-foreground">Total Reports</p>
          <p className="text-2xl font-bold">{reports?.length ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search reports..."
          className="w-full bg-transparent outline-none"
        />
      </div>

      <div className="grid gap-6">
        {reports?.map((report) => (
          <div
            key={report.id}
            className="rounded-2xl border bg-card p-6 transition hover:shadow-xl"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <HeartPulse className="h-6 w-6 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {report.prediction ?? "Unknown"}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {report.patient_external_id ?? "No patient ID"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${riskColor(
                      report.risk_flag
                    )}`}
                  >
                    {report.risk_flag ?? "Unknown Risk"}
                  </span>

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {report.urgency_level ?? "Routine"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatConfidence(report.confidence)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Lead</p>
                  <p className="font-semibold">{report.ecg_lead ?? "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Region</p>
                  <p className="font-semibold">
                    {report.dominant_ecg_region ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Generated</p>
                  <p className="font-semibold">
                    {formatDate(report.created_at)}
                  </p>
                </div>
              </div>

              <Link
                href={`/doctor/reports/${report.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 transition hover:bg-blue-600 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                View Report
              </Link>
            </div>
          </div>
        ))}

        {!reports?.length && (
          <div className="rounded-2xl border p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

            <h3 className="text-xl font-semibold">No ECG Reports Found</h3>

            <p className="mt-2 text-muted-foreground">
              AI reports will appear here automatically after analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}