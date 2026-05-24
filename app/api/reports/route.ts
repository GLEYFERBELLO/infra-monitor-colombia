import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { getTokenPayload } from "@/lib/auth";

void User;

type CreateReportBody = {
  title?: string;
  infrastructureType?: string;
  damageType?: string;
  description?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  location?: string;
  referencePoint?: string;
  latitude?: string | number;
  longitude?: string | number;
  riskLevel?: string;
  status?: string;
  imageData?: string;
  imageUrl?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const riskLevel = searchParams.get("riskLevel") || "";
    const status = searchParams.get("status") || "";

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { infrastructureType: { $regex: q, $options: "i" } },
        { damageType: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { neighborhood: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    if (riskLevel) filter.riskLevel = riskLevel;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");

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

    if (!payload) {
      return fail("No autorizado", 401);
    }

    const body = (await req.json()) as CreateReportBody;

    const address = body.address?.trim() || body.location?.trim() || "";
    const imageData = body.imageData || body.imageUrl || "";

    const latitude =
      body.coordinates?.latitude ??
      (body.latitude !== undefined && body.latitude !== ""
        ? Number(body.latitude)
        : undefined);

    const longitude =
      body.coordinates?.longitude ??
      (body.longitude !== undefined && body.longitude !== ""
        ? Number(body.longitude)
        : undefined);

    const requiredFields = [
      { key: "title", label: "título del reporte", value: body.title },
      {
        key: "infrastructureType",
        label: "tipo de infraestructura",
        value: body.infrastructureType,
      },
      { key: "damageType", label: "tipo de daño", value: body.damageType },
      { key: "description", label: "descripción", value: body.description },
      {
        key: "address",
        label: "dirección o punto de referencia",
        value: address,
      },
      { key: "riskLevel", label: "nivel de riesgo", value: body.riskLevel },
    ];

    const missing = requiredFields.find(
      (field) => !field.value || String(field.value).trim() === ""
    );

    if (missing) {
      return fail(`Falta el campo obligatorio: ${missing.label}`, 400);
    }

    if (
      imageData &&
      typeof imageData === "string" &&
      imageData.length > 1_500_000
    ) {
      return fail(
        "La imagen es demasiado pesada. Usa una imagen más pequeña para el prototipo.",
        400
      );
    }

    const report = await Report.create({
      title: body.title?.trim(),
      infrastructureType: body.infrastructureType?.trim(),
      damageType: body.damageType?.trim(),
      description: body.description?.trim(),
      city: body.city?.trim() || "Sin ciudad",
      neighborhood: body.neighborhood?.trim() || "Sin barrio",
      address,
      referencePoint: body.referencePoint?.trim() || "",
      latitude,
      longitude,
      riskLevel: body.riskLevel || "Bajo",
      status: body.status || "Registrado",
      imageData,
      createdBy: payload.id,
    });

    return ok({ report }, 201);
  } catch (error) {
    console.error(error);
    return fail("Error al crear reporte", 500);
  }
}