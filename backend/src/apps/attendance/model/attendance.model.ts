import { Schema, model, Document, Types } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "half_day" | "leave";

export interface IAttendanceEdit {
  editedBy: Types.ObjectId;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  editedAt: Date;
}

export interface IAttendance extends Document {
  studentId: Types.ObjectId;
  timetableSlotId: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy: Types.ObjectId;
  markedAt: Date;
  editHistory: IAttendanceEdit[];
  createdAt: Date;
  updatedAt: Date;
}

const attendanceEditSchema = new Schema<IAttendanceEdit>(
  {
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    previousStatus: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      required: true,
    },
    newStatus: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      required: true,
    },
    editedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timetableSlotId: {
      type: Schema.Types.ObjectId,
      ref: "TimeTable",
      required: true,
    },
    date: { type: Date, required: true }, // normalized to midnight UTC before saving
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    markedAt: { type: Date, required: true, default: Date.now },
    editHistory: { type: [attendanceEditSchema], default: [] },
  },
  { timestamps: true },
);

// The core rule: one status per student, per period, per day.
// A duplicate POST /api/attendance/mark hits this and must be rejected,
// not silently overwritten — corrections go through PATCH instead.
attendanceSchema.index(
  { studentId: 1, timetableSlotId: 1, date: 1 },
  { unique: true },
);

attendanceSchema.index({ timetableSlotId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
export default Attendance;
