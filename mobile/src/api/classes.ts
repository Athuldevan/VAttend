import { axiosClient } from './axiosClient';

export interface ClassItem {
  id: string;
  programId: string;
  departmentId: string;
  departmentName?: string;
  year: number;
  academicYear: string;
  currentSemester: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassPayload {
  programId?: string;
  departmentId: string;
  year: number;
  academicYear: string;
  currentSemester: number;
}

export type UpdateClassPayload = Partial<CreateClassPayload>;

export interface ClassResponse {
  success: boolean;
  message: string;
  data: ClassItem;
}

export interface ClassesListResponse {
  success: boolean;
  message: string;
  data: ClassItem[];
}

export interface DeleteClassResponse {
  success: boolean;
  message: string;
  data: null;
}

const normalizeRelatedId = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as { id?: unknown; _id?: unknown };
    if (typeof record.id === 'string') return record.id;
    if (typeof record._id === 'string') return record._id;
  }
  return '';
};

const relatedName = (value: unknown): string | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const name = (value as { name?: unknown }).name;
  return typeof name === 'string' ? name : undefined;
};

export const getClasses = async (
  departmentId?: string
): Promise<ClassesListResponse> => {
  const params = departmentId ? { departmentId } : {};
  const response = await axiosClient.get<ClassesListResponse>('/classes', { params });
  return {
    ...response.data,
    data: response.data.data.map((classItem) => {
      const rawItem = classItem as ClassItem & { _id?: unknown };
      return {
        ...classItem,
        id: typeof rawItem.id === 'string'
          ? rawItem.id
          : typeof rawItem._id === 'string'
            ? rawItem._id
            : '',
        programId: normalizeRelatedId(classItem.programId),
        departmentId: normalizeRelatedId(classItem.departmentId),
        departmentName: relatedName(classItem.departmentId),
      };
    }),
  };
};

export const createClass = async (
  payload: CreateClassPayload
): Promise<ClassResponse> => {
  const response = await axiosClient.post<ClassResponse>('/classes', payload);
  return response.data;
};

export const updateClass = async (
  id: string,
  payload: UpdateClassPayload
): Promise<ClassResponse> => {
  const response = await axiosClient.patch<ClassResponse>(`/classes/${id}`, payload);
  return response.data;
};

export const deleteClass = async (id: string): Promise<DeleteClassResponse> => {
  const response = await axiosClient.delete<DeleteClassResponse>(`/classes/${id}`);
  return response.data;
};
