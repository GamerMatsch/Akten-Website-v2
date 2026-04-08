const STORAGE_KEY = 'ems_saves';

const fields = [
  'name','geschlecht','alter',
  'a_atemwege',
  'b_af','b_befund',
  'c_puls','c_spo2','c_rr_sys','c_rr_dia',
  'd_pupillen','d_bz',
  'd_dms_d','d_dms_m','d_dms_s',
  'befast_b','befast_e','befast_f','befast_a','befast_s','befast_t',
  'e_kopf','e_hws','e_schluessel','e_bauch','e_arme','e_beine','e_fuesse',
  'symptome','allergien','medikamente','vorerkrankungen',
  'letzter_kh','letzte_mahlzeit','letzter_trank','letzter_stuhlgang',
  'ereignis','risikofaktoren',
  'weitere_infos','massnahmen'
];

function getData() {
  const data = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  const radio = document.querySelector('input[name="schwangerschaft"]:checked');
  data['schwangerschaft'] = radio ? radio.value : 'Unbekannt';
  return data;
}

function setData(data) {
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && data[id] !== undefined) el.value = data[id];
  });
  if (data['schwangerschaft']) {
    const radio = document.querySelector(`input[name="schwangerschaft"][value="${data['schwangerschaft']}"]`);
    if (radio) radio.checked = true;
  }
}

function clearForm() {
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const radio = document.querySelector('input[name="schwangerschaft"][value="Unbekannt"]');
  if (radio) radio.checked = true;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function getSaves() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function putSaves(saves) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

function saveProtocol() {
  const data = getData();
  const saves = getSaves();
  const label = data.name || 'Unbekannt';
  const ts = new Date().toLocaleString('de-DE');
  saves.unshift({ label, ts, data });
  if (saves.length > 30) saves.length = 30;
  putSaves(saves);
  showToast(`✓ Protokoll gespeichert — ${label}`);
}

function renderSaveList() {
  const saves = getSaves();
  const container = document.getElementById('save-list');
  if (!saves.length) {
    container.innerHTML = '<div class="no-saves">Keine gespeicherten Protokolle.</div>';
    return;
  }
  container.innerHTML = saves.map((s, i) => `
    <div class="save-entry">
      <div class="save-entry-info">
        <div>${s.label}</div>
        <div class="save-entry-date">${s.ts}</div>
      </div>
      <div class="save-entry-actions">
        <button class="btn-sm load" onclick="loadEntry(${i})">Laden</button>
        <button class="btn-sm delete" onclick="deleteEntry(${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function loadEntry(i) {
  const saves = getSaves();
  if (!saves[i]) return;
  setData(saves[i].data);
  closeModal();
  showToast(`✓ Protokoll geladen — ${saves[i].label}`);
}

function deleteEntry(i) {
  const saves = getSaves();
  saves.splice(i, 1);
  putSaves(saves);
  renderSaveList();
}

function openModal() {
  renderSaveList();
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function exportProtocol() {
  const d = getData();
  const lines = [
    '===== EMS PATIENTENPROTOKOLL =====',
    `Name: ${d.name}   Geschlecht: ${d.geschlecht}   Alter: ${d.alter}`,
    '',
    '── A: ATEMWEGE ──',
    `Befund: ${d.a_atemwege}`,
    '',
    '── B: ATMUNG ──',
    `Atemfrequenz: ${d.b_af}/min   ${d.b_befund}`,
    '',
    '── C: CIRCULATION ──',
    `Puls: ${d.c_puls} bpm   SpO2: ${d.c_spo2}%   RR: ${d.c_rr_sys}/${d.c_rr_dia} mmHg`,
    '',
    '── D: NEUROLOGIE ──',
    `Pupillen: ${d.d_pupillen}   Blutzucker: ${d.d_bz} mg/dL`,
    '',
    'DMS-Test:',
    `  D (Durchblutung): ${d.d_dms_d}`,
    `  M (Motorik): ${d.d_dms_m}`,
    `  S (Sensorik): ${d.d_dms_s}`,
    '',
    `BE-FAST: B=${d.befast_b} | E=${d.befast_e} | F=${d.befast_f} | A=${d.befast_a} | S=${d.befast_s} | T=${d.befast_t}`,
    '',
    '── E: BODYCHECK ──',
    `Kopf: ${d.e_kopf}   HWS: ${d.e_hws}   Schlüsselbein: ${d.e_schluessel}`,
    `Bauch/Becken: ${d.e_bauch}   Arme: ${d.e_arme}   Beine: ${d.e_beine}   Füße: ${d.e_fuesse}`,
    '',
    '── ANAMNESE ──',
    `Symptome: ${d.symptome}`,
    `Allergien: ${d.allergien}`,
    `Medikamente: ${d.medikamente}`,
    `Vorerkrankungen: ${d.vorerkrankungen}`,
    `Letzter KH-Aufenthalt: ${d.letzter_kh}`,
    `Letzte Mahlzeit: ${d.letzte_mahlzeit}   Letzter Trank: ${d.letzter_trank}   Letzter Stuhlgang: ${d.letzter_stuhlgang}`,
    '',
    '── EINSATZKONTEXT ──',
    `Ereignis: ${d.ereignis}`,
    `Risikofaktoren: ${d.risikofaktoren}`,
    `Schwangerschaft möglich: ${d.schwangerschaft}`,
    '',
    '── ZUSATZ ──',
    `Weitere Infos: ${d.weitere_infos}`,
    '',
    `Ausgeführte Maßnahmen: ${d.massnahmen}`,
    '',
    `Exportiert: ${new Date().toLocaleString('de-DE')}`,
    '=================================='
  ];
  navigator.clipboard.writeText(lines.join('\n'))
    .then(() => showToast('✓ Protokoll in Zwischenablage kopiert'))
    .catch(() => showToast('⚠ Kopieren fehlgeschlagen'));
}

function updateTimestamp() {
  const el = document.getElementById('timestamp');
  if (el) el.textContent = new Date().toLocaleString('de-DE');
}

document.getElementById('btn-save').addEventListener('click', saveProtocol);
document.getElementById('btn-load').addEventListener('click', openModal);
document.getElementById('btn-clear').addEventListener('click', () => {
  if (confirm('Formular wirklich leeren?')) {
    clearForm();
    showToast('✓ Formular geleert');
  }
});
document.getElementById('btn-export').addEventListener('click', exportProtocol);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});

updateTimestamp();
setInterval(updateTimestamp, 30000);