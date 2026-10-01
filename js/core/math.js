/* ==========================================================================
   ML.math — petite algèbre linéaire, RNG à graine, utilitaires numériques.
   Tout est en tableaux JS simples : vecteur = number[], matrice = number[][].
   ========================================================================== */
window.ML = window.ML || {};
(function (ML) {
  'use strict';

  const M = {};

  // ---------- scalaires ----------
  M.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  M.lerp = (a, b, t) => a + (b - a) * t;
  M.sigmoid = t => t >= 0 ? 1 / (1 + Math.exp(-t)) : Math.exp(t) / (1 + Math.exp(t));
  M.softplus = t => t > 30 ? t : Math.log1p(Math.exp(t));
  M.gauss = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  M.linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  M.range = n => Array.from({ length: n }, (_, i) => i);
  M.sum = v => v.reduce((s, x) => s + x, 0);
  M.mean = v => M.sum(v) / v.length;
  M.smooth = t => t * t * (3 - 2 * t);
  M.fmt = (x, d = 3) => {
    if (!isFinite(x)) return x > 0 ? '∞' : (x < 0 ? '−∞' : 'NaN');
    const a = Math.abs(x);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) return x.toExponential(Math.max(1, d - 1)).replace('-', '−');
    return x.toFixed(d).replace('-', '−');
  };

  // ---------- vecteurs ----------
  M.dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  M.add = (a, b) => a.map((x, i) => x + b[i]);
  M.sub = (a, b) => a.map((x, i) => x - b[i]);
  M.scale = (a, k) => a.map(x => x * k);
  M.axpy = (k, x, y) => y.map((yi, i) => yi + k * x[i]); // y + k x
  M.norm = a => Math.sqrt(M.dot(a, a));
  M.norm1 = a => a.reduce((s, x) => s + Math.abs(x), 0);
  M.zeros = n => new Array(n).fill(0);

  // ---------- matrices ----------
  M.mat = (r, c, f = 0) => Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => typeof f === 'function' ? f(i, j) : f));
  M.eye = n => M.mat(n, n, (i, j) => i === j ? 1 : 0);
  M.T = A => A[0].map((_, j) => A.map(r => r[j]));
  M.matmul = (A, B) => {
    const n = A.length, m = B[0].length, k = B.length, C = M.mat(n, m);
    for (let i = 0; i < n; i++) for (let l = 0; l < k; l++) { const a = A[i][l]; if (a === 0) continue; for (let j = 0; j < m; j++) C[i][j] += a * B[l][j]; }
    return C;
  };
  M.matvec = (A, v) => A.map(r => M.dot(r, v));
  M.vecmat = (v, A) => A[0].map((_, j) => A.reduce((s, r, i) => s + v[i] * r[j], 0)); // vᵀA
  M.gram = A => { // AᵀA
    const n = A[0].length, G = M.mat(n, n);
    for (const r of A) for (let i = 0; i < n; i++) { const ri = r[i]; for (let j = i; j < n; j++) G[i][j] += ri * r[j]; }
    for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) G[i][j] = G[j][i];
    return G;
  };
  M.Atv = (A, v) => { const n = A[0].length, out = M.zeros(n); A.forEach((r, i) => { for (let j = 0; j < n; j++) out[j] += r[j] * v[i]; }); return out; };
  M.addDiag = (A, d) => A.map((r, i) => r.map((x, j) => i === j ? x + d : x));

  // Résolution Ax = b par élimination de Gauss avec pivot partiel.
  M.solve = (A, b) => {
    const n = A.length, a = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
      if (Math.abs(a[p][c]) < 1e-300) return null;
      [a[c], a[p]] = [a[p], a[c]];
      for (let r = c + 1; r < n; r++) {
        const f = a[r][c] / a[c][c];
        if (f === 0) continue;
        for (let k = c; k <= n; k++) a[r][k] -= f * a[c][k];
      }
    }
    const x = M.zeros(n);
    for (let r = n - 1; r >= 0; r--) {
      let s = a[r][n];
      for (let k = r + 1; k < n; k++) s -= a[r][k] * x[k];
      x[r] = s / a[r][r];
    }
    return x;
  };
  M.inv = A => { const n = A.length, cols = M.eye(n).map(e => M.solve(A, e)); return cols[0] ? M.T(cols) : null; };

  // Décomposition spectrale d'une matrice symétrique (méthode de Jacobi).
  // Renvoie { values: [λ1 ≥ λ2 ≥ ...], vectors: V (colonnes = vecteurs propres) }.
  M.eigSym = (S) => {
    const n = S.length, A = S.map(r => r.slice()), V = M.eye(n);
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
      if (off < 1e-22) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = A[k][p], akq = A[k][q];
          A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k], aqk = A[q][k];
          A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq;
        }
      }
    }
    const idx = M.range(n).sort((i, j) => A[j][j] - A[i][i]);
    return { values: idx.map(i => A[i][i]), vectors: V.map(r => idx.map(i => r[i])) };
  };

  // Pseudo-inverse de Moore–Penrose appliquée : Φ† y = V Σ⁺ Vᵀ Φᵀ y (via eig de ΦᵀΦ).
  M.pinvSolve = (Phi, y, rtol = 1e-12) => {
    const G = M.gram(Phi), { values, vectors } = M.eigSym(G), r = M.Atv(Phi, y);
    const tol = rtol * Math.max(...values.map(Math.abs), 1e-300);
    const n = G.length, w = M.zeros(n);
    for (let k = 0; k < n; k++) {
      if (values[k] <= tol) continue;
      const vk = vectors.map(row => row[k]);
      const c = M.dot(vk, r) / values[k];
      for (let i = 0; i < n; i++) w[i] += c * vk[i];
    }
    return w;
  };
  M.cond = S => { const v = M.eigSym(S).values; return v[0] / Math.max(v[v.length - 1], 1e-300); };

  // ---------- QR de Householder (stable, évite de former ΦᵀΦ) ----------
  // Renvoie { R (n×n triangulaire sup.), qty : Qᵀb (n premières composantes) } pour A (m×n), m ≥ n.
  const householder = (A, b) => {
    const m = A.length, n = A[0].length, a = A.map(r => r.slice()), v = b.slice(), refl = [];
    for (let k = 0; k < n; k++) {
      let norm = 0; for (let i = k; i < m; i++) norm += a[i][k] * a[i][k];
      norm = Math.sqrt(norm); if (norm === 0) { refl.push(null); continue; }
      const alpha = a[k][k] > 0 ? -norm : norm, u = new Array(m).fill(0);
      for (let i = k; i < m; i++) u[i] = a[i][k]; u[k] -= alpha;
      let un = 0; for (let i = k; i < m; i++) un += u[i] * u[i]; if (un === 0) { refl.push(null); continue; }
      refl.push({ k, u, un });
      for (let j = k; j < n; j++) { let s = 0; for (let i = k; i < m; i++) s += u[i] * a[i][j]; s = 2 * s / un; for (let i = k; i < m; i++) a[i][j] -= s * u[i]; }
      let s = 0; for (let i = k; i < m; i++) s += u[i] * v[i]; s = 2 * s / un; for (let i = k; i < m; i++) v[i] -= s * u[i];
    }
    // Q z  (z de taille n, complété par des zéros) = H_0 H_1 … H_{n-1} [z; 0]
    const applyQ = z => {
      const x = new Array(m).fill(0); for (let i = 0; i < n; i++) x[i] = z[i];
      for (let t = refl.length - 1; t >= 0; t--) {
        const r = refl[t]; if (!r) continue;
        let s = 0; for (let i = r.k; i < m; i++) s += r.u[i] * x[i]; s = 2 * s / r.un;
        for (let i = r.k; i < m; i++) x[i] -= s * r.u[i];
      }
      return x;
    };
    return { R: a.slice(0, n).map(r => r.slice(0, n)), qty: v.slice(0, n), applyQ };
  };
  const backsub = (R, b) => { const n = R.length, x = M.zeros(n); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= R[i][j] * x[j]; x[i] = Math.abs(R[i][i]) > 1e-300 ? s / R[i][i] : 0; } return x; };
  // Moindres carrés min ‖Φw − y‖ ; si N < L, solution de norme minimale (QR de Φᵀ).
  M.lstsq = (Phi, y) => {
    const N = Phi.length, L = Phi[0].length;
    if (N >= L) { const { R, qty } = householder(Phi, y); return backsub(R, qty); }
    // Φᵀ = QR  ⇒ Φ = RᵀQᵀ ; w = Q z avec Rᵀ z = y (triangulaire inférieur)
    const { R, applyQ } = householder(M.T(Phi), M.zeros(L));
    const z = M.zeros(N);
    for (let i = 0; i < N; i++) { let s = y[i]; for (let j = 0; j < i; j++) s -= R[j][i] * z[j]; z[i] = Math.abs(R[i][i]) > 1e-300 ? s / R[i][i] : 0; }
    return applyQ(z);
  };

  // ---------- régression ----------
  // Ridge : min 1/N‖y − Φw‖² + λ‖w‖²  ⇔  moindres carrés augmentés [Φ ; √(Nλ) I] w ≈ [y ; 0]
  // (même solution que (NλI + ΦᵀΦ)⁻¹Φᵀy, mais numériquement stable). λ = 0 → lstsq.
  M.ridge = (Phi, y, lambda = 0) => {
    const N = Phi.length, L = Phi[0].length;
    if (lambda <= 0) return M.lstsq(Phi, y);
    const s = Math.sqrt(N * lambda);
    const A = Phi.concat(M.range(L).map(i => M.range(L).map(j => i === j ? s : 0)));
    return M.lstsq(A, y.concat(M.zeros(L)));
  };
  M.mse = (Phi, y, w) => { let s = 0; for (let i = 0; i < y.length; i++) { const r = y[i] - M.dot(Phi[i], w); s += r * r; } return s / y.length; };

  // Lasso par descente de coordonnées : min 1/N‖y − Φw‖² + λ‖w‖₁
  M.softThreshold = (z, g) => z > g ? z - g : (z < -g ? z + g : 0);
  M.lasso = (Phi, y, lambda, opts = {}) => {
    const N = Phi.length, L = Phi[0].length;
    const w = opts.w0 ? opts.w0.slice() : M.zeros(L);
    const free = opts.free || []; // indices non pénalisés (ex. biais)
    const colsq = M.range(L).map(j => Phi.reduce((s, r) => s + r[j] * r[j], 0));
    const res = y.map((yi, i) => yi - M.dot(Phi[i], w));
    for (let it = 0; it < (opts.iters || 500); it++) {
      let maxd = 0;
      for (let j = 0; j < L; j++) {
        if (colsq[j] === 0) continue;
        let rho = 0;
        for (let i = 0; i < N; i++) rho += Phi[i][j] * (res[i] + Phi[i][j] * w[j]);
        // 1/N ‖r‖² + λ|w_j|  ⇒  w_j = S(ρ, Nλ/2) / ‖φ_j‖²
        const nw = free.includes(j) ? rho / colsq[j] : M.softThreshold(rho, N * lambda / 2) / colsq[j];
        const d = nw - w[j];
        if (d !== 0) { for (let i = 0; i < N; i++) res[i] -= Phi[i][j] * d; w[j] = nw; maxd = Math.max(maxd, Math.abs(d)); }
      }
      if (maxd < 1e-10) break;
    }
    return w;
  };


  // ---------- régression logistique (étiquettes y ∈ {0,1}, X déjà augmenté) ----------
  M.logi = {
    nll: (X, y, w, lam = 0) => { let s = 0; for (let n = 0; n < X.length; n++) { const a = M.dot(X[n], w); s += y[n] ? M.softplus(-a) : M.softplus(a); } return s + lam * M.dot(w, w); },
    grad: (X, y, w, lam = 0) => { const g = M.scale(w, 2 * lam); for (let n = 0; n < X.length; n++) { const e = M.sigmoid(M.dot(X[n], w)) - y[n]; for (let j = 0; j < w.length; j++) g[j] += e * X[n][j]; } return g; },
    hess: (X, y, w, lam = 0) => { const D = w.length, H = M.mat(D, D); for (const x of X) { const p = M.sigmoid(M.dot(x, w)), r = p * (1 - p); for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) H[i][j] += r * x[i] * x[j]; } for (let i = 0; i < D; i++) H[i][i] += 2 * lam; return H; },
    newtonStep: (X, y, w, lam = 0) => { const d = M.solve(M.addDiag(M.logi.hess(X, y, w, lam), 1e-9), M.logi.grad(X, y, w, lam)); return d ? M.sub(w, d) : w; },
    fit: (X, y, lam = 1e-4, iters = 40) => { let w = M.zeros(X[0].length); for (let k = 0; k < iters; k++) { const nw = M.logi.newtonStep(X, y, w, lam); if (!nw.every(isFinite)) break; const done = M.norm(M.sub(nw, w)) < 1e-10; w = nw; if (done) break; } return w; },
  };
  M.gauss2 = (x, y, mu, S) => { // densité gaussienne 2D
    const det = S[0][0] * S[1][1] - S[0][1] * S[1][0], a = x - mu[0], b = y - mu[1];
    const q = (S[1][1] * a * a - 2 * S[0][1] * a * b + S[0][0] * b * b) / det;
    return Math.exp(-0.5 * q) / (2 * Math.PI * Math.sqrt(det));
  };
  M.chol2 = S => { const l11 = Math.sqrt(S[0][0]), l21 = S[1][0] / l11; return [[l11, 0], [l21, Math.sqrt(Math.max(1e-12, S[1][1] - l21 * l21))]]; };


  // ---------- SVM : dual résolu par SMO (sélection de la paire la plus violante, style LIBSVM) ----------
  // min ½αᵀQα − 1ᵀα  s.c. 0 ≤ α ≤ C, yᵀα = 0,  Q_ij = y_i y_j κ(x_i, x_j)
  M.kernels = {
    linear: () => (a, b) => M.dot(a, b),
    poly: (d = 2, c = 0, g = 1) => (a, b) => (g * M.dot(a, b) + c) ** d,
    rbf: (sigma = 1) => (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return Math.exp(-s / (2 * sigma * sigma)); },
  };
  M.svm = (X, y, kernel, C = 1e6, opts = {}) => {
    const N = X.length, K = M.mat(N, N, (i, j) => kernel(X[i], X[j]));
    const Q = (i, j) => y[i] * y[j] * K[i][j];
    const a = new Array(N).fill(0), G = new Array(N).fill(-1), eps = opts.eps || 1e-5, TAU = 1e-12;
    const up = t => (y[t] > 0 && a[t] < C) || (y[t] < 0 && a[t] > 0);
    const low = t => (y[t] > 0 && a[t] > 0) || (y[t] < 0 && a[t] < C);
    let it = 0;
    for (; it < (opts.maxIter || 20000); it++) {
      let i = -1, gmax = -Infinity, j = -1, gmin = Infinity;
      for (let t = 0; t < N; t++) { const v = -y[t] * G[t]; if (up(t) && v > gmax) { gmax = v; i = t; } if (low(t) && v < gmin) { gmin = v; j = t; } }
      if (i < 0 || j < 0 || gmax - gmin < eps) break;
      const ai = a[i], aj = a[j];
      if (y[i] !== y[j]) {
        let q = Q(i, i) + Q(j, j) + 2 * Q(i, j); if (q <= 0) q = TAU;
        const delta = (-G[i] - G[j]) / q, diff = a[i] - a[j];
        a[i] += delta; a[j] += delta;
        if (diff > 0) { if (a[j] < 0) { a[j] = 0; a[i] = diff; } } else if (a[i] < 0) { a[i] = 0; a[j] = -diff; }
        if (diff > 0) { if (a[i] > C) { a[i] = C; a[j] = C - diff; } } else if (a[j] > C) { a[j] = C; a[i] = C + diff; }
      } else {
        let q = Q(i, i) + Q(j, j) - 2 * Q(i, j); if (q <= 0) q = TAU;
        const delta = (G[i] - G[j]) / q, sum = a[i] + a[j];
        a[i] -= delta; a[j] += delta;
        if (sum > C) { if (a[i] > C) { a[i] = C; a[j] = sum - C; } } else if (a[j] < 0) { a[j] = 0; a[i] = sum; }
        if (sum > C) { if (a[j] > C) { a[j] = C; a[i] = sum - C; } } else if (a[i] < 0) { a[i] = 0; a[j] = sum; }
      }
      const di = a[i] - ai, dj = a[j] - aj;
      for (let t = 0; t < N; t++) G[t] += Q(t, i) * di + Q(t, j) * dj;
    }
    // biais : moyenne sur les vecteurs de support libres (0 < α < C), sinon milieu de l'intervalle admissible
    let rs = 0, nf = 0, ub = Infinity, lb = -Infinity; // ρ = −b, calcul identique à LIBSVM
    for (let t = 0; t < N; t++) {
      const yG = y[t] * G[t], atU = a[t] >= C * (1 - 1e-12), atL = a[t] <= 0;
      if (atU) { if (y[t] < 0) ub = Math.min(ub, yG); else lb = Math.max(lb, yG); }
      else if (atL) { if (y[t] > 0) ub = Math.min(ub, yG); else lb = Math.max(lb, yG); }
      else { rs += yG; nf++; }
    }
    const rho = nf ? rs / nf : (isFinite(ub) && isFinite(lb) ? (ub + lb) / 2 : (isFinite(ub) ? ub : isFinite(lb) ? lb : 0));
    const b = -rho;
    const f = x => { let s = b; for (let t = 0; t < N; t++) if (a[t] > 0) s += a[t] * y[t] * kernel(X[t], x); return s; };
    const dual = M.sum(a) - 0.5 * M.sum(a.map((ai, i) => ai * M.sum(a.map((aj, j) => aj * Q(i, j)))));
    return { alpha: a, b, f, iters: it, K, dual, C };
  };
  // w explicite pour le noyau linéaire
  M.svmW = (X, y, alpha) => { const w = M.zeros(X[0].length); X.forEach((x, i) => { for (let k = 0; k < w.length; k++) w[k] += alpha[i] * y[i] * x[k]; }); return w; };

  // ---------- bases ----------
  M.basis = {
    poly: (M_) => x => Array.from({ length: M_ + 1 }, (_, k) => x ** k),
    gauss: (centers, s) => x => [1, ...centers.map(c => Math.exp(-((x - c) ** 2) / (2 * s * s)))],
    sigmoid: (centers, s) => x => [1, ...centers.map(c => M.sigmoid((x - c) / s))],
    fourier: (K) => x => { const f = [1]; for (let k = 1; k <= K; k++) f.push(Math.sin(2 * Math.PI * k * x), Math.cos(2 * Math.PI * k * x)); return f; },
  };
  M.design = (xs, phi) => xs.map(phi);

  // ---------- RNG à graine (mulberry32) ----------
  M.rng = (seed = 0) => {
    let a = (seed >>> 0) || 0x9e3779b9;
    const u = () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let spare = null;
    const n = () => { // N(0,1) par Box–Muller
      if (spare !== null) { const s = spare; spare = null; return s; }
      let u1 = 0; while (u1 === 0) u1 = u();
      const r = Math.sqrt(-2 * Math.log(u1)), th = 2 * Math.PI * u();
      spare = r * Math.sin(th); return r * Math.cos(th);
    };
    return { u, n, uniform: (lo, hi) => lo + (hi - lo) * u(), normal: (mu = 0, s = 1) => mu + s * n(), int: k => Math.floor(u() * k),
      shuffle: arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; } };
  };

  // Jeu de données du HW1 : x ~ U[0,1], y = sin(2πx) + ε, ε ~ N(0, 0.2²)
  M.sinData = (N, seed = 0, noise = 0.2) => {
    const r = M.rng(seed), xs = [], ys = [];
    for (let i = 0; i < N; i++) { const x = r.u(); xs.push(x); ys.push(Math.sin(2 * Math.PI * x) + noise * r.n()); }
    return { xs, ys };
  };

  // ---------- couleurs ----------
  M.hexToRgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  M.rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(M.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  M.mixHex = (a, b, t) => { const A = M.hexToRgb(a), B = M.hexToRgb(b); return M.rgbToHex(A.map((x, i) => x + (B[i] - x) * t)); };
  // palette séquentielle « manim » : bleu foncé → bleu → vert → jaune
  const RAMP = ['#0b1d3a', '#1c4f8a', '#29abca', '#5cd0b3', '#83c167', '#f4d345', '#fff6c2'];
  M.ramp = (t, ramp = RAMP) => {
    t = (isFinite(t) ? M.clamp(t, 0, 1) : 0) * (ramp.length - 1);
    const i = Math.min(Math.floor(t), ramp.length - 2);
    return M.mixHex(ramp[i], ramp[i + 1], t - i);
  };
  M.rampRgb = (t, ramp = RAMP) => M.hexToRgb(M.ramp(t, ramp));
  // divergente : rouge ← noir → bleu
  M.divRgb = t => { t = M.clamp(t, -1, 1); const a = Math.abs(t) ** 0.8; return t < 0 ? [252 * a, 98 * a, 85 * a] : [88 * a, 196 * a, 221 * a]; };

  M.C = {
    blue: '#58c4dd', blueD: '#29abca', teal: '#5cd0b3', green: '#83c167', yellow: '#f4d345', yellowP: '#ffff00',
    gold: '#f0ac5f', red: '#fc6255', maroon: '#c55f73', purple: '#9a72ac', pink: '#d147bd', grey: '#888888',
    white: '#ffffff', dim: '#6b7280', grid: '#1d3b4c', gridFaint: '#12222c', axis: '#c8d3db',
  };
  M.series = ['#58c4dd', '#fc6255', '#83c167', '#f4d345', '#9a72ac', '#f0ac5f', '#5cd0b3', '#d147bd', '#c55f73', '#888888', '#29abca', '#e07a5f', '#b8e986', '#ffffff', '#7d5ba6'];

  // Portion de la droite {x0 + s·t} contenue dans le carré [−R, R]² (ou null).
  ML.clipLine = (x0, t, R) => {
    let lo = -Infinity, hi = Infinity;
    for (let i = 0; i < 2; i++) {
      if (Math.abs(t[i]) < 1e-12) { if (Math.abs(x0[i]) > R) return null; continue; }
      const a = (-R - x0[i]) / t[i], b = (R - x0[i]) / t[i];
      lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
    }
    if (!(hi > lo)) return null;
    return [[x0[0] + lo * t[0], x0[1] + lo * t[1]], [x0[0] + hi * t[0], x0[1] + hi * t[1]]];
  };
  ML.math = M;
})(window.ML);
