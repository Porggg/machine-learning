/* Exercices — démonstrations à trous (chapitres 1 à 6), dans le format de l'examen :
   chaque trou est une étape d'une preuve du cours. */
(function (ML) {
  'use strict';
  const R = String.raw;

  ML.EX.add(
  // ------------------------------------------------------------------ chapitre 1
  { id: 'd1a', ch: 1, type: 'deriv', title: 'Démo : $\\bPhi\\T\\bPhi$ inversible ⇔ colonnes indépendantes', src: 'Chapitre 1, §2',
    text: R`Si $\bPhi\bv = 0$ alors $\bPhi\T\bPhi\bv = 0$. Réciproquement, si $\bPhi\T\bPhi\bv = 0$ alors $0 = \bv\T\bPhi\T\bPhi\bv = \blank{a}$, donc $\bPhi\bv = \blank{b}$. Ainsi $\ker\bPhi\T\bPhi = \blank{c}$. Une matrice carrée est inversible ssi son noyau est $\{0\}$, et $\ker\bPhi = \{0\}$ signifie que les colonnes de $\bPhi$ sont linéairement [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', '|Phi v|^2', R`\|\bPhi\bv\|^2`, '(Phi v)^T(Phi v)'], tex: R`\|\bPhi\bv\|^2` },
      b: { kind: 'expr', ans: ['0'], tex: '0' },
      c: { kind: 'expr', ans: [R`\ker\Phi`, 'ker Phi', R`\ker\bPhi`, 'ker(Phi)'], tex: R`\ker\bPhi` },
      d: { kind: 'word', ans: ['independantes', 'indépendantes', 'independent', 'lineairement independantes'], tex: 'indépendantes' },
    },
    solution: R`Une norme au carré nulle force le vecteur à être nul : c'est l'argument clé.` },

  { id: 'd1b', ch: 1, type: 'deriv', title: 'Démo : forme close du ridge, toujours inversible', src: 'Chapitre 1, §4',
    text: R`$E_{\text{ridge}}(\bw) = \frac1N\|\by-\bPhi\bw\|^2+\lambda\|\bw\|^2$. Gradient : $\nabla E = \frac2N\bPhi\T(\bPhi\bw-\by)+\blank{a}$. En l'annulant et en multipliant par $N/2$ : $(\blank{b})\,\bw = \bPhi\T\by$. Pour $\bv\ne0$ : $\bv\T(N\lambda\bI+\bPhi\T\bPhi)\bv = N\lambda\|\bv\|^2+\blank{c}\ \blank{d}\ 0$ : la matrice est définie positive, donc inversible, même si $\bPhi\T\bPhi$ est singulière.`,
    blanks: {
      a: { kind: 'expr', ans: [R`2\lambda w`, '2 lambda w', '2λw', R`2\lambda\bw`], tex: R`2\lambda\bw` },
      b: { kind: 'expr', ans: [R`N\lambda I+\Phi^\top\Phi`, 'N lambda I + Phi^T Phi', 'NλI + ΦᵀΦ', R`\Phi^\top\Phi+N\lambda I`, 'Phi^T Phi + N lambda I'], tex: R`N\lambda\bI+\bPhi\T\bPhi` },
      c: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
      d: { kind: 'expr', ans: ['>', R`\gt`], tex: '>' },
    } },

  { id: 'd1c', ch: 1, type: 'deriv', title: 'Démo : $-\\nabla f$ est la direction de plus forte descente', src: 'Chapitre 1, §6',
    text: R`Taylor : $f(\bx+h\bu) = f(\bx)+h\,\blank{a}+o(h)$, donc pour $\|\bu\| = 1$ la dérivée directionnelle est $D_\bu f(\bx) = \nabla f(\bx)\T\bu$. Par [[b]], $\nabla f\T\bu\ge\blank{c}$, avec égalité ssi $\bu = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\nabla f(x)^\top u`, 'grad f(x)^T u', R`\nabla f(\bx)\T\bu`, 'nabla f(x)^T u', R`\nabla f^\top u`], tex: R`\nabla f(\bx)\T\bu` },
      b: { kind: 'word', ans: ['Cauchy-Schwarz', 'cauchy schwarz', 'inegalite de cauchy-schwarz'], tex: 'Cauchy–Schwarz' },
      c: { kind: 'expr', ans: [R`-\|\nabla f\|`, '-||grad f||', R`-\|\nabla f(x)\|`, '-||nabla f||'], tex: R`-\|\nabla f\|` },
      d: { kind: 'expr', ans: [R`-\nabla f/\|\nabla f\|`, '-grad f/||grad f||', R`-\frac{\nabla f}{\|\nabla f\|}`, '-nabla f/||nabla f||'], tex: R`-\nabla f/\|\nabla f\|` },
    } },

  { id: 'd1d', ch: 1, type: 'deriv', title: 'Démo : convergence de GD sur une quadratique', src: 'Chapitre 1, §6',
    text: R`$\hL(\bx) = \frac12\bx\T\bA\bx-\bb\T\bx$, $\bA$ symétrique définie positive, minimum $\bx^* = \bA^{-1}\bb$. Avec $\be_t = \bx_t-\bx^*$ et $\bx_{t+1} = \bx_t-\gamma\nabla\hL(\bx_t)$ : $\be_{t+1} = (\blank{a})\,\be_t$. Dans la base propre de $\bA$ (valeurs propres $\mu_i$) : $e^{(i)}_t = \blank{b}\,e^{(i)}_0$. GD converge ssi $0\lt\gamma\lt\blank{c}$, et le meilleur pas est $\gamma^* = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`I-\gamma A`, 'I - gamma A', 'I-γA'], tex: R`\bI-\gamma\bA` },
      b: { kind: 'expr', ans: [R`(1-\gamma\mu_i)^t`, '(1-gamma mu_i)^t', '(1-γμ_i)^t'], tex: R`(1-\gamma\mu_i)^t` },
      c: { kind: 'expr', ans: [R`2/\mu_{\max}`, R`\frac{2}{\mu_{\max}}`, '2/mu_max', '2/μmax'], tex: R`2/\mu_{\max}` },
      d: { kind: 'expr', ans: [R`\frac{2}{\mu_{\max}+\mu_{\min}}`, '2/(mu_max+mu_min)', '2/(μmax+μmin)'], tex: R`\frac{2}{\mu_{\max}+\mu_{\min}}` },
    },
    solution: R`$\nabla\hL(\bx_t) = \bA\bx_t-\bb = \bA(\bx_t-\bx^*)$. Il faut $|1-\gamma\mu_i|\lt1$ pour tout $i$ ; le taux $\max_i|1-\gamma\mu_i|$ est minimal quand $1-\gamma\mu_{\min} = -(1-\gamma\mu_{\max})$.` },

  // ------------------------------------------------------------------ chapitre 2
  { id: 'd2a', ch: 2, type: 'deriv', title: 'Démo : symétrie, logit et dérivée de σ', src: 'Chapitre 2, §2',
    text: R`$1-\sigma(t) = \frac{e^{-t}}{1+e^{-t}} = \blank{a}$ (multiplier haut et bas par $e^t$). Si $p = \sigma(t)$ alors $t = \blank{b}$. Et $\sigma'(t) = \frac{e^{-t}}{(1+e^{-t})^2} = \blank{c}$, maximale en $t = 0$ où elle vaut $\blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sigma(-t)`, 'sigma(-t)', 'σ(-t)'], tex: R`\sigma(-t)` },
      b: { kind: 'expr', ans: [R`\ln\frac{p}{1-p}`, 'ln(p/(1-p))', 'log(p/(1-p))', R`\log\frac{p}{1-p}`], tex: R`\ln\frac{p}{1-p}` },
      c: { kind: 'expr', ans: [R`\sigma(t)(1-\sigma(t))`, 'sigma(t)(1-sigma(t))', 'σ(t)(1-σ(t))', R`\sigma(t)\sigma(-t)`], tex: R`\sigma(t)(1-\sigma(t))` },
      d: { kind: 'num', ans: 0.25, tol: 0 },
    } },

  { id: 'd2b', ch: 2, type: 'deriv', title: 'Démo : le log-odds de deux gaussiennes est affine', src: 'Chapitre 2, §1',
    text: R`$\ln\N(\bx|\bmu_k,\bSigma) = -\frac12\bx\T\bSigma^{-1}\bx+\bmu_k\T\bSigma^{-1}\bx-\frac12\bmu_k\T\bSigma^{-1}\bmu_k+c$. Dans $a(\bx) = \ln\frac{\pi_1\N(\bx|\bmu_1,\bSigma)}{\pi_0\N(\bx|\bmu_0,\bSigma)}$, le terme quadratique $-\frac12\bx\T\bSigma^{-1}\bx$ [[a]] car la covariance est commune. Il reste $a(\bx) = \bw\T\bx+b$ avec $\bw = \blank{b}$, et la probabilité a posteriori vaut $p(C_1|\bx) = \blank{c}$.`,
    blanks: {
      a: { kind: 'word', ans: ['se simplifie', 's annule', 'disparait', 'disparaît', 's annulent', 'se simplifient', 'cancels'], tex: 's\'annule' },
      b: { kind: 'expr', ans: [R`\Sigma^{-1}(\mu_1-\mu_0)`, 'Sigma^-1 (mu_1 - mu_0)', 'Σ^{-1}(μ1-μ0)', R`\bSigma^{-1}(\bmu_1-\bmu_0)`], tex: R`\bSigma^{-1}(\bmu_1-\bmu_0)` },
      c: { kind: 'expr', ans: [R`\sigma(a(x))`, 'sigma(a(x))', 'σ(a(x))', R`\sigma(w^\top x+b)`, 'sigma(w^T x + b)'], tex: R`\sigma(a(\bx))` },
    } },

  { id: 'd2c', ch: 2, type: 'deriv', title: 'Démo : de la NLL en {0,1} à la logistic loss en {−1,+1}', src: 'Chapitre 2, §3',
    text: R`Avec $\hat y = \sigma(f)$, la NLL d'un exemple vaut $-\ln\hat y$ (classe positive) ou $-\ln(1-\hat y)$ (négative). Comme $1-\sigma(f) = \sigma(-f)$, en codant les classes par $y = \pm1$ les deux cas s'écrivent $-\ln\sigma(\blank{a}) = \blank{b}$. Avec la marge $m = yf$, $\ell_{\text{CE}}(m)\approx\blank{c}$ pour $m\ll0$. Correspondance : $y^{\{0,1\}} = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['yf', 'y f', 'y*f'], tex: 'yf' },
      b: { kind: 'expr', ans: [R`\ln(1+e^{-yf})`, 'ln(1+e^(-yf))', 'log(1+exp(-yf))', R`\log(1+e^{-yf})`], tex: R`\ln(1+e^{-yf})` },
      c: { kind: 'expr', ans: ['-m'], tex: '-m' },
      d: { kind: 'expr', ans: [R`\frac{1+y}{2}`, '(1+y)/2', '(y+1)/2'], tex: R`\frac{1+y}{2}` },
    } },

  { id: 'd2d', ch: 2, type: 'deriv', title: 'Démo : hessienne de la cross-entropy et convexité', src: 'Chapitre 2, §4 · HW2 P1.(2)',
    text: R`$\nabla L = \frac1N\sum_n(\hat y_n-y_n)\bx_n$ et $\nabla_\bw\hat y_n = \blank{a}\,\bx_n$. Donc $\nabla^2L = \frac1N\sum_n\blank{b}\,\bx_n\bx_n\T$. Pour tout $\bv$ : $\bv\T\nabla^2L\,\bv = \frac1N\sum_n\hat y_n(1-\hat y_n)\,\blank{c}\ \ge0$, donc $L$ est [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)', 'y_n(1-y_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      b: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      c: { kind: 'expr', ans: [R`(x_n^\top v)^2`, '(x_n^T v)^2', R`(v^\top x_n)^2`, '(v^T x_n)^2'], tex: R`(\bx_n\T\bv)^2` },
      d: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
    } },

  // ------------------------------------------------------------------ chapitre 3
  { id: 'd3a', ch: 3, type: 'deriv', title: 'Démo : le Lagrangien est une relaxation', src: 'Chapitre 3, §3',
    text: R`$\max_{\boldsymbol\lambda\ge0}\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx)+\sum_i\max_{\lambda_i\ge0}\lambda_ig_i(\bx)$. Si $g_i(\bx)\le0$, le maximum est atteint en $\lambda_i = \blank{a}$ et vaut $0$ ; si $g_i(\bx)>0$, il vaut $\blank{b}$. Donc $\max_{\boldsymbol\lambda\ge0}\mathfrak L = J$, et pour tout $\boldsymbol\lambda\ge0$ fixé, $\mathfrak L(\bx,\boldsymbol\lambda)\,\blank{c}\,J(\bx)$.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`+\infty`, 'infinity', '+inf', 'inf', '∞', R`\infty`], tex: R`+\infty` },
      c: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
    } },

  { id: 'd3b', ch: 3, type: 'deriv', title: 'Démo : écart optimal = hinge loss', src: 'Chapitre 3, §5 · HW3 P2.(1)',
    text: R`À $(\bw,b)$ fixés, avec $t_i = y_i(\bw\T\bx_i+b)$, les contraintes sur $\xi_i$ sont $\xi_i\ge1-t_i$ et $\xi_i\ge0$, soit $\xi_i\ge\blank{a}$. L'objectif contient $+C\xi_i$ avec $C>0$ : il est [[b]] en $\xi_i$, donc $\xi_i^* = \max\{0,1-t_i\}$. Le problème devient $\min_{\bw,b}\frac12\|\bw\|^2+C\sum_i\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\max\{0,1-t_i\}`, 'max(0,1-t_i)', 'max{0,1-t_i}', 'max(0, 1 - t_i)'], tex: R`\max\{0,1-t_i\}` },
      b: { kind: 'word', ans: ['croissant', 'strictement croissant', 'increasing'], tex: 'croissant' },
      c: { kind: 'expr', ans: [R`\max\{0,1-t_i\}`, 'max(0,1-t_i)', R`\max\{0,1-y_i(w^\top x_i+b)\}`, 'max(0,1-y_i(w^T x_i + b))'], tex: R`\max\{0,1-t_i\}` },
    } },

  { id: 'd3c', ch: 3, type: 'deriv', title: 'Démo : le noyau $(\\bx\\T\\bx\')^2$ est un produit scalaire', src: 'Chapitre 3, §6',
    text: R`En 2D : $(\bx\T\bx')^2 = (x_1x_1'+x_2x_2')^2 = x_1^2x_1'^2+\blank{a}+x_2^2x_2'^2$. Donc $(\bx\T\bx')^2 = \bphi(\bx)\T\bphi(\bx')$ avec $\bphi(\bx) = (x_1^2,\ \blank{b},\ x_2^2)\in\R^3$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`2x_1x_2x_1'x_2'`, "2 x1 x2 x1' x2'", "2x_1x_1'x_2x_2'", "2x1x1'x2x2'"], tex: R`2x_1x_2x_1'x_2'` },
      b: { kind: 'expr', ans: [R`\sqrt{2}x_1x_2`, 'sqrt(2) x1 x2', 'sqrt2 x_1 x_2', R`\sqrt2x_1x_2`, '√2 x1 x2'], tex: R`\sqrt2\,x_1x_2` },
    },
    solution: R`Calculer $\kappa$ coûte $O(D)$, alors que $\bphi$ a $\binom{D+d-1}{d}$ coordonnées en degré $d$ : c'est le gain du kernel trick.` },

  { id: 'd3d', ch: 3, type: 'deriv', title: 'Démo : le noyau RBF a des features de dimension infinie', src: 'Chapitre 3, §6 (slide 43)',
    text: R`En 1D, $e^{-(x-x')^2/2\sigma^2} = e^{-x^2/2\sigma^2}\,e^{-x'^2/2\sigma^2}\,e^{\blank{a}}$. Par la série de l'exponentielle, $e^{xx'/\sigma^2} = \sum_{k=0}^\infty\frac{(xx')^k}{\blank{b}}$, donc $\bphi(x)$ a pour $k$-ième coordonnée $e^{-x^2/2\sigma^2}\frac{x^k}{\sqrt{k!}\,\sigma^k}$ : il y en a une [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`xx'/\sigma^2`, "x x'/sigma^2", R`\frac{xx'}{\sigma^2}`, "xx'/σ^2"], tex: R`xx'/\sigma^2` },
      b: { kind: 'expr', ans: [R`k!\sigma^{2k}`, 'k! sigma^(2k)', 'k!σ^(2k)', R`k!\,\sigma^{2k}`], tex: R`k!\,\sigma^{2k}` },
      c: { kind: 'word', ans: ['infinite', 'infinité', 'infinite de coordonnees', 'infinity'], tex: 'infinité' },
    } },

  // ------------------------------------------------------------------ chapitre 4
  { id: 'd4a', ch: 4, type: 'deriv', title: 'Démo : pour $f$ fixé, l\'erreur empirique est sans biais', src: 'Chapitre 4, §2',
    text: R`$f$ ne dépend pas de $S$. Par [[a]] de l'espérance, $\E_S[\hL_S(f)] = \frac1N\sum_{i=1}^N\E[\ell(y_i,f(x_i))]$, et chaque terme vaut $\blank{b}$ car $(x_i,y_i)\sim P$. Donc $\E_S[\hL_S(f)] = L(f)$. Pour $\hat f = A(S)$, l'argument tombe car $(x_i,y_i)$ et $\hat f$ ne sont plus [[c]].`,
    blanks: {
      a: { kind: 'word', ans: ['linearite', 'linéarité', 'linearity'], tex: 'linéarité' },
      b: { kind: 'expr', ans: ['L(f)'], tex: 'L(f)' },
      c: { kind: 'word', ans: ['independants', 'indépendants', 'independent'], tex: 'indépendants' },
    } },

  { id: 'd4b', ch: 4, type: 'deriv', title: 'Démo : l\'erreur d\'entraînement de l\'ERM est optimiste', src: 'Chapitre 4, §2',
    text: R`Soit $f^*_{\mathcal H} = \arg\min_{f\in\mathcal H}L(f)$ (fixé). Comme $\hat f$ minimise l'erreur empirique, $\hL_S(\hat f)\le\blank{a}$. En moyenne, $\E_S[\hL_S(\hat f)]\le\blank{b}$. Et $L(\hat f)\ge L(f^*_{\mathcal H})$ car $\hat f\in\mathcal H$. Conclusion : $\E_S[\hL_S(\hat f)]\le L(f^*_{\mathcal H})\le\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat L_S(f^*_H)`, 'L_S(f*_H)', R`\hL_S(f^*_{\mathcal H})`, 'L_S(f*)', R`\hat L_S(f^*)`], tex: R`\hL_S(f^*_{\mathcal H})` },
      b: { kind: 'expr', ans: [R`L(f^*_H)`, 'L(f*_H)', R`L(f^*_{\mathcal H})`, 'L(f*)'], tex: R`L(f^*_{\mathcal H})` },
      c: { kind: 'expr', ans: [R`E_S[L(\hat f)]`, R`\E_S[L(\hat f)]`, 'E[L(fhat)]', 'E_S[L(f^)]', R`E[L(\hat f)]`], tex: R`\E_S[L(\hat f)]` },
    } },

  { id: 'd4c', ch: 4, type: 'deriv', title: 'Démo : $\\E[\\text{MSE train}] = \\sigma^2(1-p/N)$', src: 'Chapitre 4, §2 (hors slides)', srcKind: 'extra',
    text: R`$\by = \bPhi\bw^\star+\boldsymbol\varepsilon$, $\E[\boldsymbol\varepsilon\boldsymbol\varepsilon\T] = \sigma^2\bI$. Le résidu vaut $(\bI-\bP)\by = (\bI-\bP)\boldsymbol\varepsilon$ car $(\bI-\bP)\bPhi = \blank{a}$. Puis $\E[\boldsymbol\varepsilon\T(\bI-\bP)\boldsymbol\varepsilon] = \sigma^2\,\mathrm{tr}(\bI-\bP) = \sigma^2(\blank{b})$, car la trace d'un projecteur est sa [[c]]. Donc $\E[\text{MSE train}] = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['0'], tex: '0' },
      b: { kind: 'expr', ans: ['N-p', 'N - p'], tex: 'N-p' },
      c: { kind: 'word', ans: ['dimension', 'rang', 'rank'], tex: 'dimension (son rang)' },
      d: { kind: 'expr', ans: [R`\sigma^2(1-p/N)`, 'sigma^2(1-p/N)', 'σ^2(1-p/N)', R`\sigma^2(1-\frac{p}{N})`, 'sigma^2 (N-p)/N'], tex: R`\sigma^2(1-\tfrac pN)` },
    } },

  { id: 'd4d', ch: 4, type: 'deriv', title: 'Démo : classes emboîtées', src: 'Chapitre 4, §3 (slide 11)',
    text: R`Un polynôme de degré $\le d$ est un polynôme de degré $\le d+1$ avec $w_{d+1} = \blank{a}$ : $\mathcal H_d\subseteq\mathcal H_{d+1}$. Minimiser sur un ensemble plus grand donne un minimum [[b]] : $\min_{\mathcal H_{d+1}}\hL_S\,\blank{c}\,\min_{\mathcal H_d}\hL_S$. Rien de tel pour l'erreur de [[d]].`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'word', ans: ['plus petit ou egal', 'plus petit', 'inferieur ou egal', 'inférieur', 'smaller'], tex: 'plus petit ou égal' },
      c: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      d: { kind: 'word', ans: ['generalisation', 'généralisation', 'test', 'generalization'], tex: 'généralisation' },
    } },

  // ------------------------------------------------------------------ chapitre 5
  { id: 'd5a', ch: 5, type: 'deriv', title: 'Démo : dérivées des activations', src: 'Chapitre 5, §3',
    text: R`$\sigma'(z) = \blank{a}$. En écrivant $\tanh z = \frac{1-e^{-2z}}{1+e^{-2z}}$, on obtient $\tanh z = 2\sigma(\blank{b})-1$, d'où $\tanh'(z) = \blank{c}$. La ReLU $\max\{0,z\}$ a pour dérivée $\blank{d}$ si $z>0$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sigma(z)(1-\sigma(z))`, 'sigma(z)(1-sigma(z))', 'σ(z)(1-σ(z))'], tex: R`\sigma(z)(1-\sigma(z))` },
      b: { kind: 'expr', ans: ['2z'], tex: '2z' },
      c: { kind: 'expr', ans: [R`1-\tanh^2z`, '1-tanh(z)^2', '1-tanh^2(z)', R`1-\tanh^2(z)`, '1 - tanh^2 z'], tex: R`1-\tanh^2z` },
      d: { kind: 'num', ans: 1, tol: 0 },
    } },

  { id: 'd5b', ch: 5, type: 'deriv', title: 'Démo : invariance de la softmax et log-softmax stable', src: 'Chapitre 5, §4',
    text: R`Pour tout $c$ : $\frac{e^{z_k+c}}{\sum_je^{z_j+c}} = \frac{e^{z_k}}{\sum_je^{z_j}}$ car $e^{c}$ se [[a]]. Avec $m = \max_jz_j$ : $\ln\mathrm{softmax}(\bz)_k = z_k-m-\ln\sum_j\blank{b}$, où tous les exposants sont $\le\blank{c}$ (pas de débordement).`,
    blanks: {
      a: { kind: 'word', ans: ['simplifie', 'se simplifie', 'factorise', 'annule'], tex: 'simplifie' },
      b: { kind: 'expr', ans: [R`e^{z_j-m}`, 'e^(z_j-m)', 'exp(z_j-m)', 'exp(z_j - m)'], tex: R`e^{z_j-m}` },
      c: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'd5c', ch: 5, type: 'deriv', title: 'Démo : la récurrence de la rétropropagation', src: 'Chapitre 5, §5 (slide 39)',
    text: R`On note $\boldsymbol\delta^{(\ell)} = \partial\hL/\partial\bz^{(\ell)}$. Avec $\bz^{(\ell)} = W_\ell\bh^{(\ell-1)}+\bb_\ell$ et $\bh^{(\ell-1)} = \varphi(\bz^{(\ell-1)})$ : $\frac{\partial\hL}{\partial W_\ell} = \blank{a}$, $\frac{\partial\hL}{\partial\bh^{(\ell-1)}} = \blank{b}$, puis $\boldsymbol\delta^{(\ell-1)} = \blank{c}$. On initialise avec $\boldsymbol\delta^{(L)} = \blank{d}$ (softmax + cross-entropy).`,
    blanks: {
      a: { kind: 'expr', ans: [R`\delta^{(\ell)}h^{(\ell-1)\top}`, 'delta^(l) h^(l-1)^T', R`\delta^{(l)}h^{(l-1)^T}`, 'δ h^T', R`\delta h^\top`], tex: R`\boldsymbol\delta^{(\ell)}\bh^{(\ell-1)\top}` },
      b: { kind: 'expr', ans: [R`W_\ell^\top\delta^{(\ell)}`, 'W_l^T delta^(l)', 'W^T delta', 'Wᵀδ', R`W^\top\delta`], tex: R`W_\ell\T\boldsymbol\delta^{(\ell)}` },
      c: { kind: 'expr', ans: [R`(W_\ell^\top\delta^{(\ell)})\odot\varphi'(z^{(\ell-1)})`, "(W^T delta) odot phi'(z)", "(W_l^T delta^(l)) ⊙ φ'(z^(l-1))", R`W^\top\delta\odot\varphi'(z)`, "W^T delta * phi'(z)"], tex: R`\big(W_\ell\T\boldsymbol\delta^{(\ell)}\big)\odot\varphi'(\bz^{(\ell-1)})` },
      d: { kind: 'expr', ans: ['p-y', R`\mathbf p-\by`, 'p - y'], tex: R`\mathbf p-\by` },
    } },

  // ------------------------------------------------------------------ chapitre 6
  { id: 'd6a', ch: 6, type: 'deriv', title: 'Démo : la borne d\'erreurs de Weighted Majority', src: 'Chapitre 6, §4 (hors slides)', srcKind: 'extra',
    text: R`Quand WM se trompe, les experts fautifs portent au moins la moitié du poids $W_t$ et sont multipliés par $\beta$ : $W_{t+1}\le\blank{a}\,W_t$. Après $M$ erreurs, $W_{T+1}\le K\big(\frac{1+\beta}2\big)^M$. Le meilleur expert garde $w_{T+1}(i^\star)\ge\blank{b}$. Comme $w(i^\star)\le W$ : $M\le\frac{\ln K+m^\star\ln(1/\beta)}{\blank{c}}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1+\beta}{2}`, '(1+beta)/2', '(1+β)/2'], tex: R`\frac{1+\beta}2` },
      b: { kind: 'expr', ans: [R`\beta^{m^\star}`, 'beta^m*', 'β^m*', R`\beta^{m^*}`, 'beta^(m*)'], tex: R`\beta^{m^\star}` },
      c: { kind: 'expr', ans: [R`\ln\frac{2}{1+\beta}`, 'ln(2/(1+beta))', 'ln(2/(1+β))', R`\ln(2/(1+\beta))`], tex: R`\ln\frac2{1+\beta}` },
    } },

  { id: 'd6b', ch: 6, type: 'deriv', title: 'Démo : $\\ln(1-\\eta)\\ge-\\eta-\\eta^2$ sur $[0,\\frac12]$', src: 'Chapitre 6, §5 (hors slides)', srcKind: 'extra',
    text: R`Soit $g(\eta) = \ln(1-\eta)+\eta+\eta^2$. Alors $g(0) = \blank{a}$ et $g'(\eta) = -\frac1{1-\eta}+1+2\eta = \blank{b}$, qui est $\ge0$ pour $\eta\in[0,\blank{c}]$. Donc $g\ge0$ sur cet intervalle.`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`\frac{\eta(1-2\eta)}{1-\eta}`, 'eta(1-2eta)/(1-eta)', 'η(1-2η)/(1-η)', R`\frac{\eta-2\eta^2}{1-\eta}`, '(eta-2eta^2)/(1-eta)'], tex: R`\frac{\eta(1-2\eta)}{1-\eta}` },
      c: { kind: 'num', ans: 0.5, tol: 0 },
    } },

  { id: 'd6c', ch: 6, type: 'deriv', title: 'Démo : passer de la borne déterministe à $\\E[\\mathrm{Reg}_T]$', src: 'Chapitre 6, §6',
    text: R`L'adversaire non anticipant fixe $\ell_t$ [[a]] le tirage $I_t\sim p_t$. Donc $\E[\ell_t(I_t)\mid\text{passé}] = \blank{b}$, et par la tour des espérances $\E[\sum_t\ell_t(I_t)] = \E[\sum_t\langle p_t,\ell_t\rangle]$. Avec $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}\eta+\frac{\eta T}8$ pour toute suite, on obtient $\E[\mathrm{Reg}_T]\le\blank{c}$.`,
    blanks: {
      a: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
      b: { kind: 'expr', ans: [R`\sum_ip_t(i)\ell_t(i)`, 'sum_i p_t(i) l_t(i)', R`\langle p_t,\ell_t\rangle`, '<p_t,l_t>', R`\sum_i p_t(i)\ell_t(i)`], tex: R`\sum_ip_t(i)\ell_t(i)` },
      c: { kind: 'expr', ans: [R`\frac{\ln K}{\eta}+\frac{\eta T}{8}`, 'ln K/eta + eta T/8', 'lnK/η + ηT/8', R`\ln K/\eta+\eta T/8`], tex: R`\frac{\ln K}\eta+\frac{\eta T}8` },
    } },

  { id: 'd6d', ch: 6, type: 'deriv', title: 'Démo : choisir η', src: 'Chapitre 6, §6 (slide 22)',
    text: R`$f(\eta) = \frac{\ln K}\eta+\frac{\eta T}8$. $f'(\eta) = \blank{a}+\frac T8 = 0$ donne $\eta^\star = \blank{b}$ ; $f''>0$ donc c'est un minimum, de valeur $f(\eta^\star) = 2\sqrt{\frac{T\ln K}{8}} = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\frac{\ln K}{\eta^2}`, '-ln K/eta^2', '-lnK/η^2', R`-\ln K/\eta^2`], tex: R`-\frac{\ln K}{\eta^2}` },
      b: { kind: 'expr', ans: [R`\sqrt{\frac{8\ln K}{T}}`, 'sqrt(8 ln K/T)', 'sqrt(8lnK/T)', R`\sqrt{8\ln K/T}`], tex: R`\sqrt{\frac{8\ln K}T}` },
      c: { kind: 'expr', ans: [R`\sqrt{\frac{T\ln K}{2}}`, 'sqrt(T ln K/2)', 'sqrt(TlnK/2)', R`\sqrt{T\ln K/2}`], tex: R`\sqrt{\frac{T\ln K}2}` },
    } },
  );
})(window.ML);
