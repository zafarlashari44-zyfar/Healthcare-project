import Link from "next/link";
import { Eye } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function DoctorPatientsPage() {
  const supabase = createAdminClient();

  const { data: patients, error } = await supabase
    .from("patients")
    .select(`
      id,
      blood_type,
      emergency_contact_name,
      emergency_contact_phone,
      insurance_provider,
      profiles (
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        role
      )
    `)
    .limit(50);

  if (error) {
    throw new Error(`Unable to load patients: ${error.message}`);
  }

  const realPatients = (patients ?? []).filter((patient) => {
    const profile = Array.isArray(patient.profiles)
      ? patient.profiles[0]
      : patient.profiles;

    return profile?.role === "patient";
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Patients</h2>
        <p className="text-sm text-gray-500">
          {realPatients.length} real patient records
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">
                  Patient
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Gender
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Blood
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Emergency Contact
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {realPatients.map((patient) => {
                const profile = Array.isArray(patient.profiles)
                  ? patient.profiles[0]
                  : patient.profiles;

                const name = profile?.full_name ?? "Unknown Patient";

                return (
                  <tr key={patient.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {profile?.email ?? "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                      {profile?.gender ?? "Not set"}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-700">
                      {patient.blood_type ?? "Not set"}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-700">
                      <p>{patient.emergency_contact_name ?? "Not set"}</p>
                      <p className="text-xs text-gray-400">
                        {patient.emergency_contact_phone ?? ""}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="success">patient</Badge>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <Link href={`/doctor/patients/${patient.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
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