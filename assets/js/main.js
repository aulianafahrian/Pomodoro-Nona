import { formatTime } from './timer.js';
import { playSound, stopSound } from './sound.js';
import { showSwal } from './swal.js';
import { generatePomodoroPlan, showPlanPreview } from './plan.js';

// circumference = 2 * π * 95 ≈ 597
const RING_CIRCUMFERENCE = 597;

const PHASE_CONFIG = {
    idle:      { img: 'assets/images/nona-cute.png', badge: 'Siap',              bodyClass: 'phase-idle' },
    work:      { img: 'assets/images/work.png',      badge: 'Waktunya Kerja',    bodyClass: 'phase-work' },
    break:     { img: 'assets/images/rest.png',      badge: 'Istirahat',         bodyClass: 'phase-break' },
    longbreak: { img: 'assets/images/rest2.png',     badge: 'Istirahat Panjang', bodyClass: 'phase-longbreak' },
    done:      { img: 'assets/images/done.png',      badge: 'Selesai!',          bodyClass: 'phase-done' },
};

let pomodoroPlan = [];

// DOM Elements
const workDurationInput   = document.getElementById('workDuration');
const cyclesInput         = document.getElementById('cycles');
const startButton         = document.getElementById('startButton');
const pauseButton         = document.getElementById('pauseButton');
const resetButton         = document.getElementById('resetButton');
const timerDisplay        = document.getElementById('timerDisplay');
const ringProgress        = document.getElementById('ringProgress');
const phaseBadge          = document.getElementById('phaseBadge');
const nonaImg             = document.getElementById('nonaImg');
const cyclesCompleted     = document.getElementById('cyclesCompleted');
const adaptiveModeCheckbox= document.getElementById('adaptiveMode');
const adaptivePlanPreview = document.getElementById('adaptivePlanPreview');
const planList            = document.getElementById('planList');
const settingsToggle      = document.getElementById('settingsToggle');
const settingsPanel       = document.getElementById('settings');

let localState = {
    isRunning: false,
    isOnBreak: false,
    currentCycleIndex: 0,
    timerInterval: null
};

let isPaused = false;
let remainingTime = 0;
let targetEndTime = null;

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(r => console.log('SW registered:', r))
            .catch(e => console.error('SW failed:', e));
    });
}

// Notification permission
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') showSwal('notif-denied');
    });
}

// ===== PHASE MANAGEMENT =====
function setPhase(phase) {
    const config = PHASE_CONFIG[phase] || PHASE_CONFIG.idle;
    Object.values(PHASE_CONFIG).forEach(c => document.body.classList.remove(c.bodyClass));
    document.body.classList.add(config.bodyClass);
    phaseBadge.textContent = config.badge;
    nonaImg.src            = config.img;
}

function setFocusMode(active) {
    document.body.classList.toggle('focus-mode', active);
}

function setRunningUI(running) {
    startButton.style.display = running ? 'none' : '';
    pauseButton.style.display = running ? '' : 'none';
}

function updateRing(remaining, total) {
    const offset = total > 0 ? (remaining / total) * RING_CIRCUMFERENCE : RING_CIRCUMFERENCE;
    ringProgress.style.strokeDashoffset = offset;
}

// ===== NOTIFICATIONS =====
function sendNotification(title, body, soundKey, loop = true) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: 'assets/images/nona-cute.png'
        });

        try {
            playSound(soundKey || 'finish', loop);
        } catch (e) {
            playSound('finish', loop);
        }

        notification.onclick = () => {
            try { stopSound(soundKey || 'finish'); } catch (e) { /* noop */ }
            notification.close();
            window.focus();
        };
    } else {
        Notification.requestPermission().then(p => {
            if (p === 'granted') sendNotification(title, body, soundKey, loop);
        });
    }
}

