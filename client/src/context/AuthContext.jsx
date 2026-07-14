import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, logoutApi, getProfileApi } from '../services/auth.api';
import { getProgressApi } from '../services/progress.api';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [progress, setProgress] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshProgress = async () => {
        try {
            const res = await getProgressApi();
            if (res.success && res.data) {
                setProgress(res.data);
            }
        } catch (err) {
            console.error('Failed to sync progress:', err);
        }
    };

    useEffect(() => {
        // Register response interceptor for unified 401 session expiration handling
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    const requestUrl = error.config?.url || '';
                    // Prevent redirect loops during initial profile handshake
                    if (!requestUrl.endsWith('/auth/profile')) {
                        setUser(null);
                        setProgress(null);
                        setIsAuthenticated(false);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Attempt to sync auth status from cookies on initial load
        const checkAuth = async () => {
            try {
                const res = await getProfileApi();
                if (res.success && res.data) {
                    setUser(res.data);
                    setIsAuthenticated(true);
                    await refreshProgress();
                }
            } catch (err) {
                // Fail silently when user is unauthenticated initially
            } finally {
                setLoading(false);
            }
        };
        checkAuth();

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const res = await loginApi(email, password);
            if (res.success && res.data) {
                const userData = res.data.user || res.data;
                setUser(userData);
                setIsAuthenticated(true);
                await refreshProgress();
                return res;
            }
            throw new Error(res.message || 'Login failed');
        } catch (err) {
            throw err;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await registerApi(username, email, password);
            if (res.success) {
                // Auto login after successful registration
                const loginRes = await loginApi(email, password);
                if (loginRes.success && loginRes.data) {
                    const userData = loginRes.data.user || loginRes.data;
                    setUser(userData);
                    setIsAuthenticated(true);
                    await refreshProgress();
                }
                return res;
            }
            throw new Error(res.message || 'Registration failed');
        } catch (err) {
            throw err;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutApi();
        } catch (err) {
            // Silence connection errors on exit
        } finally {
            setUser(null);
            setProgress(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const res = await getProfileApi();
            if (res.success && res.data) {
                setUser(res.data);
                await refreshProgress();
            }
        } catch (err) {
            // Silence profile reload fails
        }
    };

    return (
        <AuthContext.Provider value={{ user, progress, isAuthenticated, loading, login, register, logout, setUser, refreshUser, refreshProgress }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
