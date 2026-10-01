import { useState } from "react";
import {
  Building2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Hash,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { createDepartment, type Department } from "../../api/departments";

interface FormState {
  name: string;
  code: string;
}

interface FormError {
  name?: string;
  code?: string;
}

export function DepartmentsPage() {
  const [form, setForm] = useState<FormState>({ name: "", code: "" });
  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDept, setSuccessDept] = useState<Department | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validate form fields
  const validate = (): boolean => {
    const newErrors: FormError = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters.";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "Department name must be at most 100 characters.";
    }
    if (!form.code.trim() || form.code.trim().length < 2) {
      newErrors.code = "Department code must be at least 2 characters.";
    } else if (form.code.trim().length > 20) {
      newErrors.code = "Department code must be at most 20 characters.";
    } else if (!/^[A-Za-z0-9_-]+$/.test(form.code.trim())) {
      newErrors.code =
        "Code may only contain letters, numbers, underscores, and hyphens.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCodeChange = (value: string) => {
    // Auto-uppercase the code as the user types
    setForm((prev) => ({ ...prev, code: value.toUpperCase() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessDept(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await createDepartment({
        name: form.name.trim(),
        code: form.code.trim(),
      });

      setSuccessDept(response.data);
      setForm({ name: "", code: "" });
      setErrors({});
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const status = axiosErr.response?.status;
      if (status === 409) {
        setApiError(
          "A department with this code already exists. Please use a unique code."
        );
      } else if (status === 403) {
        setApiError("You don't have permission to create departments.");
      } else {
        setApiError(
          axiosErr.response?.data?.message ||
            "Failed to create department. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-bold text-[#4338CA]">
            <Building2 className="h-3.5 w-3.5 text-[#4F46E5]" />
            <span>Department Management</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Departments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage academic departments for your institution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Create Form — left column */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            {/* Card Header */}
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-6 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0E7FF]">
                <Plus className="h-5 w-5 text-[#4F46E5]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Create New Department
                </h2>
                <p className="text-xs text-gray-500">
                  POST /api/v1/departments
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Department Name */}
              <div>
                <label
                  htmlFor="dept-name"
                  className="mb-1.5 block text-xs font-bold text-gray-700"
                >
                  Department Name
                  <span className="ml-1 text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="dept-name"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Department of Statistics"
                    minLength={2}
                    maxLength={100}
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                      errors.name
                        ? "border-[#DC2626] bg-[#FFF5F5] focus:border-[#DC2626] focus:ring-[#DC2626]/20"
                        : "border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name}
                  </p>
                )}
                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.name.length}/100
                </p>
              </div>

              {/* Department Code */}
              <div>
                <label
                  htmlFor="dept-code"
                  className="mb-1.5 block text-xs font-bold text-gray-700"
                >
                  Department Code
                  <span className="ml-1 text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="dept-code"
                    type="text"
                    value={form.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="e.g. STAT"
                    minLength={2}
                    maxLength={20}
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 font-mono text-sm font-bold uppercase tracking-widest text-gray-900 outline-none transition placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal focus:ring-2 ${
                      errors.code
                        ? "border-[#DC2626] bg-[#FFF5F5] focus:border-[#DC2626] focus:ring-[#DC2626]/20"
                        : "border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
                    }`}
                  />
                </div>
                {errors.code ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.code}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Letters, numbers, underscores and hyphens only. Auto-converted
                    to uppercase.
                  </p>
                )}
              </div>

              {/* API Error */}
              {apiError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#DC2626]">
                      Request Failed
                    </p>
                    <p className="mt-0.5 text-xs text-red-700">{apiError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="text-[#DC2626] hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#4338CA] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Department...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Department</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column — success card + info */}
        <div className="space-y-5 lg:col-span-2">
          {/* Success result */}
          {successDept && (
            <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
                  <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#16A34A]">
                    Department Created Successfully!
                  </p>
                  <p className="mt-0.5 text-xs text-green-700">
                    {successDept.name} has been added to the system.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#BBF7D0] bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Department Details
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">ID</span>
                    <span className="font-mono text-xs text-gray-800">
                      {successDept.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Name</span>
                    <span className="text-xs font-bold text-gray-900">
                      {successDept.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Code</span>
                    <span className="rounded-lg bg-[#E0E7FF] px-2.5 py-1 font-mono text-xs font-bold text-[#4338CA]">
                      {successDept.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Created</span>
                    <span className="text-xs text-gray-600">
                      {new Date(successDept.createdAt).toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Field Requirements
            </p>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[10px] font-bold text-[#4338CA]">
                  N
                </span>
                <div>
                  <span className="font-bold text-gray-800">Name</span>
                  <span className="ml-1 text-gray-500">— 2 to 100 characters</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[10px] font-bold text-[#4338CA]">
                  C
                </span>
                <div>
                  <span className="font-bold text-gray-800">Code</span>
                  <span className="ml-1 text-gray-500">
                    — 2 to 20 characters, unique per institution
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3 text-xs text-gray-600">
              <span className="font-bold text-gray-800">Note:</span> The server
              automatically converts the department code to uppercase. Codes must
              be unique across all departments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
