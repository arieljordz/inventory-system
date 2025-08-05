// hooks/useAxiosInterceptor.js
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import Swal from "sweetalert2";

export const useAxiosInterceptor = () => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;

        if (response?.status === 401 && isAuthenticated) {
          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "You have been logged out. Please login again.",
            confirmButtonText: "OK",
          }).then(() => {
            logout(); // clears user and redirects to "/"
          });
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [isAuthenticated, logout]);
};
