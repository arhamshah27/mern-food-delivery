import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * On mount, try to restore the session by calling /auth/me.
     * If the cookie is valid the backend returns the user object.
     */
    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            const { data } = await axiosInstance.get("/auth/me");
            setUser(data.user);
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // ─── Auth actions ──────────────────────────────────────────────
    const register = async (formData) => {
        const { data } = await axiosInstance.post("/auth/register", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return data;
    };

    const login = async (credentials) => {
        const { data } = await axiosInstance.post("/auth/login", credentials);
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch {
            // Even if the server call fails, clear local state
        }
        localStorage.removeItem("token");
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
