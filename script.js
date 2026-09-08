let reports = [];
let currentCategory = 'Semua';
let currentReport = null;

const periods = {
  Bulanan: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
  Triwulan: ['Triwulan I','Triwulan II','Triwulan III','Triwulan IV'],
  Semester: ['Semester I','Semester II'],
  Tahunan: ['Tahun ' + new Date().getFullYear()]
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav').forEach(btn => btn.onclick = () => {
    currentCategory = btn.dataset.category;
    document.querySelectorAll('.nav').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('pageTitle').textContent =
      currentCategory === 'Semua' ? 'Dashboard Laporan' : 'Laporan ' + currentCategory;
    document.getElementById('sectionTitle').textContent =
      currentCategory === 'Semua' ? 'Semua Laporan' : 'Laporan ' + currentCategory;
    render();
  });
  loadData();
});

function loadData() {
  google.script.run.withSuccessHandler(data => { reports = data || []; render(); }).withFailureHandler(showError).getData();
}

function render() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  const filtered = reports.filter(r =>
    (currentCategory === 'Semua' || r.kategori === currentCategory) &&
    r.nama.toLowerCase().includes(q)
  );

  document.getElementById('countLabel').textContent = filtered.length + ' laporan';
  document.getElementById('total').textContent = reports.length;

  // Progress dihitung dari jumlah file. Untuk kartu, cache file count diperbarui saat detail dibuka/upload.
  const done = reports.filter(r => r._count !== undefined && r._count >= r.target).length;
  const progressing = reports.filter(r => r._count !== undefined && r._count > 0 && r._count < r.target).length;
  const empty = reports.filter(r => r._count === 0).length;
  document.getElementById('done').textContent = done;
  document.getElementById('progressing').textContent = progressing;
  document.getElementById('empty').textContent = empty;

  const cards = document.getElementById('cards');
  if (!filtered.length) {
    cards.innerHTML = '<div class="empty-state"><div style="font-size:38px">📂</div><h3>Belum ada laporan</h3><p>Klik “Tambah Laporan” untuk membuat jenis laporan baru.</p></div>';
    return;
  }

  cards.innerHTML = filtered.map(r => {
    const count = r._count ?? 0;
    const pct = Math.min(100, Math.round(count / r.target * 100));
    return `<article class="card">
      <div class="card-top"><span class="tag">${r.kategori}</span><span>${pct === 100 ? '✅' : '📄'}</span></div>
      <h3>${escapeHtml(r.nama)}</h3>
      <div class="card-meta">Target ${r.target} file</div>
      <div class="percent"><span>Progress</span><b>${pct}%</b></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="uploaded">${count} dari ${r.target} file terupload</div>
      <div class="actions">
        <button class="btn" onclick="openDetail('${r.id}')">👁 Detail</button>
        <button class="btn" onclick="openEdit('${r.id}')">✏ Edit</button>
        <button class="btn danger" onclick="removeReport('${r.id}')">🗑</button>
      </div>
    </article>`;
  }).join('');
}

function openAdd() {
  document.getElementById('modalTitle').textContent = 'Tambah Laporan';
  document.getElementById('editId').value = '';
  document.getElementById('nama').value = '';
  document.getElementById('kategori').value = currentCategory === 'Semua' ? 'Bulanan' : currentCategory;
  setDefaultTarget();
  document.getElementById('modal').classList.remove('hidden');
}

