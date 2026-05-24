import { Schema, models, model } from "mongoose";

const ReportSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    infrastructureType: { type: String, required: true },
    damageType: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    neighborhood: { type: String, required: true },
    address: { type: String, required: true },
    referencePoint: { type: String, default: "" },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    riskLevel: { type: String, enum: ["Bajo", "Medio", "Alto", "Crítico"], default: "Bajo" },
    status: {
      type: String,
      enum: ["Registrado", "En revisión", "Priorizado", "En atención", "Solucionado", "Cerrado"],
      default: "Registrado",
    },
    imageData: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ReportSchema.index({ title: "text", description: "text", city: "text", neighborhood: "text" });

export default models.Report || model("Report", ReportSchema);
