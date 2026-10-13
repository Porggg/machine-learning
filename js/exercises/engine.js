/* ==========================================================================
   Page d'entraînement — exercices à trous (définitions, dérivations, calculs)
   Format d'un exercice (voir data-ch*.js) :
   { id, ch, type: 'def'|'deriv'|'calc', title, src, text, blanks, solution, gen? }
   - text : HTML + LaTeX. Un trou s'écrit \blank{a} dans une formule, ou [[a]] dans le texte.
   - blanks : { a: { kind: 'expr'|'word'|'num', ans: [variantes…] | nombre, tex: 'affichage LaTeX', hint, tol } }
   - gen(rng) : pour les calculs, renvoie { text, blanks, solution } avec des valeurs tirées au hasard.
   ========================================================================== */
(function (ML) {
  'use strict';
  const EX = ML.EX = { list: [] };
  EX.add = (...xs) => EX.list.push(...xs);

  // ---------- normalisation ----------
  const UNI = [['²', '^2'], ['³', '^3'], ['⁻¹', '^-1'], ['ᵀ', '^t'], ['⊤', '^t'], ['′', "'"], ['−', '-'], ['–', '-'], ['·', '*'], ['×', '*'], ['‖', '||'], ['∑', 'sum'], ['∇', 'nabla'],
    ['Σ', 'sum'], ['σ', 'sigma'], ['Φ', 'phi'], ['φ', 'phi'], ['ϕ', 'phi'], ['λ', 'lambda'], ['α', 'alpha'], ['β', 'beta'], ['γ', 'gamma'], ['η', 'eta'], ['μ', 'mu'], ['ξ', 'xi'], ['τ', 'tau'], ['ρ', 'rho'],
    ['κ', 'kappa'], ['θ', 'theta'], ['π', 'pi'], ['ν', 'nu'], ['ε', 'epsilon'], ['∞', 'inf'], ['√', 'sqrt'], ['≤', '<='], ['≥', '>='], ['ŷ', 'yhat'], ['ℓ', 'l'], ['∈', 'in'], ['ℝ', 'r']];
  const MACROS = [['\\hby', 'yhat'], ['\\bPhi', 'phi'], ['\\bphi', 'phi'], ['\\bSigma', 'sigma'], ['\\bmu', 'mu'], ['\\btheta', 'theta'], ['\\bw', 'w'], ['\\bx', 'x'], ['\\by', 'y'], ['\\bI', 'i'], ['\\bA', 'a'], ['\\bb', 'b'], ['\\bv', 'v'], ['\\bg', 'g'], ['\\bh', 'h'], ['\\bz', 'z'], ['\\T', '^t'], ['\\R', 'r'], ['\\E', 'e']];
  EX.normExpr = s => {
    s = String(s);
    for (const [a, b] of UNI) s = s.split(a).join(b);
    for (const [a, b] of MACROS) s = s.split(a).join(b);
    s = s.replace(/\\(left|right|big|Big|bigg|Bigg|displaystyle)/g, '');
    for (let k = 0; k < 4; k++) s = s.replace(/\\(mathbf|boldsymbol|bm|mathrm|text|textbf|operatorname|mathit|mathcal|mathsf|mathfrak|mathbb)\s*\{([^{}]*)\}/g, '$2');
    s = s.replace(/\\(mathbf|boldsymbol|bm|mathrm|mathcal|mathfrak|mathsf|mathit|mathbb)\s*(?=[\\A-Za-z0-9])/g, '');
    s = s.replace(/\\(leq|le)(?![a-zA-Z])/g, '<=').replace(/\\(geq|ge)(?![a-zA-Z])/g, '>=').replace(/\\(neq|ne)(?![a-zA-Z])/g, '!=');
    s = s.replace(/\\hat\s*\{?\s*y\s*\}?/g, 'yhat').replace(/\\hat\s*\{([^{}]*)\}/g, '$1hat');
    s = s.replace(/\^\s*\{?\s*\\top\s*\}?/g, '^t').replace(/\\top/g, '^t').replace(/\^\s*\{?\s*T\s*\}?/g, '^t');
    for (let k = 0; k < 4; k++) s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)');
    s = s.replace(/\\\|/g, '||').replace(/\\mid/g, '|').replace(/\\(cdot|times|ast)/g, '*').replace(/\\[,;:! ]/g, '').replace(/\\quad|\\qquad/g, '');
    s = s.replace(/\\([a-zA-Z]+)/g, '$1');
    s = s.replace(/[{}\s*$]/g, '').replace(/\[/g, '(').replace(/\]/g, ')').replace(/\\/g, '');
    s = s.toLowerCase();
    s = s.replace(/lambdai/g, 'lambdai').replace(/exp\(([^()]*)\)/g, 'e^($1)');
    // parenthèses autour d'un seul symbole : (a) → a
    for (let k = 0; k < 3; k++) s = s.replace(/\(([a-z0-9_]+(\^[a-z0-9-]+)?)\)/g, '$1');
    return s;
  };
  EX.normWord = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9 +\-]/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^(la|le|les|l|un|une|des|the|a|an) /, '');
  EX.evalNum = s => {
    let t = String(s).trim().replace(/,/g, '.').replace(/−/g, '-').replace(/×|·/g, '*').replace(/\^/g, '**').replace(/π|pi/gi, '(Math.PI)').replace(/\bln\b/g, 'Math.log').replace(/\bexp\b/g, 'Math.exp').replace(/sqrt|√/g, 'Math.sqrt');
    if (!/^[0-9+\-*/().eE\s]*$/.test(t.replace(/Math\.(log|exp|sqrt|PI)/g, ''))) return NaN;
    try { const v = Function('"use strict";return (' + t + ')')(); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
  };
  EX.check = (blank, input) => {
    if (!String(input).trim()) return null;
    if (blank.kind === 'num') {
      const v = EX.evalNum(input), a = +blank.ans, tol = blank.tol ?? 0.01;
      return isFinite(v) && Math.abs(v - a) <= Math.max(1e-3, tol * Math.abs(a));
    }
    const list = Array.isArray(blank.ans) ? blank.ans : [blank.ans];
    if (blank.kind === 'word') { const u = EX.normWord(input); return list.some(a => { const n = EX.normWord(a); return u === n || (n.length > 5 && u.includes(n)); }); }
    const u = EX.normExpr(input); return list.some(a => EX.normExpr(a) === u);
  };

  // ---------- rendu ----------
  const blankTex = k => `\\boxed{\\color{#f4d345}{\\,\\textbf{(${k})}\\,}}`;
  const fillTex = (tex, color) => `\\boxed{\\color{${color}}{${tex}}}`;
  const prep = (html, map) => html.replace(/\\blank\{(\w+)\}/g, (_, k) => map ? map(k, true) : blankTex(k)).replace(/\[\[(\w+)\]\]/g, (_, k) => map ? map(k, false) : `<span class="blank-lbl">(${k})</span>`);
  const TYPES = { def: ['définition', 'c-blue'], deriv: ['démonstration à trous', 'c-gold'], calc: ['calcul', 'c-green'], hw: ['devoir', 'c-purple'] };

  // ---------- progression (enregistrée dans ce navigateur) ----------
  const KEY = 'ex-progress-v1';
  let prog = {};
  try { prog = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { prog = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) {} };
  EX.isDone = id => !!prog[id];
  EX.setDone = (id, how) => { if (how) prog[id] = { how, t: Date.now() }; else delete prog[id]; save(); EX.onProgress && EX.onProgress(); };
  EX.resetProgress = () => { prog = {}; save(); EX.onProgress && EX.onProgress(); };

  function card(ex, num) {
    const h = ML.h;
    const el = h('div', { class: 'ex-card', 'data-ch': ex.ch, 'data-type': ex.type, 'data-id': ex.id });
    let inst = ex.gen ? ex.gen(ML.math.rng(Math.floor(Math.random() * 1e9))) : ex;
    const head = h('div', { class: 'ex-head' });
    const body = h('div', { class: 'ex-body' }), inputs = h('div', { class: 'ex-inputs' }), fb = h('div', { class: 'ex-feedback' }), sol = h('div', { class: 'ex-solution' });
    const bar = h('div', { class: 'btn-row' });
    el.append(head, body, inputs, bar, fb, sol);
    const state = {};
    function render() {
      head.innerHTML = `<span class="ex-num">${num}</span><span class="ex-title">${ex.title}</span><span class="spacer"></span><span class="ex-done"></span><span class="ex-type ${TYPES[ex.type][1]}">${TYPES[ex.type][0]}</span> <span class="src ${ex.srcKind || 'slides'}">${ex.src || ''}</span>`;
      ML.renderMath(head); paintDone();
      ML.setMathHTML(body, prep(inst.text));
      inputs.innerHTML = ''; fb.innerHTML = ''; sol.innerHTML = ''; sol.style.display = 'none';
      for (const k of Object.keys(inst.blanks)) {
        const b = inst.blanks[k];
        const row = h('div', { class: 'ex-row' });
        const lab = h('span', { class: 'ex-lab' }, `(${k})`);
        const inp = h('input', { type: 'text', class: 'ex-in', placeholder: b.kind === 'num' ? 'nombre (ex. 0.25, 1/4, ln(2))' : b.kind === 'word' ? 'mot ou expression' : 'formule (LaTeX ou texte : w^T x, (X^TX)^-1, \\lambda…)', spellcheck: 'false', autocomplete: 'off' });
        const prev = h('span', { class: 'ex-prev' }), mark = h('span', { class: 'ex-mark' });
        inp.addEventListener('input', () => { if (b.kind === 'expr' && inp.value.trim()) ML.katex(prev, inp.value); else prev.textContent = ''; mark.textContent = ''; row.classList.remove('ok', 'ko'); });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') verify(); });
        row.append(lab, inp, prev, mark);
        if (b.hint) { const hi = h('span', { class: 'ex-hint' }); ML.setMathHTML(hi, 'indice : ' + b.hint); hi.style.display = 'none'; row.appendChild(hi); }
        inputs.appendChild(row); state[k] = { inp, row, mark };
      }
    }
    function verify() {
      let ok = 0, tot = 0;
      for (const k of Object.keys(inst.blanks)) {
        const r = EX.check(inst.blanks[k], state[k].inp.value); tot++;
        state[k].row.classList.toggle('ok', r === true); state[k].row.classList.toggle('ko', r === false);
        state[k].mark.textContent = r === true ? '✓' : r === false ? '✗' : '…';
        if (r) ok++;
      }
      if (ok === tot) {
        fb.innerHTML = `<b>${ok}/${tot}</b> trou(s) correct(s) — bravo, exercice validé !`;
        EX.setDone(ex.id, 'auto');
      } else {
        fb.innerHTML = `<b>${ok}/${tot}</b> trou(s) correct(s). La vérification automatique est tolérante mais pas parfaite : compare avec la correction. Si ta réponse était juste (faute de frappe, autre écriture équivalente), tu peux valider toi-même. `;
        const b = h('button', { class: 'btn', type: 'button' }, '✓ j\'avais raison');
        b.addEventListener('click', () => { EX.setDone(ex.id, 'manual'); fb.innerHTML = 'Exercice validé à la main.'; });
        fb.appendChild(b);
      }
    }
    function paintDone() {
      const d = prog[ex.id], badge = head.querySelector('.ex-done');
      el.classList.toggle('done', !!d);
      if (!badge) return;
      badge.innerHTML = d ? `<span title="cliquer pour annuler la validation">✓ validé${d.how === 'manual' ? ' (à la main)' : ''} ✕</span>` : '';
      badge.onclick = d ? () => EX.setDone(ex.id, null) : null;
    }
    el._paint = paintDone;
    function correction() {
      const colored = (k, inMath) => { const b = inst.blanks[k], tex = b.tex ?? (b.kind === 'num' ? String(+(+b.ans).toPrecision(6)) : (Array.isArray(b.ans) ? b.ans[0] : b.ans)); return inMath ? fillTex(tex, '#83c167') : `<span class="blank-fill">${b.kind === 'word' ? tex : '$' + tex + '$'}</span>`; };
      sol.style.display = '';
      ML.setMathHTML(sol, `<div class="ex-sol-title">Correction</div>${prep(inst.text, colored)}${inst.solution ? `<div class="ex-expl">${inst.solution}</div>` : ''}`);
    }
    const btns = [
      { label: 'Vérifier', primary: true, onClick: verify },
      { label: 'Indices', onClick: () => inputs.querySelectorAll('.ex-hint').forEach(e => { e.style.display = e.style.display === 'none' ? '' : 'none'; }) },
      { label: 'Correction', onClick: () => sol.style.display === 'none' || !sol.innerHTML ? correction() : (sol.style.display = 'none') },
      { label: 'Effacer', onClick: render },
    ];
    if (ex.gen) btns.push({ label: '🎲 nouvelles valeurs', onClick: () => { inst = ex.gen(ML.math.rng(Math.floor(Math.random() * 1e9))); render(); } });
    ML.ui.buttons(bar, btns);
    render();
    return el;
  }

  // ---------- page ----------
  EX.boot = () => {
    const host = document.getElementById('ex-list'), f = { ch: 'all', type: 'all', st: 'all' };
    // ordre du cours : par chapitre (tri stable), quel que soit le fichier d'où vient l'exercice
    const sorted = EX.list.map((ex, i) => [ex, i]).sort((a, b) => a[0].ch - b[0].ch || a[1] - b[1]).map(a => a[0]);
    const cards = sorted.map((ex, i) => card(ex, i + 1));
    const inFilter = c => (f.ch === 'all' || c.dataset.ch === f.ch) && (f.type === 'all' || c.dataset.type === f.type);
    const layout = order => { host.innerHTML = ''; let n = 0; order.forEach(c => { const done = EX.isDone(c.dataset.id), show = inFilter(c) && (f.st === 'all' || (f.st === 'done') === done); c.style.display = show ? '' : 'none'; if (show) { n++; c.querySelector('.ex-num').textContent = n; } host.appendChild(c); }); document.getElementById('ex-count').textContent = `${n} exercice(s)`; };
    // barres de progression : sélection courante (chapitre + type), puis détail par chapitre
    const CH = { 1: '1 · linéaire', 2: '2 · logistique', 3: '3 · SVM', 4: '4 · sélection', 5: '5 · réseaux', 6: '6 · en ligne' };
    const barHTML = (d, n) => `<span class="pbar"><i style="width:${n ? (100 * d / n).toFixed(1) : 0}%"></i></span>`;
    const progress = () => {
      const sel = cards.filter(inFilter), d = sel.filter(c => EX.isDone(c.dataset.id)).length;
      const top = document.getElementById('ex-progress');
      if (top) top.innerHTML = `${barHTML(d, sel.length)}<b>${d}</b> / ${sel.length} validé(s)`;
      const det = document.getElementById('ex-progress-detail');
      if (det) det.innerHTML = Object.keys(CH).map(k => { const cs = cards.filter(c => c.dataset.ch === k && (f.type === 'all' || c.dataset.type === f.type)), dd = cs.filter(c => EX.isDone(c.dataset.id)).length; return `<div class="prow"><span class="plab">${CH[k]}</span>${barHTML(dd, cs.length)}<span class="pnum">${dd} / ${cs.length}</span></div>`; }).join('');
    };
    EX.onProgress = () => { cards.forEach(c => c._paint && c._paint()); progress(); if (f.st !== 'all') layout(order); };
    let order = cards.slice();
    document.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
      const [k, v] = b.dataset.f.split(':'); f[k] = v;
      document.querySelectorAll(`[data-f^="${k}:"]`).forEach(x => x.classList.toggle('on', x === b));
      layout(order); progress();
    }));
    document.getElementById('ex-shuffle').addEventListener('click', () => { const r = ML.math.rng(Date.now() % 1e9); order = r.shuffle(cards); layout(order); });
    document.getElementById('ex-reset').addEventListener('click', () => { order = cards.slice(); layout(order); });
    const rst = document.getElementById('ex-progress-reset');
    if (rst) rst.addEventListener('click', () => { if (confirm('Effacer toute ta progression (tous les exercices validés) ?')) EX.resetProgress(); });
    layout(order); progress();
    ML.renderMath(document.querySelector('.ex-intro'));
  };
})(window.ML);
