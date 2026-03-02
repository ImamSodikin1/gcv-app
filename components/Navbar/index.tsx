'use client';

import { FaInstagram, FaLinkedin, FaDribbble } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Navbar() {
    const { theme } = useTheme();
    
    const scrollToId = (id: string) => {
        if (typeof window === 'undefined') return;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const navBg = theme === 'dark'
        ? 'from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'from-white/80 via-gray-50/80 to-gray-100/80 border-gray-200/50';

    const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
    const hoverColor = theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600';

    return (
        <motion.nav
            className={`fixed top-0 left-0 w-full z-50 bg-gradient-to-br ${navBg} backdrop-blur-md border-b shadow-lg transition-colors duration-300`}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, type: 'spring' }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-10 py-4">
                <Link href="/">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent cursor-pointer">
                        <span className="rounded-full border-2 border-pink-400 p-2 shadow-md">@</span>
                    </div>
                </Link>
                <ul className={`hidden md:flex gap-8 font-medium text-lg ${textColor}`}>
                    <li>
                        <a href="#home" onClick={(e) => { e.preventDefault(); scrollToId('home'); }} className={`text-white dark:text-white ${hoverColor} transition-all duration-200`}>Home</a>
                    </li>
                    <li>
                        <a href="#services" onClick={(e) => { e.preventDefault(); scrollToId('services'); }} className={`hover:text-pink-400 transition-all duration-200`}>Services</a>
                    </li>
                    <li>
                        <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToId('projects'); }} className={`hover:text-purple-400 transition-all duration-200`}>Projects</a>
                    </li>
                    <li>
                        <a href="#experience" onClick={(e) => { e.preventDefault(); scrollToId('experience'); }} className={`${hoverColor} transition-all duration-200`}>Experience</a>
                    </li>
                    <li>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToId('contact'); }} className={`hover:text-pink-400 transition-all duration-200`}>Contact</a>
                    </li>
                </ul>
                <div className="flex items-center gap-3">
                    <a href="#" className={`hidden md:inline-flex p-2 rounded-full bg-white/10 hover:bg-pink-400/20 transition-all text-pink-400`}><FaLinkedin size={20} /></a>
                    <a href="#" className={`hidden md:inline-flex p-2 rounded-full bg-white/10 hover:bg-pink-400/20 transition-all text-pink-400`}><FaInstagram size={20} /></a>
                    <a href="#" className={`hidden md:inline-flex p-2 rounded-full bg-white/10 hover:bg-pink-400/20 transition-all text-pink-400`}><FaDribbble size={20} /></a>
                    <ThemeSwitcher />
                    <Link href="/dashboard">
                        <button className="ml-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all duration-200">
                            Dashboard
                        </button>
                    </Link>
                </div>
                {/* Mobile menu icon (optional) */}
            </div>
        </motion.nav>
    );
}
