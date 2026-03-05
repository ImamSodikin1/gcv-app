import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiInfo, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Penduduk, PaginatedResponse, KartuKeluarga, Pekerjaan } from '@/interface/pendataan';
import MenuPendataan from '@/components/MenuPendataan';
import { ModernTable } from '@/components/ModernTable';
import { GroupedTable } from '@/components/GroupedTable';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/lib/swal';
import { useRealtimeRefresh } from '@/lib/realtime';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PendudukPage() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const swal = showAlert(theme);
  const [data, setData] = useState<Penduduk[]>([]);
  const [kaKKList, setKKList] = useState<KartuKeluarga[]>([]);
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kartu_keluarga_id: '',
    nik: '',
    nama_lengkap: '',
    jenis_kelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    tanggal_lahir: '',
    tempat_lahir: '',
    status_perkawinan: 'Belum Kawin' as 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati',
    agama: 'Islam' as 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu',
    hubungan_keluarga: 'Anak' as 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Menantu' | 'Cucu' | 'Orang Tua' | 'Mertua' | 'Lainnya',
    status_ktp: 'KTP Jaya Sampurna' as 'KTP Jaya Sampurna' | 'KTP Luar Desa' | 'Belum KTP',
    pekerjaan: '',
    status_pekerjaan: 'Bekerja' as 'Bekerja' | 'Tidak Bekerja' | 'Sekolah' | 'Mengurus Rumah Tangga' | 'Lainnya',
    pendidikan_terakhir: 'SMA' as 'Tidak Sekolah' | 'SD' | 'SMP' | 'SMA' | 'Diploma' | 'S1' | 'S2' | 'S3',
  });

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/pendataan/penduduk?${params}`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<Penduduk> = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setData(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, search]);

  const fetchKKList = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/pendataan/kartu-keluarga?limit=1000`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<KartuKeluarga> = await response.json();
      if (result.success) {
        setKKList(result.data);
      }
    } catch (err) {
      console.error('Error fetching KK list:', err);
    }
  }, [user]);

  const fetchPekerjaanList = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/pendataan/pekerjaan?limit=1000`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<Pekerjaan> = await response.json();
      if (result.success) {
        setPekerjaanList(result.data.filter(p => p.is_active));
      }
    } catch (err) {
      console.error('Error fetching pekerjaan list:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    fetchKKList();
    fetchPekerjaanList();
  }, [fetchData, fetchKKList, fetchPekerjaanList]);

  // Subscribe to realtime changes on penduduk and kartu_keluarga tables
  const { lastEvent } = useRealtimeRefresh({
    tables: ['penduduk', 'kartu_keluarga'],
    refetch: fetchData,
    source: 'supabase',
    debounceMs: 800,
  });

  // Subscribe to realtime changes for dropdown lists
  const { lastEvent: lastKKEvent } = useRealtimeRefresh({
    tables: ['kartu_keluarga'],
    refetch: fetchKKList,
    source: 'supabase',
    debounceMs: 800,
  });

  const { lastEvent: lastPekerjaanEvent } = useRealtimeRefresh({
    tables: ['pekerjaan'],
    refetch: fetchPekerjaanList,
    source: 'supabase',
    debounceMs: 800,
  });

  const handleAddPenduduk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validasi: NIK harus diisi jika status KTP bukan "Belum KTP"
      if (formData.status_ktp !== 'Belum KTP') {
        if (!formData.nik) {
          swal.warning('Validasi NIK Gagal', 'NIK harus diisi karena status KTP tidak "Belum KTP"');
          return;
        }
      }

      const url = editingId
        ? `/api/pendataan/penduduk`
        : `/api/pendataan/penduduk`;
      const method = editingId ? 'PUT' : 'POST';

      // Prepare form data for submission
      const formDataToSend = { ...formData };
      if (formData.status_ktp === 'Belum KTP') {
        formDataToSend.nik = null as any;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...formDataToSend } : formDataToSend
        ),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      // Reset form
      setFormData({
        kartu_keluarga_id: '',
        nik: '',
        nama_lengkap: '',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '',
        tempat_lahir: '',
        status_perkawinan: 'Belum Kawin',
        agama: 'Islam',
        hubungan_keluarga: 'Anak',
        status_ktp: 'KTP Jaya Sampurna',
        pekerjaan: '',
        status_pekerjaan: 'Bekerja',
        pendidikan_terakhir: 'SMA',
      });
      setEditingId(null);
      setShowAddForm(false);
      fetchData();

      swal.success(
        editingId ? 'Berhasil Diperbarui!' : 'Berhasil Ditambahkan!',
        editingId ? 'Data Penduduk berhasil diperbarui' : 'Data Penduduk berhasil ditambahkan'
      );
    } catch (err: unknown) {
      swal.error('Gagal Menyimpan', err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEditPenduduk = (penduduk: Penduduk) => {
    setFormData({
      kartu_keluarga_id: penduduk.kartu_keluarga_id,
      nik: penduduk.nik,
      nama_lengkap: penduduk.nama_lengkap,
      jenis_kelamin: penduduk.jenis_kelamin,
      tanggal_lahir: penduduk.tanggal_lahir,
      tempat_lahir: penduduk.tempat_lahir || '',
      status_perkawinan: penduduk.status_perkawinan || 'Belum Kawin',
      agama: penduduk.agama || 'Islam',
      hubungan_keluarga: penduduk.hubungan_keluarga,
      status_ktp: penduduk.status_ktp,
      pekerjaan: penduduk.pekerjaan || '',
      status_pekerjaan: penduduk.status_pekerjaan || 'Bekerja',
      pendidikan_terakhir: penduduk.pendidikan_terakhir || 'SMA',
    });
    setEditingId(penduduk.id);
    setShowAddForm(true);
  };

  const handleDeletePenduduk = async (id: string) => {
    if (!user) return;
    const confirmed = await swal.confirm(
      'Hapus Data Penduduk?',
      'Data yang dihapus tidak dapat dikembalikan'
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/pendataan/penduduk?id=${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': user.id,
          },
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }

        fetchData();
        swal.success('Berhasil Dihapus!', 'Data Penduduk berhasil dihapus');
      } catch (err: unknown) {
        swal.error('Gagal Menghapus', err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  const generateDummyData = (): Penduduk[] => {
    return [
      {
        id: '1',
        kartu_keluarga_id: '1',
        nik: '3201011501850001',
        nama_lengkap: 'Budi Santoso',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '1985-01-15',
        tempat_lahir: 'Jakarta',
        agama: 'Islam',
        pendidikan_terakhir: 'S1',
        pekerjaan: 'Pegawai Swasta',
        status_pekerjaan: 'Bekerja',
        status_perkawinan: 'Kawin',
        hubungan_keluarga: 'Kepala Keluarga',
        status_ktp: 'KTP Jaya Sampurna',
        usia_tahun: 39,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        kartu_keluarga_id: '1',
        nik: '3201012208900002',
        nama_lengkap: 'Siti Nurhaliza',
        jenis_kelamin: 'Perempuan',
        tanggal_lahir: '1990-08-22',
        tempat_lahir: 'Bandung',
        agama: 'Islam',
        pendidikan_terakhir: 'S1',
        pekerjaan: 'Guru',
        status_pekerjaan: 'Bekerja',
        status_perkawinan: 'Kawin',
        hubungan_keluarga: 'Istri',
        status_ktp: 'KTP Jaya Sampurna',
        usia_tahun: 34,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        kartu_keluarga_id: '2',
        nik: '3201011203880003',
        nama_lengkap: 'Ahmad Wijaya',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '1988-03-12',
        tempat_lahir: 'Surabaya',
        agama: 'Islam',
        pendidikan_terakhir: 'Diploma',
        pekerjaan: 'Wiraswasta',
        status_pekerjaan: 'Bekerja',
        status_perkawinan: 'Kawin',
        hubungan_keluarga: 'Kepala Keluarga',
        status_ktp: 'KTP Jaya Sampurna',
        usia_tahun: 36,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  };

  const handleDownloadExcel = () => {
    const exportData = data.length > 0 ? data : generateDummyData();

    const worksheetData = exportData.map((item, index) => ({
      'No': index + 1,
      'NIK': item.nik || '-',
      'Nama Lengkap': item.nama_lengkap || '-',
      'Jenis Kelamin': item.jenis_kelamin || '-',
      'Tempat Lahir': item.tempat_lahir || '-',
      'Tanggal Lahir': new Date(item.tanggal_lahir).toLocaleDateString('id-ID'),
      'Usia (Tahun)': item.usia_tahun || '-',
      'Agama': item.agama || '-',
      'Pendidikan Terakhir': item.pendidikan_terakhir || '-',
      'Pekerjaan': item.pekerjaan || '-',
      'Status Pekerjaan': item.status_pekerjaan || '-',
      'Status Perkawinan': item.status_perkawinan || '-',
      'Hubungan Keluarga': item.hubungan_keluarga || '-',
      'Status KTP': item.status_ktp || '-',
      'Catatan': item.catatan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penduduk');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 18 },  // NIK
      { wch: 22 },  // Nama Lengkap
      { wch: 14 },  // Jenis Kelamin
      { wch: 16 },  // Tempat Lahir
      { wch: 14 },  // Tanggal Lahir
      { wch: 12 },  // Usia
      { wch: 12 },  // Agama
      { wch: 18 },  // Pendidikan Terakhir
      { wch: 16 },  // Pekerjaan
      { wch: 16 },  // Status Pekerjaan
      { wch: 16 },  // Status Perkawinan
      { wch: 18 },  // Hubungan Keluarga
      { wch: 18 },  // Status KTP
      { wch: 22 },  // Status KK
      { wch: 20 },  // Catatan
    ];

    // Set row height for header
    worksheet['!rows'] = [{ hpx: 25 }];

    // Apply styling to header
    const headerRange = `A1:P1`;
    for (let col = 0; col < 16; col++) {
      const cellAddress = XLSX.utils.encode_col(col) + '1';
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' }, size: 12 },
          fill: { fgColor: { rgb: '3B82F6' } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'medium', color: { rgb: '1E40AF' } },
            bottom: { style: 'medium', color: { rgb: '1E40AF' } },
            left: { style: 'medium', color: { rgb: '1E40AF' } },
            right: { style: 'medium', color: { rgb: '1E40AF' } },
          },
        };
      }
    }

    // Apply styling to data rows with increased row height
    for (let row = 2; row <= worksheetData.length + 1; row++) {
      if (!worksheet['!rows']) {
        worksheet['!rows'] = [];
      }
      worksheet['!rows'][row - 1] = { hpx: 20 };

      for (let col = 0; col < 16; col++) {
        const cellAddress = XLSX.utils.encode_col(col) + row;
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { size: 10 },
            alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: 'D3D3D3' } },
              bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
              left: { style: 'thin', color: { rgb: 'D3D3D3' } },
              right: { style: 'thin', color: { rgb: 'D3D3D3' } },
            },
          };
          // Alternate row colors
          if (row % 2 === 0) {
            worksheet[cellAddress].s.fill = { fgColor: { rgb: 'F0F4F8' } };
          }
        }
      }
    }

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.writeFile(workbook, `Data_Penduduk_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const exportData = data.length > 0 ? data : generateDummyData();

    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Add header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA PENDUDUK', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Add date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.text(`Total Data: ${exportData.length} penduduk`, 14, yPosition);
    yPosition += 5;

    // Table data
    const tableData = exportData.map((item, index) => [
      index + 1,
      item.nik || '-',
      item.nama_lengkap || '-',
      item.jenis_kelamin === 'Laki-laki' ? 'L' : 'P',
      new Date(item.tanggal_lahir).toLocaleDateString('id-ID'),
      item.usia_tahun || '-',
      item.agama || '-',
      item.pendidikan_terakhir || '-',
      item.pekerjaan || '-',
      item.status_pekerjaan || '-',
      item.status_perkawinan || '-',
      item.hubungan_keluarga || '-',
      item.status_ktp || '-',
    ]);

    // Add table with improved styling
    autoTable(doc, {
      head: [[
        'No',
        'NIK',
        'Nama Lengkap',
        'JK',
        'Tgl Lahir',
        'Usia',
        'Agama',
        'Pendidikan',
        'Pekerjaan',
        'Stat. Kerja',
        'Stat. Kawin',
        'Hub. Klg',
        'Status KTP',
      ]],
      body: tableData,
      startY: yPosition,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        minCellHeight: 8,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 6,
        lineColor: [30, 64, 175],
        lineWidth: 0.6,
      },
      alternateRowStyles: {
        fillColor: [240, 244, 248],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', cellWidth: 16 },
        2: { halign: 'left', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 6 },
        4: { halign: 'center', cellWidth: 14 },
        5: { halign: 'center', cellWidth: 8 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'center', cellWidth: 14 },
        8: { halign: 'left', cellWidth: 14 },
        9: { halign: 'center', cellWidth: 12 },
        10: { halign: 'center', cellWidth: 12 },
        11: { halign: 'center', cellWidth: 12 },
        12: { halign: 'center', cellWidth: 14 },
        13: { halign: 'center', cellWidth: 14 },
      },
      didDrawPage: () => {
        // Footer
        const pageCount = doc.internal.pages.length - 1;
        const currentPage = doc.internal.pages.length === 1 ? 1 : doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Halaman ${currentPage} dari ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });

    doc.save(`Data_Penduduk_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleCancelEdit = () => {
    setFormData({
      kartu_keluarga_id: '',
      nik: '',
      nama_lengkap: '',
      jenis_kelamin: 'Laki-laki',
      tanggal_lahir: '',
      tempat_lahir: '',
      status_perkawinan: 'Belum Kawin',
      agama: 'Islam',
      hubungan_keluarga: 'Anak',
      status_ktp: 'KTP Jaya Sampurna',
      pekerjaan: '',
      status_pekerjaan: 'Bekerja',
      pendidikan_terakhir: 'SMA',
    });
    setEditingId(null);
    setShowAddForm(false);
  };



  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10' : 'bg-white border-gray-200';
  const inputBg = isDark ? 'bg-[#181926] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900';

  // Define table columns using TanStack Table
  const columns = useMemo<ColumnDef<Penduduk>[]>(
    () => [
      {
        accessorKey: 'nik',
        header: 'NIK',
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'nama_lengkap',
        header: 'Nama Lengkap',
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'jenis_kelamin',
        header: 'Gender',
        cell: (info) => {
          const val = info.getValue() as string;
          return <span>{val === 'Laki-laki' ? 'L' : 'P'}</span>;
        },
      },
      {
        accessorFn: (row) => `${row.tempat_lahir || '-'}, ${new Date(row.tanggal_lahir).toLocaleDateString('id-ID')}`,
        id: 'ttl',
        header: 'TTL',
        cell: (info) => (
          <div className="text-xs">
            <div>{(info.row.original.tempat_lahir || '-')}</div>
            <div className={textSub}>{new Date(info.row.original.tanggal_lahir).toLocaleDateString('id-ID')}</div>
          </div>
        ),
      },
      {
        accessorKey: 'usia_tahun',
        header: 'Usia',
        cell: (info) => <span className="font-semibold text-xs">{(info.getValue() as number) || '-'} thn</span>,
      },
      {
        accessorKey: 'agama',
        header: 'Agama',
        cell: (info) => (
          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-300">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status_perkawinan',
        header: 'Perkawinan',
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${val === 'Kawin'
                ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'
                : isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'
              }`}>
              {val || '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'hubungan_keluarga',
        header: 'Hub. Keluarga',
        cell: (info) => (
          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'pendidikan_terakhir',
        header: 'Pendidikan',
        cell: (info) => <span className="text-xs">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'pekerjaan',
        header: 'Pekerjaan',
        cell: (info) => {
          const pekerjaan = info.getValue() as string;
          const statusPekerjaan = info.row.original.status_pekerjaan;
          const displayPekerjaan = statusPekerjaan === 'Bekerja' && pekerjaan ? pekerjaan : 'Tidak Bekerja';
          return <span className="text-xs">{displayPekerjaan}</span>;
        },
      },
      {
        accessorKey: 'status_pekerjaan',
        header: 'Status Kerja',
        cell: (info) => {
          const statusPekerjaan = info.getValue() as string;
          const pekerjaan = info.row.original.pekerjaan;
          const validStatus = statusPekerjaan === 'Bekerja' && pekerjaan ? statusPekerjaan : 'Tidak Bekerja';
          return (
            <span className="text-xs inline-block px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-semibold">
              {validStatus}
            </span>
          );
        },
      },
      {
        accessorKey: 'status_ktp',
        header: 'Status KTP',
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${val === 'KTP Jaya Sampurna'
                ? isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                : val === 'KTP Luar Desa'
                  ? isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-800'
                  : isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'
              }`}>
              {val}
            </span>
          );
        },
      },

      {
        accessorKey: 'catatan',
        header: 'Catatan',
        cell: (info) => <span className="text-xs max-w-xs truncate italic">{(info.getValue() as string) || '-'}</span>,
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEditPenduduk(info.row.original)}
              className={`transition p-2 rounded ${
                isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                onClick={() => handleDeletePenduduk(info.row.original.id)}
                className={`transition p-2 rounded ${
                  isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                }`}
                title="Hapus"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [isDark, isAdmin, textSub, handleEditPenduduk, handleDeletePenduduk]
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
      <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
        {/* Menu Navigasi */}
        <MenuPendataan />

        {/* Info Banner untuk User Biasa */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${isDark ? 'bg-blue-500/10 border border-blue-400/30' : 'bg-blue-50 border border-blue-200'
              }`}
          >
            <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Informasi untuk Warga</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Anda dapat mendaftarkan data penduduk untuk keluarga Anda. Data yang ditampilkan adalah data yang Anda daftarkan.
                Admin dapat melihat dan mengelola semua data penduduk.
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${textMain}`}>Kelola Data Penduduk</h1>
          </div>
          <button
            onClick={() => {
              handleCancelEdit();
              setShowAddForm(!showAddForm);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition w-full sm:w-auto justify-center"
          >
            <FiPlus /> {editingId ? 'Edit Penduduk' : 'Tambah Penduduk'}
          </button>
        </motion.div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg mb-6 ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${textMain}`}>{editingId ? 'Edit Data Penduduk' : 'Tambah Data Penduduk Baru'}</h2>
            
            {/* Form Sections */}
            <form onSubmit={handleAddPenduduk} className="space-y-6">
              {/* Section 1: Kartu Keluarga & Status KTP */}
              <div className="space-y-4">
                <h3 className={`text-sm font-semibold ${textMain} border-b pb-2`}>Data Keluarga & Kependudukan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Kartu Keluarga <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.kartu_keluarga_id}
                      onChange={(e) => setFormData({ ...formData, kartu_keluarga_id: e.target.value })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                      required
                    >
                      <option value="">-- Pilih Kartu Keluarga --</option>
                      {kaKKList.map((kk) => (
                        <option key={kk.id} value={kk.id}>
                          {kk.no_kk} - {kk.nama_kepala_keluarga}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Status KTP <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status_ktp}
                      onChange={(e) => setFormData({ ...formData, status_ktp: e.target.value as 'KTP Jaya Sampurna' | 'KTP Luar Desa' | 'Belum KTP', nik: null as any })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="KTP Jaya Sampurna">KTP Jaya Sampurna</option>
                      <option value="KTP Luar Desa">KTP Luar Desa</option>
                      <option value="Belum KTP">Belum KTP</option>
                    </select>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Pilih status KTP terlebih dahulu
                    </p>
                  </div>
                </div>

                {formData.status_ktp !== 'Belum KTP' && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nomor identitas (16 digit)"
                        value={formData.nik || ''}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        className={`border-2 rounded px-3 py-2 w-full ${inputBg}`}
                        required
                        disabled={!!editingId}
                      />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Wajib diisi jika sudah punya KTP (16 digit)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Data Pribadi */}
              <div className="space-y-4">
                <h3 className={`text-sm font-semibold ${textMain} border-b pb-2`}>Data Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nama lengkap sesuai KTP/dokumen resmi"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'Laki-laki' | 'Perempuan' })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      placeholder="Kota/Kabupaten tempat lahir"
                      value={formData.tempat_lahir}
                      onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                      required
                    />
                    {/* <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      📅 Format: DD/MM/YYYY. Usia akan dikalkulasi otomatis dari tanggal lahir.
                    </p> */}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Status Perkawinan
                    </label>
                    <select
                      value={formData.status_perkawinan}
                      onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value as typeof formData.status_perkawinan })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Agama
                    </label>
                    <select
                      value={formData.agama}
                      onChange={(e) => setFormData({ ...formData, agama: e.target.value as typeof formData.agama })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Hubungan Keluarga
                    </label>
                    <select
                      value={formData.hubungan_keluarga}
                      onChange={(e) => setFormData({ ...formData, hubungan_keluarga: e.target.value as typeof formData.hubungan_keluarga })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="Kepala Keluarga">Kepala Keluarga</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Cucu">Cucu</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Mertua">Mertua</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Pendidikan Terakhir
                    </label>
                    <select
                      value={formData.pendidikan_terakhir}
                      onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value as typeof formData.pendidikan_terakhir })}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="Tidak Sekolah">Tidak Sekolah</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="Diploma">Diploma</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Data Pekerjaan */}
              <div className="space-y-4">
                <h3 className={`text-sm font-semibold ${textMain} border-b pb-2`}>Data Pekerjaan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>
                      Status Pekerjaan
                    </label>
                    <select
                      value={formData.status_pekerjaan}
                      onChange={(e) => {
                        const newStatus = e.target.value as typeof formData.status_pekerjaan;
                        setFormData({ ...formData, status_pekerjaan: newStatus, pekerjaan: newStatus !== 'Bekerja' ? '' : formData.pekerjaan });
                      }}
                      className={`border rounded px-3 py-2 w-full ${inputBg}`}
                    >
                      <option value="Bekerja">Bekerja</option>
                      <option value="Tidak Bekerja">Tidak Bekerja</option>
                      <option value="Sekolah">Sekolah</option>
                      <option value="Mengurus Rumah Tangga">Mengurus Rumah Tangga</option>
                    </select>
                  </div>

                  {formData.status_pekerjaan === 'Bekerja' && (
                    <div>
                      <label className={`block text-sm font-medium ${textMain} mb-2`}>
                        Pekerjaan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.pekerjaan}
                        onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                        className={`border rounded px-3 py-2 w-full ${inputBg}`}
                        required
                      >
                        <option value="">-- Pilih Pekerjaan --</option>
                        {pekerjaanList.map((pekerjaan) => (
                          <option key={pekerjaan.id} value={pekerjaan.nama_pekerjaan}>
                            {pekerjaan.nama_pekerjaan}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                  {editingId ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search and Download */}
        <div className={`rounded-lg p-4 shadow mb-6 ${cardBg} border`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <FiSearch className={isDark ? 'text-gray-500' : 'text-gray-400'} />
              <input
                type="text"
                placeholder="Cari NIK atau Nama..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`flex-1 outline-none bg-transparent ${textMain}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadExcel}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDark
                    ? 'bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 hover:shadow-lg'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:shadow-md'
                  }`}
              >
                <FiDownload className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDark
                    ? 'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 hover:shadow-lg'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:shadow-md'
                  }`}
              >
                <FiDownload className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GroupedTable<Penduduk>
              columns={columns}
              data={data}
              isDark={isDark}
              isLoading={loading}
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={(newPage) => setPage(newPage)}
              groupByKey="kartu_keluarga_id"
              groupByLabel="No. KK"
              groupLabelFn={(id) => kaKKList.find(kk => kk.id === id)?.no_kk || id}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
