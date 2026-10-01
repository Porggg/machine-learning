/* Chapitre 4 — Sélection de modèle · outils communs aux scènes
   Notre loi P (connue, pour pouvoir calculer L(f) exactement) :
   x ~ U[−1, 1],  y = f*(x) + ε,  f*(x) = sin(2.6x) + 0.4x,  ε ~ N(0, σ²), σ = 0.3. */
(function (ML) {
  'use strict';
  const M = ML.math;
  const SIG = 0.3;
  const fstar = x => Math.sin(2.6 * x) + 0.4 * x;
  const XG = M.linspace(-1, 1, 801), FG = XG.map(fstar); // grille pour E_x[·] (x uniforme)
  const horner = (w, x) => { let s = 0; for (let k = w.length - 1; k >= 0; k--) s = s * x + w[k]; return s; };
  // r : graine ou objet M.rng
  const sample = (N, r, sig = SIG) => {
    if (typeof r === 'number') r = M.rng(r);
    const xs = [], ys = [];
    for (let i = 0; i < N; i++) { const x = r.uniform(-1, 1); xs.push(x); ys.push(fstar(x) + sig * r.n()); }
    return { xs, ys };
  };
  // ERM (régularisé) : min 1/N‖y − Φw‖² + λ Σ_{j≥1} w_j²  (w0 non pénalisé), Φ = monômes de degré ≤ d
  const fit = (xs, ys, d, lam = 0) => {
    const Phi = xs.map(M.basis.poly(d));
    if (!(lam > 0) || d === 0) return M.lstsq(Phi, ys);
    const s = Math.sqrt(xs.length * lam);
    const A = Phi.concat(M.range(d).map(i => M.range(d + 1).map(j => (j === i + 1 ? s : 0))));
    return M.lstsq(A, ys.concat(M.zeros(d)));
  };
  const mse = (w, xs, ys) => { let s = 0; for (let i = 0; i < xs.length; i++) s += (ys[i] - horner(w, xs[i])) ** 2; return s / xs.length; };
  // L(f) = σ² + E_x[(f*(x) − f(x))²]
  const genErr = (w, sig = SIG) => { let s = 0; for (let i = 0; i < XG.length; i++) s += (FG[i] - horner(w, XG[i])) ** 2; return sig * sig + s / XG.length; };
  // Var(ℓ) pour la perte carrée sur un nouvel exemple : δ = f* − f, E[ℓ|x] = δ² + σ², E[ℓ²|x] = δ⁴ + 6δ²σ² + 3σ⁴
  const lossVar = (w, sig = SIG) => {
    let m1 = 0, m2 = 0; const s2 = sig * sig;
    for (let i = 0; i < XG.length; i++) { const d2 = (FG[i] - horner(w, XG[i])) ** 2; m1 += d2 + s2; m2 += d2 * d2 + 6 * d2 * s2 + 3 * s2 * s2; }
    m1 /= XG.length; m2 /= XG.length; return m2 - m1 * m1;
  };
  const median = v => { const a = v.slice().sort((p, q) => p - q), n = a.length; return n % 2 ? a[(n - 1) / 2] : 0.5 * (a[n / 2 - 1] + a[n / 2]); };
  const quantile = (v, q) => { const a = v.slice().sort((p, r) => p - r); return a[Math.min(a.length - 1, Math.max(0, Math.floor(q * (a.length - 1))))]; };
  const argmin = v => v.reduce((b, x, i) => (x < v[b] ? i : b), 0);
  // histogramme sur [a, b] en n classes (valeurs hors bornes → classes extrêmes), fréquences relatives
  const hist = (vals, a, b, n) => {
    const c = new Array(n).fill(0);
    for (const v of vals) { const k = Math.floor((v - a) / (b - a) * n); c[Math.max(0, Math.min(n - 1, k))]++; }
    return c.map(x => x / vals.length);
  };
  const drawHist = (p, freqs, a, b, s) => {
    const n = freqs.length, dx = (b - a) / n;
    freqs.forEach((f, k) => { if (f > 0) p.rect(a + k * dx, 0, a + (k + 1) * dx, f, Object.assign({ width: 1, fillAlpha: 0.35 }, s, { fill: s.color })); });
  };
  const lg = v => Math.log10(Math.max(v, 1e-9));
  const logTick = v => { const k = Math.round(v); if (Math.abs(v - k) > 1e-6) return ''; return k >= -3 && k <= 3 ? String(+(10 ** k).toPrecision(1)) : '1e' + k; };
  // découpage aléatoire en K plis (indices)
  const folds = (N, K, r) => { const idx = r.shuffle(M.range(N)); return M.range(K).map(k => idx.filter((_, i) => i % K === k)); };
  const pick = (D, idx) => ({ xs: idx.map(i => D.xs[i]), ys: idx.map(i => D.ys[i]) });

  ML.ms = { SIG, fstar, horner, sample, fit, mse, genErr, lossVar, median, quantile, argmin, hist, drawHist, lg, logTick, folds, pick };
})(window.ML);
