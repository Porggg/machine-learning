/* Chapitre 9 — §2–3 : l'objectif du k-means, l'algorithme de Lloyd pas à pas, la sensibilité à l'initialisation, la quantification de couleurs */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, K = ML.km;
  const f2 = v => v.toFixed(2), f1 = v => v.toFixed(1);
  const LIM = { xlim: [-3.6, 3.6], ylim: [-3, 3], equal: true, gridStep: [1, 1] };
  const START = [[-2.6, -2.2], [0.4, 2.5], [2.7, -0.4], [-2.8, 2.2], [2.6, 2.4], [0, 0], [-0.5, -2.6], [1.6, -2.4]];
  // centres : croix blanche épaisse + croix colorée, poignée à halo
  const center = (p, m, k, key, glow) => {
    p.point(m[0], m[1], { shape: 'cross', color: '#000', r: 9, width: 6 });
    p.point(m[0], m[1], { shape: 'cross', color: K.COL[k], r: 8, width: 3.5 });
    if (glow) p.point(m[0], m[1], { color: K.COL[k], r: 5, alpha: 0.5, glow: true });
    p.tex(key + k, m[0], m[1], '\\mu_' + (k + 1), { color: K.COL[k], dx: 15, dy: -13, size: 14 });
  };
  const voronoi = (p, mu, dim = 0.22) => p.heatmapRGB((x, y) => K.RGB[K.nearest([x, y], mu)].map(v => v * dim), { res: 4 });
  const bisectors = (p, mu) => {
    for (let i = 0; i < mu.length; i++) for (let j = i + 1; j < mu.length; j++) {
      const a = mu[i], b = mu[j], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], t = [-(b[1] - a[1]), b[0] - a[0]], L = ML.clipLine(m, t, 6);
      if (!L) continue;
      // on ne garde que les morceaux de médiatrice qui séparent vraiment les cellules i et j
      const pts = [];
      for (let s = 0; s <= 200; s++) { const x = [L[0][0] + (L[1][0] - L[0][0]) * s / 200, L[0][1] + (L[1][1] - L[0][1]) * s / 200], d = K.d2(x, a); pts.push(mu.every((c, k) => k === i || k === j || K.d2(x, c) >= d - 1e-9) ? x : null); }
      p.polyline(pts, { color: C.pink, width: 2, dash: [7, 4] });
    }
  };

  // ------------------------------------------------------------------ km-obj
  ML.scene('km-obj', host => {
    const W = ML.widget(host, {
      title: 'L\'objectif $J(r,\\mu) = \\sum_i\\sum_kr_{ik}\\|x_i-\\mu_k\\|^2$ : tire les centres, les affectations optimales suivent (slide 7)', tag: '2D',
      views: [{ name: 'p', label: 'données $x_i$, centres $\\mu_k$ (à tirer) ; chaque point est affecté au centre le plus proche', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#d147bd"></i>médiatrices : frontières entre cellules</span><span class="key"><i style="background:#fff"></i>○ moyenne du groupe : là où la mise à jour enverrait $\\mu_k$</span>',
    });
    const st = { kind: 'blobs3', k: 3, X: null, mu: START.slice(0, 3).map(m => m.slice()) };
    const load = () => { st.X = K.data(st.kind, 2).X; };
    W.toggle('vor', 'cellules de Voronoï', true); W.toggle('dist', 'segments $x_i\\to\\mu_{k(i)}$', true); W.toggle('bis', 'médiatrices', false); W.toggle('mean', 'moyennes des groupes', true);
    const P = new ML.Plot2D(W.views.p, LIM);
    P.onDraw = p => {
      const r = K.assign(st.X, st.mu), mb = K.means(st.X, r, st.mu);
      if (W.show.vor) voronoi(p, st.mu);
      if (W.show.bis) bisectors(p, st.mu);
      if (W.show.dist) st.X.forEach((x, i) => p.seg(x[0], x[1], st.mu[r[i]][0], st.mu[r[i]][1], { color: K.COL[r[i]], width: 1, alpha: 0.4 }));
      st.X.forEach((x, i) => p.point(x[0], x[1], { color: K.COL[r[i]], r: 3.6, stroke: '#000', strokeWidth: 1 }));
      if (W.show.mean) mb.forEach((m, k) => { if (K.d2(m, st.mu[k]) > 1e-4) p.arrow(st.mu[k][0], st.mu[k][1], m[0], m[1], { color: '#fff', width: 1.3, dash: [4, 3], head: 8, alpha: 0.8 }); p.point(m[0], m[1], { color: '#fff', r: 6, hollow: true, width: 2 }); });
      st.mu.forEach((m, k) => center(p, m, k, 'm', true));
    };
    for (let k = 0; k < 8; k++) P.addDraggable({ enabled: () => k < st.k, get: () => st.mu[k], set: (x, y) => { st.mu[k] = [M.clamp(x, -3.5, 3.5), M.clamp(y, -2.9, 2.9)]; upd(); }, r: 16 });
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: K.DATA, onChange: v => { st.kind = v; load(); upd(); } });
    ui.slider(c, { label: 'nombre de groupes $K$', min: 2, max: 6, step: 1, value: 3, digits: 0, onInput: v => { const k = Math.round(v); while (st.mu.length < k) st.mu.push(START[st.mu.length].slice()); st.mu.length = k; st.k = k; upd(); } });
    ui.buttons(c, [
      { label: 'mise à jour : $\\mu_k\\leftarrow$ moyenne du groupe', primary: true, onClick: () => { st.mu = K.means(st.X, K.assign(st.X, st.mu), st.mu); upd(); } },
      { label: 'centres au hasard', onClick: () => { const R = M.rng(Date.now() % 1e6); st.mu = st.mu.map(() => [R.uniform(-3, 3), R.uniform(-2.5, 2.5)]); upd(); } },
    ]);
    const ro = ui.readout(c);
    function upd() {
      const r = K.assign(st.X, st.mu), J = K.J(st.X, r, st.mu), mb = K.means(st.X, r, st.mu), J2 = K.J(st.X, r, mb);
      const rows = st.mu.map((m, k) => { const n = r.filter(v => v === k).length, j = M.sum(st.X.map((x, i) => (r[i] === k ? K.d2(x, m) : 0))); return `<span style="color:${K.COL[k]}">groupe ${k + 1}</span> : $|C_${k + 1}| = ${n}$, contribution ${f2(j)}`; }).join('<br>');
      ro.set(`$J(r^\\star(\\mu),\\mu)$ = <b>${f2(J)}</b> (affectations optimales pour ces centres)<br>${rows}<br>Si chaque centre allait à la moyenne de son groupe : $J$ = <b>${f2(J2)}</b> ${J2 < J - 1e-9 ? '(plus petit)' : '(déjà à la moyenne : rien à gagner)'}<br><span class="c-dim">Pour $\\mu$ fixé, affecter chaque point au centre le plus proche minimise $J$ en $r$ ; pour $r$ fixé, la moyenne du groupe minimise $J$ en $\\mu_k$. Les frontières sont des morceaux de médiatrices.</span>`);
      P.request();
    }
    load(); upd();
  });

  // ------------------------------------------------------------------ km-lloyd
  ML.scene('km-lloyd', host => {
    const W = ML.widget(host, {
      title: 'L\'algorithme de Lloyd pas à pas : affectation, mise à jour, et $J$ qui ne remonte jamais (slides 8–10)', tag: '2D',
      views: [{ name: 'p', label: 'données, centres $\\mu_k$ et leurs trajectoires', cls: 'tall', style: 'flex:1 1 56%' }, { name: 'j', label: '$J$ après chaque demi-étape', cls: 'tall', style: 'flex:1 1 38%' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$J$ après une affectation</span><span class="key"><i style="background:#f0ac5f"></i>$J$ après une mise à jour</span><span class="key"><i style="background:#d147bd"></i>médiatrices</span>',
    });
    const st = { kind: 'faithful', k: 2, init: 'prml', seed: 1, X: null, mu: null, r: null, next: 'assign', t: 0, hist: [], trail: [], done: false, moved: 0 };
    W.toggle('vor', 'cellules de Voronoï', false); W.toggle('bis', 'médiatrices', true); W.toggle('trail', 'trajectoires des centres', true);
    const P = new ML.Plot2D(W.views.p, LIM);
    const Jp = new ML.Plot2D(W.views.j, { xlim: [0, 8], ylim: [0, 100], xlabel: '\\text{demi-étapes}' });
    P.onDraw = p => {
      if (W.show.vor) voronoi(p, st.mu);
      if (W.show.bis && st.r) bisectors(p, st.mu);
      if (W.show.trail) st.mu.forEach((_, k) => p.polyline(st.trail.map(m => m[k]), { color: K.COL[k], width: 1.5, alpha: 0.7 }));
      st.X.forEach((x, i) => p.point(x[0], x[1], { color: st.r ? K.COL[st.r[i]] : C.green, r: 3.6, stroke: '#000', strokeWidth: 1 }));
      st.mu.forEach((m, k) => center(p, m, k, 'm', false));
    };
    Jp.onDraw = p => {
      const H = st.hist;
      if (H.length > 1) p.polyline(H.map(h => [h[0], h[1]]), { color: '#aaa', width: 1.5 });
      H.forEach(h => p.point(h[0], h[1], { color: h[2] === 'a' ? C.blue : C.gold, r: 4.5 }));
    };
    const initMu = () => {
      const R = M.rng(st.seed * 131 + st.k);
      if (st.init === 'prml') return [[-2.3, 1.9], [2.3, -1.9], [-2.3, -1.9], [2.3, 1.9], [0, 2.4], [0, -2.4]].slice(0, st.k).map(m => m.slice());
      if (st.init === 'pp') return K.initPP(st.X, st.k, R);
      if (st.init === 'corner') return M.range(st.k).map(k => [-3 + 0.35 * k, 2.6 - 0.2 * k]);
      return K.initRandom(st.X, st.k, R);
    };
    const reset = () => { st.X = K.data(st.kind, 3).X; st.mu = initMu(); st.r = null; st.next = 'assign'; st.t = 0; st.hist = []; st.trail = [st.mu.map(m => m.slice())]; st.done = false; st.moved = 0; upd(); };
    const step = () => {
      if (st.done) return false;
      if (st.next === 'assign') {
        const rn = K.assign(st.X, st.mu); st.moved = st.r ? rn.filter((v, i) => v !== st.r[i]).length : st.X.length;
        if (st.r && st.moved === 0) { st.done = true; upd(); return false; }
        st.r = rn; st.t++; st.next = 'update'; st.hist.push([st.hist.length + 1, K.J(st.X, st.r, st.mu), 'a']);
      } else {
        st.mu = K.means(st.X, st.r, st.mu); st.trail.push(st.mu.map(m => m.slice())); st.next = 'assign'; st.hist.push([st.hist.length + 1, K.J(st.X, st.r, st.mu), 'u']);
      }
      upd(); return true;
    };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: K.DATA, onChange: v => { st.kind = v; reset(); } });
    ui.slider(c, { label: 'nombre de groupes $K$', min: 2, max: 6, step: 1, value: 2, digits: 0, onInput: v => { const k = Math.round(v); if (k !== st.k) { st.k = k; reset(); } } });
    ui.select(c, { label: 'initialisation', value: st.init, options: [['prml', 'coins opposés (comme PRML fig. 9.1)'], ['rand', 'K points des données au hasard'], ['pp', 'k-means++'], ['corner', 'tous les centres dans un coin']], onChange: v => { st.init = v; reset(); } });
    ui.player(c, { speed: 1.5, step, reset: () => { st.seed++; reset(); } });
    const ro = ui.readout(c);
    function upd() {
      const H = st.hist, top = H.length ? Math.max(...H.map(h => h[1])) : 10;
      Jp.setLimits([0, Math.max(8, H.length + 1)], [0, top * 1.12]);
      const J = st.r ? K.J(st.X, st.r, st.mu) : null;
      const nxt = st.done ? '<b class="c-green">convergé</b> : la dernière affectation n\'a changé aucun point, plus rien ne bouge.' : st.next === 'assign' ? 'prochaine étape : <b>affectation</b> ($\\mu$ fixé, on choisit $r$)' : 'prochaine étape : <b>mise à jour</b> ($r$ fixé, on choisit $\\mu$)';
      const mono = H.length > 1 ? `<br>Suite de $J$ : ${H.slice(-6).map(h => `<span style="color:${h[2] === 'a' ? C.blue : C.gold}">${f2(h[1])}</span>`).join(' ≥ ')}` : '';
      ro.set(`Itération ${st.t} · ${nxt}<br>${J == null ? 'Pas encore d\'affectation (points verts).' : `$J$ = <b>${f2(J)}</b> · points réaffectés à la dernière affectation : ${st.moved}`}${mono}<br><span class="c-dim">Chaque demi-étape minimise exactement $J$ par rapport à un bloc de variables : $J$ ne peut que baisser. Il n'y a qu'un nombre fini de partitions, donc l'algorithme s'arrête — mais pas forcément au minimum global (essaie « tous les centres dans un coin » avec $K = 3$ sur 3 groupes).</span>`);
      P.request(); Jp.request();
    }
    reset();
  });

  // ------------------------------------------------------------------ km-init
  ML.scene('km-init', host => {
    const W = ML.widget(host, {
      title: 'Sensibilité à l\'initialisation : 100 lancers de Lloyd, au hasard ou avec k-means++ (slides 10–11)', tag: '2D',
      views: [{ name: 'p', label: 'un lancer : centres initiaux ○ et solution finale ✕', cls: 'tall', style: 'flex:1 1 56%' }, { name: 'h', label: 'histogramme du $J$ final (100 lancers)', cls: 'tall', style: 'flex:1 1 38%' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>initialisation au hasard (K points des données)</span><span class="key"><i style="background:#83c167"></i>k-means++</span><span class="key"><i style="background:#f4d345"></i>lancer affiché</span>',
    });
    const st = { kind: 'blobs5', k: 5, seed: 1, X: null, runs: null, meth: 'rand', idx: 99 };
    W.toggle('init', 'centres initiaux', true); W.toggle('vor', 'cellules de Voronoï', true);
    const P = new ML.Plot2D(W.views.p, LIM);
    const Hp = new ML.Plot2D(W.views.h, { xlim: [0, 1], ylim: [0, 100], xlabel: 'J' });
    const runAll = () => {
      st.X = K.data(st.kind, 5).X; st.runs = {};
      for (const m of ['rand', 'pp']) {
        const R = M.rng(st.seed * 977 + (m === 'pp' ? 1 : 0));
        st.runs[m] = M.range(100).map(() => { const mu0 = m === 'pp' ? K.initPP(st.X, st.k, R) : K.initRandom(st.X, st.k, R); return Object.assign(K.lloyd(st.X, mu0), { mu0 }); }).sort((a, b) => a.J - b.J);
      }
    };
    P.onDraw = p => {
      const run = st.runs[st.meth][st.idx];
      if (W.show.vor) voronoi(p, run.mu, 0.2);
      st.X.forEach((x, i) => p.point(x[0], x[1], { color: K.COL[run.r[i]], r: 3.4, stroke: '#000', strokeWidth: 1 }));
      if (W.show.init) run.mu0.forEach((m, k) => { p.point(m[0], m[1], { color: K.COL[k], r: 7, hollow: true, width: 2.2 }); p.arrow(m[0], m[1], run.mu[k][0], run.mu[k][1], { color: K.COL[k], width: 1, dash: [3, 3], head: 7, alpha: 0.7 }); });
      run.mu.forEach((m, k) => center(p, m, k, 'm', false));
    };
    const bins = () => {
      const all = st.runs.rand.concat(st.runs.pp).map(r => r.J), lo = Math.min(...all), hi = Math.max(...all), w = Math.max((hi - lo) / 16, lo * 0.004 + 1e-6);
      return { lo: lo - w / 2, w, n: Math.ceil((hi - lo) / w) + 1 };
    };
    Hp.onDraw = p => {
      const b = bins();
      ['rand', 'pp'].forEach((m, s) => {
        const cnt = new Array(b.n).fill(0); st.runs[m].forEach(r => { cnt[Math.min(b.n - 1, Math.floor((r.J - b.lo) / b.w))]++; });
        cnt.forEach((v, i) => { if (v) { const x0 = b.lo + i * b.w + (s ? b.w / 2 : 0); p.rect(x0, 0, x0 + b.w / 2, v, { color: s ? C.green : C.blue, fill: s ? C.green : C.blue, fillAlpha: 0.65, width: 1 }); } });
      });
      const J = st.runs[st.meth][st.idx].J; p.vline(J, { color: C.yellow, width: 2 });
    };
    const c = W.controls;
    ui.select(c, { label: 'données', value: st.kind, options: K.DATA, onChange: v => { st.kind = v; st.k = K.data(v).K; sK.set(st.k); runAll(); upd(); } });
    const sK = ui.slider(c, { label: 'nombre de groupes $K$', min: 2, max: 8, step: 1, value: st.k, digits: 0, onInput: v => { const k = Math.round(v); if (k !== st.k) { st.k = k; runAll(); upd(); } } });
    ui.select(c, { label: 'lancer affiché', value: st.meth, options: [['rand', 'initialisation au hasard'], ['pp', 'k-means++']], onChange: v => { st.meth = v; upd(); } });
    ui.slider(c, { label: 'rang du lancer (1 = meilleur $J$, 100 = pire)', min: 1, max: 100, step: 1, value: 100, digits: 0, onInput: v => { st.idx = Math.round(v) - 1; upd(); } });
    ui.buttons(c, [{ label: '🎲 100 nouveaux lancers', primary: true, onClick: () => { st.seed++; runAll(); upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      const b = bins(), best = Math.min(st.runs.rand[0].J, st.runs.pp[0].J);
      let ymax = 1; ['rand', 'pp'].forEach(m => { const cnt = new Array(b.n).fill(0); st.runs[m].forEach(r => { cnt[Math.min(b.n - 1, Math.floor((r.J - b.lo) / b.w))]++; }); ymax = Math.max(ymax, ...cnt); });
      Hp.setLimits([b.lo - b.w, b.lo + (b.n + 1) * b.w], [0, ymax * 1.15]);
      const good = m => st.runs[m].filter(r => r.J <= best * 1.01).length, meanIt = m => f1(M.mean(st.runs[m].map(r => r.it)));
      const run = st.runs[st.meth][st.idx];
      ro.set(`Lancer affiché : $J$ = <b>${f2(run.J)}</b> après ${run.it} itérations<br>Meilleur $J$ trouvé : ${f2(best)} · pire : au hasard ${f2(st.runs.rand[99].J)}, k-means++ ${f2(st.runs.pp[99].J)}<br>Lancers à moins de 1 % du meilleur : <span class="c-blue">au hasard ${good('rand')} / 100</span>, <span class="c-green">k-means++ ${good('pp')} / 100</span> · itérations moyennes : ${meanIt('rand')} et ${meanIt('pp')}<br><span class="c-dim">Chaque lancer converge (vers un point où aucune demi-étape ne fait baisser $J$), mais pas au même endroit. En pratique, on lance plusieurs fois et on garde le plus petit $J$.</span>`);
      P.request(); Hp.request();
    }
    runAll(); upd();
  });

  // ------------------------------------------------------------------ km-img
  ML.scene('km-img', host => {
    const W = ML.widget(host, {
      title: 'Une donnée = la couleur RGB d\'un pixel : quantifier une image avec $K$ couleurs (slide 12)', tag: '2D',
      views: [{ name: 'o', label: 'image d\'origine (couleurs sur 24 bits)', cls: 'short', style: 'flex:1 1 45%' }, { name: 'q', label: 'chaque pixel remplacé par son centre $\\mu_{k(i)}$', cls: 'short', style: 'flex:1 1 45%' },
        { name: 'c', label: 'les pixels dans le plan (rouge, vert) et les $K$ centres (carrés)', cls: 'tall', style: 'flex:1 1 100%;height:300px' }],
      controls: true,
    });
    const IW = 120, IH = 80, R0 = M.rng(4);
    // image procédurale : coucher de soleil sur la mer
    const PX = [];
    for (let j = 0; j < IH; j++) for (let i = 0; i < IW; i++) {
      const u = i / IW, v = j / IH, mix = (a, b, t) => a.map((q, k) => q + (b[k] - q) * t);
      let c = mix([0.16, 0.1, 0.34], [0.98, 0.56, 0.25], Math.pow(v / 0.56, 1.4));
      const ds = Math.hypot(u - 0.68, (v - 0.4) * 1.1);
      if (ds < 0.085) c = [1, 0.9, 0.5]; else if (ds < 0.2) c = mix(c, [1, 0.75, 0.4], 0.5 * (1 - (ds - 0.085) / 0.115));
      const h2 = 0.45 + 0.05 * Math.sin(9 * u + 2) + 0.03 * Math.sin(23 * u), h1 = 0.5 + 0.06 * Math.sin(5 * u + 0.4) + 0.025 * Math.sin(19 * u + 1);
      if (v > h2 && v < 0.56) c = [0.5, 0.3, 0.42];
      if (v > h1 && v < 0.56) c = [0.2, 0.14, 0.27];
      if (v >= 0.56) {
        c = mix([0.14, 0.22, 0.42], [0.03, 0.07, 0.16], (v - 0.56) / 0.44);
        const ref = Math.exp(-(((u - 0.68) / (0.04 + 0.12 * (v - 0.56))) ** 2)) * (0.5 + 0.5 * Math.sin(140 * v));
        c = mix(c, [1, 0.72, 0.38], 0.85 * ref);
      }
      PX.push(c.map(q => M.clamp(q + 0.025 * R0.n(), 0, 1)));
    }
    const st = { k: 6, init: 'pp', mu: null, r: null, it: 0 };
    const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    const run = () => {
      const R = M.rng(st.k * 31 + (st.init === 'pp' ? 7 : 0));
      let mu;
      if (st.init === 'pp') { mu = [PX[Math.floor(R.u() * PX.length)].slice()]; while (mu.length < st.k) { const D = PX.map(x => Math.min(...mu.map(m => dist(x, m)))), tot = M.sum(D); let u = R.u() * tot, i = 0; while (i < PX.length - 1 && u > D[i]) { u -= D[i]; i++; } mu.push(PX[i].slice()); } }
      else mu = R.shuffle(M.range(PX.length)).slice(0, st.k).map(i => PX[i].slice());
      let r = null, it = 0;
      for (; it < 60; it++) {
        const rn = PX.map(x => { let b = 0, bd = Infinity; mu.forEach((m, k) => { const d = dist(x, m); if (d < bd) { bd = d; b = k; } }); return b; });
        if (r && rn.every((v, i) => v === r[i])) break;
        r = rn; mu = mu.map((m, k) => { const s = [0, 0, 0]; let n = 0; PX.forEach((x, i) => { if (r[i] === k) { s[0] += x[0]; s[1] += x[1]; s[2] += x[2]; n++; } }); return n ? s.map(q => q / n) : m; });
      }
      Object.assign(st, { mu, r, it });
    };
    const imgOpt = { xlim: [0, IW], ylim: [0, IH], equal: true, grid: false, axes: false, pad: [4, 4, 4, 4] };
    const O = new ML.Plot2D(W.views.o, imgOpt), Q = new ML.Plot2D(W.views.q, imgOpt);
    const Cp = new ML.Plot2D(W.views.c, { xlim: [0, 1.02], ylim: [0, 1.02], gridStep: [0.25, 0.25], xlabel: 'R' });
    const pix = (x, y) => { const i = Math.floor(x), j = IH - 1 - Math.floor(y); return i >= 0 && i < IW && j >= 0 && j < IH ? j * IW + i : -1; };
    O.onDraw = p => p.heatmapRGB((x, y) => { const k = pix(x, y); return k < 0 ? [0, 0, 0] : PX[k].map(q => 255 * q); }, { res: 2 });
    Q.onDraw = p => p.heatmapRGB((x, y) => { const k = pix(x, y); return k < 0 ? [0, 0, 0] : st.mu[st.r[k]].map(q => 255 * q); }, { res: 2 });
    const sub = M.range(PX.length).filter(i => i % 5 === 0);
    Cp.onDraw = p => {
      sub.forEach(i => p.point(PX[i][0], PX[i][1], { color: `rgb(${PX[i].map(q => Math.round(255 * q)).join(',')})`, r: 2.2 }));
      st.mu.forEach(m => { const col = `rgb(${m.map(q => Math.round(255 * q)).join(',')})`; p.point(m[0], m[1], { shape: 'square', color: col, r: 8, stroke: '#fff', strokeWidth: 2 }); });
      p.tex('g', 0.02, 0.97, '\\text{vert}', { color: '#aaa', anchor: 'left', size: 12 });
    };
    const c = W.controls;
    ui.slider(c, { label: 'nombre de couleurs $K$', min: 2, max: 16, step: 1, value: st.k, digits: 0, onInput: v => { const k = Math.round(v); if (k !== st.k) { st.k = k; run(); upd(); } } });
    ui.select(c, { label: 'initialisation', value: st.init, options: [['pp', 'k-means++'], ['rand', 'K pixels au hasard']], onChange: v => { st.init = v; run(); upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const J = M.sum(PX.map((x, i) => dist(x, st.mu[st.r[i]]))), N = PX.length, b = Math.ceil(Math.log2(st.k));
      const bits = N * b + 24 * st.k;
      ro.set(`$N = ${N}$ pixels, $D = 3$ (rouge, vert, bleu dans $[0,1]$) · Lloyd : ${st.it < 60 ? st.it + ' itérations (convergé)' : '60 itérations (arrêté avant convergence)'}<br>$J/N$ = <b>${J / N < 0.001 ? (J / N).toExponential(2) : (J / N).toFixed(4)}</b> (erreur quadratique moyenne par pixel)<br>Stockage : ${b} bit${b > 1 ? 's' : ''} par pixel + une palette de ${st.k} couleurs, soit ${bits} bits au lieu de $24N = ${24 * N}$ (÷${(24 * N / bits).toFixed(1)})<br><span class="c-dim">Le k-means ne connaît ni la position des pixels ni la forme des objets : il groupe des points de $\\R^3$. Il place ses couleurs là où il y a beaucoup de pixels (ciel, mer) : avec $K = 2$ ou $3$, le soleil, petit, n'a pas de couleur à lui.</span>`);
      O.request(); Q.request(); Cp.request();
    }
    run(); upd();
  });
})(window.ML);
