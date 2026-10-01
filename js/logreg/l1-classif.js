/* Chapitre 2 — Régression logistique · §1–3 : classification, moindres carrés, sigmoïde, pertes */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  // couleurs de classes : bleu = classe 1 / +1, rouge = classe 0 / −1
  const probRgb = p => { const a = M.hexToRgb(C.red), b = M.hexToRgb(C.blue); return a.map((v, i) => (v + (b[i] - v) * p) * 0.42); };
  ML.probRgb = probRgb;

  // ------------------------------------------------------------------ lg-bayes
  ML.scene('lg-bayes', host => {
    const W = ML.widget(host, {
      title: 'Deux classes gaussiennes : le posterior est une sigmoïde d\'une fonction linéaire', tag: '2D + 3D',
      views: [{ name: 'p', label: 'posterior $P(y=1\\mid\\bx)$ et échantillons', cls: 'tall', hint: 'glisser les moyennes $\\bmu_0,\\bmu_1$' }, { name: 's3', label: 'surfaces', cls: 'tall', hint: 'glisser : tourner' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#58c4dd"></i>classe 1</span><span class="key"><i class="dot" style="background:#fc6255"></i>classe 0</span><span class="key"><i style="background:#fff"></i>frontière $P(y=1|\\bx)=\\frac12$</span><span class="key"><i style="background:#f4d345"></i>$\\bw=\\bSigma^{-1}(\\bmu_1-\\bmu_0)$</span>',
    });
    const st = { mu1: [1.1, 0.8], mu0: [-1.0, -0.6], pi1: 0.5, sx: 1.0, sy: 0.7, rho: 0.3, shared: true, view: 'post' };
    const R = M.rng(4), Z = M.range(160).map(() => [R.n(), R.n(), R.u()]);
    const S0 = () => [[st.sx ** 2, st.rho * st.sx * st.sy], [st.rho * st.sx * st.sy, st.sy ** 2]];
    const S1 = () => st.shared ? S0() : [[0.35, -0.15], [-0.15, 1.4]];
    const post = (x, y) => { const a = st.pi1 * M.gauss2(x, y, st.mu1, S1()), b = (1 - st.pi1) * M.gauss2(x, y, st.mu0, S0()); return a / (a + b + 1e-300); };
    const P = new ML.Plot2D(W.views.p, { xlim: [-3.5, 3.5], ylim: [-3, 3], equal: true, xlabel: 'x_1', ylabel: 'x_2' });
    P.addDraggable({ get: () => st.mu1, set: (x, y) => { st.mu1 = [x, y]; upd(); }, r: 14 });
    P.addDraggable({ get: () => st.mu0, set: (x, y) => { st.mu0 = [x, y]; upd(); }, r: 14 });
    P.onDraw = p => {
      p.heatmap(post, probRgb, { res: 3 });
      p.contour(post, [0.1, 0.25, 0.75, 0.9], { color: '#fff', width: 1, alpha: 0.25 });
      p.contour(post, [0.5], { color: '#fff', width: 2.5 });
      const L1 = M.chol2(S1()), L0 = M.chol2(S0());
      Z.forEach(([a, b, u], i) => {
        const c1 = u < st.pi1, mu = c1 ? st.mu1 : st.mu0, L = c1 ? L1 : L0;
        p.point(mu[0] + L[0][0] * a, mu[1] + L[1][0] * a + L[1][1] * b, { color: c1 ? C.blue : C.red, r: 2.6, alpha: 0.9 });
        void i;
      });
      [[st.mu1, S1(), C.blue], [st.mu0, S0(), C.red]].forEach(([mu, S, col]) => { const Si = M.inv(S); [1, 4].forEach(l => p.ellipse(mu[0], mu[1], Si, l, { color: col, width: 1.5, alpha: 0.8 })); });
      if (st.shared) { const w = M.matvec(M.inv(S0()), M.sub(st.mu1, st.mu0)), m = M.scale(M.add(st.mu1, st.mu0), 0.5), k = 0.6 / Math.max(0.3, M.norm(w)); p.arrow(m[0], m[1], m[0] + w[0] * k, m[1] + w[1] * k, { color: C.yellow, width: 3 }); }
      p.point(st.mu1[0], st.mu1[1], { color: C.blue, r: 7, glow: true, stroke: '#000' }); p.point(st.mu0[0], st.mu0[1], { color: C.red, r: 7, glow: true, stroke: '#000' });
      p.tex('m1', st.mu1[0], st.mu1[1], '\\bmu_1', { dx: 14, dy: -12, anchor: 'left', color: C.blue }); p.tex('m0', st.mu0[0], st.mu0[1], '\\bmu_0', { dx: 14, dy: -12, anchor: 'left', color: C.red });
    };
    const S = new ML.Scene3D(W.views.s3, { range: { x: [-3.5, 3.5], y: [-3, 3], z: [0, 1] }, size: [2.4, 2.1, 1.2], labels: { x: 'x_1', y: 'x_2', z: '' }, theta: -1.0, phi: 1.05, radius: 5.6 });
    function build3d() {
      S.clear('s');
      if (st.view === 'post') {
        S.surface('s', post, { res: 64, opacity: 0.85, color: z => M.rgbToHex(probRgb(z).map(v => v / 0.42 * 0.9)), wireOpacity: 0.12 });
        const pts = []; for (let i = 0; i <= 120; i++) { const x = -3.5 + 7 * i / 120; let lo = -3, hi = 3; if ((post(x, lo) - 0.5) * (post(x, hi) - 0.5) > 0) { pts.push(null); continue; } for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; (post(x, lo) - 0.5) * (post(x, m) - 0.5) <= 0 ? hi = m : lo = m; } pts.push([x, (lo + hi) / 2, 0.5]); }
        let seg = []; pts.concat([null]).forEach(q => { if (q) seg.push(q); else { if (seg.length > 1) S.curve('s', seg, { color: '#ffffff', radius: 0.01 }); seg = []; } });
        S.label('lab', [3.4, 3, 1], 'P(y=1\\mid\\bx)=\\sigma(a(\\bx))', { color: '#ddd', size: 13 });
      } else {
        const sc = 1 / Math.max(st.pi1 * M.gauss2(...st.mu1, st.mu1, S1()), (1 - st.pi1) * M.gauss2(...st.mu0, st.mu0, S0()));
        S.surface('s', (x, y) => sc * st.pi1 * M.gauss2(x, y, st.mu1, S1()), { res: 60, color: C.blue, opacity: 0.55, wireOpacity: 0.1 });
        S.surface('s', (x, y) => sc * (1 - st.pi1) * M.gauss2(x, y, st.mu0, S0()), { res: 60, color: C.red, opacity: 0.55, wireOpacity: 0.1 });
        S.label('lab', [3.4, 3, 1], '\\pi_k\\,\\N(\\bx\\mid\\bmu_k,\\bSigma_k)\\ \\text{(normalisé)}', { color: '#ddd', size: 13 });
      }
    }
    const c = W.controls;
    ui.select(c, { label: 'surface 3D', options: [['post', 'posterior P(y=1|x)'], ['dens', 'densités des classes π_k N(x|μ_k,Σ)']], value: 'post', onChange: v => { st.view = v; build3d(); } });
    ui.slider(c, { label: 'prior $\\pi_1 = P(y=1)$', min: 0.05, max: 0.95, step: 0.01, value: st.pi1, onInput: v => { st.pi1 = v; upd(); } });
    ui.check(c, { label: 'covariance partagée $\\bSigma_0=\\bSigma_1$', value: true, onChange: v => { st.shared = v; upd(); } });
    ui.slider(c, { label: '$\\sigma_1$ (axe $x_1$)', min: 0.3, max: 1.8, step: 0.01, value: st.sx, onInput: v => { st.sx = v; upd(); } });
    ui.slider(c, { label: '$\\sigma_2$ (axe $x_2$)', min: 0.3, max: 1.8, step: 0.01, value: st.sy, onInput: v => { st.sy = v; upd(); } });
    ui.slider(c, { label: 'corrélation $\\rho$', min: -0.85, max: 0.85, step: 0.01, value: st.rho, onInput: v => { st.rho = v; upd(); } });
    const ro = ui.readout(c);
    ui.note(c, 'Décoche « covariance partagée » : les termes quadratiques ne s\'annulent plus, la frontière devient une conique — la régression logistique linéaire ne peut plus représenter exactement le posterior.');
    function upd() {
      if (st.shared) {
        const Si = M.inv(S0()), w = M.matvec(Si, M.sub(st.mu1, st.mu0)), b = -0.5 * M.dot(st.mu1, M.matvec(Si, st.mu1)) + 0.5 * M.dot(st.mu0, M.matvec(Si, st.mu0)) + Math.log(st.pi1 / (1 - st.pi1));
        ro.set(`$a(\\bx) = \\bw\\T\\bx + b$ avec<br>$\\bw$ = (<b>${M.fmt(w[0], 2)}</b>, <b>${M.fmt(w[1], 2)}</b>) · $b$ = <b>${M.fmt(b, 2)}</b><br><span class="k">le $\\ln\\frac{\\pi_1}{\\pi_0}$ du prior ne fait que translater la frontière</span>`);
      } else ro.set('covariances différentes : $a(\\bx)$ est <b>quadratique</b> en $\\bx$');
      P.request(); build3d();
    }
    upd();
  });

  // ------------------------------------------------------------------ lg-lsclass
  ML.scene('lg-lsclass', host => {
    const W = ML.widget(host, {
      title: 'Moindres carrés vs logistique pour classer : l\'effet des points « trop corrects »', tag: '2D',
      views: [{ name: 'p', label: 'données ($y=+1$ bleu, $y=-1$ rouge)', cls: 'tall', hint: 'glisser les points · clic : ajouter (Maj : rouge)' }, { name: 'm', label: 'perte carrée $(1-m_n)^2$ de chaque point sous le modèle LS', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>frontière moindres carrés $\\bw_{\\text{LS}}\\T\\tilde\\bx=0$</span><span class="key"><i style="background:#f4d345"></i>frontière logistique</span>',
    });
    const R = M.rng(12);
    const base = () => { const pts = []; for (let i = 0; i < 12; i++) pts.push([R.normal(-1.2, 0.55), R.normal(0.9, 0.55), -1]); for (let i = 0; i < 12; i++) pts.push([R.normal(0.9, 0.55), R.normal(-0.6, 0.55), 1]); return pts; };
    let pts = base();
    const fits = () => {
      const X = pts.map(p => [p[0], p[1], 1]), y = pts.map(p => p[2]);
      return { ls: M.lstsq(X, y), lg: M.logi.fit(X, y.map(v => (v + 1) / 2), 1e-3) };
    };
    let F = fits();
    const P = new ML.Plot2D(W.views.p, { xlim: [-4, 8], ylim: [-5, 3.5], equal: true });
    const addH = i => P.addDraggable({ enabled: () => !!pts[i], get: () => pts[i], set: (x, y) => { pts[i] = [x, y, pts[i][2]]; upd(); }, r: 10 });
    pts.forEach((_, i) => addH(i));
    P.onClick = (x, y, e) => { pts.push([x, y, e.shiftKey ? -1 : 1]); addH(pts.length - 1); upd(); };
    const line = (w, p, col, dash) => { if (Math.abs(w[1]) > 1e-9) p.fn(x => -(w[0] * x + w[2]) / w[1], { color: col, width: 3, dash }); else p.vline(-w[2] / w[0], { color: col, width: 3 }); };
    P.onDraw = p => {
      const w = F.lg; p.heatmap((x, y) => M.sigmoid(w[0] * x + w[1] * y + w[2]), probRgb, { res: 4 });
      line(F.ls, p, C.blue); line(F.lg, p, C.yellow);
      pts.forEach(([x, y, c]) => p.point(x, y, { color: c > 0 ? C.blue : C.red, r: 5, stroke: '#000' }));
    };
    const Mp = new ML.Plot2D(W.views.m, { xlim: [-2, 7], ylim: [-1, 20], xlabel: 'm = y f(\\bx)' });
    Mp.onDraw = p => {
      p.fn(m => (1 - m) ** 2, { color: C.blue, width: 2.5 });
      p.fn(m => Math.log1p(Math.exp(-m)) / Math.LN2, { color: C.yellow, width: 2, dash: [5, 4] });
      p.vline(1, { color: '#fff', width: 1, alpha: 0.3, dash: [4, 4] });
      pts.forEach(([x, y, c]) => { const m = c * (F.ls[0] * x + F.ls[1] * y + F.ls[2]); p.point(m, (1 - m) ** 2, { color: c > 0 ? C.blue : C.red, r: 5, stroke: '#000' }); });
      p.tex('lab', 6.8, 18, 'm>1 : \\text{pénalisé alors que bien classé !}', { anchor: 'right', color: '#bbb', size: 13 });
    };
    const c = W.controls;
    ui.buttons(c, [
      { label: '+ points très corrects', primary: true, onClick: () => { for (let i = 0; i < 10; i++) { pts.push([R.normal(5.5, 0.5), R.normal(-3.6, 0.5), 1]); addH(pts.length - 1); } upd(); } },
      { label: '↺ reset', onClick: () => { pts = base(); P.draggables = []; pts.forEach((_, i) => addH(i)); upd(); } },
    ]);
    const ro = ui.readout(c);
    ui.note(c, 'À droite : chaque point placé sur la parabole $(1-m)^2$ selon sa marge sous le modèle LS. Les nouveaux points (loin, du bon côté) ont une perte énorme, alors qu\'ils sont parfaitement classés. La logistique (pointillés jaunes, $\\ln(1+e^{-m})/\\ln2$) ne les pénalise presque pas.');
    function upd() {
      F = fits();
      const err = w => pts.filter(([x, y, c]) => c * (w[0] * x + w[1] * y + w[2]) <= 0).length;
      ro.set(`erreurs de classification :<br>moindres carrés : <b>${err(F.ls)}</b> / ${pts.length}<br>logistique : <b>${err(F.lg)}</b> / ${pts.length}`);
      P.request(); Mp.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ lg-sigmoid
  ML.scene('lg-sigmoid', host => {
    const W = ML.widget(host, {
      title: 'La sigmoïde $\\sigma(t)=1/(1+e^{-t})$ : symétrie, dérivée, logit', tag: '2D',
      views: [{ name: 'p', label: '$\\sigma(at)$ et $\\sigma\'(t)$', cls: 'tall', hint: 'glisser le point jaune' }, { name: 'l', label: 'logit $\\sigma^{-1}(p)=\\ln\\frac{p}{1-p}$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\sigma(at)$</span><span class="key"><i style="background:#58c4dd"></i>$\\sigma\'(t)=\\sigma(t)(1-\\sigma(t))$</span><span class="key"><i style="background:#d147bd"></i>symétrie centrale autour de $(0,\\frac12)$</span><span class="key"><i style="background:#83c167"></i>tangente</span>',
    });
    const st = { t: 1.5, a: 1 };
    const P = new ML.Plot2D(W.views.p, { xlim: [-7, 7], ylim: [-0.15, 1.15], xlabel: 't' });
    P.addDraggable({ get: () => [st.t, M.sigmoid(st.a * st.t)], set: x => { st.t = M.clamp(x, -6.8, 6.8); upd(); }, r: 14, cursor: 'ew-resize' });
    P.onDraw = p => {
      p.hline(1, { color: '#fff', width: 1, alpha: 0.25, dash: [4, 4] }); p.hline(0.5, { color: '#fff', width: 1, alpha: 0.15, dash: [2, 5] });
      p.fn(t => M.sigmoid(t) * (1 - M.sigmoid(t)), { color: C.blue, width: 2 });
      p.fn(t => M.sigmoid(st.a * t), { color: C.yellow, width: 3.2 });
      const t = st.t, s = M.sigmoid(st.a * t), ms = M.sigmoid(-st.a * t), sl = st.a * s * (1 - s);
      p.fn(u => s + sl * (u - t), { color: C.green, width: 1.5 }, [t - 2, t + 2]);
      p.seg(t, s, -t, ms, { color: C.pink, width: 1.5, dash: [5, 4] });
      p.point(0, 0.5, { color: C.pink, r: 4 });
      p.seg(t, 0, t, s, { color: C.yellow, width: 1, alpha: 0.5 }); p.seg(-t, 0, -t, ms, { color: C.pink, width: 1, alpha: 0.5 });
      p.seg(-t, ms, -t, 1, { color: C.pink, width: 3, alpha: 0.6 }); p.seg(t, 0, t, s, { color: C.yellow, width: 3, alpha: 0.35 });
      p.point(-t, ms, { color: C.pink, r: 5 }); p.point(t, s, { color: C.yellow, r: 7, glow: true, stroke: '#000' });
      p.point(t, st.a === 1 ? s * (1 - s) : M.sigmoid(t) * (1 - M.sigmoid(t)), { color: C.blue, r: 4 });
    };
    const L = new ML.Plot2D(W.views.l, { xlim: [-0.05, 1.05], ylim: [-6, 6], xlabel: 'p' });
    L.onDraw = p => {
      p.fn(q => Math.log(q / (1 - q)), { color: C.purple, width: 3, samples: 600 }, [0.0025, 0.9975]);
      const s = M.sigmoid(st.a * st.t);
      p.point(s, st.a * st.t, { color: C.yellow, r: 6, stroke: '#000' });
      p.seg(s, 0, s, st.a * st.t, { color: C.yellow, width: 1, dash: [3, 3] });
      p.tex('odds', 0.03, 5.2, `\\text{cote } \\tfrac{p}{1-p} = ${M.fmt(s / (1 - s), 2)}`, { anchor: 'left', color: '#ccc', size: 13 });
    };
    const c = W.controls;
    ui.slider(c, { label: 'score $t$', min: -6.8, max: 6.8, step: 0.01, value: st.t, onInput: v => { st.t = v; upd(); } });
    ui.slider(c, { label: 'raideur $a$ (≈ $\\|\\bw\\|$)', min: 0.2, max: 6, step: 0.01, value: st.a, onInput: v => { st.a = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      const s = M.sigmoid(st.a * st.t);
      ro.set(`$\\sigma(at)$ = <b>${M.fmt(s, 4)}</b><br>$\\sigma(-at)$ = <b>${M.fmt(1 - s, 4)}</b> $= 1-\\sigma(at)$ ✓<br>pente $\\frac{d}{dt}\\sigma(at) = a\\,\\sigma(1-\\sigma)$ = <b>${M.fmt(st.a * s * (1 - s), 4)}</b> (max $a/4$ en 0)<br>logit : $\\ln\\frac{\\sigma}{1-\\sigma}$ = <b>${M.fmt(Math.log(s / (1 - s)), 3)}</b> $= at$`);
      P.request(); L.request();
    }
    ui.note(c, 'Rose : $(t,\\sigma(t))$ et $(-t,\\sigma(-t))$ sont symétriques par rapport au centre $(0,\\frac12)$ ; la barre rose au-dessus de $\\sigma(-t)$ a la même longueur que la barre jaune sous $\\sigma(t)$.');
    upd();
  });

  // ------------------------------------------------------------------ lg-losses
  ML.scene('lg-losses', host => {
    const W = ML.widget(host, {
      title: 'Pertes en fonction de la marge $m = yf(\\bx)$ — et leur « force » $-\\partial\\ell/\\partial m$', tag: '2D',
      views: [{ name: 'p', label: 'perte $\\ell(m)$', cls: 'tall', hint: 'glisser $m$' }, { name: 'd', label: 'force $-\\ell\'(m)$ exercée par le point', cls: 'tall' }],
      controls: true,
    });
    const L = {
      zo: { name: '0-1 : $\\mathbb 1(m\\le0)$', col: '#ffffff', f: m => m <= 0 ? 1 : 0, d: () => 0, on: true },
      sq: { name: 'carrée $(1-m)^2$', col: C.blue, f: m => (1 - m) ** 2, d: m => -2 * (1 - m), on: true },
      ce: { name: 'logistique $\\ln(1+e^{-m})$', col: C.yellow, f: m => Math.log1p(Math.exp(-m)), d: m => -M.sigmoid(-m), on: true },
      ce2: { name: 'logistique $/\\ln 2$ (majorant)', col: C.gold, f: m => Math.log1p(Math.exp(-m)) / Math.LN2, d: m => -M.sigmoid(-m) / Math.LN2, on: true, dash: [6, 4] },
      hi: { name: 'hinge $\\max(0,1-m)$ (SVM)', col: C.pink, f: m => Math.max(0, 1 - m), d: m => m < 1 ? -1 : 0, on: false },
      ex: { name: 'exponentielle $e^{-m}$ (AdaBoost, hors cours)', col: C.purple, f: m => Math.exp(-m), d: m => -Math.exp(-m), on: false },
    };
    const st = { m: 1.8 };
    const P = new ML.Plot2D(W.views.p, { xlim: [-3, 4], ylim: [-0.3, 4.5], xlabel: 'm' });
    const D = new ML.Plot2D(W.views.d, { xlim: [-3, 4], ylim: [-2.5, 3], xlabel: 'm' });
    P.addDraggable({ get: () => [st.m, 0], set: x => { st.m = M.clamp(x, -2.9, 3.9); upd(); }, r: 16, cursor: 'ew-resize' });
    P.onDraw = p => {
      p.vline(0, { color: '#fff', width: 1, alpha: 0.2 });
      for (const k in L) { const l = L[k]; if (!l.on) continue; p.fn(l.f, { color: l.col, width: k === 'zo' ? 2 : 2.6, dash: l.dash, samples: 900 }); p.point(st.m, l.f(st.m), { color: l.col, r: 5, stroke: '#000' }); }
      p.vline(st.m, { color: '#fff', width: 1, alpha: 0.4 }); p.point(st.m, 0, { color: '#fff', r: 7, glow: true });
      p.tex('ok', 2.2, 4.2, '\\text{bien classé}\\ (m>0)', { color: '#aaa', size: 12 }); p.tex('ko', -1.6, 4.2, '\\text{mal classé}', { color: '#aaa', size: 12 });
    };
    D.onDraw = p => {
      p.hline(0, { color: '#fff', width: 1, alpha: 0.3 });
      for (const k in L) { const l = L[k]; if (!l.on || k === 'zo') continue; p.fn(m => -l.d(m), { color: l.col, width: 2.4, dash: l.dash, samples: 900 }); const f = -l.d(st.m); p.arrow(st.m, 0, st.m, f, { color: l.col, width: 3 }); }
      p.vline(st.m, { color: '#fff', width: 1, alpha: 0.4 });
      p.tex('neg', 3.9, -2.2, '\\text{force} < 0 : \\text{le point repousse la marge vers } m=1', { anchor: 'right', color: C.blue, size: 12 });
    };
    const c = W.controls;
    for (const k in L) ui.check(c, { label: `<span style="color:${L[k].col}">■</span> ${L[k].name}`, value: L[k].on, onChange: v => { L[k].on = v; upd(); } });
    const ro = ui.readout(c);
    function upd() {
      ro.set(Object.values(L).filter(l => l.on).map(l => `<span style="color:${l.col}">■</span> <b>${M.fmt(l.f(st.m), 3)}</b>`).join(' · ') + `<br><span class="k">$m = ${M.fmt(st.m, 2)}$</span>`);
      P.request(); D.request();
    }
    ui.note(c, 'La force de la perte carrée devient <b>négative</b> pour $m>1$ : un point trop bien classé tire la frontière vers lui. Celle de la logistique tend vers 0 mais reste $>0$ ; celle du hinge est exactement 0 dès $m\\ge1$ (seuls les « support vectors » comptent, chapitre 3).');
    upd();
  });
})(window.ML);
