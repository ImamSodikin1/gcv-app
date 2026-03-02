### 🚀 QUICK START - Instruksi Singkat

#### Langkah 1: Install Dependencies
```bash
npm install
```

#### Langkah 2: Setup Supabase Database (GRATIS)

1. **Pergi ke**: https://supabase.com → Sign Up/Login
2. **Buat Project Baru**:
   - Name: `gcv-residential` (atau nama lainnya)
   - Password: simpan di tempat aman!
   - Region: Singapore atau Asia Pacific
   - Plan: Free tier

3. **Copy API Keys** dari Settings → API:
   - `Project URL` dan `anon public key`

#### Langkah 3: Setup Database Schema

1. Di Supabase, buka **SQL Editor**
2. Klik **New Query**
3. Copy semua ini dari file `sql/schema.sql`
4. Paste dan **Run** (Ctrl+Shift+Enter)

#### Langkah 4: Buat File `.env.local`

Copy dari `.env.local.example` dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Penting**: Jangan di-commit! File ini sudah di `.gitignore`

#### Langkah 5: Jalankan Development Server

```bash
npm run dev
```

Buka: http://localhost:3000/dashboard

---

### 📱 Fitur yang Tersedia

✅ **Sidebar Navigation** - Navigasi ke semua halaman  
✅ **Dashboard** - Overview dengan statistics  
✅ **Ronda** - Jadwal keamanan & laporan  
✅ **Keuangan** - Transaksi masuk/keluar  
✅ **Surat Edaran** - Informasi & pengumuman  

---

### 🌐 Deploy ke Vercel

1. Push kode ke GitHub
2. Pergi ke https://vercel.com
3. Import repository GitHub Anda
4. Setup environment variables (copy dari `.env.local`)
5. Deploy! ✨

---

### 📝 Struktur Pages

| URL | Apa itu |
|-----|--------|
| `/dashboard` | Dashboard utama |
| `/ronda/schedule` | Jadwal ronda |
| `/keuangan/transactions` | Transaksi keuangan |
| `/surat-edaran/list` | Daftar surat edaran |

---

### ⚠️ Common Issues

**Error "Supabase URL not found"?**
- Restart dev server: `npm run dev`
- Check `.env.local` sudah dibuat dengan benar

**Database tidak terbaca?**
- Verify API keys di Supabase Settings
- Check SQL schema sudah ter-run

---

### 📚 Full Documentation

Lihat **SETUP_GUIDE.md** untuk panduan lengkap dan detail lebih lanjut!

---

**Selesai! Mulai development sekarang! 🎉**
