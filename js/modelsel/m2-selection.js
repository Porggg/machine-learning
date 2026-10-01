/* Chapitre 4 — Sélection de modèle · §4–5 validation, test, validation croisée */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, S = ML.ms;
  const DEGS = M.range(13); // candidats Ψ = {0, …, 12}
  const fm = v => v > 1e3 ? v.toExponential(2) : M.fmt(v, 4);

  // ------------------------------------------------------------------ ms-valselect
  ML.scene('ms-valselect', host => {
    const NTR = 24, NVA = 100, NTE = 1000;
    const W = ML.widget(host, {
      title: `Exemple des slides : ${NTR} train · ${NVA} validation · ${NTE} test`, tag: '2D',
      views: [{ name: 'p', label: 'données et modèle final (réajusté sur train ∪ val)', cls: 'tall' }, { name: 'e', label: 'chaque degré : ajusté sur train, comparé sur validation', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#fff"></i>train</span><span class="key"><i class="dot" style="background:#f0ac5f"></i>validation</span><span class="key"><i class="dot" style="background:#667"></i>test</span><span class="key"><i style="background:#58c4dd"></i>MSE train</span><span class="key"><i style="background:#f0ac5f"></i>MSE validation</span><span class="key"><i style="background:#fc6255"></i>$L$ exacte</span><span class="key"><i style="background:#f4d345"></i>$f_{\\text{final}}$</span>',
    });
    const st = { seed: 11 };
    W.toggle('val', 'points de validation', true);
    W.toggle('test', 'points de test (on ne les regarde qu\'à la fin !)', false);
    W.toggle('true', 'révéler $L$ (impossible en vrai)', false, () => regen());
    W.toggle('truth', 'vraie fonction $f^\\star$', false);
    let Tr, Va, Te, rows, dh, fin, res;
    const P = new ML.Plot2D(W.views.p, { xlim: [-1.05, 1.05], ylim: [-2.3, 2.3], xlabel: 'x', ylabel: 'y' });
    P.onDraw = p => {
      if (W.show.test) Te.xs.forEach((x, i) => p.point(x, Te.ys[i], { color: '#667', r: 1.6, alpha: 0.8 }));
      if (W.show.truth) p.fn(S.fstar, { color: C.green, width: 2.5, alpha: 0.9 });
      p.fn(x => S.horner(fin.w, x), { color: C.yellow, width: 3, samples: 700 });
      if (W.show.val) Va.xs.forEach((x, i) => p.point(x, Va.ys[i], { color: C.gold, r: 3, alpha: 0.9 }));
      Tr.xs.forEach((x, i) => p.point(x, Tr.ys[i], { color: '#fff', r: 4, stroke: '#000' }));
      p.tex('d', 1.0, 2.0, `\\hat\\psi = d = ${dh}`, { anchor: 'right', color: C.yellow, size: 16 });
    };
    const Y0 = -1.6, Y1 = 1.6;
    const E = new ML.Plot2D(W.views.e, { xlim: [-0.5, 12.5], ylim: [Y0, Y1], xlabel: 'd', ylabel: '\\text{MSE}', gridStep: [1, 1], axisY: Y0, axisX: -0.5, tickFmt: (v, ax) => ax === 'y' ? S.logTick(v) : String(Math.round(v)) });
    const cl = v => M.clamp(S.lg(v), Y0 - 0.2, Y1 + 0.2);
    E.onDraw = p => {
      const line = (k, col, w) => { p.polyline(rows.map((r, d) => [d, cl(r[k])]), { color: col, width: w }); rows.forEach((r, d) => p.point(d, cl(r[k]), { color: col, r: 3 })); };
      line('tr', C.blue, 2.3); line('va', C.gold, 2.8);
      if (W.show.true) line('ge', C.red, 2);
      p.point(dh, cl(rows[dh].va), { color: C.gold, r: 8, hollow: true });
      p.tex('min', dh, cl(rows[dh].va), '\\hat\\psi', { anchor: 'top', dy: 12, color: C.gold, size: 15 });
    };
    const c = W.controls;
    ui.buttons(c, [{ label: '🎲 nouveau tirage', onClick: () => { st.seed++; regen(); } }, { label: '🔁 répéter 300 fois', primary: true, onClick: repeat }]);
    const ro = ui.readout(c), ro2 = ui.readout(c);
    ro2.set('<span class="c-dim">« répéter 300 fois » moyenne les erreurs sur 300 tirages indépendants des trois ensembles.</span>');
    function once(seed) {
      const r = M.rng(seed);
      const Tr_ = S.sample(NTR, r), Va_ = S.sample(NVA, r), Te_ = S.sample(NTE, r);
      const rows_ = DEGS.map(d => { const w = S.fit(Tr_.xs, Tr_.ys, d); return { w, tr: S.mse(w, Tr_.xs, Tr_.ys), va: S.mse(w, Va_.xs, Va_.ys), ge: S.genErr(w) }; });
      const dh_ = S.argmin(rows_.map(r_ => r_.va));
      const all = { xs: Tr_.xs.concat(Va_.xs), ys: Tr_.ys.concat(Va_.ys) };
      const wf = S.fit(all.xs, all.ys, dh_);
      const fin_ = { w: wf, te: S.mse(wf, Te_.xs, Te_.ys), ge: S.genErr(wf) };
      return { Tr: Tr_, Va: Va_, Te: Te_, rows: rows_, dh: dh_, fin: fin_ };
    }
    function regen() {
      ({ Tr, Va, Te, rows, dh, fin } = once(st.seed));
      ro.set(`degré choisi $\\hat\\psi$ = <b>${dh}</b><br>MSE validation de $\\hat f_{\\hat\\psi}$ = <b style="color:#f0ac5f">${fm(rows[dh].va)}</b>` +
        (W.show.true ? ` (vraie $L$ : <b style="color:#fc6255">${fm(rows[dh].ge)}</b>)` : '') +
        `<br>réajusté sur ${NTR + NVA} points → MSE test = <b>${fm(fin.te)}</b>` + (W.show.true ? ` (vraie $L$ : <b style="color:#fc6255">${fm(fin.ge)}</b>)` : ''));
      P.request(); E.request();
    }
    function repeat() {
      const acc = { va: [], ge0: [], te: [], gef: [] };
      for (let k = 0; k < 300; k++) { const o = once(100000 + k + 300 * st.seed); acc.va.push(o.rows[o.dh].va); acc.ge0.push(o.rows[o.dh].ge); acc.te.push(o.fin.te); acc.gef.push(o.fin.ge); }
      ro2.set(`<b>Moyennes sur 300 tirages</b><br>val. du modèle choisi : <b style="color:#f0ac5f">${fm(M.mean(acc.va))}</b> vs sa vraie $L$ : <b style="color:#fc6255">${fm(M.mean(acc.ge0))}</b> (${(100 * (M.mean(acc.va) / M.mean(acc.ge0) - 1)).toFixed(1)} %) → <b>optimiste</b> (choisi sur ces données)<br>test du modèle final : <b>${fm(M.mean(acc.te))}</b> vs sa vraie $L$ : <b style="color:#fc6255">${fm(M.mean(acc.gef))}</b> (${(100 * (M.mean(acc.te) / M.mean(acc.gef) - 1)).toFixed(1)} %) → <b>sans biais</b> (à l'erreur Monte-Carlo près)`);
    }
    regen();
  });

  // ------------------------------------------------------------------ ms-valoverfit
  ML.scene('ms-valoverfit', host => {
    const REPS = 400;
    const W = ML.widget(host, {
      title: '$K$ candidats de même vraie erreur $p$, chacun évalué sur $m$ exemples de validation (slide 19)', tag: '2D',
      views: [{ name: 'a', label: 'un tirage : erreur de validation de chaque candidat', cls: 'tall' }, { name: 'b', label: `${REPS} répétitions : erreur de validation du « meilleur »`, cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>candidats</span><span class="key"><i style="background:#83c167"></i>vraie erreur $p$ (identique pour tous)</span><span class="key"><i class="dot" style="background:#f4d345"></i>candidat sélectionné (min. validation)</span>',
    });
    const st = { K: 100, m: 100, p: 0.2, off: 0 };
    W.toggle('band', 'bande $p \\pm 2\\sqrt{p(1-p)/m}$', true);
    W.toggle('approx', 'ordre de grandeur $p - \\sqrt{p(1-p)/m}\\sqrt{2\\ln K}$ (hors slides)', false);
    let errs, mins, exact, h, a0, b0;
    const A = new ML.Plot2D(W.views.a, { xlim: [0, 1], ylim: [0, 0.4], xlabel: '\\text{candidat } k', ylabel: '\\hL_{\\text{val}}' });
    const B = new ML.Plot2D(W.views.b, { xlim: [0, 0.4], ylim: [0, 0.3], xlabel: '\\min_k \\hL_{\\text{val}}' });
    const sdv = () => Math.sqrt(st.p * (1 - st.p) / st.m);
    A.onDraw = p => {
      const sd = sdv(), K = st.K;
      if (W.show.band) p.rect(0, st.p - 2 * sd, K + 1, st.p + 2 * sd, { color: C.green, fill: C.green, fillAlpha: 0.08, stroke: false });
      p.hline(st.p, { color: C.green, width: 2.5 });
      errs.forEach((e, k) => p.point(k + 1, e, { color: C.blue, r: K > 300 ? 1.8 : 3, alpha: 0.85 }));
      const j = S.argmin(errs);
      p.point(j + 1, errs[j], { color: C.yellow, r: 7, glow: true });
      p.tex('min', j + 1, errs[j], `${(100 * errs[j]).toFixed(1)}\\,\\%`, { anchor: 'top', dy: 12, color: C.yellow, size: 15 });
      p.tex('p', K + 1, st.p, `p = ${(100 * st.p).toFixed(0)}\\,\\%`, { anchor: 'right', dy: -12, color: C.green, size: 14 });
    };
    B.onDraw = p => {
      S.drawHist(p, h, a0, b0, { color: C.yellow });
      p.vline(st.p, { color: C.green, width: 2.5 });
      p.vline(M.mean(mins), { color: C.yellow, width: 2, dash: [6, 5] });
      p.tex('mm', M.mean(mins), B.ylim[1] * 0.9, '\\E[\\min]', { anchor: 'right', dx: -6, color: C.yellow, size: 14 });
      p.tex('pp', st.p, B.ylim[1] * 0.9, 'p', { anchor: 'left', dx: 6, color: C.green, size: 14 });
      if (W.show.approx) { const ap = st.p - sdv() * Math.sqrt(2 * Math.log(Math.max(st.K, 1))); p.vline(ap, { color: C.purple, width: 1.8, dash: [3, 4] }); }
    };
    // Binomial(m, p)/m : exact (Bernoulli) si le coût le permet, sinon approximation normale
    const binom = (r, m, p) => {
      if (exact) { let s = 0; for (let i = 0; i < m; i++) if (r.u() < p) s++; return s / m; }
      return M.clamp(Math.round(m * p + Math.sqrt(m * p * (1 - p)) * r.n()), 0, m) / m;
    };
    const c = W.controls;
    const KS = ui.slider(c, { label: 'nombre de candidats $K$', min: 0, max: Math.log10(2000), log: true, value: st.K, fmt: v => Math.round(v).toString(), onInput: v => { st.K = Math.round(v); run(); } });
    const mS = ui.slider(c, { label: 'taille de validation $m$', min: 1, max: 4, log: true, value: st.m, fmt: v => Math.round(v).toString(), onInput: v => { st.m = Math.round(v); run(); } });
    const pS = ui.slider(c, { label: 'vraie erreur $p$', min: 0.02, max: 0.5, step: 0.01, value: st.p, fmt: v => (100 * v).toFixed(0) + ' %', onInput: v => { st.p = v; run(); } });
    ui.buttons(c, [{ label: '🎲 relancer', onClick: () => { st.off += 1; run(); } }, { label: 'slides : $K=100, m=100, p=20\\%$', onClick: () => { st.K = 100; st.m = 100; st.p = 0.2; KS.set(100); mS.set(100); pS.set(0.2); run(); } }]);
    const ro = ui.readout(c);
    function run() {
      exact = st.m * st.K * (REPS + 1) <= 6e6;
      const r = M.rng(4242 + 7919 * st.off);
      errs = M.range(st.K).map(() => binom(r, st.m, st.p));
      mins = [];
      for (let k = 0; k < REPS; k++) { let mn = 1; for (let j = 0; j < st.K; j++) mn = Math.min(mn, binom(r, st.m, st.p)); mins.push(mn); }
      const sd = sdv();
      A.setLimits([0, st.K + 1], [Math.max(0, st.p - 5 * sd), Math.min(1, st.p + 4 * sd)]);
      a0 = Math.max(0, st.p - 5.5 * sd); b0 = st.p + 1.5 * sd;
      h = S.hist(mins, a0, b0, Math.min(40, Math.max(8, Math.round(st.m * (b0 - a0)) + 1)));
      B.setLimits([a0, b0], [0, 1.25 * Math.max(...h)]);
      const j = S.argmin(errs);
      ro.set(`ce tirage : meilleur candidat à <b style="color:#f4d345">${(100 * errs[j]).toFixed(1)} %</b> (vraie erreur ${(100 * st.p).toFixed(0)} %)<br>en moyenne sur ${REPS} répétitions : <b style="color:#f4d345">${(100 * M.mean(mins)).toFixed(1)} %</b> → biais ≈ <b>${(100 * (st.p - M.mean(mins))).toFixed(1)}</b> points<br><span class="c-dim">${exact ? 'tirages binomiaux exacts' : 'approximation normale de la binomiale (rapide)'}</span>`);
      A.request(); B.request();
    }
    run();
  });

  // ------------------------------------------------------------------ ms-cv
  ML.scene('ms-cv', host => {
    const N = 40, DM = 10;
    const W = ML.widget(host, {
      title: `Validation croisée à $K$ plis sur $N = ${N}$ points de développement`, tag: '2D',
      views: [{ name: 'p', label: 'tour $k$ : le pli $k$ (anneaux) sert de validation', cls: 'tall' }, { name: 'e', label: 'erreur de validation par pli et score CV, en fonction du degré', cls: 'tall' }],
      controls: true,
      foot: '<span class="key">couleurs = plis</span><span class="key"><i style="background:#f4d345"></i>$\\hat f_d^{(-k)}$</span><span class="key"><i style="background:#fff"></i>score CV $\\hL_{\\text{CV}}$</span><span class="key"><i style="background:#f0ac5f"></i>holdout (un seul découpage 70/30)</span><span class="key"><i style="background:#83c167"></i>$L$ du modèle réajusté sur les $N$ points</span>',
    });
    const st = { K: 5, k: 1, d: 3, seed: 5, split: 1 };
    W.toggle('folds', 'courbes par pli', true);
    W.toggle('hold', 'courbe holdout', true);
    W.toggle('true', 'révéler $L$ (impossible en vrai)', false, () => compute());
    W.toggle('truth', 'vraie fonction $f^\\star$', false);
    let D, F, perFold, cv, hold, gen, dCV, dHo, owner;
    const col = k => M.series[k % M.series.length];
    const P = new ML.Plot2D(W.views.p, { xlim: [-1.05, 1.05], ylim: [-2.3, 2.3], xlabel: 'x', ylabel: 'y' });
    P.onDraw = p => {
      if (W.show.truth) p.fn(S.fstar, { color: C.green, width: 2.5, alpha: 0.9 });
      const k = st.k - 1, tr = S.pick(D, F.filter((_, j) => j !== k).flat()), w = S.fit(tr.xs, tr.ys, st.d);
      p.fn(x => S.horner(w, x), { color: C.yellow, width: 3, samples: 700 });
      D.xs.forEach((x, i) => {
        const f = owner[i];
        if (f === k) p.point(x, D.ys[i], { color: col(f), r: 7, hollow: true, width: 2.5 });
        else p.point(x, D.ys[i], { color: col(f), r: 4, alpha: 0.9 });
      });
      p.tex('k', 1.0, 2.0, `k = ${st.k},\\ d = ${st.d}`, { anchor: 'right', color: C.yellow, size: 15 });
    };
    const Y0 = -1.6, Y1 = 1.8;
    const E = new ML.Plot2D(W.views.e, { xlim: [-0.5, DM + 0.5], ylim: [Y0, Y1], xlabel: 'd', ylabel: '\\text{MSE}', gridStep: [1, 1], axisY: Y0, axisX: -0.5, tickFmt: (v, ax) => ax === 'y' ? S.logTick(v) : String(Math.round(v)) });
    const cl = v => M.clamp(S.lg(v), Y0 - 0.2, Y1 + 0.2);
    E.onDraw = p => {
      if (W.show.folds) perFold.forEach((row, k) => p.polyline(row.map((v, d) => [d, cl(v)]), { color: col(k), width: k === st.k - 1 ? 2.4 : 1.3, alpha: k === st.k - 1 ? 1 : 0.6 }));
      if (W.show.hold) { p.polyline(hold.map((v, d) => [d, cl(v)]), { color: C.gold, width: 2.2, dash: [7, 5] }); p.point(dHo, cl(hold[dHo]), { color: C.gold, r: 7, hollow: true }); }
      if (W.show.true) p.polyline(gen.map((v, d) => [d, cl(v)]), { color: C.green, width: 2.2 });
      p.polyline(cv.map((v, d) => [d, cl(v)]), { color: '#fff', width: 3.5 });
      cv.forEach((v, d) => p.point(d, cl(v), { color: '#fff', r: 3.5 }));
      p.point(dCV, cl(cv[dCV]), { color: '#fff', r: 9, hollow: true });
      p.vline(st.d, { color: C.yellow, width: 1.4, alpha: 0.5 });
    };
    const c = W.controls;
    const kS = ui.slider(c, { label: 'nombre de plis $K$', min: 2, max: N, step: 1, value: st.K, fmt: v => v.toFixed(0), onInput: v => { st.K = v; st.k = Math.min(st.k, v); kkS.input.max = v; kkS.set(st.k); compute(); } });
    const kkS = ui.slider(c, { label: 'tour affiché $k$', min: 1, max: st.K, step: 1, value: st.k, fmt: v => v.toFixed(0), onInput: v => { st.k = v; P.request(); E.request(); } });
    ui.slider(c, { label: 'degré $d$ (vue de gauche)', min: 0, max: DM, step: 1, value: st.d, fmt: v => v.toFixed(0), onInput: v => { st.d = v; P.request(); E.request(); } });
    ui.buttons(c, [{ label: '🔀 nouveau découpage', onClick: () => { st.split++; compute(); } }, { label: '🎲 nouvelles données', onClick: () => { st.seed++; regen(); } }]);
    ui.buttons(c, [{ label: 'LOO ($K = N$)', title: 'leave-one-out', onClick: () => { st.K = N; st.k = 1; kS.set(N); kkS.input.max = N; kkS.set(1); compute(); } }]);
    const ro = ui.readout(c);
    function regen() { D = S.sample(N, st.seed); gen = M.range(DM + 1).map(d => S.genErr(S.fit(D.xs, D.ys, d))); compute(); }
    function compute() {
      const r = M.rng(31 * st.split + 7);
      F = S.folds(N, st.K, r);
      owner = M.zeros(N); F.forEach((f, k) => f.forEach(i => { owner[i] = k; }));
      perFold = F.map((f, k) => {
        const tr = S.pick(D, F.filter((_, j) => j !== k).flat()), va = S.pick(D, f);
        return M.range(DM + 1).map(d => S.mse(S.fit(tr.xs, tr.ys, d), va.xs, va.ys));
      });
      cv = M.range(DM + 1).map(d => M.mean(perFold.map(row => row[d])));
      const idx = r.shuffle(M.range(N)), nt = Math.round(0.7 * N), trH = S.pick(D, idx.slice(0, nt)), vaH = S.pick(D, idx.slice(nt));
      hold = M.range(DM + 1).map(d => S.mse(S.fit(trH.xs, trH.ys, d), vaH.xs, vaH.ys));
      dCV = S.argmin(cv); dHo = S.argmin(hold);
      const dBest = S.argmin(gen);
      ro.set(`degré choisi par CV : <b>${dCV}</b> (score ${fm(cv[dCV])})<br>degré choisi par holdout : <b style="color:#f0ac5f">${dHo}</b><br>` +
        `entraînements : ${st.K} par degré (CV) vs 1 (holdout)<br>modèle final : réajusté sur les ${N} points avec $d = ${dCV}$` + (W.show.true ? `<br>$L$ (CV) = <b style="color:#83c167">${fm(gen[dCV])}</b>, $L$ (holdout) = <b style="color:#83c167">${fm(gen[dHo])}</b>, meilleur possible : $d = ${dBest}$` : ''));
      P.request(); E.request();
    }
    regen();
  });

  // ------------------------------------------------------------------ ms-cvstab
  ML.scene('ms-cvstab', host => {
    const N = 40, DM = 10, REPS = 200;
    const W = ML.widget(host, {
      title: `Stabilité du choix : holdout 70/30 vs CV à 5 plis, sur ${REPS} découpages`, tag: '2D',
      views: [{ name: 'h', label: 'fréquence de chaque degré choisi', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f0ac5f"></i>holdout</span><span class="key"><i style="background:#fff"></i>5-fold CV</span><span class="key"><i style="background:#83c167"></i>degré qui minimise vraiment $L$ (modèle sur les $N$ points)</span>',
    });
    const st = { seed: 5, mode: 'split' };
    W.toggle('best', 'degré optimal (selon $L$)', true);
    let fH, fC, dBest;
    const P = new ML.Plot2D(W.views.h, { xlim: [-0.6, DM + 0.6], ylim: [0, 0.8], xlabel: 'd', gridStep: [1, 0.1], axisY: 0, axisX: -0.6, tickFmt: (v, ax) => ax === 'y' ? Math.round(100 * v) + '%' : String(Math.round(v)) });
    P.onDraw = p => {
      if (W.show.best && dBest != null) p.rect(dBest - 0.45, 0, dBest + 0.45, P.ylim[1], { color: C.green, fill: C.green, fillAlpha: 0.12, stroke: false });
      for (let d = 0; d <= DM; d++) {
        if (fH[d] > 0) p.rect(d - 0.38, 0, d - 0.02, fH[d], { color: C.gold, fill: C.gold, fillAlpha: 0.55, width: 1 });
        if (fC[d] > 0) p.rect(d + 0.02, 0, d + 0.38, fC[d], { color: '#fff', fill: '#fff', fillAlpha: 0.55, width: 1 });
      }
    };
    const c = W.controls;
    ui.select(c, { label: 'on répète…', value: st.mode, options: [['split', 'le découpage (mêmes données)'], ['data', 'les données (nouvel échantillon)']], onChange: v => { st.mode = v; run(); } });
    ui.buttons(c, [{ label: '🎲 nouvelles données', onClick: () => { st.seed++; run(); } }]);
    const ro = ui.readout(c);
    function run() {
      const cH = M.zeros(DM + 1), cC = M.zeros(DM + 1), LH = [], LC = [];
      let D0 = S.sample(N, st.seed);
      const rngS = M.rng(st.seed * 101 + 3);
      for (let rep = 0; rep < REPS; rep++) {
        const D = st.mode === 'data' ? S.sample(N, 70000 + rep + 1000 * st.seed) : D0;
        const idx = rngS.shuffle(M.range(N)), nt = Math.round(0.7 * N), trH = S.pick(D, idx.slice(0, nt)), vaH = S.pick(D, idx.slice(nt));
        const hold = M.range(DM + 1).map(d => S.mse(S.fit(trH.xs, trH.ys, d), vaH.xs, vaH.ys));
        const F = S.folds(N, 5, rngS);
        const cv = M.range(DM + 1).map(d => M.mean(F.map((f, k) => { const tr = S.pick(D, F.filter((_, j) => j !== k).flat()), va = S.pick(D, f); return S.mse(S.fit(tr.xs, tr.ys, d), va.xs, va.ys); })));
        const dh = S.argmin(hold), dc = S.argmin(cv);
        cH[dh]++; cC[dc]++;
        LH.push(S.genErr(S.fit(D.xs, D.ys, dh))); LC.push(S.genErr(S.fit(D.xs, D.ys, dc)));
      }
      fH = cH.map(v => v / REPS); fC = cC.map(v => v / REPS);
      dBest = st.mode === 'split' ? S.argmin(M.range(DM + 1).map(d => S.genErr(S.fit(D0.xs, D0.ys, d)))) : null;
      P.setLimits(null, [0, Math.min(1, 1.15 * Math.max(...fH, ...fC))]);
      const top = f => { const d = S.argmin(f.map(v => -v)); return `d = ${d} (${Math.round(100 * f[d])} %)`; };
      ro.set(`choix le plus fréquent — holdout : <b style="color:#f0ac5f">${top(fH)}</b> · CV : <b>${top(fC)}</b><br>$L$ moyenne du modèle final (réajusté sur les ${N} points) — holdout : <b style="color:#f0ac5f">${fm(M.mean(LH))}</b> · CV : <b>${fm(M.mean(LC))}</b>` +
        (st.mode === 'data' ? '<br><span class="c-dim">Mode « données » : la variabilité vient aussi de l\'échantillon, pas seulement du découpage.</span>' : ''));
      P.request();
    }
    run();
  });
})(window.ML);
