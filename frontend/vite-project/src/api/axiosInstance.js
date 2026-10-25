import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor (attach Bearer token if stored in localStorage) ──
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor (handle 401 globally) ──────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Only redirect if not already on auth pages
            const path = window.location.pathname;
            if (path !== "/login" && path !== "/register") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
