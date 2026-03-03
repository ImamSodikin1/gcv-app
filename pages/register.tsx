import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaUserPlus, FaPhone } from 'react-icons/fa';

export default function RegisterPage() {
    const { theme } = useTheme();
    const { register, isLoggedIn } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // If already logged in, redirect
    if (isLoggedIn) {
        router.replace('/dashboard');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (form.password !== form.confirmPassword) {
            setError('Password tidak cocok!');
            return;
        }
        if (form.password.length < 6) {
            setError('Password minimal 6 karakter!');
            return;
        }
        setLoading(true);
        const result = await register({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
        });
        setLoading(false);
        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => router.push('/login'), 1500);
        } else {
            setError(result.message);
        }
    };

    const isDark = theme === 'dark';

    const inputFields = [
        {
            name: 'name',
            label: 'Nama Lengkap',
            type: 'text',
            icon: <FaUser className="text-pink-400" size={16} />,
            placeholder: 'Nama lengkap Anda',
            delay: 0.2,
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            icon: <FaEnvelope className="text-pink-400" size={16} />,
            placeholder: 'nama@email.com',
            delay: 0.25,
        },
        {
            name: 'phone',
            label: 'No. Telepon',
            type: 'tel',
            icon: <FaPhone className="text-pink-400" size={16} />,
            placeholder: '08xxxxxxxxxx',
            delay: 0.3,
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            icon: <FaLock className="text-pink-400" size={16} />,
            placeholder: '••••••••',
            delay: 0.35,
        },
        {
            name: 'confirmPassword',
            label: 'Konfirmasi Password',
            type: 'password',
            icon: <FaLock className="text-pink-400" size={16} />,
            placeholder: '••••••••',
            delay: 0.4,
        },
    ];

    return (
        <>
            <Head>
                <title>Register - Sistem Manajemen Perumahan</title>
            </Head>

            <div className={`min-h-screen flex items-center justify-center px-4 py-10 ${
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 mb-4 shadow-lg">
                            <FaUserPlus className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Buat Akun
                        </h1>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Daftar ke Sistem Manajemen Perumahan
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {inputFields.map((field) => (
                            <motion.div
                                key={field.name}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: field.delay }}
                            >
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {field.label}
                                </label>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all focus-within:ring-2 focus-within:ring-pink-400/50 ${
                                    isDark
                                        ? 'bg-white/5 border-white/10 text-white'
                                        : 'bg-gray-50 border-gray-300 text-gray-900'
                                }`}>
                                    {field.icon}
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name as keyof typeof form]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="w-full bg-transparent outline-none placeholder-gray-500"
                                        required
                                    />
                                </div>
                            </motion.div>
                        ))}

                        {/* Error / Success Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center"
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-60 mt-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FaUserPlus size={16} />
                                    <span>Daftar</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Login Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                            Masuk di sini
                        </Link>
                    </motion.p>

                    {/* Back to Dashboard */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-3"
                    >
                        <Link href="/dashboard" className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
                            ← Kembali ke Dashboard
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
