/* ================= CONFIG ================= */
const PASSWORD = "1";
const RELATIONSHIP_START = new Date("2026-01-01");

const SUPABASE_URL = "https://mgtioecbvcgqqpmbengw.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY_HERE"; // replace before deploy

const CLOUD_NAME = "dzfarzaew";
const UPLOAD_PRESET = "date_gallery";

/* ================= STATE ================= */
let dates = [];

/* ================= AUTH ================= */
document.getElementById("loginBtn").onclick = () => {
  if (document.getElementById("password").value === PASSWORD) {
    document.getElementById("login").hidden = true;
    document.getElementById("app").hidden = false;
    init();
  }
};

/* ================= INIT ================= */
async function init() {
  await loadDates();
  renderTimeline();
  updateStats();
  updateCounter();
  setInterval(updateCounter, 1000);
}

/* ================= SUPABASE ================= */
async function loadDates() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/dates?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  dates = await res.json();
  dates.sort((a,b)=>new Date(a.date)-new Date(b.date));
}

async function saveDate(dateObj) {
  await fetch(`${SUPABASE_URL}/rest/v1/dates`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(dateObj),
  });
}

/* ================= UI ================= */
function renderTimeline() {
  const el = document.getElementById("timeline");
  el.innerHTML = "";
  dates.forEach(d => {
    el.innerHTML += `
      <div class="date-card">
        <h3>${d.title || "A Date"}</h3>
        <small>${formatDate(d.date)}</small>
        <p>${d.notes || ""}</p>
      </div>
    `;
  });
}

function updateStats() {
  document.getElementById("totalDates").textContent = dates.length;
  document.getElementById("totalPhotos").textContent =
    dates.reduce((s,d)=>s+(d.images?.length||0),0);
  document.getElementById("thisYear").textContent =
    dates.filter(d=>new Date(d.date).getFullYear()===new Date().getFullYear()).length;
}

function updateCounter() {
  const days = Math.floor((Date.now() - RELATIONSHIP_START) / 86400000);
  document.getElementById("daysCounter").textContent = days;
}

/* ================= ADD ================= */
document.getElementById("newDateBtn").onclick = () =>
  document.getElementById("addModal").classList.add("active");

function closeAdd() {
  document.getElementById("addModal").classList.remove("active");
}

document.getElementById("addForm").onsubmit = async e => {
  e.preventDefault();

  const images = [];
  for (const file of document.getElementById("imageInput").files) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );
    const data = await res.json();
    images.push({ url: data.secure_url });
  }

  await saveDate({
    date: dateInput.value,
    title: titleInput.value,
    notes: notesInput.value,
    images,
  });

  closeAdd();
  await loadDates();
  renderTimeline();
  updateStats();
};

/* ================= UTILS ================= */
function formatDate(d) {
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2,"0")}/${String(x.getMonth()+1).padStart(2,"0")}/${x.getFullYear()}`;
}
