/* ==========================================================================
   ROMANTIC WEB AUDIO SYNTHESIZER & SOUND EFFECTS ENGINE
   ========================================================================== */

export class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.intervalId = null;
    this.noteStep = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  toggleMusic() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isPlaying;
  }

  startMusic() {
    this.isPlaying = true;
    this.noteStep = 0;

    // Sweet romantic melody notes (frequencies in Hz)
    const melody = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      293.66, 349.23, 440.00, 587.33, // D4, F4, A4, D5
      329.63, 392.00, 493.88, 659.25, // E4, G4, B4, E5
      349.23, 440.00, 523.25, 698.46  // F4, A4, C5, F5
    ];

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      const freq = melody[this.noteStep % melody.length];
      this.playTone(freq, 1.2);
      this.noteStep++;
    }, 600);
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  playTone(freq, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSparkleChime() {
    this.initContext();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.8);
      }, idx * 90);
    });
  }

  playUnboxSound() {
    this.initContext();
    const notes = [392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.6);
      }, idx * 100);
    });
  }
}
