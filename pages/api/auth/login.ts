import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import * as bcrypt from 'bcryptjs';

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        role: string;
    };
    token?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { email, password }: LoginRequest = req.body;
        console.log('🔑 [LOGIN] Request diterima:', { email });

        if (!email || !password) {
            console.error('❌ [LOGIN] Validasi gagal: Email atau password kosong');
            return res.status(400).json({ success: false, message: 'Email dan password diperlukan!' });
        }

        if (!supabase) {
            console.error('❌ [LOGIN] Supabase tidak dikonfigurasi');
            return res.status(500).json({ success: false, message: 'Supabase belum dikonfigurasi' });
        }

        // Query user dari custom users table
        console.log('👤 [LOGIN] Mencari user di database...');
        const { data: user, error: queryError } = await supabase
            .from('users')
            .select('id, name, email, phone, role, password_hash')
            .eq('email', email.toLowerCase())
            .single();

        if (queryError) {
            console.error('❌ [LOGIN] Error query user:', queryError);
            return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }

        if (!user) {
            console.error('❌ [LOGIN] User tidak ditemukan:', email);
            return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }

        console.log('✅ [LOGIN] User ditemukan:', user.id);

        // Verify password hash
        console.log('🔐 [LOGIN] Memverifikasi password...');
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            console.error('❌ [LOGIN] Password salah untuk user:', email);
            return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }

        console.log('✅ [LOGIN] Password verified');

        // Generate simple token (dapat diganti dengan JWT library jika diperlukan)
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

        console.log('✅ [LOGIN] Login berhasil untuk user:', user.name, '(Role:', user.role + ')');
        return res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            token: token,
        });
    } catch (error) {
        console.error('❌ [LOGIN] Error tidak tertangani:', error);
        if (error instanceof Error) {
            console.error('   Pesan error:', error.message);
            console.error('   Stack:', error.stack);
        }
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
}
