import { useState, useEffect, useCallback } from 'react';
import { useRealtimeRefresh } from './realtime';

// ── Generic fetch hook with dummy fallback + realtime ──────────────

type UseApiOptions<T> = {
    apiUrl: string;
    dummyData: T[];
    /** Supabase table name(s) to subscribe for realtime updates */
    realtimeTables?: string[];
};

export function useApiData<T>({ apiUrl, dummyData, realtimeTables = [] }: UseApiOptions<T>) {
    const [data, setData] = useState<T[]>(dummyData);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'dummy' | 'supabase' | 'error'>('dummy');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(apiUrl);
            const json = await res.json();
            if (json.source === 'supabase' && json.data?.length > 0) {
                setData(json.data);
                setSource('supabase');
            } else {
                setData(dummyData);
                setSource('dummy');
            }
        } catch {
            setData(dummyData);
            setSource('dummy');
        } finally {
            setLoading(false);
        }
    }, [apiUrl, dummyData]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Subscribe to realtime changes and auto-refetch
    const { lastEvent } = useRealtimeRefresh({
        tables: realtimeTables,
        refetch: fetchData,
        source,
    });

    return { data, setData, loading, source, refetch: fetchData, lastEvent };
}

// ── Dummy Data: Pengguna ───────────────────────────────────────────

export const dummyPengguna = [
    { id: '1', name: 'Muhadi', email: 'muhadi@email.com', phone: '0812-3456-7890', block: 'Blok A', gang: 'Gang 1', house_no: 'No.14', role: 'Ketua RT', status: 'active', created_at: '', updated_at: '' },
    { id: '2', name: 'Siti Nurhaliza', email: 'siti@email.com', phone: '0813-2345-6789', block: 'Blok B', gang: 'Gang 2', house_no: 'No.2', role: 'Warga', status: 'active', created_at: '', updated_at: '' },
    { id: '3', name: 'Ahmad Wijaya', email: 'ahmad@email.com', phone: '0814-3456-7891', block: 'Blok C', gang: 'Gang 1', house_no: 'No.10', role: 'Sekretaris', status: 'active', created_at: '', updated_at: '' },
    { id: '4', name: 'Dewi Sartika', email: 'dewi@email.com', phone: '0815-4567-8902', block: 'Blok D', gang: 'Gang 3', house_no: 'No.5', role: 'Warga', status: 'inactive', created_at: '', updated_at: '' },
    { id: '5', name: 'Rudi Hartono', email: 'rudi@email.com', phone: '0816-5678-9013', block: 'Blok A', gang: 'Gang 2', house_no: 'No.25', role: 'Bendahara', status: 'active', created_at: '', updated_at: '' },
    { id: '6', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '0817-6789-0124', block: 'Blok E', gang: 'Gang 1', house_no: 'No.8', role: 'Warga', status: 'active', created_at: '', updated_at: '' },
    { id: '7', name: 'Maya Sari', email: 'maya@email.com', phone: '0818-7890-1235', block: 'Blok B', gang: 'Gang 1', house_no: 'No.12', role: 'Warga', status: 'active', created_at: '', updated_at: '' },
    { id: '8', name: 'Joko Widodo', email: 'joko@email.com', phone: '0819-8901-2346', block: 'Blok C', gang: 'Gang 2', house_no: 'No.30', role: 'Koordinator Ronda', status: 'inactive', created_at: '', updated_at: '' },
];

// ── Dummy Data: Transaksi ──────────────────────────────────────────

export const dummyTransaksi = [
    { id: '1', date: '2026-03-01', type: 'Pemasukan' as const, category: 'Iuran Bulanan', amount: 5000000, description: 'Iuran keamanan bulan Maret', status: 'approved' as const, created_at: '', updated_at: '' },
    { id: '2', date: '2026-03-02', type: 'Pengeluaran' as const, category: 'Maintenance', amount: 1500000, description: 'Perbaikan jalan utama', status: 'approved' as const, created_at: '', updated_at: '' },
    { id: '3', date: '2026-03-03', type: 'Pemasukan' as const, category: 'Iuran Bulanan', amount: 4800000, description: 'Iuran keamanan blok B', status: 'pending' as const, created_at: '', updated_at: '' },
    { id: '4', date: '2026-02-28', type: 'Pengeluaran' as const, category: 'Kebersihan', amount: 800000, description: 'Gaji petugas kebersihan', status: 'approved' as const, created_at: '', updated_at: '' },
    { id: '5', date: '2026-02-25', type: 'Pemasukan' as const, category: 'Denda', amount: 250000, description: 'Denda keterlambatan iuran', status: 'approved' as const, created_at: '', updated_at: '' },
    { id: '6', date: '2026-02-20', type: 'Pengeluaran' as const, category: 'Listrik', amount: 2300000, description: 'Tagihan listrik area umum', status: 'approved' as const, created_at: '', updated_at: '' },
    { id: '7', date: '2026-02-15', type: 'Pemasukan' as const, category: 'Iuran Bulanan', amount: 5200000, description: 'Iuran keamanan blok C', status: 'approved' as const, created_at: '', updated_at: '' },
    { id: '8', date: '2026-02-10', type: 'Pengeluaran' as const, category: 'Maintenance', amount: 3200000, description: 'Perbaikan pagar perumahan', status: 'pending' as const, created_at: '', updated_at: '' },
];

