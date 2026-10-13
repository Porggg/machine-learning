/* Chapitre 6 — Apprentissage en ligne · §4–6 : weighted majority, exponential weighting, borne de regret */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, OL = ML.ol;
  const ENV_OPTS = [['iid', 'stationnaire'], ['shift', 'changement à mi-parcours'], ['cycle', 'le meilleur change 4 fois'], ['adv', 'adversaire adaptatif (non anticipant)']];
  const mkEnv = (kind, K, T, seed) => (kind === 'adv' ? OL.advEnv(K, T, seed) : OL.env(kind, K, T, seed));

  // ------------------------------------------------------------------ ol-wm
  ML.scene('ol-wm', host => {
    const W = ML.widget(host, {
      title: 'Weighted Majority (déterministe) : vote pondéré et pénalité $\\beta$ (slides 16–17)', tag: '2D',
      views: [{ name: 'v', label: 'tour $t$ : poids des experts et vote', cls: 'tall' }, { name: 'c', label: 'erreurs cumulées', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>erreurs de WM ($M_t$)</span><span class="key"><i style="background:#fff"></i>meilleur expert ($m^\\star_t$)</span><span class="key"><i style="background:#fc6255"></i>borne $\\frac{\\ln K+m^\\star\\ln(1/\\beta)}{\\ln(2/(1+\\beta))}$ (hors slides)</span>',
    });
    const st = { K: 5, T: 300, beta: 0.5, env: 'shift', adv: false, seed: 2, t: 0 };
    let env, hist;
    function simulate() {
      env = OL.env(st.env, st.K, st.T, st.seed);
      const w = new Array(st.K).fill(1), cum = new Array(st.K).fill(0); let Mt = 0; hist = [];
      for (let t = 0; t < st.T; t++) {
        const pr = env.pred[t]; let w1 = 0, w0 = 0; pr.forEach((v, i) => { if (v) w1 += w[i]; else w0 += w[i]; });
        const vote = w1 >= w0 ? 1 : 0, y = st.adv ? 1 - vote : env.y[t];
        const L = pr.map(v => (v === y ? 0 : 1));
        const mistake = vote !== y;
        hist.push({ w: w.slice(), w1, w0, vote, y, pr, M: Mt + (mistake ? 1 : 0), cum: cum.map((c, i) => c + L[i]) });
        if (mistake) { Mt++; for (let i = 0; i < st.K; i++) if (L[i]) w[i] *= st.beta; }
        for (let i = 0; i < st.K; i++) cum[i] += L[i];
      }
    }
    const bound = (m) => (Math.log(st.K) + m * Math.log(1 / st.beta)) / Math.log(2 / (1 + st.beta));
    const V = new ML.Plot2D(W.views.v, { xlim: [-0.5, 7.5], ylim: [-0.15, 1.25], grid: false, ticks: false, axes: false });
    const Cp = new ML.Plot2D(W.views.c, { xlim: [0, 300], ylim: [0, 200], xlabel: 't', gridStep: [50, 25] });
    V.onDraw = p => {
      const h = hist[st.t], Wt = M.sum(h.w);
      h.w.forEach((w, i) => {
        const x = i * (5.4 / Math.max(1, st.K - 1)), q = w / Wt;
        p.rect(x - 0.25, 0.1, x + 0.25, 0.1 + 0.9 * q, { color: OL.col(i), fill: OL.col(i), fillAlpha: 0.55, width: 1.3 });
        p.text(x, 0.03, OL.NAMES[i].slice(0, 9), { size: 10, color: OL.col(i) });
        p.text(x, 0.1 + 0.9 * q + 0.07, h.pr[i] ? '☂' : '☀', { size: 18, color: h.pr[i] ? '#9fc4ff' : C.gold });
      });
      // vote : barre empilée poids(1) / poids(0)
      const f1 = h.w1 / (h.w1 + h.w0);
      p.rect(6.6, 0.1, 7.2, 0.1 + 0.9 * f1, { color: '#9fc4ff', fill: '#9fc4ff', fillAlpha: 0.5 });
      p.rect(6.6, 0.1 + 0.9 * f1, 7.2, 1.0, { color: C.gold, fill: C.gold, fillAlpha: 0.5 });
      p.seg(6.5, 0.55, 7.3, 0.55, { color: '#fff', width: 1.5, dash: [3, 3] });
      p.text(6.9, 1.1, `vote : ${h.vote ? '☂' : '☀'}  vérité : ${h.y ? '☂' : '☀'}`, { size: 13, color: h.vote === h.y ? C.green : C.red });
    };
    Cp.onDraw = p => {
      const ts = M.range(st.T);
      p.polyline(ts.map(t => [t + 1, bound(Math.min(...hist[t].cum))]), { color: C.red, width: 1.6, dash: [6, 4] });
      p.polyline(ts.map(t => [t + 1, Math.min(...hist[t].cum)]), { color: '#fff', width: 2, dash: [7, 4] });
      p.polyline(ts.map(t => [t + 1, hist[t].M]), { color: C.yellow, width: 3 });
      p.vline(st.t + 1, { color: '#666', width: 1 });
    };
    const c = W.controls;
    ui.select(c, { label: 'environnement', value: st.env, options: ENV_OPTS.slice(0, 3), onChange: v => { st.env = v; recompute(); } });
    ui.check(c, { label: 'adversaire : $y_t$ = l\'inverse du vote (WM est déterministe)', value: st.adv, onChange: v => { st.adv = v; recompute(); } });
    ui.slider(c, { label: 'pénalité $\\beta$', min: 0.05, max: 0.95, step: 0.05, value: st.beta, digits: 2, onInput: v => { st.beta = v; recompute(); } });
    ui.slider(c, { label: 'experts $K$', min: 2, max: 12, step: 1, value: st.K, digits: 0, onInput: v => { st.K = Math.round(v); recompute(); } });
    const tS = ui.slider(c, { label: 'tour affiché $t$', min: 1, max: 300, step: 1, value: 1, digits: 0, onInput: v => { st.t = Math.round(v) - 1; upd(); } });
    ui.player(c, { speed: 10, step: () => { if (st.t >= st.T - 1) return false; st.t++; tS.set(st.t + 1); upd(); }, reset: () => { st.t = 0; st.seed++; recompute(); } });
    const ro = ui.readout(c);
    function recompute() { simulate(); st.t = Math.min(st.t, st.T - 1); Cp.setLimits([0, st.T], [0, Math.max(hist[st.T - 1].M, bound(Math.min(...hist[st.T - 1].cum))) * 1.08 + 2]); upd(); }
    function upd() {
      const h = hist[st.T - 1], ms = Math.min(...h.cum);
      ro.set(`Fin ($T = ${st.T}$) : WM a fait <b style="color:#f4d345">${h.M}</b> erreurs, le meilleur expert <b>${ms}</b> · borne : ${bound(ms).toFixed(1)}<br><span class="c-dim">${st.adv ? 'L\'adversaire connaît l\'algorithme : il calcule le vote et choisit l\'inverse. WM se trompe à <b>chaque</b> tour ($M_T = T$). Si l\'on ajoute les deux experts constants $h_{-1}$, $h_{+1}$ du §3, l\'un d\'eux a au plus $T/2$ erreurs : regret $\\ge T/2$ (slide 11).' : 'Une erreur de WM multiplie par $\\beta$ le poids de tous les experts qui se sont trompés (au moins la moitié du poids total) : la somme des poids fond, alors que celle du meilleur expert résiste.'}</span>`);
      V.request(); Cp.request();
    }
    recompute();
  });

  // ------------------------------------------------------------------ ol-decay
  ML.scene('ol-decay', host => {
    const W = ML.widget(host, {
      title: 'De $(1-\\eta)^{c}$ à $e^{-\\eta c}$ : deux façons de faire fondre un poids (slides 19–20)', tag: '2D',
      views: [{ name: 'p', label: 'poids d\'un expert en fonction de sa perte cumulée $c$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$(1-\\eta)^c$ (RWM)</span><span class="key"><i style="background:#f0ac5f"></i>$e^{-\\eta c}$ (EW)</span><span class="key"><i style="background:#888"></i>$e^{-(\\eta+\\eta^2)c}$ (minorant si $\\eta\\le\\frac12$)</span>',
    });
    const st = { eta: 0.3, all: false };
    const P = new ML.Plot2D(W.views.p, { xlim: [0, 10], ylim: [-0.03, 1.05], xlabel: 'c', gridStep: [2, 0.2] });
    P.onDraw = p => {
      const etas = st.all ? [0.1, 0.3, 0.5] : [st.eta];
      etas.forEach(e => {
        if (e <= 0.5) p.fn(c => Math.exp(-(e + e * e) * c), { color: '#888', width: 1.4, dash: [3, 4] }, [0, 10]);
        p.fn(c => (1 - e) ** c, { color: C.blue, width: 2.5, dash: [7, 4] }, [0, 10]);
        p.fn(c => Math.exp(-e * c), { color: C.gold, width: 2.5 }, [0, 10]);
        if (st.all) p.tex('e' + e, 10, Math.exp(-e * 10), `\\eta = ${e}`, { color: C.gold, anchor: 'left', dx: -46, dy: -10, size: 12 });
      });
    };
    const c = W.controls;
    ui.slider(c, { label: '$\\eta$', min: 0.01, max: 0.95, step: 0.01, value: st.eta, digits: 2, onInput: v => { st.eta = v; upd(); } });
    ui.check(c, { label: 'les trois courbes de la slide 20 ($\\eta = 0.1, 0.3, 0.5$)', value: false, onChange: v => { st.all = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const e = st.eta;
      ro.set(`Pour une perte 0-1, une erreur multiplie le poids par $1-\\eta = ${(1 - e).toFixed(3)}$ (RWM) ou par $e^{-\\eta} = ${Math.exp(-e).toFixed(3)}$ (EW).<br>$\\ln(1-\\eta) = ${Math.log(1 - e).toFixed(4)}$ · $-\\eta = ${(-e).toFixed(4)}$ · $-\\eta-\\eta^2 = ${(-e - e * e).toFixed(4)}$<br><span class="c-dim">Toujours $1-\\eta\\le e^{-\\eta}$ : RWM punit un peu plus fort. Les deux coïncident au premier ordre en $\\eta$ ; l'écart relatif est d'ordre $\\eta^2$ par erreur. ${e > 0.5 ? 'Ici $\\eta>\\frac12$ : le minorant $e^{-(\\eta+\\eta^2)c}$ n\'est plus garanti.' : ''}</span>`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ ol-ew
  ML.scene('ol-ew', host => {
    const W = ML.widget(host, {
      title: 'Exponential weighting en direct : la distribution $p_t$ et le regret (slides 18–22)', tag: '2D',
      views: [{ name: 'p', label: 'distribution $p_t$ sur les experts au fil du temps (aires empilées)', cls: 'tall' }, { name: 'r', label: 'regret espéré $\\sum_s\\langle p_s,\\ell_s\\rangle-\\min_iL_{t,i}$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>regret espéré</span><span class="key"><i style="background:#9a72ac"></i>regret d\'un tirage $I_t\\sim p_t$</span><span class="key"><i style="background:#fc6255"></i>borne $\\frac{\\ln K}{\\eta}+\\frac{\\eta t}{8}$</span><span class="key"><i style="background:#83c167"></i>$\\sqrt{t\\ln K/2}$</span>',
    });
    const st = { env: 'shift', alg: 'ew', K: 4, T: 600, eta: 0.2, seed: 3, t: 600 };
    W.toggle('samp', 'regret d\'un tirage (aléatoire)', true, () => recompute());
    W.toggle('bnd', 'borne théorique', true, () => recompute());
    let run;
    const P = new ML.Plot2D(W.views.p, { xlim: [0, 600], ylim: [0, 1], xlabel: 't', gridStep: [100, 0.25] });
    const R = new ML.Plot2D(W.views.r, { xlim: [0, 600], ylim: [-5, 40], xlabel: 't', gridStep: [100, 10] });
    P.onDraw = p => {
      const n = st.t, step = Math.max(1, Math.floor(n / 300));
      let below = new Array(n).fill(0);
      for (let i = 0; i < st.K; i++) {
        const top = [], bot = [];
        for (let t = 0; t < n; t += step) { bot.push([t + 1, below[t]]); top.push([t + 1, below[t] + run.p[t][i]]); }
        p.poly(top.concat(bot.reverse()), { color: OL.col(i), fill: OL.col(i), fillAlpha: 0.6, width: 0.5 });
        for (let t = 0; t < n; t++) below[t] += run.p[t][i];
      }
      if (st.env === 'shift') p.vline(st.T / 2, { color: '#fff', dash: [4, 4], width: 1 });
    };
    R.onDraw = p => {
      const n = st.t, ts = M.range(n);
      p.hline(0, { color: '#666' });
      if (W.show.bnd && (st.alg === 'ew')) p.fn(t => OL.bound(st.K, t, st.eta), { color: C.red, width: 1.8, dash: [6, 4] }, [1, st.T]);
      p.fn(t => Math.sqrt(t * Math.log(st.K) / 2), { color: C.green, width: 1.6, dash: [3, 4] }, [1, st.T]);
      if (W.show.samp) p.polyline(ts.map(t => [t + 1, run.regretS[t]]), { color: C.purple, width: 1.5 });
      p.polyline(ts.map(t => [t + 1, run.regret[t]]), { color: C.yellow, width: 3 });
    };
    const c = W.controls;
    ui.select(c, { label: 'environnement', value: st.env, options: ENV_OPTS, onChange: v => { st.env = v; recompute(); } });
    ui.select(c, { label: 'algorithme', value: st.alg, options: [['ew', 'exponential weighting e^(−ηℓ)'], ['rwm', 'randomized WM (1−η)^ℓ'], ['ftl', 'suivre le meneur (η → ∞)'], ['uniform', 'uniforme (η = 0)']], onChange: v => { st.alg = v; recompute(); } });
    ui.slider(c, { label: 'experts $K$', min: 2, max: 12, step: 1, value: st.K, digits: 0, onInput: v => { st.K = Math.round(v); recompute(); } });
    ui.slider(c, { label: 'horizon $T$', min: 100, max: 3000, step: 100, value: st.T, digits: 0, onInput: v => { st.T = Math.round(v); st.t = st.T; recompute(); } });
    const eS = ui.slider(c, { label: '$\\eta$', min: -3, max: 0.6, log: true, value: st.eta, digits: 3, onInput: v => { st.eta = v; recompute(); } });
    ui.buttons(c, [{ label: '$\\eta^\\star = \\sqrt{8\\ln K/T}$', onClick: () => { st.eta = OL.etaStar(st.K, st.T); eS.set(st.eta); recompute(); } }, { label: 'nouvelle séquence', onClick: () => { st.seed++; recompute(); } }]);
    ui.player(c, { speed: 60, step: () => { if (st.t >= st.T) return false; st.t = Math.min(st.T, st.t + 2); P.request(); R.request(); info(); }, reset: () => { st.t = 1; P.request(); R.request(); info(); } });
    const ro = ui.readout(c);
    function recompute() {
      run = OL.run(st.alg, mkEnv(st.env, st.K, st.T, st.seed), { eta: st.eta, seed: st.seed + 11 });
      st.t = Math.min(st.t, st.T);
      P.setLimits([0, st.T], [0, 1]);
      const hi = Math.max(...run.regret, ...(W.show.samp ? run.regretS : [0]), Math.sqrt(st.T * Math.log(st.K) / 2), st.alg === 'ew' && W.show.bnd ? Math.min(OL.bound(st.K, st.T, st.eta), 3 * Math.max(...run.regret, 5)) : 0);
      const lo = Math.min(0, ...run.regret, ...(W.show.samp ? run.regretS : [0]));
      R.setLimits([0, st.T], [lo - 0.05 * (hi - lo) - 1, hi * 1.08 + 1]);
      info();
    }
    function info() {
      const n = Math.max(1, st.t), reg = run.regret[n - 1], b = OL.bound(st.K, n, st.eta), es = OL.etaStar(st.K, st.T);
      ro.set(`$t = ${n}$ · regret espéré <b style="color:#f4d345">${reg.toFixed(2)}</b> · un tirage : ${run.regretS[n - 1].toFixed(1)}${st.alg === 'ew' ? ` · borne $\\frac{\\ln K}{\\eta}+\\frac{\\eta t}{8}$ = <b style="color:#fc6255">${b.toFixed(2)}</b> ${reg <= b + 1e-9 ? '✓' : '✗'}` : ''}<br>$\\eta^\\star = \\sqrt{8\\ln K/T} = ${es.toFixed(3)}$ → borne $\\sqrt{T\\ln K/2} = ${Math.sqrt(st.T * Math.log(st.K) / 2).toFixed(2)}\\le\\sqrt{T\\ln K} = ${Math.sqrt(st.T * Math.log(st.K)).toFixed(2)}$ (slide 22)<br><span class="c-dim">${st.alg === 'ftl' ? 'Suivre le meneur = $\\eta\\to\\infty$ : toute la masse sur l\'expert de plus petite perte cumulée. Contre l\'adversaire adaptatif, le meneur porte toute la masse, donc reçoit une perte 1 à chaque tour : regret linéaire.' : st.alg === 'uniform' ? '$\\eta = 0$ : les poids ne bougent jamais ; le regret croît linéairement.' : 'η petit : la distribution réagit lentement (regret dû au retard, terme $\\eta t/8$ petit mais $\\ln K/\\eta$ grand). η grand : elle saute d\'un expert à l\'autre (proche de « suivre le meneur »).'}</span>`);
    }
    recompute();
  });

  // ------------------------------------------------------------------ ol-eta
  ML.scene('ol-eta', host => {
    const W = ML.widget(host, {
      title: 'Choisir $\\eta$ : la borne $\\frac{\\ln K}{\\eta}+\\frac{\\eta T}{8}$ et le regret mesuré (slide 22)', tag: '2D',
      views: [{ name: 'p', label: 'regret à l\'horizon $T$ en fonction de $\\eta$ (axe horizontal logarithmique)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#fc6255"></i>borne totale</span><span class="key"><i style="background:#58c4dd"></i>$\\ln K/\\eta$ (lenteur)</span><span class="key"><i style="background:#9a72ac"></i>$\\eta T/8$ (instabilité)</span><span class="key"><i class="dot" style="background:#f4d345"></i>regret espéré mesuré</span>',
    });
    const st = { K: 4, T: 1000, env: 'adv', seed: 1 };
    const LG = M.range(61).map(i => -3 + i * 0.07); // log10 η de −3 à 1.2
    let pts = [];
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 1.2], ylim: [0, 100], xlabel: 'log₁₀ η', gridStep: [0.5, 20] });
    P.onDraw = p => {
      const B = lg => OL.bound(st.K, st.T, 10 ** lg);
      p.fn(lg => Math.log(st.K) / 10 ** lg, { color: C.blue, width: 1.5, dash: [4, 4] });
      p.fn(lg => 10 ** lg * st.T / 8, { color: C.purple, width: 1.5, dash: [4, 4] });
      p.fn(B, { color: C.red, width: 2.5 });
      const es = Math.log10(OL.etaStar(st.K, st.T));
      p.vline(es, { color: C.red, width: 1, dash: [3, 3] });
      p.tex('es', es, p.ylim[1] * 0.93, `\\eta^\\star = ${OL.etaStar(st.K, st.T).toFixed(3)}`, { color: C.red, anchor: 'left', dx: 6, size: 13 });
      pts.forEach(([lg, r]) => p.point(lg, r, { color: C.yellow, r: 3.5 }));
    };
    const c = W.controls;
    ui.select(c, { label: 'environnement', value: st.env, options: ENV_OPTS, onChange: v => { st.env = v; recompute(); } });
    ui.slider(c, { label: 'experts $K$', min: 2, max: 12, step: 1, value: st.K, digits: 0, onInput: v => { st.K = Math.round(v); recompute(); } });
    ui.slider(c, { label: 'horizon $T$', min: 100, max: 5000, step: 100, value: st.T, digits: 0, onInput: v => { st.T = Math.round(v); recompute(); } });
    ui.buttons(c, [{ label: 'nouvelle séquence', onClick: () => { st.seed++; recompute(); } }]);
    const ro = ui.readout(c);
    function recompute() {
      const env = mkEnv(st.env, st.K, st.T, st.seed);
      pts = LG.map(lg => { const r = OL.run('ew', env, { eta: 10 ** lg }); return [lg, r.regret[st.T - 1]]; });
      const es = OL.etaStar(st.K, st.T), bmin = Math.sqrt(st.T * Math.log(st.K) / 2);
      const viol = pts.filter(([lg, r]) => r > OL.bound(st.K, st.T, 10 ** lg) + 1e-9).length;
      P.setLimits(null, [Math.min(0, ...pts.map(q => q[1])) - 1, Math.max(4 * bmin, ...pts.map(q => q[1])) * 1.1]);
      const best = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
      ro.set(`borne minimale en $\\eta^\\star = \\sqrt{8\\ln K/T} = ${es.toFixed(4)}$ : $\\sqrt{T\\ln K/2} = ${bmin.toFixed(2)}$<br>points au-dessus de la borne : <b>${viol}</b> / ${pts.length} · meilleur $\\eta$ mesuré ≈ $10^{${best[0].toFixed(2)}}$ (regret ${best[1].toFixed(2)})<br><span class="c-dim">${st.env === 'adv' ? 'Contre l\'adversaire adaptatif, le regret mesuré suit la forme en U de la borne : trop petit $\\eta$ = trop lent, trop grand = trop instable.' : 'Sur une séquence « gentille », le regret mesuré est bien en dessous de la borne (qui vaut pour le <b>pire</b> cas), et un grand $\\eta$ peut même suffire.'}</span>`);
      P.request();
    }
    recompute();
  });

  // ------------------------------------------------------------------ ol-hoeffding
  ML.scene('ol-hoeffding', host => {
    const W = ML.widget(host, {
      title: 'Le lemme de Hoeffding : $\\ln\\E[e^{sX}]\\le s\\,\\E X+\\frac{s^2}{8}$ pour $X\\in[0,1]$ (hors slides)', tag: '2D',
      views: [{ name: 'f', label: '$\\psi(s) = \\ln(1-\\mu+\\mu e^s)$ (Bernoulli) et le majorant quadratique', cls: 'tall' }, { name: 'g', label: '$\\psi\'\'(s) = q(1-q)\\le\\frac14$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f0ac5f"></i>$\\psi(s)$</span><span class="key"><i style="background:#fc6255"></i>$s\\mu+s^2/8$</span><span class="key"><i style="background:#58c4dd"></i>tangente $s\\mu$</span>',
    });
    const st = { mu: 0.3, s: -1 };
    const psi = s => Math.log(1 - st.mu + st.mu * Math.exp(s));
    const q = s => st.mu * Math.exp(s) / (1 - st.mu + st.mu * Math.exp(s));
    const F = new ML.Plot2D(W.views.f, { xlim: [-4, 4], ylim: [-2.5, 4], xlabel: 's', gridStep: [1, 1] });
    const G = new ML.Plot2D(W.views.g, { xlim: [-4, 4], ylim: [-0.02, 0.3], xlabel: 's', gridStep: [1, 0.05] });
    F.onDraw = p => {
      p.fn(s => s * st.mu, { color: C.blue, width: 1.5, dash: [5, 4] });
      p.fn(s => s * st.mu + s * s / 8, { color: C.red, width: 2.5 });
      p.fn(psi, { color: C.gold, width: 3 });
      p.seg(st.s, psi(st.s), st.s, st.s * st.mu + st.s * st.s / 8, { color: C.yellow, width: 2 });
      p.point(st.s, psi(st.s), { color: C.gold, r: 6, glow: true });
    };
    G.onDraw = p => {
      p.hline(0.25, { color: C.red, width: 1.5, dash: [5, 4] });
      p.fn(s => q(s) * (1 - q(s)), { color: C.gold, width: 3 });
      p.point(st.s, q(st.s) * (1 - q(st.s)), { color: C.gold, r: 6 });
      p.vline(Math.log((1 - st.mu) / st.mu), { color: '#666', dash: [3, 3] });
    };
    F.addDraggable({ get: () => [st.s, psi(st.s)], set: x => { st.s = M.clamp(x, -4, 4); sS.set(st.s); upd(); }, r: 14, cursor: 'ew-resize' });
    const c = W.controls;
    ui.slider(c, { label: '$\\mu = \\E X$', min: 0.01, max: 0.99, step: 0.01, value: st.mu, digits: 2, onInput: v => { st.mu = v; upd(); } });
    const sS = ui.slider(c, { label: '$s$ (dans la preuve : $s = -\\eta$)', min: -4, max: 4, step: 0.01, value: st.s, digits: 2, onInput: v => { st.s = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const s = st.s, a = psi(s), b = s * st.mu + s * s / 8;
      ro.set(`$\\psi(${s.toFixed(2)}) = ${a.toFixed(4)}\\ \\le\\ s\\mu+s^2/8 = ${b.toFixed(4)}$ · écart ${(b - a).toFixed(4)}<br><span class="c-dim">Les deux courbes partent de 0 avec la même pente $\\mu$ ; la courbure de $\\psi$ ne dépasse jamais $\\frac14$, celle du majorant vaut exactement $\\frac14$ : le majorant reste au-dessus (Taylor avec reste). Le maximum $\\frac14$ de $q(1-q)$ est atteint quand $q = \\frac12$ (trait vertical).</span>`);
      F.request(); G.request();
    }
    upd();
  });
})(window.ML);
