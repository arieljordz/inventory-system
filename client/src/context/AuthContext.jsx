import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info using session cookie
  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null); 
    } finally {
      setLoading(false);
    }
  };

  // Login using Google or other methods
  const googleLogin = async (payload) => {
    try {
      // console.log("payload:", payload);
      const res = await api.post(
        "/api/auth/google-login",
        { token: payload },
        { withCredentials: true }
      );

      // Fetch the logged-in user info
      setUser(res.data);

      // Check if user is verified
      if (!res.data?.isVerified) {
        return {
          success: false,
          message:
            "Your account is not verified. Please wait for admin approval.",
        };
      }

      // Proceed if verified
      return { success: true, redirectPath: "/dashboard" };
    } catch (err) {
      console.error(
        "Login failed:",
        err.response?.data?.message || err.message
      );
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error(
        "Logout failed:",
        err.response?.data?.message || err.message
      );
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, googleLogin, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
