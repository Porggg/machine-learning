/* Chapitre 1 — Régression linéaire · §3 Moindres carrés : carrés, bol, projection */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // ------------------------------------------------------------------ lr-squares
  ML.scene('lr-squares', host => {
    const W = ML.widget(host, {
      title: 'Les moindres carrés, littéralement — et la MSE comme un bol dans l\'espace des poids', tag: '2D + 3D',
      views: [{ name: 'p', label: 'données : $f(x)=w_1x+w_2$', cls: 'tall', hint: 'clic : ajouter · Maj+clic : retirer · glisser points & poignées' },
              { name: 's3', label: '$\\EMSE(w_1,w_2)$', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
    });
    const pts = [[-2.4, -1.3], [-1.6, -0.2], [-0.9, -0.9], [-0.2, 0.4], [0.5, 0.1], [1.1, 1.2], [1.8, 0.8], [2.5, 1.9]];
    const st = { w: [-0.3, 0.8], squares: true };
    const xa = -2, xb = 2;
    const f = x => st.w[0] * x + st.w[1];
    const Phi = () => pts.map(p => [p[0], 1]), Y = () => pts.map(p => p[1]);
    const E = (w1, w2) => M.mean(pts.map(([x, y]) => (y - w1 * x - w2) ** 2));
    const wLS = () => pts.length >= 2 ? M.ridge(Phi(), Y(), 0) : [0, M.mean(Y())];

    const P = new ML.Plot2D(W.views.p, { xlim: [-3.2, 3.2], ylim: [-2.8, 2.8], equal: true, xlabel: 'x', ylabel: 'y' });
    pts.forEach((_, i) => addPtHandle(i));
    function addPtHandle(i) { P.addDraggable({ enabled: () => !!pts[i], get: () => pts[i], set: (x, y) => { pts[i] = [x, y]; changed(); }, r: 11 }); }
    [xa, xb].forEach((xh, k) => P.addDraggable({
      get: () => [xh, f(xh)], r: 13,
      set: (x, y) => { const o = k ? xa : xb, yo = f(o); st.w[0] = (y - yo) / (xh - o); st.w[1] = y - st.w[0] * xh; moved(); },
    }));
    P.onClick = (x, y, e) => {
      if (e.shiftKey || e.button === 2) {
        let bi = -1, bd = 0.5;
        pts.forEach((p, i) => { if (p) { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; bi = i; } } });
        if (bi >= 0) { pts.splice(bi, 1); rebuildHandles(); changed(); }
      } else { pts.push([x, y]); addPtHandle(pts.length - 1); changed(); }
    };
    function rebuildHandles() {
      P.draggables = []; pts.forEach((_, i) => addPtHandle(i));
      [xa, xb].forEach((xh, k) => P.addDraggable({
        get: () => [xh, f(xh)], r: 13,
        set: (x, y) => { const o = k ? xa : xb, yo = f(o); st.w[0] = (y - yo) / (xh - o); st.w[1] = y - st.w[0] * xh; moved(); },
      }));
    }
    P.onDraw = p => {
      p.fn(f, { color: C.yellow, width: 3 });
      pts.forEach(([x, y]) => {
        const r = y - f(x);
        if (st.squares) p.rect(x, f(x), x + (x > 2.2 ? -1 : 1) * Math.abs(r), y, { color: C.red, width: 1.2, fill: C.red, fillAlpha: 0.16, alpha: 0.7 });
        p.seg(x, y, x, f(x), { color: C.red, width: 2 });
      });
      pts.forEach(([x, y]) => p.point(x, y, { color: '#fff', r: 5, stroke: '#000' }));
      [xa, xb].forEach(xh => p.point(xh, f(xh), { color: C.yellow, r: 6, glow: true }));
    };

    const S = new ML.Scene3D(W.views.s3, { range: { x: [-2.5, 2.5], y: [-2.5, 2.5], z: [0, 6] }, size: [2.2, 2.2, 1.5], labels: { x: 'w_1', y: 'w_2', z: '\\widehat E' }, theta: -2.2, phi: 1.0, radius: 5.2 });
    let zmax = 6;
    function buildSurface() {
      const [a, b] = wLS(), emin = E(a, b);
      const corners = [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].map(([u, v]) => E(u, v));
      const nz = Math.max(1.5, Math.min(Math.max(...corners), emin + 8));
      if (Math.abs(nz - zmax) / zmax > 0.15) { zmax = nz; S.setRange({ x: [-2.5, 2.5], y: [-2.5, 2.5], z: [0, zmax] }); S.drawAxes(); }
      S.clear('surf');
      S.surface('surf', E, { res: 56, opacity: 0.8, zclip: [0, zmax], hideClipped: true, cmin: emin, cmax: zmax });
      buildMarkers();
    }
    function buildMarkers() {
      S.clear('mk');
      const [a, b] = wLS(), e = E(...st.w);
      S.points('mk', [[a, b, E(a, b)]], { color: C.yellow, radius: 0.04 });
      const cw = [M.clamp(st.w[0], -2.5, 2.5), M.clamp(st.w[1], -2.5, 2.5)];
      S.points('mk', [[cw[0], cw[1], Math.min(e, zmax)]], { color: C.red, radius: 0.05 });
      S.segments('mk', [[[cw[0], cw[1], 0], [cw[0], cw[1], Math.min(e, zmax)]]], { color: C.red, opacity: 0.8 });
      S.segments('mk', [[[a, b, 0], [a, b, E(a, b)]]], { color: C.yellow, opacity: 0.8 });
      S.label('ls', [a, b, 0], '\\bw_{\\text{LS}}', { color: C.yellow, dy: 14 });
    }
    const c = W.controls;
    ui.buttons(c, [
      { label: 'aller à $\\bw_{\\text{LS}}$', primary: true, onClick: () => { const a = st.w.slice(), b = wLS(); ML.tween(900, u => { st.w = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; moved(); }); } },
      { label: 'droite horizontale', onClick: () => { st.w = [0, M.mean(Y())]; moved(); } },
    ]);
    ui.buttons(c, [
      { label: 'nuage aléatoire', onClick: () => { const r = M.rng(Date.now() % 1e6), a = r.uniform(-1, 1), b = r.uniform(-0.8, 0.8); pts.length = 0; for (let i = 0; i < 10; i++) { const x = r.uniform(-2.8, 2.8); pts.push([x, a * x + b + r.normal(0, 0.5)]); } rebuildHandles(); changed(); } },
      { label: 'avec un outlier', onClick: () => { pts.push([2.4, -2.4]); rebuildHandles(); changed(); } },
    ]);
    ui.check(c, { label: 'dessiner les carrés $r_n^2$', value: true, onChange: v => { st.squares = v; P.request(); } });
    const ro = ui.readout(c);
    ui.note(c, 'Aire rouge totale $= \\sum_n r_n^2 = N\\cdot\\EMSE$. Le point rouge à droite est ta droite actuelle ; le jaune, l\'optimum. Déplacer un point de donnée déforme tout le bol.');
    function moved() { P.request(); buildMarkers(); readout(); }
    function changed() { buildSurface(); P.request(); readout(); }
    function readout() {
      const [a, b] = wLS(), e = E(...st.w);
      ro.set(`$N = ${pts.length}$<br>$\\EMSE(\\bw)$ = <b>${M.fmt(e, 4)}</b><br>$\\sum r_n^2$ = <b>${M.fmt(e * pts.length, 3)}</b><br>` +
        `$\\bw$ = (<b>${M.fmt(st.w[0], 2)}</b>, <b>${M.fmt(st.w[1], 2)}</b>)<br>$\\bw_{\\text{LS}}$ = (<b>${M.fmt(a, 3)}</b>, <b>${M.fmt(b, 3)}</b>) · min = <b>${M.fmt(E(a, b), 4)}</b>`);
    }
    changed();
  });

  // ------------------------------------------------------------------ lr-proj
  ML.scene('lr-proj', host => {
    const W = ML.widget(host, {
      title: 'Moindres carrés = projection orthogonale de $\\by$ sur $\\operatorname{col}(\\bPhi)$ (ici $N=3$, $L=2$)', tag: '3D + 2D',
      views: [{ name: 's3', label: 'espace des observations $\\R^3$ : un axe par point de données', cls: 'tall', hint: 'glisser : tourner' },
              { name: 'p', label: 'espace des données $(x,y)$ — les 3 mêmes nombres', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#5cd0b3"></i>$\\boldsymbol\\varphi_1=\\mathbf 1$</span><span class="key"><i style="background:#83c167"></i>$\\boldsymbol\\varphi_2=\\mathbf x$</span><span class="key"><i style="background:#fff"></i>$\\by$</span><span class="key"><i style="background:#58c4dd"></i>$\\hby=\\bPhi\\bw_{\\text{LS}}$</span><span class="key"><i style="background:#fc6255"></i>résidu $\\by-\\hby\\perp$ plan</span><span class="key"><i style="background:#d147bd"></i>$\\bPhi\\bw$ pour ton $\\bw$</span>',
    });
    const st = { x: [0.4, 1.3, 2.2], y: [1.2, 2.6, 1.7], w: [0.5, 0.5], cur: true };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-0.5, 3.5], y: [-0.5, 3.5], z: [-0.5, 3.5] }, size: [2, 2, 2], labels: { x: 'n=1', y: 'n=2', z: 'n=3' }, theta: -0.75, phi: 1.15, radius: 6.2, target: [0, 0, 1], grid: false });
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.6, 3.2], ylim: [-0.8, 3.6], xlabel: 'x', ylabel: 'y' });
    let cache = {};
    function solve() {
      const Phi = st.x.map(x => [1, x]), G = M.gram(Phi), ev = M.eigSym(G).values;
      const rank = ev[1] > 1e-9 * ev[0] ? 2 : 1;
      const w = M.pinvSolve(Phi, st.y), yhat = M.matvec(Phi, w), r = M.sub(st.y, yhat);
      cache = { Phi, w, yhat, r, rank, cur: M.matvec(Phi, st.w) };
    }
    function build() {
      solve();
      const { w, yhat, r, rank, cur } = cache, p1 = [1, 1, 1], p2 = st.x.slice();
      S.clear('d');
      // base orthonormale du sous-espace
      const q1 = M.scale(p1, 1 / M.norm(p1));
      let q2 = M.sub(p2, M.scale(q1, M.dot(p2, q1)));
      const R = 3.2;
      if (rank === 2) {
        q2 = M.scale(q2, 1 / M.norm(q2));
        S.quad('d', M.sub(M.scale(q1, -0.4), M.scale(q2, R)), M.scale(q1, R + 1.2), M.scale(q2, 2 * R), { color: C.blue, opacity: 0.16, grid: 10 });
        S.label('col', M.add(M.scale(q1, 3.2), M.scale(q2, -1.4)), '\\operatorname{col}(\\bPhi)', { color: C.blue });
      } else {
        S.curve('d', [M.scale(q1, -1), M.scale(q1, 5)], { color: C.blue, radius: 0.01, opacity: 0.6 });
        S.label('col', M.scale(q1, 4.5), '\\operatorname{col}(\\bPhi)\\ \\text{= une droite !}', { color: C.blue });
      }
      const O = [0, 0, 0];
      S.arrow('d', O, p1, { color: C.teal }); S.label('p1', M.scale(p1, 1.08), '\\boldsymbol\\varphi_1', { color: C.teal, dx: -14 });
      S.arrow('d', O, p2, { color: C.green }); S.label('p2', M.scale(p2, 1.06), '\\boldsymbol\\varphi_2', { color: C.green, dx: 14 });
      S.arrow('d', O, st.y, { color: C.white }); S.label('y', M.scale(st.y, 1.06), '\\by', { color: '#fff', dy: -10 });
      S.arrow('d', O, yhat, { color: C.blue }); S.label('yh', yhat, '\\hby', { color: C.blue, dy: 16 });
      S.arrow('d', yhat, st.y, { color: C.red, radius: 0.01, head: 0.035 });
      // angle droit
      const rn = M.norm(r);
      if (rn > 1e-3) {
        const e1 = M.scale(r, 0.18 / rn), dvec = M.sub([0, 0, 0], yhat), dn = M.norm(dvec) || 1;
        let e2 = M.scale(dvec, 0.18 / dn); e2 = M.sub(e2, M.scale(e1, M.dot(e2, e1) / 0.0324));
        S.polyline('d', [M.add(yhat, e1), M.add(M.add(yhat, e1), e2), M.add(yhat, e2)], { color: '#fff', opacity: 0.9 });
      }
      S.segments('d', [[st.y, [st.y[0], st.y[1], 0]], [yhat, [yhat[0], yhat[1], 0]]], { color: '#555', opacity: 0.5, dashed: true });
      if (st.cur) {
        S.arrow('d', O, cur, { color: C.pink, radius: 0.009, head: 0.035, opacity: 0.9 });
        S.segments('d', [[cur, st.y]], { color: C.pink, dashed: true, opacity: 0.9 });
        S.label('cur', cur, '\\bPhi\\bw', { color: C.pink, dy: 16 });
      } else S.hideLabel('cur');
      P.request();
      readout();
    }
    P.onDraw = p => {
      const { w } = cache;
      p.fn(x => w[0] + w[1] * x, { color: C.blue, width: 3 });
      if (st.cur) p.fn(x => st.w[0] + st.w[1] * x, { color: C.pink, width: 2, dash: [6, 5] });
      st.x.forEach((x, i) => { p.seg(x, st.y[i], x, w[0] + w[1] * x, { color: C.red, width: 2 }); p.point(x, st.y[i], { color: '#fff', r: 6 }); p.tex('n' + i, x, st.y[i], `n=${i + 1}`, { dy: -16, size: 12, color: '#bbb' }); });
    };
    const c = W.controls;
    ui.title(c, 'observations $\\by$');
    const ysl = st.y.map((v, i) => ui.slider(c, { label: `$y_${i + 1}$`, min: -0.4, max: 3.4, step: 0.01, value: v, onInput: val => { st.y[i] = val; build(); } }));
    ui.title(c, 'entrées $x_n$ (colonne $\\boldsymbol\\varphi_2$)');
    const xsl = st.x.map((v, i) => ui.slider(c, { label: `$x_${i + 1}$`, min: -0.4, max: 3.2, step: 0.01, value: v, onInput: val => { st.x[i] = val; build(); } }));
    ui.buttons(c, [{ label: 'rendre $\\bPhi$ singulière ($x_1=x_2=x_3$)', onClick: () => { st.x = [1.2, 1.2, 1.2]; xsl.forEach((s, i) => s.set(st.x[i])); build(); } }]);
    ui.sep(c); ui.title(c, 'ton $\\bw$ (rose)');
    const wsl = st.w.map((v, i) => ui.slider(c, { label: `$w_${i + 1}$`, min: -2, max: 3, step: 0.01, value: v, onInput: val => { st.w[i] = val; build(); } }));
    ui.buttons(c, [{ label: '$\\bw \\leftarrow \\bw_{\\text{LS}}$', primary: true, onClick: () => { const a = st.w.slice(), b = cache.w; ML.tween(800, u => { st.w = a.map((v, i) => v + (b[i] - v) * u); wsl.forEach((s, i) => s.set(st.w[i])); build(); }); } }]);
    ui.check(c, { label: 'afficher $\\bPhi\\bw$', value: true, onChange: v => { st.cur = v; build(); } });
    const ro = ui.readout(c);
    function readout() {
      const { r, rank, cur, w } = cache, g = M.Atv(cache.Phi, r);
      ro.set(`rang$(\\bPhi)$ = <b>${rank}</b>${rank < 2 ? ' → infinité de $\\bw$, $\\bPhi^\\dagger$ prend la norme min.' : ''}<br>` +
        `$\\|\\by-\\hby\\|^2$ = <b>${M.fmt(M.dot(r, r), 4)}</b><br>$\\|\\by-\\bPhi\\bw\\|^2$ = <b>${M.fmt(M.norm(M.sub(st.y, cur)) ** 2, 4)}</b><br>` +
        `$\\bPhi\\T(\\by-\\hby)$ = (<b>${M.fmt(g[0], 1)}</b>, <b>${M.fmt(g[1], 1)}</b>)<br>$\\bw_{\\text{LS}}$ = (<b>${M.fmt(w[0], 3)}</b>, <b>${M.fmt(w[1], 3)}</b>)`);
    }
    void ysl;
    build();
  });
  // ------------------------------------------------------------------ lr-pinv
  // Cas (presque) dégénéré : x = (1−ε, 1, 1+ε), y = (1, 2, 3), f(x) = w0 + w1 x.
  // ε = 0 : colonnes 1 et x colinéaires → vallée de solutions ; Φ†y = solution de norme minimale.
  ML.scene('lr-pinv', host => {
    const W = ML.widget(host, {
      title: 'Vallée de solutions, pseudo-inverse, limite du ridge et instabilité', tag: '2D + 3D',
      views: [{ name: 'p', label: 'espace des poids $(w_0,w_1)$ : niveaux de $\\EMSE$', cls: 'tall' }, { name: 's3', label: 'la MSE comme surface : bol ou gouttière', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>minimiseurs (ε = 0 : une droite)</span><span class="key"><i class="dot" style="background:#f4d345"></i>$\\bPhi^\\dagger\\by$ (tronquée)</span><span class="key"><i class="dot" style="background:#fc6255"></i>$\\hat\\bw_{\\text{LS}}$ exact (ε &gt; 0)</span><span class="key"><i style="background:#d147bd"></i>cercle $\\|\\bw\\| = \\|\\bw^\\dagger\\|$</span><span class="key"><i style="background:#fff"></i>chemin ridge $\\lambda\\to0$</span><span class="key"><i style="background:#5cd0b3"></i>GD depuis 0</span>',
    });
    const st = { eps: 0, ltol: -6, llam: -1 };
    const sh = W.show, rb = () => build3d();
    W.toggle('heat', 'fond coloré (MSE)'); W.toggle('sol', 'minimiseurs / $\\hat\\bw_{\\text{LS}}$', true, rb); W.toggle('circle', 'cercle de norme minimale');
    W.toggle('ridge', 'chemin et point ridge', true, rb); W.toggle('gd', 'descente de gradient depuis $\\bw_0=0$', true, rb); W.toggle('svd', 'directions $\\bv_1,\\bv_2$ (SVD)');
    const Y = [1, 2, 3];
    let S; // état calculé
    function compute() {
      const xs = [1 - st.eps, 1, 1 + st.eps], Phi = xs.map(x => [1, x]), G = M.gram(Phi), g = M.Atv(Phi, Y);
      const { values, vectors } = M.eigSym(G), sig = values.map(v => Math.sqrt(Math.max(v, 0)));
      const V = [0, 1].map(i => [vectors[0][i], vectors[1][i]]);
      const tol = 10 ** st.ltol * sig[0];
      let wd = [0, 0];
      V.forEach((v, i) => { if (sig[i] > tol) wd = M.add(wd, M.scale(v, M.dot(v, g) / (sig[i] * sig[i]))); });
      const exact = sig[1] > 1e-12 * sig[0] ? M.solve(G, g) : null;
      const E = (a, b) => M.mean(Phi.map((r, n) => (Y[n] - r[0] * a - r[1] * b) ** 2));
      const ridge = l => M.solve(M.addDiag(G, 3 * l), g);
      const path = M.linspace(3, -8, 90).map(l => ridge(10 ** l));
      const L = 2 * values[0] / 3; let w = [0, 0]; const gd = [w];
      for (let t = 0; t < 300; t++) { const gr = M.scale(M.sub(M.matvec(G, w), g), 2 / 3); w = M.sub(w, M.scale(gr, 1 / L)); gd.push(w); }
      S = { xs, Phi, G, sig, V, tol, wd, exact, E, ridge, path, gd, rank: sig.filter(s => s > tol).length };
    }
    const R = 6;
    const P = new ML.Plot2D(W.views.p, { xlim: [-4, 6], ylim: [-4, 6], equal: true, xlabel: 'w_0', ylabel: 'w_1' });
    P.onDraw = p => {
      const key = 'pinv' + st.eps;
      if (sh.heat) p.heatmap(S.E, v => M.rampRgb(0.8 * Math.min(1, Math.log1p(4 * v) / Math.log1p(40))).map(c => c * 0.45), { res: 4, key });
      p.contour(S.E, [0.67, 0.8, 1, 1.5, 2.5, 4, 6, 9, 13], { color: C.blue, width: 1, alpha: 0.5, key });
      if (sh.svd) S.V.forEach((v, i) => { p.arrow(0, 0, 1.6 * v[0], 1.6 * v[1], { color: i ? C.green : C.teal, width: 2 }); p.tex('v' + i, 1.75 * v[0], 1.75 * v[1], `\\bv_${i + 1}\\ (\\sigma_${i + 1}=${M.fmt(S.sig[i], 3)})`, { color: i ? C.green : C.teal, size: 12, anchor: 'left' }); });
      if (sh.sol) {
        if (!S.exact) { const seg = ML.clipLine([1, 1], [1, -1], R); if (seg) p.polyline(seg, { color: C.yellow, width: 3, dash: [8, 5] }); p.tex('val', 5.2, -3.2, 'w_0 + w_1 = 2\\ :\\ \\text{vallée plate}', { color: C.yellow, anchor: 'right', size: 12 }); }
        else {
          const e = S.exact, inR = Math.abs(e[0]) < 6 && Math.abs(e[1]) < 6;
          if (inR) p.point(e[0], e[1], { color: C.red, r: 6, stroke: '#000' });
          else { const d = M.scale(e, 1 / M.norm(e)), tip = M.scale(d, 5.2); p.arrow(tip[0] - d[0], tip[1] - d[1], tip[0], tip[1], { color: C.red, width: 3 }); p.tex('far', tip[0], tip[1], `\\hat\\bw_{\\text{LS}} = (${M.fmt(e[0], 1)},\\,${M.fmt(e[1], 1)})`, { color: C.red, dy: 16, size: 12 }); }
        }
      }
      if (sh.circle) p.circle(0, 0, M.norm(S.wd), { color: C.pink, width: 1.5, dash: [5, 4] });
      if (sh.ridge) { p.polyline(S.path, { color: '#fff', width: 1.5, dash: [4, 4], alpha: 0.8 }); const wr = S.ridge(10 ** st.llam); p.point(wr[0], wr[1], { color: '#fff', r: 5, stroke: '#000' }); }
      if (sh.gd) { p.polyline(S.gd, { color: C.teal, width: 1.8 }); p.point(0, 0, { color: C.teal, r: 3 }); }
      p.point(S.wd[0], S.wd[1], { color: C.yellow, r: 7, stroke: '#000' });
      p.tex('wd', S.wd[0], S.wd[1], '\\bPhi^\\dagger\\by', { color: C.yellow, dx: 12, dy: -12, anchor: 'left' });
    };
    const S3 = new ML.Scene3D(W.views.s3, { range: { x: [-4, 6], y: [-4, 6], z: [0, 6] }, size: [2.3, 2.3, 1.4], labels: { x: 'w_0', y: 'w_1', z: '\\widehat E' }, theta: -2.6, phi: 1.1, radius: 5.8 });
    function build3d() {
      S3.clear('d');
      S3.surface('d', S.E, { res: 50, opacity: 0.8, zclip: [0, 6], hideClipped: true, logColor: true });
      const Emin = S.E(...S.wd);
      if (sh.sol && !S.exact) { const seg = ML.clipLine([1, 1], [1, -1], 4); if (seg) S3.curve('d', seg.map(q => [q[0], q[1], Emin + 0.02]), { color: C.yellow, radius: 0.014 }); }
      if (sh.sol && S.exact && Math.abs(S.exact[0]) < 4 && Math.abs(S.exact[1]) < 6) S3.points('d', [[S.exact[0], S.exact[1], S.E(...S.exact) + 0.03]], { color: C.red, radius: 0.045 });
      S3.points('d', [[S.wd[0], S.wd[1], Emin + 0.03]], { color: C.yellow, radius: 0.05 });
      if (sh.gd) S3.curve('d', S.gd.filter(q => Math.abs(q[0]) < 4 && Math.abs(q[1]) < 6).map(q => [q[0], q[1], Math.min(6, S.E(...q)) + 0.03]), { color: C.teal, radius: 0.01 });
    }
    const c = W.controls;
    ui.slider(c, { label: 'écart des entrées $\\varepsilon$ : $x = (1-\\varepsilon,\\,1,\\,1+\\varepsilon)$', min: 0, max: 1, step: 0.001, value: st.eps, digits: 3, onInput: v => { st.eps = v; upd(); } });
    ui.buttons(c, [{ label: '$\\varepsilon = 0$ (singulier)', onClick: () => setEps(0) }, { label: '$\\varepsilon = 0.01$', onClick: () => setEps(0.01) }, { label: '$\\varepsilon = 0.5$', onClick: () => setEps(0.5) }]);
    ui.slider(c, { label: 'troncature $\\sigma_i<\\text{tol}\\cdot\\sigma_1$ : $\\log_{10}\\text{tol}$', min: -12, max: -0.5, step: 0.05, value: st.ltol, onInput: v => { st.ltol = v; upd(); } });
    ui.slider(c, { label: 'ridge : $\\log_{10}\\lambda$', min: -8, max: 2, step: 0.05, value: st.llam, onInput: v => { st.llam = v; P.request(); } });
    const ro = ui.readout(c);
    const epsCtl = c.querySelector('input[type=range]');
    function setEps(v) { st.eps = v; epsCtl.value = v; epsCtl.dispatchEvent(new Event('input')); }
    function upd() {
      compute(); P.request(); build3d();
      const yh = M.matvec(S.Phi, S.wd);
      ro.set(`valeurs singulières : $\\sigma_1$ = <b>${M.fmt(S.sig[0], 3)}</b>, $\\sigma_2$ = <b>${M.fmt(S.sig[1], 3)}</b> · rang (après troncature) = <b>${S.rank}</b><br>` +
        (S.exact ? `$\\hat\\bw_{\\text{LS}}$ exact = (<b>${M.fmt(S.exact[0], 3)}</b>, <b>${M.fmt(S.exact[1], 3)}</b>), $\\|\\cdot\\|$ = <b>${M.fmt(M.norm(S.exact), 3)}</b><br>` : `$\\bPhi\\T\\bPhi$ singulière : <b>infinité</b> de minimiseurs ($w_0+w_1 = 2$)<br>`) +
        `$\\bPhi^\\dagger\\by$ = (<b>${M.fmt(S.wd[0], 3)}</b>, <b>${M.fmt(S.wd[1], 3)}</b>), $\\|\\cdot\\|$ = <b>${M.fmt(M.norm(S.wd), 3)}</b><br>prédictions $\\bPhi\\bw^\\dagger$ = (${yh.map(v => M.fmt(v, 2)).join(', ')})<br>` +
        `<span class="k">GD depuis 0 (300 pas) arrive en (${M.fmt(S.gd[S.gd.length - 1][0], 3)}, ${M.fmt(S.gd[S.gd.length - 1][1], 3)})</span>`);
    }
    ui.note(c, 'À $\\varepsilon = 0$ : la gouttière a un fond plat, $\\bPhi^\\dagger\\by = (1,1)$ est le point du fond le plus proche de l\'origine (tangent au cercle rose), et le chemin ridge et GD y arrivent. Monte un peu $\\varepsilon$ avec une troncature faible ($10^{-12}$) : la solution exacte file vers l\'infini le long de la vallée ; avec une troncature forte, $\\bPhi^\\dagger$ reste près de $(1,1)$.');
    upd();
  });
})(window.ML);
