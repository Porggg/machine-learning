/* Exercices — Chapitre 2 : régression logistique */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  { id: 'lg1', ch: 2, type: 'def', title: 'Propriétés de la sigmoïde', src: 'Slides p.9',
    text: R`$\sigma(t) = \frac1{1+e^{-t}}$ vérifie : $\sigma(-t) = \blank{a}$, $\ \frac{d}{dt}\sigma(t) = \blank{b}$, $\ \sigma^{-1}(p) = \blank{c}$ pour $p\in(0,1)$. La pente maximale de $\sigma$ vaut $\blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`1-\sigma(t)`, '1 - sigma(t)', '1-σ(t)'], tex: R`1-\sigma(t)` },
      b: { kind: 'expr', ans: [R`\sigma(t)(1-\sigma(t))`, 'sigma(t)(1-sigma(t))', 'σ(t)(1-σ(t))', R`\sigma(t)\sigma(-t)`, 'σ(t)σ(-t)'], tex: R`\sigma(t)\big(1-\sigma(t)\big)` },
      c: { kind: 'expr', ans: [R`\ln\frac{p}{1-p}`, 'ln(p/(1-p))', R`\ln(\frac{p}{1-p})`, 'log(p/(1-p))'], tex: R`\ln\frac{p}{1-p}` },
      d: { kind: 'num', ans: 0.25 },
    },
    solution: R`$\sigma'(0) = \frac12\cdot\frac12 = \frac14$ : la sigmoïde est la plus raide en $t = 0$.` },

  { id: 'lg2', ch: 2, type: 'def', title: 'Modèle logistique et frontière', src: 'Slides p.10, 12–13',
    text: R`On modélise le [[a]] par une fonction linéaire : $\ln\frac{p_\bw(\bx)}{1-p_\bw(\bx)} = \bw\T\bx + b$, soit $p_\bw(\bx) = \blank{b}$. On prédit $+1$ ssi $\blank{c}\ge0$. La frontière de décision est un [[d]] orthogonal à $\bw$.`,
    blanks: {
      a: { kind: 'word', ans: ['log-odds', 'log odds', 'logit', 'log-rapport des cotes', 'log de la cote'], tex: 'log-odds' },
      b: { kind: 'expr', ans: [R`\sigma(w^\top x+b)`, 'sigma(w^T x + b)', 'σ(wᵀx+b)', R`\sigma(\bw\T\bx+b)`], tex: R`\sigma(\bw\T\bx+b)` },
      c: { kind: 'expr', ans: [R`w^\top x+b`, 'w^T x + b', 'wᵀx+b'], tex: R`\bw\T\bx+b` },
      d: { kind: 'word', ans: ['hyperplan', 'hyperplane'], tex: 'hyperplan' },
    } },

  { id: 'lg3', ch: 2, type: 'deriv', title: 'Moindres carrés pour classer : le défaut', src: 'Slides p.8',
    text: R`Avec $y\in\{-1,+1\}$ et la marge $m = yf_\bw(\bx)$ : $(y - f_\bw(\bx))^2 = \blank{a}$ car $y^2 = 1$. Cette perte est minimale en $m = \blank{b}$ et [[c]] pour $m>1$ : elle pénalise les exemples bien classés avec confiance.`,
    blanks: {
      a: { kind: 'expr', ans: ['(1-m)^2', '(m-1)^2'], tex: '(1-m)^2' },
      b: { kind: 'num', ans: 1 },
      c: { kind: 'word', ans: ['croît', 'croit', 'augmente', 'remonte', 'increases'], tex: 'croît' },
    } },

  { id: 'lg4', ch: 2, type: 'deriv', title: 'Vraisemblance de Bernoulli et NLL', src: 'Slides p.14–15',
    text: R`Avec $y_n\in\{0,1\}$ et $\hat y_n = \sigma(\bw\T\bx_n)$ : $p(y_n\mid\bx_n,\bw) = \hat y_n^{\,\blank{a}}(1-\hat y_n)^{\blank{b}}$, donc
$$L(\bw) = -\sum_{n=1}^N\Big[\blank{a}\ln\hat y_n + \blank{b}\ln(1-\hat y_n)\Big].$$
Le terme $p(\bx_n)$ disparaît car il ne dépend pas de [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: ['y_n'], tex: 'y_n' }, b: { kind: 'expr', ans: ['1-y_n', '(1-y_n)'], tex: '1-y_n' },
      c: { kind: 'expr', ans: ['w', R`\bw`, R`\mathbf w`], tex: R`\bw` },
    } },

  { id: 'lg5', ch: 2, type: 'def', title: 'Entropie croisée et logistic loss', src: 'Slides p.16',
    text: R`$H(r,q) = \blank{a}$. Avec la cible one-hot $r_n(y) = \mathbb 1(y=y_n)$, $H(r_n,q_{\bw,n}) = -\ln p(y_n|\bx_n,\bw)$, et pour $y_n\in\{-1,+1\}$ : $-\ln\sigma(y_nf_\bw(\bx_n)) = \blank{b}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\sum_{y}r(y)\ln q(y)`, '-sum r(y) ln q(y)', R`-\sum_{y\in Y}r(y)\ln q(y)`, R`-\sum_{y\in\mathcal Y}r(y)\ln q(y)`], tex: R`-\sum_{y\in\mathcal Y}r(y)\ln q(y)` },
      b: { kind: 'expr', ans: [R`\ln(1+e^{-y_nf_w(x_n)})`, 'ln(1+exp(-y_n f(x_n)))', 'ln(1+e^(-y f))', R`\ln(1+e^{-yf})`, R`\ln(1+e^{-y_n f_\bw(\bx_n)})`, 'ln(1+e^{-y_n f(x_n)})'], tex: R`\ln\big(1+e^{-y_nf_\bw(\bx_n)}\big)` },
    } },

  { id: 'lg6', ch: 2, type: 'deriv', title: 'La cross-entropy majore la perte 0-1', src: 'Slides p.17–18',
    text: R`Pour $m\le0$ : $e^{-m}\ge\blank{a}$ donc $\ln(1+e^{-m})\ge\blank{b}$. Ainsi $\mathbb 1(m\le0)\le C\ln(1+e^{-m})$ avec $C = \blank{c}$, et minimiser la cross-entropy moyenne minimise un [[d]] de l'erreur empirique.`,
    blanks: {
      a: { kind: 'num', ans: 1 }, b: { kind: 'expr', ans: [R`\ln 2`, 'ln2', 'ln 2', 'log 2'], tex: R`\ln2` },
      c: { kind: 'expr', ans: [R`\frac{1}{\ln 2}`, '1/ln2', '1/ln 2', '1/log 2'], tex: R`\frac1{\ln2}` },
      d: { kind: 'word', ans: ['majorant', 'borne supérieure', 'borne superieure', 'upper bound', 'surrogate'], tex: 'majorant' },
    } },

  { id: 'lg7', ch: 2, type: 'deriv', title: 'Gradient de la NLL logistique', src: 'Slides p.22–23',
    text: R`Règle de la chaîne : $\nabla_\bw\hat y_n = \blank{a}$. En simplifiant les facteurs $\hat y_n(1-\hat y_n)$ :
$$\nabla_\bw L(\bw) = -\sum_{n=1}^N\big(\blank{b}\big)\bx_n,\qquad \bw^{\text{new}}\leftarrow\bw^{\text{old}} + \gamma\sum_{n}\big(\blank{b}\big)\bx_n.$$`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)x_n`, 'yhat_n(1-yhat_n)x_n', 'ŷ_n(1-ŷ_n)x_n', R`\sigma'(w^\top x_n)x_n`], tex: R`\hat y_n(1-\hat y_n)\bx_n` },
      b: { kind: 'expr', ans: [R`y_n-\hat y_n`, 'y_n - yhat_n', 'y_n-ŷ_n', R`y_n-\sigma(w^\top x_n)`], tex: R`y_n-\hat y_n` },
    } },

  { id: 'lg8', ch: 2, type: 'deriv', title: 'Hessienne et convexité', src: 'Slides p.33',
    text: R`$\nabla^2L(\bw) = \sum_{n=1}^N\blank{a}\,\bx_n\bx_n\T$. Pour tout $\bv$ : $\bv\T\nabla^2L\,\bv = \sum_n\hat y_n(1-\hat y_n)\big(\blank{b}\big)^2\ge0$, donc $L$ est [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      b: { kind: 'expr', ans: [R`x_n^\top v`, 'x_n^T v', R`v^\top x_n`, 'v^T x_n'], tex: R`\bx_n\T\bv` },
      c: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
    } },

  { id: 'lg9', ch: 2, type: 'deriv', title: 'Méthode de Newton', src: 'Slides p.30–31',
    text: R`Taylor d'ordre 2 en $\bw^{(k)}$ : $\tilde L(\bw) = L(\bw^{(k)}) + \nabla L(\bw^{(k)})\T(\bw-\bw^{(k)}) + \blank{a}$. En annulant $\nabla\tilde L$ :
$$\bw^{(k+1)} = \bw^{(k)} - \big[\blank{b}\big]^{-1}\nabla L(\bw^{(k)}).$$
Sur une quadratique exacte, Newton converge en [[c]] pas.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac12(w-w^{(k)})^\top\nabla^2L(w^{(k)})(w-w^{(k)})`, '1/2 (w-w_k)^T H (w-w_k)', R`\frac{1}{2}(w-w_k)^\top\nabla^2 L(w_k)(w-w_k)`, '1/2(w-w^(k))^T nabla^2 L(w^(k))(w-w^(k))', '1/2 (w-w_k)^T nabla^2 L(w_k) (w-w_k)'], tex: R`\tfrac12(\bw-\bw^{(k)})\T\nabla^2L(\bw^{(k)})(\bw-\bw^{(k)})` },
      b: { kind: 'expr', ans: [R`\nabla^2L(w^{(k)})`, 'nabla^2 L(w^(k))', 'H', 'nabla^2 L(w_k)', R`\nabla^2 L(w_k)`, 'hessienne'], tex: R`\nabla^2L(\bw^{(k)})` },
      c: { kind: 'word', ans: ['un', '1', 'one', 'un seul'], tex: 'un seul' },
    } },

  { id: 'lg10', ch: 2, type: 'def', title: 'Softmax', src: 'Slides p.34',
    text: R`$p(y=k\mid\bx) = \dfrac{\blank{a}}{\sum_{j=1}^K\exp(\bw_j\T\bx)}$. Pour $K = 2$, $p(y=1|\bx) = \sigma\big(\blank{b}\big)$. La perte est $-\sum_n\sum_ky_{kn}\ln p(y_n=k|\bx_n)$ avec $y_{kn} = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\exp(w_k^\top x)`, 'exp(w_k^T x)', R`e^{w_k^\top x}`], tex: R`\exp(\bw_k\T\bx)` },
      b: { kind: 'expr', ans: [R`(w_1-w_0)^\top x`, '(w_1 - w_0)^T x', R`w_1^\top x-w_0^\top x`], tex: R`(\bw_1-\bw_0)\T\bx` },
      c: { kind: 'expr', ans: [R`\mathbb 1[y_n=k]`, '1[y_n=k]', R`1(y_n=k)`], tex: R`\mathbb 1[y_n=k]` },
    } },

  { id: 'lg11', ch: 2, type: 'def', title: 'Posterior de deux gaussiennes', src: 'PRML §4.2 · hors slides', srcKind: 'extra',
    text: R`Si $p(\bx|y=k) = \N(\bx|\bmu_k,\bSigma)$ (même covariance), alors $P(y=1|\bx) = \sigma(\bw\T\bx+b)$ avec $\bw = \blank{a}$ : les termes [[b]] en $\bx$ s'annulent.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\Sigma^{-1}(\mu_1-\mu_0)`, 'Σ^-1(μ1-μ0)', 'Sigma^-1 (mu_1 - mu_0)', 'Σ^-1(μ_1-μ_0)'], tex: R`\bSigma^{-1}(\bmu_1-\bmu_0)` },
      b: { kind: 'word', ans: ['quadratiques', 'quadratique', 'quadratic', 'du second degré'], tex: 'quadratiques' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'lg12', ch: 2, type: 'calc', title: 'Évaluer la sigmoïde', src: 'Slides p.9',
    gen: r => {
      const t = [-2, -1, -0.5, 0.5, 1, 2, 3][r.int(7)], s = M.sigmoid(t);
      return { text: R`Pour $t = ${t}$ : $\sigma(t) = \blank{a}$, $\sigma'(t) = \blank{b}$, et la cote $\frac{\sigma(t)}{1-\sigma(t)} = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: s }, b: { kind: 'num', ans: s * (1 - s) }, c: { kind: 'num', ans: Math.exp(t) } },
        solution: R`$\sigma(${t}) = 1/(1+e^{${-t}}) = ${f(s)}$ ; $\sigma' = \sigma(1-\sigma) = ${f(s * (1 - s))}$ ; la cote vaut $e^{t} = ${f(Math.exp(t))}$ (le logit de $\sigma(t)$ est $t$).` };
    } },

  { id: 'lg13', ch: 2, type: 'calc', title: 'Perte et gradient d\'un exemple', src: 'Slides p.11, 22',
    gen: r => {
      const x = [1, 2, -1, 0.5][r.int(4)], w = [0.5, 1, -0.5, 2][r.int(4)], y = r.int(2), p = M.sigmoid(w * x);
      const loss = y ? -Math.log(p) : -Math.log(1 - p), g = (p - y) * x;
      return { text: R`Modèle 1D $\hat y = \sigma(wx)$, exemple $x = ${x}$, $y = ${y}$ (étiquettes $\{0,1\}$), $w = ${w}$. Perte $-[y\ln\hat y + (1-y)\ln(1-\hat y)] = \blank{a}$ ; gradient $\frac{\partial}{\partial w} = \blank{b}$.`,
        blanks: { a: { kind: 'num', ans: loss }, b: { kind: 'num', ans: g } },
        solution: R`$\hat y = \sigma(${f(w * x)}) = ${f(p)}$. Gradient $= -(y-\hat y)x = (${f(p)} - ${y})\times${x} = ${f(g)}$.` };
    } },

  { id: 'lg14', ch: 2, type: 'calc', title: 'Un pas de Newton', src: 'Slides p.30',
    gen: r => {
      const x0 = [1, 2, 3, -2][r.int(4)], k = [4, 6][r.int(2)];
      const x1 = k === 4 ? x0 - (4 * x0 ** 3) / (12 * x0 ** 2) : x0 - (6 * x0 ** 5) / (30 * x0 ** 4);
      return { text: R`Newton sur $f(x) = x^{${k}}$ depuis $x_0 = ${x0}$ : $f'(x_0) = \blank{a}$, $f''(x_0) = \blank{b}$, $x_1 = x_0 - f'(x_0)/f''(x_0) = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: k * x0 ** (k - 1) }, b: { kind: 'num', ans: k * (k - 1) * x0 ** (k - 2) }, c: { kind: 'num', ans: x1 } },
        solution: R`$x_1 = x_0 - \frac{${k}x_0^{${k - 1}}}{${k * (k - 1)}x_0^{${k - 2}}} = x_0\big(1-\frac1{${k - 1}}\big) = ${f(x1)}$ : convergence seulement linéaire ici, car le minimum est dégénéré ($f''(0) = 0$).` };
    } },

  { id: 'lg15', ch: 2, type: 'calc', title: 'Softmax à la main', src: 'Slides p.34',
    gen: r => {
      const a = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = a.map(Math.exp), s = M.sum(e);
      return { text: R`Scores $(a_1,a_2,a_3) = (${a.join(', ')})$. $p(y=1|\bx) = \blank{a}$, et avec les scores tous augmentés de $5$, $p(y=1|\bx) = \blank{b}$.`,
        blanks: { a: { kind: 'num', ans: e[0] / s }, b: { kind: 'num', ans: e[0] / s } },
        solution: R`$p_1 = e^{${a[0]}}/(e^{${a[0]}}+e^{${a[1]}}+e^{${a[2]}}) = ${f(e[0] / s)}$. Ajouter une constante à tous les scores ne change rien (elle se simplifie).` };
    } },
  );
})(window.ML);
