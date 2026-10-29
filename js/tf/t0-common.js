/* Chapitre 8 — Transformers : briques numériques (softmax par lignes, attention, couche de transformer complète,
   encodage positionnel sinusoïdal) et un mini-transformer décodeur entraînable (rétropropagation écrite à la main). */
(function (ML) {
  'use strict';
  const M = ML.math;
  const T = ML.tf = {};

  // ---------- matrices = tableaux de lignes ----------
  T.zeros = (n, m) => Array.from({ length: n }, () => new Array(m).fill(0));
  T.mm = (A, B) => {
    const n = A.length, k = B.length, m = B[0].length, C = T.zeros(n, m);
    for (let i = 0; i < n; i++) for (let l = 0; l < k; l++) { const a = A[i][l]; if (a) { const b = B[l], c = C[i]; for (let j = 0; j < m; j++) c[j] += a * b[j]; } }
    return C;
  };
  T.tr = A => A[0].map((_, j) => A.map(r => r[j]));
  T.add = (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j]));
  T.randn = (n, m, s, r) => Array.from({ length: n }, () => Array.from({ length: m }, () => s * r.n()));
  T.dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  T.permute = (X, p) => p.map(i => X[i]); // (PX) : la ligne k de PX est la ligne p[k] de X

  // Softmax ligne par ligne. mask(i, j) = true ⇒ score −∞ ⇒ poids 0 (attention masquée).
  T.softmaxRows = (S, mask) => S.map((row, i) => {
    let mx = -Infinity;
    row.forEach((v, j) => { if (!(mask && mask(i, j)) && v > mx) mx = v; });
    const e = row.map((v, j) => (mask && mask(i, j) ? 0 : Math.exp(v - mx))), z = M.sum(e);
    return e.map(v => v / z);
  });
  T.causal = (i, j) => j > i;
  // Attention(Q, K, V) = Softmax[QKᵀ/√D_k] V
  T.attention = (Q, K, V, { scale = true, mask = null } = {}) => {
    const c = scale ? 1 / Math.sqrt(Q[0].length) : 1;
    const S = T.mm(Q, T.tr(K)).map(r => r.map(v => v * c)), A = T.softmaxRows(S, mask);
    return { S, A, Y: T.mm(A, V) };
  };
  T.layerNorm = X => X.map(r => { const m = M.mean(r), v = M.mean(r.map(x => (x - m) ** 2)); return r.map(x => (x - m) / Math.sqrt(v + 1e-5)); });

  // Couche de transformer complète (post-norm, DL algorithme 12.3) : H têtes, MLP ReLU à une couche cachée.
  T.Layer = class {
    constructor(D, H, seed = 1) {
      const r = M.rng(seed), Dv = Math.max(1, Math.round(D / H)), s = 1 / Math.sqrt(D);
      this.D = D; this.H = H;
      this.heads = M.range(H).map(() => ({ Wq: T.randn(D, Dv, 1.6 * s, r), Wk: T.randn(D, Dv, 1.6 * s, r), Wv: T.randn(D, Dv, s, r) }));
      this.Wo = T.randn(H * Dv, D, 1 / Math.sqrt(H * Dv), r);
      this.W1 = T.randn(D, 2 * D, s, r); this.b1 = Array.from({ length: 2 * D }, () => 0.1 * r.n()); this.W2 = T.randn(2 * D, D, 1 / Math.sqrt(2 * D), r);
    }
    forward(X, { mask = null } = {}) {
      const Hs = this.heads.map(h => T.attention(T.mm(X, h.Wq), T.mm(X, h.Wk), T.mm(X, h.Wv), { mask }));
      const Y = T.mm(X.map((_, n) => [].concat(...Hs.map(h => h.Y[n]))), this.Wo);   // Concat[H_1..H_H] W^(o)
      const Z = T.layerNorm(T.add(Y, X));                                               // Z = LayerNorm[Y(X) + X]
      const F = T.mm(T.mm(Z, this.W1).map(r => r.map((v, j) => Math.max(0, v + this.b1[j]))), this.W2);
      return { Xt: T.layerNorm(T.add(F, Z)), A: Hs.map(h => h.A), Z };                   // X̃ = LayerNorm[MLP[Z] + Z]
    }
  };

  // ---------- dessin ----------
  // Une rangée de tokens (boîtes) centrés en x0 + i·dx, à la hauteur y.
  T.tokens = (p, words, o = {}) => {
    const { x0 = 0, y = 0, dx = 1, w = 0.9, h = 0.55, fill = () => '#1d2b3c', stroke = () => '#4a5a6b', color = () => '#e8eef4', size = 13 } = o;
    words.forEach((t, i) => {
      const x = x0 + i * dx;
      p.rect(x - w / 2, y - h / 2, x + w / 2, y + h / 2, { color: stroke(i), width: 1.5, fill: fill(i), fillAlpha: 1 });
      p.text(x, y, t, { color: color(i), size, shadow: false });
    });
  };
  // Matrice en cases : la case (i, j) occupe [x0 + j, x0 + j + 1] × [y0 − i − 1, y0 − i] (unités du graphe).
  T.matrix = (p, A, o = {}) => {
    const { x0 = 0, y0 = 0, col = v => M.ramp(v), mask = null, fmt = null, size = 11, maskCol = '#6b2a30' } = o;
    A.forEach((row, i) => row.forEach((v, j) => {
      const x = x0 + j, y = y0 - i, m = mask && mask(i, j), c = m ? maskCol : col(v);
      p.rect(x, y - 1, x + 1, y, { color: '#000', width: 1, fill: c, fillAlpha: 1 });
      if (fmt && !m) { const [r, g, b] = M.hexToRgb(c), lum = 0.3 * r + 0.59 * g + 0.11 * b; p.text(x + 0.5, y - 0.5, fmt(v), { size, color: lum > 140 ? '#111' : '#eee', shadow: false }); }
    }));
  };
  // Couleur divergente : négatif → bleu, 0 → noir, positif → or.
  T.div = (v, s = 1) => { const t = M.clamp(v / s, -1, 1); return t < 0 ? M.mixHex('#0b0f14', M.C.blue, -t) : M.mixHex('#0b0f14', M.C.gold, t); };
  // Enveloppe convexe (chaîne monotone).
  T.hull = pts => {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };

  // Encodage positionnel sinusoïdal (DL éq. 12.25) : r_{n,i} = sin(n / L^{i/D}) si i pair, cos(n / L^{(i−1)/D}) si i impair.
  T.pe = (n, D, L = 30) => Array.from({ length: D }, (_, i) => (i % 2 === 0 ? Math.sin(n / L ** (i / D)) : Math.cos(n / L ** ((i - 1) / D))));

  // ---------- mini-transformer décodeur, entraîné par prédiction du token suivant ----------
  // Tâche « répéter » : une suite aléatoire a_1..a_P de lettres, puis la même suite.
  //   entrées  x = (⟨start⟩, a_1, …, a_P, a_1, …, a_{P−1})      (longueur 2P)
  //   cibles   y = (a_1, …, a_P, a_1, …, a_P)                    (le token suivant à chaque position)
  // La première moitié est imprévisible (perte ≥ ln K) ; la seconde demande de regarder P−1 positions en arrière.
  // Modèle : X⁰ = E[x] + R (positions) ; une tête d'attention causale ; Z = X⁰ + Softmax[QKᵀ/√D + masque] V ; logits = Z W^(p) + b.
  T.Copy = class {
    constructor({ P = 5, D = 16, K = 8, pe = 'sin', seed = 1 } = {}) {
      const r = M.rng(seed), s = 1 / Math.sqrt(D);
      Object.assign(this, { P, D, K, N: 2 * P, pe, START: K });
      this.p = { E: T.randn(K + 1, D, 1, r), Wq: T.randn(D, D, s, r), Wk: T.randn(D, D, s, r), Wv: T.randn(D, D, s, r), Wp: T.randn(D, K, s, r), bp: [new Array(K).fill(0)],
        R: pe === 'learn' ? T.randn(2 * P, D, 0.3, r) : pe === 'sin' ? M.range(2 * P).map(n => T.pe(n, D, 30)) : T.zeros(2 * P, D) };
      this.train = ['E', 'Wq', 'Wk', 'Wv', 'Wp', 'bp'].concat(pe === 'learn' ? ['R'] : []);
      this.m = {}; this.v = {}; this.t = 0;
      for (const k of this.train) { this.m[k] = T.zeros(this.p[k].length, this.p[k][0].length); this.v[k] = T.zeros(this.p[k].length, this.p[k][0].length); }
    }
    sample(r) {
      const a = M.range(this.P).map(() => r.int(this.K));
      return { x: [this.START, ...a, ...a.slice(0, this.P - 1)], y: [...a, ...a] };
    }
    forward(x) {
      const p = this.p, c = 1 / Math.sqrt(this.D);
      const X0 = x.map((t, n) => p.E[t].map((v, j) => v + p.R[n][j]));
      const Q = T.mm(X0, p.Wq), Kk = T.mm(X0, p.Wk), V = T.mm(X0, p.Wv);
      const S = T.mm(Q, T.tr(Kk)).map(rw => rw.map(v => v * c)), A = T.softmaxRows(S, T.causal);
      const H = T.mm(A, V), Z = T.add(X0, H);
      const L = T.mm(Z, p.Wp).map(rw => rw.map((v, j) => v + p.bp[0][j]));
      const Pr = T.softmaxRows(L);
      return { x, X0, Q, K: Kk, V, A, H, Z, Pr };
    }
    // perte = moyenne des −log p(y_n | x_≤n) ; renvoie aussi les gradients (accumulés sur le mini-batch)
    lossGrad(batch, grad = true) {
      const p = this.p, c = 1 / Math.sqrt(this.D), N = this.N, cnt = batch.length * N;
      const g = {}; if (grad) for (const k of this.train) g[k] = T.zeros(p[k].length, p[k][0].length);
      let loss = 0, loss2 = 0;
      for (const { x, y } of batch) {
        const f = this.forward(x);
        f.Pr.forEach((pr, n) => { const l = -Math.log(pr[y[n]] + 1e-300); loss += l; if (n >= this.P) loss2 += l; });
        if (!grad) continue;
        const dL = f.Pr.map((pr, n) => pr.map((v, j) => (v - (j === y[n] ? 1 : 0)) / cnt));
        const add = (G, D2) => D2.forEach((rw, i) => rw.forEach((v, j) => { G[i][j] += v; }));
        add(g.Wp, T.mm(T.tr(f.Z), dL)); dL.forEach(rw => rw.forEach((v, j) => { g.bp[0][j] += v; }));
        const dZ = T.mm(dL, T.tr(p.Wp));
        const dX0 = dZ.map(rw => rw.slice());                 // branche résiduelle
        const dA = T.mm(dZ, T.tr(f.V)), dV = T.mm(T.tr(f.A), dZ);
        const dS = f.A.map((a, i) => { const s = T.dot(a, dA[i]); return a.map((v, j) => v * (dA[i][j] - s) * c); });
        const dQ = T.mm(dS, f.K), dK = T.mm(T.tr(dS), f.Q);
        add(g.Wq, T.mm(T.tr(f.X0), dQ)); add(g.Wk, T.mm(T.tr(f.X0), dK)); add(g.Wv, T.mm(T.tr(f.X0), dV));
        add(dX0, T.mm(dQ, T.tr(p.Wq))); add(dX0, T.mm(dK, T.tr(p.Wk))); add(dX0, T.mm(dV, T.tr(p.Wv)));
        dX0.forEach((rw, n) => rw.forEach((v, j) => { g.E[x[n]][j] += v; if (g.R) g.R[n][j] += v; }));
      }
      return { loss: loss / cnt, loss2: loss2 / (batch.length * this.P), g };
    }
    step(r, { B = 16, lr = 0.01 } = {}) {
      const batch = M.range(B).map(() => this.sample(r)), { loss, loss2, g } = this.lossGrad(batch);
      const b1 = 0.9, b2 = 0.999; this.t++;
      const c1 = 1 - b1 ** this.t, c2 = 1 - b2 ** this.t;
      for (const k of this.train) {
        const P0 = this.p[k], m = this.m[k], v = this.v[k], G = g[k];
        for (let i = 0; i < P0.length; i++) for (let j = 0; j < P0[i].length; j++) {
          const gg = G[i][j]; m[i][j] = b1 * m[i][j] + (1 - b1) * gg; v[i][j] = b2 * v[i][j] + (1 - b2) * gg * gg;
          P0[i][j] -= lr * (m[i][j] / c1) / (Math.sqrt(v[i][j] / c2) + 1e-8);
        }
      }
      return { loss, loss2 };
    }
    evaluate(nSeq = 200, seed = 99) {
      const r = M.rng(seed), batch = M.range(nSeq).map(() => this.sample(r)), { loss, loss2 } = this.lossGrad(batch, false);
      let ok = 0; batch.forEach(({ x, y }) => { const f = this.forward(x); for (let n = this.P; n < this.N; n++) { const pr = f.Pr[n]; if (pr.indexOf(Math.max(...pr)) === y[n]) ok++; } });
      return { loss, loss2, acc2: ok / (nSeq * this.P) };
    }
    // génération autorégressive gloutonne : on donne a_1..a_P, le modèle écrit la suite token par token
    generate(a) {
      const x = [this.START, ...a], out = [];
      while (x.length < this.N) { const f = this.forward(x), pr = f.Pr[x.length - 1], t = pr.indexOf(Math.max(...pr)); out.push({ t, p: pr[t] }); x.push(t); }
      const f = this.forward(x), pr = f.Pr[this.N - 1], t = pr.indexOf(Math.max(...pr)); out.push({ t, p: pr[t] });
      return out;
    }
  };
})(window.ML);
