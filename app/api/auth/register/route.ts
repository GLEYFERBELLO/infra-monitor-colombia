import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) return fail("Nombre, correo y contraseña son obligatorios");
    if (password.length < 6) return fail("La contraseña debe tener mínimo 6 caracteres");

    const exists = await User.findOne({ email });
    if (exists) return fail("Ya existe una cuenta con este correo", 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "ciudadano";

    const user = await User.create({ name, email, password: hashedPassword, role });
    const cleanUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    const token = signToken({ id: String(user._id), email: user.email, role: user.role });

    return ok({ user: cleanUser, token }, 201);
  } catch (error) {
    console.error(error);
    return fail("Error al registrar usuario", 500);
  }
}
