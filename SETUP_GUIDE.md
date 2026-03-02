# Panduan Setup Sistem Manajemen Perumahan

## 📋 Daftar Isi
1. [Setup Awal](#setup-awal)
2. [Setup Database (Supabase)](#setup-database-supabase)
3. [Setup Project](#setup-project)
4. [Deploy ke Vercel](#deploy-ke-vercel)

---

## Setup Awal

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### 1. Clone & Install Dependencies

```bash
cd d:\IMAM\Project\gcv-app\gcv-app

# Install dependencies
npm install
# atau
yarn install
```

### 2. Install Supabase Client

```bash
npm install @supabase/supabase-js
# atau
yarn add @supabase/supabase-js
```

---

## Setup Database (Supabase)

### 1. Buat Akun Supabase

1. Pergi ke [supabase.com](https://supabase.com)
2. Klik "Sign Up" atau "Create a new project"
3. Buat akun menggunakan email atau GitHub/Google
4. Setelah login, klik "New Project"

### 2. Buat Project Baru

- **Project Name**: `gcv-residential` (atau nama pilihan Anda)
- **Database Password**: Gunakan password yang kuat (simpan di tempat aman!)
- **Region**: Pilih region terdekat (misal: Singapore atau Asia Pacific)
- **Pricing Plan**: Free tier sudah cukup untuk development

### 3. Ambil API Keys

Di dashboard Supabase Anda:

1. Buka project yang baru dibuat
2. Klik menu "Settings" → "API"
3. Copy nilai berikut:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Setup Database Schema

1. Di Supabase dashboard, buka "SQL Editor"
2. Klik "New Query"
3. Copy semua kode dari file `sql/schema.sql`
4. Paste ke SQL Editor
5. Klik "Run" atau tekan Ctrl+Shift+Enter

Tunggu hingga selesai. Anda akan melihat pesan success.

### 5. Konfigurasi Environment Variables

1. Buka file `.env.local.example` dan copy isinya
2. Buat file baru `.env.local` di root project
3. Isi dengan nilai-nilai berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres
```

**PENTING**: 
- Jangan commit `.env.local` ke git!
- `.env.local` sudah di `.gitignore`

---

## Setup Project

### 1. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Test Koneksi Database

Buka halaman dashboard di browser:
```
http://localhost:3000/dashboard
```

Jika halaman terbuka tanpa error, berarti setup berhasil!

---

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial setup for residential management system"
git push origin main
```

### 2. Deploy ke Vercel

1. Pergi ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import repository GitHub Anda
4. Konfigurasi:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)

### 3. Setup Environment Variables di Vercel

1. Di halaman project Vercel, buka "Settings" → "Environment Variables"
2. Tambahkan:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   ```
3. Klik "Save"

### 4. Deploy

1. Klik "Deploy"
2. Tunggu hingga proses selesai
3. Akses aplikasi di URL yang disediakan Vercel (biasanya `your-project.vercel.app`)

---

## 📁 Struktur Project

```
gcv-app/
├── components/
│   ├── Sidebar/           # Komponen sidebar
│   ├── Navbar/
│   └── ...
├── pages/
│   ├── dashboard.tsx      # Halaman dashboard
│   ├── ronda/             # Halaman manajemen ronda
│   ├── keuangan/          # Halaman manajemen keuangan
│   ├── surat-edaran/      # Halaman manajemen surat edaran
│   └── ...
├── lib/
│   └── supabase.ts        # Konfigurasi Supabase
├── sql/
│   └── schema.sql         # Database schema
├── public/
├── styles/
├── .env.local             # Environment variables (jangan di-commit!)
└── package.json
```

---

## 🔧 Fitur yang Sudah Disetup

✅ Sidebar dengan styling sesuai tema  
✅ Dashboard dengan statistics cards  
✅ Database schema untuk Ronda, Keuangan, dan Surat Edaran  
✅ Supabase integration  
✅ Vercel deployment ready  

---

## ⚙️ Next Steps

### Untuk Membuat Halaman Baru:

1. Buat file di `pages/[section]/[page].tsx`
2. Import components yang diperlukan
3. Gunakan `supabase` client dari `lib/supabase.ts` untuk query database

**Contoh**:
```tsx
import { supabase } from '@/lib/supabase';

export default function Page() {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('financial_transaction')
      .select('*');
    
    if (error) console.error(error);
    else console.log(data);
  };

  return <div>Your content</div>;
}
```

### Untuk Menambah API Routes:

1. Buat file di `pages/api/[endpoint].ts`
2. Gunakan Supabase client atau direct database connection

---

## 🐛 Troubleshooting

### Error: "Supabase URL dan Key tidak ditemukan"
- Pastikan `.env.local` sudah dibuat
- Restart dev server setelah update `.env.local`

### Database tidak terbaca
- Cek koneksi internet
- Verify API keys di `.env.local`
- Cek Security Policies di Supabase dashboard

### Deployment di Vercel gagal
1. Cek logs di Vercel dashboard
2. Pastikan environment variables sudah ter-setup
3. Pastikan `next.config.ts` valid

---

## 📞 Support

Jika ada pertanyaan atau masalah, silahkan:
1. Cek error message di console
2. Refer ke [Supabase Documentation](https://supabase.com/docs)
3. Refer ke [Next.js Documentation](https://nextjs.org/docs)

---

## 📝 Catatan Penting

- **Security**: Jangan pernah share API keys atau commit `.env.local`
- **Free Tier**: Supabase free tier memiliki beberapa batasan, tapi cukup untuk development
- **Backup**: Selalu backup data database Anda secara berkala
- **Version Control**: Selalu commit kode Anda ke Git untuk tracking changes

---

**Selamat! Setup sudah selesai. Silahkan lanjutkan development! 🚀**
