/* Chapitre 5 — Réseaux de neurones · §5–6 : graphe de calcul, rétropropagation chiffrée, entraînement */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, NN = ML.nn;
  const fx = v => (Math.abs(v) < 1e-12 ? '0' : Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(3));

  // dessine un nœud (cercle + texte) et une arête
  const node = (p, x, y, label, s = {}) => { p.point(x, y, { color: s.color || '#1d2a33', r: s.r || 22, stroke: s.stroke || '#9bb', strokeWidth: 1.5 }); p.tex('n' + label + x + y, x, y, label, { color: '#fff', size: s.size || 15 }); };
  const edge = (p, a, b, s = {}) => p.arrow(a[0], a[1], b[0], b[1], Object.assign({ color: '#6b7c88', width: 1.6, head: 8 }, s));

  // ------------------------------------------------------------------ nn-graph
  ML.scene('nn-graph', host => {
    const W = ML.widget(host, {
      title: 'Graphe de calcul de $f(x,y,z) = (x+y)\\,z$ : passe avant, puis passe arrière (slides 32–34)', tag: '2D',
      views: [{ name: 'p', label: 'vert : valeurs (avant) · rouge : gradients $\\partial f/\\partial\\cdot$ (arrière)', cls: 'tall' }],
      controls: true,
    });
    const st = { x: -2, y: 5, z: -4, k: 0 };
    const STEPS = 6;
    const pos = { x: [0, 2], y: [0, 0.6], z: [0, -1.4], q: [2.4, 1.3], f: [4.8, 0] };
    const P = new ML.Plot2D(W.views.p, { xlim: [-1, 6], ylim: [-2.6, 3.2], equal: true, grid: false, axes: false, ticks: false });
    P.onDraw = p => {
      const q = st.x + st.y, f = q * st.z, k = st.k;
      edge(p, [pos.x[0] + 0.35, pos.x[1] - 0.1], [pos.q[0] - 0.38, pos.q[1] + 0.12]);
      edge(p, [pos.y[0] + 0.35, pos.y[1] + 0.1], [pos.q[0] - 0.38, pos.q[1] - 0.12]);
      edge(p, [pos.q[0] + 0.35, pos.q[1] - 0.15], [pos.f[0] - 0.38, pos.f[1] + 0.15]);
      edge(p, [pos.z[0] + 0.35, pos.z[1] + 0.1], [pos.f[0] - 0.38, pos.f[1] - 0.15]);
      ['x', 'y', 'z'].forEach(v => node(p, pos[v][0], pos[v][1], v));
      node(p, pos.q[0], pos.q[1], '+', { stroke: C.gold }); node(p, pos.f[0], pos.f[1], '\\times', { stroke: C.gold });
      const val = (key, x, y, t) => p.tex('v' + key, x, y, t, { color: C.green, size: 14 });
      const grd = (key, x, y, t) => p.tex('g' + key, x, y, t, { color: C.red, size: 14 });
      // passe avant
      val('x', pos.x[0], pos.x[1] + 0.55, 'x = ' + st.x); val('y', pos.y[0], pos.y[1] + 0.55, 'y = ' + st.y); val('z', pos.z[0], pos.z[1] + 0.55, 'z = ' + st.z);
      if (k >= 1) val('q', pos.q[0], pos.q[1] + 0.6, 'q = x+y = ' + q);
      if (k >= 2) val('f', pos.f[0], pos.f[1] + 0.6, 'f = qz = ' + f);
      // passe arrière
      if (k >= 3) grd('f', pos.f[0], pos.f[1] - 0.62, '\\tfrac{\\partial f}{\\partial f} = 1');
      if (k >= 4) { grd('q', pos.q[0], pos.q[1] - 0.62, '\\tfrac{\\partial f}{\\partial q} = z = ' + st.z); grd('z', pos.z[0], pos.z[1] - 0.6, '\\tfrac{\\partial f}{\\partial z} = q = ' + q); }
      if (k >= 5) { grd('x', pos.x[0], pos.x[1] - 0.6, '\\tfrac{\\partial f}{\\partial x} = ' + st.z + '\\cdot1 = ' + st.z); grd('y', pos.y[0], pos.y[1] - 0.6, '\\tfrac{\\partial f}{\\partial y} = ' + st.z + '\\cdot1 = ' + st.z); }
    };
    const c = W.controls;
    ['x', 'y', 'z'].forEach(v => ui.slider(c, { label: `$${v}$`, min: -6, max: 6, step: 1, value: st[v], fmt: t => t.toFixed(0), onInput: t => { st[v] = t; upd(); } }));
    ui.buttons(c, [{ label: 'étape suivante ▸', primary: true, onClick: () => { st.k = Math.min(STEPS - 1, st.k + 1); upd(); } }, { label: 'tout', onClick: () => { st.k = STEPS - 1; upd(); } }, { label: '↺', onClick: () => { st.k = 0; upd(); } }]);
    const ro = ui.readout(c);
    const TXT = [
      'Le graphe : deux opérations, une addition puis une multiplication. Clique « étape suivante ».',
      '<b>Avant ①</b> : l\'addition produit $q = x+y$ ; on <b>garde</b> $q$ en mémoire.',
      '<b>Avant ②</b> : la multiplication produit $f = qz$. La passe avant est finie.',
      '<b>Arrière ①</b> : on part de $\\partial f/\\partial f = 1$.',
      '<b>Arrière ②</b> : nœud $\\times$ : $\\partial f/\\partial q = z$ et $\\partial f/\\partial z = q$ — on <b>réutilise</b> la valeur $q$ stockée à l\'avant.',
      '<b>Arrière ③</b> : nœud $+$ : dérivée locale 1 pour chaque entrée, donc $\\partial f/\\partial x = \\partial f/\\partial y = \\frac{\\partial f}{\\partial q}\\cdot1$. Le gradient $z$ est calculé une fois et réutilisé deux fois.',
    ];
    function upd() {
      const q = st.x + st.y;
      ro.set(`${TXT[st.k]}${st.k === STEPS - 1 ? `<br>Gradient complet : $\\nabla f = (${st.z},\\ ${st.z},\\ ${q})$.` : ''}`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ nn-backprop
  ML.scene('nn-backprop', host => {
    const W = ML.widget(host, {
      title: 'Rétropropagation chiffrée dans un MLP 2 → 2 → 1, vérifiée par différences finies', tag: '2D',
      views: [{ name: 'p', label: 'avant : $z$ et $h$ (vert) · arrière : $\\delta = \\partial\\ell/\\partial z$ (rouge)', cls: 'tall' }],
      controls: 'wide',
    });
    const st = { seed: 2, act: 'tanh', x: [1, -0.5], y: 1, k: 0 };
    let net;
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.8, 6.2], ylim: [-2.4, 2.4], equal: true, grid: false, axes: false, ticks: false });
    const compute = () => {
      const fw = NN.forward(net, st.x), A = NN.ACT[net.act], z2 = fw.logit, p = M.sigmoid(z2);
      const d2 = p - st.y, W2 = net.layers[1].W[0], g1 = W2.map(w => w * d2), d1 = g1.map((g, j) => g * A.d(fw.zs[0][j], fw.hs[1][j]));
      return { fw, z2, p, d2, g1, d1, gW2: fw.hs[1].map(h => d2 * h), gb2: d2, gW1: d1.map(d => st.x.map(x => d * x)), gb1: d1, loss: NN.bce(z2, st.y) };
    };
    const XP = [[0, 0.9], [0, -0.9]], HP = [[2.6, 1.1], [2.6, -1.1]], OP = [5.2, 0];
    P.onDraw = p => {
      const r = compute(), L1 = net.layers[0], L2 = net.layers[1], k = st.k;
      XP.forEach((a, i) => HP.forEach((b, j) => { edge(p, [a[0] + 0.32, a[1]], [b[0] - 0.34, b[1]], { color: '#4d5c66', width: 1.2 }); p.tex(`w1${i}${j}`, a[0] + (b[0] - a[0]) * (i === j ? 0.32 : 0.7), a[1] + (b[1] - a[1]) * (i === j ? 0.32 : 0.7), `${fx(L1.W[j][i])}`, { color: '#9aa', size: 11 }); }));
      HP.forEach((b, j) => { edge(p, [b[0] + 0.34, b[1]], [OP[0] - 0.36, OP[1]], { color: '#4d5c66', width: 1.2 }); p.tex('w2' + j, (b[0] + OP[0]) / 2, (b[1] + OP[1]) / 2 + 0.25, fx(L2.W[0][j]), { color: '#9aa', size: 11 }); });
      XP.forEach((a, i) => { node(p, a[0], a[1], `x_${i + 1}`); p.tex('xv' + i, a[0], a[1] - 0.55, `${fx(st.x[i])}`, { color: C.green, size: 13 }); });
      HP.forEach((b, j) => {
        node(p, b[0], b[1], `h_${j + 1}`);
        if (k >= 1) p.tex('hv' + j, b[0], b[1] + 0.6, `z = ${fx(r.fw.zs[0][j])},\\ h = ${fx(r.fw.hs[1][j])}`, { color: C.green, size: 12 });
        if (k >= 4) p.tex('hd' + j, b[0], b[1] - 0.62, `\\delta^{(1)}_${j + 1} = ${fx(r.d1[j])}`, { color: C.red, size: 12 });
      });
      node(p, OP[0], OP[1], 'z^{(2)}');
      if (k >= 2) p.tex('ov', OP[0], OP[1] + 0.62, `z = ${fx(r.z2)},\\ p = ${fx(r.p)}`, { color: C.green, size: 12 });
      if (k >= 3) p.tex('od', OP[0], OP[1] - 0.62, `\\delta^{(2)} = p - y = ${fx(r.d2)}`, { color: C.red, size: 12 });
    };
    const c = W.controls;
    ui.select(c, { label: 'activation cachée', value: st.act, options: [['tanh', 'tanh'], ['sigmoid', 'sigmoïde'], ['relu', 'ReLU']], onChange: v => { st.act = v; net.act = v; upd(); } });
    ui.select(c, { label: 'étiquette $y$', value: '1', options: [['1', 'y = 1'], ['0', 'y = 0']], onChange: v => { st.y = +v; upd(); } });
    ui.slider(c, { label: '$x_1$', min: -2, max: 2, step: 0.05, value: st.x[0], onInput: v => { st.x[0] = v; upd(); } });
    ui.slider(c, { label: '$x_2$', min: -2, max: 2, step: 0.05, value: st.x[1], onInput: v => { st.x[1] = v; upd(); } });
    ui.buttons(c, [{ label: 'étape suivante ▸', primary: true, onClick: () => { st.k = Math.min(5, st.k + 1); upd(); } }, { label: 'tout', onClick: () => { st.k = 5; upd(); } }, { label: '↺', onClick: () => { st.k = 0; upd(); } }, { label: '🎲 autres poids', onClick: () => { st.seed++; net = NN.init([2, 2, 1], st.seed, st.act); upd(); } }]);
    const ro = ui.readout(c);
    const tab = ui.readout(c); tab.el.style.fontFamily = 'var(--font-mono)'; tab.el.style.fontSize = '12px';
    const TXT = [
      'Un exemple $(\\bx, y)$, perte $\\ell = \\mathrm{BCE}(y, z^{(2)})$. Clique « étape suivante ».',
      '<b>Avant, couche 1</b> : $\\bz^{(1)} = W_1\\bx+\\bb_1$, $\\bh^{(1)} = \\varphi(\\bz^{(1)})$.',
      '<b>Avant, sortie</b> : $z^{(2)} = \\bw_2\\T\\bh^{(1)}+b_2$, $p = \\sigma(z^{(2)})$.',
      '<b>Arrière, sortie</b> : $\\delta^{(2)} = \\partial\\ell/\\partial z^{(2)} = p-y$. Puis $\\partial\\ell/\\partial\\bw_2 = \\delta^{(2)}\\bh^{(1)}$, $\\partial\\ell/\\partial b_2 = \\delta^{(2)}$.',
      '<b>Arrière, couche 1</b> : $\\partial\\ell/\\partial\\bh^{(1)} = \\bw_2\\,\\delta^{(2)}$ (c\'est $W^\\top\\delta$), puis $\\boldsymbol\\delta^{(1)} = \\big(\\bw_2\\delta^{(2)}\\big)\\odot\\varphi\'(\\bz^{(1)})$, et $\\partial\\ell/\\partial W_1 = \\boldsymbol\\delta^{(1)}\\bx\\T$, $\\partial\\ell/\\partial\\bb_1 = \\boldsymbol\\delta^{(1)}$.',
      '<b>Vérification</b> : chaque dérivée comparée à $\\frac{\\ell(\\theta+\\epsilon)-\\ell(\\theta-\\epsilon)}{2\\epsilon}$ (différences finies, $\\epsilon = 10^{-5}$).',
    ];
    function fd(get, set) { const e = 1e-5, v0 = get(); set(v0 + e); const a = NN.bce(NN.forward(net, st.x).logit, st.y); set(v0 - e); const b = NN.bce(NN.forward(net, st.x).logit, st.y); set(v0); return (a - b) / (2 * e); }
    function upd() {
      const r = compute(), L1 = net.layers[0], L2 = net.layers[1];
      ro.set(`perte $\\ell = ${r.loss.toFixed(5)}$<br>${TXT[st.k]}`);
      if (st.k >= 3) {
        const rows = [];
        const add = (name, bp, num) => rows.push(`<div style="display:flex;gap:14px"><span style="color:#9aa;min-width:84px">${name}</span><span style="color:#fc6255;min-width:90px">${bp.toFixed(6)}</span>${st.k >= 5 ? `<span style="color:#83c167">${num.toFixed(6)}</span>` : ''}</div>`);
        rows.push(`<div style="display:flex;gap:14px;color:#6b7280"><span style="min-width:84px">paramètre</span><span style="min-width:90px">rétroprop.</span>${st.k >= 5 ? '<span>diff. finies</span>' : ''}</div>`);
        [0, 1].forEach(j => add(`∂ℓ/∂w2[${j + 1}]`, r.gW2[j], fd(() => L2.W[0][j], v => { L2.W[0][j] = v; })));
        add('∂ℓ/∂b2', r.gb2, fd(() => L2.b[0], v => { L2.b[0] = v; }));
        if (st.k >= 4) {
          [0, 1].forEach(j => [0, 1].forEach(i => add(`∂ℓ/∂W1[${j + 1},${i + 1}]`, r.gW1[j][i], fd(() => L1.W[j][i], v => { L1.W[j][i] = v; }))));
          [0, 1].forEach(j => add(`∂ℓ/∂b1[${j + 1}]`, r.gb1[j], fd(() => L1.b[j], v => { L1.b[j] = v; })));
        }
        tab.el.innerHTML = rows.join('');
      } else tab.el.innerHTML = '<span style="color:#6b7280">les gradients apparaissent à la passe arrière</span>';
      P.request();
    }
    net = NN.init([2, 2, 1], st.seed, st.act); net.layers[0].b = [0.2, -0.3]; net.layers[1].b = [0.1];
    upd();
  });

  // ------------------------------------------------------------------ nn-train
  ML.scene('nn-train', host => {
    const W = ML.widget(host, {
      title: 'Entraîner un MLP : architecture, activation, taille du mini-batch (slides 42–43)', tag: '2D',
      views: [{ name: 'x', label: 'frontière apprise ($p = \\frac12$) et probabilité $p(\\bx)$', cls: 'tall' }, { name: 'l', label: 'perte d\'entraînement (BCE) par époque, échelle log', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>classe 1</span><span class="key"><i class="dot" style="background:#fc6255"></i>classe 0</span>',
    });
    const st = { ds: 'moons', depth: 1, width: 8, act: 'tanh', lr: 0.1, B: 32, seed: 1 };
    let D, net, hist = [], epoch = 0, updates = 0, order = [], pos = 0;
    const R = 2.4, N = 200;
    const P = new ML.Plot2D(W.views.x, { xlim: [-R, R], ylim: [-R, R], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    const LP = new ML.Plot2D(W.views.l, { xlim: [0, 50], ylim: [-3, 0.5], xlabel: '\\text{époque}', ylabel: '\\text{perte}', gridStep: [10, 1], tickFmt: (v, ax) => (ax === 'y' ? (Math.abs(v - Math.round(v)) < 1e-6 ? (Math.round(v) >= -2 ? String(+(10 ** Math.round(v)).toPrecision(1)) : '1e' + Math.round(v)) : '') : String(Math.round(v))) });
    P.onDraw = p => {
      p.heatmap((a, c) => NN.prob(net, [a, c]), NN.probRgb, { res: 4 });
      p.contour((a, c) => NN.forward(net, [a, c]).logit, [0], { color: '#fff', width: 2.2 });
      D.X.forEach((x, n) => p.point(x[0], x[1], { color: D.Y[n] ? C.blue : C.red, r: 3, stroke: '#000', strokeWidth: 0.8 }));
    };
    LP.onDraw = p => { if (hist.length > 1) p.polyline(hist.map((l, i) => [i, Math.log10(Math.max(l, 1e-4))]), { color: C.yellow, width: 2.5 }); };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.ds, options: [['moons', 'deux lunes'], ['circles', 'cercles'], ['xor', 'XOR'], ['spiral', 'spirale']], onChange: v => { st.ds = v; reset(); } });
    ui.slider(c, { label: 'couches cachées', min: 1, max: 3, step: 1, value: st.depth, fmt: v => v.toFixed(0), onInput: v => { st.depth = v; reset(); } });
    ui.slider(c, { label: 'largeur (unités par couche)', min: 1, max: 24, step: 1, value: st.width, fmt: v => v.toFixed(0), onInput: v => { st.width = v; reset(); } });
    ui.select(c, { label: 'activation', value: st.act, options: [['tanh', 'tanh'], ['relu', 'ReLU'], ['sigmoid', 'sigmoïde']], onChange: v => { st.act = v; reset(); } });
    ui.select(c, { label: 'taille du mini-batch $B$', value: String(st.B), options: [['1', 'B = 1 (SGD)'], ['8', 'B = 8'], ['32', 'B = 32'], ['200', 'B = N = 200 (plein batch)']], onChange: v => { st.B = +v; reset(); } });
    ui.slider(c, { label: 'pas $\\eta$', min: -3, max: 0, log: true, value: st.lr, digits: 3, onInput: v => { st.lr = v; } });
    ui.player(c, { speed: 6, step: () => { trainEpoch(); P.request(); LP.request(); info(); }, reset: () => { st.seed++; reset(); } });
    const ro = ui.readout(c);
    function trainEpoch() {
      // une époque = un passage sur les N exemples, en mini-batchs de taille B (ordre mélangé)
      const r = M.rng(1000 + epoch + 31 * st.seed); order = r.shuffle(M.range(N));
      for (let s = 0; s < N; s += st.B) { const g = NN.lossGrad(net, D.X, D.Y, order.slice(s, s + st.B)); NN.step(net, g.g, st.lr, 0.9); updates++; }
      epoch++; hist.push(NN.lossGrad(net, D.X, D.Y, M.range(N)).loss);
      if (hist.length > 50) LP.setLimits([0, Math.ceil(hist.length / 50) * 50], null);
    }
    function info() { ro.set(`époque <b>${epoch}</b> · mises à jour <b>${updates}</b> ($\\lceil N/B\\rceil = ${Math.ceil(N / st.B)}$ par époque)<br>perte <b>${(hist[hist.length - 1] || 0).toFixed(4)}</b> · précision <b>${(100 * NN.accuracy(net, D.X, D.Y)).toFixed(1)} %</b> · paramètres : <b>${net.layers.reduce((s, L) => s + L.W.length * L.W[0].length + L.b.length, 0)}</b>`); }
    function reset() {
      D = NN.DATA[st.ds](N, 5, st.ds === 'xor' ? 0.22 : st.ds === 'spiral' ? 0.05 : 0.1);
      net = NN.init([2, ...Array(st.depth).fill(st.width), 1], st.seed, st.act);
      hist = [NN.lossGrad(net, D.X, D.Y, M.range(N)).loss]; epoch = 0; updates = 0; LP.setLimits([0, 50], null);
      P.request(); LP.request(); info();
    }
    reset();
  });
})(window.ML);
