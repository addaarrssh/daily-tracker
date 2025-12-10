const KEY = "dailyHabits2";

/* ==== STATE with 5 HABITS (merge with old storage) ==== */
const defaultState = {
  walking:false,
  coding:false,
  journaling:false,
  japanese:false,
  chatgpt:false,   // 5th habit
};

let storedState;
try{
  storedState = JSON.parse(localStorage.getItem(KEY)) || {};
}catch{
  storedState = {};
}

// ensure all 5 keys exist
let state = {
  ...defaultState,
  ...storedState
};

function save(){
  localStorage.setItem(KEY, JSON.stringify(state));
}

function refresh(){
  document.querySelectorAll(".habit-card").forEach(card=>{
    const habit = card.getAttribute("data-habit");
    if(habit in state){
      card.classList.toggle("done", !!state[habit]);
    }else{
      card.classList.remove("done");
    }
  });
}

/* ==== ACHIEVEMENT BADGE FUNCTION ==== */
function showBadgeAt(cardElement){
  const badge = document.getElementById("achieveBadge");
  if(!badge) return;

  const rect = cardElement.getBoundingClientRect();

  badge.style.left = (rect.left + rect.width/2 - 40) + "px";
  badge.style.top  = (rect.bottom + 10) + "px";

  badge.style.display = "block";
  badge.style.opacity = 1;
  badge.style.transform = "scale(1.2)";

  setTimeout(()=>{
    badge.style.opacity = 0;
    badge.style.transform = "scale(0.8)";
    setTimeout(()=> badge.style.display="none",500);
  },2000);
}

/* ==== ChatGPT redirect popup ==== */
const chatgptPopup = document.getElementById("chatgptPopup");
const chatgptYes   = document.getElementById("chatgptYes");
const chatgptNo    = document.getElementById("chatgptNo");

function openChatgptPopup(){
  if(chatgptPopup){
    chatgptPopup.classList.add("show");
  }
}
function closeChatgptPopup(){
  if(chatgptPopup){
    chatgptPopup.classList.remove("show");
  }
}

if(chatgptYes){
  chatgptYes.addEventListener("click", ()=>{
    window.open("https://chatgpt.com/c/69384295-88e4-8324-bb1b-5c35c83c36ce", "_blank");
    closeChatgptPopup();
  });
}
if(chatgptNo){
  chatgptNo.addEventListener("click", ()=>{
    closeChatgptPopup();
  });
}

/* ========= habit click ========= */
document.querySelectorAll(".habit-card").forEach(card=>{
  card.addEventListener("click", ()=>{
    const key = card.getAttribute("data-habit");

    // only handle known habits
    if(!(key in state)) return;

    // toggle habit done / not done
    state[key] = !state[key];
    save();
    refresh();
    showBadgeAt(card);
    checkAllDone();
    updateTrackerForToday();

    // if ChatGPT just turned done => ask to redirect
    if(key === "chatgpt" && state.chatgpt){
      openChatgptPopup();
    }
  });
});

refresh();

/* ========== UFO LOGIC (random roaming) ========== */
function makeConfetti(){
  for(let i=0;i<40;i++){
    const c=document.createElement("div");
    c.className="confetti";
    c.style.left= (Math.random()*100) + "vw";
    c.style.top = "-10px";
    c.style.background = "hsl("+Math.random()*360+",90%,60%)";
    c.style.position="fixed";
    c.style.width="10px";
    c.style.height="10px";
    c.style.borderRadius="2px";
    c.style.zIndex="9999999";
    document.body.appendChild(c);

    setTimeout(()=>{
      c.style.transition="3s";
      c.style.top="110vh";
      c.style.transform="translateY(100vh) rotate(720deg)";
      setTimeout(()=>c.remove(),3000);
    },10);
  }
}

let ufoStopped = false;
let ufoMoveTimer = null;

function startUfoRoaming(){
  const ufo = document.getElementById("ufo");
  if(!ufo) return;

  if(ufoMoveTimer) clearTimeout(ufoMoveTimer);

  function step(){
    if(ufoStopped) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const ufoWidth  = 180;
    const ufoHeight = 120;

    const maxX = vw - ufoWidth;
    const maxY = vh - ufoHeight - 150;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    ufo.style.left = x + "px";
    ufo.style.top  = y + "px";

    ufoMoveTimer = setTimeout(step, 4000);
  }

  step();
}

