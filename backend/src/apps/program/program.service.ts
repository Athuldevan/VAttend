import { Program } from "./program.modal.js";
import { Types } from "mongoose";

import {
  type CreateProgramBody,
  type UpdateProgramBody,
} from "./program.validation.js";

// CREATE
export async function createProgramService(input: CreateProgramBody) {
  const existingProgram = await Program.findOne({
    departmentId: input.departmentId,
    name: input.name,
  });

  if (existingProgram) {
    throw new Error("Program with this name already exists in this department");
  }

  const program = await Program.create({
    ...input,
    departmentId: new Types.ObjectId(input.departmentId),
  });

  return program;
}

// GET ALL
export async function getProgramsService(departmentId: string) {
  const programs = await Program.find({
    departmentId: new Types.ObjectId(departmentId),
  }).sort({
    name: 1,
  });

  return programs;
}

// GET BY ID
export async function getProgramByIdService(programId: string) {
  const program = await Program.findById(programId);

  if (!program) {
    throw new Error("Program not found");
  }

  return program;
}

// UPDATE
export async function updateProgramService(
  programId: string,
  input: UpdateProgramBody,
) {
  const program = await Program.findById(programId);

  if (!program) {
    throw new Error("Program not found");
  }

  if (input.name && input.name !== program.name) {
    const existingProgram = await Program.findOne({
      departmentId: program.departmentId,
      name: input.name,
      _id: { $ne: programId },
    });

    if (existingProgram) {
      throw new Error(
        "Program with this name already exists in this department",
      );
    }
  }

  Object.assign(program, input);

  await program.save();

  return program;
}

// DELETE
export async function deleteProgramService(programId: string) {
  const program = await Program.findById(programId);

  if (!program) {
    throw new Error("Program not found");
  }

  // TODO:
  // Check whether any Class references this program.
  //
  // Example:
  //
  // const classExists = await Class.exists({
  //   programId: program._id,
  // });
  //
  // if (classExists) {
  //   throw new Error(
  //     "Cannot delete program because classes are associated with it",
  //   );
  // }

  await Program.findByIdAndDelete(programId);

  return null;
}
