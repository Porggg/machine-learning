/* Chapitre 4 — Sélection de modèle · §1–3 erreur de généralisation, complexité, régularisation */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, S = ML.ms;
  const KEY_TRAIN = '<span class="key"><i class="dot" style="background:#fff"></i>entraînement</span>';
  const KEY_TRUTH = '<span class="key"><i style="background:#83c167"></i>$f^\\star$ (vraie fonction)</span>';

  // ------------------------------------------------------------------ ms-choose
  ML.scene('ms-choose', host => {
    const W = ML.widget(host, {
      title: 'Trois classes $\\mathcal H_1\\subset\\mathcal H_3\\subset\\mathcal H_{12}$, mêmes $N$ points (slide 3)', tag: '2D',
      views: [{ name: 'a', label: 'degré 1', cls: 'short' }, { name: 'b', label: 'degré 3', cls: 'short' }, { name: 'c', label: 'degré 12', cls: 'short' }],
      controls: 'wide',
      foot: KEY_TRAIN + '<span class="key"><i style="background:#f4d345"></i>ERM dans la classe</span>' + KEY_TRUTH + '<span class="key"><i style="background:#fc6255"></i>résidus</span>',
    });
    const degs = [1, 3, 12], st = { seed: 3, N: 24 };
    W.toggle('res', 'résidus $y_i - \\hat f(x_i)$', true);
    W.toggle('truth', 'vraie fonction $f^\\star$', false);
    W.toggle('gen', 'révéler $L(\\hat f)$ (impossible en vrai : $P$ inconnue)', false, () => upd());
    let D, fits;
    const plots = ['a', 'b', 'c'].map((k, j) => {
      const P = new ML.Plot2D(W.views[k], { xlim: [-1.05, 1.05], ylim: [-2.3, 2.3] });
      P.onDraw = p => {
        const f = fits[j];
        if (W.show.res) D.xs.forEach((x, i) => p.seg(x, D.ys[i], x, S.horner(f.w, x), { color: C.red, width: 1.5, alpha: 0.8 }));
        if (W.show.truth) p.fn(S.fstar, { color: C.green, width: 2.5, alpha: 0.9 });
        p.fn(x => S.horner(f.w, x), { color: C.yellow, width: 3, samples: 600 });
        D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#fff', r: 4, stroke: '#000' }));
        p.tex('tr', -1.0, 2.0, `\\hL_S = ${M.fmt(f.tr, 3)}`, { anchor: 'left', color: C.blue, size: 15 });
        if (W.show.gen) p.tex('ge', -1.0, 1.55, `L = ${f.ge > 1e3 ? f.ge.toExponential(1) : M.fmt(f.ge, 3)}`, { anchor: 'left', color: C.red, size: 15 });
        else p.tex('ge', -1.0, 1.55, 'L = \\;?', { anchor: 'left', color: '#666', size: 15 });
      };
      return P;
    });
    const c = W.controls;
    ui.buttons(c, [{ label: '🎲 nouveau tirage de $S$', onClick: () => { st.seed++; regen(); } }]);
    ui.slider(c, { label: 'taille $N$', min: 8, max: 200, step: 1, value: st.N, fmt: v => v.toFixed(0), onInput: v => { st.N = v; regen(); } });
    const ro = ui.readout(c);
    function regen() {
      D = S.sample(st.N, st.seed);
      fits = degs.map(d => { const w = S.fit(D.xs, D.ys, d); return { w, tr: S.mse(w, D.xs, D.ys), ge: S.genErr(w) }; });
      upd();
    }
    function upd() {
      const best = S.argmin(fits.map(f => f.tr));
      ro.set(`Erreur d'entraînement minimale : <b>degré ${degs[best]}</b> (toujours le plus grand : classes emboîtées).` +
        (W.show.gen ? `<br>Erreur de généralisation minimale : <b>degré ${degs[S.argmin(fits.map(f => f.ge))]}</b>.` : '<br>Coche « révéler $L$ » dans ◉ Affichage pour voir quel modèle prédit vraiment le mieux.'));
      plots.forEach(P => P.request());
    }
    regen();
  });

  // ------------------------------------------------------------------ ms-optimism
  ML.scene('ms-optimism', host => {
    const R = 300;
    const W = ML.widget(host, {
      title: `Erreur d'entraînement vs généralisation sur ${R} tirages de $S$`, tag: '2D',
      views: [{ name: 'a', label: 'prédicteur <b>appris</b> $\\hat f = A(S)$ (ERM degré $d$)', cls: 'tall' }, { name: 'b', label: 'prédicteur <b>fixé</b> $f$, choisi avant de voir $S$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>$\\hL_S$ (erreur sur $S$)</span><span class="key"><i style="background:#fc6255"></i>$L$ (généralisation, exacte)</span><span class="key"><i style="background:#888"></i>bruit $\\sigma^2$ (erreur minimale possible)</span><span class="key">tirets = moyennes sur les tirages</span>',
    });
    const st = { d: 5, N: 24, off: 0 };
    W.toggle('hist', 'histogrammes', true);
    W.toggle('means', 'moyennes (tirets)', true);
    W.toggle('noise', 'niveau de bruit $\\sigma^2$', true);
    let res, xmax, NB = 30;
    const A = new ML.Plot2D(W.views.a, { xlim: [0, 1], ylim: [0, 0.3], xlabel: '\\text{erreur}' });
    const B = new ML.Plot2D(W.views.b, { xlim: [0, 1], ylim: [0, 0.3], xlabel: '\\text{erreur}' });
    const meanLine = (p, v, color, key, label, ytop) => {
      const x = Math.min(v, xmax * 0.995);
      p.vline(x, { color, width: 2.2, dash: [7, 5] });
      p.tex(key, x, ytop, label + (v > xmax ? ' \\to ' + (v > 1e3 ? v.toExponential(1) : M.fmt(v, 3)) : ''), { anchor: v > xmax * 0.7 ? 'right' : 'left', dx: v > xmax * 0.7 ? -6 : 6, color, size: 14 });
    };
    A.onDraw = p => {
      if (W.show.noise) p.vline(S.SIG ** 2, { color: C.grey, width: 1.2, dash: [3, 4] });
      if (W.show.hist) { S.drawHist(p, res.hTr, 0, xmax, { color: C.blue }); S.drawHist(p, res.hGe, 0, xmax, { color: C.red }); }
      if (W.show.means) { const yt = A.ylim[1]; meanLine(p, res.mTr, C.blue, 'mt', '\\E[\\hL_S(\\hat f)]', yt * 0.9); meanLine(p, res.mGe, C.red, 'mg', '\\E[L(\\hat f)]', yt * 0.78); }
    };
    B.onDraw = p => {
      if (W.show.noise) p.vline(S.SIG ** 2, { color: C.grey, width: 1.2, dash: [3, 4] });
      if (W.show.hist) S.drawHist(p, res.hFx, 0, xmax, { color: C.blue });
      const yt = B.ylim[1];
      p.vline(Math.min(res.L0, xmax), { color: C.red, width: 3 });
      p.tex('l0', Math.min(res.L0, xmax), yt * 0.78, 'L(f)', { anchor: 'left', dx: 6, color: C.red, size: 14 });
      if (W.show.means) meanLine(p, res.mFx, C.blue, 'mf', '\\E[\\hL_S(f)]', yt * 0.9);
    };
    const c = W.controls;
    ui.slider(c, { label: 'degré $d$ de la classe', min: 0, max: 12, step: 1, value: st.d, fmt: v => v.toFixed(0), onInput: v => { st.d = v; run(); } });
    ui.slider(c, { label: 'taille $N$ de $S$', min: 8, max: 300, step: 1, value: st.N, fmt: v => v.toFixed(0), onInput: v => { st.N = v; run(); } });
    ui.buttons(c, [{ label: '🎲 relancer les tirages', onClick: () => { st.off += R; run(); } }]);
    const ro = ui.readout(c);
    ui.note(c, 'Le prédicteur fixé $f$ est un polynôme de même degré, appris sur un <b>autre</b> échantillon indépendant (donc fixé du point de vue de $S$). La dernière barre de chaque histogramme regroupe toutes les valeurs au-delà de l\'axe.');
    function run() {
      const tr = [], ge = [], fx = [];
      const w0 = S.fit(...Object.values(S.sample(st.N, 777777 + st.off)), st.d), L0 = S.genErr(w0);
      for (let r = 0; r < R; r++) {
        const D = S.sample(st.N, 1000 + r + st.off), w = S.fit(D.xs, D.ys, st.d);
        tr.push(S.mse(w, D.xs, D.ys)); ge.push(S.genErr(w)); fx.push(S.mse(w0, D.xs, D.ys));
      }
      xmax = Math.max(0.3, 1.25 * Math.max(S.quantile(ge, 0.85), S.quantile(fx, 0.97), L0));
      res = { hTr: S.hist(tr, 0, xmax, NB), hGe: S.hist(ge, 0, xmax, NB), hFx: S.hist(fx, 0, xmax, NB), mTr: M.mean(tr), mGe: M.mean(ge), mFx: M.mean(fx), L0, medGe: S.median(ge) };
      const ymax = 1.2 * Math.max(...res.hTr, ...res.hGe, ...res.hFx);
      A.setLimits([0, xmax], [0, ymax]); B.setLimits([0, xmax], [0, ymax]);
      const p = st.d + 1, fmtv = v => v > 1e3 ? v.toExponential(2) : M.fmt(v, 4);
      ro.set(`<b>Appris</b> : moyenne $\\hL_S$ = <b style="color:#58c4dd">${fmtv(res.mTr)}</b>, moyenne $L$ = <b style="color:#fc6255">${fmtv(res.mGe)}</b> (médiane ${fmtv(res.medGe)})<br>écart moyen $L - \\hL_S$ = <b>${fmtv(res.mGe - res.mTr)}</b>` +
        `<br><b>Fixé</b> : moyenne $\\hL_S(f)$ = <b style="color:#58c4dd">${fmtv(res.mFx)}</b> ≈ $L(f)$ = <b style="color:#fc6255">${fmtv(L0)}</b>` +
        `<br><span class="c-dim">Repère (hors slides) : $\\sigma^2(1-p/N)$ = ${M.fmt(S.SIG ** 2 * Math.max(0, 1 - p / st.N), 4)} avec $p = ${p}$ — formule exacte si $f^\\star$ était dans la classe.</span>`);
      A.request(); B.request();
    }
    run();
  });

  // ------------------------------------------------------------------ ms-eval
  ML.scene('ms-eval', host => {
    const R = 400;
    const W = ML.widget(host, {
      title: 'Estimer $L(\\hat f)$ avec $m$ exemples indépendants : sans biais, bruit $\\propto 1/\\sqrt m$', tag: '2D',
      views: [{ name: 'a', label: '$\\hat f$ (fixé après entraînement) et un ensemble d\'évaluation', cls: 'tall' }, { name: 'b', label: `${R} estimations $\\hL_{\\text{eval}}(\\hat f)$`, cls: 'tall' }],
      controls: true,
      foot: KEY_TRAIN + '<span class="key"><i class="dot" style="background:#f0ac5f"></i>évaluation ($m$ points)</span><span class="key"><i style="background:#f4d345"></i>$\\hat f$</span><span class="key"><i style="background:#fc6255"></i>$L(\\hat f)$ exacte</span><span class="key"><i style="background:#58c4dd"></i>erreur d\'entraînement</span>',
    });
    const st = { m: 50, off: 0, d: 3 };
    W.toggle('train', 'points d\'entraînement', true);
    W.toggle('normal', 'densité théorique $\\N(L, \\Var(\\ell)/m)$', true);
    W.toggle('band', 'bande $L \\pm 2\\,\\mathrm{sd}/\\sqrt m$', true);
    const D = S.sample(24, 7);
    let w, Ltrue, trErr, sdl, ests, E0, h, a0, b0;
    const P = new ML.Plot2D(W.views.a, { xlim: [-1.05, 1.05], ylim: [-2.3, 2.3] });
    P.onDraw = p => {
      p.fn(x => S.horner(w, x), { color: C.yellow, width: 3 });
      E0.xs.forEach((x, i) => p.point(x, E0.ys[i], { color: C.gold, r: st.m > 300 ? 2 : 3.5, alpha: 0.85 }));
      if (W.show.train) D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#fff', r: 4, stroke: '#000' }));
      p.tex('e', -1.0, 2.0, `\\hL_{\\text{eval}} = ${M.fmt(ests[0], 3)}`, { anchor: 'left', color: C.gold, size: 15 });
    };
    const H = new ML.Plot2D(W.views.b, { xlim: [0, 1], ylim: [0, 0.2], xlabel: '\\hL_{\\text{eval}}' });
    H.onDraw = p => {
      const sd = sdl / Math.sqrt(st.m);
      if (W.show.band) p.rect(Ltrue - 2 * sd, 0, Ltrue + 2 * sd, H.ylim[1], { color: C.red, fill: C.red, fillAlpha: 0.08, stroke: false });
      S.drawHist(p, h, a0, b0, { color: C.gold });
      if (W.show.normal) { const bw = (b0 - a0) / 30; p.fn(x => bw * Math.exp(-0.5 * ((x - Ltrue) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI)), { color: '#fff', width: 1.8, alpha: 0.8 }, [a0, b0]); }
      p.vline(Ltrue, { color: C.red, width: 3 });
      p.tex('L', Ltrue, H.ylim[1] * 0.93, 'L(\\hat f)', { anchor: 'left', dx: 6, color: C.red, size: 14 });
      p.vline(M.mean(ests), { color: C.gold, width: 2, dash: [6, 5] });
      if (trErr > a0) { p.vline(trErr, { color: C.blue, width: 2 }); p.tex('tr', trErr, H.ylim[1] * 0.8, '\\hL_{\\text{train}}', { anchor: 'right', dx: -6, color: C.blue, size: 14 }); }
      else p.tex('tr', a0, H.ylim[1] * 0.8, '\\leftarrow \\hL_{\\text{train}} = ' + M.fmt(trErr, 3), { anchor: 'left', dx: 4, color: C.blue, size: 13 });
    };
    const c = W.controls;
    ui.slider(c, { label: 'taille d\'évaluation $m$', min: Math.log10(5), max: Math.log10(3000), log: true, value: st.m, fmt: v => Math.round(v).toString(), onInput: v => { st.m = Math.round(v); run(); } });
    ui.select(c, { label: 'modèle $\\hat f$ (appris sur 24 points)', value: '3', options: [['1', 'degré 1'], ['3', 'degré 3'], ['8', 'degré 8']], onChange: v => { st.d = +v; refit(); } });
    ui.buttons(c, [{ label: '🎲 nouveaux ensembles d\'évaluation', onClick: () => { st.off += R; run(); } }]);
    const ro = ui.readout(c);
    function refit() { w = S.fit(D.xs, D.ys, st.d); Ltrue = S.genErr(w); trErr = S.mse(w, D.xs, D.ys); sdl = Math.sqrt(S.lossVar(w)); run(); }
    function run() {
      ests = [];
      for (let r = 0; r < R; r++) { const E = S.sample(st.m, 50000 + r + st.off); if (r === 0) E0 = E; ests.push(S.mse(w, E.xs, E.ys)); }
      const sd = sdl / Math.sqrt(st.m);
      a0 = Math.max(0, Ltrue - 4.5 * sd); b0 = Ltrue + 4.5 * sd;
      h = S.hist(ests, a0, b0, 30);
      H.setLimits([a0, b0], [0, 1.25 * Math.max(...h, (b0 - a0) / 30 / (sd * Math.sqrt(2 * Math.PI)))]);
      const sdEmp = Math.sqrt(M.mean(ests.map(e => (e - M.mean(ests)) ** 2)));
      ro.set(`$L(\\hat f)$ = <b style="color:#fc6255">${M.fmt(Ltrue, 4)}</b> · erreur d'entraînement = <b style="color:#58c4dd">${M.fmt(trErr, 4)}</b><br>moyenne des ${R} estimations = <b style="color:#f0ac5f">${M.fmt(M.mean(ests), 4)}</b> (sans biais)<br>écart-type : empirique <b>${M.fmt(sdEmp, 3)}</b> · théorique $\\sqrt{\\Var(\\ell)/m}$ = <b>${M.fmt(sd, 3)}</b>`);
      P.request(); H.request();
    }
    refit();
  });

  // ------------------------------------------------------------------ ms-complexity
  ML.scene('ms-complexity', host => {
    const W = ML.widget(host, {
      title: 'Complexité : erreur d\'entraînement vs erreur de généralisation (slides 11–13)', tag: '2D',
      views: [{ name: 'p', label: 'ajustement de degré $d$', cls: 'tall' }, { name: 'e', label: 'erreurs en fonction du degré (échelle log)', cls: 'tall' }],
      controls: true,
      foot: KEY_TRAIN + KEY_TRUTH + '<span class="key"><i style="background:#f4d345"></i>$\\hat f_d$</span><span class="key"><i style="background:#58c4dd"></i>erreur d\'entraînement</span><span class="key"><i style="background:#fc6255"></i>erreur de généralisation</span>',
    });
    const DMAX = 14, st = { d: 3, N: 24, seed: 3, avg: false };
    W.toggle('truth', 'vraie fonction $f^\\star$', true);
    W.toggle('noise', 'niveau de bruit $\\sigma^2$', true);
    W.toggle('gap', 'écart de généralisation (flèche)', true);
    W.toggle('zones', 'zones sous- / sur-apprentissage', true);
    let D, curves, best;
    const P = new ML.Plot2D(W.views.p, { xlim: [-1.05, 1.05], ylim: [-2.3, 2.3], xlabel: 'x', ylabel: 'y' });
    P.onDraw = p => {
      if (W.show.truth) p.fn(S.fstar, { color: C.green, width: 2.5, alpha: 0.9 });
      p.fn(x => S.horner(curves[st.d].w, x), { color: C.yellow, width: 3, samples: 700 });
      D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#fff', r: st.N > 100 ? 2.5 : 4, stroke: '#000' }));
      p.tex('d', 1.0, 2.0, `d = ${st.d}`, { anchor: 'right', color: C.yellow, size: 17 });
    };
    const Y0 = -2.2, Y1 = 2.2;
    const E = new ML.Plot2D(W.views.e, { xlim: [-0.5, DMAX + 0.5], ylim: [Y0, Y1], xlabel: 'd', ylabel: '\\text{MSE}', gridStep: [1, 1], axisY: Y0, axisX: -0.5, tickFmt: (v, ax) => ax === 'y' ? S.logTick(v) : String(Math.round(v)) });
    const cl = v => M.clamp(S.lg(v), Y0 - 0.2, Y1 + 0.2);
    E.onDraw = p => {
      if (W.show.zones) {
        p.rect(-0.5, Y0, best - 0.5, Y1, { color: C.blue, fill: C.blue, fillAlpha: 0.06, stroke: false });
        p.rect(best + 0.5, Y0, DMAX + 0.5, Y1, { color: C.red, fill: C.red, fillAlpha: 0.06, stroke: false });
        if (best > 0) p.text((best - 0.5) / 2 - 0.25, Y1 - 0.55, 'sous-apprentissage', { color: '#7fb9cc', size: 12 });
        p.text((best + DMAX) / 2 + 0.5, Y1 - 0.55, 'sur-apprentissage', { color: '#e08a80', size: 12 });
      }
      if (W.show.noise) { p.hline(S.lg(S.SIG ** 2), { color: C.grey, width: 1, dash: [5, 5] }); p.tex('s2', DMAX + 0.3, S.lg(S.SIG ** 2), '\\sigma^2', { anchor: 'right', dy: 11, color: '#999', size: 13 }); }
      p.polyline(curves.map((c, d) => [d, cl(c.tr)]), { color: C.blue, width: 2.5 });
      p.polyline(curves.map((c, d) => [d, cl(c.ge)]), { color: C.red, width: 2.5 });
      curves.forEach((c, d) => { p.point(d, cl(c.tr), { color: C.blue, r: 3.5 }); p.point(d, cl(c.ge), { color: C.red, r: 3.5 }); });
      p.vline(st.d, { color: C.yellow, width: 1.5, alpha: 0.6 });
      if (W.show.gap) { const c = curves[st.d]; p.arrow(st.d + 0.25, cl(c.tr), st.d + 0.25, cl(c.ge), { color: '#fff', width: 1.6, head: 8 }); }
      p.point(best, cl(curves[best].ge), { color: C.red, r: 7, hollow: true });
    };
    E.addDraggable({ get: () => [st.d, Y0 + 0.3], set: x => { const d = M.clamp(Math.round(x), 0, DMAX); if (d !== st.d) { st.d = d; dS.set(d); upd(); } }, r: 16, cursor: 'ew-resize' });
    E.onDrawTop = p => p.point(st.d, Y0 + 0.3, { color: C.yellow, r: 7, glow: true });
    const c = W.controls;
    const dS = ui.slider(c, { label: 'degré $d$', min: 0, max: DMAX, step: 1, value: st.d, fmt: v => v.toFixed(0), onInput: v => { st.d = v; upd(); } });
    const nS = ui.slider(c, { label: 'taille $N$', min: 8, max: 400, step: 1, value: st.N, fmt: v => v.toFixed(0), onInput: v => { st.N = v; regen(); } });
    ui.buttons(c, [24, 200].map(n => ({ label: `$N = ${n}$`, onClick: () => { st.N = n; nS.set(n); regen(); } })).concat([{ label: '🎲 nouveau tirage', onClick: () => { st.seed++; regen(); } }]));
    ui.check(c, { label: 'courbes = médiane sur 60 tirages', value: false, onChange: v => { st.avg = v; regen(); } });
    const ro = ui.readout(c);
    function regen() {
      D = S.sample(st.N, st.seed);
      curves = M.range(DMAX + 1).map(d => { const w = S.fit(D.xs, D.ys, d); return { w, tr: S.mse(w, D.xs, D.ys), ge: S.genErr(w) }; });
      if (st.avg) {
        const sets = M.range(60).map(r => S.sample(st.N, 9000 + r));
        curves.forEach((cv, d) => {
          const tr = [], ge = [];
          sets.forEach(Dr => { const w = S.fit(Dr.xs, Dr.ys, d); tr.push(S.mse(w, Dr.xs, Dr.ys)); ge.push(S.genErr(w)); });
          cv.tr = S.median(tr); cv.ge = S.median(ge);
        });
      }
      best = S.argmin(curves.map(cv => cv.ge));
      upd();
    }
    function upd() {
      const cv = curves[st.d], fm = v => v > 1e3 ? v.toExponential(2) : M.fmt(v, 4);
      const regime = st.d < best && cv.ge > 1.3 * curves[best].ge ? '<span style="color:#58c4dd">sous-apprentissage</span> : les deux erreurs sont élevées' :
        st.d > best && cv.ge > 1.3 * curves[best].ge ? '<span style="color:#fc6255">sur-apprentissage</span> : train bas, généralisation élevée' : '<span style="color:#83c167">bonne zone</span>';
      ro.set(`erreur d'entraînement = <b style="color:#58c4dd">${fm(cv.tr)}</b><br>erreur de généralisation = <b style="color:#fc6255">${fm(cv.ge)}</b><br>écart = <b>${fm(cv.ge - cv.tr)}</b><br>meilleur degré (selon $L$) : <b>${best}</b><br>${regime}${st.d + 1 > st.N ? '<br><span style="color:#fc6255">$d+1 > N$ : interpolation (norme minimale)</span>' : ''}`);
      P.request(); E.request();
    }
    regen();
  });

  // ------------------------------------------------------------------ ms-learning (hors slides)
  ML.scene('ms-learning', host => {
    const W = ML.widget(host, {
      title: 'Courbes d\'apprentissage : erreurs en fonction de $N$ (médiane sur 40 tirages)', tag: '2D',
      views: [{ name: 'c', label: 'trait plein : généralisation · pointillé : entraînement (échelle log–log)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#58c4dd"></i>degré 1</span><span class="key"><i style="background:#f4d345"></i>degré 3</span><span class="key"><i style="background:#fc6255"></i>degré 12</span><span class="key"><i style="background:#888"></i>$\\sigma^2$</span><span class="key">tirets fins : meilleur modèle de la classe, $L(f^*_{\\mathcal H})$</span>',
    });
    const DEG = [[1, C.blue], [3, C.yellow], [12, C.red]];
    DEG.forEach(([d]) => W.toggle('d' + d, `degré ${d}`, true));
    W.toggle('train', 'erreurs d\'entraînement', true);
    W.toggle('asym', 'asymptotes $L(f^*_{\\mathcal H})$', true);
    const Ns = [...new Set(M.linspace(Math.log10(5), Math.log10(1000), 20).map(t => Math.round(10 ** t)))];
    let curves, asym, off = 0;
    const Y0 = -1.6, Y1 = 1.2, X0 = Math.log10(4.5), X1 = Math.log10(1100);
    const P = new ML.Plot2D(W.views.c, { xlim: [X0, X1], ylim: [Y0, Y1], xlabel: 'N', ylabel: '\\text{MSE}', axisY: Y0, axisX: X0, gridStep: [1, 1], tickFmt: (v, ax) => ax === 'y' ? S.logTick(v) : S.logTick(v) });
    const cl = v => M.clamp(S.lg(v), Y0 - 0.3, Y1 + 0.3);
    P.onDraw = p => {
      p.hline(S.lg(S.SIG ** 2), { color: C.grey, width: 1, dash: [5, 5] });
      DEG.forEach(([d, col], j) => {
        if (!W.show['d' + d]) return;
        if (W.show.asym) p.hline(S.lg(asym[j]), { color: col, width: 1, dash: [2, 4], alpha: 0.8 });
        p.polyline(Ns.map((n, i) => [Math.log10(n), cl(curves[j][i].ge)]), { color: col, width: 2.6 });
        if (W.show.train) p.polyline(Ns.map((n, i) => [Math.log10(n), cl(curves[j][i].tr)]), { color: col, width: 2, dash: [6, 5] });
      });
    };
    const c = W.controls;
    ui.buttons(c, [{ label: '🎲 relancer', onClick: () => { off += 40; run(); } }]);
    const ro = ui.readout(c);
    ui.note(c, 'Lecture : quand $N\\to\\infty$, entraînement et généralisation convergent vers $L(f^*_{\\mathcal H})$, l\'erreur du meilleur modèle de la classe. Degré 1 : convergence rapide mais vers un niveau élevé (biais). Degré 12 : niveau final bas, mais l\'écart ne se referme que pour $N$ grand (variance).');
    function run() {
      const XG = M.linspace(-1, 1, 801);
      asym = DEG.map(([d]) => S.genErr(S.fit(XG, XG.map(S.fstar), d)));
      curves = DEG.map(([d]) => Ns.map(n => {
        const tr = [], ge = [];
        for (let r = 0; r < 40; r++) { const D = S.sample(n, 20000 + 997 * r + n + off), w = S.fit(D.xs, D.ys, d); tr.push(S.mse(w, D.xs, D.ys)); ge.push(S.genErr(w)); }
        return { tr: S.median(tr), ge: S.median(ge) };
      }));
      ro.set(DEG.map(([d, col], j) => `<span style="color:${col}">degré ${d}</span> : $L(f^*_{\\mathcal H})$ = <b>${M.fmt(asym[j], 4)}</b>`).join('<br>'));
      P.request();
    }
    run();
  });

  // ------------------------------------------------------------------ ms-ridge
  ML.scene('ms-ridge', host => {
    const W = ML.widget(host, {
      title: 'Degré 12 + pénalité ridge : la régularisation règle la complexité (slide 15)', tag: '2D',
      views: [{ name: 'p', label: 'ajustement $\\hat\\bw_\\lambda$ (degré 12)', cls: 'tall' }, { name: 'e', label: 'erreurs en fonction de $\\log_{10}\\lambda$', cls: 'tall' }],
      controls: true,
      foot: KEY_TRAIN + KEY_TRUTH + '<span class="key"><i style="background:#f4d345"></i>$\\hat f_\\lambda$</span><span class="key"><i style="background:#58c4dd"></i>erreur d\'entraînement</span><span class="key"><i style="background:#fc6255"></i>erreur de généralisation</span>',
    });
    const D_ = 12, LGS = M.linspace(-9, 1, 41), st = { lg: -3, N: 24, seed: 3, avg: false };
    W.toggle('truth', 'vraie fonction $f^\\star$', true);
    W.toggle('noise', 'niveau de bruit $\\sigma^2$', true);
    W.toggle('unreg', 'ajustement sans régularisation ($\\lambda = 0$)', false);
    let D, curves, best, w0, w;
    const P = new ML.Plot2D(W.views.p, { xlim: [-1.05, 1.05], ylim: [-2.3, 2.3], xlabel: 'x', ylabel: 'y' });
    P.onDraw = p => {
      if (W.show.truth) p.fn(S.fstar, { color: C.green, width: 2.5, alpha: 0.9 });
      if (W.show.unreg) p.fn(x => S.horner(w0, x), { color: C.red, width: 1.6, alpha: 0.7, dash: [5, 4] });
      p.fn(x => S.horner(w, x), { color: C.yellow, width: 3, samples: 700 });
      D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#fff', r: 4, stroke: '#000' }));
      p.tex('l', 1.0, 2.0, `\\lambda = 10^{${st.lg.toFixed(1)}}`, { anchor: 'right', color: C.yellow, size: 16 });
    };
    const Y0 = -2, Y1 = 1.5;
    const E = new ML.Plot2D(W.views.e, { xlim: [-9.3, 1.3], ylim: [Y0, Y1], xlabel: '\\log_{10}\\lambda', ylabel: '\\text{MSE}', gridStep: [1, 1], axisY: Y0, axisX: -9.3, tickFmt: (v, ax) => ax === 'y' ? S.logTick(v) : String(Math.round(v)) });
    const cl = v => M.clamp(S.lg(v), Y0 - 0.2, Y1 + 0.2);
    E.onDraw = p => {
      if (W.show.noise) p.hline(S.lg(S.SIG ** 2), { color: C.grey, width: 1, dash: [5, 5] });
      p.polyline(curves.map((cv, i) => [LGS[i], cl(cv.tr)]), { color: C.blue, width: 2.5 });
      p.polyline(curves.map((cv, i) => [LGS[i], cl(cv.ge)]), { color: C.red, width: 2.5 });
      p.point(LGS[best], cl(curves[best].ge), { color: C.red, r: 7, hollow: true });
      p.text(-8.6, Y1 - 0.5, '← sur-apprentissage', { color: '#e08a80', size: 12, align: 'left' });
      p.text(0.9, Y1 - 0.5, 'sous-apprentissage →', { color: '#7fb9cc', size: 12, align: 'right' });
      p.vline(st.lg, { color: C.yellow, width: 1.5, alpha: 0.6 });
    };
    E.addDraggable({ get: () => [st.lg, Y0 + 0.3], set: x => { st.lg = M.clamp(x, -9, 1); lS.set(10 ** st.lg); upd(); }, r: 16, cursor: 'ew-resize' });
    E.onDrawTop = p => p.point(st.lg, Y0 + 0.3, { color: C.yellow, r: 7, glow: true });
    const c = W.controls;
    const lS = ui.slider(c, { label: 'pénalité $\\lambda$', min: -9, max: 1, log: true, value: 10 ** st.lg, fmt: v => v.toExponential(1), onInput: v => { st.lg = Math.log10(v); upd(); } });
    ui.buttons(c, [{ label: '🎲 nouveau tirage', onClick: () => { st.seed++; regen(); } }]);
    ui.check(c, { label: 'courbes = médiane sur 40 tirages', value: false, onChange: v => { st.avg = v; regen(); } });
    const ro = ui.readout(c);
    function regen() {
      D = S.sample(st.N, st.seed);
      w0 = S.fit(D.xs, D.ys, D_);
      const sets = st.avg ? M.range(40).map(r => S.sample(st.N, 9000 + r)) : [D];
      curves = LGS.map(l => {
        const tr = [], ge = [];
        sets.forEach(Dr => { const ww = S.fit(Dr.xs, Dr.ys, D_, 10 ** l); tr.push(S.mse(ww, Dr.xs, Dr.ys)); ge.push(S.genErr(ww)); });
        return { tr: S.median(tr), ge: S.median(ge) };
      });
      best = S.argmin(curves.map(cv => cv.ge));
      upd();
    }
    function upd() {
      w = S.fit(D.xs, D.ys, D_, 10 ** st.lg);
      const tr = S.mse(w, D.xs, D.ys), ge = S.genErr(w);
      ro.set(`erreur d'entraînement = <b style="color:#58c4dd">${M.fmt(tr, 4)}</b><br>erreur de généralisation = <b style="color:#fc6255">${ge > 1e3 ? ge.toExponential(2) : M.fmt(ge, 4)}</b><br>$\\|\\bw_{1:12}\\|$ = <b>${M.fmt(M.norm(w.slice(1)), 3)}</b><br>meilleur $\\lambda$ (selon $L$) ≈ <b>$10^{${LGS[best].toFixed(1)}}$</b><br><span class="c-dim">$w_0$ n'est pas pénalisé.</span>`);
      P.request(); E.request();
    }
    regen();
  });
})(window.ML);
