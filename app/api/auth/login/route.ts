import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) return fail("Correo y contraseña son obligatorios");

    const user = await User.findOne({ email });
    if (!user) return fail("Credenciales inválidas", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail("Credenciales inválidas", 401);

    const cleanUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    const token = signToken({ id: String(user._id), email: user.email, role: user.role });

    return ok({ user: cleanUser, token });
  } catch (error) {
    console.error(error);
    return fail("Error al iniciar sesión", 500);
  }
}
