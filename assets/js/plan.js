// plan.js
export function generatePomodoroPlan(totalMinutes, preferredWork = 25, preferredBreak = 5, longBreak = 15) {
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
  
      if (workSeconds > 0 || breakSeconds > 0) {
        result.push({ cycle, work: workSeconds, break: breakSeconds });
      }
    }
  
    return result;
  }
  
  export function showPlanPreview(plan, container) {
    container.innerHTML = '';
    plan.forEach(p => {
      const card = document.createElement('div');
      card.className = 'adaptive-card';
  
      const title = document.createElement('h4');
      title.textContent = `🍫 Siklus ${p.cycle}`;
  
      const work = document.createElement('p');
      work.textContent = `⏱️ Kerja: ${Math.floor(p.work / 60)} menit`;
  
      const rest = document.createElement('p');
      if (p.break > 0) {
        const isLongBreak = p.cycle % 4 === 0;
        rest.textContent = isLongBreak ? `😴 Istirahat Panjang: ${Math.floor(p.break / 60)} menit` : `😌 Istirahat: ${Math.floor(p.break / 60)} menit`;
      } else {
        rest.textContent = `🎉 Selesai!`;
      }
  
      card.appendChild(title);
      card.appendChild(work);
      card.appendChild(rest);
      container.appendChild(card);
    });
  }
  