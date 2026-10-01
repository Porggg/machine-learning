/* Chapitre 3 — SVM · §3 : Lagrangien, dualité, KKT */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // ------------------------------------------------------------------ svm-lagrange
  ML.scene('svm-lagrange', host => {
    const W = ML.widget(host, {
      title: '$\\min_x (x-a)^2$ s.c. $x\\le c$ : Lagrangien, fonction duale, point-selle', tag: '2D + 3D',
      views: [{ name: 'x', label: 'espace de $x$', cls: 'short' }, { name: 'l', label: 'fonction duale $D(\\lambda)$', cls: 'short', hint: 'glisser $\\lambda$' }, { name: 's3', label: '$\\mathfrak L(x,\\lambda)$ : une selle', cls: 'short', hint: 'glisser : tourner' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#fff"></i>$L(x)=(x-a)^2$</span><span class="key"><i style="background:#83c167;opacity:.5"></i>admissible $x\\le c$</span><span class="key"><i style="background:#fc6255;opacity:.5"></i>mur $J=+\\infty$</span><span class="key"><i style="background:#f4d345"></i>$\\mathfrak L(\\cdot,\\lambda)$ et son min $D(\\lambda)$</span><span class="key"><i style="background:#9a72ac"></i>$D(\\lambda)$</span><span class="key"><i style="background:#fff"></i>$p^*$</span>',
    });
    const st = { a: 2, c: 1, lam: 0.8 };
    const sh = W.show, rb = () => build3d();
    W.toggle('zones', 'zones admissible / mur', true); W.toggle('lagr', '$\\mathfrak L(\\cdot,\\lambda)$ et son min', true, rb); W.toggle('pstar', 'niveau $p^*$ et optimum', true, rb);
    W.toggle('gap', 'écart $p^*-D(\\lambda)$', true); W.toggle('surf', 'surface $\\mathfrak L(x,\\lambda)$ (3D)', true, rb); W.toggle('valley', 'courbe $D(\\lambda)$ sur la selle (3D)', true, rb); W.toggle('edge', 'bord $\\lambda=0$ : $L(x)$ admissible (3D)', true, rb);
    const Lg = (x, l) => (x - st.a) ** 2 + l * (x - st.c);
    const argx = l => st.a - l / 2, D = l => l * (st.a - st.c) - l * l / 4;
    const opt = () => st.a <= st.c ? { x: st.a, p: 0, l: 0 } : { x: st.c, p: (st.c - st.a) ** 2, l: 2 * (st.a - st.c) };
    const Px = new ML.Plot2D(W.views.x, { xlim: [-2, 5], ylim: [-3, 9], xlabel: 'x' });
    Px.onDraw = p => {
      if (sh.zones) { p.rect(-2, -3, st.c, 9, { color: C.green, width: 0, fill: C.green, fillAlpha: 0.07, stroke: false }); p.rect(st.c, -3, 5, 9, { color: C.red, width: 0, fill: C.red, fillAlpha: 0.1, stroke: false }); p.tex('J', 4.9, 8.3, 'J(x) = +\\infty', { color: C.red, anchor: 'right', size: 13 }); }
      p.vline(st.c, { color: C.green, width: 1.5 });
      p.fn(x => (x - st.a) ** 2, { color: '#fff', width: 2.5 }, [-2, st.c]);
      p.fn(x => (x - st.a) ** 2, { color: '#fff', width: 1.2, dash: [4, 4], alpha: 0.5 }, [st.c, 5]);
      const xm = argx(st.lam), o = opt();
      if (sh.lagr) { p.fn(x => Lg(x, st.lam), { color: C.yellow, width: 2.5 }); p.point(xm, Lg(xm, st.lam), { color: C.yellow, r: 6, stroke: '#000' }); p.hline(D(st.lam), { color: C.purple, width: 1.3, dash: [5, 4] }); }
      if (sh.pstar) { p.hline(o.p, { color: '#fff', width: 1, dash: [2, 4], alpha: 0.7 }); p.point(o.x, o.p, { color: '#fff', r: 5, shape: 'diamond' }); }
      p.tex('c', st.c, 8.3, 'x = c', { color: C.green, dx: 8, anchor: 'left', size: 13 });
    };
    const Pl = new ML.Plot2D(W.views.l, { xlim: [-0.3, 8], ylim: [-3, 9], xlabel: '\\lambda' });
    Pl.addDraggable({ get: () => [st.lam, D(st.lam)], set: x => { st.lam = M.clamp(x, 0, 8); lS.set(st.lam); upd(); }, r: 14, cursor: 'ew-resize' });
    Pl.onDraw = p => {
      const o = opt();
      if (sh.pstar) { p.hline(o.p, { color: '#fff', width: 1.5, dash: [6, 4] }); p.point(o.l, D(o.l), { color: '#fff', r: 5, shape: 'diamond' }); p.tex('p', 7.8, o.p, 'p^*', { color: '#fff', dy: -12, anchor: 'right' }); }
      p.fn(D, { color: C.purple, width: 3 }, [0, 8]);
      if (sh.gap) p.seg(st.lam, D(st.lam), st.lam, o.p, { color: C.red, width: 2, alpha: 0.7 });
      p.point(st.lam, D(st.lam), { color: C.yellow, r: 7, glow: true, stroke: '#000' });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-2, 5], y: [0, 8], z: [-10, 20] }, size: [2.4, 2.2, 1.6], labels: { x: 'x', y: '\\lambda', z: '\\mathfrak L' }, theta: -2.5, phi: 1.1, radius: 6, target: [0, 0, 0.9], gridZ: -10 });
    function build3d() {
      S.clear('d');
      if (sh.surf) S.surface('d', Lg, { res: 50, opacity: 0.75, zclip: [-10, 20], hideClipped: true, wireOpacity: 0.12 });
      const ls = M.linspace(0, 8, 60);
      if (sh.valley) S.curve('d', ls.map(l => [argx(l), l, D(l)]).filter(q => q[0] > -2 && q[0] < 5 && q[2] > -10), { color: C.purple, radius: 0.012 });
      const xs = M.linspace(-2, st.c, 40); if (sh.edge) S.curve('d', xs.map(x => [x, 0, (x - st.a) ** 2]).filter(q => q[2] < 20), { color: '#fff', radius: 0.012 });
      if (sh.lagr) S.curve('d', M.linspace(-2, 5, 60).map(x => [x, st.lam, Lg(x, st.lam)]).filter(q => q[2] < 20 && q[2] > -10), { color: C.yellow, radius: 0.01 });
      const o = opt();
      if (sh.pstar) { S.points('d', [[o.x, o.l, o.p]], { color: '#ffffff', radius: 0.05 }); S.label('sad', [o.x, o.l, o.p], '(x^*,\\lambda^*)', { color: '#fff', dy: -16 }); } else S.hideLabel('sad');
    }
    const c = W.controls;
    const lS = ui.slider(c, { label: 'multiplicateur $\\lambda\\ge0$', min: 0, max: 8, step: 0.01, value: st.lam, onInput: v => { st.lam = v; upd(); } });
    ui.slider(c, { label: 'centre $a$ de l\'objectif', min: -1, max: 4, step: 0.01, value: st.a, onInput: v => { st.a = v; upd(); } });
    ui.slider(c, { label: 'contrainte $x\\le c$', min: -1, max: 4, step: 0.01, value: st.c, onInput: v => { st.c = v; upd(); } });
    ui.buttons(c, [{ label: '$\\lambda\\leftarrow\\lambda^*$', primary: true, onClick: () => { const a = st.lam, b = opt().l; ML.tween(700, u => { st.lam = a + (b - a) * u; lS.set(st.lam); upd(); }); } }]);
    const ro = ui.readout(c);
    function upd() {
      const o = opt();
      ro.set(`$D(\\lambda) = \\min_x\\mathfrak L(x,\\lambda) = \\lambda(a-c) - \\frac{\\lambda^2}{4}$ = <b>${M.fmt(D(st.lam), 3)}</b> $\\le p^*$ = <b>${M.fmt(o.p, 3)}</b> (dualité faible, écart <b>${M.fmt(o.p - D(st.lam), 3)}</b>) · $\\lambda^*$ = <b>${M.fmt(o.l, 3)}</b>, $d^* = p^*$ (dualité forte) · ${o.l === 0 ? 'contrainte <b>inactive</b> : $\\lambda^*=0$' : 'contrainte <b>active</b> : $x^*=c$, $\\lambda^*>0$'}`);
      Px.request(); Pl.request(); build3d();
    }
    upd();
  });

  // ------------------------------------------------------------------ svm-kkt
  ML.scene('svm-kkt', host => {
    const W = ML.widget(host, {
      title: 'KKT en 2D : à l\'optimum, $-\\nabla L = \\lambda\\nabla g$ (gradients opposés)', tag: '2D',
      views: [{ name: 'p', cls: 'tall', hint: 'glisser le centre de l\'objectif (blanc)' }], controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>niveaux de $L$</span><span class="key"><i style="background:#83c167;opacity:.5"></i>admissible $g\\le0$</span><span class="key"><i style="background:#fc6255"></i>$-\\nabla L(\\bx^*)$</span><span class="key"><i style="background:#83c167"></i>$\\lambda^*\\nabla g(\\bx^*)$</span>',
    });
    const A = [[1, 0.45], [0.45, 0.5]];
    const st = { a: [2.2, 1.6], kind: 'disk', r: 1.3, n: [0.8, 0.6], cst: 0.5 };
    const sh = W.show;
    W.toggle('feas', 'zone admissible', true); W.toggle('levels', 'lignes de niveau de $L$', true); W.toggle('touch', 'niveau qui touche la contrainte', true); W.toggle('grads', 'gradients $-\\nabla L$ et $\\lambda^*\\nabla g$', true);
    const L = x => { const d = M.sub(x, st.a); return M.dot(d, M.matvec(A, d)); };
    const gL = x => M.scale(M.matvec(A, M.sub(x, st.a)), 2);
    const g = x => st.kind === 'disk' ? M.dot(x, x) - st.r * st.r : M.dot(st.n, x) - st.cst;
    const gg = x => st.kind === 'disk' ? M.scale(x, 2) : st.n.slice();
    function solve() {
      if (g(st.a) <= 0) return st.a.slice();
      let best = null, be = Infinity;
      if (st.kind === 'disk') for (let i = 0; i < 3600; i++) { const t = 2 * Math.PI * i / 3600, x = [st.r * Math.cos(t), st.r * Math.sin(t)], e = L(x); if (e < be) { be = e; best = x; } }
      else { const n = st.n, x0 = M.scale(n, st.cst / M.dot(n, n)), t = [-n[1], n[0]]; for (let i = -3000; i <= 3000; i++) { const x = M.add(x0, M.scale(t, i / 600)), e = L(x); if (e < be) { be = e; best = x; } } }
      return best;
    }
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 3.5], ylim: [-2.5, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.addDraggable({ get: () => st.a, set: (x, y) => { st.a = [x, y]; upd(); }, r: 14 });
    P.onDraw = p => {
      if (sh.feas) p.heatmap((x, y) => g([x, y]) <= 0 ? 1 : 0, v => v ? [18, 38, 22] : [0, 0, 0], { res: 4 });
      if (st.kind === 'disk') p.circle(0, 0, st.r, { color: C.green, width: 2 }); else ML.drawHyper(p, st.n, -st.cst, 0, 4, { color: C.green, width: 2 });
      if (sh.levels) [0.1, 0.4, 0.9, 1.6, 2.5, 3.6, 5].forEach(l => p.ellipse(st.a[0], st.a[1], A, l, { color: C.blue, width: 1, alpha: 0.35 }));
      const x = solve(), lv = L(x);
      if (lv > 1e-9 && sh.touch) p.ellipse(st.a[0], st.a[1], A, lv, { color: C.blue, width: 2.2 });
      if (g(st.a) > 0 && sh.grads) {
        const G = gL(x), Gg = gg(x), lam = -M.dot(G, Gg) / M.dot(Gg, Gg), k = 0.6 / Math.max(M.norm(G), 1e-6);
        p.arrow(x[0], x[1], x[0] - G[0] * k, x[1] - G[1] * k, { color: C.red, width: 3 });
        p.arrow(x[0], x[1], x[0] + lam * Gg[0] * k, x[1] + lam * Gg[1] * k, { color: C.green, width: 2, dash: [5, 3] });
      }
      p.point(x[0], x[1], { color: C.yellow, r: 7, stroke: '#000' });
      p.point(st.a[0], st.a[1], { color: '#fff', r: 7, glow: true, stroke: '#000' });
      p.tex('xs', x[0], x[1], '\\bx^*', { color: C.yellow, dx: -12, dy: 14, anchor: 'right' });
    };
    const c = W.controls;
    ui.select(c, { label: 'contrainte', options: [['disk', 'disque : ‖x‖² − r² ≤ 0'], ['half', 'demi-plan : nᵀx − c ≤ 0']], value: 'disk', onChange: v => { st.kind = v; upd(); } });
    ui.slider(c, { label: 'rayon $r$ / seuil $c$', min: 0.3, max: 2.5, step: 0.01, value: st.r, onInput: v => { st.r = v; st.cst = v - 0.8; upd(); } });
    const ro = ui.readout(c);
    ui.note(c, 'Rentre le centre blanc dans la zone verte : l\'optimum libre est admissible, la contrainte devient inactive et $\\lambda^*=0$ (complémentarité $\\lambda^*g(\\bx^*)=0$).');
    function upd() {
      const x = solve(), act = g(st.a) > 0, G = gL(x), Gg = gg(x), lam = act ? -M.dot(G, Gg) / M.dot(Gg, Gg) : 0, res = M.norm(M.add(G, M.scale(Gg, lam)));
      ro.set(`$\\bx^*$ = (<b>${M.fmt(x[0], 3)}</b>, <b>${M.fmt(x[1], 3)}</b>)<br>$g(\\bx^*)$ = <b>${M.fmt(g(x), 3)}</b> · $\\lambda^*$ = <b>${M.fmt(lam, 3)}</b><br>$\\|\\nabla L + \\lambda^*\\nabla g\\|$ = <b>${M.fmt(res, 3)}</b> (stationnarité)<br>$\\lambda^* g(\\bx^*)$ = <b>${M.fmt(lam * g(x), 3)}</b> (complémentarité)`);
      P.request();
    }
    upd();
  });
})(window.ML);
