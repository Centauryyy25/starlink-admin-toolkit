# 📋 Changelog

Semua perubahan penting pada project ini akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2024-12-30

### 🎉 Initial Release

#### Added
- **Single Page Mode** - Ekstrak data dari satu halaman detail customer
- **Quick List Mode** - Ekstrak nama dan status dari panel kiri
- **Deep Batch Mode** - Ekstrak detail lengkap semua customer
- **CSV Export** - Download hasil ekstraksi ke file CSV
- **Progress Tracking** - Progress bar real-time untuk batch extraction
- **Cancel Functionality** - Bisa cancel extraction kapan saja
- **Preview** - Preview data sebelum download
- **Virtual Scroll Support** - Handle Angular CDK virtual scroll list
- **Retry Mechanism** - Auto retry jika extraction gagal (max 3x)
- **Smart Wait** - Tunggu content load sebelum extract

#### Technical
- Chrome Extension Manifest V3
- Content script injection
- DOM parsing dengan regex
- Tab navigation untuk deep batch
- Local storage untuk timestamp

#### Documentation
- README.md dengan instalasi dan usage
- Installation Guide
- User Guide
- Technical Documentation
- Security & Privacy
- Troubleshooting Guide
- Changelog

---

## [Unreleased]

### Planned Features
- [ ] Firefox support
- [ ] Scheduled extraction
- [ ] Historical data comparison
- [ ] Export ke Excel format
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

### Known Issues
- Virtual scroll kadang tidak capture semua item di list 500+
- Kuota N/A pada beberapa halaman dengan loading lambat

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2024-12-30 | Initial release with 3 extraction modes |

---

## Upgrade Notes

### Upgrading to 1.0.0

Fresh install - no previous version to upgrade from.

### Future Upgrades

Untuk upgrade dari versi lama:

```
1. Backup data penting
2. Remove extension lama
3. Download versi baru
4. Install dengan "Load unpacked"
5. Test functionality
```

---

*Maintained by: [Developer Name]*
