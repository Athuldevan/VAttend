import mongoose, { Schema, type Types, Document } from "mongoose";

export interface ISubject extends Document {
  departmentId: Types.ObjectId;
  name: string;
  code: string;
  semester?: number;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Subject =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", subjectSchema);

export default Subject;
