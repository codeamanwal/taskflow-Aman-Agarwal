import React, { useState } from "react";
import mockApi from "../api/mockApi";
import { toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("taskflow_token");
    const userData = localStorage.getItem("taskflow_user_data");
    if (token && userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await mockApi.login({ email, password });
      if (response.status === 200) {
        const { token, user: userData } = response.data;
        localStorage.setItem("taskflow_token", token);
        localStorage.setItem("taskflow_user_data", JSON.stringify(userData));
        setUser(userData);
        toast.success("Welcome back!");
        return true;
      } else {
        toast.error(response.message || "Invalid credentials");
        return false;
      }
    } catch {
      toast.error("An error occurred during login.");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await mockApi.register({ name, email, password });
      if (response.status === 201) {
        const { token, user: userData } = response.data;
        localStorage.setItem("taskflow_token", token);
        localStorage.setItem("taskflow_user_data", JSON.stringify(userData));
        setUser(userData);
        toast.success("Registration successful!");
        return true;
      } else {
        if (response.fields?.email) {
          toast.error("Email already exists");
        } else {
          toast.error("Registration failed");
        }
        return false;
      }
    } catch {
      toast.error("An error occurred during registration.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user_data");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
