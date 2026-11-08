import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { getAuthUser } from "@/lib/guard";
import {
  canDelete,
  canEditContent,
  canValidateRisk,
  RISK_LEVELS,
  validateStatusChange,
} from "@/lib/permissions";
import { ReportStatus, RiskLevel } from "@/types";

void User;

interface Params {
  params: Promise<{ id: string }>;
}

const CONTENT_FIELDS = [
  "title",
  "infrastructureType",
  "damageType",
  "description",
  "city",
  "neighborhood",
  "address",
  "referencePoint",
  "latitude",
  "longitude",
  "imageData",
];

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const report = await Report.findById(id).populate("createdBy", "name email role");

    if (!report) {
      return fail("Reporte no encontrado", 404);
    }

    return ok({ report });
  } catch (error) {
    console.error(error);
    return fail("Error al consultar reporte", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const auth = await getAuthUser(req);

    if (!auth) {
      return fail("Debes iniciar sesión para modificar un reporte", 401);
    }

    const { id } = await params;
    const body = await req.json();

    const report = await Report.findById(id);

    if (!report) {
      return fail("Reporte no encontrado", 404);
    }

    const ownerId = report.createdBy ? String(report.createdBy) : "";
    const isOwner = ownerId === auth.id;
    const currentStatus = report.status as ReportStatus;
    const note: string = typeof body.note === "string" ? body.note.trim() : "";

    // 1. Edición de contenido: autor mientras el caso siga en "Registrado", o gestor/admin.
    const contentKeys = CONTENT_FIELDS.filter((key) => key in body);

    if (contentKeys.length && !canEditContent(auth.role, isOwner, currentStatus)) {
      return fail(
        "No tienes permiso para editar este reporte. Un ciudadano solo puede corregir su propio reporte mientras esté en estado Registrado.",
        403
      );
    }

    for (const key of contentKeys) {
      report.set(key, body[key]);
    }

    // 2. Nivel de riesgo: el gestor lo confirma o lo corrige; el autor solo ajusta su propuesta.
    if ("riskLevel" in body && body.riskLevel !== report.riskLevel) {
      const nextRisk = body.riskLevel as RiskLevel;

      if (!RISK_LEVELS.includes(nextRisk)) {
        return fail("El nivel de riesgo no es válido", 400);
      }

      if (canValidateRisk(auth.role)) {
        report.set("riskLevel", nextRisk);
      } else if (isOwner && currentStatus === "Registrado" && !report.riskValidated) {
        report.set("riskLevel", nextRisk);
        report.set("riskLevelProposed", nextRisk);
      } else {
        return fail("Solo un gestor o un administrador puede modificar el nivel de riesgo.", 403);
      }
    }

    // 3. Confirmación explícita del riesgo por parte del gestor.
    if (body.validateRisk === true) {
      if (!canValidateRisk(auth.role)) {
        return fail("Solo un gestor o un administrador puede confirmar el nivel de riesgo.", 403);
      }

      report.set("riskValidated", true);
      report.set("riskValidatedBy", auth.id);
      report.set("riskValidatedByName", auth.name);
      report.set("riskValidatedAt", new Date());
    }

    // 4. Cambio de estado: sigue el flujo definido y queda registrado en la bitácora.
    if ("status" in body && body.status !== currentStatus) {
      const nextStatus = body.status as ReportStatus;

      const problem = validateStatusChange({
        current: currentStatus,
        next: nextStatus,
        role: auth.role,
        riskValidated: Boolean(report.riskValidated),
        note,
      });

      if (problem) {
        return fail(problem, 403);
      }

      report.set("status", nextStatus);
      report.statusHistory.push({
        status: nextStatus,
        note,
        changedBy: auth.id,
        changedByName: auth.name,
        changedByRole: auth.role,
        at: new Date(),
      });
    }

    await report.save();

    const updated = await Report.findById(id).populate("createdBy", "name email role");

    return ok({ report: updated });
  } catch (error) {
    console.error(error);
    return fail("Error al actualizar reporte", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const auth = await getAuthUser(req);

    if (!auth) {
      return fail("Debes iniciar sesión para eliminar un reporte", 401);
    }

    if (!canDelete(auth.role)) {
      return fail("Solo un administrador puede eliminar reportes.", 403);
    }

    const { id } = await params;

    const deleted = await Report.findByIdAndDelete(id);

    if (!deleted) {
      return fail("Reporte no encontrado", 404);
    }

    return ok({ message: "Reporte eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return fail("Error al eliminar reporte", 500);
  }
}
