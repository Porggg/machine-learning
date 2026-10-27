/* Chapitre 7 — Autoencodeurs et VAE : données 2D, petit VAE entraînable (rétropropagation écrite à la main),
   modèle jouet 1D pour l'ELBO (tout se calcule par quadrature). */
(function (ML) {
  'use strict';
  const M = ML.math;
  const V = ML.vae = {};
  const LOG2PI = Math.log(2 * Math.PI);
  V.LOG2PI = LOG2PI;
  V.npdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  V.nlogpdf = (x, m, s) => -0.5 * ((x - m) / s) ** 2 - Math.log(s) - 0.5 * LOG2PI;

  // ---------- jeux de données 2D (une variable latente suffit à les décrire) ----------
  V.DATA = [['arc', 'arc de cercle (une coordonnée : l\'angle)'], ['wave', 'courbe en S'], ['blobs', 'deux amas'], ['gauss', 'nuage gaussien allongé']];
  V.data = (kind, N = 300, seed = 1) => {
    const r = M.rng(seed), pts = [];
    for (let n = 0; n < N; n++) {
      if (kind === 'arc') { const t = r.uniform(-0.15 * Math.PI, 1.15 * Math.PI); pts.push([2 * Math.cos(t) + 0.08 * r.n(), 2 * Math.sin(t) - 0.8 + 0.08 * r.n()]); }
      else if (kind === 'wave') { const t = r.uniform(-2.4, 2.4); pts.push([t + 0.06 * r.n(), 1.1 * Math.sin(1.4 * t) + 0.08 * r.n()]); }
      else if (kind === 'blobs') { const s = r.u() < 0.5 ? -1 : 1; pts.push([1.5 * s + 0.3 * r.n(), 0.8 * s + 0.3 * r.n()]); }
      else { const a = r.n(), b = r.n(); pts.push([1.6 * a + 0.2 * b, 0.8 * a + 0.35 * b]); }
    }
    return pts;
  };

  // ---------- petit VAE : x ∈ R², z ∈ R ----------
  // encodeur : h = tanh(W1 x + b1) ; μ_z = a·h + c ; ln σ_z = a2·h + c2
  // décodeur : g = tanh(V1 z + d1) ; μ_x = V2 g + d2 ; ln σ_x = s (paramètre appris, partagé par tous les z)
  V.Net = class {
    constructor(seed = 1, H = 24) {
      const r = M.rng(seed), init = (n, sc) => Float64Array.from({ length: n }, () => sc * r.n());
      this.H = H;
      this.p = {
        W1: init(2 * H, 0.8), b1: init(H, 0.3), a: init(H, 0.3), c: new Float64Array(1), a2: init(H, 0.05), c2: Float64Array.of(-1),
        V1: init(H, 1.0), d1: init(H, 0.5), V2: init(2 * H, 0.3), d2: new Float64Array(2), s: Float64Array.of(-0.5, -0.5),
      };
      this.m = {}; this.v = {}; this.t = 0;
      for (const k in this.p) { this.m[k] = new Float64Array(this.p[k].length); this.v[k] = new Float64Array(this.p[k].length); }
    }
    encode(x) {
      const { W1, b1, a, c, a2, c2 } = this.p, H = this.H, h = new Float64Array(H);
      let mu = c[0], ls = c2[0];
      for (let j = 0; j < H; j++) { h[j] = Math.tanh(W1[2 * j] * x[0] + W1[2 * j + 1] * x[1] + b1[j]); mu += a[j] * h[j]; ls += a2[j] * h[j]; }
      return { mu, ls: Math.max(-7, Math.min(2, ls)), h };
    }
    decode(z) {
      const { V1, d1, V2, d2 } = this.p, H = this.H, g = new Float64Array(H);
      let m0 = d2[0], m1 = d2[1];
      for (let j = 0; j < H; j++) { g[j] = Math.tanh(V1[j] * z + d1[j]); m0 += V2[2 * j] * g[j]; m1 += V2[2 * j + 1] * g[j]; }
      return { mu: [m0, m1], g };
    }
    sigmaX() { return [Math.exp(this.p.s[0]), Math.exp(this.p.s[1])]; }
    // Perte d'un exemple = −ELBO estimée avec K = 1 échantillon (bruit eps donné) ; beta = poids du terme KL.
    // Si grad est fourni, y ajoute les gradients (rétropropagation à la main).
    lossOne(x, eps, beta, grad) {
      const P = this.p, H = this.H, e = this.encode(x), sz = Math.exp(e.ls), z = e.mu + sz * eps, d = this.decode(z);
      const sx = this.sigmaX(), r0 = x[0] - d.mu[0], r1 = x[1] - d.mu[1];
      const rec = 0.5 * (r0 / sx[0]) ** 2 + 0.5 * (r1 / sx[1]) ** 2 + P.s[0] + P.s[1] + LOG2PI;   // −log p_θ(x|z)
      const kl = 0.5 * (e.mu * e.mu + sz * sz - 1 - 2 * e.ls);                                     // KL(q_φ(z|x) ‖ N(0,1))
      if (grad) {
        // décodeur
        const g0 = -r0 / sx[0] ** 2, g1 = -r1 / sx[1] ** 2;              // ∂rec/∂μ_x
        grad.d2[0] += g0; grad.d2[1] += g1;
        grad.s[0] += 1 - (r0 / sx[0]) ** 2; grad.s[1] += 1 - (r1 / sx[1]) ** 2;
        let dz = 0;
        for (let j = 0; j < H; j++) {
          grad.V2[2 * j] += g0 * d.g[j]; grad.V2[2 * j + 1] += g1 * d.g[j];
          const da = (P.V2[2 * j] * g0 + P.V2[2 * j + 1] * g1) * (1 - d.g[j] * d.g[j]);
          grad.V1[j] += da * z; grad.d1[j] += da; dz += da * P.V1[j];
        }
        // reparamétrisation z = μ + σ ε, puis terme KL en forme close
        const dmu = dz + beta * e.mu, dls = dz * sz * eps + beta * (sz * sz - 1);
        grad.c[0] += dmu; grad.c2[0] += dls;
        for (let j = 0; j < H; j++) {
          grad.a[j] += dmu * e.h[j]; grad.a2[j] += dls * e.h[j];
          const dp = (P.a[j] * dmu + P.a2[j] * dls) * (1 - e.h[j] * e.h[j]);
          grad.W1[2 * j] += dp * x[0]; grad.W1[2 * j + 1] += dp * x[1]; grad.b1[j] += dp;
        }
      }
      return { rec, kl, loss: rec + beta * kl };
    }
    zeroGrad() { const g = {}; for (const k in this.p) g[k] = new Float64Array(this.p[k].length); return g; }
    // Un pas d'Adam sur un mini-batch ; renvoie les moyennes (rec, kl) du batch.
    // deterministic = true : z = μ_z(x) sans bruit (autoencodeur classique) ; freeze : paramètres à ne pas mettre à jour.
    step(X, idx, rng, { lr = 0.01, beta = 1, deterministic = false, freeze = [] } = {}) {
      const g = this.zeroGrad(); let rec = 0, kl = 0;
      for (const i of idx) { const o = this.lossOne(X[i], deterministic ? 0 : rng.n(), beta, g); rec += o.rec; kl += o.kl; }
      const B = idx.length, b1 = 0.9, b2 = 0.999; this.t++;
      for (const k in this.p) {
        if (freeze.includes(k)) continue;
        const P = this.p[k], G = g[k], Mm = this.m[k], Vv = this.v[k];
        for (let i = 0; i < P.length; i++) {
          const gi = G[i] / B; Mm[i] = b1 * Mm[i] + (1 - b1) * gi; Vv[i] = b2 * Vv[i] + (1 - b2) * gi * gi;
          P[i] -= lr * (Mm[i] / (1 - b1 ** this.t)) / (Math.sqrt(Vv[i] / (1 - b2 ** this.t)) + 1e-8);
        }
      }
      this.p.s[0] = Math.max(Math.log(0.03), this.p.s[0]); this.p.s[1] = Math.max(Math.log(0.03), this.p.s[1]);
      return { rec: rec / B, kl: kl / B };
    }
    // ELBO moyenne sur tout le jeu (K échantillons par point, graine fixe pour une courbe lisse)
    elbo(X, K = 4, seed = 99) {
      const r = M.rng(seed); let rec = 0, kl = 0;
      for (const x of X) for (let k = 0; k < K; k++) { const o = this.lossOne(x, r.n(), 1); rec += o.rec / K; kl += o.kl / K; }
      return { rec: rec / X.length, kl: kl / X.length, elbo: -(rec + kl) / X.length };
    }
  };

  // ---------- modèle jouet 1D pour l'ELBO : z ~ N(0,1), x | z ~ N(f(z), s²) ----------
  V.TOY = {
    lin: { label: 'linéaire : f(z) = 1.5 z', f: z => 1.5 * z, s: 0.6 },
    sq: { label: 'carré : f(z) = z²', f: z => z * z, s: 0.5 },
    tanh: { label: 'saturant : f(z) = 2 tanh(2z)', f: z => 2 * Math.tanh(2 * z), s: 0.45 },
  };
  V.ZGRID = M.range(1601).map(i => -8 + 16 * i / 1600);
  V.DZ = 16 / 1600;
  // log p(x, z) = log N(z; 0, 1) + log N(x; f(z), s²)
  V.logJoint = (toy, x, z) => V.nlogpdf(z, 0, 1) + V.nlogpdf(x, toy.f(z), toy.s);
  // log p(x) par quadrature (stable : log-sum-exp)
  V.logMarg = (toy, x) => {
    const L = V.ZGRID.map(z => V.logJoint(toy, x, z)), m = Math.max(...L);
    return m + Math.log(L.reduce((a, l) => a + Math.exp(l - m), 0) * V.DZ);
  };
  // ELBO(q) = E_q[log p(x,z) − log q(z)], q = N(m, sd²), par quadrature
  V.elboQ = (toy, x, m, sd) => {
    let s = 0;
    for (const z of V.ZGRID) { const q = V.npdf(z, m, sd); if (q < 1e-300) continue; s += q * (V.logJoint(toy, x, z) - Math.log(q)) * V.DZ; }
    return s;
  };
  // meilleure gaussienne q : montée de gradient (numérique) sur (m, ln sd), pas ajusté par rebroussement.
  // Part de (m0, ln sd0) : avec une postérieure à deux bosses, on trouve la bosse la plus proche (optimum local).
  V.bestQ = (toy, x, m0 = 0, ls0 = 0, iters = 200) => {
    const f = (a, b) => V.elboQ(toy, x, a, Math.exp(b));
    let m = m0, ls = ls0, F = f(m, ls), step = 0.5;
    for (let it = 0; it < iters; it++) {
      const h = 1e-4, gm = (f(m + h, ls) - f(m - h, ls)) / (2 * h), gl = (f(m, ls + h) - f(m, ls - h)) / (2 * h);
      if (Math.hypot(gm, gl) < 1e-6) break;
      let ok = false;
      while (step > 1e-6) {
        const m2 = m + step * gm, l2 = Math.max(-5, Math.min(2, ls + step * gl)), F2 = f(m2, l2);
        if (F2 > F) { m = m2; ls = l2; F = F2; step *= 1.5; ok = true; break; }
        step /= 2;
      }
      if (!ok) break;
    }
    return { m, sd: Math.exp(ls), elbo: F };
  };
})(window.ML);
