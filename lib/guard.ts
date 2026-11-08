import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import { getTokenPayload } from "@/lib/auth";
import { Role } from "@/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Resuelve el usuario autenticado leyendo el rol desde la base de datos y no
 * desde el token, para que un cambio de rol surta efecto de inmediato.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const payload = getTokenPayload(req);
  if (!payload) return null;

  await connectDB();
  const user = await UserModel.findById(payload.id).select("name email role");
  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name as string,
    email: user.email as string,
    role: user.role as Role,
  };
}
