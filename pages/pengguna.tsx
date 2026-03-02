import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaSearch, FaUserShield, FaUserCheck, FaUsers, FaEdit, FaTimes } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const users = [
    { id: '1', name: 'Budi Santoso', email: 'budi@email.com', phone: '0812-3456-7890', block: 'Blok A', role: 'Ketua RT', status: 'active' },
    { id: '2', name: 'Siti Nurhaliza', email: 'siti@email.com', phone: '0813-2345-6789', block: 'Blok B', role: 'Warga', status: 'active' },
    { id: '3', name: 'Ahmad Wijaya', email: 'ahmad@email.com', phone: '0814-3456-7891', block: 'Blok C', role: 'Sekretaris', status: 'active' },
    { id: '4', name: 'Dewi Sartika', email: 'dewi@email.com', phone: '0815-4567-8902', block: 'Blok D', role: 'Warga', status: 'inactive' },
    { id: '5', name: 'Rudi Hartono', email: 'rudi@email.com', phone: '0816-5678-9013', block: 'Blok A', role: 'Bendahara', status: 'active' },
    { id: '6', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '0817-6789-0124', block: 'Blok E', role: 'Warga', status: 'active' },
    { id: '7', name: 'Maya Sari', email: 'maya@email.com', phone: '0818-7890-1235', block: 'Blok B', role: 'Warga', status: 'active' },
    { id: '8', name: 'Joko Widodo', email: 'joko@email.com', phone: '0819-8901-2346', block: 'Blok C', role: 'Koordinator Ronda', status: 'inactive' },
];

export default function PenggunaPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [search, setSearch] = useState('');
    const [userList, setUserList] = useState(users);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<{ id: string; name: string } | null>(null);
    const [editName, setEditName] = useState('');

    // Simulated current user role - set to 'admin' to enable edit
    const currentUserRole: 'admin' | 'warga' = 'admin';

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const inputClass = isDark
        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400';

    const filteredUsers = userList.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.block.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = userList.filter((u) => u.status === 'active').length;

    return (
        <>
            <Head><title>Pengguna - Sistem Manajemen Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 flex items-center gap-3">
                        <Link href="/dashboard">
                            <motion.button whileHover={{ x: -4 }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                <FaArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-bold ${textMain}`}>Pengguna</h1>
                            <p className={textSub}>Manajemen pengguna dan warga perumahan</p>
                        </div>
                    </motion.div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                        {[
                            { label: 'Total Pengguna', value: userList.length.toString(), color: 'text-blue-400', bg: 'from-blue-400/20 to-indigo-500/20', icon: <FaUsers /> },
                            { label: 'Aktif', value: activeCount.toString(), color: 'text-green-400', bg: 'from-green-400/20 to-emerald-500/20', icon: <FaUserCheck /> },
                            { label: 'Pengurus', value: userList.filter(u => u.role !== 'Warga').length.toString(), color: 'text-purple-400', bg: 'from-purple-400/20 to-violet-500/20', icon: <FaUserShield /> },
                        ].map((c, i) => (
                            <motion.div key={i} whileHover={{ y: -3 }} className={`bg-gradient-to-br ${c.bg} border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-5`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={c.color}>{c.icon}</span>
                                    <p className={`text-sm ${textMuted}`}>{c.label}</p>
                                </div>
                                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4">
                        <div className="relative max-w-md">
                            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSub}`} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, blok, atau role..."
                                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 transition-colors ${inputClass}`}
                            />
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`border rounded-xl overflow-hidden backdrop-blur-md ${cardClass}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-modern">
                                <thead>
                                    <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Nama</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Email</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Telepon</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Blok</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Role</th>
                                        <th className={`text-center px-6 py-4 font-semibold ${textMuted}`}>Status</th>
                                        {currentUserRole === 'admin' && <th className={`text-center px-6 py-4 font-semibold ${textMuted}`}>Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, i) => (
                                        <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-t ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                                            <td className={`px-6 py-4 font-medium ${textMain}`}>{user.name}</td>
                                            <td className={`px-6 py-4 ${textMuted}`}>{user.email}</td>
                                            <td className={`px-6 py-4 ${textMuted}`}>{user.phone}</td>
                                            <td className={`px-6 py-4 ${textMain}`}>{user.block}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'Warga' ? 'bg-blue-400/20 text-blue-400' : 'bg-purple-400/20 text-purple-400'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'}`}>
                                                    {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            {currentUserRole === 'admin' && (
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser({ id: user.id, name: user.name });
                                                            setEditName(user.name);
                                                            setShowEditModal(true);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-purple-400' : 'hover:bg-gray-100 text-gray-500 hover:text-purple-500'}`}
                                                        title="Edit nama"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr><td colSpan={currentUserRole === 'admin' ? 7 : 6} className={`px-6 py-12 text-center ${textSub}`}>Tidak ada pengguna ditemukan</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modal Edit Nama Pengguna */}
            <AnimatePresence>
                {showEditModal && editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold ${textMain}`}>Edit Nama Pengguna</h2>
                                <button onClick={() => setShowEditModal(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <FaTimes size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Nama Pengguna</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Masukkan nama baru..."
                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        if (!editName.trim()) return;
                                        setUserList(userList.map((u) =>
                                            u.id === editingUser.id ? { ...u, name: editName.trim() } : u
                                        ));
                                        setShowEditModal(false);
                                        setEditingUser(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
