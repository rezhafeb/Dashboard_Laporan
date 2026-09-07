/*******************************************************
 * GOOGLE APPS SCRIPT - DATABASE DASHBOARD LAPORAN
 *
 * 1. Buat Google Sheet baru.
 * 2. Extensions > Apps Script.
 * 3. Tempel seluruh kode ini ke Code.gs.
 * 4. Ubah SPREADSHEET_ID jika script bukan bound ke Sheet.
 * 5. Deploy > New deployment > Web app.
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Salin URL Web App ke API_URL pada script.js.
 *
 * TANPA LOGIN:
 * Siapa pun yang memiliki URL dashboard dapat menambah/
 * menghapus data sesuai fungsi yang tersedia. Gunakan untuk
 * dashboard internal dan jangan taruh data sensitif di sini.
 *******************************************************/

const SPREADSHEET_ID = ""; // Kosongkan jika script dibuat dari Extensions > Apps Script pada Sheet.
const SHEET_NAME = "MENU_LAPORAN";

function getSheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID","Tahun","Periode","Nama Menu","Link","Dibuat","Diubah"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const p = e.parameter || {};
  const action = p.action || "getData";
  let result;

  try {
    if (action === "getData") result = getData_();
    else if (action === "addYear") result = addYear_(p);
    else if (action === "addMenu") result = addMenu_(p);
    else if (action === "deleteMenu") result = deleteMenu_(p);
    else result = {ok:false,message:"Action tidak dikenal."};
  } catch (err) {
    result = {ok:false,message:String(err)};
  }

  return output_(result, p.callback);
}

function output_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function getData_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = [];

  for (let i=1; i<values.length; i++) {
    const r = values[i];
    if (!r[0] || String(r[0]).startsWith("YEAR-")) continue;
    rows.push({
      id: String(r[0]),
      tahun: String(r[1]),
      periode: String(r[2]),
      namaMenu: String(r[3]),
      link: String(r[4]),
      dibuat: r[5] instanceof Date ? r[5].toISOString() : String(r[5] || ""),
      diubah: r[6] instanceof Date ? r[6].toISOString() : String(r[6] || "")
    });
  }
  return {ok:true,data:rows};
}

function addYear_(p) {
  const year = String(p.tahun || "").trim();
  if (!/^\d{4}$/.test(year)) return {ok:false,message:"Tahun tidak valid."};

  // Tahun disimpan sebagai baris penanda agar tahun kosong tetap muncul.
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();

  for (let i=1; i<values.length; i++) {
    if (String(values[i][1]) === year && String(values[i][0]).startsWith("YEAR-")) {
      return {ok:false,message:"Tahun sudah tersedia."};
    }
  }

  sheet.appendRow(["YEAR-"+year,year,"","","",new Date(),new Date()]);
  return {ok:true,year:year};
}

function addMenu_(p) {
  const year = String(p.tahun || "").trim();
  const period = String(p.periode || "").trim();
  const name = String(p.namaMenu || "").trim();
  const link = String(p.link || "").trim();

  const allowed = ["mingguan","bulanan","3bulan","6bulan","12bulan"];

  if (!/^\d{4}$/.test(year)) return {ok:false,message:"Tahun tidak valid."};
  if (allowed.indexOf(period) === -1) return {ok:false,message:"Periode tidak valid."};
  if (!name) return {ok:false,message:"Nama menu wajib diisi."};
  if (!/^https?:\/\//i.test(link)) return {ok:false,message:"Link tidak valid."};

  const id = Utilities.getUuid();
  const now = new Date();
  getSheet_().appendRow([id,year,period,name,link,now,now]);

  return {ok:true,id:id};
}

function deleteMenu_(p) {
  const id = String(p.id || "").trim();
  if (!id) return {ok:false,message:"ID tidak ditemukan."};

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();

  for (let i=1; i<values.length; i++) {
    if (String(values[i][0]) === id) {
      sheet.deleteRow(i+1);
      return {ok:true};
    }
  }

  return {ok:false,message:"Menu tidak ditemukan."};
}
