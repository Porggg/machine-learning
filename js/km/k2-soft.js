/* Chapitre 9 — §4–5 : soft k-means (exemple 1D des slides), mélange de gaussiennes 1D, distance euclidienne contre distance propre à chaque groupe */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, K = ML.km;
  const f2 = v => v.toFixed(2), f3 = v => v.toFixed(3);

  // ------------------------------------------------------------------ km-soft
  ML.scene('km-soft', host => {
    const W = ML.widget(host, {
      title: 'Affectations dures ou souples : le point en 4 peut-il tirer le centre en 0 ? (slides 14, 16–18)', tag: '1D',
      views: [{ name: 'l', label: 'données $x_i$ (barres : $r_{i1}$ en bleu, $r_{i2}$ en rouge), centres $\\mu_1,\\mu_2$ et leurs positions passées', cls: 'tall' },
        { name: 'r', label: 'affectation $r_1(x)$ d\'un point placé en $x$, pour les centres actuels', cls: 'short' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>groupe 1</span><span class="key"><i style="background:#fc6255"></i>groupe 2</span><span class="key"><i style="background:#888"></i>positions précédentes des centres</span>',
    });
    const DATA = { slide: [0, 4, 10], two: [-1, 0, 0.6, 1.5, 4, 7.5, 8.6, 9.4, 10.3] };
    const st = { data: 'slide', mode: 'soft', beta: 0.1, m0: [0, 4], mu: null, t: 0, path: [], done: false };
    const X = () => DATA[st.data];
    const resp = x => (st.mode === 'hard' ? (Math.abs(x - st.mu[0]) <= Math.abs(x - st.mu[1]) ? [1, 0] : [0, 1]) : K.softRow([x, 0], st.mu.map(m => [m, 0]), st.beta));
    const L = new ML.Plot2D(W.views.l, { xlim: [-2, 12], ylim: [-0.75, 1.45], gridStep: [2, 0.5] });
    const Rp = new ML.Plot2D(W.views.r, { xlim: [-2, 12], ylim: [-0.05, 1.08], gridStep: [2, 0.5], xlabel: 'x' });
    L.onDraw = p => {
      p.hline(0, { color: '#555', width: 1 });
      st.path.forEach((m, j) => m.forEach((v, k) => p.point(v, -0.42, { color: '#888', r: 3, alpha: 0.3 + 0.7 * (j + 1) / st.path.length })));
      X().forEach((x, i) => {
        const r = resp(x), w = 0.16;
        p.rect(x - w, 0.12, x + w, 0.12 + r[0], { color: C.blue, fill: C.blue, fillAlpha: 0.75, width: 1 });
        p.rect(x - w, 0.12 + r[0], x + w, 1.12, { color: C.red, fill: C.red, fillAlpha: 0.75, width: 1 });
        p.point(x, 0, { color: K.mixHex(r), r: 6, stroke: '#fff', strokeWidth: 1.5 });
        if (st.data === 'slide') p.tex('x' + i, x, 1.12, `r_{${i + 1}1} = ${f2(r[0])}`, { color: '#ccc', dy: -12, size: 12 });
      });
      st.mu.forEach((m, k) => { p.point(m, -0.42, { shape: 'cross', color: K.COL[k], r: 9, width: 3.5 }); p.tex('m' + k, m, -0.42, `\\mu_${k + 1} = ${f2(m)}`, { color: K.COL[k], dy: 20, size: 13 }); });
    };
    Rp.onDraw = p => {
      p.hline(0.5, { color: '#555', width: 1, dash: [4, 4] });
      p.fn(x => resp(x)[0], { color: C.blue, width: 2.5 });
      X().forEach(x => p.point(x, resp(x)[0], { color: '#fff', r: 4 }));
      st.mu.forEach((m, k) => p.vline(m, { color: K.COL[k], width: 1, dash: [3, 4] }));
    };
    const reset = () => { st.mu = st.m0.slice(); st.t = 0; st.path = [st.mu.slice()]; st.done = false; upd(); };
    const step = () => {
      if (st.done) return false;
      const xs = X(), R = xs.map(resp), mu = st.mu.map((m, k) => { const n = M.sum(R.map(r => r[k])); return n > 1e-12 ? M.sum(xs.map((x, i) => R[i][k] * x)) / n : m; });
      const ch = Math.max(...mu.map((v, k) => Math.abs(v - st.mu[k])));
      st.mu = mu; st.t++; st.path.push(mu.slice()); if (st.path.length > 40) st.path.shift();
      if (ch < 1e-6) st.done = true;
      upd(); return !st.done;
    };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.data, options: [['slide', 'slide 14 : x = 0, 4, 10'], ['two', '9 points en deux groupes']], onChange: v => { st.data = v; reset(); } });
    ui.select(c, { label: 'affectations', value: st.mode, options: [['hard', 'dures : k-means'], ['soft', 'souples : soft k-means']], onChange: v => { st.mode = v; reset(); } });
    ui.slider(c, { label: 'raideur $\\beta$ (soft)', min: -2, max: 1, value: st.beta, log: true, fmt: v => (v < 0.1 ? v.toFixed(3) : v.toFixed(2)), onInput: v => { st.beta = v; reset(); } });
    ui.slider(c, { label: 'départ $\\mu_1^{(0)}$', min: -2, max: 12, step: 0.1, value: 0, digits: 1, onInput: v => { st.m0[0] = v; reset(); } });
    ui.slider(c, { label: 'départ $\\mu_2^{(0)}$', min: -2, max: 12, step: 0.1, value: 4, digits: 1, onInput: v => { st.m0[1] = v; reset(); } });
    ui.player(c, { speed: 3, step, reset });
    ui.buttons(c, [{ label: 'aller à la convergence', onClick: () => { for (let i = 0; i < 2000 && step(); i++); } }]);
    const ro = ui.readout(c);
    function upd() {
      const xs = X(), R = xs.map(resp);
      const tail = st.mode === 'hard'
        ? 'Chaque point ne met à jour <b>que</b> son centre : le point en 4, plus proche de 7 que de 0, ne tire jamais $\\mu_1$. Sur la slide 14, l\'algorithme reste bloqué en $(0, 7)$.'
        : `$r_{ik}\\propto e^{-\\beta\\|x_i-\\mu_k\\|^2}$ : tous les points tirent tous les centres, avec des poids. Avec $\\beta = 0{,}1$ (slide 18) : $\\mu\\approx(1{,}95;\\ 9{,}67)$ et $r_{21}\\approx0{,}94$. Grand $\\beta$ : on retrouve le k-means dur ; $\\beta\\to0$ : $r_{ik}\\to\\frac12$ et les deux centres se confondent avec la moyenne.`;
      ro.set(`Itération ${st.t}${st.done ? ' · <b class="c-green">point fixe atteint</b>' : ''} · $\\mu_1$ = <b>${f3(st.mu[0])}</b>, $\\mu_2$ = <b>${f3(st.mu[1])}</b><br>${st.data === 'slide' ? xs.map((x, i) => `$x_${i + 1} = ${x}$ : $r_{${i + 1}1} = ${f3(R[i][0])}$`).join(' · ') : 'Groupe 1 : ' + f2(M.sum(R.map(r => r[0]))) + ' points (comptés avec leurs poids)'}<br><span class="c-dim">${tail}</span>`);
      L.request(); Rp.request();
    }
    reset();
  });

  // ------------------------------------------------------------------ gmm-mix
  ML.scene('gmm-mix', host => {
    const W = ML.widget(host, {
      title: 'Un mélange de gaussiennes 1D : $p(x) = \\sum_k\\pi_k\\,\\mathcal N(x\\mid\\mu_k,\\sigma_k^2)$ et son tirage en deux temps (slides 20–21)', tag: '1D',
      views: [{ name: 'p', label: 'composantes pondérées $\\pi_k\\mathcal N(x\\mid\\mu_k,\\sigma_k^2)$ (pointillés), densité du mélange (blanc), histogramme des tirages', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>composante 1</span><span class="key"><i style="background:#fc6255"></i>composante 2</span><span class="key"><i style="background:#83c167"></i>composante 3</span><span class="key"><i style="background:#fff"></i>$p(x)$</span>',
    });
    const st = { c: [{ pi: 0.5, mu: -2, v: 0.5 }, { pi: 0.2, mu: 1, v: 2 }, { pi: 0.3, mu: 4, v: 1 }], sel: 0, S: [], seed: 1 };
    W.toggle('comp', 'composantes pondérées', true); W.toggle('hist', 'histogramme des tirages', true);
    const dens = x => M.sum(st.c.map(q => q.pi * K.npdf(x, q.mu, q.v)));
    const P = new ML.Plot2D(W.views.p, { xlim: [-6, 9], ylim: [0, 0.42], gridStep: [1, 0.05], xlabel: 'x' });
    const BW = 0.25;
    P.onDraw = p => {
      if (W.show.hist && st.S.length) {
        const n = st.S.length, cnt = {};
        st.S.forEach(([x, z]) => { const b = Math.floor(x / BW); (cnt[b] = cnt[b] || [0, 0, 0])[z]++; });
        for (const b in cnt) { let y = 0; cnt[b].forEach((v, z) => { if (!v) return; const h = v / (n * BW); p.rect(b * BW, y, (+b + 1) * BW, y + h, { color: K.COL[z], fill: K.COL[z], fillAlpha: 0.45, width: 0.6 }); y += h; }); }
      }
      if (W.show.comp) st.c.forEach((q, k) => p.fn(x => q.pi * K.npdf(x, q.mu, q.v), { color: K.COL[k], width: k === st.sel ? 2.5 : 1.6, dash: [6, 4] }));
      p.fn(dens, { color: '#fff', width: 3 });
      st.c.forEach((q, k) => p.tex('l' + k, q.mu, q.pi * K.npdf(q.mu, q.mu, q.v), `\\pi_${k + 1}\\mathcal N_${k + 1}`, { color: K.COL[k], dy: -14, size: 13 }));
    };
    const c = W.controls;
    ui.select(c, { label: 'composante réglée', value: '0', options: [['0', 'composante 1'], ['1', 'composante 2'], ['2', 'composante 3']], onChange: v => { st.sel = +v; sPi.set(st.c[st.sel].pi); sMu.set(st.c[st.sel].mu); sV.set(st.c[st.sel].v); upd(); } });
    const sPi = ui.slider(c, { label: 'poids $\\pi_k$ (les autres sont remis à l\'échelle)', min: 0.02, max: 0.96, step: 0.01, value: 0.5, digits: 2, onInput: v => { const o = st.c.filter((_, k) => k !== st.sel), rest = M.sum(o.map(q => q.pi)); o.forEach(q => { q.pi = (1 - v) * (rest > 0 ? q.pi / rest : 1 / o.length); }); st.c[st.sel].pi = v; st.S = []; upd(); } });
    const sMu = ui.slider(c, { label: 'moyenne $\\mu_k$', min: -5, max: 8, step: 0.05, value: -2, digits: 2, onInput: v => { st.c[st.sel].mu = v; st.S = []; upd(); } });
    const sV = ui.slider(c, { label: 'variance $\\sigma_k^2$', min: -1.3, max: 0.7, value: 0.5, log: true, fmt: v => v.toFixed(2), onInput: v => { st.c[st.sel].v = v; st.S = []; upd(); } });
    ui.buttons(c, [
      { label: 'tirer 500 points : $z\\sim\\mathrm{Cat}(\\pi)$, puis $x\\sim\\mathcal N(\\mu_z,\\sigma_z^2)$', primary: true, onClick: () => { const R = M.rng(st.seed++); for (let i = 0; i < 500; i++) { let u = R.u(), z = 0; while (z < 2 && u > st.c[z].pi) { u -= st.c[z].pi; z++; } st.S.push([st.c[z].mu + Math.sqrt(st.c[z].v) * R.n(), z]); } upd(); } },
      { label: 'effacer', onClick: () => { st.S = []; upd(); } },
      { label: 'exemple du livre MML', onClick: () => { st.c = [{ pi: 0.5, mu: -2, v: 0.5 }, { pi: 0.2, mu: 1, v: 2 }, { pi: 0.3, mu: 4, v: 1 }]; st.S = []; const q = st.c[st.sel]; sPi.set(q.pi); sMu.set(q.mu); sV.set(q.v); upd(); } },
    ]);
    const ro = ui.readout(c);
    function upd() {
      let modes = 0; const g = M.linspace(-8, 11, 1901).map(dens); for (let i = 1; i < g.length - 1; i++) if (g[i] > g[i - 1] && g[i] >= g[i + 1]) modes++;
      const cnt = [0, 0, 0]; st.S.forEach(([, z]) => cnt[z]++);
      ro.set(`$p(x) = ${st.c.map(q => `${f2(q.pi)}\\,\\mathcal N(x\\mid${f2(q.mu)},${f2(q.v)})`).join('+')}$<br>$\\sum_k\\pi_k = ${f2(M.sum(st.c.map(q => q.pi)))}$ · nombre de modes de $p$ : <b>${modes}</b>${st.S.length ? ` · ${st.S.length} tirages, dont ${cnt.join(' / ')} par composante` : ''}<br><span class="c-dim">La variable latente $z$ (quelle composante) n'est pas observée : on ne voit que l'histogramme global. Rapproche deux moyennes ou élargis une variance : le mélange peut n'avoir qu'un seul mode.</span>`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ gmm-dist
  ML.scene('gmm-dist', host => {
    const W = ML.widget(host, {
      title: 'Distance euclidienne ou distance propre à chaque groupe : à qui appartient $x_i$ ? (slides 15, 21–22)', tag: '2D',
      views: [{ name: 'e', label: 'distance euclidienne $d_k = \\|x_i-\\mu_k\\|$ : cercles par $x_i$, frontière = médiatrice', cls: 'tall', style: 'flex:1 1 100%;height:330px' }, { name: 'g', label: 'GMM : $d_k = \\sqrt{(x_i-\\mu_k)^\\top\\Sigma_k^{-1}(x_i-\\mu_k)}$, ellipses $d_k = 1, 2$, frontière $r_{i1} = \\frac12$', cls: 'tall', style: 'flex:1 1 100%;height:330px' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$x_i$ (à tirer, dans l\'une ou l\'autre figure)</span><span class="key"><i style="background:#fff"></i>frontière entre les deux groupes</span>',
    });
    const st = { x: [4, 0], mu: [[0, 0], [4, 1]], s1: 3.2, s2: 0.4, th: 0, s: 0.25, pi1: 0.5 };
    const S = () => [K.cov(st.s1, st.s2, st.th), K.cov(st.s, st.s, 0)];
    const r1 = (x, Ss) => { const a = Math.log(st.pi1) + K.logN(x, st.mu[0], Ss[0]), b = Math.log(1 - st.pi1) + K.logN(x, st.mu[1], Ss[1]); return 1 / (1 + Math.exp(b - a)); };
    const opt = { xlim: [-5, 7], ylim: [-3.2, 3.6], equal: true, gridStep: [1, 1] };
    const E = new ML.Plot2D(W.views.e, opt), G = new ML.Plot2D(W.views.g, opt);
    const pts = p => { st.mu.forEach((m, k) => { p.point(m[0], m[1], { shape: 'cross', color: K.COL[k], r: 8, width: 3.5 }); p.tex('m' + k, m[0], m[1], '\\mu_' + (k + 1), { color: K.COL[k], dx: -14, dy: -14, size: 14 }); }); p.point(st.x[0], st.x[1], { color: C.yellow, r: 6, glow: true }); p.tex('x', st.x[0], st.x[1], 'x_i', { color: C.yellow, dx: 14, dy: 14 }); };
    E.onDraw = p => {
      p.heatmapRGB((x, y) => K.RGB[K.nearest([x, y], st.mu)].map(v => v * 0.2), { res: 4 });
      const a = st.mu[0], b = st.mu[1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = ML.clipLine(m, [-(b[1] - a[1]), b[0] - a[0]], 8);
      if (L) p.seg(L[0][0], L[0][1], L[1][0], L[1][1], { color: '#fff', width: 2, dash: [7, 4] });
      st.mu.forEach((q, k) => { const d = Math.sqrt(K.d2(st.x, q)); p.circle(q[0], q[1], d, { color: K.COL[k], width: 1.5, dash: [4, 4] }); p.seg(q[0], q[1], st.x[0], st.x[1], { color: K.COL[k], width: 2 }); });
      pts(p);
    };
    G.onDraw = p => {
      const Ss = S();
      p.heatmapRGB((x, y) => { const r = r1([x, y], Ss); return K.mix([r, 1 - r], 0.24); }, { res: 4 });
      p.contour((x, y) => r1([x, y], Ss), [0.5], { color: '#fff', width: 2, res: 4 });
      Ss.forEach((Sk, k) => { [1, 2].forEach(cc => K.ellipse(p, st.mu[k], Sk, cc, { color: K.COL[k], width: cc === 1 ? 2 : 1.2 })); K.ellipse(p, st.mu[k], Sk, Math.sqrt(K.maha2(st.x, st.mu[k], Sk)), { color: K.COL[k], width: 1.2, dash: [4, 4] }); });
      pts(p);
    };
    [E, G].forEach(P => {
      P.addDraggable({ get: () => st.x, set: (x, y) => { st.x = [M.clamp(x, -4.8, 6.8), M.clamp(y, -3, 3.4)]; upd(); }, r: 16 });
      P.addDraggable({ get: () => st.mu[1], set: (x, y) => { st.mu[1] = [M.clamp(x, -4.8, 6.8), M.clamp(y, -3, 3.4)]; upd(); }, r: 14 });
    });
    const c = W.controls;
    ui.slider(c, { label: 'groupe 1 : écart-type le long du grand axe', min: 0.4, max: 4, step: 0.05, value: st.s1, digits: 2, onInput: v => { st.s1 = v; upd(); } });
    ui.slider(c, { label: 'groupe 1 : écart-type le long du petit axe', min: 0.15, max: 2, step: 0.05, value: st.s2, digits: 2, onInput: v => { st.s2 = v; upd(); } });
    ui.slider(c, { label: 'groupe 1 : orientation (degrés)', min: -90, max: 90, step: 1, value: 0, digits: 0, onInput: v => { st.th = v * Math.PI / 180; upd(); } });
    ui.slider(c, { label: 'groupe 2 : écart-type (rond)', min: 0.1, max: 2, step: 0.01, value: st.s, digits: 2, onInput: v => { st.s = v; upd(); } });
    ui.slider(c, { label: 'poids $\\pi_1$', min: 0.02, max: 0.98, step: 0.01, value: 0.5, digits: 2, onInput: v => { st.pi1 = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const Ss = S(), de = st.mu.map(m => Math.sqrt(K.d2(st.x, m))), dm = st.mu.map((m, k) => Math.sqrt(K.maha2(st.x, m, Ss[k]))), r = r1(st.x, Ss);
      ro.set(`Euclidien : $d_1 = ${f2(de[0])}$, $d_2 = ${f2(de[1])}$ ⇒ affecté au <b style="color:${K.COL[de[0] <= de[1] ? 0 : 1]}">groupe ${de[0] <= de[1] ? 1 : 2}</b><br>GMM : $d_1 = ${f2(dm[0])}$, $d_2 = ${f2(dm[1])}$ ⇒ $r_{i1} = ${f3(r)}$, $r_{i2} = ${f3(1 - r)}$<br><span class="c-dim">Réglage initial = slide 22 : $x_i$ est 4 fois plus loin de $\\mu_1$ que de $\\mu_2$, mais il est dans l'axe du groupe 1, très étalé ($d_1 = 1{,}25$), alors que le groupe 2 est serré ($d_2 = 4$). Le GMM donne $r_{i1}\\approx0{,}985$. Le facteur $|\\Sigma_k|^{-1/2}$ et les poids $\\pi_k$ comptent aussi : la frontière n'est plus une droite.</span>`);
      E.request(); G.request();
    }
    upd();
  });
})(window.ML);
