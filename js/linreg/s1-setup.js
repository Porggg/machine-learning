/* Chapitre 1 — Régression linéaire · §1 Le problème de régression */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  const TRUE_FNS = {
    sin: { name: 'sin(2πx)  (HW1)', f: x => Math.sin(2 * Math.PI * x) },
    lin: { name: '1.6x − 0.8', f: x => 1.6 * x - 0.8 },
    cub: { name: '10(x − ½)³ − 0.4x', f: x => 10 * (x - 0.5) ** 3 - 0.4 * x },
    step: { name: 'marche lissée', f: x => 1.4 * M.sigmoid((x - 0.5) * 30) - 0.7 },
  };

  // barres de décomposition MSE = bruit + écart
  ML.decompBars = (parts, total) => {
    const W = 100 / Math.max(total, 1e-9);
    return '<div style="display:flex;height:14px;border-radius:4px;overflow:hidden;margin:6px 0 4px;background:#111">' +
      parts.map(p => `<div title="${p.name}" style="width:${Math.max(0, p.v * W)}%;background:${p.color}"></div>`).join('') + '</div>';
  };

  ML.scene('lr-joint', host => {
    const W = ML.widget(host, {
      title: 'Densité jointe, coupe conditionnelle et $\\E[y\\mid x]$', tag: '3D + 2D',
      views: [{ name: 's3', label: 'relief $p(x,y)$', cls: 'tall', hint: 'glisser : tourner · molette : zoom' },
              { name: 'p2', label: 'vue de dessus', cls: 'tall', hint: 'glisser les poignées' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\E[y\\mid x]$</span><span class="key"><i style="background:#fc6255"></i>prédicteur $f$</span><span class="key"><i style="background:#58c4dd"></i>$\\E[y|x]\\pm\\sigma(x)$</span><span class="key"><i style="background:#fff"></i>coupe $p(y\\mid x_0)$</span>',
    });
    const st = { fn: 'sin', sigma: 0.25, hetero: false, x0: 0.3, a: -1.2, b: 0.5, fmode: 'line', samples: true };
    const m = x => TRUE_FNS[st.fn].f(x);
    const s = x => st.sigma * (st.hetero ? 0.25 + 1.5 * x : 1);
    const f = x => st.fmode === 'm' ? m(x) : st.a * x + st.b;
    const pj = (x, y) => (x < 0 || x > 1) ? 0 : M.gauss(y, m(x), s(x)); // p(x) = 1 sur [0,1]
    const R = M.rng(7), base = Array.from({ length: 220 }, () => [R.u(), R.n()]);

    // ---------- 3D ----------
    const S = new ML.Scene3D(W.views.s3, { range: { x: [0, 1], y: [-2, 2], z: [0, 2] }, size: [2.2, 2.6, 1.3], labels: { x: 'x', y: 'y', z: 'p(x,y)' }, theta: -1.15, phi: 1.0, radius: 5.4 });
    let zTop = 0;
    function build3d(full) {
      const smin = Math.min(s(0), s(1)), peak = 1 / (smin * Math.sqrt(2 * Math.PI));
      if (full || Math.abs(zTop - peak * 1.1) > 1e-6) { zTop = peak * 1.1; S.setRange({ x: [0, 1], y: [-2, 2], z: [0, zTop] }); S.drawAxes(); full = true; }
      if (full) {
        S.clear('surf');
        S.surface('surf', pj, { res: 80, opacity: 0.82, wireLines: 20, cmin: 0, cmax: peak });
      }
      S.clear('curves');
      const xs = M.linspace(0, 1, 120);
      S.curve('curves', xs.map(x => [x, m(x), 0]), { color: C.yellow, radius: 0.014 });
      S.curve('curves', xs.map(x => [x, M.clamp(f(x), -2, 2), 0]), { color: C.red, radius: 0.012 });
      // coupe conditionnelle en x0
      const ys = M.linspace(-2, 2, 160), x0 = st.x0;
      S.curve('curves', ys.map(y => [x0, y, pj(x0, y) + 0.004]), { color: C.white, radius: 0.012 });
      S.quad('curves', [x0, -2, 0], [0, 4, 0], [0, 0, zTop * 0.95], { color: C.white, opacity: 0.07, edges: false });
      const mx = m(x0);
      S.segments('curves', [[[x0, mx, 0], [x0, mx, pj(x0, mx)]]], { color: C.yellow, opacity: 0.9 });
      S.points('curves', [[x0, mx, 0], [x0, M.clamp(f(x0), -2, 2), 0]], { color: [C.yellow, C.red], radius: 0.035 });
      S.label('m', [x0, mx, pj(x0, mx) * 1.05 + 0.05], '\\E[y\\mid x_0]', { color: C.yellow, size: 14, dy: -8 });
      S.clear('pts');
      if (st.samples) S.points('pts', base.map(([u, z]) => [u, M.clamp(m(u) + s(u) * z, -2, 2), 0]), { color: '#8fb7c9', radius: 0.012, opacity: 0.7 });
    }

    // ---------- 2D ----------
    const P = new ML.Plot2D(W.views.p2, { xlim: [0, 1], ylim: [-2, 2], xlabel: 'x', ylabel: 'y', pad: [14, 14, 26, 34] });
    const hx = [0.15, 0.85];
    hx.forEach((xh, k) => P.addDraggable({
      get: () => [xh, st.a * xh + st.b], r: 13,
      set: (x, y) => {
        const other = hx[1 - k], yo = st.fmode === 'm' ? m(other) : st.a * other + st.b;
        st.fmode = 'line'; st.a = (y - yo) / (xh - other); st.b = y - st.a * xh; update();
      },
    }));
    P.addDraggable({ get: () => [st.x0, -1.85], set: x => { st.x0 = M.clamp(x, 0.01, 0.99); update(); }, r: 14, cursor: 'ew-resize' });
    P.onDraw = p => {
      p.heatmap(pj, v => { const t = Math.min(1, v / 3); return M.rampRgb(t * 0.8).map(c => c * 0.55 * Math.sqrt(t)); }, { res: 4, key: 'pj' + st.fn + st.sigma + st.hetero });
      // bande ±σ
      const xs = M.linspace(0, 1, 200);
      p.polyline([...xs.map(x => [x, m(x) + s(x)]), ...xs.slice().reverse().map(x => [x, m(x) - s(x)])], { color: C.blue, width: 1, alpha: 0.5, close: true, fillArea: C.blue, fillAlpha: 0.08 });
      if (st.samples) base.forEach(([u, z]) => p.point(u, m(u) + s(u) * z, { r: 2.2, color: '#8fb7c9', alpha: 0.75 }));
      // écart (m - f) ombré
      const pts = xs.map(x => [x, m(x)]), pf = xs.map(x => [x, f(x)]);
      p.polyline([...pts, ...pf.reverse()], { color: C.red, width: 0, alpha: 0, close: true, fillArea: C.red, fillAlpha: 0.12 });
      p.fn(m, { color: C.yellow, width: 3 }, [0, 1]);
      p.fn(f, { color: C.red, width: 2.6 }, [0, 1]);
      // coupe
      const x0 = st.x0, sc = 0.22 / (1 / (s(x0) * Math.sqrt(2 * Math.PI)));
      p.vline(x0, { color: C.white, width: 1, alpha: 0.4, dash: [4, 4] });
      p.param(t => { const y = -2 + 4 * t; return [x0 + sc * pj(x0, y), y]; }, 0, 1, { color: C.white, width: 2, samples: 200 });
      p.point(x0, m(x0), { color: C.yellow, r: 5 }); p.point(x0, f(x0), { color: C.red, r: 5 });
      p.tex('x0', x0, -1.85, 'x_0', { color: '#fff', dx: 14, anchor: 'left' });
      p.point(x0, -1.85, { color: C.white, r: 6, hollow: true });
      if (st.fmode === 'line') hx.forEach(xh => p.point(xh, st.a * xh + st.b, { color: C.red, r: 6, glow: true }));
    };

    // ---------- contrôles ----------
    const c = W.controls;
    ui.select(c, { label: 'vraie fonction $\\E[y\\mid x]$', options: Object.entries(TRUE_FNS).map(([k, v]) => [k, v.name]), value: st.fn, onChange: v => { st.fn = v; update(true); } });
    ui.slider(c, { label: 'bruit $\\sigma$', min: 0.08, max: 0.8, step: 0.01, value: st.sigma, onInput: v => { st.sigma = v; update(true); } });
    ui.check(c, { label: 'bruit hétéroscédastique $\\sigma(x)$', value: st.hetero, onChange: v => { st.hetero = v; update(true); } });
    ui.slider(c, { label: 'position de la coupe $x_0$', min: 0.01, max: 0.99, step: 0.005, value: st.x0, onInput: v => { st.x0 = v; update(); } });
    ui.check(c, { label: 'afficher des échantillons', value: true, onChange: v => { st.samples = v; update(); } });
    ui.sep(c); ui.title(c, 'Prédicteur $f$');
    ui.buttons(c, [
      { label: '$f = \\E[y|x]$', primary: true, onClick: () => { st.fmode = 'm'; update(); } },
      { label: 'meilleure droite', onClick: () => { bestLine(); update(); } },
      { label: '$f = 0$', onClick: () => { st.fmode = 'line'; st.a = 0; st.b = 0; update(); } },
    ]);
    const ro = ui.readout(c);
    ui.note(c, 'Glisse les deux poignées rouges pour déplacer la droite $f$. Le terme de bruit ne bouge jamais : aucun $f$ ne peut descendre sous $\\E[\\Var(Y|X)]$.');

    function bestLine() { // projection L2(p(x)) de m sur les droites
      const xs = M.linspace(0, 1, 400), Phi = xs.map(x => [x, 1]), w = M.ridge(Phi, xs.map(m), 0);
      st.fmode = 'line'; st.a = w[0]; st.b = w[1];
    }
    function update(full) {
      const xs = M.linspace(0, 1, 801);
      const noise = M.mean(xs.map(x => s(x) ** 2)), gap = M.mean(xs.map(x => (m(x) - f(x)) ** 2)), tot = noise + gap;
      ro.set(`<span class="k">$\\text{MSE}(f)$ =</span> <b>${M.fmt(tot, 4)}</b><br>` +
        `<span style="color:#58c4dd">■</span> $\\E[\\Var(Y|X)]$ = <b>${M.fmt(noise, 4)}</b><br>` +
        `<span style="color:#fc6255">■</span> $\\E[(\\E[Y|X]-f)^2]$ = <b>${M.fmt(gap, 4)}</b>` +
        ML.decompBars([{ name: 'bruit', v: noise, color: '#58c4dd' }, { name: 'écart', v: gap, color: '#fc6255' }], Math.max(tot, 0.6)));
      build3d(full); P.request();
    }
    update(true);
  });
})(window.ML);
