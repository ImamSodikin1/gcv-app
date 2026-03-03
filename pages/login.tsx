import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaInfoCircle } from 'react-icons/fa';

export default function LoginPage() {
    const { theme } = useTheme();
    const { login, isLoggedIn } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already logged in, redirect
    if (isLoggedIn) {
        router.replace('/dashboard');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.message);
        }
    };

    const isDark = theme === 'dark';

    return (
        <>
            <Head>
                <title>Login - Sistem Manajemen Perumahan</title>
            </Head>

            <div className={`min-h-screen flex items-center justify-center px-4 ${
                isDark
                    ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]'
                    : 'bg-gradient-to-br from-gray-100 via-white to-gray-200'
            }`}>
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                    className={`w-full max-w-md rounded-2xl border p-8 backdrop-blur-md shadow-2xl ${
                        isDark
                            ? 'bg-[#181926]/80 border-white/10'
                            : 'bg-white border-gray-200'
                    }`}
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mb-4 shadow-lg">
                            <span className="text-white text-2xl font-bold">@</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Selamat Datang
                        </h1>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Masuk ke Sistem Manajemen Perumahan
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Email
                            </label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all focus-within:ring-2 focus-within:ring-pink-400/50 ${
                                isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            }`}>
                                <FaEnvelope className="text-pink-400" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full bg-transparent outline-none placeholder-gray-500"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Password
                            </label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all focus-within:ring-2 focus-within:ring-pink-400/50 ${
                                isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            }`}>
                                <FaLock className="text-pink-400" size={16} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent outline-none placeholder-gray-500"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Forgot Password */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="text-right"
                        >
                            <a href="#" className="text-sm text-pink-400 hover:text-pink-300 transition-colors">
                                Lupa password?
                            </a>
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FaSignInAlt size={16} />
                                    <span>Masuk</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Register Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                            Daftar sekarang
                        </Link>
                    </motion.p>

                    {/* Back to Dashboard */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="text-center mt-3"
                    >
                        <Link href="/dashboard" className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
                            ← Kembali ke Dashboard
                        </Link>
                    </motion.div>

                    {/* Demo Account Info
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className={`mt-5 p-4 rounded-lg border ${isDark ? 'bg-blue-500/10 border-blue-400/20' : 'bg-blue-50 border-blue-200'}`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <FaInfoCircle className="text-blue-400" size={14} />
                            <span className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Akun Demo</span>
                        </div>
                        <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p><span className="font-medium">Superadmin:</span> superadmin@perumahan.com / superadmin123</p>
                            <p><span className="font-medium">Admin:</span> admin@perumahan.com / admin123</p>
                            <p><span className="font-medium">Warga:</span> budi@gmail.com / user123</p>
                        </div>
                    </motion.div> */}
                </motion.div>
            </div>
        </>
    );
}
