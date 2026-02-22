import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mock users for demonstration (in real app, this would come from API)
    const mockUsers = [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            name: 'Administrator',
            position_am: 'አፈፃፀም ሃላፊ',
            position_en: 'Executive Manager',
            office: 'executive',
            role: 'admin',
            accessibleOffices: ['work-skills', 'urban-agriculture', 'trade', 'peace-security', 'finance', 'community-governance', 'civil-registration', 'public-service-hr-development', 'party-works']
        },
        {
            id: 2,
            username: 'workskills',
            password: 'ws123',
            name: 'ስራና ክህሎት ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'work-skills',
            role: 'user',
            accessibleOffices: ['work-skills']
        },
        {
            id: 3,
            username: 'urbanagri',
            password: 'ua123',
            name: 'ከተማ ግብርና ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'urban-agriculture',
            role: 'user',
            accessibleOffices: ['urban-agriculture']
        },
        {
            id: 4,
            username: 'trade',
            password: 'tr123',
            name: 'ንግድ ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'trade',
            role: 'user',
            accessibleOffices: ['trade']
        },
        {
            id: 5,
            username: 'peace',
            password: 'ps123',
            name: 'ሰላምና ጸጥታ ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'peace-security',
            role: 'user',
            accessibleOffices: ['peace-security']
        },
        {
            id: 6,
            username: 'finance',
            password: 'fn123',
            name: 'ፋይናንስ ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'finance',
            role: 'user',
            accessibleOffices: ['finance']
        },
        {
            id: 7,
            username: 'community',
            password: 'cg123',
            name: 'ህብረተሰብ ተሳትፎና በጎፍቃድ ማስተባበሪያ ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'community-governance',
            role: 'user',
            accessibleOffices: ['community-governance']
        },
        {
            id: 8,
            username: 'civilreg',
            password: 'cr123',
            name: 'ሲቪል ምዝገባ ጽ/ቤት',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'civil-registration',
            role: 'user',
            accessibleOffices: ['civil-registration']
        },
        {
            id: 9,
            username: 'partyworks',
            password: 'pw123',
            name: 'የፓርቲ ስራዎች ለጠቅላላ አመራሩ',
            position_am: 'ባለሙያ',
            position_en: 'Expert',
            office: 'party-works',
            role: 'user',
            accessibleOffices: ['party-works']
        }
    ];

    // Always use mock users for consistent login credentials
    const getUsers = () => {
        return mockUsers;
    };

    // Save users to localStorage
    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

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

    // Login function
    const login = async (username, password) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Trim inputs and make username case-insensitive
        const trimmedUsername = username.trim().toLowerCase();
        const trimmedPassword = password.trim();

        const users = getUsers();
        console.log('All users in storage:', users);
        console.log('Attempting login with:', { originalUsername: username, trimmedUsername, trimmedPassword });

        const foundUser = users.find(u => {
            const userUsername = u.username.trim().toLowerCase();
            const userPassword = u.password.trim();
            console.log('Checking user:', userUsername, userPassword, 'vs', trimmedUsername, trimmedPassword);
            return userUsername === trimmedUsername && userPassword === trimmedPassword;
        });
        console.log('Found user:', foundUser);

        if (foundUser) {
            const userData = { ...foundUser };
            delete userData.password; // Don't store password in state

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return { success: true };
        } else {
            return { success: false, error: 'ያልተለመደ የተጠቃሚ ስም ወይም የይለፍ ቃል ነው። እባክዎ እንደገና ያስገቡ።' }; // Amharic error message
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
    };

    // Create user function
    const createUser = (userData) => {
        const users = getUsers();
        const newUser = {
            id: Date.now(), // Simple ID generation
            ...userData
        };
        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);
        return newUser;
    };

    // Change password function
    const changePassword = (currentPassword, newPassword) => {
        if (!user) {
            return { success: false, error: 'No user logged in' };
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
            return { success: false, error: 'User not found' };
        }

        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Update password
        users[userIndex].password = newPassword;
        saveUsers(users);

        return { success: true };
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        createUser,
        changePassword
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
