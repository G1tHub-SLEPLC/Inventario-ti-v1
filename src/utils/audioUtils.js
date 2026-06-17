export const SOUND_OPTIONS = [
  { id: 'classic_ding', name: 'Classic Ding', desc: 'Tono doble agudo de campana.' },
  { id: 'soft_pop', name: 'Soft Pop', desc: 'Burbuja rápida y suave.' },
  { id: 'digital_alert', name: 'Digital Alert', desc: 'Tono electrónico moderno.' },
  { id: 'success_chime', name: 'Success Chime', desc: 'Pequeño arpegio musical ascendente.' },
  { id: 'sonar', name: 'Sonar', desc: 'Tono agudo con efecto de decaimiento largo.' },
  { id: 'pluck', name: 'Pluck', desc: 'Cuerda digital corta.' },
  { id: 'retro_coin', name: 'Retro Coin', desc: 'Efecto clásico de salto de videojuego.' },
  { id: 'marimba', name: 'Marimba', desc: 'Tono percusivo de madera hueca.' },
  { id: 'echo_drop', name: 'Echo Drop', desc: 'Tono rápido descendente.' },
  { id: 'gentle_bell', name: 'Gentle Bell', desc: 'Campana muy suave con resonancia grave.' }
];

const createOscillator = (audioCtx, type, freq, time, duration, gainStart, gainPeak, gainEnd, peakTime = 0.05) => {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  
  gainNode.gain.setValueAtTime(gainStart, time);
  gainNode.gain.linearRampToValueAtTime(gainPeak, time + peakTime);
  gainNode.gain.exponentialRampToValueAtTime(gainEnd || 0.001, time + duration);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(time);
  osc.stop(time + duration);
  return { osc, gainNode };
};

const playClassicDing = (audioCtx, t) => {
  createOscillator(audioCtx, 'sine', 880, t, 0.5, 0, 0.5, 0.001, 0.02);
  setTimeout(() => {
    if (audioCtx.state === 'suspended') return;
    createOscillator(audioCtx, 'sine', 1108.73, audioCtx.currentTime, 0.5, 0, 0.5, 0.001, 0.02);
  }, 150);
};

const playSoftPop = (audioCtx, t) => {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.6, t + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
};

const playDigitalAlert = (audioCtx, t) => {
  createOscillator(audioCtx, 'square', 600, t, 0.1, 0, 0.1, 0.001, 0.01);
  createOscillator(audioCtx, 'square', 800, t + 0.15, 0.2, 0, 0.1, 0.001, 0.01);
  createOscillator(audioCtx, 'square', 1000, t + 0.3, 0.3, 0, 0.1, 0.001, 0.01);
};

const playSuccessChime = (audioCtx, t) => {
  createOscillator(audioCtx, 'sine', 523.25, t, 0.4, 0, 0.3, 0.001, 0.05); // C5
  createOscillator(audioCtx, 'sine', 659.25, t + 0.1, 0.4, 0, 0.3, 0.001, 0.05); // E5
  createOscillator(audioCtx, 'sine', 783.99, t + 0.2, 0.6, 0, 0.4, 0.001, 0.05); // G5
};

const playSonar = (audioCtx, t) => {
  createOscillator(audioCtx, 'sine', 1200, t, 1.5, 0, 0.3, 0.001, 0.1);
};

const playPluck = (audioCtx, t) => {
  createOscillator(audioCtx, 'triangle', 440, t, 0.4, 0, 0.8, 0.001, 0.01);
};

const playRetroCoin = (audioCtx, t) => {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(987.77, t); // B5
  osc.frequency.setValueAtTime(1318.51, t + 0.1); // E6
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.1, t + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.5);
};

const playMarimba = (audioCtx, t) => {
  createOscillator(audioCtx, 'sine', 500, t, 0.2, 0, 0.6, 0.001, 0.01);
  createOscillator(audioCtx, 'triangle', 1000, t, 0.1, 0, 0.2, 0.001, 0.01);
};

const playEchoDrop = (audioCtx, t) => {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.4, t + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.4);
};

const playGentleBell = (audioCtx, t) => {
  createOscillator(audioCtx, 'sine', 400, t, 1.0, 0, 0.4, 0.001, 0.1);
  createOscillator(audioCtx, 'sine', 800, t, 1.0, 0, 0.1, 0.001, 0.1);
};

const SOUND_GENERATORS = {
  'classic_ding': playClassicDing,
  'soft_pop': playSoftPop,
  'digital_alert': playDigitalAlert,
  'success_chime': playSuccessChime,
  'sonar': playSonar,
  'pluck': playPluck,
  'retro_coin': playRetroCoin,
  'marimba': playMarimba,
  'echo_drop': playEchoDrop,
  'gentle_bell': playGentleBell
};

export const playSpecificSound = (soundId) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const t = audioCtx.currentTime;
    const generator = SOUND_GENERATORS[soundId] || SOUND_GENERATORS['classic_ding'];
    generator(audioCtx, t);
  } catch (err) {
    console.error('Audio playback failed or is not supported', err);
  }
};

let loopInterval = null;

export const playNotificationSound = () => {
  stopNotificationSound(); // Ensure any previous loop is stopped
  const chosenSound = localStorage.getItem('notificationSound') || 'classic_ding';
  
  // Play first time immediately
  playSpecificSound(chosenSound);
  
  // Start loop (every 2 seconds)
  loopInterval = setInterval(() => {
    playSpecificSound(chosenSound);
  }, 2000);
};

export const stopNotificationSound = () => {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
};
