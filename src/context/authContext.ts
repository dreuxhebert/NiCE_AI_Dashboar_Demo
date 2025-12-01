"use client";

import { createContext, useContext, Dispatch, SetStateAction } from "react";

export interface AuthContextType {
  permissions: string[];
  authStatus: "loading" | "authed" | "guest";
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthContext.Provider>");
  }
  return ctx;
}
