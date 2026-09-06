# Dashboard Laporan Kantor

Dashboard berbasis GitHub Pages dengan database Google Sheets melalui Google Apps Script.

## Struktur

- `index.html` — halaman dashboard
- `style.css` — tampilan
- `script.js` — fungsi dashboard dan koneksi API
- `Code.gs` — backend Google Apps Script
- `README.md` — panduan

## Instalasi Google Sheets

1. Buat Google Sheet baru.
2. Buka **Extensions > Apps Script**.
3. Salin isi `Code.gs` ke editor Apps Script.
4. Jika Apps Script dibuat dari Google Sheet tersebut, biarkan:
   `SPREADSHEET_ID = ""`
5. Jika menggunakan standalone Apps Script, isi `SPREADSHEET_ID` dengan ID Google Sheet.
6. Klik **Deploy > New deployment**.
7. Pilih **Web app**.
8. **Execute as:** Me.
9. **Who has access:** Anyone.
10. Deploy dan salin URL Web App.

## Hubungkan ke GitHub

Buka `script.js` lalu ubah:

```js
const API_URL = "";
```

menjadi:

```js
const API_URL = "URL_WEB_APP_GOOGLE_APPS_SCRIPT";
```

Kemudian upload seluruh file ke repository GitHub.

## Google Drive

Saat menambah menu, masukkan link Google Drive yang dapat diakses oleh pegawai yang membutuhkan dokumen tersebut.

## Catatan keamanan

Versi ini sengaja tanpa login. Artinya, siapa pun yang mempunyai akses ke dashboard dapat menggunakan fungsi tambah/hapus yang disediakan. Untuk penggunaan internal kantor, jangan simpan data sensitif langsung di dashboard dan atur izin Google Drive sesuai kebutuhan.

## Data

Google Sheets akan menggunakan sheet bernama `MENU_LAPORAN` dengan kolom:

ID | Tahun | Periode | Nama Menu | Link | Dibuat | Diubah

Tahun 2026 dibuat sebagai tahun awal di frontend. Tahun berikutnya dapat ditambahkan dari tombol **Tambah Tahun**.
