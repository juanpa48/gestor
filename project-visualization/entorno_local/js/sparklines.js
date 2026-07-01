// ============================================================
// SPARKLINES (Canvas)
// ============================================================
function drawSparklines() {
  const configs = [
    { id: 'sparkline1', color: '#e8192c', data: [3, 5, 4, 7, 5, 8, 6, 9, 7, 11, 9, 12] },
    { id: 'sparkline2', color: '#1e3a5f', data: [2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 8] },
    { id: 'sparkline3', color: '#1e3a5f', data: [1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8] },
    { id: 'sparkline4', color: '#e8192c', data: [1, 2, 1, 3, 2, 4, 3, 5, 3, 6, 4, 7] }
  ];

  configs.forEach(function (cfg) {
    const canvas = document.getElementById(cfg.id);
    if (!canvas) return;

    setTimeout(function () {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth || 200;
      const h = canvas.offsetHeight || 50;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const points = cfg.data.map(function (val, i) {
        return { x: (i / (cfg.data.length - 1)) * w, y: h - (val / 15) * h };
      });

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, cfg.color + '25');
      grad.addColorStop(1, cfg.color + '00');

      ctx.beginPath();
      ctx.moveTo(points[0].x, h);
      points.forEach(function (p) { ctx.lineTo(p.x, p.y); });
      ctx.lineTo(points[points.length - 1].x, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }, 100);
  });
}
