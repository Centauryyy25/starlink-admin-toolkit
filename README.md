# 🛰️ Starlink Usage Extractor

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-Active%20Development-orange.svg)

**Chrome Extension untuk mengekstrak data penggunaan dari Starlink Admin Dashboard**

[📖 Documentation](#-dokumentasi) • [🚀 Installation](#-instalasi) • [💡 Features](#-fitur-utama) • [🐛 Issues](#-known-issues--limitations)

</div>

---

## 📋 Daftar Isi

- [Pendahuluan](#-pendahuluan)
- [Rumusan Masalah](#-rumusan-masalah)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur](#-arsitektur)
- [Instalasi](#-instalasi)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Keamanan & Privasi](#-keamanan--privasi)
- [Kelebihan & Kekurangan](#-kelebihan--kekurangan)
- [Known Issues](#-known-issues--limitations)
- [Kontribusi](#-kontribusi--bug-report)

---

## 📌 Pendahuluan

**Starlink Usage Extractor** adalah Chrome Extension yang dirancang khusus untuk membantu administrator dan reseller Starlink dalam mengekstrak data penggunaan pelanggan dari dashboard admin Starlink secara efisien.

Extension ini memungkinkan ekstraksi data dalam jumlah besar (batch) tanpa perlu menyalin data satu per satu secara manual, menghemat waktu dan mengurangi risiko kesalahan human error.

### Target Pengguna
- 🏢 **Reseller Starlink** - Monitoring penggunaan pelanggan
- 👨‍💼 **Admin ISP** - Reporting bulanan
- 🤫 **EOS BSI** - Reporting Per 3 jam

---

## ❓ Rumusan Masalah

### Latar Belakang
Dashboard admin Starlink tidak menyediakan fitur export data penggunaan pelanggan ke format spreadsheet. Hal ini menyulitkan administrator yang mengelola banyak pelanggan untuk:

1. **Membuat laporan bulanan** - Harus copy-paste satu per satu
2. **Monitoring kuota** - Tidak ada overview kuota semua pelanggan
3. **Analisis data** - Data tidak bisa diolah di Excel/Google Sheets
4. **Backup data** - Tidak ada cara export data pelanggan

### Masalah yang Diselesaikan

| Masalah | Solusi |
|---------|--------|
| Copy-paste manual data satu per satu | Batch extraction otomatis |
| Tidak ada export ke CSV/Excel | Download langsung ke CSV |
| Waktu lama untuk banyak pelanggan | Proses paralel dengan progress tracking |
| Tidak ada overview semua pelanggan | Quick list mode untuk overview cepat |

---

## ✨ Fitur Utama

### 🎯 Tiga Mode Ekstraksi

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTRACTION MODES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   📄 SINGLE        ⚡ QUICK LIST      🔍 DEEP BATCH        │
│   ─────────        ───────────        ───────────          │
│   1 halaman        List panel         Semua detail         │
│   Detail lengkap   Nama + Status      Per pelanggan        │
│   ~2 detik         ~1 detik           ~3-5 detik/item      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Data yang Diekstrak

| Field | Deskripsi | Contoh |
|-------|-----------|--------|
| `nama_penggilan` | Nama pelanggan (CRT ID) | Cabangxxxx - xxx xxxx |
| `service_line_id` | ID Service Line | SL-1487967-51585-91 |
| `kuota_terpakai_gb` | Kuota yang sudah digunakan | 728 |
| `kuota_total_gb` | Total kuota bulanan | 1000 |
| `kuota_persentase` | Persentase penggunaan | 73% |
| `paket_layanan` | Jenis langganan | Langganan Lokal Prioritas |
| `lokasi` | Lokasi layanan | Palu City, Sulawesi, Indonesia |

### 🚀 Fitur Tambahan
- ✅ Progress bar real-time
- ✅ Cancel extraction kapan saja
- ✅ Preview data sebelum download
- ✅ Timestamp otomatis di CSV
- ✅ Handling Angular Virtual Scroll
- ✅ Retry mechanism untuk loading lambat

---

## 🏗️ Arsitektur

### Diagram Komponen

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────┐         ┌──────────────────────────┐    │
│   │   POPUP.HTML     │         │   STARLINK DASHBOARD      │    │
│   │   ─────────────  │         │   ──────────────────────  │    │
│   │   • UI Controls  │         │   • Customer List         │    │
│   │   • Mode Select  │◄───────►│   • Detail Pages          │    │
│   │   • Progress Bar │         │   • Usage Data            │    │
│   └────────┬─────────┘         └────────────▲─────────────┘    │
│            │                                 │                   │
│            │ chrome.scripting               │ DOM Parsing       │
│            │                                 │                   │
│            ▼                                 │                   │
│   ┌──────────────────┐         ┌────────────┴─────────────┐    │
│   │   POPUP.JS       │         │   CONTENT.JS              │    │
│   │   ─────────────  │         │   ──────────────────────  │    │
│   │   • Extraction   │────────►│   • Parse Nama            │    │
│   │     Logic        │ inject  │   • Parse Kuota           │    │
│   │   • CSV Generate │◄────────│   • Parse Lokasi          │    │
│   │   • Tab Control  │  data   │   • Regex Patterns        │    │
│   └──────────────────┘         └──────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼
                    ┌──────────────────┐
                    │   OUTPUT: CSV    │
                    │   ────────────── │
                    │   starlink_      │
                    │   usage_YYYY-    │
                    │   MM-DD.csv      │
                    └──────────────────┘
```

### File Structure

```
starlink-usage-extractor/
├── manifest.json        # Chrome Extension manifest (v3)
├── popup.html          # Extension popup UI
├── popup.css           # Styling dengan gradients
├── popup.js            # Main logic & orchestration
├── content.js          # DOM parsing & data extraction
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── documentation/      # Dokumentasi project
│   └── ...
└── README.md           # File ini
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Extension API | Chrome Extension Manifest V3 |
| UI | HTML5 + CSS3 (Vanilla) |
| Logic | JavaScript ES6+ |
| DOM Parsing | Regex + QuerySelector |
| Data Export | CSV (RFC 4180) |

---

## 🚀 Instalasi

### Persyaratan
- Google Chrome versi 88+
- Akses ke Starlink Admin Dashboard

### Langkah Instalasi

#### 1. Download Extension

```bash
# Clone dari repository
git clone https://github.com/Centauryyy25/starlink-admin-toolkit

# ATAU download ZIP dan extract
```

#### 2. Load ke Chrome

1. Buka Chrome, ketik `chrome://extensions/` di address bar
2. Aktifkan **Developer mode** (toggle di kanan atas)
3. Klik tombol **Load unpacked**
4. Pilih folder project `starlink-usage-extractor`
5. Extension akan muncul di toolbar

#### 3. Pin Extension (Opsional)

1. Klik icon puzzle 🧩 di toolbar Chrome
2. Klik pin 📌 di samping "Starlink Usage Extractor"
3. Icon extension akan selalu terlihat di toolbar

### Update Extension

Setelah update code:
1. Buka `chrome://extensions/`
2. Klik tombol refresh 🔄 pada extension card
3. Atau klik "Reload" jika ada error

---

## 📖 Panduan Penggunaan

### Quick Start

```
1. Login ke Starlink Admin Dashboard
2. Buka halaman monitoring/customer list
3. Klik icon extension di toolbar
4. Pilih mode ekstraksi
5. Klik "Extract Data"
6. Download CSV
```

### Mode Single Page
**Use case:** Ekstrak detail satu pelanggan yang sedang dibuka

1. Buka halaman detail pelanggan di dashboard
2. Klik extension → Pilih "Single Page"
3. Klik "Extract Data"
4. Preview data → Download CSV

### Mode Quick List
**Use case:** Dapatkan daftar nama + status dari panel kiri

1. Buka dashboard dengan customer list di panel kiri
2. Lakukan search jika perlu
3. Klik extension → Pilih "Quick List"
4. Klik "Extract Data"
5. Download CSV (berisi nama dan status saja)

### Mode Deep Batch
**Use case:** Ekstrak detail lengkap semua pelanggan

1. Buka dashboard dengan customer list
2. **PENTING:** Lakukan search terlebih dahulu untuk filter data
3. Klik extension → Pilih "Deep Batch"
4. Klik "Extract Data"
5. Tunggu proses (progress bar akan tampil)
6. Bisa klik "Cancel" jika ingin berhenti
7. Download CSV setelah selesai

> ⚠️ **Catatan:** Deep Batch akan navigate ke setiap halaman pelanggan. Jangan intervensi browser selama proses berjalan.

---

## 🔒 Keamanan & Privasi

### Transparansi Keamanan

| Aspek | Status | Penjelasan |
|-------|--------|------------|
| Data Storage | ✅ Aman | Tidak ada data disimpan permanen |
| External Request | ✅ Aman | Tidak ada request ke server eksternal |
| Credential Access | ✅ Aman | Extension tidak mengakses password |
| Data Transmission | ✅ Aman | Data hanya di-export ke file lokal |

### Permissions yang Digunakan

```json
{
  "permissions": [
    "activeTab",        // Akses tab yang aktif saja
    "scripting",        // Inject content script
    "storage"           // Simpan timestamp terakhir
  ],
  "host_permissions": [
    "https://www.starlink.com/*"  // Hanya domain Starlink
  ]
}
```

### Data Privacy

- ❌ TIDAK mengirim data ke server manapun
- ❌ TIDAK menyimpan data pelanggan
- ❌ TIDAK mengakses cookie/session
- ✅ Semua proses berjalan lokal di browser
- ✅ Data hanya tersimpan dalam file CSV yang di-download

### Saran Keamanan

1. **Jangan share file CSV** yang berisi data pelanggan
2. **Hapus CSV** setelah selesai digunakan
3. **Jangan install** dari sumber tidak terpercaya
4. **Review code** sebelum menggunakan

---

## ⚖️ Kelebihan & Kekurangan

### ✅ Kelebihan

| Fitur | Benefit |
|-------|---------|
| **No Backend Required** | Tidak perlu server, 100% client-side |
| **Fast Extraction** | Single page < 2 detik |
| **Batch Processing** | Bisa ratusan data sekaligus |
| **Progress Tracking** | Tahu status real-time |
| **Cancelable** | Bisa dibatalkan kapan saja |
| **Offline Export** | CSV di-download langsung |
| **Virtual Scroll Support** | Handle list besar dengan lazy loading |
| **Open Source** | Bisa di-audit dan di-modify |

### ❌ Kekurangan

| Limitasi | Dampak | Workaround |
|----------|--------|------------|
| **Chrome Only** | Tidak support Firefox/Safari | Gunakan Chrome atau Chromium-based browser |
| **DOM Dependent** | Bisa break jika Starlink update UI | Perlu update selector jika berubah |
| **Sequential Processing** | Deep batch agak lambat | Tunggu dengan sabar, gunakan filter search |
| **No Scheduling** | Tidak bisa auto-run terjadwal | Manual trigger diperlukan |
| **Single Tab** | Deep batch occupy 1 tab | Jangan gunakan tab tersebut saat proses |
| **No Historical Data** | Hanya data saat ini | Export berkala untuk historical |

### Perbandingan dengan Metode Manual

| Aspek | Manual Copy-Paste | Extension |
|-------|-------------------|-----------|
| Waktu 100 customer | ~2-3 jam | ~10-15 menit |
| Akurasi | Rawan typo | 100% akurat |
| Format output | Tidak konsisten | CSV terstruktur |
| Scalability | Sangat terbatas | Bisa ratusan data |

---

## 🐛 Known Issues & Limitations

### Bug yang Diketahui

| ID | Issue | Status | Workaround |
|----|-------|--------|------------|
| #001 | Kuota kadang N/A pada mode Deep Batch | 🔄 In Progress | Reload page, coba lagi |
| #002 | Virtual scroll tidak load semua di list sangat besar (500+) | 🔍 Investigating | Gunakan filter search |
| #003 | Nama terpotong jika terlalu panjang | ⚠️ Minor | Check CSV untuk data lengkap |

### Ketergantungan pada Website Starlink

> ⚠️ **PENTING:** Extension ini bergantung pada struktur DOM website Starlink. Jika Starlink mengubah tampilan/struktur halaman, extension mungkin tidak berfungsi dan perlu di-update.

**Selector yang digunakan:**
- `app-dashboard-service-line-row` - Row item pelanggan
- `cdk-virtual-scroll-viewport` - Virtual scroll container
- `a[href*="service-line"]` - Link ke detail page

### Limitasi Website Starlink

| Limitasi | Penjelasan |
|----------|------------|
| No Official API | Starlink tidak menyediakan public API |
| Session Timeout | Login expired setelah beberapa waktu |
| Rate Limiting | Refresh terlalu cepat bisa kena limit |
| Dynamic Content | Konten di-load dengan JavaScript |

---

## 🤝 Kontribusi & Bug Report

### Melaporkan Bug

Jika menemukan bug, silakan:

1. **Buka Console** (F12 → Console tab)
2. **Screenshot error** yang muncul
3. **Catat langkah** reproduce bug
4. **Hubungi developer:**
   - 💬 GitHub Issues: [[Link ke issues](https://github.com/Centauryyy25/starlink-admin-toolkit/issues)]

### Format Bug Report

```markdown
## Bug Report

**Deskripsi:**
[Jelaskan bug secara singkat]

**Langkah Reproduce:**
1. Buka halaman...
2. Klik...
3. Error muncul

**Expected Behavior:**
[Apa yang seharusnya terjadi]

**Actual Behavior:**
[Apa yang sebenarnya terjadi]

**Screenshot/Console Log:**
[Lampirkan jika ada]

**Environment:**
- Chrome Version: 
- OS: 
- Extension Version:
```

### Request Fitur Baru

Ingin fitur baru? Silakan request dengan format:

```markdown
## Feature Request

**Fitur yang diinginkan:**
[Jelaskan fitur]

**Use case:**
[Mengapa fitur ini berguna]

**Prioritas:**
[Low/Medium/High]
```

---

## 📄 Changelog

### v1.0.0 (2024-12-30)
- ✅ Initial release
- ✅ Single page extraction
- ✅ Quick list extraction
- ✅ Deep batch extraction
- ✅ Virtual scroll support
- ✅ CSV export
- ✅ Progress tracking
- ✅ Cancel functionality

---

## 📜 License

MIT License - Silakan digunakan dan dimodifikasi sesuai kebutuhan.

---


<div align="center">

**Made with 🔥 for EOS BSI**

⭐ Star this repo jika bernafas

</div>
