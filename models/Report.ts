import { Schema, models, model } from "mongoose";

const StatusChangeSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["Registrado", "En revisión", "Priorizado", "En atención", "Solucionado", "Cerrado"],
      required: true,
    },
    note: { type: String, default: "" },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedByName: { type: String, default: "" },
    changedByRole: { type: String, enum: ["admin", "gestor", "ciudadano"] },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    // Nivel que propuso quien reportó, se conserva aunque el gestor lo corrija.
    riskLevelProposed: { type: String, enum: ["Bajo", "Medio", "Alto", "Crítico"], default: "Bajo" },
    riskValidated: { type: Boolean, default: false },
    riskValidatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    riskValidatedByName: { type: String, default: "" },
    riskValidatedAt: { type: Date },

    status: {
      type: String,
      enum: ["Registrado", "En revisión", "Priorizado", "En atención", "Solucionado", "Cerrado"],
      default: "Registrado",
    },
    statusHistory: { type: [StatusChangeSchema], default: [] },

    imageData: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ReportSchema.index({ title: "text", description: "text", city: "text", neighborhood: "text" });

export default models.Report || model("Report", ReportSchema);
