// ── Database Types matching Supabase schema_v2 ──────────────────────

export type DBPengguna = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    password_hash?: string | null;
    block: string | null;
    gang: string | null;
    house_no: string | null;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
};

export type DBKepengurusan = {
    id: string;
    name: string;
    jabatan: string;
    level: number;
    house_no: string | null;
    block: string | null;
    gang: string | null;
    phone: string | null;
    email: string | null;
    periode: string | null;
    tugas: string[] | null;
    sort_order: number;
    created_at: string;
};

export type DBTransaksi = {
    id: string;
    date: string;
    type: 'Pemasukan' | 'Pengeluaran';
    category: string | null;
    amount: number;
    description: string | null;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    updated_at: string;
};

export type DBRondaSchedule = {
    id: string;
    date: string;
    block: string;
    gang: string;
    shift: string;
    coordinator: string | null;
    coordinator_house: string | null;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
};

export type DBRondaParticipant = {
    id: string;
    schedule_id: string;
    name: string;
    house_no: string | null;
    gang: string | null;
    block: string | null;
    response: 'ikut' | 'tidak' | 'pending';
    reason: string | null;
    created_at: string;
};

export type DBRondaReport = {
    id: string;
    schedule_id: string;
    author_name: string | null;
    house_no: string | null;
    content: string | null;
    type: 'kejadian' | 'catatan';
    timestamp: string;
};

export type DBSuratEdaran = {
    id: string;
    title: string;
    date: string;
    author: string | null;
    category: string | null;
    status: 'published' | 'draft';
    content: string | null;
    created_at: string;
    updated_at: string;
};

export type DBKritikSaran = {
    id: string;
    pengirim: string;
    house_no: string | null;
    block: string | null;
    gang: string | null;
    kategori: string | null;
    judul: string | null;
    isi: string | null;
    jenis: 'kritik' | 'saran';
    status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
    prioritas: 'rendah' | 'sedang' | 'tinggi';
    tanggal: string;
    balasan: string | null;
    upvotes: number;
    created_at: string;
    updated_at: string;
};
