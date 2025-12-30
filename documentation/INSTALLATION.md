# 🚀 Installation Guide

Panduan lengkap instalasi Starlink Usage Extractor Chrome Extension.

---

## 📋 Requirements

### System Requirements
- **Browser:** Google Chrome 88+ atau Chromium-based browser (Edge, Brave, Opera)
- **OS:** Windows, macOS, atau Linux
- **RAM:** Minimal 4GB (8GB recommended untuk batch besar)
- **Network:** Koneksi internet stabil

### Akses Requirements
- ✅ Akun admin/reseller Starlink
- ✅ Akses ke Starlink Admin Dashboard (https://www.starlink.com)

---

## 📦 Download Extension

### Option 1: Clone dari Git

```bash
# Clone repository
git clone https://github.com/your-username/starlink-usage-extractor.git

# Masuk ke folder
cd starlink-usage-extractor
```

### Option 2: Download ZIP

1. Buka repository di GitHub/Gitea
2. Klik tombol **Code** → **Download ZIP**
3. Extract file ZIP ke folder yang mudah diakses

---

## 🔧 Load Extension ke Chrome

### Step 1: Buka Chrome Extensions

```
1. Buka Google Chrome
2. Ketik di address bar: chrome://extensions/
3. Tekan Enter
```

### Step 2: Aktifkan Developer Mode

```
1. Lihat pojok kanan atas halaman extensions
2. Aktifkan toggle "Developer mode"
3. Akan muncul tombol tambahan: 
   - Load unpacked
   - Pack extension
   - Update
```

### Step 3: Load Extension

```
1. Klik tombol "Load unpacked"
2. Pilih folder project (yang berisi manifest.json)
3. Klik "Select Folder"
4. Extension akan muncul di daftar
```

### Step 4: Verifikasi Instalasi

Pastikan terlihat:
- ✅ Icon extension muncul di daftar
- ✅ Status: Enabled (toggle biru)
- ✅ Tidak ada error (tulisan merah)

---

## 📌 Pin Extension (Recommended)

Untuk akses cepat, pin extension ke toolbar:

```
1. Klik icon puzzle 🧩 di toolbar Chrome (sebelah address bar)
2. Cari "Starlink Usage Extractor"
3. Klik icon pin 📌 di sebelahnya
4. Icon extension akan selalu tampil di toolbar
```

---

## ⚠️ Troubleshooting Instalasi

### Error: "Manifest file is missing or unreadable"

**Penyebab:** Folder yang dipilih salah

**Solusi:**
```
Pastikan pilih folder yang langsung berisi manifest.json
BUKAN folder parent atau subfolder
```

### Error: "Extension is invalid"

**Penyebab:** File corrupt atau tidak lengkap

**Solusi:**
```
1. Download ulang extension
2. Extract ulang jika dari ZIP
3. Pastikan semua file: manifest.json, popup.html, popup.js, content.js, popup.css
```

### Extension tidak muncul di toolbar

**Solusi:**
```
1. Pastikan extension enabled di chrome://extensions/
2. Klik icon puzzle 🧩
3. Pin extension
4. Atau coba refresh browser (Ctrl+Shift+R)
```

### Icon greyed out / tidak bisa diklik

**Penyebab:** Sedang tidak di halaman Starlink

**Solusi:**
```
1. Buka https://www.starlink.com/
2. Login ke dashboard
3. Icon akan aktif
```

---

## 🔄 Update Extension

Setelah ada update code:

```
1. Buka chrome://extensions/
2. Cari extension card
3. Klik icon reload 🔄 (atau tombol refresh)
4. Extension akan reload dengan code terbaru
```

Atau:
```
1. Klik icon extension
2. Jika ada error, klik "Errors" di extension card
3. Klik "Clear all" errors
4. Klik "Reload"
```

---

## 🗑️ Uninstall Extension

Jika perlu menghapus extension:

```
1. Buka chrome://extensions/
2. Cari "Starlink Usage Extractor"
3. Klik "Remove"
4. Konfirmasi "Remove"
```

---

## ✅ Checklist Instalasi

- [ ] Chrome/Chromium browser terinstall
- [ ] Extension files di-download
- [ ] Developer mode diaktifkan
- [ ] Extension di-load via "Load unpacked"
- [ ] Tidak ada error di extension card
- [ ] Extension di-pin ke toolbar
- [ ] Test buka popup saat di halaman Starlink

---

*Next: [User Guide](./USER_GUIDE.md)*
