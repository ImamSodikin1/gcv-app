# 🏘️ Sistem Manajemen Perumahan

Website untuk pendataan ronda, keuangan, dan surat edaran perumahan.

## ✨ Fitur Utama

- **Ronda**: Jadwal dan laporan keamanan perumahan
- **Keuangan**: Pendataan transaksi masuk/keluar perumahan  
- **Surat Edaran**: Informasi dan pengumuman untuk penghuni
- **Dashboard**: Statistik dan overview sistem
- **Sidebar Navigation**: Navigasi intuitif dengan tema modern

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Salin `.env.local.example` ke `.env.local` dan isi dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Lihat [SETUP_GUIDE.md](./SETUP_GUIDE.md) untuk panduan lengkap setup Supabase.

### 3. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000 di browser

## 📁 Project Structure

```
components/
  ├── Sidebar/          # Sidebar navigation
  ├── Navbar/
  └── ...

pages/
  ├── dashboard.tsx     # Dashboard
  ├── ronda/
  │   ├── schedule.tsx  # Jadwal ronda
  │   └── reports.tsx
  ├── keuangan/
  │   ├── transactions.tsx
  │   └── reports.tsx
  ├── surat-edaran/
  │   ├── list.tsx
  │   └── create.tsx
  └── ...

lib/
  └── supabase.ts       # Supabase client

sql/
  └── schema.sql        # Database schema

styles/
  └── globals.css

public/
```

## 🗄️ Database

Project menggunakan **Supabase** (PostgreSQL gratis) dengan schema komprehensif untuk:
- Manajemen pengguna & role
- Jadwal ronda & kehadiran
- Transaksi keuangan
- Surat edaran & dokumen
- Blok & section perumahan

Lihat `sql/schema.sql` untuk detail lengkap.

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: React Icons

## 📦 NPM Scripts

```bash
npm run dev       # Start development server
npm run build     # Build untuk production
npm start         # Start production server
npm run lint      # Run ESLint
```

## 🌐 Deployment ke Vercel

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Setup environment variables di Vercel
4. Deploy!

Lihat [SETUP_GUIDE.md](./SETUP_GUIDE.md#deploy-ke-vercel) untuk detail lengkap.

## 📋 Pages tersedia

| Path | Deskripsi |
|------|-----------|
| `/dashboard` | Dashboard utama |
| `/ronda/schedule` | Jadwal ronda |
| `/ronda/reports` | Laporan ronda |
| `/keuangan/transactions` | Transaksi keuangan |
| `/keuangan/reports` | Laporan keuangan |
| `/surat-edaran/list` | Daftar surat edaran |
| `/surat-edaran/create` | Buat surat edaran |

## 🔐 Security Notes

- ✅ `.env.local` tidak di-commit (lihat `.gitignore`)
- ✅ API keys tersimpan aman di environment variables
- ⚠️ Gunakan password kuat untuk database Supabase
- ⚠️ Review Row Level Security (RLS) di Supabase

## 🛠️ Development

### Menambah halaman baru

1. Buat file di `pages/[section]/[page].tsx`
2. Import components yang diperlukan
3. Query database menggunakan `supabase` client

Contoh:
```tsx
import { supabase } from '@/lib/supabase';

export default function Page() {
  const fetchData = async () => {
    const { data } = await supabase
      .from('financial_transaction')
      .select('*');
    console.log(data);
  };

  return <div>Your content</div>;
}
```

### Styling

Project menggunakan Tailwind CSS + custom gradient theme:
- Primary gradient: `from-blue-400 via-pink-400 to-purple-400`
- Background: `from-[#181926] via-[#231b2e] to-[#2d1e3a]`
- Dark theme dengan glass morphism effect

## 📞 Support & Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 📝 License

Private project for residential management.

---

**Created with ❤️ for residential community management**
