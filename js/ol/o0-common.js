/* Chapitre 6 — Apprentissage en ligne : environnements d'experts et algorithmes (EW, RWM, WM, FTL) */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C;
  const OL = ML.ol = {};
  OL.NAMES = ['wunderground', 'bbc', 'weather.com', 'cnn', 'expert 5', 'expert 6', 'expert 7', 'expert 8', 'expert 9', 'expert 10', 'expert 11', 'expert 12'];
  OL.COLS = [C.blue, C.gold, C.green, C.purple, C.red, C.teal, C.pink, '#b0b0b0', C.maroon, C.yellow, '#7fa6ff', '#c7a17a'];
  OL.col = i => OL.COLS[i % OL.COLS.length];

  // Profils de précision des experts au tour t (0 ≤ t < T) : la « qualité » de chaque expert peut changer (distribution shift).
  const acc = (kind, i, t, T, K) => {
    const base = [0.62, 0.6, 0.58, 0.56, 0.55, 0.54, 0.53, 0.52, 0.51, 0.5, 0.5, 0.5][i] ?? 0.5;
    if (kind === 'iid') return i === 0 ? 0.8 : base;
    if (kind === 'shift') { const best = t < T / 2 ? 0 : 1; return i === best ? 0.88 : base; }
    if (kind === 'cycle') { const best = Math.floor(4 * t / T) % Math.min(4, K); return i === best ? 0.9 : base; }
    return base;
  };
  // Environnement fixé à l'avance (oblivious) : vérité y_t ∈ {0,1}, prédictions des experts, pertes 0-1.
  OL.env = (kind, K, T, seed = 1) => {
    const r = M.rng(seed), y = [], pred = [], loss = [];
    for (let t = 0; t < T; t++) {
      const yt = r.u() < 0.4 ? 1 : 0, pr = [], ls = [];
      for (let i = 0; i < K; i++) { const ok = r.u() < acc(kind, i, t, T, K); const p = ok ? yt : 1 - yt; pr.push(p); ls.push(p === yt ? 0 : 1); }
      y.push(yt); pred.push(pr); loss.push(ls);
    }
    return { kind, K, T, y, pred, loss, adaptive: false };
  };
  // Adversaire adaptatif non anticipant : il voit p_t (pas le tirage I_t). Pertes de base aléatoires (expert 1 meilleur :
  // pile ou face biaisé à 0.3, les autres à 0.5) — ce qui punit les petits η, lents à préférer l'expert 1 ; et dès qu'un
  // expert porte plus de la moitié du poids, l'adversaire lui inflige une perte 1 — ce qui punit les grands η (≈ suivre le meneur).
  OL.advEnv = (K, T, seed = 1) => {
    const r = M.rng(seed + 900), base = M.range(T).map(() => M.range(K).map(i => (r.u() < (i === 0 ? 0.3 : 0.5) ? 1 : 0)));
    return { kind: 'adv', K, T, adaptive: true,
      lossFor: (p, t) => { let b = 0; for (let i = 1; i < K; i++) if (p[i] > p[b]) b = i; const L = base[t].slice(); if (p[b] > 0.5 + 1e-12) L[b] = 1; return L; } };
  };

  // Fait tourner un algorithme. Renvoie, pour chaque tour : p_t (avant de voir y_t), la perte espérée ⟨p_t, ℓ_t⟩,
  // un tirage I_t ~ p_t et sa perte, les pertes cumulées des experts.
  //   alg : 'ew' (poids e^{-η ℓ}), 'rwm' (poids (1-η)^ℓ), 'wm' (vote pondéré déterministe, β = 1-η), 'ftl', 'uniform'.
  OL.run = (alg, env, opts = {}) => {
    const { K, T } = env, eta = opts.eta ?? 0.3, beta = 1 - Math.min(eta, 0.999), r = M.rng(opts.seed ?? 7);
    const logw = new Array(K).fill(0), cum = new Array(K).fill(0);
    const out = { p: [], loss: [], exp: [], I: [], samp: [], cumE: [], cumS: [], cumExp: [], best: [], dyn: [], cumLearner: 0, mistakesWM: 0, alg };
    let ce = 0, cs = 0, dyn = 0;
    for (let t = 0; t < T; t++) {
      let p;
      if (alg === 'ftl') { let b = 0; for (let i = 1; i < K; i++) if (cum[i] < cum[b]) b = i; p = new Array(K).fill(0); p[b] = 1; }
      else if (alg === 'uniform') p = new Array(K).fill(1 / K);
      else { const m = Math.max(...logw), e = logw.map(v => Math.exp(v - m)), Z = M.sum(e); p = e.map(v => v / Z); }
      const L = env.adaptive ? env.lossFor(p, t) : env.loss[t];
      let ex;
      if (alg === 'wm' && !env.adaptive) { // vote pondéré : prédit 1 si le poids des experts qui disent 1 ≥ celui des experts qui disent 0
        let w1 = 0; env.pred[t].forEach((v, i) => { if (v === 1) w1 += p[i]; });
        const vote = w1 >= 0.5 ? 1 : 0; ex = vote === env.y[t] ? 0 : 1;
      } else ex = M.sum(p.map((v, i) => v * L[i]));
      // tirage I_t ~ p_t (pour WM / FTL, le « tirage » est déterministe)
      let u = r.u(), I = 0; for (; I < K - 1; I++) { u -= p[I]; if (u <= 0) break; }
      const sl = alg === 'wm' ? ex : L[I];
      ce += ex; cs += sl; dyn += Math.min(...L);
      for (let i = 0; i < K; i++) cum[i] += L[i];
      out.p.push(p); out.loss.push(L); out.exp.push(ex); out.I.push(I); out.samp.push(sl);
      out.cumE.push(cum.slice()); out.cumExp.push(ce); out.cumS.push(cs); out.best.push(Math.min(...cum)); out.dyn.push(dyn);
      // mise à jour des poids
      if (alg === 'ew') for (let i = 0; i < K; i++) logw[i] -= eta * L[i];
      else if (alg === 'rwm') for (let i = 0; i < K; i++) logw[i] += L[i] * Math.log(beta);
      else if (alg === 'wm' && ex > 0) for (let i = 0; i < K; i++) logw[i] += L[i] * Math.log(beta);
    }
    out.regret = out.cumExp.map((v, t) => v - out.best[t]);
    out.regretS = out.cumS.map((v, t) => v - out.best[t]);
    out.dynRegret = out.cumExp.map((v, t) => v - out.dyn[t]);
    return out;
  };
  OL.etaStar = (K, T) => Math.sqrt(8 * Math.log(K) / T);
  OL.bound = (K, t, eta) => Math.log(K) / eta + eta * t / 8;
})(window.ML);
