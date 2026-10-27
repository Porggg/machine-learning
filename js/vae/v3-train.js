/* Chapitre 7 — §6–7 : Monte-Carlo et astuce de reparamétrisation, KL gaussienne en forme close, entraînement d'un VAE */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, V = ML.vae;
  const zCol = z => M.ramp(0.12 + 0.8 * (z + 2.5) / 5);

  // ------------------------------------------------------------------ vae-mc
  ML.scene('vae-mc', host => {
    const W = ML.widget(host, {
      title: 'Estimer $\\frac{\\partial}{\\partial\\mu}\\E_{z\\sim\\mathcal N(\\mu,\\sigma^2)}[f(z)]$ avec $K$ échantillons : naïf, reparamétrisation, score (slides 22–24)', tag: '2D',
      views: [{ name: 'f', label: 'la fonction $f$ (le « $\\log p_\\theta(x\\mid z)$ ») et la loi $q = \\mathcal N(\\mu,\\sigma^2)$ ; les $K$ échantillons d\'un tirage', cls: 'tall' }, { name: 'h', label: 'histogramme de 2000 estimations du gradient (chacune avec $K$ échantillons)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#83c167"></i>vraie valeur</span><span class="key"><i style="background:#58c4dd"></i>reparamétrisation $\\frac1K\\sum_kf\'(\\mu+\\sigma\\varepsilon_k)$</span><span class="key"><i style="background:#f0ac5f"></i>score $\\frac1K\\sum_kf(z_k)\\frac{z_k-\\mu}{\\sigma^2}$ (hors slides)</span><span class="key"><i style="background:#fc6255"></i>naïf : 0</span>',
    });
    const F = {
      quad: { label: 'f(z) = −2 (z − 1.5)²  (log-vraisemblance gaussienne, à constante près)', f: z => -2 * (z - 1.5) ** 2, df: z => -4 * (z - 1.5), E: (m, s) => -2 * ((m - 1.5) ** 2 + s * s), dE: (m) => -4 * (m - 1.5) },
      sin: { label: 'f(z) = sin 3z', f: z => Math.sin(3 * z), df: z => 3 * Math.cos(3 * z), E: (m, s) => Math.sin(3 * m) * Math.exp(-4.5 * s * s), dE: (m, s) => 3 * Math.cos(3 * m) * Math.exp(-4.5 * s * s) },
    };
    const st = { f: 'quad', mu: 0, ls: Math.log(0.6), K: 5, seed: 1, rep: [], sco: [], one: [] };
    const P = new ML.Plot2D(W.views.f, { xlim: [-3, 4], ylim: [-6, 2], gridStep: [1, 1] });
    const Hh = new ML.Plot2D(W.views.h, { xlim: [-15, 15], ylim: [0, 1], gridStep: [5, 0.25], tickFmt: (v, ax) => (ax === 'x' ? String(+v.toFixed(1)) : '') });
    const run = () => {
      const r = M.rng(st.seed), s = Math.exp(st.ls), Fn = F[st.f]; st.rep = []; st.sco = [];
      for (let n = 0; n < 2000; n++) {
        let a = 0, b = 0; const one = [];
        for (let k = 0; k < st.K; k++) { const e = r.n(), z = st.mu + s * e; a += Fn.df(z); b += Fn.f(z) * (z - st.mu) / (s * s); if (n === 0) one.push(z); }
        st.rep.push(a / st.K); st.sco.push(b / st.K); if (n === 0) st.one = one;
      }
    };
    P.onDraw = p => {
      const Fn = F[st.f], s = Math.exp(st.ls), [y0, y1] = P.ylim;
      p.fn(z => y0 + (y1 - y0) * 0.9 * V.npdf(z, st.mu, s) / V.npdf(0, 0, s) * 0.5, { color: C.yellow, width: 2, fillArea: C.yellow, fillAlpha: 0.1 });
      p.fn(Fn.f, { color: '#fff', width: 2.5 });
      st.one.forEach(z => { p.point(z, Fn.f(z), { color: C.blue, r: 5 }); const d = Fn.df(z); p.seg(z - 0.35, Fn.f(z) - 0.35 * d, z + 0.35, Fn.f(z) + 0.35 * d, { color: C.blue, width: 1.5 }); });
      p.tex('f', P.xlim[1] - 0.1, Fn.f(P.xlim[1] - 0.4), 'f(z)', { anchor: 'right', dy: -14, size: 13 });
    };
    Hh.onDraw = p => {
      const Fn = F[st.f], s = Math.exp(st.ls), tv = Fn.dE(st.mu, s), [a, b] = Hh.xlim, nb = 60, bw = (b - a) / nb;
      const hist = arr => { const h = new Array(nb).fill(0); arr.forEach(v => { const i = Math.floor((v - a) / bw); if (i >= 0 && i < nb) h[i]++; }); return h; };
      const h1 = hist(st.rep), h2 = hist(st.sco), mx = Math.max(...h1, ...h2, 1);
      h2.forEach((k, i) => k && p.rect(a + i * bw, 0, a + (i + 1) * bw, 0.95 * k / mx, { color: C.gold, fill: C.gold, fillAlpha: 0.35, width: 0.8 }));
      h1.forEach((k, i) => k && p.rect(a + i * bw, 0, a + (i + 1) * bw, 0.95 * k / mx, { color: C.blue, fill: C.blue, fillAlpha: 0.45, width: 0.8 }));
      p.vline(tv, { color: C.green, width: 2.5 });
      p.vline(0, { color: C.red, width: 2, dash: [5, 4] });
    };
    const c = W.controls;
    ui.select(c, { label: 'fonction $f$', value: st.f, options: Object.entries(F).map(([k, v]) => [k, v.label]), onChange: v => { st.f = v; P.setLimits([-3, 4], v === 'quad' ? [-6, 2] : [-1.6, 1.6]); upd(); } });
    ui.slider(c, { label: 'moyenne $\\mu$ (sortie de l\'encodeur)', min: -2, max: 3, step: 0.01, value: st.mu, digits: 2, onInput: v => { st.mu = v; upd(); } });
    ui.slider(c, { label: '$\\ln\\sigma$', min: -2.5, max: 0.7, step: 0.01, value: st.ls, digits: 2, onInput: v => { st.ls = v; upd(); } });
    ui.select(c, { label: 'nombre d\'échantillons $K$', value: String(st.K), options: [['1', 'K = 1'], ['5', 'K = 5'], ['20', 'K = 20'], ['100', 'K = 100']], onChange: v => { st.K = +v; upd(); } });
    ui.buttons(c, [{ label: 'nouveaux tirages', primary: true, onClick: () => { st.seed++; upd(); } }]);
    const ro = ui.readout(c);
    const ms = arr => { const m = M.mean(arr); return [m, Math.sqrt(M.mean(arr.map(v => (v - m) ** 2)))]; };
    function upd() {
      run();
      const Fn = F[st.f], s = Math.exp(st.ls), tv = Fn.dE(st.mu, s), [m1, s1] = ms(st.rep), [m2, s2] = ms(st.sco);
      const half = Math.max(4 * s2, 4 * s1, Math.abs(tv) * 1.3, 0.5);
      Hh.setLimits([tv - half, tv + half], [0, 1]);
      const mcE = M.mean(st.one.map(Fn.f));
      ro.set(`Vraie valeur $\\partial_\\mu\\E[f]$ = <b style="color:#83c167">${tv.toFixed(3)}</b><br>reparamétrisation : moyenne <b style="color:#58c4dd">${m1.toFixed(3)}</b>, écart-type ${s1.toFixed(3)} · score : moyenne <b style="color:#f0ac5f">${m2.toFixed(3)}</b>, écart-type ${s2.toFixed(3)} · naïf : 0<br>Un tirage : $\\frac1K\\sum_kf(z_k)$ = ${mcE.toFixed(3)} contre $\\E[f]$ = ${Fn.E(st.mu, s).toFixed(3)}<br><span class="c-dim">Les deux estimateurs sont sans biais (histogrammes centrés sur la vraie valeur), mais celui de la reparamétrisation varie bien moins : il utilise la <b>pente</b> $f'$, alors que l'estimateur du score ne voit que les valeurs $f(z_k)$. L'estimateur naïf (échantillons figés, slide 23) vaut 0 : il est faux dès que la vraie valeur n'est pas nulle.</span>`);
      P.request(); Hh.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ vae-kl
  ML.scene('vae-kl', host => {
    const W = ML.widget(host, {
      title: '$\\mathrm{KL}\\big(\\mathcal N(\\mu,\\sigma^2)\\,\\|\\,\\mathcal N(0,1)\\big) = \\frac12(\\mu^2+\\sigma^2-1-2\\ln\\sigma)$ (slide 25)', tag: '2D',
      views: [{ name: 'd', label: 'les deux densités et l\'intégrande $q\\log\\frac qp$', cls: 'tall' }, { name: 'm', label: 'carte de la KL dans le plan $(\\mu,\\ln\\sigma)$ : nulle seulement en $(0,0)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$q = \\mathcal N(\\mu,\\sigma^2)$</span><span class="key"><i style="background:#888"></i>$p = \\mathcal N(0,1)$</span><span class="key"><i style="background:#fc6255"></i>$q\\log\\frac qp$</span>',
    });
    const st = { mu: 1, ls: Math.log(0.5) };
    const kl = (m, ls) => 0.5 * (m * m + Math.exp(2 * ls) - 1 - 2 * ls);
    const P = new ML.Plot2D(W.views.d, { xlim: [-4, 4], ylim: [-0.4, 1.0], gridStep: [1, 0.2] });
    const Q = new ML.Plot2D(W.views.m, { xlim: [-3, 3], ylim: [-2.5, 1.2], xlabel: '\\mu', ylabel: '\\ln\\sigma', gridStep: [1, 0.5] });
    P.onDraw = p => {
      const s = Math.exp(st.ls);
      p.fn(z => { const q = V.npdf(z, st.mu, s); return q < 1e-12 ? 0 : q * Math.log(q / V.npdf(z, 0, 1)); }, { color: C.red, width: 1.8, fillArea: C.red, fillAlpha: 0.2 });
      p.fn(z => V.npdf(z, 0, 1), { color: '#aaa', width: 2, dash: [5, 4] });
      p.fn(z => V.npdf(z, st.mu, s), { color: C.yellow, width: 2.5 });
    };
    Q.onDraw = p => {
      p.heatmap((m, l) => kl(m, l), v => M.rampRgb(Math.min(1, Math.sqrt(v / 4))).map(c => c * 0.75), { res: 4, key: 'kl' });
      p.contour((m, l) => kl(m, l), [0.1, 0.5, 1, 2, 3], { color: '#fff', width: 1, alpha: 0.5 });
      p.point(0, 0, { color: C.green, r: 5 });
      p.point(st.mu, st.ls, { color: C.yellow, r: 7, glow: true });
    };
    Q.addDraggable({ get: () => [st.mu, st.ls], set: (m, l) => { st.mu = M.clamp(m, -3, 3); st.ls = M.clamp(l, -2.5, 1.2); sM.set(st.mu); sL.set(st.ls); upd(); }, r: 14 });
    const c = W.controls;
    const sM = ui.slider(c, { label: '$\\mu$', min: -3, max: 3, step: 0.01, value: st.mu, digits: 2, onInput: v => { st.mu = v; upd(); } });
    const sL = ui.slider(c, { label: '$\\ln\\sigma$', min: -2.5, max: 1.2, step: 0.01, value: st.ls, digits: 2, onInput: v => { st.ls = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const s = Math.exp(st.ls); let num = 0;
      V.ZGRID.forEach(z => { const q = V.npdf(z, st.mu, s); if (q > 1e-300) num += q * Math.log(q / V.npdf(z, 0, 1)) * V.DZ; });
      ro.set(`Forme close : <b>${kl(st.mu, st.ls).toFixed(4)}</b> · intégrale numérique : ${num.toFixed(4)}<br>Terme de position $\\frac12\\mu^2$ = ${(0.5 * st.mu * st.mu).toFixed(3)} · terme de largeur $\\frac12(\\sigma^2-1-2\\ln\\sigma)$ = ${(0.5 * (s * s - 1 - 2 * st.ls)).toFixed(3)} (toujours $\\ge0$)<br><span class="c-dim">Dans le VAE, ce terme tire chaque $q_\\phi(z\\mid x)$ vers $\\mathcal N(0,1)$ : moyenne vers 0, écart-type vers 1. Un code très précis ($\\sigma\\to0$) coûte $-\\ln\\sigma\\to\\infty$ : c'est ce qui empêche le VAE de devenir un autoencodeur déterministe.</span>`);
      P.request(); Q.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ vae-train
  ML.scene('vae-train', host => {
    const W = ML.widget(host, {
      title: 'Entraîner un VAE ($x\\in\\R^2$, $z\\in\\R$) en direct : maximiser $\\hat{\\mathcal L}_1 = \\log p_\\theta(x\\mid z)-\\mathrm{KL}(q_\\phi(z\\mid x)\\,\\|\\,p(z))$ (slides 20–27)', tag: '2D',
      views: [{ name: 'x', label: 'espace des données : courbe $z\\mapsto\\mu_\\theta(z)$ pour $z\\in[-3,3]$, échantillons générés depuis $p(z)$', cls: 'tall' }, { name: 'z', label: 'espace latent : $p(z)$, encodages $q_\\phi(z\\mid x)$ de 5 points, et leur moyenne sur tout le jeu', cls: 'tall' }, { name: 'c', label: 'au fil de l\'entraînement : ELBO moyenne, terme de reconstruction, terme KL', cls: 'short' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\mu_\\theta(z)$, couleur = $z$</span><span class="key"><i style="background:#ff8fb1"></i>générés : $z\\sim\\mathcal N(0,1)$, $x\\sim p_\\theta(x\\mid z)$</span><span class="key"><i style="background:#888"></i>$p(z)$</span><span class="key"><i style="background:#fff"></i>$\\frac1N\\sum_nq_\\phi(z\\mid x_n)$</span>',
    });
    const MODES = { vae: ['VAE : ELBO complète', 1, false], nokl: ['sans terme KL (encodeur aléatoire)', 0, false], ae: ['autoencodeur déterministe (pas de KL, pas de bruit)', 0, true] };
    const st = { kind: 'arc', mode: 'vae', it: 0, seed: 1, hist: [] };
    let X, net, rng, marks, gen;
    W.toggle('gen', 'échantillons générés depuis $p(z)$', true);
    W.toggle('rec', 'reconstructions des 5 points marqués', true);
    W.toggle('agg', 'moyenne des encodages $\\frac1N\\sum_nq_\\phi(z\\mid x_n)$', true);
    const MCOL = [C.red, C.green, C.purple, C.teal, C.pink];
    const reset = () => {
      X = V.data(st.kind, 300, 3); net = new V.Net(st.seed); rng = M.rng(st.seed + 20); st.it = 0; st.hist = [];
      const r = M.rng(8); marks = [0, 1, 2, 3, 4].map(() => r.int(X.length));
      const g = M.rng(31); gen = M.range(250).map(() => [g.n(), g.n(), g.n()]);
    };
    const Px = new ML.Plot2D(W.views.x, { xlim: [-3.4, 3.4], ylim: [-3.4, 3.4], gridStep: [1, 1] });
    const Pz = new ML.Plot2D(W.views.z, { xlim: [-4, 4], ylim: [-0.05, 1.2], gridStep: [1, 0.25] });
    const Pc = new ML.Plot2D(W.views.c, { xlim: [0, 100], ylim: [-4, 4], xlabel: '\\text{itér.}', gridStep: [500, 1] });
    Px.onDraw = p => {
      X.forEach(x => p.point(x[0], x[1], { color: '#9a9a9a', r: 2.4 }));
      for (let i = 0; i < 120; i++) { const z0 = -3 + 6 * i / 120, a = net.decode(z0).mu, b = net.decode(z0 + 6 / 120).mu; p.seg(a[0], a[1], b[0], b[1], { color: zCol(z0), width: 3 }); }
      const sx = net.sigmaX();
      if (W.show.gen) gen.forEach(([z, e1, e2]) => { const m = net.decode(z).mu; p.point(m[0] + sx[0] * e1, m[1] + sx[1] * e2, { color: '#ff8fb1', r: 2.3, alpha: 0.85 }); });
      marks.forEach((i, k) => {
        const x = X[i]; p.point(x[0], x[1], { color: MCOL[k], r: 6, hollow: true, width: 2.5 });
        if (W.show.rec) { const r = net.decode(net.encode(x).mu).mu; p.seg(x[0], x[1], r[0], r[1], { color: MCOL[k], width: 1.5, dash: [3, 3] }); p.point(r[0], r[1], { color: MCOL[k], shape: 'cross', r: 5 }); }
      });
    };
    Pz.onDraw = p => {
      p.fn(z => V.npdf(z, 0, 1), { color: '#999', width: 2, dash: [5, 4] });
      const enc = X.map(x => net.encode(x));
      if (W.show.agg) p.fn(z => M.mean(enc.map(e => V.npdf(z, e.mu, Math.exp(e.ls)))), { color: '#fff', width: 2, samples: 200 });
      marks.forEach((i, k) => { const e = enc[i], s = Math.exp(e.ls), h = V.npdf(0, 0, s); const sc = Math.min(1, 1.1 / h); p.fn(z => sc * V.npdf(z, e.mu, s), { color: MCOL[k], width: 2, samples: 300 }); });
      // les codes μ_z(x_n) en tapis, colorés comme la courbe
      enc.forEach(e => p.seg(e.mu, -0.05, e.mu, -0.015, { color: zCol(e.mu), width: 1.2, alpha: 0.7 }));
    };
    Pc.onDraw = p => {
      const H = st.hist; if (H.length < 2) return;
      p.polyline(H.map(h => [h.it, h.elbo]), { color: C.yellow, width: 2.5 });
      p.polyline(H.map(h => [h.it, -h.rec]), { color: C.blue, width: 1.8 });
      p.polyline(H.map(h => [h.it, h.kl]), { color: C.red, width: 1.8 });
      const last = H[H.length - 1];
      p.tex('e', last.it, last.elbo, '\\text{ELBO}', { color: C.yellow, anchor: 'right', dy: -10, size: 12 });
      p.tex('r', last.it, -last.rec, '\\E_q[\\log p_\\theta(x|z)]', { color: C.blue, anchor: 'right', dy: -10, size: 12 });
      p.tex('k', last.it, last.kl, '\\mathrm{KL}', { color: C.red, anchor: 'right', dy: 12, size: 12 });
    };
    const train = n => {
      const [, beta, det] = MODES[st.mode];
      for (let k = 0; k < n; k++) { const idx = M.range(32).map(() => rng.int(X.length)); net.step(X, idx, rng, { lr: 0.01, beta, deterministic: det, freeze: det ? ['a2', 'c2'] : [] }); st.it++; }
      const e = net.elbo(X, 2); st.hist.push({ it: st.it, ...e });
    };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: V.DATA, onChange: v => { st.kind = v; reset(); upd(); } });
    ui.select(c, { label: 'objectif', value: st.mode, options: Object.entries(MODES).map(([k, v]) => [k, v[0]]), onChange: v => { st.mode = v; reset(); upd(); } });
    ui.player(c, { speed: 6, step: () => { train(25); upd(); return st.it < 8000; }, reset: () => { st.seed++; reset(); upd(); } });
    ui.buttons(c, [{ label: '+2000 itérations', onClick: () => { for (let k = 0; k < 80; k++) train(25); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      const H = st.hist, last = H[H.length - 1] || net.elbo(X, 2);
      if (H.length > 1) { const ys = H.flatMap(h => [h.elbo, -h.rec, h.kl]).filter(isFinite), lo = Math.max(-12, Math.min(...ys)), hi = Math.min(12, Math.max(...ys)); Pc.setLimits([0, Math.max(100, st.it)], [lo - 0.3, hi + 0.3]); }
      const enc = X.map(x => net.encode(x)), sz = M.mean(enc.map(e => Math.exp(e.ls))), mz = M.mean(enc.map(e => e.mu)), vz = M.mean(enc.map(e => (e.mu - mz) ** 2)), sx = net.sigmaX();
      const msg = { vae: 'Les encodages restent groupés autour de $\\mathcal N(0,1)$ (la courbe blanche suit la grise) : tirer $z\\sim p(z)$ tombe là où le décodeur a appris quelque chose, et les points roses ressemblent aux données.', nokl: 'Sans le terme KL, rien ne retient les codes : leur échelle grandit, $\\sigma_z$ rétrécit, et la courbe blanche s\'éloigne de $p(z)$. Les échantillons tirés depuis $p(z)$ ne couvrent plus qu\'une partie des données.', ae: 'Autoencodeur classique : un point par $x$, aucune loi sur $z$. La reconstruction est bonne, mais $p(z)$ ne correspond à rien : générer en tirant $z\\sim\\mathcal N(0,1)$ n\'a pas de sens (slide 29).' }[st.mode];
      ro.set(`Itération ${st.it} · ELBO moyenne <b style="color:#f4d345">${last.elbo.toFixed(3)}</b> = reconstruction ${(-last.rec).toFixed(3)} − KL ${last.kl.toFixed(3)}<br>codes : moyenne ${mz.toFixed(2)}, variance des $\\mu_z$ ${vz.toFixed(2)}, $\\sigma_z$ moyen ${sz.toFixed(3)} · $\\sigma_x = (${sx[0].toFixed(3)},\\ ${sx[1].toFixed(3)})$<br><span class="c-dim">${msg} Ici $K = 1$ échantillon par point, mini-batchs de 32, Adam ; $\\sigma_x$ est un paramètre appris partagé (simplification : dans les slides, le décodeur le sort pour chaque $z$).</span>`);
      Px.request(); Pz.request(); Pc.request();
    }
    reset(); upd();
  });
})(window.ML);
