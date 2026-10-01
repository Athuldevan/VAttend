import { axiosClient } from "./axiosClient";

export interface Department {
  id: string;
  name: string;
  code: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface DepartmentsListResponse {
  success: boolean;
  message: string;
  data: Department[];
}

const normalizeDepartment = (department: Department): Department => {
  const rawDepartment = department as Department & { _id?: unknown };
  return {
    ...department,
    id: typeof rawDepartment.id === "string"
      ? rawDepartment.id
      : typeof rawDepartment._id === "string"
        ? rawDepartment._id
        : "",
  };
};

export const createDepartment = async (
  payload: CreateDepartmentPayload
): Promise<DepartmentResponse> => {
  const response = await axiosClient.post<DepartmentResponse>(
    "/departments",
    payload
  );
  return {
    ...response.data,
    data: normalizeDepartment(response.data.data),
  };
};

export const getDepartments = async (): Promise<DepartmentsListResponse> => {
  const response = await axiosClient.get<DepartmentsListResponse>(
    "/departments"
  );
  return {
    ...response.data,
    data: response.data.data.map(normalizeDepartment),
  };
};
