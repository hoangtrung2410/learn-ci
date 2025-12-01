import React, { useState } from "react";
import {
  Github,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Terminal,
  Cpu,
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { useAuth } from "../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginView: React.FC = () => {
  const { loginWithGithub, login, register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGithub();
    } catch (err) {
      setError("Failed to initiate GitHub login.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        await register(formData.email, formData.password, formData.name);
        await login(formData.email, formData.password);
        navigate("/home");
      } else {
        await login(formData.email, formData.password);
        navigate("/home");
      }
    } catch (err: any) {
      setError(
        err.message || "Authentication failed. Please check your credentials."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#09090b] to-[#09090b]"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl shadow-indigo-500/20 mb-4 border border-white/10">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Alert CI
          </h1>
          <p className="text-slate-400 text-sm mt-1">CI/CD Analytics</p>
        </div>

        {/* Main Card */}
        <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-8">
            <div className="flex gap-4 mb-6 p-1 bg-surfaceHighlight/50 rounded-lg">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${mode === "signin" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${mode === "signup" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {mode === "signup" && (
                <div className="relative">
                  <User
                    size={16}
                    className="absolute top-2.5 left-3 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute top-2.5 left-3 text-slate-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute top-2.5 left-3 text-slate-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full h-10 bg-white text-black hover:bg-slate-200 font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 relative group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5"
            >
              <Github size={18} />
              <span>GitHub</span>
            </button>
          </div>

          <div className="px-8 py-3 bg-surfaceHighlight/20 text-center border-t border-border">
            <p className="text-[10px] text-slate-500">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="ml-1 text-indigo-400 hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
