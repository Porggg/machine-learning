/* Chapitre 9 — §6–7 : la borne inférieure F(r,θ) et EM en 1D, EM pour un GMM 2D, le k-means comme limite σ² → 0 */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, K = ML.km;
  const f2 = v => v.toFixed(2), f3 = v => v.toFixed(3);
  const LIM = { xlim: [-3.6, 3.6], ylim: [-3, 3], equal: true, gridStep: [1, 1] };

  // ------------------------------------------------------------------ em-bound
  ML.scene('em-bound', host => {
    const W = ML.widget(host, {
      title: 'EM comme montée par bornes : $F(r,\\theta)\\le\\mathcal L(\\theta)$, contact à l\'étape E, maximum de la borne à l\'étape M (slides 25–26, 38)', tag: '1D',
      views: [{ name: 'b', label: '$\\mathcal L(\\mu_1)$ (blanc) et la borne $F(r^{(t)},\\mu_1)$ construite à l\'étape E (bleu)', cls: 'tall', style: 'flex:1 1 100%;height:320px' },
        { name: 'd', label: 'les données et les deux composantes $\\tfrac12\\mathcal N(x\\mid\\mu_k,1)$ ; couleur des points = $r_{n1}$', cls: 'short', style: 'flex:1 1 100%;height:170px' }],
      controls: true,
      foot: '<span class="key"><i style="background:#fff"></i>$\\mathcal L(\\mu_1)$</span><span class="key"><i style="background:#58c4dd"></i>borne courante $F(r,\\cdot)$</span><span class="key"><i style="background:#f4d345"></i>$\\theta^{(t)}$ sur $\\mathcal L$</span><span class="key"><i style="background:#fc6255"></i>écart $\\mathcal L-F = \\sum_n\\mathrm{KL}(r_n\\,\\|\\,p_\\theta(z_n\\mid x_n))$</span>',
    });
    const R0 = M.rng(3), X = M.range(20).map(i => (i < 8 ? -1.6 + 0.6 * R0.n() : 2.2 + 0.6 * R0.n()));
    const st = { mu2: 2.2, m0: 0.3, m: 0.3, B: [], next: 'E', t: 0, done: false };
    const lp = (x, m) => Math.log(0.5) - 0.5 * Math.log(2 * Math.PI) - 0.5 * (x - m) ** 2;
    const Lf = m => M.sum(X.map(x => { const a = lp(x, m), b = lp(x, st.mu2), mx = Math.max(a, b); return mx + Math.log(Math.exp(a - mx) + Math.exp(b - mx)); }));
    const post = m => X.map(x => 1 / (1 + Math.exp(lp(x, st.mu2) - lp(x, m))));
    const ent = r => (r > 1e-300 ? -r * Math.log(r) : 0);
    const F = (R, m) => M.sum(X.map((x, n) => R[n] * lp(x, m) + (1 - R[n]) * lp(x, st.mu2) + ent(R[n]) + ent(1 - R[n])));
    const Bp = new ML.Plot2D(W.views.b, { xlim: [-4, 5], ylim: [-80, -30], xlabel: '\\mu_1' });
    const Dp = new ML.Plot2D(W.views.d, { xlim: [-4, 5], ylim: [-0.03, 0.44], gridStep: [1, 0.1], xlabel: 'x' });
    Bp.onDraw = p => {
      if (W.show.old) st.B.slice(0, -1).forEach(b => p.fn(m => F(b.R, m), { color: C.blue, width: 1, alpha: 0.3 }));
      p.fn(Lf, { color: '#fff', width: 3 });
      const b = st.B[st.B.length - 1];
      if (b) {
        p.fn(m => F(b.R, m), { color: C.blue, width: 2.5 });
        p.point(b.th, Lf(b.th), { color: C.blue, r: 5 });
        if (st.next === 'E' && Math.abs(st.m - b.th) > 1e-9) {
          const y1 = F(b.R, st.m), y2 = Lf(st.m);
          p.seg(st.m, y1, st.m, y2, { color: C.red, width: 3 });
          p.point(st.m, y1, { color: C.gold, r: 5 });
          p.tex('arg', st.m, y1, '\\arg\\max F', { color: C.gold, dy: 16, size: 12 });
        }
      }
      p.point(st.m, Lf(st.m), { color: C.yellow, r: 7, glow: true });
      p.tex('t', st.m, Lf(st.m), `\\theta^{(${st.t})}`, { color: C.yellow, dy: -18, size: 13 });
    };
    Dp.onDraw = p => {
      p.fn(x => 0.5 * K.npdf(x, st.m, 1), { color: C.blue, width: 2 });
      p.fn(x => 0.5 * K.npdf(x, st.mu2, 1), { color: C.red, width: 2 });
      p.fn(x => 0.5 * K.npdf(x, st.m, 1) + 0.5 * K.npdf(x, st.mu2, 1), { color: '#fff', width: 1.5, dash: [5, 4] });
      const b = st.B[st.B.length - 1], R = b ? b.R : post(st.m);
      X.forEach((x, n) => p.point(x, 0.012, { color: K.mixHex([R[n], 1 - R[n]]), r: 5, stroke: '#000', strokeWidth: 1 }));
    };
    W.toggle('old', 'bornes précédentes', true);
    const reset = () => { st.m = st.m0; st.B = []; st.next = 'E'; st.t = 0; st.done = false; fit(); upd(); };
    const step = () => {
      if (st.done) return false;
      if (st.next === 'E') { st.B.push({ R: post(st.m), th: st.m }); st.next = 'M'; }
      else {
        const R = st.B[st.B.length - 1].R, m = M.sum(X.map((x, n) => R[n] * x)) / M.sum(R);
        if (Math.abs(m - st.m) < 1e-6) st.done = true;
        st.m = m; st.t++; st.next = 'E';
      }
      upd(); return !st.done;
    };
    function fit() { const g = M.linspace(-4, 5, 181).map(Lf), hi = Math.max(...g), lo = Math.max(Math.min(...g), hi - 18); Bp.setLimits([-4, 5], [lo - 2, hi + 2]); }
    const c = W.controls;
    ui.slider(c, { label: 'moyenne fixée $\\mu_2$ (non apprise)', min: -3, max: 4.5, step: 0.05, value: st.mu2, digits: 2, onInput: v => { st.mu2 = v; reset(); } });
    ui.slider(c, { label: 'départ $\\mu_1^{(0)}$', min: -3.8, max: 4.8, step: 0.05, value: st.m0, digits: 2, onInput: v => { st.m0 = v; reset(); } });
    ui.player(c, { speed: 1.5, step, reset });
    const ro = ui.readout(c);
    function upd() {
      const b = st.B[st.B.length - 1], Lm = Lf(st.m);
      let line;
      if (!b) line = 'Prochaine étape : <b>E</b> (on construit la borne qui touche $\\mathcal L$ en $\\theta^{(0)}$).';
      else if (st.next === 'M') line = `Étape E faite : $r_{n1} = p_{\\theta}(z_n = 1\\mid x_n)$, et $F(r,\\theta^{(t)}) = ${f3(F(b.R, st.m))} = \\mathcal L(\\theta^{(t)})$ : la borne est <b>serrée</b>. Prochaine étape : <b>M</b>.`;
      else { const Fo = F(b.R, b.th), Fn = F(b.R, st.m); line = `Étape M faite : $\\mu_1 \\leftarrow \\sum_nr_{n1}x_n/\\sum_nr_{n1} = ${f3(st.m)}$.<br>$\\mathcal L(\\theta^{\\text{old}}) = F(r,\\theta^{\\text{old}}) = ${f3(Fo)}\\ \\le\\ F(r,\\theta^{\\text{new}}) = ${f3(Fn)}\\ \\le\\ \\mathcal L(\\theta^{\\text{new}}) = ${f3(Lm)}$ (écart ${f3(Lm - Fn)})`; }
      ro.set(`Itération ${st.t} · $\\mu_1 = ${f3(st.m)}$, $\\mathcal L(\\mu_1) = ${f3(Lm)}$${st.done ? ' · <b class="c-green">convergé</b>' : ''}<br>${line}<br><span class="c-dim">On n'apprend que $\\mu_1$ ($\\pi_k = \\frac12$, $\\sigma_k = 1$, $\\mu_2$ fixé) pour pouvoir tracer $\\mathcal L$ comme une courbe. $F(r,\\cdot)$ est une parabole (concave en $\\mu_1$) facile à maximiser ; $\\mathcal L$ ne l'est pas. Place $\\mu_2$ au milieu des données : $\\mathcal L$ a deux bosses, et EM monte vers celle du côté où il démarre.</span>`);
      Bp.request(); Dp.request();
    }
    reset();
  });

  // ------------------------------------------------------------------ gmm-em
  ML.scene('gmm-em', host => {
    const W = ML.widget(host, {
      title: 'EM pour un mélange de gaussiennes 2D : étapes E et M, et la log-vraisemblance qui monte (slides 27, 30, 39)', tag: '2D',
      views: [{ name: 'd', label: 'couleur = responsabilités $r_{nk}$ ; ellipses $d_k(x) = 1, 2$ ; épaisseur ∝ $\\pi_k$', cls: 'tall', style: 'flex:1 1 56%' }, { name: 'l', label: 'log-vraisemblance $\\mathcal L(\\theta^{(t)})$', cls: 'tall', style: 'flex:1 1 38%' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$\\mathcal L(\\theta^{(t)})$ (calculée à chaque étape E)</span><span class="key"><i style="background:#fff"></i>○ moyennes $\\mu_k$</span>',
    });
    const st = { kind: 'faithful', k: 2, init: 'prml', eps: 1e-3, seed: 1, X: null, th: null, R: null, next: 'E', t: 0, hist: [], done: false, collapsed: false };
    W.toggle('soft', 'couleurs = mélange des $r_{nk}$ (sinon : groupe le plus probable)', true); W.toggle('e2', 'ellipses $d_k = 2$', true);
    const P = new ML.Plot2D(W.views.d, LIM);
    const Lp = new ML.Plot2D(W.views.l, { xlim: [0, 10], ylim: [-300, -100], xlabel: 't' });
    P.onDraw = p => {
      const R = st.R;
      st.X.forEach((x, n) => { const col = !R ? '#ccc' : W.show.soft ? K.mixHex(R[n]) : K.COL[R[n].indexOf(Math.max(...R[n]))]; p.point(x[0], x[1], { color: col, r: 3.6, stroke: '#000', strokeWidth: 1 }); });
      st.th.mu.forEach((m, k) => {
        const w = 1 + 4 * Math.sqrt(st.th.pi[k]);
        K.ellipse(p, m, st.th.S[k], 1, { color: K.COL[k], width: w });
        if (W.show.e2) K.ellipse(p, m, st.th.S[k], 2, { color: K.COL[k], width: 1, dash: [5, 4] });
        p.point(m[0], m[1], { color: '#fff', r: 5, stroke: K.COL[k], strokeWidth: 2.5 });
      });
    };
    Lp.onDraw = p => {
      const H = st.hist;
      if (H.length > 1) p.polyline(H.map((v, i) => [i, v]), { color: C.blue, width: 2.5 });
      H.forEach((v, i) => p.point(i, v, { color: C.blue, r: 3.5 }));
    };
    const init = () => {
      const R = M.rng(st.seed * 53 + st.k), I = [[1, 0], [0, 1]], uni = M.range(st.k).map(() => 1 / st.k);
      if (st.init === 'km') { let best = null; for (let i = 0; i < 5; i++) { const r = K.lloyd(st.X, K.initPP(st.X, st.k, R)); if (!best || r.J < best.J) best = r; } return K.fromHard(st.X, best.r, best.mu, st.eps); }
      if (st.init === 'prml') return { pi: uni, mu: [[-1.6, 1.6], [1.6, -1.6], [-1.6, -1.6], [1.6, 1.6], [0, 2.2]].slice(0, st.k), S: uni.map(() => [[0.5, 0], [0, 0.5]]) };
      return { pi: uni, mu: K.initRandom(st.X, st.k, R), S: uni.map(() => I) };
    };
    const reset = () => { st.X = K.data(st.kind, 4).X; st.th = init(); st.R = null; st.next = 'E'; st.t = 0; st.hist = []; st.done = false; st.collapsed = false; upd(); };
    const step = () => {
      if (st.done) return false;
      if (st.next === 'E') {
        const e = K.estep(st.X, st.th); st.R = e.R; st.hist.push(e.L); st.next = 'M';
        const H = st.hist; if (H.length > 2 && Math.abs(H[H.length - 1] - H[H.length - 2]) < 1e-6) st.done = true;
      } else { st.th = K.mstep(st.X, st.R, st.th, st.eps); st.t++; st.next = 'E'; }
      upd(); return !st.done;
    };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: K.DATA, onChange: v => { st.kind = v; st.k = K.data(v).K; sK.set(st.k); reset(); } });
    const sK = ui.slider(c, { label: 'nombre de composantes $K$', min: 1, max: 6, step: 1, value: st.k, digits: 0, onInput: v => { const k = Math.round(v); if (k !== st.k) { st.k = k; reset(); } } });
    ui.select(c, { label: 'initialisation', value: st.init, options: [['prml', 'moyennes dans les coins, Σ = 0,5 I'], ['rand', 'moyennes = K points au hasard, Σ = I'], ['km', 'à partir d\'un k-means (slide 39)']], onChange: v => { st.init = v; reset(); } });
    ui.slider(c, { label: 'plancher $\\varepsilon$ des valeurs propres de $\\Sigma_k$', min: -7, max: -1, value: st.eps, log: true, fmt: v => v.toExponential(0), onInput: v => { st.eps = v; } });
    ui.player(c, { speed: 2, step, reset: () => { st.seed++; reset(); } });
    ui.buttons(c, [{ label: 'ajouter une composante effondrée', title: 'ajoute une composante centrée sur un point des données, de covariance εI et de poids 1/N', onClick: () => {
      if (st.k >= 6) return;
      const j = Math.floor(M.rng(st.seed * 7 + st.k).u() * st.X.length), N = st.X.length, e = Math.max(st.eps, 1e-7), last = st.hist[st.hist.length - 1];
      st.th = { pi: st.th.pi.map(v => v * (1 - 1 / N)).concat([1 / N]), mu: st.th.mu.concat([st.X[j].slice()]), S: st.th.S.concat([[[e, 0], [0, e]]]) };
      st.k++; sK.set(st.k); st.R = null; st.next = 'E'; st.done = false; st.collapsed = true; st.hist = last != null ? [last] : []; upd();
    } }]);
    const ro = ui.readout(c);
    function upd() {
      const H = st.hist;
      if (H.length) { const lo = Math.min(...(H.length > 3 && !st.collapsed ? H.slice(1) : H)), hi = Math.max(...H), pad = Math.max(2, 0.08 * (hi - lo)); Lp.setLimits([0, Math.max(10, H.length)], [lo - pad, hi + pad]); }
      const Nk = st.R ? K.Nk(st.R) : null, lmin = Math.min(...st.th.S.map(K.minEig));
      const comp = st.th.mu.map((m, k) => `<span style="color:${K.COL[k]}">$k = ${k + 1}$</span> : $\\pi_k = ${f2(st.th.pi[k])}$${Nk ? `, $N_k = ${f2(Nk[k])}$` : ''}`).join(' · ');
      const dl = H.length > 1 ? H[H.length - 1] - H[H.length - 2] : null;
      const nxt = st.done ? '<b class="c-green">convergé</b> ($\\Delta\\mathcal L\\lt 10^{-6}$)' : st.next === 'E' ? 'prochaine étape : <b>E</b> (responsabilités)' : 'prochaine étape : <b>M</b> (moyennes, covariances, poids)';
      ro.set(`Itération ${st.t} · ${nxt}<br>${H.length ? `$\\mathcal L$ = <b>${f3(H[H.length - 1])}</b>${dl != null ? `, $\\Delta\\mathcal L = ${dl.toExponential(2)}$` : ''}` : 'Pas encore d\'étape E (points gris).'}<br>${comp}<br>Plus petite valeur propre des $\\Sigma_k$ : ${lmin.toExponential(2)}${lmin <= st.eps * 1.0001 ? ' <b class="c-red">(au plancher : une composante s\'effondre)</b>' : ''}<br><span class="c-dim">${st.collapsed ? 'La nouvelle composante, posée sur un seul point avec la covariance $\\varepsilon I$, a une densité énorme en ce point : $\\mathcal L$ saute vers le haut (le 1<sup>er</sup> point de la courbe est la valeur avant l\'ajout), d\'autant plus que $\\varepsilon$ est petit, et EM la garde. Quand $\\varepsilon\\to0$, $\\mathcal L\\to+\\infty$ : le « meilleur » modèle est absurde. Le plancher $\\Sigma_k\\succeq\\varepsilon I$ (slide 39) borne ce gain ; compare $\\varepsilon = 10^{-1}$ et $10^{-7}$.' : 'Chaque itération ne fait jamais baisser $\\mathcal L$ (courbe croissante), sans pas d\'apprentissage. Essaie « 2 groupes très allongés » : le k-means les coupe en travers ; EM passe par un long plateau (une coupe gauche/droite), puis trouve les deux bandes, bien plus vraisemblables.'}</span>`);
      P.request(); Lp.request();
    }
    reset();
  });

  // ------------------------------------------------------------------ km-limit
  ML.scene('km-limit', host => {
    const W = ML.widget(host, {
      title: 'Le k-means comme cas limite : GMM restreint $\\pi_k = \\frac1K$, $\\Sigma_k = \\sigma^2I$, puis $\\sigma^2\\to0$ (slides 28–29)', tag: '2D',
      views: [{ name: 'p', label: 'responsabilités $r_k(x)\\propto e^{-\\|x-\\mu_k\\|^2/(2\\sigma^2)}$ en tout point du plan (couleur mélangée) ; centres à tirer', cls: 'tall', style: 'flex:1 1 56%' },
        { name: 'c', label: 'le long du segment $[\\mu_1,\\mu_2]$ : $r_1$ en fonction de la position $s$ ($x = \\mu_1+s(\\mu_2-\\mu_1)$)', cls: 'tall', style: 'flex:1 1 38%' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$r_1$ le long du segment</span><span class="key"><i style="background:#888"></i>affectation dure du k-means (marche)</span>',
    });
    const st = { X: K.data('blobs3', 6).X, mu: [[-2.2, -0.4], [1.0, 2.2], [1.8, -1.9]], sig: 0.8, t: 0 };
    const beta = () => 1 / (2 * st.sig * st.sig);
    const P = new ML.Plot2D(W.views.p, LIM);
    const Cp = new ML.Plot2D(W.views.c, { xlim: [-0.5, 1.5], ylim: [-0.05, 1.08], gridStep: [0.25, 0.25], xlabel: 's' });
    P.onDraw = p => {
      const b = beta();
      p.heatmapRGB((x, y) => K.mix(K.softRow([x, y], st.mu, b), 0.3), { res: 4 });
      p.seg(st.mu[0][0], st.mu[0][1], st.mu[1][0], st.mu[1][1], { color: '#fff', width: 1, dash: [4, 4], alpha: 0.6 });
      st.X.forEach(x => p.point(x[0], x[1], { color: K.mixHex(K.softRow(x, st.mu, b)), r: 3.8, stroke: '#000', strokeWidth: 1 }));
      st.mu.forEach((m, k) => { p.point(m[0], m[1], { shape: 'cross', color: '#000', r: 9, width: 6 }); p.point(m[0], m[1], { shape: 'cross', color: K.COL[k], r: 8, width: 3.5 }); p.point(m[0], m[1], { color: K.COL[k], r: 5, alpha: 0.5, glow: true }); p.tex('m' + k, m[0], m[1], '\\mu_' + (k + 1), { color: K.COL[k], dx: 15, dy: -13, size: 14 }); });
      p.circle(st.mu[0][0], st.mu[0][1], st.sig, { color: '#fff', width: 1.2, alpha: 0.7 });
      p.tex('s', st.mu[0][0] + st.sig, st.mu[0][1], '\\sigma', { color: '#fff', dx: 10, size: 13 });
    };
    Cp.onDraw = p => {
      const b = beta(), a = st.mu[0], d = [st.mu[1][0] - a[0], st.mu[1][1] - a[1]], at = s => [a[0] + s * d[0], a[1] + s * d[1]];
      p.fn(s => (K.nearest(at(s), st.mu) === 0 ? 1 : 0), { color: '#888', width: 1.5, dash: [5, 4] });
      p.fn(s => K.softRow(at(s), st.mu, b)[0], { color: C.blue, width: 3 });
      p.vline(0, { color: C.blue, width: 1, dash: [3, 4] }); p.vline(1, { color: C.red, width: 1, dash: [3, 4] });
    };
    for (let k = 0; k < 3; k++) P.addDraggable({ get: () => st.mu[k], set: (x, y) => { st.mu[k] = [M.clamp(x, -3.5, 3.5), M.clamp(y, -2.9, 2.9)]; upd(); }, r: 16 });
    const c = W.controls;
    ui.slider(c, { label: 'écart-type commun $\\sigma$', min: -1.7, max: 0.4, value: st.sig, log: true, fmt: v => v.toFixed(v < 0.1 ? 3 : 2), onInput: v => { st.sig = v; upd(); } });
    ui.player(c, { speed: 3, step: () => { const R = K.softR(st.X, st.mu, beta()), mu = K.wmeans(st.X, R, st.mu), ch = Math.max(...mu.map((m, k) => Math.sqrt(K.d2(m, st.mu[k])))); st.mu = mu; st.t++; upd(); return ch > 1e-6; }, reset: () => { st.mu = [[-2.2, -0.4], [1.0, 2.2], [1.8, -1.9]]; st.t = 0; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const b = beta(), R = K.softR(st.X, st.mu, b), sure = R.filter(r => Math.max(...r) > 0.99).length, H = M.mean(R.map(r => -M.sum(r.map(v => (v > 1e-300 ? v * Math.log(v) : 0)))));
      ro.set(`$\\sigma = ${st.sig.toFixed(3)}$ ⇒ $\\beta = \\frac1{2\\sigma^2} = ${b < 100 ? b.toFixed(3) : b.toExponential(2)}$ · itérations EM (moyennes seules) : ${st.t}<br>Points affectés à plus de 99 % à un seul groupe : <b>${sure} / ${st.X.length}</b> · entropie moyenne $\\frac1N\\sum_nH(r_n)$ = ${f3(H)} (max $\\ln 3\\approx1{,}099$)<br><span class="c-dim">Avec $\\pi_k$ égaux et la même $\\sigma^2I$ partout, l'étape E du GMM est <b>exactement</b> l'affectation du soft k-means avec $\\beta = 1/(2\\sigma^2)$, et l'étape M sur les moyennes est sa mise à jour. Diminue $\\sigma$ : la courbe bleue devient la marche grise, le plan se découpe en cellules de Voronoï, et ▶ fait exactement le k-means.</span>`);
      P.request(); Cp.request();
    }
    upd();
  });
})(window.ML);