function checkAllDone(){
  // now checks all 5 habits
  const done = Object.values(state).every(v=>v===true);
  if(done){
    showAchievement();
  }
}

function showAchievement(){
  const ach = document.getElementById("achievement");
  if(!ach) return;
  ach.style.visibility="visible";
  ach.style.opacity="1";
  makeConfetti();
  setTimeout(()=>{
    ach.style.opacity="0";
    setTimeout(()=> ach.style.visibility="hidden",500);
  },3500);
}

function ufoClick(){
  if(!ufoStopped){
    ufoStopped = true;
    if(ufoMoveTimer){
      clearTimeout(ufoMoveTimer);
      ufoMoveTimer = null;
    }
    positionCloud();
    showCloud();
  }
}

function positionCloud(){
  const ufo = document.getElementById("ufo");
  const rect = ufo.getBoundingClientRect();

  const cloud = document.getElementById("ufoCloud");
  const imgBox = document.getElementById("ufoImage");
  if(!cloud || !imgBox) return;

  cloud.style.left = rect.left + rect.width/2 + "px";
  cloud.style.top  = rect.bottom + 10 + "px";
  cloud.style.transform = "translateX(-50%)";

  imgBox.style.left = rect.left + rect.width/2 + "px";
  imgBox.style.top  = rect.bottom + 60 + "px";
  imgBox.style.transform = "translateX(-50%)";
}

function showCloud(){
  const cloud = document.getElementById("ufoCloud");
  if(cloud) cloud.style.display="block";
}

function closeCloud(){
  const cloud = document.getElementById("ufoCloud");
  const imgBox = document.getElementById("ufoImage");
  if(cloud) cloud.style.display="none";
  if(imgBox) imgBox.style.display="none";
  ufoStopped = false;
  startUfoRoaming();
}

function seeImage(){
  const cloud = document.getElementById("ufoCloud");
  const imgBox = document.getElementById("ufoImage");
  const imgEl  = document.getElementById("ufoImgSmall");
  if(cloud) cloud.style.display="none";
  if(!imgBox || !imgEl) return;

  const imgs = [
    "items/ufo_images/IMG_2184.png",
    "items/ufo_images/IMG_3582.png",
    "items/ufo_images/IMG_5080 2.png"
  ];
  const chosen = imgs[Math.floor(Math.random()*imgs.length)];

  imgEl.src = chosen;
  imgBox.style.display="block";
}

startUfoRoaming();

