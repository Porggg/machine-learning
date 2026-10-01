/* Chapitre 1 — Régression linéaire · §2 Fonctions de base et relèvement */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // ------------------------------------------------------------------ lr-basis
  ML.scene('lr-basis', host => {
    const W = ML.widget(host, {
      title: 'Une fonction = somme pondérée de fonctions de base $\\;f(x)=\\sum_\\ell w_\\ell\\phi_\\ell(x)$', tag: '2D',
      views: [{ name: 'p', cls: 'tall', hint: 'bases locales : glisser les poignées' }], controls: true,
    });
    const st = { fam: 'gauss', K: 7, s: 0.09, w: [], raw: false, data: true };
    const D = M.sinData(15, 0);
    const FAM = {
      poly: { name: 'polynomiale  xᵏ', feats: () => M.range(st.K + 1).map(k => ({ f: x => x ** k, tex: `x^{${k}}`, c: null })) },
      gauss: { name: 'gaussienne', feats: () => [{ f: () => 1, tex: '1' }, ...M.linspace(0, 1, st.K).map((mu, i) => ({ f: x => Math.exp(-((x - mu) ** 2) / (2 * st.s ** 2)), mu, tex: `e^{-(x-${mu.toFixed(2)})^2/2\\sigma^2}` }))] },
      sigmoid: { name: 'sigmoïdale', feats: () => [{ f: () => 1, tex: '1' }, ...M.linspace(0, 1, st.K).map(mu => ({ f: x => M.sigmoid((x - mu) / st.s), mu, half: true, tex: `\\sigma(\\frac{x-${mu.toFixed(2)}}{s})` }))] },
      fourier: { name: 'Fourier  sin/cos', feats: () => { const F = [{ f: () => 1, tex: '1' }]; for (let k = 1; k <= Math.ceil(st.K / 2); k++) { F.push({ f: x => Math.sin(2 * Math.PI * k * x), tex: `\\sin ${2 * k}\\pi x` }, { f: x => Math.cos(2 * Math.PI * k * x), tex: `\\cos ${2 * k}\\pi x` }); } return F; } },
    };
    let feats = [];
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.02, 1.02], ylim: [-2.2, 2.2], xlabel: 'x', ylabel: 'y' });
    const col = i => M.series[i % M.series.length];
    const f = x => feats.reduce((s, ft, i) => s + st.w[i] * ft.f(x), 0);

    P.onDraw = p => {
      if (st.raw) feats.forEach((ft, i) => p.fn(ft.f, { color: col(i), width: 1, alpha: 0.35, dash: [3, 4] }, [0, 1]));
      feats.forEach((ft, i) => p.fn(x => st.w[i] * ft.f(x), { color: col(i), width: 1.6, alpha: 0.85 }, [0, 1]));
      if (st.data) D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#ddd', r: 4, stroke: '#000' }));
      p.fn(f, { color: C.yellow, width: 4 }, [0, 1]);
      feats.forEach((ft, i) => { if (ft.mu != null) p.point(ft.mu, st.w[i] * (ft.half ? 0.5 : 1), { color: col(i), r: 6, glow: true, stroke: '#000' }); });
    };
    const c = W.controls;
    ui.select(c, { label: 'famille de base', options: Object.entries(FAM).map(([k, v]) => [k, v.name]), value: st.fam, onChange: v => { st.fam = v; rebuild(true); } });
    const kS = ui.slider(c, { label: 'nombre de fonctions $K$', min: 1, max: 12, step: 1, value: st.K, fmt: v => v.toFixed(0), onInput: v => { st.K = v; rebuild(true); } });
    const sS = ui.slider(c, { label: 'largeur $\\sigma$ / pente $s$', min: 0.02, max: 0.4, step: 0.005, value: st.s, onInput: v => { st.s = v; rebuild(false); } });
    ui.buttons(c, [
      { label: 'ajuster aux données (LS)', primary: true, onClick: () => fit() },
      { label: 'aléatoire', onClick: () => { const r = M.rng(Date.now() % 1e6); st.w = st.w.map(() => r.normal(0, 0.7)); refresh(); } },
      { label: 'zéro', onClick: () => { st.w = st.w.map(() => 0); refresh(); } },
    ]);
    ui.check(c, { label: 'afficher les $\\phi_\\ell$ non pondérées', value: st.raw, onChange: v => { st.raw = v; P.request(); } });
    ui.check(c, { label: 'données du HW1', value: st.data, onChange: v => { st.data = v; P.request(); } });
    const ro = ui.readout(c);
    ui.sep(c); ui.title(c, 'poids $w_\\ell$');
    const wbox = ML.h('div', { style: 'display:flex;flex-direction:column;gap:6px' }); c.appendChild(wbox);
    let wsl = [];
    // poignées : bases localisées
    for (let i = 0; i < 13; i++) {
      P.addDraggable({
        enabled: () => feats[i + 1] && feats[i + 1].mu != null,
        get: () => { const ft = feats[i + 1]; return [ft.mu, st.w[i + 1] * (ft.half ? 0.5 : 1)]; },
        set: (x, y) => { const ft = feats[i + 1]; st.w[i + 1] = M.clamp(y / (ft.half ? 0.5 : 1), -4, 4); wsl[i + 1] && wsl[i + 1].set(st.w[i + 1]); refresh(true); },
      });
    }
    function fit() {
      const Phi = D.xs.map(x => feats.map(ft => ft.f(x)));
      const target = M.ridge(Phi, D.ys, 1e-4), from = st.w.slice();
      ML.tween(700, u => { st.w = from.map((a, i) => a + (target[i] - a) * u); wsl.forEach((s, i) => s.set(st.w[i])); refresh(true); });
    }
    function rebuild(resetW) {
      feats = FAM[st.fam].feats();
      sS.el.style.display = (st.fam === 'gauss' || st.fam === 'sigmoid') ? '' : 'none';
      if (resetW || st.w.length !== feats.length) { const old = st.w; st.w = feats.map((_, i) => old[i] ?? 0); if (resetW) { st.w = feats.map(() => 0); } }
      wbox.innerHTML = '';
      wsl = feats.map((ft, i) => ui.slider(wbox, { label: `<span style="color:${col(i)}">■</span> $w_{${i}}\\;·\\;${ft.tex}$`, min: -4, max: 4, step: 0.01, value: st.w[i], onInput: v => { st.w[i] = v; refresh(true); } }));
      if (resetW) fitSilently();
      refresh();
    }
    function fitSilently() { const Phi = D.xs.map(x => feats.map(ft => ft.f(x))); st.w = M.ridge(Phi, D.ys, 1e-4); wsl.forEach((s, i) => s.set(st.w[i])); }
    function refresh(noSliders) {
      const mse = M.mean(D.xs.map((x, i) => (D.ys[i] - f(x)) ** 2));
      ro.set(`$L = ${feats.length}$ paramètres · MSE données : <b>${M.fmt(mse, 4)}</b><br><span class="k">linéaire en $\\bw$, non linéaire en $x$</span>`);
      if (!noSliders) wsl.forEach((s, i) => s.set(st.w[i]));
      P.request();
    }
    void kS;
    rebuild(true);
  });

  // ------------------------------------------------------------------ lr-lift
  ML.scene('lr-lift', host => {
    const W = ML.widget(host, {
      title: 'Relèvement $x\\mapsto(x, x^2)$ : une parabole = un plan dans l\'espace des features', tag: '3D + 2D',
      views: [{ name: 's3', label: 'espace des features $(u,v)=(x,x^2)$, hauteur $y$', cls: 'tall', hint: 'glisser : tourner' }, { name: 'p', label: 'espace d\'origine $(x,y)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#83c167"></i>parabole $v=u^2$ (où vivent les $\\bphi(x_n)$)</span><span class="key"><i style="background:#58c4dd"></i>plan $y=w_0+w_1u+w_2v$</span><span class="key"><i style="background:#f4d345"></i>courbe apprise = plan ∩ mur</span><span class="key"><i style="background:#fc6255"></i>résidus</span>',
    });
    const R = M.rng(3), N = 22, xs = [], ys = [];
    for (let i = 0; i < N; i++) { const x = R.uniform(-1.1, 1.1); xs.push(x); ys.push(-0.3 - 0.6 * x + 1.4 * x * x + 0.18 * R.n()); }
    const Phi = xs.map(x => [1, x, x * x]), wLS = M.ridge(Phi, ys, 0);
    const st = { w: [0.4, 0.4, 0], wall: true, resid: true };
    const f = x => st.w[0] + st.w[1] * x + st.w[2] * x * x;
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-1.25, 1.25], y: [0, 1.6], z: [-1.2, 2.4] }, size: [2.4, 1.6, 1.8], labels: { x: 'u = x', y: 'v = x^2', z: 'y' }, theta: -1.05, phi: 1.12, radius: 5.6, target: [0, 0, 0.5] });
    function build() {
      S.clear('dyn');
      const ug = M.linspace(-1.25, 1.25, 120);
      S.curve('dyn', ug.map(u => [u, u * u, 0]), { color: C.green, radius: 0.012 });
      // plan y = w0 + w1 u + w2 v, dessiné via 4 coins
      const pl = (u, v) => st.w[0] + st.w[1] * u + st.w[2] * v;
      S.surface('dyn', pl, { res: 2, color: C.blue, opacity: 0.35, wire: false, xr: [-1.25, 1.25], yr: [0, 1.6], zclip: [-1.2, 2.4] });
      const grid = [];
      for (const u of M.linspace(-1.25, 1.25, 11)) grid.push([[u, 0, pl(u, 0)], [u, 1.6, pl(u, 1.6)]]);
      for (const v of M.linspace(0, 1.6, 9)) grid.push([[-1.25, v, pl(-1.25, v)], [1.25, v, pl(1.25, v)]]);
      S.segments('dyn', grid.map(s => s.map(p => [p[0], p[1], M.clamp(p[2], -1.2, 2.4)])), { color: C.blue, opacity: 0.35 });
      if (st.wall) S.paramSurface('dyn', (a, b) => { const u = -1.25 + 2.5 * a; return [u, u * u, -1.2 + 3.6 * b]; }, { nu: 60, nv: 2, color: C.green, opacity: 0.08 });
      S.curve('dyn', ug.map(u => [u, u * u, M.clamp(f(u), -1.2, 2.4)]), { color: C.yellow, radius: 0.016 });
      S.points('dyn', xs.map((x, i) => [x, x * x, ys[i]]), { color: C.white, radius: 0.03 });
      S.segments('dyn', xs.map(x => [[x, x * x, 0], [x, x * x, f(x)]]), { color: C.green, opacity: 0.25 });
      if (st.resid) S.segments('dyn', xs.map((x, i) => [[x, x * x, ys[i]], [x, x * x, M.clamp(f(x), -1.2, 2.4)]]), { color: C.red, opacity: 0.9 });
      P.request();
    }
    const P = new ML.Plot2D(W.views.p, { xlim: [-1.3, 1.3], ylim: [-1.2, 2.4], xlabel: 'x', ylabel: 'y' });
    P.onDraw = p => {
      if (st.resid) xs.forEach((x, i) => p.seg(x, ys[i], x, f(x), { color: C.red, width: 1.5, alpha: 0.8 }));
      p.fn(f, { color: C.yellow, width: 3.5 });
      xs.forEach((x, i) => p.point(x, ys[i], { color: '#fff', r: 4 }));
    };
    const c = W.controls, sl = [];
    ['$w_0$ (constante)', '$w_1$ (coef. de $u = x$)', '$w_2$ (coef. de $v = x^2$)'].forEach((lab, k) => sl.push(ui.slider(c, { label: lab, min: -3, max: 3, step: 0.01, value: st.w[k], onInput: v => { st.w[k] = v; upd(); } })));
    ui.buttons(c, [
      { label: 'ajuster le plan (LS)', primary: true, onClick: () => { const a = st.w.slice(); ML.tween(900, u => { st.w = a.map((v, i) => v + (wLS[i] - v) * u); sl.forEach((s, i) => s.set(st.w[i])); upd(); }); } },
      { label: 'droite ($w_2=0$)', onClick: () => { st.w[2] = 0; sl[2].set(0); upd(); } },
    ]);
    ui.title(c, 'caméra');
    ui.buttons(c, [
      { label: 'vue 3D', onClick: () => S.flyTo(-1.05, 1.12, 5.6) },
      { label: 'de face : on retrouve $(x,y)$', onClick: () => S.flyTo(-Math.PI / 2, Math.PI / 2, 6) },
      { label: 'de dessus', onClick: () => S.flyTo(-Math.PI / 2, 0.06, 6) },
    ]);
    ui.check(c, { label: 'mur vertical au-dessus de la parabole', value: st.wall, onChange: v => { st.wall = v; upd(); } });
    ui.check(c, { label: 'résidus', value: st.resid, onChange: v => { st.resid = v; upd(); } });
    const ro = ui.readout(c);
    ui.note(c, 'Vue « de face » : la profondeur $v$ disparaît, et la courbe jaune posée sur le plan devient la parabole ajustée de droite. Ajuster un polynôme de degré 2 = régression <b>linéaire</b> en $(1,u,v)$.');
    function upd() {
      const mse = M.mse(Phi, ys, st.w);
      ro.set(`$f(x) = ${M.fmt(st.w[0], 2)} ${st.w[1] < 0 ? '-' : '+'} ${M.fmt(Math.abs(st.w[1]), 2)}\\,x ${st.w[2] < 0 ? '-' : '+'} ${M.fmt(Math.abs(st.w[2]), 2)}\\,x^2$<br>MSE = <b>${M.fmt(mse, 4)}</b> · optimum : <b>${M.fmt(M.mse(Phi, ys, wLS), 4)}</b>`);
      build();
    }
    upd();
  });
})(window.ML);
