// API endpoint untuk mendapatkan summary statistik dashboard
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SummaryStatistik, DistribusiUsia, DistribusiPekerjaan, ApiResponse } from '@/interface/pendataan';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ statistik: SummaryStatistik; usia: DistribusiUsia[]; pekerjaan: DistribusiPekerjaan[] }>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    console.log('📊 Fetching dashboard statistics...');

    // Ambil dari view yang sudah dibuat
    const { data: statistik, error: statsError } = await supabase
      .from('vw_summary_statistik')
      .select('metric, value');

    if (statsError) {
      console.error('❌ Error fetching statistics:', statsError);
      throw statsError;
    }

    // Ambil distribusi usia
    const { data: usia, error: usiaError } = await supabase
      .from('vw_distribusi_usia')
      .select('kelompok_usia, jumlah');

    if (usiaError) {
      console.error('❌ Error fetching usia:', usiaError);
      throw usiaError;
    }

    // Ambil distribusi pekerjaan
    const { data: pekerjaan, error: pekerjaanError } = await supabase
      .from('vw_distribusi_pekerjaan')
      .select('pekerjaan, jumlah');

    if (pekerjaanError) {
      console.error('❌ Error fetching pekerjaan:', pekerjaanError);
      throw pekerjaanError;
    }

    // Transform statistik dari array ke object
    const stats: SummaryStatistik = {
      total_kk: 0,
      total_penduduk: 0,
      total_laki_laki: 0,
      total_perempuan: 0,
      ktp_jaya_sampurna: 0,
      ktp_luar_desa: 0,
      kk_jaya_sampurna: 0,
      kk_luar_desa: 0,
    };

    if (statistik) {
      statistik.forEach((item: any) => {
        const key = item.metric as keyof SummaryStatistik;
        stats[key] = parseInt(item.value) || 0;
      });
    }

    console.log('✅ Statistics fetched successfully:', stats);

    return res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        statistik: stats,
        usia: usia as DistribusiUsia[],
        pekerjaan: pekerjaan as DistribusiPekerjaan[],
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
