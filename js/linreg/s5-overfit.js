/* Chapitre 1 — Régression linéaire · §5 Sur-apprentissage, biais–variance */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui;
  const truth = x => Math.sin(2 * Math.PI * x);
  const log10Fmt = v => { const k = Math.round(v); return Math.abs(v - k) < 1e-6 ? '1e' + k : ''; };

  // ------------------------------------------------------------------ lr-overfit
  ML.scene('lr-overfit', host => {
    const W = ML.widget(host, {
      title: 'Sur-apprentissage : polynôme de degré $M$ sur les données du HW1', tag: '2D',
      views: [{ name: 'p', label: 'ajustement', cls: 'tall' }, { name: 'e', label: 'MSE train / test (échelle log)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i class="dot" style="background:#fff"></i>train ($N$ points)</span><span class="key"><i class="dot" style="background:#667"></i>test (400 points)</span><span class="key"><i style="background:#83c167"></i>$\\sin(2\\pi x)$</span><span class="key"><i style="background:#f4d345"></i>polynôme ajusté</span><span class="key"><i style="background:#58c4dd"></i>MSE train</span><span class="key"><i style="background:#fc6255"></i>MSE test</span>',
    });
    const st = { M: 3, N: 15, sigma: 0.2, seed: 0, test: true };
    let D, T, curves, w;
    const fit = (Mdeg) => { const Phi = D.xs.map(M.basis.poly(Mdeg)); return M.lstsq(Phi, D.ys); };
    const evalP = (w_, x) => { let s = 0; for (let k = w_.length - 1; k >= 0; k--) s = s * x + w_[k]; return s; };
    function regen() {
      D = M.sinData(st.N, st.seed, st.sigma); T = M.sinData(400, st.seed + 1000, st.sigma);
      curves = M.range(15).map(m => {
        const ww = fit(m);
        return { m, tr: M.mean(D.xs.map((x, i) => (D.ys[i] - evalP(ww, x)) ** 2)), te: M.mean(T.xs.map((x, i) => (T.ys[i] - evalP(ww, x)) ** 2)), w: ww };
      });
      upd();
    }
    const P = new ML.Plot2D(W.views.p, { xlim: [-0.03, 1.03], ylim: [-1.8, 1.8], xlabel: 'x', ylabel: 'y' });
    P.onDraw = p => {
      if (st.test) T.xs.forEach((x, i) => p.point(x, T.ys[i], { r: 1.6, color: '#667', alpha: 0.8 }));
      p.fn(truth, { color: C.green, width: 2.5, alpha: 0.9 });
      p.fn(x => evalP(w, x), { color: C.yellow, width: 3.2, samples: 800 }, [0, 1]);
      D.xs.forEach((x, i) => p.point(x, D.ys[i], { color: '#fff', r: 5, stroke: '#000' }));
      p.tex('lab', 0.98, 1.55, `M = ${st.M}`, { anchor: 'right', color: C.yellow, size: 18 });
    };
    const E = new ML.Plot2D(W.views.e, { xlim: [-0.5, 14.5], ylim: [-5, 3], xlabel: 'M', ylabel: '\\log_{10}\\text{MSE}', gridStep: [1, 1], axisY: -5, axisX: -0.5, tickFmt: (v, ax) => ax === 'y' ? log10Fmt(v) : String(Math.round(v)) });
    E.onDraw = p => {
      const lg = v => Math.log10(Math.max(v, 1e-12));
      p.hline(lg(st.sigma ** 2), { color: C.grey, width: 1, dash: [5, 5] });
      p.tex('noise', 14.2, lg(st.sigma ** 2), '\\sigma^2', { color: '#999', dy: -12, anchor: 'right', size: 13 });
      p.polyline(curves.map(c => [c.m, M.clamp(lg(c.tr), -5.2, 3.2)]), { color: C.blue, width: 2.5 });
      p.polyline(curves.map(c => [c.m, M.clamp(lg(c.te), -5.2, 3.2)]), { color: C.red, width: 2.5 });
      curves.forEach(c => { p.point(c.m, M.clamp(lg(c.tr), -5.2, 3.2), { color: C.blue, r: 3.5 }); p.point(c.m, M.clamp(lg(c.te), -5.2, 3.2), { color: C.red, r: 3.5 }); });
      p.vline(st.M, { color: C.yellow, width: 1.5, alpha: 0.7 });
    };
    E.addDraggable({ get: () => [st.M, -4.6], set: x => { const m = M.clamp(Math.round(x), 0, 14); if (m !== st.M) { st.M = m; mS.set(m); upd(); } }, r: 16, cursor: 'ew-resize' });
    E.onDrawTop = p => p.point(st.M, -4.6, { color: C.yellow, r: 7, glow: true });

    const c = W.controls;
    const mS = ui.slider(c, { label: 'degré $M$', min: 0, max: 14, step: 1, value: st.M, fmt: v => v.toFixed(0), onInput: v => { st.M = v; upd(); } });
    ui.buttons(c, [1, 4, 10].map(m => ({ label: `$M=${m}$`, onClick: () => { st.M = m; mS.set(m); upd(); } })).concat([{ label: 'HW1', title: 'N=15, σ=0.2', onClick: () => { st.N = 15; st.sigma = 0.2; nS.set(15); sS.set(0.2); regen(); } }]));
    const nS = ui.slider(c, { label: 'taille d\'entraînement $N$', min: 5, max: 200, step: 1, value: st.N, fmt: v => v.toFixed(0), onInput: v => { st.N = v; regen(); } });
    const sS = ui.slider(c, { label: 'bruit $\\sigma$', min: 0.02, max: 0.6, step: 0.01, value: st.sigma, onInput: v => { st.sigma = v; regen(); } });
    ui.buttons(c, [{ label: '🎲 nouveau tirage', onClick: () => { st.seed++; regen(); } }]);
    ui.check(c, { label: 'points de test', value: true, onChange: v => { st.test = v; P.request(); } });
    const ro = ui.readout(c);
    const tab = ui.readout(c); tab.el.style.fontFamily = 'var(--font-mono)'; tab.el.style.fontSize = '12px';
    function upd() {
      const cv = curves[st.M]; w = cv.w;
      const Phi = D.xs.map(M.basis.poly(st.M)), G = M.gram(Phi), ev = M.eigSym(G).values;
      ro.set(`MSE train = <b>${M.fmt(cv.tr, 5)}</b><br>MSE test = <b>${M.fmt(cv.te, 5)}</b><br>$\\|\\bw\\|$ = <b>${M.fmt(M.norm(w), 3)}</b><br>cond$(\\bPhi\\T\\bPhi)$ ≈ <b>${ev[ev.length - 1] > 0 ? M.fmt(ev[0] / ev[ev.length - 1], 2) : '∞'}</b>${st.M + 1 > st.N ? '<br><span style="color:#fc6255">$L = M+1 > N$ : $\\bPhi\\T\\bPhi$ singulière → solution de norme min.</span>' : ''}`);
      tab.el.innerHTML = '<div style="color:#6b7280;margin-bottom:4px">coefficients (cf. PRML Table 1.1)</div>' + w.map((v, k) => `<div style="display:flex;justify-content:space-between"><span style="color:#888">w${String(k).padStart(2, ' ')}</span><span style="color:${Math.abs(v) > 100 ? '#fc6255' : '#f4d345'}">${M.fmt(v, 3)}</span></div>`).join('');
      P.request(); E.request();
    }
    regen();
  });

  // ------------------------------------------------------------------ lr-biasvar
  ML.scene('lr-biasvar', host => {
    const W = ML.widget(host, {
      title: 'Biais–variance : 25 jeux de données, 24 gaussiennes + ridge (PRML Fig. 3.5–3.6)', tag: '2D',
      views: [{ name: 'a', label: '20 ajustements $f_{\\mathcal D}$ (un par jeu)', cls: 'short' }, { name: 'b', label: 'moyenne $\\E_{\\mathcal D}[f_{\\mathcal D}]$ vs vérité', cls: 'short' }, { name: 'c', label: 'erreur vs $\\log_{10}\\lambda$', cls: 'short' }],
      controls: 'wide',
      foot: '<span class="key"><i style="background:#fc6255"></i>biais²</span><span class="key"><i style="background:#58c4dd"></i>variance</span><span class="key"><i style="background:#9a72ac"></i>biais² + variance</span><span class="key"><i style="background:#f4d345"></i>erreur test (≈ biais² + var + bruit)</span>',
    });
    const NDS = 25, N = 25, sig = 0.3, centers = M.linspace(0, 1, 24), phi = M.basis.gauss(centers, 0.08);
    const xg = M.linspace(0, 1, 101), PhiG = xg.map(phi);
    let sets;
    const st = { loglam: -2.5, seed: 1 };
    function gen() { sets = M.range(NDS).map(k => { const d = M.sinData(N, 500 + 37 * k + 1000 * st.seed, sig); return { Phi: d.xs.map(phi), ys: d.ys }; }); curve = computeCurve(); upd(); }
    function stats(lam) {
      const fits = sets.map(s => M.matvec(PhiG, M.ridge(s.Phi, s.ys, lam)));
      const avg = xg.map((_, j) => M.mean(fits.map(f => f[j])));
      const bias2 = M.mean(xg.map((x, j) => (avg[j] - truth(x)) ** 2));
      const vari = M.mean(xg.map((_, j) => M.mean(fits.map(f => (f[j] - avg[j]) ** 2))));
      return { fits, avg, bias2, vari };
    }
    let curve = [], cur;
    function computeCurve() { return M.linspace(-6, 1, 29).map(l => { const s = stats(10 ** l); return { l, b: s.bias2, v: s.vari }; }); }
    const A = new ML.Plot2D(W.views.a, { xlim: [-0.02, 1.02], ylim: [-1.6, 1.6] });
    const B = new ML.Plot2D(W.views.b, { xlim: [-0.02, 1.02], ylim: [-1.6, 1.6] });
    const Cc = new ML.Plot2D(W.views.c, { xlim: [-6.2, 1.2], ylim: [0, 0.3], xlabel: '\\log_{10}\\lambda', axisX: -6.2 });
    A.onDraw = p => { cur.fits.slice(0, 20).forEach(f => p.polyline(xg.map((x, j) => [x, f[j]]), { color: C.red, width: 1.2, alpha: 0.45 })); };
    B.onDraw = p => { p.fn(truth, { color: C.green, width: 3 }); p.polyline(xg.map((x, j) => [x, cur.avg[j]]), { color: C.red, width: 3 }); };
    Cc.onDraw = p => {
      p.polyline(curve.map(c => [c.l, c.b]), { color: C.red, width: 2.5 });
      p.polyline(curve.map(c => [c.l, c.v]), { color: C.blue, width: 2.5 });
      p.polyline(curve.map(c => [c.l, c.b + c.v]), { color: C.purple, width: 2.5 });
      p.polyline(curve.map(c => [c.l, c.b + c.v + sig * sig]), { color: C.yellow, width: 2, dash: [5, 4] });
      p.vline(st.loglam, { color: '#fff', width: 1.2, alpha: 0.7 });
    };
    Cc.addDraggable({ get: () => [st.loglam, 0.02], set: x => { st.loglam = M.clamp(x, -6, 1); lS.set(st.loglam); upd(); }, r: 16, cursor: 'ew-resize' });
    Cc.onDrawTop = p => p.point(st.loglam, 0.02, { color: '#fff', r: 6, glow: true });
    const c = W.controls;
    const lS = ui.slider(c, { label: '$\\log_{10}\\lambda$', min: -6, max: 1, step: 0.02, value: st.loglam, onInput: v => { st.loglam = v; upd(); } });
    ui.buttons(c, [{ label: '🎲 nouveaux jeux de données', onClick: () => { st.seed++; gen(); } }]);
    const ro = ui.readout(c);
    function upd() {
      cur = stats(10 ** st.loglam);
      ro.set(`biais² = <b>${M.fmt(cur.bias2, 4)}</b> · variance = <b>${M.fmt(cur.vari, 4)}</b> · somme = <b>${M.fmt(cur.bias2 + cur.vari, 4)}</b> · bruit $\\sigma^2$ = <b>${M.fmt(sig * sig, 3)}</b>`);
      A.request(); B.request(); Cc.request();
    }
    gen();
  });
})(window.ML);
