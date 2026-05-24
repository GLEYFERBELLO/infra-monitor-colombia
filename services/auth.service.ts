import { api } from "./api";
import { User } from "@/types";

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const { data } = await api.post<{ ok: boolean; user: User; token: string; message?: string }>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await api.post<{ ok: boolean; user: User; token: string; message?: string }>("/auth/login", payload);
  return data;
}
