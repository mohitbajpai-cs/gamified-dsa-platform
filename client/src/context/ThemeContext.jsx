import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Current setup defaults strictly to dark mode but keeps state structure for future expansions
    const [themeMode, setThemeMode] = useState('dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light');
        root.classList.add('dark');
    }, [themeMode]);

    const toggleTheme = () => {
        // Placeholder for future light theme additions
        setThemeMode(prev => prev === 'dark' ? 'dark' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
