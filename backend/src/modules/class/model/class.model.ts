import { Schema, Types, model, Document } from 'mongoose';

export interface IClass extends Document {
  programId: Types.ObjectId;
  departmentId: Types.ObjectId;
  year: number;
  academicYear: string;
  currentSemester: number;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
    },
    academicYear: {
      type: String,
      required: true, // e.g. "2026-27"
    },
    currentSemester: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

classSchema.index({ programId: 1, year: 1, academicYear: 1 }, { unique: true });

export const Class = model<IClass>('Class', classSchema);