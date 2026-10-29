/* Chapitre 8 — §7 : un mini-transformer décodeur entraîné en direct par prédiction du token suivant */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, T = ML.tf;
  const LET = 'ABCDEFGH'.split('');

  ML.scene('tf-train', host => {
    const W = ML.widget(host, {
      title: 'Prédiction du token suivant, entraînée en direct : un décodeur à une tête apprend à répéter un motif (slides 21, 24)', tag: '2D',
      views: [{ name: 'a', label: 'attention apprise sur une séquence (lignes = positions qui prédisent, colonnes = entrées)', cls: 'tall' },
        { name: 'l', label: 'perte $-\\log p(x_{t+1}\\mid x_{\\le t})$ moyenne au fil des itérations', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f0ac5f"></i>perte sur la 2<sup>e</sup> moitié (prévisible)</span><span class="key"><i style="background:#58c4dd"></i>perte sur toute la séquence</span><span class="key"><i style="background:#fc6255"></i>$\\ln 8$ : hasard, ou meilleur modèle de Markov</span>',
    });
    const st = { pe: 'sin', P: 5, seed: 1, it: 0, hist: [] };
    let net, rng, ex;
    const reset = () => { net = new T.Copy({ P: st.P, D: 16, K: 8, pe: st.pe, seed: st.seed }); rng = M.rng(st.seed + 100); st.it = 0; st.hist = []; record(); newEx(); };
    const newEx = () => { ex = net.sample(M.rng(st.seed * 31 + st.it + 7)); };
    const record = () => { const e = net.evaluate(150, 99); st.hist.push([st.it, e.loss, e.loss2, e.acc2]); };
    const A = new ML.Plot2D(W.views.a, { xlim: [-1.6, 10.4], ylim: [-11.8, 1.2], grid: false, axes: false, equal: true, pad: [24, 6, 6, 6] });
    const Lp = new ML.Plot2D(W.views.l, { xlim: [0, 600], ylim: [0, 3.1], gridStep: [100, 0.5], xlabel: '\\text{itérations}' });
    A.onDraw = p => {
      const f = net.forward(ex.x), N = net.N, lab = t => (t === net.START ? '⟨s⟩' : LET[t]);
      T.matrix(p, f.A, { x0: 0, y0: 0, col: v => M.ramp(0.06 + 0.92 * Math.sqrt(v)), mask: T.causal, fmt: v => (v >= 0.1 ? v.toFixed(1).replace(/^0/, '') : ''), size: 9 });
      ex.x.forEach((t, j) => p.text(j + 0.5, -N - 0.4, lab(t), { size: 12, color: '#ccc' }));
      ex.y.forEach((t, i) => {
        const pr = f.Pr[i], g = pr.indexOf(Math.max(...pr)), ok = g === t;
        p.text(-0.95, -i - 0.5, LET[g], { size: 12, color: i < net.P ? '#777' : ok ? C.green : C.red });
        p.text(-0.35, -i - 0.5, Math.round(100 * pr[g]) + '%', { size: 9, color: '#888' });
      });
      if (net.P < N) p.seg(-1.5, -net.P, N, -net.P, { color: C.gold, width: 1.2, dash: [4, 3] });
      p.text(N / 2, -N - 1.1, 'entrées x', { color: '#888', size: 11 });
      p.text(-0.95, 0.6, 'prédit', { color: '#888', size: 11 });
    };
    Lp.onDraw = p => {
      const H = st.hist;
      p.hline(Math.log(8), { color: C.red, width: 1.5, dash: [6, 4] });
      p.tex('l8', Lp.xlim[1], Math.log(8), '\\ln 8', { color: C.red, anchor: 'right', dy: -11, size: 13 });
      if (H.length > 1) { p.polyline(H.map(h => [h[0], h[1]]), { color: C.blue, width: 2 }); p.polyline(H.map(h => [h[0], h[2]]), { color: C.gold, width: 2.5 }); }
    };
    const c = W.controls;
    ui.select(c, { label: 'positions', value: st.pe, options: [['sin', 'encodage sinusoïdal fixe'], ['learn', 'encodage appris (un vecteur par position)'], ['none', 'aucun encodage positionnel']], onChange: v => { st.pe = v; reset(); upd(); } });
    ui.slider(c, { label: 'longueur du motif $P$ (séquence de $2P$ tokens)', min: 3, max: 8, step: 1, value: st.P, digits: 0, onInput: v => { const P = Math.round(v); if (P !== st.P) { st.P = P; reset(); upd(); } } });
    const train = n => { for (let k = 0; k < n; k++) { net.step(rng, { B: 16, lr: 0.01 }); st.it++; } record(); };
    ui.player(c, { speed: 6, step: () => { train(5); if (st.it % 25 === 0) newEx(); upd(); return st.it < 3000; }, reset: () => { st.seed++; reset(); upd(); } });
    ui.buttons(c, [{ label: '+200 itérations', onClick: () => { for (let k = 0; k < 40; k++) train(5); upd(); } }, { label: 'autre séquence', onClick: () => { ex = net.sample(M.rng(Date.now() % 100000)); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      const h = st.hist[st.hist.length - 1], xmax = Math.max(600, Math.ceil(st.it / 300) * 300);
      if (Lp.xlim[1] !== xmax) Lp.setLimits([0, xmax], [0, 3.1]);
      const a = ex.y.slice(0, net.P), gen = net.generate(a);
      const genH = gen.map((g, i) => `<span style="color:${g.t === a[i] ? C.green : C.red}">${LET[g.t]}</span>`).join(' ');
      ro.set(`Itération ${st.it} (Adam, mini-batchs de 16 séquences)<br>Perte 2<sup>e</sup> moitié : <b>${h[2].toFixed(3)}</b> · toute la séquence : ${h[1].toFixed(3)} · tokens de la 2<sup>e</sup> moitié bien prédits : <b>${(100 * h[3]).toFixed(0)} %</b><br>Génération gloutonne à partir de « ${a.map(t => LET[t]).join(' ')} » : ${genH}<br><span class="c-dim">Les lettres $a_1,\\dots,a_P$ sont tirées au hasard : aucun modèle ne peut prédire la 1<sup>re</sup> moitié mieux que $\\ln 8$, et un modèle de Markov ne fait pas mieux sur la 2<sup>e</sup>. Le transformer y arrive en apprenant à regarder ${st.P - 1} positions en arrière (la diagonale décalée dans la matrice d'attention). ${st.pe === 'none' ? 'Sans encodage positionnel, il ne sait pas où regarder : il reste coincé (seul le masque causal lui donne une vague idée de la position).' : ''}</span>`);
      A.setLimits([-1.6, net.N + 0.4], [-net.N - 1.8, 1.2]);
      A.request(); Lp.request();
    }
    reset(); upd();
  });
})(window.ML);
