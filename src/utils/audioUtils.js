export const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // First tone (Ding)
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
    
    // Second tone (Ding-Ding)
    setTimeout(() => {
      if (audioCtx.state === 'suspended') return;
      const osc2 = audioCtx.createOscillator();
      const gainNode2 = audioCtx.createGain();
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1108.73, audioCtx.currentTime); // C#6 note
      
      gainNode2.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      osc2.connect(gainNode2);
      gainNode2.connect(audioCtx.destination);
      
      osc2.start(audioCtx.currentTime);
      osc2.stop(audioCtx.currentTime + 0.5);
    }, 150);
    
  } catch (err) {
    console.error('Audio playback failed or is not supported', err);
  }
};
