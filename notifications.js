// ─── Notification Manager ──────────────────────────────────────

const REMINDER_KEY = 'toh_reminder_hour';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('[SW] Registered', reg.scope);
      return reg;
    } catch (err) {
      console.warn('[SW] Registration failed', err);
    }
  }
  return null;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export function scheduleReminder(hourOfDay = 20) {
  localStorage.setItem(REMINDER_KEY, String(hourOfDay));
  startReminderCheck();
}

let reminderInterval = null;

export function startReminderCheck() {
  if (reminderInterval) clearInterval(reminderInterval);

  // Check every 15 minutes whether we should fire a notification
  reminderInterval = setInterval(() => {
    const hour = parseInt(localStorage.getItem(REMINDER_KEY) || '20', 10);
    const now = new Date();

    if (now.getHours() === hour && now.getMinutes() < 15) {
      // Check if today's goal was met
      try {
        const raw = localStorage.getItem('toh_progress');
        if (raw) {
          const prog = JSON.parse(raw);
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (prog.lastPracticeDate !== today || prog.todayCompleted.length < prog.todayGoal) {
            fireNotification();
          }
        } else {
          fireNotification();
        }
      } catch {
        fireNotification();
      }
    }
  }, 15 * 60 * 1000);
}

function fireNotification() {
  if (Notification.permission === 'granted') {
    new Notification('TheOtherHand ✍️', {
      body: "Time to practice! Your non-dominant hand won't train itself 🖊️",
      icon: './icons/icon-192.png',
      tag: 'daily-reminder'   // prevent duplicate notifications
    });
  }
}

export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
