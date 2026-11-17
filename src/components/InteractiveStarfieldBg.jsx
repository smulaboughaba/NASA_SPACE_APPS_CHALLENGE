import React, { useEffect, useRef } from 'react';

// Temperaturas espectrales reales (O/B azul-blanco, A/F blanco, G cálido, K/M dorado-ámbar)
const SPECTRAL_COLORS = [
  { core: '248, 250, 252', halo: '186, 230, 253' },
  { core: '241, 245, 249', halo: '226, 232, 240' },
  { core: '219, 234, 254', halo: '125, 211, 252' },
  { core: '254, 243, 199', halo: '253, 224, 145' },
];

function createStarSprite(spec) {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const mid = size / 2;

  const grad = g.createRadialGradient(mid, mid, 0, mid, mid, mid);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.14, `rgba(${spec.core}, 0.92)`);
  grad.addColorStop(0.38, `rgba(${spec.halo}, 0.24)`);
  grad.addColorStop(0.72, `rgba(${spec.halo}, 0.04)`);
  grad.addColorStop(1, `rgba(${spec.halo}, 0)`);

  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function createStaticBackdrop(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  const g = c.getContext('2d');

  // Banda cósmica diagonal muy tenue pre-renderizada una sola vez
  g.save();
  g.translate(w * 0.52, h * 0.48);
  g.rotate(-0.42);
  const band = g.createRadialGradient(0, 0, w * 0.04, 0, 0, Math.max(w, h) * 0.62);
  band.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
  band.addColorStop(0.45, 'rgba(99, 102, 241, 0.022)');
  band.addColorStop(1, 'rgba(5, 7, 11, 0)');
  g.scale(1.6, 0.45);
  g.fillStyle = band;
  g.fillRect(-w, -h, w * 2, h * 2);
  g.restore();

  const vignette = g.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
  vignette.addColorStop(0, 'rgba(5, 7, 11, 0)');
  vignette.addColorStop(1, 'rgba(3, 4, 8, 0.5)');
  g.fillStyle = vignette;
  g.fillRect(0, 0, w, h);

  return c;
}

function buildStarCatalog(w, h) {
  const areaFactor = Math.min(1.35, Math.max(0.75, (w * h) / (1440 * 900)));
  const count = Math.round(220 * areaFactor);
  const stars = [];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const tier = roll < 0.74 ? 0 : roll < 0.94 ? 1 : 2;
    const depth = tier === 0 ? 0.22 + Math.random() * 0.3 : tier === 1 ? 0.48 + Math.random() * 0.3 : 0.75 + Math.random() * 0.25;
    const specIdx = Math.random() < 0.22 ? 3 : Math.floor(Math.random() * 3);
    const bx = Math.random() * w;
    const by = Math.random() * h;

    stars.push({
      bx,
      by,
      x: bx,
      y: by,
      vx: (Math.random() - 0.5) * 0.1 * depth,
      vy: (Math.random() - 0.5) * 0.08 * depth,
      tier,
      depth,
      size: tier === 0 ? 0.9 + Math.random() * 0.6 : tier === 1 ? 6 + Math.random() * 4.5 : 10.5 + Math.random() * 6.5,
      baseAlpha: tier === 0 ? 0.18 + Math.random() * 0.34 : tier === 1 ? 0.45 + Math.random() * 0.3 : 0.68 + Math.random() * 0.26,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.2,
      specIdx,
      color: SPECTRAL_COLORS[specIdx].core,
    });
  }
  return stars;
}

