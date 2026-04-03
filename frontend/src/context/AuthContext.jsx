import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setUser(JSON.parse(savedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { user, token } = response.data;
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true, user };
        } catch (err) {
            console.error('Login error details:', err.message, err.response?.data);
            return { success: false, message: err.response?.data?.message || `Login failed: ${err.message}` };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await axios.post('/api/auth/register', { name, email, password, role });
            const { user, token } = response.data;
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true, user };
        } catch (err) {
            console.error('Registration error details:', err.message, err.response?.data);
            return { success: false, message: err.response?.data?.message || `Registration failed: ${err.message}` };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const deleteAccount = async () => {
        try {
            await axios.delete('/api/auth/profile');
            logout();
            return { success: true };
        } catch (err) {
            console.error('Delete account error details:', err.message, err.response?.data);
            return { success: false, message: err.response?.data?.message || `Delete failed: ${err.message}` };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, deleteAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
