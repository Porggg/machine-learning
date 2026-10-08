/* Chapitre 5 — Réseaux de neurones · §4 : pertes de classification (BCE, softmax, cross-entropy) */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;

  // ------------------------------------------------------------------ nn-bce
  ML.scene('nn-bce', host => {
    const W = ML.widget(host, {
      title: 'Sigmoïde + BCE : le gradient par rapport au logit vaut $p - y$ (slide 23)', tag: '2D',
      views: [{ name: 'l', label: 'perte $\\ell_{\\text{BCE}}(y, z)$ en fonction du logit $z$', cls: 'tall' }, { name: 'p', label: 'probabilité $p = \\sigma(z)$ et cible $y$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$y = 1$ : $-\\log\\sigma(z)$</span><span class="key"><i style="background:#fc6255"></i>$y = 0$ : $-\\log(1-\\sigma(z))$</span><span class="key"><i style="background:#f4d345"></i>tangente : pente $p-y$</span>',
    });
    const st = { z: -1.5, y: 1, eta: 1 };
    const loss = (z, y) => M.softplus(z) - y * z;
    const L = new ML.Plot2D(W.views.l, { xlim: [-6, 6], ylim: [-0.3, 6], xlabel: 'z', gridStep: [1, 1] });
    const P = new ML.Plot2D(W.views.p, { xlim: [-6, 6], ylim: [-0.15, 1.15], xlabel: 'z', ylabel: 'p', gridStep: [1, 0.25] });
    L.onDraw = p => {
      p.fn(z => loss(z, 1), { color: C.blue, width: st.y ? 3 : 1.4, alpha: st.y ? 1 : 0.5 });
      p.fn(z => loss(z, 0), { color: C.red, width: st.y ? 1.4 : 3, alpha: st.y ? 0.5 : 1 });
      const l0 = loss(st.z, st.y), g = M.sigmoid(st.z) - st.y;
      p.seg(st.z - 1.5, l0 - 1.5 * g, st.z + 1.5, l0 + 1.5 * g, { color: C.yellow, width: 2 });
      p.point(st.z, l0, { color: C.yellow, r: 7, glow: true });
      p.arrow(st.z, -0.15, st.z - st.eta * g, -0.15, { color: C.yellow, width: 2.5 });
    };
    P.onDraw = p => {
      p.hline(st.y, { color: st.y ? C.blue : C.red, width: 1.5, dash: [6, 4] });
      p.fn(z => M.sigmoid(z), { color: '#ddd', width: 2.5 });
      const q = M.sigmoid(st.z);
      p.seg(st.z, q, st.z, st.y, { color: C.yellow, width: 2, dash: [3, 3] });
      p.point(st.z, q, { color: C.yellow, r: 7, glow: true });
      p.tex('py', st.z, (q + st.y) / 2, 'p - y = ' + (q - st.y).toFixed(3), { color: C.yellow, anchor: 'left', dx: 10, size: 13 });
    };
    L.addDraggable({ get: () => [st.z, loss(st.z, st.y)], set: x => { st.z = M.clamp(x, -6, 6); zS.set(st.z); upd(); }, r: 14, cursor: 'ew-resize' });
    const c = W.controls;
    ui.select(c, { label: 'étiquette $y$', value: '1', options: [['1', 'y = 1'], ['0', 'y = 0']], onChange: v => { st.y = +v; upd(); } });
    const zS = ui.slider(c, { label: 'logit $z$', min: -6, max: 6, step: 0.01, value: st.z, onInput: v => { st.z = v; upd(); } });
    ui.slider(c, { label: 'pas $\\eta$', min: 0.1, max: 4, step: 0.1, value: st.eta, onInput: v => { st.eta = v; upd(); } });
    ui.buttons(c, [{ label: 'un pas : $z\\leftarrow z-\\eta(p-y)$', primary: true, onClick: () => { st.z = M.clamp(st.z - st.eta * (M.sigmoid(st.z) - st.y), -6, 6); zS.set(st.z); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      const q = M.sigmoid(st.z);
      ro.set(`$p = \\sigma(z) = ${q.toFixed(4)}$ · $\\ell = ${loss(st.z, st.y).toFixed(4)}$ · $\\partial\\ell/\\partial z = p-y = ${(q - st.y).toFixed(4)}$<br><span class="c-dim">Si $y = 1$, $p-y<0$ : le pas augmente $z$, donc $p$ ; si $y = 0$, $p-y>0$ : le pas diminue $z$, donc $p$. Le pas est grand quand l'erreur est grande et s'éteint quand $p\\approx y$.</span>`);
      L.request(); P.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ nn-softmax
  ML.scene('nn-softmax', host => {
    const W = ML.widget(host, {
      title: 'Softmax, température et cross-entropy : gradient $p_k - y_k$ (slides 24–26)', tag: '2D',
      views: [{ name: 'p', label: 'logits $z_k$ (contour) et probabilités $p_k$ (barres pleines)', cls: 'tall' }, { name: 'g', label: 'gradient $\\partial\\ell/\\partial z_k = p_k - y_k$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#83c167"></i>bonne classe</span><span class="key"><i style="background:#58c4dd"></i>autres classes</span>',
    });
    const st = { z: [1, 0, -1], T: 1, y: 0, eta: 1 };
    const soft = () => { const s = st.z.map(v => v / st.T), m = Math.max(...s), e = s.map(v => Math.exp(v - m)), Z = M.sum(e); return e.map(v => v / Z); };
    const P = new ML.Plot2D(W.views.p, { xlim: [0.3, 3.7], ylim: [-0.15, 1.1], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? (Math.abs(v - Math.round(v)) < 1e-6 && v >= 1 && v <= 3 ? 'classe ' + Math.round(v) : '') : String(+v.toFixed(2))) });
    const G = new ML.Plot2D(W.views.g, { xlim: [0.3, 3.7], ylim: [-1.05, 1.05], gridStep: [1, 0.5], tickFmt: (v, ax) => (ax === 'x' ? (Math.abs(v - Math.round(v)) < 1e-6 && v >= 1 && v <= 3 ? 'classe ' + Math.round(v) : '') : String(+v.toFixed(2))) });
    P.onDraw = p => {
      const pr = soft();
      pr.forEach((q, k) => {
        const col = k === st.y ? C.green : C.blue;
        p.rect(k + 1 - 0.28, 0, k + 1 + 0.28, q, { color: col, fill: col, fillAlpha: 0.55, width: 1.5 });
        p.tex('p' + k, k + 1, q, 'p_' + (k + 1) + ' = ' + q.toFixed(3), { color: col, size: 13, anchor: 'bottom', dy: -4 });
        const zl = M.clamp(st.z[k] / 8 + 0.5, -0.1, 1.05);
        p.seg(k + 1 - 0.36, zl, k + 1 + 0.36, zl, { color: '#fff', width: 2, dash: [5, 3] });
        p.tex('z' + k, k + 1 + 0.38, zl, 'z_' + (k + 1) + ' = ' + st.z[k].toFixed(2), { color: '#ccc', size: 11, anchor: 'left' });
      });
    };
    G.onDraw = p => {
      const pr = soft();
      p.hline(0, { color: '#888', width: 1 });
      pr.forEach((q, k) => { const g = q - (k === st.y ? 1 : 0), col = k === st.y ? C.green : C.blue; p.rect(k + 1 - 0.28, 0, k + 1 + 0.28, g, { color: col, fill: col, fillAlpha: 0.55, width: 1.5 }); p.tex('g' + k, k + 1, g, g.toFixed(3), { color: col, size: 12, anchor: g >= 0 ? 'bottom' : 'top', dy: g >= 0 ? -4 : 4 }); });
    };
    const c = W.controls;
    const zS = [0, 1, 2].map(k => ui.slider(c, { label: `logit $z_${k + 1}$`, min: -4, max: 4, step: 0.05, value: st.z[k], onInput: v => { st.z[k] = v; upd(); } }));
    ui.slider(c, { label: 'température $T$', min: -1, max: 1, log: true, value: 1, digits: 2, onInput: v => { st.T = v; upd(); } });
    ui.select(c, { label: 'bonne classe $y$', value: '0', options: [['0', 'classe 1'], ['1', 'classe 2'], ['2', 'classe 3']], onChange: v => { st.y = +v; upd(); } });
    ui.buttons(c, [
      { label: '$+1$ à tous les logits', onClick: () => { st.z = st.z.map(v => M.clamp(v + 1, -4, 4)); zS.forEach((s, k) => s.set(st.z[k])); upd(); } },
      { label: 'un pas : $\\bz\\leftarrow\\bz-\\eta(\\mathbf p-\\by)$', primary: true, onClick: () => { const pr = soft(); st.z = st.z.map((v, k) => M.clamp(v - st.eta * (pr[k] - (k === st.y ? 1 : 0)), -4, 4)); zS.forEach((s, k) => s.set(st.z[k])); upd(); } },
    ]);
    const ro = ui.readout(c);
    function upd() {
      const pr = soft(), am = pr.indexOf(Math.max(...pr));
      ro.set(`cross-entropy $\\ell = -\\log p_y = ${(-Math.log(pr[st.y])).toFixed(4)}$ · classe prédite (argmax) : <b>${am + 1}</b><br><span class="c-dim">« $+1$ à tous » ne change pas les $p_k$ (invariance par translation), sauf si un logit touche la borne $\\pm4$ du curseur. $T>1$ adoucit, $T<1$ durcit, l'argmax ne bouge pas. Le gradient est négatif sur la bonne classe ($p_y-1$) et positif sur les autres ($p_k$) ; ses composantes somment à 0. (Avec $T\ne1$, le gradient par rapport à $z_k$ est $(p_k-y_k)/T$.)</span>`);
      P.request(); G.request();
    }
    upd();
  });
})(window.ML);
