/* Chapitre 3 — SVM · §1–2 : marge, géométrie de l'hyperplan */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const colY = y => y > 0 ? C.blue : C.red;
  // ligne affine f(x) = w·x + b tracée dans [−R, R]²
  ML.drawHyper = (p, w, b, level, R, style) => {
    const n2 = M.dot(w, w); if (n2 < 1e-12) return;
    const x0 = [w[0] * (level - b) / n2, w[1] * (level - b) / n2], seg = ML.clipLine(x0, [-w[1], w[0]], R);
    if (seg) p.polyline(seg, style);
  };
  ML.linearSVM = (pts, C_ = 1e5) => {
    const X = pts.map(q => [q[0], q[1]]), y = pts.map(q => q[2]), r = M.svm(X, y, M.kernels.linear(), C_);
    return { w: M.svmW(X, y, r.alpha), b: r.b, alpha: r.alpha, dual: r.dual, res: r };
  };

  // ------------------------------------------------------------------ svm-margin
  ML.scene('svm-margin', host => {
    const W = ML.widget(host, {
      title: 'Choisir l\'hyperplan qui laisse la rue la plus large', tag: '2D',
      views: [{ name: 'p', cls: 'tall', hint: 'glisser les poignées jaunes et les points' }], controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>ton hyperplan</span><span class="key"><i style="background:#f4d345;opacity:.3"></i>rue de demi-largeur $\\rho_f=\\min_i\\rho_f(\\bx_i)$</span><span class="key"><i style="background:#fff"></i>point le plus proche</span><span class="key"><i style="background:#5cd0b3"></i>SVM (marge max)</span>',
    });
    const R = M.rng(3), pts = [];
    for (let i = 0; i < 9; i++) pts.push([R.normal(-1.3, 0.55), R.normal(1.0, 0.55), -1]);
    for (let i = 0; i < 9; i++) pts.push([R.normal(1.3, 0.55), R.normal(-0.9, 0.55), 1]);
    const st = { h: [[-2.2, -1.8], [2.2, 1.2]] };
    const sh = W.show;
    W.toggle('street', 'rue (demi-largeur $\\rho_f$)'); W.toggle('dist', 'distances de tous les points'); W.toggle('svm', 'SVM et ses marges $f=\\pm1$', false); W.toggle('handles', 'poignées');
    const lineWB = () => { const d = M.sub(st.h[1], st.h[0]); let w = [d[1], -d[0]]; const n = M.norm(w); w = M.scale(w, 1 / n); let b = -M.dot(w, st.h[0]); const s = M.sum(pts.map(q => q[2] * (M.dot(w, q) + b))); if (s < 0) { w = M.scale(w, -1); b = -b; } return { w, b }; };
    const P = new ML.Plot2D(W.views.p, { xlim: [-3.2, 3.2], ylim: [-2.6, 2.6], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    pts.forEach((_, i) => P.addDraggable({ get: () => pts[i], set: (x, y) => { pts[i] = [x, y, pts[i][2]]; upd(); }, r: 10 }));
    [0, 1].forEach(k => P.addDraggable({ get: () => st.h[k], set: (x, y) => { st.h[k] = [x, y]; upd(); }, r: 13 }));
    let svm = null;
    P.onDraw = p => {
      const { w, b } = lineWB(), d = pts.map(q => (M.dot(w, q) + b) * q[2]), ok = d.every(v => v > 0), rho = Math.min(...d.map(Math.abs)), imin = d.map(Math.abs).indexOf(rho);
      if (ok && sh.street) {
        const n = [w[0], w[1]], t = ML.clipLine([-w[0] * b, -w[1] * b], [-w[1], w[0]], 6);
        if (t) p.poly([M.add(t[0], M.scale(n, rho)), M.add(t[1], M.scale(n, rho)), M.sub(t[1], M.scale(n, rho)), M.sub(t[0], M.scale(n, rho))], { color: C.yellow, width: 1, fill: C.yellow, fillAlpha: 0.12, alpha: 0.5 });
      }
      if (sh.svm && svm) { ML.drawHyper(p, svm.w, svm.b, 0, 4.2, { color: C.teal, width: 2.5 }); [-1, 1].forEach(l => ML.drawHyper(p, svm.w, svm.b, l, 4.2, { color: C.teal, width: 1.2, dash: [6, 5] })); }
      ML.drawHyper(p, w, b, 0, 4.2, { color: C.yellow, width: 3 });
      pts.forEach((q, i) => {
        const f = M.dot(w, q) + b;
        if (sh.dist || i === imin) p.seg(q[0], q[1], q[0] - f * w[0], q[1] - f * w[1], { color: i === imin ? '#fff' : '#888', width: i === imin ? 2 : 1, dash: i === imin ? [] : [3, 3], alpha: 0.8 });
        p.point(q[0], q[1], { color: colY(q[2]), r: 5.5, stroke: d[i] > 0 ? '#000' : C.yellow, strokeWidth: d[i] > 0 ? 1.5 : 3 });
      });
      if (ok) p.tex('rho', pts[imin][0], pts[imin][1], '\\rho_f', { color: '#fff', dx: 14, dy: -12, anchor: 'left' });
      if (sh.handles) st.h.forEach(h => p.point(h[0], h[1], { color: C.yellow, r: 6, glow: true }));
    };
    const c = W.controls;
    ui.buttons(c, [{ label: 'aller à la marge maximale', primary: true, onClick: () => {
      svm = ML.linearSVM(pts); const n = M.norm(svm.w), wn = M.scale(svm.w, 1 / n), x0 = M.scale(wn, -svm.b / n), t = [-wn[1], wn[0]];
      const tgt = [M.sub(x0, M.scale(t, 2.5)), M.add(x0, M.scale(t, 2.5))], from = st.h.map(h => h.slice());
      const sw = M.dot(M.sub(from[1], from[0]), t) < 0; if (sw) tgt.reverse();
      ML.tween(900, u => { st.h = from.map((h, k) => [h[0] + (tgt[k][0] - h[0]) * u, h[1] + (tgt[k][1] - h[1]) * u]); upd(); });
    } }]);
    ui.note(c, 'Bouton <b>◉ Affichage</b> (en haut à droite de la figure) : afficher la SVM, masquer la rue, les distances…');
    const ro = ui.readout(c);
    function upd() {
      svm = ML.linearSVM(pts);
      const { w, b } = lineWB(), d = pts.map(q => (M.dot(w, q) + b) * q[2]), ok = d.every(v => v > 0);
      ro.set(`${ok ? `ton hyperplan sépare les données<br>$\\rho_f$ = <b>${M.fmt(Math.min(...d), 3)}</b>` : `<span style="color:#fc6255">ne sépare pas</span> (${d.filter(v => v <= 0).length} point(s) du mauvais côté, entourés en jaune)`}<br>marge maximale (SVM) $1/\\|\\bw^*\\|$ = <b>${M.fmt(1 / M.norm(svm.w), 3)}</b>`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ svm-distance
  ML.scene('svm-distance', host => {
    const W = ML.widget(host, {
      title: 'La hauteur $f(\\bx)$ n\'est pas une distance ; $f(\\bx)/\\|\\bw\\|$ l\'est', tag: '2D + 3D',
      views: [{ name: 'p', label: 'plan des entrées', cls: 'tall', hint: 'glisser $\\bx$ et la pointe de $\\bw$' }, { name: 's3', label: 'le plan incliné $z = f(\\bx)=\\bw\\T\\bx+b$', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\bw$</span><span class="key"><i style="background:#fff"></i>$f=0$</span><span class="key"><i style="background:#5cd0b3"></i>$f=\\pm1$</span><span class="key"><i style="background:#d147bd"></i>$\\bx-\\bx_p=\\tau\\,\\bw/\\|\\bw\\|$</span><span class="key"><i style="background:#83c167"></i>hauteur $f(\\bx)$</span>',
    });
    const st = { w: [1, 0.5], b: -0.5, x: [1.6, 1.5] };
    const sh = W.show, rb = () => build3d();
    W.toggle('heat', 'fond coloré (signe de $f$)', true); W.toggle('margins', 'droites $f=\\pm1$', true, rb); W.toggle('wv', 'vecteur $\\bw$', true, rb);
    W.toggle('proj', 'projection $\\bx\\to\\bx_p$ ($\\tau$)', true, rb); W.toggle('plane', 'plan incliné $z=f(\\bx)$ (3D)', true, rb); W.toggle('height', 'hauteur $f(\\bx)$ (3D)', true, rb); W.toggle('names', 'noms « hyperplan » / « graphe de $f$ » (3D)', true, rb);
    const f = q => M.dot(st.w, q) + st.b;
    const foot = () => { const n2 = M.dot(st.w, st.w); return M.scale(st.w, -st.b / n2); };
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3], ylim: [-3, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.addDraggable({ get: () => st.x, set: (x, y) => { st.x = [x, y]; upd(); }, r: 13 });
    P.addDraggable({ get: () => M.add(foot(), st.w), set: (x, y) => { const f0 = foot(); st.w = [x - f0[0], y - f0[1]]; if (M.norm(st.w) < 0.1) st.w = M.scale(st.w, 0.1 / (M.norm(st.w) || 1)); upd(); }, r: 13 });
    P.onDraw = p => {
      if (sh.heat) p.heatmap((a, b) => f([a, b]), v => M.divRgb(Math.tanh(v / 3)).map(c => c * 0.4), { res: 4 });
      if (sh.margins) [-1, 1].forEach(l => ML.drawHyper(p, st.w, st.b, l, 3.2, { color: C.teal, width: 1.3, dash: [6, 5] }));
      ML.drawHyper(p, st.w, st.b, 0, 3.2, { color: '#fff', width: 2.5 });
      const f0 = foot();
      if (sh.wv) { p.arrow(f0[0], f0[1], f0[0] + st.w[0], f0[1] + st.w[1], { color: C.yellow, width: 3 }); p.tex('w', f0[0] + st.w[0], f0[1] + st.w[1], '\\bw', { color: C.yellow, dx: 10, dy: -10, anchor: 'left' }); }
      const n = M.norm(st.w), tau = f(st.x) / n, xp = M.sub(st.x, M.scale(st.w, tau / n));
      if (sh.proj) { p.arrow(xp[0], xp[1], st.x[0], st.x[1], { color: C.pink, width: 2.5 }); p.point(xp[0], xp[1], { color: C.pink, r: 4 }); p.tex('xp', xp[0], xp[1], '\\bx_p', { color: C.pink, dx: -10, dy: 12, anchor: 'right' }); }
      p.point(st.x[0], st.x[1], { color: '#fff', r: 6, glow: true, stroke: '#000' });
      p.tex('x', st.x[0], st.x[1], '\\bx', { dx: 12, dy: -10, anchor: 'left' });
      p.tex('hyp', 2.9, 2.75, '\\text{hyperplan } f(\\bx)=0\\text{ : une droite de } \\R^2', { color: '#fff', anchor: 'right', size: 12 });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3, 3], y: [-3, 3], z: [-5, 5] }, size: [2.3, 2.3, 1.8], labels: { x: 'x_1', y: 'x_2', z: 'f' }, theta: -2.4, phi: 1.12, radius: 6.2, target: [0, 0, 0.9] });
    function build3d() {
      S.clear('d');
      if (sh.plane) S.surface('d', (a, b) => f([a, b]), { res: 24, color: (z) => M.rgbToHex(M.divRgb(Math.tanh(z / 3))), opacity: 0.55, zclip: [-5, 5], hideClipped: true, wireOpacity: 0.2 });
      const n2 = M.dot(st.w, st.w);
      [[0, '#ffffff'], [1, C.teal], [-1, C.teal]].forEach(([l, col]) => {
        if (l && !sh.margins) return;
        const x0 = M.scale(st.w, (l - st.b) / n2), seg = ML.clipLine(x0, [-st.w[1], st.w[0]], 3);
        if (seg) { S.curve('d', seg.map(q => [q[0], q[1], 0]), { color: col, radius: l ? 0.006 : 0.014 }); if (sh.plane) S.curve('d', seg.map(q => [q[0], q[1], l]), { color: col, radius: 0.006, opacity: 0.6 }); }
        if (seg && !l) { if (sh.names) S.label('hyp', [seg[1][0], seg[1][1], 0], '\\text{hyperplan } f=0\\ (\\text{droite au sol})', { color: '#fff', dy: 14, size: 12 }); else S.hideLabel('hyp'); }
      });
      if (sh.names && sh.plane) S.label('gr', [-2.6, 2.6, M.clamp(f([-2.6, 2.6]), -5, 5)], '\\text{graphe de } f : z=f(\\bx)', { color: '#ccc', size: 12 }); else S.hideLabel('gr');
      const z = f(st.x), xp = M.sub(st.x, M.scale(st.w, z / n2));
      S.points('d', [[st.x[0], st.x[1], 0]].concat(sh.height ? [[st.x[0], st.x[1], M.clamp(z, -5, 5)]] : []), { color: ['#ffffff', C.green], radius: 0.04 });
      if (sh.height) { S.curve('d', [[st.x[0], st.x[1], 0], [st.x[0], st.x[1], M.clamp(z, -5, 5)]], { color: C.green, radius: 0.012 }); S.label('h', [st.x[0], st.x[1], M.clamp(z, -5, 5) / 2], 'f(\\bx)', { color: C.green, dx: 20 }); } else S.hideLabel('h');
      if (sh.proj) S.curve('d', [[xp[0], xp[1], 0], [st.x[0], st.x[1], 0]], { color: C.pink, radius: 0.012 });
      const f0 = foot(); if (sh.wv) S.arrow('d', [f0[0], f0[1], 0], [f0[0] + st.w[0], f0[1] + st.w[1], 0], { color: C.yellow });
    }
    const c = W.controls;
    const bS = ui.slider(c, { label: 'biais $b$', min: -3, max: 3, step: 0.01, value: st.b, onInput: v => { st.b = v; upd(); } });
    ui.buttons(c, [
      { label: '$(\\bw,b)\\times2$', onClick: () => scale(2) }, { label: '$(\\bw,b)\\div2$', onClick: () => scale(0.5) },
    ]);
    function scale(k) { const a = [...st.w, st.b]; ML.tween(700, u => { const s = 1 + (k - 1) * u; st.w = [a[0] * s, a[1] * s]; st.b = a[2] * s; bS.set(st.b); upd(); }); }
    const ro = ui.readout(c);
    ui.note(c, 'Multiplier $(\\bw,b)$ par 2 : le plan incliné devient deux fois plus pentu, la hauteur verte $f(\\bx)$ double, les droites $f=\\pm1$ se rapprochent de la frontière… mais $\\tau = f(\\bx)/\\|\\bw\\|$ (rose) ne change pas.');
    function upd() {
      const n = M.norm(st.w), z = f(st.x);
      ro.set(`$f(\\bx)$ = <b>${M.fmt(z, 3)}</b> (hauteur)<br>$\\|\\bw\\|$ = <b>${M.fmt(n, 3)}</b> (pente du plan)<br>$\\tau = f(\\bx)/\\|\\bw\\|$ = <b>${M.fmt(z / n, 3)}</b> (distance signée)<br>écart entre $f=0$ et $f=1$ : $1/\\|\\bw\\|$ = <b>${M.fmt(1 / n, 3)}</b>`);
      P.request(); build3d();
    }
    upd();
  });
  // ------------------------------------------------------------------ svm-scale
  // Invariance d'échelle : (λw, λb) décrit le même hyperplan ; les marges fonctionnelles
  // sont multipliées par λ, la marge géométrique ne change pas ; λ* = 1 / min_j y_j f(x_j).
  ML.scene('svm-scale', host => {
    const W = ML.widget(host, {
      title: 'Invariance d\'échelle : $(\\lambda\\bw,\\lambda b)$, même hyperplan — et le $\\lambda^*$ qui met le min à 1', tag: '2D + 3D',
      views: [{ name: 'p', label: 'plan des entrées : droites $\\lambda f(\\bx)=\\pm1$', cls: 'tall', hint: 'glisser les poignées et les points' },
              { name: 's3', label: 'plan incliné $z=\\lambda f(\\bx)$ et niveaux $z=\\pm1$', cls: 'tall', hint: 'glisser : tourner' },
              { name: 'g', label: 'marges en fonction de $\\lambda$', cls: 'tall', hint: 'glisser $\\lambda$' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#fff"></i>hyperplan $f=0$ (ne bouge jamais)</span><span class="key"><i style="background:#f4d345"></i>$\\lambda f = \\pm1$</span><span class="key"><i class="dot" style="background:transparent;border:2px solid #fff"></i>point le plus proche $j^*$</span><span class="key"><i style="background:#d147bd"></i>$\\min_j y_j\\,\\lambda f(\\bx_j) = \\lambda m$</span><span class="key"><i style="background:#5cd0b3"></i>marge géométrique $\\rho$ (constante) : distance au sol</span><span class="key"><i style="background:#f4d345"></i>hypoténuse sur le plan (pente $\\|\\lambda\\bw\\|$)</span>',
    });
    const R = M.rng(3), pts = [];
    for (let i = 0; i < 9; i++) pts.push([R.normal(-1.3, 0.55), R.normal(1.0, 0.55), -1]);
    for (let i = 0; i < 9; i++) pts.push([R.normal(1.3, 0.55), R.normal(-0.9, 0.55), 1]);
    const st = { h: [[-1.8, -2.0], [1.9, 1.5]], c: 2, lam: 1 };
    const sh = W.show, rb = () => build3d();
    W.toggle('lines', 'droites $\\lambda f=\\pm1$', true); W.toggle('plane', 'plan incliné $z=\\lambda f(\\bx)$', true, rb); W.toggle('levels', 'plans $z=\\pm1$', true, rb);
    W.toggle('sticks', 'hauteurs de tous les points', true, rb); W.toggle('tri', 'triangle de pente ($\\rho$, $\\lambda m$, pente)', true, rb); W.toggle('names', 'noms « hyperplan » / « graphe »', true, rb); W.toggle('curves', 'courbes $\\lambda m$ et $\\rho$ (3e panneau)', true);
    { // départ : l'hyperplan de marge max, légèrement tourné (séparateur quelconque, mais bien dégagé)
      const s0 = ML.linearSVM(pts), n = M.norm(s0.w), x0 = M.scale(s0.w, -s0.b / (n * n));
      const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
      for (const a of [0.12, 0.06, 0]) {
        const t = rot([-s0.w[1] / n, s0.w[0] / n], a), h = [M.sub(x0, M.scale(t, 2)), M.add(x0, M.scale(t, 2))];
        const d = M.sub(h[1], h[0]), nn = [d[1], -d[0]], b0 = -M.dot(nn, h[0]), sg = pts.map(q => q[2] * (M.dot(nn, q) + b0));
        if (sg.every(v => v > 0) || sg.every(v => v < 0)) { st.h = h; break; }
      }
    }
    // (w, b) de base : normale de norme c, orientée pour que la majorité ait y f > 0
    const base = () => {
      const d = M.sub(st.h[1], st.h[0]); let n = [d[1], -d[0]]; n = M.scale(n, 1 / M.norm(n));
      let w = M.scale(n, st.c), b = -M.dot(w, st.h[0]);
      if (M.sum(pts.map(q => q[2] * (M.dot(w, q) + b))) < 0) { w = M.scale(w, -1); b = -b; }
      return { w, b };
    };
    const info = () => {
      const { w, b } = base(), fm = pts.map(q => q[2] * (M.dot(w, q) + b)), m = Math.min(...fm), j = fm.indexOf(m);
      return { w, b, fm, m, j, rho: m / M.norm(w), lamStar: m > 0 ? 1 / m : NaN };
    };
    const P = new ML.Plot2D(W.views.p, { xlim: [-3.2, 3.2], ylim: [-2.8, 2.8], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    pts.forEach((_, i) => P.addDraggable({ get: () => pts[i], set: (x, y) => { pts[i] = [x, y, pts[i][2]]; upd(); }, r: 10 }));
    [0, 1].forEach(k => P.addDraggable({ get: () => st.h[k], set: (x, y) => { st.h[k] = [x, y]; upd(); }, r: 13 }));
    P.onDraw = p => {
      const I = info(), lw = M.scale(I.w, st.lam), lb = st.lam * I.b;
      if (sh.lines) [-1, 1].forEach(l => ML.drawHyper(p, lw, lb, l, 3.6, { color: C.yellow, width: 2, dash: [7, 5] }));
      ML.drawHyper(p, I.w, I.b, 0, 3.6, { color: '#fff', width: 3 });
      pts.forEach((q, i) => {
        const v = st.lam * I.fm[i];
        p.point(q[0], q[1], { color: colY(q[2]), r: 5, stroke: I.fm[i] > 0 ? '#000' : C.yellow, strokeWidth: I.fm[i] > 0 ? 1.5 : 3 });
        if (i === I.j) { const n2 = M.dot(I.w, I.w), fq = M.dot(I.w, q) + I.b; if (sh.tri) p.seg(q[0], q[1], q[0] - fq * I.w[0] / n2, q[1] - fq * I.w[1] / n2, { color: C.teal, width: 3 }); p.circle(q[0], q[1], 0.22, { color: '#fff', width: 2 }); p.tex('fj', q[0], q[1], `y_{j^*}\\lambda f = ${M.fmt(v, 3)}`, { color: Math.abs(v - 1) < 5e-3 ? C.green : '#fff', dx: 16, dy: -16, anchor: 'left', size: 13 }); }
      });
      st.h.forEach(h => p.point(h[0], h[1], { color: '#fff', r: 6, glow: true }));
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3, 3], y: [-3, 3], z: [-4, 4] }, size: [2.3, 2.3, 1.8], labels: { x: 'x_1', y: 'x_2', z: '\\lambda f' }, theta: -2.5, phi: 1.12, radius: 6.2, target: [0, 0, 0.9] });
    function build3d() {
      const I = info(), lf = (a, c) => st.lam * (I.w[0] * a + I.w[1] * c + I.b);
      S.clear('d');
      if (sh.plane) S.surface('d', lf, { res: 24, color: z => M.rgbToHex(M.divRgb(Math.tanh(z / 2))), opacity: 0.5, zclip: [-4, 4], hideClipped: true, wireOpacity: 0.18 });
      if (sh.levels) { S.surface('d', () => 1, { res: 2, color: C.yellow, opacity: 0.12, wire: false }); S.surface('d', () => -1, { res: 2, color: C.yellow, opacity: 0.12, wire: false }); }
      const seg = ML.clipLine(M.scale(I.w, -I.b / M.dot(I.w, I.w)), [-I.w[1], I.w[0]], 3);
      if (seg) S.curve('d', seg.map(q => [q[0], q[1], 0]), { color: '#ffffff', radius: 0.014 });
      if (seg && sh.names) S.label('hyp', [seg[1][0], seg[1][1], 0], '\\text{hyperplan } f=0\\ (\\text{droite au sol, fixe})', { color: '#fff', dy: 14, size: 12 }); else S.hideLabel('hyp');
      if (sh.names && sh.plane) S.label('gr', [-2.6, 2.6, M.clamp(lf(-2.6, 2.6), -4, 4)], '\\text{graphe de } \\lambda f', { color: '#ccc', size: 12 }); else S.hideLabel('gr');
      const pz = q => sh.sticks ? M.clamp(lf(q[0], q[1]), -4, 4) : 0;
      S.points('d', pts.map(q => [q[0], q[1], pz(q)]), { color: pts.map(q => colY(q[2])), radius: 0.035 });
      if (sh.sticks) S.segments('d', pts.map(q => [[q[0], q[1], 0], [q[0], q[1], M.clamp(lf(q[0], q[1]), -4, 4)]]), { color: '#888', opacity: 0.5 });
      if (!sh.tri) { ['rho', 'lj', 'sl'].forEach(k => S.hideLabel(k)); return; }
      // triangle de pente : base au sol = marge géométrique ρ (constante), hauteur = λ f(x_j*) (∝ λ), pente = ‖λw‖
      const q = pts[I.j], h = M.clamp(lf(q[0], q[1]), -4, 4), n2 = M.dot(I.w, I.w), fq = I.w[0] * q[0] + I.w[1] * q[1] + I.b;
      const xp = [q[0] - fq * I.w[0] / n2, q[1] - fq * I.w[1] / n2]; // projection orthogonale de x_j* sur f = 0
      S.curve('d', [[xp[0], xp[1], 0.01], [q[0], q[1], 0.01]], { color: C.teal, radius: 0.02 });
      S.curve('d', [[q[0], q[1], 0], [q[0], q[1], h]], { color: C.pink, radius: 0.014 });
      S.curve('d', [[xp[0], xp[1], 0], [q[0], q[1], h]], { color: C.yellow, radius: 0.01 });
      S.label('rho', [(xp[0] + q[0]) / 2, (xp[1] + q[1]) / 2, 0], `\\rho = ${M.fmt(I.rho, 3)}`, { color: C.teal, dy: 16, size: 14 });
      S.label('lj', [q[0], q[1], h], `\\lambda f(\\bx_{j^*}) = ${M.fmt(lf(q[0], q[1]), 2)}`, { color: C.pink, dy: -14, size: 13 });
      S.label('sl', [(xp[0] + q[0]) / 2, (xp[1] + q[1]) / 2, h / 2], `\\text{pente } \\|\\lambda\\bw\\| = ${M.fmt(st.lam * Math.sqrt(n2), 2)}`, { color: C.yellow, dx: -18, anchor: 'right', size: 12 });
    }
    const G = new ML.Plot2D(W.views.g, { xlim: [-2.1, 2.1], ylim: [-0.1, 2.6], xlabel: '\\log_{10}\\lambda', axisX: -2.1 });
    G.addDraggable({ get: () => [Math.log10(st.lam), 0.05], set: x => { st.lam = 10 ** M.clamp(x, -2, 2); lS.set(st.lam); upd(); }, r: 16, cursor: 'ew-resize' });
    G.onDraw = p => {
      const I = info();
      p.hline(1, { color: '#fff', width: 1.2, dash: [5, 4] });
      if (I.m > 0 && sh.curves) {
        p.fn(t => 10 ** t * I.m, { color: C.pink, width: 3 });
        p.fn(() => I.rho, { color: C.teal, width: 2.5 });
        const ls = Math.log10(I.lamStar);
        p.vline(ls, { color: C.green, width: 1.2, dash: [3, 4] });
        p.point(ls, 1, { color: C.green, r: 6, shape: 'diamond' });
        p.tex('ls', ls, 1, '\\lambda^* = 1/m', { color: C.green, dx: 10, dy: -14, anchor: 'left', size: 13 });
        p.point(Math.log10(st.lam), st.lam * I.m, { color: C.pink, r: 6, stroke: '#000' });
        p.tex('rho', 2.05, I.rho, '\\rho = m/\\|\\bw\\|', { color: C.teal, dy: -12, anchor: 'right', size: 13 });
      }
      p.vline(Math.log10(st.lam), { color: '#fff', width: 1, alpha: 0.4 });
      p.point(Math.log10(st.lam), 0.05, { color: '#fff', r: 6, glow: true });
    };
    const c = W.controls;
    const lS = ui.slider(c, { label: 'facteur d\'échelle $\\lambda$', min: -2, max: 2, step: 0.005, value: st.lam, log: true, digits: 3, onInput: v => { st.lam = v; upd(); } });
    ui.slider(c, { label: 'norme de départ $\\|\\bw\\|$ (avant mise à l\'échelle)', min: 0.3, max: 4, step: 0.01, value: st.c, onInput: v => { st.c = v; upd(); } });
    const bx = ML.h('div', { class: 'ctl' }); c.appendChild(bx);
    ui.buttons(bx, [
      { label: '$\\lambda\\leftarrow\\lambda^* = 1/m$', primary: true, onClick: () => { const I = info(); if (!(I.m > 0)) return; const a = Math.log10(st.lam), b = Math.log10(I.lamStar); ML.tween(900, u => { st.lam = 10 ** (a + (b - a) * u); lS.set(st.lam); upd(); }); } },
      { label: '$\\lambda = 1$', onClick: () => { st.lam = 1; lS.set(1); upd(); } },
    ]);
    const ro = ui.readout(c);
    function upd() {
      const I = info(), lw = st.lam * M.norm(I.w);
      if (!(I.m > 0)) { ro.set('<span style="color:#fc6255">cet hyperplan ne sépare pas les données (un point a $y_jf(\\bx_j)\\le0$, entouré en jaune) : aucun $\\lambda>0$ ne peut rendre le min égal à 1.</span>'); }
      else ro.set(`$m = \\min_j y_j(\\bw\\T\\bx_j+b)$ = <b>${M.fmt(I.m, 4)}</b> (à $\\lambda=1$) · $\\lambda^* = 1/m$ = <b>${M.fmt(I.lamStar, 4)}</b><br>` +
        `$\\lambda$ = <b>${M.fmt(st.lam, 4)}</b> → $\\min_j y_j(\\lambda\\bw\\T\\bx_j+\\lambda b) = \\lambda m$ = <b style="color:${Math.abs(st.lam * I.m - 1) < 5e-3 ? '#83c167' : ''}">${M.fmt(st.lam * I.m, 4)}</b><br>` +
        `$\\|\\lambda\\bw\\|$ = <b>${M.fmt(lw, 4)}</b> · $1/\\|\\lambda\\bw\\|$ = <b>${M.fmt(1 / lw, 4)}</b> · marge géométrique $\\rho = \\frac{\\lambda m}{\\|\\lambda\\bw\\|}$ = <b>${M.fmt(I.rho, 4)}</b> (indépendante de $\\lambda$)<br>` +
        `<span class="k">À $\\lambda = \\lambda^*$ les droites jaunes $\\lambda f=\\pm1$ passent exactement par le point le plus proche, et $1/\\|\\lambda^*\\bw\\| = \\rho$ : c'est la forme canonique.</span>`);
      P.request(); G.request(); build3d();
    }
    upd();
  });
})(window.ML);
