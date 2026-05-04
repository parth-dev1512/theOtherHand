import { loadProgress, ensureTodayInit, markItemDone, getDailyItems, redoToday } from './progress.js';
import { requestNotificationPermission, scheduleReminder, getNotificationStatus, registerServiceWorker } from './notifications.js';
import { PRACTICE_BANK } from './data.js';
import { CanvasEngine } from './canvas.js';

// ─── App State ──────────────────────────────────────────────────
let progressState = null;
let canvasEngine = null;
let currentPracticeItem = null; // { id, template }
let isDailyPractice = false;

// ─── DOM Elements ───────────────────────────────────────────────
const viewProgress = document.getElementById('view-progress');
const viewBank = document.getElementById('view-bank');
const navProgress = document.getElementById('nav-progress');
const navBank = document.getElementById('nav-bank');

const canvasOverlay = document.getElementById('canvas-overlay');
const drawingCanvas = document.getElementById('drawing-canvas');
const canvasTitle = document.getElementById('active-item-title');
const btnCloseCanvas = document.getElementById('btn-close-canvas');
const btnUndo = document.getElementById('btn-undo');
const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');
const btnRedo = document.getElementById('btn-redo');

// ─── Initialization ─────────────────────────────────────────────
async function initApp() {
  await registerServiceWorker();
  
  // Load & init progress
  progressState = loadProgress();
  progressState = ensureTodayInit(progressState);
  
  renderDashboard();
  renderPracticeBank();

  // Initialize Canvas Engine
  canvasEngine = new CanvasEngine(drawingCanvas);

  // Setup Event Listeners
  navProgress.addEventListener('click', () => switchView('progress'));
  navBank.addEventListener('click', () => switchView('bank'));

  btnCloseCanvas.addEventListener('click', closeCanvas);
  btnUndo.addEventListener('click', () => canvasEngine.undo());
  btnClear.addEventListener('click', () => canvasEngine.clear());
  btnSubmit.addEventListener('click', submitPractice);
  if (btnRedo) {
    btnRedo.addEventListener('click', () => {
      if (confirm("Are you sure you want to completely restart today's worksheet?")) {
        progressState = redoToday(progressState);
        renderDashboard();
      }
    });
  }

  checkNotificationBanner();
}

// ─── View Routing ───────────────────────────────────────────────
function switchView(viewName) {
  if (viewName === 'progress') {
    viewProgress.classList.add('active');
    viewBank.classList.remove('active');
    navProgress.classList.add('active');
    navBank.classList.remove('active');
    renderDashboard(); // Re-render to reflect any changes
  } else if (viewName === 'bank') {
    viewBank.classList.add('active');
    viewProgress.classList.remove('active');
    navBank.classList.add('active');
    navProgress.classList.remove('active');
  }
}

// ─── Rendering ──────────────────────────────────────────────────
function renderDashboard() {
  // Update Stats
  document.getElementById('stat-streak').textContent = progressState.streak;
  document.getElementById('stat-level').textContent = progressState.level;
  
  const dailyLvl = getDailyItems(progressState);
  document.getElementById('level-title').textContent = dailyLvl.title;
  document.getElementById('level-desc').textContent = dailyLvl.desc;

  // Generate Daily Task List
  // For daily tasks, we pick random items from allowed categories
  // In a real app we might persist the specific daily items so they don't shuffle,
  // but for simplicity we generate dynamically or just grab the first N items.
  const taskContainer = document.getElementById('daily-tasks');
  taskContainer.innerHTML = '';

  let possibleItems = [];
  dailyLvl.categories.forEach(catKey => {
    if (catKey === 'words' && dailyLvl.words) {
      dailyLvl.words.forEach(w => possibleItems.push({ id: `word-${w}`, label: w, template: w }));
    } else if (PRACTICE_BANK[catKey]) {
      possibleItems = possibleItems.concat(PRACTICE_BANK[catKey].items);
    }
  });

  // Simple deterministic shuffle based on date
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getDate();
  let shuffled = [...possibleItems].sort((a,b) => (b.id.length * seed) % 3 - 1);
  
  const baseItemsCount = Math.ceil(progressState.todayGoal / 20);
  const baseItems = shuffled.slice(0, baseItemsCount);

  const todaysItems = [];
  baseItems.forEach(item => {
    for (let i = 0; i < 20; i++) {
      todaysItems.push({ ...item, id: `${item.id}-copy-${i}` });
    }
  });

  let completedCount = 0;

  todaysItems.forEach((item, index) => {
    const isDone = progressState.todayCompleted.includes(item.id);
    if (isDone) completedCount++;

    const div = document.createElement('div');
    div.className = `task-dot ${isDone ? 'done' : ''}`;
    // If it's a multi-char string, show first letter, else the whole string
    div.textContent = item.template.length > 2 ? item.template[0] : item.template;
    
    if (!isDone) {
      div.addEventListener('click', () => openCanvas(item, true));
    }
    taskContainer.appendChild(div);
  });

  document.getElementById('progress-text').textContent = `${completedCount} / ${progressState.todayGoal} complete`;
}

function renderPracticeBank() {
  const container = document.getElementById('bank-container');
  container.innerHTML = '';

  Object.entries(PRACTICE_BANK).forEach(([key, category]) => {
    const section = document.createElement('div');
    section.className = 'category-section';

    const title = document.createElement('div');
    title.className = 'category-title';
    title.innerHTML = `<span>${category.icon}</span> ${category.label}`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'item-grid';

    category.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'grid-item';
      // For long items show first char, else template
      el.textContent = item.label.length > 3 ? item.label.substring(0,2) : item.template;
      el.addEventListener('click', () => openCanvas(item, false));
      grid.appendChild(el);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ─── Canvas Interactions ────────────────────────────────────────
function openCanvas(item, isDaily) {
  currentPracticeItem = item;
  isDailyPractice = isDaily;
  
  canvasTitle.textContent = `Practice: ${item.label}`;
  canvasEngine.clear();
  canvasEngine.setTemplate(item.template);
  
  canvasOverlay.classList.add('active');
  // Need slight delay to allow display to change before measuring dims
  setTimeout(() => {
    canvasEngine.resize();
  }, 50);
}

function closeCanvas() {
  canvasOverlay.classList.remove('active');
  currentPracticeItem = null;
}

function submitPractice() {
  if (!canvasEngine.hasContent()) {
    // Optionally show toast message
    return;
  }

  if (isDailyPractice && currentPracticeItem) {
    progressState = markItemDone(progressState, currentPracticeItem.id);
    renderDashboard();
  }
  
  closeCanvas();
}

// ─── Notifications ──────────────────────────────────────────────
function checkNotificationBanner() {
  const status = getNotificationStatus();
  const banner = document.getElementById('notification-banner');
  
  if (status === 'default') {
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
    if (status === 'granted') {
      scheduleReminder(20); // 8 PM
    }
  }
}

document.getElementById('btn-enable-notif').addEventListener('click', async () => {
  const res = await requestNotificationPermission();
  checkNotificationBanner();
  if (res === 'granted') {
    scheduleReminder(20);
  }
});

// Boot
window.addEventListener('DOMContentLoaded', initApp);
