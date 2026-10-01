/* Chapitre 1 — Régression linéaire · §6 Ridge, §7 MAP */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const truth = x => Math.sin(2 * Math.PI * x);
  const symlog = w => Math.sign(w) * Math.log10(1 + Math.abs(w));

  // ------------------------------------------------------------------ lr-ridge
  ML.scene('lr-ridge', host => {
    const W = ML.widget(host, {
      title: 'Ridge sur le polynôme $M=10$ du HW1 : $\\bw_{\\text{ridge}}=(N\\lambda\\bI+\\bPhi\\T\\bPhi)^{-1}\\bPhi\\T\\by$', tag: '2D',
      views: [{ name: 'p', label: 'ajustement', cls: 'short' }, { name: 'e', label: 'MSE train / test vs $\\log_{10}\\lambda$', cls: 'short' }, { name: 'w', label: 'chemin : $w_j(\\lambda)$ (échelle symlog)', cls: 'short' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#58c4dd"></i>train</span><span class="key"><i style="background:#fc6255"></i>test</span><span class="key"><i style="background:#83c167"></i>$\\sin 2\\pi x$</span><span class="key"><i style="background:#f4d345"></i>ajustement ridge</span> · échelle symlog : $\\operatorname{sign}(w)\\log_{10}(1+|w|)$',
    });
    const Mdeg = 10, D = M.sinData(15, 0), T = M.sinData(400, 1000);
    const Phi = D.xs.map(M.basis.poly(Mdeg)), PhiT = T.xs.map(M.basis.poly(Mdeg));
    const st = { ll: -5, zero: false };
    const solve = ll => M.ridge(Phi, D.ys, ll === null ? 0 : 10 ** ll);
    const grid = M.linspace(-12, 1, 90).map(ll => { const w = solve(ll); return { ll, w, tr: M.mse(Phi, D.ys, w), te: M.mse(PhiT, T.ys, w) }; });
    const w0 = solve(null), e0 = { tr: M.mse(Phi, D.ys, w0), te: M.mse(PhiT, T.ys, w0) };
    let w;
    const evalP = (ww, x) => { let s = 0; for (let k = ww.length - 1; k >= 0; k--) s = s * x + ww[k]; return s; };
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.03, 1.03], ylim: [-1.8, 1.8] });
    P.onDraw = p => {
      T.xs.forEach((x, i) => p.point(x, T.ys[i], { r: 1.4, color: '#556', alpha: 0.8 }));
      p.fn(truth, { color: C.green, width: 2.2 });
      p.fn(x => evalP(w, x), { color: C.yellow, width: 3, samples: 600 }, [0, 1]);
      D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#fff', r: 4.5, stroke: '#000' }));
      p.tex('l', 0.97, 1.55, st.zero ? '\\lambda = 0' : `\\lambda = 10^{${st.ll.toFixed(1)}}`, { anchor: 'right', color: C.yellow });
    };
    const lg = v => Math.log10(Math.max(v, 1e-12));
    const E = new ML.Plot2D(W.views.e, { xlim: [-12.3, 1.3], ylim: [-4, 1], axisX: -12.3, axisY: -4, tickFmt: (v, ax) => ax === 'y' ? (Number.isInteger(v) ? '1e' + v : '') : String(v) });
    E.onDraw = p => {
      p.hline(lg(0.04), { color: C.grey, width: 1, dash: [5, 5] });
      p.polyline(grid.map(g => [g.ll, lg(g.tr)]), { color: C.blue, width: 2.5 });
      p.polyline(grid.map(g => [g.ll, lg(g.te)]), { color: C.red, width: 2.5 });
      [-7, -6, -5, -4, -3, 0].forEach(l => p.vline(l, { color: '#fff', width: 1, alpha: 0.12 }));
      if (!st.zero) { p.vline(st.ll, { color: C.yellow, width: 1.5 }); const g = cur(); p.point(st.ll, lg(g.tr), { color: C.blue, r: 5 }); p.point(st.ll, lg(g.te), { color: C.red, r: 5 }); }
    };
    E.addDraggable({ get: () => [st.ll, -3.8], set: x => { st.zero = false; st.ll = M.clamp(x, -12, 1); lS.set(st.ll); upd(); }, r: 16, cursor: 'ew-resize' });
    E.onDrawTop = p => { if (!st.zero) p.point(st.ll, -3.8, { color: C.yellow, r: 6, glow: true }); };
    const Wp = new ML.Plot2D(W.views.w, { xlim: [-12.3, 1.3], ylim: [-5.5, 5.5], axisX: -12.3, tickFmt: (v, ax) => ax === 'y' ? (Number.isInteger(v) ? (v < 0 ? '−' : '') + '1e' + Math.abs(v) : '') : String(v) });
    Wp.onDraw = p => {
      for (let j = 0; j <= Mdeg; j++) p.polyline(grid.map(g => [g.ll, symlog(g.w[j])]), { color: M.series[j], width: 1.8, alpha: 0.9 });
      if (!st.zero) p.vline(st.ll, { color: C.yellow, width: 1.5 });
    };
    const c = W.controls;
    const lS = ui.slider(c, { label: '$\\log_{10}\\lambda$', min: -12, max: 1, step: 0.05, value: st.ll, onInput: v => { st.zero = false; st.ll = v; upd(); } });
    const bw = ML.h('div', { class: 'ctl' }); c.appendChild(bw);
    ui.title(bw, 'grille du HW1 Q3.(3)');
    ui.buttons(bw, [{ label: '$0$', onClick: () => { st.zero = true; upd(); } }].concat([-7, -6, -5, -4, -3, 0].map(l => ({ label: `$10^{${l}}$`, onClick: () => { st.zero = false; st.ll = l; lS.set(l); upd(); } }))));
    const ro = ui.readout(c);
    const cur = () => st.zero ? { w: w0, ...e0 } : (() => { const ww = solve(st.ll); return { w: ww, tr: M.mse(Phi, D.ys, ww), te: M.mse(PhiT, T.ys, ww) }; })();
    function upd() {
      const g = cur(); w = g.w;
      ro.set(`$\\|\\bw\\|$ = <b>${M.fmt(M.norm(w), 3)}</b> · MSE train = <b>${M.fmt(g.tr, 5)}</b> · MSE test = <b>${M.fmt(g.te, 5)}</b><br><span class="k">Petit $\\lambda$ : $\\|\\bw\\|$ énorme, train ≈ 0, test mauvais. Grand $\\lambda$ ($=1$) : tout est écrasé vers 0, sous-apprentissage.</span>`);
      P.request(); E.request(); Wp.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ lr-ridge-geo
  ML.scene('lr-ridge-geo', host => {
    const W = ML.widget(host, {
      title: 'Ridge dans l\'espace des poids : l\'ellipse de la MSE tangente au cercle', tag: '2D + 3D',
      views: [{ name: 'p', label: 'plan $(w_1,w_2)$', cls: 'tall', hint: 'glisser $\\bw_{\\text{LS}}$' }, { name: 's3', label: 'surfaces', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>niveaux de la MSE (ellipses)</span><span class="key"><i style="background:#d147bd"></i>$\\|\\bw\\|=$ const. (cercles)</span><span class="key"><i style="background:#fff"></i>chemin $\\lambda\\in[0,\\infty)$</span><span class="key"><i style="background:#f4d345"></i>$\\bw_{\\text{ridge}}(\\lambda)$</span><span class="key"><i style="background:#fc6255"></i>$-\\nabla\\text{MSE}$</span><span class="key"><i style="background:#83c167"></i>$-\\lambda\\nabla\\|\\bw\\|^2$</span>',
    });
    const st = { ws: [1.6, 0.9], rho: 0.75, ll: -0.3, show: { mse: true, reg: true, sum: true } };
    const A = () => [[1, st.rho], [st.rho, 1]];
    const Eq = (w1, w2) => { const d = [w1 - st.ws[0], w2 - st.ws[1]], a = A(); return d[0] * (a[0][0] * d[0] + a[0][1] * d[1]) + d[1] * (a[1][0] * d[0] + a[1][1] * d[1]); };
    const lam = () => 10 ** st.ll;
    const wr = l => M.solve(M.addDiag(A(), l), M.matvec(A(), st.ws));
    const P = new ML.Plot2D(W.views.p, { xlim: [-2.3, 2.3], ylim: [-2.3, 2.3], equal: true, xlabel: 'w_1', ylabel: 'w_2' });
    P.addDraggable({ get: () => st.ws, set: (x, y) => { st.ws = [M.clamp(x, -2.2, 2.2), M.clamp(y, -2.2, 2.2)]; upd(); }, r: 14 });
    P.onDraw = p => {
      const w = wr(lam()), lv = Eq(...w);
      [0.05, 0.2, 0.5, 1, 1.7, 2.6, 3.8, 5.2].forEach(L => p.ellipse(st.ws[0], st.ws[1], A(), L, { color: C.blue, width: 1, alpha: 0.35 }));
      p.ellipse(st.ws[0], st.ws[1], A(), lv, { color: C.blue, width: 2.2 });
      [0.5, 1, 1.5, 2, 2.5].forEach(r => p.circle(0, 0, r, { color: C.pink, width: 1, alpha: 0.25 }));
      p.circle(0, 0, M.norm(w), { color: C.pink, width: 2.2 });
      const path = M.linspace(-4, 4, 160).map(l => wr(10 ** l)); path.unshift(st.ws.slice()); path.push([0, 0]);
      p.polyline(path, { color: '#fff', width: 1.5, dash: [5, 4], alpha: 0.8 });
      // gradients opposés au point de tangence
      const a = A(), g = M.scale(M.matvec(a, M.sub(w, st.ws)), 2), gr = M.scale(w, 2 * lam());
      const k = 0.35 / Math.max(1e-6, M.norm(g));
      p.arrow(w[0], w[1], w[0] - g[0] * k, w[1] - g[1] * k, { color: C.red, width: 2.5 });
      p.arrow(w[0], w[1], w[0] - gr[0] * k, w[1] - gr[1] * k, { color: C.green, width: 2.5 });
      p.point(0, 0, { color: C.pink, r: 4 });
      p.point(w[0], w[1], { color: C.yellow, r: 6, stroke: '#000' });
      p.point(st.ws[0], st.ws[1], { color: C.blue, r: 7, glow: true, stroke: '#000' });
      p.tex('ls', st.ws[0], st.ws[1], '\\bw_{\\text{LS}}', { color: C.blue, dx: 16, dy: -14, anchor: 'left' });
      p.tex('r', w[0], w[1], '\\bw_{\\text{ridge}}', { color: C.yellow, dx: -12, dy: 14, anchor: 'right' });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [0, 8] }, size: [2.2, 2.2, 1.5], labels: { x: 'w_1', y: 'w_2', z: '' }, theta: -2.3, phi: 1.1, radius: 5.6 });
    function build3d() {
      S.clear('s');
      const l = lam(), w = wr(l);
      if (st.show.mse) S.surface('s', Eq, { res: 44, color: C.blue, opacity: 0.35, zclip: [0, 8], hideClipped: true, wireOpacity: 0.12 });
      if (st.show.reg) S.surface('s', (a, b) => l * (a * a + b * b), { res: 44, color: C.pink, opacity: 0.35, zclip: [0, 8], hideClipped: true, wireOpacity: 0.12 });
      if (st.show.sum) S.surface('s', (a, b) => Eq(a, b) + l * (a * a + b * b), { res: 44, color: C.yellow, opacity: 0.55, zclip: [0, 8], hideClipped: true, wireOpacity: 0.18 });
      S.points('s', [[st.ws[0], st.ws[1], 0], [w[0], w[1], Eq(...w) + l * M.dot(w, w)], [0, 0, 0]], { color: [C.blue, C.yellow, C.pink], radius: 0.045 });
      S.segments('s', [[[w[0], w[1], 0], [w[0], w[1], Eq(...w) + l * M.dot(w, w)]]], { color: C.yellow });
    }
    const c = W.controls;
    ui.slider(c, { label: '$\\log_{10}\\lambda$', min: -3, max: 2, step: 0.01, value: st.ll, onInput: v => { st.ll = v; upd(); } });
    ui.slider(c, { label: 'corrélation des features $\\rho$', min: -0.95, max: 0.95, step: 0.01, value: st.rho, onInput: v => { st.rho = v; upd(); } });
    ui.buttons(c, [{ label: '▶ balayer $\\lambda$', primary: true, onClick: () => { const a = -3, b = 2; ML.tween(4000, u => { st.ll = a + (b - a) * u; upd(); }); } }]);
    ui.title(c, 'surfaces 3D');
    ui.check(c, { label: '<span class="c-blue">MSE</span> $(\\bw-\\bw_{\\text{LS}})\\T\\bA(\\bw-\\bw_{\\text{LS}})$', value: true, onChange: v => { st.show.mse = v; build3d(); } });
    ui.check(c, { label: '<span class="c-pink">pénalité</span> $\\lambda\\|\\bw\\|^2$', value: true, onChange: v => { st.show.reg = v; build3d(); } });
    ui.check(c, { label: '<span class="c-yellow">somme</span> (objectif ridge)', value: true, onChange: v => { st.show.sum = v; build3d(); } });
    const ro = ui.readout(c);
    function upd() {
      const l = lam(), w = wr(l), ev = M.eigSym(A());
      ro.set(`$\\lambda$ = <b>${M.fmt(l, 3)}</b><br>$\\bw_{\\text{ridge}}$ = (<b>${M.fmt(w[0], 3)}</b>, <b>${M.fmt(w[1], 3)}</b>)<br>facteurs $\\frac{\\mu_i}{\\mu_i+\\lambda}$ : <b>${M.fmt(ev.values[0] / (ev.values[0] + l), 3)}</b> (axe court), <b>${M.fmt(ev.values[1] / (ev.values[1] + l), 3)}</b> (axe long)`);
      P.request(); build3d();
    }
    ui.note(c, 'Ici la MSE est écrite comme une quadratique centrée en $\\bw_{\\text{LS}}$ : $\\bA = \\frac1N\\bPhi\\T\\bPhi$ (features normalisées, corrélation $\\rho$). Au point jaune, les flèches rouge et verte sont exactement opposées : c\'est la condition $\\nabla E_{\\text{ridge}} = 0$.');
    upd();
  });

  // ------------------------------------------------------------------ lr-map
  ML.scene('lr-map', host => {
    const W = ML.widget(host, {
      title: 'Apprentissage bayésien séquentiel : prior × vraisemblance → posterior (PRML Fig. 3.7)', tag: '2D + 3D',
      views: [{ name: 'lik', label: 'vraisemblance du dernier point $p(y_N\\mid x_N,\\bw)$', cls: 'short' }, { name: 'post', label: 'prior / posterior $p(\\bw\\mid\\mathcal D)$', cls: 'short' },
              { name: 'data', label: 'espace des données : 6 tirages du posterior', cls: 'short' }, { name: 's3', label: 'posterior en 3D', cls: 'short', hint: 'glisser : tourner' }],
      controls: 'wide',
      foot: '<span class="key"><i class="dot" style="background:#fff"></i>vraie valeur $(w_0,w_1)=(-0.3,\\,0.5)$</span><span class="key"><i class="dot" style="background:#f4d345"></i>$\\bw_{\\text{MAP}}$</span><span class="key"><i style="background:#fc6255"></i>droites $y=w_0+w_1x$ tirées du posterior</span>',
    });
    const TRUE = [-0.3, 0.5];
    const st = { tau: 0.7, sigma: 0.2, N: 0 };
    const R = M.rng(21), pool = M.range(200).map(() => { const x = R.uniform(-1, 1); return [x, TRUE[0] + TRUE[1] * x + 0.2 * R.n()]; });
    const zs = M.range(6).map(() => [R.n(), R.n()]);
    const obs = () => pool.slice(0, st.N).map(([x, y]) => [x, TRUE[0] + TRUE[1] * x + (y - TRUE[0] - TRUE[1] * x) * st.sigma / 0.2]);
    function posterior() {
      const d = obs(), Phi = d.map(([x]) => [1, x]), y = d.map(p => p[1]);
      const G = d.length ? M.gram(Phi) : [[0, 0], [0, 0]];
      const Sinv = M.addDiag(G.map(r => r.map(v => v / st.sigma ** 2)), 1 / st.tau ** 2); // S_N⁻¹ = τ⁻²I + σ⁻²ΦᵀΦ
      const S = M.inv(Sinv), m = d.length ? M.scale(M.matvec(S, M.Atv(Phi, y)), 1 / st.sigma ** 2) : [0, 0];
      return { d, Phi, y, S, Sinv, m };
    }
    let post = posterior();
    const gauss2 = (w, m, Sinv) => { const a = w[0] - m[0], b = w[1] - m[1]; return Math.exp(-0.5 * (a * (Sinv[0][0] * a + Sinv[0][1] * b) + b * (Sinv[1][0] * a + Sinv[1][1] * b))); };
    const cmap = v => M.rampRgb(Math.pow(M.clamp(v, 0, 1), 0.6)).map(c => c * M.clamp(v * 3, 0, 1));
    const opt = { xlim: [-1, 1], ylim: [-1, 1], equal: true, xlabel: 'w_0', ylabel: 'w_1', pad: [10, 10, 22, 30] };
    const L = new ML.Plot2D(W.views.lik, opt), Pp = new ML.Plot2D(W.views.post, opt);
    L.onDraw = p => {
      const d = post.d;
      if (!d.length) { p.text(0, 0, 'aucune observation', { color: '#777' }); return; }
      const [x, y] = d[d.length - 1];
      p.heatmap((a, b) => Math.exp(-((y - a - b * x) ** 2) / (2 * st.sigma ** 2)), cmap, { res: 3 });
      p.point(TRUE[0], TRUE[1], { color: '#fff', r: 5, shape: 'cross' });
    };
    Pp.onDraw = p => {
      p.heatmap((a, b) => gauss2([a, b], post.m, post.Sinv), cmap, { res: 3 });
      p.point(TRUE[0], TRUE[1], { color: '#fff', r: 5, shape: 'cross' });
      p.point(post.m[0], post.m[1], { color: C.yellow, r: 5, stroke: '#000' });
      zs.forEach(z => { const w = sample(z); p.point(w[0], w[1], { color: C.red, r: 3 }); });
    };
    function sample(z) { // m + L z  (Cholesky 2×2)
      const S = post.S, l11 = Math.sqrt(S[0][0]), l21 = S[1][0] / l11, l22 = Math.sqrt(Math.max(1e-12, S[1][1] - l21 * l21));
      return [post.m[0] + l11 * z[0], post.m[1] + l21 * z[0] + l22 * z[1]];
    }
    const Dp = new ML.Plot2D(W.views.data, { xlim: [-1, 1], ylim: [-1, 1], equal: true, xlabel: 'x', ylabel: 'y', pad: [10, 10, 22, 30] });
    Dp.onDraw = p => {
      zs.forEach(z => { const w = sample(z); p.fn(x => w[0] + w[1] * x, { color: C.red, width: 1.6, alpha: 0.8 }); });
      p.fn(x => post.m[0] + post.m[1] * x, { color: C.yellow, width: 2.5 });
      p.fn(x => TRUE[0] + TRUE[1] * x, { color: '#fff', width: 1, dash: [4, 4], alpha: 0.6 });
      post.d.forEach(([x, y], i) => p.point(x, y, { color: i === post.d.length - 1 ? C.blue : '#ddd', r: i === post.d.length - 1 ? 6 : 4, hollow: true }));
    };
    const S3 = new ML.Scene3D(W.views.s3, { range: { x: [-1, 1], y: [-1, 1], z: [0, 1.1] }, size: [2, 2, 1.1], labels: { x: 'w_0', y: 'w_1', z: '' }, theta: -2.2, phi: 1.0, radius: 4.8, ticks: false });
    function build3d() {
      S3.clear('s');
      S3.surface('s', (a, b) => gauss2([a, b], [0, 0], [[1 / st.tau ** 2, 0], [0, 1 / st.tau ** 2]]) * 0.5, { res: 40, color: C.blue, opacity: 0.18, wireOpacity: 0.06 });
      S3.surface('s', (a, b) => gauss2([a, b], post.m, post.Sinv), { res: 70, opacity: 0.85, cmin: 0, cmax: 1 });
      S3.points('s', [[TRUE[0], TRUE[1], 0], [post.m[0], post.m[1], 1]], { color: ['#ffffff', C.yellow], radius: 0.035 });
      S3.segments('s', [[[TRUE[0], TRUE[1], 0], [TRUE[0], TRUE[1], 1.05]]], { color: '#fff', opacity: 0.6, dashed: true });
    }
    const c = W.controls;
    ui.buttons(c, [
      { label: 'observer un point', primary: true, onClick: () => { st.N = Math.min(200, st.N + 1); upd(); } },
      { label: '+10', onClick: () => { st.N = Math.min(200, st.N + 10); upd(); } },
      { label: '↺ aucune donnée', onClick: () => { st.N = 0; upd(); } },
    ]);
    ui.slider(c, { label: 'écart-type du prior $\\tau$  ($\\bSigma=\\tau^2\\bI$)', min: 0.1, max: 2, step: 0.01, value: st.tau, onInput: v => { st.tau = v; upd(); } });
    ui.slider(c, { label: 'bruit $\\sigma$', min: 0.05, max: 0.8, step: 0.01, value: st.sigma, onInput: v => { st.sigma = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      post = posterior();
      const N = st.N, lamEq = N ? st.sigma ** 2 / (N * st.tau ** 2) : NaN;
      let extra = '';
      if (N) { const wr = M.ridge(post.Phi, post.y, lamEq); extra = ` · ridge avec $\\lambda=\\frac{\\sigma^2}{N\\tau^2}$ = <b>${M.fmt(lamEq, 4)}</b> → $\\bw_{\\text{ridge}}$ = (<b>${M.fmt(wr[0], 4)}</b>, <b>${M.fmt(wr[1], 4)}</b>) ✓`; }
      ro.set(`$N$ = <b>${N}</b> · $\\bw_{\\text{MAP}}$ = (<b>${M.fmt(post.m[0], 4)}</b>, <b>${M.fmt(post.m[1], 4)}</b>)${extra}`);
      L.request(); Pp.request(); Dp.request(); build3d();
    }
    upd();
  });
})(window.ML);
