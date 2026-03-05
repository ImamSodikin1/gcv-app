import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiUsers, FiCreditCard, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface MenuItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isDark: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, icon: Icon, label, isActive, isDark }) => {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center md:justify-start gap-2 px-4 py-2 rounded-lg transition-all duration-200 flex-1 md:flex-initial w-full md:w-auto ${isActive
          ? isDark
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
            : 'bg-blue-600 text-white shadow-lg'
          : isDark
            ? 'bg-[#181926]/80 text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 border border-white/10'
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
        }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default function MenuPendataan() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { href: '/pendataan', icon: FiBarChart2, label: 'Dashboard' },
    { href: '/pendataan/kartu-keluarga', icon: FiCreditCard, label: 'Kartu Keluarga' },
    { href: '/pendataan/penduduk', icon: FiUsers, label: 'Data Penduduk' },
    { href: '/pendataan/pekerjaan', icon: FiBarChart2, label: 'Pekerjaan' },
  ];

  const containerBg = isDark
    ? 'bg-gradient-to-r from-[#181926]/80 to-[#1f1e2e]/80 border border-white/10'
    : 'bg-gradient-to-r from-slate-100 to-slate-50';
  const textMain = isDark ? 'text-white' : 'text-gray-800';
  const iconColor = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${containerBg} rounded-lg shadow-md p-3 mb-4`}
    >
      <div className="w-full">
        {/* <div className="flex items-center gap-2">
          <FiHome className={`${iconColor} w-5 h-5`} />
          <h2 className={`text-lg font-semibold ${textMain}`}>Menu Pendataan</h2>
        </div> */}
        <div className="w-full flex flex-col md:flex-row md:flex-wrap gap-2">
          {menuItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={router.pathname === item.href}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
