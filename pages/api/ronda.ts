import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!supabase) return res.status(200).json({ data: [], source: 'dummy' });

    try {
        if (req.method === 'GET') {
            // Get schedules with participants and reports
            const { data: schedules, error: schErr } = await supabase
                .from('ronda_schedule')
                .select('*')
                .order('date', { ascending: false });
            if (schErr) throw schErr;

            // Fetch participants and reports for each schedule
            const enriched = await Promise.all(
                (schedules || []).map(async (s) => {
                    const [{ data: participants }, { data: reports }] = await Promise.all([
                        supabase!.from('ronda_participant').select('*').eq('schedule_id', s.id),
                        supabase!.from('ronda_report').select('*').eq('schedule_id', s.id),
                    ]);
                    return {
                        ...s,
                        participants: participants || [],
                        reports: reports || [],
                    };
                })
            );

            return res.status(200).json({ data: enriched, source: 'supabase' });
        }

        if (req.method === 'POST') {
            const { participants, reports: _reports, ...schedule } = req.body;
            const { data: sch, error: schErr } = await supabase.from('ronda_schedule').insert(schedule).select().single();
            if (schErr) throw schErr;

            if (participants?.length) {
                const withId = participants.map((p: Record<string, unknown>) => ({ ...p, schedule_id: sch.id }));
                await supabase.from('ronda_participant').insert(withId);
            }

            return res.status(201).json({ data: sch, source: 'supabase' });
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;
            const { data, error } = await supabase.from('ronda_schedule').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return res.status(200).json({ data, source: 'supabase' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            const { error } = await supabase.from('ronda_schedule').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message, data: [], source: 'error' });
    }
}
