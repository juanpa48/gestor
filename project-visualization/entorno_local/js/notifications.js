// ============================================================
// SISTEMA DE NOTIFICACIONES (AUDIO + NAVEGADOR)
// ============================================================
const NotificationHelper = {
  init: function() {
    // Solicitar permiso al primer clic en cualquier parte de la página si no está concedido
    const pedirPermiso = () => {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      document.removeEventListener('click', pedirPermiso);
    };
    document.addEventListener('click', pedirPermiso);
    
    console.log("🚀 Sistema de notificaciones listo. Escuchando solicitudes...");
  },

  notify: function(title, body) {
    this.playPing();

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        // requireInteraction: true mantiene la notificación visible hasta que el usuario interactúa
        const n = new Notification(title, {
          body: body,
          icon: "https://cdn-icons-png.flaticon.com/512/1827/1827347.png",
          requireInteraction: true 
        });
        
        n.onclick = () => { 
          window.focus(); 
          n.close();
        };
      } catch (e) {
        console.warn("Error mostrando notificación nativa:", e);
      }
    }
    
    // Mostrar siempre un toast visual interno
    showToast("🔔 NUEVA SOLICITUD: " + body, "success");
  },

  playPing: function() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const context = new AudioContext();
      
      // Función para crear cada "beep"
      const createBeep = (freq, startTime, duration, vol) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        
        osc.type = 'square'; // Un sonido cuadrado es más estridente y notorio
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(context.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = context.currentTime;
      // Secuencia de 3 tonos rápidos y fuertes (tipo alerta)
      createBeep(523.25, now, 0.2, 0.3);        // Do
      createBeep(659.25, now + 0.15, 0.3, 0.3); // Mi
      createBeep(783.99, now + 0.30, 0.6, 0.4); // Sol (más largo y fuerte)

    } catch (e) {
      console.warn("No se pudo reproducir el sonido (posible falta de interacción del usuario):", e);
    }
  }
};

// Escuchar cambios en localStorage desde otras pestañas (Portal Avanzado)
window.addEventListener('storage', (e) => {
  if (e.key === 'db_actividades' && e.newValue) {
    try {
      const oldVal = JSON.parse(e.oldValue || '[]');
      const newVal = JSON.parse(e.newValue || '[]');
      
      if (newVal.length > oldVal.length) {
        const lastTicket = newVal[newVal.length - 1];
        // Solo notificar si es un ticket nuevo y está en estado Pendiente
        if (lastTicket.estado === 'Pendiente') {
          NotificationHelper.notify(
            "¡Nueva Solicitud TI!", 
            `${lastTicket.id}: ${lastTicket.solicitante} ha enviado una nueva solicitud.`
          );
          
          // Emitir evento para que los módulos se actualicen
          document.dispatchEvent(new CustomEvent('nuevoTicketExterno', { 
            detail: lastTicket 
          }));
        }
      }
    } catch (err) {
      console.error("Error procesando evento de almacenamiento:", err);
    }
  }
});
