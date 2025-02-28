"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";

interface AuthContextType {
  email: string;
  login: (email: string) => void;
  logOut: () => void;
  loggedIn: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>("");
  const loggedIn = !!email;

  const router = useRouter();

  const logOut = () => {
    setEmail("");
    localStorage.setItem("user", "");
    router.push("/login");
  };

  useEffect(() => {
    const email = localStorage.getItem("user");
    if (email) {
      setEmail(email);
    }
  }, [])

  const login = (email: string) => {
    setEmail(email);
    localStorage.setItem("user", email);
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider value={{ email, login, logOut, loggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth =  () => {
    return useContext(AuthContext);
}

export default AuthProvider;
