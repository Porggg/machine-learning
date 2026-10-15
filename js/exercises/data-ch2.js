/* Exercices — Chapitre 2 : régression logistique (cadre explicite, trous dans les étapes) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<b>Cadre.</b> Classification binaire, $N$ exemples $(\bx_n,y_n)$ avec $y_n\in\{0,1\}$. Modèle $\hat y_n = \sigma(\bw\T\bx_n)$ où $\sigma(t) = \frac1{1+e^{-t}}$, et perte (cross-entropy, NLL) $L(\bw) = -\sum_{n=1}^N\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big]$.<br>`;

  ML.EX.add(
  { id: 'lg1', ch: 2, type: 'def', title: 'La sigmoïde', src: 'Slides p.9',
    text: R`<b>Cadre.</b> La sigmoïde est $\sigma(t) = \frac1{1+e^{-t}}$, de $\R$ dans $(0,1)$.<br>
Elle vérifie $\sigma(0) = \blank{a}$, $\sigma(-t) = \blank{b}$, et sa réciproque (le [[c]]) est $\sigma^{-1}(p) = \ln\frac{p}{1-p}$. Sa dérivée s'écrit avec elle-même : $\sigma'(t) = \sigma(t)\big(1-\sigma(t)\big)$, maximale en $t = 0$.`,
    blanks: {
      a: { kind: 'num', ans: 0.5, tol: 0 },
      b: { kind: 'expr', ans: [R`1-\sigma(t)`, '1 - sigma(t)', '1-σ(t)'], tex: R`1-\sigma(t)` },
      c: { kind: 'word', ans: ['logit', 'log-odds', 'log odds'], tex: 'logit' },
    },
    solution: R`Les démonstrations de ces propriétés font l'objet de l'exercice « Démo : symétrie, logit et dérivée de σ ».` },

  { id: 'lg2', ch: 2, type: 'def', title: 'Le modèle logistique et sa frontière', src: 'Slides p.10, 12–13',
    text: R`<b>Cadre.</b> Classification binaire $y\in\{0,1\}$ ; on note $p_\bw(\bx) = P(y = 1\mid\bx)$.<br>
La régression logistique modélise le [[a]] $\ln\frac{p_\bw(\bx)}{1-p_\bw(\bx)}$ par une fonction affine $\bw\T\bx+b$, soit $p_\bw(\bx) = \blank{b}$. On prédit la classe 1 ssi $p_\bw(\bx)\ge\frac12$, c'est-à-dire ssi $\bw\T\bx+b\,\blank{c}\,0$. La frontière de décision $\{\bx : \bw\T\bx+b = 0\}$ est un [[d]] orthogonal à $\bw$.`,
    blanks: {
      a: { kind: 'word', ans: ['log-odds', 'log odds', 'logit', 'log-rapport des cotes', 'log de la cote'], tex: 'log-odds' },
      b: { kind: 'expr', ans: [R`\sigma(w^\top x+b)`, 'sigma(w^T x + b)', 'σ(wᵀx+b)', R`\sigma(\bw\T\bx+b)`], tex: R`\sigma(\bw\T\bx+b)` },
      c: { kind: 'expr', ans: ['>=', R`\ge`, '≥', R`\geq`], tex: R`\ge` },
      d: { kind: 'word', ans: ['hyperplan', 'hyperplane'], tex: 'hyperplan' },
    } },

  { id: 'lg3', ch: 2, type: 'deriv', title: 'Démo : pourquoi les moindres carrés classent mal', src: 'Slides p.8',
    text: R`<b>Cadre.</b> Étiquettes $y\in\{-1,+1\}$, score réel $f(\bx)$, marge $m = yf(\bx)$ (positive ssi l'exemple est bien classé). On évalue la perte quadratique $(y-f(\bx))^2$.<br>
On factorise par $y$ : $(y-f)^2 = y^2\big(1-\tfrac fy\big)^2$. Comme $y = \pm1$, on a $y^2 = \blank{a}$ et $\frac1y = \blank{b}$, donc $(y-f)^2 = \big(1-\blank{c}\big)^2 = (1-m)^2$. Cette perte est nulle en $m = 1$ puis [[d]] quand $m>1$ : elle pénalise des exemples bien classés avec beaucoup de confiance.`,
    blanks: {
      a: { kind: 'num', ans: 1, tol: 0 },
      b: { kind: 'expr', ans: ['y'], tex: 'y' },
      c: { kind: 'expr', ans: ['yf', 'y f', 'm', 'y f(x)'], tex: 'yf' },
      d: { kind: 'word', ans: ['croit', 'croît', 'augmente', 'remonte', 'increases'], tex: 'croît' },
    } },

  { id: 'lg4', ch: 2, type: 'deriv', title: 'Démo : la vraisemblance de Bernoulli donne la cross-entropy', src: 'Slides p.14–15',
    text: CADRE + R`Pour $y\in\{0,1\}$, les deux cas $P(y = 1) = \hat y$ et $P(y = 0) = 1-\hat y$ s'écrivent d'un coup $p(y_n\mid\bx_n,\bw) = \hat y_n^{\,\blank{a}}(1-\hat y_n)^{\blank{b}}$. Les exemples étant indépendants, la vraisemblance est un [[c]] ; son $-\ln$ donne
$$-\ln\prod_np(y_n\mid\bx_n,\bw) = -\sum_n\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big] = L(\bw).$$
Le facteur $p(\bx_n)$ de la loi jointe disparaît de l'optimisation car il ne dépend pas de [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: ['y_n'], tex: 'y_n' },
      b: { kind: 'expr', ans: ['1-y_n', '(1-y_n)'], tex: '1-y_n' },
      c: { kind: 'word', ans: ['produit', 'product'], tex: 'produit' },
      d: { kind: 'expr', ans: ['w', R`\bw`, R`\mathbf w`], tex: R`\bw` },
    } },

  { id: 'lg5', ch: 2, type: 'def', title: 'Entropie croisée', src: 'Slides p.16',
    text: R`<b>Cadre.</b> $r$ et $q$ sont deux lois de probabilité sur un ensemble fini $\mathcal Y$ ($r$ : la cible, $q$ : la prédiction).<br>
L'entropie croisée est $H(r,q) = \blank{a}$. Avec la cible certaine $r_n(y) = \mathbb 1[y = y_n]$, un seul terme survit et $H(r_n,q) = \blank{b}$ : c'est la log-vraisemblance négative de l'exemple $n$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\sum_{y}r(y)\ln q(y)`, '-sum r(y) ln q(y)', R`-\sum_{y\in Y}r(y)\ln q(y)`, R`-\sum_{y\in\mathcal Y}r(y)\ln q(y)`], tex: R`-\sum_{y\in\mathcal Y}r(y)\ln q(y)` },
      b: { kind: 'expr', ans: [R`-\ln q(y_n)`, '-ln q(y_n)', '-log q(y_n)'], tex: R`-\ln q(y_n)` },
    } },

  { id: 'lg6', ch: 2, type: 'deriv', title: 'Démo : la cross-entropy majore la perte 0-1', src: 'Slides p.17–18',
    text: R`<b>Cadre.</b> Étiquettes $y\in\{-1,+1\}$, score $f(\bx)$, marge $m = yf(\bx)$. Perte 0-1 : $\mathbb 1(m\le0)$ ; logistic loss : $\ln(1+e^{-m})$. On veut $\mathbb 1(m\le0)\le C\ln(1+e^{-m})$ pour tout $m$.<br>
Si $m>0$ : le membre de gauche vaut $\blank{a}$ et le membre de droite est positif. Si $m\le0$ : $-m\ge0$ donc $e^{-m}\ge\blank{b}$, et $\ln(1+e^{-m})\ge\blank{c}$. Il suffit donc de prendre $C = \frac1{\ln2}$ : minimiser la cross-entropy moyenne minimise un [[d]] de l'erreur de classification.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: [R`\ln 2`, 'ln2', 'ln 2', 'log 2'], tex: R`\ln2` },
      d: { kind: 'word', ans: ['majorant', 'borne superieure', 'borne supérieure', 'upper bound', 'surrogate'], tex: 'majorant' },
    } },

  { id: 'lg7', ch: 2, type: 'deriv', title: 'Démo : le gradient de la cross-entropy', src: 'Slides p.22–23',
    text: CADRE + R`Règle de la chaîne, terme par terme. D'une part $\frac{\partial}{\partial\hat y_n}\big[-y_n\ln\hat y_n-(1-y_n)\ln(1-\hat y_n)\big] = -\frac{y_n}{\hat y_n}+\blank{a}$. D'autre part, avec $\sigma' = \sigma(1-\sigma)$, $\nabla_\bw\hat y_n = \blank{b}\,\bx_n$. En multipliant, les facteurs $\hat y_n(1-\hat y_n)$ se simplifient :
$$\nabla L(\bw) = \sum_n\big(\blank{c}\big)\bx_n.$$`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1-y_n}{1-\hat y_n}`, '(1-y_n)/(1-yhat_n)', '(1-y_n)/(1-ŷ_n)'], tex: R`\frac{1-y_n}{1-\hat y_n}` },
      b: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      c: { kind: 'expr', ans: [R`\hat y_n-y_n`, 'yhat_n - y_n', 'ŷ_n-y_n'], tex: R`\hat y_n-y_n` },
    },
    solution: R`$\big(-\frac{y}{\hat y}+\frac{1-y}{1-\hat y}\big)\hat y(1-\hat y) = -y(1-\hat y)+(1-y)\hat y = \hat y-y$.` },

  { id: 'lg8', ch: 2, type: 'deriv', title: 'Démo : hessienne et convexité de la cross-entropy', src: 'Slides p.33 · HW2 P1.(2)',
    text: CADRE + R`On part de $\nabla L = \sum_n(\hat y_n-y_n)\bx_n$. Seul $\hat y_n$ dépend de $\bw$, et $\nabla_\bw\hat y_n = \hat y_n(1-\hat y_n)\bx_n$, donc $\nabla^2L = \sum_n\bx_n\big(\nabla_\bw\hat y_n\big)\T = \sum_n\blank{a}\,\bx_n\bx_n\T$. Pour toute direction $\bv$ : $\bv\T\bx_n\bx_n\T\bv = \big(\blank{b}\big)^2$, donc $\bv\T\nabla^2L\,\bv = \sum_n\hat y_n(1-\hat y_n)(\bx_n\T\bv)^2\ge0$ car $\hat y_n\in\blank{c}$. $L$ est donc [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      b: { kind: 'expr', ans: [R`x_n^\top v`, 'x_n^T v', R`v^\top x_n`, 'v^T x_n'], tex: R`\bx_n\T\bv` },
      c: { kind: 'expr', ans: ['(0,1)', ']0,1['], tex: '(0,1)' },
      d: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
    } },

  { id: 'lg9', ch: 2, type: 'deriv', title: 'Démo : la mise à jour de Newton', src: 'Slides p.30–31',
    text: R`<b>Cadre.</b> On minimise une fonction deux fois dérivable $L(\bw)$ ; on note $\mathbf g = \nabla L(\bw^{(k)})$ et $\mathbf H = \nabla^2L(\bw^{(k)})$, supposée définie positive.<br>
On approche $L$ autour de $\bw^{(k)}$ par Taylor à l'ordre 2 : $\tilde L(\bw) = L(\bw^{(k)})+\mathbf g\T(\bw-\bw^{(k)})+\blank{a}$. Le gradient de cette approximation est $\nabla\tilde L(\bw) = \mathbf g+\blank{b}$ ; en l'annulant : $\bw^{(k+1)} = \bw^{(k)}-\mathbf H^{-1}\mathbf g$. Si $L$ est exactement quadratique, $\tilde L = L$ et Newton atteint le minimum en [[c]] pas.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac12(w-w^{(k)})^\top H(w-w^{(k)})`, '1/2 (w-w_k)^T H (w-w_k)', R`\frac{1}{2}(w-w_k)^\top H(w-w_k)`, '1/2(w-w^(k))^T H(w-w^(k))'], tex: R`\tfrac12(\bw-\bw^{(k)})\T\mathbf H(\bw-\bw^{(k)})` },
      b: { kind: 'expr', ans: [R`H(w-w^{(k)})`, 'H(w-w_k)', 'H(w - w^(k))', R`H(w-w_k)`], tex: R`\mathbf H(\bw-\bw^{(k)})` },
      c: { kind: 'word', ans: ['un', '1', 'one', 'un seul'], tex: 'un seul' },
    } },

  { id: 'lg10', ch: 2, type: 'def', title: 'Régression softmax ($K$ classes)', src: 'Slides p.34',
    text: R`<b>Cadre.</b> $K$ classes, un vecteur de poids $\bw_k$ par classe, scores $a_k = \bw_k\T\bx$.<br>
La probabilité de la classe $k$ est $p(y = k\mid\bx) = \dfrac{\blank{a}}{\sum_{j=1}^K\exp(\bw_j\T\bx)}$. Avec le codage one-hot $y_{kn} = \mathbb 1[y_n = k]$, la perte est $-\sum_n\sum_k\blank{b}\,\ln p(y_n = k\mid\bx_n)$, qui ne garde que le terme de la bonne classe. Pour $K = 2$, on retrouve la régression [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\exp(w_k^\top x)`, 'exp(w_k^T x)', R`e^{w_k^\top x}`, R`e^{a_k}`, 'exp(a_k)'], tex: R`\exp(\bw_k\T\bx)` },
      b: { kind: 'expr', ans: ['y_{kn}', 'y_kn'], tex: 'y_{kn}' },
      c: { kind: 'word', ans: ['logistique', 'logistic'], tex: 'logistique' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'lg12', ch: 2, type: 'calc', title: 'Évaluer la sigmoïde', src: 'Slides p.9',
    gen: r => {
      const t = [-2, -1, -0.5, 0.5, 1, 2, 3][r.int(7)], s = M.sigmoid(t);
      return { text: R`<b>Cadre.</b> $\sigma(t) = \frac1{1+e^{-t}}$, $\sigma'(t) = \sigma(t)(1-\sigma(t))$, et la cote vaut $\frac{\sigma(t)}{1-\sigma(t)}$.<br>Pour $t = ${t}$ : $e^{-t} = \blank{a}$, $\sigma(t) = \blank{b}$, $\sigma'(t) = \blank{c}$, cote $= \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: Math.exp(-t) }, b: { kind: 'num', ans: s }, c: { kind: 'num', ans: s * (1 - s) }, d: { kind: 'num', ans: Math.exp(t) } },
        solution: R`La cote vaut toujours $e^{t}$ : le logit de $\sigma(t)$ est $t$.` };
    } },

  { id: 'lg13', ch: 2, type: 'calc', title: 'Perte et gradient pour un exemple', src: 'Slides p.11, 22',
    gen: r => {
      const x = [1, 2, -1, 0.5][r.int(4)], w = [0.5, 1, -0.5, 2][r.int(4)], y = r.int(2), p = M.sigmoid(w * x);
      const loss = y ? -Math.log(p) : -Math.log(1 - p), g = (p - y) * x;
      return { text: R`<b>Cadre.</b> Modèle 1D $\hat y = \sigma(wx)$, perte $\ell = -[y\ln\hat y+(1-y)\ln(1-\hat y)]$ et gradient $\frac{\partial\ell}{\partial w} = (\hat y-y)x$. Exemple $x = ${x}$, $y = ${y}$, poids $w = ${w}$.<br>$wx = \blank{a}$, $\hat y = \blank{b}$, $\ell = \blank{c}$, $\frac{\partial\ell}{\partial w} = \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: w * x, tol: 0 }, b: { kind: 'num', ans: p }, c: { kind: 'num', ans: loss }, d: { kind: 'num', ans: g } },
        solution: R`Gradient $= (${f(p)}-${y})\times${x} = ${f(g)}$.` };
    } },

  { id: 'lg14', ch: 2, type: 'calc', title: 'Un pas de Newton en 1D', src: 'Slides p.30',
    gen: r => {
      const x0 = [1, 2, 3, -2][r.int(4)], k = [4, 6][r.int(2)];
      const x1 = x0 - (k * x0 ** (k - 1)) / (k * (k - 1) * x0 ** (k - 2));
      return { text: R`<b>Cadre.</b> Méthode de Newton en 1D : $x_{k+1} = x_k-\frac{f'(x_k)}{f''(x_k)}$, appliquée à $f(x) = x^{${k}}$ depuis $x_0 = ${x0}$.<br>$f'(x_0) = \blank{a}$, $f''(x_0) = \blank{b}$, $x_1 = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: k * x0 ** (k - 1) }, b: { kind: 'num', ans: k * (k - 1) * x0 ** (k - 2) }, c: { kind: 'num', ans: x1 } },
        solution: R`$x_1 = x_0\big(1-\frac1{${k - 1}}\big) = ${f(x1)}$ : ici la convergence n'est que linéaire, car $f''(0) = 0$.` };
    } },

  { id: 'lg15', ch: 2, type: 'calc', title: 'Softmax à la main', src: 'Slides p.34',
    gen: r => {
      const a = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = a.map(Math.exp), s = M.sum(e);
      return { text: R`<b>Cadre.</b> Trois classes de scores $(a_1,a_2,a_3) = (${a.join(', ')})$, probabilités $p_k = \frac{e^{a_k}}{\sum_je^{a_j}}$.<br>$\sum_je^{a_j} = \blank{a}$, donc $p_1 = \blank{b}$. Si l'on ajoute $5$ à tous les scores, $p_1 = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: s }, b: { kind: 'num', ans: e[0] / s }, c: { kind: 'num', ans: e[0] / s } },
        solution: R`Ajouter une constante à tous les scores multiplie numérateur et dénominateur par $e^5$ : rien ne change.` };
    } },
  );
})(window.ML);
