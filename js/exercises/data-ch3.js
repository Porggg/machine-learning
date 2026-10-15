/* Exercices — Chapitre 3 : SVM (cadre explicite, trous dans les étapes) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<b>Cadre.</b> Données $(\bx_i,y_i)_{i=1}^N$ avec $y_i\in\{-1,+1\}$, classifieur $f(\bx) = \bw\T\bx+b$. SVM à marge dure : $\min_{\bw,b}\frac12\|\bw\|^2$ sous les contraintes $y_i(\bw\T\bx_i+b)\ge1$.<br>`;

  ML.EX.add(
  { id: 'sv1', ch: 3, type: 'deriv', title: 'Démo : distance d\'un point à un hyperplan', src: 'Slides p.4–5',
    text: R`<b>Cadre.</b> $f(\bx) = \bw\T\bx+b$ avec $\bw\ne0$, hyperplan $H = \{\bx : f(\bx) = 0\}$.<br>
Si $\bx_1,\bx_2\in H$, alors $\bw\T(\bx_1-\bx_2) = f(\bx_1)-f(\bx_2) = \blank{a}$ : $\bw$ est [[b]] à toute direction de $H$. On écrit un point quelconque $\bx = \bx_p+\tau\frac{\bw}{\|\bw\|}$, où $\bx_p\in H$ est son projeté orthogonal. Alors $0 = f(\bx_p) = f(\bx)-\tau\,\blank{c}$, donc $\tau = \frac{f(\bx)}{\|\bw\|}$ et la distance vaut $|\tau| = \frac{|f(\bx)|}{\|\bw\|}$.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'word', ans: ['orthogonal', 'normal', 'perpendiculaire'], tex: 'orthogonal' },
      c: { kind: 'expr', ans: [R`\|w\|`, '||w||', '‖w‖', R`\frac{w^\top w}{\|w\|}`], tex: R`\|\bw\|` },
    },
    solution: R`$f(\bx_p) = \bw\T\bx-\tau\frac{\bw\T\bw}{\|\bw\|}+b = f(\bx)-\tau\|\bw\|$.` },

  { id: 'sv2', ch: 3, type: 'deriv', title: 'Démo : de la marge maximale au problème canonique', src: 'Slides p.7–8 · HW3 P1.(1)',
    text: R`<b>Cadre.</b> Données linéairement séparables $(\bx_j,y_j)$, $y_j\in\{-1,+1\}$. La marge de $(\bw,b)$ est $\rho(\bw,b) = \min_j\frac{y_j(\bw\T\bx_j+b)}{\|\bw\|}$ et on cherche à la maximiser.<br>
Si l'on remplace $(\bw,b)$ par $(\lambda\bw,\lambda b)$ avec $\lambda>0$, le numérateur et le dénominateur sont tous deux multipliés par $\blank{a}$ : la marge ne change pas. On peut donc choisir $\lambda$ pour imposer $\min_jy_j(\bw\T\bx_j+b) = \blank{b}$ ; la marge vaut alors $\blank{c}$. Maximiser $\frac1{\|\bw\|}$ revient à minimiser $\frac12\|\bw\|^2$, sous les contraintes $y_i(\bw\T\bx_i+b)\ge1$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda`, 'lambda', 'λ'], tex: R`\lambda` },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: [R`\frac{1}{\|w\|}`, '1/||w||', '1/‖w‖'], tex: R`\frac1{\|\bw\|}` },
    } },

  { id: 'sv3', ch: 3, type: 'def', title: 'Lagrangien et fonction duale', src: 'Slides p.14–17',
    text: R`<b>Cadre.</b> Problème primal : $\min_\bx L(\bx)$ sous les contraintes $g_i(\bx)\le0$, $i = 1,\dots,m$.<br>
Le Lagrangien est $\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx)+\sum_i\lambda_ig_i(\bx)$, avec des multiplicateurs $\lambda_i\,\blank{a}$. La fonction duale est $D(\boldsymbol\lambda) = \blank{b}$, et le problème dual est $\max_{\boldsymbol\lambda\ge0}D(\boldsymbol\lambda)$. On note $p^*$ et $d^*$ les valeurs optimales du primal et du dual : on a toujours $d^*\le p^*$ (dualité [[c]]).`,
    blanks: {
      a: { kind: 'expr', ans: ['>=0', R`\ge0`, '≥0', R`\geq 0`], tex: R`\ge0` },
      b: { kind: 'expr', ans: [R`\min_x\mathfrak L(x,\lambda)`, 'min_x L(x,lambda)', R`\min_x\mathcal L(x,\lambda)`, 'min_x L(x,λ)', R`\inf_x\mathfrak L(x,\lambda)`, 'inf_x L(x,lambda)'], tex: R`\min_\bx\mathfrak L(\bx,\boldsymbol\lambda)` },
      c: { kind: 'word', ans: ['faible', 'weak'], tex: 'faible' },
    } },

  { id: 'sv4', ch: 3, type: 'deriv', title: 'Démo : l\'inégalité minimax (dualité faible)', src: 'Slides p.18–19',
    text: R`<b>Cadre.</b> $\rho(x,y)$ est une fonction de deux variables ; on veut montrer $\max_y\min_x\rho(x,y)\le\min_x\max_y\rho(x,y)$.<br>
Posons $\psi(y) = \min_{x'}\rho(x',y)$. Un minimum est inférieur à chaque valeur, donc pour tous $x,y$ : $\psi(y)\,\blank{a}\,\rho(x,y)$. En prenant le max en $y$ des deux côtés, pour tout $x$ : $\max_y\psi(y)\le\blank{b}$. Le membre de gauche ne dépend pas de $x$ : on peut prendre le $\min_x$ à droite, ce qui donne l'inégalité. Appliquée au Lagrangien ($\rho = \mathfrak L$, $y = \boldsymbol\lambda$), elle donne $d^*\le p^*$.`,
    blanks: {
      a: { kind: 'expr', ans: ['<=', R`\le`, '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: [R`\max_y\rho(x,y)`, 'max_y rho(x,y)', 'max_y ρ(x,y)'], tex: R`\max_y\rho(x,y)` },
    } },

  { id: 'sv5', ch: 3, type: 'def', title: 'Contraintes d\'égalité', src: 'Slides p.21–22',
    text: R`<b>Cadre.</b> Une contrainte d'égalité $h(\bx) = 0$ s'écrit comme deux inégalités : $h(\bx)\le0$ et $-h(\bx)\le0$, de multiplicateurs $\lambda_1,\lambda_2\ge0$.<br>
Dans le Lagrangien, $\lambda_1h(\bx)+\lambda_2(-h(\bx)) = \nu\,h(\bx)$ avec $\nu = \blank{a}$. Comme $\lambda_1,\lambda_2\ge0$ sont quelconques, $\nu$ peut prendre n'importe quel signe : le multiplicateur d'une égalité n'a [[b]] contrainte de signe.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda_1-\lambda_2`, 'lambda_1 - lambda_2', 'λ1-λ2', 'λ_1-λ_2'], tex: R`\lambda_1-\lambda_2` },
      b: { kind: 'word', ans: ['aucune', 'pas de', 'none', 'no'], tex: 'aucune' },
    } },

  { id: 'sv6', ch: 3, type: 'deriv', title: 'Démo : le dual de la SVM à marge dure', src: 'Slides p.26–28 · HW3 P1.(2)',
    text: CADRE + R`Lagrangien, avec $\alpha_i\ge0$ : $\mathfrak L = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$. Stationnarité : $\nabla_\bw\mathfrak L = \bw-\blank{a} = 0$ et $\frac{\partial\mathfrak L}{\partial b} = -\blank{b} = 0$. En remplaçant $\bw = \sum_i\alpha_iy_i\bx_i$ : $\sum_i\alpha_iy_i\bw\T\bx_i = \|\bw\|^2$, et le terme en $b$ disparaît, donc $D(\boldsymbol\alpha) = \frac12\|\bw\|^2-\|\bw\|^2+\sum_i\alpha_i = \sum_i\alpha_i-\frac12\|\bw\|^2$. Enfin $\|\bw\|^2 = \sum_{i,j}\alpha_i\alpha_j\,\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sum_i\alpha_iy_ix_i`, 'sum_i alpha_i y_i x_i', 'Σα_i y_i x_i', R`\sum_{i=1}^N\alpha_iy_ix_i`, 'sum alpha_i y_i x_i'], tex: R`\sum_i\alpha_iy_i\bx_i` },
      b: { kind: 'expr', ans: [R`\sum_i\alpha_iy_i`, 'sum_i alpha_i y_i', 'Σα_i y_i', R`\sum_{i=1}^N\alpha_iy_i`, 'sum alpha_i y_i'], tex: R`\sum_i\alpha_iy_i` },
      c: { kind: 'expr', ans: [R`y_iy_jx_i^\top x_j`, 'y_i y_j x_i^T x_j', 'y_i y_j x_iᵀx_j'], tex: R`y_iy_j\bx_i\T\bx_j` },
    } },

  { id: 'sv7', ch: 3, type: 'def', title: 'Vecteurs de support et biais', src: 'Slides p.29–30',
    text: CADRE + R`Soient $(\bw^*,b^*)$ et $\boldsymbol\alpha^*$ les solutions primale et duale. La condition de complémentarité s'écrit $\alpha_i^*\big(1-y_i(\bw^{*\top}\bx_i+b^*)\big) = \blank{a}$. Les points avec $\alpha_i^*>0$ sont exactement sur le bord de la marge ($y_if(\bx_i) = 1$) : ce sont les [[b]]. Pour un tel point $s$, $b^* = \blank{c}$. Le dual a $N$ variables, quelle que soit la dimension des $\bx_i$.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'word', ans: ['vecteurs de support', 'vecteur de support', 'support vectors', 'vecteurs supports'], tex: 'vecteurs de support' },
      c: { kind: 'expr', ans: [R`y_s-w^{*\top}x_s`, 'y_s - w^T x_s', R`y_s-w^\top x_s`, 'y_s - w*^T x_s', R`y_s-\sum_j\alpha_jy_jx_j^\top x_s`], tex: R`y_s-\bw^{*\top}\bx_s` },
    } },

  { id: 'sv8', ch: 3, type: 'deriv', title: 'Démo : la contrainte de boîte $0\\le\\alpha_i\\le C$', src: 'Slides p.32–35',
    text: R`<b>Cadre.</b> SVM à marge souple : $\min_{\bw,b,\boldsymbol\xi}\frac12\|\bw\|^2+C\sum_i\xi_i$ sous $y_i(\bw\T\bx_i+b)\ge1-\xi_i$ et $\xi_i\ge0$ ($C>0$).<br>
On met un multiplicateur $\alpha_i\ge0$ sur la première contrainte et $\beta_i\ge0$ sur $-\xi_i\le0$ : $\mathfrak L = \frac12\|\bw\|^2+C\sum_i\xi_i+\sum_i\alpha_i\big(1-\xi_i-y_i(\bw\T\bx_i+b)\big)-\sum_i\beta_i\xi_i$. Stationnarité en $\xi_i$ : $\frac{\partial\mathfrak L}{\partial\xi_i} = \blank{a} = 0$. Comme $\beta_i\ge0$, on obtient $\alpha_i = C-\beta_i\le\blank{b}$. Les conditions en $\bw$ et $b$ sont les mêmes qu'en marge dure ; le dual est identique, avec la contrainte $\blank{c}\le\alpha_i\le C$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`C-\alpha_i-\beta_i`, 'C - alpha_i - beta_i', 'C-α_i-β_i'], tex: R`C-\alpha_i-\beta_i` },
      b: { kind: 'expr', ans: ['C'], tex: 'C' },
      c: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'sv9', ch: 3, type: 'def', title: 'Noyaux (kernel trick)', src: 'Slides p.39–43',
    text: R`<b>Cadre.</b> SVM sur des features $\bphi(\bx)$ ; dans le dual, les données n'interviennent que par les produits scalaires $\bphi(\bx_i)\T\bphi(\bx_j)$.<br>
Un noyau est une fonction $\kappa(\bx,\bx') = \blank{a}$ qu'on sait calculer sans construire $\bphi$. La prédiction s'écrit alors $f(\bx) = \sum_i\alpha_iy_i\,\blank{b}+b$. Le noyau RBF est $\kappa(\bx,\bx') = \exp\big(-\frac{\|\bx-\bx'\|^2}{2\sigma^2}\big)$ ; sa feature map est de dimension [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\phi(x)^\top\phi(x')`, "phi(x)^T phi(x')", "φ(x)ᵀφ(x')"], tex: R`\bphi(\bx)\T\bphi(\bx')` },
      b: { kind: 'expr', ans: [R`\kappa(x_i,x)`, 'k(x_i,x)', 'kappa(x_i,x)', 'κ(x_i,x)', R`\kappa(x,x_i)`], tex: R`\kappa(\bx_i,\bx)` },
      c: { kind: 'word', ans: ['infinie', 'infinite', 'infini'], tex: 'infinie' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'sv10', ch: 3, type: 'calc', title: 'Distance point–hyperplan', src: 'Slides p.4',
    gen: r => {
      const w = [[3, 4], [1, 1], [2, 0], [5, 12]][r.int(4)], b = r.int(5) - 2, x = [r.int(5) - 2, r.int(5) - 2];
      const fx = M.dot(w, x) + b, n = M.norm(w);
      return { text: R`<b>Cadre.</b> Hyperplan $\bw\T\bx+b = 0$ avec $\bw = (${w.join(', ')})$, $b = ${b}$ ; distance d'un point : $\rho(\bx) = \frac{|f(\bx)|}{\|\bw\|}$ avec $f(\bx) = \bw\T\bx+b$. Point $\bx = (${x.join(', ')})$.<br>$f(\bx) = \blank{a}$, $\|\bw\| = \blank{b}$, $\rho(\bx) = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: fx, tol: 0 }, b: { kind: 'num', ans: n }, c: { kind: 'num', ans: Math.abs(fx) / n } },
        solution: R`$f(\bx) = ${w[0]}\cdot${x[0]}+${w[1]}\cdot${x[1]}+${b} = ${fx}$.` };
    } },

  { id: 'sv11', ch: 3, type: 'calc', title: 'SVM en 1D à la main', src: 'Slides p.11',
    gen: r => {
      const p = r.int(3) - 2, q = p + 1 + r.int(3);
      const w = 2 / (q - p), b = -(q + p) / (q - p);
      return { text: R`<b>Cadre.</b> En 1D, $f(x) = wx+b$. Les points négatifs sont $\le ${p}$ (le plus proche de la frontière en $${p}$), les positifs $\ge ${q}$ (le plus proche en $${q}$). À l'optimum, les deux points les plus proches sont sur les bords de la marge : $w\cdot(${p})+b = -1$ et $w\cdot${q}+b = 1$.<br>En soustrayant les deux équations : $w = \blank{a}$ ; puis $b = \blank{b}$ ; la marge vaut $\frac1{|w|} = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: w }, b: { kind: 'num', ans: b }, c: { kind: 'num', ans: (q - p) / 2 } },
        solution: R`$w(${q}-(${p})) = 2$ ; la frontière $f = 0$ est au milieu, en $x = ${(p + q) / 2}$.` };
    } },

  { id: 'sv12', ch: 3, type: 'calc', title: 'Évaluer des noyaux', src: 'Slides p.40–43',
    gen: r => {
      const x = [r.int(3), r.int(3) - 1], y = [r.int(3) - 1, r.int(3)], s = [0.5, 1, 2][r.int(3)];
      const lin = M.dot(x, y), d2 = (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2;
      return { text: R`<b>Cadre.</b> $\bx = (${x.join(', ')})$, $\bx' = (${y.join(', ')})$. Noyaux : linéaire $\bx\T\bx'$, polynomial $(\bx\T\bx')^2$, RBF $\exp\big(-\frac{\|\bx-\bx'\|^2}{2\sigma^2}\big)$ avec $\sigma = ${s}$.<br>$\bx\T\bx' = \blank{a}$, $(\bx\T\bx')^2 = \blank{b}$, $\|\bx-\bx'\|^2 = \blank{c}$, $\kappa_{\text{RBF}} = \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: lin, tol: 0 }, b: { kind: 'num', ans: lin * lin, tol: 0 }, c: { kind: 'num', ans: d2, tol: 0 }, d: { kind: 'num', ans: Math.exp(-d2 / (2 * s * s)) } },
        solution: R`$\kappa_{\text{RBF}} = e^{-${d2}/(2\cdot${s}^2)} = ${f(Math.exp(-d2 / (2 * s * s)))}$.` };
    } },

  { id: 'sv13', ch: 3, type: 'calc', title: 'Dualité sur un petit problème', src: 'Hors slides', srcKind: 'extra',
    gen: r => {
      const a = 2 + r.int(3), c = r.int(2);
      return { text: R`<b>Cadre.</b> Primal : $\min_x(x-${a})^2$ sous $x\le${c}$ (contrainte $g(x) = x-${c}\le0$). Lagrangien $\mathfrak L(x,\lambda) = (x-${a})^2+\lambda(x-${c})$, $\lambda\ge0$.<br>Minimiser en $x$ : $\frac{\partial\mathfrak L}{\partial x} = 2(x-${a})+\lambda = 0$ donne $x(\lambda) = \blank{a}$. On obtient $D(\lambda) = \lambda(${a}-${c})-\frac{\lambda^2}{4}$, maximale en $\lambda^* = \blank{b}$, de valeur $d^* = \blank{c}$. Le primal vaut $p^* = (${c}-${a})^2$ : la dualité est forte.`,
        blanks: { a: { kind: 'expr', ans: [R`${a}-\lambda/2`, `${a} - lambda/2`, `${a}-λ/2`, R`${a}-\frac{\lambda}{2}`], tex: R`${a}-\frac\lambda2` }, b: { kind: 'num', ans: 2 * (a - c) }, c: { kind: 'num', ans: (a - c) ** 2 } },
        solution: R`$D'(\lambda) = (${a}-${c})-\lambda/2 = 0\Rightarrow\lambda^* = ${2 * (a - c)}$ et $D(\lambda^*) = ${(a - c) ** 2}$.` };
    } },
  );
})(window.ML);
