import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ensures cookies are sent with each request
});

// Skip session handling for these endpoints
const skipAuthEndpoints = [
  "/api/auth/logout",
  "/api/auth/google-login",
  "/api/auth/me",
];

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    const isUnauthorized = response?.status === 401;
    const shouldSkip = skipAuthEndpoints.some((endpoint) =>
      config?.url?.includes(endpoint)
    );

    if (isUnauthorized && !shouldSkip) {
      localStorage.removeItem("user");

      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "You have been logged out. Please login again.",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.href = "/";
      });
    }

    return Promise.reject(error);
  }
);

export default api;
