// API endpoint untuk mendapatkan summary statistik dashboard
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SummaryStatistik, DistribusiUsia, ApiResponse } from '@/interface/pendataan';
import { getAuthUser, isAdmin } from '@/lib/api-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface DistribusiPendidikan {
  pendidikan: string;
  jumlah: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ statistik: SummaryStatistik; usia: DistribusiUsia[]; pendidikan: DistribusiPendidikan[] }>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const authUser = await getAuthUser(req);
  
  if (!authUser) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please login first',
    } as any);
  }

  const userIsAdmin = isAdmin(authUser);

  try {
    console.log('📊 Fetching dashboard statistics for user:', authUser.email, 'Role:', authUser.role);

    let stats: SummaryStatistik;
    let usia: DistribusiUsia[];
    let pendidikan: DistribusiPendidikan[];

    if (userIsAdmin) {
      // Admin: query all data directly from tables
      console.log('📊 Admin view: Fetching all statistics...');
      
      // Count total KK
      const { count: kkCount, error: kkError } = await supabase
        .from('kartu_keluarga')
        .select('*', { count: 'exact', head: true });

      if (kkError) throw kkError;

      // Get all penduduk data
      const { data: pendudukData, error: pendudukError } = await supabase
        .from('penduduk')
        .select('jenis_kelamin, status_ktp, status_kk, pendidikan_terakhir, usia_tahun');

      if (pendudukError) throw pendudukError;

      const totalPenduduk = pendudukData?.length || 0;
      const totalLakiLaki = pendudukData?.filter(p => p.jenis_kelamin === 'Laki-laki').length || 0;
      const totalPerempuan = pendudukData?.filter(p => p.jenis_kelamin === 'Perempuan').length || 0;
      const ktpJayaSampurna = pendudukData?.filter(p => p.status_ktp === 'KTP Jaya Sampurna').length || 0;
      const ktpLuarDesa = pendudukData?.filter(p => p.status_ktp === 'KTP Luar Desa').length || 0;
      const kkJayaSampurna = pendudukData?.filter(p => p.status_kk === 'Anggota KK Jaya Sampurna').length || 0;
      const kkLuarDesa = pendudukData?.filter(p => p.status_kk === 'Anggota KK Luar Desa').length || 0;

      stats = {
        total_kk: kkCount || 0,
        total_penduduk: totalPenduduk,
        total_laki_laki: totalLakiLaki,
        total_perempuan: totalPerempuan,
        ktp_jaya_sampurna: ktpJayaSampurna,
        ktp_luar_desa: ktpLuarDesa,
        kk_jaya_sampurna: kkJayaSampurna,
        kk_luar_desa: kkLuarDesa,
      };

      // Distribusi usia
      const usiaMap = new Map<string, number>();
      pendudukData?.forEach(p => {
        let kelompok = '';
        if (p.usia_tahun < 5) kelompok = '0-4';
        else if (p.usia_tahun < 12) kelompok = '5-11';
        else if (p.usia_tahun < 18) kelompok = '12-17';
        else if (p.usia_tahun < 25) kelompok = '18-24';
        else if (p.usia_tahun < 35) kelompok = '25-34';
        else if (p.usia_tahun < 45) kelompok = '35-44';
        else if (p.usia_tahun < 60) kelompok = '45-59';
        else kelompok = '60+';
        
        usiaMap.set(kelompok, (usiaMap.get(kelompok) || 0) + 1);
      });

      usia = Array.from(usiaMap.entries()).map(([kelompok_usia, jumlah]) => ({
        kelompok_usia,
        jumlah
      }));

      // Distribusi pendidikan
      const pendidikanMap = new Map<string, number>();
      pendudukData?.forEach(p => {
        if (p.pendidikan_terakhir) {
          pendidikanMap.set(p.pendidikan_terakhir, (pendidikanMap.get(p.pendidikan_terakhir) || 0) + 1);
        }
      });

      pendidikan = Array.from(pendidikanMap.entries())
        .map(([pendidikan, jumlah]) => ({ pendidikan, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah);
    } else {
      // User biasa: query filtered data by created_by
      console.log('🔒 Fetching data for user ID:', authUser.id);

      // Count KK by user
      const { count: kkCount, error: kkError } = await supabase
        .from('kartu_keluarga')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', authUser.id);

      if (kkError) throw kkError;

      // Get penduduk for user with gender and KTP status
      const { data: pendudukData, error: pendudukError } = await supabase
        .from('penduduk')
        .select('jenis_kelamin, status_ktp, status_kk, pendidikan_terakhir, usia_tahun')
        .eq('created_by', authUser.id);

      if (pendudukError) throw pendudukError;

      const totalPenduduk = pendudukData?.length || 0;
      const totalLakiLaki = pendudukData?.filter(p => p.jenis_kelamin === 'Laki-laki').length || 0;
      const totalPerempuan = pendudukData?.filter(p => p.jenis_kelamin === 'Perempuan').length || 0;
      const ktpJayaSampurna = pendudukData?.filter(p => p.status_ktp === 'KTP Jaya Sampurna').length || 0;
      const ktpLuarDesa = pendudukData?.filter(p => p.status_ktp === 'KTP Luar Desa').length || 0;
      const kkJayaSampurna = pendudukData?.filter(p => p.status_kk === 'Anggota KK Jaya Sampurna').length || 0;
      const kkLuarDesa = pendudukData?.filter(p => p.status_kk === 'Anggota KK Luar Desa').length || 0;

      stats = {
        total_kk: kkCount || 0,
        total_penduduk: totalPenduduk,
        total_laki_laki: totalLakiLaki,
        total_perempuan: totalPerempuan,
        ktp_jaya_sampurna: ktpJayaSampurna,
        ktp_luar_desa: ktpLuarDesa,
        kk_jaya_sampurna: kkJayaSampurna,
        kk_luar_desa: kkLuarDesa,
      };

      // Distribusi usia untuk user
      const usiaMap = new Map<string, number>();
      pendudukData?.forEach(p => {
        let kelompok = '';
        if (p.usia_tahun < 5) kelompok = '0-4';
        else if (p.usia_tahun < 12) kelompok = '5-11';
        else if (p.usia_tahun < 18) kelompok = '12-17';
        else if (p.usia_tahun < 25) kelompok = '18-24';
        else if (p.usia_tahun < 35) kelompok = '25-34';
        else if (p.usia_tahun < 45) kelompok = '35-44';
        else if (p.usia_tahun < 60) kelompok = '45-59';
        else kelompok = '60+';
        
        usiaMap.set(kelompok, (usiaMap.get(kelompok) || 0) + 1);
      });

      usia = Array.from(usiaMap.entries()).map(([kelompok_usia, jumlah]) => ({
        kelompok_usia,
        jumlah
      }));

      // Distribusi pendidikan untuk user
      const pendidikanMap = new Map<string, number>();
      pendudukData?.forEach(p => {
        if (p.pendidikan_terakhir) {
          pendidikanMap.set(p.pendidikan_terakhir, (pendidikanMap.get(p.pendidikan_terakhir) || 0) + 1);
        }
      });

      pendidikan = Array.from(pendidikanMap.entries())
        .map(([pendidikan, jumlah]) => ({ pendidikan, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah);
    }

    console.log('✅ Statistics fetched successfully:', stats);

    return res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        statistik: stats,
        usia: usia,
        pendidikan: pendidikan,
      },
    });
  } catch (error: any) {
    console.error('🔴 Dashboard statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
}
