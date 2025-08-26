// hooks/useAxiosInterceptor.js
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import Swal from "sweetalert2";

export const useAxiosInterceptor = () => {
  const { isAuthenticated, logout } = useAuth();
  const logoutTriggered = useRef(false); // prevent multiple logouts

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response, config } = error;

        // Skip if no response
        if (!response) return Promise.reject(error);

        // Prevent infinite logout loop (ignore /logout and /me calls)
        const ignoreRoutes = ["/api/auth/logout", "/api/auth/me"];

        if (
          response.status === 401 &&
          isAuthenticated &&
          !logoutTriggered.current &&
          !ignoreRoutes.includes(config?.url)
        ) {
          logoutTriggered.current = true; // only trigger once

          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "You have been logged out. Please login again.",
            confirmButtonText: "OK",
          }).then(() => {
            logout(); // clears user and redirects to "/"
            logoutTriggered.current = false; // reset after logout completes
          });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated, logout]);
};
