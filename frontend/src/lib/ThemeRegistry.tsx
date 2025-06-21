// src/lib/ThemeRegistry.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';
import { GlobalStyle } from '@/styles/GlobalStyle';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
} | null>(null);

export const ThemeRegistry = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>('light');

    useEffect(() => {
        // Get saved theme or system preference
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        setCurrentTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
    }, []);

    useEffect(() => {
        // Save theme preference
        localStorage.setItem('theme', currentTheme);
        document.documentElement.className = currentTheme;
    }, [currentTheme]);

    const toggleTheme = () => {
        setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            <StyledThemeProvider theme={theme[currentTheme]}>
                <GlobalStyle />
                {children}
            </StyledThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeRegistry');
    }
    return context;
};