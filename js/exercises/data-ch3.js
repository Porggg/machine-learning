/* Exercices — Chapitre 3 : SVM */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  { id: 'sv1', ch: 3, type: 'deriv', title: 'Distance à un hyperplan', src: 'Slides p.4–5',
    text: R`Si $\bx_1,\bx_2$ sont sur l'hyperplan $\bw\T\bx+b = 0$, alors $\bw\T(\bx_1-\bx_2) = \blank{a}$ : $\bw$ est [[b]] à l'hyperplan. En écrivant $\bx = \bx_p + \tau\frac{\bw}{\|\bw\|}$ avec $f(\bx_p) = 0$, on obtient $\tau = \blank{c}$ et $\rho_f(\bx) = \blank{d}$.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'word', ans: ['orthogonal', 'normal', 'perpendiculaire'], tex: 'orthogonal' },
      c: { kind: 'expr', ans: [R`\frac{f(x)}{\|w\|}`, 'f(x)/||w||', 'f(x)/‖w‖'], tex: R`\frac{f(\bx)}{\|\bw\|}` },
      d: { kind: 'expr', ans: [R`\frac{|f(x)|}{\|w\|}`, '|f(x)|/||w||', '|f(x)|/‖w‖'], tex: R`\frac{|f(\bx)|}{\|\bw\|}` },
    },
    solution: R`$0 = f(\bx_p) = \bw\T\bx - \tau\frac{\bw\T\bw}{\|\bw\|} + b = f(\bx) - \tau\|\bw\|$.` },

  { id: 'sv2', ch: 3, type: 'deriv', title: 'Du max-min au problème canonique', src: 'Slides p.7–8',
    text: R`$\rho = \max_f\min_j\frac{y_jf(\bx_j)}{\|\bw\|}$ est invariant si l'on remplace $(\bw,b)$ par $(\lambda\bw,\lambda b)$ avec $\lambda\blank{a}$. On impose donc $\min_jy_j(\bw\T\bx_j+b) = \blank{b}$, et le problème devient
$$\min_{\bw,b}\ \blank{c}\quad\text{s.c.}\quad\blank{d}\ \ \forall i.$$`,
    blanks: {
      a: { kind: 'expr', ans: ['>0'], tex: '>0' }, b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: [R`\frac12\|w\|^2`, '1/2 ||w||^2', '½‖w‖²', R`\frac{1}{2}\|w\|^2`], tex: R`\frac12\|\bw\|^2` },
      d: { kind: 'expr', ans: [R`y_i(w^\top x_i+b)\ge1`, 'y_i(w^T x_i + b) >= 1', 'y_i(wᵀx_i+b)≥1'], tex: R`y_i(\bw\T\bx_i+b)\ge1` },
    },
    solution: R`À l'optimum, la marge vaut $\rho = 1/\|\bw^*\|$ ; maximiser $1/\|\bw\|$ ⇔ minimiser $\frac12\|\bw\|^2$.` },

  { id: 'sv3', ch: 3, type: 'def', title: 'Lagrangien et relaxation', src: 'Slides p.14–17',
    text: R`Pour $\min L(\bx)$ s.c. $g_i(\bx)\le0$ : $\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx) + \sum_i\lambda_ig_i(\bx)$ avec $\lambda_i\,\blank{a}$. On a $J(\bx) = L(\bx) + \sum_i\delta_{\R_-}(g_i(\bx)) = \max_{\boldsymbol\lambda\ge0}\blank{b}$. Le dual est $\max_{\boldsymbol\lambda\ge0}D(\boldsymbol\lambda)$ avec $D(\boldsymbol\lambda) = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['>=0', R`\ge0`, '≥0', R`\geq 0`], tex: R`\ge0` },
      b: { kind: 'expr', ans: [R`\mathfrak L(x,\lambda)`, 'L(x,lambda)', R`\mathcal L(x,\lambda)`, 'L(x,λ)'], tex: R`\mathfrak L(\bx,\boldsymbol\lambda)` },
      c: { kind: 'expr', ans: [R`\min_x\mathfrak L(x,\lambda)`, 'min_x L(x,lambda)', R`\min_x\mathcal L(x,\lambda)`, 'min_x L(x,λ)'], tex: R`\min_\bx\mathfrak L(\bx,\boldsymbol\lambda)` },
    } },

  { id: 'sv4', ch: 3, type: 'deriv', title: 'Inégalité minimax et dualité faible', src: 'Slides p.18–19',
    text: R`Soit $\psi(y) = \min_x\rho(x,y)$. Pour tous $x,y$ : $\psi(y)\,\blank{a}\,\rho(x,y)$, donc $\max_y\psi(y)\le\max_y\rho(x,y)$ pour tout $x$, d'où $\max_y\min_x\rho\ \blank{a}\ \blank{b}$. Appliqué au Lagrangien : $d^*\,\blank{a}\,p^*$ ([[c]]).`,
    blanks: {
      a: { kind: 'expr', ans: ['<=', R`\le`, '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: [R`\min_x\max_y\rho(x,y)`, 'min_x max_y rho(x,y)', 'min_x max_y ρ(x,y)', R`\min_x\max_y\rho`], tex: R`\min_x\max_y\rho(x,y)` },
      c: { kind: 'word', ans: ['dualité faible', 'dualite faible', 'weak duality'], tex: 'dualité faible' },
    } },

  { id: 'sv5', ch: 3, type: 'def', title: 'Contraintes d\'égalité', src: 'Slides p.21–22',
    text: R`$h(\bx) = 0$ s'écrit $h\le0$ et $-h\le0$ ; $\lambda_1h - \lambda_2h = \nu h$ avec $\nu = \blank{a}$, et $\nu$ appartient à [[b]] (pas de contrainte de signe).`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda_1-\lambda_2`, 'lambda_1 - lambda_2', 'λ1-λ2', 'λ_1-λ_2'], tex: R`\lambda_1-\lambda_2` },
      b: { kind: 'word', ans: ['R', 'ℝ', 'les réels', 'reels', 'réels', 'real numbers'], tex: R`$\R$` },
    } },

  { id: 'sv6', ch: 3, type: 'deriv', title: 'Dual de la SVM (marge dure)', src: 'Slides p.26–28',
    text: R`$\mathfrak L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2 + \sum_i\alpha_i\big(\blank{a}\big)$. Stationnarité : $\bw = \blank{b}$ et $\blank{c} = 0$. En substituant :
$$D(\boldsymbol\alpha) = -\frac12\sum_{i,j}\alpha_i\alpha_j\,\blank{d} + \sum_i\alpha_i.$$`,
    blanks: {
      a: { kind: 'expr', ans: [R`1-y_i(w^\top x_i+b)`, '1 - y_i(w^T x_i + b)', '1-y_i(wᵀx_i+b)'], tex: R`1-y_i(\bw\T\bx_i+b)` },
      b: { kind: 'expr', ans: [R`\sum_i\alpha_iy_ix_i`, 'sum_i alpha_i y_i x_i', 'Σα_i y_i x_i', R`\sum_{i=1}^N\alpha_iy_ix_i`, 'sum alpha_i y_i x_i'], tex: R`\sum_i\alpha_iy_i\bx_i` },
      c: { kind: 'expr', ans: [R`\sum_i\alpha_iy_i`, 'sum_i alpha_i y_i', 'Σα_i y_i', R`\sum_{i=1}^N\alpha_iy_i`, 'sum alpha_i y_i'], tex: R`\sum_i\alpha_iy_i` },
      d: { kind: 'expr', ans: [R`y_iy_jx_i^\top x_j`, 'y_i y_j x_i^T x_j', 'y_i y_j x_iᵀx_j'], tex: R`y_iy_j\bx_i\T\bx_j` },
    } },

  { id: 'sv7', ch: 3, type: 'def', title: 'Vecteurs de support et biais', src: 'Slides p.29–30',
    text: R`Complémentarité : $\alpha_i^*\big(1-y_i(\bw^{*\top}\bx_i+b^*)\big) = \blank{a}$. Si $\alpha_i^*>0$, le point est sur le bord de la marge : c'est un [[b]], et $b^* = \blank{c}$. Le dual a $\blank{d}$ variables, indépendamment de la dimension des features.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'word', ans: ['vecteur de support', 'support vector', 'vecteur support'], tex: 'vecteur de support' },
      c: { kind: 'expr', ans: [R`y_i-w^{*\top}x_i`, 'y_i - w^T x_i', R`y_i-w^\top x_i`, 'y_i - w*^T x_i', R`y_i-\sum_j\alpha_jy_jx_j^\top x_i`], tex: R`y_i-\bw^{*\top}\bx_i` },
      d: { kind: 'expr', ans: ['N'], tex: 'N' },
    } },

  { id: 'sv8', ch: 3, type: 'deriv', title: 'Marge souple : dual et hinge', src: 'Slides p.32–37',
    text: R`Primal : $\min\frac12\|\bw\|^2 + \blank{a}$ s.c. $y_i(\bw\T\bx_i+b)\ge\blank{b}$, $\xi_i\ge0$. La stationnarité en $\xi_i$ donne $C-\alpha_i-\beta_i = 0$, d'où la contrainte de boîte $\blank{c}\le\alpha_i\le\blank{d}$. À $(\bw,b)$ fixés, $\xi_i^* = \blank{e}$ avec $t_i = y_i(\bw\T\bx_i+b)$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`C\sum_i\xi_i`, 'C sum xi_i', 'CΣξ_i', R`C\sum_{i=1}^N\xi_i`, 'C sum_i xi_i'], tex: R`C\sum_i\xi_i` },
      b: { kind: 'expr', ans: [R`1-\xi_i`, '1 - xi_i', '1-ξ_i'], tex: R`1-\xi_i` },
      c: { kind: 'num', ans: 0, tol: 0 }, d: { kind: 'expr', ans: ['C'], tex: 'C' },
      e: { kind: 'expr', ans: [R`\max(0,1-t_i)`, 'max(0, 1 - t_i)', R`\max\{0,1-t_i\}`], tex: R`\max\{0,1-t_i\}` },
    } },

  { id: 'sv9', ch: 3, type: 'def', title: 'Kernel trick', src: 'Slides p.39–43',
    text: R`Le dual ne dépend des features que via $\blank{a}$, remplacé par un noyau $\kappa(\bx_i,\bx_j)$. En 2D, $(\bx\T\bx')^2 = \bphi(\bx)\T\bphi(\bx')$ avec $\bphi(\bx) = (x_1^2,\ \blank{b},\ x_2^2)$. Le noyau RBF est $\kappa(\bx,\bx') = \exp\big(\blank{c}\big)$ et sa feature map est de dimension [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\phi(x_i)^\top\phi(x_j)`, 'phi(x_i)^T phi(x_j)', 'φ(x_i)ᵀφ(x_j)'], tex: R`\bphi(\bx_i)\T\bphi(\bx_j)` },
      b: { kind: 'expr', ans: [R`\sqrt2x_1x_2`, 'sqrt(2) x_1 x_2', '√2 x_1 x_2', R`\sqrt{2}x_1x_2`, 'sqrt2 x1 x2', '√2x1x2'], tex: R`\sqrt2\,x_1x_2` },
      c: { kind: 'expr', ans: [R`-\frac{\|x-x'\|^2}{2\sigma^2}`, "-||x-x'||^2/(2 sigma^2)", "-‖x-x'‖²/(2σ²)"], tex: R`-\frac{\|\bx-\bx'\|^2}{2\sigma^2}` },
      d: { kind: 'word', ans: ['infinie', 'infinite', 'infini'], tex: 'infinie' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'sv10', ch: 3, type: 'calc', title: 'Distance point–hyperplan', src: 'Slides p.4',
    gen: r => {
      const w = [[3, 4], [1, 1], [2, 0], [5, 12]][r.int(4)], b = r.int(5) - 2, x = [r.int(5) - 2, r.int(5) - 2];
      const fx = M.dot(w, x) + b, n = M.norm(w);
      return { text: R`$\bw = (${w.join(', ')})$, $b = ${b}$, $\bx = (${x.join(', ')})$. $f(\bx) = \blank{a}$, $\|\bw\| = \blank{b}$, distance $\rho_f(\bx) = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: fx, tol: 0 }, b: { kind: 'num', ans: n }, c: { kind: 'num', ans: Math.abs(fx) / n } },
        solution: R`$f(\bx) = ${w[0]}\cdot${x[0]} + ${w[1]}\cdot${x[1]} + ${b} = ${fx}$, $\|\bw\| = ${f(n)}$, $\rho = ${f(Math.abs(fx) / n)}$.` };
    } },

  { id: 'sv11', ch: 3, type: 'calc', title: 'SVM en 1D à la main', src: 'Slides p.11',
    gen: r => {
      const p = r.int(3) - 2, q = p + 1 + r.int(3);
      const w = 2 / (q - p), b = -(q + p) / (q - p);
      return { text: R`En 1D, les points négatifs sont $\le ${p}$ (le plus proche en $${p}$) et les positifs $\ge ${q}$ (le plus proche en $${q}$). L'hyperplan canonique $wx+b$ vérifie $w\cdot${p}+b = -1$ et $w\cdot${q}+b = 1$ : $w = \blank{a}$, $b = \blank{b}$, marge $\rho = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: w }, b: { kind: 'num', ans: b }, c: { kind: 'num', ans: (q - p) / 2 } },
        solution: R`En soustrayant : $w(${q}-(${p})) = 2$. La frontière est au milieu, $x = ${(p + q) / 2}$, et $\rho = 1/|w| = ${(q - p) / 2}$.` };
    } },

  { id: 'sv12', ch: 3, type: 'calc', title: 'Évaluer des noyaux', src: 'Slides p.40–43',
    gen: r => {
      const x = [r.int(3), r.int(3) - 1], y = [r.int(3) - 1, r.int(3)], s = [0.5, 1, 2][r.int(3)];
      const lin = M.dot(x, y), d2 = (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2;
      return { text: R`$\bx = (${x.join(', ')})$, $\bx' = (${y.join(', ')})$. Linéaire $\bx\T\bx' = \blank{a}$ ; polynomial $(\bx\T\bx')^2 = \blank{b}$ ; RBF avec $\sigma = ${s}$ : $\kappa = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: lin, tol: 0 }, b: { kind: 'num', ans: lin * lin, tol: 0 }, c: { kind: 'num', ans: Math.exp(-d2 / (2 * s * s)) } },
        solution: R`$\|\bx-\bx'\|^2 = ${d2}$, donc $\kappa_{\text{RBF}} = e^{-${d2}/(2\cdot${s}^2)} = ${f(Math.exp(-d2 / (2 * s * s)))}$.` };
    } },

  { id: 'sv13', ch: 3, type: 'calc', title: 'Dualité : le petit problème des slides', src: 'Hors slides', srcKind: 'extra',
    gen: r => {
      const a = 2 + r.int(3), c = r.int(2);
      return { text: R`$\min_x(x-${a})^2$ s.c. $x\le${c}$. Lagrangien $(x-${a})^2 + \lambda(x-${c})$. Minimiser en $x$ donne $x(\lambda) = \blank{a}$ ; alors $D(\lambda) = \lambda(${a}-${c}) - \frac{\lambda^2}{4}$ est maximale en $\lambda^* = \blank{b}$, et $d^* = \blank{c} = p^*$.`,
        blanks: { a: { kind: 'expr', ans: [R`${a}-\lambda/2`, `${a} - lambda/2`, `${a}-λ/2`, R`${a}-\frac{\lambda}{2}`], tex: R`${a}-\frac\lambda2` }, b: { kind: 'num', ans: 2 * (a - c) }, c: { kind: 'num', ans: (a - c) ** 2 } },
        solution: R`$D'(\lambda) = (${a}-${c}) - \lambda/2 = 0\Rightarrow\lambda^* = ${2 * (a - c)}$, $D(\lambda^*) = (${a}-${c})^2 = ${(a - c) ** 2}$ = $p^*$ atteint en $x^* = ${c}$ : dualité forte.` };
    } },
  );
})(window.ML);
