// script.js dengan Swal, suara, bahasa Indonesia, istirahat panjang setiap 4 siklus, dan label status khusus

document.addEventListener('DOMContentLoaded', () => {
    const workDurationInput = document.getElementById('workDuration');
    const cyclesInput = document.getElementById('cycles');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resetButton = document.getElementById('resetButton');
    const timerDisplay = document.getElementById('timerDisplay');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const cyclesCompleted = document.getElementById('cyclesCompleted');
    const displayWorkDuration = document.getElementById('displayWorkDuration');

    const adaptiveModeCheckbox = document.getElementById('adaptiveMode');
    const adaptivePlanPreview = document.getElementById('adaptivePlanPreview');
    const planList = document.getElementById('planList');

    const soundStart = new Audio('assets/audio/start.mp3');
    const soundBreak = new Audio('assets/audio/break.mp3');
    const soundFinish = new Audio('assets/audio/finish.mp3');

    let workDuration = 60;
    let isRunning = false;
    let timerInterval = null;
    let currentCycleIndex = 0;
    let pomodoroPlan = [];

    function generatePomodoroPlan(totalMinutes, preferredWork = 25, preferredBreak = 5, longBreak = 15) {
        let totalSeconds = totalMinutes * 60;
        const result = [];
        let cycle = 0;

        while (totalSeconds > 0) {
            cycle++;
            let workSeconds = Math.min(preferredWork * 60, totalSeconds);
            totalSeconds -= workSeconds;

            let breakSeconds = 0;
            if (totalSeconds > 0) {
                breakSeconds = Math.min((cycle % 4 === 0 ? longBreak * 60 : preferredBreak * 60), totalSeconds);
                totalSeconds -= breakSeconds;
            }

            result.push({ cycle, work: workSeconds, break: breakSeconds });
        }

        return result;
    }

    function showPlanPreview(plan) {
        planList.innerHTML = '';
        plan.forEach(p => {
            const card = document.createElement('div');
            card.className = 'adaptive-card';

            const title = document.createElement('h4');
            title.textContent = `🍓 Siklus ${p.cycle}`;

            const work = document.createElement('p');
            work.textContent = `⏱️ Kerja: ${Math.floor(p.work / 60)} menit`;

            const rest = document.createElement('p');
            if (p.break > 0) {
                const isLongBreak = p.cycle % 4 === 0;
                rest.textContent = isLongBreak
                    ? `😴 Istirahat Panjang: ${Math.floor(p.break / 60)} menit`
                    : `😌 Istirahat: ${Math.floor(p.break / 60)} menit`;
            } else {
                rest.textContent = `🎉 Selesai!`;
            }

            card.appendChild(title);
            card.appendChild(work);
            card.appendChild(rest);
            planList.appendChild(card);
        });
        adaptivePlanPreview.classList.remove('hidden');
    }

    function formatTime(seconds) {
        let mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        let secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function runCycle() {
        if (currentCycleIndex >= pomodoroPlan.length) {
            status.textContent = "Semua siklus selesai 🎉";
            soundFinish.play();
            Swal.fire({
                title: 'Selesai Semua! 🎉',
                text: 'Kamu hebat! Waktunya istirahat total 💖',
                icon: 'success',
                confirmButtonColor: '#ff69b4'
            });
            isRunning = false;
            return;
        }

        const cycle = pomodoroPlan[currentCycleIndex];
        const isLongBreak = cycle.cycle % 4 === 0;
        const phase = cycle.work > 0 ? 'Kerja' : (isLongBreak ? 'Istirahat Panjang' : 'Istirahat');
        let totalTime = cycle.work > 0 ? cycle.work : cycle.break;
        let currentTime = totalTime;

        if (phase === 'Kerja') {
            soundStart.play();
            Swal.fire({
                title: 'Waktunya Kerja!',
                text: 'Fokus yuk 💻',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            soundBreak.play();
            Swal.fire({
                title: phase === 'Istirahat Panjang' ? 'Saatnya Istirahat Panjang 😴' : 'Istirahat Dulu 😌',
                text: 'Ambil napas sebentar...',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false
            });
        }

        status.textContent = `${phase} (${Math.floor(totalTime / 60)} menit)`;

        timerInterval = setInterval(() => {
            timerDisplay.textContent = formatTime(currentTime);
            let progressPercent = ((totalTime - currentTime) / totalTime) * 100;
            progress.style.width = `${progressPercent}%`;

            if (currentTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;

                if (phase === 'Kerja') {
                    cyclesCompleted.textContent = `Siklus selesai: ${cycle.cycle}`;
                }

                currentCycleIndex++;
                runCycle();
            }

            currentTime--;
        }, 1000);
    }

    startButton.addEventListener('click', () => {
        if (isRunning || pomodoroPlan.length === 0) return;
        isRunning = true;
        runCycle();
    });

    stopButton.addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
        }
    });

    resetButton.addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isRunning = false;
        currentCycleIndex = 0;
        pomodoroPlan = [];
        cyclesCompleted.textContent = "Siklus selesai: 0";
        status.textContent = "Kerja";
        timerDisplay.textContent = "00:00";
        progress.style.width = "0%";
        updateCalculatedCycles();
    });

    workDurationInput.addEventListener('input', (e) => {
        workDuration = parseInt(e.target.value) || 0;
        displayWorkDuration.textContent = workDuration;
        updateCalculatedCycles();
    });

    function updateCalculatedCycles() {
        let calc = Math.floor(workDuration / 25);
        cyclesInput.value = calc || 1;
    }

    document.getElementById('saveSettings').addEventListener('click', () => {
        if (adaptiveModeCheckbox.checked) {
            pomodoroPlan = generatePomodoroPlan(workDuration);
            showPlanPreview(pomodoroPlan);
            cyclesInput.value = pomodoroPlan.length;
        } else {
            const manualCycle = parseInt(cyclesInput.value) || 1;
            pomodoroPlan = [];

            let totalSeconds = workDuration * 60;
            let cycleCount = 0;

            while (totalSeconds > 0 && cycleCount < manualCycle) {
                const workTime = Math.min(25 * 60, totalSeconds);
                totalSeconds -= workTime;

                let breakTime = 0;
                if (totalSeconds > 0) {
                    breakTime = Math.min((cycleCount + 1) % 4 === 0 ? 15 * 60 : 5 * 60, totalSeconds);
                    totalSeconds -= breakTime;
                }

                cycleCount++;
                pomodoroPlan.push({ cycle: cycleCount, work: workTime, break: breakTime });
            }

            planList.innerHTML = '';
            adaptivePlanPreview.classList.add('hidden');
        }

        currentCycleIndex = 0;
        isRunning = false;
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00";
        progress.style.width = "0%";
        status.textContent = "Siap memulai!";
        cyclesCompleted.textContent = "Siklus selesai: 0";

        Swal.fire({
            title: 'Pengaturan Disimpan!',
            text: 'Klik tombol Mulai untuk memulai ⏰',
            icon: 'success',
            confirmButtonColor: '#ff69b4'
        });
    });

    displayWorkDuration.textContent = workDuration;
    updateCalculatedCycles();
});
// script.js selesai