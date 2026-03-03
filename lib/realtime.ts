import { useEffect, useRef, useCallback, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Types ──────────────────────────────────────────────────────────────
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

type RealtimePayload = {
    eventType: RealtimeEvent;
    table: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
};

type UseRealtimeOptions = {
    /** Supabase table name(s) to subscribe to */
    tables: string[];
    /** Called whenever an INSERT/UPDATE/DELETE occurs on any of the tables */
    onEvent?: (payload: RealtimePayload) => void;
    /** If true, subscription is disabled (e.g. when source is 'dummy') */
    disabled?: boolean;
};

// Lazy-load supabase client only on client side
function getSupabaseClient() {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('./supabase');
    return supabase;
}

// ── Hook: Subscribe to Supabase Realtime changes ───────────────────
export function useSupabaseRealtime({ tables, onEvent, disabled }: UseRealtimeOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null);
    const callbackRef = useRef(onEvent);
    callbackRef.current = onEvent;

    useEffect(() => {
        if (disabled || tables.length === 0) return;

        const supabase = getSupabaseClient();
        if (!supabase) return;

        // Create a unique channel for this subscription
        const channelName = `realtime-${tables.join('-')}-${Date.now()}`;
        let channel = supabase.channel(channelName);

        // Subscribe to each table
        tables.forEach((table: string) => {
            channel = channel.on(
                'postgres_changes' as 'system',
                { event: '*', schema: 'public', table } as Record<string, string>,
                (payload: Record<string, unknown>) => {
                    callbackRef.current?.({
                        eventType: payload.eventType as RealtimeEvent,
                        table: table,
                        new: (payload.new || {}) as Record<string, unknown>,
                        old: (payload.old || {}) as Record<string, unknown>,
                    });
                }
            );
        });

        channel.subscribe();
        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [tables.join(','), disabled]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Hook: Auto-refetch on realtime changes ─────────────────────────
// Wraps a refetch function to be called whenever Supabase Realtime
// detects INSERT/UPDATE/DELETE on the specified tables.
// Includes debounce to avoid hammering the API on rapid changes.
export function useRealtimeRefresh({
    tables,
    refetch,
    source,
    debounceMs = 500,
}: {
    tables: string[];
    refetch: () => void;
    source: string;
    debounceMs?: number;
}) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [lastEvent, setLastEvent] = useState<{ type: string; table: string; time: number } | null>(null);

    const debouncedRefetch = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            refetch();
        }, debounceMs);
    }, [refetch, debounceMs]);

    useSupabaseRealtime({
        tables,
        disabled: source === 'dummy',
        onEvent: (payload) => {
            setLastEvent({
                type: payload.eventType,
                table: payload.table,
                time: Date.now(),
            });
            debouncedRefetch();
        },
    });

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { lastEvent };
}
