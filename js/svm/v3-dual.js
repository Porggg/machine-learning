/* Chapitre 3 — SVM · §4–5 : dual, vecteurs de support, marge souple */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const colY = y => y > 0 ? C.blue : C.red;
  const street = (p, w, b, R, o = {}) => {
    const n2 = M.dot(w, w); if (n2 < 1e-12) return;
    if (o.band === false) { ML.drawHyper(p, w, b, 0, R, { color: C.yellow, width: 3 }); if (o.margins !== false) [-1, 1].forEach(l => ML.drawHyper(p, w, b, l, R, { color: C.yellow, width: 1.3, dash: [6, 5], alpha: 0.8 })); return; }
    const s1 = ML.clipLine(M.scale(w, (1 - b) / n2), [-w[1], w[0]], R), s2 = ML.clipLine(M.scale(w, (-1 - b) / n2), [-w[1], w[0]], R);
    if (s1 && s2) { const d = M.dot(M.sub(s1[1], s1[0]), M.sub(s2[1], s2[0])) > 0; p.poly([s1[0], s1[1], d ? s2[1] : s2[0], d ? s2[0] : s2[1]], { color: C.yellow, width: 0, fill: C.yellow, fillAlpha: 0.08, stroke: false }); }
    ML.drawHyper(p, w, b, 0, R, { color: C.yellow, width: 3 });
    if (o.margins !== false) [-1, 1].forEach(l => ML.drawHyper(p, w, b, l, R, { color: C.yellow, width: 1.3, dash: [6, 5], alpha: 0.8 }));
  };
  ML.drawStreet = street;

  // ------------------------------------------------------------------ svm-dual
  ML.scene('svm-dual', host => {
    const W = ML.widget(host, {
      title: 'Dual résolu (SMO) : les $\\alpha_i$, les vecteurs de support et $\\bw=\\sum_i\\alpha_iy_i\\bx_i$', tag: '2D',
      views: [{ name: 'p', label: 'données, rue, vecteurs de support', cls: 'tall', hint: 'glisser · clic : +1 · Maj+clic : −1' }, { name: 'a', label: 'multiplicateurs $\\alpha_i$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$f=0$ et $f=\\pm1$</span><span class="key"><i class="dot" style="background:transparent;border:2px solid #f4d345"></i>vecteur de support ($\\alpha_i>0$)</span><span class="key"><i style="background:#d147bd"></i>chaîne $\\sum_i\\alpha_iy_i\\bx_i$ (depuis l\'origine)</span><span class="key"><i style="background:#5cd0b3"></i>$\\bw^*$</span>',
    });
    const R = M.rng(9); let pts = [];
    for (let i = 0; i < 10; i++) pts.push([R.normal(-1.3, 0.55), R.normal(0.9, 0.6), -1]);
    for (let i = 0; i < 10; i++) pts.push([R.normal(1.2, 0.55), R.normal(-0.8, 0.6), 1]);
    const st = {}; let S;
    const sh = W.show;
    W.toggle('band', 'rue (bande)', true); W.toggle('margins', 'bords $f=\\pm1$', true); W.toggle('sv', 'cercles des vecteurs de support', true);
    W.toggle('alab', 'valeurs $\\alpha_i$', true); W.toggle('chain', 'chaîne $\\sum_i\\alpha_iy_i\\bx_i$ et $\\bw^*$', true);
    const P = new ML.Plot2D(W.views.p, { xlim: [-3.2, 3.2], ylim: [-2.6, 2.6], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    const addH = i => P.addDraggable({ enabled: () => !!pts[i], get: () => pts[i], set: (x, y) => { pts[i] = [x, y, pts[i][2]]; upd(); }, r: 10 });
    pts.forEach((_, i) => addH(i));
    P.onClick = (x, y, e) => { pts.push([x, y, e.shiftKey ? -1 : 1]); addH(pts.length - 1); upd(); };
    P.onDraw = p => {
      street(p, S.w, S.b, 4.3, { band: sh.band, margins: sh.margins });
      const amax = Math.max(...S.alpha, 1e-9);
      pts.forEach((q, i) => {
        const a = S.alpha[i];
        if (a > 1e-6) { if (sh.sv) p.circle(q[0], q[1], 0.16 + 0.18 * Math.sqrt(a / amax), { color: C.yellow, width: 2 }); if (sh.alab) p.tex('a' + i, q[0], q[1], `\\alpha=${M.fmt(a, 2)}`, { color: C.yellow, dy: -20, size: 12 }); }
        p.point(q[0], q[1], { color: colY(q[2]), r: a > 1e-6 ? 6 : 4, stroke: '#000' });
      });
      for (let i = pts.length; i < 60; i++) p.labels.get('a' + i) && (p.labels.get('a' + i).style.display = 'none');
      if (sh.chain) {
        let cur = [0, 0];
        pts.forEach((q, i) => { const a = S.alpha[i]; if (a <= 1e-6) return; const nx = [cur[0] + a * q[2] * q[0], cur[1] + a * q[2] * q[1]]; p.arrow(cur[0], cur[1], nx[0], nx[1], { color: C.pink, width: 2, head: 8, alpha: 0.85 }); cur = nx; });
        p.arrow(0, 0, S.w[0], S.w[1], { color: C.teal, width: 3 });
        p.tex('w', S.w[0], S.w[1], '\\bw^*', { color: C.teal, dx: 12, dy: -10, anchor: 'left' });
      }
    };
    const Pa = new ML.Plot2D(W.views.a, { xlim: [-0.8, 20], ylim: [-0.1, 3], xlabel: 'i', gridStep: [1, 0.5], tickFmt: (v, ax) => ax === 'x' ? (v % 5 === 0 ? String(v) : '') : String(v) });
    Pa.onDraw = p => { pts.forEach((q, i) => p.rect(i - 0.35, 0, i + 0.35, S.alpha[i], { color: colY(q[2]), width: 1, fill: colY(q[2]), fillAlpha: 0.7 })); };
    const c = W.controls;
    ui.buttons(c, [{ label: '↺ reset', onClick: () => { const r = M.rng(9); pts = []; for (let i = 0; i < 10; i++) pts.push([r.normal(-1.3, 0.55), r.normal(0.9, 0.6), -1]); for (let i = 0; i < 10; i++) pts.push([r.normal(1.2, 0.55), r.normal(-0.8, 0.6), 1]); P.draggables = []; pts.forEach((_, i) => addH(i)); upd(); } }]);
    const ro = ui.readout(c);
    ui.note(c, 'Déplace un point <b>loin</b> de la rue : rien ne change ($\\alpha_i = 0$). Déplace un vecteur de support : toute la solution bouge. Les flèches roses mises bout à bout (seulement les $\\alpha_i>0$) arrivent exactement sur $\\bw^*$.');
    function upd() {
      S = ML.linearSVM(pts, 1e4);
      const sy = M.sum(pts.map((q, i) => S.alpha[i] * q[2])), sa = M.sum(S.alpha), w2 = M.dot(S.w, S.w), nsv = S.alpha.filter(a => a > 1e-6).length;
      const sep = pts.every(q => q[2] * (M.dot(S.w, q) + S.b) > 1 - 1e-3);
      Pa.setLimits([-0.8, Math.max(20, pts.length) - 0.2], [-0.1, Math.max(0.5, Math.max(...S.alpha) * 1.15)]);
      ro.set(`${sep ? '' : '<span style="color:#fc6255">données non séparables : la marge dure n\'existe pas (ici $C=10^4$).</span><br>'}vecteurs de support : <b>${nsv}</b> / ${pts.length}<br>$\\sum_i\\alpha_iy_i$ = <b>${M.fmt(sy, 4)}</b> (contrainte)<br>$\\sum_i\\alpha_i$ = <b>${M.fmt(sa, 4)}</b> · $\\|\\bw^*\\|^2$ = <b>${M.fmt(w2, 4)}</b><br>$D(\\boldsymbol\\alpha^*)$ = <b>${M.fmt(S.dual, 4)}</b> · $\\frac12\\|\\bw^*\\|^2$ = <b>${M.fmt(w2 / 2, 4)}</b> (dualité forte)<br>marge $\\rho = 1/\\|\\bw^*\\|$ = <b>${M.fmt(1 / Math.sqrt(w2), 3)}</b>`);
      P.request(); Pa.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ svm-soft
  ML.scene('svm-soft', host => {
    const W = ML.widget(host, {
      title: 'Marge souple : le compromis $C$ entre largeur de rue et violations', tag: '2D',
      views: [{ name: 'p', label: 'données (classes qui se chevauchent)', cls: 'tall', hint: 'glisser · clic : +1 · Maj+clic : −1' }, { name: 'h', label: 'chaque point sur la hinge loss selon $t_i=y_if(\\bx_i)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#777"></i>$\\alpha=0$ : hors de la rue</span><span class="key"><i class="dot" style="background:transparent;border:2px solid #f4d345"></i>$0\\lt\\alpha\\lt C$ : sur le bord</span><span class="key"><i class="dot" style="background:transparent;border:2px solid #fc6255"></i>$\\alpha=C$ : $\\xi>0$</span><span class="key"><i style="background:#d147bd"></i>écart $\\xi_i/\\|\\bw\\|$</span>',
    });
    const R = M.rng(14); const pts = [];
    for (let i = 0; i < 16; i++) pts.push([R.normal(-0.8, 0.9), R.normal(0.6, 0.9), -1]);
    for (let i = 0; i < 16; i++) pts.push([R.normal(0.9, 0.9), R.normal(-0.5, 0.9), 1]);
    const st = { logC: 0 }; let S;
    const sh = W.show;
    W.toggle('band', 'rue (bande)', true); W.toggle('margins', 'bords $f=\\pm1$', true); W.toggle('slack', 'écarts $\\xi_i$', true); W.toggle('cats', 'catégories ($\\alpha=0$, bord, $\\alpha=C$)', true); W.toggle('zo', 'perte 0-1 (2e panneau)', true);
    const P = new ML.Plot2D(W.views.p, { xlim: [-4, 4], ylim: [-3.4, 3.4], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    const addH = i => P.addDraggable({ get: () => pts[i], set: (x, y) => { pts[i] = [x, y, pts[i][2]]; upd(); }, r: 10 });
    pts.forEach((_, i) => addH(i));
    P.onClick = (x, y, e) => { pts.push([x, y, e.shiftKey ? -1 : 1]); addH(pts.length - 1); upd(); };
    const Cv = () => 10 ** st.logC;
    P.onDraw = p => {
      street(p, S.w, S.b, 4.3, { band: sh.band, margins: sh.margins });
      const n = M.norm(S.w), Cc = Cv();
      pts.forEach((q, i) => {
        const t = q[2] * (M.dot(S.w, q) + S.b), xi = Math.max(0, 1 - t), a = S.alpha[i];
        if (xi > 1e-6 && sh.slack) { const k = q[2] * xi / (n * n); p.seg(q[0], q[1], q[0] + k * S.w[0], q[1] + k * S.w[1], { color: C.pink, width: 2 }); }
        const cat = a < 1e-6 * Cc ? 0 : a < Cc * (1 - 1e-6) ? 1 : 2;
        if (cat && sh.cats) p.circle(q[0], q[1], 0.2, { color: cat === 1 ? C.yellow : C.red, width: 2 });
        p.point(q[0], q[1], { color: colY(q[2]), r: cat ? 5.5 : 4, alpha: cat ? 1 : 0.6, stroke: '#000' });
      });
    };
    const H = new ML.Plot2D(W.views.h, { xlim: [-3, 4], ylim: [-0.3, 4.2], xlabel: 't' });
    H.onDraw = p => {
      if (sh.zo) p.fn(t => t <= 0 ? 1 : 0, { color: '#fff', width: 1.5, alpha: 0.6, samples: 900 });
      p.fn(t => Math.max(0, 1 - t), { color: C.pink, width: 3 });
      p.vline(1, { color: C.yellow, width: 1, dash: [4, 4], alpha: 0.5 });
      pts.forEach(q => { const t = q[2] * (M.dot(S.w, q) + S.b); p.point(M.clamp(t, -2.95, 3.95), Math.max(0, 1 - t), { color: colY(q[2]), r: 5, stroke: '#000' }); });
      p.tex('l1', 1.05, 3.9, 't=1', { color: C.yellow, anchor: 'left', size: 12 });
    };
    const c = W.controls;
    ui.slider(c, { label: '$\\log_{10}C$', min: -2, max: 3, step: 0.02, value: st.logC, onInput: v => { st.logC = v; upd(); } });
    ui.buttons(c, [{ label: '▶ balayer $C$', primary: true, onClick: () => ML.tween(5000, u => { st.logC = -2 + 5 * u; upd(); }) }]);
    const ro = ui.readout(c);
    function upd() {
      S = ML.linearSVM(pts, Cv());
      const Cc = Cv(), n2 = M.dot(S.w, S.w), ts = pts.map(q => q[2] * (M.dot(S.w, q) + S.b)), xi = ts.map(t => Math.max(0, 1 - t));
      const cats = [0, 0, 0]; S.alpha.forEach(a => cats[a < 1e-6 * Cc ? 0 : a < Cc * (1 - 1e-6) ? 1 : 2]++);
      const primal = 0.5 * n2 + Cc * M.sum(xi);
      ro.set(`$C$ = <b>${M.fmt(Cc, 3)}</b> · marge $1/\\|\\bw\\|$ = <b>${M.fmt(1 / Math.sqrt(n2), 3)}</b><br>$\\sum_i\\xi_i$ = <b>${M.fmt(M.sum(xi), 3)}</b> · erreurs = <b>${ts.filter(t => t <= 0).length}</b><br>$\\alpha=0$ : <b>${cats[0]}</b> · bord : <b>${cats[1]}</b> · $\\alpha=C$ : <b>${cats[2]}</b><br>primal $\\frac12\\|\\bw\\|^2 + C\\sum\\xi$ = <b>${M.fmt(primal, 4)}</b><br>dual $D(\\boldsymbol\\alpha)$ = <b>${M.fmt(S.dual, 4)}</b>`);
      P.request(); H.request();
    }
    upd();
  });
})(window.ML);
