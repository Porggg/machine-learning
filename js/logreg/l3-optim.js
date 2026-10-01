/* Chapitre 2 — Régression logistique · §6–8 : gradient, Newton, softmax */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const probRgb = p => ML.probRgb(p);

  // ------------------------------------------------------------------ lg-gd
  ML.scene('lg-gd', host => {
    const W = ML.widget(host, {
      title: 'Descente de gradient : chaque point pousse $\\bw$ avec la force $(y_n-\\hat y_n)\\bx_n$', tag: '2D',
      views: [{ name: 'p', label: 'données : cercle = $|y_n-\\hat y_n|$ (intensité de la poussée)', cls: 'tall' }, { name: 'w', label: 'plan $(w_1,w_2)$ à $b$ courant : NLL, trajet, forces', cls: 'tall' }, { name: 'c', label: 'NLL moyenne et $\\|\\bw\\|/10$ vs itérations', cls: 'tall' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#fff"></i>frontière</span><span class="key"><i style="background:#888"></i>forces individuelles $\\frac{\\gamma}{N}(y_n-\\hat y_n)\\bx_n$</span><span class="key"><i style="background:#f4d345"></i>pas total $-\\gamma\\nabla L$</span><span class="key"><i style="background:#f4d345"></i>NLL</span><span class="key"><i style="background:#d147bd"></i>$\\|\\bw\\|/10$</span>',
    });
    const st = { gamma: 1.5, lam: 0, sep: false };
    let data, w, hist;
    function gen() {
      const R = M.rng(st.sep ? 77 : 5), d = [], s = st.sep ? 1.3 : 0;
      for (let i = 0; i < 18; i++) d.push([R.normal(0.9 + s, 0.7), R.normal(0.5 + s * 0.6, 0.7), 1]);
      for (let i = 0; i < 18; i++) d.push([R.normal(-0.9 - s, 0.7), R.normal(-0.4 - s * 0.6, 0.7), 0]);
      data = d; reset();
    }
    const X = () => data.map(d => [d[0], d[1], 1]), Y = () => data.map(d => d[2]);
    const L = ww => M.logi.nll(X(), Y(), ww) / data.length + st.lam * M.dot(ww, ww);
    const G = ww => M.add(M.scale(M.logi.grad(X(), Y(), ww), 1 / data.length), M.scale(ww, 2 * st.lam));
    function reset() { w = [0, 0, 0]; hist = [{ w: w.slice(), L: L(w) }]; upd(); }
    function step() { if (hist.length > 3000) return false; w = M.sub(w, M.scale(G(w), st.gamma)); hist.push({ w: w.slice(), L: L(w) }); upd(); }
    const P = new ML.Plot2D(W.views.p, { xlim: [-4, 4], ylim: [-3.5, 3.5], equal: true });
    P.onDraw = p => {
      p.heatmap((a, b) => M.sigmoid(w[0] * a + w[1] * b + w[2]), probRgb, { res: 4 });
      if (M.norm([w[0], w[1]]) > 1e-9) { const n = M.norm([w[0], w[1]]), seg = ML.clipLine([-w[0] * w[2] / (n * n), -w[1] * w[2] / (n * n)], [-w[1], w[0]], 4); if (seg) p.polyline(seg, { color: '#fff', width: 2.5 }); }
      data.forEach(([a, b, y]) => { const e = Math.abs(y - M.sigmoid(w[0] * a + w[1] * b + w[2])); p.circle(a, b, 0.05 + 0.55 * e, { color: y ? C.blue : C.red, width: 1.2, alpha: 0.7 }); p.point(a, b, { color: y ? C.blue : C.red, r: 4, stroke: '#000' }); });
    };
    const Pw = new ML.Plot2D(W.views.w, { xlim: [-1, 7], ylim: [-1, 7], equal: true, xlabel: 'w_1', ylabel: 'w_2' });
    Pw.onDraw = p => {
      const b = w[2], f = (a, c) => L([a, c, b]);
      p.heatmap(f, v => M.rampRgb(0.8 * Math.min(1, Math.log1p(v * 3) / Math.log1p(6))).map(c => c * 0.45), { res: 4, key: 'lgw' + b.toFixed(2) + st.sep + st.lam });
      p.contour(f, [0.05, 0.1, 0.2, 0.3, 0.45, 0.6, 0.8, 1.1, 1.5, 2], { color: C.blue, width: 1, alpha: 0.4, key: 'lgw' + b.toFixed(2) + st.sep + st.lam });
      p.polyline(hist.map(h => [h.w[0], h.w[1]]), { color: C.yellow, width: 1.8 });
      const N = data.length, Xs = X(), Ys = Y();
      Xs.forEach((x, n) => { const e = Ys[n] - M.sigmoid(M.dot(x, w)), k = st.gamma * e / N * 6; p.arrow(w[0], w[1], w[0] + k * x[0], w[1] + k * x[1], { color: '#888', width: 1, head: 5, alpha: 0.7 }); });
      const g = G(w); p.arrow(w[0], w[1], w[0] - st.gamma * g[0] * 6, w[1] - st.gamma * g[1] * 6, { color: C.yellow, width: 3 });
      p.point(w[0], w[1], { color: C.yellow, r: 5, stroke: '#000' });
      p.tex('x6', 6.8, 6.6, '\\text{flèches} \\times 6', { anchor: 'right', color: '#888', size: 12 });
    };
    const Pc = new ML.Plot2D(W.views.c, { xlim: [0, 200], ylim: [0, 0.8], axisY: 0, xlabel: 't' });
    Pc.onDraw = p => {
      p.polyline(hist.map((h, i) => [i, h.L]), { color: C.yellow, width: 2.2 });
      p.polyline(hist.map((h, i) => [i, M.norm(h.w.slice(0, 2)) / 10]), { color: C.pink, width: 2 });
    };
    const c = W.controls;
    ui.slider(c, { label: 'pas $\\gamma$', min: 0.1, max: 6, step: 0.05, value: st.gamma, onInput: v => { st.gamma = v; } });
    ui.slider(c, { label: 'régularisation $\\lambda$', min: 0, max: 0.1, step: 0.001, value: 0, digits: 3, onInput: v => { st.lam = v; reset(); } });
    const bx = ML.h('div', { class: 'ctl' }); c.appendChild(bx);
    ui.check(bx, { label: 'données linéairement séparables', value: false, onChange: v => { st.sep = v; gen(); } });
    const pw = ML.h('div', { class: 'ctl' }); c.appendChild(pw);
    ui.player(pw, { speed: 20, step: () => step(), reset: () => reset() });
    const ro = ui.readout(c);
    function upd() {
      if (hist.length > Pc.xlim[1]) Pc.setLimits([0, Math.ceil(hist.length / 200) * 200]);
      ro.set(`$t$ = <b>${hist.length - 1}</b> · NLL moyenne = <b>${M.fmt(hist[hist.length - 1].L, 4)}</b> · $\\bw$ = (<b>${M.fmt(w[0], 2)}</b>, <b>${M.fmt(w[1], 2)}</b>), $b$ = <b>${M.fmt(w[2], 2)}</b> · $\\|\\bw\\|$ = <b>${M.fmt(M.norm(w.slice(0, 2)), 2)}</b>${st.sep && st.lam === 0 ? '<br><span style="color:#d147bd">séparable, $\\lambda=0$ : $\\|\\bw\\|$ croît indéfiniment (courbe rose), la NLL tend vers 0 sans minimum atteint.</span>' : ''}`);
      P.request(); Pw.request(); Pc.request();
    }
    gen();
  });

  // ------------------------------------------------------------------ lg-newton1d
  ML.scene('lg-newton1d', host => {
    const W = ML.widget(host, {
      title: 'Newton en 1D : sauter au sommet de la parabole de Taylor', tag: '2D',
      views: [{ name: 'p', cls: 'tall', hint: 'glisser le départ (blanc)' }], controls: true,
      foot: '<span class="key"><i style="background:#e8e6e3"></i>$f$</span><span class="key"><i style="background:#9a72ac"></i>parabole de Taylor en $w_k$</span><span class="key"><i style="background:#f4d345"></i>itérés de Newton $w_{k+1}=w_k-f\'(w_k)/f\'\'(w_k)$</span><span class="key"><i style="background:#58c4dd"></i>itérés de GD</span>',
    });
    const xs = [-2, -1.2, -0.6, -0.3, 0.4, 0.9, 1.4, 2.2], ys = [-1, -1, 1, -1, 1, -1, 1, 1];
    const FN = {
      logi: { name: 'NLL logistique 1 paramètre (convexe)', f: w => M.sum(xs.map((x, i) => M.softplus(-ys[i] * x * w))), xl: [-3, 5], yl: [-1, 12], w0: 4 },
      poly: { name: 'θ⁴+7θ³+5θ²−17θ+3 (chapitre 1)', f: t => t ** 4 + 7 * t ** 3 + 5 * t ** 2 - 17 * t + 3, xl: [-6.3, 2.3], yl: [-65, 62], w0: -1.5 },
      sqrt: { name: '√(1+w²) : Newton diverge si |w₀|>1', f: w => Math.sqrt(1 + w * w), xl: [-3, 3], yl: [-0.5, 3.5], w0: 0.9 },
    };
    const st = { fn: 'logi', w0: 4, path: [], gd: true, gamma: 0.25, gdPath: [] };
    const fn = () => FN[st.fn].f, d1 = w => (fn()(w + 1e-4) - fn()(w - 1e-4)) / 2e-4, d2 = w => (fn()(w + 1e-3) - 2 * fn()(w) + fn()(w - 1e-3)) / 1e-6;
    const P = new ML.Plot2D(W.views.p, { xlim: FN.logi.xl, ylim: FN.logi.yl, xlabel: 'w' });
    P.addDraggable({ get: () => [st.w0, fn()(st.w0)], set: x => { st.w0 = M.clamp(x, P.xlim[0] + 0.05, P.xlim[1] - 0.05); reset(); }, r: 14, cursor: 'ew-resize' });
    P.onDraw = p => {
      p.fn(fn(), { color: '#e8e6e3', width: 2.5 });
      const w = st.path[st.path.length - 1];
      if (isFinite(w) && Math.abs(w) < 50) {
        const f0 = fn()(w), g = d1(w), h = d2(w);
        p.fn(u => f0 + g * (u - w) + 0.5 * h * (u - w) ** 2, { color: C.purple, width: 2, dash: [6, 4] });
        if (Math.abs(h) > 1e-9) { const v = w - g / h; p.point(v, f0 - g * g / (2 * h), { color: C.purple, r: 5 }); p.seg(v, f0 - g * g / (2 * h), v, fn()(v), { color: C.purple, width: 1, dash: [3, 3] }); }
      }
      if (st.gd) { const q = st.gdPath.filter(v => isFinite(v) && Math.abs(v) < 50); for (let i = 0; i < q.length - 1; i++) p.arrow(q[i], fn()(q[i]), q[i + 1], fn()(q[i + 1]), { color: C.blue, width: 1.3, head: 7, alpha: 0.8 }); }
      const q = st.path.filter(v => isFinite(v) && Math.abs(v) < 50);
      for (let i = 0; i < q.length - 1; i++) p.arrow(q[i], fn()(q[i]), q[i + 1], fn()(q[i + 1]), { color: C.yellow, width: 2, head: 9 });
      q.forEach((v, i) => p.point(v, fn()(v), { color: C.yellow, r: i === q.length - 1 ? 6 : 3.5 }));
      p.point(st.w0, fn()(st.w0), { color: '#fff', r: 7, glow: true, stroke: '#000' });
    };
    const c = W.controls;
    ui.select(c, { label: 'fonction', options: Object.entries(FN).map(([k, v]) => [k, v.name]), value: st.fn, onChange: v => { st.fn = v; P.setLimits(FN[v].xl, FN[v].yl); st.w0 = FN[v].w0; reset(); } });
    ui.player(c, { speed: 2, step: () => step(), reset: () => reset() });
    ui.check(c, { label: 'comparer avec GD', value: true, onChange: v => { st.gd = v; P.request(); } });
    ui.slider(c, { label: 'pas GD $\\gamma$', min: 0.005, max: 0.6, step: 0.005, value: st.gamma, digits: 3, onInput: v => { st.gamma = v; reset(); } });
    const ro = ui.readout(c);
    function reset() { st.path = [st.w0]; st.gdPath = [st.w0]; upd(); }
    function step() {
      const w = st.path[st.path.length - 1]; if (!isFinite(w) || Math.abs(w) > 1e6 || st.path.length > 40) return false;
      st.path.push(w - d1(w) / d2(w));
      const g = st.gdPath[st.gdPath.length - 1]; st.gdPath.push(g - st.gamma * d1(g));
      upd();
    }
    function upd() {
      const w = st.path[st.path.length - 1];
      ro.set(`$k$ = <b>${st.path.length - 1}</b><br>$w_k$ = <b>${isFinite(w) && Math.abs(w) < 1e6 ? M.fmt(w, 6) : 'diverge'}</b><br>${isFinite(w) && Math.abs(w) < 1e3 ? `$f'(w_k)$ = <b>${M.fmt(d1(w), 3)}</b> · $f''(w_k)$ = <b>${M.fmt(d2(w), 3)}</b>${d2(w) < 0 ? '<br><span style="color:#fc6255">$f\'\'<0$ : la parabole est retournée, Newton vise un <b>maximum</b> !</span>' : ''}` : ''}`);
      P.request();
    }
    ui.note(c, 'Près de l\'optimum, le nombre de décimales exactes <b>double</b> à chaque pas (convergence quadratique). Sur $\\sqrt{1+w^2}$, $w_{k+1} = -w_k^3$ : converge si $|w_0|<1$, diverge sinon.');
    reset();
  });

  // ------------------------------------------------------------------ lg-newton
  ML.scene('lg-newton', host => {
    const W = ML.widget(host, {
      title: 'GD vs Newton sur la NLL logistique $L(w,b)$ — et le modèle quadratique local', tag: '2D + 3D',
      views: [{ name: 'p', label: 'lignes de niveau de $L$ (moyenne)', cls: 'tall', hint: 'glisser le départ' }, { name: 's3', label: 'surface $L$ + paraboloïde de Taylor', cls: 'tall', hint: 'glisser : tourner' }, { name: 'c', label: '$\\log_{10}(L-L^*)$ vs itération', cls: 'tall' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#58c4dd"></i>GD</span><span class="key"><i style="background:#f4d345"></i>Newton</span><span class="key"><i style="background:#9a72ac"></i>$\\tilde L$ : approximation quadratique au point Newton courant</span>',
    });
    const R = M.rng(19), data = [];
    for (let i = 0; i < 30; i++) { const x = R.uniform(-3, 3); data.push([x, R.u() < M.sigmoid(1.8 * x + 1) ? 1 : 0]); }
    const X = data.map(d => [d[0], 1]), Y = data.map(d => d[1]), N = data.length;
    const L = w => M.logi.nll(X, Y, w) / N, G = w => M.scale(M.logi.grad(X, Y, w), 1 / N), H = w => M.logi.hess(X, Y, w).map(r => r.map(v => v / N));
    const wStar = M.logi.fit(X, Y, 1e-9, 60), Lstar = L(wStar);
    const st = { x0: [0, 0], gamma: 1.2, damped: false };
    let gd, nt;
    function reset() { gd = [st.x0.slice()]; nt = [st.x0.slice()]; upd(); }
    function step() {
      if (gd.length > 400) return false;
      const a = gd[gd.length - 1]; gd.push(M.sub(a, M.scale(G(a), st.gamma)));
      const b = nt[nt.length - 1];
      if (L(b) - Lstar > 1e-13 && nt.length < 60 && b.every(v => Math.abs(v) < 1e6)) {
        const d = M.solve(H(b), G(b));
        if (d) { let t = 1; if (st.damped) while (t > 1e-4 && !(L(M.sub(b, M.scale(d, t))) < L(b))) t /= 2; nt.push(M.sub(b, M.scale(d, t))); }
      }
      upd();
    }
    const quad = w0 => { const f0 = L(w0), g = G(w0), h = H(w0); return (a, b) => { const d = [a - w0[0], b - w0[1]]; return f0 + M.dot(g, d) + 0.5 * M.dot(d, M.matvec(h, d)); }; };
    const P = new ML.Plot2D(W.views.p, { xlim: [-1.5, 5], ylim: [-4, 4], xlabel: 'w', ylabel: 'b' });
    P.addDraggable({ get: () => st.x0, set: (a, b) => { st.x0 = [a, b]; reset(); }, r: 14 });
    const Lxy = (a, b) => L([a, b]);
    P.onDraw = p => {
      p.heatmap(Lxy, v => M.rampRgb(0.8 * Math.min(1, Math.log1p(4 * (v - Lstar)) / Math.log1p(8))).map(c => c * 0.45), { res: 4, key: 'lgn' });
      p.contour(Lxy, [0.05, 0.1, 0.2, 0.35, 0.55, 0.8, 1.1, 1.5, 2].map(v => v + Lstar), { color: C.blue, width: 1, alpha: 0.4, key: 'lgn' });
      const cur = nt[nt.length - 1];
      if (M.norm(M.sub(cur, wStar)) > 1e-4) {
        const q = quad(cur), h = H(cur), g = G(cur), tgt = M.sub(cur, M.solve(h, g) || [0, 0]), qmin = q(...tgt);
        [0.02, 0.08, 0.2, 0.4, 0.7].forEach(l => p.ellipse(tgt[0], tgt[1], h, 2 * l, { color: C.purple, width: 1.3, alpha: 0.8 }));
        p.point(tgt[0], tgt[1], { color: C.purple, r: 4 }); void qmin;
      }
      p.polyline(gd, { color: C.blue, width: 1.8 }); gd.forEach(w => p.point(w[0], w[1], { color: C.blue, r: 2.5 }));
      p.polyline(nt, { color: C.yellow, width: 2.5 }); nt.forEach(w => p.point(w[0], w[1], { color: C.yellow, r: 4.5, stroke: '#000' }));
      p.point(wStar[0], wStar[1], { color: '#fff', r: 5, shape: 'cross' });
      p.point(st.x0[0], st.x0[1], { color: '#fff', r: 7, glow: true });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-1.5, 5], y: [-4, 4], z: [0, 2.5] }, size: [2.4, 2.4, 1.3], labels: { x: 'w', y: 'b', z: 'L' }, theta: -2.2, phi: 1.05, radius: 5.6 });
    S.surface('surf', Lxy, { res: 56, opacity: 0.75, zclip: [0, 2.5], hideClipped: true });
    function build3d() {
      S.clear('d');
      const cur = nt[nt.length - 1], q = quad(cur);
      S.surface('d', q, { res: 30, color: C.purple, opacity: 0.35, xr: [cur[0] - 1.6, cur[0] + 1.6].map(v => M.clamp(v, -1.5, 5)), yr: [cur[1] - 2, cur[1] + 2].map(v => M.clamp(v, -4, 4)), zclip: [0, 2.5], hideClipped: true, wireOpacity: 0.2 });
      const lift = arr => arr.filter(w => w[0] > -1.5 && w[0] < 5 && Math.abs(w[1]) < 4).map(w => [w[0], w[1], Math.min(2.5, L(w)) + 0.02]);
      const g = lift(gd), n = lift(nt);
      if (g.length > 1) S.curve('d', g, { color: C.blue, radius: 0.008 });
      if (n.length > 1) S.curve('d', n, { color: C.yellow, radius: 0.012 });
      S.points('d', n, { color: C.yellow, radius: 0.03 });
    }
    const Cv = new ML.Plot2D(W.views.c, { xlim: [0, 40], ylim: [-12, 1], axisY: -12, xlabel: 'k' });
    Cv.onDraw = p => {
      const lg = arr => arr.map((w, i) => [i, Math.log10(Math.max(1e-13, L(w) - Lstar))]);
      p.polyline(lg(gd), { color: C.blue, width: 2.2 }); p.polyline(lg(nt), { color: C.yellow, width: 2.5 });
      lg(nt).forEach(q => p.point(q[0], q[1], { color: C.yellow, r: 3.5 }));
    };
    const c = W.controls;
    ui.slider(c, { label: 'pas GD $\\gamma$', min: 0.1, max: 4, step: 0.05, value: st.gamma, onInput: v => { st.gamma = v; reset(); } });
    const bx = ML.h('div', { class: 'ctl' }); c.appendChild(bx);
    ui.check(bx, { label: 'Newton amorti (line search : on divise le pas par 2 tant que $L$ ne baisse pas)', value: false, onChange: v => { st.damped = v; reset(); } });
    ui.buttons(bx, [{ label: 'départ lointain $(-0.5,-3)$', onClick: () => { st.x0 = [-0.5, -3]; reset(); } }, { label: 'départ $(0,0)$', onClick: () => { st.x0 = [0, 0]; reset(); } }]);
    const pw = ML.h('div', { class: 'ctl' }); c.appendChild(pw);
    ui.player(pw, { speed: 1.5, step: () => step(), reset: () => reset() });
    const ro = ui.readout(c);
    function upd() {
      const a = gd[gd.length - 1], b = nt[nt.length - 1];
      ro.set(`itération <b>${gd.length - 1}</b> · $L$(GD) − $L^*$ = <b>${M.fmt(L(a) - Lstar, 3)}</b> · $L$(Newton) − $L^*$ = <b>${M.fmt(Math.max(0, L(b) - Lstar), 3)}</b> · optimum $(w^*,b^*)$ = (<b>${M.fmt(wStar[0], 3)}</b>, <b>${M.fmt(wStar[1], 3)}</b>)<br><span class="k">Les ellipses violettes sont les niveaux de $\\tilde L$ : leur forme vient de la hessienne ; Newton saute à leur centre. Depuis un départ lointain, le Newton <b>pur</b> peut diverger (hessienne quasi nulle quand tous les points sont saturés) : active l'amortissement.</span>`);
      P.request(); build3d(); Cv.request();
    }
    reset();
  });

  // ------------------------------------------------------------------ lg-softmax
  ML.scene('lg-softmax', host => {
    const W = ML.widget(host, {
      title: 'Softmax à 3 classes : scores linéaires, argmax et frontières', tag: '2D + 3D',
      views: [{ name: 'p', label: 'probabilités (couleurs mélangées) et frontières', cls: 'tall', hint: 'glisser les pointes des $\\bw_k$' }, { name: 's3', label: 'scores $a_k(\\bx)=\\bw_k\\T\\bx+b_k$', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>classe 1</span><span class="key"><i style="background:#fc6255"></i>classe 2</span><span class="key"><i style="background:#83c167"></i>classe 3</span><span class="key"><i style="background:#fff"></i>frontières $(\\bw_j-\\bw_k)\\T\\bx+(b_j-b_k)=0$</span>',
    });
    const COL = [C.blue, C.red, C.green], K = 3;
    const R = M.rng(23), centers = [[1.6, 1.2], [-1.7, 0.6], [0.1, -1.7]], data = [];
    centers.forEach((m, k) => { for (let i = 0; i < 20; i++) data.push([R.normal(m[0], 0.75), R.normal(m[1], 0.75), k]); });
    const st = { T: 1, view: 'planes', Wt: [[0.8, 0.2, 0], [-0.6, 0.5, 0], [0, -0.8, 0]] };
    const scores = (x, y) => st.Wt.map(w => (w[0] * x + w[1] * y + w[2]) / st.T);
    const soft = a => { const m = Math.max(...a), e = a.map(v => Math.exp(v - m)), s = M.sum(e); return e.map(v => v / s); };
    const rgb = COL.map(M.hexToRgb);
    const P = new ML.Plot2D(W.views.p, { xlim: [-3.5, 3.5], ylim: [-3.2, 3.2], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    for (let k = 0; k < K; k++) P.addDraggable({ get: () => [st.Wt[k][0] * 1.5, st.Wt[k][1] * 1.5], set: (x, y) => { st.Wt[k][0] = x / 1.5; st.Wt[k][1] = y / 1.5; upd(); }, r: 13 });
    P.onDraw = p => {
      p.heatmapRGB((x, y) => { const q = soft(scores(x, y)); return [0, 1, 2].map(i => (q[0] * rgb[0][i] + q[1] * rgb[1][i] + q[2] * rgb[2][i]) * 0.42); }, { res: 4 });
      // frontières : segments où les classes j,k sont les deux premières
      for (let j = 0; j < K; j++) for (let k = j + 1; k < K; k++) {
        const a = st.Wt[j], b = st.Wt[k], n = [a[0] - b[0], a[1] - b[1]], nn = M.dot(n, n); if (nn < 1e-12) continue;
        const x0 = [-(a[2] - b[2]) * n[0] / nn, -(a[2] - b[2]) * n[1] / nn], seg = ML.clipLine(x0, [-n[1], n[0]], 3.6); if (!seg) continue;
        const pts = M.linspace(0, 1, 300).map(t => { const x = seg[0][0] + t * (seg[1][0] - seg[0][0]), y = seg[0][1] + t * (seg[1][1] - seg[0][1]), s = scores(x, y), top = s.indexOf(Math.max(...s)); return (top === j || top === k) ? [x, y] : null; });
        p.polyline(pts, { color: '#fff', width: 2.2 });
      }
      data.forEach(([x, y, k]) => p.point(x, y, { color: COL[k], r: 3.8, stroke: '#000' }));
      for (let k = 0; k < K; k++) { const t = [st.Wt[k][0] * 1.5, st.Wt[k][1] * 1.5]; p.arrow(0, 0, t[0], t[1], { color: COL[k], width: 3 }); p.point(t[0], t[1], { color: COL[k], r: 6, glow: true, stroke: '#000' }); p.tex('w' + k, t[0], t[1], `\\bw_${k + 1}`, { color: COL[k], dx: 12, dy: -10, anchor: 'left' }); }
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3.5, 3.5], y: [-3.2, 3.2], z: [-6, 6] }, size: [2.3, 2.1, 1.8], labels: { x: 'x_1', y: 'x_2', z: '' }, theta: -1.1, phi: 1.1, radius: 6, target: [0, 0, 0.9], gridZ: -6 });
    function build3d() {
      S.clear('d');
      if (st.view === 'planes') {
        for (let k = 0; k < K; k++) S.surface('d', (x, y) => scores(x, y)[k], { res: 2, color: COL[k], opacity: 0.25, wire: false, zclip: [-6, 6] });
        S.surface('d', (x, y) => Math.max(...scores(x, y)) + 0.03, { res: 70, color: (z, x, y) => COL[scores(x, y).indexOf(Math.max(...scores(x, y)))], opacity: 0.9, zclip: [-6, 6], wireOpacity: 0.08 });
        S.label('lab', [3.5, 3.2, 6], '\\max_k a_k(\\bx)\\ \\text{(enveloppe)}', { color: '#ccc', size: 13 });
      } else {
        for (let k = 0; k < K; k++) S.surface('d', (x, y) => 6 * soft(scores(x, y))[k] - 6, { res: 50, color: COL[k], opacity: 0.45, wireOpacity: 0.08 });
        S.label('lab', [3.5, 3.2, 6], 'p(y=k\\mid\\bx)\\ \\text{(hauteur} \\times 12)', { color: '#ccc', size: 13 });
      }
      S.points('d', data.map(([x, y]) => [x, y, -6]), { color: data.map(d => COL[d[2]]), radius: 0.025 });
    }
    const c = W.controls;
    ui.select(c, { label: 'vue 3D', options: [['planes', 'scores : 3 plans + enveloppe max'], ['probs', 'probabilités softmax']], value: 'planes', onChange: v => { st.view = v; build3d(); } });
    ui.slider(c, { label: 'température $T$ (scores $/T$)', min: 0.2, max: 4, step: 0.01, value: 1, onInput: v => { st.T = v; upd(); } });
    let stop = null;
    ui.buttons(c, [
      { label: '▶ entraîner (GD)', primary: true, onClick: () => { if (stop) { stop(); stop = null; return; } let it = 0; stop = ML.loop(() => { for (let r = 0; r < 3; r++) gdStep(); upd(); if (++it > 400) { stop = null; return false; } }); } },
      { label: '🎲 poids aléatoires', onClick: () => { const r = M.rng(Date.now() % 1e6); st.Wt = st.Wt.map(() => [r.normal(0, 0.8), r.normal(0, 0.8), 0]); upd(); } },
    ]);
    const ro = ui.readout(c);
    function loss() { return M.mean(data.map(([x, y, k]) => -Math.log(soft(scores(x, y))[k] + 1e-300))); }
    function gdStep() {
      const g = st.Wt.map(() => [0, 0, 0]);
      data.forEach(([x, y, k]) => { const q = soft(scores(x, y)); for (let j = 0; j < K; j++) { const e = (q[j] - (j === k ? 1 : 0)) / st.T; g[j][0] += e * x; g[j][1] += e * y; g[j][2] += e; } });
      st.Wt = st.Wt.map((w, j) => w.map((v, i) => v - 0.4 * g[j][i] / data.length));
    }
    function upd() {
      const acc = M.mean(data.map(([x, y, k]) => { const s = scores(x, y); return s.indexOf(Math.max(...s)) === k ? 1 : 0; }));
      ro.set(`cross-entropy moyenne = <b>${M.fmt(loss(), 4)}</b><br>précision = <b>${(100 * acc).toFixed(0)} %</b><br><span class="k">$T\\to0$ : softmax → argmax (dur) ; $T$ grand : tout → $\\frac13$</span>`);
      P.request(); build3d();
    }
    upd();
  });
})(window.ML);
