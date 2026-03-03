import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!supabase) return res.status(200).json({ data: [], source: 'dummy' });

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase.from('pengguna').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json({ data: data || [], source: 'supabase' });
        }

        if (req.method === 'POST') {
            const { data, error } = await supabase.from('pengguna').insert(req.body).select().single();
            if (error) throw error;
            return res.status(201).json({ data, source: 'supabase' });
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;
            const { data, error } = await supabase.from('pengguna').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return res.status(200).json({ data, source: 'supabase' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            const { error } = await supabase.from('pengguna').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message, data: [], source: 'error' });
    }
}
