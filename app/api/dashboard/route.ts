import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { fail, ok } from "@/lib/api-response";

export async function GET() {
  try {
    await connectDB();
    const [totalReports, highRisk, criticalRisk, solved, byStatus, byRisk, latestReports] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ riskLevel: "Alto" }),
      Report.countDocuments({ riskLevel: "Crítico" }),
      Report.countDocuments({ status: "Solucionado" }),
      Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Report.aggregate([{ $group: { _id: "$riskLevel", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Report.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name email role"),
    ]);

    return ok({ stats: { totalReports, highRisk, criticalRisk, solved, byStatus, byRisk, latestReports } });
  } catch (error) {
    console.error(error);
    return fail("Error al consultar indicadores", 500);
  }
}
