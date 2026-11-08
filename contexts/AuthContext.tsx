"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/types";
import { loginUser, registerUser } from "@/services/auth.service";
import { canSeeDashboard } from "@/lib/permissions";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("infra_user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password });
    localStorage.setItem("infra_token", data.token);
    localStorage.setItem("infra_user", JSON.stringify(data.user));
    setUser(data.user);
    toast.success("Inicio de sesión correcto");
    router.push(canSeeDashboard(data.user.role) ? "/dashboard" : "/reports");
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await registerUser({ name, email, password });
    localStorage.setItem("infra_token", data.token);
    localStorage.setItem("infra_user", JSON.stringify(data.user));
    setUser(data.user);
    toast.success("Cuenta creada correctamente");
    router.push(canSeeDashboard(data.user.role) ? "/dashboard" : "/reports");
  };

  const logout = () => {
    localStorage.removeItem("infra_token");
    localStorage.removeItem("infra_user");
    setUser(null);
    toast.info("Sesión cerrada");
    router.push("/");
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