// ── Dummy Data: Surat Edaran ───────────────────────────────────────

export const dummySuratEdaran = [
    { id: '1', title: 'Pengumuman: Jadwal Pembersihan Ruang Hijau', date: '2026-03-01', author: 'Ketua RT', status: 'published' as const, category: 'Pengumuman', content: '', created_at: '', updated_at: '' },
    { id: '2', title: 'Edaran: Kenaikan Iuran Bulanan Maret 2026', date: '2026-02-28', author: 'Bendahara', status: 'published' as const, category: 'Keuangan', content: '', created_at: '', updated_at: '' },
    { id: '3', title: 'Undangan: Peraturan Keamanan Baru Perumahan', date: '2026-02-25', author: 'Koordinator Keamanan', status: 'draft' as const, category: 'Keamanan', content: '', created_at: '', updated_at: '' },
    { id: '4', title: 'Info: Penutupan Jalan Sementara Blok B', date: '2026-02-20', author: 'Ketua RT', status: 'published' as const, category: 'Pengumuman', content: '', created_at: '', updated_at: '' },
    { id: '5', title: 'Edaran: Jadwal Pemadaman Listrik', date: '2026-02-18', author: 'Sekretaris', status: 'published' as const, category: 'Utilitas', content: '', created_at: '', updated_at: '' },
    { id: '6', title: 'Undangan: Rapat Warga Bulanan Maret', date: '2026-02-15', author: 'Ketua RT', status: 'draft' as const, category: 'Pengumuman', content: '', created_at: '', updated_at: '' },
    { id: '7', title: 'Info: Program Penghijauan Lingkungan', date: '2026-02-10', author: 'Sie Lingkungan', status: 'published' as const, category: 'Lingkungan', content: '', created_at: '', updated_at: '' },
    { id: '8', title: 'Edaran: Larangan Parkir di Jalur Utama', date: '2026-02-05', author: 'Koordinator Keamanan', status: 'published' as const, category: 'Keamanan', content: '', created_at: '', updated_at: '' },
];

// ── Dummy Data: Kritik & Saran ─────────────────────────────────────

export const dummyKritikSaran = [
    { id: '1', pengirim: 'Agus Setiawan', house_no: 'No.16', block: 'Blok A', gang: 'Gang 1', kategori: 'keamanan', judul: 'Lampu Pos Ronda Mati', isi: 'Lampu di pos ronda gang 1 sudah mati selama 3 hari, mohon segera diperbaiki untuk keamanan warga.', jenis: 'kritik' as const, status: 'baru' as const, prioritas: 'tinggi' as const, tanggal: '2026-03-02', balasan: null, upvotes: 12, created_at: '', updated_at: '' },
    { id: '2', pengirim: 'Maya Sari', house_no: 'No.12', block: 'Blok B', gang: 'Gang 1', kategori: 'kebersihan', judul: 'Penambahan Tempat Sampah', isi: 'Saran agar ditambahkan tempat sampah di area taman bermain anak karena sering terlihat sampah berserakan.', jenis: 'saran' as const, status: 'diproses' as const, prioritas: 'sedang' as const, tanggal: '2026-03-01', balasan: 'Terima kasih sarannya. Akan kami proses minggu depan.', upvotes: 8, created_at: '', updated_at: '' },
    { id: '3', pengirim: 'Rudi Hartono', house_no: 'No.25', block: 'Blok A', gang: 'Gang 2', kategori: 'infrastruktur', judul: 'Perbaikan Jalan Berlubang', isi: 'Jalan di depan blok A gang 2 banyak lubang yang cukup besar dan membahayakan pengendara motor.', jenis: 'kritik' as const, status: 'selesai' as const, prioritas: 'tinggi' as const, tanggal: '2026-02-28', balasan: 'Sudah diperbaiki pada tanggal 1 Maret 2026.', upvotes: 15, created_at: '', updated_at: '' },
    { id: '4', pengirim: 'Dewi Sartika', house_no: 'No.5', block: 'Blok D', gang: 'Gang 3', kategori: 'sosial', judul: 'Acara Gathering Warga', isi: 'Saran untuk mengadakan acara gathering atau family day untuk mempererat tali silaturahmi antar warga.', jenis: 'saran' as const, status: 'baru' as const, prioritas: 'rendah' as const, tanggal: '2026-02-25', balasan: null, upvotes: 20, created_at: '', updated_at: '' },
    { id: '5', pengirim: 'Eko Prasetyo', house_no: 'No.8', block: 'Blok E', gang: 'Gang 1', kategori: 'keuangan', judul: 'Transparansi Laporan Keuangan', isi: 'Mohon laporan keuangan bulanan bisa diakses secara online melalui website atau aplikasi warga.', jenis: 'saran' as const, status: 'diproses' as const, prioritas: 'sedang' as const, tanggal: '2026-02-20', balasan: null, upvotes: 18, created_at: '', updated_at: '' },
    { id: '6', pengirim: 'Siti Nurhaliza', house_no: 'No.2', block: 'Blok B', gang: 'Gang 2', kategori: 'ketertiban', judul: 'Kebisingan Malam Hari', isi: 'Beberapa rumah di blok B sering mengadakan acara dengan musik keras hingga larut malam. Mohon ada aturan jam tenang.', jenis: 'kritik' as const, status: 'baru' as const, prioritas: 'sedang' as const, tanggal: '2026-02-18', balasan: null, upvotes: 9, created_at: '', updated_at: '' },
];

