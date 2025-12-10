/* ========= CONSTANTS ========= */
const KEY = "dailyHabits2";
const CUSTOM_KEY = "customHabits";
const LONGPRESS_TIME = 600;
const NOTE_KEY = "ufoNotes";
const NOTE_PASSWORD = "1234";

/* ========= BASE HABITS ========= */
const BASE_HABITS = [
  {
    id: "walking",
    label: "Walking",
    img: "https://media.giphy.com/media/XGnWMiVXL87Xa/giphy.gif",
  },
  {
    id: "coding",
    label: "Learn Coding",
    img: "https://media.giphy.com/media/p4NLw3I4U0idi/giphy.gif",
  },
  {
    id: "journaling",
    label: "Journaling",
    img: "https://media.giphy.com/media/Ok5n8zFOOTQxxgse17/giphy.gif",
  },
  {
    id: "japanese",
    label: "Learn Japanese",
    img: "items/From KlickPin CF かわいいもの _ Studying gif Aesthetic gif Aesthetic anime.gif",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    img: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
  },
];

const DEFAULT_HABIT_IDS = BASE_HABITS.map((h) => h.id);

/* ========= LOAD STATE ========= */
let storedState = {};
try {
  storedState = JSON.parse(localStorage.getItem(KEY)) || {};
} catch {
  storedState = {};
}

let state = {
  ...DEFAULT_HABIT_IDS.reduce((acc, k) => ({ ...acc, [k]: false }), {}),
  ...storedState,
};

/* ========= CUSTOM HABITS ========= */
let customHabits = [];
try {
  customHabits = JSON.parse(localStorage.getItem(CUSTOM_KEY)) || [];
} catch {
  customHabits = [];
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}
function saveCustom() {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customHabits));
}

/* ========= LABEL HELPER ========= */
function getHabitLabel(id) {
  const base = BASE_HABITS.find((h) => h.id === id);
  if (base) return base.label;
  const custom = customHabits.find((h) => (h.id || h.name) === id);
  if (custom) return custom.label || custom.name;
  return id;
}

/* ========= BUILD CARDS ========= */
function buildHabitCards() {
  const cont = document.querySelector(".habit-container");
  if (!cont) return;
  cont.innerHTML = "";

  function makeCard(id, label, imgUrl) {
    const div = document.createElement("div");
    div.className = "habit-card";
    div.setAttribute("data-habit", id);
    div.innerHTML = `<img src="${imgUrl}"><h2>${label}</h2>`;
    addLongPressDelete(div, id, label);
    return div;
  }

  // base habits
  BASE_HABITS.forEach((h) => {
    cont.appendChild(makeCard(h.id, h.label, h.img));
  });

  // custom habits (support old {name,imgUrl} and new {id,label,imgUrl})
  customHabits.forEach((h) => {
    const id = h.id || h.name;
    const label = h.label || h.name;
    cont.appendChild(makeCard(id, label, h.imgUrl));
  });

  setClicks();
  refreshClasses();
}

/* ========= LONG PRESS DELETE ========= */
function addLongPressDelete(card, id, label) {
  let timer = null;

  function startPress() {
    timer = setTimeout(() => {
      if (
        !DEFAULT_HABIT_IDS.includes(id) &&
        confirm(`Delete task '${label}'?`)
      ) {
        card.dataset.longpressHandled = "1";
        deleteTask(id);
      }
    }, LONGPRESS_TIME);
  }

  function cancelPress() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  card.addEventListener("mousedown", startPress);
  card.addEventListener("mouseup", cancelPress);
  card.addEventListener("mouseleave", cancelPress);
}

function deleteTask(id) {
  if (DEFAULT_HABIT_IDS.includes(id)) return;

  // remove from customHabits
  customHabits = customHabits.filter((h) => (h.id || h.name) !== id);

  // remove from state
  delete state[id];

  // also remove from tracker days
  tracker.forEach((day) => {
    if (day && day[id] !== undefined) {
      delete day[id];
    }
  });
  saveCustom();
  saveState();
  saveTracker();

  buildHabitCards();
  refreshDataPanel();
}

/* ========= SET CLICK TOGGLE ========= */
function setClicks() {
  document.querySelectorAll(".habit-card").forEach((card) => {
    card.onclick = () => {
      // if just long-pressed → don't toggle
      if (card.dataset.longpressHandled === "1") {
        card.dataset.longpressHandled = "0";
        return;
      }

      const id = card.getAttribute("data-habit");
      if (!(id in state)) return;
      state[id] = !state[id];
      saveState();
      refreshClasses();
      showBadgeAt(card);
      checkAllDone();
      updateTrackerForToday();
      if (id === "chatgpt" && state.chatgpt) openChat();
    };
  });
}

