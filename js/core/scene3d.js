/* ==========================================================================
   ML.Scene3D — moteur 3D (Three.js) pour les scènes du cours.
   - un SEUL contexte WebGL partagé : chaque scène rend dans le renderer
     commun puis copie l'image dans son propre <canvas> 2D (évite la limite
     de ~16 contextes WebGL par page)
   - caméra orbitale maison (glisser = tourner, molette = zoom, clic droit = pan)
   - coordonnées « mathématiques » : z vers le haut, et une boîte de données
     {x:[a,b], y:[c,d], z:[e,f]} mise à l'échelle dans un cube monde
   - primitives : surfaces z=f(x,y), courbes épaisses, points, flèches, plans,
     segments, étiquettes LaTeX projetées
   ========================================================================== */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C;
  let GL = null;
  function sharedRenderer() {
    if (GL) return GL;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: false });
    r.setPixelRatio(1);
    r.setClearColor(0x000000, 1);
    r.localClippingEnabled = true;
    GL = r; return r;
  }
  const col = c => new THREE.Color(c);

  class Scene3D {
    constructor(el, opts = {}) {
      this.el = el;
      this.o = Object.assign({
        range: { x: [-1, 1], y: [-1, 1], z: [-1, 1] },
        size: [2, 2, 1.4],       // taille monde de la boîte (x, y, z)
        theta: -0.9, phi: 1.05, radius: 5.2, target: null,
        autoRotate: false, axes: true, grid: true, gridZ: null,
        labels: { x: 'x', y: 'y', z: 'z' }, ticks: true, fov: 38,
      }, opts);
      this.canvas = document.createElement('canvas'); el.appendChild(this.canvas);
      el._eng = this; this.disp = { grid: true, axes: true, labels: true }; // bascules « Affichage » du widget
      this.ctx2d = this.canvas.getContext('2d');
      this.overlay = document.createElement('div'); this.overlay.className = 'overlay'; el.appendChild(this.overlay);
      this.labels = new Map(); this.used = new Set();
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(this.o.fov, 1, 0.01, 100);
      this.camera.up.set(0, 0, 1);
      this.theta = this.o.theta; this.phi = this.o.phi; this.radius = this.o.radius;
      this.target = new THREE.Vector3(...(this.o.target || [0, 0, this.o.size[2] * 0.35]));
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      this.light = new THREE.DirectionalLight(0xffffff, 0.75); this.scene.add(this.light);
      this.light2 = new THREE.DirectionalLight(0x88aaff, 0.25); this.light2.position.set(-3, 2, -4); this.scene.add(this.light2);
      this.layers = new Map();
      this.visible = false; this._raf = 0; this.animators = new Set();
      this.setRange(this.o.range);
      this._resize();
      new ResizeObserver(() => { this._resize(); this.request(); }).observe(el);
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.request(); }, { rootMargin: '100px' }).observe(el);
      this._bind();
      if (this.o.axes) this.drawAxes();
    }

    // ---------- échelles données ↔ monde ----------
    setRange(r) {
      this.range = { x: r.x.slice(), y: r.y.slice(), z: r.z.slice() };
      const [SX, SY, SZ] = this.o.size;
      this.k = [SX / (r.x[1] - r.x[0]), SY / (r.y[1] - r.y[0]), SZ / (r.z[1] - r.z[0])];
      this.c0 = [-SX / 2 - r.x[0] * this.k[0], -SY / 2 - r.y[0] * this.k[1], -r.z[0] * this.k[2]];
    }
    map(x, y, z) { return new THREE.Vector3(this.c0[0] + x * this.k[0], this.c0[1] + y * this.k[1], this.c0[2] + z * this.k[2]); }
    mapA(p) { return this.map(p[0], p[1], p[2]); }

    // ---------- calques ----------
    layer(name) {
      let g = this.layers.get(name);
      if (!g) { g = new THREE.Group(); g.name = name; this.scene.add(g); this.layers.set(name, g); }
      return g;
    }
    clear(name) {
      const g = this.layers.get(name); if (!g) return;
      g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); });
      g.clear();
    }
    show(name, on) { const g = this.layer(name); g.visible = on; this.request(); }

    // ---------- axes / grille ----------
    drawAxes() {
      const g = this.layer('__axes'), gg = this.layer('__grid'), r = this.range, [SX, SY, SZ] = this.o.size;
      this.clear('__axes'); this.clear('__grid');
      const gz = this.o.gridZ ?? (r.z[0] <= 0 && r.z[1] >= 0 ? 0 : r.z[0]);
      g.visible = this.disp.axes; gg.visible = this.disp.grid;
      if (this.o.grid) {
        const pts = [], stepx = niceStep(r.x[1] - r.x[0]), stepy = niceStep(r.y[1] - r.y[0]);
        for (let x = Math.ceil(r.x[0] / stepx) * stepx; x <= r.x[1] + 1e-9; x += stepx) pts.push(this.map(x, r.y[0], gz), this.map(x, r.y[1], gz));
        for (let y = Math.ceil(r.y[0] / stepy) * stepy; y <= r.y[1] + 1e-9; y += stepy) pts.push(this.map(r.x[0], y, gz), this.map(r.x[1], y, gz));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        gg.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x29abca, transparent: true, opacity: 0.28 })));
      }
      const ax = new THREE.LineBasicMaterial({ color: 0xcfd8e0 });
      const x0 = M.clamp(0, r.x[0], r.x[1]), y0 = M.clamp(0, r.y[0], r.y[1]), z0 = M.clamp(0, r.z[0], r.z[1]);
      const seg = (a, b) => new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), ax);
      g.add(seg(this.map(r.x[0], y0, gz), this.map(r.x[1], y0, gz)));
      g.add(seg(this.map(x0, r.y[0], gz), this.map(x0, r.y[1], gz)));
      g.add(seg(this.map(x0, y0, r.z[0]), this.map(x0, y0, r.z[1])));
      this._axisEnds = { x: this.map(r.x[1], y0, gz), y: this.map(x0, r.y[1], gz), z: this.map(x0, y0, r.z[1]) };
      [['x', 0xcfd8e0], ['y', 0xcfd8e0], ['z', 0xcfd8e0]].forEach(([k]) => {
        const end = this._axisEnds[k], dir = k === 'x' ? [1, 0, 0] : k === 'y' ? [0, 1, 0] : [0, 0, 1];
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 12), new THREE.MeshBasicMaterial({ color: 0xcfd8e0 }));
        cone.position.copy(end); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir)); g.add(cone);
      });
      this._ticks = [];
      if (this.o.ticks) {
        const tx = niceStep(r.x[1] - r.x[0]), ty = niceStep(r.y[1] - r.y[0]), tz = niceStep(r.z[1] - r.z[0]);
        for (let x = Math.ceil(r.x[0] / tx) * tx; x <= r.x[1] + 1e-9; x += tx) if (Math.abs(x) > 1e-9) this._ticks.push([this.map(x, y0, gz), fmtTick(x)]);
        for (let y = Math.ceil(r.y[0] / ty) * ty; y <= r.y[1] + 1e-9; y += ty) if (Math.abs(y) > 1e-9) this._ticks.push([this.map(x0, y, gz), fmtTick(y)]);
        for (let z = Math.ceil(r.z[0] / tz) * tz; z <= r.z[1] + 1e-9; z += tz) if (Math.abs(z) > 1e-9) this._ticks.push([this.map(x0, y0, z), fmtTick(z)]);
      }
      this.request();
    }

    // Bascule d'affichage générique : 'grid' | 'axes' | 'labels'
    setDisplay(key, on) {
      this.disp[key] = on;
      if (key === 'grid') this.layer('__grid').visible = on;
      if (key === 'axes') this.layer('__axes').visible = on;
      this.request();
    }

    // ---------- primitives ----------
    // Surface z = f(x,y) sur [x0,x1]×[y0,y1]. opts : res, color(z,x,y)->hex | colormap auto, opacity, wire
    surface(layerName, f, opts = {}) {
      const g = this.layer(layerName), r = this.range;
      const [xa, xb] = opts.xr || r.x, [ya, yb] = opts.yr || r.y, n = opts.res || 60;
      const zmin = opts.zclip ? opts.zclip[0] : r.z[0], zmax = opts.zclip ? opts.zclip[1] : r.z[1];
      const pos = new Float32Array((n + 1) * (n + 1) * 3), colr = new Float32Array((n + 1) * (n + 1) * 3), Zs = [];
      let lo = Infinity, hi = -Infinity;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
        const x = xa + (xb - xa) * i / n, y = ya + (yb - ya) * j / n; let z = f(x, y);
        if (!isFinite(z)) z = zmax;
        Zs.push(z); lo = Math.min(lo, z); hi = Math.max(hi, z);
      }
      const clo = opts.cmin ?? Math.max(lo, zmin), chi = opts.cmax ?? Math.min(hi, zmax);
      let k = 0;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++, k++) {
        const x = xa + (xb - xa) * i / n, y = ya + (yb - ya) * j / n, z = M.clamp(Zs[k], zmin, zmax);
        const p = this.map(x, y, z); pos.set([p.x, p.y, p.z], 3 * k);
        let c3;
        if (opts.color) c3 = col(typeof opts.color === 'function' ? opts.color(Zs[k], x, y) : opts.color);
        else { const t = (Zs[k] - clo) / ((chi - clo) || 1); const rgb = M.rampRgb(opts.logColor ? Math.log1p(9 * M.clamp(t, 0, 1)) / Math.log(10) : t, opts.ramp); c3 = new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255); }
        colr.set([c3.r, c3.g, c3.b], 3 * k);
      }
      const idx = [];
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
        // on retire les quads entièrement écrêtés au-dessus
        if (opts.hideClipped && Zs[a] > zmax && Zs[b] > zmax && Zs[c] > zmax && Zs[d] > zmax) continue;
        idx.push(a, b, d, a, d, c);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
      geo.setIndex(idx); geo.computeVertexNormals();
      const op = opts.opacity ?? 0.88;
      const mat = new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: op < 1, opacity: op, shininess: 40, depthWrite: op >= 1 || !!opts.depthWrite, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      const mesh = new THREE.Mesh(geo, mat); g.add(mesh);
      if (opts.wire !== false) {
        const wpts = [], step = Math.max(1, Math.round(n / (opts.wireLines || 16)));
        for (let j = 0; j <= n; j += step) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i; wpts.push(...pos.slice(3 * a, 3 * a + 6)); }
        for (let i = 0; i <= n; i += step) for (let j = 0; j < n; j++) { const a = j * (n + 1) + i, b = a + n + 1; wpts.push(...pos.slice(3 * a, 3 * a + 3), ...pos.slice(3 * b, 3 * b + 3)); }
        const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(wpts), 3));
        g.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: opts.wireColor || 0xffffff, transparent: true, opacity: opts.wireOpacity ?? 0.13 })));
      }
      this.request();
      return mesh;
    }
    // Courbe épaisse (tube) passant par des points en coordonnées données.
    curve(layerName, pts, opts = {}) {
      const g = this.layer(layerName), P = pts.filter(p => p.every(isFinite)).map(p => this.mapA(p));
      if (P.length < 2) return null;
      const path = new THREE.CurvePath();
      for (let i = 0; i < P.length - 1; i++) if (P[i].distanceTo(P[i + 1]) > 1e-7) path.add(new THREE.LineCurve3(P[i], P[i + 1]));
      if (!path.curves.length) return null;
      const geo = new THREE.TubeGeometry(path, Math.max(1, path.curves.length * (opts.sub || 1)), opts.radius || 0.012, 8, false);
      const mat = opts.basic ? new THREE.MeshBasicMaterial({ color: col(opts.color || C.yellow), transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 })
        : new THREE.MeshPhongMaterial({ color: col(opts.color || C.yellow), emissive: col(opts.color || C.yellow), emissiveIntensity: 0.35, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 });
      const m = new THREE.Mesh(geo, mat); g.add(m); this.request(); return m;
    }
    // Lignes fines (1 px) : paires de points.
    segments(layerName, pairs, opts = {}) {
      const g = this.layer(layerName), P = [];
      for (const [a, b] of pairs) P.push(this.mapA(a), this.mapA(b));
      const geo = new THREE.BufferGeometry().setFromPoints(P);
      const mat = opts.dashed ? new THREE.LineDashedMaterial({ color: col(opts.color || C.white), dashSize: 0.04, gapSize: 0.03, transparent: true, opacity: opts.opacity ?? 0.8 })
        : new THREE.LineBasicMaterial({ color: col(opts.color || C.white), transparent: true, opacity: opts.opacity ?? 0.8 });
      const l = new THREE.LineSegments(geo, mat); if (opts.dashed) l.computeLineDistances(); g.add(l); this.request(); return l;
    }
    polyline(layerName, pts, opts = {}) { const pairs = []; for (let i = 0; i < pts.length - 1; i++) pairs.push([pts[i], pts[i + 1]]); return this.segments(layerName, pairs, opts); }
    // Sphères (points de données). colors : tableau de couleurs par point ou couleur unique.
    points(layerName, pts, opts = {}) {
      const g = this.layer(layerName), r = opts.radius || 0.035;
      const geo = new THREE.SphereGeometry(r, 16, 12);
      const mat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 });
      const inst = new THREE.InstancedMesh(geo, mat, Math.max(1, pts.length));
      const m4 = new THREE.Matrix4();
      pts.forEach((p, i) => {
        const v = this.mapA(p); m4.makeTranslation(v.x, v.y, v.z); inst.setMatrixAt(i, m4);
        const c = Array.isArray(opts.color) ? opts.color[i] : (opts.color || C.yellow);
        inst.setColorAt(i, col(c));
      });
      inst.count = pts.length; g.add(inst); this.request(); return inst;
    }
    // Flèche 3D de a vers b (coordonnées données).
    arrow(layerName, a, b, opts = {}) {
      const g = this.layer(layerName), A = this.mapA(a), B = this.mapA(b), d = B.clone().sub(A), L = d.length();
      if (L < 1e-6) return null;
      const color = col(opts.color || C.yellow), hr = opts.head || 0.045, hl = Math.min(hr * 2.6, L * 0.4);
      const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.35, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(opts.radius || 0.013, opts.radius || 0.013, L - hl, 10), mat);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      shaft.quaternion.copy(q); shaft.position.copy(A.clone().add(d.clone().multiplyScalar((L - hl) / (2 * L))));
      const head = new THREE.Mesh(new THREE.ConeGeometry(hr, hl, 16), mat);
      head.quaternion.copy(q); head.position.copy(B.clone().sub(d.clone().multiplyScalar(hl / (2 * L))));
      const grp = new THREE.Group(); grp.add(shaft, head); g.add(grp); this.request(); return grp;
    }
    // Parallélogramme : origine o, vecteurs u, v (données). Pour dessiner plans / sous-espaces.
    quad(layerName, o, u, v, opts = {}) {
      const g = this.layer(layerName);
      const P = [o, M.add(o, u), M.add(M.add(o, u), v), M.add(o, v)].map(p => this.mapA(p));
      const geo = new THREE.BufferGeometry().setFromPoints([P[0], P[1], P[2], P[0], P[2], P[3]]);
      geo.computeVertexNormals();
      const mat = new THREE.MeshPhongMaterial({ color: col(opts.color || C.blue), side: THREE.DoubleSide, transparent: true, opacity: opts.opacity ?? 0.3, depthWrite: false, shininess: 10 });
      const m = new THREE.Mesh(geo, mat); g.add(m);
      if (opts.edges !== false) this.polyline(layerName, [o, M.add(o, u), M.add(M.add(o, u), v), M.add(o, v), o], { color: opts.edgeColor || opts.color || C.blue, opacity: 0.7 });
      if (opts.grid) {
        const pairs = [], n = opts.grid;
        for (let i = 1; i < n; i++) { const t = i / n; pairs.push([M.add(o, M.scale(u, t)), M.add(M.add(o, M.scale(u, t)), v)]); pairs.push([M.add(o, M.scale(v, t)), M.add(M.add(o, M.scale(v, t)), u)]); }
        this.segments(layerName, pairs, { color: opts.edgeColor || opts.color || C.blue, opacity: 0.25 });
      }
      this.request(); return m;
    }
    // Maillage générique à partir de triangles (liste de [p,q,r]).
    tris(layerName, triangles, opts = {}) {
      const g = this.layer(layerName), P = [];
      for (const t of triangles) for (const p of t) P.push(this.mapA(p));
      const geo = new THREE.BufferGeometry().setFromPoints(P); geo.computeVertexNormals();
      const op = opts.opacity ?? 0.5;
      const mat = new THREE.MeshPhongMaterial({ color: col(opts.color || C.blue), side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1, shininess: 30, flatShading: !!opts.flat });
      const m = new THREE.Mesh(geo, mat); g.add(m); this.request(); return m;
    }
    // Maillage paramétrique (u,v) -> [x,y,z] données (sphères, ellipsoïdes…).
    paramSurface(layerName, F, opts = {}) {
      const g = this.layer(layerName), nu = opts.nu || 48, nv = opts.nv || 24, pos = [], idx = [];
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = this.mapA(F(i / nu, j / nv)); pos.push(p.x, p.y, p.z); }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); geo.setIndex(idx); geo.computeVertexNormals();
      const op = opts.opacity ?? 0.5;
      const mat = new THREE.MeshPhongMaterial({ color: col(opts.color || C.blue), side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1, shininess: 50 });
      const m = new THREE.Mesh(geo, mat); g.add(m);
      if (opts.wire) {
        const w = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: col(opts.wireColor || opts.color || C.blue), transparent: true, opacity: opts.wireOpacity ?? 0.12 }));
        g.add(w);
      }
      this.request(); return m;
    }
    // Étiquette LaTeX en surcouche, positionnée à un point 3D (données).
    label(key, p, latex, opts = {}) { this.labels.has(key) || this._mkLabel(key); const L = this.labels.get(key); L.p = p; L.o = opts; if (L.tex !== latex) { ML.katex(L.d, latex); L.tex = latex; } L.on = true; this.request(); }
    hideLabel(key) { const L = this.labels.get(key); if (L) { L.on = false; this.request(); } }
    _mkLabel(key) { const d = document.createElement('div'); d.className = 'lbl'; this.overlay.appendChild(d); this.labels.set(key, { d, on: false }); }

    // ---------- caméra / rendu ----------
    _resize() {
      const r = this.el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.W = Math.max(10, r.width); this.H = Math.max(10, r.height); this.dpr = dpr;
      this.canvas.width = Math.round(this.W * dpr); this.canvas.height = Math.round(this.H * dpr);
      this.camera.aspect = this.W / this.H; this.camera.updateProjectionMatrix();
    }
    _placeCamera() {
      const t = this.target, r = this.radius, ph = M.clamp(this.phi, 0.05, Math.PI - 0.05);
      this.camera.position.set(t.x + r * Math.sin(ph) * Math.cos(this.theta), t.y + r * Math.sin(ph) * Math.sin(this.theta), t.z + r * Math.cos(ph));
      this.camera.lookAt(t);
      this.light.position.copy(this.camera.position).add(new THREE.Vector3(0.5, 0.3, 1.5));
    }
    request() { if (!this._raf) this._raf = requestAnimationFrame(t => { this._raf = 0; this.render(t); }); }
    animate(fn) { this.animators.add(fn); this.request(); return () => this.animators.delete(fn); }
    render(t) {
      if (!this.visible) return;
      let again = false;
      if (this.o.autoRotate && !this._dragging) { this.theta += 0.0025; again = true; }
      for (const fn of this.animators) if (fn(t) !== false) again = true; else this.animators.delete(fn);
      if (this.onFrame) this.onFrame(this);
      this._placeCamera();
      const r = sharedRenderer(), w = this.canvas.width, h = this.canvas.height;
      const sz = r.getSize(new THREE.Vector2());
      if (sz.x < w || sz.y < h) r.setSize(Math.max(sz.x, w), Math.max(sz.y, h), false);
      const full = r.getSize(new THREE.Vector2());
      r.setViewport(0, 0, w, h); r.setScissor(0, 0, w, h); r.setScissorTest(true);
      r.render(this.scene, this.camera);
      this.ctx2d.clearRect(0, 0, w, h);
      this.ctx2d.drawImage(r.domElement, 0, full.y - h, w, h, 0, 0, w, h);
      this._labels();
      if (again) this.request();
    }
    _proj(v) { const p = v.clone().project(this.camera); return [(p.x + 1) / 2 * this.W, (1 - p.y) / 2 * this.H, p.z]; }
    _labels() {
      for (const [, L] of this.labels) {
        if (!L.on || !this.disp.labels) { L.d.style.display = 'none'; continue; }
        const [X, Y, Z] = this._proj(this.mapA(L.p));
        if (Z > 1 || X < -50 || X > this.W + 50) { L.d.style.display = 'none'; continue; }
        L.d.style.display = ''; L.d.style.left = X + (L.o.dx || 0) + 'px'; L.d.style.top = Y + (L.o.dy || 0) + 'px';
        L.d.style.color = L.o.color || '#fff'; L.d.style.fontSize = (L.o.size || 15) + 'px';
      }
      // axes + graduations
      if (!this._axLbl) {
        this._axLbl = {};
        for (const k of ['x', 'y', 'z']) { const d = document.createElement('div'); d.className = 'lbl'; this.overlay.appendChild(d); this._axLbl[k] = d; }
        this._tickEls = [];
      }
      if (!this.disp.axes && this._axLbl) { for (const k of ['x', 'y', 'z']) this._axLbl[k].style.display = 'none'; this._tickEls.forEach(d => { d.style.display = 'none'; }); }
      else if (this.o.axes && this._axisEnds) {
        for (const k of ['x', 'y', 'z']) {
          const d = this._axLbl[k], txt = this.o.labels[k];
          if (!txt) { d.style.display = 'none'; continue; }
          if (d._t !== txt) { ML.katex(d, txt); d._t = txt; }
          const end = this._axisEnds[k].clone().add(new THREE.Vector3(k === 'x' ? 0.12 : 0, k === 'y' ? 0.12 : 0, k === 'z' ? 0.1 : 0));
          const [X, Y] = this._proj(end); d.style.display = ''; d.style.left = X + 'px'; d.style.top = Y + 'px'; d.style.color = '#cfd8e0';
        }
        while (this._tickEls.length < this._ticks.length) { const d = document.createElement('div'); d.className = 'lbl'; d.style.fontSize = '10.5px'; d.style.color = '#7f8a96'; this.overlay.appendChild(d); this._tickEls.push(d); }
        this._tickEls.forEach((d, i) => {
          const tk = this._ticks[i]; if (!tk) { d.style.display = 'none'; return; }
          const [X, Y] = this._proj(tk[0]); d.style.display = ''; d.style.left = X + 'px'; d.style.top = (Y + 10) + 'px'; d.textContent = tk[1];
        });
      }
    }
    setView(theta, phi, radius) { if (theta != null) this.theta = theta; if (phi != null) this.phi = phi; if (radius != null) this.radius = radius; this.request(); }
    // Animation fluide de la caméra vers une vue.
    flyTo(theta, phi, radius, ms = 900) {
      const a = [this.theta, this.phi, this.radius], b = [theta ?? a[0], phi ?? a[1], radius ?? a[2]], t0 = performance.now();
      this.animate(t => { const u = M.smooth(M.clamp((performance.now() - t0) / ms, 0, 1)); [this.theta, this.phi, this.radius] = a.map((v, i) => v + (b[i] - v) * u); return u < 1; });
    }
    _bind() {
      const cv = this.canvas; let last = null, button = 0;
      cv.addEventListener('pointerdown', e => { last = [e.clientX, e.clientY]; button = e.button; this._dragging = true; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
      cv.addEventListener('pointermove', e => {
        if (!last) { cv.style.cursor = 'grab'; return; }
        const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
        if (button === 2 || e.shiftKey) {
          const s = this.radius * 0.0016, right = new THREE.Vector3(-Math.sin(this.theta), Math.cos(this.theta), 0);
          this.target.add(right.multiplyScalar(-dx * s)); this.target.z += dy * s;
        } else { this.theta -= dx * 0.008; this.phi = M.clamp(this.phi - dy * 0.008, 0.05, Math.PI - 0.05); }
        this.request();
      });
      const up = () => { last = null; this._dragging = false; cv.style.cursor = 'grab'; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('contextmenu', e => e.preventDefault());
      cv.addEventListener('wheel', e => { e.preventDefault(); this.radius = M.clamp(this.radius * Math.exp(e.deltaY * 0.001), 1.2, 30); this.request(); }, { passive: false });
    }
  }
  function niceStep(range) { const t = range / 5, p = 10 ** Math.floor(Math.log10(t)), f = t / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  function fmtTick(v) { return (+v.toPrecision(4)).toString().replace('-', '−'); }

  ML.Scene3D = Scene3D;
})(window.ML);
