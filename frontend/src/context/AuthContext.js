import React, { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem("pm_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);
  const login = (data) => { setUser(data); localStorage.setItem("pm_user", JSON.stringify(data)); };
  const logout = () => { setUser(null); localStorage.removeItem("pm_user"); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
