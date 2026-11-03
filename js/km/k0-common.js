/* Chapitre 9 — Clustering : données 2D, k-means (Lloyd, k-means++), soft k-means, mélanges de gaussiennes et EM */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C;
  const K = ML.km = {};
  K.COL = [C.blue, C.red, C.green, C.gold, C.purple, C.teal, C.pink, C.yellow];
  K.RGB = K.COL.map(M.hexToRgb);
  K.d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  // couleur d'un point d'après ses responsabilités r_n· (mélange des couleurs des groupes)
  K.mix = (row, k = 1) => { const c = [0, 0, 0]; row.forEach((r, j) => { const q = K.RGB[j % 8]; c[0] += r * q[0]; c[1] += r * q[1]; c[2] += r * q[2]; }); return c.map(v => v * k); };
  K.mixHex = row => { const c = K.mix(row); return `rgb(${c.map(v => Math.round(v)).join(',')})`; };

  // ---------- gaussiennes 2D ----------
  K.cov = (s1, s2, th = 0) => { const c = Math.cos(th), s = Math.sin(th), a = s1 * s1, b = s2 * s2; return [[c * c * a + s * s * b, c * s * (a - b)], [c * s * (a - b), s * s * a + c * c * b]]; };
  K.det2 = S => S[0][0] * S[1][1] - S[0][1] * S[1][0];
  K.inv2 = S => { const d = K.det2(S); return [[S[1][1] / d, -S[0][1] / d], [-S[1][0] / d, S[0][0] / d]]; };
  K.maha2 = (x, mu, S) => { const P = K.inv2(S), a = x[0] - mu[0], b = x[1] - mu[1]; return P[0][0] * a * a + 2 * P[0][1] * a * b + P[1][1] * b * b; };
  K.logN = (x, mu, S) => -Math.log(2 * Math.PI) - 0.5 * Math.log(K.det2(S)) - 0.5 * K.maha2(x, mu, S);
  const chol = S => { const a = Math.sqrt(S[0][0]), b = S[0][1] / a; return [[a, 0], [b, Math.sqrt(Math.max(1e-12, S[1][1] - b * b))]]; };
  // valeurs propres de Σ planchées à ε (Σ ⪰ εI, slide 39)
  K.floor = (S, eps) => {
    const { values, vectors: V } = M.eigSym(S), l = values.map(v => Math.max(v, eps));
    const a = V[0][0], b = V[1][0], c = V[0][1], d = V[1][1], o = l[0] * a * b + l[1] * c * d; // vecteurs propres en colonnes
    return [[l[0] * a * a + l[1] * c * c, o], [o, l[0] * b * b + l[1] * d * d]];
  };
  K.minEig = S => Math.min(...M.eigSym(S).values);
  // ellipse {x : (x−µ)ᵀ Σ⁻¹ (x−µ) = c²}
  K.ellipse = (p, mu, S, c, s) => p.ellipse(mu[0], mu[1], K.inv2(S), c * c, s);

  // ---------- jeux de données ----------
  K.DATA = [['blobs3', '3 groupes ronds'], ['faithful', '2 groupes allongés (type Old Faithful)'], ['unequal', '3 groupes de tailles et d\'étalements différents'], ['aniso', '2 groupes très allongés et parallèles'], ['blobs5', '5 groupes']];
  const SPEC = {
    blobs3: [[[-1.6, 1.15], 0.42, 0.42, 0, 30], [[1.55, 1.0], 0.42, 0.42, 0, 30], [[0.1, -1.45], 0.42, 0.42, 0, 30]],
    faithful: [[[-1.15, -1.0], 0.42, 0.2, 0.75, 38], [[0.85, 0.8], 0.5, 0.26, 0.75, 56]],
    unequal: [[[-1.0, 0.0], 0.95, 0.8, 0.4, 70], [[2.0, 1.6], 0.22, 0.22, 0, 14], [[2.1, -1.5], 0.22, 0.22, 0, 14]],
    aniso: [[[0, 0.75], 1.45, 0.17, 0, 50], [[0, -0.75], 1.45, 0.17, 0, 50]],
    blobs5: [0, 1, 2, 3, 4].map(i => { const a = Math.PI / 2 + 2 * Math.PI * i / 5; return [[2.05 * Math.cos(a), 2.05 * Math.sin(a) - 0.1], 0.36, 0.36, 0, 20]; }),
  };
  K.data = (kind, seed = 1) => {
    const r = M.rng(seed * 7919 + 17), X = [], z = [];
    SPEC[kind].forEach(([mu, s1, s2, th, n], k) => {
      const L = chol(K.cov(s1, s2, th));
      for (let i = 0; i < n; i++) { const a = r.n(), b = r.n(); X.push([mu[0] + L[0][0] * a, mu[1] + L[1][0] * a + L[1][1] * b]); z.push(k); }
    });
    return { X, z, K: SPEC[kind].length };
  };

  // ---------- k-means (Lloyd) ----------
  K.nearest = (x, mu) => { let b = 0, bd = Infinity; for (let k = 0; k < mu.length; k++) { const d = (x[0] - mu[k][0]) ** 2 + (x[1] - mu[k][1]) ** 2; if (d < bd) { bd = d; b = k; } } return b; }; // égalités : plus petit indice
  K.assign = (X, mu) => X.map(x => K.nearest(x, mu));
  K.means = (X, r, mu) => mu.map((m, k) => { let s0 = 0, s1 = 0, n = 0; X.forEach((x, i) => { if (r[i] === k) { s0 += x[0]; s1 += x[1]; n++; } }); return n ? [s0 / n, s1 / n] : m.slice(); });
  K.J = (X, r, mu) => M.sum(X.map((x, i) => K.d2(x, mu[r[i]])));
  K.initRandom = (X, k, R) => { const idx = R.shuffle(M.range(X.length)).slice(0, k); return idx.map(i => X[i].slice()); };
  K.initPP = (X, k, R) => { // k-means++ : chaque nouveau centre est tiré avec une probabilité ∝ D(x)²
    const mu = [X[Math.floor(R.u() * X.length)].slice()];
    while (mu.length < k) {
      const D = X.map(x => Math.min(...mu.map(m => K.d2(x, m)))), tot = M.sum(D);
      let u = R.u() * tot, i = 0; while (i < X.length - 1 && u > D[i]) { u -= D[i]; i++; }
      mu.push(X[i].slice());
    }
    return mu;
  };
  K.lloyd = (X, mu0, maxIt = 200) => {
    let mu = mu0.map(m => m.slice()), r = null, it = 0;
    for (; it < maxIt; it++) {
      const rn = K.assign(X, mu);
      if (r && rn.every((v, i) => v === r[i])) break;
      r = rn; mu = K.means(X, r, mu);
    }
    return { mu, r, J: K.J(X, r, mu), it };
  };

  // ---------- soft k-means ----------
  K.softRow = (x, mu, beta) => { const l = mu.map(m => -beta * K.d2(x, m)), mx = Math.max(...l), e = l.map(v => Math.exp(v - mx)), z = M.sum(e); return e.map(v => v / z); };
  K.softR = (X, mu, beta) => X.map(x => K.softRow(x, mu, beta));
  K.wmeans = (X, R, mu) => mu.map((m, k) => { let s0 = 0, s1 = 0, n = 0; X.forEach((x, i) => { const w = R[i][k]; s0 += w * x[0]; s1 += w * x[1]; n += w; }); return n > 1e-12 ? [s0 / n, s1 / n] : m.slice(); });

  // ---------- GMM et EM ----------
  // θ = { pi: [K], mu: [K][2], S: [K][2×2] }
  K.estep = (X, th) => {
    let L = 0;
    const R = X.map(x => {
      const l = th.mu.map((m, k) => Math.log(th.pi[k]) + K.logN(x, m, th.S[k])), mx = Math.max(...l), e = l.map(v => Math.exp(v - mx)), z = M.sum(e);
      L += mx + Math.log(z); return e.map(v => v / z);
    });
    return { R, L };
  };
  K.loglik = (X, th) => K.estep(X, th).L;
  K.mstep = (X, R, old, eps = 1e-3) => {
    const N = X.length, k = R[0].length, th = { pi: [], mu: [], S: [] };
    for (let j = 0; j < k; j++) {
      let n = 0, a = 0, b = 0; X.forEach((x, i) => { const w = R[i][j]; n += w; a += w * x[0]; b += w * x[1]; });
      if (n < 1e-10) { th.pi.push(1e-10); th.mu.push(old.mu[j].slice()); th.S.push(old.S[j]); continue; }
      const m = [a / n, b / n]; let s00 = 0, s01 = 0, s11 = 0;
      X.forEach((x, i) => { const w = R[i][j], u = x[0] - m[0], v = x[1] - m[1]; s00 += w * u * u; s01 += w * u * v; s11 += w * v * v; });
      th.pi.push(n / N); th.mu.push(m); th.S.push(K.floor([[s00 / n, s01 / n], [s01 / n, s11 / n]], eps));
    }
    return th;
  };
  K.Nk = R => R[0].map((_, j) => M.sum(R.map(r => r[j])));
  // θ initial à partir d'un k-means : moyennes, covariances et proportions des groupes durs
  K.fromHard = (X, r, mu, eps = 1e-3) => K.mstep(X, X.map((_, i) => mu.map((_, k) => (r[i] === k ? 1 : 0))), { mu, S: mu.map(() => [[1, 0], [0, 1]]) }, Math.max(eps, 0.02));

  // ---------- 1D ----------
  K.npdf = (x, m, v) => Math.exp(-0.5 * (x - m) ** 2 / v) / Math.sqrt(2 * Math.PI * v);
})(window.ML);
