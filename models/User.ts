import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "gestor", "ciudadano"], default: "ciudadano" },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
