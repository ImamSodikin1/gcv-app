'use client';

import { motion } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeSwitcher() {
    const { theme, toggleTheme, mounted } = useTheme();

    if (!mounted) return null;

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg transition-all ${
                theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-400 hover:text-yellow-400'
                    : 'hover:bg-gray-200 text-gray-500 hover:text-blue-500'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <FaSun size={18} className="text-yellow-400" />
            ) : (
                <FaMoon size={18} className="text-blue-500" />
            )}
        </motion.button>
    );
}
