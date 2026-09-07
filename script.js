/*
  Dashboard Laporan - Frontend
  Backend: Google Apps Script Web App
  Isi API_URL setelah deploy Code.gs.
*/
const API_URL = "https://script.google.com/macros/s/AKfycbylctf3FELo_wa8bZhucqwH_uuNk_qzpaew2cL18eJQvaF8F6PVzI79R8JOEf-Dq9Wr/exec"; // contoh: https://script.google.com/macros/s/XXXXXXXX/exec

const PERIODS = {
  mingguan: "Mingguan",
  bulanan: "Bulanan",
  "3bulan": "3 Bulan",
  "6bulan": "6 Bulan",
  "12bulan": "12 Bulan"
};

let data = {};
let currentYear = "2026";
let currentPeriod = "mingguan";

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("currentDate").textContent = new Date().toLocaleDateString("id-ID", {
    weekday:"long", year:"numeric", month:"long", day:"numeric"
  });

  document.querySelectorAll(".period-card").forEach(card => {
    card.addEventListener("click", () => showPeriod(card.dataset.period));
  });

  $("addYearBtn").addEventListener("click", openYearModal);
  $("saveYearBtn").addEventListener("click", saveYear);
  $("addMenuBtn").addEventListener("click", openMenuModal);
  $("saveMenuBtn").addEventListener("click", saveMenu);
  $("sidebarToggle").addEventListener("click", () => $("sidebar").classList.toggle("show"));

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  loadData();
});

function emptyYear() {
  return {mingguan:[], bulanan:[], "3bulan":[], "6bulan":[], "12bulan":[]};
}

function normalizeData(rows) {
  const result = {};
  (rows || []).forEach(row => {
    const year = String(row.tahun);
    const period = String(row.periode);
    if (!result[year]) result[year] = emptyYear();
    if (result[year][period]) {
      result[year][period].push({
        id: row.id || "",
        name: row.namaMenu || row.name || "",
        link: row.link || ""
      });
    }
  });
  if (!result["2026"]) result["2026"] = emptyYear();
  return result;
}

function loadData() {
  if (!API_URL) {
    data = JSON.parse(localStorage.getItem("dashboardLaporan") || "null") || {
      "2026": {mingguan:[{id:"demo",name:"Contoh Laporan Kegiatan Mingguan",link:"https://drive.google.com/"}],
      bulanan:[],"3bulan":[],"6bulan":[],"12bulan":[]}
    };
    renderAll();
    return;
  }

  showToast("Memuat data...");
  jsonp("getData", {}, response => {
    if (!response.ok) return showToast(response.message || "Gagal memuat data.");
    data = normalizeData(response.data);
    renderAll();
    showToast("Data berhasil dimuat.");
  });
}

function jsonp(action, params, callback) {
  const callbackName = "cb_" + Date.now() + "_" + Math.floor(Math.random()*10000);
  const script = document.createElement("script");
  const query = new URLSearchParams({action, callback:callbackName, ...params});
  window[callbackName] = response => {
    delete window[callbackName];
    script.remove();
    callback(response);
  };
  script.src = API_URL + "?" + query.toString();
  script.onerror = () => {
    delete window[callbackName];
    script.remove();
    callback({ok:false,message:"Tidak dapat terhubung ke Google Apps Script."});
  };
  document.body.appendChild(script);
}

function write(action, params, done) {
  if (!API_URL) {
    done({ok:true});
    return;
  }
  jsonp(action, params, done);
}

function renderAll() {
  if (!data[currentYear]) currentYear = Object.keys(data).sort((a,b)=>b-a)[0] || "2026";
  $("yearTitle").textContent = "Tahun " + currentYear;
  $("yearBadge").textContent = currentYear;
  renderYears();
  showPeriod(currentPeriod);
}

