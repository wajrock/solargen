import {useEffect, useState} from 'react';

export enum THEME {
    DARK = 'dark',
    LIGHT = 'light',
}

function useTheme() {
    const [theme, setTheme] = useState<THEME>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme as THEME;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? THEME.DARK : THEME.LIGHT;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === THEME.DARK);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return {theme, setTheme};
}

export default useTheme;
