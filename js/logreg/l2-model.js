/* Chapitre 2 — Régression logistique · §4–5 : le modèle, la vraisemblance */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // ------------------------------------------------------------------ lg-model3d
  ML.scene('lg-model3d', host => {
    const W = ML.widget(host, {
      title: 'La surface $\\sigma(\\bw\\T\\bx+b)$ : une marche lisse orientée par $\\bw$, de raideur $\\|\\bw\\|$', tag: '3D + 2D',
      views: [{ name: 's3', label: 'surface de probabilité', cls: 'tall', hint: 'glisser : tourner' }, { name: 'p', label: 'vue de dessus : niveaux $p = 0.1,\\dots,0.9$', cls: 'tall', hint: 'glisser la pointe de $\\bw$' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\bw$ (normal à la frontière)</span><span class="key"><i style="background:#fff"></i>frontière $p=\\frac12$</span><span class="key"><i class="dot" style="background:#58c4dd"></i>$y=1$ (posés à hauteur 1)</span><span class="key"><i class="dot" style="background:#fc6255"></i>$y=0$ (hauteur 0)</span>',
    });
    const R = M.rng(31), data = [];
    for (let i = 0; i < 14; i++) data.push([R.normal(1, 0.8), R.normal(0.6, 0.8), 1]);
    for (let i = 0; i < 14; i++) data.push([R.normal(-1, 0.8), R.normal(-0.7, 0.8), 0]);
    const st = { w: [1.2, 0.6], b: 0, data: true };
    const p = (x, y) => M.sigmoid(st.w[0] * x + st.w[1] * y + st.b);
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3, 3], y: [-3, 3], z: [0, 1] }, size: [2.4, 2.4, 1.3], labels: { x: 'x_1', y: 'x_2', z: 'p' }, theta: -2.3, phi: 1.1, radius: 5.8 });
    function build3d() {
      S.clear('s');
      S.surface('s', p, { res: 64, opacity: 0.8, color: z => M.rgbToHex(ML.probRgb(z).map(v => v / 0.42 * 0.95)), wireOpacity: 0.14 });
      const n = M.norm(st.w); if (n < 1e-6) return;
      const u = [st.w[0] / n, st.w[1] / n], x0 = [-u[0] * st.b / n, -u[1] * st.b / n], t = [-u[1], u[0]];
      const seg = ML.clipLine(x0, t, 3);
      if (seg) {
        S.curve('s', seg.map(q => [q[0], q[1], 0.5]), { color: '#ffffff', radius: 0.01 });
        S.segments('s', [seg.map(q => [q[0], q[1], 0])], { color: '#fff', opacity: 0.6, dashed: true });
      }
      S.arrow('s', [x0[0], x0[1], 0], [x0[0] + u[0] * 1.2, x0[1] + u[1] * 1.2, 0], { color: C.yellow });
      if (st.data) {
        S.points('s', data.map(d => [d[0], d[1], d[2]]), { color: data.map(d => d[2] ? C.blue : C.red), radius: 0.035 });
        S.segments('s', data.map(d => [[d[0], d[1], d[2]], [d[0], d[1], p(d[0], d[1])]]), { color: '#fff', opacity: 0.35 });
      }
    }
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3], ylim: [-3, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    const anchor = () => { const n = M.norm(st.w) || 1; return [-st.w[0] * st.b / (n * n), -st.w[1] * st.b / (n * n)]; };
    P.addDraggable({ get: () => { const a = anchor(); return [a[0] + st.w[0], a[1] + st.w[1]]; }, set: (x, y) => { const a = anchor(); st.w = [x - a[0], y - a[1]]; upd(); }, r: 14 });
    P.onDraw = pp => {
      pp.heatmap(p, ML.probRgb, { res: 3 });
      pp.contour(p, [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9], { color: '#fff', width: 1, alpha: 0.35 });
      pp.contour(p, [0.5], { color: '#fff', width: 2.5 });
      if (st.data) data.forEach(d => pp.point(d[0], d[1], { color: d[2] ? C.blue : C.red, r: 4.5, stroke: '#000' }));
      const a = anchor(); pp.arrow(a[0], a[1], a[0] + st.w[0], a[1] + st.w[1], { color: C.yellow, width: 3 });
      pp.point(a[0] + st.w[0], a[1] + st.w[1], { color: C.yellow, r: 6, glow: true });
      pp.tex('w', a[0] + st.w[0], a[1] + st.w[1], '\\bw', { color: C.yellow, dx: 12, dy: -10, anchor: 'left' });
    };
    const c = W.controls;
    const bS = ui.slider(c, { label: 'biais $b$', min: -4, max: 4, step: 0.01, value: st.b, onInput: v => { st.b = v; upd(); } });
    ui.buttons(c, [
      { label: '$\\bw \\times 2$', onClick: () => scale(2) }, { label: '$\\bw \\div 2$', onClick: () => scale(0.5) },
      { label: 'MLE (Newton)', primary: true, onClick: () => { const X = data.map(d => [d[0], d[1], 1]), wt = M.logi.fit(X, data.map(d => d[2]), 0.01), a = [...st.w, st.b]; ML.tween(900, u => { st.w = [a[0] + (wt[0] - a[0]) * u, a[1] + (wt[1] - a[1]) * u]; st.b = a[2] + (wt[2] - a[2]) * u; bS.set(st.b); upd(); }); } },
    ]);
    function scale(k) { const a = [...st.w, st.b]; ML.tween(600, u => { const f = 1 + (k - 1) * u; st.w = [a[0] * f, a[1] * f]; st.b = a[2] * f; bS.set(st.b); upd(); }); }
    ui.check(c, { label: 'données', value: true, onChange: v => { st.data = v; upd(); } });
    const ro = ui.readout(c);
    ui.note(c, '$\\bw\\times2$ et $b\\times2$ : la frontière blanche ne bouge pas, mais les lignes de niveau se resserrent (marche plus raide). L\'écart entre $p=0.1$ et $p=0.9$ vaut $\\frac{2\\ln 9}{\\|\\bw\\|}$.');
    function upd() {
      const n = M.norm(st.w), X = data.map(d => [d[0], d[1], 1]), nll = M.logi.nll(X, data.map(d => d[2]), [...st.w, st.b]);
      ro.set(`$\\|\\bw\\|$ = <b>${M.fmt(n, 3)}</b> · distance frontière–origine $\\frac{|b|}{\\|\\bw\\|}$ = <b>${M.fmt(Math.abs(st.b) / (n || 1), 3)}</b><br>largeur de transition $0.1\\to0.9$ : <b>${M.fmt(2 * Math.log(9) / (n || 1e-9), 3)}</b><br>NLL = <b>${M.fmt(nll, 3)}</b>`);
      P.request(); build3d();
    }
    upd();
  });

  // ------------------------------------------------------------------ lg-likelihood
  ML.scene('lg-likelihood', host => {
    const W = ML.widget(host, {
      title: 'Vraisemblance en 1D : la probabilité de la bonne étiquette, point par point', tag: '2D + 3D',
      views: [{ name: 'p', label: 'données et $\\sigma(wx+b)$', cls: 'short', hint: 'glisser les points · clic sur un point : changer sa classe' }, { name: 'b', label: 'coût $-\\ln p(y_n\\mid x_n)$ de chaque point', cls: 'short' }, { name: 's3', label: 'NLL $L(w,b)$', cls: 'short', hint: 'glisser : tourner' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#83c167"></i>probabilité de la bonne étiquette</span><span class="key"><i style="background:#fc6255"></i>erreur $|y_n-\\hat y_n|$</span><span class="key"><i class="dot" style="background:#f4d345"></i>$(w,b)$ courant</span><span class="key"><i class="dot" style="background:#fff"></i>MLE</span>',
    });
    const R = M.rng(8), pts = [];
    for (let i = 0; i < 13; i++) { const x = R.uniform(-3, 3); pts.push([x, R.u() < M.sigmoid(2 * x - 0.5) ? 1 : 0]); }
    const st = { w: 0.8, b: 0.5 };
    const X = () => pts.map(p => [p[0], 1]), Y = () => pts.map(p => p[1]);
    const nll = (w, b) => M.logi.nll(X(), Y(), [w, b]);
    const P = new ML.Plot2D(W.views.p, { xlim: [-3.3, 3.3], ylim: [-0.15, 1.15], xlabel: 'x' });
    pts.forEach((_, i) => P.addDraggable({ get: () => pts[i], set: x => { pts[i][0] = M.clamp(x, -3.2, 3.2); upd(true); }, r: 10, cursor: 'ew-resize' }));
    P.onClick = (x, y) => { let bi = -1, bd = 0.25; pts.forEach((q, i) => { const d = Math.hypot(q[0] - x, (q[1] - y) * 4); if (d < bd) { bd = d; bi = i; } }); if (bi >= 0) { pts[bi][1] = 1 - pts[bi][1]; upd(true); } };
    P.onDraw = p => {
      const s = x => M.sigmoid(st.w * x + st.b);
      p.hline(0.5, { color: '#fff', width: 1, alpha: 0.2, dash: [3, 5] });
      pts.forEach(([x, y]) => { const q = s(x); p.seg(x, y, x, q, { color: C.red, width: 3, alpha: 0.85 }); p.seg(x, 1 - y, x, q, { color: C.green, width: 3, alpha: 0.6 }); });
      p.fn(s, { color: C.yellow, width: 3 });
      pts.forEach(([x, y]) => p.point(x, y, { color: y ? C.blue : C.red, r: 6, stroke: '#000' }));
    };
    const B = new ML.Plot2D(W.views.b, { xlim: [-0.8, 13.8], ylim: [0, 4], gridStep: [1, 1], tickFmt: (v, ax) => ax === 'x' ? '' : String(v) });
    B.onDraw = p => {
      const sorted = pts.map((q, i) => [q, i]).sort((a, b) => a[0][0] - b[0][0]);
      sorted.forEach(([[x, y]], k) => { const q = M.sigmoid(st.w * x + st.b), c = -Math.log(y ? q : 1 - q); p.rect(k - 0.35, 0, k + 0.35, Math.min(c, 3.95), { color: y ? C.blue : C.red, width: 1, fill: y ? C.blue : C.red, fillAlpha: 0.55 }); });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-1, 5], y: [-4, 4], z: [0, 30] }, size: [2.2, 2.2, 1.3], labels: { x: 'w', y: 'b', z: 'L' }, theta: -2.4, phi: 1.1, radius: 5.6 });
    let mle = [0, 0];
    function build3d(full) {
      if (full) { mle = M.logi.fit(X(), Y(), 1e-4); S.clear('surf'); S.surface('surf', nll, { res: 50, opacity: 0.8, zclip: [0, 30], hideClipped: true }); }
      S.clear('mk');
      const z = Math.min(30, nll(st.w, st.b)), zm = nll(mle[0], mle[1]);
      S.points('mk', [[st.w, st.b, z]], { color: C.yellow, radius: 0.05 });
      if (mle[0] > -1 && mle[0] < 5 && Math.abs(mle[1]) < 4) S.points('mk', [[mle[0], mle[1], zm]], { color: '#ffffff', radius: 0.04 });
      S.segments('mk', [[[st.w, st.b, 0], [st.w, st.b, z]]], { color: C.yellow, opacity: 0.7 });
    }
    const c = W.controls;
    const wS = ui.slider(c, { label: 'pente $w$', min: -1, max: 5, step: 0.01, value: st.w, onInput: v => { st.w = v; upd(); } });
    const bS = ui.slider(c, { label: 'biais $b$', min: -4, max: 4, step: 0.01, value: st.b, onInput: v => { st.b = v; upd(); } });
    ui.buttons(c, [{ label: 'aller au MLE', primary: true, onClick: () => { const a = [st.w, st.b]; ML.tween(900, u => { st.w = a[0] + (mle[0] - a[0]) * u; st.b = a[1] + (mle[1] - a[1]) * u; wS.set(st.w); bS.set(st.b); upd(); }); } }]);
    const ro = ui.readout(c);
    function upd(full) {
      const L = nll(st.w, st.b), lik = Math.exp(-L);
      if (full) build3d(true); else build3d(false);
      ro.set(`$\\prod_n p(y_n|x_n)$ = <b>${M.fmt(lik, 3)}</b> · $L = -\\ln\\prod = \\sum_n -\\ln p(y_n|x_n)$ = <b>${M.fmt(L, 3)}</b> · MLE : $(w,b)$ = (<b>${M.fmt(mle[0], 3)}</b>, <b>${M.fmt(mle[1], 3)}</b>), $L$ = <b>${M.fmt(nll(mle[0], mle[1]), 3)}</b>`);
      P.request(); B.request();
    }
    upd(true);
  });
})(window.ML);
