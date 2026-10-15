/* Exercices à trous sur les devoirs HW1–HW4.
   Chaque exercice reprend une étape clé d'un corrigé, mais il est AUTONOME : tout le cadre et toutes les données
   nécessaires sont dans l'énoncé (aucune référence au sujet du devoir, à ses données ou aux sorties d'un notebook). */
(function (ML) {
  'use strict';
  if (!ML.EX) return;
  const R = String.raw, H = { srcKind: 'hw', type: 'hw' };

  ML.EX.add(
  // ------------------------------------------------------------------ HW1
  Object.assign({ id: 'h1a', ch: 1, title: 'Décomposition de la MSE : le terme croisé', src: 'HW1 Q2.(1)',
    text: R`<b>Cadre.</b> Soit $(X,Y)$ un couple aléatoire, $f$ un prédicteur et $m(X) := \E[Y\mid X]$. On écrit $Y-f(X) = (Y-m(X))+(m(X)-f(X))$, d'où
$$\E[(Y-f(X))^2] = \E[(Y-m(X))^2]+2\,\E[(Y-m(X))(m(X)-f(X))]+\E[(m(X)-f(X))^2].$$
Par la loi des espérances totales, le terme croisé vaut $\E\big[(m(X)-f(X))\,\blank{a}\big]$, et $\E[Y-m(X)\mid X] = \blank{b}$. Le premier terme vaut $\E[\blank{c}]$. Si $Y = g(X)+\varepsilon$ avec $\varepsilon$ indépendant de $X$, centré, de variance $\sigma^2$, la plus petite MSE possible vaut $\blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`E[Y-m(X)|X]`, R`\E[Y-m(X)\mid X]`, 'E[Y - m(X) | X]'], tex: R`\E[Y-m(X)\mid X]` },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'expr', ans: [R`\Var(Y|X)`, 'Var(Y|X)', R`\operatorname{Var}(Y\mid X)`], tex: R`\Var(Y\mid X)` },
      d: { kind: 'expr', ans: [R`\sigma^2`, 'sigma^2', 'σ^2', 'σ²'], tex: R`\sigma^2` },
    } }, H),

  Object.assign({ id: 'h1b', ch: 1, title: 'Régression polynomiale : design matrix, équations normales, convexité', src: 'HW1 Q2.(2)–(3)',
    text: R`<b>Cadre.</b> On ajuste $f(x) = \sum_{k=0}^Mw_kx^k$ à $N$ points $(x_n,y_n)$ en minimisant $\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2$. La design matrix a pour coefficients $\Phi_{nk} = \blank{a}$ et $\bPhi\in\R^{N\times\blank{b}}$. Comme $\nabla_\bw\EMSE = \frac2N\bPhi\T(\bPhi\bw-\by)$, les équations normales s'écrivent $\blank{c}$. La hessienne vaut $\frac2N\bPhi\T\bPhi$ et, pour toute direction $\bv$, $\bv\T\bPhi\T\bPhi\bv = \blank{d}\ge0$ : tout point stationnaire est un minimum global.`,
    blanks: {
      a: { kind: 'expr', ans: ['x_n^k', 'x_n^{k}'], tex: 'x_n^k' },
      b: { kind: 'expr', ans: ['(M+1)', 'M+1'], tex: '(M+1)' },
      c: { kind: 'expr', ans: [R`\Phi^\top\Phi w=\Phi^\top y`, 'Phi^T Phi w = Phi^T y', 'ΦᵀΦw = Φᵀy', R`\bPhi\T\bPhi\bw = \bPhi\T\by`], tex: R`\bPhi\T\bPhi\bw = \bPhi\T\by` },
      d: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
    } }, H),

  Object.assign({ id: 'h1c', ch: 1, title: 'Bruit gaussien : MLE = moindres carrés', src: 'HW1 Q3.(1)',
    text: R`<b>Cadre.</b> On suppose $y_n\mid x_n,\bw\sim\N(\bw\T\bphi_n,\sigma^2)$, indépendants pour $n = 1,\dots,N$, et on note $\bPhi$ la matrice de lignes $\bphi_n\T$. La log-vraisemblance vaut $\ln\mathcal L(\bw) = \blank{a}-\frac1{2\sigma^2}\|\by-\bPhi\bw\|^2$. Le premier terme ne dépend pas de $\bw$ et $\frac1{2\sigma^2}>0$, donc $\hat\bw_{\text{MLE}} = \arg\min_\bw\blank{b}$ : c'est l'estimateur des moindres carrés, quel que soit $\sigma$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\frac{N}{2}\ln(2\pi\sigma^2)`, '-N/2 ln(2 pi sigma^2)', '-(N/2)ln(2πσ^2)', R`-\frac N2\ln(2\pi\sigma^2)`], tex: R`-\frac N2\ln(2\pi\sigma^2)` },
      b: { kind: 'expr', ans: [R`\|y-\Phi w\|^2`, '||y - Phi w||^2', R`\|\by-\bPhi\bw\|^2`, R`\frac1N\|y-\Phi w\|^2`], tex: R`\|\by-\bPhi\bw\|^2` },
    } }, H),

  Object.assign({ id: 'h1d', ch: 1, title: 'Prior gaussien : MAP = ridge', src: 'HW1 Q3.(2)',
    text: R`<b>Cadre.</b> Modèle d'observation $y_n\mid\bw\sim\N(\bw\T\bphi_n,\sigma^2)$, indépendants, $n = 1,\dots,N$ ($\bPhi$ : matrice de lignes $\bphi_n\T$), avec le prior $\bw\sim\N(0,\tau^2\bI)$. Alors $-\ln p(\bw\mid\by) = \frac1{2\sigma^2}\|\by-\bPhi\bw\|^2+\blank{a}+\text{cste}$. En multipliant par $\frac{2\sigma^2}N$, on reconnaît le ridge $\frac1N\|\by-\bPhi\bw\|^2+\lambda\|\bw\|^2$ avec $\lambda = \blank{b}$. Forme close : $\hat\bw_{\text{MAP}} = (\blank{c})^{-1}\bPhi\T\by$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1}{2\tau^2}\|w\|^2`, '||w||^2/(2 tau^2)', R`\frac{\|w\|^2}{2\tau^2}`, '1/(2tau^2) ||w||^2'], tex: R`\frac1{2\tau^2}\|\bw\|^2` },
      b: { kind: 'expr', ans: [R`\frac{\sigma^2}{N\tau^2}`, 'sigma^2/(N tau^2)', 'σ^2/(Nτ^2)'], tex: R`\frac{\sigma^2}{N\tau^2}` },
      c: { kind: 'expr', ans: [R`N\lambda I+\Phi^\top\Phi`, 'N lambda I + Phi^T Phi', R`\frac{\sigma^2}{\tau^2}I+\Phi^\top\Phi`, 'sigma^2/tau^2 I + Phi^T Phi'], tex: R`N\lambda\bI+\bPhi\T\bPhi` },
    } }, H),

  Object.assign({ id: 'h1e', ch: 1, title: 'Le gradient de mini-batch est sans biais', src: 'HW1 Q4.(4)',
    text: R`<b>Cadre.</b> $\hL(\bw) = \frac1N\sum_{i=1}^N\ell_i(\bw)$, et $\mathcal B$ est tiré uniformément parmi les sous-ensembles de taille $B$ de $\{1,\dots,N\}$. On écrit $\frac1B\sum_{i\in\mathcal B}\nabla\ell_i = \frac1B\sum_{i=1}^N\blank{a}\,\nabla\ell_i$, où seules les indicatrices sont aléatoires. Par linéarité, $\E_{\mathcal B}[\cdot] = \frac1B\sum_iP(i\in\mathcal B)\nabla\ell_i$, avec $P(i\in\mathcal B) = \binom{N-1}{B-1}\big/\binom NB = \blank{b}$. Donc $\E_{\mathcal B}[\cdot] = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mathbb 1[i\in B]`, '1[i in B]', R`1_{i\in B}`, R`\mathbb{1}[i\in\mathcal B]`, '1(i∈B)'], tex: R`\mathbb 1[i\in\mathcal B]` },
      b: { kind: 'expr', ans: ['B/N', R`\frac{B}{N}`], tex: R`\frac BN` },
      c: { kind: 'expr', ans: [R`\nabla\hat L(w)`, R`\frac{1}{N}\sum_i\nabla\ell_i`, 'grad L(w)', R`\nabla\hL(\bw)`, R`\nabla L(w)`, '1/N sum grad l_i'], tex: R`\nabla\hL(\bw)` },
    } }, H),

  Object.assign({ id: 'h1f', ch: 1, title: 'Degré du polynôme et régularisation : ce qu\'on observe', src: 'HW1 Q2.(4), Q3.(3)',
    text: R`<b>Cadre.</b> On ajuste un polynôme de degré $M$ à $N$ points bruités d'une fonction lisse, et on mesure la MSE sur ces points (train) et sur des points neufs (test). Avec $M$ trop petit, train et test sont tous deux élevés : c'est du [[a]]. Avec $M$ proche de $N-1$, la MSE train est proche de 0 mais la MSE test est grande : c'est du [[b]]. Pour le ridge à $M$ grand, quand $\lambda$ augmente, $\|\hat\bw\|$ [[c]], la MSE train [[d]], et la MSE test, en fonction de $\lambda$, a une forme en [[e]].`,
    blanks: {
      a: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'sous-apprentissage' },
      b: { kind: 'word', ans: ['sur-apprentissage', 'sur apprentissage', 'overfitting'], tex: 'sur-apprentissage' },
      c: { kind: 'word', ans: ['diminue', 'decroit', 'décroît', 'baisse'], tex: 'diminue' },
      d: { kind: 'word', ans: ['augmente', 'croit', 'croît', 'monte'], tex: 'augmente' },
      e: { kind: 'word', ans: ['U'], tex: 'U' },
    } }, H),

  // ------------------------------------------------------------------ HW2
  Object.assign({ id: 'h2a', ch: 2, title: 'Softmax à deux classes = régression logistique', src: 'HW2 P1.(1)',
    text: R`<b>Cadre.</b> Modèle à deux classes $p(Y = k\mid\bx) = \frac{e^{\bw_k\T\bx}}{e^{\bw_0\T\bx}+e^{\bw_1\T\bx}}$, $k\in\{0,1\}$. En divisant par $e^{\bw_1\T\bx}$ : $p(Y = 1\mid\bx) = \sigma(\blank{a})$. Remplacer $(\bw_0,\bw_1)$ par $(\bw_0+\mathbf a,\bw_1+\mathbf a)$ multiplie numérateur et dénominateur par $\blank{b}$ : aucune probabilité ne change, donc les paramètres $(\bw_0,\bw_1)$ ne sont pas [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`(w_1-w_0)^\top x`, '(w_1 - w_0)^T x', '(w1-w0)^T x', R`(\bw_1-\bw_0)\T\bx`], tex: R`(\bw_1-\bw_0)\T\bx` },
      b: { kind: 'expr', ans: [R`e^{a^\top x}`, 'e^(a^T x)', 'exp(a^T x)', R`e^{\mathbf a\T\bx}`], tex: R`e^{\mathbf a\T\bx}` },
      c: { kind: 'word', ans: ['identifiables', 'identifiable', 'uniques'], tex: 'identifiables' },
    } }, H),

  Object.assign({ id: 'h2b', ch: 2, title: 'La cross-entropy est la log-vraisemblance négative', src: 'HW2 P1.(3)',
    text: R`<b>Cadre.</b> Régression logistique : $\hat y_n = \sigma(\bw\T\bx_n)$, $y_n\in\{0,1\}$, $L_{\mathrm{CE}}(\bw) = -\frac1N\sum_n\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big]$. Sur $\{0,1\}$, on pose $p_n(y) = \mathbb 1[y = y_n]$ et $q_{\bw,n}(y) = p(y\mid\bx_n,\bw)$. Alors $H(p_n,q_{\bw,n}) = -\sum_yp_n(y)\ln q_{\bw,n}(y) = \blank{a}$, car seul le terme $y = y_n$ survit. Et $\ln p(y_n\mid\bx_n,\bw) = y_n\ln\hat y_n+\blank{b}$. Donc $L_{\mathrm{CE}} = \frac1N\sum_nH(p_n,q_{\bw,n})$ : minimiser la cross-entropy, c'est maximiser la [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\ln p(y_n|x_n,w)`, '-ln p(y_n | x_n, w)', R`-\ln q_{w,n}(y_n)`, '-ln q(y_n)'], tex: R`-\ln p(y_n\mid\bx_n,\bw)` },
      b: { kind: 'expr', ans: [R`(1-y_n)\ln(1-\hat y_n)`, '(1-y_n) ln(1-yhat_n)', '(1-y_n)ln(1-ŷ_n)'], tex: R`(1-y_n)\ln(1-\hat y_n)` },
      c: { kind: 'word', ans: ['vraisemblance', 'likelihood', 'log-vraisemblance'], tex: 'vraisemblance' },
    } }, H),

  Object.assign({ id: 'h2c', ch: 2, title: 'Majorer la perte 0-1 par la cross-entropy', src: 'HW2 P1.(4)',
    text: R`<b>Cadre.</b> Régression logistique, $\hat y_n = \sigma(\bw\T\bx_n)$, $y_n\in\{0,1\}$, $L_{\mathrm{CE}} = \frac1N\sum_n\ell_n$, classifieur $h_\bw(\bx) = \mathbb 1[\hat y\ge\frac12]$, $L_{01} = \frac1N\sum_n\mathbb 1[h_\bw(\bx_n)\ne y_n]$ et $\ell_n = -\ln p(y_n\mid\bx_n,\bw)$. Si l'exemple $n$ est mal classé avec $y_n = 1$, alors $\hat y_n\lt\frac12$ et $\ell_n = -\ln\hat y_n\,\blank{a}\,\ln2$ ; de même si $y_n = 0$. Donc $L_{01}\le C\,L_{\mathrm{CE}}$ avec $C = \blank{b}$. Cette constante est la plus petite possible : il y a égalité pour un seul exemple avec $y_1 = 0$ et $\hat y_1 = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['>', R`\gt`, '>=', R`\ge`], tex: '>' },
      b: { kind: 'expr', ans: [R`\frac{1}{\ln 2}`, '1/ln2', '1/ln(2)', '1/log(2)'], tex: R`\frac1{\ln2}` },
      c: { kind: 'num', ans: 0.5, tol: 0 },
    } }, H),

  Object.assign({ id: 'h2d', ch: 2, title: 'Gradient, hessienne et un pas de Newton à la main', src: 'HW2 P2.(1)–(2)',
    text: R`<b>Cadre.</b> Régression logistique sans biais, $\hat y_n = \sigma(\bw\T\bx_n)$, avec $N\nabla L = \sum_n(\hat y_n-y_n)\bx_n$ et $N\nabla^2L = \sum_n\hat y_n(1-\hat y_n)\bx_n\bx_n\T$. Données : $\bx_1 = (-2,-2)$, $y_1 = 1$ ; $\bx_2 = (-2,2)$, $y_2 = 1$ ; $\bx_3 = (-2,0)$, $y_3 = 0$. En $\bw^{(0)} = 0$ : tous les $\hat y_n$ valent $\blank{a}$, $N\nabla L = (\blank{b},\ 0)$ et $N\nabla^2L = \mathrm{diag}(\blank{c},\ 2)$. Le pas de Newton $\bw^{(1)} = \bw^{(0)}-(N\nabla^2L)^{-1}(N\nabla L)$ donne $\bw^{(1)} = (\blank{d},\ 0)$.`,
    blanks: {
      a: { kind: 'num', ans: 0.5, tol: 0 },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'num', ans: 3, tol: 0 },
      d: { kind: 'num', ans: -1 / 3, tol: 0.01 },
    },
    solution: R`$N\nabla L = -\tfrac12(-2,-2)-\tfrac12(-2,2)+\tfrac12(-2,0) = (1,0)$ ; $\sum_n\bx_n\bx_n\T = \mathrm{diag}(12,8)$, multiplié par $\frac14$.` }, H),

  Object.assign({ id: 'h2e', ch: 2, title: 'Trouver le minimiseur exact', src: 'HW2 P2.(3)',
    text: R`<b>Cadre.</b> Régression logistique sans biais, $\hat y_n = \sigma(\bw\T\bx_n)$, $\nabla L\propto\sum_n(\hat y_n-y_n)\bx_n$. Données : $\bx_1 = (-2,-2)$, $y_1 = 1$ ; $\bx_2 = (-2,2)$, $y_2 = 1$ ; $\bx_3 = (-2,0)$, $y_3 = 0$. Avec $\bw = (a,b)$ : $\hat y_1 = \sigma(-2a-2b)$, $\hat y_2 = \sigma(-2a+2b)$, $\hat y_3 = \sigma(-2a)$. La 2ᵉ composante de $\nabla L = 0$ donne $\sigma(-2a+2b) = \sigma(-2a-2b)$, donc $b = \blank{a}$ ($\sigma$ est injective). La 1ʳᵉ donne alors $3s-2 = 0$ avec $s = \sigma(-2a)$, donc $s = \blank{b}$ et $a = \blank{c}$. Le point $(-\frac13,0)$ (un pas de Newton depuis 0) est à une distance $\|\cdot\|_1\approx\blank{d}$ du minimiseur.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 2 / 3, tol: 0.01 },
      c: { kind: 'num', ans: -Math.log(2) / 2, tol: 0.01 },
      d: { kind: 'num', ans: Math.log(2) / 2 - 1 / 3, tol: 0.02 },
    },
    solution: R`$-2a = \ln\frac{2/3}{1/3} = \ln2$, donc $\bw^\star = (-\frac{\ln2}2,0)\approx(-0.3466,0)$ et $|{-\frac13}+\frac{\ln2}2|\approx0.0132$.` }, H),

  // ------------------------------------------------------------------ HW3
  Object.assign({ id: 'h3a', ch: 3, title: 'Marge géométrique et normalisation', src: 'HW3 P1.(1)',
    text: R`<b>Cadre.</b> Données $(\bx_i,y_i)$, $y_i\in\{-1,+1\}$, hyperplan $H = \{\bx : \bw\T\bx+b = 0\}$ qui sépare strictement ($y_i(\bw\T\bx_i+b)>0$ pour tout $i$). Alors $\mathrm{dist}(\bx_i,H) = \frac{|\bw\T\bx_i+b|}{\|\bw\|} = \frac{\blank{a}}{\|\bw\|}$ car $|y_i| = 1$. Avec $m = \min_iy_i(\bw\T\bx_i+b)>0$, remplacer $(\bw,b)$ par $(\lambda\bw,\lambda b)$ avec $\lambda = \blank{b}$ impose $\min_iy_i(\bw\T\bx_i+b) = 1$ sans changer $H$. Pour la solution $\bw^\star$ du problème $\min\frac12\|\bw\|^2$ s.c. $y_i(\bw\T\bx_i+b)\ge1$, la marge vaut $\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`y_i(w^\top x_i+b)`, 'y_i(w^T x_i + b)', 'y_i f(x_i)'], tex: R`y_i(\bw\T\bx_i+b)` },
      b: { kind: 'expr', ans: ['1/m', R`\frac{1}{m}`], tex: R`1/m` },
      c: { kind: 'expr', ans: [R`\frac{1}{\|w^*\|}`, '1/||w*||', R`1/\|w^\star\|`, R`\frac{1}{\|w^\star\|}`], tex: R`\frac1{\|\bw^\star\|}` },
    } }, H),

  Object.assign({ id: 'h3b', ch: 3, title: 'Dériver le dual de la SVM à marge dure', src: 'HW3 P1.(2)',
    text: R`<b>Cadre.</b> Lagrangien de la SVM à marge dure, $\alpha_i\ge0$ : $L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$, et $g(\boldsymbol\alpha) = \inf_{\bw,b}L$. En développant : $L = \frac12\bw\T\bw-\bw\T\bv+\sum_i\alpha_i-b\,s$ avec $\bv = \sum_i\alpha_iy_i\bx_i$ et $s = \blank{a}$. $\nabla_\bw L = 0\iff\bw = \bv$. $L$ est affine en $b$ de pente $-s$ : si $s\ne0$, $g(\boldsymbol\alpha) = \blank{b}$. Si $s = 0$ : $g(\boldsymbol\alpha) = \sum_i\alpha_i-\blank{c}$. Et la stationnarité en $b$ ne détermine pas $b^\star$, car alors $L$ ne [[d]] plus de $b$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sum_i\alpha_iy_i`, 'sum alpha_i y_i', R`\sum_{i}\alpha_i y_i`, 'Σ α_i y_i'], tex: R`\sum_i\alpha_iy_i` },
      b: { kind: 'expr', ans: [R`-\infty`, '-inf', '-infinity', '-∞'], tex: R`-\infty` },
      c: { kind: 'expr', ans: [R`\frac12\sum_i\sum_j\alpha_i\alpha_jy_iy_jx_i^\top x_j`, R`\frac{1}{2}v^\top v`, '1/2 v^T v', R`\frac12\|v\|^2`, '1/2 ||v||^2'], tex: R`\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\bx_i\T\bx_j` },
      d: { kind: 'word', ans: ['depend', 'dépend', 'depend plus'], tex: 'dépend' },
    } }, H),

  Object.assign({ id: 'h3c', ch: 3, title: 'Démontrer la complémentarité, puis trouver $b^\\star$', src: 'HW3 P1.(3)',
    text: R`<b>Cadre.</b> SVM à marge dure : $L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$, $g(\boldsymbol\alpha) = \inf_{\bw,b}L$. $(\bw^\star,b^\star)$ est optimal pour le primal (valeur $p^\star = \frac12\|\bw^\star\|^2$), $\boldsymbol\alpha^\star\ge0$ pour le dual, et la dualité forte donne $g(\boldsymbol\alpha^\star) = p^\star$. Avec $c_i = 1-y_i(\bw^{\star\top}\bx_i+b^\star)$ : $g(\boldsymbol\alpha^\star)\le L(\bw^\star,b^\star,\boldsymbol\alpha^\star) = \frac12\|\bw^\star\|^2+\sum_i\alpha_i^\star c_i\le p^\star$, car l'admissibilité donne $c_i\,\blank{a}\,0$. Les deux bouts sont égaux, donc $\sum_i\alpha_i^\star c_i = \blank{b}$ ; des termes tous $\le0$ de somme nulle sont tous [[c]]. Pour un indice $s$ avec $\alpha_s^\star>0$ : $b^\star = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'word', ans: ['nuls', 'nul', 'zero', 'egaux a zero'], tex: 'nuls' },
      d: { kind: 'expr', ans: [R`y_s-w^{*\top}x_s`, 'y_s - w*^T x_s', R`y_s-w^{\star\top}x_s`, 'y_s - w^T x_s', R`y_s-\sum_j\alpha_j^*y_jx_j^\top x_s`], tex: R`y_s-\bw^{\star\top}\bx_s` },
    } }, H),

  Object.assign({ id: 'h3d', ch: 3, title: 'Lire les écarts $\\xi_i$ de la marge souple', src: 'HW3 P2.(1)',
    text: R`<b>Cadre.</b> SVM à marge souple : $\min\frac12\|\bw\|^2+C\sum_i\xi_i$ s.c. $y_if(\bx_i)\ge1-\xi_i$, $\xi_i\ge0$, avec $f(\bx) = \bw\T\bx+b$. À l'optimum $\xi_i = \max\{0,1-y_if(\bx_i)\}$. $\xi_i = 0$ : bien classé, avec $y_if(\bx_i)\ge1$. $0\lt\xi_i\lt1$ : bien classé mais [[a]]. $\xi_i = 1$ : exactement sur la [[b]]. $\xi_i>1$ : [[c]]. Comme chaque erreur a $\xi_i\ge1$, $\sum_i\xi_i$ [[d]] le nombre d'erreurs d'entraînement. Un $C$ très grand rapproche de la marge [[e]].`,
    blanks: {
      a: { kind: 'word', ans: ['dans la rue', 'dans la marge', 'a l interieur de la rue', 'inside the margin'], tex: 'dans la rue (la marge)' },
      b: { kind: 'word', ans: ['frontiere', 'frontière', 'frontiere de decision', 'boundary'], tex: 'frontière' },
      c: { kind: 'word', ans: ['mal classe', 'mal classé', 'erreur', 'misclassified'], tex: 'mal classé' },
      d: { kind: 'word', ans: ['majore', 'borne', 'est superieur a', 'upper bounds'], tex: 'majore' },
      e: { kind: 'word', ans: ['dure', 'hard'], tex: 'dure' },
    } }, H),

  Object.assign({ id: 'h3e', ch: 3, title: 'Un point qui rend la marge dure infaisable', src: 'HW3 P2.(2)',
    text: R`<b>Cadre.</b> Négatifs : $(0,-1)$, $(-2,0)$, $(-1,-2)$ ; positifs : $(2,1)$, $(2,3)$, $(4,1)$. On ajoute $\bx_7 = (-1,-1)$ avec $y_7 = +1$. On a $\bx_7 = \frac13(\bx_1+\bx_2+\bx_3)$ : c'est le [[a]] des négatifs. Comme $f$ est affine, $f(\bx_7) = \frac13\big(f(\bx_1)+f(\bx_2)+f(\bx_3)\big)\le\blank{b}$ dès que les contraintes des négatifs sont satisfaites, alors qu'il faudrait $f(\bx_7)\ge1$ : la marge dure est [[c]]. Pour la marge souple, si $\bw = (\frac13,\frac23)$ et $b = -\frac13$, l'écart du point ajouté vaut $\xi_7 = \blank{d}$.`,
    blanks: {
      a: { kind: 'word', ans: ['centre de gravite', 'barycentre', 'centroide', 'centroid', 'moyenne'], tex: 'centre de gravité' },
      b: { kind: 'num', ans: -1, tol: 0 },
      c: { kind: 'word', ans: ['infaisable', 'infeasible', 'impossible'], tex: 'infaisable' },
      d: { kind: 'num', ans: 7 / 3, tol: 0.01 },
    },
    solution: R`$f(\bx_7) = -\frac13-\frac23-\frac13 = -\frac43$, donc $\xi_7 = \max\{0,1-y_7f(\bx_7)\} = 1+\frac43 = \frac73$.` }, H),

  // ------------------------------------------------------------------ HW4
  Object.assign({ id: 'h4a', ch: 4, title: 'Erreur d\'entraînement contre erreur de généralisation ($N = 2$)', src: 'HW4 P1.(1)',
    text: R`<b>Cadre.</b> Perte quadratique. $X = 0$ presque sûrement et $Y = \pm1$ avec probabilité $\frac12$ chacun. On tire $S = \{(0,y_1),(0,y_2)\}$ i.i.d. et on prédit la constante $\hat f = \bar y = \frac{y_1+y_2}2$. Si $y_1 = y_2$, $\hat L_S(\hat f) = \blank{a}$ ; sinon $\hat L_S(\hat f) = 1$. Donc $\E_S[\hat L_S(\hat f)] = \blank{b}$. Pour une constante fixée $c$, $L(c) = \E[(Y-c)^2] = \blank{c}$, d'où $\E_S[L(\hat f)] = \blank{d}$.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 0.5, tol: 0 },
      c: { kind: 'expr', ans: ['1+c^2', 'c^2+1'], tex: '1+c^2' },
      d: { kind: 'num', ans: 1.5, tol: 0 },
    },
    solution: R`Le même échantillon sert à construire $\bar y$ et à le juger : $\bar y$ minimise $\sum_i(y_i-c)^2$, il colle à ses propres points.` }, H),

  Object.assign({ id: 'h4b', ch: 4, title: 'Un écart de généralisation en $2/N$', src: 'HW4 P1.(2)',
    text: R`<b>Cadre.</b> $X = 0$ presque sûrement et $Y = \pm1$ avec probabilité $\frac12$ chacun ; $S$ contient $N$ exemples i.i.d., $\hat f = \bar y = \frac1N\sum_iy_i$, perte quadratique. Comme $y_i^2 = 1$, $\hat L_S(\hat f) = \frac1N\sum_iy_i^2-\bar y^2 = \blank{a}$, et $L(\hat f) = 1+\bar y^2$. Comme $\E[y_iy_j] = 0$ pour $i\ne j$, $\E[\bar y^2] = \blank{b}$. L'écart espéré $\E_S[L(\hat f)-\hat L_S(\hat f)]$ vaut $\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`1-\bar y^2`, '1 - ybar^2', '1-ȳ^2', '1-ybar^2'], tex: R`1-\bar y^2` },
      b: { kind: 'expr', ans: ['1/N', R`\frac{1}{N}`], tex: R`\frac1N` },
      c: { kind: 'expr', ans: ['2/N', R`\frac{2}{N}`], tex: R`\frac2N` },
    } }, H),

  Object.assign({ id: 'h4c', ch: 4, title: 'Une évaluation sur données indépendantes est sans biais', src: 'HW4 P1.(3)',
    text: R`<b>Cadre.</b> $S\sim P^N$, $\hat f = \mathcal A(S)$ avec $\mathcal A$ déterministe, et $S_{\text{eval}} = \{(\tilde\bx_i,\tilde y_i)\}_{i=1}^m\sim P^m$ indépendant de $S$ ; $\hat L_{\text{eval}}(f) = \frac1m\sum_i\ell(\tilde y_i,f(\tilde\bx_i))$ et $L(f) = \E_P[\ell(y,f(\bx))]$. Par linéarité, il suffit de traiter un terme. $\hat f$ ne dépend que de $S$ et $(\tilde\bx_i,\tilde y_i)$ est [[a]] de $S$, donc $\E[\ell(\tilde y_i,\hat f(\tilde\bx_i))\mid S] = \blank{b}$. Par la tour des espérances, $\E[\hat L_{\text{eval}}(\hat f)] = \blank{c}$.`,
    blanks: {
      a: { kind: 'word', ans: ['independant', 'indépendant', 'independent'], tex: 'indépendant' },
      b: { kind: 'expr', ans: [R`L(\hat f)`, 'L(fhat)', 'L(f^)', 'L(f)'], tex: R`L(\hat f)` },
      c: { kind: 'expr', ans: [R`E_S[L(\hat f)]`, R`\E_S[L(\hat f)]`, 'E_S[L(fhat)]', 'E[L(f^)]', R`E[L(\hat f)]`], tex: R`\E_S[L(\hat f)]` },
    } }, H),

  Object.assign({ id: 'h4d', ch: 4, title: 'Lire des scores de validation croisée', src: 'HW4 P2.(1)',
    text: R`<b>Cadre.</b> Validation croisée à 5 plis de même taille pour trois modèles. MSE de validation sur les plis : A $= (0.23,\ 0.31,\ 0.27,\ 0.35,\ 0.29)$, B $= (0.07,\ 0.11,\ 0.14,\ 0.10,\ 0.12)$, C $= (0.10,\ 0.09,\ 0.12,\ 0.11,\ 0.11)$. MSE d'entraînement moyennes : A $0.260$, B $0.012$, C $0.080$. Scores de CV : A $= \blank{a}$, B $= \blank{b}$, C $= \blank{c}$. On choisit [[d]]. Le plus net sous-apprentissage (entraînement élevé, petit écart) : [[e]]. Le plus net sur-apprentissage (entraînement presque nul, grand écart) : [[f]].`,
    blanks: {
      a: { kind: 'num', ans: 0.29, tol: 0.005 },
      b: { kind: 'num', ans: 0.108, tol: 0.005 },
      c: { kind: 'num', ans: 0.106, tol: 0.005 },
      d: { kind: 'word', ans: ['C', 'modele C', 'candidat C'], tex: 'C' },
      e: { kind: 'word', ans: ['A', 'modele A', 'candidat A'], tex: 'A' },
      f: { kind: 'word', ans: ['B', 'modele B', 'candidat B'], tex: 'B' },
    } }, H),

  Object.assign({ id: 'h4e', ch: 4, title: 'Plus de régularisation : $Q_\\lambda$ baisse, $R_\\lambda$ monte', src: 'HW4 P2.(2)(a)',
    text: R`<b>Cadre.</b> Pour $\lambda\ge0$, $\hat\bw_\lambda$ minimise $R(\bw)+\lambda Q(\bw)$, où $R$ est l'erreur d'entraînement et $Q(\bw) = \sum_{j\ge1}w_j^2$. On note $R_k = R(\hat\bw_{\lambda_k})$, $Q_k = Q(\hat\bw_{\lambda_k})$, avec $0\le\lambda_1\lt\lambda_2$. Optimalité : (I) $R_1+\lambda_1Q_1\le R_2+\lambda_1Q_2$ et (II) $R_2+\lambda_2Q_2\le\blank{a}$. En additionnant : $(\lambda_2-\lambda_1)Q_2\le\blank{b}$, donc $Q_2\le Q_1$. Puis (I) donne $R_1-R_2\le\lambda_1(\blank{c})\le0$ car $\lambda_1\ge0$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`R_1+\lambda_2Q_1`, 'R_1 + lambda_2 Q_1', 'R1+λ2Q1'], tex: R`R_1+\lambda_2Q_1` },
      b: { kind: 'expr', ans: [R`(\lambda_2-\lambda_1)Q_1`, '(lambda_2 - lambda_1) Q_1', '(λ2-λ1)Q1'], tex: R`(\lambda_2-\lambda_1)Q_1` },
      c: { kind: 'expr', ans: ['Q_2-Q_1', 'Q2-Q1'], tex: 'Q_2-Q_1' },
    } }, H),

  Object.assign({ id: 'h4f', ch: 4, title: 'Régulariser plus peut généraliser moins bien', src: 'HW4 P2.(2)(b)',
    text: R`<b>Cadre.</b> $X$ uniforme sur $\{-1,1\}$ et $Y = X$ (aucun bruit). Modèle $f(x) = w_0+w_1x$, ridge sur $T = \{(-1,-1),(1,1)\}$ : on minimise $\frac12\big[(-1-w_0+w_1)^2+(1-w_0-w_1)^2\big]+\lambda w_1^2$ ($w_0$ non pénalisé). En annulant les dérivées : $\hat w_0 = 0$ et $\hat w_1 = \blank{a}$. L'erreur de généralisation $L = \E[(Y-f(X))^2]$ vaut $(1-w_1)^2+w_0^2$, soit $L = \blank{b}$ pour le modèle ajusté. Avec $\lambda = 0$, $L = 0$ ; avec $\lambda = 1$, $L = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1}{1+\lambda}`, '1/(1+lambda)', '1/(1+λ)'], tex: R`\frac1{1+\lambda}` },
      b: { kind: 'expr', ans: [R`(\frac{\lambda}{1+\lambda})^2`, '(lambda/(1+lambda))^2', '(λ/(1+λ))^2', R`\frac{\lambda^2}{(1+\lambda)^2}`, 'lambda^2/(1+lambda)^2'], tex: R`\big(\frac{\lambda}{1+\lambda}\big)^2` },
      c: { kind: 'num', ans: 0.25, tol: 0 },
    } }, H),

  Object.assign({ id: 'h4g', ch: 4, title: 'Le minimum des scores de CV n\'est pas une évaluation', src: 'HW4 P2.(3)',
    text: R`<b>Cadre.</b> On choisit $(d,\lambda)$ parmi plusieurs candidats par validation croisée sur $S_{\text{dev}}$, on réajuste le modèle choisi sur tout $S_{\text{dev}}$ ($f_{\text{final}}$), et on dispose d'un échantillon $S_{\text{test}}$ indépendant de $m$ exemples. Le minimum des scores de CV n'est pas une évaluation indépendante : les plis ont servi à [[a]] $(d,\lambda)$. Comme $\min_c\mathrm{CV}(c)\le\mathrm{CV}(c')$ pour tout $c'$, on a $\E[\min_c\mathrm{CV}(c)]\,\blank{b}\,\min_c\E[\mathrm{CV}(c)]$ (biais de sélection). Le bon score est $\hat L_{S_{\text{test}}}(f_{\text{final}}) = \blank{c}\sum_{(x,y)\in S_{\text{test}}}(y-f_{\text{final}}(x))^2$.`,
    blanks: {
      a: { kind: 'word', ans: ['choisir', 'selectionner', 'sélectionner', 'select'], tex: 'choisir' },
      b: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      c: { kind: 'expr', ans: ['1/m', R`\frac{1}{m}`], tex: R`\frac1m` },
    } }, H),
  );
})(window.ML);
