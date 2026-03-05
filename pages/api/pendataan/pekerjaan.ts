// API endpoint untuk Master Pekerjaan CRUD
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Pekerjaan, PekerjaanForm, ApiResponse, PaginatedResponse } from '@/interface/pendataan';
import { getAuthUser, isAdmin } from '@/lib/api-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Pekerjaan> | ApiResponse<Pekerjaan[]> | PaginatedResponse<Pekerjaan>>
) {
  const authUser = await getAuthUser(req);

  if (!authUser) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please login first',
    });
  }

  const userIsAdmin = isAdmin(authUser);

  // GET - List Pekerjaan dengan pagination
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 50, search } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const offset = (pageNum - 1) * limitNum;

      console.log(`📋 Fetching Pekerjaan... Page: ${pageNum}, Limit: ${limitNum}`);

      let query = supabase.from('pekerjaan').select('*', { count: 'exact' });

      // Filter aktif
      query = query.eq('is_active', true);

      // Search
      if (search && search !== '') {
        query = query.ilike('nama_pekerjaan', `%${search}%`);
        console.log(`🔍 Search: ${search}`);
      }

      // Apply pagination & sorting
      query = query.order('nama_pekerjaan', { ascending: true }).range(offset, offset + limitNum - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching Pekerjaan:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} Pekerjaan, Total: ${count}`);

      return res.status(200).json({
        success: true,
        message: 'Data pekerjaan berhasil diambil',
        data: data || [],
        page: pageNum,
        limit: limitNum,
        total: count || 0,
      });
    } catch (error) {
      console.error('❌ Error in GET:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  }

  // POST - Create Pekerjaan
  if (req.method === 'POST') {
    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Only admin can create pekerjaan',
      });
    }

    try {
      const { nama_pekerjaan, keterangan, is_active } = req.body as PekerjaanForm;

      if (!nama_pekerjaan || nama_pekerjaan.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama pekerjaan tidak boleh kosong',
        });
      }

      console.log(`➕ Creating Pekerjaan: ${nama_pekerjaan}`);

      const { data, error } = await supabase
        .from('pekerjaan')
        .insert([
          {
            nama_pekerjaan: nama_pekerjaan.trim(),
            keterangan: keterangan?.trim() || null,
            is_active: is_active !== false,
            created_by: authUser.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Pekerjaan:', error);
        if (error.message.includes('duplicate')) {
          return res.status(400).json({
            success: false,
            message: 'Pekerjaan dengan nama ini sudah ada',
          });
        }
        throw error;
      }

      console.log(`✅ Pekerjaan created: ${data.id}`);

      return res.status(201).json({
        success: true,
        message: 'Pekerjaan berhasil ditambahkan',
        data,
      });
    } catch (error) {
      console.error('❌ Error in POST:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  }

  // PUT - Update Pekerjaan
  if (req.method === 'PUT') {
    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Only admin can update pekerjaan',
      });
    }

    try {
      const { id, nama_pekerjaan, keterangan, is_active } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID pekerjaan diperlukan',
        });
      }

      if (!nama_pekerjaan || nama_pekerjaan.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama pekerjaan tidak boleh kosong',
        });
      }

      console.log(`✏️ Updating Pekerjaan: ${id}`);

      const { data, error } = await supabase
        .from('pekerjaan')
        .update({
          nama_pekerjaan: nama_pekerjaan.trim(),
          keterangan: keterangan?.trim() || null,
          is_active: is_active !== false,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating Pekerjaan:', error);
        throw error;
      }

      console.log(`✅ Pekerjaan updated: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Pekerjaan berhasil diperbarui',
        data,
      });
    } catch (error) {
      console.error('❌ Error in PUT:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  }

  // DELETE - Delete Pekerjaan
  if (req.method === 'DELETE') {
    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Only admin can delete pekerjaan',
      });
    }

    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID pekerjaan diperlukan',
        });
      }

      console.log(`🗑️ Deleting Pekerjaan: ${id}`);

      // Soft delete (set is_active to false)
      const { data, error } = await supabase
        .from('pekerjaan')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deleting Pekerjaan:', error);
        throw error;
      }

      console.log(`✅ Pekerjaan deleted: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Pekerjaan berhasil dihapus',
        data,
      });
    } catch (error) {
      console.error('❌ Error in DELETE:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}
