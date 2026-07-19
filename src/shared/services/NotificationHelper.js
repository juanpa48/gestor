// ===================================
// MOTOR DE NOTIFICACIONES (Audio y API Nativa)
// ===================================

export const NotificationHelper = {
  audioCtx: null,

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  },

  playBeep(freq, time, type = 'sine') {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    // Envelope para que suene como campana
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + time);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + time);
  },

  playNotificationSound() {
    this.initAudio();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    // Secuencia tipo "Do-Mi-Sol" rápida
    this.playBeep(523.25, 0.2); // Do5
    setTimeout(() => this.playBeep(659.25, 0.2), 100); // Mi5
    setTimeout(() => this.playBeep(783.99, 0.4), 200); // Sol5
  },

  async showNativeNotification(title, options = {}) {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: '/img/acyt.png',
        ...options
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          icon: '/img/acyt.png',
          ...options
        });
      }
    }
  },

  // Método principal que agrupa sonido y notificación visual
  notify(title, body) {
    this.playNotificationSound();
    this.showNativeNotification(title, { body, requireInteraction: true });
  }
};
