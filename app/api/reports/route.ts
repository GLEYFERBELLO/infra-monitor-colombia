import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { fail, ok } from "@/lib/api-response";
import { getTokenPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const riskLevel = searchParams.get("riskLevel") || "";
    const status = searchParams.get("status") || "";

    const filter: Record<string, unknown> = {};
    if (q) filter.$text = { $search: q };
    if (riskLevel) filter.riskLevel = riskLevel;
    if (status) filter.status = status;

    const reports = await Report.find(filter).sort({ createdAt: -1 }).populate("createdBy", "name email role");
    return ok({ reports });
  } catch (error) {
    console.error(error);
    return fail("Error al consultar reportes", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = getTokenPayload(req);
    if (!payload) return fail("No autorizado", 401);

    const body = await req.json();
    const required = ["title", "infrastructureType", "damageType", "description", "city", "neighborhood", "address", "riskLevel"];
    const missing = required.find((field) => !body[field]);
    if (missing) return fail(`Falta el campo obligatorio: ${missing}`);

    if (body.imageData && typeof body.imageData === "string" && body.imageData.length > 1_500_000) {
      return fail("La imagen es demasiado pesada. Usa una imagen más pequeña para el prototipo.");
    }

    const report = await Report.create({ ...body, createdBy: payload.id });
    return ok({ report }, 201);
  } catch (error) {
    console.error(error);
    return fail("Error al crear reporte", 500);
  }
}
