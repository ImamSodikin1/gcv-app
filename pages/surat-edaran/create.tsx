import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaImage } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function CreateSuratEdaran() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [form, setForm] = useState({
        judul: '',
        kategori: 'umum',
        prioritas: 'normal',
        tanggal: new Date().toISOString().split('T')[0],
        isi: '',
    });

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const inputClass = isDark
        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500'
        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Surat edaran berhasil dibuat! (Demo)');
    };

    return (
        <>
            <Head><title>Buat Surat Edaran - Sistem Manajemen Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8 max-w-3xl mx-auto">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 flex items-center gap-3">
                        <Link href="/surat-edaran/list">
                            <motion.button whileHover={{ x: -4 }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                <FaArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-bold ${textMain}`}>Buat Surat Edaran</h1>
                            <p className={textSub}>Buat surat edaran baru untuk warga</p>
                        </div>
                    </motion.div>

                    <motion.form onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`border rounded-xl p-6 backdrop-blur-md ${cardClass}`}>
                        {/* Judul */}
                        <div className="mb-5">
                            <label className={`block text-sm font-semibold mb-2 ${textMuted}`}>Judul Surat</label>
                            <input
                                name="judul"
                                value={form.judul}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Pemberitahuan Pemadaman Listrik"
                                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none ${inputClass}`}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                            {/* Kategori */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textMuted}`}>Kategori</label>
                                <select name="kategori" value={form.kategori} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${inputClass}`}>
                                    <option value="umum">Umum</option>
                                    <option value="keamanan">Keamanan</option>
                                    <option value="keuangan">Keuangan</option>
                                    <option value="lingkungan">Lingkungan</option>
                                    <option value="acara">Acara</option>
                                </select>
                            </div>
                            {/* Prioritas */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textMuted}`}>Prioritas</label>
                                <select name="prioritas" value={form.prioritas} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${inputClass}`}>
                                    <option value="rendah">Rendah</option>
                                    <option value="normal">Normal</option>
                                    <option value="tinggi">Tinggi</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            {/* Tanggal */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textMuted}`}>Tanggal</label>
                                <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${inputClass}`} />
                            </div>
                        </div>

                        {/* Isi */}
                        <div className="mb-5">
                            <label className={`block text-sm font-semibold mb-2 ${textMuted}`}>Isi Surat Edaran</label>
                            <textarea
                                name="isi"
                                rows={8}
                                value={form.isi}
                                onChange={handleChange}
                                required
                                placeholder="Tulis isi surat edaran di sini..."
                                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none resize-y ${inputClass}`}
                            />
                        </div>

                        {/* Lampiran */}
                        <div className="mb-6">
                            <label className={`block text-sm font-semibold mb-2 ${textMuted}`}>Lampiran (Opsional)</label>
                            <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors ${isDark ? 'border-white/15 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}>
                                <FaImage className={`mx-auto text-3xl mb-2 ${textSub}`} />
                                <p className={`text-sm ${textSub}`}>Klik atau seret file ke sini</p>
                                <p className={`text-xs mt-1 ${textSub}`}>PNG, JPG, PDF (maks 5MB)</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 justify-end">
                            <Link href="/surat-edaran/list">
                                <motion.button type="button" whileHover={{ scale: 1.02 }} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                    Batal
                                </motion.button>
                            </Link>
                            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
                                <FaPaperPlane /> Kirim Surat Edaran
                            </motion.button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </>
    );
}
