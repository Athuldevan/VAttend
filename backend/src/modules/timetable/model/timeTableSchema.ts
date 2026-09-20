import mongoose, { Schema, type Types } from "mongoose";

interface ITimeTable {
  department: Types.ObjectId;
  class: Types.ObjectId;
  semester: number;
  subject: Types.ObjectId;
  teacher: Types.ObjectId;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const timetableSchema = new Schema<ITimeTable>(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    semester: { type: Number, required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 5 },
    period: { type: Number, required: true, min: 1, max: 8 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

// A class can't have two ACTIVE subjects in the same slot — archived
// (past-semester) slots are excluded so Sem 2's timetable can reuse the
// same day/period without colliding with Sem 1's now-archived entry.
timetableSchema.index(
  { classId: 1, dayOfWeek: 1, period: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

// A teacher can't teach two ACTIVE slots at the same time — checked across
// every class/department, since the clash is about real calendar time,
// not which semester number the class happens to be on.
timetableSchema.index(
  { teacherId: 1, dayOfWeek: 1, period: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

export const TimeTable = mongoose.model<ITimeTable>(
  "TimeTable",
  timetableSchema,
);

export default TimeTable;