function openEdit(id) {
  const r = reports.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modalTitle').textContent = 'Edit Laporan';
  document.getElementById('editId').value = r.id;
  document.getElementById('nama').value = r.nama;
  document.getElementById('kategori').value = r.kategori;
  document.getElementById('target').value = r.target;
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('kategori').addEventListener('change', setDefaultTarget);
function setDefaultTarget() {
  const v = document.getElementById('kategori').value;
  const defaults = {Bulanan:12, Triwulan:4, Semester:2, Tahunan:1, Lainnya:1};
  if (!document.getElementById('editId').value) document.getElementById('target').value = defaults[v] || 1;
}

function saveReport(e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const kategori = document.getElementById('kategori').value;
  const nama = document.getElementById('nama').value;
  const target = document.getElementById('target').value;
  const run = google.script.run.withSuccessHandler(data => {
    reports = data || []; closeModal(); render(); toast('Laporan berhasil disimpan.');
  }).withFailureHandler(showError);
  id ? run.updateReport(id,kategori,nama,target) : run.addReport(kategori,nama,target);
}

function removeReport(id) {
  const r = reports.find(x => x.id === id);
  if (!r || !confirm('Hapus laporan "' + r.nama + '" dari dashboard? File di Google Drive tidak ikut dihapus.')) return;
  google.script.run.withSuccessHandler(data => {
    reports = data || []; render(); toast('Laporan dihapus.');
  }).withFailureHandler(showError).deleteReport(id);
}

function openDetail(id) {
  currentReport = reports.find(x => x.id === id);
  if (!currentReport) return;
  document.getElementById('detailTitle').textContent = currentReport.nama;
  document.getElementById('detailModal').classList.remove('hidden');
  loadFiles();
}

function loadFiles() {
  google.script.run.withSuccessHandler(files => {
    files = files || [];
    currentReport._count = files.length;
    const list = document.getElementById('fileList');
    const expected = periods[currentReport.kategori] || Array.from({length: currentReport.target}, (_,i) => 'File ' + (i+1));
    const map = {};
    files.forEach(f => map[f.period] = f);
    const pct = Math.min(100, Math.round(files.length/currentReport.target*100));
    document.getElementById('detailProgress').textContent = `${files.length} / ${currentReport.target} file • Progress ${pct}%`;

    document.getElementById('periods').innerHTML = expected.slice(0,currentReport.target).map(p => {
      const f = map[p];
      return `<div class="period ${f ? 'done':''}">
        <strong>${escapeHtml(p)}</strong>
        <small>${f ? '✓ ' + escapeHtml(f.name) : 'Belum ada file'}</small>
        ${f ? `<div style="display:flex;gap:7px;margin-top:8px"><a class="btn" href="${f.url}" target="_blank">Lihat</a><button class="btn danger" onclick="removeFile('${f.id}')">Hapus</button></div>` :
        `<label class="upload-btn">＋ Upload file<input type="file" onchange="upload(this,'${escapeAttr(p)}')"></label>`}
      </div>`;
    }).join('');

    list.innerHTML = files.length ? '<h4>File yang sudah diupload</h4>' + files.map(f =>
      `<div class="file-row"><span>📄 ${escapeHtml(f.name)} <small>(${escapeHtml(f.period)})</small></span><a href="${f.url}" target="_blank">Buka</a></div>`
    ).join('') : '';
    render();
  }).withFailureHandler(showError).listFiles(currentReport.id);
}

function upload(input, period) {
  const file = input.files[0];
  if (!file || !currentReport) return;
  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result.split(',')[1];
    toast('Mengunggah ' + file.name + '...');
    google.script.run.withSuccessHandler(() => {
      toast('File berhasil diupload.');
      loadFiles();
    }).withFailureHandler(showError).uploadFile({
      reportId: currentReport.id, period, fileName: file.name,
      mimeType: file.type, fileData: base64
    });
  };
  reader.readAsDataURL(file);
}

function removeFile(id) {
  if (!confirm('Hapus file ini dari Google Drive?')) return;
  google.script.run.withSuccessHandler(() => { toast('File dihapus.'); loadFiles(); })
    .withFailureHandler(showError).deleteFile(id);
}

function closeModal(){document.getElementById('modal').classList.add('hidden')}
function closeDetail(){document.getElementById('detailModal').classList.add('hidden');currentReport=null}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function showError(err){toast('Error: ' + (err.message || err))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;')}
