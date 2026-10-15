/* Exercices — Chapitre 1 : régression linéaire, au format « sujet d'examen » :
   Cadre → Proposition (ou Définition / Données) → Preuve en chaîne alignée et numérotée, avec des cases (1), (2)… à compléter. */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<p class="hyp"><b>Cadre.</b> $N$ exemples $(x_n,y_n)$ et $L$ fonctions de base ; $\bphi_n = (\phi_1(x_n),\dots,\phi_L(x_n))\T$. La design matrix $\bPhi\in\R^{N\times L}$ a pour lignes les $\bphi_n\T$, $\by = (y_1,\dots,y_N)\T$, et $\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2$.</p>`;

  ML.EX.add(
  { id: 'lr1', ch: 1, type: 'deriv', title: 'Le meilleur prédicteur pour la MSE est $\\E[Y\\mid X]$', src: 'Slides p.4 · HW1 Q2.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> $(X,Y)$ est un couple aléatoire, $f$ un prédicteur quelconque, et $m(X) := \E[Y\mid X]$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[(Y-f(X))^2\big] = \E\big[\Var(Y\mid X)\big]+\E\big[(m(X)-f(X))^2\big]$. La MSE est donc minimale pour $f = m$, et la MSE minimale vaut $\E[\Var(Y\mid X)]$.</p>
<p><b>Preuve.</b> On écrit $Y-f(X) = \big(Y-m(X)\big)+\big(m(X)-f(X)\big)$ et on développe le carré :</p>
$$\begin{aligned}
\E\big[(Y-f(X))^2\big] &= \E\big[(Y-m(X))^2\big]+2\,\E\big[(Y-m(X))(m(X)-f(X))\big]+\E\big[(m(X)-f(X))^2\big] &&\text{(i)}\\
\E\big[(Y-m(X))(m(X)-f(X))\big] &= \E\Big[(m(X)-f(X))\;\blank{a}\Big] &&\text{(ii)}\\
\E[Y-m(X)\mid X] &= m(X)-m(X) = \blank{b} &&\text{(iii)}\\
\E\big[(Y-m(X))^2\big] &= \E\Big[\E\big[(Y-m(X))^2\mid X\big]\Big] = \E\big[\blank{c}\big]. &&\text{(iv)}
\end{aligned}$$
<p>(ii) et (iv) viennent de la loi des [[d]] : $\E[Z] = \E\big[\E[Z\mid X]\big]$ ; dans (ii), $m(X)-f(X)$ sort de l'espérance conditionnelle car il ne dépend que de $X$. Par (iii), le terme croisé est nul. Le premier terme ne dépend pas de $f$ et le dernier est $\ge0$, nul ssi $f(X) = m(X)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`E[Y-m(X)|X]`, R`\E[Y-m(X)\mid X]`, 'E[Y - m(X) | X]', R`\mathbb E[Y-m(X)|X]`], tex: R`\E[Y-m(X)\mid X]` },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'expr', ans: [R`\Var(Y|X)`, 'Var(Y|X)', 'Var(Y | X)', R`\operatorname{Var}(Y\mid X)`], tex: R`\Var(Y\mid X)` },
      d: { kind: 'word', ans: ['esperances totales', 'espérances totales', 'espérance totale', 'esperance totale', 'tower property', 'total expectation', 'des esperances iterees'], tex: 'espérances totales' },
    } },

  { id: 'lr2', ch: 1, type: 'def', title: 'La design matrix', src: 'Slides p.12 · HW1 Q2.(2)',
    text: R`<p class="hyp"><b>Cadre.</b> $N$ exemples $(x_n,y_n)$, $L$ fonctions de base $\phi_1,\dots,\phi_L$, modèle $f(x) = \sum_{\ell=1}^Lw_\ell\phi_\ell(x) = \bw\T\bphi(x)$.</p>
