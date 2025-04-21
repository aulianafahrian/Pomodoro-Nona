const soundMap = {
    start: new Audio('assets/audio/start.mp3'),
    break: new Audio('assets/audio/break.mp3'),
    finish: new Audio('assets/audio/finish.mp3')
  };
  
  export function playSound(key, loop = false) {
    const sound = soundMap[key];
    if (sound) {
      sound.loop = loop;
      sound.pause();        // berhenti jika sedang main
      sound.currentTime = 0;
      sound.play();
    }
  }
  
  export function stopSound(key) {
    const sound = soundMap[key];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.loop = false;
    }
  }
  