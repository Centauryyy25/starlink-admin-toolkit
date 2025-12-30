# 🔧 Troubleshooting Guide

Panduan menyelesaikan masalah umum pada Starlink Usage Extractor.

---

## 📋 Quick Diagnosis

### Error Message Reference

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Tidak ditemukan URL service line" | List kosong atau selector berubah | [→ Solution](#tidak-ditemukan-url) |
| "Gagal mengekstrak data" | Page struktur berbeda | [→ Solution](#gagal-ekstrak) |
| "N/A" di semua field | Content belum load | [→ Solution](#data-na) |
| Extension icon grey | Bukan di Starlink | [→ Solution](#icon-grey) |
| Progress stuck | Connection issue | [→ Solution](#progress-stuck) |

---

## 🚫 Tidak Ditemukan URL

### Gejala
```
Error: Tidak ditemukan URL service line. 
Pastikan Anda sudah melakukan search.
```

### Penyebab
1. Belum ada search result
2. List kosong
3. DOM selector berubah

### Solusi

**Step 1: Pastikan ada data di list**
```
1. Buka Starlink dashboard
2. Pergi ke halaman monitoring
3. Lakukan SEARCH untuk menampilkan customer
4. Pastikan ada item di panel kiri
```

**Step 2: Scroll list**
```
1. Scroll panel kiri sampai bawah
2. Tunggu semua item ter-load
3. Coba extract lagi
```

**Step 3: Check Console**
```
1. Tekan F12 (DevTools)
2. Tab "Console"
3. Cari log "Collected URLs: X"
4. Jika 0, berarti selector tidak match
```

**Step 4: Jika masih gagal**
```
1. Refresh halaman (Ctrl+R)
2. Login ulang jika perlu
3. Coba lagi
4. Report bug jika tetap gagal
```

---

## ❌ Gagal Ekstrak

### Gejala
```
Error: Gagal mengekstrak data
Error: Error parsing page: ...
```

### Penyebab
1. Halaman belum loaded
2. Struktur halaman berbeda
3. JavaScript error

### Solusi

**Step 1: Tunggu page full load**
```
1. Refresh halaman
2. Tunggu sampai loading indicator hilang
3. Tunggu ~5 detik
4. Coba extract lagi
```

**Step 2: Check apakah di page yang benar**
```
Untuk Single Mode:
- Harus di halaman DETAIL customer
- URL: .../service-line/SL-XXXXX-XXXXX-XX

Untuk Quick/Deep Mode:
- Harus di halaman LIST customer
- Ada panel kiri dengan daftar customer
```

**Step 3: Check Console untuk error**
```
1. F12 → Console
2. Cari error merah
3. Screenshot untuk bug report
```

---

## ⚠️ Data N/A

### Gejala
```
CSV berisi banyak "N/A" atau nilai kosong
Kuota: N/A
Lokasi: N/A
```

### Penyebab
1. Content belum fully render
2. Regex tidak match format baru
3. Data memang tidak ada di page

### Solusi

**Step 1: Slow down extraction**
```
Untuk Deep Batch:
1. Gunakan koneksi internet stabil
2. Jangan intervensi browser
3. Biarkan proses berjalan
```

**Step 2: Check halaman manual**
```
1. Buka halaman detail customer secara manual
2. Lihat apakah data ada di page
3. Jika ada tapi tidak ter-extract, report bug
```

**Step 3: Debug dengan Console**
```javascript
// Di Console, cek apakah teks ada:
document.body.innerText.includes('Kuota')  // true/false
document.body.innerText.includes('SL-')    // true/false
```

---

## 🔘 Icon Grey

### Gejala
```
Icon extension abu-abu / tidak bisa diklik
Click tidak membuka popup
```

### Penyebab
1. Bukan di domain Starlink
2. Extension disabled
3. Permission issue

### Solusi

**Step 1: Check URL**
```
Harus di: https://www.starlink.com/...
Tidak bekerja di:
- http://... (harus https)
- subdomain lain
- halaman login
```

**Step 2: Check extension status**
```
1. Buka chrome://extensions/
2. Cari "Starlink Usage Extractor"
3. Pastikan toggle ON (biru)
4. Tidak ada "Errors" badge
```

**Step 3: Enable permissions**
```
1. Di extension card, klik "Details"
2. Pastikan "Site access" = "On specific sites"
3. Check "https://www.starlink.com" terdaftar
```

**Step 4: Reload extension**
```
1. Di chrome://extensions/
2. Klik icon reload 🔄 pada extension
3. Refresh halaman Starlink
```

---

## ⏳ Progress Stuck

### Gejala
```
Progress bar tidak bergerak
Stuck di "Mengambil: CRT..."
Halaman tidak navigate
```

### Penyebab
1. Connection timeout
2. Session expired
3. Rate limiting
4. JavaScript error

### Solusi

**Step 1: Cancel dan retry**
```
1. Klik tombol "Cancel"
2. Data yang sudah didapat akan tersimpan
3. Download data partial jika perlu
4. Refresh halaman
5. Coba extract lagi
```

**Step 2: Check session**
```
1. Buka tab baru
2. Pergi ke Starlink dashboard
3. Jika redirect ke login, login ulang
4. Kembali ke tab extension
5. Refresh dan coba lagi
```

**Step 3: Reduce batch size**
```
1. Gunakan search untuk filter data
2. Extract dalam batch lebih kecil
3. Misal: 50 item per batch, bukan 200
```

**Step 4: Check connection**
```
1. Tes kecepatan internet
2. Pastikan tidak ada VPN blocking
3. Coba di waktu berbeda (server less busy)
```

---

## 📊 CSV Format Issue

### Gejala
```
Excel tidak bisa buka CSV
Karakter aneh di CSV
Kolom tidak align
```

### Solusi

**Step 1: Open with correct encoding**
```
Di Excel:
1. File → Open
2. Pilih file CSV
3. Di wizard, pilih: Delimited, UTF-8
4. Delimiter: Comma
```

**Step 2: Open dengan Google Sheets**
```
1. Buka sheets.google.com
2. File → Import
3. Upload CSV
4. Separator: Comma
5. Biasanya lebih reliable
```

**Step 3: Check special characters**
```
Jika ada karakter Indonesia yang aneh:
1. Buka CSV dengan Notepad++
2. Encoding → Convert to UTF-8
3. Save
4. Buka ulang di Excel
```

---

## 🔄 Virtual Scroll Issue

### Gejala
```
Hanya 20-30 item yang ter-extract
Padahal list ada 100+ item
"Collected URLs: 25" padahal seharusnya 100
```

### Penyebab
Angular CDK Virtual Scroll tidak ter-scroll sempurna

### Solusi

**Step 1: Manual scroll first**
```
1. SEBELUM extract, scroll list MANUAL
2. Scroll dari atas sampai paling bawah
3. Tunggu sebentar
4. Baru klik extract
```

**Step 2: Use search filter**
```
1. Jika list sangat besar (500+)
2. Gunakan search untuk filter
3. Extract per batch yang lebih kecil
```

**Step 3: Check console log**
```
Console akan menampilkan:
"Scroll pos 300: collected 35 unique URLs"
"Scroll pos 600: collected 50 unique URLs"
...

Jika stuck di angka tertentu, 
berarti ada issue dengan scrolling
```

---

## 🛠️ General Debugging

### Enable Verbose Logging

```javascript
// Di Console, sebelum extract:
localStorage.setItem('DEBUG', 'true');
// Lalu extract, log akan lebih detail
```

### Capture Full Debug Info

Untuk bug report, capture:

1. **Console Log**
   ```
   1. F12 → Console
   2. Clear (Ctrl+L)
   3. Run extraction
   4. Right-click → Save as...
   ```

2. **Network Log**
   ```
   1. F12 → Network
   2. Run extraction
   3. Export HAR file
   ```

3. **Screenshot**
   ```
   1. Screenshot halaman
   2. Screenshot popup
   3. Screenshot console error
   ```

### Reset Extension

Jika semua troubleshooting gagal:

```
1. Buka chrome://extensions/
2. Remove extension
3. Clear browser cache
4. Re-install fresh
5. Test lagi
```

---

## 📞 Still Need Help?

Jika masalah tetap tidak terselesaikan:

1. **Collect info:**
   - Chrome version
   - Extension version
   - OS
   - Console logs
   - Screenshots

2. **Report:**
   - GitHub Issues
   - Email developer
   - Include semua info di atas

3. **Response time:**
   - Bug reports: 24-48 jam
   - Feature requests: 1 minggu

---

*Last updated: 2024-12-30*