function renderYears() {
  const container = $("yearContainer");
  container.innerHTML = "";
  Object.keys(data).sort((a,b)=>b-a).forEach(year => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="year-title" data-year="${year}">
        <span>📁 Tahun ${escapeHTML(year)}</span><span>▼</span>
      </div>
      <div class="year-menu ${year===currentYear ? "show":""}" id="year-${year}">
        ${Object.entries(PERIODS).map(([key,label]) =>
          `<button data-year="${year}" data-period="${key}">▸ ${label}</button>`
        ).join("")}
      </div>`;
    container.appendChild(wrap);
  });

  container.querySelectorAll(".year-title").forEach(el => {
    el.addEventListener("click", () => $("year-"+el.dataset.year).classList.toggle("show"));
  });
  container.querySelectorAll(".year-menu button").forEach(el => {
    el.addEventListener("click", () => selectYear(el.dataset.year, el.dataset.period));
  });

  container.querySelectorAll(".year-menu button").forEach(el => {
    el.classList.toggle("active", el.dataset.year===currentYear && el.dataset.period===currentPeriod);
  });
}

function selectYear(year, period) {
  currentYear = String(year);
  currentPeriod = period;
  $("yearTitle").textContent = "Tahun " + currentYear;
  $("yearBadge").textContent = currentYear;
  renderYears();
  showPeriod(period);
  if (window.innerWidth <= 700) $("sidebar").classList.remove("show");
}

function showPeriod(period) {
  currentPeriod = period;
  document.querySelectorAll(".period-card").forEach(c => c.classList.toggle("active", c.dataset.period===period));
  $("periodKicker").textContent = "PERIODE " + PERIODS[period].toUpperCase();
  $("periodTitle").textContent = "Laporan " + PERIODS[period] + " " + currentYear;
  renderMenus();
  renderYears();
}

function renderMenus() {
  const container = $("menuList");
  container.innerHTML = "";
  const menus = data[currentYear]?.[currentPeriod] || [];

  if (!menus.length) {
    container.innerHTML = `<div class="empty">Belum ada menu laporan untuk periode ini.<br><br>Klik <b>＋ Tambah Menu</b> untuk menambahkan laporan.</div>`;
    return;
  }

  menus.forEach((item,index) => {
    const card = document.createElement("article");
    card.className = "report-card";
    card.innerHTML = `
      <div class="report-icon">📁</div>
      <h3>${escapeHTML(item.name)}</h3>
      <p>${PERIODS[currentPeriod]} ${escapeHTML(currentYear)}</p>
      <a class="btn-open" href="${escapeAttribute(item.link)}" target="_blank" rel="noopener noreferrer">Buka Google Drive</a>
      <button class="btn-delete" data-index="${index}">Hapus</button>`;
    card.querySelector(".btn-delete").addEventListener("click", () => deleteMenu(index));
    container.appendChild(card);
  });
}

function openYearModal() {
  $("yearInput").value = "";
  $("yearModal").style.display = "flex";
  $("yearInput").focus();
}

function openMenuModal() {
  const select = $("menuYear");
  select.innerHTML = Object.keys(data).sort((a,b)=>b-a).map(y=>`<option value="${escapeAttribute(y)}">${escapeHTML(y)}</option>`).join("");
  select.value = currentYear;
  $("periodInput").value = currentPeriod;
  $("nameInput").value = "";
  $("linkInput").value = "";
  $("menuModal").style.display = "flex";
  $("nameInput").focus();
}

function closeModal(id) { $(id).style.display = "none"; }

function saveYear() {
  const year = $("yearInput").value.trim();
  if (!/^\d{4}$/.test(year)) return showToast("Masukkan tahun 4 digit.");
  if (data[year]) return showToast("Tahun tersebut sudah tersedia.");

  data[year] = emptyYear();
  saveLocal();
  write("addYear", {tahun:year}, response => {
    if (!response.ok) return showToast(response.message || "Gagal menambah tahun.");
    currentYear = year;
    currentPeriod = "mingguan";
    closeModal("yearModal");
    renderAll();
    showToast("Tahun " + year + " berhasil ditambahkan.");
  });
}

function saveMenu() {
  const year = $("menuYear").value;
  const period = $("periodInput").value;
  const name = $("nameInput").value.trim();
  const link = $("linkInput").value.trim();

  if (!name) return showToast("Nama menu harus diisi.");
  if (!/^https?:\/\//i.test(link)) return showToast("Masukkan link yang valid.");

  const temp = {id:"local-"+Date.now(),name,link};
  if (!data[year]) data[year] = emptyYear();
  data[year][period].push(temp);
  saveLocal();

  write("addMenu", {tahun:year,periode:period,namaMenu:name,link}, response => {
    if (!response.ok) {
      data[year][period] = data[year][period].filter(x => x.id !== temp.id);
      saveLocal(); renderAll();
      return showToast(response.message || "Gagal menyimpan menu.");
    }
    if (response.id) temp.id = response.id;
    currentYear = year; currentPeriod = period;
    closeModal("menuModal");
    renderAll();
    showToast("Menu berhasil ditambahkan.");
  });
}

function deleteMenu(index) {
  const item = data[currentYear][currentPeriod][index];
  if (!confirm(`Hapus menu "${item.name}"?`)) return;

  data[currentYear][currentPeriod].splice(index,1);
  saveLocal();
  renderMenus();

  write("deleteMenu", {id:item.id}, response => {
    if (!response.ok) showToast(response.message || "Gagal menghapus dari server.");
    else showToast("Menu dihapus.");
    loadData();
  });
}

function saveLocal() {
  localStorage.setItem("dashboardLaporan", JSON.stringify(data));
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.style.display = "none", 2600);
}

function escapeHTML(text) {
  return String(text ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
function escapeAttribute(text) { return escapeHTML(text); }
