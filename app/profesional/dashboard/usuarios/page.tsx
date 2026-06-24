import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Shield } from "lucide-react";
import { getAllUsers } from "./actions";
import { UserActions } from "./user-actions";

function formatDate(date: Date | null | undefined) {
  if (!date) return "No registrada";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRole(role: string) {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "PROFESSIONAL":
      return "Profesional";
    case "PATIENT":
      return "Paciente";
    default:
      return role;
  }
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const result = await getAllUsers();
  const users = result.success && "users" in result ? result.users : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Shield className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Gestión de usuarios
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Administrá profesionales y pacientes. Podés validar, desvalidar o
            eliminar cuentas.
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            No hay usuarios registrados.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Nombre
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Rol
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Registro
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => {
                  const isProfessional = user.role === "PROFESSIONAL";
                  const profile = user.professionalProfile;
                  const isValidated = profile?.isValidated ?? false;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {user.name || "Sin nombre"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {user.email || "Sin email"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isProfessional ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              isValidated
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {isValidated ? "Aprobado" : "Pendiente"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <UserActions
                          userId={user.id}
                          profileId={profile?.id}
                          isValidated={isValidated}
                          role={user.role}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
