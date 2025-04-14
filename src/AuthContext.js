import React, { createContext, useState, useEffect } from "react";
import { login as loginService } from "./AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (token && role && username) {
      setUser({ username, role });
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await loginService(username, password); // Supondo que loginService retorne os dados do backend
      const { role, token } = response; // Extraindo o papel e o token do backend
      localStorage.setItem("token", token); // Armazena o token no localStorage
      localStorage.setItem("role", role); // Armazena o papel no localStorage
      localStorage.setItem("username", username); // Armazena o nome de usuário no localStorage
      setUser({ username, role }); // Armazena o papel no estado do usuário
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erro no login:", error);
      throw new Error("Usuário ou senha incorretos!");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
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
