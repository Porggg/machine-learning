/* Chapitre 5 — Réseaux de neurones · §3 : activations, MLP, espace des features appris (3D) */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, NN = ML.nn;
  // couleurs de classes (comme au chapitre 2) : bleu = classe 1, rouge = classe 0
  const probRgb = p => { const a = M.hexToRgb(C.red), b = M.hexToRgb(C.blue); return a.map((v, i) => (v + (b[i] - v) * p) * 0.42); };
  NN.probRgb = probRgb;

  // ------------------------------------------------------------------ nn-activations
  ML.scene('nn-activations', host => {
    const W = ML.widget(host, {
      title: 'Fonctions d\'activation et leurs dérivées (slide 17)', tag: '2D',
      views: [{ name: 'p', label: 'trait plein : $\\varphi(z)$ · tirets : $\\varphi\'(z)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>activation choisie</span><span class="key"><i style="background:#fc6255"></i>sa dérivée</span>',
    });
    const A = {
      sign: { tex: '\\mathrm{sign}(z)', f: z => (z >= 0 ? 1 : -1), d: z => 0 },
      relu: { tex: '\\max\\{0,z\\}', f: z => Math.max(0, z), d: z => (z > 0 ? 1 : 0) },
      leaky: { tex: '\\max\\{\\alpha z,z\\},\\ \\alpha = 0.1', f: z => Math.max(0.1 * z, z), d: z => (z > 0 ? 1 : 0.1) },
      sigmoid: { tex: '\\sigma(z) = \\frac1{1+e^{-z}}', f: z => M.sigmoid(z), d: z => M.sigmoid(z) * (1 - M.sigmoid(z)) },
      tanh: { tex: '\\tanh z = \\frac{e^z-e^{-z}}{e^z+e^{-z}}', f: z => Math.tanh(z), d: z => 1 - Math.tanh(z) ** 2 },
    };
    const st = { a: 'sigmoid', z: 0.8 };
    W.toggle('deriv', 'dérivée $\\varphi\'(z)$', true);
    W.toggle('all', 'superposer toutes les activations', false);
    const P = new ML.Plot2D(W.views.p, { xlim: [-5, 5], ylim: [-1.6, 2.6], xlabel: 'z', gridStep: [1, 0.5] });
    P.onDraw = p => {
      if (W.show.all) Object.entries(A).forEach(([k, a], i) => { if (k !== st.a) p.fn(a.f, { color: M.series[i + 4], width: 1.3, alpha: 0.55, samples: 600 }); });
      const a = A[st.a];
      p.fn(a.f, { color: C.yellow, width: 3, samples: 800 });
      if (W.show.deriv) p.fn(a.d, { color: C.red, width: 2, dash: [6, 4], samples: 800 });
      p.vline(st.z, { color: '#fff', width: 1, alpha: 0.4 });
      p.point(st.z, a.f(st.z), { color: C.yellow, r: 6, glow: true });
      if (W.show.deriv) {
        const s = a.d(st.z), y0 = a.f(st.z);
        p.seg(st.z - 1, y0 - s, st.z + 1, y0 + s, { color: C.red, width: 2 });
        p.point(st.z, s, { color: C.red, r: 5 });
      }
      p.tex('t', -4.8, 2.35, '\\varphi(z) = ' + a.tex, { color: C.yellow, anchor: 'left', size: 15 });
    };
    P.addDraggable({ get: () => [st.z, A[st.a].f(st.z)], set: x => { st.z = M.clamp(x, -5, 5); zS.set(st.z); upd(); }, r: 14, cursor: 'ew-resize' });
    const c = W.controls;
    ui.select(c, { label: 'activation', value: st.a, options: [['sign', 'sign (perceptron)'], ['relu', 'ReLU'], ['leaky', 'Leaky ReLU'], ['sigmoid', 'sigmoïde'], ['tanh', 'tanh']], onChange: v => { st.a = v; upd(); } });
    const zS = ui.slider(c, { label: 'pré-activation $z$', min: -5, max: 5, step: 0.01, value: st.z, onInput: v => { st.z = v; upd(); } });
    const ro = ui.readout(c);
    const notes = {
      sign: 'Dérivée <b>nulle partout</b> (et non définie en 0) : un gradient qui traverse une unité sign est multiplié par 0. Impossible d\'apprendre les poids <em>avant</em> elle par descente de gradient — d\'où les activations lisses.',
      relu: 'Dérivée 1 si $z>0$, 0 si $z<0$ : la ReLU laisse passer le gradient tel quel ou le bloque. Pas de saturation pour $z>0$ ; une unité toujours négative ne reçoit plus de gradient (« ReLU morte »).',
      leaky: 'Comme ReLU, mais une petite pente $\\alpha$ pour $z<0$ : le gradient n\'est jamais complètement bloqué.',
      sigmoid: '$\\sigma\'(z) = \\sigma(z)(1-\\sigma(z))\\le\\frac14$ : maximale en 0, presque nulle pour $|z|$ grand (saturation). Empilée sur plusieurs couches, elle peut faire « disparaître » le gradient.',
      tanh: '$\\tanh\' = 1-\\tanh^2\\le1$, et $\\tanh z = 2\\sigma(2z)-1$ : une sigmoïde recentrée sur $(-1,1)$. Sature aussi pour $|z|$ grand.',
    };
    function upd() {
      const a = A[st.a];
      ro.set(`$z = ${st.z.toFixed(2)}$ : $\\varphi(z) = ${a.f(st.z).toFixed(3)}$, $\\varphi'(z) = ${a.d(st.z).toFixed(3)}$<br><span class="c-dim">${notes[st.a]}</span>`);
      P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ nn-features3d
  ML.scene('nn-features3d', host => {
    const W = ML.widget(host, {
      title: 'Le réseau apprend une carte de features : le plan d\'entrée est plié en 3D jusqu\'à ce qu\'un <b>plan</b> sépare les classes', tag: '2D + 3D',
      views: [{ name: 'x', label: 'espace d\'entrée : frontière apprise (non linéaire)', cls: 'tall' }, { name: 's3', label: 'espace des features $\\bh = \\tanh(W_1\\bx+\\bb_1)\\in(-1,1)^3$', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>classe 1</span><span class="key"><i class="dot" style="background:#fc6255"></i>classe 0</span><span class="key"><i style="background:#bbb"></i>image du plan d\'entrée (grille déformée)</span><span class="key"><i style="background:#f4d345"></i>plan de sortie $\\bw_2\\T\\bh+b_2 = 0$</span>',
    });
    const st = { ds: 'circles', lr: 0.15, seed: 3, epoch: 0 };
    W.toggle('sheet', 'image du plan d\'entrée (feuille)', true);
    W.toggle('plane', 'plan séparateur dans l\'espace des features', true);
    W.toggle('grid', 'grille de l\'espace d\'entrée (2D)', false);
    let D, net, loss = 0;
    const R = 2.2;
    const P = new ML.Plot2D(W.views.x, { xlim: [-R, R], ylim: [-R, R], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-1, 1], y: [-1, 1], z: [-1, 1] }, size: [2, 2, 2], labels: { x: 'h_1', y: 'h_2', z: 'h_3' }, theta: -2.2, phi: 1.15, radius: 6.4, target: [0, 0, 1] });
    P.onDraw = p => {
      p.heatmap((a, c) => NN.prob(net, [a, c]), probRgb, { res: 4 });
      p.contour((a, c) => NN.forward(net, [a, c]).logit, [0], { color: '#fff', width: 2.2 });
      if (W.show.grid) for (let t = -2; t <= 2; t += 0.5) { p.seg(t, -R, t, R, { color: '#bbb', width: 0.6, alpha: 0.4 }); p.seg(-R, t, R, t, { color: '#bbb', width: 0.6, alpha: 0.4 }); }
      D.X.forEach((x, n) => p.point(x[0], x[1], { color: D.Y[n] ? C.blue : C.red, r: 3.2, stroke: '#000', strokeWidth: 0.8 }));
    };
    const hid = x => NN.forward(net, x).hs[1];
    // polygone d'intersection du plan {w·h + b = 0} avec le cube [−1,1]³
    const planePoly = (w, b) => {
      const V = [-1, 1], pts = [];
      const edges = [];
      for (const a of V) for (const c of V) { edges.push([[-1, a, c], [1, a, c]]); edges.push([[a, -1, c], [a, 1, c]]); edges.push([[a, c, -1], [a, c, 1]]); }
      for (const [p0, p1] of edges) {
        const f0 = M.dot(w, p0) + b, f1 = M.dot(w, p1) + b;
        if ((f0 <= 0 && f1 >= 0) || (f0 >= 0 && f1 <= 0)) { const t = Math.abs(f0 - f1) < 1e-12 ? 0 : f0 / (f0 - f1); pts.push(p0.map((v, i) => v + t * (p1[i] - v))); }
      }
      if (pts.length < 3) return null;
      const cg = [0, 1, 2].map(i => M.mean(pts.map(q => q[i])));
      const n = M.norm(w), u0 = Math.abs(w[0]) < 0.9 * n ? [1, 0, 0] : [0, 1, 0];
      const e1 = M.sub(u0, M.scale(w, M.dot(u0, w) / (n * n))), e1n = M.scale(e1, 1 / M.norm(e1));
      const e2 = [w[1] * e1n[2] - w[2] * e1n[1], w[2] * e1n[0] - w[0] * e1n[2], w[0] * e1n[1] - w[1] * e1n[0]];
      pts.sort((A, B) => Math.atan2(M.dot(M.sub(A, cg), e2), M.dot(M.sub(A, cg), e1n)) - Math.atan2(M.dot(M.sub(B, cg), e2), M.dot(M.sub(B, cg), e1n)));
      return pts.map((q, i) => [cg, q, pts[(i + 1) % pts.length]]);
    };
    function draw3d() {
      S.clear('d');
      if (W.show.sheet) S.paramSurface('d', (u, v) => hid([-R + 2 * R * u, -R + 2 * R * v]), { nu: 34, nv: 34, color: '#8899aa', opacity: 0.22, wire: true, wireOpacity: 0.18, wireColor: '#cfd8e0' });
      S.points('d', D.X.map(hid), { color: D.Y.map(y => (y ? C.blue : C.red)), radius: 0.035 });
      if (W.show.plane) {
        const L = net.layers[1], tris = planePoly(L.W[0], L.b[0]);
        if (tris) S.tris('d', tris, { color: C.yellow, opacity: 0.28 });
      }
    }
    let frame = 0;
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.ds, options: [['circles', 'cercles concentriques'], ['xor', 'XOR (4 nuages)'], ['moons', 'deux lunes']], onChange: v => { st.ds = v; reset(); } });
    ui.slider(c, { label: 'pas $\\eta$', min: 0.01, max: 0.6, step: 0.01, value: st.lr, onInput: v => { st.lr = v; } });
    ui.player(c, { speed: 30, step: () => { for (let k = 0; k < 2; k++) train(); frame++; if (frame % 3 === 0) draw3d(); P.request(); info(); }, reset: () => { st.seed++; reset(); } });
    const ro = ui.readout(c);
    ui.note(c, 'Architecture 2 → 3 (tanh) → 1 (sigmoïde), perte BCE, descente de gradient plein batch avec momentum. Lance ▶ et regarde la feuille se plier.');
    function train() { const r = NN.lossGrad(net, D.X, D.Y, M.range(D.X.length)); NN.step(net, r.g, st.lr, 0.9); loss = r.loss; st.epoch++; }
    function info() { ro.set(`époque <b>${st.epoch}</b> · perte BCE <b>${loss.toFixed(4)}</b> · précision <b>${(100 * NN.accuracy(net, D.X, D.Y)).toFixed(0)} %</b><br><span class="c-dim">Au début, la feuille est presque plate et aucun plan ne sépare les couleurs. L'entraînement la plie (non-linéarité tanh) jusqu'à ce que le plan jaune — la couche de sortie, <b>linéaire</b> en $\\bh$ — les sépare.</span>`); }
    function reset() {
      D = NN.DATA[st.ds](160, 11, st.ds === 'xor' ? 0.22 : 0.1);
      net = NN.init([2, 3, 1], st.seed, 'tanh'); st.epoch = 0;
      loss = NN.lossGrad(net, D.X, D.Y, M.range(D.X.length)).loss;
      draw3d(); P.request(); info();
    }
    reset();
    // les bascules 3D demandent une reconstruction
    W.host.querySelectorAll('.disp-item input').forEach(i => i.addEventListener('change', () => draw3d()));
  });
})(window.ML);
