// main.js
import { timerInterval, isRunning, isOnBreak, currentCycleIndex, formatTime, resetTimerState } from './timer.js';
import { playSound } from './sound.js';
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

let localState = {
  isRunning: false,
  isOnBreak: false,
  currentCycleIndex: 0,
  timerInterval: null
};

let isPaused = false;
let remainingTime = 0;

function runCycle() {
  if (localState.currentCycleIndex >= pomodoroPlan.length) {
    status.textContent = "Semua siklus selesai 🎉";
    playSound('finish');
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

  if (!localState.isOnBreak) {
    playSound('start');
    showSwal('start');
  } else {
    playSound('break');
    showSwal(isLongBreak ? 'longbreak' : 'break');
  }

  status.textContent = `${phase} (${Math.floor(totalTime / 60)} menit)`;

  localState.timerInterval = setInterval(() => {
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
    totalTime--;
    remainingTime = totalTime;
  }, 1000);
}

function updateCalculatedCycles() {
  const workDuration = parseInt(workDurationInput.value) || 0;
  const calc = Math.floor(workDuration / 25);
  cyclesInput.value = calc || 1;
}

document.addEventListener('DOMContentLoaded', () => {
  workDurationInput.addEventListener('input', (e) => {
    displayWorkDuration.textContent = e.target.value;
    updateCalculatedCycles();
  });

  startButton.addEventListener('click', () => {
    if (localState.isRunning || pomodoroPlan.length === 0) return;
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
    cyclesCompleted.textContent = "Siklus selesai: 0";
    status.textContent = "Kerja";
    timerDisplay.textContent = "00:00";
    progress.style.width = "0%";
    updateCalculatedCycles();
  });

  document.getElementById('saveSettings').addEventListener('click', () => {
    const workDuration = parseInt(workDurationInput.value);
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
    timerDisplay.textContent = "00:00";
    progress.style.width = "0%";
    status.textContent = "Siap";
    cyclesCompleted.textContent = "Siklus selesai: 0";
    showSwal('saved');
  });

  displayWorkDuration.textContent = workDurationInput.value;
  updateCalculatedCycles();
});

document.body.addEventListener('click', () => {
    soundStart.load(); soundBreak.load(); soundFinish.load();
  }, { once: true });
  
  