"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";
import { getUsers, updateUserRole } from "@/services/user.service";
import { Role, User } from "@/types";
import { ROLES } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  ciudadano: "Ciudadano",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function UsersPage() {
  return (
    <Protected roles={["admin"]}>
      <UsersAdmin />
    </Protected>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((error) => toast.error(getErrorMessage(error, "No fue posible consultar los usuarios")))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (id: string, role: Role) => {
    try {
      setSavingId(id);
      const updated = await updateUserRole(id, role);
      setUsers((current) => current.map((item) => (item._id === id ? updated : item)));
      toast.success(`Rol actualizado a ${ROLE_LABEL[role]}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible actualizar el rol"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <p className="badge bg-green-50 text-green-700">Administración</p>
        <h1 className="mt-4 text-3xl font-black text-slate-950">Usuarios y roles</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          El registro público crea siempre usuarios con rol de ciudadano. Desde aquí el administrador
          asigna los roles de gestor y administrador.
        </p>

        <div className="card mt-8 p-5">
          {loading ? (
            <p className="p-4 text-center text-slate-500">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-center text-slate-500">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Nombre</th>
                    <th className="px-3 py-3">Correo</th>
                    <th className="px-3 py-3">Registro</th>
                    <th className="px-3 py-3">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id} className="border-t border-slate-100">
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-slate-400" />
                          {item.name}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{item.email}</td>
                      <td className="px-3 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-3 py-3">
                        <select
                          className="input py-2"
                          value={item.role}
                          disabled={savingId === item._id}
                          onChange={(event) => changeRole(item._id, event.target.value as Role)}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABEL[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
