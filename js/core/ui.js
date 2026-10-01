/* ==========================================================================
   ML.ui — widgets (cadre de scène, sliders, menus, boutons, lecteurs)
   ML.page — démarrage d'une page : KaTeX, sommaire, preuves pas à pas,
             initialisation paresseuse des scènes.
   ========================================================================== */
(function (ML) {
  'use strict';
  const M = ML.math;

  // ---------- KaTeX ----------
  ML.katex = (el, tex, display = false) => {
    try { katex.render(tex, el, { throwOnError: false, displayMode: display, strict: false, trust: true }); }
    catch (e) { el.textContent = tex; }
  };
  const MATH_OPTS = {
    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\[', right: '\\]', display: true }, { left: '$', right: '$', display: false }, { left: '\\(', right: '\\)', display: false }],
    throwOnError: false, strict: false, trust: true,
    macros: {
      '\\R': '\\mathbb{R}', '\\E': '\\mathbb{E}', '\\bw': '\\mathbf{w}', '\\bx': '\\mathbf{x}', '\\by': '\\mathbf{y}',
      '\\bPhi': '\\boldsymbol{\\Phi}', '\\bphi': '\\boldsymbol{\\phi}', '\\btheta': '\\boldsymbol{\\theta}', '\\N': '\\mathcal{N}',
      '\\argmin': '\\operatorname*{arg\\,min}', '\\argmax': '\\operatorname*{arg\\,max}', '\\T': '^{\\top}', '\\hL': '\\hat{L}',
      '\\EMSE': '\\widehat{E}_{\\mathrm{MSE}}', '\\Var': '\\operatorname{Var}', '\\tr': '\\operatorname{tr}', '\\bmu': '\\boldsymbol{\\mu}',
      '\\bI': '\\mathbf{I}', '\\bA': '\\mathbf{A}', '\\bb': '\\mathbf{b}', '\\bP': '\\mathbf{P}', '\\bSigma': '\\boldsymbol{\\Sigma}',
      '\\hby': '\\hat{\\mathbf{y}}', '\\bg': '\\mathbf{g}', '\\bv': '\\mathbf{v}', '\\bu': '\\mathbf{u}', '\\bz': '\\mathbf{z}', '\\be': '\\mathbf{e}',
    },
  };
  ML.renderMath = el => { if (window.renderMathInElement) renderMathInElement(el, MATH_OPTS); };
  // expose les macros à katex.render aussi
  const _render = katex.render;
  katex.render = (tex, el, o = {}) => _render(tex, el, Object.assign({ macros: Object.assign({}, MATH_OPTS.macros) }, o));

  // ---------- helpers DOM ----------
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v != null) e.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k != null) e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    return e;
  };
  ML.h = h;
  const setMathHTML = (el, html) => { el.innerHTML = html; ML.renderMath(el); };
  ML.setMathHTML = setMathHTML;

  // ---------- cadre de widget ----------
  // ML.widget(host, { title, tag:'2D'|'3D'|'2D + 3D', views:[{name, label, cls, hint}], controls:true|'wide', foot })
  ML.widget = (host, o) => {
    host.classList.add('widget');
    const head = h('div', { class: 'widget-head' },
      h('span', { class: 'w-tag' + (/3D/.test(o.tag || '') ? ' d3' : '') }, o.tag || '2D'),
      (() => { const t = h('span', { class: 'w-title' }); setMathHTML(t, o.title || ''); return t; })(), h('span', { class: 'spacer' }), o.headRight || null);
    const viewsEl = h('div', { class: 'widget-views' });
    const views = {};
    for (const v of o.views || [{ name: 'main' }]) {
      const ve = h('div', { class: 'view ' + (v.cls || '') , style: v.style || '' });
      if (v.label) { const l = h('div', { class: 'view-label' }); setMathHTML(l, v.label); ve.appendChild(l); }
      if (v.hint) { const hn = h('div', { class: 'view-hint' }); setMathHTML(hn, v.hint); ve.appendChild(hn); }
      viewsEl.appendChild(ve); views[v.name] = ve;
    }
    const body = h('div', { class: 'widget-body' }, viewsEl);
    let controls = null;
    if (o.controls) { controls = h('div', { class: 'controls' + (o.controls === 'wide' ? ' wide' : '') }); body.appendChild(controls); }
    // ---- panneau « Affichage » : bascules génériques (grille, axes, étiquettes) + éléments propres à la scène
    const disp = h('div', { class: 'disp-panel', style: 'display:none' });
    const dispBtn = h('button', { class: 'btn disp-btn', title: 'Afficher / masquer des éléments des figures' }, '◉ Affichage');
    dispBtn.addEventListener('click', () => { const open = disp.style.display === 'none'; disp.style.display = open ? '' : 'none'; dispBtn.classList.toggle('on', open); });
    head.appendChild(dispBtn);
    const engines = () => Object.values(views).map(v => v._eng).filter(Boolean);
    const gen = h('div', { class: 'disp-group' }, h('span', { class: 'disp-title' }, 'Général'));
    const sceneGrp = h('div', { class: 'disp-group', style: 'display:none' }, h('span', { class: 'disp-title' }, 'Éléments'));
    disp.append(sceneGrp, gen);
    const mkCheck = (parent, label, on, cb) => {
      const inp = h('input', { type: 'checkbox' }), sp = h('span'), lab = h('label', { class: 'disp-item' }, inp, sp);
      inp.checked = on; setMathHTML(sp, label); inp.addEventListener('change', () => cb(inp.checked)); parent.appendChild(lab);
      return { set: v => { inp.checked = v; } };
    };
    [['grid', 'grille'], ['axes', 'axes et graduations'], ['labels', 'étiquettes (LaTeX)']].forEach(([k, lab]) => mkCheck(gen, lab, true, v => engines().forEach(e => e.setDisplay && e.setDisplay(k, v))));
    const show = {};
    // W.toggle(clé, libellé, état initial, callback?) : ajoute une case ; W.show[clé] donne l'état courant.
    const toggle = (key, label, on = true, cb) => {
      show[key] = on; sceneGrp.style.display = '';
      mkCheck(sceneGrp, label, on, v => { show[key] = v; if (cb) cb(v); engines().forEach(e => e.request()); });
      return () => show[key];
    };
    host.append(head, disp, body);
    let foot = null;
    if (o.foot) { foot = h('div', { class: 'widget-foot' }); setMathHTML(foot, o.foot); host.appendChild(foot); }
    return { host, head, views, controls, foot, show, toggle, openDisplay: () => { disp.style.display = ''; dispBtn.classList.add('on'); }, setFoot: html => { if (!foot) { foot = h('div', { class: 'widget-foot' }); host.appendChild(foot); } setMathHTML(foot, html); } };
  };

  // ---------- contrôles ----------
  const ui = {};
  // slider : { label, min, max, step, value, log (valeur = 10^x), fmt, onInput }
  ui.slider = (parent, o) => {
    const wrap = h('div', { class: 'ctl' }), lab = h('label'), name = h('span'), val = h('span', { class: 'val' });
    setMathHTML(name, o.label); lab.append(name, val);
    const inp = h('input', { type: 'range', min: o.min, max: o.max, step: o.step ?? 'any' });
    const toVal = s => o.log ? 10 ** s : +s, toPos = v => o.log ? Math.log10(v) : v;
    inp.value = toPos(o.value);
    const fmt = o.fmt || (v => M.fmt(v, o.digits ?? 2));
    const upd = (fire = true) => { const v = toVal(inp.value); val.textContent = fmt(v); if (fire && o.onInput) o.onInput(v); };
    inp.addEventListener('input', () => upd());
    wrap.append(lab, inp); parent.appendChild(wrap); upd(false);
    return { el: wrap, input: inp, get: () => toVal(inp.value), set: (v, fire = false) => { inp.value = toPos(v); upd(fire); } };
  };
  ui.select = (parent, o) => {
    const wrap = h('div', { class: 'ctl' }), lab = h('label'); setMathHTML(lab, o.label || '');
    const sel = h('select');
    for (const [v, t] of o.options) sel.appendChild(h('option', { value: v }, t));
    sel.value = o.value ?? o.options[0][0];
    sel.addEventListener('change', () => o.onChange && o.onChange(sel.value));
    wrap.append(lab, sel); parent.appendChild(wrap);
    return { el: wrap, get: () => sel.value, set: v => { sel.value = v; } };
  };
  ui.check = (parent, o) => {
    const wrap = h('div', { class: 'ctl check' }), inp = h('input', { type: 'checkbox' }), lab = h('label'), sp = h('span');
    inp.checked = !!o.value; setMathHTML(sp, o.label); lab.append(inp, sp);
    inp.addEventListener('change', () => o.onChange && o.onChange(inp.checked));
    wrap.appendChild(lab); parent.appendChild(wrap);
    return { el: wrap, get: () => inp.checked, set: v => { inp.checked = v; } };
  };
  ui.buttons = (parent, list) => {
    const row = h('div', { class: 'btn-row' }), out = {};
    for (const b of list) {
      const e = h('button', { class: 'btn' + (b.primary ? ' primary' : ''), title: b.title || '' }); setMathHTML(e, b.label);
      e.addEventListener('click', () => b.onClick(e)); row.appendChild(e); out[b.id || b.label] = e;
    }
    parent.appendChild(row); return out;
  };
  ui.readout = parent => { const e = h('div', { class: 'readout' }); parent.appendChild(e); return { el: e, set: html => setMathHTML(e, html) }; };
  ui.sep = parent => parent.appendChild(h('div', { class: 'ctl-sep' }));
  ui.title = (parent, t) => { const e = h('div', { class: 'ctl-title' }); setMathHTML(e, t); parent.appendChild(e); return e; };
  ui.note = (parent, html) => { const e = h('div', { class: 'c-dim', style: 'font-size:12.5px;line-height:1.5' }); setMathHTML(e, html); parent.appendChild(e); return e; };
  // Lecteur pour algorithmes itératifs : play / pause / pas / reset + vitesse
  ui.player = (parent, o) => {
    let playing = false, acc = 0, last = 0, raf = 0;
    const speed = ui.slider(parent, { label: 'vitesse (pas/s)', min: 0, max: 2, value: o.speed || 8, log: true, fmt: v => v.toFixed(v < 10 ? 1 : 0) });
    const tick = t => {
      if (!playing) return;
      const dt = last ? (t - last) / 1000 : 0; last = t; acc += dt * speed.get();
      let n = 0; while (acc >= 1 && n < 50) { acc -= 1; n++; if (o.step() === false) { stop(); break; } }
      raf = requestAnimationFrame(tick);
    };
    const btns = ui.buttons(parent, [
      { id: 'play', label: '▶ Lecture', primary: true, onClick: () => playing ? stop() : start() },
      { id: 'step', label: 'Pas +1', onClick: () => { stop(); o.step(); } },
      { id: 'reset', label: '↺ Reset', onClick: () => { stop(); o.reset(); } },
    ]);
    function start() { playing = true; last = 0; acc = 1; btns.play.textContent = '❚❚ Pause'; raf = requestAnimationFrame(tick); }
    function stop() { playing = false; cancelAnimationFrame(raf); btns.play.textContent = '▶ Lecture'; }
    return { start, stop, get playing() { return playing; } };
  };
  ML.ui = ui;

  // Boucle d'animation simple : fn(dt, t) renvoie false pour s'arrêter.
  ML.loop = fn => { let last = performance.now(), id = 0, alive = true; const f = t => { if (!alive) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; if (fn(dt, t) === false) { alive = false; return; } id = requestAnimationFrame(f); }; id = requestAnimationFrame(f); return () => { alive = false; cancelAnimationFrame(id); }; };
  ML.tween = (ms, fn, done) => { const t0 = performance.now(); return ML.loop(() => { const u = M.clamp((performance.now() - t0) / ms, 0, 1); fn(M.smooth(u)); if (u >= 1) { done && done(); return false; } }); };

  // ---------- version en ligne (GitHub Pages) ----------
  // En ligne : on masque ce qui n'est pas publié (page Devoirs, corrigés de devoirs : classe .local-only)
  // et on désactive les liens vers les PDF du cours (../Slides, ../Textbooks, ../Homework), restés en local.
  // Forcer le mode en ligne pour tester : ajouter ?online=1 à l'URL.
  ML.online = /[?&]online=1/.test(location.search) ||
    (/^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname));
  if (ML.online) {
    const applyOnline = () => {
      document.querySelectorAll('.local-only').forEach(e => { e.style.display = 'none'; });
      document.querySelectorAll('a[href^="../"]').forEach(a => {
        a.removeAttribute('href'); a.removeAttribute('target'); a.classList.add('offline-ref');
        a.title = 'Document du cours (PDF) disponible uniquement dans la version locale';
      });
    };
    document.addEventListener('DOMContentLoaded', applyOnline);
    window.addEventListener('load', applyOnline);
  }

  // ---------- registre de scènes (initialisation paresseuse) ----------
  const registry = new Map();
  ML.scene = (id, init) => registry.set(id, init);
  ML._registry = registry; // accès de test/débogage

  // ---------- démarrage de page ----------
  ML.page = {
    boot() {
      ML.renderMath(document.querySelector('main') || document.body);
      this.buildTOC();
      this.proofs();
      this.scenes();
      if (location.hash) setTimeout(() => { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }, 350);
    },
    buildTOC() {
      const side = document.querySelector('.sidebar .toc'); if (!side) return;
      const heads = [...document.querySelectorAll('main h2[id], main h3[id]')];
      const links = heads.map(hd => {
        const a = h('a', { href: '#' + hd.id, class: hd.tagName === 'H3' ? 'l2' : '' });
        const cl = hd.cloneNode(true); cl.querySelectorAll('.src').forEach(e => e.remove());
        const num = cl.querySelector('.num'); if (num) num.textContent = num.textContent + '  ';
        a.innerHTML = hd.dataset.toc || cl.innerHTML;
        side.appendChild(a); return [hd, a];
      });
      const obs = new IntersectionObserver(() => {
        let cur = null; for (const [hd, a] of links) { if (hd.getBoundingClientRect().top < 140) cur = a; }
        links.forEach(([, a]) => a.classList.toggle('current', a === cur));
        if (cur) { const r = cur.getBoundingClientRect(), sr = side.parentElement.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) cur.scrollIntoView({ block: 'nearest' }); }
      }, { rootMargin: '0px 0px -70% 0px' });
      heads.forEach(hd => obs.observe(hd));
    },
    // <details class="proof"><summary>…</summary><div class="proof-body"><div class="step">…</div>…</div></details>
    proofs() {
      document.querySelectorAll('details.proof').forEach(d => {
        const body = d.querySelector('.proof-body'); if (!body) return;
        const steps = [...body.querySelectorAll(':scope > .step')];
        if (steps.length < 2) return;
        const bar = h('div', { class: 'proof-controls' });
        let mode = 'all', k = 0;
        const bStep = h('button', { class: 'btn' }, 'Mode pas à pas'), bNext = h('button', { class: 'btn primary', style: 'display:none' }, 'Étape suivante ▸'), bAll = h('button', { class: 'btn', style: 'display:none' }, 'Tout afficher');
        const upd = () => {
          body.classList.toggle('stepped', mode === 'step');
          steps.forEach((s, i) => s.classList.toggle('shown', i < k));
          bNext.style.display = mode === 'step' && k < steps.length ? '' : 'none';
          bAll.style.display = mode === 'step' ? '' : 'none';
          bStep.textContent = mode === 'step' ? `Étape ${k}/${steps.length} — recommencer` : 'Mode pas à pas';
        };
        bStep.onclick = () => { mode = 'step'; k = 1; upd(); };
        bNext.onclick = () => { k++; upd(); };
        bAll.onclick = () => { mode = 'all'; upd(); };
        bar.append(bStep, bNext, bAll); body.insertBefore(bar, body.firstChild);
      });
    },
    scenes() {
      const els = document.querySelectorAll('[data-scene]');
      const io = new IntersectionObserver(es => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          const id = e.target.dataset.scene, init = registry.get(id);
          if (!init) { e.target.textContent = 'Scène introuvable : ' + id; continue; }
          try { init(e.target); } catch (err) { console.error('Scène', id, err); e.target.innerHTML = '<div style="padding:20px;color:#fc6255">Erreur dans la scène « ' + id + ' » : ' + err.message + '</div>'; }
        }
      }, { rootMargin: '400px 0px' });
      els.forEach(e => io.observe(e));
    },
  };
})(window.ML);
