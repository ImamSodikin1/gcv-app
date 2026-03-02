import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaUser, FaPlus, FaSearch, FaTimes, FaHome,
    FaCheck, FaTimesCircle, FaClock, FaExclamationTriangle, FaFileAlt, FaPaperPlane,
    FaChevronDown, FaChevronRight, FaShieldAlt, FaEye, FaFilter, FaUsers
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────
type Participant = {
    id: string;
    name: string;
    houseNo: string;
    gang: string;
    block: string;
    response: 'ikut' | 'tidak' | 'pending';
    reason?: string;
};

type ScheduleReport = {
    id: string;
    authorName: string;
    houseNo: string;
    content: string;
    timestamp: string;
    type: 'kejadian' | 'catatan';
};

type Schedule = {
    id: string;
    date: string;
    block: string;
    gang: string; // 'Gang 1', 'Gang 2', etc. or 'Semua Gang'
    shift: string;
    coordinator: string;
    coordinatorHouse: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    participants: Participant[];
    reports: ScheduleReport[];
};

// ── Initial Data ───────────────────────────────────────────────────────
const blocks = ['Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];
const gangs = ['Gang 1', 'Gang 2', 'Gang 3'];

const initialSchedules: Schedule[] = [
    {
        id: '1', date: '2026-03-05', block: 'Blok A', gang: 'Gang 1', shift: 'Malam',
        coordinator: 'Budi Santoso', coordinatorHouse: 'No.14',
        status: 'scheduled',
        participants: [
            { id: 'p1', name: 'Budi Santoso', houseNo: 'No.14', gang: 'Gang 1', block: 'Blok A', response: 'ikut' },
            { id: 'p2', name: 'Agus Setiawan', houseNo: 'No.16', gang: 'Gang 1', block: 'Blok A', response: 'ikut' },
            { id: 'p3', name: 'Doni Kusuma', houseNo: 'No.18', gang: 'Gang 1', block: 'Blok A', response: 'pending' },
            { id: 'p4', name: 'Eko Prabowo', houseNo: 'No.20', gang: 'Gang 1', block: 'Blok A', response: 'tidak', reason: 'Sedang sakit, tidak bisa ikut malam ini' },
        ],
        reports: [],
    },
    {
        id: '2', date: '2026-03-05', block: 'Blok A', gang: 'Gang 2', shift: 'Malam',
        coordinator: 'Rudi Hartono', coordinatorHouse: 'No.25',
        status: 'scheduled',
        participants: [
            { id: 'p5', name: 'Rudi Hartono', houseNo: 'No.25', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
            { id: 'p6', name: 'Fajar Nugroho', houseNo: 'No.27', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
            { id: 'p7', name: 'Hendra Wijaya', houseNo: 'No.29', gang: 'Gang 2', block: 'Blok A', response: 'pending' },
        ],
        reports: [],
    },
    {
        id: '3', date: '2026-03-06', block: 'Blok A', gang: 'Semua Gang', shift: 'Malam',
        coordinator: 'Budi Santoso', coordinatorHouse: 'No.14',
        status: 'scheduled',
        participants: [
            { id: 'p8', name: 'Budi Santoso', houseNo: 'No.14', gang: 'Gang 1', block: 'Blok A', response: 'ikut' },
            { id: 'p9', name: 'Rudi Hartono', houseNo: 'No.25', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
            { id: 'p10', name: 'Surya Darma', houseNo: 'No.35', gang: 'Gang 3', block: 'Blok A', response: 'pending' },
            { id: 'p11', name: 'Doni Kusuma', houseNo: 'No.18', gang: 'Gang 1', block: 'Blok A', response: 'tidak', reason: 'Ada acara keluarga' },
            { id: 'p12', name: 'Hendra Wijaya', houseNo: 'No.29', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
        ],
        reports: [],
    },
    {
        id: '4', date: '2026-03-04', block: 'Blok B', gang: 'Gang 1', shift: 'Malam',
        coordinator: 'Siti Nurhaliza', coordinatorHouse: 'No.2',
        status: 'completed',
        participants: [
            { id: 'p13', name: 'Siti Nurhaliza', houseNo: 'No.2', gang: 'Gang 1', block: 'Blok B', response: 'ikut' },
            { id: 'p14', name: 'Rina Andani', houseNo: 'No.4', gang: 'Gang 1', block: 'Blok B', response: 'ikut' },
            { id: 'p15', name: 'Yanti Susilo', houseNo: 'No.6', gang: 'Gang 1', block: 'Blok B', response: 'ikut' },
            { id: 'p16', name: 'Dewi Lestari', houseNo: 'No.8', gang: 'Gang 1', block: 'Blok B', response: 'tidak', reason: 'Kerja shift malam di RS' },
        ],
        reports: [
            { id: 'r1', authorName: 'Siti Nurhaliza', houseNo: 'No.2', content: 'Ada orang tidak dikenal melintas di depan No.10 sekitar pukul 01:00. Sudah ditegur dan diarahkan keluar.', timestamp: '2026-03-04 01:15', type: 'kejadian' },
            { id: 'r2', authorName: 'Rina Andani', houseNo: 'No.4', content: 'Lampu jalan depan No.6 mati, perlu diganti.', timestamp: '2026-03-04 22:30', type: 'catatan' },
        ],
    },
    {
        id: '5', date: '2026-03-03', block: 'Blok C', gang: 'Gang 2', shift: 'Sore',
        coordinator: 'Ahmad Wijaya', coordinatorHouse: 'No.11',
        status: 'completed',
        participants: [
            { id: 'p17', name: 'Ahmad Wijaya', houseNo: 'No.11', gang: 'Gang 2', block: 'Blok C', response: 'ikut' },
            { id: 'p18', name: 'Bambang Sutrisno', houseNo: 'No.13', gang: 'Gang 2', block: 'Blok C', response: 'ikut' },
            { id: 'p19', name: 'Cahya Pratama', houseNo: 'No.15', gang: 'Gang 2', block: 'Blok C', response: 'ikut' },
        ],
        reports: [
            { id: 'r3', authorName: 'Ahmad Wijaya', houseNo: 'No.11', content: 'Situasi aman, tidak ada kejadian mencurigakan.', timestamp: '2026-03-03 23:00', type: 'catatan' },
        ],
    },
    {
        id: '6', date: '2026-03-02', block: 'Blok D', gang: 'Semua Gang', shift: 'Malam',
        coordinator: 'Dewi Sartika', coordinatorHouse: 'No.7',
        status: 'completed',
        participants: [
            { id: 'p20', name: 'Dewi Sartika', houseNo: 'No.7', gang: 'Gang 1', block: 'Blok D', response: 'ikut' },
            { id: 'p21', name: 'Gunawan Saputra', houseNo: 'No.22', gang: 'Gang 2', block: 'Blok D', response: 'ikut' },
            { id: 'p22', name: 'Irfan Ramadhan', houseNo: 'No.33', gang: 'Gang 3', block: 'Blok D', response: 'ikut' },
            { id: 'p23', name: 'Karno Santoso', houseNo: 'No.9', gang: 'Gang 1', block: 'Blok D', response: 'tidak', reason: 'Tugas kantor lembur' },
        ],
        reports: [
            { id: 'r4', authorName: 'Dewi Sartika', houseNo: 'No.7', content: 'Motor mencurigakan parkir lama di depan No.30, sudah dilaporkan ke keamanan.', timestamp: '2026-03-02 02:00', type: 'kejadian' },
        ],
    },
    {
        id: '7', date: '2026-03-01', block: 'Blok E', gang: 'Gang 1', shift: 'Malam',
        coordinator: 'Eko Prasetyo', coordinatorHouse: 'No.3',
        status: 'cancelled',
        participants: [
            { id: 'p24', name: 'Eko Prasetyo', houseNo: 'No.3', gang: 'Gang 1', block: 'Blok E', response: 'tidak', reason: 'Hujan deras dan banjir di area blok' },
            { id: 'p25', name: 'Lukman Hakim', houseNo: 'No.5', gang: 'Gang 1', block: 'Blok E', response: 'tidak', reason: 'Kondisi cuaca tidak memungkinkan' },
        ],
        reports: [],
    },
];

// chartData will be computed dynamically from schedules

// ── Master Warga Data (would come from DB/API) ────────────────────────
type WargaData = { id: string; name: string; houseNo: string; gang: string; block: string };

const allWarga: WargaData[] = [
    { id: 'w1', name: 'Budi Santoso', houseNo: 'No.14', gang: 'Gang 1', block: 'Blok A' },
    { id: 'w2', name: 'Agus Setiawan', houseNo: 'No.16', gang: 'Gang 1', block: 'Blok A' },
    { id: 'w3', name: 'Doni Kusuma', houseNo: 'No.18', gang: 'Gang 1', block: 'Blok A' },
    { id: 'w4', name: 'Eko Prabowo', houseNo: 'No.20', gang: 'Gang 1', block: 'Blok A' },
    { id: 'w5', name: 'Rudi Hartono', houseNo: 'No.25', gang: 'Gang 2', block: 'Blok A' },
    { id: 'w6', name: 'Fajar Nugroho', houseNo: 'No.27', gang: 'Gang 2', block: 'Blok A' },
    { id: 'w7', name: 'Hendra Wijaya', houseNo: 'No.29', gang: 'Gang 2', block: 'Blok A' },
    { id: 'w8', name: 'Surya Darma', houseNo: 'No.35', gang: 'Gang 3', block: 'Blok A' },
    { id: 'w9', name: 'Siti Nurhaliza', houseNo: 'No.2', gang: 'Gang 1', block: 'Blok B' },
    { id: 'w10', name: 'Rina Andani', houseNo: 'No.4', gang: 'Gang 1', block: 'Blok B' },
    { id: 'w11', name: 'Yanti Susilo', houseNo: 'No.6', gang: 'Gang 1', block: 'Blok B' },
    { id: 'w12', name: 'Dewi Lestari', houseNo: 'No.8', gang: 'Gang 1', block: 'Blok B' },
    { id: 'w13', name: 'Maya Sari', houseNo: 'No.12', gang: 'Gang 2', block: 'Blok B' },
    { id: 'w14', name: 'Joko Widodo', houseNo: 'No.14', gang: 'Gang 2', block: 'Blok B' },
    { id: 'w15', name: 'Ahmad Wijaya', houseNo: 'No.11', gang: 'Gang 2', block: 'Blok C' },
    { id: 'w16', name: 'Bambang Sutrisno', houseNo: 'No.13', gang: 'Gang 2', block: 'Blok C' },
    { id: 'w17', name: 'Cahya Pratama', houseNo: 'No.15', gang: 'Gang 2', block: 'Blok C' },
    { id: 'w18', name: 'Dewi Sartika', houseNo: 'No.7', gang: 'Gang 1', block: 'Blok D' },
    { id: 'w19', name: 'Gunawan Saputra', houseNo: 'No.22', gang: 'Gang 2', block: 'Blok D' },
    { id: 'w20', name: 'Irfan Ramadhan', houseNo: 'No.33', gang: 'Gang 3', block: 'Blok D' },
    { id: 'w21', name: 'Karno Santoso', houseNo: 'No.9', gang: 'Gang 1', block: 'Blok D' },
    { id: 'w22', name: 'Eko Prasetyo', houseNo: 'No.3', gang: 'Gang 1', block: 'Blok E' },
    { id: 'w23', name: 'Lukman Hakim', houseNo: 'No.5', gang: 'Gang 1', block: 'Blok E' },
    { id: 'w24', name: 'Toni Permana', houseNo: 'No.10', gang: 'Gang 2', block: 'Blok E' },
    { id: 'w25', name: 'Wahyu Hidayat', houseNo: 'No.17', gang: 'Gang 3', block: 'Blok E' },
];

const emptyForm = {
    date: '', block: 'Blok A', gang: 'Gang 1', gangMode: 'per-gang' as 'per-gang' | 'gabungan',
    shift: 'Malam',
};

// ── Component ──────────────────────────────────────────────────────────
export default function PatrolSchedule() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [search, setSearch] = useState('');
    const [filterBlock, setFilterBlock] = useState('all');
    const [filterGang, setFilterGang] = useState('all');
    const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<Schedule | null>(null);
    const [showReportModal, setShowReportModal] = useState<Schedule | null>(null);
    const [showRsvpModal, setShowRsvpModal] = useState<{ schedule: Schedule; participant: Participant } | null>(null);

    const [form, setForm] = useState(emptyForm);
    const [selectedCoordinator, setSelectedCoordinator] = useState<WargaData | null>(null);
    const [coordinatorSearch, setCoordinatorSearch] = useState('');
    const [showCoordinatorDropdown, setShowCoordinatorDropdown] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState<WargaData[]>([]);
    const [participantSearch, setParticipantSearch] = useState('');
    const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);
    const coordinatorRef = useRef<HTMLDivElement>(null);
    const participantRef = useRef<HTMLDivElement>(null);
    const [reportForm, setReportForm] = useState({ content: '', type: 'catatan' as 'kejadian' | 'catatan' });

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (coordinatorRef.current && !coordinatorRef.current.contains(e.target as Node)) setShowCoordinatorDropdown(false);
            if (participantRef.current && !participantRef.current.contains(e.target as Node)) setShowParticipantDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const [rsvpForm, setRsvpForm] = useState({ response: 'ikut' as 'ikut' | 'tidak', reason: '' });

    // Expanded block groups in list view
    const [expandedBlocks, setExpandedBlocks] = useState<string[]>(['Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E']);
    const [activePieIdx, setActivePieIdx] = useState<number | null>(null);
    const [expandedKejadianBlocks, setExpandedKejadianBlocks] = useState<string[]>([]);
    const [expandedAbsenBlocks, setExpandedAbsenBlocks] = useState<string[]>([]);

    // Filters
    const filtered = schedules.filter((s) => {
        const matchSearch = s.coordinator.toLowerCase().includes(search.toLowerCase()) ||
            s.block.toLowerCase().includes(search.toLowerCase()) ||
            s.gang.toLowerCase().includes(search.toLowerCase()) ||
            s.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.houseNo.toLowerCase().includes(search.toLowerCase()));
        const matchBlock = filterBlock === 'all' || s.block === filterBlock;
        const matchGang = filterGang === 'all' || s.gang === filterGang || s.gang === 'Semua Gang';
        return matchSearch && matchBlock && matchGang;
    });

    // Group by block
    const groupedByBlock: Record<string, Schedule[]> = {};
    filtered.forEach(s => {
        if (!groupedByBlock[s.block]) groupedByBlock[s.block] = [];
        groupedByBlock[s.block].push(s);
    });

    // ── Computed Stats from actual data ──────────────────────────────
    const stats = useMemo(() => {
        const totalScheduled = schedules.filter(s => s.status === 'scheduled').length;
        const totalCompleted = schedules.filter(s => s.status === 'completed').length;
        const allParticipants = schedules.flatMap(s => s.participants);
        const totalIkut = allParticipants.filter(p => p.response === 'ikut').length;
        const totalTidak = allParticipants.filter(p => p.response === 'tidak').length;
        const totalPending = allParticipants.filter(p => p.response === 'pending').length;
        const totalReports = schedules.reduce((sum, s) => sum + s.reports.length, 0);
        const totalKejadian = schedules.reduce((sum, s) => sum + s.reports.filter(r => r.type === 'kejadian').length, 0);

        // Chart data per block (computed from schedules)
        const chartData = blocks.map(block => {
            const blockSchedules = schedules.filter(s => s.block === block);
            return {
                block,
                selesai: blockSchedules.filter(s => s.status === 'completed').length,
                dijadwalkan: blockSchedules.filter(s => s.status === 'scheduled').length,
                dibatalkan: blockSchedules.filter(s => s.status === 'cancelled').length,
            };
        });

        // Kejadian per block
        const kejadianPerBlock = blocks.map(block => {
            const count = schedules.filter(s => s.block === block).reduce((sum, s) => sum + s.reports.filter(r => r.type === 'kejadian').length, 0);
            return { block, count };
        }).filter(b => b.count > 0).sort((a, b) => b.count - a.count);

        // Kejadian per gang (grouped by block)
        const kejadianPerGang: { block: string; gang: string; count: number; reports: string[] }[] = [];
        blocks.forEach(block => {
            const allGangs = [...gangs, 'Semua Gang'];
            allGangs.forEach(gang => {
                const matchingSchedules = schedules.filter(s => s.block === block && s.gang === gang);
                const kejadianReports = matchingSchedules.flatMap(s => s.reports.filter(r => r.type === 'kejadian'));
                if (kejadianReports.length > 0) {
                    kejadianPerGang.push({
                        block, gang,
                        count: kejadianReports.length,
                        reports: kejadianReports.map(r => r.content.length > 60 ? r.content.slice(0, 60) + '...' : r.content),
                    });
                }
            });
        });
        kejadianPerGang.sort((a, b) => b.count - a.count);

        // Tidak hadir per block
        const tidakHadirPerBlock = blocks.map(block => {
            const blockParticipants = schedules.filter(s => s.block === block).flatMap(s => s.participants);
            const tidak = blockParticipants.filter(p => p.response === 'tidak').length;
            const total = blockParticipants.length;
            return { block, tidak, total, pct: total > 0 ? Math.round((tidak / total) * 100) : 0 };
        }).sort((a, b) => b.pct - a.pct);

        // Tidak hadir per gang (grouped by block)
        const tidakHadirPerGang: { block: string; gang: string; tidak: number; total: number; pct: number; names: string[] }[] = [];
        blocks.forEach(block => {
            const allGangs = [...gangs, 'Semua Gang'];
            allGangs.forEach(gang => {
                const gangParticipants = schedules.filter(s => s.block === block && s.gang === gang).flatMap(s => s.participants);
                if (gangParticipants.length > 0) {
                    const tidak = gangParticipants.filter(p => p.response === 'tidak').length;
                    const total = gangParticipants.length;
                    tidakHadirPerGang.push({
                        block, gang, tidak, total,
                        pct: total > 0 ? Math.round((tidak / total) * 100) : 0,
                        names: gangParticipants.filter(p => p.response === 'tidak').map(p => p.name),
                    });
                }
            });
        });
        tidakHadirPerGang.sort((a, b) => b.pct - a.pct);

        // Top reasons for absence
        const reasonCounts: Record<string, number> = {};
        allParticipants.filter(p => p.response === 'tidak' && p.reason).forEach(p => {
            // Categorize reasons into groups
            const reason = p.reason!.toLowerCase();
            let category = 'Lainnya';
            if (reason.includes('sakit')) category = 'Sakit';
            else if (reason.includes('kerja') || reason.includes('kantor') || reason.includes('lembur')) category = 'Kerja/Lembur';
            else if (reason.includes('acara') || reason.includes('keluarga')) category = 'Acara Keluarga';
            else if (reason.includes('hujan') || reason.includes('banjir') || reason.includes('cuaca')) category = 'Cuaca Buruk';
            reasonCounts[category] = (reasonCounts[category] || 0) + 1;
        });
        const topReasons = Object.entries(reasonCounts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count);

        // Absence rate (% tidak hadir dari total peserta)
        const absenceRate = allParticipants.length > 0 ? Math.round((totalTidak / allParticipants.length) * 100) : 0;

        // ── Laporan Ronda Stats ──────────────────────────────
        // All reports with full location context
        const allReports = schedules.flatMap(s => s.reports.map(r => ({
            ...r,
            block: s.block,
            gang: s.gang,
            date: s.date,
            shift: s.shift,
            coordinator: s.coordinator,
        })));
        const totalCatatan = allReports.filter(r => r.type === 'catatan').length;

        // Categorize kejadian types from content
        const kejadianTypeMap: Record<string, { count: number; items: { content: string; block: string; gang: string; houseNo: string; date: string; authorName: string }[] }> = {};
        allReports.filter(r => r.type === 'kejadian').forEach(r => {
            const c = r.content.toLowerCase();
            let category = 'Lainnya';
            if (c.includes('orang') && (c.includes('tidak dikenal') || c.includes('mencurigakan') || c.includes('asing'))) category = 'Orang Mencurigakan';
            else if (c.includes('motor') || c.includes('mobil') || c.includes('kendaraan')) category = 'Kendaraan Mencurigakan';
            else if (c.includes('pencurian') || c.includes('maling') || c.includes('curi')) category = 'Pencurian';
            else if (c.includes('lampu') || c.includes('mati') || c.includes('rusak')) category = 'Fasilitas Rusak';
            else if (c.includes('kebakaran') || c.includes('api') || c.includes('asap')) category = 'Kebakaran';
            if (!kejadianTypeMap[category]) kejadianTypeMap[category] = { count: 0, items: [] };
            kejadianTypeMap[category].count += 1;
            kejadianTypeMap[category].items.push({
                content: r.content,
                block: r.block,
                gang: r.gang,
                houseNo: r.houseNo,
                date: r.date,
                authorName: r.authorName,
            });
        });
        const kejadianTypes = Object.entries(kejadianTypeMap)
            .map(([type, data]) => ({ type, count: data.count, items: data.items }))
            .sort((a, b) => b.count - a.count);

        // Recent reports timeline (all types)
        const recentReports = allReports
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, 10);

        // Locations with kejadian (for heatmap-style display)
        const kejadianLocations: { block: string; gang: string; houseNos: string[]; count: number }[] = [];
        const locMap = new Map<string, { houseNos: Set<string>; count: number }>();
        allReports.filter(r => r.type === 'kejadian').forEach(r => {
            const key = `${r.block}|${r.gang}`;
            if (!locMap.has(key)) locMap.set(key, { houseNos: new Set(), count: 0 });
            const loc = locMap.get(key)!;
            loc.count++;
            // Extract house numbers from content
            const houseMatches = r.content.match(/No\.\d+/gi);
            if (houseMatches) houseMatches.forEach(h => loc.houseNos.add(h));
            if (r.houseNo && r.houseNo !== '-') loc.houseNos.add(r.houseNo);
        });
        locMap.forEach((val, key) => {
            const [block, gang] = key.split('|');
            kejadianLocations.push({ block, gang, houseNos: Array.from(val.houseNos), count: val.count });
        });
        kejadianLocations.sort((a, b) => b.count - a.count);

        return { totalScheduled, totalCompleted, totalIkut, totalTidak, totalPending, totalReports, totalKejadian, totalCatatan, chartData, kejadianPerBlock, kejadianPerGang, tidakHadirPerBlock, tidakHadirPerGang, topReasons, absenceRate, kejadianTypes, recentReports, kejadianLocations };
    }, [schedules]);

    // Classes
    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const gridLineColor = isDark ? '#ffffff15' : '#e5e7eb';
    const tooltipBg = isDark ? '#1e1b2e' : '#ffffff';
    const tooltipBorder = isDark ? '#ffffff20' : '#e5e7eb';
    const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`;
    const optionCls = isDark ? 'bg-gray-800 text-white' : '';

    const toggleBlock = (block: string) => {
        setExpandedBlocks(prev => prev.includes(block) ? prev.filter(b => b !== block) : [...prev, block]);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'Selesai', cls: 'bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/20', dot: 'bg-emerald-400' };
            case 'scheduled': return { label: 'Dijadwalkan', cls: 'bg-blue-400/15 text-blue-400 ring-1 ring-blue-400/20', dot: 'bg-blue-400' };
            case 'cancelled': return { label: 'Dibatalkan', cls: 'bg-red-400/15 text-red-400 ring-1 ring-red-400/20', dot: 'bg-red-400' };
            default: return { label: status, cls: 'bg-gray-400/20 text-gray-400', dot: 'bg-gray-400' };
        }
    };

    const getResponseBadge = (response: string) => {
        switch (response) {
            case 'ikut': return { label: 'Ikut', icon: <FaCheck size={9} />, cls: 'bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/20' };
            case 'tidak': return { label: 'Tidak Bisa', icon: <FaTimesCircle size={9} />, cls: 'bg-red-400/15 text-red-400 ring-1 ring-red-400/20' };
            default: return { label: 'Menunggu', icon: <FaClock size={9} />, cls: 'bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/20' };
        }
    };

    // ── Warga filtering for search ────────────────────────────────────
    const filteredCoordinatorWarga = allWarga.filter(w => {
        const matchBlock = w.block === form.block;
        const matchGang = form.gangMode === 'gabungan' || w.gang === form.gang;
        const matchSearch = coordinatorSearch.trim() === '' || w.name.toLowerCase().includes(coordinatorSearch.toLowerCase()) || w.houseNo.toLowerCase().includes(coordinatorSearch.toLowerCase());
        const notSelected = !selectedParticipants.some(sp => sp.id === w.id);
        return matchBlock && matchGang && matchSearch && notSelected;
    });

    const filteredParticipantWarga = allWarga.filter(w => {
        const matchBlock = w.block === form.block;
        const matchGang = form.gangMode === 'gabungan' || w.gang === form.gang;
        const matchSearch = participantSearch.trim() === '' || w.name.toLowerCase().includes(participantSearch.toLowerCase()) || w.houseNo.toLowerCase().includes(participantSearch.toLowerCase());
        const notCoordinator = selectedCoordinator?.id !== w.id;
        const notAlreadySelected = !selectedParticipants.some(sp => sp.id === w.id);
        return matchBlock && matchGang && matchSearch && notCoordinator && notAlreadySelected;
    });

    const addParticipant = (w: WargaData) => {
        setSelectedParticipants(prev => [...prev, w]);
        setParticipantSearch('');
        setShowParticipantDropdown(false);
    };

    const removeParticipant = (id: string) => {
        setSelectedParticipants(prev => prev.filter(p => p.id !== id));
    };

    // ── Handlers ─────────────────────────────────────────────────────
    const handleAddSchedule = () => {
        if (!form.date || !selectedCoordinator) return;
        const gangValue = form.gangMode === 'gabungan' ? 'Semua Gang' : form.gang;
        const newSchedule: Schedule = {
            id: Date.now().toString(),
            date: form.date,
            block: form.block,
            gang: gangValue,
            shift: form.shift,
            coordinator: selectedCoordinator.name,
            coordinatorHouse: selectedCoordinator.houseNo,
            status: 'scheduled',
            participants: [
                { id: `p-${Date.now()}`, name: selectedCoordinator.name, houseNo: selectedCoordinator.houseNo, gang: selectedCoordinator.gang, block: selectedCoordinator.block, response: 'ikut' },
                ...selectedParticipants.map((w, i) => ({
                    id: `p-${Date.now()}-${i}`,
                    name: w.name,
                    houseNo: w.houseNo,
                    gang: w.gang,
                    block: w.block,
                    response: 'pending' as const,
                })),
            ],
            reports: [],
        };
        setSchedules([newSchedule, ...schedules]);
        setForm(emptyForm);
        setSelectedCoordinator(null);
        setCoordinatorSearch('');
        setSelectedParticipants([]);
        setParticipantSearch('');
        setShowAddModal(false);
    };

    const handleRsvp = () => {
        if (!showRsvpModal) return;
        if (rsvpForm.response === 'tidak' && !rsvpForm.reason.trim()) return;
        const { schedule, participant } = showRsvpModal;
        setSchedules(prev => prev.map(s => {
            if (s.id !== schedule.id) return s;
            return {
                ...s,
                participants: s.participants.map(p =>
                    p.id === participant.id
                        ? { ...p, response: rsvpForm.response, reason: rsvpForm.response === 'tidak' ? rsvpForm.reason : undefined }
                        : p
                ),
            };
        }));
        // Also update detail modal if open
        if (showDetailModal?.id === schedule.id) {
            setShowDetailModal(prev => prev ? {
                ...prev,
                participants: prev.participants.map(p =>
                    p.id === participant.id
                        ? { ...p, response: rsvpForm.response, reason: rsvpForm.response === 'tidak' ? rsvpForm.reason : undefined }
                        : p
                ),
            } : null);
        }
        setRsvpForm({ response: 'ikut', reason: '' });
        setShowRsvpModal(null);
    };

    const handleSubmitReport = () => {
        if (!showReportModal || !reportForm.content.trim()) return;
        const newReport: ScheduleReport = {
            id: `r-${Date.now()}`,
            authorName: 'Anda (Peserta)',
            houseNo: '-',
            content: reportForm.content,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            type: reportForm.type,
        };
        setSchedules(prev => prev.map(s =>
            s.id === showReportModal.id ? { ...s, reports: [...s.reports, newReport] } : s
        ));
        if (showDetailModal?.id === showReportModal.id) {
            setShowDetailModal(prev => prev ? { ...prev, reports: [...prev.reports, newReport] } : null);
        }
        setReportForm({ content: '', type: 'catatan' });
        setShowReportModal(null);
    };

    return (
        <>
            <Head><title>Jadwal Ronda - Sistem Manajemen Perumahan</title></Head>

            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">

                    {/* Header */}
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 flex items-center gap-3">
                        <Link href="/dashboard">
                            <motion.button whileHover={{ x: -4 }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                <FaArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-bold ${textMain}`}>Jadwal Ronda</h1>
                            <p className={textSub}>Kelola jadwal keamanan per blok &amp; gang</p>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                        {[
                            { icon: <FaCalendar className="text-blue-400" />, label: 'Dijadwalkan', value: stats.totalScheduled, color: 'from-blue-400/20 to-indigo-500/20' },
                            { icon: <FaCheck className="text-emerald-400" />, label: 'Selesai', value: stats.totalCompleted, color: 'from-emerald-400/20 to-green-500/20' },
                            { icon: <FaUsers className="text-purple-400" />, label: 'Peserta Ikut', value: stats.totalIkut, color: 'from-purple-400/20 to-pink-500/20' },
                            { icon: <FaUsers className="text-red-400" />, label: 'Tidak Hadir', value: `${stats.totalTidak} (${stats.absenceRate}%)`, color: 'from-red-400/20 to-rose-500/20' },
                            { icon: <FaExclamationTriangle className="text-orange-400" />, label: 'Kejadian', value: stats.totalKejadian, color: 'from-orange-400/20 to-amber-500/20' },
                            { icon: <FaFileAlt className="text-amber-400" />, label: 'Laporan', value: stats.totalReports, color: 'from-amber-400/20 to-yellow-500/20' },
                        ].map((stat, i) => (
                            <motion.div key={i} whileHover={{ y: -3 }} className={`bg-gradient-to-br ${stat.color} border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-4`}>
                                <div className="flex items-center gap-2 mb-1">{stat.icon}<span className={`text-xs ${textMuted}`}>{stat.label}</span></div>
                                <p className={`text-2xl font-bold ${textMain}`}>{stat.value}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* Bar Chart - Statistik per Blok */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-lg font-bold mb-4 ${textMain} relative z-10`}>Statistik Ronda per Blok</h2>
                            <div className="h-64 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.chartData} barCategoryGap="20%">
                                        <defs>
                                            <linearGradient id="schBarDone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={1} /><stop offset="100%" stopColor="#059669" stopOpacity={0.8} /></linearGradient>
                                            <linearGradient id="schBarSch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#818cf8" stopOpacity={1} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} /></linearGradient>
                                            <linearGradient id="schBarCan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" stopOpacity={1} /><stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} /></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} vertical={false} />
                                        <XAxis dataKey="block" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', padding: '12px 16px' }} itemStyle={{ color: isDark ? '#e5e7eb' : '#374151' }} labelStyle={{ color: isDark ? '#fff' : '#111' }} cursor={{ fill: isDark ? '#ffffff08' : '#00000008' }} />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="selesai" name="Selesai" fill="url(#schBarDone)" radius={[6, 6, 0, 0]} animationDuration={1200} animationEasing="ease-out" />
                                        <Bar dataKey="dijadwalkan" name="Dijadwalkan" fill="url(#schBarSch)" radius={[6, 6, 0, 0]} animationDuration={1200} animationEasing="ease-out" animationBegin={200} />
                                        <Bar dataKey="dibatalkan" name="Dibatalkan" fill="url(#schBarCan)" radius={[6, 6, 0, 0]} animationDuration={1200} animationEasing="ease-out" animationBegin={400} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Pie Chart - Alasan Tidak Hadir (Modern) */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-lg font-bold mb-2 ${textMain} relative z-10 flex items-center gap-2`}>
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-400/20 to-purple-400/20"><FaUsers className="text-pink-400" size={14} /></div>
                                Alasan Tidak Hadir
                            </h2>
                            <p className={`text-xs mb-4 ${textMuted} relative z-10`}>Distribusi alasan ketidakhadiran peserta ronda</p>
                            {stats.topReasons.length > 0 ? (() => {
                                const PIE_COLORS = ['#f87171', '#818cf8', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];
                                const PIE_GRADIENTS = [
                                    ['#f87171', '#ef4444'], ['#818cf8', '#6366f1'], ['#34d399', '#10b981'],
                                    ['#fbbf24', '#f59e0b'], ['#a78bfa', '#8b5cf6'], ['#fb923c', '#f97316'],
                                ];
                                const totalReasons = stats.topReasons.reduce((s, x) => s + x.count, 0);
                                return (
                                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                        {/* LEFT: Donut Chart with center label */}
                                        <div className="relative h-56 w-56 flex-shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <defs>
                                                        {PIE_GRADIENTS.map((g, i) => (
                                                            <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                                                                <stop offset="0%" stopColor={g[0]} stopOpacity={1} />
                                                                <stop offset="100%" stopColor={g[1]} stopOpacity={0.85} />
                                                            </linearGradient>
                                                        ))}
                                                    </defs>
                                                    <Pie
                                                        data={stats.topReasons}
                                                        dataKey="count"
                                                        nameKey="reason"
                                                        cx="50%" cy="50%"
                                                        outerRadius={activePieIdx !== null ? 82 : 78}
                                                        innerRadius={48}
                                                        paddingAngle={4}
                                                        cornerRadius={4}
                                                        animationDuration={1400}
                                                        animationEasing="ease-out"
                                                        onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                                                        onMouseLeave={() => setActivePieIdx(null)}
                                                        stroke={isDark ? '#1e1b2e' : '#ffffff'}
                                                        strokeWidth={2}
                                                    >
                                                        {stats.topReasons.map((_, idx) => (
                                                            <Cell
                                                                key={idx}
                                                                fill={`url(#pieGrad${idx % 6})`}
                                                                style={{
                                                                    filter: activePieIdx === idx ? `drop-shadow(0 0 8px ${PIE_COLORS[idx % 6]}80)` : 'none',
                                                                    transform: activePieIdx === idx ? 'scale(1.06)' : 'scale(1)',
                                                                    transformOrigin: 'center',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    cursor: 'pointer',
                                                                }}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (!active || !payload?.length) return null;
                                                            const data = payload[0];
                                                            const pct = totalReasons > 0 ? Math.round(((data.value as number) / totalReasons) * 100) : 0;
                                                            return (
                                                                <div className={`px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${isDark ? 'bg-[#1e1b2e]/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
                                                                    <p className={`text-sm font-bold ${textMain}`}>{data.name}</p>
                                                                    <p className={`text-xs mt-1 ${textSub}`}>{data.value} orang &middot; {pct}%</p>
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Center label */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <AnimatePresence mode="wait">
                                                    {activePieIdx !== null ? (
                                                        <motion.div key={activePieIdx} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="text-center">
                                                            <p className={`text-2xl font-bold ${textMain}`}>{stats.topReasons[activePieIdx]?.count}</p>
                                                            <p className={`text-[10px] ${textMuted} max-w-[70px] leading-tight`}>{stats.topReasons[activePieIdx]?.reason}</p>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div key="total" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="text-center">
                                                            <p className={`text-2xl font-bold ${textMain}`}>{totalReasons}</p>
                                                            <p className={`text-[10px] ${textMuted}`}>Total</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        {/* RIGHT: Legend with animated bars */}
                                        <div className="flex-1 min-w-0 space-y-2.5 max-h-[220px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#ffffff20 transparent' : '#d1d5db transparent' }}>
                                            {stats.topReasons.map((r, idx) => {
                                                const pct = totalReasons > 0 ? Math.round((r.count / totalReasons) * 100) : 0;
                                                const isActive = activePieIdx === idx;
                                                return (
                                                    <motion.div
                                                        key={r.reason}
                                                        initial={{ x: -30, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.4 + idx * 0.08, type: 'spring', stiffness: 100 }}
                                                        onMouseEnter={() => setActivePieIdx(idx)}
                                                        onMouseLeave={() => setActivePieIdx(null)}
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? (isDark ? 'bg-white/10' : 'bg-gray-100') : 'hover:' + (isDark ? 'bg-white/5' : 'bg-gray-50')}`}
                                                    >
                                                        <motion.div
                                                            animate={{ scale: isActive ? 1.3 : 1 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                                            style={{ background: `linear-gradient(135deg, ${PIE_GRADIENTS[idx % 6][0]}, ${PIE_GRADIENTS[idx % 6][1]})`, boxShadow: isActive ? `0 0 10px ${PIE_COLORS[idx % 6]}60` : 'none' }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className={`text-sm font-medium truncate ${textMain}`}>{r.reason}</span>
                                                                <span className={`text-xs font-bold ml-2 flex-shrink-0 ${isActive ? 'text-white' : textSub}`}>
                                                                    {r.count} <span className={`${textMuted} font-normal`}>({pct}%)</span>
                                                                </span>
                                                            </div>
                                                            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ duration: 1.2, delay: 0.5 + idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                                    className="h-full rounded-full"
                                                                    style={{ background: `linear-gradient(90deg, ${PIE_GRADIENTS[idx % 6][0]}, ${PIE_GRADIENTS[idx % 6][1]})`, boxShadow: isActive ? `0 0 8px ${PIE_COLORS[idx % 6]}40` : 'none' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className={`flex flex-col items-center justify-center h-52 ${textMuted} relative z-10`}>
                                    <div className="p-4 rounded-full bg-gradient-to-br from-emerald-400/10 to-green-400/10 mb-3">
                                        <FaCheck className="text-emerald-400" size={24} />
                                    </div>
                                    <p className="text-sm font-medium">Semua hadir!</p>
                                    <p className="text-xs mt-1">Belum ada data ketidakhadiran</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Kejadian per Gang & Ketidakhadiran per Gang */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* Kejadian per Gang */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-lg font-bold ${textMain} flex items-center gap-2`}>
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-400/20 to-orange-400/20"><FaExclamationTriangle className="text-orange-400" size={14} /></div>
                                        Kejadian per Gang
                                    </h2>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stats.totalKejadian > 0 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                        {stats.totalKejadian} total
                                    </span>
                                </div>
                                {stats.kejadianPerGang.length > 0 ? (() => {
                                    // Group by block
                                    const byBlock: Record<string, typeof stats.kejadianPerGang> = {};
                                    stats.kejadianPerGang.forEach(item => {
                                        if (!byBlock[item.block]) byBlock[item.block] = [];
                                        byBlock[item.block].push(item);
                                    });
                                    return (
                                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                            {Object.entries(byBlock).sort(([a], [b]) => a.localeCompare(b)).map(([block, items], blockIdx) => (
                                                <motion.div key={block} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + blockIdx * 0.08 }}>
                                                    <button
                                                        onClick={() => setExpandedKejadianBlocks(prev => prev.includes(block) ? prev.filter(b => b !== block) : [...prev, block])}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isDark ? 'bg-white/5 hover:bg-white/[0.08]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <motion.div animate={{ rotate: expandedKejadianBlocks.includes(block) ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                                                <FaChevronRight size={10} className={textSub} />
                                                            </motion.div>
                                                            <span className={`text-sm font-semibold ${textMain}`}>{block}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'}`}>
                                                                {items.reduce((s, i) => s + i.count, 0)}
                                                            </span>
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedKejadianBlocks.includes(block) && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                                                <div className="pl-5 pt-2 space-y-2">
                                                                    {items.map((item, idx) => (
                                                                        <motion.div
                                                                            key={`${item.block}-${item.gang}`}
                                                                            initial={{ x: -15, opacity: 0 }}
                                                                            animate={{ x: 0, opacity: 1 }}
                                                                            transition={{ delay: idx * 0.05 }}
                                                                            className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? 'bg-gradient-to-r from-red-500/5 to-transparent border-white/5' : 'bg-red-50/50 border-red-100'}`}
                                                                        >
                                                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-400/20 to-orange-400/20 flex-shrink-0 mt-0.5">
                                                                                <FaMapMarkerAlt className="text-orange-400" size={12} />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <span className={`text-sm font-semibold ${textMain}`}>{item.gang}</span>
                                                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.count >= 3 ? 'bg-red-500/20 text-red-400' : item.count >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                                                        {item.count} kejadian
                                                                                    </div>
                                                                                </div>
                                                                                {item.reports.map((rpt, ri) => (
                                                                                    <p key={ri} className={`text-xs ${textMuted} mt-1 flex items-start gap-1`}>
                                                                                        <span className="text-orange-400 mt-0.5 flex-shrink-0">&bull;</span>
                                                                                        <span>{rpt}</span>
                                                                                    </p>
                                                                                ))}
                                                                            </div>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    );
                                })() : (
                                    <div className={`flex flex-col items-center justify-center h-24 ${textMuted}`}>
                                        <div className="p-3 rounded-full bg-gradient-to-br from-emerald-400/10 to-green-400/10 mb-2">
                                            <FaShieldAlt className="text-emerald-400" size={16} />
                                        </div>
                                        <p className="text-sm">Aman! Tidak ada kejadian tercatat</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Ketidakhadiran per Gang */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-lg font-bold ${textMain} flex items-center gap-2`}>
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-400/20"><FaUsers className="text-purple-400" size={14} /></div>
                                        Ketidakhadiran per Gang
                                    </h2>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stats.absenceRate >= 30 ? 'bg-red-500/15 text-red-400' : stats.absenceRate >= 15 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                        {stats.absenceRate}% rata-rata
                                    </span>
                                </div>
                                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#ffffff20 transparent' : '#d1d5db transparent' }}>
                                    {(() => {
                                        // Group tidakHadirPerGang by block
                                        const byBlock: Record<string, typeof stats.tidakHadirPerGang> = {};
                                        stats.tidakHadirPerGang.forEach(item => {
                                            if (!byBlock[item.block]) byBlock[item.block] = [];
                                            byBlock[item.block].push(item);
                                        });
                                        return Object.entries(byBlock).sort(([a], [b]) => a.localeCompare(b)).map(([block, items], blockIdx) => (
                                            <motion.div key={block} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + blockIdx * 0.08 }}>
                                                <button
                                                    onClick={() => setExpandedAbsenBlocks(prev => prev.includes(block) ? prev.filter(b => b !== block) : [...prev, block])}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isDark ? 'bg-white/5 hover:bg-white/[0.08]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <motion.div animate={{ rotate: expandedAbsenBlocks.includes(block) ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                                            <FaChevronRight size={10} className={textSub} />
                                                        </motion.div>
                                                        <span className={`text-sm font-semibold ${textMain}`}>{block}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const blockTidak = items.reduce((s, i) => s + i.tidak, 0);
                                                            const blockTotal = items.reduce((s, i) => s + i.total, 0);
                                                            const blockPct = blockTotal > 0 ? Math.round((blockTidak / blockTotal) * 100) : 0;
                                                            return (
                                                                <span className={`text-xs font-semibold ${blockPct >= 40 ? 'text-red-400' : blockPct >= 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                    {blockTidak}/{blockTotal} ({blockPct}%)
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </button>
                                                <AnimatePresence>
                                                    {expandedAbsenBlocks.includes(block) && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                                            <div className="pl-5 pt-2 space-y-2.5">
                                                                {items.map((item, idx) => (
                                                                    <motion.div
                                                                        key={`${item.block}-${item.gang}`}
                                                                        initial={{ x: -15, opacity: 0 }}
                                                                        animate={{ x: 0, opacity: 1 }}
                                                                        transition={{ delay: idx * 0.05 }}
                                                                    >
                                                                        <div className="flex justify-between items-center mb-1.5">
                                                                            <div className="flex items-center gap-2">
                                                                                <FaMapMarkerAlt className="text-purple-400" size={10} />
                                                                                <span className={`text-sm font-medium ${textMain}`}>{item.gang}</span>
                                                                            </div>
                                                                            <span className={`text-xs font-bold ${item.pct >= 40 ? 'text-red-400' : item.pct >= 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                                {item.tidak}/{item.total} ({item.pct}%)
                                                                            </span>
                                                                        </div>
                                                                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${Math.max(item.pct, 2)}%` }}
                                                                                transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                                                className={`h-full rounded-full ${item.pct >= 40 ? 'bg-gradient-to-r from-red-400 to-red-500' : item.pct >= 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                                                                style={{ boxShadow: item.pct >= 40 ? '0 0 8px rgba(248,113,113,0.3)' : 'none' }}
                                                                            />
                                                                        </div>
                                                                        {item.names.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                {item.names.map((name, ni) => (
                                                                                    <span key={ni} className={`text-[10px] px-1.5 py-0.5 rounded-md ${isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-500'}`}>
                                                                                        {name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Search + Filters + Action */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-3 mb-4">
                        <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaSearch className={textSub} size={14} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, blok, gang, No rumah..." className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`} />
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaFilter className={textSub} size={14} />
                            <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)} className={`bg-transparent outline-none text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <option value="all" className={optionCls}>Semua Blok</option>
                                {blocks.map(b => <option key={b} value={b} className={optionCls}>{b}</option>)}
                            </select>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaMapMarkerAlt className={textSub} size={14} />
                            <select value={filterGang} onChange={(e) => setFilterGang(e.target.value)} className={`bg-transparent outline-none text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <option value="all" className={optionCls}>Semua Gang</option>
                                {gangs.map(g => <option key={g} value={g} className={optionCls}>{g}</option>)}
                                <option value="Semua Gang" className={optionCls}>Gabungan</option>
                            </select>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setForm(emptyForm); setSelectedCoordinator(null); setCoordinatorSearch(''); setSelectedParticipants([]); setParticipantSearch(''); setShowAddModal(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all">
                            <FaPlus size={14} /> Tambah Jadwal
                        </motion.button>
                    </motion.div>

                    {/* Schedule List - Grouped by Block */}
                    <div className="space-y-4">
                        {Object.keys(groupedByBlock).sort().map((block, bi) => (
                            <motion.div key={block} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + bi * 0.05 }}>
                                {/* Block Header */}
                                <button onClick={() => toggleBlock(block)} className={`w-full flex items-center justify-between px-5 py-3 rounded-t-xl border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-gray-100 border-gray-200 hover:bg-gray-150'} transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/20 to-indigo-400/20">
                                            <FaShieldAlt className="text-blue-400" size={14} />
                                        </div>
                                        <span className={`font-bold text-lg ${textMain}`}>{block}</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{groupedByBlock[block].length} jadwal</span>
                                    </div>
                                    {expandedBlocks.includes(block)
                                        ? <FaChevronDown className={textSub} size={12} />
                                        : <FaChevronRight className={textSub} size={12} />
                                    }
                                </button>

                                {/* Schedule Cards per Block */}
                                <AnimatePresence>
                                    {expandedBlocks.includes(block) && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                            <div className={`border border-t-0 rounded-b-xl ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                                {groupedByBlock[block].map((s, si) => {
                                                    const badge = getStatusBadge(s.status);
                                                    const ikutCount = s.participants.filter(p => p.response === 'ikut').length;
                                                    const tidakCount = s.participants.filter(p => p.response === 'tidak').length;
                                                    const pendingCount = s.participants.filter(p => p.response === 'pending').length;
                                                    return (
                                                        <motion.div
                                                            key={s.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: si * 0.04 }}
                                                            className={`p-5 ${si > 0 ? `border-t ${isDark ? 'border-white/5' : 'border-gray-100'}` : ''} ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'} transition-colors`}
                                                        >
                                                            {/* Schedule Row - Top info */}
                                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    {/* Date */}
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                                                        <FaCalendar size={10} className="text-pink-400" />
                                                                        <span className={textMain}>{s.date}</span>
                                                                    </span>
                                                                    {/* Gang */}
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${s.gang === 'Semua Gang' ? 'bg-gradient-to-r from-purple-400/15 to-pink-400/15 text-purple-400' : `${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}`}>
                                                                        <FaMapMarkerAlt size={10} />
                                                                        {s.gang}
                                                                    </span>
                                                                    {/* Shift */}
                                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                                        Shift: {s.shift}
                                                                    </span>
                                                                    {/* Status */}
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                                        {badge.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowDetailModal(s)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                                                                        <FaEye size={11} /> Detail
                                                                    </motion.button>
                                                                    {s.status === 'scheduled' && (
                                                                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setReportForm({ content: '', type: 'catatan' }); setShowReportModal(s); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400' : 'bg-amber-50 hover:bg-amber-100 text-amber-600'}`}>
                                                                            <FaFileAlt size={11} /> Laporan
                                                                        </motion.button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Coordinator */}
                                                            <div className={`flex items-center gap-2 mb-3 text-sm ${textMuted}`}>
                                                                <FaUser size={11} className="text-purple-400" />
                                                                <span className="font-medium">Koordinator:</span>
                                                                <span className={textMain}>{s.coordinator}</span>
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                                                    <FaHome size={9} className="opacity-50" /> {s.coordinatorHouse}
                                                                </span>
                                                            </div>

                                                            {/* Participants Summary */}
                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <span className={`text-xs ${textSub}`}>Peserta ({s.participants.length}):</span>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-400/10 text-emerald-400"><FaCheck size={8} />{ikutCount} ikut</span>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-red-400/10 text-red-400"><FaTimesCircle size={8} />{tidakCount} tidak</span>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-amber-400/10 text-amber-400"><FaClock size={8} />{pendingCount} pending</span>
                                                            </div>

                                                            {/* Participants Pills */}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {s.participants.map((p) => {
                                                                    const rb = getResponseBadge(p.response);
                                                                    return (
                                                                        <button
                                                                            key={p.id}
                                                                            onClick={() => {
                                                                                if (s.status === 'scheduled' && p.response === 'pending') {
                                                                                    setRsvpForm({ response: 'ikut', reason: '' });
                                                                                    setShowRsvpModal({ schedule: s, participant: p });
                                                                                }
                                                                            }}
                                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${p.response === 'pending' && s.status === 'scheduled' ? 'cursor-pointer hover:scale-105' : 'cursor-default'} ${isDark ? 'bg-white/5 hover:bg-white/[0.07]' : 'bg-gray-50 hover:bg-gray-100'} border ${isDark ? 'border-white/5' : 'border-gray-100'}`}
                                                                            title={p.response === 'tidak' && p.reason ? `Alasan: ${p.reason}` : p.response === 'pending' ? 'Klik untuk konfirmasi kehadiran' : ''}
                                                                        >
                                                                            <span className={`${textMain} font-medium`}>{p.name}</span>
                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? 'bg-white/5' : 'bg-gray-100'} ${textSub}`}>
                                                                                <FaHome size={8} className="inline mr-0.5 opacity-50" />{p.houseNo}
                                                                            </span>
                                                                            {s.gang === 'Semua Gang' && p.gang !== '-' && (
                                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{p.gang}</span>
                                                                            )}
                                                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${rb.cls}`}>
                                                                                {rb.icon} {rb.label}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Reports count */}
                                                            {s.reports.length > 0 && (
                                                                <div className={`mt-2 flex items-center gap-1.5 text-xs ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                                                                    <FaExclamationTriangle size={10} />
                                                                    <span>{s.reports.length} laporan/catatan</span>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {Object.keys(groupedByBlock).length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center py-16 ${textSub}`}>
                            <FaShieldAlt size={36} className="mx-auto mb-3 opacity-30" />
                            <p>Tidak ada jadwal ditemukan.</p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 MODAL: Tambah Jadwal
                 ══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-400/20 to-purple-400/20"><FaPlus className="text-purple-400" size={16} /></div>
                                    <h2 className={`text-xl font-bold ${textMain}`}>Tambah Jadwal Ronda</h2>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FaTimes size={18} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Tanggal</label>
                                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Blok</label>
                                        <select value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} className={inputCls}>
                                            {blocks.map(b => <option key={b} value={b} className={optionCls}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Shift</label>
                                        <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} className={inputCls}>
                                            <option value="Malam" className={optionCls}>Malam</option>
                                            <option value="Sore" className={optionCls}>Sore</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Gang mode selection */}
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Mode Jadwal</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setForm({ ...form, gangMode: 'per-gang' })} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.gangMode === 'per-gang' ? 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20 border-blue-400/30 text-blue-400' : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}`}>
                                            <FaMapMarkerAlt size={12} className="inline mr-1.5" />
                                            Per Gang
                                        </button>
                                        <button onClick={() => setForm({ ...form, gangMode: 'gabungan' })} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.gangMode === 'gabungan' ? 'bg-gradient-to-r from-purple-400/20 to-pink-400/20 border-purple-400/30 text-purple-400' : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}`}>
                                            <FaUsers size={12} className="inline mr-1.5" />
                                            Gabungan (Semua Gang)
                                        </button>
                                    </div>
                                </div>

                                {form.gangMode === 'per-gang' && (
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Gang</label>
                                        <select value={form.gang} onChange={(e) => setForm({ ...form, gang: e.target.value })} className={inputCls}>
                                            {gangs.map(g => <option key={g} value={g} className={optionCls}>{g}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Coordinator Search */}
                                <div ref={coordinatorRef}>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Koordinator</label>
                                    {selectedCoordinator ? (
                                        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-300'}`}>
                                            <div className="flex items-center gap-2">
                                                <FaUser size={11} className="text-purple-400" />
                                                <span className={`text-sm font-medium ${textMain}`}>{selectedCoordinator.name}</span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                                    <FaHome size={8} className="inline mr-0.5" />{selectedCoordinator.houseNo}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{selectedCoordinator.gang}</span>
                                            </div>
                                            <button onClick={() => { setSelectedCoordinator(null); setCoordinatorSearch(''); }} className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><FaTimes size={12} /></button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-300'} ${showCoordinatorDropdown ? 'ring-2 ring-purple-500/50' : ''}`}>
                                                <FaSearch size={11} className={textSub} />
                                                <input
                                                    type="text"
                                                    value={coordinatorSearch}
                                                    onChange={(e) => { setCoordinatorSearch(e.target.value); setShowCoordinatorDropdown(true); }}
                                                    onFocus={() => setShowCoordinatorDropdown(true)}
                                                    placeholder="Cari nama atau No. rumah..."
                                                    className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                                />
                                            </div>
                                            {showCoordinatorDropdown && (
                                                <div className={`absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`}>
                                                    {filteredCoordinatorWarga.length === 0 ? (
                                                        <div className={`px-4 py-3 text-xs ${textSub}`}>Tidak ada warga ditemukan di {form.block}{form.gangMode === 'per-gang' ? ` ${form.gang}` : ''}</div>
                                                    ) : filteredCoordinatorWarga.map(w => (
                                                        <button key={w.id} onClick={() => { setSelectedCoordinator(w); setCoordinatorSearch(''); setShowCoordinatorDropdown(false); }} className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                                            <FaUser size={10} className="text-purple-400 shrink-0" />
                                                            <span className={`font-medium ${textMain}`}>{w.name}</span>
                                                            <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}><FaHome size={8} />{w.houseNo}</span>
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{w.gang}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Participant Search + Multi-select */}
                                <div ref={participantRef}>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Peserta Lain</label>
                                    {/* Selected Participants Tags */}
                                    {selectedParticipants.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {selectedParticipants.map(p => (
                                                <span key={p.id} className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                    <span className={textMain}>{p.name}</span>
                                                    <span className={`px-1 py-0 rounded text-[9px] ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>{p.houseNo}</span>
                                                    <button onClick={() => removeParticipant(p.id)} className={`ml-0.5 p-0.5 rounded transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}><FaTimes size={9} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Search Input */}
                                    <div className="relative">
                                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-300'} ${showParticipantDropdown ? 'ring-2 ring-purple-500/50' : ''}`}>
                                            <FaSearch size={11} className={textSub} />
                                            <input
                                                type="text"
                                                value={participantSearch}
                                                onChange={(e) => { setParticipantSearch(e.target.value); setShowParticipantDropdown(true); }}
                                                onFocus={() => setShowParticipantDropdown(true)}
                                                placeholder="Cari & pilih peserta..."
                                                className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                            />
                                            {selectedParticipants.length > 0 && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isDark ? 'bg-purple-400/15 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>{selectedParticipants.length} dipilih</span>
                                            )}
                                        </div>
                                        {showParticipantDropdown && (
                                            <div className={`absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`}>
                                                {filteredParticipantWarga.length === 0 ? (
                                                    <div className={`px-4 py-3 text-xs ${textSub}`}>
                                                        {participantSearch ? 'Tidak ada warga ditemukan' : 'Semua warga sudah dipilih'}
                                                    </div>
                                                ) : filteredParticipantWarga.map(w => (
                                                    <button key={w.id} onClick={() => addParticipant(w)} className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                                        <FaPlus size={9} className="text-emerald-400 shrink-0" />
                                                        <span className={`font-medium ${textMain}`}>{w.name}</span>
                                                        <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}><FaHome size={8} />{w.houseNo}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{w.gang}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[11px] mt-1.5 ${textSub}`}>Pilih dari daftar warga di {form.block}{form.gangMode === 'per-gang' ? ` ${form.gang}` : ' (semua gang)'}. Klik untuk menambahkan.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Batal</button>
                                <button onClick={handleAddSchedule} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all">Simpan Jadwal</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════
                 MODAL: Detail Jadwal
                 ══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showDetailModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20"><FaShieldAlt className="text-blue-400" size={16} /></div>
                                    <div>
                                        <h2 className={`text-xl font-bold ${textMain}`}>Detail Jadwal Ronda</h2>
                                        <p className={`text-xs ${textSub}`}>{showDetailModal.block} &bull; {showDetailModal.gang} &bull; {showDetailModal.date}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDetailModal(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FaTimes size={18} /></button>
                            </div>

                            {/* Info */}
                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <div><span className={`block text-xs ${textSub}`}>Tanggal</span><span className={`text-sm font-semibold ${textMain}`}>{showDetailModal.date}</span></div>
                                <div><span className={`block text-xs ${textSub}`}>Shift</span><span className={`text-sm font-semibold ${textMain}`}>{showDetailModal.shift}</span></div>
                                <div><span className={`block text-xs ${textSub}`}>Koordinator</span><span className={`text-sm font-semibold ${textMain}`}>{showDetailModal.coordinator} ({showDetailModal.coordinatorHouse})</span></div>
                                <div><span className={`block text-xs ${textSub}`}>Status</span><span className={`inline-flex items-center gap-1 text-sm font-semibold ${getStatusBadge(showDetailModal.status).cls} px-2 py-0.5 rounded-full`}><span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(showDetailModal.status).dot}`} />{getStatusBadge(showDetailModal.status).label}</span></div>
                            </div>

                            {/* Participants Table */}
                            <h3 className={`text-sm font-bold mb-3 ${textMain} flex items-center gap-2`}><FaUsers size={13} className="text-purple-400" /> Daftar Peserta ({showDetailModal.participants.length})</h3>

                            {/* Desktop Table */}
                            <div className={`hidden md:block rounded-xl border overflow-hidden mb-5 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                            <th className={`text-left px-4 py-3 text-xs font-semibold ${textMuted}`}>Nama</th>
                                            <th className={`text-left px-4 py-3 text-xs font-semibold ${textMuted}`}>No. Rumah</th>
                                            {showDetailModal.gang === 'Semua Gang' && <th className={`text-left px-4 py-3 text-xs font-semibold ${textMuted}`}>Gang</th>}
                                            <th className={`text-center px-4 py-3 text-xs font-semibold ${textMuted}`}>Konfirmasi</th>
                                            <th className={`text-left px-4 py-3 text-xs font-semibold ${textMuted}`}>Alasan</th>
                                            {showDetailModal.status === 'scheduled' && <th className={`text-center px-4 py-3 text-xs font-semibold ${textMuted}`}>Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {showDetailModal.participants.map((p) => {
                                            const rb = getResponseBadge(p.response);
                                            return (
                                                <tr key={p.id} className={`border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                    <td className={`px-4 py-3 ${textMain} font-medium`}>{p.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-white/5' : 'bg-gray-100'} ${textMuted}`}>
                                                            <FaHome size={9} className="opacity-50" /> {p.houseNo}
                                                        </span>
                                                    </td>
                                                    {showDetailModal.gang === 'Semua Gang' && (
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{p.gang}</span>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${rb.cls}`}>{rb.icon} {rb.label}</span>
                                                    </td>
                                                    <td className={`px-4 py-3 text-xs ${textSub} max-w-[200px]`}>
                                                        {p.response === 'tidak' && p.reason ? (
                                                            <span className="italic">&ldquo;{p.reason}&rdquo;</span>
                                                        ) : <span className="opacity-40">-</span>}
                                                    </td>
                                                    {showDetailModal.status === 'scheduled' && (
                                                        <td className="px-4 py-3 text-center">
                                                            {p.response === 'pending' ? (
                                                                <button onClick={() => { setRsvpForm({ response: 'ikut', reason: '' }); setShowRsvpModal({ schedule: showDetailModal, participant: p }); }} className="px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md transition-all">
                                                                    Konfirmasi
                                                                </button>
                                                            ) : (
                                                                <span className={`text-xs ${textSub}`}>Sudah konfirmasi</span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                </div>
                            </div>

                            {/* Mobile Card Layout */}
                            <div className="md:hidden space-y-2.5 mb-5">
                                {showDetailModal.participants.map((p) => {
                                    const rb = getResponseBadge(p.response);
                                    return (
                                        <div key={p.id} className={`p-3.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50/50'}`}>
                                            {/* Row 1: Name + Status */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-semibold ${textMain}`}>{p.name}</span>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${rb.cls}`}>{rb.icon} {rb.label}</span>
                                            </div>
                                            {/* Row 2: House + Gang */}
                                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${isDark ? 'bg-white/5' : 'bg-gray-100'} ${textMuted}`}>
                                                    <FaHome size={8} className="opacity-50" /> {p.houseNo}
                                                </span>
                                                {showDetailModal.gang === 'Semua Gang' && (
                                                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${isDark ? 'bg-blue-400/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{p.gang}</span>
                                                )}
                                            </div>
                                            {/* Row 3: Reason (if not attending) */}
                                            {p.response === 'tidak' && p.reason && (
                                                <div className={`mt-2 p-2.5 rounded-lg text-xs italic ${isDark ? 'bg-red-400/5 border border-red-400/10 text-red-300' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                                                    <FaExclamationTriangle size={10} className="inline mr-1 opacity-70" />
                                                    &ldquo;{p.reason}&rdquo;
                                                </div>
                                            )}
                                            {/* Row 4: Action button if pending */}
                                            {showDetailModal.status === 'scheduled' && p.response === 'pending' && (
                                                <button onClick={() => { setRsvpForm({ response: 'ikut', reason: '' }); setShowRsvpModal({ schedule: showDetailModal, participant: p }); }} className="mt-2 w-full px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md transition-all text-center">
                                                    Konfirmasi Kehadiran
                                                </button>
                                            )}
                                            {showDetailModal.status === 'scheduled' && p.response !== 'pending' && (
                                                <p className={`mt-1.5 text-[11px] ${textSub}`}>Sudah konfirmasi</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reports */}
                            <h3 className={`text-sm font-bold mb-3 ${textMain} flex items-center gap-2`}><FaFileAlt size={13} className="text-amber-400" /> Laporan &amp; Catatan ({showDetailModal.reports.length})</h3>
                            {showDetailModal.reports.length === 0 ? (
                                <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} ${textSub}`}>
                                    <FaFileAlt size={24} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Belum ada laporan.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {showDetailModal.reports.map((r) => (
                                        <div key={r.id} className={`p-4 rounded-xl border ${r.type === 'kejadian' ? (isDark ? 'border-red-400/20 bg-red-400/5' : 'border-red-200 bg-red-50/50') : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.type === 'kejadian' ? 'bg-red-400/15 text-red-400' : 'bg-blue-400/15 text-blue-400'}`}>
                                                        {r.type === 'kejadian' ? '! Kejadian' : 'Catatan'}
                                                    </span>
                                                    <span className={`text-xs font-medium ${textMain}`}>{r.authorName}</span>
                                                    <span className={`text-[10px] ${textSub}`}>({r.houseNo})</span>
                                                </div>
                                                <span className={`text-[10px] ${textSub}`}>{r.timestamp}</span>
                                            </div>
                                            <p className={`text-sm ${textMuted}`}>{r.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Report Button */}
                            {showDetailModal.status !== 'cancelled' && (
                                <button onClick={() => { setReportForm({ content: '', type: 'catatan' }); setShowReportModal(showDetailModal); }} className="mt-4 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
                                    <FaPaperPlane size={12} /> Kirim Laporan / Catatan
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════
                 MODAL: Kirim Laporan / Catatan
                 ══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowReportModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20"><FaFileAlt className="text-amber-400" size={16} /></div>
                                    <h2 className={`text-xl font-bold ${textMain}`}>Kirim Laporan</h2>
                                </div>
                                <button onClick={() => setShowReportModal(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FaTimes size={18} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Tipe Laporan</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setReportForm({ ...reportForm, type: 'catatan' })} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${reportForm.type === 'catatan' ? 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20 border-blue-400/30 text-blue-400' : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}`}>
                                            Catatan
                                        </button>
                                        <button onClick={() => setReportForm({ ...reportForm, type: 'kejadian' })} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${reportForm.type === 'kejadian' ? 'bg-gradient-to-r from-red-400/20 to-rose-400/20 border-red-400/30 text-red-400' : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}`}>
                                            <FaExclamationTriangle size={11} className="inline mr-1" /> Kejadian
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Isi Laporan</label>
                                    <textarea value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} rows={4} placeholder={reportForm.type === 'kejadian' ? 'Jelaskan kejadian yang terjadi...' : 'Tuliskan catatan ronda...'} className={`${inputCls} resize-none`} />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowReportModal(null)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Batal</button>
                                <button onClick={handleSubmitReport} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
                                    <FaPaperPlane size={12} /> Kirim
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════
                 MODAL: Konfirmasi Kehadiran (RSVP)
                 ══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showRsvpModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRsvpModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20"><FaUser className="text-blue-400" size={16} /></div>
                                    <div>
                                        <h2 className={`text-lg font-bold ${textMain}`}>Konfirmasi Kehadiran</h2>
                                        <p className={`text-xs ${textSub}`}>{showRsvpModal.participant.name} &bull; {showRsvpModal.participant.houseNo}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowRsvpModal(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FaTimes size={18} /></button>
                            </div>

                            <div className={`text-center p-4 rounded-xl mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${textSub} mb-1`}>Jadwal Ronda</p>
                                <p className={`text-sm font-semibold ${textMain}`}>{showRsvpModal.schedule.block} &bull; {showRsvpModal.schedule.gang}</p>
                                <p className={`text-xs ${textSub}`}>{showRsvpModal.schedule.date} &bull; Shift {showRsvpModal.schedule.shift}</p>
                            </div>

                            <div className="space-y-3">
                                <label className={`block text-sm font-medium ${textMuted}`}>Apakah Anda bisa ikut ronda?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setRsvpForm({ ...rsvpForm, response: 'ikut', reason: '' })} className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${rsvpForm.response === 'ikut' ? 'bg-gradient-to-r from-emerald-400/20 to-green-400/20 border-emerald-400/30 text-emerald-400' : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}`}>
                                        <FaCheck size={12} /> Ya, Ikut
                                    </button>
                                    <button onClick={() => setRsvpForm({ ...rsvpForm, response: 'tidak' })} className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${rsvpForm.response === 'tidak' ? 'bg-gradient-to-r from-red-400/20 to-rose-400/20 border-red-400/30 text-red-400' : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}`}>
                                        <FaTimesCircle size={12} /> Tidak Bisa
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {rsvpForm.response === 'tidak' && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                            <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>
                                                Alasan <span className="text-red-400">*</span>
                                            </label>
                                            <textarea value={rsvpForm.reason} onChange={(e) => setRsvpForm({ ...rsvpForm, reason: e.target.value })} rows={3} placeholder="Wajib memberikan alasan jika tidak bisa ikut..." className={`${inputCls} resize-none`} />
                                            {rsvpForm.response === 'tidak' && !rsvpForm.reason.trim() && (
                                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><FaExclamationTriangle size={10} /> Alasan wajib diisi</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowRsvpModal(null)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Batal</button>
                                <button onClick={handleRsvp} disabled={rsvpForm.response === 'tidak' && !rsvpForm.reason.trim()} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${rsvpForm.response === 'tidak' && !rsvpForm.reason.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:shadow-lg hover:shadow-blue-500/30'}`}>
                                    <FaPaperPlane size={12} /> Konfirmasi
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
