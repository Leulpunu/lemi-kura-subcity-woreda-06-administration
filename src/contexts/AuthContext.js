import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('currentUser'); // Clear corrupted data
        }
        setLoading(false);
    }, []);

    // Login function - uses API
    const login = async (username, password) => {
        try {
            // Trim inputs
            const trimmedUsername = username.trim().toLowerCase();
            const trimmedPassword = password.trim();

            // Call the backend API
            const response = await api.post('/auth/login', {
                username: trimmedUsername,
                password: trimmedPassword
            });

            if (response.data.token && response.data.user) {
                const userData = response.data.user;
                
                // Remove password from stored data
                delete userData.password;

                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('currentUser', JSON.stringify(userData));
                localStorage.setItem('token', response.data.token);
                
                return { success: true };
            }
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            const errorMessage = error.response?.data?.message || 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
    };

    // Create user function - uses API
    const createUser = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Create user error:', error.response?.data?.message || error.message);
            return { success: false, error: error.response?.data?.message || 'Failed to create user' };
        }
    };

    // Change password function
    const changePassword = async (currentPassword, newPassword) => {
        if (!user) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword,
                userId: user.id
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { success: true };
        } catch (error) {
            console.error('Change password error:', error.response?.data?.message || error.message);
            return { success: false, error: error.response?.data?.message || 'Failed to change password' };
        }
    };

    // Check username availability
    const checkUsernameAvailability = async (username) => {
        try {
            const response = await api.get(`/auth/check-username/${username}`);
            return response.data.available;
        } catch (error) {
            console.error('Check username error:', error);
            return false;
        }
    };

    // Change username function
    const changeUsername = async (newUsername) => {
        if (!user) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            const response = await api.post('/auth/change-username', {
                userId: user.id,
                newUsername
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.user) {
                setUser(response.data.user);
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }
            
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Change username error:', error.response?.data?.message || error.message);
            return { success: false, error: error.response?.data?.message || 'Failed to change username' };
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        createUser,
        changePassword,
        checkUsernameAvailability,
        changeUsername
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
