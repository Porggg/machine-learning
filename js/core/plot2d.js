/* ==========================================================================
   ML.Plot2D — moteur de rendu 2D (Canvas) façon « NumberPlane » de manim.
   - repère monde ↔ écran, grille, axes, graduations
   - primitives : courbes, fonctions, points, flèches, polygones, cercles
   - contours (marching squares), heatmaps, champs de vecteurs
   - étiquettes LaTeX en surcouche HTML (KaTeX)
   - poignées déplaçables, clic, survol, zoom/pan optionnels
   Rendu à la demande : p.request() planifie un redraw au prochain frame.
   ========================================================================== */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C;

  class Plot2D {
    constructor(el, opts = {}) {
      this.el = el;
      this.o = Object.assign({
        xlim: [-5, 5], ylim: [-3, 3], equal: false, grid: true, axes: true, ticks: true,
        pad: [14, 14, 26, 34], // haut, droite, bas, gauche (px)
        xlabel: null, ylabel: null, pannable: false, zoomable: false, bg: '#000',
        gridStep: null, tickFmt: null, logx: false,
      }, opts);
      this.xlim = this.o.xlim.slice(); this.ylim = this.o.ylim.slice();
      this.canvas = document.createElement('canvas');
      el._eng = this; this.disp = { labels: true }; // bascules « Affichage » du widget
      el.appendChild(this.canvas);
      this.overlay = document.createElement('div'); this.overlay.className = 'overlay';
      el.appendChild(this.overlay);
      this.ctx = this.canvas.getContext('2d');
      this.labels = new Map(); this.usedLabels = new Set();
      this.draggables = []; this.drag = null; this.hover = null;
      this.onDraw = null; this.onClick = null; this.onMove = null; this.onDragEnd = null;
      this.cache = new Map();
      this._raf = 0;
      this._resize();
      new ResizeObserver(() => { this._resize(); this.request(); }).observe(el);
      this._bindEvents();
    }

    // ---------- géométrie ----------
    _resize() {
      const r = this.el.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      this.W = Math.max(10, r.width); this.H = Math.max(10, r.height); this.dpr = dpr;
      this.canvas.width = Math.round(this.W * dpr); this.canvas.height = Math.round(this.H * dpr);
      this._fit();
    }
    _fit() {
      const [pt, pr, pb, pl] = this.o.pad;
      this.px0 = pl; this.px1 = this.W - pr; this.py0 = pt; this.py1 = this.H - pb;
      if (this.o.equal) { // même échelle en x et y : on élargit la plage la plus « serrée »
        const sx = (this.px1 - this.px0) / (this.xlim[1] - this.xlim[0]);
        const sy = (this.py1 - this.py0) / (this.ylim[1] - this.ylim[0]);
        const s = Math.min(sx, sy);
        const cx = (this.xlim[0] + this.xlim[1]) / 2, cy = (this.ylim[0] + this.ylim[1]) / 2;
        const hw = (this.px1 - this.px0) / s / 2, hh = (this.py1 - this.py0) / s / 2;
        this.vx = [cx - hw, cx + hw]; this.vy = [cy - hh, cy + hh];
      } else { this.vx = this.xlim.slice(); this.vy = this.ylim.slice(); }
    }
    // Bascule d'affichage générique : 'grid' | 'axes' | 'labels'
    setDisplay(key, on) { if (key === 'grid') this.o.grid = on; else if (key === 'axes') this.o.axes = on; else this.disp[key] = on; this.request(); }
    setLimits(xlim, ylim) { if (xlim) this.xlim = xlim.slice(); if (ylim) this.ylim = ylim.slice(); this._fit(); this.request(); }
    sx(x) { return this.px0 + (x - this.vx[0]) / (this.vx[1] - this.vx[0]) * (this.px1 - this.px0); }
    sy(y) { return this.py1 - (y - this.vy[0]) / (this.vy[1] - this.vy[0]) * (this.py1 - this.py0); }
    wx(px) { return this.vx[0] + (px - this.px0) / (this.px1 - this.px0) * (this.vx[1] - this.vx[0]); }
    wy(py) { return this.vy[0] + (this.py1 - py) / (this.py1 - this.py0) * (this.vy[1] - this.vy[0]); }
    get scaleX() { return (this.px1 - this.px0) / (this.vx[1] - this.vx[0]); }
    get scaleY() { return (this.py1 - this.py0) / (this.vy[1] - this.vy[0]); }

    // ---------- boucle de rendu ----------
    request() { if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this.render(); }); }
    render() {
      const c = this.ctx;
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.fillStyle = this.o.bg; c.fillRect(0, 0, this.W, this.H);
      this.usedLabels.clear();
      if (this.px1 - this.px0 < 8 || this.py1 - this.py0 < 8) return; // vue pas encore dimensionnée (masquée)
      if (this.o.grid) this.drawGrid();
      if (this.onDraw) {
        c.save(); c.beginPath(); c.rect(this.px0, this.py0, this.px1 - this.px0, this.py1 - this.py0); c.clip();
        this.onDraw(this);
        c.restore();
      }
      if (this.o.axes) this.drawAxes();
      if (this.onDrawTop) this.onDrawTop(this);
      for (const [k, d] of this.labels) d.style.display = this.usedLabels.has(k) && (this.disp.labels || k.startsWith('__')) ? '' : 'none';
    }

    // ---------- grille / axes ----------
    niceStep(range, px) {
      const target = range / Math.max(2, px / 70);
      const p = 10 ** Math.floor(Math.log10(target)), f = target / p;
      return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
    }
    drawGrid() {
      const c = this.ctx;
      const sx = this.o.gridStep ? this.o.gridStep[0] : this.niceStep(this.vx[1] - this.vx[0], this.px1 - this.px0);
      const sy = this.o.gridStep ? this.o.gridStep[1] : this.niceStep(this.vy[1] - this.vy[0], this.py1 - this.py0);
      this._steps = [sx, sy];
      c.lineWidth = 1;
      const pass = (step, color) => {
        c.strokeStyle = color; c.beginPath();
        for (let x = Math.ceil(this.vx[0] / step) * step; x <= this.vx[1]; x += step) { const X = Math.round(this.sx(x)) + .5; c.moveTo(X, this.py0); c.lineTo(X, this.py1); }
        c.stroke(); c.beginPath();
        c.strokeStyle = color;
        return step;
      };
      c.save(); c.beginPath(); c.rect(this.px0, this.py0, this.px1 - this.px0, this.py1 - this.py0); c.clip();
      // sous-grille
      c.strokeStyle = 'rgba(41,171,202,0.10)'; c.beginPath();
      for (let x = Math.ceil(this.vx[0] / (sx / 2)) * (sx / 2); x <= this.vx[1]; x += sx / 2) { const X = Math.round(this.sx(x)) + .5; c.moveTo(X, this.py0); c.lineTo(X, this.py1); }
      for (let y = Math.ceil(this.vy[0] / (sy / 2)) * (sy / 2); y <= this.vy[1]; y += sy / 2) { const Y = Math.round(this.sy(y)) + .5; c.moveTo(this.px0, Y); c.lineTo(this.px1, Y); }
      c.stroke();
      // grille principale
      c.strokeStyle = 'rgba(41,171,202,0.28)'; c.beginPath();
      for (let x = Math.ceil(this.vx[0] / sx) * sx; x <= this.vx[1]; x += sx) { const X = Math.round(this.sx(x)) + .5; c.moveTo(X, this.py0); c.lineTo(X, this.py1); }
      for (let y = Math.ceil(this.vy[0] / sy) * sy; y <= this.vy[1]; y += sy) { const Y = Math.round(this.sy(y)) + .5; c.moveTo(this.px0, Y); c.lineTo(this.px1, Y); }
      c.stroke();
      c.restore();
      void pass;
    }
    drawAxes() {
      const c = this.ctx, [sx, sy] = this._steps || [1, 1];
      c.save();
      c.strokeStyle = 'rgba(220,230,240,0.85)'; c.lineWidth = 1.5;
      const x0 = M.clamp(this.sx(this.o.axisX ?? 0), this.px0, this.px1), y0 = M.clamp(this.sy(this.o.axisY ?? 0), this.py0, this.py1);
      c.beginPath(); c.moveTo(this.px0, y0); c.lineTo(this.px1, y0); c.moveTo(x0, this.py0); c.lineTo(x0, this.py1); c.stroke();
      if (this.o.ticks) {
        c.fillStyle = '#9aa3ad'; c.font = '11px ' + getComputedStyle(document.body).fontFamily;
        const fmt = this.o.tickFmt || (v => { const s = Math.abs(v) < 1e-9 ? '0' : (+v.toPrecision(6)).toString(); return s.replace('-', '−'); });
        c.textAlign = 'center'; c.textBaseline = 'top';
        for (let x = Math.ceil(this.vx[0] / sx) * sx; x <= this.vx[1] + 1e-9; x += sx) {
          if (Math.abs(x) < sx * 1e-6 && this.sx(0) > this.px0 + 2) continue;
          const X = this.sx(x); if (X < this.px0 + 8 || X > this.px1 - 8) continue;
          c.beginPath(); c.moveTo(X, y0 - 3); c.lineTo(X, y0 + 3); c.stroke();
          const ty = Math.min(y0 + 5, this.H - 14);
          c.fillText(fmt(x, 'x'), X, ty);
        }
        c.textAlign = 'right'; c.textBaseline = 'middle';
        for (let y = Math.ceil(this.vy[0] / sy) * sy; y <= this.vy[1] + 1e-9; y += sy) {
          if (Math.abs(y) < sy * 1e-6) continue;
          const Y = this.sy(y); if (Y < this.py0 + 6 || Y > this.py1 - 6) continue;
          c.beginPath(); c.moveTo(x0 - 3, Y); c.lineTo(x0 + 3, Y); c.stroke();
          c.fillText(fmt(y, 'y'), Math.max(x0 - 6, 28), Y);
        }
      }
      c.restore();
      if (this.o.xlabel) this.tex('__xl', this.px1 - 8, y0 - 14, this.o.xlabel, { screen: true, anchor: 'right' });
      if (this.o.ylabel) this.tex('__yl', x0 + 10, this.py0 + 10, this.o.ylabel, { screen: true, anchor: 'left' });
    }

    // ---------- primitives ----------
    _style(s = {}) {
      const c = this.ctx;
      c.strokeStyle = s.color || C.blue; c.fillStyle = s.fill || s.color || C.blue;
      c.lineWidth = s.width || 2.5; c.globalAlpha = s.alpha == null ? 1 : s.alpha;
      c.setLineDash(s.dash || []); c.lineJoin = 'round'; c.lineCap = 'round';
    }
    polyline(pts, s = {}) {
      const c = this.ctx; c.save(); this._style(s); c.beginPath();
      let pen = false;
      for (const p of pts) {
        if (p == null || !isFinite(p[1]) || !isFinite(p[0])) { pen = false; continue; }
        const X = this.sx(p[0]), Y = this.sy(p[1]);
        if (Math.abs(Y) > 1e5) { pen = false; continue; }
        pen ? c.lineTo(X, Y) : c.moveTo(X, Y); pen = true;
      }
      if (s.close) c.closePath();
      if (s.fillArea) { c.globalAlpha = s.fillAlpha ?? 0.2; c.fillStyle = s.fillArea; c.fill(); c.globalAlpha = s.alpha ?? 1; }
      c.stroke(); c.restore();
    }
    fn(f, s = {}, range) {
      const [a, b] = range || this.vx, n = s.samples || Math.max(200, Math.round(this.W));
      const pts = [];
      for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; pts.push([x, f(x)]); }
      this.polyline(pts, s);
    }
    param(f, t0, t1, s = {}) { const n = s.samples || 300, pts = []; for (let i = 0; i <= n; i++) pts.push(f(t0 + (t1 - t0) * i / n)); this.polyline(pts, s); }
    seg(x0, y0, x1, y1, s = {}) { this.polyline([[x0, y0], [x1, y1]], s); }
    hline(y, s = {}) { this.seg(this.vx[0], y, this.vx[1], y, s); }
    vline(x, s = {}) { this.seg(x, this.vy[0], x, this.vy[1], s); }
    point(x, y, s = {}) {
      const c = this.ctx; c.save(); this._style(s);
      const r = s.r || 5, X = this.sx(x), Y = this.sy(y);
      c.beginPath();
      if (s.shape === 'square') c.rect(X - r, Y - r, 2 * r, 2 * r);
      else if (s.shape === 'cross') { c.moveTo(X - r, Y - r); c.lineTo(X + r, Y + r); c.moveTo(X + r, Y - r); c.lineTo(X - r, Y + r); c.lineWidth = s.width || 2.5; c.stroke(); c.restore(); return; }
      else if (s.shape === 'diamond') { c.moveTo(X, Y - r * 1.3); c.lineTo(X + r * 1.3, Y); c.lineTo(X, Y + r * 1.3); c.lineTo(X - r * 1.3, Y); c.closePath(); }
      else c.arc(X, Y, r, 0, 2 * Math.PI);
      if (s.hollow) { c.lineWidth = s.width || 2; c.stroke(); }
      else { c.fill(); if (s.stroke) { c.strokeStyle = s.stroke; c.lineWidth = s.strokeWidth || 1.5; c.stroke(); } }
      if (s.glow) { c.globalAlpha = 0.25; c.beginPath(); c.arc(X, Y, r * 2.2, 0, 2 * Math.PI); c.fill(); }
      c.restore();
    }
    arrow(x0, y0, x1, y1, s = {}) {
      const c = this.ctx; c.save(); this._style(s);
      const X0 = this.sx(x0), Y0 = this.sy(y0), X1 = this.sx(x1), Y1 = this.sy(y1);
      const L = Math.hypot(X1 - X0, Y1 - Y0); if (L < 0.5) { c.restore(); return; }
      const h = Math.min(s.head || 11, L * 0.45), ang = Math.atan2(Y1 - Y0, X1 - X0);
      c.beginPath(); c.moveTo(X0, Y0); c.lineTo(X1 - Math.cos(ang) * h * 0.7, Y1 - Math.sin(ang) * h * 0.7); c.stroke();
      c.setLineDash([]); c.beginPath(); c.moveTo(X1, Y1);
      c.lineTo(X1 - h * Math.cos(ang - 0.4), Y1 - h * Math.sin(ang - 0.4));
      c.lineTo(X1 - h * Math.cos(ang + 0.4), Y1 - h * Math.sin(ang + 0.4));
      c.closePath(); c.fillStyle = s.color || C.blue; c.fill(); c.restore();
    }
    poly(pts, s = {}) {
      const c = this.ctx; c.save(); this._style(s); c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(this.sx(p[0]), this.sy(p[1])) : c.moveTo(this.sx(p[0]), this.sy(p[1])));
      c.closePath();
      if (s.fill) { c.globalAlpha = s.fillAlpha ?? 0.3; c.fillStyle = s.fill; c.fill(); }
      if (s.stroke !== false) { c.globalAlpha = s.alpha ?? 1; c.stroke(); }
      c.restore();
    }
    rect(x0, y0, x1, y1, s = {}) { this.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], s); }
    circle(x, y, r, s = {}) { this.param(t => [x + r * Math.cos(t), y + r * Math.sin(t)], 0, 2 * Math.PI, Object.assign({ samples: 120 }, s)); }
    ellipse(cx, cy, S, level, s = {}) { // {w : (w−c)ᵀ S (w−c) = level}
      const { values, vectors } = M.eigSym(S);
      const a = Math.sqrt(level / values[0]), b = Math.sqrt(level / values[1]);
      const u = [vectors[0][0], vectors[1][0]], v = [vectors[0][1], vectors[1][1]];
      this.param(t => [cx + a * Math.cos(t) * u[0] + b * Math.sin(t) * v[0], cy + a * Math.cos(t) * u[1] + b * Math.sin(t) * v[1]], 0, 2 * Math.PI, Object.assign({ samples: 160 }, s));
    }
    text(x, y, str, s = {}) {
      const c = this.ctx; c.save();
      c.fillStyle = s.color || '#ddd'; c.globalAlpha = s.alpha ?? 1;
      c.font = (s.size || 13) + 'px ' + (s.font || getComputedStyle(document.body).fontFamily);
      c.textAlign = s.align || 'center'; c.textBaseline = s.baseline || 'middle';
      const X = s.screen ? x : this.sx(x), Y = s.screen ? y : this.sy(y);
      if (s.shadow !== false) { c.shadowColor = '#000'; c.shadowBlur = 4; }
      c.fillText(str, X + (s.dx || 0), Y + (s.dy || 0)); c.restore();
    }
    // Étiquette LaTeX en surcouche (réutilisée d'un frame à l'autre).
    tex(key, x, y, latex, s = {}) {
      let d = this.labels.get(key);
      if (!d) { d = document.createElement('div'); d.className = 'lbl'; this.overlay.appendChild(d); this.labels.set(key, d); d._tex = null; }
      if (d._tex !== latex) { ML.katex(d, latex); d._tex = latex; }
      const X = s.screen ? x : this.sx(x), Y = s.screen ? y : this.sy(y);
      d.style.left = (X + (s.dx || 0)) + 'px'; d.style.top = (Y + (s.dy || 0)) + 'px';
      d.style.color = s.color || '#fff'; d.style.fontSize = (s.size || 15) + 'px';
      d.style.opacity = s.alpha ?? 1;
      d.style.transform = s.anchor === 'left' ? 'translate(0,-50%)' : s.anchor === 'right' ? 'translate(-100%,-50%)' : s.anchor === 'top' ? 'translate(-50%,0)' : s.anchor === 'bottom' ? 'translate(-50%,-100%)' : 'translate(-50%,-50%)';
      this.usedLabels.add(key);
    }

    // ---------- champs scalaires ----------
    // Échantillonne f sur une grille (res en px). Mis en cache par `key`.
    sample(f, res = 4, key) {
      const nx = Math.ceil((this.px1 - this.px0) / res) + 1, ny = Math.ceil((this.py1 - this.py0) / res) + 1;
      const ck = key ? key + '|' + nx + 'x' + ny + '|' + this.vx + this.vy : null;
      if (ck && this.cache.has(ck)) return this.cache.get(ck);
      const Z = new Float64Array(nx * ny), xs = [], ys = [];
      for (let i = 0; i < nx; i++) xs.push(this.wx(this.px0 + i * res));
      for (let j = 0; j < ny; j++) ys.push(this.wy(this.py0 + j * res));
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) Z[j * nx + i] = f(xs[i], ys[j]);
      const out = { Z, nx, ny, xs, ys, res };
      if (ck) { if (this.cache.size > 40) this.cache.clear(); this.cache.set(ck, out); }
      return out;
    }
    heatmap(f, colorFn, s = {}) {
      const g = this.sample(f, s.res || 3, s.key);
      const img = new ImageData(g.nx, g.ny), A = Math.round(255 * (s.alpha ?? 1));
      for (let k = 0; k < g.nx * g.ny; k++) { const [r, gg, b] = colorFn(g.Z[k]); img.data[4 * k] = r; img.data[4 * k + 1] = gg; img.data[4 * k + 2] = b; img.data[4 * k + 3] = A; }
      if (!this._off) { this._off = document.createElement('canvas'); }
      this._off.width = g.nx; this._off.height = g.ny; this._off.getContext('2d').putImageData(img, 0, 0);
      const c = this.ctx; c.save(); c.imageSmoothingEnabled = true;
      c.drawImage(this._off, 0, 0, g.nx, g.ny, this.px0, this.py0, (g.nx - 1) * g.res + 1, (g.ny - 1) * g.res + 1);
      c.restore();
      return g;
    }
    // Heatmap dont la fonction renvoie directement une couleur [r,g,b] (ex. mélange de classes).
    heatmapRGB(fRGB, s = {}) {
      const res = s.res || 4, nx = Math.ceil((this.px1 - this.px0) / res) + 1, ny = Math.ceil((this.py1 - this.py0) / res) + 1;
      const img = new ImageData(nx, ny), A = Math.round(255 * (s.alpha ?? 1));
      for (let j = 0; j < ny; j++) { const y = this.wy(this.py0 + j * res); for (let i = 0; i < nx; i++) { const c = fRGB(this.wx(this.px0 + i * res), y), k = 4 * (j * nx + i); img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = A; } }
      if (!this._off) this._off = document.createElement('canvas');
      this._off.width = nx; this._off.height = ny; this._off.getContext('2d').putImageData(img, 0, 0);
      const c = this.ctx; c.save(); c.imageSmoothingEnabled = true;
      c.drawImage(this._off, 0, 0, nx, ny, this.px0, this.py0, (nx - 1) * res + 1, (ny - 1) * res + 1); c.restore();
    }
    contour(f, levels, s = {}) {
      const g = s.grid || this.sample(f, s.res || 4, s.key), { Z, nx, ny, res } = g, c = this.ctx;
      c.save();
      levels.forEach((lv, li) => {
        this._style(Object.assign({ width: 1.4 }, s, { color: typeof s.color === 'function' ? s.color(lv, li) : (s.color || C.blue) }));
        c.beginPath();
        for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
          const a = Z[j * nx + i], b = Z[j * nx + i + 1], d = Z[(j + 1) * nx + i], e = Z[(j + 1) * nx + i + 1];
          const code = (a > lv) | ((b > lv) << 1) | ((e > lv) << 2) | ((d > lv) << 3);
          if (code === 0 || code === 15) continue;
          const X = this.px0 + i * res, Y = this.py0 + j * res;
          const t = (p, q) => (lv - p) / (q - p);
          const top = [X + t(a, b) * res, Y], right = [X + res, Y + t(b, e) * res], bot = [X + t(d, e) * res, Y + res], left = [X, Y + t(a, d) * res];
          const seg = (P, Q) => { c.moveTo(P[0], P[1]); c.lineTo(Q[0], Q[1]); };
          switch (code) {
            case 1: case 14: seg(top, left); break;
            case 2: case 13: seg(top, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(right, bot); break;
            case 6: case 9: seg(top, bot); break;
            case 7: case 8: seg(left, bot); break;
            case 5: seg(top, left); seg(right, bot); break;
            case 10: seg(top, right); seg(left, bot); break;
          }
        }
        c.stroke();
      });
      c.restore();
      return g;
    }
    vectorField(F, s = {}) {
      const step = s.step || 34;
      for (let X = this.px0 + step / 2; X < this.px1; X += step) for (let Y = this.py0 + step / 2; Y < this.py1; Y += step) {
        const x = this.wx(X), y = this.wy(Y), [u, v] = F(x, y), L = Math.hypot(u * this.scaleX, v * this.scaleY);
        if (!isFinite(L) || L < 1e-9) continue;
        const k = Math.min(step * 0.42, (s.scale || 1) * L) / L;
        const col = s.colorFn ? s.colorFn(L) : (s.color || C.teal);
        this.arrow(x, y, x + u * k, y + v * k, { color: col, width: 1.3, head: 6, alpha: s.alpha ?? 0.8 });
      }
    }

    // ---------- interactions ----------
    addDraggable(d) { this.draggables.push(Object.assign({ r: 12 }, d)); return d; }
    _pos(e) { const r = this.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    _hit(X, Y) {
      let best = null, bd = Infinity;
      for (const d of this.draggables) {
        if (d.enabled && !d.enabled()) continue;
        const p = d.get(); const dx = this.sx(p[0]) - X, dy = this.sy(p[1]) - Y, dist = Math.hypot(dx, dy);
        if (dist < d.r && dist < bd) { bd = dist; best = d; }
      }
      return best;
    }
    _bindEvents() {
      const cv = this.canvas;
      cv.addEventListener('pointerdown', e => {
        const [X, Y] = this._pos(e), d = this._hit(X, Y);
        if (d) {
          this.drag = { d, off: [this.wx(X) - d.get()[0], this.wy(Y) - d.get()[1]] };
          cv.setPointerCapture(e.pointerId); e.preventDefault(); d.onStart && d.onStart(); return;
        }
        if (this.o.pannable) { this.pan = { X, Y, vx: this.xlim.slice(), vy: this.ylim.slice() }; cv.setPointerCapture(e.pointerId); }
        if (this.onClick) { this._clickStart = [X, Y]; }
      });
      cv.addEventListener('pointermove', e => {
        const [X, Y] = this._pos(e);
        if (this.drag) {
          const { d, off } = this.drag; d.set(this.wx(X) - off[0], this.wy(Y) - off[1], e); this.request(); return;
        }
        if (this.pan) {
          const dx = (X - this.pan.X) / this.scaleX, dy = (Y - this.pan.Y) / this.scaleY;
          this.xlim = [this.pan.vx[0] - dx, this.pan.vx[1] - dx]; this.ylim = [this.pan.vy[0] + dy, this.pan.vy[1] + dy];
          this._fit(); this.request(); return;
        }
        const h = this._hit(X, Y);
        cv.style.cursor = h ? (h.cursor || 'grab') : (this.onClick ? 'crosshair' : (this.o.pannable ? 'move' : 'default'));
        if (this.onMove) { this.mouse = [this.wx(X), this.wy(Y)]; this.onMove(this.mouse[0], this.mouse[1], e); }
      });
      const up = e => {
        if (this.drag) { const d = this.drag.d; this.drag = null; d.onEnd && d.onEnd(); this.onDragEnd && this.onDragEnd(); }
        if (this.pan) { const moved = Math.hypot(this._pos(e)[0] - this.pan.X, this._pos(e)[1] - this.pan.Y) > 4; this.pan = null; if (moved) { this._clickStart = null; return; } }
        if (this._clickStart && this.onClick) {
          const [X, Y] = this._pos(e);
          if (Math.hypot(X - this._clickStart[0], Y - this._clickStart[1]) < 5) this.onClick(this.wx(X), this.wy(Y), e);
        }
        this._clickStart = null;
      };
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', () => { this.drag = null; this.pan = null; });
      cv.addEventListener('pointerleave', () => { if (this.onMove) { this.mouse = null; this.onMove(null, null); } });
      if (this.o.zoomable) cv.addEventListener('wheel', e => {
        e.preventDefault();
        const [X, Y] = this._pos(e), x = this.wx(X), y = this.wy(Y), k = Math.exp(e.deltaY * 0.0015);
        this.xlim = [x + (this.xlim[0] - x) * k, x + (this.xlim[1] - x) * k];
        this.ylim = [y + (this.ylim[0] - y) * k, y + (this.ylim[1] - y) * k];
        this._fit(); this.request();
      }, { passive: false });
      cv.addEventListener('contextmenu', e => { if (this.onClick) e.preventDefault(); });
    }
  }

  ML.Plot2D = Plot2D;
})(window.ML);
