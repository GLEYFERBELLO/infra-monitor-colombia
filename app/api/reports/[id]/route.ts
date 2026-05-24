import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { fail, ok } from "@/lib/api-response";
import { getTokenPayload } from "@/lib/auth";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const report = await Report.findById(id).populate("createdBy", "name email role");
    if (!report) return fail("Reporte no encontrado", 404);
    return ok({ report });
  } catch (error) {
    console.error(error);
    return fail("Error al consultar reporte", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const payload = getTokenPayload(req);
    if (!payload) return fail("No autorizado", 401);

    const { id } = await params;
    const body = await req.json();

    const allowed = ["title", "infrastructureType", "damageType", "description", "city", "neighborhood", "address", "referencePoint", "latitude", "longitude", "riskLevel", "status", "imageData"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) if (key in body) update[key] = body[key];

    const report = await Report.findByIdAndUpdate(id, update, { new: true }).populate("createdBy", "name email role");
    if (!report) return fail("Reporte no encontrado", 404);

    return ok({ report });
  } catch (error) {
    console.error(error);
    return fail("Error al actualizar reporte", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const payload = getTokenPayload(req);
    if (!payload) return fail("No autorizado", 401);

    const { id } = await params;
    const deleted = await Report.findByIdAndDelete(id);
    if (!deleted) return fail("Reporte no encontrado", 404);

    return ok({ message: "Reporte eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return fail("Error al eliminar reporte", 500);
  }
}
