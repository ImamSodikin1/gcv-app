// API endpoint untuk Statistik Pendataan
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser, isAdmin } from '@/lib/api-auth';

interface StatistikResponse {
  success: boolean;
  message?: string;
  data?: {
    kelompokUsia: Array<{ kelompok: string; jumlah: number }>;
    distribusiPekerjaan: Array<{ pekerjaan: string; jumlah: number }>;
    distribusiGender: Array<{ gender: string; jumlah: number }>;
    statusKK: {
      kkJayaSampurna: number;
      kkLuarDesa: number;
      ktpJayaSampurna: number;
      ktpLuarDesa: number;
      belumKTP: number;
    };
    ringkasan: {
      totalPenduduk: number;
      totalKK: number;
    };
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
    console.warn('⚠️ Failed to fetch kartu_keluarga.kategori_kk counts:', err?.message || err);
    return { kkJayaSampurna: 0, kkLuarDesa: 0 };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatistikResponse>
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
    });
  }

  const userIsAdmin = isAdmin(authUser);

  try {
    console.log('📊 Fetching statistik data...');

    // 1. Data untuk Kelompok Usia
    let usiaQuery = supabase
      .from('penduduk')
      .select('usia_tahun');

    if (!userIsAdmin) {
      usiaQuery = usiaQuery.eq('created_by', authUser.id);
    }

    const { data: dataUsia, error: errorUsia } = await usiaQuery;

    if (errorUsia) throw errorUsia;

    // Kelompokkan usia dengan interval: 0-5, 6-11, 12-15, 16-20, 21-25, 26-30, dst (5 tahunan)
    const kelompokUsia = [
      { range: '0-5', min: 0, max: 5 },
      { range: '6-11', min: 6, max: 11 },
      { range: '12-15', min: 12, max: 15 },
      { range: '16-20', min: 16, max: 20 },
      { range: '21-25', min: 21, max: 25 },
      { range: '26-30', min: 26, max: 30 },
      { range: '31-35', min: 31, max: 35 },
      { range: '36-40', min: 36, max: 40 },
      { range: '41-45', min: 41, max: 45 },
      { range: '46-50', min: 46, max: 50 },
      { range: '51-55', min: 51, max: 55 },
      { range: '56-60', min: 56, max: 60 },
      { range: '60+', min: 60, max: 999 },
    ];

    const kelompokUsiaResult = kelompokUsia.map((k) => {
      const jumlah = (dataUsia || []).filter(
        (item) => item.usia_tahun >= k.min && item.usia_tahun <= k.max
      ).length;
      return {
        kelompok: `${k.range} tahun`,
        jumlah,
      };
    });

    // 2. Data untuk Distribusi Pekerjaan
    let pekerjaanQuery = supabase
      .from('penduduk')
      .select('pekerjaan');

    if (!userIsAdmin) {
      pekerjaanQuery = pekerjaanQuery.eq('created_by', authUser.id);
    }

    const { data: dataPekerjaan, error: errorPekerjaan } = await pekerjaanQuery;

    if (errorPekerjaan) throw errorPekerjaan;

    // Kelompokkan pekerjaan
    const pekerjaanMap = new Map<string, number>();
    (dataPekerjaan || []).forEach((item) => {
      const pekerjaan = item.pekerjaan || 'Tidak Diketahui';
      pekerjaanMap.set(pekerjaan, (pekerjaanMap.get(pekerjaan) || 0) + 1);
    });

    const distribusiPekerjaan = Array.from(pekerjaanMap.entries())
      .map(([pekerjaan, jumlah]) => ({
        pekerjaan,
        jumlah,
      }))
      .sort((a, b) => b.jumlah - a.jumlah);

    // 3. Data untuk Distribusi Gender
    let genderQuery = supabase
      .from('penduduk')
      .select('jenis_kelamin');

    if (!userIsAdmin) {
      genderQuery = genderQuery.eq('created_by', authUser.id);
    }

    const { data: dataGender, error: errorGender } = await genderQuery;

    if (errorGender) throw errorGender;

    const genderMap = new Map<string, number>();
    (dataGender || []).forEach((item) => {
      const gender = item.jenis_kelamin || 'Tidak Diketahui';
      genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
    });

    const distribusiGender = Array.from(genderMap.entries()).map(([gender, jumlah]) => ({
      gender,
      jumlah,
    }));

    // 4. Data untuk Status KK & KTP
    let statusQuery = supabase
      .from('penduduk')
      .select('status_ktp');

    if (!userIsAdmin) {
      statusQuery = statusQuery.eq('created_by', authUser.id);
    }

    const { data: dataStatus, error: errorStatus } = await statusQuery;

    if (errorStatus) throw errorStatus;

    const { kkJayaSampurna, kkLuarDesa } = await safeGetKkKategoriCounts(userIsAdmin ? undefined : authUser.id);

    const ktpJayaSampurna = (dataStatus || []).filter(
      (item) => item.status_ktp === 'KTP Jaya Sampurna'
    ).length;

    const ktpLuarDesa = (dataStatus || []).filter(
      (item) => item.status_ktp === 'KTP Luar Desa'
    ).length;

    const belumKTP = (dataStatus || []).filter(
      (item) => item.status_ktp === 'Belum KTP'
    ).length;

    // 5. Ringkasan data
    let ringkasanQuery = supabase.from('penduduk').select('id', { count: 'exact' });

    if (!userIsAdmin) {
      ringkasanQuery = ringkasanQuery.eq('created_by', authUser.id);
    }

    const { count: totalPenduduk, error: errorTotal } = await ringkasanQuery;

    if (errorTotal) throw errorTotal;

    let kkQuery = supabase.from('kartu_keluarga').select('id', { count: 'exact' });

    if (!userIsAdmin) {
      kkQuery = kkQuery.eq('created_by', authUser.id);
    }

    const { count: totalKK, error: errorKK } = await kkQuery;

    if (errorKK) throw errorKK;

    console.log('✅ Statistik data retrieved successfully');

    res.status(200).json({
      success: true,
      data: {
        kelompokUsia: kelompokUsiaResult,
        distribusiPekerjaan,
        distribusiGender,
        statusKK: {
          kkJayaSampurna,
          kkLuarDesa,
          ktpJayaSampurna,
          ktpLuarDesa,
          belumKTP,
        },
        ringkasan: {
          totalPenduduk: totalPenduduk || 0,
          totalKK: totalKK || 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching statistik:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Terjadi kesalahan',
    });
  }
}
