import { timerInterval, isRunning, isOnBreak, currentCycleIndex, formatTime, resetTimerState } from './timer.js';
import { playSound, stopSound } from './sound.js';
import { showSwal } from './swal.js';
import { generatePomodoroPlan, showPlanPreview } from './plan.js';

let pomodoroPlan = [];

// DOM Elements
const workDurationInput = document.getElementById('workDuration');
const cyclesInput = document.getElementById('cycles');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const timerDisplay = document.getElementById('timerDisplay');
const progress = document.getElementById('progress');
const status = document.getElementById('status');
const cyclesCompleted = document.getElementById('cyclesCompleted');
const displayWorkDuration = document.getElementById('displayWorkDuration');
const adaptiveModeCheckbox = document.getElementById('adaptiveMode');
const adaptivePlanPreview = document.getElementById('adaptivePlanPreview');
const planList = document.getElementById('planList');

// State variables
let localState = {
  isRunning: false,
  isOnBreak: false,
  currentCycleIndex: 0,
  timerInterval: null
};

let isPaused = false;
let remainingTime = 0;
let targetEndTime = null;

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker berhasil didaftarkan:', registration);
      })
      .catch(error => {
        console.error('Service Worker gagal didaftarkan:', error);
      });
  });
}

// Request notification permission
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
      showSwal('notif-denied');  // Using SweetAlert for permission denial
    }
  });
}

function sendNotification(title, body, soundKey, loop = true) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: 'assets/images/nona-cute.png'
    });

    try {
      if (soundKey) {
        playSound(soundKey, loop);
      } else {
        playSound('finish', loop); // fallback sound
      }
    } catch (e) {
      console.warn('Gagal memainkan suara notifikasi:', e);
      playSound('finish', loop);
    }

    notification.onclick = () => {
      try {
        if (soundKey) {
          stopSound(soundKey);
        } else {
          stopSound('finish');
        }
      } catch (e) {
        console.warn('Gagal menghentikan suara:', e);
      }
      notification.close();
      window.focus();
    };
  } else {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        sendNotification(title, body, soundKey, true);
      }
    });
  }
}

function runCycle() {
  if (localState.currentCycleIndex >= pomodoroPlan.length) {
    status.textContent = "Semua siklus selesai 🎉";
    sendNotification('Semua Selesai 🎉', 'Kamu menyelesaikan semua siklus hari ini!', 'finish');
    showSwal('done');
    localState.isRunning = false;
    return;
  }

  const cycle = pomodoroPlan[localState.currentCycleIndex];
  const isLongBreak = cycle.cycle % 4 === 0;
  const phase = localState.isOnBreak ? (isLongBreak ? 'Istirahat Panjang' : 'Istirahat') : 'Kerja';
  let totalTime = remainingTime > 0 ? remainingTime : (localState.isOnBreak ? cycle.break : cycle.work);

  if (totalTime <= 0) {
    if (localState.isOnBreak) {
      localState.currentCycleIndex++;
      localState.isOnBreak = false;
    } else {
      localState.isOnBreak = true;
    }
    remainingTime = 0;
    runCycle();
    return;
  }

  targetEndTime = Date.now() + totalTime * 1000;

  if (!localState.isOnBreak) {
    sendNotification('Mulai Bekerja 💻', 'Fokus ya! Waktunya kerja.', 'start');
    showSwal('start');
  } else {
    const breakMsg = isLongBreak ? 'Saatnya istirahat panjang.' : 'Ambil napas sebentar ya.';
    const breakSwal = isLongBreak ? 'longbreak' : 'break';
    sendNotification('Istirahat 😌', breakMsg, 'break');
    showSwal(breakSwal);
  }

  status.textContent = `${phase} (${Math.floor(totalTime / 60)} menit)`;

  localState.timerInterval = setInterval(() => {
    const now = Date.now();
    totalTime = Math.max(0, Math.floor((targetEndTime - now) / 1000));
    remainingTime = totalTime;

    timerDisplay.textContent = formatTime(totalTime);
    const totalPhaseTime = localState.isOnBreak ? cycle.break : cycle.work;
    const elapsed = totalPhaseTime - totalTime;
    progress.style.width = `${(elapsed / totalPhaseTime) * 100}%`;

    if (totalTime <= 0) {
      clearInterval(localState.timerInterval);
      localState.timerInterval = null;

      if (!localState.isOnBreak) {
        cyclesCompleted.textContent = `Siklus selesai: ${cycle.cycle}`;
        localState.isOnBreak = true;
      } else {
        localState.currentCycleIndex++;
        localState.isOnBreak = false;
      }
      remainingTime = 0;
      runCycle();
    }
  }, 1000);
}

function updateCalculatedCycles() {
  const workDuration = parseInt(workDurationInput.value) || 0;
  const calc = Math.floor(workDuration / 25);
  cyclesInput.value = calc || 1;
}

document.addEventListener('DOMContentLoaded', () => {
  // preload sound once on first user interaction
  document.body.addEventListener('click', () => {
    // playSound('start', false);
    // playSound('break', false);
    // playSound('finish', false);
  }, { once: true });

  workDurationInput.addEventListener('input', (e) => {
    displayWorkDuration.textContent = e.target.value;
    updateCalculatedCycles();
  });

  startButton.addEventListener('click', () => {
    if (pomodoroPlan.length === 0) {
      showSwal('not-saved');
      return;
    }
    if (localState.isRunning) return;
    localState.isRunning = true;
    if (!isPaused) remainingTime = 0;
    isPaused = false;
    runCycle();
  });

  pauseButton.addEventListener('click', () => {
    if (localState.timerInterval) {
      clearInterval(localState.timerInterval);
      localState.timerInterval = null;
      localState.isRunning = false;
      isPaused = true;
    }
  });

  resetButton.addEventListener('click', () => {
    if (localState.timerInterval) clearInterval(localState.timerInterval);
    localState = { isRunning: false, isOnBreak: false, currentCycleIndex: 0, timerInterval: null };
    pomodoroPlan = [];
    isPaused = false;
    remainingTime = 0;
    targetEndTime = null;
    cyclesCompleted.textContent = "Siklus selesai: 0";
    status.textContent = "Kerja";
    timerDisplay.textContent = "00:00";
    progress.style.width = "0%";
    updateCalculatedCycles();
  });

  document.getElementById('saveSettings').addEventListener('click', () => {
    let workDuration = parseInt(workDurationInput.value);
    if (!workDuration || workDuration <= 0) {
      showSwal('empty-duration');
      return;
    }
    if (adaptiveModeCheckbox.checked) {
      pomodoroPlan = generatePomodoroPlan(workDuration);
    } else {
      const manualCycle = parseInt(cyclesInput.value) || 1;
      pomodoroPlan = generatePomodoroPlan(workDuration, 25, 5, 15).slice(0, manualCycle);
    }

    showPlanPreview(pomodoroPlan, planList);
    adaptivePlanPreview.classList.remove('hidden');
    cyclesInput.value = pomodoroPlan.length;

    localState = { isRunning: false, isOnBreak: false, currentCycleIndex: 0, timerInterval: null };
    isPaused = false;
    remainingTime = 0;
    targetEndTime = null;
    timerDisplay.textContent = "00:00";
    progress.style.width = "0%";
    status.textContent = "Siap";
    cyclesCompleted.textContent = "Siklus selesai: 0";
    showSwal('saved');
  });

  displayWorkDuration.textContent = workDurationInput.value;
  updateCalculatedCycles();
});
