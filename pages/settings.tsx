import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPalette, FaBell, FaLock, FaGlobe, FaSave } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [notifikasi, setNotifikasi] = useState(true);
    const [emailNotif, setEmailNotif] = useState(false);
    const [bahasa, setBahasa] = useState('id');

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const inputClass = isDark
        ? 'bg-white/5 border-white/10 text-white'
        : 'bg-gray-50 border-gray-300 text-gray-900';

    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-purple-500' : isDark ? 'bg-white/20' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    const handleSave = () => {
        alert('Pengaturan berhasil disimpan! (Demo)');
    };

    return (
        <>
            <Head><title>Pengaturan - Sistem Manajemen Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8 max-w-3xl mx-auto">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 flex items-center gap-3">
                        <Link href="/dashboard">
                            <motion.button whileHover={{ x: -4 }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                <FaArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-bold ${textMain}`}>Pengaturan</h1>
                            <p className={textSub}>Konfigurasi aplikasi dan preferensi</p>
                        </div>
                    </motion.div>

                    {/* Tampilan */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`border rounded-xl p-5 backdrop-blur-md mb-4 ${cardClass}`}>
                        <div className="flex items-center gap-3 mb-5">
                            <FaPalette className="text-purple-400" />
                            <h2 className={`text-lg font-bold ${textMain}`}>Tampilan</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`font-medium ${textMain}`}>Mode Gelap</p>
                                    <p className={`text-sm ${textSub}`}>Gunakan tema gelap untuk tampilan</p>
                                </div>
                                <ToggleSwitch enabled={isDark} onChange={toggleTheme} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifikasi */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-5 backdrop-blur-md mb-4 ${cardClass}`}>
                        <div className="flex items-center gap-3 mb-5">
                            <FaBell className="text-yellow-400" />
                            <h2 className={`text-lg font-bold ${textMain}`}>Notifikasi</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`font-medium ${textMain}`}>Push Notification</p>
                                    <p className={`text-sm ${textSub}`}>Terima notifikasi di browser</p>
                                </div>
                                <ToggleSwitch enabled={notifikasi} onChange={() => setNotifikasi(!notifikasi)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`font-medium ${textMain}`}>Email Notification</p>
                                    <p className={`text-sm ${textSub}`}>Terima notifikasi via email</p>
                                </div>
                                <ToggleSwitch enabled={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Keamanan */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`border rounded-xl p-5 backdrop-blur-md mb-4 ${cardClass}`}>
                        <div className="flex items-center gap-3 mb-5">
                            <FaLock className="text-red-400" />
                            <h2 className={`text-lg font-bold ${textMain}`}>Keamanan</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${textMuted}`}>Password Saat Ini</label>
                                <input type="password" placeholder="••••••••" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 ${inputClass}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${textMuted}`}>Password Baru</label>
                                <input type="password" placeholder="••••••••" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 ${inputClass}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${textMuted}`}>Konfirmasi Password Baru</label>
                                <input type="password" placeholder="••••••••" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 ${inputClass}`} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Bahasa */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={`border rounded-xl p-5 backdrop-blur-md mb-5 ${cardClass}`}>
                        <div className="flex items-center gap-3 mb-5">
                            <FaGlobe className="text-blue-400" />
                            <h2 className={`text-lg font-bold ${textMain}`}>Bahasa</h2>
                        </div>
                        <select value={bahasa} onChange={(e) => setBahasa(e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 ${inputClass}`}>
                            <option value="id" className={isDark ? 'bg-[#1a1b2e] text-white' : ''}>Bahasa Indonesia</option>
                            <option value="en" className={isDark ? 'bg-[#1a1b2e] text-white' : ''}>English</option>
                        </select>
                    </motion.div>

                    {/* Save */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-end">
                        <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <FaSave /> Simpan Pengaturan
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
