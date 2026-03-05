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

  const safeGetKkKategoriCounts = async (createdBy?: string) => {
    try {
      let query = supabase.from('kartu_keluarga').select('kategori_kk');
      if (createdBy) query = query.eq('created_by', createdBy);

      const { data, error } = await query;
      if (error) throw error;

      const kkJayaSampurna = data?.filter((k: any) => k.kategori_kk === 'Jaya Sampurna').length || 0;
      const kkLuarDesa = data?.filter((k: any) => k.kategori_kk === 'Luar Desa').length || 0;

      return { kkJayaSampurna, kkLuarDesa };
    } catch (err: any) {
      // Graceful fallback: schema belum punya kolom kategori_kk atau query gagal.
      console.warn('⚠️ Failed to fetch kartu_keluarga.kategori_kk counts:', err?.message || err);
      return { kkJayaSampurna: 0, kkLuarDesa: 0 };
    }
  };

  try {
    console.log('📊 Fetching dashboard statistics for user:', authUser.email, 'Role:', authUser.role);

    const computeAgeStats = (pendudukData?: Array<{ usia_tahun?: number | null }>) => {
      const ages = (pendudukData || [])
        .map((p) => p.usia_tahun)
        .filter((n): n is number => typeof n === 'number' && Number.isFinite(n));

      if (ages.length === 0) {
        return {
          rata_rata_usia: undefined,
          usia_termuda: undefined,
          usia_tertua: undefined,
        };
      }

      let sum = 0;
      let min = ages[0];
      let max = ages[0];

      for (const age of ages) {
        sum += age;
        if (age < min) min = age;
        if (age > max) max = age;
      }

      return {
        rata_rata_usia: sum / ages.length,
        usia_termuda: min,
        usia_tertua: max,
      };
    };

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

      const { kkJayaSampurna, kkLuarDesa } = await safeGetKkKategoriCounts();

      // Get all penduduk data
      const { data: pendudukData, error: pendudukError } = await supabase
        .from('penduduk')
        .select('jenis_kelamin, status_ktp, pendidikan_terakhir, usia_tahun');

      if (pendudukError) throw pendudukError;

      const totalPenduduk = pendudukData?.length || 0;
      const totalLakiLaki = pendudukData?.filter(p => p.jenis_kelamin === 'Laki-laki').length || 0;
      const totalPerempuan = pendudukData?.filter(p => p.jenis_kelamin === 'Perempuan').length || 0;
      const ktpJayaSampurna = pendudukData?.filter(p => p.status_ktp === 'KTP Jaya Sampurna').length || 0;
      const ktpLuarDesa = pendudukData?.filter(p => p.status_ktp === 'KTP Luar Desa').length || 0;

      const { rata_rata_usia, usia_termuda, usia_tertua } = computeAgeStats(pendudukData as any);

      stats = {
        total_kk: kkCount || 0,
        total_penduduk: totalPenduduk,
        total_laki_laki: totalLakiLaki,
        total_perempuan: totalPerempuan,
        ktp_jaya_sampurna: ktpJayaSampurna,
        ktp_luar_desa: ktpLuarDesa,
        kk_jaya_sampurna: kkJayaSampurna,
        kk_luar_desa: kkLuarDesa,
        rata_rata_usia,
        usia_termuda,
        usia_tertua,
      };

      // Distribusi usia - dengan range: 0-5, 6-11, 12-15, 16-20, 21-25, dst (5 tahunan)
      const usiaMap = new Map<string, number>();
      pendudukData?.forEach(p => {
        let kelompok = '';
        if (p.usia_tahun <= 5) kelompok = '0-5';
        else if (p.usia_tahun <= 11) kelompok = '6-11';
        else if (p.usia_tahun <= 15) kelompok = '12-15';
        else if (p.usia_tahun <= 20) kelompok = '16-20';
        else if (p.usia_tahun <= 25) kelompok = '21-25';
        else if (p.usia_tahun <= 30) kelompok = '26-30';
        else if (p.usia_tahun <= 35) kelompok = '31-35';
        else if (p.usia_tahun <= 40) kelompok = '36-40';
        else if (p.usia_tahun <= 45) kelompok = '41-45';
        else if (p.usia_tahun <= 50) kelompok = '46-50';
        else if (p.usia_tahun <= 55) kelompok = '51-55';
        else if (p.usia_tahun <= 60) kelompok = '56-60';
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

      const { kkJayaSampurna, kkLuarDesa } = await safeGetKkKategoriCounts(authUser.id);

      // Get penduduk for user with gender and KTP status
      const { data: pendudukData, error: pendudukError } = await supabase
        .from('penduduk')
        .select('jenis_kelamin, status_ktp, pendidikan_terakhir, usia_tahun')
        .eq('created_by', authUser.id);

      if (pendudukError) throw pendudukError;

      const totalPenduduk = pendudukData?.length || 0;
      const totalLakiLaki = pendudukData?.filter(p => p.jenis_kelamin === 'Laki-laki').length || 0;
      const totalPerempuan = pendudukData?.filter(p => p.jenis_kelamin === 'Perempuan').length || 0;
      const ktpJayaSampurna = pendudukData?.filter(p => p.status_ktp === 'KTP Jaya Sampurna').length || 0;
      const ktpLuarDesa = pendudukData?.filter(p => p.status_ktp === 'KTP Luar Desa').length || 0;

      const { rata_rata_usia, usia_termuda, usia_tertua } = computeAgeStats(pendudukData as any);

      stats = {
        total_kk: kkCount || 0,
        total_penduduk: totalPenduduk,
        total_laki_laki: totalLakiLaki,
        total_perempuan: totalPerempuan,
        ktp_jaya_sampurna: ktpJayaSampurna,
        ktp_luar_desa: ktpLuarDesa,
        kk_jaya_sampurna: kkJayaSampurna,
        kk_luar_desa: kkLuarDesa,
        rata_rata_usia,
        usia_termuda,
        usia_tertua,
      };

      // Distribusi usia untuk user - dengan range: 0-5, 6-11, 12-15, 16-20, 21-25, dst (5 tahunan)
      const usiaMap = new Map<string, number>();
      pendudukData?.forEach(p => {
        let kelompok = '';
        if (p.usia_tahun <= 5) kelompok = '0-5';
        else if (p.usia_tahun <= 11) kelompok = '6-11';
        else if (p.usia_tahun <= 15) kelompok = '12-15';
        else if (p.usia_tahun <= 20) kelompok = '16-20';
        else if (p.usia_tahun <= 25) kelompok = '21-25';
        else if (p.usia_tahun <= 30) kelompok = '26-30';
        else if (p.usia_tahun <= 35) kelompok = '31-35';
        else if (p.usia_tahun <= 40) kelompok = '36-40';
        else if (p.usia_tahun <= 45) kelompok = '41-45';
        else if (p.usia_tahun <= 50) kelompok = '46-50';
        else if (p.usia_tahun <= 55) kelompok = '51-55';
        else if (p.usia_tahun <= 60) kelompok = '56-60';
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
      message: `Failed to fetch statistics${error?.message ? `: ${error.message}` : ''}`,
      error: error.message,
    });
  }
}