// ===== TIMER CORE =====
function runCycle() {
    if (localState.currentCycleIndex >= pomodoroPlan.length) {
        setPhase('done');
        setFocusMode(false);
        updateRing(0, 1);
        cyclesCompleted.textContent = `Siklus: ${pomodoroPlan.length} ✓`;
        sendNotification('Semua Selesai 🎉', 'Kamu menyelesaikan semua siklus!', 'finish');
        showSwal('done');
        localState.isRunning = false;
        setRunningUI(false);
        return;
    }

    const cycle = pomodoroPlan[localState.currentCycleIndex];
    const isLongBreak = cycle.cycle % 4 === 0;
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

    const totalPhaseTime = localState.isOnBreak ? cycle.break : cycle.work;
    targetEndTime = Date.now() + totalTime * 1000;

    if (!localState.isOnBreak) {
        setPhase('work');
        setFocusMode(true);
        sendNotification('Mulai Bekerja 💻', 'Fokus ya! Waktunya kerja.', 'start');
        showSwal('start');
    } else {
        const phase = isLongBreak ? 'longbreak' : 'break';
        setPhase(phase);
        setFocusMode(false);
        const msg = isLongBreak ? 'Saatnya istirahat panjang.' : 'Ambil napas sebentar ya.';
        sendNotification('Istirahat 😌', msg, 'break');
        showSwal(isLongBreak ? 'longbreak' : 'break');
    }

    timerDisplay.textContent = formatTime(totalTime);
    updateRing(totalTime, totalPhaseTime);

    localState.timerInterval = setInterval(() => {
        const now = Date.now();
        totalTime = Math.max(0, Math.floor((targetEndTime - now) / 1000));
        remainingTime = totalTime;

        timerDisplay.textContent = formatTime(totalTime);
        updateRing(totalTime, totalPhaseTime);

        if (totalTime <= 0) {
            clearInterval(localState.timerInterval);
            localState.timerInterval = null;

            if (!localState.isOnBreak) {
                cyclesCompleted.textContent = `Siklus: ${cycle.cycle}`;
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
    cyclesInput.value = Math.floor(workDuration / 25) || 1;
}

function resetAll() {
    if (localState.timerInterval) clearInterval(localState.timerInterval);
    localState = { isRunning: false, isOnBreak: false, currentCycleIndex: 0, timerInterval: null };
    isPaused = false;
    remainingTime = 0;
    targetEndTime = null;
    pomodoroPlan = [];
    timerDisplay.textContent = '25:00';
    cyclesCompleted.textContent = 'Siklus: 0';
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
    setPhase('idle');
    setFocusMode(false);
    setRunningUI(false);
    updateCalculatedCycles();
}

// ===== SETTINGS TOGGLE =====
function toggleSettings(forceOpen) {
    const isCollapsed = settingsPanel.classList.contains('collapsed');
    const shouldOpen = forceOpen !== undefined ? forceOpen : isCollapsed;
    settingsPanel.classList.toggle('collapsed', !shouldOpen);
    settingsToggle.textContent = shouldOpen ? '✕ Tutup' : '⚙ Pengaturan';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    updateCalculatedCycles();

    workDurationInput.addEventListener('input', updateCalculatedCycles);

    settingsToggle.addEventListener('click', () => toggleSettings());

    startButton.addEventListener('click', () => {
        if (pomodoroPlan.length === 0) { showSwal('not-saved'); return; }
        if (localState.isRunning) return;
        localState.isRunning = true;
        if (!isPaused) remainingTime = 0;
        isPaused = false;
        setRunningUI(true);
        runCycle();
    });

    pauseButton.addEventListener('click', () => {
        if (localState.timerInterval) {
            clearInterval(localState.timerInterval);
            localState.timerInterval = null;
            localState.isRunning = false;
            isPaused = true;
            setFocusMode(false);
            setRunningUI(false);
        }
    });

    resetButton.addEventListener('click', resetAll);

    document.getElementById('saveSettings').addEventListener('click', () => {
        const workDuration = parseInt(workDurationInput.value);
        if (!workDuration || workDuration <= 0) { showSwal('empty-duration'); return; }

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
        timerDisplay.textContent = '25:00';
        ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
        cyclesCompleted.textContent = 'Siklus: 0';
        setPhase('idle');
        setFocusMode(false);

        toggleSettings(false);
        showSwal('saved');
    });
});