<p><b>Définition.</b> La design matrix $\bPhi$ a $\blank{a}$ lignes (une par [[b]]) et $L$ colonnes (une par fonction de base) :
$$\Phi_{n\ell} = \blank{c},\qquad\text{prédictions sur les données} = \blank{d}.$$
Pour la base polynomiale $\bphi(x) = (1,x,\dots,x^M)\T$, $L = \blank{e}$.</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['N'], tex: 'N' },
      b: { kind: 'word', ans: ['exemple', 'point', 'donnee', 'donnée', 'observation'], tex: 'exemple' },
      c: { kind: 'expr', ans: [R`\phi_\ell(x_n)`, 'phi_l(x_n)', R`\phi_{\ell}(x_{n})`, 'φ_ℓ(x_n)', 'phi_ell(x_n)'], tex: R`\phi_\ell(x_n)` },
      d: { kind: 'expr', ans: [R`\Phi w`, 'Phi w', 'Φw', R`\bPhi\bw`], tex: R`\bPhi\bw` },
      e: { kind: 'expr', ans: ['M+1', '1+M'], tex: 'M+1' },
    } },

  { id: 'lr3', ch: 1, type: 'deriv', title: 'Les équations normales', src: 'Slides p.14 · HW1 Q2.(2)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Tout minimiseur de $\EMSE$ vérifie $\bPhi\T\bPhi\,\bw = \bPhi\T\by$ ; si $\bPhi\T\bPhi$ est inversible, $\bw_{\text{LS}} = (\bPhi\T\bPhi)^{-1}\bPhi\T\by$.</p>
<p><b>Preuve.</b> On développe la norme, puis on dérive :</p>
$$\begin{aligned}
\|\by-\bPhi\bw\|^2 &= (\by-\bPhi\bw)\T(\by-\bPhi\bw) = \by\T\by-2\,\blank{a}+\bw\T\blank{b}\,\bw &&\text{(i)}\\
\nabla\EMSE(\bw) &= \tfrac1N\big(-2\bPhi\T\by+\blank{c}\big) &&\text{(ii)}\\
\nabla\EMSE(\bw) = 0 &\iff \bPhi\T\bPhi\,\bw = \bPhi\T\by. &&
\end{aligned}$$
<p>Dans (i), on regroupe $\by\T\bPhi\bw$ et $\bw\T\bPhi\T\by$ car ce sont des [[d]] égaux. (ii) utilise $\nabla(\bw\T\mathbf c) = \mathbf c$ et $\nabla(\bw\T\mathbf A\bw) = 2\mathbf A\bw$ pour $\mathbf A$ symétrique. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`w^\top\Phi^\top y`, 'w^T Phi^T y', 'wᵀΦᵀy', R`y^\top\Phi w`, 'y^T Phi w', R`\bw\T\bPhi\T\by`], tex: R`\bw\T\bPhi\T\by` },
      b: { kind: 'expr', ans: [R`\Phi^\top\Phi`, 'Phi^T Phi', 'ΦᵀΦ', R`\bPhi\T\bPhi`], tex: R`\bPhi\T\bPhi` },
      c: { kind: 'expr', ans: [R`2\Phi^\top\Phi w`, '2 Phi^T Phi w', '2ΦᵀΦw', R`2\bPhi\T\bPhi\bw`], tex: R`2\bPhi\T\bPhi\bw` },
      d: { kind: 'word', ans: ['scalaires', 'scalaire', 'nombres', 'reels', 'réels', 'scalars'], tex: 'scalaires' },
    } },

  { id: 'lr4', ch: 1, type: 'deriv', title: 'La MSE empirique est convexe', src: 'Slides p.14 · HW1 Q2.(3)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> $\EMSE$ est convexe ; tout point stationnaire est un minimum global.</p>
<p><b>Preuve.</b> Le gradient vaut $\frac2N\bPhi\T(\bPhi\bw-\by)$. Pour toute direction $\bv\in\R^L$ :</p>
$$\begin{aligned}
\nabla^2\EMSE &= \blank{a} &&\text{(i)}\\
\bv\T\nabla^2\EMSE\,\bv &= \tfrac2N\,(\bPhi\bv)\T(\bPhi\bv) = \tfrac2N\,\blank{b}\ \ge\ 0. &&\text{(ii)}
\end{aligned}$$
<p>Par (ii), la hessienne est semi-définie positive en tout point, donc $\EMSE$ est [[c]], et un point où le gradient s'annule est un minimum [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{2}{N}\Phi^\top\Phi`, '2/N Phi^T Phi', '2/N ΦᵀΦ', R`\frac2N\bPhi\T\bPhi`], tex: R`\frac2N\bPhi\T\bPhi` },
      b: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', '‖Φv‖²', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
      c: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
      d: { kind: 'word', ans: ['global', 'globaux'], tex: 'global' },
    } },

  { id: 'lr5', ch: 1, type: 'deriv', title: 'Les moindres carrés sont une projection orthogonale', src: 'PRML §3.1.2', srcKind: 'book',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Si $\bPhi\T\bPhi$ est inversible, $\hby = \bPhi\bw_{\text{LS}}$ est la projection orthogonale de $\by$ sur l'espace colonne de $\bPhi$, de matrice $\bP = \bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T$, et $\bP^2 = \bP$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\bPhi\T\bPhi\,\bw_{\text{LS}} = \bPhi\T\by\ &\iff\ \bPhi\T(\by-\hby) = \blank{a} &&\text{(i)}\\
\hby = \bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T\by &= \bP\by &&\text{(ii)}\\
\bP^2 = \bPhi(\bPhi\T\bPhi)^{-1}\,\blank{b}\,(\bPhi\T\bPhi)^{-1}\bPhi\T &= \bP. &&\text{(iii)}
\end{aligned}$$
<p>(i) dit que le résidu $\by-\hby$ est orthogonal à chaque [[c]] de $\bPhi$ : c'est la caractérisation de la projection orthogonale. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['0', R`\mathbf 0`], tex: R`\mathbf 0` },
      b: { kind: 'expr', ans: [R`\Phi^\top\Phi`, 'Phi^T Phi', 'ΦᵀΦ'], tex: R`\bPhi\T\bPhi` },
      c: { kind: 'word', ans: ['colonne', 'colonnes', 'column'], tex: 'colonne' },
    } },

  { id: 'lr6', ch: 1, type: 'deriv', title: 'Bruit gaussien : MLE = moindres carrés', src: 'Slides p.17 · HW1 Q3.(1)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Si $y_n = \bw\T\bphi_n+\varepsilon_n$ avec $\varepsilon_n\sim\N(0,\sigma^2)$ indépendants, alors $\bw_{\text{MLE}} = \bw_{\text{LS}}$.</p>
<p><b>Preuve.</b> Chaque exemple a pour vraisemblance $p(y_n\mid\bw) = \frac1{\sqrt{2\pi\sigma^2}}\exp\big(-\frac{\blank{a}}{2\sigma^2}\big)$. Donc</p>
$$\begin{aligned}
\ln\mathcal L(\bw) &= \ln\prod_{n=1}^Np(y_n\mid\bw) = \sum_{n=1}^N\ln p(y_n\mid\bw) &&\text{(i)}\\
&= \blank{b}-\frac1{2\sigma^2}\sum_{n=1}^N(y_n-\bw\T\bphi_n)^2 &&\text{(ii)}\\
&= \blank{b}-\frac{N}{2\sigma^2}\,\EMSE(\bw). &&\text{(iii)}
\end{aligned}$$
<p>(i) vient de l'[[c]] des exemples. Le premier terme ne dépend pas de $\bw$ et $\frac N{2\sigma^2}>0$ : maximiser $\ln\mathcal L$ revient à minimiser $\EMSE$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`(y_n-w^\top\phi_n)^2`, '(y_n - w^T phi_n)^2', '(y_n-wᵀφ_n)^2', R`(y_n-\bw\T\bphi_n)^2`], tex: R`(y_n-\bw\T\bphi_n)^2` },
      b: { kind: 'expr', ans: [R`-\frac{N}{2}\ln(2\pi\sigma^2)`, '-N/2 ln(2 pi sigma^2)', '-N/2 ln(2πσ²)', R`-\frac N2\ln(2\pi\sigma^2)`], tex: R`-\frac N2\ln(2\pi\sigma^2)` },
      c: { kind: 'word', ans: ['independance', 'indépendance', 'independence'], tex: 'indépendance' },
    } },

  { id: 'lr7', ch: 1, type: 'deriv', title: 'Forme close du ridge, toujours inversible', src: 'Slides p.22 · HW1 Q3.(3)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Pour $\lambda>0$, $E(\bw) = \EMSE(\bw)+\lambda\|\bw\|^2$ a pour unique minimiseur $\bw_{\text{ridge}} = (N\lambda\bI+\bPhi\T\bPhi)^{-1}\bPhi\T\by$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\nabla E(\bw) &= \tfrac2N\bPhi\T(\bPhi\bw-\by)+\blank{a} &&\text{(i)}\\
\nabla E(\bw) = 0\ &\iff\ \bPhi\T\bPhi\bw-\bPhi\T\by+\blank{b} = 0\ \iff\ (N\lambda\bI+\bPhi\T\bPhi)\bw = \bPhi\T\by &&\text{(ii)}\\
\forall\bv\ne0,\quad\bv\T(N\lambda\bI+\bPhi\T\bPhi)\bv &= N\lambda\|\bv\|^2+\blank{c}\ >\ 0. &&\text{(iii)}
\end{aligned}$$
<p>(ii) s'obtient en multipliant (i) par $\frac N2$. Par (iii), la matrice est [[d]], donc inversible même si $\bPhi\T\bPhi$ ne l'est pas, et $E$ est strictement convexe. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`2\lambda w`, '2 lambda w', '2λw', R`2\lambda\bw`], tex: R`2\lambda\bw` },
      b: { kind: 'expr', ans: [R`N\lambda w`, 'N lambda w', 'Nλw', R`N\lambda\bw`], tex: R`N\lambda\bw` },
      c: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
      d: { kind: 'word', ans: ['definie positive', 'définie positive', 'positive definite'], tex: 'définie positive' },
    } },

  { id: 'lr8', ch: 1, type: 'deriv', title: 'Prior gaussien : MAP = ridge', src: 'Slides p.25–26 · HW1 Q3.(2)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Avec un bruit $\N(0,\sigma^2)$ et le prior $\bw\sim\N(0,\bSigma)$, $\bw_{\text{MAP}} = (\sigma^2\bSigma^{-1}+\bPhi\T\bPhi)^{-1}\bPhi\T\by$ ; pour $\bSigma = \tau^2\bI$, c'est le ridge avec $\lambda = \frac{\sigma^2}{N\tau^2}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p(\bw\mid\by) &\propto p(\by\mid\bw)\;\blank{a} &&\text{(i)}\\
-\ln p(\bw\mid\by) &= \tfrac1{2\sigma^2}\|\by-\bPhi\bw\|^2+\blank{b}+\text{cste} &&\text{(ii)}\\
0 = -\tfrac1{\sigma^2}\bPhi\T(\by-\bPhi\bw)+\bSigma^{-1}\bw\ &\iff\ (\blank{c}+\bPhi\T\bPhi)\,\bw = \bPhi\T\by. &&\text{(iii)}
\end{aligned}$$
<p>(i) est la formule de [[d]]. Avec $\bSigma = \tau^2\bI$, on identifie $\frac{\sigma^2}{\tau^2} = N\lambda$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['p(w)', R`p(\bw)`], tex: R`p(\bw)` },
      b: { kind: 'expr', ans: [R`\frac12w^\top\Sigma^{-1}w`, '1/2 w^T Sigma^-1 w', '½wᵀΣ⁻¹w', R`\frac{1}{2}w^\top\Sigma^{-1}w`], tex: R`\frac12\bw\T\bSigma^{-1}\bw` },
      c: { kind: 'expr', ans: [R`\sigma^2\Sigma^{-1}`, 'sigma^2 Sigma^-1', 'σ²Σ⁻¹', 'σ^2 Σ^-1'], tex: R`\sigma^2\bSigma^{-1}` },
      d: { kind: 'word', ans: ['bayes', 'Bayes'], tex: 'Bayes' },
    } },

  { id: 'lr9', ch: 1, type: 'deriv', title: 'Lasso en 1D : seuillage doux', src: 'Hors slides', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $a\in\R$, $\lambda>0$, $g(w) = (w-a)^2+\lambda|w|$ (convexe). Sous-différentiel : $\partial|w| = \{\mathrm{sign}(w)\}$ si $w\ne0$.</p>
<p class="claim"><b>Proposition.</b> Le minimiseur est $w^* = \mathrm{sign}(a)\max\{0,\,|a|-\frac\lambda2\}$.</p>
<p><b>Preuve.</b> $w^*$ minimise $g$ ssi $0\in2(w^*-a)+\lambda\,\partial|w^*|$.</p>
$$\begin{aligned}
\partial|w|(0) &= \blank{a} &&\text{(i)}\\
w>0:\quad 2(w-a)+\lambda = 0\ &\iff\ w = \blank{b}\quad(\text{admissible ssi } a>\tfrac\lambda2) &&\text{(ii)}\\
w = 0:\quad 0\in[-2a-\lambda,\,-2a+\lambda]\ &\iff\ |a|\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>Le cas $w\lt0$ est symétrique de (ii). $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['[-1,1]', '[-1, 1]'], tex: '[-1,1]' },
      b: { kind: 'expr', ans: [R`a-\lambda/2`, R`a-\frac{\lambda}{2}`, 'a - lambda/2', 'a-λ/2'], tex: R`a-\frac\lambda2` },
      c: { kind: 'expr', ans: [R`\lambda/2`, R`\frac{\lambda}{2}`, 'lambda/2', 'λ/2'], tex: R`\frac\lambda2` },
    } },

  { id: 'lr10', ch: 1, type: 'def', title: 'Descente de gradient, momentum, SGD', src: 'Slides p.35, 37, 42, 44',
    text: R`<p class="hyp"><b>Cadre.</b> On minimise $\hL(\bw) = \frac1N\sum_{n=1}^N\ell_n(\bw)$ avec $\ell_n(\bw) = (\bw\T\bphi_n-y_n)^2$, pas $\gamma_t>0$.</p>
<p><b>Définitions.</b></p>
$$\begin{aligned}
\text{GD :}\quad&\bw_{t+1} = \bw_t-\gamma_t\nabla\hL(\bw_t) = \bw_t-\blank{a}\sum_{n=1}^N(\bw_t\T\bphi_n-y_n)\bphi_n\\
\text{Momentum :}\quad&\bw_{t+1} = \bw_t-\gamma_t\nabla\hL(\bw_t)+\blank{b}\qquad(\alpha\in[0,1))\\
\text{SGD :}\quad&\bw_{t+1} = \bw_t-\gamma_t\,\frac1{|\mathcal B_t|}\sum_{i\in\mathcal B_t}\nabla\ell_i(\bw_t)
\end{aligned}$$
<p>où $\mathcal B_t$ est un [[c]] tiré au hasard.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{2\gamma_t}{N}`, '2 gamma/N', '2γ/N', '2gamma_t/N', '2γ_t/N', R`\frac{2\gamma}{N}`], tex: R`\frac{2\gamma_t}N` },
      b: { kind: 'expr', ans: [R`\alpha(w_t-w_{t-1})`, 'alpha(w_t - w_{t-1})', 'α(w_t-w_{t-1})', R`\alpha\Delta w_t`, 'alpha Delta w_t'], tex: R`\alpha(\bw_t-\bw_{t-1})` },
      c: { kind: 'word', ans: ['mini-batch', 'minibatch', 'mini batch', 'sous-ensemble', 'lot'], tex: 'mini-batch' },
    } },

  { id: 'lr11', ch: 1, type: 'deriv', title: 'Le gradient stochastique est sans biais', src: 'Slides p.45',
    text: R`<p class="hyp"><b>Cadre.</b> $\hL(\bw) = \frac1N\sum_{i=1}^N\ell_i(\bw)$ ; $\mathcal B$ est tiré uniformément parmi les sous-ensembles de taille $B$ de $\{1,\dots,N\}$ ; $\bw$ est fixé et $\bg = \frac1B\sum_{i\in\mathcal B}\nabla\ell_i(\bw)$.</p>
<p class="claim"><b>Proposition.</b> $\E_{\mathcal B}[\bg] = \nabla\hL(\bw)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E_{\mathcal B}[\bg] &= \E_{\mathcal B}\Big[\frac1B\sum_{i=1}^N\blank{a}\,\nabla\ell_i(\bw)\Big] &&\text{(i)}\\
&= \frac1B\sum_{i=1}^NP(i\in\mathcal B)\,\nabla\ell_i(\bw) &&\text{(ii)}\\
&= \frac1B\sum_{i=1}^N\blank{b}\,\nabla\ell_i(\bw) = \nabla\hL(\bw). &&\text{(iii)}
\end{aligned}$$
<p>(ii) vient de la [[c]] de l'espérance. Dans (iii), toutes les probabilités $P(i\in\mathcal B)$ sont égales par symétrie et somment à $\E|\mathcal B| = B$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mathbb 1[i\in B]`, '1[i in B]', R`1(i\in B)`, R`\mathbb{1}[i\in\mathcal B]`, '1_{i in B}'], tex: R`\mathbb 1[i\in\mathcal B]` },
      b: { kind: 'expr', ans: ['B/N', R`\frac{B}{N}`], tex: R`\frac BN` },
      c: { kind: 'word', ans: ['linearite', 'linéarité', 'linearity'], tex: 'linéarité' },
    } },

  { id: 'lr12', ch: 1, type: 'deriv', title: 'Trop de paramètres : erreur d\'entraînement nulle', src: 'Slides p.20',
    text: R`<p class="hyp"><b>Cadre.</b> Régression polynomiale de degré $M$ sur $N$ points d'abscisses distinctes : $\bPhi\in\R^{N\times(M+1)}$, $\Phi_{nk} = x_n^k$.</p>
<p class="claim"><b>Proposition.</b> Si $M+1>N$, $\bPhi\T\bPhi$ est singulière ; si $M+1\ge N$, l'erreur d'entraînement minimale est nulle.</p>
<p><b>Preuve.</b> Les $M+1$ colonnes de $\bPhi$ sont des vecteurs de $\R^{\blank{a}}$. S'il y en a plus que la dimension, elles sont linéairement [[b]], donc $\ker\bPhi\ne\{0\}$ et $\bPhi\T\bPhi$ n'est pas inversible. Si $M+1\ge N$, un polynôme de degré $\le M$ passe par les $N$ points ([[c]]) : l'erreur d'entraînement vaut $\blank{d}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['N'], tex: 'N' },
      b: { kind: 'word', ans: ['dependantes', 'dépendantes', 'dependent', 'liees', 'liées'], tex: 'dépendantes' },
      c: { kind: 'word', ans: ['interpolation', 'interpolation de lagrange', 'lagrange'], tex: 'interpolation' },
      d: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'd1a', ch: 1, type: 'deriv', title: '$\\bPhi\\T\\bPhi$ inversible $\\iff$ colonnes de $\\bPhi$ indépendantes', src: 'Chapitre 1, §2',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> $\ker(\bPhi\T\bPhi) = \ker\bPhi$. En particulier, $\bPhi\T\bPhi$ est inversible ssi les colonnes de $\bPhi$ sont linéairement indépendantes.</p>
<p><b>Preuve.</b> Soit $\bv\in\R^L$.</p>
$$\begin{aligned}
\bPhi\bv = 0\ &\Longrightarrow\ \bPhi\T\bPhi\bv = \bPhi\T\mathbf 0 = 0 &&\text{(i)}\\
\bPhi\T\bPhi\bv = 0\ &\Longrightarrow\ 0 = \bv\T\bPhi\T\bPhi\bv = \blank{a}\ \Longrightarrow\ \bPhi\bv = \blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(i) donne $\ker\bPhi\subseteq\ker\bPhi\T\bPhi$ et (ii) l'inclusion inverse. Une matrice carrée est inversible ssi son noyau est $\blank{c}$, et $\ker\bPhi = \{0\}$ signifie qu'aucune combinaison non nulle des colonnes ne vaut 0 : les colonnes sont linéairement [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', '|Phi v|^2', R`\|\bPhi\bv\|^2`, '(Phi v)^T(Phi v)'], tex: R`\|\bPhi\bv\|^2` },
      b: { kind: 'expr', ans: ['0'], tex: '0' },
      c: { kind: 'expr', ans: [R`\{0\}`, '{0}', R`\{\mathbf 0\}`], tex: R`\{0\}` },
      d: { kind: 'word', ans: ['independantes', 'indépendantes', 'independent', 'lineairement independantes'], tex: 'indépendantes' },
    } },

  { id: 'lr17', ch: 1, type: 'deriv', title: 'L\'ensemble des solutions des moindres carrés', src: 'Chapitre 1, §3',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Si $\hat\bw$ minimise $\EMSE$, l'ensemble des minimiseurs est $\hat\bw+\ker\bPhi = \{\hat\bw+\bv : \bPhi\bv = 0\}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\bv\in\ker\bPhi\ &\Longrightarrow\ \bPhi(\hat\bw+\bv) = \bPhi\hat\bw+\blank{a} = \bPhi\hat\bw &&\text{(i)}\\
\bw_1,\bw_2\ \text{minimiseurs}\ &\Longrightarrow\ \bPhi\bw_1 = \bPhi\bw_2 = \hby\ \Longrightarrow\ \bw_1-\bw_2\in\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>Par (i), $\hat\bw+\bv$ fait les mêmes prédictions, donc a la même MSE : c'est aussi un minimiseur. Dans (ii), $\hby$ est la même pour les deux car la projection orthogonale de $\by$ sur l'espace colonne est [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\Phi v`, 'Phi v', 'Φv', R`\bPhi\bv`], tex: R`\bPhi\bv` },
      b: { kind: 'expr', ans: [R`\ker\Phi`, 'ker Phi', 'ker(Phi)', R`\ker\bPhi`], tex: R`\ker\bPhi` },
      c: { kind: 'word', ans: ['unique'], tex: 'unique' },
    } },

  { id: 'lr18', ch: 1, type: 'deriv', title: 'La solution de norme minimale par la SVD', src: 'Chapitre 1, §3',
    text: CADRE + R`<p class="hyp">On écrit la SVD $\bPhi = \mathbf U\boldsymbol\Sigma\mathbf V\T$ ($\mathbf U$, $\mathbf V$ orthogonales, valeurs singulières $\sigma_1\ge\dots\ge\sigma_r>0$, $r$ = rang), et on pose $\bz = \mathbf V\T\bw$, $\mathbf c = \mathbf U\T\by$.</p>
<p class="claim"><b>Proposition.</b> Parmi les minimiseurs de $\|\by-\bPhi\bw\|^2$, celui de norme minimale est $\bw^\dagger = \mathbf V\boldsymbol\Sigma^+\mathbf U\T\by = \bPhi^\dagger\by$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\|\by-\bPhi\bw\|^2 &= \|\mathbf U\T\by-\boldsymbol\Sigma\mathbf V\T\bw\|^2 = \|\mathbf c-\boldsymbol\Sigma\bz\|^2 &&\text{(i)}\\
&= \sum_{i=1}^r(c_i-\sigma_iz_i)^2+\sum_{i>r}c_i^2 &&\text{(ii)}\\
\text{minimum}\ &\iff\ z_i = \blank{a}\ \ (i\le r),\quad z_i\ \text{quelconque}\ (i>r) &&\text{(iii)}\\
\|\bw\| = \|\bz\|\ &\Longrightarrow\ \text{norme minimale pour } z_i = \blank{b}\ \ (i>r). &&\text{(iv)}
\end{aligned}$$
<p>(i) et (iv) utilisent qu'une matrice orthogonale [[c]] les normes. Dans (ii), $\sigma_i = 0$ pour $i>r$. D'où $\bz^\dagger = \boldsymbol\Sigma^+\mathbf c$ et $\bw^\dagger = \mathbf V\bz^\dagger$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`c_i/\sigma_i`, R`\frac{c_i}{\sigma_i}`, 'c_i/sigma_i', 'c_i/σ_i'], tex: R`c_i/\sigma_i` },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'word', ans: ['conserve', 'preserve', 'préserve', 'conserve les normes'], tex: 'conserve' },
    } },

  { id: 'd1c', ch: 1, type: 'deriv', title: '$-\\nabla f$ est la direction de plus forte descente', src: 'Chapitre 1, §6',
    text: R`<p class="hyp"><b>Cadre.</b> $f:\R^D\to\R$ différentiable, $\bx$ un point où $\nabla f(\bx)\ne0$, et $\bu$ une direction de norme 1.</p>
<p class="claim"><b>Proposition.</b> La dérivée directionnelle $D_\bu f(\bx)$ est minimale pour $\bu = -\nabla f(\bx)/\|\nabla f(\bx)\|$, et vaut alors $-\|\nabla f(\bx)\|$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
f(\bx+h\bu) &= f(\bx)+h\,\blank{a}+o(h) &&\text{(i)}\\
D_\bu f(\bx) = \lim_{h\to0}\frac{f(\bx+h\bu)-f(\bx)}h &= \nabla f(\bx)\T\bu &&\text{(ii)}\\
\nabla f(\bx)\T\bu &\ge -\|\nabla f(\bx)\|\,\|\bu\| = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i) est le développement de [[c]] à l'ordre 1 ; (iii) est l'inégalité de [[d]], avec égalité ssi $\bu$ est colinéaire à $\nabla f$ et de sens opposé. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\nabla f(x)^\top u`, 'grad f(x)^T u', R`\nabla f(\bx)\T\bu`, 'nabla f(x)^T u', R`\nabla f^\top u`], tex: R`\nabla f(\bx)\T\bu` },
      b: { kind: 'expr', ans: [R`-\|\nabla f(x)\|`, '-||grad f(x)||', R`-\|\nabla f\|`, '-||nabla f||', '-||nabla f(x)||'], tex: R`-\|\nabla f(\bx)\|` },
      c: { kind: 'word', ans: ['taylor'], tex: 'Taylor' },
      d: { kind: 'word', ans: ['Cauchy-Schwarz', 'cauchy schwarz', 'inegalite de cauchy-schwarz'], tex: 'Cauchy–Schwarz' },
    } },

  { id: 'd1d', ch: 1, type: 'deriv', title: 'Convergence de la descente de gradient sur une quadratique', src: 'Chapitre 1, §6',
    text: R`<p class="hyp"><b>Cadre.</b> $\hL(\bx) = \frac12\bx\T\bA\bx-\bb\T\bx$ avec $\bA$ symétrique définie positive, de valeurs propres $\mu_{\max} = \mu_1\ge\dots\ge\mu_D = \mu_{\min}>0$ ; minimum $\bx^* = \bA^{-1}\bb$. Descente de gradient $\bx_{t+1} = \bx_t-\gamma\nabla\hL(\bx_t)$, erreur $\be_t = \bx_t-\bx^*$.</p>
