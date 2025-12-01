import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import axiosInstance from "@/services/axiosInstance";
import { User } from "@/types/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGithub: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    setLoading(false);
  }, []);
  const login = async (email: string, password: string) => {
    const tokens = await authService.login(email, password);

    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    const profile = await authService.getProfile();

    // Lưu user
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);
  };

  const register = async (email: string, password: string, name: string) => {
    await authService.register(email, password, name);
    await login(email, password);
  };

  const loginWithGithub = async () => {
    const data = await authService.loginWithGithub();

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    // notify backend if supported, ignore errors
    try {
      // authService.logout may be undefined depending on backend support
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-explicit-any
      (authService as any).logout?.();
    } catch (_) {}

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    try {
      if (axiosInstance?.defaults?.headers?.common) {
        delete axiosInstance.defaults.headers.common["Authorization"];
      }
    } catch (_) {}
    // navigate to login page
    try {
      navigate("/login", { replace: true });
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGithub, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
