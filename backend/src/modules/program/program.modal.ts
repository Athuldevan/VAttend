import { Schema, Types, model, Document } from "mongoose";

export interface IProgram extends Document {
  departmentId: Types.ObjectId;
  name: string;
  level: "UG" | "PG";
  durationYears: number;
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "B.Sc Statistics"
    },
    level: {
      type: String,
      enum: ["UG", "PG"],
      required: true,
    },
    durationYears: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
  },
  { timestamps: true },
);

// Prevents creating "B.Sc Statistics" twice under the same department
programSchema.index({ departmentId: 1, name: 1 }, { unique: true });

export const Program = model<IProgram>("Program", programSchema);
