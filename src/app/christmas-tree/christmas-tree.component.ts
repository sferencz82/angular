import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

import { Router } from '@angular/router';

type TreeDot = {
  x: number; y: number;
  r: number;
  baseA: number;
  tw: number;
  ph: number;
  kind: 'tree' | 'ornament' | 'trunk';
  edge?: boolean;
};

type SnowDot = {
  x: number; y: number;
  r: number;
  vy: number;
  vx: number;
  a: number;
};

type Gift = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  rot: number; vr: number;
  a: number;
  color: string;
  ribbon: string;
};

@Component({
  selector: 'app-christmas-tree',
  templateUrl: './christmas-tree.component.html',
  styleUrls: ['./christmas-tree.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChristmasTreeComponent implements AfterViewInit, OnDestroy {

  constructor(private router: Router) {}
  
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  goBack(): void {
  this.router.navigateByUrl('/'); // change to your main route if different
}

  private ctx!: CanvasRenderingContext2D;
  private rafId: number | null = null;

  private w = 0;
  private h = 0;
  private dpr = 1;

  private tree: TreeDot[] = [];
  private snow: SnowDot[] = [];

  private gifts: Gift[] = [];

  private t0 = performance.now();
  private lastNow = performance.now();

  // pointer-follow glow
  private pointer = { x: 0, y: 0, active: false };

  // -------- Sleigh (SVG -> Image) --------
  private sleighImg: HTMLImageElement | null = null;
  private sleighReady = false;

  private readonly sleighPeriod = 20; // seconds / pass (slow)
  private readonly dropPhases = [0.22, 0.35, 0.48, 0.61, 0.74]; // gifts per pass
  private dropped: boolean[] = [];
  private prevPhase = 0;

  // Inline SVG (transparent background). It's a stylised vector matching your reference.
  private readonly sleighSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 320">
    <defs>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="b"/>
        <feMerge>
          <feMergeNode in="b"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Reindeer -->
    <g transform="translate(120,165)" filter="url(#soft)">
      <!-- legs -->
      <g stroke="#7a4a23" stroke-width="10" stroke-linecap="round">
        <path d="M120,80 L95,150"/>
        <path d="M175,80 L155,150"/>
        <path d="M250,80 L230,150"/>
        <path d="M285,80 L300,150"/>
      </g>

      <!-- body -->
      <ellipse cx="185" cy="70" rx="160" ry="75" fill="#b87745"/>
      <ellipse cx="160" cy="55" rx="130" ry="55" fill="#c98b57" opacity="0.65"/>
      <!-- tail -->
      <path d="M35,70 q-25,15 -20,35 q35,-5 50,-25 q-10,-15 -30,-10z" fill="#b87745"/>

      <!-- neck + head -->
      <path d="M295,50 q65,10 85,55 q-10,65 -80,60 q-55,-5 -70,-45 q-10,-25 10,-70z" fill="#b87745"/>
      <ellipse cx="395" cy="105" rx="70" ry="55" fill="#c98b57"/>
      <ellipse cx="420" cy="110" rx="40" ry="32" fill="#d9a173" opacity="0.75"/>

      <!-- nose -->
      <circle cx="455" cy="120" r="10" fill="#111"/>
      <!-- eye -->
      <circle cx="410" cy="92" r="6" fill="#111"/>

      <!-- antlers -->
      <g fill="none" stroke="#7a4a23" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <path d="M405,55 C385,20 360,0 340,-10"/>
        <path d="M390,30 C365,20 350,10 330,5"/>
        <path d="M425,55 C445,25 470,10 495,0"/>
        <path d="M440,30 C455,25 470,18 490,12"/>
      </g>

      <!-- harness -->
      <g>
        <rect x="290" y="55" width="30" height="120" rx="12" fill="#e62a2a"/>
        <rect x="85" y="75" width="220" height="26" rx="13" fill="#e62a2a"/>
        <circle cx="300" cy="140" r="16" fill="#ffd64f"/>
        <path d="M300,156 q18,20 0,40 q-18,-20 0,-40z" fill="#ffd64f"/>
      </g>
    </g>

    <!-- Reins -->
    <g stroke="#d0b46b" stroke-width="6" fill="none" stroke-linecap="round">
      <path d="M520,170 C640,140 720,150 835,165"/>
      <path d="M520,195 C650,165 740,165 850,185"/>
    </g>

    <!-- Sleigh -->
    <g transform="translate(670,120)" filter="url(#soft)">
      <!-- runner -->
      <path d="M60,170 C120,205 250,205 330,160 C370,140 390,120 410,90"
            fill="none" stroke="#cfcfcf" stroke-width="14" stroke-linecap="round"/>
      <!-- sleigh body -->
      <path d="M40,120
               C80,60 190,55 240,85
               C275,105 325,105 355,80
               C375,145 345,175 245,185
               C150,195 80,175 40,140 Z"
            fill="#d61c2b"/>
      <!-- gold trim -->
      <path d="M55,130
               C95,90 185,90 230,110
               C265,125 315,130 340,105"
            fill="none" stroke="#d0b46b" stroke-width="8" stroke-linecap="round"/>
      <!-- seat -->
      <path d="M160,95 L160,35 L240,35"
            fill="none" stroke="#b41420" stroke-width="14" stroke-linecap="round"/>

      <!-- Santa -->
      <g transform="translate(240,30)">
        <!-- bag -->
        <path d="M115,75 C150,70 170,90 165,120
                 C160,150 120,160 95,140
                 C70,120 75,85 115,75 Z"
              fill="#ffffff" opacity="0.95"/>
        <!-- body -->
        <ellipse cx="35" cy="95" rx="55" ry="42" fill="#d61c2b"/>
        <!-- belt -->
        <rect x="0" y="92" width="75" height="14" rx="7" fill="#111"/>
        <rect x="30" y="92" width="15" height="14" rx="3" fill="#d0b46b"/>
        <!-- head -->
        <circle cx="55" cy="45" r="18" fill="#f2c9a0"/>
        <!-- beard -->
        <path d="M40,48 C45,80 70,82 78,55
                 C70,68 55,72 40,48 Z"
              fill="#fff"/>
        <!-- hat -->
        <path d="M45,30 C65,0 105,15 92,45
                 C78,30 65,28 45,30 Z"
              fill="#d61c2b"/>
        <circle cx="95" cy="45" r="8" fill="#fff"/>
      </g>
    </g>
  </svg>
  `.trim();
  // ------------------------------------------

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    const now = performance.now();
    this.t0 = now;
    this.lastNow = now;

    this.resize();
    this.buildScene();
    this.loadSleighSvg(); // NEW
    this.loop();
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resize();
    this.buildScene();
  }

  onPointerMove(ev: PointerEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.pointer.x = ev.clientX - rect.left;
    this.pointer.y = ev.clientY - rect.top;
    this.pointer.active = true;
  }

  onPointerLeave(): void {
    this.pointer.active = false;
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;

    const rect = canvas.getBoundingClientRect();
    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    this.w = Math.max(1, Math.floor(rect.width));
    this.h = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(this.w * this.dpr);
    canvas.height = Math.floor(this.h * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (!this.pointer.active) {
      this.pointer.x = this.w * 0.42;
      this.pointer.y = this.h * 0.45;
    }
  }

  private rnd(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
  private clamp01(n: number): number {
    return Math.max(0, Math.min(1, n));
  }
  private frac(n: number): number {
    return n - Math.floor(n);
  }
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private loadSleighSvg(): void {
    const img = new Image();
    img.onload = () => {
      this.sleighReady = true;
    };
    img.onerror = () => {
      this.sleighReady = false;
      this.sleighImg = null;
    };

    // data-uri from SVG string (no PNG assets)
    const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(this.sleighSvg)}`;
    img.src = uri;

    this.sleighImg = img;
  }

  private getSleighDims(): { w: number; h: number } {
    // target width responsive
    const targetW = Math.min(this.w * 0.72, 720);
    // SVG viewBox aspect: 1100x320
    const targetH = targetW * (320 / 1100);
    return { w: targetW, h: targetH };
  }

  private getSleighState(t: number): { x: number; y: number; phase: number } {
    const { w: sw } = this.getSleighDims();
    const phase = this.frac(t / this.sleighPeriod);

    // keep off-screen margins based on sleigh width
    const margin = sw * 0.6;
    const x = this.lerp(-margin, this.w + margin, phase);

    // under the text
    const baseY = Math.max(130, this.h * 0.18);
    const y = baseY + Math.sin(phase * Math.PI * 2) * 10;

    return { x, y, phase };
  }

  private spawnGift(x: number, y: number): void {
    const size = this.rnd(10, 16);
    const colors = ['#ff3b3b', '#27c265', '#50c8ff', '#ffd64f', '#b56bff'];
    const ribbons = ['#ffffff', '#ffd64f', '#ff3b3b', '#27c265'];

    this.gifts.push({
      x, y,
      vx: this.rnd(-14, 14),
      vy: this.rnd(0, 30),
      size,
      rot: this.rnd(-0.8, 0.8),
      vr: this.rnd(-2.6, 2.6),
      a: 1,
      color: colors[(Math.random() * colors.length) | 0],
      ribbon: ribbons[(Math.random() * ribbons.length) | 0],
    });
  }

  private buildScene(): void {
    this.tree = [];
    this.snow = [];
    this.gifts = [];

    this.dropped = new Array(this.dropPhases.length).fill(false);
    this.prevPhase = 0;

    const cx = this.w * 0.5;
    const cy = this.h * 0.52;

    const treeH = Math.min(this.h * 0.55, 520);
    const baseW = Math.min(this.w * 0.40, 320);

    const treeDots = Math.floor(Math.min(1200, Math.max(650, (this.w * this.h) / 1400)));
    for (let i = 0; i < treeDots; i++) {
      const ny = Math.random();
      const y = cy - treeH * 0.5 + ny * treeH;

      const halfW = (ny ** 1.15) * (baseW * 0.5);
      const edgeBias = Math.random() < 0.35;
      let nx = this.rnd(-1, 1);
      let isEdge = false;

      if (edgeBias) {
        nx = Math.sign(nx) * (0.65 + 0.35 * Math.random());
        isEdge = true;
      }

      const x = cx + nx * halfW;

      const isOrn = Math.random() < 0.06;
      const r = isOrn ? this.rnd(1.8, 3.2) : this.rnd(0.7, 2.0);

      this.tree.push({
        x, y, r,
        baseA: isOrn ? this.rnd(0.55, 0.95) : this.rnd(0.25, 0.75),
        tw: isOrn ? this.rnd(1.2, 2.4) : this.rnd(0.7, 1.6),
        ph: this.rnd(0, Math.PI * 2),
        kind: isOrn ? 'ornament' : 'tree',
        edge: isOrn ? false : isEdge,
      });
    }

    // trunk
    const trunkW = Math.max(10, baseW * 0.12);
    const trunkH = Math.max(18, treeH * 0.10);
    const trunkDots = 110; // slightly more visible
    for (let i = 0; i < trunkDots; i++) {
      const x = cx + this.rnd(-trunkW * 0.55, trunkW * 0.55);
      const y = cy + treeH * 0.5 - trunkH + this.rnd(0, trunkH);
      this.tree.push({
        x, y,
        r: this.rnd(1.0, 2.2),
        baseA: this.rnd(0.28, 0.58),
        tw: this.rnd(0.6, 1.2),
        ph: this.rnd(0, Math.PI * 2),
        kind: 'trunk',
      });
    }

    // snow
    const snowCount = Math.floor(Math.min(420, Math.max(160, (this.w * this.h) / 5000)));
    for (let i = 0; i < snowCount; i++) {
      this.snow.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: this.rnd(0.6, 1.7),
        vy: this.rnd(18, 55),
        vx: this.rnd(-8, 8),
        a: this.rnd(0.10, 0.35),
      });
    }
  }

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastNow) / 1000);
    this.lastNow = now;

    const t = (now - this.t0) / 1000;

    this.update(t, dt);
    this.render(t);
  };

  private update(t: number, dt: number): void {
    // snow
    for (const s of this.snow) {
      s.y += s.vy * dt;
      s.x += s.vx * dt;

      if (s.y > this.h + 8) {
        s.y = -8;
        s.x = Math.random() * this.w;
      }
      if (s.x < -10) s.x = this.w + 10;
      if (s.x > this.w + 10) s.x = -10;
    }

    // sleigh drops
    const sleigh = this.getSleighState(t);
    const phase = sleigh.phase;

    if (phase < this.prevPhase) this.dropped.fill(false);
    this.prevPhase = phase;

    const { w: sw, h: sh } = this.getSleighDims();
    for (let i = 0; i < this.dropPhases.length; i++) {
      if (!this.dropped[i] && phase >= this.dropPhases[i]) {
        // drop near Santa/sleigh center
        this.spawnGift(sleigh.x + sw * 0.12, sleigh.y + sh * 0.05);
        this.dropped[i] = true;
      }
    }

    // gifts physics
    const gravity = 420;
    for (const g of this.gifts) {
      g.vy += gravity * dt;
      g.y += g.vy * dt;
      g.x += g.vx * dt;
      g.rot += g.vr * dt;

      const fadeStart = this.h * 0.78;
      if (g.y > fadeStart) {
        const f = (g.y - fadeStart) / (this.h - fadeStart);
        g.a = this.clamp01(1 - f);
      } else {
        g.a = 1;
      }
    }
    this.gifts = this.gifts.filter(g => g.y < this.h + 60 && g.a > 0.02);
  }

  private roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  private drawGift(ctx: CanvasRenderingContext2D, g: Gift): void {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rot);
    ctx.globalAlpha = 0.95 * g.a;

    const s = g.size;
    const w = s * 1.2;
    const h = s;

    ctx.fillStyle = g.color;
    this.roundRectPath(ctx, -w / 2, -h / 2, w, h, 3);
    ctx.fill();

    ctx.globalAlpha = 0.85 * g.a;
    ctx.fillStyle = g.ribbon;
    ctx.fillRect(-2, -h / 2, 4, h);
    ctx.fillRect(-w / 2, -2, w, 4);

    ctx.globalAlpha = 0.25 * g.a;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 2, 3, h - 4);

    ctx.restore();
  }

  private render(t: number): void {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.w, this.h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.w, this.h);

    // snow
    ctx.save();
    for (const s of this.snow) {
      ctx.globalAlpha = Math.min(1, s.a * 3);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // pointer glow setup
    const px = this.pointer.x;
    const py = this.pointer.y;
    const glowRadius = 0.75 * Math.max(120, Math.min(this.w, this.h) * 0.22);
    const influenceRadius = glowRadius * 0.70;

    // tree geometry for outline motion
    const cx = this.w * 0.5;
    const cy = this.h * 0.52;
    const treeH = Math.min(this.h * 0.55, 520);
    const baseW = Math.min(this.w * 0.40, 320);
    const topY = cy - treeH * 0.5;

    // outline motion
    const outlineSpeed = 0.14; // your slowed speed
    const fadeSpan = 0.12;

    // tree dots
    ctx.save();
    for (const p of this.tree) {
      const tw = 0.55 + 0.45 * Math.sin(t * p.tw + p.ph);
      const aBase = p.baseA * tw;

      const isOutline = p.kind === 'tree' && p.edge === true;

      let xDraw = p.x;
      const yDraw = p.y;
      let moveAlphaMul = 1;

      if (isOutline) {
        const yNorm = this.clamp01((p.y - topY) / treeH);
        const halfW = (yNorm ** 1.15) * (baseW * 0.5);

        const phase = this.frac(t * outlineSpeed + (p.ph / (Math.PI * 2)));
        const xNorm = 1 - 2 * phase; // right -> left

        xDraw = cx + xNorm * halfW;

        const fadeIn = xNorm > 1 - fadeSpan ? (1 - xNorm) / fadeSpan : 1;
        const fadeOut = xNorm < -1 + fadeSpan ? (xNorm + 1) / fadeSpan : 1;
        moveAlphaMul = this.clamp01(fadeIn * fadeOut);
      }

      // pointer boost uses moved position
      let boost = 0;
      if (this.pointer.active) {
        const dx = xDraw - px;
        const dy = yDraw - py;
        const d = Math.hypot(dx, dy);
        boost = this.clamp01(1 - d / influenceRadius);
      }

      const a2 = this.clamp01((aBase + boost * (p.kind === 'trunk' ? 0.25 : 0.75)) * moveAlphaMul);
      const r2 = p.r * (1 + boost * 0.8);

      ctx.globalAlpha = a2;

      // make trunk + ornaments always glow slightly
      if (p.kind === 'ornament' || boost > 0.25 || p.kind === 'trunk' || isOutline) {
        const g = ctx.createRadialGradient(xDraw, yDraw, 0, xDraw, yDraw, r2 * 3.2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(xDraw, yDraw, r2 * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = this.clamp01(a2 + 0.12);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(xDraw, yDraw, r2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(xDraw, yDraw, r2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // gifts
    ctx.save();
    for (const g of this.gifts) this.drawGift(ctx, g);
    ctx.restore();

    // sleigh (SVG image)
    if (this.sleighImg && this.sleighReady) {
      const { x, y } = this.getSleighState(t);
      const { w: sw, h: sh } = this.getSleighDims();

      ctx.save();
      // slight bob/tilt
      const bob = Math.sin(t * 1.4) * 4;
      const tilt = Math.sin(t * 0.8) * 0.02;

      ctx.translate(x, y + bob);
      ctx.rotate(tilt);
      ctx.globalAlpha = 1;

      ctx.drawImage(this.sleighImg, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();
    }

    // mouse-follow glow layer (additive)
    if (this.pointer.active) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const glow = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
      glow.addColorStop(0.0, 'rgba(255,255,255,0.4125)');
      glow.addColorStop(0.35, 'rgba(255,255,255,0.165)');
      glow.addColorStop(1.0, 'rgba(255,255,255,0)');

      ctx.fillStyle = glow;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // subtle vignette
    ctx.save();
    const vg = ctx.createRadialGradient(
      cx, cy, Math.min(this.w, this.h) * 0.15,
      cx, cy, Math.max(this.w, this.h) * 0.75
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();
  }
}
