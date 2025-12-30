# 🔒 Security & Privacy

Dokumen transparansi keamanan dan privasi Starlink Usage Extractor.

---

## 📋 Executive Summary

| Aspek | Status | Detail |
|-------|--------|--------|
| Data Transmission | ✅ Safe | Tidak ada data dikirim ke server eksternal |
| Data Storage | ✅ Safe | Hanya timestamp yang disimpan lokal |
| Credential Access | ✅ Safe | Tidak mengakses password/token |
| Third-party | ✅ Safe | Tidak ada third-party integration |

---

## 🔐 Permissions Explained

Extension ini meminta permission berikut:

### `activeTab`

```json
"activeTab"
```

**Apa artinya:** Extension hanya bisa mengakses tab yang sedang AKTIF saat user klik icon extension.

**Mengapa diperlukan:** Untuk inject content script ke halaman Starlink.

**Risk Level:** 🟢 Low - Hanya bisa akses tab saat ini, tidak bisa akses tab lain.

### `scripting`

```json
"scripting"
```

**Apa artinya:** Permission untuk menjalankan JavaScript di halaman web.

**Mengapa diperlukan:** Untuk parsing DOM dan extract data dari halaman Starlink.

**Risk Level:** 🟡 Medium - Bisa execute script, tapi terbatas pada domain yang diizinkan.

### `storage`

```json
"storage"
```

**Apa artinya:** Menyimpan data ke Chrome storage lokal.

**Mengapa diperlukan:** Menyimpan timestamp last extraction saja.

**Yang disimpan:**
```javascript
{
  lastExtract: "2024-12-30T12:00:00.000Z"  // Hanya ini
}
```

**Risk Level:** 🟢 Low - Hanya simpan timestamp.

### `host_permissions`

```json
"host_permissions": [
  "https://www.starlink.com/*"
]
```

**Apa artinya:** Extension HANYA bisa aktif di domain starlink.com.

**Risk Level:** 🟢 Low - Tidak bisa akses website lain.

---

## 🛡️ Data Flow Security

### Data yang DIAKSES

```
[READ ONLY]
├── Customer Name (dari DOM)
├── Service Line ID (dari DOM)
├── Kuota Usage (dari DOM)
├── Paket Layanan (dari DOM)
└── Lokasi (dari DOM)
```

### Data yang TIDAK diakses

```
[NOT ACCESSED]
├── ❌ Password / Login credentials
├── ❌ Session cookies
├── ❌ Auth tokens
├── ❌ Payment information
├── ❌ Personal address
└── ❌ Phone numbers
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Starlink Dashboard                                              │
│   (already logged in)                                             │
│         │                                                         │
│         │ [1] User views page                                     │
│         ▼                                                         │
│   ┌─────────────┐                                                │
│   │   Browser   │                                                │
│   │     DOM     │ ◄─── [2] Content script reads DOM              │
│   └─────────────┘                                                │
│         │                                                         │
│         │ [3] Extracted text data                                 │
│         ▼                                                         │
│   ┌─────────────┐     ┌─────────────┐                           │
│   │  Extension  │────►│  CSV File   │                            │
│   │   (local)   │     │  (local)    │                            │
│   └─────────────┘     └─────────────┘                            │
│                              │                                    │
│                              │ [4] User downloads                 │
│                              ▼                                    │
│                       ┌─────────────┐                            │
│                       │  User's     │                            │
│                       │  Computer   │                            │
│                       └─────────────┘                            │
│                                                                   │
│   ❌ NO external servers contacted                               │
│   ❌ NO data uploaded anywhere                                   │
│   ❌ NO analytics or tracking                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Code Transparency

### Source Code Audit

Semua code tersedia untuk di-review:

| File | Lines | Purpose | Risk |
|------|-------|---------|------|
| manifest.json | ~30 | Extension config | 🟢 |
| popup.html | ~50 | UI Structure | 🟢 |
| popup.css | ~200 | Styling | 🟢 |
| popup.js | ~700 | Main logic | 🟡 |
| content.js | ~150 | DOM parsing | 🟡 |

### Tidak Ada Obfuscation

- ✅ Code tidak di-minify
- ✅ Code tidak di-obfuscate
- ✅ Semua readable JavaScript
- ✅ Bisa di-audit manual

### Critical Code Sections

**1. Network Requests: NONE**
```javascript
// Tidak ada:
// - fetch()
// - XMLHttpRequest
// - WebSocket
// - sendMessage ke external
```

**2. Data Persistence: MINIMAL**
```javascript
// Hanya menyimpan timestamp:
chrome.storage.local.set({ lastExtract: new Date().toISOString() });
```

**3. Content Script: READ ONLY**
```javascript
// Hanya membaca DOM:
const bodyText = document.body.innerText;
// Tidak ada write operation ke page
```

---

## 🚨 Potential Risks

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data exposure via CSV | Medium | High | User responsibility, hapus setelah pakai |
| Session hijack | Very Low | High | Extension tidak akses session |
| Phishing via fake extension | Low | High | Only install dari trusted source |
| Broken extraction | Medium | Low | Data might be incomplete, tidak berbahaya |

### User Responsibilities

1. **Jaga kerahasiaan CSV**
   - File CSV berisi data pelanggan
   - Jangan share tanpa enkripsi
   - Hapus setelah selesai digunakan

2. **Install dari trusted source**
   - Hanya dari repository official
   - Jangan install versi modifikasi tidak dikenal

3. **Regular audit**
   - Periksa permissions extension
   - Update ke versi terbaru

---

## 📝 Compliance Notes

### GDPR Considerations

- Extension tidak collect personal data untuk dirinya
- Data extraction adalah tanggungjawab user
- User harus comply dengan kebijakan organisasi masing-masing

### Data Protection

Extension ini adalah TOOL. Penggunaan data yang diekstrak adalah tanggung jawab pengguna. Pastikan:

- ✅ Memiliki authorization untuk mengakses data
- ✅ Comply dengan kebijakan perusahaan
- ✅ Secure handling data sensitif
- ✅ Proper disposal setelah digunakan

---

## 🔐 Security Best Practices

### For Users

```
DO:
✅ Only install from trusted source
✅ Review code before installing
✅ Keep extension updated
✅ Secure CSV files
✅ Delete data when not needed

DON'T:
❌ Share extracted data publicly
❌ Install modified versions
❌ Leave CSV on public computers
❌ Ignore security warnings
```

### For Developers

```
DO:
✅ No external network calls
✅ Minimal permissions
✅ Readable, auditable code
✅ Regular security review
✅ Version control all changes

DON'T:
❌ Add analytics/tracking
❌ Store user data
❌ Obfuscate code
❌ Add unnecessary permissions
```

---

## 📞 Security Contact

Menemukan kerentanan keamanan? Laporkan ke:

- **Email:** [your-security-email@example.com]
- **GitHub:** Open security advisory
- **Response Time:** 24-48 jam

---

*Last security review: 2024-12-30*
