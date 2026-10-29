/* Chapitre 8 — §1–3 : modèle de Markov d'ordre L, coefficients d'attention et self-attention,
   paramétrisations XUUᵀXᵀ puis QKᵀ, mise à l'échelle par √D_k */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, T = ML.tf;

  // ------------------------------------------------------------------ tf-ngram
  ML.scene('tf-ngram', host => {
    const W = ML.widget(host, {
      title: 'Prédire le token suivant avec un modèle de Markov d\'ordre $L$ : $p(x_n\\mid x_{n-L},\\dots,x_{n-1})$ estimée par comptage (slides 3, 7)', tag: '2D',
      views: [{ name: 's', label: 'la phrase ; en or, les $L$ derniers tokens que le modèle de Markov regarde', style: 'flex:1 1 100%;height:190px' },
        { name: 'b', label: 'loi estimée du token suivant (fréquences dans le corpus)', cls: 'short' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f0ac5f"></i>contexte vu par le modèle d\'ordre $L$</span><span class="key"><i style="background:#83c167"></i>ce que l\'attention peut aller chercher, quelle que soit la distance</span>',
    });
    // corpus : 24 phrases, « … the river … bank and fished/rested » ou « … the street … bank and paid/withdrew »
    const PL = { river: { v: ['swam', 'rowed'], a: ['fished', 'rested'] }, street: { v: ['walked', 'ran'], a: ['paid', 'withdrew'] } };
    const corpus = [];
    for (const s of ['I', 'we', 'they']) for (const pl of ['river', 'street']) for (const v of PL[pl].v) for (const a of PL[pl].a) corpus.push([s, v, 'across', 'the', pl, 'to', 'get', 'to', 'the', 'other', 'bank', 'and', a]);
    const vocab = [...new Set(corpus.flat())], ACTS = ['fished', 'rested', 'paid', 'withdrew'];
    const TESTS = [['0', 'I swam across the river … bank and ?', ['I', 'swam', 'river']], ['1', 'they walked across the street … bank and ?', ['they', 'walked', 'street']], ['2', 'we rowed across the river … bank and ?', ['we', 'rowed', 'river']], ['3', 'I ran across the street … bank and ?', ['I', 'ran', 'street']]];
    const st = { test: 0, L: 3 };
    W.toggle('att', 'flèches d\'attention (ce qu\'un transformer peut regarder)', true);
    const sent = () => { const [s, v, pl] = TESTS[st.test][2]; return [s, v, 'across', 'the', pl, 'to', 'get', 'to', 'the', 'other', 'bank', 'and']; };
    const predict = ctx => {
      const L = ctx.length, cnt = {}; let tot = 0; const seen = new Set();
      for (const s of corpus) for (let n = L; n < s.length; n++) {
        const c = s.slice(n - L, n); seen.add(c.join(' '));
        if (c.every((w, i) => w === ctx[i])) { cnt[s[n]] = (cnt[s[n]] || 0) + 1; tot++; }
      }
      return { p: w => (tot ? (cnt[w] || 0) / tot : 0), tot, seen: seen.size };
    };
    const S = new ML.Plot2D(W.views.s, { xlim: [-0.7, 12.7], ylim: [-1.9, 1.2], grid: false, axes: false, pad: [26, 8, 8, 8] });
    const B = new ML.Plot2D(W.views.b, { xlim: [0.35, 4.65], ylim: [0, 1.08], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? '' : String(+v.toFixed(2))) });
    S.onDraw = p => {
      const w = sent().concat(['?']), L = st.L;
      if (W.show.att) {
        const curve = (j, wd, al) => p.param(t => [12 + (j - 12) * t, -0.3 - 1.1 * Math.sin(Math.PI * t) * (0.4 + 0.05 * (12 - j))], 0, 1, { color: C.green, width: wd, alpha: al, samples: 60 });
        curve(4, 4, 0.9); curve(1, 1.6, 0.6);
      }
      T.tokens(p, w, { y: 0.2, w: 0.94, h: 0.62, size: 12,
        fill: i => (i === 12 ? '#3a1f22' : i >= 12 - L ? '#4a3517' : '#1d2b3c'), stroke: i => (i === 12 ? C.red : i >= 12 - L ? C.gold : '#4a5a6b'), color: i => (i === 12 ? C.red : '#e8eef4') });
      p.text(12 - L / 2 - 0.5, 0.85, `contexte : ${L} token${L > 1 ? 's' : ''}`, { color: C.gold, size: 12 });
    };
    B.onDraw = p => {
      const pr = predict(sent().slice(12 - st.L)), truth = PL[TESTS[st.test][2][2]].a;
      ACTS.forEach((a, i) => {
        const v = pr.p(a), ok = truth.includes(a); i += 1;
        p.rect(i - 0.35, 0, i + 0.35, v, { color: ok ? C.green : C.red, fill: ok ? C.green : C.red, fillAlpha: 0.55, width: 1.5 });
        p.text(i, 0.04, a, { color: '#ddd', size: 12, baseline: 'bottom', dy: -2 });
        if (v > 0) p.text(i, v, v.toFixed(2), { color: '#ddd', size: 11, dy: -9 });
      });
    };
    const c = W.controls;
    ui.select(c, { label: 'phrase à compléter', value: '0', options: TESTS.map(t => [t[0], t[1]]), onChange: v => { st.test = +v; upd(); } });
    ui.slider(c, { label: 'ordre $L$ (longueur du contexte)', min: 1, max: 12, step: 1, value: st.L, digits: 0, onInput: v => { st.L = Math.round(v); upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const L = st.L, pr = predict(sent().slice(12 - L)), K = vocab.length, cells = K ** L, ex = Math.floor(Math.log10(cells)), sci = ex < 4 ? String(cells) : `${(cells / 10 ** ex).toFixed(1)}\\times10^{${ex}}`;
      const ok = L >= 8 ? 'Le contexte contient « ' + TESTS[st.test][2][2] + ' » : le modèle sait enfin de quelle « bank » il s\'agit (vert = suites compatibles).' : 'Le mot qui décide (« river » ou « street ») est 8 positions en arrière : invisible pour $L\\lt 8$, le modèle hésite entre les 4 suites.';
      ro.set(`Corpus : ${corpus.length} phrases, vocabulaire $|\\mathcal V| = ${K}$ mots.<br>Contextes de longueur $L = ${L}$ : $|\\mathcal V|^L = ${sci}$ possibles, dont <b>${pr.seen}</b> vus dans le corpus ; une table complète a $|\\mathcal V|^L(|\\mathcal V|-1)$ paramètres.<br><span class="c-dim">${ok} Avec un vocabulaire réel ($|\\mathcal V|\\approx 5\\cdot10^4$), une table d'ordre 8 est hors de portée, et presque tous ses contextes n'apparaissent jamais dans les données.</span>`
      );
      S.request(); B.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ tf-attn
  const WORDS = ['I', 'swam', 'river', 'other', 'bank'];
  const EMB0 = [[-1.7, -0.7], [0.3, 1.5], [1.4, 1.1], [-0.9, 0.8], [1.5, 0.15]];
  const TCOL = [C.purple, C.teal, C.blue, C.pink, C.red];
  ML.scene('tf-attn', host => {
    const W = ML.widget(host, {
      title: 'Coefficients d\'attention : $y_n = \\sum_m a_{nm}x_m$ est une combinaison convexe des entrées (slides 9–10)', tag: '2D',
      views: [{ name: 'e', label: 'tokens $x_m\\in\\R^2$ (déplaçables), enveloppe convexe et sortie $y_n$', cls: 'tall' }, { name: 'a', label: 'coefficients $a_{nm}$ de la requête $n$ (et scores $x_n^\\top x_m$)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#ff8fb1"></i>sortie $y_n$</span><span class="key"><i style="background:#888"></i>enveloppe convexe des $x_m$</span><span class="key"><i style="background:#f4d345"></i>épaisseur des traits $\\propto a_{nm}$</span>',
    });
    const st = { n: 4, mode: 'self', beta: 1, X: EMB0.map(v => v.slice()) };
    W.toggle('hull', 'enveloppe convexe', true);
    W.toggle('all', 'toutes les sorties $y_1,\\dots,y_N$', false);
    const coeffs = () => st.X.map(xn => {
      if (st.mode === 'unif') return st.X.map(() => 1 / st.X.length);
      const s = st.X.map(xm => st.beta * (xn[0] * xm[0] + xn[1] * xm[1])), mx = Math.max(...s), e = s.map(v => Math.exp(v - mx)), z = M.sum(e);
      return e.map(v => v / z);
    });
    const P = new ML.Plot2D(W.views.e, { xlim: [-2.6, 2.6], ylim: [-2.2, 2.4], equal: true, gridStep: [1, 1] });
    const A = new ML.Plot2D(W.views.a, { xlim: [0.35, 5.65], ylim: [0, 1.22], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? '' : String(+v.toFixed(2))) });
    let Am = coeffs();
    P.onDraw = p => {
      const X = st.X, a = Am[st.n], y = [M.sum(X.map((x, m) => a[m] * x[0])), M.sum(X.map((x, m) => a[m] * x[1]))];
      if (W.show.hull) p.poly(T.hull(X), { color: '#888', width: 1.2, dash: [5, 4], fill: '#888', fillAlpha: 0.08 });
      X.forEach((x, m) => p.seg(y[0], y[1], x[0], x[1], { color: C.yellow, width: 0.5 + 9 * a[m], alpha: 0.75 }));
      if (W.show.all) Am.forEach((am, n) => { if (n === st.n) return; const yy = [M.sum(X.map((x, m) => am[m] * x[0])), M.sum(X.map((x, m) => am[m] * x[1]))]; p.point(yy[0], yy[1], { color: TCOL[n], r: 5, shape: 'square' }); p.tex('y' + n, yy[0], yy[1], 'y_{' + (n + 1) + '}', { color: TCOL[n], dx: 12, dy: 10, size: 13 }); });
      X.forEach((x, m) => { p.point(x[0], x[1], { color: TCOL[m], r: m === st.n ? 8 : 6, glow: m === st.n }); p.text(x[0], x[1], WORDS[m], { color: TCOL[m], size: 13, dy: -17 }); });
      p.point(y[0], y[1], { color: '#ff8fb1', r: 7, glow: true });
      p.tex('yn', y[0], y[1], 'y_{' + (st.n + 1) + '}', { color: '#ff8fb1', dx: 16, dy: 12 });
    };
    st.X.forEach((_, m) => P.addDraggable({ get: () => st.X[m], set: (x, y) => { st.X[m] = [x, y]; upd(); }, r: 14 }));
    A.onDraw = p => {
      const a = Am[st.n], xn = st.X[st.n];
      a.forEach((v, m) => {
        const x = m + 1;
        p.rect(x - 0.35, 0, x + 0.35, v, { color: TCOL[m], fill: TCOL[m], fillAlpha: 0.55, width: 1.5 });
        p.text(x, 0.03, WORDS[m], { color: '#ddd', size: 12, baseline: 'bottom', dy: -2 });
        p.text(x, v, v.toFixed(2), { color: '#ddd', size: 11, dy: -9 });
        if (st.mode === 'self') p.text(x, 1.1, (xn[0] * st.X[m][0] + xn[1] * st.X[m][1]).toFixed(2), { color: C.gold, size: 11 });
      });
      if (st.mode === 'self') p.tex('sc', 0.4, 1.1, 'x_n^\\top x_m :', { color: C.gold, anchor: 'left', size: 12, dy: 18 });
    };
    const c = W.controls;
    ui.select(c, { label: 'mécanisme', value: st.mode, options: [['unif', 'coefficients fixés (uniformes 1/N)'], ['self', 'self-attention : softmax des produits scalaires']], onChange: v => { st.mode = v; upd(); } });
    ui.select(c, { label: 'requête $n$ (le token qu\'on représente)', value: String(st.n), options: WORDS.map((w, i) => [String(i), w]), onChange: v => { st.n = +v; upd(); } });
    ui.slider(c, { label: 'facteur $\\beta$ devant les scores $\\beta\\,x_n^\\top x_m$', min: -1, max: 1, step: 0.01, value: st.beta, log: true, digits: 2, onInput: v => { st.beta = v; upd(); } });
    ui.buttons(c, [{ label: 'positions initiales', onClick: () => { st.X = EMB0.map(v => v.slice()); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      Am = coeffs();
      const a = Am[st.n], amax = Math.max(...a), arg = a.indexOf(amax);
      ro.set(`Requête « ${WORDS[st.n]} » : $\\sum_m a_{nm} = ${M.sum(a).toFixed(3)}$, tous les $a_{nm}\\ge0$, donc $y_{${st.n + 1}}$ reste dans l'enveloppe convexe.<br>Plus fort coefficient : « ${WORDS[arg]} » ($a = ${amax.toFixed(2)}$).<br><span class="c-dim">${st.mode === 'unif' ? 'Coefficients fixés : toutes les sorties valent la moyenne $\\bar x$, quel que soit le token (✗ non adaptatifs).' : 'Les coefficients dépendent maintenant des entrées (✓ adaptatifs) : un token compte d\'autant plus que $x_m$ pointe dans la direction de $x_n$ et qu\'il est long. Grand $\\beta$ : le softmax se concentre sur un seul token ; $\\beta\\to0$ : retour aux coefficients uniformes. Aucun paramètre n\'est appris (✗).'}</span>`);
      P.request(); A.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ tf-qkv
  ML.scene('tf-qkv', host => {
    const W = ML.widget(host, {
      title: 'Des scores symétriques $XUU^\\top X^\\top$ aux scores $QK^\\top$ : requêtes et clés séparées (slides 11–13)', tag: '2D',
      views: [{ name: 'v', label: 'requêtes $q_n$ (or) et clés $k_m$ (bleu) ; le score est $q_n^\\top k_m$', cls: 'tall' }, { name: 'm', label: 'en haut, scores $S$ ; en bas, $\\mathrm{Softmax}[S]$ (lignes = requêtes, colonnes = clés)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f0ac5f"></i>score positif</span><span class="key"><i style="background:#58c4dd"></i>score négatif</span>',
    });
    const st = { mode: 'QK', tq: 0.6, tk: -0.5, s: 1.4, n: 4 };
    const N = WORDS.length, X = EMB0;
    const lin = (th, s) => [[Math.cos(th) * s, -Math.sin(th) / s], [Math.sin(th) * s, Math.cos(th) / s]]; // rotation ∘ étirement (D = D_k = 2)
    let Q, K, S, A;
    const compute = () => {
      const Wq = st.mode === 'XX' ? [[1, 0], [0, 1]] : lin(st.tq, st.s), Wk = st.mode === 'QK' ? lin(st.tk, st.s) : Wq;
      Q = T.mm(X, Wq); K = T.mm(X, Wk); S = T.mm(Q, T.tr(K)); A = T.softmaxRows(S);
    };
    const P = new ML.Plot2D(W.views.v, { xlim: [-3, 3], ylim: [-3, 3], equal: true, gridStep: [1, 1] });
    const Mx = new ML.Plot2D(W.views.m, { xlim: [-1.7, 5.3], ylim: [-12.6, 1.5], grid: false, axes: false, equal: true, pad: [26, 6, 6, 6] });
    P.onDraw = p => {
      K.forEach((k, m) => { p.arrow(0, 0, k[0], k[1], { color: C.blue, width: 2, alpha: 0.85 }); p.text(k[0], k[1], WORDS[m], { color: C.blue, size: 11, dy: 12 }); });
      Q.forEach((q, n) => { const on = n === st.n; p.arrow(0, 0, q[0], q[1], { color: C.gold, width: on ? 3.5 : 1.5, alpha: on ? 1 : 0.45 }); if (on) p.text(q[0], q[1], 'requête : ' + WORDS[n], { color: C.gold, size: 13, dy: -13 }); });
    };
    Mx.onDraw = p => {
      const smax = Math.max(1, ...S.flat().map(Math.abs)), Y2 = -6.9;
      T.matrix(p, S, { x0: 0, y0: 0, col: v => T.div(v, smax), fmt: v => v.toFixed(1), size: 11 });
      T.matrix(p, A, { x0: 0, y0: Y2, col: v => M.ramp(0.08 + 0.9 * v), fmt: v => v.toFixed(2), size: 11 });
      p.rect(0, -st.n - 1, 5, -st.n, { color: '#fff', width: 2 }); p.rect(0, Y2 - st.n - 1, 5, Y2 - st.n, { color: '#fff', width: 2 });
      WORDS.forEach((w, i) => { [0, Y2].forEach(y0 => { p.text(-0.12, y0 - i - 0.5, w, { size: 11, align: 'right', color: '#bbb' }); p.text(i + 0.5, y0 + 0.3, w, { size: 10, color: '#bbb' }); }); });
    };
    const c = W.controls;
    ui.select(c, { label: 'mécanisme', value: st.mode, options: [['XX', '2 · scores XXᵀ (aucun paramètre)'], ['U', '3 · scores XUUᵀXᵀ (une matrice U)'], ['QK', '4 · scores QKᵀ (W(q) et W(k) séparées)']], onChange: v => { st.mode = v; upd(); } });
    ui.slider(c, { label: 'angle de $W^{(q)}$ (ou de $U$)', min: -Math.PI, max: Math.PI, step: 0.01, value: st.tq, digits: 2, onInput: v => { st.tq = v; upd(); } });
    ui.slider(c, { label: 'angle de $W^{(k)}$ (mécanisme 4)', min: -Math.PI, max: Math.PI, step: 0.01, value: st.tk, digits: 2, onInput: v => { st.tk = v; upd(); } });
    ui.slider(c, { label: 'étirement $s$ (axes $\\times s$ et $\\times 1/s$)', min: 0.5, max: 2.2, step: 0.01, value: st.s, digits: 2, onInput: v => { st.s = v; upd(); } });
    ui.select(c, { label: 'requête mise en avant', value: String(st.n), options: WORDS.map((w, i) => [String(i), w]), onChange: v => { st.n = +v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      compute();
      let asym = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) asym = Math.max(asym, Math.abs(S[i][j] - S[j][i]));
      const i = 4, j = 2, Zr = S.map(r => M.sum(r.map(Math.exp)));
      ro.set(`$\\max_{n,m}|s_{nm}-s_{mn}| = ${asym.toFixed(3)}$ ${asym < 1e-9 ? '(scores <b>symétriques</b>)' : '(scores <b>non symétriques</b>)'}<br>« bank » → « river » : $a_{nm} = ${A[i][j].toFixed(3)}$ · « river » → « bank » : $a_{mn} = ${A[j][i].toFixed(3)}$${asym < 1e-9 ? ` · rapport $a_{nm}/a_{mn} = ${(A[i][j] / A[j][i]).toFixed(3)} = Z_m/Z_n = ${(Zr[j] / Zr[i]).toFixed(3)}$` : ''}<br><span class="c-dim">${st.mode === 'XX' ? 'Aucun paramètre : on ne peut rien apprendre (✗). Seuls les sliders des mécanismes 3–4 agissent.' : st.mode === 'U' ? 'Ici $q_n = k_n = U^\\top x_n$ : une même flèche sert de requête et de clé, donc $s_{nm} = s_{mn}$ (✓ apprenable, ✗ symétrique). Le second slider d\'angle est sans effet.' : 'Requêtes et clés ont chacune leur transformation : « bank » peut regarder « river » beaucoup plus que l\'inverse (✓ asymétrique).'}</span>`);
      P.request(); Mx.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ tf-scale
  ML.scene('tf-scale', host => {
    const W = ML.widget(host, {
      title: 'Pourquoi diviser par $\\sqrt{D_k}$ : saturation du softmax et gradients qui s\'éteignent (slide 14)', tag: '2D',
      views: [{ name: 'a', label: 'un tirage : $q,k_1,\\dots,k_8\\sim\\mathcal N(0,I_{D_k})$ et les poids $a_m$', cls: 'tall' }, { name: 'c', label: 'en moyenne sur 300 tirages, selon $D_k$ (échelle log)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#fc6255"></i>sans mise à l\'échelle : $\\mathrm{softmax}(q^\\top k_m)$</span><span class="key"><i style="background:#83c167"></i>avec : $\\mathrm{softmax}(q^\\top k_m/\\sqrt{D_k})$</span><span class="key"><i style="background:#f4d345"></i>tirets : norme du jacobien $\\|J\\|_F$</span>',
    });
    const NK = 8, st = { e: 6, scale: true, seed: 1 };
    const soft = s => { const mx = Math.max(...s), e = s.map(v => Math.exp(v - mx)), z = M.sum(e); return e.map(v => v / z); };
    const jac = a => { let f = 0; a.forEach((ai, i) => a.forEach((aj, j) => { const v = i === j ? ai * (1 - ai) : ai * aj; f += v * v; })); return Math.sqrt(f); };
    const draw = (Dk, r) => { const q = M.range(Dk).map(() => r.n()); return M.range(NK).map(() => { let s = 0; for (let d = 0; d < Dk; d++) s += q[d] * r.n(); return s; }); };
    // courbes moyennes (calculées une fois)
    const curves = M.range(10).map(e => {
      const Dk = 2 ** e, r = M.rng(100 + e); let m0 = 0, m1 = 0, j0 = 0, j1 = 0, v = 0;
      for (let t = 0; t < 300; t++) { const s = draw(Dk, r), a0 = soft(s), a1 = soft(s.map(x => x / Math.sqrt(Dk))); m0 += Math.max(...a0); m1 += Math.max(...a1); j0 += jac(a0); j1 += jac(a1); v += M.mean(s.map(x => x * x)); }
      return { e, max0: m0 / 300, max1: m1 / 300, j0: j0 / 300, j1: j1 / 300, varS: v / 300 };
    });
    const P = new ML.Plot2D(W.views.a, { xlim: [0.35, 8.65], ylim: [0, 1.08], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? String(Math.round(v)) : String(+v.toFixed(2))) });
    const Cv = new ML.Plot2D(W.views.c, { xlim: [-0.3, 9.3], ylim: [0, 1.05], gridStep: [1, 0.25], tickFmt: (v, ax) => (ax === 'x' ? String(2 ** Math.round(v)) : String(+v.toFixed(2))), xlabel: 'D_k' });
    let s0 = [];
    P.onDraw = p => {
      const Dk = 2 ** st.e, a = soft(st.scale ? s0.map(x => x / Math.sqrt(Dk)) : s0), col = st.scale ? C.green : C.red;
      a.forEach((v, m) => { m += 1; p.rect(m - 0.35, 0, m + 0.35, v, { color: col, fill: col, fillAlpha: 0.55, width: 1.5 }); p.text(m, v, v.toFixed(2), { size: 11, color: '#ddd', dy: -9 }); });
    };
    Cv.onDraw = p => {
      p.polyline(curves.map(c => [c.e, c.max0]), { color: C.red, width: 2.5 }); p.polyline(curves.map(c => [c.e, c.max1]), { color: C.green, width: 2.5 });
      p.polyline(curves.map(c => [c.e, c.j0]), { color: C.red, width: 2, dash: [6, 4] }); p.polyline(curves.map(c => [c.e, c.j1]), { color: C.green, width: 2, dash: [6, 4] });
      p.tex('mx', 0.1, 0.93, '\\E\\big[\\max_m a_m\\big]\\ \\text{(traits pleins)}', { color: '#ddd', anchor: 'left', size: 13 });
      p.tex('jf', 9.2, curves[9].j1, '\\|J\\|_F', { color: '#ddd', anchor: 'right', dy: -14, size: 13 });
      p.vline(st.e, { color: C.yellow, width: 1.2, dash: [3, 4] });
    };
    const c = W.controls;
    ui.slider(c, { label: 'dimension des clés $D_k = 2^e$', min: 0, max: 9, step: 1, value: st.e, fmt: v => String(2 ** Math.round(v)), onInput: v => { st.e = Math.round(v); resample(); } });
    ui.check(c, { label: 'diviser les scores par $\\sqrt{D_k}$', value: st.scale, onChange: v => { st.scale = v; upd(); } });
    ui.buttons(c, [{ label: 'nouveau tirage', primary: true, onClick: () => { st.seed++; resample(); } }]);
    const ro = ui.readout(c);
    function resample() { s0 = draw(2 ** st.e, M.rng(st.seed * 7 + st.e)); upd(); }
    function upd() {
      const Dk = 2 ** st.e, cv = curves[st.e], a = soft(st.scale ? s0.map(x => x / Math.sqrt(Dk)) : s0);
      ro.set(`$D_k = ${Dk}$ · variance empirique des scores $q^\\top k_m$ : <b>${cv.varS.toFixed(1)}</b> (théorie : $D_k$) ; après division par $\\sqrt{D_k}$ : ${(cv.varS / Dk).toFixed(2)} (théorie : 1)<br>Ce tirage : $\\max_m a_m = ${Math.max(...a).toFixed(3)}$, $\\|J\\|_F = ${jac(a).toFixed(4)}$<br><span class="c-dim">Sans mise à l'échelle, les scores ont un écart-type $\\sqrt{D_k}$ : pour $D_k$ grand, le softmax met presque tout son poids sur une clé et son jacobien $J = \\mathrm{diag}(a)-aa^\\top$ tend vers 0, donc presque aucun gradient ne remonte vers $W^{(q)}$ et $W^{(k)}$. Diviser par $\\sqrt{D_k}$ ramène la variance à 1 quelle que soit la dimension.</span>`);
      P.request(); Cv.request();
    }
    resample();
  });
})(window.ML);
