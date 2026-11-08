import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { getAuthUser } from "@/lib/guard";
import { INITIAL_STATUS, RISK_LEVELS } from "@/lib/permissions";
import { RiskLevel } from "@/types";

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
  imageData?: string;
  imageUrl?: string;
  coordinates?: { latitude?: number; longitude?: number };
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

    const auth = await getAuthUser(req);

    if (!auth) {
      return fail("Debes iniciar sesión para registrar un reporte", 401);
    }

    const body = (await req.json()) as CreateReportBody;

    const address = body.address?.trim() || body.location?.trim() || "";
    const imageData = body.imageData || body.imageUrl || "";

    const latitude =
      body.coordinates?.latitude ??
      (body.latitude !== undefined && body.latitude !== "" ? Number(body.latitude) : undefined);

    const longitude =
      body.coordinates?.longitude ??
      (body.longitude !== undefined && body.longitude !== "" ? Number(body.longitude) : undefined);

    const requiredFields = [
      { label: "título del reporte", value: body.title },
      { label: "tipo de infraestructura", value: body.infrastructureType },
      { label: "tipo de daño", value: body.damageType },
      { label: "descripción", value: body.description },
      { label: "dirección o punto de referencia", value: address },
      { label: "nivel de riesgo", value: body.riskLevel },
    ];

    const missing = requiredFields.find(
      (field) => !field.value || String(field.value).trim() === ""
    );

    if (missing) {
      return fail(`Falta el campo obligatorio: ${missing.label}`, 400);
    }

    if (!RISK_LEVELS.includes(body.riskLevel as RiskLevel)) {
      return fail("El nivel de riesgo no es válido", 400);
    }

    if (imageData && typeof imageData === "string" && imageData.length > 1_500_000) {
      return fail(
        "La imagen es demasiado pesada. Usa una imagen más pequeña para el prototipo.",
        400
      );
    }

    const riskLevel = body.riskLevel as RiskLevel;

    // El estado inicial no es configurable: todo reporte nace en "Registrado"
    // y el nivel de riesgo queda como propuesta hasta que un gestor lo confirme.
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
      riskLevel,
      riskLevelProposed: riskLevel,
      riskValidated: false,
      status: INITIAL_STATUS,
      statusHistory: [
        {
          status: INITIAL_STATUS,
          note: `Reporte registrado con nivel de riesgo propuesto "${riskLevel}".`,
          changedBy: auth.id,
          changedByName: auth.name,
          changedByRole: auth.role,
          at: new Date(),
        },
      ],
      imageData,
      createdBy: auth.id,
    });

    return ok({ report }, 201);
  } catch (error) {
    console.error(error);
    return fail("Error al crear reporte", 500);
  }
}
