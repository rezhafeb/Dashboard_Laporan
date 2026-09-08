# Dashboard Laporan

Fitur:
- Bulanan, Triwulan, Semester, Tahunan, Laporan Lainnya
- Submenu dapat ditambah
- Link Google Drive
- Status Sudah Diisi / Belum Diisi
- Progress per kategori dan keseluruhan
- Tambah tahun
- Multi-pegawai tanpa login
- Frontend GitHub Pages + Google Apps Script + Google Sheets

## Setup
1. Buka Google Sheet DATABASE DASHBOARD LAPORAN.
2. Extensions > Apps Script.
3. Masukkan Code.gs.
4. Jalankan setupSheet sekali.
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Salin URL Web App.
9. Di script.js isi `const API_URL="URL_WEB_APP_ANDA";`
10. Upload index.html, style.css, script.js ke GitHub Pages.

Catatan: tanpa login berarti endpoint perubahan data tidak memiliki autentikasi. Untuk penggunaan internal, pertimbangkan pembatasan akses Google Workspace atau hilangkan fungsi hapus dari publik.
