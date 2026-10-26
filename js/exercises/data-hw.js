/* Exercices à trous sur les devoirs HW1–HW6, format « sujet d'examen ».
   Chaque exercice est autonome : cadre et données sont dans l'énoncé (aucune référence au sujet du devoir). */
(function (ML) {
  'use strict';
  if (!ML.EX) return;
  const R = String.raw, H = { srcKind: 'hw', type: 'hw' };

  ML.EX.add(
  // ------------------------------------------------------------------ HW1
  Object.assign({ id: 'h1a', ch: 1, title: 'Décomposition de la MSE et terme croisé', src: 'HW1 Q2.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> $(X,Y)$ couple aléatoire, $f$ un prédicteur, $m(X) = \E[Y\mid X]$ ; on suppose $Y = g(X)+\varepsilon$ avec $\varepsilon$ indépendant de $X$, centré, de variance $\sigma^2$.</p>
<p class="claim"><b>Proposition.</b> La plus petite MSE possible vaut $\sigma^2$, atteinte pour $f = m$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E[(Y-f)^2] &= \E[(Y-m)^2]+2\,\E\big[(m-f)\,\blank{a}\big]+\E[(m-f)^2] &&\text{(i)}\\
\E[Y-m(X)\mid X] &= \blank{b} &&\text{(ii)}\\
\E[(Y-m)^2] &= \E\big[\Var(Y\mid X)\big] = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) utilise la loi des espérances totales pour le terme croisé, qui est nul par (ii). (iii) : sachant $X$, $Y-m(X) = \varepsilon$. Le dernier terme de (i) est $\ge0$ et nul pour $f = m$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`E[Y-m(X)|X]`, R`\E[Y-m(X)\mid X]`, 'E[Y - m(X) | X]'], tex: R`\E[Y-m(X)\mid X]` },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'expr', ans: [R`\sigma^2`, 'sigma^2', 'σ^2', 'σ²'], tex: R`\sigma^2` },
    } }, H),

  Object.assign({ id: 'h1b', ch: 1, title: 'Régression polynomiale : équations normales et convexité', src: 'HW1 Q2.(2)–(3)',
    text: R`<p class="hyp"><b>Cadre.</b> $f(x) = \sum_{k=0}^Mw_kx^k$ ajusté à $N$ points en minimisant $\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2$.</p>
<p class="claim"><b>Proposition.</b> $\bPhi\in\R^{N\times(M+1)}$ avec $\Phi_{nk} = x_n^k$ ; les minimiseurs vérifient $\bPhi\T\bPhi\bw = \bPhi\T\by$ ; $\EMSE$ est convexe.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\Phi_{nk} &= \blank{a},\qquad\bPhi\in\R^{N\times\blank{b}} &&\text{(i)}\\
\nabla\EMSE(\bw) &= \tfrac2N\bPhi\T(\bPhi\bw-\by) = 0\ \iff\ \blank{c} &&\text{(ii)}\\
\bv\T\nabla^2\EMSE\,\bv &= \tfrac2N\bv\T\bPhi\T\bPhi\bv = \tfrac2N\blank{d}\ \ge0. &&\text{(iii)}
\end{aligned}$$
<p>Par (iii), la hessienne est semi-définie positive : tout point stationnaire est un minimum global. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['x_n^k', 'x_n^{k}'], tex: 'x_n^k' },
      b: { kind: 'expr', ans: ['(M+1)', 'M+1'], tex: '(M+1)' },
      c: { kind: 'expr', ans: [R`\Phi^\top\Phi w=\Phi^\top y`, 'Phi^T Phi w = Phi^T y', 'ΦᵀΦw = Φᵀy', R`\bPhi\T\bPhi\bw = \bPhi\T\by`], tex: R`\bPhi\T\bPhi\bw = \bPhi\T\by` },
      d: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
    } }, H),

  Object.assign({ id: 'h1c', ch: 1, title: 'Bruit gaussien : MLE = moindres carrés (et $\\hat\\sigma^2$)', src: 'HW1 Q3.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> $y_n\mid\bw\sim\N(\bw\T\bphi_n,\sigma^2)$ indépendants, $n = 1,\dots,N$ ; $\bPhi$ a pour lignes les $\bphi_n\T$.</p>
<p class="claim"><b>Proposition.</b> $\hat\bw_{\text{MLE}} = \hat\bw_{\text{LS}}$ quel que soit $\sigma$, et $\hat\sigma^2_{\text{MLE}} = \frac1N\|\by-\bPhi\hat\bw\|^2$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\ln\mathcal L(\bw,\sigma^2) &= \blank{a}-\frac1{2\sigma^2}\|\by-\bPhi\bw\|^2 &&\text{(i)}\\
\arg\max_\bw\ln\mathcal L &= \arg\min_\bw\blank{b} &&\text{(ii)}\\
\frac{\partial\ln\mathcal L}{\partial\sigma^2} &= -\frac N{2\sigma^2}+\frac{\|\by-\bPhi\bw\|^2}{2\sigma^4} = 0\ \iff\ \sigma^2 = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : le premier terme de (i) ne dépend pas de $\bw$ et $\frac1{2\sigma^2}>0$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\frac{N}{2}\ln(2\pi\sigma^2)`, '-N/2 ln(2 pi sigma^2)', '-(N/2)ln(2πσ^2)', R`-\frac N2\ln(2\pi\sigma^2)`], tex: R`-\frac N2\ln(2\pi\sigma^2)` },
      b: { kind: 'expr', ans: [R`\|y-\Phi w\|^2`, '||y - Phi w||^2', R`\|\by-\bPhi\bw\|^2`, R`\frac1N\|y-\Phi w\|^2`], tex: R`\|\by-\bPhi\bw\|^2` },
      c: { kind: 'expr', ans: [R`\frac{1}{N}\|y-\Phi w\|^2`, '1/N ||y - Phi w||^2', R`\frac1N\|\by-\bPhi\bw\|^2`, '||y-Phi w||^2/N'], tex: R`\frac1N\|\by-\bPhi\bw\|^2` },
    } }, H),

  Object.assign({ id: 'h1d', ch: 1, title: 'Prior $\\N(0,\\tau^2\\bI)$ : MAP = ridge avec $\\lambda = \\sigma^2/(N\\tau^2)$', src: 'HW1 Q3.(2)',
    text: R`<p class="hyp"><b>Cadre.</b> $y_n\mid\bw\sim\N(\bw\T\bphi_n,\sigma^2)$ indépendants ($n = 1,\dots,N$), prior $\bw\sim\N(0,\tau^2\bI)$ ; ridge : $\min_\bw\frac1N\|\by-\bPhi\bw\|^2+\lambda\|\bw\|^2$.</p>
<p class="claim"><b>Proposition.</b> $\hat\bw_{\text{MAP}}$ est le ridge avec $\lambda = \frac{\sigma^2}{N\tau^2}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
-\ln p(\bw\mid\by) &= \tfrac1{2\sigma^2}\|\by-\bPhi\bw\|^2+\blank{a}+\text{cste} &&\text{(i)}\\
\tfrac{2\sigma^2}N\times(\text{i}):\quad&\tfrac1N\|\by-\bPhi\bw\|^2+\blank{b}\,\|\bw\|^2+\text{cste} &&\text{(ii)}\\
\hat\bw_{\text{MAP}} &= (\blank{c})^{-1}\bPhi\T\by. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : multiplier par une constante positive ne change pas l'argmin. (iii) : gradient nul de (ii). $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1}{2\tau^2}\|w\|^2`, '||w||^2/(2 tau^2)', R`\frac{\|w\|^2}{2\tau^2}`, '1/(2tau^2) ||w||^2'], tex: R`\frac1{2\tau^2}\|\bw\|^2` },
      b: { kind: 'expr', ans: [R`\frac{\sigma^2}{N\tau^2}`, 'sigma^2/(N tau^2)', 'σ^2/(Nτ^2)'], tex: R`\frac{\sigma^2}{N\tau^2}` },
      c: { kind: 'expr', ans: [R`N\lambda I+\Phi^\top\Phi`, 'N lambda I + Phi^T Phi', R`\frac{\sigma^2}{\tau^2}I+\Phi^\top\Phi`, 'sigma^2/tau^2 I + Phi^T Phi'], tex: R`N\lambda\bI+\bPhi\T\bPhi` },
    } }, H),

  Object.assign({ id: 'h1e', ch: 1, title: 'Le gradient de mini-batch est sans biais', src: 'HW1 Q4.(4)',
    text: R`<p class="hyp"><b>Cadre.</b> $\hL(\bw) = \frac1N\sum_{i=1}^N\ell_i(\bw)$ ; $\mathcal B$ uniforme parmi les sous-ensembles de taille $B$ de $\{1,\dots,N\}$.</p>
<p class="claim"><b>Proposition.</b> $\E_{\mathcal B}\big[\frac1B\sum_{i\in\mathcal B}\nabla\ell_i(\bw)\big] = \nabla\hL(\bw)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\tfrac1B\textstyle\sum_{i\in\mathcal B}\nabla\ell_i &= \tfrac1B\textstyle\sum_{i=1}^N\blank{a}\,\nabla\ell_i &&\text{(i)}\\
P(i\in\mathcal B) &= \binom{N-1}{B-1}\Big/\binom NB = \blank{b} &&\text{(ii)}\\
\E_{\mathcal B}\Big[\tfrac1B\textstyle\sum_{i\in\mathcal B}\nabla\ell_i\Big] &= \tfrac1B\textstyle\sum_iP(i\in\mathcal B)\,\nabla\ell_i = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : on choisit les $B-1$ autres éléments parmi $N-1$. (iii) : par linéarité, seules les indicatrices sont aléatoires. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mathbb 1[i\in B]`, '1[i in B]', R`1_{i\in B}`, R`\mathbb{1}[i\in\mathcal B]`, '1(i∈B)'], tex: R`\mathbb 1[i\in\mathcal B]` },
      b: { kind: 'expr', ans: ['B/N', R`\frac{B}{N}`], tex: R`\frac BN` },
      c: { kind: 'expr', ans: [R`\nabla\hat L(w)`, R`\frac{1}{N}\sum_i\nabla\ell_i`, 'grad L(w)', R`\nabla\hL(\bw)`, R`\nabla L(w)`, '1/N sum grad l_i'], tex: R`\nabla\hL(\bw)` },
    } }, H),

  Object.assign({ id: 'h1f', ch: 1, title: 'Degré du polynôme et régularisation : ce qu\'on observe', src: 'HW1 Q2.(4), Q3.(3)',
    text: R`<p class="hyp"><b>Cadre.</b> On ajuste un polynôme de degré $M$ à $N$ points bruités d'une fonction lisse ; on mesure la MSE sur ces points (train) et sur des points neufs (test).</p>
<p><b>Observations à justifier.</b> $M$ trop petit : train et test élevés, c'est du [[a]]. $M$ proche de $N-1$ : train $\approx0$, test grand, c'est du [[b]]. Ridge à $M$ grand, quand $\lambda$ augmente : $\|\hat\bw\|$ [[c]], la MSE train [[d]], et la MSE test en fonction de $\lambda$ a une forme en [[e]].</p>`,
    blanks: {
      a: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'sous-apprentissage' },
      b: { kind: 'word', ans: ['sur-apprentissage', 'sur apprentissage', 'overfitting'], tex: 'sur-apprentissage' },
      c: { kind: 'word', ans: ['diminue', 'decroit', 'décroît', 'baisse'], tex: 'diminue' },
      d: { kind: 'word', ans: ['augmente', 'croit', 'croît', 'monte'], tex: 'augmente' },
      e: { kind: 'word', ans: ['U'], tex: 'U' },
    } }, H),

  // ------------------------------------------------------------------ HW2
  Object.assign({ id: 'h2a', ch: 2, title: 'Softmax à deux classes = régression logistique', src: 'HW2 P1.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> $p(Y = k\mid\bx) = \frac{e^{\bw_k\T\bx}}{e^{\bw_0\T\bx}+e^{\bw_1\T\bx}}$, $k\in\{0,1\}$.</p>
<p class="claim"><b>Proposition.</b> $p(Y = 1\mid\bx) = \sigma\big((\bw_1-\bw_0)\T\bx\big)$, et $(\bw_0+\mathbf a,\bw_1+\mathbf a)$ donne les mêmes probabilités.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p(Y = 1\mid\bx) &= \frac{1}{e^{(\bw_0-\bw_1)\T\bx}+1} = \sigma\big(\blank{a}\big) &&\text{(i)}\\
\frac{e^{(\bw_k+\mathbf a)\T\bx}}{\sum_je^{(\bw_j+\mathbf a)\T\bx}} &= \frac{\blank{b}\,e^{\bw_k\T\bx}}{\blank{b}\sum_je^{\bw_j\T\bx}} = p(Y = k\mid\bx). &&\text{(ii)}
\end{aligned}$$
<p>(i) : on divise par $e^{\bw_1\T\bx}$. Par (ii), les paramètres $(\bw_0,\bw_1)$ ne sont pas [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`(w_1-w_0)^\top x`, '(w_1 - w_0)^T x', '(w1-w0)^T x', R`(\bw_1-\bw_0)\T\bx`], tex: R`(\bw_1-\bw_0)\T\bx` },
      b: { kind: 'expr', ans: [R`e^{a^\top x}`, 'e^(a^T x)', 'exp(a^T x)', R`e^{\mathbf a\T\bx}`], tex: R`e^{\mathbf a\T\bx}` },
      c: { kind: 'word', ans: ['identifiables', 'identifiable', 'uniques'], tex: 'identifiables' },
    } }, H),

  Object.assign({ id: 'h2b', ch: 2, title: 'La cross-entropy est la log-vraisemblance négative', src: 'HW2 P1.(3)',
    text: R`<p class="hyp"><b>Cadre.</b> $\hat y_n = \sigma(\bw\T\bx_n)$, $y_n\in\{0,1\}$, $L_{\mathrm{CE}}(\bw) = -\frac1N\sum_n\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big]$. Sur $\{0,1\}$ : $p_n(y) = \mathbb 1[y = y_n]$ et $q_{\bw,n}(y) = p(y\mid\bx_n,\bw)$.</p>
<p class="claim"><b>Proposition.</b> $L_{\mathrm{CE}}(\bw) = \frac1N\sum_nH(p_n,q_{\bw,n})$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
H(p_n,q_{\bw,n}) &= -\sum_{y\in\{0,1\}}p_n(y)\ln q_{\bw,n}(y) = \blank{a} &&\text{(i)}\\
\ln p(y_n\mid\bx_n,\bw) &= \ln\big(\hat y_n^{\,y_n}(1-\hat y_n)^{1-y_n}\big) = y_n\ln\hat y_n+\blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>(i) : seul le terme $y = y_n$ survit. On moyenne sur $n$ : minimiser la cross-entropy, c'est maximiser la [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\ln p(y_n|x_n,w)`, '-ln p(y_n | x_n, w)', R`-\ln q_{w,n}(y_n)`, '-ln q(y_n)'], tex: R`-\ln p(y_n\mid\bx_n,\bw)` },
      b: { kind: 'expr', ans: [R`(1-y_n)\ln(1-\hat y_n)`, '(1-y_n) ln(1-yhat_n)', '(1-y_n)ln(1-ŷ_n)'], tex: R`(1-y_n)\ln(1-\hat y_n)` },
      c: { kind: 'word', ans: ['vraisemblance', 'likelihood', 'log-vraisemblance'], tex: 'vraisemblance' },
    } }, H),

  Object.assign({ id: 'h2c', ch: 2, title: 'La meilleure constante dans $L_{01}\\le C\\,L_{\\mathrm{CE}}$', src: 'HW2 P1.(4)',
    text: R`<p class="hyp"><b>Cadre.</b> $\hat y_n = \sigma(\bw\T\bx_n)$, $y_n\in\{0,1\}$, $h_\bw(\bx) = \mathbb 1[\hat y\ge\frac12]$, $L_{01} = \frac1N\sum_n\mathbb 1[h_\bw(\bx_n)\ne y_n]$, $\ell_n = -\ln p(y_n\mid\bx_n,\bw)$, $L_{\mathrm{CE}} = \frac1N\sum_n\ell_n$.</p>
<p class="claim"><b>Proposition.</b> $L_{01}\le\frac1{\ln2}L_{\mathrm{CE}}$, et $\frac1{\ln2}$ est la plus petite constante possible.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\text{erreur avec } y_n = 1:\quad\hat y_n\lt\tfrac12\ &\Longrightarrow\ \ell_n = -\ln\hat y_n\ \blank{a}\ \ln2 &&\text{(i)}\\
\text{erreur avec } y_n = 0:\quad 1-\hat y_n\le\tfrac12\ &\Longrightarrow\ \ell_n = -\ln(1-\hat y_n)\ge\ln2 &&\text{(ii)}\\
\mathbb 1[\text{erreur}_n] &\le\frac{\ell_n}{\ln2}\ \Longrightarrow\ L_{01}\le\blank{b}\,L_{\mathrm{CE}}. &&\text{(iii)}
\end{aligned}$$
<p>Optimalité : avec un seul exemple, $y_1 = 0$ et $\hat y_1 = \blank{c}$, l'exemple est classé 1 (convention d'égalité), donc $L_{01} = 1$, et $L_{\mathrm{CE}} = \ln2$ : il y a égalité. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['>', R`\gt`, '>=', R`\ge`], tex: '>' },
      b: { kind: 'expr', ans: [R`\frac{1}{\ln 2}`, '1/ln2', '1/ln(2)', '1/log(2)'], tex: R`\frac1{\ln2}` },
      c: { kind: 'num', ans: 0.5, tol: 0 },
    } }, H),

  Object.assign({ id: 'h2d', ch: 2, title: 'Gradient, hessienne et un pas de Newton à la main', src: 'HW2 P2.(1)–(2)',
    text: R`<p class="hyp"><b>Données.</b> Régression logistique sans biais, $\hat y_n = \sigma(\bw\T\bx_n)$, $N\nabla L = \sum_n(\hat y_n-y_n)\bx_n$, $N\nabla^2L = \sum_n\hat y_n(1-\hat y_n)\bx_n\bx_n\T$. $\bx_1 = (-2,-2)$, $y_1 = 1$ ; $\bx_2 = (-2,2)$, $y_2 = 1$ ; $\bx_3 = (-2,0)$, $y_3 = 0$ ; $\bw^{(0)} = 0$.</p>
<p><b>Calcul.</b>
$$\begin{aligned}
\hat y_n &= \sigma(0) = \blank{a}\quad(n = 1,2,3)\\
N\nabla L &= -\tfrac12(-2,-2)-\tfrac12(-2,2)+\tfrac12(-2,0) = (\blank{b},\ 0)\\
N\nabla^2L &= \tfrac14\textstyle\sum_n\bx_n\bx_n\T = \mathrm{diag}(\blank{c},\ 2)\\
\bw^{(1)} &= \bw^{(0)}-(N\nabla^2L)^{-1}(N\nabla L) = (\blank{d},\ 0)
\end{aligned}$$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0.5, tol: 0 },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'num', ans: 3, tol: 0 },
      d: { kind: 'num', ans: -1 / 3, tol: 0.01 },
    } }, H),

  Object.assign({ id: 'h2e', ch: 2, title: 'Trouver le minimiseur exact', src: 'HW2 P2.(3)',
    text: R`<p class="hyp"><b>Données.</b> Même modèle et mêmes points : $\bx_1 = (-2,-2)$, $y_1 = 1$ ; $\bx_2 = (-2,2)$, $y_2 = 1$ ; $\bx_3 = (-2,0)$, $y_3 = 0$ ; $\nabla L\propto\sum_n(\hat y_n-y_n)\bx_n$. Avec $\bw = (a,b)$ : $\hat y_1 = \sigma(-2a-2b)$, $\hat y_2 = \sigma(-2a+2b)$, $\hat y_3 = \sigma(-2a)$.</p>
<p><b>Calcul.</b>
$$\begin{aligned}
\text{2ᵉ composante :}\ 2(\hat y_2-\hat y_1) = 0\ &\Longrightarrow\ \sigma(-2a+2b) = \sigma(-2a-2b)\ \Longrightarrow\ b = \blank{a}\\
\text{1ʳᵉ composante :}\ 3s-2 = 0\ &\Longrightarrow\ s = \sigma(-2a) = \blank{b}\ \Longrightarrow\ a = \blank{c}\\
\big\|(-\tfrac13,0)-\bw^\star\big\|_1 &\approx\blank{d}
\end{aligned}$$
La première ligne utilise que $\sigma$ est injective.</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 2 / 3, tol: 0.01 },
      c: { kind: 'num', ans: -Math.log(2) / 2, tol: 0.01 },
      d: { kind: 'num', ans: Math.log(2) / 2 - 1 / 3, tol: 0.02 },
    },
    solution: R`$-2a = \ln\frac{2/3}{1/3} = \ln2$ ; $(-\frac13,0)$ est le pas de Newton depuis 0, à $0.0132$ de l'optimum.` }, H),

  // ------------------------------------------------------------------ HW3
  Object.assign({ id: 'h3a', ch: 3, title: 'Marge géométrique et normalisation', src: 'HW3 P1.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> Données $(\bx_i,y_i)$, $y_i\in\{-1,+1\}$ ; hyperplan $H = \{\bw\T\bx+b = 0\}$ qui sépare strictement : $y_i(\bw\T\bx_i+b)>0$ pour tout $i$.</p>
<p class="claim"><b>Proposition.</b> La marge vaut $\frac{\min_iy_i(\bw\T\bx_i+b)}{\|\bw\|}$ ; on peut imposer $\min_iy_i(\bw\T\bx_i+b) = 1$ ; la marge optimale vaut $\frac1{\|\bw^\star\|}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\mathrm{dist}(\bx_i,H) &= \frac{|\bw\T\bx_i+b|}{\|\bw\|} = \frac{\blank{a}}{\|\bw\|} &&\text{(i)}\\
m = \min_iy_i(\bw\T\bx_i+b)>0,\quad\lambda = \blank{b}\ &\Longrightarrow\ \min_iy_i(\lambda\bw\T\bx_i+\lambda b) = 1 &&\text{(ii)}\\
\rho^\star &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) car $|y_i| = 1$ et $y_i(\bw\T\bx_i+b)>0$. (ii) ne change ni la frontière ni la marge. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`y_i(w^\top x_i+b)`, 'y_i(w^T x_i + b)', 'y_i f(x_i)'], tex: R`y_i(\bw\T\bx_i+b)` },
      b: { kind: 'expr', ans: ['1/m', R`\frac{1}{m}`], tex: R`1/m` },
      c: { kind: 'expr', ans: [R`\frac{1}{\|w^*\|}`, '1/||w*||', R`1/\|w^\star\|`, R`\frac{1}{\|w^\star\|}`], tex: R`\frac1{\|\bw^\star\|}` },
    } }, H),

  Object.assign({ id: 'h3b', ch: 3, title: 'Dériver le dual de la SVM à marge dure', src: 'HW3 P1.(2)',
    text: R`<p class="hyp"><b>Cadre.</b> $L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$, $\alpha_i\ge0$, $g(\boldsymbol\alpha) = \inf_{\bw,b}L$.</p>
<p class="claim"><b>Proposition.</b> $g(\boldsymbol\alpha) = -\infty$ si $\sum_i\alpha_iy_i\ne0$, et sinon $g(\boldsymbol\alpha) = \sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\bx_i\T\bx_j$.</p>
<p><b>Preuve.</b> Avec $\bv = \sum_i\alpha_iy_i\bx_i$ et $s = \sum_i\alpha_iy_i$ :</p>
$$\begin{aligned}
L &= \tfrac12\bw\T\bw-\bw\T\bv+\textstyle\sum_i\alpha_i-b\,\blank{a} &&\text{(i)}\\
s\ne0:\quad L(0,b,\boldsymbol\alpha) &= \textstyle\sum_i\alpha_i-sb\ \xrightarrow[b\to\pm\infty]{}\ \blank{b} &&\text{(ii)}\\
s = 0:\quad\nabla_\bw L = 0\iff\bw = \bv,\quad g(\boldsymbol\alpha) &= \tfrac12\bv\T\bv-\bv\T\bv+\textstyle\sum_i\alpha_i = \sum_i\alpha_i-\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(iii) : $L$ est quadratique en $\bw$ de hessienne $\bI$, donc strictement convexe. La stationnarité en $b$ ne détermine pas $b^\star$, car pour $s = 0$, $L$ ne [[d]] plus de $b$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['s'], tex: 's' },
      b: { kind: 'expr', ans: [R`-\infty`, '-inf', '-infinity', '-∞'], tex: R`-\infty` },
      c: { kind: 'expr', ans: [R`\frac12v^\top v`, '1/2 v^T v', R`\frac{1}{2}\|v\|^2`, '1/2 ||v||^2', R`\frac12\|v\|^2`], tex: R`\frac12\bv\T\bv` },
      d: { kind: 'word', ans: ['depend', 'dépend', 'depend plus'], tex: 'dépend' },
    } }, H),

  Object.assign({ id: 'h3c', ch: 3, title: 'Démontrer la complémentarité, puis trouver $b^\\star$', src: 'HW3 P1.(3)',
    text: R`<p class="hyp"><b>Cadre.</b> Même Lagrangien que la SVM à marge dure : $L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$, $g = \inf_{\bw,b}L$. $(\bw^\star,b^\star)$ optimal pour le primal ($p^\star = \frac12\|\bw^\star\|^2$), $\boldsymbol\alpha^\star\ge0$ optimal pour le dual, dualité forte $g(\boldsymbol\alpha^\star) = p^\star$. On note $c_i = 1-y_i(\bw^{\star\top}\bx_i+b^\star)$.</p>
<p class="claim"><b>Proposition.</b> $\alpha_i^\star c_i = 0$ pour tout $i$ ; si $\alpha_s^\star>0$, $b^\star = y_s-\bw^{\star\top}\bx_s$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
g(\boldsymbol\alpha^\star) &\le L(\bw^\star,b^\star,\boldsymbol\alpha^\star) = \tfrac12\|\bw^\star\|^2+\textstyle\sum_i\alpha_i^\star c_i\le p^\star &&\text{(i)}\\
g(\boldsymbol\alpha^\star) = p^\star\ &\Longrightarrow\ \textstyle\sum_i\alpha_i^\star c_i = \blank{a} &&\text{(ii)}\\
\alpha_s^\star>0\ &\Longrightarrow\ c_s = 0\ \Longrightarrow\ b^\star = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : un infimum est inférieur à chaque valeur, et $\alpha_i^\star\ge0$ avec $c_i\,\blank{c}\,0$ (admissibilité). (ii) : les deux bouts sont égaux ; des termes tous $\le0$ de somme nulle sont tous [[d]]. (iii) : multiplier $y_s(\bw^{\star\top}\bx_s+b^\star) = 1$ par $y_s$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`y_s-w^{*\top}x_s`, 'y_s - w*^T x_s', R`y_s-w^{\star\top}x_s`, 'y_s - w^T x_s', R`y_s-\sum_j\alpha_j^*y_jx_j^\top x_s`], tex: R`y_s-\bw^{\star\top}\bx_s` },
      c: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      d: { kind: 'word', ans: ['nuls', 'nul', 'zero', 'egaux a zero'], tex: 'nuls' },
    } }, H),

  Object.assign({ id: 'h3d', ch: 3, title: 'Lire les écarts $\\xi_i$ de la marge souple', src: 'HW3 P2.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> SVM souple : $\min\frac12\|\bw\|^2+C\sum_i\xi_i$ sous $y_if(\bx_i)\ge1-\xi_i$, $\xi_i\ge0$ ; à l'optimum $\xi_i = \max\{0,1-y_if(\bx_i)\}$.</p>
<p class="claim"><b>Proposition.</b> $\sum_i\xi_i$ majore le nombre d'erreurs d'entraînement.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\xi_i = 0\ &\iff\ y_if(\bx_i)\ge1\quad\text{(bien classé, hors de la rue)}\\
0\lt\xi_i\lt1\ &\iff\ 0\lt y_if(\bx_i)\lt1\quad\text{(bien classé mais dans la rue)}\\
\xi_i\ge1\ &\iff\ y_if(\bx_i)\le\blank{a}\quad\text{(sur la frontière ou mal classé)}
\end{aligned}$$
<p>Chaque erreur a donc $\xi_i\ge\blank{b}$, et chaque $\xi_i\ge0$ : $\sum_i\xi_i\ge\#\text{erreurs}$. Un $C$ très grand rapproche de la marge [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'word', ans: ['dure', 'hard'], tex: 'dure' },
    } }, H),

  Object.assign({ id: 'h3e', ch: 3, title: 'Un point qui rend la marge dure infaisable', src: 'HW3 P2.(2)',
    text: R`<p class="hyp"><b>Données.</b> Négatifs $\bx_1 = (0,-1)$, $\bx_2 = (-2,0)$, $\bx_3 = (-1,-2)$ ; positifs $(2,1)$, $(2,3)$, $(4,1)$ ; on ajoute $\bx_7 = (-1,-1)$ avec $y_7 = +1$.</p>
<p class="claim"><b>Proposition.</b> La SVM à marge dure devient infaisable.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\tfrac13(\bx_1+\bx_2+\bx_3) &= \blank{a} &&\text{(i)}\\
f(\bx_7) &= \tfrac13\big(f(\bx_1)+f(\bx_2)+f(\bx_3)\big)\le\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) : $f$ est affine, et les contraintes des négatifs imposent $f(\bx_i)\le-1$. Or $y_7 = +1$ impose $f(\bx_7)\ge1$ : contradiction. Avec la marge souple et $\bw = (\frac13,\frac23)$, $b = -\frac13$ : $\xi_7 = 1-y_7f(\bx_7) = \blank{c}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['(-1,-1)', '(-1, -1)'], tex: '(-1,-1)' },
      b: { kind: 'num', ans: -1, tol: 0 },
      c: { kind: 'num', ans: 7 / 3, tol: 0.01 },
    } }, H),

  // ------------------------------------------------------------------ HW4
  Object.assign({ id: 'h4a', ch: 4, title: 'Erreur d\'entraînement contre généralisation ($N = 2$)', src: 'HW4 P1.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> Perte quadratique ; $X = 0$ p.s., $Y = \pm1$ avec probabilité $\frac12$ ; $S = \{(0,y_1),(0,y_2)\}$ i.i.d. ; $\hat f = \bar y = \frac{y_1+y_2}2$.</p>
<p class="claim"><b>Proposition.</b> $\E_S[\hL_S(\hat f)] = \frac12$ et $\E_S[L(\hat f)] = \frac32$.</p>
<p><b>Preuve.</b> Les 4 couples $(y_1,y_2)$ ont probabilité $\frac14$.</p>
$$\begin{aligned}
y_1 = y_2:\ \hL_S(\hat f) = \blank{a};\qquad y_1\ne y_2:\ \hL_S(\hat f) = 1\ &\Longrightarrow\ \E_S[\hL_S(\hat f)] = \tfrac12 &&\text{(i)}\\
L(c) = \tfrac12(1-c)^2+\tfrac12(-1-c)^2 &= \blank{b} &&\text{(ii)}\\
\E_S[L(\hat f)] = \E[1+\bar y^2] = 1+\tfrac12\cdot1+\tfrac12\cdot0 &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(iii) : $\bar y = \pm1$ avec probabilité $\frac12$, $\bar y = 0$ sinon. L'écart vient de ce que $S$ sert à la fois à [[d]] et à évaluer $\hat f$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: ['1+c^2', 'c^2+1'], tex: '1+c^2' },
      c: { kind: 'num', ans: 1.5, tol: 0 },
      d: { kind: 'word', ans: ['construire', 'ajuster', 'apprendre', 'entrainer', 'entraîner', 'fit'], tex: 'construire' },
    } }, H),

  Object.assign({ id: 'h4b', ch: 4, title: 'Un écart de généralisation en $2/N$', src: 'HW4 P1.(2)',
    text: R`<p class="hyp"><b>Cadre.</b> $X = 0$ p.s., $Y = \pm1$ avec probabilité $\frac12$ ; $N$ exemples i.i.d. ; $\hat f = \bar y = \frac1N\sum_iy_i$ ; perte quadratique.</p>
<p class="claim"><b>Proposition.</b> $\E[\hL_S(\hat f)] = 1-\frac1N$, $\E[L(\hat f)] = 1+\frac1N$, écart $\frac2N$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\hL_S(\hat f) &= \tfrac1N\textstyle\sum_iy_i^2-\bar y^2 = \blank{a} &&\text{(i)}\\
L(\hat f) &= \E[Y^2]-2\bar y\,\E[Y]+\bar y^2 = 1+\bar y^2 &&\text{(ii)}\\
\E[\bar y^2] &= \tfrac1{N^2}\textstyle\sum_{i,j}\E[y_iy_j] = \tfrac1{N^2}\cdot N = \blank{b} &&\text{(iii)}
\end{aligned}$$
<p>(iii) : $\E[y_iy_j] = 0$ si $i\ne j$ (indépendance, moyenne nulle) et $1$ si $i = j$. L'écart espéré vaut $\blank{c}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`1-\bar y^2`, '1 - ybar^2', '1-ȳ^2', '1-ybar^2'], tex: R`1-\bar y^2` },
      b: { kind: 'expr', ans: ['1/N', R`\frac{1}{N}`], tex: R`\frac1N` },
      c: { kind: 'expr', ans: ['2/N', R`\frac{2}{N}`], tex: R`\frac2N` },
    } }, H),

  Object.assign({ id: 'h4c', ch: 4, title: 'Une évaluation sur données indépendantes est sans biais', src: 'HW4 P1.(3)',
    text: R`<p class="hyp"><b>Cadre.</b> $S\sim P^N$, $\hat f = \mathcal A(S)$ avec $\mathcal A$ déterministe ; $S_{\text{eval}} = \{(\tilde\bx_i,\tilde y_i)\}_{i=1}^m\sim P^m$ indépendant de $S$ ; $\hat L_{\text{eval}}(f) = \frac1m\sum_i\ell(\tilde y_i,f(\tilde\bx_i))$ ; $L(f) = \E_P[\ell(y,f(\bx))]$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[\hat L_{\text{eval}}(\hat f)\big] = \E_S\big[L(\hat f)\big]$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E\big[\hat L_{\text{eval}}(\hat f)\big] &= \tfrac1m\textstyle\sum_i\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\big] &&\text{(i)}\\
\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\mid S\big] &= \blank{a} &&\text{(ii)}\\
\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\big] &= \E\Big[\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\mid S\big]\Big] = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : linéarité. (ii) : sachant $S$, $\hat f$ est fixé ($\mathcal A$ déterministe) et $(\tilde\bx_i,\tilde y_i)$ suit encore $P$ car il est [[c]] de $S$. (iii) : loi des espérances totales. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)`, 'L(fhat)', 'L(f^)', 'L(f)'], tex: R`L(\hat f)` },
      b: { kind: 'expr', ans: [R`E_S[L(\hat f)]`, R`\E_S[L(\hat f)]`, 'E_S[L(fhat)]', 'E[L(f^)]', R`E[L(\hat f)]`], tex: R`\E_S[L(\hat f)]` },
      c: { kind: 'word', ans: ['independant', 'indépendant', 'independent'], tex: 'indépendant' },
    } }, H),

  Object.assign({ id: 'h4d', ch: 4, title: 'Lire des scores de validation croisée', src: 'HW4 P2.(1)',
    text: R`<p class="hyp"><b>Données.</b> Validation croisée à 5 plis de même taille. MSE de validation : A $= (0.23,0.31,0.27,0.35,0.29)$, B $= (0.07,0.11,0.14,0.10,0.12)$, C $= (0.10,0.09,0.12,0.11,0.11)$. MSE d'entraînement moyennes : A $0.260$, B $0.012$, C $0.080$.</p>
<p><b>Calcul.</b>
$$\mathrm{CV}(A) = \blank{a},\qquad\mathrm{CV}(B) = \blank{b},\qquad\mathrm{CV}(C) = \blank{c}.$$
On choisit [[d]]. Sous-apprentissage le plus net (entraînement élevé, petit écart) : [[e]]. Sur-apprentissage le plus net (entraînement presque nul, grand écart) : [[f]].</p>`,
    blanks: {
      a: { kind: 'num', ans: 0.29, tol: 0.005 },
      b: { kind: 'num', ans: 0.108, tol: 0.005 },
      c: { kind: 'num', ans: 0.106, tol: 0.005 },
      d: { kind: 'word', ans: ['C', 'modele C', 'candidat C'], tex: 'C' },
      e: { kind: 'word', ans: ['A', 'modele A', 'candidat A'], tex: 'A' },
      f: { kind: 'word', ans: ['B', 'modele B', 'candidat B'], tex: 'B' },
    } }, H),

  Object.assign({ id: 'h4e', ch: 4, title: 'Plus de régularisation : $Q_\\lambda$ baisse, $R_\\lambda$ monte', src: 'HW4 P2.(2)(a)',
    text: R`<p class="hyp"><b>Cadre.</b> $\hat\bw_\lambda$ minimise $R(\bw)+\lambda Q(\bw)$ ($R$ : erreur d'entraînement, $Q(\bw) = \sum_{j\ge1}w_j^2$) ; $0\le\lambda_1\lt\lambda_2$, $R_k = R(\hat\bw_{\lambda_k})$, $Q_k = Q(\hat\bw_{\lambda_k})$.</p>
<p class="claim"><b>Proposition.</b> $Q_2\le Q_1$ et $R_2\ge R_1$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
R_1+\lambda_1Q_1 &\le R_2+\lambda_1Q_2 &&\text{(i)}\\
R_2+\lambda_2Q_2 &\le\blank{a} &&\text{(ii)}\\
(\lambda_2-\lambda_1)\,Q_2 &\le\blank{b} &&\text{(iii)}\\
R_1-R_2 &\le\lambda_1(\blank{c})\le0. &&\text{(iv)}
\end{aligned}$$
<p>(i) et (ii) : un minimiseur fait au moins aussi bien que l'autre point. (iii) : (i) + (ii), puis on divise par $\lambda_2-\lambda_1>0$. (iv) : on réécrit (i), avec $\lambda_1\ge0$ et $Q_2\le Q_1$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`R_1+\lambda_2Q_1`, 'R_1 + lambda_2 Q_1', 'R1+λ2Q1'], tex: R`R_1+\lambda_2Q_1` },
      b: { kind: 'expr', ans: [R`(\lambda_2-\lambda_1)Q_1`, '(lambda_2 - lambda_1) Q_1', '(λ2-λ1)Q1'], tex: R`(\lambda_2-\lambda_1)Q_1` },
      c: { kind: 'expr', ans: ['Q_2-Q_1', 'Q2-Q1'], tex: 'Q_2-Q_1' },
    } }, H),

  Object.assign({ id: 'h4f', ch: 4, title: 'Régulariser plus peut généraliser moins bien', src: 'HW4 P2.(2)(b)',
    text: R`<p class="hyp"><b>Cadre.</b> $X$ uniforme sur $\{-1,1\}$, $Y = X$ ; $f(x) = w_0+w_1x$ ; ridge sur $T = \{(-1,-1),(1,1)\}$ : $J_\lambda = \frac12\big[(-1-w_0+w_1)^2+(1-w_0-w_1)^2\big]+\lambda w_1^2$.</p>
<p class="claim"><b>Proposition.</b> L'erreur de généralisation du modèle ajusté vaut $\big(\frac\lambda{1+\lambda}\big)^2$, croissante en $\lambda$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\frac{\partial J_\lambda}{\partial w_0} &= 2w_0 = 0,\qquad\frac{\partial J_\lambda}{\partial w_1} = -2+2w_1+2\lambda w_1 = 0\ \Longrightarrow\ \hat w_1 = \blank{a} &&\text{(i)}\\
L(f) &= \E\big[((1-w_1)X-w_0)^2\big] = (1-w_1)^2+w_0^2 &&\text{(ii)}\\
L(\hat f_\lambda) &= \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : $\E[X] = 0$, $\E[X^2] = 1$. Pour $\lambda = 0$, $L = 0$ ; pour $\lambda = 1$, $L = \blank{c}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1}{1+\lambda}`, '1/(1+lambda)', '1/(1+λ)'], tex: R`\frac1{1+\lambda}` },
      b: { kind: 'expr', ans: [R`(\frac{\lambda}{1+\lambda})^2`, '(lambda/(1+lambda))^2', '(λ/(1+λ))^2', R`\frac{\lambda^2}{(1+\lambda)^2}`, 'lambda^2/(1+lambda)^2'], tex: R`\big(\frac{\lambda}{1+\lambda}\big)^2` },
      c: { kind: 'num', ans: 0.25, tol: 0 },
    } }, H),

  Object.assign({ id: 'h4g', ch: 4, title: 'Le minimum des scores de CV n\'est pas une évaluation', src: 'HW4 P2.(3)',
    text: R`<p class="hyp"><b>Cadre.</b> On choisit $(d,\lambda)$ parmi des candidats $c$ par validation croisée sur $S_{\text{dev}}$ (scores $\mathrm{CV}(c)$), on réajuste sur tout $S_{\text{dev}}$ ($f_{\text{final}}$), et on dispose de $S_{\text{test}}$ indépendant, de taille $m$.</p>
<p class="claim"><b>Proposition.</b> $\E[\min_c\mathrm{CV}(c)]\le\min_c\E[\mathrm{CV}(c)]$ ; un score sans biais est $\hat L_{S_{\text{test}}}(f_{\text{final}}) = \frac1m\sum_{S_{\text{test}}}(y-f_{\text{final}}(x))^2$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\forall c':\quad\min_c\mathrm{CV}(c) &\ \blank{a}\ \mathrm{CV}(c')\ \Longrightarrow\ \E\big[\min_c\mathrm{CV}(c)\big]\le\E[\mathrm{CV}(c')] &&\text{(i)}\\
\E\big[\hat L_{S_{\text{test}}}(f_{\text{final}})\big] &= \blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>(i) : les plis ont servi à [[c]] le candidat, donc le minimum est biaisé vers le bas. (ii) : toute la procédure est un algorithme déterministe appliqué à $S_{\text{dev}}$, et $S_{\text{test}}$ en est indépendant. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: [R`E[L(f_{final})]`, R`\E[L(f_{\text{final}})]`, 'E[L(f_final)]', R`\E_{S_{dev}}[L(f_{final})]`], tex: R`\E\big[L(f_{\text{final}})\big]` },
      c: { kind: 'word', ans: ['choisir', 'selectionner', 'sélectionner', 'select'], tex: 'choisir' },
    } }, H),
  // ------------------------------------------------------------------ HW5
  Object.assign({ id: 'h5a', ch: 5, title: 'Invariance de la softmax et version stable', src: 'HW5 P2.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> Logits $\mathbf z\in\R^K$, $\mathrm{softmax}(\mathbf z)_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, calculée en double précision (overflow de $e^z$ pour $z\gtrsim709$, underflow pour $z\lesssim-745$).</p>
<p class="claim"><b>Proposition.</b> $\mathrm{softmax}(\mathbf z+c\mathbf 1_K) = \mathrm{softmax}(\mathbf z)$ ; avec $c = -\max_jz_j$, le calcul ne fait ni overflow ni division par 0.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\frac{e^{z_k+c}}{\sum_je^{z_j+c}} &= \frac{\blank{a}\,e^{z_k}}{\blank{a}\sum_je^{z_j}} = \mathrm{softmax}(\mathbf z)_k &&\text{(i)}\\
c = -m,\ m = \max_jz_j:\quad z_j-m\ \blank{b}\ 0\ &\Longrightarrow\ 0\lt e^{z_j-m}\le1 &&\text{(ii)}\\
\textstyle\sum_je^{z_j-m} &\ge e^{0} = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : pas d'overflow. (iii) : le terme du maximum vaut 1, donc le dénominateur ne peut pas [[d]] vers 0. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['e^c', R`\exp(c)`, 'exp(c)'], tex: 'e^c' },
      b: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      c: { kind: 'num', ans: 1, tol: 0 },
      d: { kind: 'word', ans: ['underflow', 'tomber', 'sous-depasser'], tex: 'underflow' },
    } }, H),

  Object.assign({ id: 'h5b', ch: 5, title: 'Log-softmax stable et cross-entropy depuis les logits', src: 'HW5 P2.(3)–(4)',
    text: R`<p class="hyp"><b>Données.</b> $Z = \begin{pmatrix}0&-1000&-2000\\1000&0&-1000\end{pmatrix}$, étiquettes $\mathbf y = (1,1)$ (indices commençant à 0), $L_{\mathrm{CE}} = -\frac1B\sum_n\mathrm{logsoftmax}(Z)_{n,y_n}$, double précision ($e^{-1000}$ underflow vers 0).</p>
<p class="claim"><b>Proposition.</b> $\mathrm{logsoftmax}(\mathbf z)_k = (z_k-m)-\log\sum_je^{z_j-m}$ avec $m = \max_jz_j$ donne une perte finie, contrairement à $\log(\mathrm{softmax})$.</p>
<p><b>Preuve et calcul.</b></p>
$$\begin{aligned}
\log\textstyle\sum_je^{z_j} &= m+\log\textstyle\sum_je^{z_j-\blank{a}} &&\text{(i)}\\
\mathrm{logsoftmax}(Z) &= \begin{pmatrix}0&-1000&-2000\\0&\blank{b}&-2000\end{pmatrix} &&\text{(ii)}\\
\log\big(\mathrm{softmax}(Z)\big)_{n,1} &= \log 0 = \blank{c} &&\text{(iii)}\\
L_{\mathrm{CE}}\ \text{(log-softmax stable)} &= \blank{d}. &&\text{(iv)}
\end{aligned}$$
<p>(i) : on factorise $e^m$. (iii) : la vraie probabilité $e^{-1000}$ a fait un [[e]] vers 0 avant le $\log$ ; la perte calculée ainsi vaut $+\infty$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['m'], tex: 'm' },
      b: { kind: 'num', ans: -1000, tol: 0 },
      c: { kind: 'expr', ans: [R`-\infty`, '-inf', '-infinity', '-∞'], tex: R`-\infty` },
      d: { kind: 'num', ans: 1000, tol: 0 },
      e: { kind: 'word', ans: ['underflow', 'soupassement'], tex: 'underflow' },
    } }, H),

  Object.assign({ id: 'h5c', ch: 5, title: 'Formes dans un bloc de self-attention', src: 'HW5 P3.(1)',
    text: R`<p class="hyp"><b>Données.</b> $X\in\R^{T\times D}$, $Q = XW_Q$, $K = XW_K$, $V = XW_V$, $S = QK^\top/\sqrt{d_k}$, $A = \mathrm{softmax}_{\text{row}}(S)$, $H = AV$, $O = HW_O+X$, $Z = OW_C+\mathbf 1_Tb_C^\top$. $T = 4$, $D = 6$, $d_k = 3$, $d_v = 4$, $C = 5$ ; $W_Q,W_K\in\R^{6\times3}$, $W_V\in\R^{6\times4}$, $W_O\in\R^{4\times6}$, $W_C\in\R^{6\times5}$.</p>
<p><b>Calcul.</b> Nombre de colonnes de chaque matrice (toutes ont $T = 4$ lignes) :
$$Q:\ \blank{a},\qquad V:\ \blank{b},\qquad S, A:\ \blank{c},\qquad O:\ \blank{d},\qquad Z:\ \blank{e}.$$
La somme résiduelle $HW_O+X$ n'est possible que parce que $W_O$ ramène la dimension $d_v$ à [[f]].</p>`,
    blanks: {
      a: { kind: 'num', ans: 3, tol: 0 }, b: { kind: 'num', ans: 4, tol: 0 }, c: { kind: 'num', ans: 4, tol: 0 }, d: { kind: 'num', ans: 6, tol: 0 }, e: { kind: 'num', ans: 5, tol: 0 },
      f: { kind: 'word', ans: ['D', 'D = 6', '6'], tex: '$D$' },
    } }, H),

  Object.assign({ id: 'h5d', ch: 5, title: 'Rétropropager à travers $H = \\mathrm{softmax}(QK^\\top/\\sqrt{d_k})V$', src: 'HW5 P3.(2)',
    text: R`<p class="hyp"><b>Cadre.</b> $S = QK^\top/\sqrt{d_k}$, $A = \mathrm{softmax}_{\text{row}}(S)$, $H = AV$, et $G_M := \partial L/\partial M$. On connaît $G_H$ et $\frac{\partial A_{ij}}{\partial S_{ik}} = A_{ij}(\mathbb 1\{j = k\}-A_{ik})$.</p>
<p class="claim"><b>Proposition.</b> $G_A = G_HV^\top$, $G_V = A^\top G_H$, $G_S = A\odot(G_A-\mathbf r\mathbf 1^\top)$ avec $r_i = \sum_jA_{ij}(G_A)_{ij}$, $G_Q = G_SK/\sqrt{d_k}$, $G_K = G_S^\top Q/\sqrt{d_k}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
H_{ij} = \textstyle\sum_kA_{ik}V_{kj}\ &\Longrightarrow\ (G_A)_{ik} = \textstyle\sum_j(G_H)_{ij}\,\blank{a},\qquad G_V = \blank{b} &&\text{(i)}\\
(G_S)_{ik} &= \textstyle\sum_j(G_A)_{ij}A_{ij}\big(\mathbb 1\{j = k\}-A_{ik}\big) = A_{ik}\big((G_A)_{ik}-\blank{c}\big) &&\text{(ii)}\\
S_{ij} = \tfrac1{\sqrt{d_k}}\textstyle\sum_mQ_{im}K_{jm}\ &\Longrightarrow\ G_Q = \frac{G_S\,\blank{d}}{\sqrt{d_k}},\qquad G_K = \frac{\blank{e}\,Q}{\sqrt{d_k}}. &&\text{(iii)}
\end{aligned}$$
<p>Contrôle : chaque ligne de $G_S$ somme à $\blank{f}$, car $\sum_kA_{ik} = 1$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['V_{kj}', 'V_kj'], tex: 'V_{kj}' },
      b: { kind: 'expr', ans: [R`A^\top G_H`, 'A^T G_H', 'AᵀG_H'], tex: R`A^\top G_H` },
      c: { kind: 'expr', ans: ['r_i', R`\sum_jA_{ij}(G_A)_{ij}`, 'sum_j A_ij (G_A)_ij'], tex: 'r_i' },
      d: { kind: 'expr', ans: ['K'], tex: 'K' },
      e: { kind: 'expr', ans: [R`G_S^\top`, 'G_S^T', 'G_Sᵀ'], tex: R`G_S^\top` },
      f: { kind: 'num', ans: 0, tol: 0 },
    } }, H),
  // ------------------------------------------------------------------ HW6
  Object.assign({ id: 'h6a', ch: 6, title: 'Exponential weighting : prédire avant le retour', src: 'HW6 P1.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> Exponential weighting avec experts $h_1,\dots,h_K$ : $w_1 = (1,\dots,1)$ ; au tour $t$, on pose $p_t(i) = w_t(i)/\sum_jw_t(j)$, on tire $I_t\sim p_t$ et on prédit $\hat y_t = h_{I_t}(x_t)$, <em>puis</em> on observe $y_t$ et on met à jour $w_{t+1}(i) = w_t(i)\,e^{-\eta\ell_{t,i}}$ avec $\ell_{t,i} = \ell(y_t,h_i(x_t))$.</p>
<p class="claim"><b>Proposition.</b> La loi $p_t$ ne dépend pas de l'étiquette courante $y_t$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
w_t(i) &= w_1(i)\prod_{s=1}^{\blank{a}}e^{-\eta\ell_{s,i}} = \exp\Big(-\eta\textstyle\sum_{s\lt t}\ell(y_s,h_i(x_s))\Big) &&\text{(i)}\\
p_t(i) &= \frac{w_t(i)}{\sum_jw_t(j)}\ \text{ne fait intervenir que } y_1,\dots,y_{t-1}. &&\text{(ii)}
\end{aligned}$$
<p>Dans l'algorithme, $y_t$ est observé [[b]] le tirage de $I_t$ et la prédiction ; il ne sert qu'à calculer $\blank{c}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['t-1'], tex: 't-1' },
      b: { kind: 'word', ans: ['après', 'apres', 'after'], tex: 'après' },
      c: { kind: 'expr', ans: ['w_{t+1}', 'w_t+1', 'w_(t+1)', 'p_{t+1}'], tex: 'w_{t+1}' },
    } }, H),

  Object.assign({ id: 'h6b', ch: 6, title: 'Exponential weighting à la main : classification 0-1', src: 'HW6 P1.(2)',
    text: R`<p class="hyp"><b>Données.</b> Deux experts constants $h_1\equiv0$, $h_2\equiv1$ ; étiquettes $(y_1,y_2) = (1,1)$ ; perte 0-1 $\ell_{t,i} = \mathbb 1[h_i(x_t)\ne y_t]$ ; exponential weighting avec $\eta = \ln2$, $w_1 = (1,1)$, $T = 2$. Perte espérée $\E[\ell_t] = \sum_ip_t(i)\ell_{t,i}$, $L^* = \min_i\sum_t\ell_{t,i}$, regret $R = \sum_t\E[\ell_t]-L^*$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
e^{-\eta\ell} &= \blank{a}\quad(\text{pour }\eta = \ln2) &&\text{(i)}\\
p_1 = \big(\tfrac12,\tfrac12\big),\ \ \ell_1 = (1,0)\ &\Longrightarrow\ \E[\ell_1] = \tfrac12,\qquad w_2 = \big(\blank{b},\ 1\big) &&\text{(ii)}\\
p_2 &= \big(\blank{c},\ \tfrac23\big),\qquad \E[\ell_2] = \blank{d} &&\text{(iii)}\\
L^* &= \blank{e},\qquad R = \tfrac12+\tfrac13-L^* = \blank{f}. &&\text{(iv)}
\end{aligned}$$
<p>EW déplace sa masse vers l'expert qui a toujours raison, mais paie l'exploration du premier tour.</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['2^{-\\ell}', '2^-l', '2^(-l)', '2^-ℓ', '1/2^l', '2^{-l}'], tex: '2^{-\\ell}' },
      b: { kind: 'num', ans: 1 / 2, tex: '\\tfrac12' },
      c: { kind: 'num', ans: 1 / 3, tex: '\\tfrac13' },
      d: { kind: 'num', ans: 1 / 3, tex: '\\tfrac13' },
      e: { kind: 'num', ans: 0, tol: 0 },
      f: { kind: 'num', ans: 5 / 6, tex: '\\tfrac56' },
    } }, H),

  Object.assign({ id: 'h6c', ch: 6, title: 'Exponential weighting à la main : régression, perte réalisée contre espérée', src: 'HW6 P2.(1)–(2)',
    text: R`<p class="hyp"><b>Données.</b> Deux experts constants $h_1\equiv1$, $h_2\equiv2$ ; cibles $(y_1,y_2) = (1,3)$ ; perte carrée $\ell_{t,i} = (h_i(x_t)-y_t)^2$ ; exponential weighting avec $\eta = \ln2$, $w_1 = (1,1)$, $T = 2$. Perte espérée $\E[\ell_t] = \sum_ip_t(i)\ell_{t,i}$, $L^* = \min_i\sum_t\ell_{t,i}$, regret $R = \sum_t\E[\ell_t]-L^*$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\ell_1 = (0,1),\ \ \ell_2 &= \big(\blank{a},\ 1\big) &&\text{(i)}\\
p_1 = \big(\tfrac12,\tfrac12\big)\ \Longrightarrow\ \E[\ell_1] = \tfrac12,\qquad w_2 &= \big(1,\ \blank{b}\big),\qquad p_2 = \big(\blank{c},\ \tfrac13\big) &&\text{(ii)}\\
\E[\ell_2] &= \blank{d} &&\text{(iii)}\\
L^* &= \min(4,2) = 2,\qquad R = \tfrac12+\E[\ell_2]-L^* = \blank{e} &&\text{(iv)}\\
I_2 = 1\ \Longrightarrow\ \hat y_2 &= 1,\qquad \ell(y_2,\hat y_2) = \blank{f}. &&\text{(v)}
\end{aligned}$$
<p>La perte réalisée (v) n'est pas égale à $\E[\ell_2]$ : c'est une variable [[g]], qui vaut 4 avec probabilité $p_2(1)$ et 1 avec probabilité $p_2(2)$ ; seule sa moyenne vaut $\E[\ell_2]$.</p>`,
    blanks: {
      a: { kind: 'num', ans: 4, tol: 0 },
      b: { kind: 'num', ans: 1 / 2, tex: '\\tfrac12' },
      c: { kind: 'num', ans: 2 / 3, tex: '\\tfrac23' },
      d: { kind: 'num', ans: 3, tol: 0 },
      e: { kind: 'num', ans: 3 / 2, tex: '\\tfrac32' },
      f: { kind: 'num', ans: 4, tol: 0 },
      g: { kind: 'word', ans: ['aléatoire', 'aleatoire', 'random'], tex: 'aléatoire' },
    } }, H),
  );
})(window.ML);
