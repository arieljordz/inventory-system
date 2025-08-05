// api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ensures cookies are sent/received
});

export default api;