// ── Dummy Data: Dashboard Aggregates ───────────────────────────────

export const dummyDashboard = {
    monthlyFinance: [
        { month: 'Sep', pemasukan: 12000000, pengeluaran: 7500000 },
        { month: 'Okt', pemasukan: 13500000, pengeluaran: 8000000 },
        { month: 'Nov', pemasukan: 11000000, pengeluaran: 9200000 },
        { month: 'Des', pemasukan: 16000000, pengeluaran: 10500000 },
        { month: 'Jan', pemasukan: 14000000, pengeluaran: 7800000 },
        { month: 'Feb', pemasukan: 15000000, pengeluaran: 8500000 },
    ],
    rondaPerBlock: [
        { block: 'Blok A', selesai: 8, dijadwalkan: 2 },
        { block: 'Blok B', selesai: 6, dijadwalkan: 4 },
        { block: 'Blok C', selesai: 7, dijadwalkan: 3 },
        { block: 'Blok D', selesai: 5, dijadwalkan: 5 },
        { block: 'Blok E', selesai: 9, dijadwalkan: 1 },
    ],
    expenseCategories: [
        { name: 'Keamanan', value: 3500000 },
        { name: 'Maintenance', value: 2500000 },
        { name: 'Kebersihan', value: 1500000 },
        { name: 'Listrik', value: 800000 },
        { name: 'Lainnya', value: 200000 },
    ],
    totalUsers: 48,
    totalSchedules: 24,
    totalSuratEdaran: 8,
    totalKritikSaran: 6,
    totalPemasukan: 81500000,
    totalPengeluaran: 53500000,
};

export function useDashboardData() {
    const [data, setData] = useState(dummyDashboard);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'dummy' | 'supabase' | 'error'>('dummy');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/dashboard');
            const json = await res.json();
            if (json.source === 'supabase' && json.data) {
                // Merge: use supabase data if arrays are non-empty, otherwise keep dummy
                setData({
                    monthlyFinance: json.data.monthlyFinance?.length ? json.data.monthlyFinance : dummyDashboard.monthlyFinance,
                    rondaPerBlock: json.data.rondaPerBlock?.length ? json.data.rondaPerBlock : dummyDashboard.rondaPerBlock,
                    expenseCategories: json.data.expenseCategories?.length ? json.data.expenseCategories : dummyDashboard.expenseCategories,
                    totalUsers: json.data.totalUsers || dummyDashboard.totalUsers,
                    totalSchedules: json.data.totalSchedules || dummyDashboard.totalSchedules,
                    totalSuratEdaran: json.data.totalSuratEdaran || dummyDashboard.totalSuratEdaran,
                    totalKritikSaran: json.data.totalKritikSaran || dummyDashboard.totalKritikSaran,
                    totalPemasukan: json.data.totalPemasukan || dummyDashboard.totalPemasukan,
                    totalPengeluaran: json.data.totalPengeluaran || dummyDashboard.totalPengeluaran,
                });
                setSource('supabase');
            }
        } catch {
            // Keep dummy data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Dashboard aggregates from many tables → subscribe to all
    const { lastEvent } = useRealtimeRefresh({
        tables: ['pengguna', 'transaksi', 'ronda_schedule', 'surat_edaran', 'kritik_saran'],
        refetch: fetchData,
        source,
    });

    return { data, setData, loading, source, refetch: fetchData, lastEvent };
}
