# 📖 User Guide

Panduan lengkap penggunaan Starlink Usage Extractor.

---

## 🎯 Memulai

### Membuka Extension

1. Login ke Starlink Admin Dashboard
2. Navigate ke halaman monitoring/customer list
3. Klik icon extension di toolbar Chrome
4. Popup akan muncul

### Interface Overview

```
┌─────────────────────────────────────┐
│ 🛰️ Starlink Usage Extractor        │
├─────────────────────────────────────┤
│                                     │
│  [ ] Single Page                    │ ← Mode selection
│  [●] Quick List (Batch)             │
│  [ ] Deep Batch                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [ 🚀 Extract Data ]                │ ← Main button
│                                     │
├─────────────────────────────────────┤
│  Progress: ████████░░ 80%           │ ← Progress bar
│  Mengambil: CRT12345...             │   (during extraction)
│                                     │
│  [ ❌ Cancel ]                      │ ← Cancel button
│                                     │
├─────────────────────────────────────┤
│  Preview:                           │
│  • CRT123... : 458 GB / 500 GB     │ ← Data preview
│  • CRT456... : 728 GB / 1000 GB    │
│                                     │
│  [ 📥 Download CSV ]                │ ← Download button
│                                     │
├─────────────────────────────────────┤
│  Last: 30/12/2024 12:00            │ ← Last extraction
└─────────────────────────────────────┘
```

---

## 📄 Mode: Single Page

### Kapan Digunakan
- Ekstrak data SATU pelanggan
- Sudah di halaman detail pelanggan
- Butuh data cepat

### Cara Menggunakan

```
1. Buka halaman detail pelanggan di dashboard
   (URL: .../service-line/SL-XXXXX-XXXXX-XX)
   
2. Klik icon extension
3. Pilih "Single Page"
4. Klik "Extract Data"
5. Preview data akan muncul
6. Klik "Download CSV"
```

### Output Data

| Field | Contoh |
|-------|--------|
| nama_penggilan | CRT24xxxxx - BEI Palu |
| service_line_id | SL-1487967-xxxxx-91 |
| kuota_terpakai_gb | 458 |
| kuota_total_gb | 500 |
| kuota_persentase | 92% |
| paket_layanan | Langganan Lokal Prioritas |
| lokasi | Palu City, Central Sulawesi, Indonesia |

---

## ⚡ Mode: Quick List

### Kapan Digunakan
- Butuh overview cepat semua pelanggan
- Hanya perlu nama dan status
- Tidak perlu detail lengkap

### Cara Menggunakan

```
1. Buka halaman dashboard dengan customer list
2. (Optional) Gunakan search untuk filter
3. Klik icon extension
4. Pilih "Quick List"
5. Klik "Extract Data"
6. Download CSV
```

### Output Data

| Field | Contoh |
|-------|--------|
| nama | CRT24xxxxx - BEI Palu |
| status | Aktif / Alert / Suspended |
| alerts | 0 / 1 / 2 (jumlah alert) |

### Catatan
- Hanya mengambil data yang TERLIHAT di panel
- Untuk list besar, scroll dulu untuk load semua

---

## 🔍 Mode: Deep Batch

### Kapan Digunakan
- Butuh data LENGKAP semua pelanggan
- Membuat laporan bulanan
- Export untuk analisis

### Cara Menggunakan

```
1. Buka halaman dashboard dengan customer list
2. PENTING: Lakukan SEARCH untuk filter data
   (Ini menentukan jumlah yang diproses)
   
3. Klik icon extension
4. Pilih "Deep Batch"
5. Klik "Extract Data"

6. TUNGGU proses selesai:
   - Progress bar akan update
   - Nama item yang sedang diproses terlihat
   - JANGAN intervensi browser
   
7. Setelah selesai, klik "Download CSV"
```

### Progress Indicator

```
Memuat dan mengumpulkan semua item...  → Scrolling list
Memulai batch extraction...             → Starting
Mengambil: CRT123... (1/50)            → Processing
Mengambil: CRT456... (2/50)            → Processing
...
Kembali ke dashboard...                 → Finishing
Sukses! 50 item diekstrak              → Done
```

### Cancel Extraction

Jika perlu membatalkan:
```
1. Klik tombol "Cancel"
2. Proses akan berhenti
3. Data yang sudah didapat bisa di-download
```

### Output Data

Sama seperti Single Page, tapi untuk semua pelanggan.

---

## 📊 Format Output CSV

### Nama File
```
starlink_usage_YYYY-MM-DD.csv
```

### Struktur Deep Batch / Single Page

```csv
no,timestamp,nama_penggilan,service_line_id,kuota_terpakai_gb,kuota_total_gb,kuota_persentase,paket_layanan,lokasi
1,2024-12-30T12:00:00.000Z,"CRT24xxxxx - BEI Palu",SL-14879x67-xxxxx-xx,458,500,92%,"Langganan Lokal Prioritas","Palu City, Central Sulawesi, Indonesia"
2,2024-12-30T12:00:00.000Z,"CRT24xxxxxx - BEI Ambon",SL-1609266-xxxxxx-78,312,500,62%,"Langganan I853J+7C","Kota Ambon, Maluku, Indonesia"
```

### Struktur Quick List

```csv
no,timestamp,nama,status,alerts
1,2024-12-30T12:00:00.000Z,"CRT24xxxxxxx - BEI Palu","Aktif",0
2,2024-12-30T12:00:00.000Z,"CRT2xxxxxxxx - BEI Ambon","Alert",1
```

---

## 💡 Tips & Best Practices

### Sebelum Ekstraksi

✅ **DO:**
- Login terlebih dahulu ke dashboard
- Refresh halaman jika sudah lama idle
- Gunakan filter/search untuk membatasi data
- Pastikan koneksi internet stabil

❌ **DON'T:**
- Jangan switch tab saat Deep Batch berjalan
- Jangan close popup saat proses berjalan
- Jangan refresh halaman saat Deep Batch

### Optimasi Deep Batch

```
UNTUK 10-50 ITEMS:
- Langsung jalankan
- Waktu: ~1-3 menit

UNTUK 50-100 ITEMS:
- Pastikan koneksi stabil
- Waktu: ~5-10 menit

UNTUK 100+ ITEMS:
- Pecah dengan search filter
- Jalankan beberapa batch
- Waktu: ~10-20 menit
```

### Setelah Ekstraksi

1. **Cek data di CSV**
   - Buka dengan Excel/Google Sheets
   - Periksa ada N/A atau error tidak

2. **Backup file**
   - Simpan ke cloud storage
   - Rename dengan tanggal

3. **Hapus data sensitif**
   - Jangan share file tanpa perlu
   - Hapus setelah selesai digunakan

---

## ⚠️ Troubleshooting

### Data tidak terextract (N/A)

**Kemungkinan:**
- Halaman belum fully loaded
- Struktur halaman berbeda

**Solusi:**
```
1. Refresh halaman dashboard
2. Tunggu sampai fully loaded
3. Coba extract ulang
```

### Progress stuck

**Kemungkinan:**
- Koneksi terputus
- Session expired

**Solusi:**
```
1. Klik Cancel
2. Refresh halaman
3. Login ulang jika perlu
4. Jalankan ulang extraction
```

### Jumlah data tidak sesuai

**Kemungkinan:**
- Virtual scroll belum load semua

**Solusi:**
```
1. Scroll manual di panel kiri sampai bawah
2. Baru jalankan extraction
```

---

*Next: [Technical Documentation](./TECHNICAL.md)*
