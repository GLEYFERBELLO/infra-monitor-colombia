import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { getAuthUser } from "@/lib/guard";
import { canManageUsers, ROLES } from "@/lib/permissions";
import { Role } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const auth = await getAuthUser(req);

    if (!auth) return fail("Debes iniciar sesión", 401);

    if (!canManageUsers(auth.role)) {
      return fail("Solo un administrador puede asignar roles.", 403);
    }

    const { id } = await params;
    const body = await req.json();
    const role = body.role as Role;

    if (!ROLES.includes(role)) {
      return fail("El rol indicado no es válido", 400);
    }

    if (id === auth.id && role !== "admin") {
      return fail("Un administrador no puede quitarse a sí mismo el rol de administrador.", 400);
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select(
      "name email role createdAt"
    );

    if (!user) return fail("Usuario no encontrado", 404);

    return ok({ user });
  } catch (error) {
    console.error(error);
    return fail("Error al actualizar el rol", 500);
  }
}
