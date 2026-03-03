'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import {
    FaBars,
    FaTimes,
    FaHome,
    FaShieldAlt,
    FaMoneyBillWave,
    FaFileAlt,
    FaUsers,
    FaCog,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaSignInAlt,
    FaUserPlus,
    FaSitemap,
    FaCommentDots,
    FaSignOutAlt,
    FaUserCircle,
    FaInfoCircle,
} from 'react-icons/fa';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    submenu?: NavItem[];
    requireAuth?: boolean;   // true = only show when logged in
    adminOnly?: boolean;     // true = only show for admin role
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <FaHome size={20} />,
    },
    {
        label: 'Ronda',
        href: '/ronda',
        icon: <FaShieldAlt size={20} />,
        requireAuth: true,
        submenu: [
            { label: 'Jadwal Ronda', href: '/ronda/schedule', icon: null, requireAuth: true },
            { label: 'Laporan Ronda', href: '/ronda/reports', icon: null, requireAuth: true },
        ],
    },
    {
        label: 'Keuangan',
        href: '/keuangan',
        icon: <FaMoneyBillWave size={20} />,
        requireAuth: true,
        submenu: [
            { label: 'Transaksi', href: '/keuangan/transactions', icon: null, requireAuth: true },
            { label: 'Laporan', href: '/keuangan/reports', icon: null, requireAuth: true },
        ],
    },
    {
        label: 'Surat Edaran',
        href: '/surat-edaran',
        icon: <FaFileAlt size={20} />,
        requireAuth: true,
        submenu: [
            { label: 'Daftar Surat', href: '/surat-edaran/list', icon: null, requireAuth: true },
            { label: 'Buat Surat', href: '/surat-edaran/create', icon: null, adminOnly: true },
        ],
    },
    {
        label: 'Kepengurusan',
        href: '/kepengurusan',
        icon: <FaSitemap size={20} />,
        requireAuth: true,
    },
    {
        label: 'Kritik & Saran',
        href: '/kritik-saran',
        icon: <FaCommentDots size={20} />,
        requireAuth: true,
    },
    {
        label: 'Pengguna',
        href: '/pengguna',
        icon: <FaUsers size={20} />,
        adminOnly: true,
    },
    {
        label: 'Pendataan Warga',
        href: '/pendataan',
        icon: <FaInfoCircle size={20} />,
        requireAuth: true,
        submenu: [
            { label: 'Dashboard', href: '/pendataan', icon: null, requireAuth: true },
            { label: 'Kartu Keluarga', href: '/pendataan/kartu-keluarga', icon: null, requireAuth: true },
            { label: 'Data Penduduk', href: '/pendataan/penduduk', icon: null, requireAuth: true },
        ],
    },
    {
        label: 'Pengaturan',
        href: '/settings',
        icon: <FaCog size={20} />,
        requireAuth: true,
    },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const router = useRouter();
    const { theme } = useTheme();
    const { user, isLoggedIn, isAdmin, logout } = useAuth();

    // Filter nav items based on auth state
    const filteredNavItems = useMemo(() => {
        return navItems
            .filter(item => {
                if (item.adminOnly && !isAdmin) return false;
                if (item.requireAuth && !isLoggedIn) return false;
                return true;
            })
            .map(item => {
                if (!item.submenu) return item;
                return {
                    ...item,
                    submenu: item.submenu.filter(sub => {
                        if (sub.adminOnly && !isAdmin) return false;
                        if (sub.requireAuth && !isLoggedIn) return false;
                        return true;
                    }),
                };
            });
    }, [isLoggedIn, isAdmin]);

    const handleLogout = () => {
        logout();
        router.push('/dashboard');
    };

    const toggleSubmenu = (label: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(label)) {
            newExpanded.delete(label);
        } else {
            newExpanded.add(label);
        }
        setExpandedItems(newExpanded);
    };

    const handleNavClick = () => {
        setIsOpen(false);
    };

    const isActive = (href: string) => router.pathname === href;

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: (i: number) => ({
            x: 0,
            opacity: 1,
            transition: {
                delay: i * 0.05,
            },
        }),
    };

    const darkBg = 'bg-gradient-to-b from-[#181926]/95 via-[#231b2e]/95 to-[#2d1e3a]/95 border-white/10';
    const lightBg = 'bg-gradient-to-b from-gray-50 via-white to-gray-100 border-gray-200';
    const sidebarBg = theme === 'dark' ? darkBg : lightBg;

    const sidebarContent = (collapsed: boolean) => (
        <div className="h-full flex flex-col">
            {/* Logo Section */}
            <div className={`p-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} border-b`}>
                <div className="flex items-center justify-between">
                    <Link href="/dashboard">
                        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} cursor-pointer`}>
                            <div className="rounded-full border-2 border-pink-400 p-2 shadow-md bg-gradient-to-r from-blue-400 to-purple-400 flex-shrink-0">
                                <span className="text-white font-bold">@</span>
                            </div>
                            {!collapsed && (
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                        Perumahan
                                    </h1>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Management System</p>
                                </div>
                            )}
                        </div>
                    </Link>
                    {/* Collapse / Expand toggle (desktop only) & Theme Switcher */}
                    {!collapsed && (
                        <div className="flex items-center gap-1">
                            <ThemeSwitcher />
                            <motion.button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`hidden md:flex p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-800'}`}
                                title="Collapse sidebar"
                            >
                                <FaChevronLeft size={16} />
                            </motion.button>
                        </div>
                    )}
                    {collapsed && (
                        <motion.button
                            onClick={() => setIsCollapsed(false)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`hidden md:flex p-2 rounded-lg transition-colors absolute -right-3 top-6 z-10 shadow-md border ${theme === 'dark' ? 'bg-[#231b2e] border-white/20 text-gray-300 hover:text-white' : 'bg-white border-gray-300 text-gray-500 hover:text-gray-800'}`}
                            title="Expand sidebar"
                        >
                            <FaChevronRight size={12} />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Navigation Items */}
            <nav className={`flex-1 overflow-y-auto ${collapsed ? 'p-2 space-y-1' : 'p-4 space-y-2'} ${theme === 'dark' ? '' : 'bg-gradient-to-b from-white to-gray-50'}`}>
                {/* Collapsed: theme switcher under logo */}
                {collapsed && (
                    <div className="flex justify-center mb-2">
                        <ThemeSwitcher />
                    </div>
                )}
                {filteredNavItems.map((item, index) => {
                    const isItemActive = isActive(item.href);
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isExpanded = expandedItems.has(item.label);

                    return (
                        <motion.div
                            key={item.label}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {hasSubmenu ? (
                                <button
                                    onClick={() => toggleSubmenu(item.label)}
                                    title={collapsed ? item.label : undefined}
                                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between gap-3'} px-3 py-3 rounded-lg transition-all duration-200 group ${
                                        theme === 'dark'
                                            ? 'text-gray-200 hover:bg-white/10'
                                            : 'text-gray-700 hover:bg-gray-200/50'
                                    }`}
                                >
                                    <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                                        <span className="text-pink-400 group-hover:text-blue-400 transition-colors">
                                            {item.icon}
                                        </span>
                                        {!collapsed && <span className="font-medium">{item.label}</span>}
                                    </div>
                                    {!collapsed && (
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <FaChevronDown size={12} />
                                        </motion.div>
                                    )}
                                </button>
                            ) : (
                                <Link href={item.href}>
                                    <div
                                        onClick={handleNavClick}
                                        title={collapsed ? item.label : undefined}
                                        className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                                            isItemActive
                                                ? theme === 'dark'
                                                    ? 'bg-gradient-to-r from-pink-400/30 to-purple-400/30 border border-pink-400/50'
                                                    : 'bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-300'
                                                : theme === 'dark'
                                                ? 'text-gray-200 hover:bg-white/10'
                                                : 'text-gray-700 hover:bg-gray-200/50'
                                        }`}
                                    >
                                        <span className="text-pink-400 group-hover:text-blue-400 transition-colors">
                                            {item.icon}
                                        </span>
                                        {!collapsed && <span className="font-medium">{item.label}</span>}
                                    </div>
                                </Link>
                            )}

                            {/* Submenu */}
                            {hasSubmenu && isExpanded && !collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-2 ml-6 space-y-1 border-l-2 ${
                                        theme === 'dark' ? 'border-pink-400/20' : 'border-pink-300/40'
                                    }`}
                                >
                                    {item.submenu && item.submenu.map((subitem) => (
                                        <Link key={subitem.label} href={subitem.href}>
                                            <div
                                                onClick={handleNavClick}
                                                className={`block px-4 py-2 text-sm rounded transition-all pl-4 cursor-pointer ${
                                                    isActive(subitem.href)
                                                        ? theme === 'dark'
                                                            ? 'text-pink-400 bg-white/10'
                                                            : 'text-pink-600 bg-pink-50'
                                                        : theme === 'dark'
                                                        ? 'text-gray-300 hover:text-pink-400'
                                                        : 'text-gray-600 hover:text-pink-600'
                                                }`}
                                            >
                                                {subitem.label}
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className={`border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} ${collapsed ? 'p-2 space-y-2' : 'p-4 space-y-3'}`}>
                {/* Not logged in: show info + Login/Register */}
                {!isLoggedIn ? (
                    <>
                        {/* Info banner - only when expanded */}
                        {!collapsed && (
                            <div className={`rounded-lg p-3 border ${
                                theme === 'dark'
                                    ? 'bg-blue-500/10 border-blue-400/20'
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                                <div className="flex items-start gap-2">
                                    <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={14} />
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Login atau daftar untuk mengakses semua fitur sistem manajemen perumahan.
                                    </p>
                                </div>
                            </div>
                        )}
                        {collapsed ? (
                            <div className="flex flex-col items-center gap-2">
                                <Link href="/login">
                                    <div className={`p-2.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} title="Login">
                                        <FaSignInAlt size={16} />
                                    </div>
                                </Link>
                                <Link href="/register">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-white" title="Register">
                                        <FaUserPlus size={16} />
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login" className="flex-1">
                                    <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        theme === 'dark'
                                            ? 'bg-white/10 text-gray-200 hover:bg-white/20'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}>
                                        <FaSignInAlt size={14} />
                                        <span>Login</span>
                                    </div>
                                </Link>
                                <Link href="/register" className="flex-1">
                                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium">
                                        <FaUserPlus size={14} />
                                        <span>Register</span>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    /* Logged in: show user info + logout */
                    <>
                        {collapsed ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className={`p-2.5 rounded-full ${
                                    isAdmin
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                                        : 'bg-gradient-to-r from-blue-400 to-purple-400'
                                } text-white`} title={`${user?.name} (${user?.role})`}>
                                    <FaUserCircle size={16} />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className={`p-2.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-red-400 hover:bg-red-500/20' : 'bg-gray-200 text-red-500 hover:bg-red-100'}`}
                                    title="Logout"
                                >
                                    <FaSignOutAlt size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                                }`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isAdmin
                                            ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                                            : 'bg-gradient-to-r from-blue-400 to-purple-400'
                                    } text-white`}>
                                        <FaUserCircle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                                        <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                        <span className={`inline-block text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-medium ${
                                            isAdmin
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {isAdmin ? 'Admin' : 'Warga'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        theme === 'dark'
                                            ? 'bg-white/10 text-red-400 hover:bg-red-500/20'
                                            : 'bg-gray-200 text-red-500 hover:bg-red-100'
                                    }`}
                                >
                                    <FaSignOutAlt size={14} />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Version Info */}
                {!collapsed && (
                    <div className={`rounded-lg p-3 border ${
                        theme === 'dark'
                            ? 'bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 border-pink-400/30'
                            : 'bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-pink-300'
                    }`}>
                        <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Sistem Manajemen Perumahan v1.0
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-br from-pink-400 to-purple-400 text-white md:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>

            {/* Desktop Sidebar - always visible, takes up space in flex layout */}
            <aside
                className={`hidden md:block h-screen ${isCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 sticky top-0 backdrop-blur-md border-r shadow-xl transition-all duration-300 ${sidebarBg}`}
            >
                {sidebarContent(isCollapsed)}
            </aside>

            {/* Mobile Sidebar - animated slide */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`md:hidden fixed left-0 top-0 h-screen w-64 z-40 backdrop-blur-md border-r shadow-xl ${sidebarBg}`}
                        >
                            {sidebarContent(false)}
                        </motion.aside>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        />
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
