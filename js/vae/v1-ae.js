/* Chapitre 7 — §1–2 : autoencodeur linéaire (= ACP), autoencodeur non linéaire, estimation de densité par maximum de vraisemblance */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, V = ML.vae;
  const zCol = (z, lo = -2.5, hi = 2.5) => M.ramp(0.12 + 0.8 * (z - lo) / (hi - lo));
  const stats2 = X => {
    const n = X.length, c = [M.sum(X.map(p => p[0])) / n, M.sum(X.map(p => p[1])) / n];
    let a = 0, b = 0, d = 0; X.forEach(([x, y]) => { a += (x - c[0]) ** 2; b += (x - c[0]) * (y - c[1]); d += (y - c[1]) ** 2; });
    const S = [[a / n, b / n], [b / n, d / n]], E = M.eigSym(S);
    const order = E.values[0] >= E.values[1] ? [0, 1] : [1, 0];
    return { c, S, l1: E.values[order[0]], l2: E.values[order[1]], u1: [E.vectors[0][order[0]], E.vectors[1][order[0]]] };
  };

  // ------------------------------------------------------------------ vae-pca
  ML.scene('vae-pca', host => {
    const W = ML.widget(host, {
      title: 'Autoencodeur linéaire $D = 2\\to M = 1\\to2$ : la meilleure direction est celle de l\'ACP (slides 4–6)', tag: '2D',
      views: [{ name: 'd', label: 'données $x_n$, code $z_n = u^\\top(x_n-\\bar x)$, reconstruction $\\hat x_n = \\bar x+u\\,z_n$', cls: 'tall' }, { name: 'e', label: 'erreur de reconstruction moyenne en fonction de la direction $u = (\\cos\\theta,\\sin\\theta)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>droite de décodage $\\{\\bar x+u z\\}$</span><span class="key"><i style="background:#fc6255"></i>erreurs $x_n-\\hat x_n$</span><span class="key"><i style="background:#83c167"></i>optimum : $\\lambda_2$ (plus petite valeur propre)</span>',
    });
    const st = { kind: 'gauss', th: 0.2, X: null, s: null };
    const load = () => { st.X = V.data(st.kind, 160, 4); st.s = stats2(st.X); };
    const err = th => { const u = [Math.cos(th), Math.sin(th)], { S } = st.s; return S[0][0] + S[1][1] - (u[0] * u[0] * S[0][0] + 2 * u[0] * u[1] * S[0][1] + u[1] * u[1] * S[1][1]); };
    W.toggle('res', 'erreurs de reconstruction', true);
    W.toggle('pc', 'direction de l\'ACP', false);
    const P = new ML.Plot2D(W.views.d, { xlim: [-3.6, 3.6], ylim: [-3.6, 3.6], gridStep: [1, 1] });
    const E = new ML.Plot2D(W.views.e, { xlim: [0, Math.PI], ylim: [0, 3], xlabel: '\\theta', gridStep: [Math.PI / 4, 0.5], tickFmt: (v, ax) => (ax === 'x' ? ['0', 'π/4', 'π/2', '3π/4', 'π'][Math.round(v / (Math.PI / 4))] ?? '' : String(+v.toFixed(2))) });
    P.onDraw = p => {
      const { c } = st.s, u = [Math.cos(st.th), Math.sin(st.th)];
      p.seg(c[0] - 6 * u[0], c[1] - 6 * u[1], c[0] + 6 * u[0], c[1] + 6 * u[1], { color: C.yellow, width: 2.5 });
      if (W.show.pc) { const v = st.s.u1; p.seg(c[0] - 6 * v[0], c[1] - 6 * v[1], c[0] + 6 * v[0], c[1] + 6 * v[1], { color: C.green, width: 1.5, dash: [6, 4] }); }
      st.X.forEach(x => {
        const z = u[0] * (x[0] - c[0]) + u[1] * (x[1] - c[1]), xh = [c[0] + u[0] * z, c[1] + u[1] * z];
        if (W.show.res) p.seg(x[0], x[1], xh[0], xh[1], { color: C.red, width: 1, alpha: 0.55 });
        p.point(xh[0], xh[1], { color: zCol(z, -3, 3), r: 2.5 });
        p.point(x[0], x[1], { color: '#ddd', r: 3 });
      });
      const hd = [c[0] + 2.4 * u[0], c[1] + 2.4 * u[1]];
      p.point(hd[0], hd[1], { color: C.yellow, r: 7, glow: true });
      p.tex('u', hd[0], hd[1], 'u', { color: C.yellow, dx: 14, dy: -12 });
    };
    P.addDraggable({ get: () => { const { c } = st.s; return [c[0] + 2.4 * Math.cos(st.th), c[1] + 2.4 * Math.sin(st.th)]; }, set: (x, y) => { const { c } = st.s; let th = Math.atan2(y - c[1], x - c[0]); if (th < 0) th += Math.PI; st.th = th % Math.PI; sT.set(st.th); upd(); }, r: 16 });
    E.onDraw = p => {
      p.fn(err, { color: C.blue, width: 2.5 }, [0, Math.PI]);
      p.hline(st.s.l2, { color: C.green, width: 1.5, dash: [5, 4] });
      p.hline(st.s.l1, { color: C.gold, width: 1, dash: [3, 4] });
      p.tex('l2', 0.05, st.s.l2, '\\lambda_2', { color: C.green, anchor: 'left', dy: -12 });
      p.tex('l1', 0.05, st.s.l1, '\\lambda_1', { color: C.gold, anchor: 'left', dy: -12 });
      p.point(st.th, err(st.th), { color: C.yellow, r: 7, glow: true });
    };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: V.DATA, onChange: v => { st.kind = v; load(); fit(); upd(); } });
    const sT = ui.slider(c, { label: 'direction $\\theta$ (ou tirer la poignée $u$)', min: 0, max: Math.PI, step: 0.001, value: st.th, digits: 2, onInput: v => { st.th = v; upd(); } });
    ui.buttons(c, [{ label: 'direction optimale (ACP)', primary: true, onClick: () => { let th = Math.atan2(st.s.u1[1], st.s.u1[0]); if (th < 0) th += Math.PI; st.th = th % Math.PI; sT.set(st.th); upd(); } }]);
    const ro = ui.readout(c);
    function fit() { const top = Math.max(1, st.s.l1 + st.s.l2) * 1.15; E.setLimits([0, Math.PI], [0, top]); }
    function upd() {
      const e = err(st.th), tot = st.s.l1 + st.s.l2;
      ro.set(`Erreur moyenne $\\frac1N\\sum_n\\|x_n-\\hat x_n\\|^2$ = <b>${e.toFixed(3)}</b> · minimum possible $\\lambda_2$ = ${st.s.l2.toFixed(3)} · variance totale $\\lambda_1+\\lambda_2$ = ${tot.toFixed(3)}<br>Part de la variance conservée par le code : ${(100 * (tot - e) / tot).toFixed(1)} %<br><span class="c-dim">Erreur = variance totale − variance de la projection $u^\\top Su$ : minimiser l'erreur, c'est maximiser la variance du code. Sur l'arc ou la courbe en S, même la meilleure droite perd beaucoup : il faut un encodeur et un décodeur <b>non linéaires</b> (scène suivante).</span>`);
      P.request(); E.request();
    }
    load(); fit(); upd();
  });

  // ------------------------------------------------------------------ vae-ae
  ML.scene('vae-ae', host => {
    const W = ML.widget(host, {
      title: 'Autoencodeur non linéaire $2\\to1\\to2$ entraîné en direct : $\\min_{f,g}\\frac1N\\sum_n\\|x_n-g(f(x_n))\\|^2$ (slide 6)', tag: '2D',
      views: [{ name: 'd', label: 'données (gris), reconstructions $g(f(x_n))$ (couleur = code $z_n$), courbe de décodage $\\{g(z)\\}$', cls: 'tall' }, { name: 'z', label: 'les codes $z_n = f(x_n)$ sur l\'axe latent, et l\'erreur au fil de l\'entraînement', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>courbe $z\\mapsto g(z)$</span><span class="key"><i style="background:#83c167"></i>meilleure droite (ACP)</span><span class="key"><i style="background:#fc6255"></i>erreurs</span>',
    });
    const st = { kind: 'arc', it: 0, seed: 1, hist: [] };
    let X, net, rng, pca;
    W.toggle('res', 'erreurs de reconstruction', true);
    W.toggle('pca', 'meilleure droite (autoencodeur linéaire)', true);
    const reset = () => { X = V.data(st.kind, 240, 2); pca = stats2(X); net = new V.Net(st.seed); rng = M.rng(st.seed + 10); st.it = 0; st.hist = []; };
    const mse = () => M.sum(X.map(x => { const r = net.decode(net.encode(x).mu).mu; return (x[0] - r[0]) ** 2 + (x[1] - r[1]) ** 2; })) / X.length;
    const P = new ML.Plot2D(W.views.d, { xlim: [-3.4, 3.4], ylim: [-3.4, 3.4], gridStep: [1, 1] });
    const Z = new ML.Plot2D(W.views.z, { xlim: [-3, 3], ylim: [-0.2, 1.35], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? String(+v.toFixed(1)) : '') });
    let codes = [];
    P.onDraw = p => {
      if (W.show.pca) { const { c, u1 } = pca; p.seg(c[0] - 6 * u1[0], c[1] - 6 * u1[1], c[0] + 6 * u1[0], c[1] + 6 * u1[1], { color: C.green, width: 1.5, dash: [6, 4] }); }
      const lo = Math.min(...codes), hi = Math.max(...codes);
      p.polyline(M.range(161).map(i => net.decode(lo - 0.3 + (hi - lo + 0.6) * i / 160).mu), { color: C.yellow, width: 2.5 });
      X.forEach((x, i) => {
        const r = net.decode(codes[i]).mu;
        if (W.show.res) p.seg(x[0], x[1], r[0], r[1], { color: C.red, width: 1, alpha: 0.5 });
        p.point(x[0], x[1], { color: '#bbb', r: 2.6 });
        p.point(r[0], r[1], { color: zCol(codes[i], lo, hi), r: 3 });
      });
    };
    Z.onDraw = p => {
      const lo = Math.min(...codes), hi = Math.max(...codes);
      codes.forEach((z, i) => p.point(z, 0.05 + 0.08 * ((i * 37) % 10) / 10, { color: zCol(z, lo, hi), r: 3 }));
      p.tex('zl', Z.xlim[1], 0.0, 'z', { anchor: 'right', dy: 14, color: '#bbb', size: 13 });
      // courbe d'erreur (en haut) : t ↦ MSE, échelle propre
      const H = st.hist; if (H.length > 1) {
        const mx = Math.max(...H.map(h => h[1]), pca.l2 * 1.05), x0 = Z.xlim[0], x1 = Z.xlim[1], tmax = Math.max(H[H.length - 1][0], 1);
        const tx = t => x0 + (x1 - x0) * t / tmax, ty = v => 0.35 + 0.8 * v / mx;
        p.polyline(H.map(([t, v]) => [tx(t), ty(v)]), { color: C.blue, width: 2 });
        p.seg(x0, ty(pca.l2), x1, ty(pca.l2), { color: C.green, width: 1.2, dash: [5, 4] });
        p.tex('ml', x0, ty(pca.l2), '\\text{ACP}', { color: C.green, anchor: 'left', dy: -10, size: 12 });
        p.tex('mt', x1, 1.27, '\\text{erreur moyenne au fil des itérations}', { color: C.blue, anchor: 'right', size: 12 });
      }
    };
    const train = n => { for (let k = 0; k < n; k++) { const idx = M.range(32).map(() => rng.int(X.length)); net.step(X, idx, rng, { lr: 0.01, beta: 0, deterministic: true, freeze: ['s', 'a2', 'c2'] }); st.it++; } st.hist.push([st.it, mse()]); };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: V.DATA, onChange: v => { st.kind = v; reset(); upd(); } });
    ui.player(c, { speed: 6, step: () => { train(25); upd(); return st.it < 6000; }, reset: () => { st.seed++; reset(); upd(); } });
    ui.buttons(c, [{ label: '+1000 itérations', onClick: () => { for (let k = 0; k < 40; k++) train(25); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      codes = X.map(x => net.encode(x).mu);
      const lo = Math.min(...codes), hi = Math.max(...codes);
      if (Math.abs(Z.xlim[0] - (lo - 0.5)) > 0.3 || Math.abs(Z.xlim[1] - (hi + 0.5)) > 0.3) Z.setLimits([lo - 0.5, hi + 0.5], [-0.2, 1.35]);
      const e = mse();
      ro.set(`Itération ${st.it} (Adam, mini-batchs de 32) · erreur moyenne <b>${e.toFixed(4)}</b> · meilleure droite (ACP) : ${pca.l2.toFixed(4)}<br><span class="c-dim">Encodeur et décodeur : une couche cachée de 24 neurones $\\tanh$. Le décodeur apprend une <b>courbe</b> $z\\mapsto g(z)$ qui passe par les données : un seul nombre $z$ suffit alors à les décrire. Mais les codes $z_n$ se placent n'importe où sur l'axe (leur échelle et leur position sont arbitraires) : rien ne dit quels $z$ « produisent » des données réalistes. C'est la limite que le VAE corrige (§7).</span>`);
      P.request(); Z.request();
    }
    reset(); upd();
  });

  // ------------------------------------------------------------------ vae-mle
  ML.scene('vae-mle', host => {
    const W = ML.widget(host, {
      title: 'Estimation de densité par maximum de vraisemblance : une gaussienne contre un modèle à variable latente (slides 9–11)', tag: '2D',
      views: [{ name: 'h', label: 'histogramme des données $x_n\\sim p_{\\text{data}}$ et densité du modèle $p_\\theta$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$p_\\theta = \\mathcal N(m,s^2)$</span><span class="key"><i style="background:#f4d345"></i>mélange : $z\\in\\{1,2\\}$, $x\\mid z\\sim\\mathcal N(m_z,s_z^2)$</span><span class="key"><i style="background:#888"></i>vraie densité $p_{\\text{data}}$ (inconnue en pratique)</span>',
    });
    const truth = x => 0.45 * V.npdf(x, -2, 0.6) + 0.55 * V.npdf(x, 1.5, 0.8);
    const r = M.rng(11), X = M.range(300).map(() => (r.u() < 0.45 ? r.normal(-2, 0.6) : r.normal(1.5, 0.8)));
    const mean = M.mean(X), sd = Math.sqrt(M.mean(X.map(x => (x - mean) ** 2)));
    // mélange ajusté par EM (hors chapitre : sert seulement à montrer le gain d'une variable latente)
    const mix = (() => { let w = 0.5, m1 = -1, m2 = 1, s1 = 1, s2 = 1;
      for (let it = 0; it < 200; it++) { const g = X.map(x => { const a = w * V.npdf(x, m1, s1), b = (1 - w) * V.npdf(x, m2, s2); return a / (a + b); }); const n1 = M.sum(g), n2 = X.length - n1;
        m1 = M.sum(X.map((x, i) => g[i] * x)) / n1; m2 = M.sum(X.map((x, i) => (1 - g[i]) * x)) / n2; s1 = Math.sqrt(M.sum(X.map((x, i) => g[i] * (x - m1) ** 2)) / n1); s2 = Math.sqrt(M.sum(X.map((x, i) => (1 - g[i]) * (x - m2) ** 2)) / n2); w = n1 / X.length; }
      return { w, m1, m2, s1, s2, pdf: x => w * V.npdf(x, m1, s1) + (1 - w) * V.npdf(x, m2, s2) }; })();
    const st = { m: 0, s: 1 };
    W.toggle('mix', 'modèle à variable latente (mélange)', false, () => upd());
    W.toggle('truth', 'vraie densité', false);
    const P = new ML.Plot2D(W.views.h, { xlim: [-4.5, 4.5], ylim: [-0.02, 0.5], gridStep: [1, 0.1] });
    const bins = 36, lo = -4.5, bw = 9 / bins, cnt = new Array(bins).fill(0);
    X.forEach(x => { const b = Math.floor((x - lo) / bw); if (b >= 0 && b < bins) cnt[b]++; });
    P.onDraw = p => {
      cnt.forEach((k, b) => p.rect(lo + b * bw, 0, lo + (b + 1) * bw, k / (X.length * bw), { color: '#555', fill: '#888', fillAlpha: 0.35, width: 1 }));
      if (W.show.truth) p.fn(truth, { color: '#aaa', width: 1.5, dash: [5, 4] });
      p.fn(x => V.npdf(x, st.m, st.s), { color: C.blue, width: 2.5 });
      if (W.show.mix) p.fn(mix.pdf, { color: C.yellow, width: 2.5 });
      X.forEach((x, i) => { if (i % 2 === 0) p.seg(x, -0.02, x, -0.005, { color: '#ccc', width: 1, alpha: 0.6 }); });
    };
    const c = W.controls;
    const sM = ui.slider(c, { label: 'moyenne $m$', min: -3, max: 3, step: 0.01, value: st.m, digits: 2, onInput: v => { st.m = v; upd(); } });
    const sS = ui.slider(c, { label: 'écart-type $s$', min: 0.3, max: 3, step: 0.01, value: st.s, digits: 2, onInput: v => { st.s = v; upd(); } });
    ui.buttons(c, [{ label: 'maximum de vraisemblance', primary: true, onClick: () => { st.m = mean; st.s = sd; sM.set(mean); sS.set(sd); upd(); } }]);
    const ro = ui.readout(c);
    const avg = f => M.mean(X.map(x => Math.log(f(x))));
    function upd() {
      const lg = avg(x => V.npdf(x, st.m, st.s)), lm = avg(mix.pdf), lt = avg(truth);
      ro.set(`Log-vraisemblance moyenne $\\frac1N\\sum_n\\log p_\\theta(x_n)$ : gaussienne <b style="color:#58c4dd">${lg.toFixed(3)}</b>${W.show.mix ? ` · mélange <b style="color:#f4d345">${lm.toFixed(3)}</b>` : ''} · vraie densité ${lt.toFixed(3)}<br><span class="c-dim">Le maximum de la gaussienne est atteint en $m = \\bar x$, $s^2 = \\frac1N\\sum_n(x_n-\\bar x)^2$, mais une seule bosse ne peut pas décrire deux groupes. Ajouter une variable cachée $z$ (« de quel groupe vient $x$ ? ») rend le modèle bien plus flexible : c'est l'idée du §3, avec un $z$ continu et un réseau à la place des deux gaussiennes.</span>`);
      P.request();
    }
    upd();
  });
})(window.ML);
