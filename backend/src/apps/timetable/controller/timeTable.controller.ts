import type { Request, Response } from "express";
import * as timetableService from "../services/timeTable.Service.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { Types } from "mongoose";
import type { TimetableIdParams } from "../types/timeTable.Types.js";

export const getClassTimetable = async (req: Request, res: Response) => {
  try {
    const { classId, semester } = req.query;

    if (!classId || typeof classId !== "string") {
      return res.status(400).json({
        success: false,
        message: "classId is required.",
      });
    }

    const departmentId = req.user?.departmentId;
    if (!departmentId) {
      throw new AppError("Department ID not found.", 400);
    }

    const semesterNumber =
      semester !== undefined ? Number(semester) : undefined;

    const timetable = await timetableService.getClassTimetable(
      classId,
      departmentId,
      semesterNumber,
    );

    return res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable.",
    });
  }
};

export const getMyTimetable = async (req: Request, res: Response) => {
  const teacherId = req.user?.userId;
  if (!teacherId) {
    throw new AppError("Teacher ID not found in request.", 400);
  }

  const timetable = await timetableService.getMyTimetable(teacherId);

  return res.status(200).json({
    success: true,
    data: timetable,
  });
};

export const createTimetable = async (req: Request, res: Response) => {
  try {
    const timetable = await timetableService.createTimetable({
      ...req.body,
      department: req.user?.departmentId,
    });

    return res.status(201).json({
      success: true,
      message: "Timetable created successfully.",
      data: timetable,
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create timetable.",
    });
  }
};

export const updateTimetable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as TimetableIdParams;
    const departmentId = req.user?.departmentId;
    if (!id) throw new AppError("Timetable ID is required.", 400);

    const timetable = await timetableService.updateTimetable(
      id,
      departmentId as string,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Timetable updated successfully.",
      data: timetable,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update timetable.";

    const status = message === "Timetable slot not found." ? 404 : 409;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const deleteTimetable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as TimetableIdParams;
    const departmentId = req.user?.departmentId;
    if (!id) throw new AppError("Timetable ID is required.", 400);

    await timetableService.deleteTimetable(id, departmentId as string);

    return res.status(200).json({
      success: true,
      message: "Timetable deleted successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete timetable.";

    const status = message === "Timetable slot not found." ? 404 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
