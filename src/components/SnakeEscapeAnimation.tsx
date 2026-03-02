import { useRef, useEffect, useCallback, useState } from "react";

const TAU = Math.PI * 2;
const CX = 75;
const CY = 65;
const TRACK_R = 32;
const SNAKE_LEN = 1.2; // radians
const SNAKE_SPEED = 0.012;
const FROG_R = TRACK_R + 14;
const GAP_SIZE = 0.22; // radians
const CROAK_INTERVAL = 2500;
const CROAK_PROXIMITY = 0.26; // ~15 degrees in radians

interface Frog {
  angle: number;
  speed: number;
  croaking: boolean;
  croakTimer: number;
  shocked: boolean;
  laughing: boolean;
}

const SnakeEscapeAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snakeAngle: 0,
    snakeDir: 1,
    escaping: false,
    escapeProgress: 0,
    escaped: false,
    resetTimer: 0,
    confetti: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    gapAngle: Math.random() * TAU,
    frogs: [
      { angle: 0, speed: -0.004, croaking: false, croakTimer: Math.random() * CROAK_INTERVAL, shocked: false, laughing: false },
      { angle: TAU / 3, speed: -0.005, croaking: false, croakTimer: Math.random() * CROAK_INTERVAL, shocked: false, laughing: false },
      { angle: (TAU * 2) / 3, speed: -0.003, croaking: false, croakTimer: Math.random() * CROAK_INTERVAL, shocked: false, laughing: false },
    ] as Frog[],
    lastTime: 0,
    tonguePhase: 0,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const s = stateRef.current;
    const dt = 16;
    s.tonguePhase += 0.05;

    ctx.clearRect(0, 0, w, h);

    const sx = w / 150;
    const sy = h / 130;
    const scale = Math.min(sx, sy);
    ctx.save();
    ctx.translate(w / 2 - CX * scale, h / 2 - CY * scale);
    ctx.scale(scale, scale);

    // Draw glowing track
    ctx.strokeStyle = "rgba(130, 80, 255, 0.15)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(CX, CY, TRACK_R, 0, TAU);
    ctx.stroke();

    // Brighter track
    ctx.strokeStyle = "rgba(130, 80, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(130, 80, 255, 0.5)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const gapStart = s.gapAngle - GAP_SIZE / 2;
    const gapEnd = s.gapAngle + GAP_SIZE / 2;
    ctx.arc(CX, CY, TRACK_R, gapEnd, gapStart + TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw gap marker
    const gx = CX + Math.cos(s.gapAngle) * TRACK_R;
    const gy = CY + Math.sin(s.gapAngle) * TRACK_R;
    ctx.fillStyle = "rgba(0, 255, 200, 0.6)";
    ctx.beginPath();
    ctx.arc(gx, gy, 3, 0, TAU);
    ctx.fill();

    // Update & draw frogs
    for (const frog of s.frogs) {
      if (!s.escaped) {
        frog.angle = (frog.angle + frog.speed) % TAU;
        if (frog.angle < 0) frog.angle += TAU;
      }

      frog.croakTimer -= dt;
      if (frog.croakTimer <= 0 && !s.escaping && !s.escaped) {
        frog.croaking = true;
        frog.croakTimer = CROAK_INTERVAL + Math.random() * 2000;

        // Check if croak is near gap
        let diff = Math.abs(frog.angle - s.gapAngle);
        if (diff > Math.PI) diff = TAU - diff;
        if (diff < CROAK_PROXIMITY) {
          s.escaping = true;
          s.snakeDir = frog.angle > s.gapAngle ? 1 : -1;
        } else {
          frog.laughing = true;
          setTimeout(() => { frog.laughing = false; }, 800);
        }

        setTimeout(() => { frog.croaking = false; }, 500);
      }

      const fx = CX + Math.cos(frog.angle) * FROG_R;
      const fy = CY + Math.sin(frog.angle) * FROG_R;

      // Frog body
      ctx.fillStyle = frog.shocked ? "#ffcc00" : "#44cc44";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 6, 5, 0, 0, TAU);
      ctx.fill();

      // Eyes
      const eyeOff = 2.5;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(fx - eyeOff, fy - 4, 2, 0, TAU);
      ctx.arc(fx + eyeOff, fy - 4, 2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(fx - eyeOff, fy - 4, 1, 0, TAU);
      ctx.arc(fx + eyeOff, fy - 4, 1, 0, TAU);
      ctx.fill();

      if (frog.shocked) {
        // Shocked mouth
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(fx, fy + 1, 2, 0, TAU);
        ctx.stroke();
      } else if (frog.laughing) {
        // Laughing
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(fx, fy - 0.5, 2.5, 0.1, Math.PI - 0.1);
        ctx.stroke();
        // Bounce
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(1, 1 + 0.1 * Math.sin(Date.now() * 0.02));
        ctx.restore();
      }

      // Croak pulse
      if (frog.croaking) {
        ctx.strokeStyle = "rgba(68, 204, 68, 0.4)";
        ctx.lineWidth = 1;
        const pulseR = 8 + 4 * Math.sin(Date.now() * 0.01);
        ctx.beginPath();
        ctx.arc(fx, fy, pulseR, 0, TAU);
        ctx.stroke();
      }
    }

    // Snake logic
    if (s.escaping && !s.escaped) {
      // Move toward gap
      let diff = s.gapAngle - s.snakeAngle;
      if (diff > Math.PI) diff -= TAU;
      if (diff < -Math.PI) diff += TAU;
      if (Math.abs(diff) < 0.05) {
        s.escaped = true;
        s.escapeProgress = 0;
        s.resetTimer = 3000;
        // Shock frogs
        s.frogs.forEach(f => { f.shocked = true; });
        // Confetti
        for (let i = 0; i < 20; i++) {
          s.confetti.push({
            x: gx, y: gy,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: ["#ff0", "#0ff", "#f0f", "#0f0", "#f90"][Math.floor(Math.random() * 5)],
            life: 60,
          });
        }
      } else {
        s.snakeAngle += Math.sign(diff) * SNAKE_SPEED * 2.5;
      }
    } else if (!s.escaped) {
      s.snakeAngle = (s.snakeAngle + SNAKE_SPEED * s.snakeDir) % TAU;
    }

    // Draw snake on track
    if (!s.escaped) {
      const segments = 20;
      ctx.lineCap = "round";
      for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const a = s.snakeAngle - t * SNAKE_LEN * s.snakeDir;
        const sx2 = CX + Math.cos(a) * TRACK_R;
        const sy2 = CY + Math.sin(a) * TRACK_R;
        const thickness = 2 + (1 - t) * 3;
        const green = Math.floor(100 + (1 - t) * 100);
        ctx.fillStyle = `rgb(${30 + t * 40}, ${green}, ${50})`;
        ctx.beginPath();
        ctx.arc(sx2, sy2, thickness, 0, TAU);
        ctx.fill();
      }

      // Head
      const hx = CX + Math.cos(s.snakeAngle) * TRACK_R;
      const hy = CY + Math.sin(s.snakeAngle) * TRACK_R;
      const headWobble = Math.sin(s.tonguePhase * 2) * 0.5;
      ctx.fillStyle = "#22aa33";
      ctx.beginPath();
      ctx.arc(hx + headWobble, hy, 4.5, 0, TAU);
      ctx.fill();

      // Eyes on head
      const eyeAngle = s.snakeAngle + (s.snakeDir > 0 ? 0.3 : -0.3);
      ctx.fillStyle = "#ff0";
      ctx.beginPath();
      ctx.arc(hx + Math.cos(eyeAngle) * 2, hy + Math.sin(eyeAngle) * 2 - 1.5, 1.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(hx + Math.cos(eyeAngle) * 2, hy + Math.sin(eyeAngle) * 2 - 1.5, 0.5, 0, TAU);
      ctx.fill();

      // Tongue
      if (Math.sin(s.tonguePhase) > 0.5) {
        const tongueDir = s.snakeAngle;
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 0.7;
        const tLen = 5 + Math.sin(s.tonguePhase * 3) * 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        const tx = hx + Math.cos(tongueDir) * tLen;
        const ty = hy + Math.sin(tongueDir) * tLen;
        ctx.lineTo(tx, ty);
        // Fork
        ctx.lineTo(tx + Math.cos(tongueDir + 0.4) * 2, ty + Math.sin(tongueDir + 0.4) * 2);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + Math.cos(tongueDir - 0.4) * 2, ty + Math.sin(tongueDir - 0.4) * 2);
        ctx.stroke();
      }
    } else {
      // Escape animation - snake moves outward
      s.escapeProgress += 0.02;
      const escR = TRACK_R + s.escapeProgress * 40;
      if (s.escapeProgress < 1) {
        const hx = CX + Math.cos(s.gapAngle) * escR;
        const hy = CY + Math.sin(s.gapAngle) * escR;
        ctx.fillStyle = "#22aa33";
        ctx.globalAlpha = 1 - s.escapeProgress;
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Reset timer
      s.resetTimer -= dt;
      if (s.resetTimer <= 0) {
        s.snakeAngle = Math.random() * TAU;
        s.snakeDir = 1;
        s.escaping = false;
        s.escaped = false;
        s.escapeProgress = 0;
        s.confetti = [];
        s.gapAngle = Math.random() * TAU;
        s.frogs.forEach(f => {
          f.shocked = false;
          f.laughing = false;
          f.angle = Math.random() * TAU;
        });
      }
    }

    // Confetti
    s.confetti = s.confetti.filter(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.05;
      c.life--;
      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.life / 60;
      ctx.fillRect(c.x - 1.5, c.y - 1.5, 3, 3);
      ctx.globalAlpha = 1;
      return c.life > 0;
    });

    ctx.restore();
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-28 sm:h-32 rounded-lg pointer-events-none"
      style={{ imageRendering: "auto" }}
    />
  );
};

export default SnakeEscapeAnimation;