/* ========= REFRESH UI ========= */
function refreshClasses() {
  document.querySelectorAll(".habit-card").forEach((card) => {
    const id = card.getAttribute("data-habit");
    card.classList.toggle("done", !!state[id]);
  });
}

/* ========= BADGE ========= */
function showBadgeAt(card) {
  const b = document.getElementById("achieveBadge");
  if (!b) return;
  const r = card.getBoundingClientRect();
  b.style.left = r.left + r.width / 2 - 40 + "px";
  b.style.top = r.bottom + 10 + "px";
  b.style.display = "block";
  b.style.opacity = 1;
  b.style.transform = "scale(1.2)";
  setTimeout(() => {
    b.style.opacity = 0;
    b.style.transform = "scale(0.8)";
    setTimeout(() => {
      b.style.display = "none";
    }, 500);
  }, 1500);
}

/* ========= ChatGPT POPUP ========= */
const chatPopup = document.getElementById("chatgptPopup");
const chatYes = document.getElementById("chatgptYes");
const chatNo = document.getElementById("chatgptNo");

if (chatYes) {
  chatYes.onclick = () => {
    window.open(
      "https://chatgpt.com/c/69384295-88e4-8324-bb1b-5c35c83c36ce",
      "_blank"
    );
    if (chatPopup) chatPopup.classList.remove("show");
  };
}
if (chatNo) {
  chatNo.onclick = () => {
    if (chatPopup) chatPopup.classList.remove("show");
  };
}
function openChat() {
  if (chatPopup) chatPopup.classList.add("show");
}

/* ========= ACHIEVEMENT ========= */
function checkAllDone() {
  const all = Object.values(state).every((v) => v === true);
  if (all) {
    const a = document.getElementById("achievement");
    if (!a) return;
    a.style.visibility = "visible";
    a.style.opacity = "1";
    setTimeout(() => {
      a.style.opacity = "0";
      setTimeout(() => (a.style.visibility = "hidden"), 600);
    }, 2000);
  }
}

/* ========= 21-DAY TRACKER ========= */
const TRACKER_START_KEY = "trackerStart";
const TRACKER_DATA_KEY = "trackerData";
const N = 21;
let trackerStart = null;
let tracker = [];

