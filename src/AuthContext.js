import React, { createContext, useState, useEffect } from "react";
import { login as loginService } from "./AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ username: "" });
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      await loginService(username, password);
      setUser({ username });
      setIsAuthenticated(true);
      
    } catch (error) {
      throw new Error("Usuário ou senha incorretos!");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
