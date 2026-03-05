// API endpoint untuk Penduduk CRUD
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Penduduk, PendudukForm, ApiResponse, PaginatedResponse } from '@/interface/pendataan';
import { getAuthUser, isAdmin } from '@/lib/api-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Penduduk> | PaginatedResponse<Penduduk>>
) {
  // Get authenticated user
  const authUser = await getAuthUser(req);
  
  if (!authUser) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please login first',
      data: [],
      page: 1,
      limit: 10,
      total: 0,
    } as any);
  }

  const userIsAdmin = isAdmin(authUser);

  // GET - List Penduduk dengan pagination, filter & search
  if (req.method === 'GET') {
    try {
      const {
        page = 1,
        limit = 10,
        kk_id,
        jenis_kelamin,
        status_ktp,
        pekerjaan,
        search,
      } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const offset = (pageNum - 1) * limitNum;

      console.log(`👥 Fetching Penduduk... Page: ${pageNum}, Limit: ${limitNum}, User: ${authUser.email}, Role: ${authUser.role}`);

      let query = supabase.from('penduduk').select('*', { count: 'exact' });

      // User biasa hanya bisa lihat data yang dia buat
      if (!userIsAdmin) {
        query = query.eq('created_by', authUser.id);
        console.log(`🔒 Filtering by created_by: ${authUser.id}`);
      }

      // Filter untuk Kartu Keluarga
      if (kk_id && kk_id !== '') {
        query = query.eq('kartu_keluarga_id', kk_id);
        console.log(`🔍 Filter KK ID: ${kk_id}`);
      }

      // Filter untuk jenis kelamin
      if (jenis_kelamin && jenis_kelamin !== '') {
        query = query.eq('jenis_kelamin', jenis_kelamin);
        console.log(`🔍 Filter Gender: ${jenis_kelamin}`);
      }

      // Filter untuk status KTP
      if (status_ktp && status_ktp !== '') {
        query = query.eq('status_ktp', status_ktp);
        console.log(`🔍 Filter Status KTP: ${status_ktp}`);
      }

      // Filter untuk pekerjaan
      if (pekerjaan && pekerjaan !== '') {
        query = query.eq('pekerjaan', pekerjaan);
        console.log(`🔍 Filter Pekerjaan: ${pekerjaan}`);
      }

      // Search untuk nama atau NIK
      if (search && search !== '') {
        const searchValue = `%${search}%`;
        query = query.or(`nama_lengkap.ilike.${searchValue},nik.ilike.${searchValue}`);
        console.log(`🔍 Search: ${search}`);
      }

      // Apply pagination & sorting
      query = query.order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching Penduduk:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} Penduduk, Total: ${count}`);

      return res.status(200).json({
        success: true,
        message: 'Penduduk retrieved successfully',
        data: data as Penduduk[],
        page: pageNum,
        limit: limitNum,
        total: count || 0,
      });
    } catch (error: any) {
      console.error('🔴 Penduduk list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch Penduduk',
        data: [],
        page: 1,
        limit: 10,
        total: 0,
      });
    }
  }

  // POST - Buat Penduduk baru
  if (req.method === 'POST') {
    try {
      const form: PendudukForm = req.body;

      // Validasi
      const required = ['nama_lengkap', 'jenis_kelamin', 'tanggal_lahir', 'hubungan_keluarga', 'status_ktp', 'kartu_keluarga_id'];
      const missing = required.filter((field) => !form[field as keyof PendudukForm]);

      if (missing.length > 0) {
        console.warn('⚠️ Missing required fields:', missing);
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missing.join(', ')}`,
        });
      }

      console.log('📝 Creating new Penduduk:', form.nik, 'by user:', authUser.email);

      // Check if Penduduk already exists
      const { data: existing } = await supabase
        .from('penduduk')
        .select('id')
        .eq('nik', form.nik)
        .single();

      if (existing) {
        console.warn('⚠️ Penduduk already exists:', form.nik);
        return res.status(400).json({
          success: false,
          message: `Penduduk dengan NIK ${form.nik} sudah terdaftar`,
        });
      }

      // // Validate KTP requirement
      // if (form.status_ktp !== 'Belum KTP' && !form.no_ktp) {
      //   console.warn('⚠️ KTP number required for non-Belum KTP status');
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Nomor KTP harus diisi jika status KTP bukan "Belum KTP"',
      //   });
      // }

      const { data: newPenduduk, error: insertError } = await supabase
        .from('penduduk')
        .insert({
          ...form,
          created_by: authUser.id, // Set created_by to current user
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting Penduduk:', insertError);
        throw insertError;
      }

      console.log('✅ Penduduk created successfully:', newPenduduk.id);

      return res.status(201).json({
        success: true,
        message: 'Penduduk created successfully',
        data: newPenduduk as Penduduk,
      });
    } catch (error: any) {
      console.error('🔴 Penduduk create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create Penduduk',
        error: error.message,
      });
    }
  }

  // PUT - Update Penduduk
  if (req.method === 'PUT') {
    try {
      const { id, ...form } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID is required for update',
        });
      }

      console.log('📝 Updating Penduduk:', id, 'by user:', authUser.email);

      // Check if Penduduk exists and user has permission
      const { data: existingPenduduk, error: checkError } = await supabase
        .from('penduduk')
        .select('created_by')
        .eq('id', id)
        .single();

      if (checkError || !existingPenduduk) {
        return res.status(404).json({
          success: false,
          message: 'Penduduk tidak ditemukan',
        });
      }

      // User biasa hanya bisa update data mereka sendiri
      if (!userIsAdmin && existingPenduduk.created_by !== authUser.id) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengubah data ini',
        });
      }

      const { data: updated, error: updateError } = await supabase
        .from('penduduk')
        .update(form)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating Penduduk:', updateError);
        throw updateError;
      }

      console.log('✅ Penduduk updated successfully:', id);

      return res.status(200).json({
        success: true,
        message: 'Penduduk updated successfully',
        data: updated as Penduduk,
      });
    } catch (error: any) {
      console.error('🔴 Penduduk update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update Penduduk',
        error: error.message,
      });
    }
  }

  // DELETE - Hapus Penduduk
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID is required for delete',
        });
      }

      console.log('🗑️ Deleting Penduduk:', id, 'by user:', authUser.email);

      // Check if Penduduk exists and user has permission
      const { data: existingPenduduk, error: checkError } = await supabase
        .from('penduduk')
        .select('created_by')
        .eq('id', id)
        .single();

      if (checkError || !existingPenduduk) {
        return res.status(404).json({
          success: false,
          message: 'Penduduk tidak ditemukan',
        });
      }

      // User biasa hanya bisa delete data mereka sendiri
      if (!userIsAdmin && existingPenduduk.created_by !== authUser.id) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk menghapus data ini',
        });
      }

      const { error: deleteError } = await supabase
        .from('penduduk')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error deleting Penduduk:', deleteError);
        throw deleteError;
      }

      console.log('✅ Penduduk deleted successfully:', id);

      return res.status(200).json({
        success: true,
        message: 'Penduduk deleted successfully',
      });
    } catch (error: any) {
      console.error('🔴 Penduduk delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete Penduduk',
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}
