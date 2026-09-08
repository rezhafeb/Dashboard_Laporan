DASHBOARD MONITORING LAPORAN - GOOGLE APPS SCRIPT

Isi:
- Code.gs
- Index.html
- CSS.html
- JS.html

FITUR:
1. Dashboard monitoring.
2. Kategori Bulanan, Triwulan, Semester, Tahunan, Lainnya.
3. Tambah/edit/hapus jenis laporan.
4. Tahun laporan.
5. Target otomatis:
   - Bulanan 12
   - Triwulan 4
   - Semester 2
   - Tahunan 1
   - Lainnya sesuai target.
6. Upload file per periode ke Google Drive.
7. Database Google Sheets.
8. Cegah duplikasi upload periode.
9. Progress otomatis.
10. Responsive desktop/mobile.

CARA MEMASANG:
1. Buat Google Spreadsheet baru.
2. Salin ID Spreadsheet dari URL.
3. Buat project Google Apps Script.
4. Buat file Code.gs, Index.html, CSS.html, JS.html.
5. Tempel masing-masing isi file.
6. Pada Code.gs ubah:
   const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET';
   menjadi ID Spreadsheet Anda.
7. Jalankan fungsi setupDatabase() sekali dan berikan izin akses.
8. Deploy > New deployment > Web app.
9. Execute as: Me.
10. Who has access: Anyone with the link / sesuai kebijakan organisasi.
11. Buka URL Web App.

CATATAN:
- Upload menggunakan Base64, sehingga untuk file sangat besar dapat terkena batas Apps Script.
- File dibuat di Drive dengan akses Anyone with the link sebagai Viewer. Sesuaikan jika data bersifat internal/rahasia.
- Untuk penggunaan multi-tahun, dashboard otomatis memisahkan laporan berdasarkan Tahun.
