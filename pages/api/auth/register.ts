import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    userId?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RegisterResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { name, email, phone, password }: RegisterRequest = req.body;
        console.log('📝 [REGISTER] Request diterima:', { name, email, phone });

        // Validation
        if (!name || !email || !phone || !password) {
            console.error('❌ [REGISTER] Validasi gagal: Data tidak lengkap');
            return res.status(400).json({ success: false, message: 'Data tidak lengkap!' });
        }

        if (password.length < 6) {
            console.error('❌ [REGISTER] Validasi gagal: Password < 6 karakter');
            return res.status(400).json({ success: false, message: 'Password minimal 6 karakter!' });
        }

        if (!supabase) {
            console.error('❌ [REGISTER] Supabase tidak dikonfigurasi');
            return res.status(500).json({ success: false, message: 'Supabase belum dikonfigurasi' });
        }

        // Check if email already exists
        console.log('🔍 [REGISTER] Mengecek email di database...');
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ [REGISTER] Error saat cek email:', checkError);
        }

        if (existingUser) {
            console.error('❌ [REGISTER] Email sudah terdaftar:', email);
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
        }

        // Generate UUID for user
        console.log('🔑 [REGISTER] Generate UUID untuk user baru...');
        const userId = randomUUID();

        // Hash password with bcryptjs
        console.log('🔐 [REGISTER] Hashing password...');
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user directly ke custom users table
        console.log('👤 [REGISTER] Insert user ke table users...');
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                name: name,
                email: email.toLowerCase(),
                phone: phone,
                password_hash: passwordHash,
                role: 'user',
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ [REGISTER] Error insert user:', insertError);
            return res.status(500).json({ success: false, message: 'Gagal membuat akun! ' + insertError.message });
        }

        console.log('✅ [REGISTER] User berhasil terdaftar:', newUser.id);
        return res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Silakan login.',
            userId: newUser.id,
        });
    } catch (error) {
        console.error('❌ [REGISTER] Error tidak tertangani:', error);
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
