import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

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
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

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

  // ---------- Sleigh animation (NEW) ----------
  // If you place a licensed image in /assets, we’ll use it:
  // e.g. assets/santa-sleigh.png (transparent background recommended)
  private sleighImg: HTMLImageElement | null = null;
  private sleighImgReady = false;
  private readonly sleighImgSrc = ''; // <-- set to 'assets/santa-sleigh.png' if you have it

  private readonly sleighPeriod = 20; // seconds per pass (slow)
  private readonly dropPhases = [0.20, 0.32, 0.44, 0.56, 0.68]; // a few gifts per pass
  private dropped: boolean[] = [];
  private prevPhase = 0;
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
    this.loadSleighAsset();
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
    const trunkDots = 90;
    for (let i = 0; i < trunkDots; i++) {
      const x = cx + this.rnd(-trunkW * 0.5, trunkW * 0.5);
      const y = cy + treeH * 0.5 - trunkH + this.rnd(0, trunkH);
      this.tree.push({
        x, y,
        r: this.rnd(0.8, 1.8),
        baseA: this.rnd(0.18, 0.45),
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

  // ---------- Sleigh + gifts (NEW) ----------

  private loadSleighAsset(): void {
    if (!this.sleighImgSrc) return; // using our drawn version

    const img = new Image();
    img.onload = () => {
      this.sleighImgReady = true;
    };
    img.onerror = () => {
      this.sleighImgReady = false;
      this.sleighImg = null;
    };
    img.src = this.sleighImgSrc;

    this.sleighImg = img;
  }

  private getSleighState(t: number): { x: number; y: number; phase: number } {
    const phase = this.frac(t / this.sleighPeriod);
    const margin = 180;
    const x = this.lerp(-margin, this.w + margin, phase);

    // keep it under the Merry Christmas SVG text area
    const baseY = Math.max(110, this.h * 0.16);
    const y = baseY + Math.sin(phase * Math.PI * 2) * 10;

    return { x, y, phase };
  }

  private spawnGift(x: number, y: number): void {
    const size = this.rnd(10, 16);
    const colors = ['#ff3b3b', '#27c265', '#50c8ff', '#ffd64f', '#b56bff'];
    const ribbons = ['#ffffff', '#ffd64f', '#ff3b3b', '#27c265'];

    this.gifts.push({
      x, y,
      vx: this.rnd(-12, 12),
      vy: this.rnd(0, 20),
      size,
      rot: this.rnd(-0.8, 0.8),
      vr: this.rnd(-2.5, 2.5),
      a: 1,
      color: colors[(Math.random() * colors.length) | 0],
      ribbon: ribbons[(Math.random() * ribbons.length) | 0],
    });
  }

  private drawGift(ctx: CanvasRenderingContext2D, g: Gift): void {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rot);
    ctx.globalAlpha = 0.9 * g.a;

    const s = g.size;
    const w = s * 1.2;
    const h = s;

    // box
    ctx.fillStyle = g.color;
    ctx.beginPath();
    this.roundRect(ctx, -w / 2, -h / 2, w, h, 3);
    ctx.fill();

    // ribbon vertical + horizontal
    ctx.globalAlpha = 0.85 * g.a;
    ctx.fillStyle = g.ribbon;
    ctx.fillRect(-2, -h / 2, 4, h);
    ctx.fillRect(-w / 2, -2, w, 4);

    // bow (two loops)
    ctx.globalAlpha = 0.8 * g.a;
    ctx.beginPath();
    ctx.arc(-4, -h / 2 + 2, 2.2, 0, Math.PI * 2);
    ctx.arc( 4, -h / 2 + 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // highlight
    ctx.globalAlpha = 0.25 * g.a;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 2, 3, h - 4);

    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) * 0.5));
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  private drawSleighColorful(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void {
    // If you have a licensed PNG/SVG in assets, use it
    if (this.sleighImg && this.sleighImgReady) {
      const scale = Math.max(0.55, Math.min(0.95, Math.min(this.w, this.h) / 1000));
      const w = 320 * scale;
      const h = 130 * scale;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.drawImage(this.sleighImg, x - w / 2, y - h / 2, w, h);
      ctx.restore();
      return;
    }

    // Otherwise: draw a colourful vector sleigh + reindeer (original)
    ctx.save();
    ctx.translate(x, y);

    const scale = Math.max(0.55, Math.min(0.95, Math.min(this.w, this.h) / 1000));
    ctx.scale(scale, scale);

    // slight bob
    const bob = Math.sin(t * 1.6) * 1.5;
    ctx.translate(0, bob);

    // reins
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-210, -2);
    ctx.quadraticCurveTo(-120, -12, -52, 6);
    ctx.stroke();

    // reindeer (3)
    const deerY = -6;
    for (let i = 0; i < 3; i++) {
      const dx = -230 - i * 60;
      const step = Math.sin(t * 6 + i) * 2;

      // body
      ctx.fillStyle = '#8b5a2b';
      ctx.beginPath();
      ctx.ellipse(dx, deerY + step, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // head
      ctx.fillStyle = '#7a4a23';
      ctx.beginPath();
      ctx.ellipse(dx + 22, deerY - 4 + step, 9, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // nose (rudolph-ish)
      ctx.fillStyle = '#ff3b3b';
      ctx.beginPath();
      ctx.arc(dx + 31, deerY - 2 + step, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // legs
      ctx.strokeStyle = '#6a3f1d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dx - 8, deerY + 8 + step);
      ctx.lineTo(dx - 12, deerY + 24 + step);
      ctx.moveTo(dx + 2, deerY + 8 + step);
      ctx.lineTo(dx + 0, deerY + 24 + step);
      ctx.stroke();

      // antlers
      ctx.strokeStyle = '#c8a06a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dx + 18, deerY - 12 + step);
      ctx.lineTo(dx + 12, deerY - 26 + step);
      ctx.moveTo(dx + 18, deerY - 12 + step);
      ctx.lineTo(dx + 24, deerY - 26 + step);
      ctx.stroke();

      // harness
      ctx.strokeStyle = '#ffd64f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dx - 10, deerY + step);
      ctx.lineTo(dx + 10, deerY + step);
      ctx.stroke();
    }

    // sleigh runner (gold)
    ctx.strokeStyle = '#ffd64f';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-40, 26);
    ctx.quadraticCurveTo(24, 46, 92, 22);
    ctx.quadraticCurveTo(110, 14, 122, 4);
    ctx.stroke();

    // sleigh base (red)
    ctx.fillStyle = '#c9162a';
    ctx.beginPath();
    ctx.moveTo(-42, 8);
    ctx.quadraticCurveTo(-4, -10, 40, -2);
    ctx.quadraticCurveTo(70, 4, 96, 0);
    ctx.quadraticCurveTo(104, 18, 86, 24);
    ctx.quadraticCurveTo(18, 34, -30, 20);
    ctx.closePath();
    ctx.fill();

    // sleigh trim
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-34, 12);
    ctx.quadraticCurveTo(10, 0, 64, 10);
    ctx.stroke();

    // Santa (red suit + face + hat)
    // body
    ctx.fillStyle = '#e01b2f';
    ctx.beginPath();
    ctx.ellipse(48, -22, 18, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // belt
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(34, -20, 28, 6);
    ctx.fillStyle = '#ffd64f';
    ctx.fillRect(46, -20, 6, 6);

    // face
    ctx.fillStyle = '#f2c9a0';
    ctx.beginPath();
    ctx.arc(54, -36, 7, 0, Math.PI * 2);
    ctx.fill();

    // beard
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(54, -32, 7.5, 0, Math.PI);
    ctx.fill();

    // hat
    ctx.fillStyle = '#e01b2f';
    ctx.beginPath();
    ctx.moveTo(50, -46);
    ctx.quadraticCurveTo(58, -56, 66, -44);
    ctx.quadraticCurveTo(58, -44, 50, -46);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(67, -44, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // sack (green)
    ctx.fillStyle = '#27c265';
    ctx.beginPath();
    ctx.ellipse(86, -18, 14, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // sparkle trail
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 8; i++) {
      const sx = 110 + i * 10;
      const sy = -8 + Math.sin(t * 4 + i) * 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ------------------------------------------

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

    // sleigh phase + gift drops
    const sleigh = this.getSleighState(t);
    const phase = sleigh.phase;

    if (phase < this.prevPhase) {
      this.dropped.fill(false);
    }
    this.prevPhase = phase;

    for (let i = 0; i < this.dropPhases.length; i++) {
      if (!this.dropped[i] && phase >= this.dropPhases[i]) {
        this.spawnGift(sleigh.x + 60, sleigh.y - 10);
        this.dropped[i] = true;
      }
    }

    // gifts physics
    const gravity = 380;
    for (const g of this.gifts) {
      g.vy += gravity * dt;
      g.y += g.vy * dt;
      g.x += g.vx * dt;
      g.rot += g.vr * dt;

      // fade near bottom
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
    const outlineSpeed = 0.14; // your slowed value
    const fadeSpan = 0.12;

    // tree dots
    ctx.save();
    for (const p of this.tree) {
      const tw = 0.55 + 0.45 * Math.sin(t * p.tw + p.ph);
      const aBase = p.baseA * tw;

      const isOutline = p.kind === 'tree' && p.edge === true;

      let xDraw = p.x;
      let yDraw = p.y;
      let moveAlphaMul = 1;

      if (isOutline) {
        const yNorm = this.clamp01((p.y - topY) / treeH);
        const halfW = (yNorm ** 1.15) * (baseW * 0.5);

        const phase = this.frac(t * outlineSpeed + (p.ph / (Math.PI * 2)));
        const xNorm = 1 - 2 * phase;

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

    // gifts + sleigh (NEW, colourful)
    ctx.save();
    for (const g of this.gifts) this.drawGift(ctx, g);
    ctx.restore();

    const sleigh = this.getSleighState(t);
    this.drawSleighColorful(ctx, sleigh.x, sleigh.y, t);

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
