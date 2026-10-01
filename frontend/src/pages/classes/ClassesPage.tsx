import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import {
  getClasses,
  createClass,
  deleteClass,
  updateClass,
  type ClassItem,
  type CreateClassPayload,
} from "../../api/classes";
import { getDepartments, type Department } from "../../api/departments";

/* ─── Helpers ─────────────────────────────────────────── */
const currentAcademicYear = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed; academic year starts in June (5)
  const start = m >= 5 ? y : y - 1;
  const endShort = String(start + 1).slice(-2);
  return `${start}-${endShort}`;
};

const emptyForm = (): CreateClassPayload => ({
  programId: "",
  departmentId: "",
  year: 1,
  academicYear: currentAcademicYear(),
  currentSemester: 1,
});

/* ─── Create / Edit Modal ─────────────────────────────── */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  editingClass: ClassItem | null;
  onSaved: (cls: ClassItem, isEdit: boolean) => void;
}

function CreateClassModal({ open, onClose, editingClass, onSaved }: ModalProps) {
  const [form, setForm] = useState<CreateClassPayload>(emptyForm());
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateClassPayload, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm(editingClass
        ? {
            programId: editingClass.programId,
            departmentId: editingClass.departmentId,
            year: editingClass.year,
            academicYear: editingClass.academicYear,
            currentSemester: editingClass.currentSemester,
          }
        : emptyForm());
      setErrors({});
      setApiError(null);
    }
  }, [open, editingClass]);

  useEffect(() => {
    if (!open) return;
    setIsLoadingDepartments(true);
    void getDepartments()
      .then((response) => setDepartments(response.data))
      .catch(() => setApiError("Failed to load departments. Please try again."))
      .finally(() => setIsLoadingDepartments(false));
  }, [open]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (form.programId?.trim() && !/^[0-9a-fA-F]{24}$/.test(form.programId.trim()))
      e.programId = "Must be a valid 24-character MongoDB ObjectId.";
    if (!form.departmentId.trim()) e.departmentId = "Department ID is required.";
    else if (!/^[0-9a-fA-F]{24}$/.test(form.departmentId.trim()))
      e.departmentId = "Must be a valid 24-character MongoDB ObjectId.";
    if (!form.academicYear.trim()) e.academicYear = "Academic year is required.";
    else if (!/^\d{4}-\d{2}$/.test(form.academicYear.trim()))
      e.academicYear = "Format must be YYYY-YY (e.g. 2026-27).";
    if (form.year < 1 || form.year > 6) e.year = "Year must be between 1 and 6.";
    if (form.currentSemester < 1 || form.currentSemester > 12)
      e.currentSemester = "Semester must be between 1 and 12.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: CreateClassPayload = {
        ...form,
        departmentId: form.departmentId.trim(),
        academicYear: form.academicYear.trim(),
      };
      if (form.programId?.trim()) payload.programId = form.programId.trim();
      else delete payload.programId;
      const res = editingClass
        ? await updateClass(editingClass.id, payload)
        : await createClass(payload);
      onSaved(res.data, Boolean(editingClass));
      onClose();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string }; status?: number } };
      if (ax.response?.status === 409)
        setApiError("A class with these details already exists.");
      else if (ax.response?.status === 403)
        setApiError("You don't have permission to create classes.");
      else if (ax.response?.status === 404)
        setApiError("Program or Department not found. Check the IDs.");
      else
        setApiError(ax.response?.data?.message || "Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const field = (
    id: keyof CreateClassPayload,
    label: string,
    input: React.ReactNode,
    hint?: string
  ) => (
    <div>
      <label htmlFor={String(id)} className="mb-1.5 block text-xs font-bold text-gray-700">
        {label} <span className="text-[#DC2626]">*</span>
      </label>
      {input}
      {errors[id] ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors[id]}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );

  const inputCls = (id: keyof CreateClassPayload) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
      errors[id]
        ? "border-[#DC2626] bg-red-50 focus:border-[#DC2626] focus:ring-[#DC2626]/20"
        : "border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
    }`;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0E7FF]">
              <Plus className="h-5 w-5 text-[#4F46E5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {editingClass ? "Edit Class" : "Create New Class"}
              </h2>
              <p className="text-xs text-gray-500">
                {editingClass ? "PATCH" : "POST"} /api/v1/classes{editingClass ? "/:id" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {field(
            "departmentId",
            "Department",
            <select
              id="departmentId"
              value={form.departmentId}
              onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
              disabled={isLoadingDepartments}
              className={inputCls("departmentId")}
            >
              <option value="">
                {isLoadingDepartments ? "Loading departments..." : "Select a department"}
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-4">
            {field(
              "year",
              "Year",
              <input
                id="year"
                type="number"
                min={1}
                max={6}
                value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}
                className={inputCls("year")}
              />,
              "1 – 6"
            )}

            {field(
              "currentSemester",
              "Current Semester",
              <input
                id="currentSemester"
                type="number"
                min={1}
                max={12}
                value={form.currentSemester}
                onChange={(e) =>
                  setForm((p) => ({ ...p, currentSemester: Number(e.target.value) }))
                }
                className={inputCls("currentSemester")}
              />,
              "1 – 12"
            )}
          </div>

          {field(
            "academicYear",
            "Academic Year",
            <input
              id="academicYear"
              type="text"
              value={form.academicYear}
              onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
              placeholder="e.g. 2026-27"
              className={inputCls("academicYear")}
            />,
            "Format: YYYY-YY"
          )}

          {/* API Error */}
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
              <p className="text-xs font-medium text-[#DC2626]">{apiError}</p>
              <button type="button" onClick={() => setApiError(null)} className="ml-auto">
                <X className="h-4 w-4 text-[#DC2626]" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#4338CA] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {editingClass ? "Saving..." : "Creating..."}</>
              ) : (
                <><Plus className="h-3.5 w-3.5" /> {editingClass ? "Save Changes" : "Create Class"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ────────────────────────────── */
interface DeleteModalProps {
  cls: ClassItem | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

function DeleteConfirmModal({ cls, onClose, onDeleted }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!cls) {
      setIsDeleting(false);
      setApiError(null);
    }
  }, [cls]);

  if (!cls) return null;

  const handleDelete = async () => {
    setApiError(null);
    setIsDeleting(true);
    try {
      await deleteClass(cls.id);
      onDeleted(cls.id);
      onClose();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string }; status?: number } };
      if (ax.response?.status === 409)
        setApiError("Cannot delete: the class has associated records.");
      else
        setApiError(ax.response?.data?.message || "Failed to delete class.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEE2E2]">
            <Trash2 className="h-6 w-6 text-[#DC2626]" />
          </div>
          <h2 className="mt-4 text-base font-bold text-gray-900">Delete Class?</h2>
          <p className="mt-1 text-sm text-gray-500">
            This will permanently delete the class for{" "}
            <span className="font-semibold text-gray-800">
              Year {cls.year} · Sem {cls.currentSemester} · {cls.academicYear}
            </span>
            . This action cannot be undone.
          </p>

          {apiError && (
            <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-3">
              <p className="text-xs font-medium text-[#DC2626]">{apiError}</p>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-[0.99] disabled:opacity-60"
            >
              {isDeleting ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="h-3.5 w-3.5" /> Delete</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [toDelete, setToDelete] = useState<ClassItem | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch {
      setFetchError("Failed to load classes. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClasses();
  }, [fetchClasses]);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaved = (cls: ClassItem, isEdit: boolean) => {
    setClasses((prev) =>
      isEdit ? prev.map((item) => (item.id === cls.id ? cls : item)) : [cls, ...prev]
    );
    showToast(isEdit ? "Class updated successfully!" : "Class created successfully!");
  };

  const handleDeleted = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    showToast("Class deleted successfully.");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      {/* Modals */}
      <CreateClassModal
        open={showCreate || Boolean(editingClass)}
        onClose={() => {
          setShowCreate(false);
          setEditingClass(null);
        }}
        editingClass={editingClass}
        onSaved={handleSaved}
      />
      <DeleteConfirmModal
        cls={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={handleDeleted}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          {toast.message}
        </div>
      )}

      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-bold text-[#4338CA]">
              <BookOpen className="h-3.5 w-3.5 text-[#4F46E5]" />
              <span>Class Management</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Classes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage academic classes — create, view and remove class records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchClasses()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#4338CA] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add Class
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">All Classes</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {isLoading ? "Loading..." : `${classes.length} class${classes.length !== 1 ? "es" : ""} total`}
              </p>
            </div>
            {!isLoading && classes.length > 0 && (
              <span className="rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-bold text-[#4338CA]">
                {classes.length} records
              </span>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
              <p className="text-sm font-medium text-gray-500">Loading classes...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && fetchError && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEE2E2]">
                <AlertCircle className="h-6 w-6 text-[#DC2626]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Failed to load classes</p>
                <p className="mt-1 text-xs text-gray-500">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchClasses()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4338CA]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !fetchError && classes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E0E7FF]">
                <GraduationCap className="h-7 w-7 text-[#4F46E5]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">No classes yet</p>
                <p className="mt-1 text-xs text-gray-500">
                  Get started by creating your first class.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4338CA]"
              >
                <Plus className="h-4 w-4" /> Add Class
              </button>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !fetchError && classes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      #
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Year · Sem
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Academic Year
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Department
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {classes.map((cls, idx) => (
                    <tr
                      key={cls.id}
                      className="group transition-colors hover:bg-[#F8FAFC]"
                    >
                      {/* Row number */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-400">
                          {idx + 1}
                        </span>
                      </td>

                      {/* Year · Semester */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E0E7FF] text-xs font-bold text-[#4338CA]">
                            {cls.year}
                          </span>
                          <span className="text-xs text-gray-500">·</span>
                          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                            Sem {cls.currentSemester}
                          </span>
                        </div>
                      </td>

                      {/* Academic Year */}
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-bold text-gray-800">
                          {cls.academicYear}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="max-w-[120px] truncate font-mono text-xs text-gray-600" title={cls.departmentId}>
                          {cls.departmentName || cls.departmentId.slice(0, 8) + "…"}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{formatDate(cls.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          {/* Edit — placeholder for future edit modal */}
                          <button
                            type="button"
                            title="Edit class"
                            onClick={() => setEditingClass(cls)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-gray-500 transition hover:border-[#4F46E5] hover:bg-[#E0E7FF] hover:text-[#4F46E5]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete class"
                            onClick={() => setToDelete(cls)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-gray-500 transition hover:border-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
