import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Dashboard aggregation endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!supabase) return res.status(200).json({ data: null, source: 'dummy' });

    try {
        // Fetch data in parallel
        const [
            { data: transactions },
            { data: schedules },
            { data: users },
            { data: suratEdaran },
            { data: kritikSaran },
        ] = await Promise.all([
            supabase.from('transaksi').select('*').order('date', { ascending: false }),
            supabase.from('ronda_schedule').select('*').order('date', { ascending: false }),
            supabase.from('pengguna').select('*'),
            supabase.from('surat_edaran').select('*'),
            supabase.from('kritik_saran').select('*'),
        ]);

        // Aggregate monthly finance data
        const monthlyFinance: Record<string, { pemasukan: number; pengeluaran: number }> = {};
        (transactions || []).forEach((t) => {
            const d = new Date(t.date);
            const key = d.toLocaleString('id-ID', { month: 'short' });
            if (!monthlyFinance[key]) monthlyFinance[key] = { pemasukan: 0, pengeluaran: 0 };
            if (t.type === 'Pemasukan') monthlyFinance[key].pemasukan += Number(t.amount);
            else monthlyFinance[key].pengeluaran += Number(t.amount);
        });

        // Ronda stats per block
        const rondaPerBlock: Record<string, { selesai: number; dijadwalkan: number }> = {};
        (schedules || []).forEach((s) => {
            if (!rondaPerBlock[s.block]) rondaPerBlock[s.block] = { selesai: 0, dijadwalkan: 0 };
            if (s.status === 'completed') rondaPerBlock[s.block].selesai++;
            else if (s.status === 'scheduled') rondaPerBlock[s.block].dijadwalkan++;
        });

        // Expense categories
        const expenseCategories: Record<string, number> = {};
        (transactions || []).filter(t => t.type === 'Pengeluaran').forEach(t => {
            const cat = t.category || 'Lainnya';
            expenseCategories[cat] = (expenseCategories[cat] || 0) + Number(t.amount);
        });

        return res.status(200).json({
            source: 'supabase',
            data: {
                monthlyFinance: Object.entries(monthlyFinance).map(([month, v]) => ({ month, ...v })),
                rondaPerBlock: Object.entries(rondaPerBlock).map(([block, v]) => ({ block, ...v })),
                expenseCategories: Object.entries(expenseCategories).map(([name, value]) => ({ name, value })),
                totalUsers: (users || []).length,
                totalSchedules: (schedules || []).length,
                totalSuratEdaran: (suratEdaran || []).length,
                totalKritikSaran: (kritikSaran || []).length,
                totalPemasukan: (transactions || []).filter(t => t.type === 'Pemasukan').reduce((s, t) => s + Number(t.amount), 0),
                totalPengeluaran: (transactions || []).filter(t => t.type === 'Pengeluaran').reduce((s, t) => s + Number(t.amount), 0),
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message, data: null, source: 'error' });
    }
}
