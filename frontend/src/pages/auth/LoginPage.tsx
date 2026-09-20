import React, { useState } from "react";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("richurajesh@gmail.com");
  const [password, setPassword] = useState("Richu@12345");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await login({
        email,
        password,
      });

      console.log("Login response:", data);
      if (data.user !== null && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        navigate("/teacher/today");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to sign in. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F46E5] text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to AMS</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to access your Teacher Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teacher@department.edu"
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#DC2626]"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4F46E5] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#4338CA] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};

