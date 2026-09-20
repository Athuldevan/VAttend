import { Types } from "mongoose";
import TimeTable from "../model/timeTableSchema.js";
import { checkTimetableClash } from "../helper/checkTimeTableClash.js";
import type { CreateTimetableInput, UpdateTimetableInput } from "../types/timeTable.Types.js";

export const createTimetable = async (data: CreateTimetableInput) => {
  await checkTimetableClash(
    data.class,
    data.teacher,
    data.dayOfWeek,
    data.period,
  );

  const timetable = await TimeTable.create({
    department: new Types.ObjectId(data.department),
    class: new Types.ObjectId(data.class),
    semester: data.semester,
    subject: new Types.ObjectId(data.subject),
    teacher: new Types.ObjectId(data.teacher),
    dayOfWeek: data.dayOfWeek,
    period: data.period,
    startTime: data.startTime,
    endTime: data.endTime,
    isDeleted: false,
  });

  return timetable;
};

export const updateTimetable = async (
  timetableId: string,
  departmentId: string,
  data: UpdateTimetableInput,
) => {
  const timetable = await TimeTable.findOne({
    _id: new Types.ObjectId(timetableId),
    department: new Types.ObjectId(departmentId),
    isDeleted: false,
  });

  if (!timetable) {
    throw new Error("Timetable slot not found.");
  }

  const classId = data.class ?? timetable.class.toString();

  const teacherId = data.teacher ?? timetable.teacher.toString();

  const dayOfWeek = data.dayOfWeek ?? timetable.dayOfWeek;

  const period = data.period ?? timetable.period;

  await checkTimetableClash(classId, teacherId, dayOfWeek, period, timetableId);

  if (data.class !== undefined) {
    timetable.class = new Types.ObjectId(data.class);
  }

  if (data.semester !== undefined) {
    timetable.semester = data.semester;
  }

  if (data.subject !== undefined) {
    timetable.subject = new Types.ObjectId(data.subject);
  }

  if (data.teacher !== undefined) {
    timetable.teacher = new Types.ObjectId(data.teacher);
  }

  if (data.dayOfWeek !== undefined) {
    timetable.dayOfWeek = data.dayOfWeek;
  }

  if (data.period !== undefined) {
    timetable.period = data.period;
  }

  if (data.startTime !== undefined) {
    timetable.startTime = data.startTime;
  }

  if (data.endTime !== undefined) {
    timetable.endTime = data.endTime;
  }

  await timetable.save();

  return timetable;
};



export const deleteTimetable = async (
  timetableId: string,
  departmentId: string,
) => {
  const timetable = await TimeTable.findOne({
    _id: new Types.ObjectId(timetableId),
    department: new Types.ObjectId(departmentId),
    isDeleted: false,
  });

  if (!timetable) {
    throw new Error("Timetable slot not found.");
  }

  timetable.isDeleted = true;

  await timetable.save();

  return timetable;
};



// CLASS TIMETABLE`
export const getClassTimetable = async (
  classId: string,
  departmentId: string,
  semester?: number,
) => {
  const query: Record<string, any> = {
    class: new Types.ObjectId(classId),
    department: new Types.ObjectId(departmentId),
  };

  // If semester is NOT provided,
  // return only the current/non-deleted timetable.
  if (semester === undefined) {
    query.isDeleted = false;
  } else {
    // If semester is provided,
    // allow archived timetable to be viewed.
    query.semester = semester;
  }

  const timetable = await TimeTable.find(query)
    .populate("class")
    .populate("subject")
    .populate("teacher")
    .sort({
      dayOfWeek: 1,
      period: 1,
    })
    .lean();

  return timetable;
};

export const getMyTimetable = async (teacherId: string) => {
  const timetable = await TimeTable.find({
    teacher: new Types.ObjectId(teacherId),
    isDeleted: false,
  })
    .populate("class")
    .populate("subject")
    .populate("department")
    .sort({
      dayOfWeek: 1,
      period: 1,
    })
    .lean();

  return timetable;
};
