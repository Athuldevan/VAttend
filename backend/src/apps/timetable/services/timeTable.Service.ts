import { Types } from "mongoose";
import TimeTable from "../model/timeTableSchema.js";
import Subject from "../../subject/model/subject.model.js";
import User from "../../user/user.model.js";
import { Class } from "../../class/model/class.model.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { checkTimetableClash } from "../helper/checkTimeTableClash.js";
import type { CreateTimetableInput, UpdateTimetableInput } from "../types/timeTable.Types.js";

export const createTimetable = async (data: CreateTimetableInput) => {
  if (!data.department) {
    throw new Error("Department is required.");
  }

  await validateTimetableReferences(data.class, data.teacher, data.subject, data.department);

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
  data: UpdateTimetableInput,
) => {
  const timetable = await TimeTable.findOne({
    _id: new Types.ObjectId(timetableId),
    isDeleted: false,
  });

  if (!timetable) {
    throw new Error("Timetable slot not found.");
  }

  const classId = data.class ?? timetable.class.toString();

  const teacherId = data.teacher ?? timetable.teacher.toString();

  const dayOfWeek = data.dayOfWeek ?? timetable.dayOfWeek;

  const period = data.period ?? timetable.period;

  if (data.teacher !== undefined || data.subject !== undefined) {
    await validateTimetableReferences(
      classId,
      teacherId,
      data.subject ?? timetable.subject.toString(),
      timetable.department.toString(),
    );
  }

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

const validateTimetableReferences = async (
  classId: string,
  teacherId: string,
  subjectId: string,
  departmentId: string,
) => {
  const [classRecord, teacher, subject] = await Promise.all([
    Class.exists({ _id: new Types.ObjectId(classId), departmentId: new Types.ObjectId(departmentId) }),
    User.exists({
      _id: new Types.ObjectId(teacherId),
      role: ROLES.TEACHER,
      isActive: true,
    }),
    Subject.exists({
      _id: new Types.ObjectId(subjectId),
      departmentId: new Types.ObjectId(departmentId),
    }),
  ]);

  if (!classRecord) throw new Error("Selected class does not belong to this department.");
  if (!teacher) throw new Error("Selected teacher is inactive or does not exist.");
  if (!subject) throw new Error("Selected subject is not available in this department.");
};



export const deleteTimetable = async (
  timetableId: string,
) => {
  const timetable = await TimeTable.findOne({
    _id: new Types.ObjectId(timetableId),
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
    isDeleted: false,
  };

  // If semester is NOT provided,
  // return only the current/non-deleted timetable.
  if (semester !== undefined) {
    query.semester = semester;
  }

  const timetable = await TimeTable.find(query)
    .populate({
      path: "class",
      populate: { path: "programId" },
    })
    .populate("subject")
    .populate("teacher", "name email")
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
    .populate({
      path: "class",
      populate: { path: "programId" },
    })
    .populate("subject")
    .populate("department", "name code")
    .sort({
      dayOfWeek: 1,
      period: 1,
    })
    .lean();

  return timetable;
};
