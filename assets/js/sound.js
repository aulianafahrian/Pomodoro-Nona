export const soundStart = new Audio('assets/audio/start.mp3');
export const soundBreak = new Audio('assets/audio/break.mp3');
export const soundFinish = new Audio('assets/audio/finish.mp3');

export function playSound(type) {
    if (type === 'start') soundStart.play();
    if (type === 'break') soundBreak.play();
    if (type === 'finish') soundFinish.play();
}