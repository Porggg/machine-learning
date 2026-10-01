/* Chapitre 1 — Régression linéaire · §9 Optimisation : GD, gradient, momentum, SGD */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // ------------------------------------------------------------------ lr-poly1d
  ML.scene('lr-poly1d', host => {
    const W = ML.widget(host, {
      title: 'GD sur $\\hat L(\\theta)=\\theta^4+7\\theta^3+5\\theta^2-17\\theta+3$ (slides p.32–36)', tag: '2D',
      views: [{ name: 'p', cls: 'tall', hint: 'glisser le point de départ (blanc)' }], controls: true,
      foot: '<span class="key"><i class="dot" style="background:#83c167"></i>minimum local ($\\hat L\'\'>0$)</span><span class="key"><i class="dot" style="background:#fc6255"></i>maximum local ($\\hat L\'\'<0$)</span><span class="key"><i style="background:#f4d345"></i>itérés $\\theta_t$</span><span class="key"><i style="background:#58c4dd"></i>tangente en $\\theta_t$</span><span class="key"><i style="background:#9a72ac"></i>approximation quadratique de Taylor</span>',
    });
    const L = t => t ** 4 + 7 * t ** 3 + 5 * t ** 2 - 17 * t + 3, dL = t => 4 * t ** 3 + 21 * t ** 2 + 10 * t - 17, d2L = t => 12 * t * t + 42 * t + 10;
    // points stationnaires (changements de signe + bissection)
    const stat = []; { const g = M.linspace(-7, 3, 2001); for (let i = 0; i < g.length - 1; i++) if (dL(g[i]) * dL(g[i + 1]) <= 0) { let a = g[i], b = g[i + 1]; for (let k = 0; k < 60; k++) { const m = (a + b) / 2; dL(a) * dL(m) <= 0 ? b = m : a = m; } stat.push((a + b) / 2); } }
    const st = { t0: 0, gamma: 0.01, noise: 0, taylor: true, path: [0], seed: 1 };
    let R = M.rng(st.seed);
    const P = new ML.Plot2D(W.views.p, { xlim: [-6.3, 2.3], ylim: [-65, 62], xlabel: '\\theta', ylabel: '\\hat L(\\theta)' });
    P.addDraggable({ get: () => [st.t0, L(st.t0)], set: x => { st.t0 = M.clamp(x, -6.2, 2.2); reset(); }, r: 14, cursor: 'ew-resize' });
    P.onDraw = p => {
      p.fn(L, { color: '#e8e6e3', width: 2.5 });
      const t = st.path[st.path.length - 1];
      if (st.taylor && isFinite(t) && Math.abs(t) < 8) p.fn(u => L(t) + dL(t) * (u - t) + 0.5 * d2L(t) * (u - t) ** 2, { color: C.purple, width: 1.8, dash: [6, 4] }, [t - 2.5, t + 2.5]);
      if (isFinite(t) && Math.abs(t) < 8) p.fn(u => L(t) + dL(t) * (u - t), { color: C.blue, width: 1.5, alpha: 0.8 }, [t - 1.2, t + 1.2]);
      stat.forEach(s => { const mn = d2L(s) > 0; p.point(s, L(s), { color: mn ? C.green : C.red, r: 6 }); p.vline(s, { color: mn ? C.green : C.red, width: 1, alpha: 0.2, dash: [3, 5] }); });
      const pts = st.path.filter(v => isFinite(v) && Math.abs(v) < 8);
      for (let i = 0; i < pts.length - 1; i++) p.arrow(pts[i], L(pts[i]), pts[i + 1], L(pts[i + 1]), { color: C.yellow, width: 1.5, head: 8, alpha: 0.75 });
      pts.forEach((v, i) => p.point(v, L(v), { color: C.yellow, r: i === pts.length - 1 ? 6 : 3 }));
      p.point(st.t0, L(st.t0), { color: '#fff', r: 7, glow: true, stroke: '#000' });
    };
    const c = W.controls;
    ui.slider(c, { label: 'pas $\\gamma$', min: -3, max: -0.7, step: 0.01, value: st.gamma, log: true, digits: 4, fmt: v => v.toFixed(4), onInput: v => { st.gamma = v; reset(); } });
    ui.slider(c, { label: 'bruit sur le gradient (SGD simulé)', min: 0, max: 40, step: 0.5, value: 0, onInput: v => { st.noise = v; reset(); } });
    ui.check(c, { label: 'approximation de Taylor d\'ordre 2', value: true, onChange: v => { st.taylor = v; P.request(); } });
    const pl = ui.player(c, { speed: 6, step: () => step(), reset: () => reset() });
    ui.buttons(c, [{ label: 'départ $\\theta_0=0$ (piège)', onClick: () => { st.t0 = 0; reset(); } }, { label: 'départ $\\theta_0=-6$', onClick: () => { st.t0 = -6; reset(); } }]);
    const ro = ui.readout(c);
    function step() {
      const t = st.path[st.path.length - 1];
      if (!isFinite(t) || Math.abs(t) > 1e3 || st.path.length > 400) return false;
      st.path.push(t - st.gamma * (dL(t) + st.noise * R.n())); upd();
    }
    function reset() { st.path = [st.t0]; R = M.rng(++st.seed); upd(); }
    function upd() {
      const t = st.path[st.path.length - 1], div = !isFinite(t) || Math.abs(t) > 8;
      ro.set(`$t$ = <b>${st.path.length - 1}</b> · $\\theta_t$ = <b>${div ? 'diverge !' : M.fmt(t, 4)}</b><br>${div ? '' : `$\\hat L(\\theta_t)$ = <b>${M.fmt(L(t), 3)}</b> · $\\hat L'$ = <b>${M.fmt(dL(t), 3)}</b> · $\\hat L''$ = <b>${M.fmt(d2L(t), 2)}</b>`}<br><span class="k">stationnaires : ${stat.map(s => `${M.fmt(s, 3)} (${d2L(s) > 0 ? 'min' : 'max'})`).join(', ')}</span>`);
      P.request();
    }
    void pl; reset();
  });

  // ------------------------------------------------------------------ lr-gradfield
  ML.scene('lr-gradfield', host => {
    const W = ML.widget(host, {
      title: 'Gradient ⟂ lignes de niveau · direction de plus forte pente · dérivées directionnelles', tag: '2D + 3D',
      views: [{ name: 'p', cls: 'tall', label: 'carte de niveau', hint: 'survoler · clic : épingler' }, { name: 's3', cls: 'tall', label: 'surface et plan tangent', hint: 'glisser : tourner' }], controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\nabla f$</span><span class="key"><i style="background:#fc6255"></i>$-\\nabla f$ (descente)</span><span class="key"><i style="background:#fff"></i>tangente à la ligne de niveau</span><span class="key"><i style="background:#83c167"></i>rose $D_\\bu f=\\nabla f\\cdot\\bu>0$</span><span class="key"><i style="background:#d147bd"></i>$D_\\bu f<0$</span>',
    });
    const FNS = {
      bowl: { name: 'bol elliptique', f: (x, y) => 0.25 * x * x + 0.8 * y * y + 0.3 * x * y, r: [-3, 3] },
      bumps: { name: 'deux creux + une bosse', f: (x, y) => 0.12 * (x * x + y * y) - 1.6 * Math.exp(-((x - 1.3) ** 2 + (y - 0.6) ** 2) / 0.9) - 1.2 * Math.exp(-((x + 1.4) ** 2 + (y + 0.9) ** 2) / 0.7) + 0.9 * Math.exp(-((x + 0.2) ** 2 + (y - 1.6) ** 2) / 0.5), r: [-3, 3] },
      banana: { name: 'banane (Rosenbrock adouci)', f: (x, y) => 0.05 * (1 - x) ** 2 + 0.25 * (y - 0.4 * x * x) ** 2, r: [-3, 3] },
      saddle: { name: 'selle', f: (x, y) => 0.25 * (x * x - y * y), r: [-3, 3] },
    };
    const st = { fn: 'bumps', pt: [0.6, -0.8], pinned: false, field: true };
    const f = (x, y) => FNS[st.fn].f(x, y);
    const grad = (x, y) => { const h = 1e-4; return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)]; };
    let zr = [0, 1];
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3], ylim: [-3, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.onMove = (x, y) => { if (x == null || st.pinned) return; st.pt = [x, y]; upd(); };
    P.onClick = (x, y) => { st.pinned = !st.pinned; st.pt = [x, y]; upd(); };
    P.onDraw = p => {
      p.heatmap(f, v => M.rampRgb((v - zr[0]) / (zr[1] - zr[0])).map(c => c * 0.45), { res: 3, key: 'gf' + st.fn });
      p.contour(f, M.linspace(zr[0], zr[1], 22), { color: C.blue, width: 1, alpha: 0.55, key: 'gf' + st.fn });
      if (st.field) p.vectorField((x, y) => grad(x, y), { step: 38, color: C.teal, alpha: 0.35, scale: 30 });
      const [x, y] = st.pt, g = grad(x, y), n = M.norm(g), sc = 1.1 / Math.max(n, 0.15);
      // rose des dérivées directionnelles : deux cercles de diamètre ‖∇f‖·sc
      const pos = [], neg = [];
      for (let k = 0; k <= 180; k++) { const a = 2 * Math.PI * k / 180, u = [Math.cos(a), Math.sin(a)], d = M.dot(g, u) * sc; (d >= 0 ? pos : neg).push([x + Math.abs(d) * u[0], y + Math.abs(d) * u[1]]); }
      p.poly(pos.length > 2 ? pos : [[x, y]], { color: C.green, width: 1.5, fill: C.green, fillAlpha: 0.12 });
      p.poly(neg.length > 2 ? neg : [[x, y]], { color: C.pink, width: 1.5, fill: C.pink, fillAlpha: 0.12 });
      if (n > 1e-9) {
        const t = [-g[1] / n, g[0] / n];
        p.seg(x - t[0], y - t[1], x + t[0], y + t[1], { color: '#fff', width: 1.5, alpha: 0.8 });
        p.arrow(x, y, x + g[0] * sc, y + g[1] * sc, { color: C.yellow, width: 3 });
        p.arrow(x, y, x - g[0] * sc, y - g[1] * sc, { color: C.red, width: 3 });
      }
      p.point(x, y, { color: '#fff', r: 5, stroke: '#000' });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3, 3], y: [-3, 3], z: [0, 1] }, size: [2.4, 2.4, 1.2], labels: { x: 'x_1', y: 'x_2', z: 'f' }, theta: -2.0, phi: 1.0, radius: 5.8 });
    function buildSurf() {
      const g = M.linspace(-3, 3, 60); let lo = Infinity, hi = -Infinity;
      for (const x of g) for (const y of g) { const v = f(x, y); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      zr = [lo, hi]; S.setRange({ x: [-3, 3], y: [-3, 3], z: [lo, hi + 0.05 * (hi - lo)] }); S.o.gridZ = lo; S.drawAxes();
      S.clear('surf'); S.surface('surf', f, { res: 70, opacity: 0.85 });
    }
    function buildPt() {
      S.clear('pt');
      const [x, y] = st.pt, z = f(x, y), g = grad(x, y), r = 0.8;
      S.quad('pt', [x - r, y - r, z - r * g[0] - r * g[1]], [2 * r, 0, 2 * r * g[0]], [0, 2 * r, 2 * r * g[1]], { color: C.yellow, opacity: 0.25, grid: 4 });
      S.points('pt', [[x, y, z]], { color: '#fff', radius: 0.04 });
      const n = M.norm(g), sc = 0.9 / Math.max(n, 0.15);
      if (n > 1e-9) {
        S.arrow('pt', [x, y, z], [x + g[0] * sc, y + g[1] * sc, z + n * n * sc], { color: C.yellow });
        S.arrow('pt', [x, y, z], [x - g[0] * sc, y - g[1] * sc, z - n * n * sc], { color: C.red });
      }
    }
    const c = W.controls;
    ui.select(c, { label: 'fonction', options: Object.entries(FNS).map(([k, v]) => [k, v.name]), value: st.fn, onChange: v => { st.fn = v; buildSurf(); upd(); } });
    ui.check(c, { label: 'champ de gradients', value: true, onChange: v => { st.field = v; P.request(); } });
    const ro = ui.readout(c);
    ui.note(c, 'La rose verte est un cercle passant par le point : $D_\\bu f = \\|\\nabla f\\|\\cos\\varphi$ est maximal ($=\\|\\nabla f\\|$) dans la direction de $\\nabla f$, nul le long de la ligne de niveau (blanc). Le plan tangent (3D) a pour pentes les composantes de $\\nabla f$.');
    function upd() {
      const g = grad(...st.pt);
      ro.set(`${st.pinned ? '📌 épinglé · ' : ''}$\\bx$ = (<b>${M.fmt(st.pt[0], 2)}</b>, <b>${M.fmt(st.pt[1], 2)}</b>)<br>$\\nabla f$ = (<b>${M.fmt(g[0], 3)}</b>, <b>${M.fmt(g[1], 3)}</b>) · $\\|\\nabla f\\|$ = <b>${M.fmt(M.norm(g), 3)}</b>`);
      P.request(); buildPt();
    }
    buildSurf(); upd();
  });

  // ------------------------------------------------------------------ lr-quad
  ML.scene('lr-quad', host => {
    const W = ML.widget(host, {
      title: 'GD, momentum et line search sur $\\frac12\\bx\\T\\bA\\bx-\\bb\\T\\bx$', tag: '2D + 3D',
      views: [{ name: 'p', label: 'lignes de niveau + trajectoires', cls: 'tall', hint: 'glisser le départ $\\bx_0$' }, { name: 's3', label: 'surface', cls: 'tall', hint: 'glisser : tourner' }, { name: 'c', label: '$\\log_{10}(\\hat L(\\bx_t)-\\hat L^*)$ vs $t$', cls: 'tall' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#58c4dd"></i>GD</span><span class="key"><i style="background:#f4d345"></i>momentum</span><span class="key"><i style="background:#d147bd"></i>GD + line search exacte</span><span class="key"><i style="background:#83c167"></i>vecteurs propres de $\\bA$</span>',
    });
    const st = { preset: 'slide', mu1: 20, mu2: 2, ang: 0.07, gamma: 0.085, alpha: 0.6, x0: [-3, -1], on: { gd: true, mom: true, ls: false }, eig: true };
    let A, b, xs, Ls, runs;
    const Lf = x => 0.5 * M.dot(x, M.matvec(A, x)) - M.dot(b, x), grad = x => M.sub(M.matvec(A, x), b);
    function setup() {
      if (st.preset === 'slide') { A = [[2, 1], [1, 20]]; b = [5, 3]; }
      else { const c = Math.cos(st.ang), s = Math.sin(st.ang), V = [[c, -s], [s, c]]; A = M.matmul(M.matmul(V, [[st.mu2, 0], [0, st.mu1]]), M.T(V)); b = M.matvec(A, [1, 0.3]); }
      xs = M.solve(A, b); Ls = Lf(xs); reset();
    }
    function reset() { runs = { gd: [st.x0.slice()], mom: [st.x0.slice()], ls: [st.x0.slice()] }; upd(); }
    function step() {
      const nx = { gd: null, mom: null, ls: null }; let alive = false;
      const ok = v => v.every(z => isFinite(z) && Math.abs(z) < 1e4);
      { const r = runs.gd, x = r[r.length - 1]; if (ok(x) && r.length < 300) { nx.gd = M.sub(x, M.scale(grad(x), st.gamma)); alive = true; } }
      { const r = runs.mom, x = r[r.length - 1], xp = r.length > 1 ? r[r.length - 2] : x; if (ok(x) && r.length < 300) { nx.mom = M.add(M.sub(x, M.scale(grad(x), st.gamma)), M.scale(M.sub(x, xp), st.alpha)); alive = true; } }
      { const r = runs.ls, x = r[r.length - 1], g = grad(x), d = M.scale(g, -1), den = M.dot(d, M.matvec(A, d)); if (ok(x) && r.length < 300 && den > 1e-14) { const eta = -M.dot(d, grad(x)) / den; nx.ls = M.add(x, M.scale(d, eta)); alive = true; } }
      for (const k of ['gd', 'mom', 'ls']) if (nx[k]) runs[k].push(nx[k]);
      upd(); return alive;
    }
    const COL = { gd: C.blue, mom: C.yellow, ls: C.pink };
    const P = new ML.Plot2D(W.views.p, { xlim: [-4.2, 4.2], ylim: [-2.2, 2.2], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.addDraggable({ get: () => st.x0, set: (x, y) => { st.x0 = [x, y]; reset(); }, r: 14 });
    P.onDraw = p => {
      const key = 'q' + JSON.stringify(A) + b;
      const L2 = (x, y) => Lf([x, y]);
      p.heatmap(L2, v => M.rampRgb(0.8 * Math.min(1, Math.log1p(Math.max(0, v - Ls)) / Math.log1p(80))).map(c => c * 0.5), { res: 3, key });
      p.contour(L2, [0.1, 0.5, 1.5, 3, 6, 10, 16, 24, 35, 50, 70].map(v => v + Ls), { color: C.blue, width: 1, alpha: 0.45, key });
      if (st.eig) { const { values, vectors } = M.eigSym(A); [0, 1].forEach(i => { const v = [vectors[0][i], vectors[1][i]]; p.seg(xs[0] - 4 * v[0], xs[1] - 4 * v[1], xs[0] + 4 * v[0], xs[1] + 4 * v[1], { color: C.green, width: 1, alpha: 0.5, dash: [6, 5] }); p.tex('mu' + i, xs[0] + (1.4 - 0.5 * i) * v[0], xs[1] + (1.4 - 0.5 * i) * v[1], `\\mu_${i + 1}=${M.fmt(values[i], 2)}`, { color: C.green, size: 12, dx: 10, anchor: 'left' }); }); }
      for (const k of ['gd', 'mom', 'ls']) if (st.on[k]) {
        const r = runs[k].filter(v => v.every(z => Math.abs(z) < 50));
        p.polyline(r, { color: COL[k], width: 1.8, alpha: 0.9 });
        r.forEach((v, i) => p.point(v[0], v[1], { color: COL[k], r: i === r.length - 1 ? 5.5 : 2.5 }));
      }
      p.point(xs[0], xs[1], { color: '#fff', r: 5, shape: 'cross' });
      p.point(st.x0[0], st.x0[1], { color: '#fff', r: 7, glow: true, stroke: '#000' });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-4.2, 4.2], y: [-2.2, 2.2], z: [0, 40] }, size: [2.8, 1.5, 1.3], labels: { x: 'x_1', y: 'x_2', z: '\\hat L-\\hat L^*' }, theta: -1.25, phi: 0.95, radius: 5.2 });
    let built = '';
    function build3d() {
      const key = JSON.stringify(A);
      const Lr = (x, y) => Lf([x, y]) - Ls;
      if (key !== built) { built = key; S.clear('s'); S.surface('s', Lr, { res: 60, opacity: 0.8, zclip: [0, 40], hideClipped: true, logColor: true }); }
      S.clear('t');
      for (const k of ['gd', 'mom', 'ls']) if (st.on[k]) {
        const r = runs[k].filter(v => Math.abs(v[0]) < 4.2 && Math.abs(v[1]) < 2.2).map(v => [v[0], v[1], Math.min(40, Lr(...v)) + 0.3]);
        if (r.length > 1) S.curve('t', r, { color: COL[k], radius: 0.009 });
        if (r.length) S.points('t', [r[r.length - 1]], { color: COL[k], radius: 0.04 });
      }
    }
    const Cv = new ML.Plot2D(W.views.c, { xlim: [0, 60], ylim: [-8, 2.5], axisY: -8, xlabel: 't' });
    Cv.onDraw = p => {
      for (const k of ['gd', 'mom', 'ls']) if (st.on[k]) p.polyline(runs[k].map((v, i) => [i, Math.log10(Math.max(1e-12, Lf(v) - Ls))]).filter(q => isFinite(q[1])), { color: COL[k], width: 2.2 });
    };
    const c = W.controls;
    ui.select(c, { label: 'problème', options: [['slide', 'exemple des slides : A=[[2,1],[1,20]], b=[5,3]'], ['custom', 'personnalisé (valeurs propres μ₁, μ₂)']], value: 'slide', onChange: v => { st.preset = v; muA.el.style.display = muB.el.style.display = angS.el.style.display = v === 'custom' ? '' : 'none'; setup(); } });
    const muA = ui.slider(c, { label: '$\\mu_1$ (direction raide)', min: 1, max: 40, step: 0.5, value: st.mu1, onInput: v => { st.mu1 = v; setup(); } });
    const muB = ui.slider(c, { label: '$\\mu_2$ (direction plate)', min: 0.2, max: 10, step: 0.1, value: st.mu2, onInput: v => { st.mu2 = v; setup(); } });
    const angS = ui.slider(c, { label: 'rotation', min: 0, max: 1.57, step: 0.01, value: st.ang, onInput: v => { st.ang = v; setup(); } });
    [muA, muB, angS].forEach(s => { s.el.style.display = 'none'; });
    const gS = ui.slider(c, { label: 'pas $\\gamma$', min: 0.005, max: 0.13, step: 0.001, value: st.gamma, digits: 3, onInput: v => { st.gamma = v; reset(); } });
    ui.slider(c, { label: 'momentum $\\alpha$', min: 0, max: 0.98, step: 0.01, value: st.alpha, onInput: v => { st.alpha = v; reset(); } });
    const bx = ML.h('div', { class: 'ctl' }); c.appendChild(bx);
    ui.check(bx, { label: '<span class="c-blue">GD</span>', value: true, onChange: v => { st.on.gd = v; upd(); } });
    ui.check(bx, { label: '<span class="c-yellow">momentum</span>', value: true, onChange: v => { st.on.mom = v; upd(); } });
    ui.check(bx, { label: '<span class="c-pink">line search exacte</span>', value: false, onChange: v => { st.on.ls = v; upd(); } });
    ui.check(bx, { label: 'vecteurs propres', value: true, onChange: v => { st.eig = v; P.request(); } });
    const pw = ML.h('div', { class: 'ctl' }); c.appendChild(pw);
    ui.player(pw, { speed: 8, step: () => step(), reset: () => reset() });
    ui.buttons(pw, [
      { label: '$\\gamma^*=\\frac{2}{\\mu_1+\\mu_2}$', onClick: () => { const v = M.eigSym(A).values; st.gamma = 2 / (v[0] + v[1]); gS.set(st.gamma); reset(); } },
      { label: '$\\gamma = 0.99\\cdot\\frac{2}{\\mu_{\\max}}$', onClick: () => { st.gamma = 0.99 * 2 / M.eigSym(A).values[0]; gS.set(st.gamma); reset(); } },
      { label: '$\\gamma = 1.03\\cdot\\frac{2}{\\mu_{\\max}}$', onClick: () => { st.gamma = 1.03 * 2 / M.eigSym(A).values[0]; gS.set(st.gamma); reset(); } },
    ]);
    const ro = ui.readout(c);
    function upd() {
      const v = M.eigSym(A).values, r = v.map(m => Math.abs(1 - st.gamma * m));
      ro.set(`$\\mu$ = (<b>${M.fmt(v[0], 2)}</b>, <b>${M.fmt(v[1], 2)}</b>) · $\\kappa$ = <b>${M.fmt(v[0] / v[1], 2)}</b> · limite $2/\\mu_{\\max}$ = <b>${M.fmt(2 / v[0], 4)}</b><br>facteurs par pas $|1-\\gamma\\mu_i|$ : <b style="color:${r[0] >= 1 ? '#fc6255' : ''}">${M.fmt(r[0], 3)}</b>${1 - st.gamma * v[0] < 0 ? ' (signe alterné → zigzag)' : ''}, <b>${M.fmt(r[1], 3)}</b> · $t$ = <b>${runs.gd.length - 1}</b>`);
      P.request(); build3d(); Cv.request();
    }
    setup();
  });

  // ------------------------------------------------------------------ lr-sgd
  ML.scene('lr-sgd', host => {
    const W = ML.widget(host, {
      title: 'SGD vs GD sur la régression $f(x)=w_1x+w_2$ (données HW1, $M=1$)', tag: '2D',
      views: [{ name: 'w', label: 'espace des poids : $\\EMSE$ + trajectoires', cls: 'tall' }, { name: 'd', label: 'données et mini-batch courant', cls: 'tall' }, { name: 'c', label: 'MSE (données complètes) vs époques', cls: 'tall' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#58c4dd"></i>GD (1 pas / époque)</span><span class="key"><i style="background:#d147bd"></i>SGD ($N/B$ pas / époque)</span><span class="key"><i style="background:#888"></i>$-\\gamma\\nabla\\ell_i$ individuels</span><span class="key"><i style="background:#58c4dd"></i>$-\\gamma\\nabla\\hat L$ (moyenne)</span><span class="key"><i style="background:#d147bd"></i>$-\\gamma\\nabla\\hat L_{\\mathcal B}$</span><span class="key"><i class="dot" style="background:#f0ac5f"></i>nuage de gradients de mini-batch</span>',
    });
    const D = M.sinData(15, 0), N = 15, Phi = D.xs.map(x => [x, 1]), wLS = M.ridge(Phi, D.ys, 0);
    const E = (w1, w2) => M.mean(D.xs.map((x, i) => (D.ys[i] - w1 * x - w2) ** 2));
    const gi = (w, i) => { const r = w[0] * D.xs[i] + w[1] - D.ys[i]; return [2 * r * D.xs[i], 2 * r]; };
    const gB = (w, B) => M.scale(B.reduce((s, i) => M.add(s, gi(w, i)), [0, 0]), 1 / B.length);
    const st = { B: 1, gamma: 0.35, decay: false, grads: true, cloud: null };
    let R, sgd, gd, perm, pos, stepCount, batch, lossS, lossG;
    function reset() {
      R = M.rng(7); sgd = [[0, 0]]; gd = [[0, 0]]; perm = R.shuffle(M.range(N)); pos = 0; stepCount = 0; batch = []; st.cloud = null;
      lossS = [[0, E(0, 0)]]; lossG = [[0, E(0, 0)]]; upd();
    }
    function step() {
      if (stepCount > 4000) return false;
      if (pos >= N) { perm = R.shuffle(M.range(N)); pos = 0; }
      batch = perm.slice(pos, pos + st.B); pos += st.B;
      const w = sgd[sgd.length - 1], t = stepCount + 1, g = st.decay ? st.gamma / Math.sqrt(t) : st.gamma;
      sgd.push(M.sub(w, M.scale(gB(w, batch), g))); stepCount++;
      const ep = stepCount * st.B / N;
      lossS.push([ep, E(...sgd[sgd.length - 1])]);
      if (Math.floor(ep + 1e-9) > gd.length - 1) { const wg = gd[gd.length - 1]; gd.push(M.sub(wg, M.scale(gB(wg, M.range(N)), st.gamma))); lossG.push([gd.length - 1, E(...gd[gd.length - 1])]); }
      st.cloud = null; upd();
    }
    const Pw = new ML.Plot2D(W.views.w, { xlim: [-3.6, 1.2], ylim: [-0.6, 2.2], equal: true, xlabel: 'w_1', ylabel: 'w_2' });
    Pw.onDraw = p => {
      p.heatmap(E, v => M.rampRgb(0.8 * Math.min(1, Math.log1p(v) / Math.log1p(6))).map(c => c * 0.45), { res: 3, key: 'sgd' });
      p.contour(E, [0.2, 0.25, 0.3, 0.4, 0.5, 0.7, 1, 1.4, 2, 3, 4.5], { color: C.blue, width: 1, alpha: 0.45, key: 'sgd' });
      p.polyline(gd, { color: C.blue, width: 2 }); gd.forEach(w => p.point(w[0], w[1], { color: C.blue, r: 3 }));
      p.polyline(sgd.slice(-400), { color: C.pink, width: 1.3, alpha: 0.85 });
      const w = sgd[sgd.length - 1];
      if (st.cloud) st.cloud.forEach(q => p.point(w[0] - st.gamma * q[0], w[1] - st.gamma * q[1], { color: C.gold, r: 2, alpha: 0.6 }));
      if (st.grads) {
        for (let i = 0; i < N; i++) { const g = gi(w, i); p.arrow(w[0], w[1], w[0] - st.gamma * g[0], w[1] - st.gamma * g[1], { color: batch.includes(i) ? '#ddd' : '#777', width: batch.includes(i) ? 1.4 : 0.8, head: 5, alpha: 0.7 }); }
        const gf = gB(w, M.range(N)); p.arrow(w[0], w[1], w[0] - st.gamma * gf[0], w[1] - st.gamma * gf[1], { color: C.blue, width: 3 });
        if (batch.length) { const gb = gB(w, batch); p.arrow(w[0], w[1], w[0] - st.gamma * gb[0], w[1] - st.gamma * gb[1], { color: C.pink, width: 3 }); }
      }
      p.point(wLS[0], wLS[1], { color: '#fff', r: 5, shape: 'cross' });
      p.point(w[0], w[1], { color: C.pink, r: 5.5, stroke: '#000' });
    };
    const Pd = new ML.Plot2D(W.views.d, { xlim: [-0.03, 1.03], ylim: [-1.6, 1.6], xlabel: 'x', ylabel: 'y' });
    Pd.onDraw = p => {
      const w = sgd[sgd.length - 1], wg = gd[gd.length - 1];
      p.fn(x => wg[0] * x + wg[1], { color: C.blue, width: 2, dash: [6, 4] });
      p.fn(x => w[0] * x + w[1], { color: C.pink, width: 3 });
      D.xs.forEach((x, i) => { const inB = batch.includes(i); if (inB) p.seg(x, D.ys[i], x, w[0] * x + w[1], { color: C.pink, width: 1.5 }); p.point(x, D.ys[i], { color: inB ? C.pink : '#ddd', r: inB ? 7 : 4, stroke: '#000' }); });
    };
    const Pc = new ML.Plot2D(W.views.c, { xlim: [0, 30], ylim: [0.15, 0.75], axisY: 0.15, xlabel: '\\text{époque}' });
    Pc.onDraw = p => {
      p.hline(E(...wLS), { color: '#fff', width: 1, dash: [4, 4], alpha: 0.5 });
      p.polyline(lossS, { color: C.pink, width: 1.5 });
      p.polyline(lossG, { color: C.blue, width: 2.5 });
    };
    const c = W.controls;
    const bS = ui.slider(c, { label: 'taille de mini-batch $B$', min: 1, max: 15, step: 1, value: st.B, fmt: v => v.toFixed(0), onInput: v => { st.B = v; reset(); } });
    ui.buttons(c, [1, 5, 15].map(b => ({ label: `$B=${b}$`, onClick: () => { st.B = b; bS.set(b); reset(); } })));
    ui.slider(c, { label: 'pas $\\gamma$', min: 0.02, max: 0.7, step: 0.01, value: st.gamma, onInput: v => { st.gamma = v; reset(); } });
    const bx = ML.h('div', { class: 'ctl' }); c.appendChild(bx);
    ui.check(bx, { label: 'pas décroissant $\\gamma_t=\\gamma/\\sqrt t$', value: false, onChange: v => { st.decay = v; reset(); } });
    ui.check(bx, { label: 'flèches de gradient', value: true, onChange: v => { st.grads = v; Pw.request(); } });
    ui.buttons(bx, [{ label: 'nuage : 1500 mini-batchs au point courant', onClick: () => {
      const w = sgd[sgd.length - 1], r = M.rng(99); st.cloud = M.range(1500).map(() => gB(w, r.shuffle(M.range(N)).slice(0, st.B))); upd(false);
    } }]);
    const pw = ML.h('div', { class: 'ctl' }); c.appendChild(pw);
    ui.player(pw, { speed: 10, step: () => step(), reset: () => reset() });
    const ro = ui.readout(c);
    function upd() {
      const w = sgd[sgd.length - 1], gf = gB(w, M.range(N));
      let extra = '';
      if (st.cloud) { const m = [M.mean(st.cloud.map(q => q[0])), M.mean(st.cloud.map(q => q[1]))], v = M.mean(st.cloud.map(q => (q[0] - m[0]) ** 2 + (q[1] - m[1]) ** 2)); extra = `<br>moyenne du nuage = (<b>${M.fmt(m[0], 3)}</b>, <b>${M.fmt(m[1], 3)}</b>) ≈ $\\nabla\\hat L$ = (<b>${M.fmt(gf[0], 3)}</b>, <b>${M.fmt(gf[1], 3)}</b>) · variance totale = <b>${M.fmt(v, 3)}</b>`; }
      ro.set(`pas SGD = <b>${stepCount}</b> · époques = <b>${M.fmt(stepCount * st.B / N, 2)}</b> · MSE(SGD) = <b>${M.fmt(E(...w), 4)}</b> · MSE(GD) = <b>${M.fmt(E(...gd[gd.length - 1]), 4)}</b> · optimum = <b>${M.fmt(E(...wLS), 4)}</b>${extra}`);
      Pw.request(); Pd.request(); Pc.request();
    }
    reset();
  });
})(window.ML);
