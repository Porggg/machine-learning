/* Chapitre 1 — Régression linéaire · §8 Lasso et parcimonie */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // quadratique E(w) = (w − c)ᵀ A (w − c)
  const quadE = (A, c) => w => { const d = M.sub(w, c); return M.dot(d, M.matvec(A, d)); };
  const corr = (n, rho) => M.mat(n, n, (i, j) => i === j ? 1 : rho ** Math.abs(i - j));
  // projection sur la boule ℓ1 de rayon t (Duchi et al. 2008)
  const projL1 = (v, t) => {
    if (M.norm1(v) <= t) return v.slice();
    const u = v.map(Math.abs).sort((a, b) => b - a);
    let cs = 0, theta = 0;
    for (let j = 0; j < u.length; j++) { cs += u[j]; const th = (cs - t) / (j + 1); if (u[j] - th > 0) theta = th; }
    return v.map(x => Math.sign(x) * Math.max(Math.abs(x) - theta, 0));
  };
  const projL2 = (v, t) => { const n = M.norm(v); return n <= t ? v.slice() : M.scale(v, t / n); };
  const pgd = (A, c, proj, t) => { // descente de gradient projetée
    const L = 2 * M.eigSym(A).values[0]; let w = proj(c, t);
    for (let k = 0; k < 3000; k++) { const g = M.scale(M.matvec(A, M.sub(w, c)), 2); w = proj(M.sub(w, M.scale(g, 1 / L)), t); }
    return w;
  };

  // ------------------------------------------------------------------ lr-lq
  ML.scene('lr-lq', host => {
    const W = ML.widget(host, {
      title: 'Boules $\\{\\|\\bw\\|_q\\le t\\}$ : pourquoi $q\\le1$ donne des zéros', tag: '2D',
      views: [{ name: 'p', cls: 'tall', hint: 'glisser $\\bw_{\\text{LS}}$ (point bleu)' }], controls: true,
      foot: '<span class="key"><i style="background:#d147bd"></i>boule $\\|\\bw\\|_q\\le t$</span><span class="key"><i style="background:#58c4dd"></i>ellipse de niveau qui touche la boule</span><span class="key"><i class="dot" style="background:#f4d345"></i>solution contrainte</span>',
    });
    const st = { q: 1, t: 1, ws: [1.7, 0.7], rho: 0.3, stat: null };
    const A = () => [[1, st.rho], [st.rho, 1]];
    const ball = (th, q = st.q, t = st.t) => { const c = Math.cos(th), s = Math.sin(th); return [t * Math.sign(c) * Math.abs(c) ** (2 / q), t * Math.sign(s) * Math.abs(s) ** (2 / q)]; };
    const nq = w => (Math.abs(w[0]) ** st.q + Math.abs(w[1]) ** st.q) ** (1 / st.q);
    function solve(ws = st.ws) {
      if (nq(ws) <= st.t) return ws.slice();
      const E = quadE(A(), ws); let best = null, be = Infinity;
      for (let i = 0; i < 4000; i++) { const w = ball(2 * Math.PI * i / 4000); const e = E(w); if (e < be) { be = e; best = w; } }
      return best;
    }
    const isSparse = w => Math.min(Math.abs(w[0]), Math.abs(w[1])) < 0.015 * st.t;
    const P = new ML.Plot2D(W.views.p, { xlim: [-2.4, 2.4], ylim: [-2.4, 2.4], equal: true, xlabel: 'w_1', ylabel: 'w_2' });
    P.addDraggable({ get: () => st.ws, set: (x, y) => { st.ws = [x, y]; st.stat = null; upd(); }, r: 14 });
    P.onDraw = p => {
      const w = solve(), E = quadE(A(), st.ws), lv = E(w);
      [0.1, 0.4, 0.9, 1.6, 2.5, 3.6].forEach(L => p.ellipse(st.ws[0], st.ws[1], A(), L, { color: C.blue, width: 1, alpha: 0.25 }));
      const bpts = M.linspace(0, 2 * Math.PI, 721).map(th => ball(th));
      p.poly(bpts, { color: C.pink, width: 2.5, fill: C.pink, fillAlpha: 0.12 });
      if (lv > 1e-9) p.ellipse(st.ws[0], st.ws[1], A(), lv, { color: C.blue, width: 2.5 });
      p.seg(st.ws[0], st.ws[1], w[0], w[1], { color: '#fff', width: 1, dash: [4, 4], alpha: 0.5 });
      const sp = isSparse(w);
      p.point(w[0], w[1], { color: C.yellow, r: 7, stroke: '#000', glow: sp });
      p.point(st.ws[0], st.ws[1], { color: C.blue, r: 7, glow: true, stroke: '#000' });
      p.tex('ws', st.ws[0], st.ws[1], '\\bw_{\\text{LS}}', { color: C.blue, dx: 14, dy: -14, anchor: 'left' });
      if (sp) p.tex('sp', w[0], w[1], '\\text{une coordonnée} = 0\\,!', { color: C.yellow, dx: 12, dy: 18, anchor: 'left', size: 14 });
    };
    const c = W.controls;
    const qS = ui.slider(c, { label: 'exposant $q$', min: 0.3, max: 4, step: 0.01, value: st.q, onInput: v => { st.q = v; st.stat = null; upd(); } });
    ui.buttons(c, [0.5, 1, 2].map(q => ({ label: `$q=${q}$`, onClick: () => { st.q = q; qS.set(q); st.stat = null; upd(); } })));
    ui.slider(c, { label: 'budget $t$', min: 0.2, max: 2, step: 0.01, value: st.t, onInput: v => { st.t = v; st.stat = null; upd(); } });
    ui.slider(c, { label: 'corrélation $\\rho$ (forme des ellipses)', min: -0.9, max: 0.9, step: 0.01, value: st.rho, onInput: v => { st.rho = v; st.stat = null; upd(); } });
    ui.buttons(c, [{ label: 'statistique : 300 $\\bw_{\\text{LS}}$ au hasard', primary: true, onClick: () => {
      const r = M.rng(5); let k = 0, n = 0;
      while (n < 300) { const ws = [r.uniform(-2.3, 2.3), r.uniform(-2.3, 2.3)]; if (nq(ws) <= st.t) continue; n++; if (isSparse(solve(ws))) k++; }
      st.stat = k / n; upd();
    } }]);
    const ro = ui.readout(c);
    ui.note(c, 'Pour $q>1$ la boule est lisse et strictement convexe : le contact tombe presque jamais sur un axe. Pour $q=1$ les coins attirent une grande partie des solutions ; pour $q<1$ (non convexe) encore plus.');
    function upd() {
      const w = solve();
      ro.set(`solution : (<b>${M.fmt(w[0], 3)}</b>, <b>${M.fmt(w[1], 3)}</b>)${isSparse(w) ? ' <span style="color:#f4d345">parcimonieuse</span>' : ''}${st.stat != null ? `<br>solutions parcimonieuses : <b>${(100 * st.stat).toFixed(0)} %</b> pour $q=${st.q.toFixed(2)}$` : ''}`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ lr-lasso3d
  ML.scene('lr-lasso3d', host => {
    const W = ML.widget(host, {
      title: 'En 3D : l\'ellipsoïde de niveau de la MSE touche l\'octaèdre $\\ell_1$ (ou la sphère $\\ell_2$)', tag: '3D',
      views: [{ name: 's3', cls: 'tall', hint: 'glisser : tourner · molette : zoom' }], controls: true,
      foot: '<span class="key"><i style="background:#d147bd"></i>boule de contrainte</span><span class="key"><i style="background:#58c4dd"></i>ellipsoïde $\\{E(\\bw)=E(\\bw^\\star)\\}$</span><span class="key"><i class="dot" style="background:#58c4dd"></i>$\\bw_{\\text{LS}}$</span><span class="key"><i class="dot" style="background:#f4d345"></i>solution $\\bw^\\star$</span>',
    });
    const st = { ws: [1.3, 0.5, 0.25], rho: 0.4, t: 1, ball: 'l1' };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-1.8, 1.8], y: [-1.8, 1.8], z: [-1.8, 1.8] }, size: [2.2, 2.2, 2.2], labels: { x: 'w_1', y: 'w_2', z: 'w_3' }, theta: 0.7, phi: 1.1, radius: 4.6, target: [0, 0, 1.1], grid: false });
    let sol;
    function build() {
      const A = corr(3, st.rho), proj = st.ball === 'l1' ? projL1 : projL2;
      sol = pgd(A, st.ws, proj, st.t);
      const lv = quadE(A, st.ws)(sol), t = st.t;
      S.clear('d');
      if (st.ball === 'l1') {
        const V = [[t, 0, 0], [-t, 0, 0], [0, t, 0], [0, -t, 0], [0, 0, t], [0, 0, -t]], F = [];
        for (const a of [0, 1]) for (const b of [2, 3]) for (const cc of [4, 5]) F.push([V[a], V[b], V[cc]]);
        S.tris('d', F, { color: C.pink, opacity: 0.28, flat: true });
        const E = []; for (const a of [0, 1]) for (const b of [2, 3, 4, 5]) E.push([V[a], V[b]]); E.push([V[2], V[4]], [V[2], V[5]], [V[3], V[4]], [V[3], V[5]]);
        S.segments('d', E, { color: C.pink, opacity: 0.9 });
      } else S.paramSurface('d', (u, v) => { const th = 2 * Math.PI * u, ph = Math.PI * v; return [t * Math.sin(ph) * Math.cos(th), t * Math.sin(ph) * Math.sin(th), t * Math.cos(ph)]; }, { color: C.pink, opacity: 0.25, wire: true, wireOpacity: 0.1 });
      // ellipsoïde {(w−c)ᵀA(w−c) = lv}
      if (lv > 1e-8) {
        const { values, vectors } = M.eigSym(A), ax = [0, 1, 2].map(i => M.scale(vectors.map(r => r[i]), Math.sqrt(lv / values[i])));
        S.paramSurface('d', (u, v) => { const th = 2 * Math.PI * u, ph = Math.PI * v; const a = Math.sin(ph) * Math.cos(th), b = Math.sin(ph) * Math.sin(th), cc = Math.cos(ph); return [0, 1, 2].map(k => st.ws[k] + a * ax[0][k] + b * ax[1][k] + cc * ax[2][k]); }, { color: C.blue, opacity: 0.22, wire: true, wireOpacity: 0.15, nu: 56, nv: 28 });
      }
      S.points('d', [st.ws, sol], { color: [C.blue, C.yellow], radius: 0.055 });
      S.segments('d', [[st.ws, sol]], { color: '#fff', opacity: 0.5, dashed: true });
      // projections de la solution sur les axes
      S.segments('d', [[[sol[0], 0, 0], sol], [[0, sol[1], 0], sol], [[0, 0, sol[2]], sol]], { color: C.yellow, opacity: 0.35, dashed: true });
      S.label('ws', st.ws, '\\bw_{\\text{LS}}', { color: C.blue, dy: -18 });
      S.label('sol', sol, '\\bw^\\star', { color: C.yellow, dy: 18 });
      readout();
    }
    const c = W.controls;
    ui.select(c, { label: 'contrainte', options: [['l1', 'ℓ1 : octaèdre (lasso)'], ['l2', 'ℓ2 : sphère (ridge)']], value: 'l1', onChange: v => { st.ball = v; build(); } });
    ui.slider(c, { label: 'budget $t$', min: 0.2, max: 1.8, step: 0.01, value: st.t, onInput: v => { st.t = v; build(); } });
    ['$w_{\\text{LS},1}$', '$w_{\\text{LS},2}$', '$w_{\\text{LS},3}$'].forEach((lab, k) => ui.slider(c, { label: lab, min: -1.8, max: 1.8, step: 0.01, value: st.ws[k], onInput: v => { st.ws[k] = v; build(); } }));
    ui.slider(c, { label: 'corrélation $\\rho$', min: -0.6, max: 0.9, step: 0.01, value: st.rho, onInput: v => { st.rho = v; build(); } });
    const ro = ui.readout(c);
    function readout() {
      const z = sol.map(v => Math.abs(v) < 2e-3 * st.t);
      ro.set(`$\\bw^\\star$ = (${sol.map((v, i) => `<b style="color:${z[i] ? '#fc6255' : ''}">${z[i] ? '0' : M.fmt(v, 3)}</b>`).join(', ')})<br>zéros : <b>${z.filter(Boolean).length}</b> ${st.ball === 'l1' ? (z.filter(Boolean).length === 2 ? '(sommet)' : z.filter(Boolean).length === 1 ? '(arête)' : '(face)') : ''}`);
    }
    ui.note(c, 'Résolu par descente de gradient projetée. Réduis $t$ : avec l\'octaèdre, des coordonnées tombent exactement à 0 l\'une après l\'autre ; avec la sphère, jamais.');
    build();
  });

  // ------------------------------------------------------------------ lr-soft
  ML.scene('lr-soft', host => {
    const W = ML.widget(host, {
      title: '$\\min_w (w-a)^2+\\lambda|w|$ : le pli de $|w|$ retient le minimum en 0', tag: '2D',
      views: [{ name: 'g', label: 'objectif $g(w)$', cls: 'short' }, { name: 'm', label: 'solution $w^*(a)$', cls: 'short', hint: 'glisser $a$' }], controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$g(w)$ / seuillage doux (lasso)</span><span class="key"><i style="background:#58c4dd"></i>ridge $\\frac{a}{1+\\lambda}$</span><span class="key"><i style="background:#888"></i>seuillage dur ($\\ell_0$)</span><span class="key"><i style="background:#83c167"></i>droites d\'appui en 0 (sous-gradients)</span>',
    });
    const st = { a: 0.6, lam: 2 };
    const soft = a => M.softThreshold(a, st.lam / 2), ridge = a => a / (1 + st.lam), hard = a => a * a > st.lam ? a : 0;
    const G = new ML.Plot2D(W.views.g, { xlim: [-3, 3], ylim: [-1, 9], xlabel: 'w' });
    G.onDraw = p => {
      const g = w => (w - st.a) ** 2 + st.lam * Math.abs(w);
      p.fn(w => (w - st.a) ** 2, { color: C.blue, width: 1.5, dash: [5, 4], alpha: 0.7 });
      p.fn(w => st.lam * Math.abs(w), { color: C.pink, width: 1.5, dash: [5, 4], alpha: 0.7 });
      // sous-gradients en 0 : pentes dans −2a + λ[−1, 1]
      const g0 = g(0), lo = -2 * st.a - st.lam, hi = -2 * st.a + st.lam, ok = lo <= 0 && hi >= 0;
      M.linspace(lo, hi, 9).forEach(s => p.fn(w => g0 + s * w, { color: C.green, width: 1, alpha: 0.35 }, [-1.3, 1.3]));
      if (ok) p.fn(() => g0, { color: C.green, width: 2.5 }, [-1.5, 1.5]);
      p.fn(g, { color: C.yellow, width: 3.2 });
      const ws = soft(st.a); p.point(ws, g(ws), { color: C.yellow, r: 7, stroke: '#000' });
      p.tex('lab', ws, g(ws), `w^* = ${M.fmt(ws, 2)}`, { color: C.yellow, dy: 22 });
      p.tex('c', -2.9, 8.3, ok ? '0 \\in \\partial g(0)\\ \\Rightarrow\\ w^*=0' : '0 \\notin \\partial g(0)', { color: ok ? C.green : C.red, anchor: 'left' });
    };
    const Mp = new ML.Plot2D(W.views.m, { xlim: [-3, 3], ylim: [-3, 3], equal: true, xlabel: 'a', ylabel: 'w^*' });
    Mp.addDraggable({ get: () => [st.a, soft(st.a)], set: x => { st.a = M.clamp(x, -3, 3); aS.set(st.a); upd(); }, r: 14, cursor: 'ew-resize' });
    Mp.onDraw = p => {
      p.fn(x => x, { color: '#fff', width: 1, dash: [3, 4], alpha: 0.4 });
      p.fn(hard, { color: C.grey, width: 2, dash: [6, 4], samples: 1200 });
      p.fn(ridge, { color: C.blue, width: 2.2 });
      p.fn(soft, { color: C.yellow, width: 3 });
      p.rect(-st.lam / 2, -0.06, st.lam / 2, 0.06, { color: C.red, width: 0, fill: C.red, fillAlpha: 0.5, stroke: false });
      p.vline(st.a, { color: '#fff', width: 1, alpha: 0.4 });
      p.point(st.a, soft(st.a), { color: C.yellow, r: 6, glow: true });
      p.point(st.a, ridge(st.a), { color: C.blue, r: 5 });
      p.tex('z', 0, -0.35, '|a|\\le\\lambda/2 \\Rightarrow 0', { color: C.red, size: 12 });
    };
    const c = W.controls;
    const aS = ui.slider(c, { label: 'donnée $a$ (= solution sans pénalité)', min: -3, max: 3, step: 0.01, value: st.a, onInput: v => { st.a = v; upd(); } });
    ui.slider(c, { label: '$\\lambda$', min: 0, max: 4, step: 0.01, value: st.lam, onInput: v => { st.lam = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      ro.set(`lasso : $w^* = S_{\\lambda/2}(a)$ = <b>${M.fmt(soft(st.a), 3)}</b><br>ridge : $\\frac{a}{1+\\lambda}$ = <b>${M.fmt(ridge(st.a), 3)}</b><br>$\\partial g(0) = [${M.fmt(-2 * st.a - st.lam, 2)},\\ ${M.fmt(-2 * st.a + st.lam, 2)}]$`);
      G.request(); Mp.request();
    }
    ui.note(c, 'Ridge ne fait que <i>rétrécir</i> (droite bleue de pente $\\frac1{1+\\lambda}$) ; le lasso <i>rétrécit et coupe</i> : toute la zone rouge est envoyée exactement sur 0.');
    upd();
  });

  // ------------------------------------------------------------------ lr-paths
  ML.scene('lr-paths', host => {
    const W = ML.widget(host, {
      title: 'Chemins de régularisation : ridge vs lasso (8 features, 3 utiles)', tag: '2D',
      views: [{ name: 'r', label: 'ridge : $w_j$ vs $\\log_{10}\\lambda$', cls: 'short' }, { name: 'l', label: 'lasso : $w_j$ vs $\\log_{10}\\lambda$', cls: 'short' }, { name: 'b', label: 'coefficients au $\\lambda$ choisi', cls: 'short' }],
      controls: 'wide',
    });
    const R = M.rng(42), N = 60, p = 8, beta = [3, 1.5, 0, 0, 2, 0, 0, 0], rho = 0.5;
    // features corrélées AR(1), standardisées ; y centré
    let X = M.range(N).map(() => { const z = []; let prev = R.n(); z.push(prev); for (let j = 1; j < p; j++) { prev = rho * prev + Math.sqrt(1 - rho * rho) * R.n(); z.push(prev); } return z; });
    const mu = M.range(p).map(j => M.mean(X.map(r => r[j]))), sd = M.range(p).map(j => Math.sqrt(M.mean(X.map(r => (r[j] - mu[j]) ** 2))));
    X = X.map(r => r.map((v, j) => (v - mu[j]) / sd[j]));
    let y = X.map(r => M.dot(r, beta) + 1.5 * R.n()); const ym = M.mean(y); y = y.map(v => v - ym);
    const lmax = Math.max(...M.range(p).map(j => Math.abs(2 * M.dot(X.map(r => r[j]), y) / N)));
    const grid = M.linspace(Math.log10(lmax) + 0.2, -3, 90);
    let warm = M.zeros(p);
    const lassoPath = grid.map(ll => { warm = M.lasso(X, y, 10 ** ll, { w0: warm, iters: 400 }); return { ll, w: warm.slice() }; }).reverse();
    const ridgePath = M.linspace(-3, 3, 90).map(ll => ({ ll, w: M.ridge(X, y, 10 ** ll) }));
    const st = { ll: -0.2 };
    const names = M.range(p).map(j => `x_${j + 1}`);
    const plotPath = (el, path, xlim) => {
      const P = new ML.Plot2D(el, { xlim, ylim: [-0.8, 3.4], axisX: xlim[0] });
      P.onDraw = pp => {
        for (let j = 0; j < p; j++) pp.polyline(path.map(g => [g.ll, g.w[j]]), { color: M.series[j], width: beta[j] ? 2.6 : 1.5, alpha: beta[j] ? 1 : 0.75 });
        pp.vline(st.ll, { color: '#fff', width: 1.3, alpha: 0.8 });
      };
      P.addDraggable({ get: () => [st.ll, -0.6], set: x => { st.ll = M.clamp(x, -3, 2); lS.set(st.ll); upd(); }, r: 16, cursor: 'ew-resize' });
      P.onDrawTop = pp => pp.point(st.ll, -0.6, { color: '#fff', r: 6, glow: true });
      return P;
    };
    const Pr = plotPath(W.views.r, ridgePath, [-3.1, 3.1]), Pl = plotPath(W.views.l, lassoPath, [-3.1, Math.log10(lmax) + 0.3]);
    const B = new ML.Plot2D(W.views.b, { xlim: [-0.6, p - 0.4], ylim: [-0.8, 3.4], grid: true, gridStep: [1, 0.5], tickFmt: (v, ax) => ax === 'x' ? (Number.isInteger(v) && v >= 0 && v < p ? 'x' + (v + 1) : '') : String(v) });
    B.onDraw = pp => {
      const wr = M.ridge(X, y, 10 ** st.ll), wl = M.lasso(X, y, 10 ** st.ll, { iters: 600 });
      for (let j = 0; j < p; j++) {
        pp.rect(j - 0.36, 0, j - 0.02, wr[j], { color: C.blue, width: 0, fill: C.blue, fillAlpha: 0.7, stroke: false });
        pp.rect(j + 0.02, 0, j + 0.36, wl[j], { color: C.yellow, width: 0, fill: C.yellow, fillAlpha: 0.85, stroke: false });
        pp.seg(j - 0.42, beta[j], j + 0.42, beta[j], { color: '#fff', width: 2 });
      }
    };
    const c = W.controls;
    const lS = ui.slider(c, { label: '$\\log_{10}\\lambda$', min: -3, max: 2, step: 0.01, value: st.ll, onInput: v => { st.ll = v; upd(); } });
    const leg = ML.h('div', { class: 'ctl' }); c.appendChild(leg);
    ML.setMathHTML(leg, names.map((n, j) => `<span class="key"><i style="background:${M.series[j]}"></i>$${n}$${beta[j] ? '★' : ''}</span>`).join('') + '<br><span class="key"><i style="background:#58c4dd"></i>ridge</span><span class="key"><i style="background:#f4d345"></i>lasso</span><span class="key"><i style="background:#fff"></i>vrai $\\beta_j$</span> · ★ = feature utile');
    const ro = ui.readout(c);
    function upd() {
      const wl = M.lasso(X, y, 10 ** st.ll, { iters: 600 }), nz = wl.filter(v => Math.abs(v) > 1e-8).length;
      ro.set(`$\\lambda$ = <b>${M.fmt(10 ** st.ll, 3)}</b> · lasso : <b>${nz}</b> coefficient(s) non nul(s) sur ${p} · $\\lambda_{\\max}=\\max_j|\\tfrac2N\\boldsymbol x_j\\T\\by|$ = <b>${M.fmt(lmax, 3)}</b> (au-delà : tout est nul)`);
      Pr.request(); Pl.request(); B.request();
    }
    upd();
  });
})(window.ML);
