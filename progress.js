// ─── Progress Manager (localStorage) ──────────────────────────
import { PROGRESSION, MAX_LEVEL } from './data.js';

const STORAGE_KEY = 'toh_progress';

function getDefaults() {
  return {
    level: 1,
    streak: 0,
    lastPracticeDate: null,   // ISO date string YYYY-MM-DD
    todayCompleted: [],       // item IDs completed today
    todayGoal: 0,             // how many items in today's set
    totalPracticed: 0,
    bestStreak: 0,
    history: []               // [{date, level, completed, total}]
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    return { ...getDefaults(), ...JSON.parse(raw) };
  } catch {
    return getDefaults();
  }
}

export function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ensureTodayInit(progress) {
  const today = getTodayKey();
  if (progress.lastPracticeDate !== today) {
    // New day — check streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (progress.lastPracticeDate === yKey) {
      progress.streak += 1;
    } else if (progress.lastPracticeDate !== today) {
      progress.streak = 0; // streak broken
    }

    progress.lastPracticeDate = today;
    progress.todayCompleted = [];

    // Set today's goal from current level
    const lvl = PROGRESSION[Math.min(progress.level - 1, MAX_LEVEL - 1)];
    progress.todayGoal = lvl.count * 20;

    saveProgress(progress);
  }

  // Ensure goal is up-to-date with the 20x multiplier (for mid-day updates)
  const currentLvl = PROGRESSION[Math.min(progress.level - 1, MAX_LEVEL - 1)];
  if (progress.todayGoal !== currentLvl.count * 20) {
    progress.todayGoal = currentLvl.count * 20;
    saveProgress(progress);
  }

  return progress;
}

export function markItemDone(progress, itemId) {
  if (!progress.todayCompleted.includes(itemId)) {
    progress.todayCompleted.push(itemId);
    progress.totalPracticed += 1;
  }

  // Check if day complete → level up
  if (progress.todayCompleted.length >= progress.todayGoal && progress.level < MAX_LEVEL) {
    progress.level += 1;
  }

  if (progress.streak > progress.bestStreak) {
    progress.bestStreak = progress.streak;
  }

  saveProgress(progress);
  return progress;
}

export function getDailyItems(progress) {
  const lvlData = PROGRESSION[Math.min(progress.level - 1, MAX_LEVEL - 1)];
  return lvlData;
}

export function redoToday(progress) {
  // If they already leveled up today due to completion, revert it so they can replay the same level
  if (progress.todayCompleted.length >= progress.todayGoal && progress.level > 1) {
    progress.level -= 1;
  }
  progress.todayCompleted = [];
  saveProgress(progress);
  return progress;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaults();
}
