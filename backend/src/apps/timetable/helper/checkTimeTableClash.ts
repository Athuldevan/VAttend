import { Types } from "mongoose";
import TimeTable from "../model/timeTableSchema.js";

export const checkTimetableClash = async (
  classId: string,
  teacherId: string,
  dayOfWeek: number,
  period: number,
  excludeId?: string,
) => {
    const classQuery: Record<string, unknown> = {
    class: new Types.ObjectId(classId),
    dayOfWeek,
    period,
    isDeleted: false,
  };

  const teacherQuery: Record<string, unknown> = {
    teacher: new Types.ObjectId(teacherId),
    dayOfWeek,
    period,
    isDeleted: false,
  };

  if (excludeId) {
    const excludedObjectId = new Types.ObjectId(excludeId);

    classQuery._id = {
      $ne: excludedObjectId,
    };

    teacherQuery._id = {
      $ne: excludedObjectId,
    };
  }

  const [classClash, teacherClash] = await Promise.all([
    TimeTable.findOne(classQuery).lean(),

    TimeTable.findOne(teacherQuery).lean(),
  ]);

  if (classClash) {
    throw new Error(
      "Class already has a timetable slot for this day and period.",
    );
  }

  if (teacherClash) {
    throw new Error(
      "Teacher is already assigned to another class for this day and period.",
    );
  }
};