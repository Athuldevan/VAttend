import type z from "zod";
import type { createTimetableSchema, getClassTimetableQuerySchema, timetableIdParamSchema, updateTimetableSchema } from "../timtable.validator.js";

export type CreateTimetableInput = z.infer<
  typeof createTimetableSchema
>;
export type UpdateTimetableInput = z.infer<
  typeof updateTimetableSchema
>;
export type GetClassTimetableQuery = z.infer<
  typeof getClassTimetableQuerySchema
>;

export type TimetableIdParams = z.infer<
  typeof timetableIdParamSchema
>;