import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { getAuthUser } from "@/lib/guard";
import { canManageUsers } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(req);

    if (!auth) return fail("Debes iniciar sesión", 401);

    if (!canManageUsers(auth.role)) {
      return fail("Solo un administrador puede consultar los usuarios.", 403);
    }

    const users = await User.find().select("name email role createdAt").sort({ createdAt: 1 });

    return ok({ users });
  } catch (error) {
    console.error(error);
    return fail("Error al consultar usuarios", 500);
  }
}
