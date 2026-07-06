import Link from "next/link";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DoctorDashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: patientsCount },
    { count: appointmentsCount },
    { count: prescriptionsCount },
    { data: recentPatients },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("prescriptions").select("*", { count: "exact", head: true }),
    supabase
      .from("patients")
      .select(`
        id,
        created_at,
        profiles (
          full_name,
          email,
          role
        )
      `)
      .limit(5),
  ]);

  const realRecentPatients = (recentPatients ?? []).filter((patient) => {
    const profile = Array.isArray(patient.profiles)
      ? patient.profiles[0]
      : patient.profiles;

    return profile?.role === "patient";
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Doctor Dashboard</h2>
        <p className="text-sm text-gray-500">Live overview from Supabase.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold">{patientsCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Appointments</p>
              <p className="text-2xl font-bold">{appointmentsCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <ClipboardList className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Prescriptions</p>
              <p className="text-2xl font-bold">{prescriptionsCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Patients</h3>
            <Link href="/doctor/patients" className="text-sm text-blue-600">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {realRecentPatients.map((patient) => {
              const profile = Array.isArray(patient.profiles)
                ? patient.profiles[0]
                : patient.profiles;

              return (
                <Link
                  key={patient.id}
                  href={`/doctor/patients/${patient.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {profile?.full_name ?? "Unknown Patient"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {profile?.email ?? "No email"}
                    </p>
                  </div>

                  <Badge variant="success">patient</Badge>
                </Link>
              );
            })}

            {realRecentPatients.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                No recent patients found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}