/* Chapitre 1 — Régression linéaire · §4 Maximum de vraisemblance */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // régression L1 (MLE sous bruit de Laplace) par moindres carrés repondérés (IRLS)
  function l1fit(xs, ys) {
    let w = M.ridge(xs.map(x => [x, 1]), ys, 0);
    for (let it = 0; it < 80; it++) {
      const wt = xs.map((x, i) => 1 / Math.max(1e-4, Math.abs(ys[i] - w[0] * x - w[1])));
      const Phi = xs.map((x, i) => [x * Math.sqrt(wt[i]), Math.sqrt(wt[i])]), y2 = ys.map((y, i) => y * Math.sqrt(wt[i]));
      w = M.ridge(Phi, y2, 0);
    }
    return w;
  }

  ML.scene('lr-mle', host => {
    const W = ML.widget(host, {
      title: 'La vraisemblance = produit des hauteurs des cloches aux points observés', tag: '3D + 2D',
      views: [{ name: 's3', label: '$p(y\\mid x,\\bw)$ posée au-dessus de chaque $x_n$', cls: 'tall', hint: 'glisser : tourner' },
              { name: 'p', label: 'données', cls: 'tall', hint: 'glisser les points · clic : ajouter' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>droite du modèle $\\bw\\T\\bphi(x)$</span><span class="key"><i style="background:#58c4dd"></i>cloches $p(y\\mid x_n,\\bw)$</span><span class="key"><i style="background:#fc6255"></i>hauteur au point observé = contribution $p(y_n|x_n,\\bw)$</span><span class="key"><i style="background:#58c4dd;opacity:.5"></i>MLE gaussien (= LS)</span><span class="key"><i style="background:#d147bd"></i>MLE Laplace (= L1)</span>',
    });
    const R = M.rng(11), pts = [];
    for (let i = 0; i < 9; i++) { const x = -2.1 + 4.2 * i / 8 + R.uniform(-0.15, 0.15); pts.push([x, 0.6 * x + 0.2 + 0.45 * R.n()]); }
    const st = { w: [0.1, -0.5], sigma: 0.6, noise: 'gauss', surf: false };
    const pdf = r => st.noise === 'gauss' ? M.gauss(r, 0, st.sigma) : (() => { const b = st.sigma / Math.SQRT2; return Math.exp(-Math.abs(r) / b) / (2 * b); })();
    const f = x => st.w[0] * x + st.w[1];
    const xs = () => pts.map(p => p[0]), ys = () => pts.map(p => p[1]);

    const S = new ML.Scene3D(W.views.s3, { range: { x: [-2.6, 2.6], y: [-3, 3], z: [0, 1] }, size: [2.6, 2.6, 1.3], labels: { x: 'x', y: 'y', z: 'p(y|x)' }, theta: -0.55, phi: 1.12, radius: 5.8 });
    let ztop = 0;
    function build() {
      const peak = pdf(0);
      if (Math.abs(peak * 1.15 - ztop) > 1e-9) { ztop = peak * 1.15; S.setRange({ x: [-2.6, 2.6], y: [-3, 3], z: [0, ztop] }); S.drawAxes(); }
      S.clear('d');
      const yg = M.linspace(-3, 3, 140);
      S.curve('d', [[-2.6, f(-2.6), 0], [2.6, f(2.6), 0]].map(p => [p[0], M.clamp(p[1], -3, 3), 0]), { color: C.yellow, radius: 0.014 });
      if (st.surf) S.surface('d', (x, y) => pdf(y - f(x)), { res: 70, opacity: 0.35, wire: false, cmin: 0, cmax: peak });
      pts.forEach(([x, y]) => {
        S.curve('d', yg.map(v => [x, v, pdf(v - f(x))]), { color: C.blue, radius: 0.008, opacity: 0.85 });
        const h = pdf(y - f(x));
        S.segments('d', [[[x, y, 0], [x, y, h]]], { color: C.red, opacity: 1 });
        S.curve('d', [[x, y, 0], [x, y, h]], { color: C.red, radius: 0.012 });
        S.segments('d', [[[x, f(x), 0], [x, f(x), peak]]], { color: C.yellow, opacity: 0.25, dashed: true });
      });
      S.points('d', pts.map(([x, y]) => [x, y, 0]), { color: C.white, radius: 0.035 });
      S.points('d', pts.map(([x, y]) => [x, y, pdf(y - f(x))]), { color: C.red, radius: 0.03 });
      P.request(); readout();
    }
    const P = new ML.Plot2D(W.views.p, { xlim: [-2.7, 2.7], ylim: [-3, 3], xlabel: 'x', ylabel: 'y' });
    const addH = i => P.addDraggable({ enabled: () => !!pts[i], get: () => pts[i], set: (x, y) => { pts[i] = [M.clamp(x, -2.6, 2.6), M.clamp(y, -3, 3)]; build(); } });
    pts.forEach((_, i) => addH(i));
    P.onClick = (x, y) => { pts.push([x, y]); addH(pts.length - 1); build(); };
    P.onDraw = p => {
      const ls = M.ridge(pts.map(q => [q[0], 1]), ys(), 0), l1 = l1fit(xs(), ys());
      // bande ±σ
      p.polyline([[-3, f(-3) + st.sigma], [3, f(3) + st.sigma], [3, f(3) - st.sigma], [-3, f(-3) - st.sigma]], { color: C.yellow, width: 0, alpha: 0, close: true, fillArea: C.yellow, fillAlpha: 0.07 });
      p.fn(x => ls[0] * x + ls[1], { color: C.blue, width: 2, dash: [7, 5], alpha: 0.8 });
      if (st.noise === 'laplace') p.fn(x => l1[0] * x + l1[1], { color: C.pink, width: 2, dash: [3, 4] });
      p.fn(f, { color: C.yellow, width: 3 });
      pts.forEach(([x, y]) => { p.seg(x, y, x, f(x), { color: C.red, width: 1.5, alpha: 0.7 }); p.point(x, y, { color: '#fff', r: 5, stroke: '#000' }); });
    };
    const c = W.controls;
    const s1 = ui.slider(c, { label: 'pente $w_1$', min: -2, max: 2, step: 0.01, value: st.w[0], onInput: v => { st.w[0] = v; build(); } });
    const s2 = ui.slider(c, { label: 'ordonnée $w_2$', min: -2, max: 2, step: 0.01, value: st.w[1], onInput: v => { st.w[1] = v; build(); } });
    ui.slider(c, { label: 'écart-type du bruit $\\sigma$', min: 0.2, max: 1.5, step: 0.01, value: st.sigma, onInput: v => { st.sigma = v; build(); } });
    ui.select(c, { label: 'modèle de bruit', options: [['gauss', 'gaussien  N(0, σ²)  → loss L2'], ['laplace', 'Laplace (même variance)  → loss L1']], value: 'gauss', onChange: v => { st.noise = v; build(); } });
    ui.buttons(c, [
      { label: 'maximiser $\\mathcal L$ (MLE)', primary: true, onClick: () => {
        const tgt = st.noise === 'gauss' ? M.ridge(pts.map(q => [q[0], 1]), ys(), 0) : l1fit(xs(), ys()), a = st.w.slice();
        ML.tween(900, u => { st.w = [a[0] + (tgt[0] - a[0]) * u, a[1] + (tgt[1] - a[1]) * u]; s1.set(st.w[0]); s2.set(st.w[1]); build(); });
      } },
      { label: '+ outlier', onClick: () => { pts.push([2.2, -2.7]); addH(pts.length - 1); build(); } },
    ]);
    ui.check(c, { label: 'densité conditionnelle complète (surface)', value: false, onChange: v => { st.surf = v; build(); } });
    const ro = ui.readout(c);
    function readout() {
      const N = pts.length, r = pts.map(([x, y]) => y - f(x)), mse = M.mean(r.map(v => v * v));
      const ll = M.sum(r.map(v => Math.log(pdf(v))));
      let html = `$N=${N}$ · $\\mathcal L = \\prod_n p_n$ = <b>${M.fmt(Math.exp(ll), 3)}</b><br>$\\ln\\mathcal L$ = <b>${M.fmt(ll, 3)}</b><br>`;
      if (st.noise === 'gauss') {
        const a = -N / 2 * Math.log(2 * Math.PI * st.sigma ** 2), b = -N / (2 * st.sigma ** 2) * mse;
        html += `<span class="k">$= -\\tfrac N2\\ln(2\\pi\\sigma^2) - \\tfrac{N}{2\\sigma^2}\\EMSE$</span><br>$=$ <b>${M.fmt(a, 2)}</b> $+$ <b>${M.fmt(b, 3)}</b><br>$\\EMSE$ = <b>${M.fmt(mse, 4)}</b> · $\\hat\\sigma^2_{\\text{ML}}$ = <b>${M.fmt(M.mse(pts.map(q => [q[0], 1]), ys(), M.ridge(pts.map(q => [q[0], 1]), ys(), 0)), 3)}</b>`;
      } else {
        html += `<span class="k">$= -N\\ln(2b) - \\tfrac1b\\sum_n|r_n|$</span><br>$\\frac1N\\sum|r_n|$ = <b>${M.fmt(M.mean(r.map(Math.abs)), 4)}</b>`;
      }
      ro.set(html);
    }
    ui.note(c, 'Un point loin de la droite a une hauteur de cloche minuscule : il « tire » très fort sur le produit. La queue gaussienne en $e^{-r^2}$ punit les grands résidus bien plus que la queue de Laplace en $e^{-|r|}$.');
    build();
  });
})(window.ML);
