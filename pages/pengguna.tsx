import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaSearch, FaUserShield, FaUserCheck, FaUsers, FaEdit, FaTimes, FaLock } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth, type UserRole } from '@/context/AuthContext';

export default function PenggunaPage() {
    // All hooks MUST be called at top level, before any conditional returns
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { canManageRoles, getAllUsers, updateUserRole } = useAuth();
    const [search, setSearch] = useState('');
    const [userList, setUserList] = useState(getAllUsers());
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
    const [editRole, setEditRole] = useState<UserRole>('user');
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    // Guard: redirect if not superadmin
    if (!canManageRoles) {
        return (
            <>
                <Head><title>Akses Ditolak - Sistem Manajemen Perumahan</title></Head>
                <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-center p-8 rounded-2xl border ${isDark ? 'bg-[#181926]/80 border-white/10' : 'bg-white border-gray-200'}`}>
                        <FaLock className="text-red-400 mx-auto mb-4" size={48} />
                        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Akses Ditolak</h1>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>Hanya superadmin yang dapat mengelola pengguna dan roles.</p>
                        <Link href="/dashboard">
                            <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg">
                                Kembali ke Dashboard
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </>
        );
    }

    const filteredUsers = userList.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())
    );

    const handleUpdateRole = async () => {
        if (!editingUser) return;
        setUpdating(true);
        const result = await updateUserRole(editingUser.id, editRole);
        setUpdateMessage(result.message);
        setUpdating(false);
        
        if (result.success) {
            setUserList(getAllUsers());
            setTimeout(() => {
                setShowEditModal(false);
                setUpdateMessage('');
            }, 1000);
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch(role) {
            case 'superadmin': return 'bg-red-500/20 text-red-400 border-red-400/30';
            case 'admin': return 'bg-amber-500/20 text-amber-400 border-amber-400/30';
            case 'user': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch(role) {
            case 'superadmin': return 'Superadmin';
            case 'admin': return 'Admin';
            case 'user': return 'Warga';
        }
    };

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const inputClass = isDark
        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400';

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
                            { label: 'Admin', value: userList.filter(u => u.role === 'admin' || u.role === 'superadmin').length.toString(), color: 'text-purple-400', bg: 'from-purple-400/20 to-violet-500/20', icon: <FaUserShield /> },
                            { label: 'Warga', value: userList.filter(u => u.role === 'user').length.toString(), color: 'text-green-400', bg: 'from-green-400/20 to-emerald-500/20', icon: <FaUserCheck /> },
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
                                placeholder="Cari nama, email, atau role..."
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
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Role</th>
                                        <th className={`text-center px-6 py-4 font-semibold ${textMuted}`}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, i) => (
                                        <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-t ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                                            <td className={`px-6 py-4 font-medium ${textMain}`}>{user.name}</td>
                                            <td className={`px-6 py-4 ${textMuted}`}>{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {/* Prevent changing superadmin role */}
                                                {user.role === 'superadmin' ? (
                                                    <span className={`text-xs ${textSub} italic`}>Superadmin</span>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser({ id: user.id, name: user.name, role: user.role });
                                                            setEditRole(user.role);
                                                            setShowEditModal(true);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-purple-400' : 'hover:bg-gray-100 text-gray-500 hover:text-purple-500'}`}
                                                        title="Ubah role"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr><td colSpan={4} className={`px-6 py-12 text-center ${textSub}`}>Tidak ada pengguna ditemukan</td></tr>
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
                                <h2 className={`text-xl font-bold ${textMain}`}>Ubah Role Pengguna</h2>
                                <button onClick={() => setShowEditModal(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <FaTimes size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Nama Pengguna</label>
                                    <p className={`px-4 py-2.5 rounded-lg text-sm ${isDark ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-900'}`}>
                                        {editingUser?.name}
                                    </p>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Role</label>
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="user">Warga</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                {updateMessage && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-3 rounded-lg text-sm text-center ${updateMessage.includes('berhasil') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                                    >
                                        {updateMessage}
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    disabled={updating}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpdateRole}
                                    disabled={updating || !editingUser || editRole === editingUser.role}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-60"
                                >
                                    {updating ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
