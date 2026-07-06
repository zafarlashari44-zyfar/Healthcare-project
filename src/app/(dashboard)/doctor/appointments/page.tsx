import { Calendar, Clock } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";

const statusVariant = {
  scheduled: "secondary",
  confirmed: "info",
  completed: "success",
  cancelled: "destructive",
} as const;

function getStatusVariant(status: string | null) {
  if (status === "confirmed") return statusVariant.confirmed;
  if (status === "completed") return statusVariant.completed;
  if (status === "cancelled") return statusVariant.cancelled;
  return statusVariant.scheduled;
}

function getTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DoctorAppointmentsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      scheduled_at,
      duration_minutes,
      status,
      type,
      reason,
      notes,
      patients (
        id,
        profiles (
          full_name,
          email,
          role
        )
      )
    `)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load appointments: ${error.message}`);
  }

  const appointments = (data ?? []).filter((appt) => {
    const patient = Array.isArray(appt.patients)
      ? appt.patients[0]
      : appt.patients;

    const profile = Array.isArray(patient?.profiles)
      ? patient.profiles[0]
      : patient?.profiles;

    return profile?.role === "patient";
  });

  const today = new Date().toISOString().slice(0, 10);

  const todayAppointments = appointments.filter((appt) =>
    appt.scheduled_at?.startsWith(today),
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
        <p className="text-sm text-gray-500">
          {appointments.length} real appointments
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayAppointments.length}</p>
            <p className="text-sm text-gray-500">appointments today</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {todayAppointments.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                No appointments for today.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayAppointments.map((appt) => {
                  const patient = Array.isArray(appt.patients)
                    ? appt.patients[0]
                    : appt.patients;

                  const profile = Array.isArray(patient?.profiles)
                    ? patient.profiles[0]
                    : patient?.profiles;

                  const name = profile?.full_name ?? "Unknown Patient";

                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-4 px-5 py-3"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="w-20 text-sm font-medium">
                        {getTime(appt.scheduled_at)}
                      </span>

                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {appt.type} · {appt.duration_minutes}min
                        </p>
                      </div>

                      <Badge variant={getStatusVariant(appt.status)}>
                        {appt.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            All Appointments ({appointments.length})
          </CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">
                  Patient
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {appointments.map((appt) => {
                const patient = Array.isArray(appt.patients)
                  ? appt.patients[0]
                  : appt.patients;

                const profile = Array.isArray(patient?.profiles)
                  ? patient.profiles[0]
                  : patient?.profiles;

                const name = profile?.full_name ?? "Unknown Patient";

                return (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">
                          {name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(appt.scheduled_at)} · {getTime(appt.scheduled_at)}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {appt.type}
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(appt.status)}>
                        {appt.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}