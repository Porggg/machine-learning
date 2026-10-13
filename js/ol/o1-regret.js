/* Chapitre 6 — Apprentissage en ligne · §1–3 : protocole, regret, résultat négatif */
(function (ML) {
  'use strict';
  const M = ML.math, C = M.C, ui = ML.ui, OL = ML.ol;
  const SUN = '☀', RAIN = '☂';
  const ENV_OPTS = [['iid', 'stationnaire (expert 1 le meilleur)'], ['shift', 'changement à mi-parcours'], ['cycle', 'le meilleur change 4 fois']];

  // ------------------------------------------------------------------ ol-protocol
  ML.scene('ol-protocol', host => {
    const W = ML.widget(host, {
      title: 'Le protocole, tour par tour : prévoir la météo avec 4 experts (slides 3, 15)', tag: '2D',
      views: [{ name: 'r', label: 'le tour en cours', cls: 'tall' }, { name: 'c', label: 'pertes cumulées depuis le début', cls: 'tall' }],
      controls: true,
      foot: `<span class="key">${SUN} soleil ($y = 0$)</span><span class="key">${RAIN} pluie ($y = 1$)</span><span class="key"><i style="background:#f4d345"></i>apprenant (exponential weighting, $\\eta = 0.5$)</span>`,
    });
    const K = 4, T = 400, eta = 0.5;
    let env, st;
    const STEPS = ['observer $x_t$ (la journée $t$)', 'chaque expert prédit $\\hat y_{t,k}$', 'l\'apprenant reçoit les $K$ prédictions', 'l\'apprenant tire un expert $I_t\\sim p_t$ et prédit $\\hat y_t = \\hat y_{t,I_t}$', 'la vraie étiquette $y_t$ est révélée', 'pertes $\\ell(y_t,\\hat y_t)$ ; mise à jour des poids'];
    function reset(seed) {
      env = OL.env('shift', K, T, seed);
      st = { t: 0, phase: 0, logw: new Array(K).fill(0), cum: new Array(K).fill(0), cumL: 0, I: 0, r: M.rng(seed + 50), hist: [] };
    }
    const probs = () => { const m = Math.max(...st.logw), e = st.logw.map(v => Math.exp(v - m)), Z = M.sum(e); return e.map(v => v / Z); };
    function advance() {
      if (st.t >= T) return false;
      st.phase++;
      if (st.phase === 4) { const p = probs(); let u = st.r.u(), I = 0; for (; I < K - 1; I++) { u -= p[I]; if (u <= 0) break; } st.I = I; }
      if (st.phase === 6) {
        const L = env.loss[st.t];
        st.cumL += L[st.I]; L.forEach((l, i) => { st.cum[i] += l; st.logw[i] -= eta * l; });
        st.hist.push({ cum: st.cum.slice(), cumL: st.cumL });
      }
      if (st.phase > 6) { st.phase = 1; st.t++; if (st.t >= T) { st.t = T - 1; return false; } }
      return true;
    }
    const R = new ML.Plot2D(W.views.r, { xlim: [0, 8], ylim: [0, 6], grid: false, axes: false, ticks: false });
    const Cp = new ML.Plot2D(W.views.c, { xlim: [0, 60], ylim: [0, 30], xlabel: 't', gridStep: [10, 5] });
    R.onDraw = p => {
      const t = st.t, ph = st.phase, pr = env.pred[t], y = env.y[t], P = probs();
      p.text(4, 5.6, `jour t = ${t + 1}`, { size: 15, color: '#ddd' });
      for (let k = 0; k < K; k++) {
        const x = 0.9 + k * 1.55;
        p.text(x, 4.9, OL.NAMES[k], { size: 12, color: OL.col(k) });
        if (ph >= 2) p.text(x, 4.1, pr[k] ? RAIN : SUN, { size: 30, color: pr[k] ? '#9fc4ff' : C.gold });
        // poids p_t(k)
        p.rect(x - 0.3, 1.3, x + 0.3, 1.3 + 1.6 * P[k], { color: OL.col(k), fill: OL.col(k), fillAlpha: 0.5, width: 1.2 });
        p.text(x, 1.05, `p = ${P[k].toFixed(2)}`, { size: 11, color: '#bbb' });
        if (ph >= 4 && k === st.I) p.rect(x - 0.62, 3.55, x + 0.62, 5.2, { color: C.yellow, width: 2.5, fill: C.yellow, fillAlpha: 0.06 });
        if (ph >= 6) p.text(x, 0.55, `ℓ = ${env.loss[t][k]}`, { size: 12, color: env.loss[t][k] ? C.red : C.green });
      }
      p.text(4, 3.25, 'apprenant :', { size: 12, color: C.yellow, align: 'right' });
      if (ph >= 4) p.text(4.6, 3.25, pr[st.I] ? RAIN : SUN, { size: 22, color: C.yellow });
      p.text(5.4, 3.25, 'vérité :', { size: 12, color: '#ddd', align: 'right' });
      if (ph >= 5) p.text(6.0, 3.25, y ? RAIN : SUN, { size: 22, color: '#fff' });
      if (ph >= 6) p.text(7.0, 3.25, pr[st.I] === y ? 'perte 0' : 'perte 1', { size: 13, color: pr[st.I] === y ? C.green : C.red });
    };
    Cp.onDraw = p => {
      const H = st.hist;
      for (let k = 0; k < K; k++) p.polyline(H.map((h, i) => [i + 1, h.cum[k]]), { color: OL.col(k), width: 1.8 });
      p.polyline(H.map((h, i) => [i + 1, h.cumL]), { color: C.yellow, width: 3 });
      if (H.length > 1) p.vline(T / 2, { color: '#555', dash: [4, 4] });
    };
    const c = W.controls;
    ui.player(c, { speed: 3, step: () => { const ok = advance(); upd(); return ok; }, reset: () => { reset(Math.floor(Math.random() * 1e6)); upd(); } });
    ui.buttons(c, [{ label: 'finir le tour', onClick: () => { do advance(); while (st.phase !== 6 && st.t < T - 1); upd(); } }, { label: '+50 tours', onClick: () => { for (let k = 0; k < 50 * 6; k++) if (!advance()) break; upd(); } }]);
    const ro = ui.readout(c);
    function upd() {
      const H = st.hist, n = H.length, tmax = Math.max(60, n + 5), ymax = Math.max(30, (n ? Math.max(...H[n - 1].cum) : 0) + 5);
      if (Math.abs(Cp.xlim[1] - tmax) > 0.5 || Math.abs(Cp.ylim[1] - ymax) > 0.5) Cp.setLimits([0, tmax], [0, ymax]);
      ro.set(STEPS.map((s, i) => `<div style="color:${i + 1 === st.phase ? '#f4d345' : i + 1 < st.phase ? '#bbb' : '#666'}">${i + 1}. ${s}</div>`).join('') +
        `<div style="margin-top:6px">Pertes cumulées : apprenant <b style="color:#f4d345">${st.cumL}</b> · ${st.cum.map((v, k) => `<span style="color:${OL.col(k)}">${OL.NAMES[k]} ${v}</span>`).join(' · ')}</div><span class="c-dim">Le meilleur expert change au jour ${T / 2} (trait pointillé) : wunderground est excellent au début, bbc ensuite. Les poids ne basculent pas tout de suite : il faut d\'abord que bbc rattrape son retard en perte <b>cumulée</b> (voir le §5).</span>`);
      R.request(); Cp.request();
    }
    reset(3); upd();
  });

  // ------------------------------------------------------------------ ol-regret
  ML.scene('ol-regret', host => {
    const W = ML.widget(host, {
      title: 'Perte cumulée, meilleur expert a posteriori, regret statique et dynamique (slides 5–10)', tag: '2D',
      views: [{ name: 'c', label: 'pertes cumulées $\\sum_{s\\le t}\\ell_s$', cls: 'tall' }, { name: 'r', label: 'regret $\\mathrm{Reg}_t$ (perte espérée de l\'apprenant − comparateur)', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>apprenant</span><span class="key"><i style="background:#fff"></i>meilleur expert a posteriori $\\min_i L_{t,i}$</span><span class="key"><i style="background:#888"></i>comparateur dynamique $\\sum_s\\min_i\\ell_s(i)$</span><span class="key"><i style="background:#83c167"></i>$\\sqrt{t\\ln K/2}$</span>',
    });
    const st = { env: 'shift', alg: 'ew', K: 4, T: 400, eta: 0.15, seed: 1 };
    W.toggle('experts', 'pertes cumulées des experts', true);
    W.toggle('dyn', 'comparateur et regret dynamiques', false, () => recompute());
    W.toggle('avg', 'regret moyen $\\mathrm{Reg}_t/t$ (au lieu de $\\mathrm{Reg}_t$)', false, () => recompute());
    let env, run;
    const Cp = new ML.Plot2D(W.views.c, { xlim: [0, 400], ylim: [0, 200], xlabel: 't', gridStep: [100, 50] });
    const Rp = new ML.Plot2D(W.views.r, { xlim: [0, 400], ylim: [-5, 40], xlabel: 't', gridStep: [100, 10] });
    Cp.onDraw = p => {
      const ts = M.range(st.T);
      if (W.show.experts) for (let i = 0; i < st.K; i++) p.polyline(ts.map(t => [t + 1, run.cumE[t][i]]), { color: OL.col(i), width: 1.4, alpha: 0.75 });
      if (W.show.dyn) p.polyline(ts.map(t => [t + 1, run.dyn[t]]), { color: '#888', width: 2, dash: [5, 4] });
      p.polyline(ts.map(t => [t + 1, run.best[t]]), { color: '#fff', width: 2, dash: [7, 4] });
      p.polyline(ts.map(t => [t + 1, run.cumExp[t]]), { color: C.yellow, width: 3 });
    };
    Rp.onDraw = p => {
      const ts = M.range(st.T), f = (v, t) => (W.show.avg ? v / (t + 1) : v);
      p.hline(0, { color: '#666', width: 1 });
      p.polyline(ts.map(t => [t + 1, f(Math.sqrt((t + 1) * Math.log(st.K) / 2), t)]), { color: C.green, width: 2, dash: [6, 4] });
      if (W.show.dyn) p.polyline(ts.map(t => [t + 1, f(run.dynRegret[t], t)]), { color: '#888', width: 2 });
      p.polyline(ts.map(t => [t + 1, f(run.regret[t], t)]), { color: C.yellow, width: 3 });
    };
    const c = W.controls;
    ui.select(c, { label: 'environnement', value: st.env, options: ENV_OPTS, onChange: v => { st.env = v; recompute(); } });
    ui.select(c, { label: 'apprenant', value: st.alg, options: [['ew', 'exponential weighting (η)'], ['ftl', 'suivre le meneur (déterministe)'], ['uniform', 'expert tiré au hasard uniformément']], onChange: v => { st.alg = v; recompute(); } });
    ui.slider(c, { label: 'nombre d\'experts $K$', min: 2, max: 12, step: 1, value: st.K, digits: 0, onInput: v => { st.K = Math.round(v); recompute(); } });
    ui.slider(c, { label: 'horizon $T$', min: 50, max: 2000, step: 50, value: st.T, digits: 0, onInput: v => { st.T = Math.round(v); recompute(); } });
    ui.slider(c, { label: '$\\eta$', min: -2.5, max: 0.5, log: true, value: st.eta, digits: 3, onInput: v => { st.eta = v; recompute(); } });
    ui.buttons(c, [{ label: 'nouvelle séquence', onClick: () => { st.seed++; recompute(); } }]);
    const ro = ui.readout(c);
    function recompute() {
      env = OL.env(st.env, st.K, st.T, st.seed); run = OL.run(st.alg, env, { eta: st.eta });
      const T = st.T, regT = run.regret[T - 1], best = run.best[T - 1];
      const ymax = Math.max(...run.cumE[T - 1], run.cumExp[T - 1]) * 1.05 + 1;
      Cp.setLimits([0, T], [0, ymax]);
      const vals = W.show.avg ? run.regret.map((v, t) => v / (t + 1)).concat(run.dynRegret.map((v, t) => v / (t + 1))) : run.regret.concat(W.show.dyn ? run.dynRegret : [], [Math.sqrt(T * Math.log(st.K) / 2)]);
      const lo = Math.min(0, ...vals), hi = Math.max(...vals) * 1.1 + (W.show.avg ? 0.02 : 1);
      Rp.setLimits([0, T], [lo - 0.05 * (hi - lo), hi]);
      const bi = run.cumE[T - 1].indexOf(best);
      ro.set(`Après $T = ${T}$ tours : perte (espérée) de l'apprenant <b style="color:#f4d345">${run.cumExp[T - 1].toFixed(1)}</b> · meilleur expert a posteriori : <b>${OL.NAMES[bi]}</b>, ${best} erreurs<br>regret statique $\\mathrm{Reg}_T$ = <b>${regT.toFixed(1)}</b> (soit ${(regT / T).toFixed(3)} par tour) · $\\sqrt{T\\ln K/2}$ = ${Math.sqrt(T * Math.log(st.K) / 2).toFixed(1)}<br>regret dynamique = <b>${run.dynRegret[T - 1].toFixed(1)}</b> (comparateur qui change d'expert à chaque tour : ${run.dyn[T - 1]} erreurs)<br><span class="c-dim">${st.alg === 'ftl' ? 'Suivre le meneur est déterministe : sur ces séquences « gentilles » il s\'en sort, mais un adversaire le ferait échouer à chaque tour (§3).' : st.alg === 'uniform' ? 'Le tirage uniforme n\'apprend rien : son regret croît linéairement en $T$ (pente = écart moyen avec le meilleur expert).' : 'Le regret statique reste de l\'ordre de $\\sqrt T$ : le regret moyen tend vers 0. Le regret dynamique, lui, compare à un oracle qui change d\'expert à chaque tour : il croît linéairement.'}</span>`);
      Cp.request(); Rp.request();
    }
    recompute();
  });

  // ------------------------------------------------------------------ ol-adversary
  ML.scene('ol-adversary', host => {
    const W = ML.widget(host, {
      title: 'Le résultat négatif : un adversaire bat tout apprenant déterministe (slides 11–13)', tag: '2D',
      views: [{ name: 's', label: 'les 40 premiers tours : prédiction $\\hat y_t$ (haut) et étiquette $y_t$ (bas)', cls: 'short' }, { name: 'c', label: 'pertes cumulées', cls: 'tall' }],
      controls: true,
      foot: '<span class="key"><i style="background:#f4d345"></i>apprenant</span><span class="key"><i style="background:#58c4dd"></i>$h_{-1}$ (prédit toujours $-1$)</span><span class="key"><i style="background:#f0ac5f"></i>$h_{+1}$ (prédit toujours $+1$)</span><span class="key"><i style="background:#fc6255"></i>$t/2$</span>',
    });
    const st = { learner: 'ftl', adv: 'ant', T: 200, seed: 1 };
    let res;
    // Apprenants : renvoient P(ŷ_t = +1) à partir de l'historique des étiquettes (et de leurs propres prédictions)
    const LEARN = {
      plus: () => 1,
      ftl: H => { const s = M.sum(H.map(h => h.y)); return s > 0 ? 1 : s < 0 ? 0 : 1; }, // majorité des étiquettes passées = meilleur des deux experts
      alt: H => (H.length % 2 ? 0 : 1),
      copy: H => (H.length ? (H[H.length - 1].y > 0 ? 1 : 0) : 1),
      ew: H => { const eta = Math.sqrt(8 * Math.log(2) / st.T); let lm = 0, lp = 0; H.forEach(h => { if (h.y > 0) lm++; else lp++; }); return 1 / (1 + Math.exp(-eta * (lm - lp))); }, // poids de h_{+1} ∝ e^{-η L(h_{+1})}
      coin: () => 0.5,
    };
    function simulate() {
      const r = M.rng(st.seed), H = [];
      let cumL = 0, Lm = 0, Lp = 0; const curve = [];
      for (let t = 0; t < st.T; t++) {
        const q = LEARN[st.learner](H); // P(ŷ = +1)
        const yh = r.u() < q ? 1 : -1;   // tirage interne de l'apprenant
        let y;
        if (st.adv === 'ant') y = -yh;   // voit ŷ_t avant de choisir y_t
        else y = q >= 0.5 ? -1 : 1;      // non anticipant : voit seulement q = p_t, joue l'étiquette la moins probable
        const expLoss = y > 0 ? 1 - q : q; // P(ŷ_t ≠ y_t) sachant le passé
        cumL += st.adv === 'ant' ? (yh !== y ? 1 : 0) : expLoss;
        if (y > 0) Lm++; else Lp++;
        H.push({ y, yh, q });
        curve.push([cumL, Lm, Lp]);
      }
      res = { H, curve };
    }
    const S = new ML.Plot2D(W.views.s, { xlim: [0, 40], ylim: [0, 2], grid: false, axes: false, ticks: false });
    const Cp = new ML.Plot2D(W.views.c, { xlim: [0, 200], ylim: [0, 200], xlabel: 't', gridStep: [50, 50] });
    S.onDraw = p => {
      res.H.slice(0, 40).forEach((h, t) => {
        const cy = v => (v > 0 ? C.gold : C.blue);
        p.rect(t + 0.08, 1.05, t + 0.92, 1.85, { color: cy(h.yh), fill: cy(h.yh), fillAlpha: 0.7, width: 1 });
        p.rect(t + 0.08, 0.15, t + 0.92, 0.95, { color: cy(h.y), fill: cy(h.y), fillAlpha: 0.7, width: 1 });
        if (h.yh !== h.y) p.seg(t + 0.5, 0.95, t + 0.5, 1.05, { color: C.red, width: 2 });
      });
    };
    Cp.onDraw = p => {
      const ts = M.range(st.T);
      p.polyline(ts.map(t => [t + 1, (t + 1) / 2]), { color: C.red, width: 1.5, dash: [6, 4] });
      p.polyline(ts.map(t => [t + 1, res.curve[t][1]]), { color: C.blue, width: 2 });
      p.polyline(ts.map(t => [t + 1, res.curve[t][2]]), { color: C.gold, width: 2 });
      p.polyline(ts.map(t => [t + 1, res.curve[t][0]]), { color: C.yellow, width: 3 });
    };
    const c = W.controls;
    ui.select(c, { label: 'apprenant', value: st.learner, options: [['ftl', 'déterministe : majorité des étiquettes passées'], ['plus', 'déterministe : toujours +1'], ['alt', 'déterministe : alterner +1, −1'], ['copy', 'déterministe : répéter la dernière étiquette'], ['ew', 'randomisé : exponential weighting'], ['coin', 'randomisé : pile ou face']], onChange: v => { st.learner = v; recompute(); } });
    ui.select(c, { label: 'adversaire', value: st.adv, options: [['ant', 'anticipant : voit ŷ_t avant de choisir y_t'], ['non', 'non anticipant : voit p_t, pas le tirage']], onChange: v => { st.adv = v; recompute(); } });
    ui.slider(c, { label: 'horizon $T$', min: 20, max: 1000, step: 10, value: st.T, digits: 0, onInput: v => { st.T = Math.round(v); recompute(); } });
    ui.buttons(c, [{ label: 'autre tirage interne', onClick: () => { st.seed++; recompute(); } }]);
    const ro = ui.readout(c);
    function recompute() {
      simulate();
      Cp.setLimits([0, st.T], [0, st.T * 1.02]);
      const [L, Lm, Lp] = res.curve[st.T - 1], best = Math.min(Lm, Lp), reg = L - best;
      const det = !['ew', 'coin'].includes(st.learner);
      ro.set(`perte de l'apprenant ${st.adv === 'ant' ? '' : '(espérée) '}<b style="color:#f4d345">${L.toFixed(1)}</b> · $L(h_{-1}) = ${Lm}$, $L(h_{+1}) = ${Lp}$ (somme $= T = ${st.T}$) · meilleur $= ${best}\\le T/2$<br>regret = <b>${reg.toFixed(1)}</b> · $T/2 = ${st.T / 2}$ · regret / $T$ = <b>${(reg / st.T).toFixed(3)}</b><br><span class="c-dim">${det ? 'Apprenant déterministe : connaissant l\'algorithme, l\'adversaire calcule $\\hat y_t$ et joue l\'inverse — perte $T$, regret $\\ge T/2$, quel que soit l\'adversaire (pour un déterministe, voir $p_t$ suffit à connaître $\\hat y_t$).' : st.adv === 'ant' ? 'Même randomisé, si l\'adversaire voit le tirage $\\hat y_t$ avant de choisir $y_t$, il gagne à chaque tour : la randomisation ne sert que contre un adversaire non anticipant (slide 13).' : st.learner === 'coin' ? 'Pile ou face : la perte espérée vaut $T/2$, mais l\'apprenant n\'apprend rien. L\'adversaire joue toujours $-1$ : $h_{-1}$ ne se trompe jamais et le regret vaut $T/2$. Randomiser ne suffit pas, il faut aussi apprendre : essaie l\'exponential weighting.' : 'Exponential weighting contre un adversaire non anticipant : l\'adversaire ne peut viser que l\'étiquette la moins probable ; les poids restent équilibrés et le regret reste de l\'ordre de $\\sqrt T$ : regret / $T\\to0$.'}</span>`);
      S.request(); Cp.request();
    }
    recompute();
  });
})(window.ML);
