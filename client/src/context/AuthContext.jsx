import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const storeUserData = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const googleLogin = async (userPayload) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/google-login`,
        userPayload,
        { withCredentials: true }
      );

      if (!data.isVerified) {
        alert("Your account is not verified yet. Please contact support.");
        return { success: false, message: "Account not verified" };
      }

      storeUserData(data);

      return {
        success: true,
        message: "Google login successful",
        redirectPath: "/dashboard",
      };
    } catch (err) {
      console.error("Google login error:", err);
      return { success: false, message: "Google login failed" };
    }
  };

  const fetchSession = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      });

      if (!data.isVerified) {
        alert("Your account is not verified yet. Please contact support.");
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      setUser(data);
    } catch (error) {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.isVerified) {
        alert("Your account is not verified yet. Please contact support.");
        localStorage.removeItem("user");
        setUser(null);
      } else {
        setUser(parsedUser);
      }
    } else {
      fetchSession();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, googleLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
