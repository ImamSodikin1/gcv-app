// API endpoint untuk Kartu Keluarga CRUD
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { KartuKeluarga, KartuKeluargaForm, ApiResponse, PaginatedResponse } from '@/interface/pendataan';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<KartuKeluarga> | PaginatedResponse<KartuKeluarga>>
) {
  // GET - List semua Kartu Keluarga dengan pagination & filter
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, rt, rw, search } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const offset = (pageNum - 1) * limitNum;

      console.log(`📋 Fetching KK... Page: ${pageNum}, Limit: ${limitNum}`);

      let query = supabase.from('kartu_keluarga').select('*', { count: 'exact' });

      // Filter untuk RT
      if (rt && rt !== '') {
        query = query.eq('rt', rt);
        console.log(`🔍 Filter RT: ${rt}`);
      }

      // Filter untuk RW
      if (rw && rw !== '') {
        query = query.eq('rw', rw);
        console.log(`🔍 Filter RW: ${rw}`);
      }

      // Search untuk no_kk atau alamat
      if (search && search !== '') {
        const searchValue = `%${search}%`;
        query = query.or(`no_kk.ilike.${searchValue},alamat.ilike.${searchValue}`);
        console.log(`🔍 Search: ${search}`);
      }

      // Apply pagination
      query = query.order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching KK:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} KK, Total: ${count}`);

      return res.status(200).json({
        success: true,
        message: 'Kartu Keluarga retrieved successfully',
        data: data as KartuKeluarga[],
        page: pageNum,
        limit: limitNum,
        total: count || 0,
      });
    } catch (error: any) {
      console.error('🔴 KK list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch Kartu Keluarga',
        data: [],
        page: 1,
        limit: 10,
        total: 0,
      });
    }
  }

  // POST - Buat Kartu Keluarga baru
  if (req.method === 'POST') {
    try {
      const form: KartuKeluargaForm = req.body;

      // Validasi
      if (!form.no_kk || !form.rt || !form.rw || !form.alamat || !form.nama_kepala_keluarga) {
        console.warn('⚠️ Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: no_kk, rt, rw, alamat, nama_kepala_keluarga',
        });
      }

      console.log('📝 Creating new KK:', form.no_kk);

      // Check if KK already exists
      const { data: existing } = await supabase
        .from('kartu_keluarga')
        .select('id')
        .eq('no_kk', form.no_kk)
        .single();

      if (existing) {
        console.warn('⚠️ KK already exists:', form.no_kk);
        return res.status(400).json({
          success: false,
          message: `Kartu Keluarga dengan no_kk ${form.no_kk} sudah terdaftar`,
        });
      }

      const { data: newKK, error: insertError } = await supabase
        .from('kartu_keluarga')
        .insert({
          ...form,
          status_kk: form.status_kk || 'aktif',
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting KK:', insertError);
        throw insertError;
      }

      console.log('✅ KK created successfully:', newKK.id);

      return res.status(201).json({
        success: true,
        message: 'Kartu Keluarga created successfully',
        data: newKK as KartuKeluarga,
      });
    } catch (error: any) {
      console.error('🔴 KK create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create Kartu Keluarga',
        error: error.message,
      });
    }
  }

  // PUT - Update Kartu Keluarga
  if (req.method === 'PUT') {
    try {
      const { id, ...form } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID is required for update',
        });
      }

      console.log('📝 Updating KK:', id);

      const { data: updated, error: updateError } = await supabase
        .from('kartu_keluarga')
        .update(form)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating KK:', updateError);
        throw updateError;
      }

      console.log('✅ KK updated successfully:', id);

      return res.status(200).json({
        success: true,
        message: 'Kartu Keluarga updated successfully',
        data: updated as KartuKeluarga,
      });
    } catch (error: any) {
      console.error('🔴 KK update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update Kartu Keluarga',
        error: error.message,
      });
    }
  }

  // DELETE - Hapus Kartu Keluarga
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID is required for delete',
        });
      }

      console.log('🗑️ Deleting KK:', id);

      // Check if there are any anggota in this KK
      const { data: members } = await supabase
        .from('penduduk')
        .select('id')
        .eq('kartu_keluarga_id', id);

      if (members && members.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus KK yang masih memiliki anggota keluarga',
        });
      }

      const { error: deleteError } = await supabase
        .from('kartu_keluarga')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error deleting KK:', deleteError);
        throw deleteError;
      }

      console.log('✅ KK deleted successfully:', id);

      return res.status(200).json({
        success: true,
        message: 'Kartu Keluarga deleted successfully',
      });
    } catch (error: any) {
      console.error('🔴 KK delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete Kartu Keluarga',
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}
