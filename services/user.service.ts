import { api } from "./api";
import { Role, User } from "@/types";

export async function getUsers() {
  const { data } = await api.get<{ ok: boolean; users: User[] }>("/users");
  return data.users;
}

export async function updateUserRole(id: string, role: Role) {
  const { data } = await api.patch<{ ok: boolean; user: User }>(`/users/${id}`, { role });
  return data.user;
}