function norm(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function initTracker() {
  const t = norm(new Date());
  const st = localStorage.getItem(TRACKER_START_KEY);
  const sd = localStorage.getItem(TRACKER_DATA_KEY);

  if (st && sd) {
    const s = norm(new Date(st));
    const diff = ((t - s) / (1000 * 60 * 60 * 24)) | 0;
    if (diff >= 0 && diff < N) {
      trackerStart = s;
      try {
        tracker = JSON.parse(sd) || [];
      } catch {
        tracker = [];
      }
    } else {
      trackerStart = t;
      tracker = [];
    }
  } else {
    trackerStart = t;
    tracker = [];
  }

  while (tracker.length < N) {
    tracker.push({});
  }
  saveTracker();
}

function saveTracker() {
  if (!trackerStart) return;
  localStorage.setItem(TRACKER_START_KEY, trackerStart.toISOString());
  localStorage.setItem(TRACKER_DATA_KEY, JSON.stringify(tracker));
}

function todayIndex() {
  if (!trackerStart) return null;
  const t = norm(new Date());
  const diff = ((t - trackerStart) / (1000 * 60 * 60 * 24)) | 0;
  return diff >= 0 && diff < N ? diff : null;
}

function updateTrackerForToday() {
  const i = todayIndex();
  if (i == null) return;
  tracker[i] = { ...state };
  saveTracker();
  refreshDataPanel();
}

function buildTracker() {
  const g = document.getElementById("tracker21Grid");
  if (!g) return;
  g.innerHTML = "";
  const keys = Object.keys(state);

  tracker.forEach((day, i) => {
    const done = keys.filter((k) => day[k]).length;
    const cls =
      done === 0 ? "empty" : done === keys.length ? "full" : "partial";

    const cell = document.createElement("div");
    cell.className = `tracker-day ${cls}`;
    cell.innerHTML = `
      <span class="day-index">D${i + 1}</span>
      <span class="day-status">${done}/${keys.length}</span>
    `;
    g.appendChild(cell);
  });
}

/* ========= DATA PANEL ========= */
function refreshDataPanel() {
  const dp = document.getElementById("dataPanel");
  if (!dp) return;
  const total = Object.keys(state).length;
  const c = Object.values(state).filter(Boolean).length;
  const countEl = dp.querySelector(".data-count");
  if (countEl) {
    countEl.textContent = `${c} / ${total} habits completed`;
  }

  const list = dp.querySelector(".data-list");
  if (list) {
    list.innerHTML = "";
    Object.keys(state).forEach((id) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="label">${getHabitLabel(id)}</span>
        <span class="value">${state[id] ? "Done" : "Pending"}</span>
      `;
      list.appendChild(li);
    });
  }

  buildTracker();
}

/* ========= ADD TASK (WORKING FOREVER) ========= */
function addTask() {
  const name = prompt("Enter task name:");
  if (!name) return;

  const img = prompt("Enter image URL or local path:");
  if (!img) return;

  // create id
  const id = name.trim().toLowerCase().replace(/\s+/g, "_");

  // avoid duplicates
  if (state[id] !== undefined) {
    alert("A task with this name already exists!");
    return;
  }

  // save in custom habits array
  customHabits.push({
    id: id,
    label: name,
    imgUrl: img,
  });

  // save toggle state
  state[id] = false;

  // save to storage
  saveCustom();
  saveState();

  // update UI
  buildHabitCards();
  refreshDataPanel();

  // also update tracker state for today
  updateTrackerForToday();
}

/* bind existing Add Task button INSIDE data panel */
const staticAddBtn = document.getElementById("addTaskBtn");
if (staticAddBtn) {
  staticAddBtn.addEventListener("click", addTask);
}

/* ========= UFO RANDOM ROAMING + CLOUD ========= */
let ufoStopped = false;
let ufoMoveTimer = null;

function startUfoRoaming() {
  const ufo = document.getElementById("ufo");
  if (!ufo) return;

  if (ufoMoveTimer) clearTimeout(ufoMoveTimer);

  function step() {
    if (ufoStopped) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ufoWidth = 180;
    const ufoHeight = 120;

    const maxX = vw - ufoWidth;
    const maxY = vh - ufoHeight - 150;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    ufo.style.left = x + "px";
    ufo.style.top = y + "px";

    ufoMoveTimer = setTimeout(step, 4000);
  }

  step();
}

function ufoClick() {
  const ufo = document.getElementById("ufo");
  if (!ufo) return;
  if (!ufoStopped) {
    ufoStopped = true;
    if (ufoMoveTimer) {
      clearTimeout(ufoMoveTimer);
      ufoMoveTimer = null;
    }
    positionCloud();
    showCloud();
  }
}
window.ufoClick = ufoClick; // make sure HTML onclick works

function positionCloud() {
  const ufo = document.getElementById("ufo");
  const cloud = document.getElementById("ufoCloud");
  const imgBox = document.getElementById("ufoImage");
  if (!ufo || !cloud || !imgBox) return;

  const rect = ufo.getBoundingClientRect();
  cloud.style.left = rect.left + rect.width / 2 + "px";
  cloud.style.top = rect.bottom + 10 + "px";
  cloud.style.transform = "translateX(-50%)";

  imgBox.style.left = rect.left + rect.width / 2 + "px";
  imgBox.style.top = rect.bottom + 60 + "px";
  imgBox.style.transform = "translateX(-50%)";
}

function showCloud() {
  const cloud = document.getElementById("ufoCloud");
  if (cloud) cloud.style.display = "block";
}

function closeCloud() {
  const cloud = document.getElementById("ufoCloud");
  const imgBox = document.getElementById("ufoImage");
  if (cloud) cloud.style.display = "none";
  if (imgBox) imgBox.style.display = "none";
  ufoStopped = false;
  startUfoRoaming();
}
window.closeCloud = closeCloud;

/* ========= NOTE POPUP ========= */
const notePopup = document.getElementById("notePopup");
const noteInput = notePopup ? document.getElementById("noteInput") : null;

function openNotePopup() {
  if (notePopup) notePopup.classList.add("show");
}

function closeNote() {
  // hide the note popup
  if (notePopup) notePopup.classList.remove("show");

  // hide the UFO image as well
  const imgBox = document.getElementById("ufoImage");
  if (imgBox) imgBox.style.display = "none";

  // resume UFO roaming
  ufoStopped = false;
  startUfoRoaming();
}

function saveNote() {
  if (!noteInput) return;
  const text = noteInput.value.trim();
  if (!text) {
    // no text → just close everything & resume
    closeNote();
    return;
  }

  const now = new Date();
  const entry = {
    text,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
  };

  let prev = [];
  try {
    prev = JSON.parse(localStorage.getItem(NOTE_KEY)) || [];
  } catch {
    prev = [];
  }

  prev.push(entry);
  localStorage.setItem(NOTE_KEY, JSON.stringify(prev));

  noteInput.value = "";

  // after saving, hide note + image, and make UFO roam again
  closeNote();
}

window.saveNote = saveNote;
window.closeNote = closeNote;

/* ========= VIEW NOTES (PASSWORD PROTECTED) ========= */

function viewNotes() {
  const pwd = prompt("Enter password to view notes:");
  if (pwd === null) return; // user cancelled
  if (pwd !== NOTE_PASSWORD) {
    alert("Incorrect password");
    return;
  }
  showNoteList();
}

function showNoteList() {
  let notes = [];
  try {
    notes = JSON.parse(localStorage.getItem(NOTE_KEY)) || [];
  } catch {
    notes = [];
  }

  const listPopup = document.getElementById("noteListPopup");
  const listContainer = document.getElementById("noteList");
  if (!listPopup || !listContainer) return;

  if (!notes.length) {
    listContainer.innerHTML = "<p>No notes saved yet.</p>";
  } else {
    listContainer.innerHTML = notes
      .map((n, i) => {
        const date = n.date || "";
        const rawTime = n.time || "";
        const time = formatTimeTo12Hour(rawTime);
        const text = escapeHtml(n.text || "");

        return `
  <div style="
    background:rgba(255,255,255,0.07);
    padding:18px 22px;
    margin-bottom:18px;
    border-left:6px solid #a855ff;
    border-radius:12px;
  ">
    <div style="font-size:20px;opacity:0.9;margin-bottom:6px;font-weight:600;">
      Note ${i + 1}
    </div>

    <div style="margin-bottom:12px;font-size:17px;">
      ${text}
    </div>

    <div style="font-size:14px;opacity:0.7;">
      <b>${date}</b> • ${time}
    </div>
  </div>
`;
      })
      .join("");
  }

  listPopup.classList.add("show");
}

function closeNoteList() {
  const listPopup = document.getElementById("noteListPopup");
  if (listPopup) listPopup.classList.remove("show");
}

function formatTimeTo12Hour(rawTime) {
  if (!rawTime) return "";

  // if already has AM/PM, just return
  if (/am|pm/i.test(rawTime)) {
    return rawTime;
  }

  // try to parse something like "13:45:00" or "13:45"
  const parts = rawTime.split(":");
  if (parts.length < 2) {
    return rawTime; // unknown format, show as is
  }

  let hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return rawTime;

  let minute = parts[1];
  // remove seconds if present, e.g. "45:12" -> "45"
  if (minute && minute.length >= 2) {
    minute = minute.slice(0, 2);
  }

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
}

/* small helper to avoid HTML breaking from note text */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (ch) {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}

// make functions available for inline onclick in HTML
window.viewNotes = viewNotes;
window.closeNoteList = closeNoteList;

/* ========= UFO IMAGE (YES BUTTON) ========= */
function seeImage() {
  const cloud = document.getElementById("ufoCloud");
  const imgBox = document.getElementById("ufoImage");
  const imgEl = document.getElementById("ufoImgSmall");
  if (cloud) cloud.style.display = "none";
  if (!imgBox || !imgEl) return;

  const imgs = [
    "items/ufo_images/IMG_2581.jpeg",
    "items/ufo_images/IMG_3351.jpeg",
    "items/ufo_images/IMG_3581.jpeg",
    "items/ufo_images/IMG_5704.jpeg",
    "items/ufo_images/IMG_5776.jpeg",
    "items/ufo_images/IMG_5966.jpeg",
    "items/ufo_images/IMG_2433.jpeg",
    "items/ufo_images/IMG_5116.jpeg",
    "items/ufo_images/IMG_3708.jpeg",
    "items/ufo_images/IMG_3428.jpeg",
    "items/ufo_images/IMG_5080 2.png",
    "items/ufo_images/IMG_2184.png",
    "items/ufo_images/IMG_3582.png",
  ];

  const chosen = imgs[Math.floor(Math.random() * imgs.length)];
  imgEl.src = chosen;
  imgBox.style.display = "block";

  // open note popup along with image
  openNotePopup();
}
window.seeImage = seeImage;

/* close UFO image when clicking outside (but NOT when typing note) */
document.addEventListener("click", function (e) {
  const box = document.getElementById("ufoImage");
  const cloud = document.getElementById("ufoCloud");
  if (!box || !cloud) return;

  // if note popup exists, ignore clicks inside it
  const notePopupEl =
    typeof notePopup !== "undefined" ? notePopup : document.getElementById("notePopup");
  const noteListPopupEl = document.getElementById("noteListPopup");

  if (
    box.style.display === "block" &&
    !box.contains(e.target) &&
    !cloud.contains(e.target) &&
    !e.target.closest("#ufo") &&
    !(notePopupEl && notePopupEl.contains(e.target)) &&
    !(noteListPopupEl && noteListPopupEl.contains(e.target))
  ) {
    box.style.display = "none";
  }
});

/* ========= SCROLL UFO + STAGES ========= */
let scrollUfoPos = 20;
const scrollUfo = document.getElementById("scrollUfo");
const fadeOverlayEl = document.getElementById("fadeOverlay");
const fadeTargets = document.querySelectorAll(
  ".mainTitle,.subTitle,#parkedCar,.eyes,#city,#cityBack,.swipeText"
);
let stage = "world";
let atTop = false;
let topAcc = 0;

function setSceneFade(a) {
  fadeTargets.forEach((el) => {
    el.style.opacity = a;
  });
}

function setStage(s) {
  stage = s;
  const dp = document.getElementById("dataPanel");
  if (!dp) return;

  if (s === "world") {
    document.body.classList.remove("topTasks", "topData");
    dp.classList.remove("show");
  } else if (s === "tasks") {
    document.body.classList.add("topTasks");
    document.body.classList.remove("topData");
    dp.classList.remove("show");
  } else if (s === "data") {
    document.body.classList.add("topTasks", "topData");
    dp.classList.add("show");
    refreshDataPanel();
  }
}

window.addEventListener("wheel", (e) => {
  if (!scrollUfo) return;

  if (e.deltaY < 0) scrollUfoPos += 20;
  else scrollUfoPos -= 20;

  const min = 20,
    max = window.innerHeight - 200;
  if (scrollUfoPos < min) scrollUfoPos = min;
  if (scrollUfoPos > max) scrollUfoPos = max;

  scrollUfo.style.bottom = scrollUfoPos + "px";
  let sc = 1 + (scrollUfoPos / window.innerHeight) * 1.8;
  scrollUfo.style.transform = `translateX(-50%) scale(${sc})`;

  let fade = 1 - scrollUfoPos / (window.innerHeight * 0.8);
  if (fade < 0.75) fade = 0.75;
  document.body.style.filter = `brightness(${fade})`;

  const t = (scrollUfoPos - min) / (max - min || 1);
  setSceneFade(1 - t * 0.8);
  if (fadeOverlayEl) fadeOverlayEl.style.opacity = (t * 0.85).toFixed(3);

  if (scrollUfo.style.opacity === "0" || scrollUfo.style.opacity === "") {
    scrollUfo.style.opacity = "1";
    scrollUfo.style.pointerEvents = "auto";
  }

  const was = atTop;
  atTop = scrollUfoPos >= max - 80;

  if (!atTop) {
    topAcc = 0;
    if (stage !== "world") setStage("world");
    return;
  }

  if (atTop && !was) {
    topAcc = 0;
    setStage("tasks");
    return;
  }

  if (e.deltaY < 0) {
    if (stage === "tasks") {
      topAcc += -e.deltaY;
      if (topAcc > 800) setStage("data");
    }
  } else {
    if (stage === "data") {
      topAcc += e.deltaY;
      if (topAcc > 800) setStage("tasks");
    }
  }
});

/* ========= EYES FOLLOW MOUSE ========= */
document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".pupil").forEach((pupil) => {
    const eye = pupil.parentElement;
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const max = 8;
    const ang = Math.atan2(dy, dx);
    const moveX = Math.cos(ang) * max;
    const moveY = Math.sin(ang) * max;
    pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});

/* ========= INIT ========= */
buildHabitCards();
initTracker();
refreshDataPanel();
startUfoRoaming();