<p class="claim"><b>Proposition.</b> La descente converge ssi $0\lt\gamma\lt2/\mu_{\max}$, et le meilleur pas est $\gamma^* = \frac2{\mu_{\max}+\mu_{\min}}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\nabla\hL(\bx_t) &= \bA\bx_t-\bb = \bA(\bx_t-\bx^*) &&\text{(i)}\\
\be_{t+1} &= \be_t-\gamma\bA\be_t = (\blank{a})\,\be_t &&\text{(ii)}\\
e^{(i)}_t &= \blank{b}\;e^{(i)}_0\qquad\text{(coordonnée sur le } i\text{-ème vecteur propre)} &&\text{(iii)}\\
\text{convergence}\ &\iff\ |1-\gamma\mu_i|\lt1\ \ \forall i\ \iff\ 0\lt\gamma\lt\blank{c}. &&\text{(iv)}
\end{aligned}$$
<p>Le taux $\max_i|1-\gamma\mu_i|$ est minimal quand les deux extrêmes s'équilibrent, $1-\gamma\mu_{\min} = -(1-\gamma\mu_{\max})$, ce qui donne $\gamma^* = \blank{d}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`I-\gamma A`, 'I - gamma A', 'I-γA'], tex: R`\bI-\gamma\bA` },
      b: { kind: 'expr', ans: [R`(1-\gamma\mu_i)^t`, '(1-gamma mu_i)^t', '(1-γμ_i)^t'], tex: R`(1-\gamma\mu_i)^t` },
      c: { kind: 'expr', ans: [R`2/\mu_{\max}`, R`\frac{2}{\mu_{\max}}`, '2/mu_max', '2/μmax'], tex: R`2/\mu_{\max}` },
      d: { kind: 'expr', ans: [R`\frac{2}{\mu_{\max}+\mu_{\min}}`, '2/(mu_max+mu_min)', '2/(μmax+μmin)'], tex: R`\frac{2}{\mu_{\max}+\mu_{\min}}` },
    } },

  { id: 'lr19', ch: 1, type: 'calc', title: 'Moindres carrés avec $\\bPhi\\T\\bPhi$ singulière', src: 'Chapitre 1, §3',
    text: R`<p class="hyp"><b>Données.</b> Trois exemples tous en $x = 1$, de cibles $\by = (1,2,3)$ ; modèle $f(x) = w_0+w_1x$, donc $\bPhi$ a trois lignes égales à $(1,1)$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\bPhi\T\bPhi &= \begin{pmatrix}3&3\\3&3\end{pmatrix},\qquad\det(\bPhi\T\bPhi) = \blank{a}\\
\bPhi\T\by &= (6,6)\quad\Longrightarrow\quad\text{équations normales : } w_0+w_1 = \blank{b}\\
\ker\bPhi &= \{t(1,-1)\},\qquad\bw^\dagger = (\blank{c},\ \blank{c})
\end{aligned}$$
<p>$\bw^\dagger$ est le point de la droite des solutions le plus proche de l'origine (solution de norme minimale).</p>`,
    blanks: { a: { kind: 'num', ans: 0, tol: 0 }, b: { kind: 'num', ans: 2, tol: 0 }, c: { kind: 'num', ans: 1, tol: 0 } } },

  // ---------------------------------------------------------------- calculs
  { id: 'lr13', ch: 1, type: 'calc', title: 'Un pas de descente de gradient', src: 'Slides p.32–36',
    gen: r => {
      const t0 = [-6, -5, -4, -2, -1, 0, 1][r.int(7)], g = [0.001, 0.005, 0.01, 0.02][r.int(4)];
      const dL = t => 4 * t ** 3 + 21 * t ** 2 + 10 * t - 17, d = dL(t0), t1 = t0 - g * d;
      return { text: R`<p class="hyp"><b>Données.</b> $\hL(\theta) = \theta^4+7\theta^3+5\theta^2-17\theta+3$, descente de gradient $\theta_{k+1} = \theta_k-\gamma\hL'(\theta_k)$, $\theta_0 = ${t0}$, $\gamma = ${g}$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\hL'(\theta) &= \blank{a}\\
\hL'(\theta_0) &= \blank{b}\\
\theta_1 &= \theta_0-\gamma\,\hL'(\theta_0) = \blank{c}
\end{aligned}$$`,
        blanks: {
          a: { kind: 'expr', ans: ['4theta^3+21theta^2+10theta-17', '4θ^3+21θ^2+10θ-17', R`4\theta^3+21\theta^2+10\theta-17`], tex: R`4\theta^3+21\theta^2+10\theta-17` },
          b: { kind: 'num', ans: d, tol: 1e-4 }, c: { kind: 'num', ans: t1, tol: 1e-3 },
        },
        solution: R`$\theta_1 = ${t0}-${g}\times(${d}) = ${f(t1)}$.` };
    } },

  { id: 'lr14', ch: 1, type: 'calc', title: 'Pas de descente sur une quadratique', src: 'Slides p.38–39 · DL §7.3', srcKind: 'book',
    gen: r => {
      const m1 = [2, 4, 5, 8, 10, 20][r.int(6)], m2 = [0.5, 1, 2][r.int(3)];
      return { text: R`<p class="hyp"><b>Données.</b> $\hL(\bx) = \frac12\bx\T\bA\bx-\bb\T\bx$ avec $\bA = \operatorname{diag}(${m1}, ${m2})$, pas constant $\gamma$. Sur chaque direction propre, l'erreur vérifie $e^{(i)}_{t+1} = (1-\gamma\mu_i)e^{(i)}_t$ ; $\kappa = \mu_{\max}/\mu_{\min}$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\text{convergence}\iff|1-\gamma\mu_i|\lt1\ \forall i\ &\iff\ 0\lt\gamma\lt\blank{a}\\
\gamma^* = \frac{2}{\mu_{\max}+\mu_{\min}} &= \blank{b}\\
\text{taux}\ \frac{\kappa-1}{\kappa+1} &= \blank{c}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: 2 / m1 }, b: { kind: 'num', ans: 2 / (m1 + m2) }, c: { kind: 'num', ans: (m1 / m2 - 1) / (m1 / m2 + 1) } },
        solution: R`La contrainte la plus forte vient de $\mu_{\max} = ${m1}$ ; $\kappa = ${f(m1 / m2)}$.` };
    } },

  { id: 'lr15', ch: 1, type: 'calc', title: 'Moindres carrés à la main (3 points)', src: 'Slides p.13–14',
    gen: r => {
      const y = [r.int(5) - 1, r.int(5), r.int(5) + 1], yb = (y[0] + y[1] + y[2]) / 3, a = (y[2] - y[0]) / 2, b = yb - a;
      return { text: R`<p class="hyp"><b>Données.</b> Points $(0, ${y[0]})$, $(1, ${y[1]})$, $(2, ${y[2]})$ ; modèle $f(x) = w_1x+w_2$ ajusté par moindres carrés.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\bar x &= \blank{a},\qquad\bar y = \blank{b},\qquad\textstyle\sum_n(x_n-\bar x)^2 = \blank{c}\\
w_1 &= \frac{\sum_n(x_n-\bar x)(y_n-\bar y)}{\sum_n(x_n-\bar x)^2} = \blank{d}\\
w_2 &= \bar y-w_1\bar x = \blank{e}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: 1, tol: 0 }, b: { kind: 'num', ans: yb }, c: { kind: 'num', ans: 2, tol: 0 }, d: { kind: 'num', ans: a }, e: { kind: 'num', ans: b } },
        solution: R`Numérateur : $(-1)(${y[0]}-\bar y)+0+(1)(${y[2]}-\bar y) = ${y[2]}-${y[0]}$.` };
    } },

  { id: 'lr16', ch: 1, type: 'calc', title: 'Ridge scalaire', src: 'Slides p.22',
    gen: r => {
      const xs = [1, 2, 3].map(() => r.int(3) + 1), ys = xs.map(x => x * (r.int(3) + 1) - r.int(2)), lam = [0.1, 0.5, 1][r.int(3)], N = 3;
      const sxy = M.sum(xs.map((x, i) => x * ys[i])), sxx = M.sum(xs.map(x => x * x));
      return { text: R`<p class="hyp"><b>Données.</b> Modèle $f(x) = wx$ (sans biais), points $(${xs[0]},${ys[0]}), (${xs[1]},${ys[1]}), (${xs[2]},${ys[2]})$, objectif $\frac1N\sum_n(y_n-wx_n)^2+\lambda w^2$, $N = 3$, $\lambda = ${lam}$. En 1D : $w = \frac{\sum_nx_ny_n}{\sum_nx_n^2+N\lambda}$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\textstyle\sum_nx_n^2 &= \blank{a},\qquad\textstyle\sum_nx_ny_n = \blank{b}\\
w_{\text{LS}}\ (\lambda = 0) &= \blank{c},\qquad w_{\text{ridge}} = \blank{d}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: sxx, tol: 0 }, b: { kind: 'num', ans: sxy, tol: 0 }, c: { kind: 'num', ans: sxy / sxx }, d: { kind: 'num', ans: sxy / (sxx + N * lam) } },
        solution: R`Le ridge rétrécit le coefficient vers 0.` };
    } },
  );
})(window.ML);