export default function InteractiveStarfieldBg({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const sprites = SPECTRAL_COLORS.map(createStarSprite);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let backdrop = null;
    let stars = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backdrop = createStaticBackdrop(width, height);
      stars = buildStarCatalog(width, height);
    };

    resize();

    const pointer = {
      x: width * 0.5,
      y: height * 0.45,
      sx: width * 0.5,
      sy: height * 0.45,
      inside: false,
      strength: 0,
    };

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
    };

    const onLeave = () => {
      pointer.inside = false;
    };

    let rafId = 0;
    const startTime = performance.now();
    const interactRadius = 155;
    const nearCursor = [];

    const draw = (now) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const t = (now - startTime) * 0.001;
      pointer.sx += (pointer.x - pointer.sx) * 0.08;
      pointer.sy += (pointer.y - pointer.sy) * 0.08;
      pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.06;

      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      if (backdrop) {
        ctx.drawImage(backdrop, 0, 0, width, height);
      }

      if (!reducedMotion && pointer.strength > 0.02) {
        const glow = ctx.createRadialGradient(pointer.sx, pointer.sy, 0, pointer.sx, pointer.sy, 210);
        glow.addColorStop(0, `rgba(34, 211, 238, ${(0.05 * pointer.strength).toFixed(4)})`);
        glow.addColorStop(0.55, `rgba(56, 189, 248, ${(0.018 * pointer.strength).toFixed(4)})`);
        glow.addColorStop(1, 'rgba(5, 7, 11, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      const px = ((pointer.sx / Math.max(1, width)) - 0.5) * 28;
      const py = ((pointer.sy / Math.max(1, height)) - 0.5) * 20;
      nearCursor.length = 0;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        let wrapped = false;
        if (!reducedMotion) {
          s.bx += s.vx;
          s.by += s.vy;
          if (s.bx < -10) { s.bx = width + 10; wrapped = true; }
          else if (s.bx > width + 10) { s.bx = -10; wrapped = true; }
          if (s.by < -10) { s.by = height + 10; wrapped = true; }
          else if (s.by > height + 10) { s.by = -10; wrapped = true; }
        }

        const anchorX = s.bx - px * s.depth * 0.65;
        const anchorY = s.by - py * s.depth * 0.65;
        if (wrapped) {
          s.x = anchorX;
          s.y = anchorY;
        }

        let targetX = anchorX;
        let targetY = anchorY;
        let boost = 0;

        if (!reducedMotion && pointer.strength > 0.02) {
          const dx = anchorX - pointer.sx;
          const dy = anchorY - pointer.sy;
          const dist = Math.hypot(dx, dy);
          if (dist < interactRadius && dist > 0.5) {
            const falloff = 1 - dist / interactRadius;
            const push = falloff * falloff * 30 * s.depth * pointer.strength;
            targetX = anchorX + (dx / dist) * push;
            targetY = anchorY + (dy / dist) * push;
            boost = falloff;
          }
        }

        // Inercia elástica suave (igual que la física original, sin saltos bruscos)
        s.x += (targetX - s.x) * 0.14;
        s.y += (targetY - s.y) * 0.14;

        const twinkle = reducedMotion ? 1 : 0.74 + 0.26 * Math.sin(t * s.twinkleSpeed + s.phase);
        const alpha = Math.min(1, s.baseAlpha * twinkle + boost * 0.38);

        if (boost > 0.15) {
          nearCursor.push({ x: s.x, y: s.y, boost });
        }

        if (s.tier === 0) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `rgb(${s.color})`;
          ctx.fillRect(s.x, s.y, s.size, s.size);
        } else {
          const drawSize = s.size * (1 + boost * 0.26);
          const half = drawSize * 0.5;
          ctx.globalAlpha = alpha;
          ctx.drawImage(sprites[s.specIdx], s.x - half, s.y - half, drawSize, drawSize);
        }
      }

      // Constelaciones sutiles solo en torno al puntero (máx ~12 estrellas locales)
      if (!reducedMotion && pointer.strength > 0.04 && nearCursor.length > 0) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 0.65;
        const limit = Math.min(14, nearCursor.length);
        for (let i = 0; i < limit; i++) {
          const a = nearCursor[i];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.sx, pointer.sy);
          ctx.strokeStyle = `rgba(103, 232, 249, ${(0.15 * a.boost * pointer.strength).toFixed(3)})`;
          ctx.stroke();

          for (let j = i + 1; j < limit; j++) {
            const b = nearCursor[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 92) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(186, 230, 253, ${((1 - d / 92) * 0.14 * pointer.strength).toFixed(3)})`;
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      if (!reducedMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
