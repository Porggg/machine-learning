/* Chapitre 5 — Réseaux de neurones · outils communs : petit MLP, rétropropagation, jeux de données 2D.
   Convention : sortie binaire = un logit z, p = σ(z), perte BCE ; y ∈ {0, 1}.
   Couche ℓ : z = W h + b (W : sortie × entrée, en tableaux JS), h' = φ(z). */
(function (ML) {
  'use strict';
  const M = ML.math;
  const ACT = {
    tanh: { name: 'tanh', f: z => Math.tanh(z), d: (z, h) => 1 - h * h },
    relu: { name: 'ReLU', f: z => (z > 0 ? z : 0), d: z => (z > 0 ? 1 : 0) },
    leaky: { name: 'Leaky ReLU', f: z => (z > 0 ? z : 0.1 * z), d: z => (z > 0 ? 1 : 0.1) },
    sigmoid: { name: 'sigmoïde', f: z => M.sigmoid(z), d: (z, h) => h * (1 - h) },
  };
  // initialisation : W ~ N(0, s²/n_in) (Xavier / He selon l'activation), b = 0
  const init = (sizes, seed = 1, act = 'tanh') => {
    const r = M.rng(seed), gain = act === 'relu' || act === 'leaky' ? Math.sqrt(2) : 1;
    const layers = [];
    for (let l = 1; l < sizes.length; l++) {
      const nin = sizes[l - 1], nout = sizes[l], s = gain / Math.sqrt(nin);
      layers.push({ W: M.range(nout).map(() => M.range(nin).map(() => s * r.n())), b: M.zeros(nout) });
    }
    return { sizes: sizes.slice(), layers, act, vel: null };
  };
  // passe avant : renvoie les pré-activations z(ℓ) et activations h(ℓ) (h(0) = x)
  const forward = (net, x) => {
    const A = ACT[net.act], zs = [], hs = [x];
    let h = x;
    net.layers.forEach((L, l) => {
      const z = L.W.map((row, i) => { let s = L.b[i]; for (let j = 0; j < row.length; j++) s += row[j] * h[j]; return s; });
      zs.push(z);
      if (l < net.layers.length - 1) { h = z.map(A.f); hs.push(h); }
    });
    return { zs, hs, logit: zs[zs.length - 1][0] };
  };
  const prob = (net, x) => M.sigmoid(forward(net, x).logit);
  const bce = (z, y) => M.softplus(z) - y * z; // −y log σ(z) − (1−y) log(1−σ(z)), forme stable
  // perte moyenne et gradients (rétropropagation) sur les indices idx
  const lossGrad = (net, X, Y, idx) => {
    const A = ACT[net.act], g = net.layers.map(L => ({ W: L.W.map(r => r.map(() => 0)), b: L.b.map(() => 0) }));
    let loss = 0;
    for (const n of idx) {
      const fw = forward(net, X[n]), z = fw.logit, p = M.sigmoid(z);
      loss += bce(z, Y[n]);
      let delta = [p - Y[n]]; // ∂ℓ/∂z(L) = p − y
      for (let l = net.layers.length - 1; l >= 0; l--) {
        const L = net.layers[l], hprev = fw.hs[l];
        for (let i = 0; i < delta.length; i++) { g[l].b[i] += delta[i]; for (let j = 0; j < hprev.length; j++) g[l].W[i][j] += delta[i] * hprev[j]; } // δ hᵀ, δ
        if (l > 0) {
          const back = M.zeros(hprev.length);
          for (let i = 0; i < delta.length; i++) for (let j = 0; j < hprev.length; j++) back[j] += L.W[i][j] * delta[i]; // Wᵀ δ
          delta = back.map((v, j) => v * A.d(fw.zs[l - 1][j], hprev[j])); // ⊙ φ'(z)
        }
      }
    }
    const k = 1 / Math.max(1, idx.length);
    g.forEach(G => { G.b = G.b.map(v => v * k); G.W = G.W.map(r => r.map(v => v * k)); });
    return { loss: loss * k, g };
  };
  // un pas de descente de gradient avec momentum (β = 0 : GD simple)
  const step = (net, g, lr, beta = 0.9) => {
    if (!net.vel) net.vel = g.map(G => ({ W: G.W.map(r => r.map(() => 0)), b: G.b.map(() => 0) }));
    net.layers.forEach((L, l) => {
      const V = net.vel[l], G = g[l];
      for (let i = 0; i < L.b.length; i++) {
        V.b[i] = beta * V.b[i] - lr * G.b[i]; L.b[i] += V.b[i];
        for (let j = 0; j < L.W[i].length; j++) { V.W[i][j] = beta * V.W[i][j] - lr * G.W[i][j]; L.W[i][j] += V.W[i][j]; }
      }
    });
  };
  const accuracy = (net, X, Y) => M.mean(X.map((x, n) => ((forward(net, x).logit >= 0 ? 1 : 0) === Y[n] ? 1 : 0)));
  // jeux de données binaires (y ∈ {0,1})
  const DATA = {
    xor: (N, seed, s = 0.18) => { const r = M.rng(seed), X = [], Y = []; for (let n = 0; n < N; n++) { const a = n % 4, cx = a & 1 ? 1 : -1, cy = a & 2 ? 1 : -1; X.push([cx * 0.9 + s * r.n(), cy * 0.9 + s * r.n()]); Y.push(cx * cy < 0 ? 1 : 0); } return { X, Y }; },
    circles: (N, seed, s = 0.12) => { const r = M.rng(seed), X = [], Y = []; for (let n = 0; n < N; n++) { const y = n % 2, t = r.uniform(0, 2 * Math.PI), rad = (y ? 0.55 : 1.35) + s * r.n(); X.push([rad * Math.cos(t), rad * Math.sin(t)]); Y.push(y); } return { X, Y }; },
    moons: (N, seed, s = 0.12) => { const r = M.rng(seed), X = [], Y = []; for (let n = 0; n < N; n++) { const y = n % 2, t = r.uniform(0, Math.PI); const p = y ? [1 - Math.cos(t) - 0.5, 0.35 - Math.sin(t) + 0.1] : [Math.cos(t) - 0.5, Math.sin(t) - 0.1]; X.push([p[0] * 1.1 + s * r.n(), p[1] * 1.1 + s * r.n()]); Y.push(y); } return { X, Y }; },
    spiral: (N, seed, s = 0.06) => { const r = M.rng(seed), X = [], Y = []; for (let n = 0; n < N; n++) { const y = n % 2, t = r.uniform(0.25, 1) * 3.2 * Math.PI / 2 + 0.3, rad = t / 5.4, a = t + (y ? Math.PI : 0); X.push([rad * Math.cos(a) * 1.5 + s * r.n(), rad * Math.sin(a) * 1.5 + s * r.n()]); Y.push(y); } return { X, Y }; },
  };
  ML.nn = { ACT, init, forward, prob, bce, lossGrad, step, accuracy, DATA };
})(window.ML);
