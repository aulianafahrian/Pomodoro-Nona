export let timerInterval = null;
export let isRunning = false;
export let isOnBreak = false;
export let currentCycleIndex = 0;

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

export function resetTimerState() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isOnBreak = false;
    currentCycleIndex = 0;
}