/* ========== EYES FOLLOW MOUSE ========== */
document.addEventListener("mousemove",(e)=>{
  document.querySelectorAll(".pupil").forEach(pupil=>{
    const eye = pupil.parentElement;
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const max = 8;
    const ang = Math.atan2(dy, dx);
    const moveX = Math.cos(ang)*max;
    const moveY = Math.sin(ang)*max;
    pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});

/* ==== Manual SCROLL UFO + Scene Fade + TOP STAGES + TRACKER ==== */
let scrollUfoPos = 20;
const scrollUfo   = document.getElementById("scrollUfo");
const dataPanel   = document.getElementById("dataPanel");
const fadeOverlay = document.getElementById("fadeOverlay");

const fadeTargets = document.querySelectorAll(
  ".mainTitle, .subTitle, #parkedCar, .eyes, #city, #cityBack, .swipeText"
);

let pageStage = "world";         // "world" | "tasks" | "data"
let atTop = false;
let topScrollAccum = 0;

/* 21-DAY TRACKER (starting from TODAY) */
const TRACKER_START_KEY = "tracker21Start";
const TRACKER_DATA_KEY  = "tracker21Data";
const TOTAL_TRACKER_DAYS = 21;

let trackerStartDate = null;
let trackerDays = [];

function normalizeDate(d){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function initTracker21(){
  const today = normalizeDate(new Date());
  const storedStart = localStorage.getItem(TRACKER_START_KEY);
  const storedData  = localStorage.getItem(TRACKER_DATA_KEY);

  if(storedStart && storedData){
    const start = normalizeDate(new Date(storedStart));
    const diffMs = today - start;
    const diffDays = Math.floor(diffMs / (1000*60*60*24));

    if(diffDays >= 0 && diffDays < TOTAL_TRACKER_DAYS){
      trackerStartDate = start;
      try{
        trackerDays = JSON.parse(storedData) || [];
      }catch{
        trackerDays = [];
      }
    }else{
      trackerStartDate = today;
      trackerDays = [];
    }
  }else{
    trackerStartDate = today;
    trackerDays = [];
  }

  if(trackerDays.length < TOTAL_TRACKER_DAYS){
    for(let i=trackerDays.length; i<TOTAL_TRACKER_DAYS; i++){
      trackerDays[i] = {
        index: i+1,
        walking:false,
        coding:false,
        journaling:false,
        japanese:false,
        chatgpt:false,
      };
    }
  }

  localStorage.setItem(TRACKER_START_KEY, trackerStartDate.toISOString());
  localStorage.setItem(TRACKER_DATA_KEY, JSON.stringify(trackerDays));
}

// returns 0..20 for today, or null if out of range
function getTodayTrackerIndex(){
  if(!trackerStartDate) return null;
  const today = normalizeDate(new Date());
  const diffMs = today - trackerStartDate;
  const diffDays = Math.floor(diffMs / (1000*60*60*24));
  if(diffDays < 0 || diffDays >= TOTAL_TRACKER_DAYS) return null;
  return diffDays;
}

function updateTrackerForToday(){
  const idx = getTodayTrackerIndex();
  if(idx === null) return;

  if(!trackerDays[idx]){
    trackerDays[idx] = {
      index: idx+1,
      walking:false,
      coding:false,
      journaling:false,
      japanese:false,
      chatgpt:false,
    };
  }

  trackerDays[idx].walking    = !!state.walking;
  trackerDays[idx].coding     = !!state.coding;
  trackerDays[idx].journaling = !!state.journaling;
  trackerDays[idx].japanese   = !!state.japanese;
  trackerDays[idx].chatgpt    = !!state.chatgpt;

  localStorage.setItem(TRACKER_DATA_KEY, JSON.stringify(trackerDays));
}

// build the 21-day tracker grid
function build21DayTracker(){
  const grid = document.getElementById("tracker21Grid");
  if(!grid) return;

  grid.innerHTML = "";

  trackerDays.forEach(day=>{
    const doneCount = ["walking","coding","journaling","japanese","chatgpt"]
      .filter(k => day[k]).length;

    let statusText;
    let statusClass;

    if(doneCount === 0){
      statusText = "0/5";
      statusClass = "empty";
    }else if(doneCount === 5){
      statusText = "5/5";
      statusClass = "full";
    }else{
      statusText = `${doneCount}/5`;
      statusClass = "partial";
    }

    const cell = document.createElement("div");
    cell.className = `tracker-day ${statusClass}`;
    cell.innerHTML = `
      <span class="day-index">D${day.index}</span>
      <span class="day-status">${statusText}</span>
    `;
    grid.appendChild(cell);
  });
}

// update data panel contents from current state
function updateDataPanel(){
  if(!dataPanel) return;

  const count = Object.values(state).filter(Boolean).length;
  const countEl = dataPanel.querySelector(".data-count");
  const listEl  = dataPanel.querySelector(".data-list");
  if(countEl){
    countEl.textContent = `${count} / 5 habits completed`;
  }
  if(listEl){
    listEl.innerHTML = `
      <li><span class="label">Walking</span><span class="value">${state.walking ? "Done" : "Pending"}</span></li>
      <li><span class="label">Learn Coding</span><span class="value">${state.coding ? "Done" : "Pending"}</span></li>
      <li><span class="label">Journaling</span><span class="value">${state.journaling ? "Done" : "Pending"}</span></li>
      <li><span class="label">Learn Japanese</span><span class="value">${state.japanese ? "Done" : "Pending"}</span></li>
      <li><span class="label">ChatGPT</span><span class="value">${state.chatgpt ? "Done" : "Pending"}</span></li>
    `;
  }

  build21DayTracker();
}

function setSceneFade(amount){
  const clamped = Math.max(0.1, Math.min(1, amount));
  fadeTargets.forEach(el => {
    el.style.opacity = clamped;
  });
}

function setStage(newStage){
  pageStage = newStage;

  if(newStage === "world"){
    document.body.classList.remove("topTasks","topData");
    if(dataPanel) dataPanel.classList.remove("show");
  }else if(newStage === "tasks"){
    document.body.classList.add("topTasks");
    document.body.classList.remove("topData");
    if(dataPanel) dataPanel.classList.remove("show");
  }else if(newStage === "data"){
    document.body.classList.add("topTasks");
    document.body.classList.add("topData");
    if(dataPanel){
      dataPanel.classList.add("show");
      updateDataPanel();
    }
  }
}

// init tracker once at load
initTracker21();

window.addEventListener("wheel", (e)=>{
  if(!scrollUfo) return;

  // manual UFO movement
  if(e.deltaY < 0){
    scrollUfoPos += 20;  // scroll up -> UFO goes higher
  }else{
    scrollUfoPos -= 20;  // scroll down -> UFO goes lower
  }

  const minPos = 20;
  const maxPos = window.innerHeight - 200;

  if(scrollUfoPos < minPos) scrollUfoPos = minPos;
  if(scrollUfoPos > maxPos) scrollUfoPos = maxPos;

  scrollUfo.style.bottom = scrollUfoPos + "px";

  // UFO grows as it rises
  let scale = 1 + (scrollUfoPos / window.innerHeight) * 1.8;
  scrollUfo.style.transform = `translateX(-50%) scale(${scale})`;

  // global brightness
  let fade = 1 - (scrollUfoPos / (window.innerHeight * 0.8));
  if(fade < 0.75) fade = 0.75;
  document.body.style.filter = `brightness(${fade})`;

  // scene fading for main world
  const t = (scrollUfoPos - minPos) / (maxPos - minPos || 1); // 0 → bottom, 1 → top
  const sceneOpacity = 1 - t * 0.8;
  setSceneFade(sceneOpacity);

  // dark overlay opacity
  if(fadeOverlay){
    fadeOverlay.style.opacity = (t * 0.85).toFixed(3);
  }

  // reveal scroll UFO on first scroll
  if(scrollUfo && (scrollUfo.style.opacity === "0" || scrollUfo.style.opacity === "")){
    scrollUfo.style.opacity = "1";
    scrollUfo.style.pointerEvents = "auto";
  }

  /* ===== TOP ZONE DETECTION ===== */
  const topThreshold = maxPos - 80;
  const wasAtTop = atTop;
  atTop = scrollUfoPos >= topThreshold;

  if(!atTop){
    // leaving top area -> reset to world
    topScrollAccum = 0;
    if(pageStage !== "world"){
      setStage("world");
    }
    return;
  }

  // just entered top zone
  if(atTop && !wasAtTop){
    topScrollAccum = 0;
    setStage("tasks");  // Stage 1: tasks floating in middle
    return;
  }

  // already at top zone, handle stages with extra scroll
  if(e.deltaY < 0){
    // scrolling UP inside top zone
    if(pageStage === "tasks"){
      topScrollAccum += (-e.deltaY);  // accumulate positive value

      if(topScrollAccum > 220){
        setStage("data");             // Stage 2: tasks go left, data panel enters
      }
    }
  }else if(e.deltaY > 0){
    // scrolling DOWN inside top zone
    if(pageStage === "data"){
      topScrollAccum += e.deltaY;
      if(topScrollAccum > 160){
        topScrollAccum = 0;
        setStage("tasks");            // go back to center tasks
      }
    }else if(pageStage === "tasks"){
      topScrollAccum = 0;
    }
  }
});

/* close UFO image when clicking outside */
document.addEventListener("click",function(e){
  const box   = document.getElementById("ufoImage");
  const cloud = document.getElementById("ufoCloud");

  if(
    box && cloud &&
    box.style.display==="block" &&
    !box.contains(e.target) &&
    !cloud.contains(e.target) &&
    !e.target.closest("#ufo")
  ){
    box.style.display="none";
  }
});

/* SPLASH REMOVE */
setTimeout(()=>{
  const splash=document.getElementById("splash");
  if(splash) splash.remove();
},1000);
