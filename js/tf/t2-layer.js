/* Chapitre 8 — §5–6 : équivariance par permutation d'une couche de transformer, encodage positionnel sinusoïdal,
   attention masquée (causale) d'un décodeur */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, T = ML.tf;
  const embed = (words, D, seed) => { const r = M.rng(seed), E = {}; [...new Set(words)].sort().forEach(w => { E[w] = M.range(D).map(() => r.n()); }); return E; };

  // ------------------------------------------------------------------ tf-perm
  ML.scene('tf-perm', host => {
    const W = ML.widget(host, {
      title: 'Une couche de transformer est équivariante : $\\mathrm{TransformerLayer}[PX] = P\\,\\mathrm{TransformerLayer}[X]$ (slides 16–18)', tag: '2D',
      views: [{ name: 's', label: 'ordre des tokens en entrée : phrase A (permutable) et phrase B', style: 'flex:1 1 100%;height:150px' },
        { name: 'o', label: 'les 9 vecteurs de sortie $\\tilde x_n\\in\\R^8$, projetés sur un plan (ronds : A, carrés : B)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>sorties de la phrase A</span><span class="key"><i style="background:#f0ac5f"></i>sorties de la phrase B</span><span class="key"><i style="background:#fc6255"></i>mots qui changent de place entre A et B</span>',
    });
    const A0 = ['the', 'food', 'was', 'bad', ',', 'not', 'good', 'at', 'all'], B0 = ['the', 'food', 'was', 'good', ',', 'not', 'bad', 'at', 'all'];
    const D = 8, E = embed(A0, D, 7), layer = new T.Layer(D, 2, 3), proj = (() => { const r = M.rng(21); return [M.range(D).map(() => r.n() / Math.sqrt(D)), M.range(D).map(() => r.n() / Math.sqrt(D))]; })();
    const st = { pe: false, perm: M.range(9) };
    const input = (words) => words.map((w, n) => E[w].map((v, j) => v + (st.pe ? 1.2 * T.pe(n, D, 30)[j] : 0)));
    const run = words => layer.forward(input(words)).Xt;
    let outA, outB, wordsA;
    const S = new ML.Plot2D(W.views.s, { xlim: [-1.2, 8.6], ylim: [-1.25, 1.0], grid: false, axes: false, pad: [24, 8, 6, 8] });
    const O = new ML.Plot2D(W.views.o, { xlim: [-3, 3], ylim: [-3, 3], equal: true, gridStep: [1, 1] });
    const swapCol = w => (w === 'bad' || w === 'good' ? C.red : '#e8eef4');
    S.onDraw = p => {
      p.text(-0.65, 0.35, 'A', { color: C.blue, size: 15 }); p.text(-0.65, -0.65, 'B', { color: C.gold, size: 15 });
      T.tokens(p, wordsA, { y: 0.35, w: 0.9, h: 0.6, size: 12, color: i => swapCol(wordsA[i]), stroke: () => C.blue });
      T.tokens(p, B0, { y: -0.65, w: 0.9, h: 0.6, size: 12, color: i => swapCol(B0[i]), stroke: () => C.gold });
    };
    O.onDraw = p => {
      const pr = x => [T.dot(proj[0], x), T.dot(proj[1], x)];
      outB.forEach((x, n) => { const [u, v] = pr(x); p.point(u, v, { color: C.gold, r: 7, shape: 'square', hollow: true, width: 2 }); p.text(u, v, B0[n], { color: C.gold, size: 11, dy: 15 }); });
      outA.forEach((x, n) => { const [u, v] = pr(x); p.point(u, v, { color: C.blue, r: 4.5 }); p.text(u, v, wordsA[n], { color: swapCol(wordsA[n]) === C.red ? C.red : C.blue, size: 12, dy: -13 }); });
    };
    const c = W.controls;
    ui.check(c, { label: 'ajouter l\'encodage positionnel $x_n+r_n$', value: st.pe, onChange: v => { st.pe = v; upd(); } });
    let seed = 1;
    ui.buttons(c, [{ label: 'permuter A au hasard', primary: true, onClick: () => { st.perm = M.rng(seed++ * 13).shuffle(M.range(9)); upd(); } }, { label: 'ordre d\'origine', onClick: () => { st.perm = M.range(9); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      wordsA = st.perm.map(i => A0[i]);
      outA = run(wordsA); outB = run(B0);
      const ref = run(A0), Pref = T.permute(ref, st.perm);           // P · TransformerLayer[X]
      const err = Math.max(...outA.map((r, n) => Math.max(...r.map((v, j) => Math.abs(v - Pref[n][j])))));
      const mA = M.range(D).map(j => M.mean(outA.map(r => r[j]))), mB = M.range(D).map(j => M.mean(outB.map(r => r[j])));
      const dm = Math.sqrt(M.sum(mA.map((v, j) => (v - mB[j]) ** 2)));
      const fmt = v => (v === 0 ? '0' : v < 1e-9 ? v.toExponential(1).replace(/e\+?(-?\d+)/, '\\cdot10^{$1}') : v.toFixed(3));
      ro.set(`Couche complète : 2 têtes, $D = 8$, résidus, LayerNorm, MLP (poids aléatoires fixés).<br>$\\max|\\,\\mathrm{TL}[PX]-P\\,\\mathrm{TL}[X]\\,| = ${fmt(err)}$<br>Moyenne des sorties : $\\|\\bar{\\tilde x}_A-\\bar{\\tilde x}_B\\| = ${fmt(dm)}$<br><span class="c-dim">${st.pe ? 'Avec $r_n$, le vecteur d\'entrée dépend de la place du mot : permuter change les sorties, et les deux phrases donnent des représentations différentes (✓ sensible à l\'ordre).' : 'Sans position, B n\'est qu\'une permutation de A (on échange « bad » et « good ») : chaque mot reçoit exactement la même sortie dans les deux phrases, les ronds tombent dans les carrés. Tout résumé qui ne dépend pas de l\'ordre (comme la moyenne) confond « bad, not good » et « good, not bad » (✗).'}</span>`);
      S.request(); O.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ tf-pe
  ML.scene('tf-pe', host => {
    const W = ML.widget(host, {
      title: 'Encodage positionnel sinusoïdal $r_{n,i}$ : un décalage de $k$ positions est une rotation (slide 18, DL §12.1.9)', tag: '2D',
      views: [{ name: 'h', label: '$r_{n,i}$ : position $n$ (lignes), coordonnée $i$ (colonnes)', cls: 'tall' },
        { name: 'c', label: 'une paire de coordonnées $(r_{n,2j},r_{n,2j+1})$ pour $n = 0,1,\\dots$ : un cercle', cls: 'short' },
        { name: 'd', label: 'produit scalaire $r_n^\\top r_m$ en fonction de $m$', cls: 'short' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>position $n$</span><span class="key"><i style="background:#ff8fb1"></i>position $n+k$</span><span class="key"><i style="background:#83c167"></i>rotation d\'angle $k\\,\\omega_j$</span>',
    });
    const NP = 64, st = { D: 32, base: 30, n: 10, k: 6, j: 2 };
    const om = j => 1 / st.base ** (2 * j / st.D);   // fréquence de la paire j (coordonnées 2j et 2j+1)
    const R = () => M.range(NP).map(n => T.pe(n, st.D, st.base));
    let Rm = R();
    const H = new ML.Plot2D(W.views.h, { xlim: [0, 32], ylim: [-NP, 0], grid: false, axes: false, pad: [24, 8, 8, 8] });
    const Cc = new ML.Plot2D(W.views.c, { xlim: [-1.4, 1.4], ylim: [-1.25, 1.25], equal: true, gridStep: [0.5, 0.5] });
    const Dd = new ML.Plot2D(W.views.d, { xlim: [0, NP - 1], ylim: [-9, 18], gridStep: [8, 4], xlabel: 'm' });
    H.onDraw = p => {
      p.heatmap((x, y) => { const n = Math.floor(-y), i = Math.floor(x); return n >= 0 && n < NP && i >= 0 && i < st.D ? Rm[n][i] : 0; }, v => M.hexToRgb(T.div(v, 1)), { res: 2, key: 'pe' + st.D + st.base });
      [[st.n, C.yellow], [st.n + st.k, '#ff8fb1']].forEach(([n, col]) => { if (n < NP) p.rect(0, -n - 1, st.D, -n, { color: col, width: 2 }); });
      p.rect(2 * st.j, -NP, 2 * st.j + 2, 0, { color: C.green, width: 1.5, dash: [4, 3] });
    };
    Cc.onDraw = p => {
      const w = om(st.j);
      p.circle(0, 0, 1, { color: '#444', width: 1 });
      for (let n = 0; n < NP; n++) p.point(Math.sin(n * w), Math.cos(n * w), { color: '#888', r: 2 });
      const a = st.n * w, b = (st.n + st.k) * w;
      p.param(t => [0.55 * Math.sin(t), 0.55 * Math.cos(t)], a, b, { color: C.green, width: 2.5 });
      p.arrow(0, 0, Math.sin(a), Math.cos(a), { color: C.yellow, width: 2.5 }); p.arrow(0, 0, Math.sin(b), Math.cos(b), { color: '#ff8fb1', width: 2.5 });
      p.tex('ang', 0.7 * Math.sin((a + b) / 2), 0.7 * Math.cos((a + b) / 2), 'k\\omega_j', { color: C.green, size: 13 });
    };
    Dd.onDraw = p => {
      const dot = (n, m) => T.dot(Rm[n], Rm[m]);
      p.fn(m => dot(st.n, Math.round(m)), { color: C.yellow, width: 2.2, samples: NP - 1 }, [0, NP - 1]);
      const n2 = Math.min(NP - 1, st.n + st.k);
      p.fn(m => dot(n2, Math.round(m)), { color: '#ff8fb1', width: 1.6, dash: [5, 4], samples: NP - 1 }, [0, NP - 1]);
      p.point(st.n, dot(st.n, st.n), { color: C.yellow, r: 5 }); p.point(n2, dot(n2, n2), { color: '#ff8fb1', r: 5 });
    };
    const c = W.controls;
    ui.slider(c, { label: 'position $n$', min: 0, max: NP - 1, step: 1, value: st.n, digits: 0, onInput: v => { st.n = Math.round(v); upd(); } });
    ui.slider(c, { label: 'décalage $k$', min: 0, max: 30, step: 1, value: st.k, digits: 0, onInput: v => { st.k = Math.round(v); upd(); } });
    ui.slider(c, { label: 'paire de coordonnées $j$ (fréquence $\\omega_j$)', min: 0, max: 15, step: 1, value: st.j, digits: 0, onInput: v => { st.j = Math.min(Math.round(v), st.D / 2 - 1); upd(); } });
    ui.select(c, { label: 'dimension $D$', value: '32', options: [['16', 'D = 16'], ['32', 'D = 32']], onChange: v => { st.D = +v; st.j = Math.min(st.j, st.D / 2 - 1); Rm = R(); H.setLimits([0, st.D], [-NP, 0]); Dd.setLimits(null, [-st.D / 4 - 1, st.D / 2 + 2]); upd(); } });
    ui.select(c, { label: 'base $b$ (fréquences $\\omega_j = b^{-2j/D}$)', value: '30', options: [['30', 'b = 30 (figure du livre DL)'], ['10000', 'b = 10000 (article original)']], onChange: v => { st.base = +v; Rm = R(); upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const w = om(st.j), n2 = st.n + st.k;
      const d1 = n2 < NP ? T.dot(Rm[st.n], Rm[n2]) : NaN, d0 = T.dot(Rm[0], Rm[st.k]);
      ro.set(`$\\omega_${st.j} = b^{-2j/D} = ${w.toFixed(4)}$ ; période ${(2 * Math.PI / w).toFixed(1)} positions.<br>$r_{${st.n}}^\\top r_{${n2}} = ${isFinite(d1) ? d1.toFixed(3) : '—'}$ et $r_0^\\top r_{${st.k}} = ${d0.toFixed(3)}$ : ${isFinite(d1) && Math.abs(d1 - d0) < 1e-9 ? '<b>égaux</b>' : 'à comparer'} (seul l'écart $k$ compte).<br><span class="c-dim">Chaque paire de coordonnées tourne sur un cercle à sa propre vitesse $\\omega_j$ : les premières colonnes changent vite (comme le bit de poids faible d'un compteur binaire), les dernières lentement. Passer de $n$ à $n+k$ fait tourner chaque paire d'un angle $k\\omega_j$ qui ne dépend pas de $n$.</span>`);
      H.request(); Cc.request(); Dd.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ tf-mask
  ML.scene('tf-mask', host => {
    const W = ML.widget(host, {
      title: 'Attention masquée : la sortie $n$ ne dépend que des entrées $\\le n$, sinon le modèle « triche » (slides 20–21)', tag: '2D',
      views: [{ name: 'a', label: 'attention de la 1<sup>re</sup> couche (tête 1) ; lignes = sorties, colonnes = entrées', cls: 'tall' },
        { name: 'd', label: 'effet sur chaque sortie (après 2 couches) d\'une modification de l\'entrée $j$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#6b2a30"></i>poids forcés à 0 (score $-\\infty$)</span><span class="key"><i style="background:#83c167"></i>sorties inchangées</span><span class="key"><i style="background:#fc6255"></i>sorties modifiées</span>',
    });
    const WORDS = ['I', 'swam', 'across', 'the', 'river', 'to', 'get', 'to', 'the', 'other', 'bank'];
    const inp = ['⟨start⟩'].concat(WORDS.slice(0, 10)), N = inp.length, D = 8;
    const E = embed(inp.concat(['lake']), D, 11), L1 = new T.Layer(D, 2, 5), L2 = new T.Layer(D, 2, 6);
    const st = { mask: true, j: 4 };
    const forward = words => { const X = words.map((w, n) => E[w].map((v, i) => v + T.pe(n, D, 30)[i])), mask = st.mask ? T.causal : null, f1 = L1.forward(X, { mask }), f2 = L2.forward(f1.Xt, { mask }); return { A: f1.A[0], Y: f2.Xt }; };
    let F, delta;
    const A = new ML.Plot2D(W.views.a, { xlim: [-2.6, 11.3], ylim: [-13.6, 0.4], grid: false, axes: false, equal: true, pad: [24, 6, 6, 6] });
    const Dp = new ML.Plot2D(W.views.d, { xlim: [0.35, N + 0.65], ylim: [0, 1.15], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? '' : String(+v.toFixed(2))) });
    A.onDraw = p => {
      T.matrix(p, F.A, { x0: 0, y0: 0, col: v => M.ramp(0.06 + 0.92 * Math.sqrt(v)), mask: st.mask ? T.causal : null, fmt: v => (v >= 0.005 ? v.toFixed(2).replace(/^0/, '') : ''), size: 9 });
      WORDS.forEach((w, i) => p.text(-0.15, -i - 0.5, w, { size: 11, align: 'right', color: '#bbb' }));
      inp.forEach((w, j) => p.text(j + 0.5, -N - (j % 2 ? 0.95 : 0.35), w, { size: 10, color: j === st.j ? C.yellow : '#bbb' }));
      p.rect(st.j, -N, st.j + 1, 0, { color: C.yellow, width: 2 });
      p.text(5.5, -N - 1.75, 'entrées', { color: '#888', size: 12 });
      p.text(-1.9, 0.35, 'sorties', { color: '#888', size: 12 });
    };
    Dp.onDraw = p => {
      const mx = Math.max(1e-9, ...delta);
      delta.forEach((v, n0) => {
        const n = n0 + 1, ch = v > 1e-9, h = ch ? 0.08 + 0.92 * v / mx : 0.02, col = ch ? C.red : C.green;
        p.rect(n - 0.36, 0, n + 0.36, h, { color: col, fill: col, fillAlpha: 0.6, width: 1.2 });
        p.text(n, h, WORDS[n0], { size: 10, color: '#ccc', dy: n0 % 2 ? -21 : -9 });
      });
    };
    const c = W.controls;
    ui.check(c, { label: 'masque causal ($a_{nm} = 0$ si $m>n$)', value: st.mask, onChange: v => { st.mask = v; upd(); } });
    ui.slider(c, { label: 'entrée modifiée $j$ (remplacée par « lake »)', min: 1, max: N - 1, step: 1, value: st.j, digits: 0, fmt: v => inp[Math.round(v)], onInput: v => { st.j = Math.round(v); upd(); } });
    const ro = ui.readout(c);
    function upd() {
      F = forward(inp);
      const alt = inp.slice(); alt[st.j] = 'lake';
      const G = forward(alt);
      delta = F.Y.map((r, n) => Math.sqrt(M.sum(r.map((v, i) => (v - G.Y[n][i]) ** 2))));
      const changed = delta.map((v, n) => v > 1e-9 ? n : -1).filter(n => n >= 0);
      const pairs = M.range(4).map(n => `(${inp.slice(0, n + 1).join(' ')}) → <b>${WORDS[n]}</b>`).join('<br>');
      ro.set(`Entrée ${st.j} « ${inp[st.j]} » → « lake » : sorties modifiées n° ${changed.map(n => n + 1).join(', ') || 'aucune'}.<br><span class="c-dim">${st.mask ? `Avec le masque, seules les sorties $n\\ge${st.j + 1}$ bougent : la sortie $n$ (qui prédit le $n$-ième mot) ne voit que ⟨start⟩ et les $n-1$ premiers mots. Une seule passe fournit donc ${N} exemples d'entraînement à la fois :` : `Sans masque, toutes les sorties bougent : la sortie qui doit prédire « ${WORDS[st.j - 1]} » voit ce mot dans ses entrées (colonne ${st.j}). Le modèle apprendrait à le recopier, et serait inutilisable pour générer. Avec le masque, une passe donnerait ces exemples :`}</span><br><span style="font-size:12px">${pairs}<br>…</span>`);
      A.request(); Dp.request();
    }
    upd();
  });
})(window.ML);
