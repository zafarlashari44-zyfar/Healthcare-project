import { Pill, Printer } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, formatDate } from "@/lib/utils";

const statusVariant = {
  active: "success",
  completed: "secondary",
  expired: "destructive",
} as const;

type Medication = {
  name?: string;
  dosage?: string;
  duration?: string;
};

function parseMedications(value: unknown): Medication[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => item as Medication);
}

export default async function PrescriptionsPage() {
  const supabase = createAdminClient();

  const { data: prescriptions, error } = await supabase
    .from("prescriptions")
    .select(`
      id,
      medications,
      instructions,
      is_active,
      valid_until,
      created_at,
      patients (
        id,
        profiles (
          full_name,
          email,
          role
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load prescriptions: ${error.message}`);
  }

  const realPrescriptions = (prescriptions ?? []).filter((rx) => {
    const patient = Array.isArray(rx.patients) ? rx.patients[0] : rx.patients;
    const profile = Array.isArray(patient?.profiles)
      ? patient.profiles[0]
      : patient?.profiles;

    return profile?.role === "patient";
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Prescriptions</h2>
        <p className="text-sm text-gray-500">
          {realPrescriptions.length} real records
        </p>
      </div>

      <div className="space-y-3">
        {realPrescriptions.map((rx) => {
          const patient = Array.isArray(rx.patients)
            ? rx.patients[0]
            : rx.patients;

          const profile = Array.isArray(patient?.profiles)
            ? patient.profiles[0]
            : patient?.profiles;

          const name = profile?.full_name ?? "Unknown Patient";
          const medications = parseMedications(rx.medications);

          const status = rx.is_active ? "active" : "completed";

          return (
            <Card key={rx.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{name}</p>
                        <Badge variant={statusVariant[status]}>{status}</Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-gray-700"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      Issued: {formatDate(rx.created_at)} · Valid until:{" "}
                      {rx.valid_until ? formatDate(rx.valid_until) : "Not set"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {medications.length > 0 ? (
                        medications.map((med, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5"
                          >
                            <Pill className="h-3 w-3 text-green-600 shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-800">
                                {med.name ?? "Medication"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {med.dosage ?? "No dosage"}
                                {med.duration ? ` · ${med.duration}` : ""}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">
                          No medications listed.
                        </p>
                      )}
                    </div>

                    {rx.instructions && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Note: {rx.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}