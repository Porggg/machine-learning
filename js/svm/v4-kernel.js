/* Chapitre 3 — SVM · §6 : kernel trick, relèvement 3D, RBF */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const colY = y => y > 0 ? C.blue : C.red;

  const DATASETS = {
    rings: r => { const p = []; for (let i = 0; i < 26; i++) { const t = r.uniform(0, 2 * Math.PI), s = r.uniform(0, 0.9); p.push([s * Math.cos(t), s * Math.sin(t), -1]); } for (let i = 0; i < 34; i++) { const t = r.uniform(0, 2 * Math.PI), s = r.uniform(1.5, 2.3); p.push([s * Math.cos(t), s * Math.sin(t), 1]); } return p; },
    moons: r => { const p = []; for (let i = 0; i < 30; i++) { const t = r.uniform(0, Math.PI); p.push([1.4 * Math.cos(t) - 0.5 + r.normal(0, 0.15), 1.4 * Math.sin(t) - 0.3 + r.normal(0, 0.15), 1]); } for (let i = 0; i < 30; i++) { const t = r.uniform(0, Math.PI); p.push([0.5 - 1.4 * Math.cos(t) + r.normal(0, 0.15), 0.3 - 1.4 * Math.sin(t) + 0.2 + r.normal(0, 0.15), -1]); } return p; },
    xor: r => { const p = []; for (let i = 0; i < 60; i++) { const x = r.uniform(-2.5, 2.5), y = r.uniform(-2.5, 2.5); if (Math.abs(x) < 0.25 || Math.abs(y) < 0.25) { i--; continue; } p.push([x, y, x * y > 0 ? 1 : -1]); } return p; },
    blobs: r => { const p = []; for (let i = 0; i < 25; i++) p.push([r.normal(-1, 0.7), r.normal(-0.6, 0.7), -1]); for (let i = 0; i < 25; i++) p.push([r.normal(1, 0.7), r.normal(0.7, 0.7), 1]); return p; },
  };

  // ------------------------------------------------------------------ svm-lift3d
  ML.scene('svm-lift3d', host => {
    const W = ML.widget(host, {
      title: 'Relever les données pour les rendre linéairement séparables', tag: '3D + 2D',
      views: [{ name: 's3', label: 'espace des features $\\bphi(\\bx)$', cls: 'tall', hint: 'glisser : tourner' }, { name: 'p', label: 'espace d\'origine : la frontière est une conique', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#9a72ac"></i>surface image $\\bphi(\\R^2)$</span><span class="key"><i style="background:#f4d345"></i>hyperplan séparateur dans l\'espace des features</span><span class="key"><i style="background:#fff"></i>sa pré-image $f(\\bx)=0$</span>',
    });
    const R = M.rng(2); let pts = DATASETS.rings(R);
    const MAPS = {
      para: { name: 'φ(x) = (x₁, x₂, x₁² + x₂²)', f: q => [q[0], q[1], q[0] * q[0] + q[1] * q[1]], lab: ['x_1', 'x_2', 'x_1^2+x_2^2'], range: { x: [-2.5, 2.5], y: [-2.5, 2.5], z: [0, 6.5] } },
      poly: { name: 'φ(x) = (x₁², √2·x₁x₂, x₂²)  ⇔  κ = (xᵀx′)²', f: q => [q[0] * q[0], Math.SQRT2 * q[0] * q[1], q[1] * q[1]], lab: ['x_1^2', '\\sqrt2x_1x_2', 'x_2^2'], range: { x: [0, 5.5], y: [-4, 4], z: [0, 5.5] } },
    };
    const st = { map: 'para', t: 1 };
    const sh = W.show, rb = () => build3d();
    W.toggle('surf', 'surface image $\\bphi(\\R^2)$', true, rb); W.toggle('plane', 'hyperplan séparateur (3D)', true, rb); W.toggle('heat', 'fond coloré (2D)', true); W.toggle('marg', 'marges $f=\\pm1$ (2D)', true); W.toggle('sv', 'vecteurs de support', true);
    const lift = q => { const m = MAPS[st.map], z = m.f(q); if (st.map === 'para') return [q[0], q[1], st.t * z[2]]; const base = [q[0] + 2.5, q[1], 0]; return base.map((v, i) => v + (z[i] - v) * st.t); };
    let S3D = null, svm;
    const train = () => { const X = pts.map(q => MAPS[st.map].f(q)), y = pts.map(q => q[2]); const r = M.svm(X, y, M.kernels.linear(), 50); svm = { w: M.svmW(X, y, r.alpha), b: r.b, alpha: r.alpha }; };
    function mk3d() {
      if (S3D) { S3D.setRange(MAPS[st.map].range); S3D.o.labels = { x: MAPS[st.map].lab[0], y: MAPS[st.map].lab[1], z: MAPS[st.map].lab[2] }; S3D.drawAxes(); return; }
      S3D = new ML.Scene3D(W.views.s3, { range: MAPS[st.map].range, size: [2.3, 2.3, 1.9], labels: { x: MAPS.para.lab[0], y: MAPS.para.lab[1], z: MAPS.para.lab[2] }, theta: -0.9, phi: 1.2, radius: 6, target: [0, 0, 0.8] });
    }
    function build3d() {
      const S = S3D; S.clear('d');
      const m = MAPS[st.map], rg = m.range;
      if (sh.surf) S.paramSurface('d', (u, v) => lift([-2.4 + 4.8 * u, -2.4 + 4.8 * v]), { nu: 40, nv: 40, color: C.purple, opacity: 0.16, wire: true, wireOpacity: 0.06 });
      S.points('d', pts.map(lift), { color: pts.map(q => colY(q[2])), radius: 0.035 });
      if (sh.plane && st.t > 0.98 && Math.abs(svm.w[2]) > 1e-6) {
        S.surface('d', (a, b) => -(svm.b + svm.w[0] * a + svm.w[1] * b) / svm.w[2], { res: 2, color: C.yellow, opacity: 0.35, wire: false, xr: rg.x, yr: rg.y, zclip: rg.z });
      }
    }
    const P = new ML.Plot2D(W.views.p, { xlim: [-2.7, 2.7], ylim: [-2.7, 2.7], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.onClick = (x, y, e) => { pts.push([x, y, e.shiftKey ? -1 : 1]); upd(); };
    const fx = (a, b) => M.dot(svm.w, MAPS[st.map].f([a, b])) + svm.b;
    P.onDraw = p => {
      if (sh.heat) p.heatmap(fx, v => M.divRgb(Math.tanh(v)).map(c => c * 0.45), { res: 4 });
      if (sh.marg) p.contour(fx, [-1, 1], { color: C.yellow, width: 1.2, dash: [5, 4] });
      p.contour(fx, [0], { color: '#fff', width: 2.5 });
      pts.forEach((q, i) => { if (svm.alpha[i] > 1e-6 && sh.sv) p.circle(q[0], q[1], 0.15, { color: C.yellow, width: 1.5 }); p.point(q[0], q[1], { color: colY(q[2]), r: 4.5, stroke: '#000' }); });
    };
    const c = W.controls;
    ui.select(c, { label: 'feature map', options: Object.entries(MAPS).map(([k, v]) => [k, v.name]), value: 'para', onChange: v => { st.map = v; mk3d(); upd(); } });
    const tS = ui.slider(c, { label: 'relèvement $t$ (0 → plan, 1 → $\\bphi$)', min: 0, max: 1, step: 0.01, value: 1, onInput: v => { st.t = v; build3d(); } });
    ui.buttons(c, [{ label: '▶ animer le relèvement', primary: true, onClick: () => ML.tween(2500, u => { st.t = u; tS.set(u); build3d(); }) }]);
    ui.select(c, { label: 'données', options: [['rings', 'anneaux'], ['xor', 'XOR'], ['blobs', 'deux nuages']], value: 'rings', onChange: v => { pts = DATASETS[v](M.rng(2)); upd(); } });
    const ro = ui.readout(c);
    ui.note(c, 'XOR avec $(x_1^2,\\sqrt2x_1x_2,x_2^2)$ : c\'est la coordonnée $\\sqrt2x_1x_2$ (signe du produit) qui sépare — un plan vertical dans l\'espace des features, une hyperbole dans le plan d\'origine.');
    function upd() {
      train(); build3d(); P.request();
      const err = pts.filter(q => q[2] * fx(q[0], q[1]) <= 0).length;
      ro.set(`SVM linéaire dans l'espace des features (3D), $C=50$<br>$\\bw$ = (<b>${svm.w.map(v => M.fmt(v, 2)).join('</b>, <b>')}</b>) · $b$ = <b>${M.fmt(svm.b, 2)}</b><br>erreurs d'entraînement : <b>${err}</b> / ${pts.length}`);
    }
    mk3d(); upd();
  });

  // ------------------------------------------------------------------ svm-rbf
  ML.scene('svm-rbf', host => {
    const W = ML.widget(host, {
      title: 'SVM à noyau RBF : $f(\\bx)=\\sum_i\\alpha_iy_i\\kappa(\\bx_i,\\bx)+b$, un paysage de bosses', tag: '2D + 3D',
      views: [{ name: 'p', label: 'décision (blanc : $f=0$, pointillés : $f=\\pm1$)', cls: 'tall', hint: 'clic : +1 · Maj+clic : −1' }, { name: 's3', label: 'surface $f(\\bx)$ et le niveau 0', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>$y=+1$</span><span class="key"><i class="dot" style="background:#fc6255"></i>$y=-1$</span><span class="key"><i class="dot" style="background:transparent;border:2px solid #f4d345"></i>vecteurs de support</span>',
    });
    const st = { ds: 'moons', ls: -0.2, lc: 1 };
    const sh = W.show, rb = () => build3d();
    W.toggle('heat', 'fond coloré $f(\\bx)$', true); W.toggle('marg', 'niveaux $f=\\pm1$', true); W.toggle('sv', 'vecteurs de support', true);
    W.toggle('surf', 'surface $f$ (3D)', true, rb); W.toggle('sea', 'niveau 0 (plan blanc, 3D)', true, rb); W.toggle('pts3', 'points sur la surface (3D)', true, rb);
    let pts = DATASETS.moons(M.rng(4)), svm;
    const train = () => { svm = M.svm(pts.map(q => [q[0], q[1]]), pts.map(q => q[2]), M.kernels.rbf(10 ** st.ls), 10 ** st.lc); };
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3], ylim: [-3, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.onClick = (x, y, e) => { pts.push([x, y, e.shiftKey ? -1 : 1]); upd(); };
    const f = (a, b) => svm.f([a, b]);
    P.onDraw = p => {
      const g = sh.heat ? p.heatmap(f, v => M.divRgb(Math.tanh(v / 1.5)).map(c => c * 0.5), { res: 4 }) : p.sample(f, 4);
      if (sh.marg) p.contour(f, [-1, 1], { color: C.yellow, width: 1.2, dash: [5, 4], grid: g });
      p.contour(f, [0], { color: '#fff', width: 2.5, grid: g });
      pts.forEach((q, i) => { if (svm.alpha[i] > 1e-7 && sh.sv) p.circle(q[0], q[1], 0.13, { color: C.yellow, width: 1.5 }); p.point(q[0], q[1], { color: colY(q[2]), r: 4.2, stroke: '#000' }); });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3, 3], y: [-3, 3], z: [-3, 3] }, size: [2.3, 2.3, 1.6], labels: { x: 'x_1', y: 'x_2', z: 'f' }, theta: -2.2, phi: 1.05, radius: 5.8, target: [0, 0, 0.8] });
    function build3d() {
      S.clear('d');
      if (sh.surf) S.surface('d', f, { res: 48, color: z => M.rgbToHex(M.divRgb(Math.tanh(z / 1.5)).map(v => Math.max(v, 30))), opacity: 0.85, zclip: [-3, 3], wireOpacity: 0.1 });
      if (sh.sea) S.surface('d', () => 0, { res: 2, color: '#ffffff', opacity: 0.12, wire: false });
      if (sh.pts3) S.points('d', pts.map(q => [q[0], q[1], M.clamp(f(q[0], q[1]), -3, 3)]), { color: pts.map(q => colY(q[2])), radius: 0.03 });
    }
    const c = W.controls;
    ui.select(c, { label: 'données', options: [['moons', 'lunes'], ['rings', 'anneaux'], ['xor', 'XOR'], ['blobs', 'deux nuages']], value: 'moons', onChange: v => { st.ds = v; pts = DATASETS[v](M.rng(4)); upd(); } });
    ui.slider(c, { label: 'largeur du noyau $\\sigma$', min: -1, max: 1, step: 0.01, value: 10 ** st.ls, log: true, onInput: v => { st.ls = Math.log10(v); upd(); } });
    ui.slider(c, { label: 'pénalité $C$', min: -1, max: 3, step: 0.01, value: 10 ** st.lc, log: true, onInput: v => { st.lc = Math.log10(v); upd(); } });
    ui.buttons(c, [{ label: 'effacer les points', onClick: () => { pts = []; pts.push([-1, 0, -1], [1, 0, 1]); upd(); } }]);
    const ro = ui.readout(c);
    ui.note(c, 'Chaque vecteur de support dépose une bosse gaussienne de hauteur $\\alpha_iy_i$ ; la mer (plan blanc) découpe le paysage selon la frontière. $\\sigma$ petit + $C$ grand : chaque point a son îlot (sur-apprentissage).');
    function upd() {
      train();
      const nsv = svm.alpha.filter(a => a > 1e-7).length, err = pts.filter(q => q[2] * f(q[0], q[1]) <= 0).length;
      ro.set(`$\\sigma$ = <b>${M.fmt(10 ** st.ls, 3)}</b> · $C$ = <b>${M.fmt(10 ** st.lc, 3)}</b><br>vecteurs de support : <b>${nsv}</b> / ${pts.length}<br>erreurs d'entraînement : <b>${err}</b> · $b$ = <b>${M.fmt(svm.b, 3)}</b>`);
      P.request(); build3d();
    }
    upd();
  });

  // ------------------------------------------------------------------ svm-kernel
  ML.scene('svm-kernel', host => {
    const W = ML.widget(host, {
      title: 'Le noyau comme similarité — et la série infinie du RBF', tag: '2D',
      views: [{ name: 'p', label: '$\\kappa_{\\text{RBF}}(\\bx,\\bx\')$ en fonction de $\\bx$ ($\\bx\'$ fixé)', cls: 'tall', hint: 'glisser $\\bx$ et $\\bx\'$' }, { name: 's', label: 'RBF 1D : noyau exact vs série tronquée à $K$ termes', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\kappa(x,x\')$ exact</span><span class="key"><i style="background:#d147bd"></i>$\\sum_{k\\lt K}\\phi_k(x)\\phi_k(x\')$</span>',
    });
    const st = { x: [0.8, 0.4], xp: [-0.3, 0.9], sigma: 1, K: 3, x1d: 1 };
    const sh = W.show;
    W.toggle('heat', 'carte de $\\kappa(\\cdot,\\bx\')$', true); W.toggle('cont', 'lignes de niveau', true); W.toggle('vec', 'vecteurs $\\bx$, $\\bx\'$', true); W.toggle('exact', 'noyau exact (1D)', true); W.toggle('trunc', 'série tronquée (1D)', true);
    const kr = (a, b) => Math.exp(-((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) / (2 * st.sigma ** 2));
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3], ylim: [-3, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.addDraggable({ get: () => st.x, set: (a, b) => { st.x = [a, b]; upd(); }, r: 13 });
    P.addDraggable({ get: () => st.xp, set: (a, b) => { st.xp = [a, b]; upd(); }, r: 13 });
    P.onDraw = p => {
      if (sh.heat) p.heatmap((a, b) => kr([a, b], st.xp), v => M.rampRgb(v * 0.85).map(c => c * 0.6), { res: 3 });
      if (sh.cont) p.contour((a, b) => kr([a, b], st.xp), [0.1, 0.3, 0.5, 0.7, 0.9], { color: '#fff', width: 1, alpha: 0.35 });
      if (sh.vec) { p.arrow(0, 0, st.x[0], st.x[1], { color: C.blue, width: 2 }); p.arrow(0, 0, st.xp[0], st.xp[1], { color: C.pink, width: 2 }); }
      p.point(st.x[0], st.x[1], { color: C.blue, r: 6, glow: true }); p.point(st.xp[0], st.xp[1], { color: C.pink, r: 6, glow: true });
      p.tex('x', st.x[0], st.x[1], '\\bx', { color: C.blue, dx: 12, dy: -10, anchor: 'left' }); p.tex('xp', st.xp[0], st.xp[1], "\\bx'", { color: C.pink, dx: 12, dy: -10, anchor: 'left' });
    };
    const Sp = new ML.Plot2D(W.views.s, { xlim: [-3, 3], ylim: [-0.4, 1.4], xlabel: 'x' });
    // k-ième feature du RBF 1D : e^{−x²/2σ²} x^k / (σ^k √k!)
    const phiK = (x, k) => Math.exp(-x * x / (2 * st.sigma ** 2)) * x ** k / (st.sigma ** k * Math.sqrt(fact(k)));
    const fact = k => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };
    Sp.onDraw = p => {
      const xp = st.x1d;
      if (sh.exact) p.fn(x => Math.exp(-((x - xp) ** 2) / (2 * st.sigma ** 2)), { color: C.yellow, width: 3 });
      if (sh.trunc) p.fn(x => { let s = 0; for (let k = 0; k < st.K; k++) s += phiK(x, k) * phiK(xp, k); return s; }, { color: C.pink, width: 2.5, dash: [6, 4] });
      p.vline(xp, { color: '#fff', width: 1, alpha: 0.4 });
      p.tex('xp', xp, 1.3, "x'", { color: '#fff' });
    };
    const c = W.controls;
    ui.slider(c, { label: 'largeur $\\sigma$', min: 0.3, max: 2.5, step: 0.01, value: st.sigma, onInput: v => { st.sigma = v; upd(); } });
    ui.slider(c, { label: 'termes de la série $K$', min: 1, max: 25, step: 1, value: st.K, fmt: v => v.toFixed(0), onInput: v => { st.K = v; upd(); } });
    ui.slider(c, { label: "$x'$ (vue 1D)", min: -2.5, max: 2.5, step: 0.01, value: st.x1d, onInput: v => { st.x1d = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const lin = M.dot(st.x, st.xp), pol = lin * lin, phi = q => [q[0] * q[0], Math.SQRT2 * q[0] * q[1], q[1] * q[1]], expl = M.dot(phi(st.x), phi(st.xp));
      ro.set(`linéaire $\\bx\\T\\bx'$ = <b>${M.fmt(lin, 4)}</b><br>polynomial $(\\bx\\T\\bx')^2$ = <b>${M.fmt(pol, 4)}</b><br>$\\bphi(\\bx)\\T\\bphi(\\bx')$ explicite = <b>${M.fmt(expl, 4)}</b> ✓<br>RBF $\\kappa(\\bx,\\bx')$ = <b>${M.fmt(kr(st.x, st.xp), 4)}</b> (1 = identiques, → 0 = loin)`);
      P.request(); Sp.request();
    }
    upd();
  });
})(window.ML);
