/* Chapitre 5 — Réseaux de neurones · §1–2 : XOR, unités cachées, régions, booléens, approximation universelle */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const sgn = v => (v >= 0 ? 1 : -1);
  const XOR = [[0, 0, -1], [0, 1, 1], [1, 0, 1], [1, 1, -1]]; // (x1, x2, ŷ attendu ∈ {−1,+1})
  // demi-plan {w·x + b ≥ 0} : trace la droite w·x + b = 0 et une flèche normale vers le côté positif
  const drawLine = (p, w, b, s) => {
    const n = Math.hypot(w[0], w[1]); if (n < 1e-9) return;
    const x0 = [-b * w[0] / (n * n), -b * w[1] / (n * n)], t = [-w[1] / n, w[0] / n];
    p.seg(x0[0] - 20 * t[0], x0[1] - 20 * t[1], x0[0] + 20 * t[0], x0[1] + 20 * t[1], s);
    return x0;
  };

  // ------------------------------------------------------------------ nn-xor
  ML.scene('nn-xor', host => {
    const W = ML.widget(host, {
      title: 'XOR : impossible avec une droite, facile avec deux unités cachées (slides 5, 8–10)', tag: '2D',
      views: [{ name: 'x', label: 'espace d\'entrée $(x_1, x_2)$', cls: 'tall' }, { name: 'h', label: 'espace des unités cachées $(h_1, h_2)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>classe 1 ($\\hat y = +1$)</span><span class="key"><i class="dot" style="background:#fc6255"></i>classe 0 ($\\hat y = -1$)</span><span class="key"><i style="background:#f4d345"></i>$h_1$ : OU</span><span class="key"><i style="background:#9a72ac"></i>$h_2$ : ET</span>',
    });
    const st = { mode: 'net', b1: 0.5, b2: 1.5, w: [1, 1], b: -1, k: 0 };
    W.toggle('shade', 'couleur de la sortie $\\hat y$', true);
    W.toggle('lines', 'droites des unités cachées', true);
    const P = new ML.Plot2D(W.views.x, { xlim: [-0.7, 1.7], ylim: [-0.7, 1.7], equal: true, xlabel: 'x_1', ylabel: 'x_2', gridStep: [0.5, 0.5] });
    const H = new ML.Plot2D(W.views.h, { xlim: [-1.8, 1.8], ylim: [-1.8, 1.8], equal: true, xlabel: 'h_1', ylabel: 'h_2', gridStep: [1, 1] });
    const act = v => (st.k > 0 ? Math.tanh(st.k * v) : sgn(v)); // sign, ou tanh(k·) lissé
    const hid = x => [act(x[0] + x[1] - st.b1), act(x[0] + x[1] - st.b2)];
    const out = h => 0.5 * h[0] - 0.5 * h[1] - 0.5;
    const yhat = x => (st.mode === 'net' ? out(hid(x)) : st.w[0] * x[0] + st.w[1] * x[1] + st.b);
    P.onDraw = p => {
      if (W.show.shade) p.heatmap((a, c) => yhat([a, c]), v => (v >= 0 ? [20, 60, 80] : [80, 28, 26]), { res: 4 });
      if (st.mode === 'net') {
        if (W.show.lines) {
          drawLine(p, [1, 1], -st.b1, { color: C.yellow, width: 2, dash: [6, 4] });
          drawLine(p, [1, 1], -st.b2, { color: C.purple, width: 2, dash: [6, 4] });
          p.tex('h1', -0.62, 1.58, 'h_1 : x_1+x_2 = ' + st.b1.toFixed(2), { color: C.yellow, size: 12, anchor: 'left' });
          p.tex('h2', -0.62, 1.4, 'h_2 : x_1+x_2 = ' + st.b2.toFixed(2), { color: C.purple, size: 12, anchor: 'left' });
        }
      } else {
        drawLine(p, st.w, st.b, { color: '#fff', width: 2.5 });
      }
      XOR.forEach(([a, c, y], i) => {
        const ok = sgn(yhat([a, c])) === y;
        p.point(a, c, { color: y > 0 ? C.blue : C.red, r: 8, stroke: ok ? '#000' : '#fff', strokeWidth: ok ? 1.5 : 3 });
        p.tex('p' + i, a, c, `(${a},${c})`, { color: '#ccc', size: 12, dx: 0, dy: 18 });
      });
    };
    if (true) {
      P.addDraggable({ get: () => (st.mode === 'line' ? lineHandle() : [99, 99]), set: (a, c) => { if (st.mode !== 'line') return; const n = Math.hypot(st.w[0], st.w[1]); st.b = -(st.w[0] * a + st.w[1] * c); upd(); }, r: 14 });
      P.addDraggable({ get: () => { if (st.mode !== 'line') return [99, 99]; const h = lineHandle(); return [h[0] + st.w[0] * 0.45, h[1] + st.w[1] * 0.45]; }, set: (a, c) => { if (st.mode !== 'line') return; const h = lineHandle(); const w = [(a - h[0]) / 0.45, (c - h[1]) / 0.45]; if (Math.hypot(w[0], w[1]) > 0.05) { st.w = w; st.b = -(w[0] * h[0] + w[1] * h[1]); } upd(); }, r: 12 });
    }
    function lineHandle() { const n2 = st.w[0] ** 2 + st.w[1] ** 2; return [0.5 - st.w[0] * (st.w[0] * 0.5 + st.w[1] * 0.5 + st.b) / n2, 0.5 - st.w[1] * (st.w[0] * 0.5 + st.w[1] * 0.5 + st.b) / n2]; }
    P.onDrawTop = p => { if (st.mode !== 'line') return; const h = lineHandle(); p.point(h[0], h[1], { color: '#fff', r: 6, glow: true }); p.arrow(h[0], h[1], h[0] + st.w[0] * 0.45, h[1] + st.w[1] * 0.45, { color: C.yellow, width: 2 }); p.point(h[0] + st.w[0] * 0.45, h[1] + st.w[1] * 0.45, { color: C.yellow, r: 6, glow: true }); };
    H.onDraw = p => {
      if (st.mode !== 'net') { p.text(0, 0, 'mode « une seule droite » : pas de couche cachée', { color: '#888', size: 13 }); return; }
      if (W.show.shade) p.heatmap((a, c) => out([a, c]), v => (v >= 0 ? [20, 60, 80] : [80, 28, 26]), { res: 4 });
      drawLine(p, [0.5, -0.5], -0.5, { color: '#fff', width: 2.5 });
      p.tex('o', 1.7, 0.45, '\\tfrac12h_1-\\tfrac12h_2-\\tfrac12 = 0', { color: '#fff', size: 12, anchor: 'right' });
      XOR.forEach(([a, c, y], i) => {
        const h = hid([a, c]);
        p.point(h[0] + (i === 2 ? 0.07 : i === 1 ? -0.07 : 0), h[1] + (i === 2 ? 0.07 : i === 1 ? -0.07 : 0), { color: y > 0 ? C.blue : C.red, r: 8, stroke: '#000' });
        p.tex('q' + i, h[0], h[1], `(${a},${c})`, { color: '#ccc', size: 11, dy: 18 });
      });
    };
    const c = W.controls;
    ui.select(c, { label: 'modèle', value: st.mode, options: [['net', 'réseau : 2 unités cachées (OU, ET)'], ['line', 'un seul perceptron (droite à déplacer)']], onChange: v => { st.mode = v; upd(); } });
    ui.slider(c, { label: 'seuil de $h_1$ (OU)', min: -0.5, max: 2.5, step: 0.05, value: st.b1, onInput: v => { st.b1 = v; upd(); } });
    ui.slider(c, { label: 'seuil de $h_2$ (ET)', min: -0.5, max: 2.5, step: 0.05, value: st.b2, onInput: v => { st.b2 = v; upd(); } });
    ui.slider(c, { label: 'lissage : sign → tanh$(k\\,\\cdot)$, $k$', min: 0, max: 8, step: 0.1, value: 0, fmt: v => (v === 0 ? 'sign' : v.toFixed(1)), onInput: v => { st.k = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const err = XOR.filter(([a, cc, y]) => sgn(yhat([a, cc])) !== y).length;
      ro.set(st.mode === 'net'
        ? `erreurs : <b>${err}</b> / 4<br><span class="c-dim">$h_1 = \\mathrm{sign}(x_1+x_2-${st.b1.toFixed(2)})$, $h_2 = \\mathrm{sign}(x_1+x_2-${st.b2.toFixed(2)})$, $\\hat y = \\mathrm{sign}(\\frac12h_1-\\frac12h_2-\\frac12)$. Dans l'espace $(h_1,h_2)$, les deux points bleus sont envoyés au même endroit $(+1,-1)$ : une droite suffit.</span>`
        : `erreurs : <b>${err}</b> / 4<br><span class="c-dim">Déplace la droite (point blanc) et tourne-la (pointe jaune) : tu ne descendras jamais sous 1 erreur. La preuve est juste en dessous.</span>`);
      P.request(); H.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ nn-regions
  ML.scene('nn-regions', host => {
    const W = ML.widget(host, {
      title: 'Unités cachées = détecteurs de demi-plans ; ET → région convexe, OU → union (slides 11, 14)', tag: '2D',
      views: [{ name: 'p', label: 'chaque droite est une unité cachée ; la flèche montre son côté $+1$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>région où $\\hat y = +1$</span><span class="key"><i style="background:#f0ac5f"></i>unité partagée (réutilisée)</span>',
    });
    const st = { mode: 'and', K: 3, r: 1.2, rot: 0.3, c: -0.5 };
    W.toggle('normals', 'flèches normales (côté $+1$)', true);
    W.toggle('count', 'nombre d\'unités qui disent $+1$', false);
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3], ylim: [-2.4, 2.4], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    let units = [], g = x => 0, shared = -1;
    function build() {
      units = []; shared = -1;
      if (st.mode === 'and') {
        for (let i = 0; i < st.K; i++) { const a = st.rot + 2 * Math.PI * i / st.K, n = [-Math.cos(a), -Math.sin(a)]; units.push({ w: n, b: st.r }); } // −n·x + r ≥ 0 : côté intérieur
        g = x => M.sum(units.map(u => sgn(u.w[0] * x[0] + u.w[1] * x[1] + u.b))) - (st.K - 1);
      } else {
        // A : triangle au-dessus de x2 = c ; B : rectangle au-dessus de x2 = c ; la droite x2 = c est partagée
        // demi-plan délimité par la droite (P, Q), orienté pour que le point « inside » soit du côté +1
        const hp = (P0, Q, inside) => { let w = [Q[1] - P0[1], P0[0] - Q[0]], b = -(w[0] * P0[0] + w[1] * P0[1]); if (w[0] * inside[0] + w[1] * inside[1] + b < 0) { w = [-w[0], -w[1]]; b = -b; } return { w, b }; };
        const apex = [-1.3, st.c + 1.6], inA = [-1.3, st.c + 0.5];
        const A = [hp([-2.4, st.c], apex, inA), hp([-0.2, st.c], apex, inA)], B = [{ w: [1, 0], b: -0.5 }, { w: [-1, 0], b: 2.3 }, { w: [0, -1], b: st.c + 1.6 }];
        const S = { w: [0, 1], b: -st.c, shared: true };
        units = [S, ...A, ...B]; shared = 0;
        const and = list => M.sum(list.map(u => sgn(u.w[0] * xx[0] + u.w[1] * xx[1] + u.b)));
        let xx = [0, 0];
        g = x => { xx = x; const gA = sgn(and([S, ...A]) - 2), gB = sgn(and([S, ...B]) - 3); return gA + gB + 1; };
      }
    }
    P.onDraw = p => {
      p.heatmap((a, c) => g([a, c]), v => (v >= 0 ? [22, 70, 92] : [10, 10, 14]), { res: 3 });
      if (W.show.count) p.heatmap((a, c) => M.sum(units.map(u => (u.w[0] * a + u.w[1] * c + u.b >= 0 ? 1 : 0))) / units.length, v => [255 * v * 0.25, 255 * v * 0.25, 255 * v * 0.25], { res: 4, alpha: 0.5 });
      units.forEach((u, i) => {
        const col = u.shared ? C.gold : '#ccc';
        const x0 = drawLine(p, u.w, u.b, { color: col, width: u.shared ? 2.6 : 1.4, alpha: 0.85 });
        if (W.show.normals && x0) { const n = Math.hypot(u.w[0], u.w[1]); const q = [M.clamp(x0[0], -2.6, 2.6), M.clamp(x0[1], -2.1, 2.1)]; p.arrow(q[0], q[1], q[0] + 0.45 * u.w[0] / n, q[1] + 0.45 * u.w[1] / n, { color: col, width: 1.6, head: 7 }); }
      });
    };
    const c = W.controls;
    ui.select(c, { label: 'construction', value: st.mode, options: [['and', 'ET de K demi-plans → polygone convexe'], ['or', 'OU de deux régions, une unité partagée']], onChange: v => { st.mode = v; build(); upd(); } });
    ui.slider(c, { label: 'nombre d\'unités $K$ (mode ET)', min: 3, max: 10, step: 1, value: st.K, fmt: v => v.toFixed(0), onInput: v => { st.K = v; build(); upd(); } });
    ui.slider(c, { label: 'taille', min: 0.4, max: 2, step: 0.05, value: st.r, onInput: v => { st.r = v; build(); upd(); } });
    ui.slider(c, { label: 'rotation', min: 0, max: 6.28, step: 0.02, value: st.rot, onInput: v => { st.rot = v; build(); upd(); } });
    ui.slider(c, { label: 'ligne partagée $x_2 = c$ (mode OU)', min: -1.5, max: 0.5, step: 0.05, value: st.c, onInput: v => { st.c = v; build(); upd(); } });
    const ro = ui.readout(c);
    function upd() {
      ro.set(st.mode === 'and'
        ? `$K = ${st.K}$ unités $h_i(\\bx) = \\mathrm{sign}(\\bw_i\\T\\bx+b_i)$, sortie $\\hat y = \\mathrm{sign}\\big(\\sum_ih_i(\\bx) - (K-1)\\big)$.<br><span class="c-dim">$\\sum_ih_i = K$ seulement si <b>toutes</b> les unités disent $+1$ ; sinon $\\sum_ih_i\\le K-2\\lt K-1$. C'est un ET. (Slide 11 : $K = 3$, seuil $2$.)</span>`
        : `Région A (triangle) : 3 demi-plans ; région B (rectangle) : 4 demi-plans. Sans partage : $3+4 = 7$ unités ; la droite $x_2 = c$ est commune : <b>$3+4-1 = 6$ unités</b>.<br><span class="c-dim">Couche 2 : $g_A$ = ET de ses 3 tests, $g_B$ = ET de ses 4 tests. Sortie : $\\hat y = \\mathrm{sign}(g_A+g_B+1)$, un OU.</span>`);
      P.request();
    }
    build(); upd();
  });

  // ------------------------------------------------------------------ nn-boolean
  ML.scene('nn-boolean', host => {
    const W = ML.widget(host, {
      title: 'Toute fonction booléenne de 2 bits avec 4 détecteurs (slide 12)', tag: '2D',
      views: [{ name: 'p', label: 'chaque détecteur $h_{ab}$ isole un coin $(a,b)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>$f = +1$</span><span class="key"><i class="dot" style="background:#fc6255"></i>$f = -1$</span>',
    });
    const f = { '00': -1, '01': 1, '10': 1, '11': -1 };
    W.toggle('det', 'droites des 4 détecteurs', true);
    const det = (a, b) => x => sgn((2 * a - 1) * x[0] + (2 * b - 1) * x[1] - a - b + 0.5);
    const keys = ['00', '01', '10', '11'];
    const yhat = x => { const bout = M.sum(keys.map(k => f[k])); return M.sum(keys.map(k => f[k] * det(+k[0], +k[1])(x))) + bout; };
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.8, 1.8], ylim: [-0.8, 1.8], equal: true, xlabel: 'x_1', ylabel: 'x_2', gridStep: [0.5, 0.5] });
    P.onDraw = p => {
      p.heatmap((a, c) => yhat([a, c]), v => (v >= 0 ? [20, 60, 80] : [80, 28, 26]), { res: 4 });
      if (W.show.det) keys.forEach(k => { const a = +k[0], b = +k[1]; drawLine(p, [2 * a - 1, 2 * b - 1], -a - b + 0.5, { color: '#ddd', width: 1.3, dash: [5, 4], alpha: 0.8 }); });
      keys.forEach(k => { const a = +k[0], b = +k[1]; p.point(a, b, { color: f[k] > 0 ? C.blue : C.red, r: 9, stroke: '#000' }); p.tex('k' + k, a, b, `f(${a},${b}) = ${f[k] > 0 ? '+1' : '-1'}`, { color: '#ddd', size: 12, dy: 20 }); });
    };
    const c = W.controls;
    const checks = {};
    keys.forEach(k => { checks[k] = ui.check(c, { label: `$f(${k[0]},${k[1]}) = +1$`, value: f[k] > 0, onChange: v => { f[k] = v ? 1 : -1; upd(); } }); });
    const preset = t => { keys.forEach((k, i) => { f[k] = t[i]; checks[k].set(t[i] > 0); }); upd(); };
    ui.buttons(c, [{ label: 'XOR', onClick: () => preset([-1, 1, 1, -1]) }, { label: 'ET', onClick: () => preset([-1, -1, -1, 1]) }, { label: 'OU', onClick: () => preset([-1, 1, 1, 1]) }, { label: 'NAND', onClick: () => preset([1, 1, 1, -1]) }]);
    const ro = ui.readout(c);
    function upd() {
      const bout = M.sum(keys.map(k => f[k]));
      ro.set(`$(w_{00},w_{01},w_{10},w_{11}) = (${keys.map(k => f[k] > 0 ? '+1' : '-1').join(', ')})$, $b_{\\text{out}} = \\sum w_{ab} = ${bout}$<br><span class="c-dim">En $\\bx = (a,b)$, seul $h_{ab} = +1$ : $\\sum w\\,h + b_{\\text{out}} = w_{ab} - \\sum_{\\text{autres}}w + \\sum_{\\text{tous}}w = 2w_{ab}$, dont le signe est $w_{ab} = f(a,b)$.</span>`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ nn-universal
  ML.scene('nn-universal', host => {
    const W = ML.widget(host, {
      title: 'Approximation universelle en 1D : des « marches » sigmoïdes empilées (hors slides, idée de la preuve)', tag: '2D',
      views: [{ name: 'p', label: 'cible $f^\\star$ et réseau à une couche cachée', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#83c167"></i>cible $f^\\star$</span><span class="key"><i style="background:#f4d345"></i>réseau $\\hat f$</span><span class="key"><i style="background:#9a72ac"></i>contributions des unités (marches)</span>',
    });
    const st = { N: 8, s: 60, tgt: 'sin' };
    const T = { sin: x => 0.5 + 0.4 * Math.sin(2 * Math.PI * x), bump: x => Math.exp(-((x - 0.5) ** 2) / 0.01), abs: x => Math.abs(x - 0.5) * 1.6, step: x => (x > 0.4 ? 0.8 : 0.2) + 0.1 * x };
    W.toggle('parts', 'marches individuelles', true);
    // f̂(x) = f*(a_1) + Σ_{k≥2} (f*(a_k) − f*(a_{k−1})) σ(s (x − t_k)) : N unités cachées, une marche par saut
    const net = () => {
      const f = T[st.tgt], a = M.range(st.N).map(k => (k + 0.5) / st.N), t = M.range(st.N).map(k => k / st.N);
      const v = a.map((x, k) => (k ? f(x) - f(a[k - 1]) : 0));
      return { b0: f(a[0]), v, t, F: x => f(a[0]) + M.sum(v.map((vk, k) => (k ? vk * M.sigmoid(st.s * (x - t[k])) : 0))) };
    };
    let cur;
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.02, 1.02], ylim: [-0.4, 1.25], xlabel: 'x', gridStep: [0.1, 0.25] });
    P.onDraw = p => {
      if (W.show.parts) cur.v.forEach((vk, k) => { if (k) p.fn(x => vk * M.sigmoid(st.s * (x - cur.t[k])), { color: C.purple, width: 1.1, alpha: 0.7, samples: 300 }); });
      p.fn(T[st.tgt], { color: C.green, width: 2.5, samples: 600 });
      p.fn(cur.F, { color: C.yellow, width: 3, samples: 800 });
    };
    const c = W.controls;
    ui.select(c, { label: 'fonction cible', value: st.tgt, options: [['sin', 'sinus'], ['bump', 'bosse gaussienne'], ['abs', 'valeur absolue'], ['step', 'marche (discontinue)']], onChange: v => { st.tgt = v; upd(); } });
    ui.slider(c, { label: 'nombre d\'unités cachées $N$', min: 1, max: 60, step: 1, value: st.N, fmt: v => v.toFixed(0), onInput: v => { st.N = v; upd(); } });
    ui.slider(c, { label: 'raideur des sigmoïdes $s$', min: 0, max: 3, log: true, value: st.s, digits: 0, fmt: v => v.toFixed(0), onInput: v => { st.s = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      cur = net();
      const xs = M.linspace(0, 1, 801), err = Math.max(...xs.map(x => Math.abs(cur.F(x) - T[st.tgt](x))));
      ro.set(`erreur maximale $\\max_x|\\hat f(x)-f^\\star(x)|$ = <b>${err.toFixed(3)}</b><br><span class="c-dim">$\\hat f(x) = f^\\star(a_1) + \\sum_{k=2}^{N}\\big(f^\\star(a_k)-f^\\star(a_{k-1})\\big)\\,\\sigma\\big(s(x-t_k)\\big)$ : une couche cachée de $N-1$ sigmoïdes + une sortie linéaire. Plus $N$ et $s$ sont grands, plus l'escalier colle à la courbe (pour une cible continue).</span>`);
      P.request();
    }
    upd();
  });
})(window.ML);
