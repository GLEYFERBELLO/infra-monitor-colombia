import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";
import { fail, ok } from "@/lib/api-response";
import { getAuthUser } from "@/lib/guard";
import { canSeeDashboard } from "@/lib/permissions";

void User;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(req);

    if (!auth) {
      return fail("Debes iniciar sesión para consultar los indicadores", 401);
    }

    if (!canSeeDashboard(auth.role)) {
      return fail("Los indicadores están disponibles para gestores y administradores.", 403);
    }

    const [
      totalReports,
      highRisk,
      criticalRisk,
      solved,
      pendingRiskValidation,
      byStatus,
      byRisk,
      latestReports,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ riskLevel: "Alto" }),
      Report.countDocuments({ riskLevel: "Crítico" }),
      Report.countDocuments({ status: "Solucionado" }),
      Report.countDocuments({ riskValidated: { $ne: true } }),
      Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Report.aggregate([{ $group: { _id: "$riskLevel", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Report.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name email role"),
    ]);

    return ok({
      stats: {
        totalReports,
        highRisk,
        criticalRisk,
        solved,
        pendingRiskValidation,
        byStatus,
        byRisk,
        latestReports,
      },
    });
  } catch (error) {
    console.error(error);
    return fail("Error al consultar indicadores", 500);
  }
}
