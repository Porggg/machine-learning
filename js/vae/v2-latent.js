/* Chapitre 7 — §3–4 : modèle génératif à variable latente (échantillonnage, marginale), ELBO et écart KL(q ‖ p(z|x)) */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, V = ML.vae;
  const zCol = z => M.ramp(0.12 + 0.8 * (z + 2.5) / 5);

  // ------------------------------------------------------------------ vae-gen
  ML.scene('vae-gen', host => {
    const W = ML.widget(host, {
      title: 'Générer avec une variable latente : $z\\sim\\mathcal N(0,1)$, puis $x = \\mu_\\theta(z)+\\sigma\\,\\varepsilon_x$ (slides 12–15)', tag: '2D',
      views: [{ name: 'z', label: 'espace latent : la loi a priori $p(z) = \\mathcal N(0,1)$', cls: 'short' }, { name: 'x', label: 'espace des données : courbe $\\mu_\\theta(z)$, échantillons, densité marginale $p_\\theta(x) = \\int p(z)\\,p_\\theta(x\\mid z)\\,dz$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>$\\mu_\\theta(z)$ (couleur = valeur de $z$)</span><span class="key"><i style="background:#fff"></i>échantillons $x$</span><span class="key"><i style="background:#29abca"></i>densité $p_\\theta(x)$ (calculée par quadrature sur $z$)</span>',
    });
    const DEC = {
      lin: { label: 'linéaire : μ(z) = (1.4z, 0.7z)', f: z => [1.4 * z, 0.7 * z] },
      arc: { label: 'arc de cercle', f: z => { const t = Math.PI / 2 + 2 * Math.tanh(0.8 * z); return [2 * Math.cos(t), 2 * Math.sin(t) - 0.8]; } },
      wave: { label: 'vague : μ(z) = (1.5z, 1.1 sin 2.1z)', f: z => [1.5 * z, 1.1 * Math.sin(2.1 * z)] },
      two: { label: 'deux groupes : μ(z) = (1.6, 0.8) tanh 3z', f: z => [1.6 * Math.tanh(3 * z), 0.8 * Math.tanh(3 * z)] },
    };
    const st = { dec: 'arc', sig: 0.15, pts: [], last: null, r: M.rng(5) };
    W.toggle('dens', 'densité marginale $p_\\theta(x)$', true);
    const Pz = new ML.Plot2D(W.views.z, { xlim: [-3.5, 3.5], ylim: [-0.05, 0.5], gridStep: [1, 0.1] });
    const Px = new ML.Plot2D(W.views.x, { xlim: [-3.4, 3.4], ylim: [-2.6, 2.6], gridStep: [1, 1] });
    const ZQ = M.range(241).map(i => -4 + 8 * i / 240);
    const dens = (x, y) => { const f = DEC[st.dec].f, s = st.sig; let p = 0; for (const z of ZQ) { const m = f(z); p += V.npdf(z, 0, 1) * V.npdf(x, m[0], s) * V.npdf(y, m[1], s); } return p * (8 / 240); };
    Pz.onDraw = p => {
      p.fn(z => V.npdf(z, 0, 1), { color: '#bbb', width: 2, fillArea: '#888', fillAlpha: 0.12 });
      st.pts.forEach(q => p.point(q.z, 0.01, { color: zCol(q.z), r: 2.5 }));
      if (st.last) { p.vline(st.last.z, { color: zCol(st.last.z), width: 2 }); p.tex('zl', st.last.z, 0.45, `z = ${st.last.z.toFixed(2)}`, { color: zCol(st.last.z), size: 13 }); }
    };
    Px.onDraw = p => {
      if (W.show.dens) {
        const key = st.dec + '|' + st.sig;
        p.heatmap(dens, v => { const t = Math.min(1, Math.sqrt(v / 0.6)); return M.rampRgb(t).map(c => c * Math.min(1, 1.6 * t)); }, { res: 4, key });
      }
      const f = DEC[st.dec].f;
      for (let i = 0; i < 120; i++) { const z0 = -3 + 6 * i / 120, z1 = z0 + 6 / 120, a = f(z0), b = f(z1); p.seg(a[0], a[1], b[0], b[1], { color: zCol(z0 + 3 / 120), width: 3 }); }
      st.pts.forEach(q => p.point(q.x[0], q.x[1], { color: '#fff', r: 2.4, alpha: 0.85 }));
      if (st.last) {
        const m = f(st.last.z);
        p.point(m[0], m[1], { color: zCol(st.last.z), r: 6, glow: true });
        p.arrow(m[0], m[1], st.last.x[0], st.last.x[1], { color: C.red, width: 2, head: 9 });
        p.point(st.last.x[0], st.last.x[1], { color: '#fff', r: 5 });
        p.tex('mu', m[0], m[1], '\\mu_\\theta(z)', { color: zCol(st.last.z), dx: -18, dy: -16, size: 14 });
        p.tex('eps', (m[0] + st.last.x[0]) / 2, (m[1] + st.last.x[1]) / 2, '\\sigma\\varepsilon_x', { color: C.red, dx: 16, dy: 10, size: 13 });
      } else p.tex('mu', 0, 0, '', {});
    };
    const draw1 = () => { const r = st.r, z = r.n(), m = DEC[st.dec].f(z), x = [m[0] + st.sig * r.n(), m[1] + st.sig * r.n()]; const q = { z, x }; st.pts.push(q); st.last = q; };
    const c = W.controls;
    ui.select(c, { label: 'décodeur $\\mu_\\theta$', value: st.dec, options: Object.entries(DEC).map(([k, v]) => [k, v.label]), onChange: v => { st.dec = v; st.pts = []; st.last = null; upd(); } });
    ui.slider(c, { label: 'bruit du décodeur $\\sigma$', min: 0.03, max: 1, step: 0.01, value: st.sig, digits: 2, onInput: v => { st.sig = v; st.pts = []; st.last = null; upd(); } });
    ui.buttons(c, [
      { label: 'tirer 1 échantillon', primary: true, onClick: () => { draw1(); upd(); } },
      { label: '+200', onClick: () => { for (let k = 0; k < 200; k++) draw1(); st.last = null; upd(); } },
      { label: 'effacer', onClick: () => { st.pts = []; st.last = null; upd(); } },
    ]);
    const ro = ui.readout(c);
    function upd() {
      ro.set(`${st.pts.length} échantillon(s).${st.last ? ` Dernier : $z = ${st.last.z.toFixed(2)}$, $x = (${st.last.x[0].toFixed(2)},\\ ${st.last.x[1].toFixed(2)})$.` : ''}<br><span class="c-dim">Deux tirages gaussiens indépendants et une fonction : c'est tout ce qu'il faut pour <b>générer</b> (slide 13). La marginale $p_\\theta(x)$, elle, n'est gaussienne que pour le décodeur linéaire : ailleurs elle épouse la courbe. Ici $z$ est de dimension 1, donc l'intégrale se calcule par quadrature (241 points) ; en dimension $J = 20$ il faudrait $241^{20}$ points : c'est l'intégrale « intraitable » de la slide 15.</span>`);
      Pz.request(); Px.request();
    }
    upd();
  });

  // ------------------------------------------------------------------ vae-elbo
  ML.scene('vae-elbo', host => {
    const W = ML.widget(host, {
      title: 'L\'ELBO sous $\\log p_\\theta(x)$, et l\'écart $= \\mathrm{KL}(q\\,\\|\\,p_\\theta(z\\mid x))$ (slides 15–17)', tag: '2D',
      views: [{ name: 'z', label: 'pour un $x$ fixé : a priori $p(z)$, postérieure $r(z) = p_\\theta(z\\mid x)$, densité auxiliaire $q(z) = \\mathcal N(m,s^2)$', cls: 'tall' }, { name: 'e', label: '$\\mathcal L(x,\\theta;q)$ en fonction de $m$ ($s$ fixé), sous la droite $\\log p_\\theta(x)$', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#fff"></i>postérieure $r(z)$</span><span class="key"><i style="background:#f4d345"></i>$q(z)$</span><span class="key"><i style="background:#888"></i>a priori $p(z)$</span><span class="key"><i style="background:#83c167"></i>$\\log p_\\theta(x)$</span><span class="key"><i style="background:#fc6255"></i>écart $= \\mathrm{KL}(q\\|r)$</span>',
    });
    const st = { toy: 'sq', x: 2, m: 0.6, ls: -0.8 };
    const P = new ML.Plot2D(W.views.z, { xlim: [-3.5, 3.5], ylim: [-0.05, 2.2], gridStep: [1, 0.5] });
    const E = new ML.Plot2D(W.views.e, { xlim: [-3, 3], ylim: [-8, 0], xlabel: 'm', gridStep: [1, 1] });
    let lp = 0, post = [];
    const compute = () => { const toy = V.TOY[st.toy]; lp = V.logMarg(toy, st.x); post = V.ZGRID.map(z => Math.exp(V.logJoint(toy, st.x, z) - lp)); };
    P.onDraw = p => {
      p.fn(z => V.npdf(z, 0, 1), { color: '#888', width: 1.5, dash: [5, 4] });
      p.polyline(V.ZGRID.map((z, i) => [z, post[i]]), { color: '#fff', width: 2.5, fillArea: '#fff', fillAlpha: 0.08 });
      const s = Math.exp(st.ls);
      p.fn(z => V.npdf(z, st.m, s), { color: C.yellow, width: 2.5, fillArea: C.yellow, fillAlpha: 0.12 });
    };
    const elboAt = m => V.elboQ(V.TOY[st.toy], st.x, m, Math.exp(st.ls));
    E.onDraw = p => {
      p.hline(lp, { color: C.green, width: 2 });
      p.tex('lp', E.xlim[0] + 0.05, lp, '\\log p_\\theta(x)', { color: C.green, anchor: 'left', dy: -12, size: 13 });
      p.fn(elboAt, { color: C.blue, width: 2.2, samples: 80 });
      const e = elboAt(st.m);
      p.seg(st.m, e, st.m, lp, { color: C.red, width: 3 });
      p.tex('kl', st.m, (e + lp) / 2, '\\mathrm{KL}(q\\|r)', { color: C.red, anchor: 'left', dx: 8, size: 13 });
      p.point(st.m, e, { color: C.yellow, r: 7, glow: true });
    };
    E.addDraggable({ get: () => [st.m, elboAt(st.m)], set: x => { st.m = M.clamp(x, -3, 3); sM.set(st.m); upd(); }, r: 14, cursor: 'ew-resize' });
    const c = W.controls;
    ui.select(c, { label: 'modèle : $x\\mid z\\sim\\mathcal N(f(z),s_x^2)$', value: st.toy, options: Object.entries(V.TOY).map(([k, v]) => [k, v.label]), onChange: v => { st.toy = v; compute(); fitE(); upd(); } });
    ui.slider(c, { label: 'observation $x$', min: -3, max: 4, step: 0.01, value: st.x, digits: 2, onInput: v => { st.x = v; compute(); fitE(); upd(); } });
    const sM = ui.slider(c, { label: 'moyenne de $q$ : $m$', min: -3, max: 3, step: 0.01, value: st.m, digits: 2, onInput: v => { st.m = v; upd(); } });
    const sL = ui.slider(c, { label: '$\\ln s$ (écart-type de $q$)', min: -3, max: 1, step: 0.01, value: st.ls, digits: 2, onInput: v => { st.ls = v; upd(); } });
    ui.buttons(c, [
      { label: 'meilleure gaussienne (depuis $q$ actuel)', primary: true, onClick: () => { const q = V.bestQ(V.TOY[st.toy], st.x, st.m, st.ls); st.m = M.clamp(q.m, -3, 3); st.ls = M.clamp(Math.log(q.sd), -3, 1); sM.set(st.m); sL.set(st.ls); upd(); } },
      { label: '$q = p(z)$', onClick: () => { st.m = 0; st.ls = 0; sM.set(0); sL.set(0); upd(); } },
    ]);
    const ro = ui.readout(c);
    function fitE() { E.setLimits([-3, 3], [lp - 7, lp + 0.8]); }
    function fitP() { const mx = Math.max(...post, V.npdf(0, 0, Math.exp(st.ls)), 0.45), top = Math.min(6, mx * 1.12); if (Math.abs(P.ylim[1] - top) > 0.02) P.setLimits([-3.5, 3.5], [-0.05, top]); }
    function upd() {
      fitP();
      const s = Math.exp(st.ls), e = elboAt(st.m);
      let kl = 0; V.ZGRID.forEach((z, i) => { const q = V.npdf(z, st.m, s); if (q > 1e-300 && post[i] > 1e-300) kl += q * Math.log(q / post[i]) * V.DZ; else if (q > 1e-12) kl = Infinity; });
      ro.set(`$\\log p_\\theta(x)$ = <b style="color:#83c167">${lp.toFixed(4)}</b> · ELBO $\\mathcal L(x,\\theta;q)$ = <b style="color:#58c4dd">${e.toFixed(4)}</b><br>écart $\\log p_\\theta(x)-\\mathcal L$ = <b style="color:#fc6255">${(lp - e).toFixed(4)}</b> · $\\mathrm{KL}(q\\|r)$ calculée à part = ${isFinite(kl) ? kl.toFixed(4) : '∞'}<br><span class="c-dim">Les deux dernières valeurs coïncident (slide 17). Avec le modèle <b>linéaire</b>, la postérieure est gaussienne : la meilleure gaussienne la retrouve et l'écart tombe à 0. Avec $f(z) = z^2$ et $x = 2$, la postérieure a deux bosses ($z\\approx\\pm\\sqrt2$) : une gaussienne n'en couvre qu'une, et l'écart reste $\\approx\\ln2$. Depuis $m = 0$ exactement, la montée reste bloquée (point selle, par symétrie).</span>`);
      P.request(); E.request();
    }
    compute(); fitE(); upd();
  });
})(window.ML);
