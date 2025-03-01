"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";

interface AuthContextType {
  email: string;
  login: (email: string) => void;
  logOut: () => void;
  loggedIn: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null);

const publicRoutes = ["/login"];

const privateRoutes = ["/dashboard", "/invoice"];

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>("");
  const loggedIn = !!email;

  const router = useRouter();

  const path = usePathname();

  useEffect(()=>{
    if(privateRoutes.includes(path)){
      if(!loggedIn){
        localStorage.setItem("lastRoute", path);
        router.push("/login");
      }else{
        const lastRoute = localStorage.getItem("lastRoute");
        console.log(lastRoute, "lastRoute");
        if(lastRoute){
          router.push(lastRoute);
          return;
        }
        router.push("/dashboard");
      }
    }
    if(publicRoutes.includes(path)){
      if(loggedIn){
        const lastRoute = localStorage.getItem("lastRoute");
        if(lastRoute){
          router.push(lastRoute);
          return;
        }
        router.push("/dashboard");
      }
    }
  },[loggedIn])

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
    console.log(email);
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
