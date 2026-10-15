/* Exercices — Chapitre 1 : régression linéaire.
   Chaque exercice pose son cadre (toutes les notations sont définies dans l'énoncé) ;
   dans les démonstrations, les trous portent sur les étapes, pas seulement sur le résultat. */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  // cadre commun de la régression linéaire, rappelé dans les énoncés
  const CADRE = R`<b>Cadre.</b> $N$ exemples $(x_n,y_n)$, $L$ fonctions de base $\phi_1,\dots,\phi_L$, $\bphi_n = (\phi_1(x_n),\dots,\phi_L(x_n))\T$. La design matrix $\bPhi\in\R^{N\times L}$ a pour lignes les $\bphi_n\T$, $\by = (y_1,\dots,y_N)\T$, et $\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2$.<br>`;

  ML.EX.add(
  { id: 'lr1', ch: 1, type: 'def', title: 'Le meilleur prédicteur pour la MSE', src: 'Slides p.4 · HW1 Q2.(1)',
    text: R`<b>Cadre.</b> $(X,Y)$ est un couple aléatoire et $f$ un prédicteur quelconque ; on juge $f$ par sa MSE $\E\big[(Y-f(X))^2\big]$.<br>
Le prédicteur qui minimise la MSE s'appelle la fonction de [[a]] : $f^*(x) = \blank{b}$. La MSE minimale vaut $\E\big[\blank{c}\big]$ : c'est l'erreur [[d]], qu'aucun prédicteur ne peut faire disparaître.`,
    blanks: {
      a: { kind: 'word', ans: ['regression', 'régression', 'regression function'], tex: 'régression' },
      b: { kind: 'expr', ans: [R`E[Y|X=x]`, R`E[y|x]`, R`E[Y|x]`, R`\E[y\mid x]`, R`\E[Y\mid X=x]`, R`E[Y|X]`], tex: R`\E[Y\mid X=x]` },
      c: { kind: 'expr', ans: [R`\Var(Y|X)`, 'Var(Y|X)', 'Var(Y | X)', R`\operatorname{Var}(Y\mid X)`], tex: R`\Var(Y\mid X)` },
      d: { kind: 'word', ans: ['irreductible', 'irréductible', 'irreducible', 'de bruit'], tex: 'irréductible' },
    },
    solution: R`La démonstration (terme croisé nul par la loi des espérances totales) est l'exercice « Décomposition de la MSE » des questions de devoir.` },

  { id: 'lr2', ch: 1, type: 'def', title: 'La design matrix', src: 'Slides p.12 · HW1 Q2.(2)',
    text: R`<b>Cadre.</b> On dispose de $N$ exemples $(x_n,y_n)$ et de $L$ fonctions de base $\phi_1,\dots,\phi_L$ ; le modèle est $f(x) = \sum_{\ell=1}^Lw_\ell\phi_\ell(x) = \bw\T\bphi(x)$.<br>
La design matrix $\bPhi$ a $\blank{a}$ lignes (une par [[b]]) et $L$ colonnes (une par fonction de base), de coefficient $\Phi_{n\ell} = \blank{c}$. Le vecteur des prédictions sur les données est alors $\blank{d}$. Pour la base polynomiale $\bphi(x) = (1,x,\dots,x^M)\T$, $L = \blank{e}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['N'], tex: 'N' },
      b: { kind: 'word', ans: ['exemple', 'point', 'donnee', 'donnée', 'observation'], tex: 'exemple' },
      c: { kind: 'expr', ans: [R`\phi_\ell(x_n)`, 'phi_l(x_n)', R`\phi_{\ell}(x_{n})`, 'φ_ℓ(x_n)', 'phi_ell(x_n)'], tex: R`\phi_\ell(x_n)` },
      d: { kind: 'expr', ans: [R`\Phi w`, 'Phi w', 'Φw', R`\bPhi\bw`], tex: R`\bPhi\bw` },
      e: { kind: 'expr', ans: ['M+1', '1+M'], tex: 'M+1' },
    },
    solution: R`La constante $1$ compte comme une fonction de base, d'où $M+1$ colonnes.` },

  { id: 'lr3', ch: 1, type: 'deriv', title: 'Démo : les équations normales', src: 'Slides p.14 · HW1 Q2.(2)',
    text: CADRE + R`On développe : $\|\by-\bPhi\bw\|^2 = (\by-\bPhi\bw)\T(\by-\bPhi\bw) = \by\T\by-2\,\blank{a}+\bw\T\blank{b}\bw$, en regroupant $\by\T\bPhi\bw$ et $\bw\T\bPhi\T\by$ car ce sont des [[c]] égaux. Avec $\nabla(\bw\T\mathbf c) = \mathbf c$ et $\nabla(\bw\T\mathbf A\bw) = 2\mathbf A\bw$ ($\mathbf A$ symétrique) : $\nabla\EMSE(\bw) = \frac1N\big(-2\bPhi\T\by+\blank{d}\big)$. En annulant : $\bPhi\T\bPhi\bw = \bPhi\T\by$, et si $\bPhi\T\bPhi$ est inversible, $\bw_{\text{LS}} = (\bPhi\T\bPhi)^{-1}\bPhi\T\by$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`w^\top\Phi^\top y`, 'w^T Phi^T y', 'wᵀΦᵀy', R`y^\top\Phi w`, 'y^T Phi w', R`\bw\T\bPhi\T\by`], tex: R`\bw\T\bPhi\T\by` },
      b: { kind: 'expr', ans: [R`\Phi^\top\Phi`, 'Phi^T Phi', 'ΦᵀΦ', R`\bPhi\T\bPhi`], tex: R`\bPhi\T\bPhi` },
      c: { kind: 'word', ans: ['scalaires', 'scalaire', 'nombres', 'reels', 'réels', 'scalars'], tex: 'scalaires (un nombre est égal à sa transposée)' },
      d: { kind: 'expr', ans: [R`2\Phi^\top\Phi w`, '2 Phi^T Phi w', '2ΦᵀΦw', R`2\bPhi\T\bPhi\bw`], tex: R`2\bPhi\T\bPhi\bw` },
    } },

  { id: 'lr4', ch: 1, type: 'deriv', title: 'Démo : la MSE empirique est convexe', src: 'Slides p.14 · HW1 Q2.(3)',
    text: CADRE + R`Le gradient vaut $\frac2N\bPhi\T(\bPhi\bw-\by)$ ; en le dérivant encore, la hessienne vaut $\nabla^2\EMSE = \blank{a}$, qui ne dépend pas de $\bw$. Pour toute direction $\bv\in\R^L$ : $\bv\T\bPhi\T\bPhi\bv = (\bPhi\bv)\T(\bPhi\bv) = \blank{b}\ge0$. La hessienne est donc semi-définie positive partout, $\EMSE$ est [[c]], et tout point stationnaire est un minimum [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{2}{N}\Phi^\top\Phi`, '2/N Phi^T Phi', '2/N ΦᵀΦ', R`\frac2N\bPhi\T\bPhi`], tex: R`\frac2N\bPhi\T\bPhi` },
      b: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', '‖Φv‖²', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
      c: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
      d: { kind: 'word', ans: ['global', 'globaux'], tex: 'global' },
    } },

  { id: 'lr5', ch: 1, type: 'deriv', title: 'Démo : les moindres carrés sont une projection orthogonale', src: 'PRML §3.1.2', srcKind: 'book',
    text: CADRE + R`Soit $\hby = \bPhi\bw_{\text{LS}}$ (on suppose $\bPhi\T\bPhi$ inversible). Les équations normales s'écrivent $\bPhi\T(\by-\hby) = \blank{a}$ : le résidu est orthogonal à chaque [[b]] de $\bPhi$, donc $\hby$ est la projection orthogonale de $\by$ sur l'espace colonne. En remplaçant $\bw_{\text{LS}}$, $\hby = \bP\by$ avec $\bP = \blank{c}$. Projeter deux fois ne change rien : $\bP^2 = \bPhi(\bPhi\T\bPhi)^{-1}\,\blank{d}\,(\bPhi\T\bPhi)^{-1}\bPhi\T = \bP$.`,
    blanks: {
      a: { kind: 'expr', ans: ['0', R`\mathbf 0`], tex: R`\mathbf 0` },
      b: { kind: 'word', ans: ['colonne', 'colonnes', 'column'], tex: 'colonne' },
      c: { kind: 'expr', ans: [R`\Phi(\Phi^\top\Phi)^{-1}\Phi^\top`, 'Phi(Phi^T Phi)^-1 Phi^T', 'Φ(ΦᵀΦ)⁻¹Φᵀ'], tex: R`\bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T` },
      d: { kind: 'expr', ans: [R`\Phi^\top\Phi`, 'Phi^T Phi', 'ΦᵀΦ'], tex: R`\bPhi\T\bPhi` },
    } },

  { id: 'lr6', ch: 1, type: 'deriv', title: 'Démo : bruit gaussien, MLE = moindres carrés', src: 'Slides p.17 · HW1 Q3.(1)',
    text: CADRE + R`On suppose $y_n = \bw\T\bphi_n+\varepsilon_n$ avec $\varepsilon_n\sim\N(0,\sigma^2)$ indépendants. Chaque vraisemblance vaut $p(y_n\mid\bw) = \frac1{\sqrt{2\pi\sigma^2}}\exp\Big(-\frac{\blank{a}}{2\sigma^2}\Big)$. Le logarithme d'un produit est la [[b]] des logarithmes, donc
$$\ln\mathcal L(\bw) = \sum_n\ln p(y_n\mid\bw) = \blank{c}-\frac1{2\sigma^2}\sum_n(y_n-\bw\T\bphi_n)^2 = \blank{c}-\frac{N}{2\sigma^2}\EMSE(\bw).$$
Comme $\frac N{2\sigma^2}>0$, maximiser $\ln\mathcal L$ revient à minimiser $\EMSE$ : $\bw_{\text{MLE}} = \bw_{\text{LS}}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`(y_n-w^\top\phi_n)^2`, '(y_n - w^T phi_n)^2', '(y_n-wᵀφ_n)^2', R`(y_n-\bw\T\bphi_n)^2`], tex: R`(y_n-\bw\T\bphi_n)^2` },
      b: { kind: 'word', ans: ['somme', 'sum'], tex: 'somme' },
      c: { kind: 'expr', ans: [R`-\frac{N}{2}\ln(2\pi\sigma^2)`, '-N/2 ln(2 pi sigma^2)', '-N/2 ln(2πσ²)', R`-\frac N2\ln(2\pi\sigma^2)`], tex: R`-\frac N2\ln(2\pi\sigma^2)` },
    } },

  { id: 'lr7', ch: 1, type: 'deriv', title: 'Démo : forme close du ridge, toujours inversible', src: 'Slides p.22 · HW1 Q3.(3)',
    text: CADRE + R`Le ridge minimise $E(\bw) = \EMSE(\bw)+\lambda\|\bw\|^2$ avec $\lambda>0$. Comme $\nabla\|\bw\|^2 = 2\bw$ : $\nabla E = \frac2N\bPhi\T(\bPhi\bw-\by)+\blank{a}$. On l'annule et on multiplie par $\frac N2$ : $\bPhi\T\bPhi\bw-\bPhi\T\by+\blank{b} = 0$, soit $(N\lambda\bI+\bPhi\T\bPhi)\bw = \bPhi\T\by$. Pour tout $\bv\ne0$ : $\bv\T(N\lambda\bI+\bPhi\T\bPhi)\bv = N\lambda\|\bv\|^2+\blank{c}>0$. La matrice est [[d]], donc inversible, même si $\bPhi\T\bPhi$ ne l'est pas : $\bw_{\text{ridge}} = (N\lambda\bI+\bPhi\T\bPhi)^{-1}\bPhi\T\by$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`2\lambda w`, '2 lambda w', '2λw', R`2\lambda\bw`], tex: R`2\lambda\bw` },
      b: { kind: 'expr', ans: [R`N\lambda w`, 'N lambda w', 'Nλw', R`N\lambda\bw`], tex: R`N\lambda\bw` },
      c: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
      d: { kind: 'word', ans: ['definie positive', 'définie positive', 'positive definite'], tex: 'définie positive' },
    } },

  { id: 'lr8', ch: 1, type: 'deriv', title: 'Démo : prior gaussien, MAP = ridge', src: 'Slides p.25–26 · HW1 Q3.(2)',
    text: CADRE + R`Bruit $\varepsilon_n\sim\N(0,\sigma^2)$ et prior $\bw\sim\N(0,\bSigma)$. Par Bayes, $p(\bw\mid\by)\propto p(\by\mid\bw)\,\blank{a}$. Donc $-\ln p(\bw\mid\by) = \frac1{2\sigma^2}\|\by-\bPhi\bw\|^2+\blank{b}+\text{cste}$. Gradient nul : $-\frac1{\sigma^2}\bPhi\T(\by-\bPhi\bw)+\bSigma^{-1}\bw = 0$, d'où $\bw_{\text{MAP}} = (\blank{c}+\bPhi\T\bPhi)^{-1}\bPhi\T\by$. Avec $\bSigma = \tau^2\bI$ et le ridge $(N\lambda\bI+\bPhi\T\bPhi)^{-1}\bPhi\T\by$, on identifie $N\lambda = \frac{\sigma^2}{\tau^2}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['p(w)', R`p(\bw)`], tex: R`p(\bw)` },
      b: { kind: 'expr', ans: [R`\frac12w^\top\Sigma^{-1}w`, '1/2 w^T Sigma^-1 w', '½wᵀΣ⁻¹w', R`\frac{1}{2}w^\top\Sigma^{-1}w`], tex: R`\frac12\bw\T\bSigma^{-1}\bw` },
      c: { kind: 'expr', ans: [R`\sigma^2\Sigma^{-1}`, 'sigma^2 Sigma^-1', 'σ²Σ⁻¹', 'σ^2 Σ^-1'], tex: R`\sigma^2\bSigma^{-1}` },
    } },

  { id: 'lr9', ch: 1, type: 'deriv', title: 'Démo : lasso en 1D, seuillage doux', src: 'Hors slides', srcKind: 'extra',
    text: R`<b>Cadre.</b> $a\in\R$, $\lambda>0$, et on minimise $g(w) = (w-a)^2+\lambda|w|$ (convexe). Condition d'optimalité : $0\in2(w-a)+\lambda\,\partial|w|$, où $\partial|w| = \{\mathrm{sign}(w)\}$ si $w\ne0$ et $\partial|w|(0) = \blank{a}$.<br>
Si $w>0$ : $2(w-a)+\lambda = 0$ donne $w = \blank{b}$, admissible ssi $a>\frac\lambda2$. En $w = 0$ : il faut $0\in[-2a-\lambda,\,-2a+\lambda]$, soit $|a|\le\blank{c}$. Bilan : $w^* = \mathrm{sign}(a)\max\{0,|a|-\frac\lambda2\}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['[-1,1]', '[-1, 1]'], tex: '[-1,1]' },
      b: { kind: 'expr', ans: [R`a-\lambda/2`, R`a-\frac{\lambda}{2}`, 'a - lambda/2', 'a-λ/2'], tex: R`a-\frac\lambda2` },
      c: { kind: 'expr', ans: [R`\lambda/2`, R`\frac{\lambda}{2}`, 'lambda/2', 'λ/2'], tex: R`\frac\lambda2` },
    } },

  { id: 'lr10', ch: 1, type: 'def', title: 'Descente de gradient, momentum, SGD', src: 'Slides p.35, 37, 42, 44',
    text: R`<b>Cadre.</b> On minimise $\hL(\bw) = \frac1N\sum_{n=1}^N\ell_n(\bw)$ avec $\ell_n(\bw) = (\bw\T\bphi_n-y_n)^2$, pas $\gamma_t>0$.<br>
Descente de gradient : $\bw_{t+1} = \bw_t-\gamma_t\nabla\hL(\bw_t) = \bw_t-\blank{a}\sum_{n=1}^N(\bw_t\T\bphi_n-y_n)\bphi_n$. Momentum (paramètre $\alpha\in[0,1)$) : on ajoute au pas le terme $\blank{b}$. SGD : on remplace $\nabla\hL$ par la moyenne des gradients sur un [[c]] $\mathcal B_t$ tiré au hasard, $\bg_t = \frac1{|\mathcal B_t|}\sum_{i\in\mathcal B_t}\nabla\ell_i(\bw_t)$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{2\gamma_t}{N}`, '2 gamma/N', '2γ/N', '2gamma_t/N', '2γ_t/N', R`\frac{2\gamma}{N}`], tex: R`\frac{2\gamma_t}N` },
      b: { kind: 'expr', ans: [R`\alpha(w_t-w_{t-1})`, 'alpha(w_t - w_{t-1})', 'α(w_t-w_{t-1})', R`\alpha\Delta w_t`, 'alpha Delta w_t'], tex: R`\alpha(\bw_t-\bw_{t-1})` },
      c: { kind: 'word', ans: ['mini-batch', 'minibatch', 'mini batch', 'sous-ensemble', 'lot'], tex: 'mini-batch' },
    } },

  { id: 'lr11', ch: 1, type: 'deriv', title: 'Démo : le gradient stochastique est sans biais', src: 'Slides p.45',
    text: R`<b>Cadre.</b> $\hL(\bw) = \frac1N\sum_{i=1}^N\ell_i(\bw)$ ; un mini-batch $\mathcal B$ est tiré uniformément parmi les sous-ensembles de taille $B$ de $\{1,\dots,N\}$, et $\bg = \frac1B\sum_{i\in\mathcal B}\nabla\ell_i(\bw)$ ($\bw$ fixé).<br>
On réécrit la somme sur tous les indices : $\bg = \frac1B\sum_{i=1}^N\blank{a}\,\nabla\ell_i(\bw)$. Par symétrie, chaque $i$ a la même probabilité d'être dans $\mathcal B$, et ces probabilités somment à $\E|\mathcal B| = \blank{b}$, donc $P(i\in\mathcal B) = \blank{c}$. Par linéarité : $\E[\bg] = \frac1B\sum_i\frac BN\nabla\ell_i(\bw) = \nabla\hL(\bw)$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mathbb 1[i\in B]`, '1[i in B]', R`1(i\in B)`, R`\mathbb{1}[i\in\mathcal B]`, '1_{i in B}'], tex: R`\mathbb 1[i\in\mathcal B]` },
      b: { kind: 'expr', ans: ['B'], tex: 'B' },
      c: { kind: 'expr', ans: ['B/N', R`\frac{B}{N}`], tex: R`\frac BN` },
    } },

  { id: 'lr12', ch: 1, type: 'deriv', title: 'Démo : trop de paramètres, erreur d\'entraînement nulle', src: 'Slides p.20',
    text: R`<b>Cadre.</b> Régression polynomiale de degré $M$ sur $N$ points d'abscisses distinctes : $\bPhi\in\R^{N\times(M+1)}$, $\Phi_{nk} = x_n^k$.<br>
Si $M+1>N$, les $M+1$ colonnes de $\bPhi$ sont des vecteurs de $\R^N$ : il y en a plus que la dimension, donc elles sont linéairement [[a]], et $\bPhi\T\bPhi$ est [[b]]. Si $M+1\ge N$, il existe un polynôme de degré $\le M$ qui passe par les $N$ points (interpolation), donc l'erreur d'entraînement minimale vaut $\blank{c}$. Pour détecter ce sur-apprentissage, il faut mesurer l'erreur sur des données [[d]].`,
    blanks: {
      a: { kind: 'word', ans: ['dependantes', 'dépendantes', 'dependent', 'liees', 'liées'], tex: 'dépendantes' },
      b: { kind: 'word', ans: ['singuliere', 'singulière', 'non inversible', 'singular', 'not invertible'], tex: 'singulière' },
      c: { kind: 'num', ans: 0, tol: 0 },
      d: { kind: 'word', ans: ['nouvelles', 'de test', 'test', 'neuves', 'independantes', 'indépendantes', 'de validation'], tex: 'nouvelles (de test)' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'lr13', ch: 1, type: 'calc', title: 'Un pas de descente de gradient', src: 'Slides p.32–36',
    gen: r => {
      const t0 = [-6, -5, -4, -2, -1, 0, 1][r.int(7)], g = [0.001, 0.005, 0.01, 0.02][r.int(4)];
      const dL = t => 4 * t ** 3 + 21 * t ** 2 + 10 * t - 17, d = dL(t0), t1 = t0 - g * d;
      return { text: R`<b>Cadre.</b> On minimise $\hL(\theta) = \theta^4+7\theta^3+5\theta^2-17\theta+3$ par descente de gradient $\theta_{k+1} = \theta_k-\gamma\hL'(\theta_k)$, depuis $\theta_0 = ${t0}$ avec $\gamma = ${g}$.<br>La dérivée est $\hL'(\theta) = \blank{a}$ ; en $\theta_0$ elle vaut $\blank{b}$, donc $\theta_1 = \blank{c}$.`,
        blanks: {
          a: { kind: 'expr', ans: ['4theta^3+21theta^2+10theta-17', '4θ^3+21θ^2+10θ-17', R`4\theta^3+21\theta^2+10\theta-17`], tex: R`4\theta^3+21\theta^2+10\theta-17` },
          b: { kind: 'num', ans: d, tol: 1e-4 }, c: { kind: 'num', ans: t1, tol: 1e-3 },
        },
        solution: R`$\hL'(${t0}) = ${d}$ et $\theta_1 = ${t0}-${g}\times(${d}) = ${f(t1)}$.` };
    } },

  { id: 'lr14', ch: 1, type: 'calc', title: 'Pas de descente sur une quadratique', src: 'Slides p.38–39 · DL §7.3', srcKind: 'book',
    gen: r => {
      const m1 = [2, 4, 5, 8, 10, 20][r.int(6)], m2 = [0.5, 1, 2][r.int(3)];
      return { text: R`<b>Cadre.</b> $\hL(\bx) = \frac12\bx\T\bA\bx-\bb\T\bx$ avec $\bA = \operatorname{diag}(${m1}, ${m2})$, descente de gradient à pas constant $\gamma$. L'erreur évolue selon $e^{(i)}_{t+1} = (1-\gamma\mu_i)\,e^{(i)}_t$ sur chaque direction propre ($\mu_i$ = valeurs propres de $\bA$).<br>La convergence demande $|1-\gamma\mu_i|\lt1$ pour tout $i$, soit $0\lt\gamma\lt\blank{a}$. Le meilleur pas $\gamma^* = \frac{2}{\mu_{\max}+\mu_{\min}} = \blank{b}$ donne le taux $\frac{\kappa-1}{\kappa+1} = \blank{c}$, avec $\kappa = \mu_{\max}/\mu_{\min}$.`,
        blanks: { a: { kind: 'num', ans: 2 / m1 }, b: { kind: 'num', ans: 2 / (m1 + m2) }, c: { kind: 'num', ans: (m1 / m2 - 1) / (m1 / m2 + 1) } },
        solution: R`La contrainte la plus forte vient de $\mu_{\max} = ${m1}$ : $\gamma\lt2/${m1}$. $\kappa = ${f(m1 / m2)}$.` };
    } },

  { id: 'lr15', ch: 1, type: 'calc', title: 'Moindres carrés à la main (3 points)', src: 'Slides p.13–14',
    gen: r => {
      const y = [r.int(5) - 1, r.int(5), r.int(5) + 1], yb = (y[0] + y[1] + y[2]) / 3, a = (y[2] - y[0]) / 2, b = yb - a;
      return { text: R`<b>Cadre.</b> Points $(0, ${y[0]})$, $(1, ${y[1]})$, $(2, ${y[2]})$, modèle $f(x) = w_1x+w_2$ ajusté par moindres carrés. On utilise $w_1 = \frac{\sum_n(x_n-\bar x)(y_n-\bar y)}{\sum_n(x_n-\bar x)^2}$ et $w_2 = \bar y-w_1\bar x$.<br>$\bar x = \blank{a}$, $\bar y = \blank{b}$, $\sum_n(x_n-\bar x)^2 = \blank{c}$, puis $w_1 = \blank{d}$ et $w_2 = \blank{e}$.`,
        blanks: { a: { kind: 'num', ans: 1, tol: 0 }, b: { kind: 'num', ans: yb }, c: { kind: 'num', ans: 2, tol: 0 }, d: { kind: 'num', ans: a }, e: { kind: 'num', ans: b } },
        solution: R`Numérateur : $(-1)(${y[0]}-\bar y)+0+(1)(${y[2]}-\bar y) = ${y[2]}-${y[0]}$, donc $w_1 = ${f(a)}$ et $w_2 = ${f(yb)}-${f(a)} = ${f(b)}$.` };
    } },

  { id: 'lr16', ch: 1, type: 'calc', title: 'Ridge scalaire', src: 'Slides p.22',
    gen: r => {
      const xs = [1, 2, 3].map(() => r.int(3) + 1), ys = xs.map(x => x * (r.int(3) + 1) - r.int(2)), lam = [0.1, 0.5, 1][r.int(3)], N = 3;
      const sxy = M.sum(xs.map((x, i) => x * ys[i])), sxx = M.sum(xs.map(x => x * x));
      return { text: R`<b>Cadre.</b> Modèle $f(x) = wx$ (sans biais), données $(${xs[0]},${ys[0]}), (${xs[1]},${ys[1]}), (${xs[2]},${ys[2]})$, objectif $\frac1N\sum_n(y_n-wx_n)^2+\lambda w^2$ avec $\lambda = ${lam}$, $N = 3$. En 1D, la forme close devient $w = \frac{\sum_nx_ny_n}{\sum_nx_n^2+N\lambda}$.<br>$\sum_nx_n^2 = \blank{a}$, $\sum_nx_ny_n = \blank{b}$, donc $w_{\text{LS}}$ ($\lambda = 0$) $= \blank{c}$ et $w_{\text{ridge}} = \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: sxx, tol: 0 }, b: { kind: 'num', ans: sxy, tol: 0 }, c: { kind: 'num', ans: sxy / sxx }, d: { kind: 'num', ans: sxy / (sxx + N * lam) } },
        solution: R`$w_{\text{ridge}} = \frac{${sxy}}{${sxx}+3\times${lam}}$ : le ridge rétrécit le coefficient vers 0.` };
    } },
  );
})(window.ML);
