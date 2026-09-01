import { createContext, useContext, useState, useCallback } from "react";
import { loginTeam, registerTeam } from "./api.js";

const AuthContext = createContext(null);

function readStoredAuth() {
  const currentUser = localStorage.getItem("currentUser");
  const userCode = localStorage.getItem("userCode");
  if (currentUser && userCode) {
    return { isLoggedIn: true, currentUser, userCode };
  }
  return { isLoggedIn: false, currentUser: null, userCode: null };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const login = useCallback(async (code) => {
    const user = await loginTeam(code);
    if (!user?.name || !user?.code) throw new Error("Ogiltig lagkod");
    localStorage.setItem("currentUser", user.name);
    localStorage.setItem("userCode", user.code);
    setAuth({ isLoggedIn: true, currentUser: user.name, userCode: user.code });
    return user;
  }, []);

  const register = useCallback(async (name) => {
    const data = await registerTeam(name);
    if (!data?.name || !data?.code) throw new Error("Registreringen misslyckades");
    localStorage.setItem("currentUser", data.name);
    localStorage.setItem("userCode", data.code);
    setAuth({ isLoggedIn: true, currentUser: data.name, userCode: data.code });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userCode");
    setAuth({ isLoggedIn: false, currentUser: null, userCode: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
