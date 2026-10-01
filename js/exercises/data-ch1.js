/* Exercices — Chapitre 1 : régression linéaire */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  // ---------------------------------------------------------------- définitions
  { id: 'lr1', ch: 1, type: 'def', title: 'Décomposition de la MSE et estimateur MMSE', src: 'Slides p.4 · HW1 Q2.(1)',
    text: R`Pour tout prédicteur $f$ :
$$\E\big[(Y-f(X))^2\big] = \E\big[\blank{a}\big] + \E\big[\blank{b}\big].$$
Le premier terme ne dépend pas de $f$ et le second est $\ge0$ ; la MSE est donc minimisée par $f^*(x) = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\Var(Y|X)`, 'Var(Y|X)', 'Var(Y | X)', R`\operatorname{Var}(Y\mid X)`], tex: R`\Var(Y\mid X)`, hint: 'la largeur de la coupe conditionnelle' },
      b: { kind: 'expr', ans: [R`(E[Y|X]-f(X))^2`, R`(\E[Y|X]-f(X))^2`, R`(f(X)-E[Y|X])^2`, R`(\E[Y\mid X]-f(X))^2`, R`(m(X)-f(X))^2`], tex: R`(\E[Y\mid X]-f(X))^2` },
      c: { kind: 'expr', ans: [R`E[Y|X=x]`, R`E[y|x]`, R`E[Y|x]`, R`\E[y\mid x]`, R`\E[Y\mid X=x]`, R`E[Y|X]`], tex: R`\E[Y\mid X=x]` },
    },
    solution: R`On ajoute et retranche $m(X) = \E[Y|X]$ ; le terme croisé $2\E[(Y-m(X))(m(X)-f(X))]$ est nul car, conditionnellement à $X$, $\E[Y-m(X)\mid X] = 0$ (tower property).` },

  { id: 'lr2', ch: 1, type: 'def', title: 'Design matrix', src: 'Slides p.12 · HW1 Q2.(2)',
    text: R`Avec $N$ exemples et $L$ fonctions de base, la design matrix est $\bPhi\in\R^{\blank{a}\times\blank{b}}$, de coefficient $\Phi_{n\ell} = \blank{c}$. Pour la base polynomiale $\bphi_M(x) = [1,x,\dots,x^M]\T$, on a $L = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['N'], tex: 'N' }, b: { kind: 'expr', ans: ['L'], tex: 'L' },
      c: { kind: 'expr', ans: [R`\phi_\ell(x_n)`, 'phi_l(x_n)', R`\phi_{\ell}(x_{n})`, 'φ_ℓ(x_n)', 'phi_ell(x_n)'], tex: R`\phi_\ell(x_n)`, hint: 'ligne = exemple, colonne = feature' },
      d: { kind: 'expr', ans: ['M+1', '1+M'], tex: 'M+1' },
    },
    solution: R`Ligne $n$ = $\bphi(x_n)\T$ (un exemple), colonne $\ell$ = la feature $\phi_\ell$ sur tous les exemples. La constante $1$ compte comme une feature, d'où $M+1$.` },

  { id: 'lr3', ch: 1, type: 'deriv', title: 'Équations normales et estimateur LS', src: 'Slides p.14 · HW1 Q2.(3) · Q4.(1)',
    text: R`$\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2 = \frac1N\big(\by\T\by - 2\bw\T\bPhi\T\by + \bw\T\blank{a}\bw\big)$, donc
$$\nabla_\bw\EMSE(\bw) = \blank{b}\,\bPhi\T(\bPhi\bw-\by).$$
En annulant : $\blank{c}\,\bw = \bPhi\T\by$ (équations normales), et si la matrice est inversible, $\bw_{\text{LS}} = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\Phi^\top\Phi`, 'Phi^T Phi', 'ΦᵀΦ', R`\bPhi\T\bPhi`], tex: R`\bPhi\T\bPhi` },
      b: { kind: 'expr', ans: ['2/N', R`\frac{2}{N}`, R`\frac2N`], tex: R`\frac2N` },
      c: { kind: 'expr', ans: [R`\Phi^\top\Phi`, 'Phi^T Phi', 'ΦᵀΦ'], tex: R`\bPhi\T\bPhi` },
      d: { kind: 'expr', ans: [R`(\Phi^\top\Phi)^{-1}\Phi^\top y`, '(Phi^T Phi)^-1 Phi^T y', '(ΦᵀΦ)⁻¹Φᵀy', R`\Phi^\dagger y`], tex: R`(\bPhi\T\bPhi)^{-1}\bPhi\T\by` },
    },
    solution: R`Règles : $\nabla(\bw\T\bb) = \bb$, $\nabla(\bw\T\bA\bw) = 2\bA\bw$ pour $\bA$ symétrique. La hessienne $\frac2N\bPhi\T\bPhi\succeq0$ garantit que ce point stationnaire est un minimum global.` },

  { id: 'lr4', ch: 1, type: 'deriv', title: 'Convexité de la MSE empirique', src: 'Slides p.14',
    text: R`La hessienne vaut $\nabla^2\EMSE = \blank{a}$. Pour tout $\bv$, $\bv\T\bPhi\T\bPhi\bv = \blank{b}\ge0$ : la hessienne est semi-définie positive, donc $\EMSE$ est [[c]] et tout point stationnaire est un minimum global. Elle est définie positive si les colonnes de $\bPhi$ sont [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{2}{N}\Phi^\top\Phi`, '2/N Phi^T Phi', '2/N ΦᵀΦ', R`\frac2N\bPhi\T\bPhi`], tex: R`\frac2N\bPhi\T\bPhi` },
      b: { kind: 'expr', ans: [R`\|\Phi v\|^2`, '||Phi v||^2', '‖Φv‖²', R`\|\bPhi\bv\|^2`], tex: R`\|\bPhi\bv\|^2` },
      c: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
      d: { kind: 'word', ans: ['linéairement indépendantes', 'lineairement independantes', 'linearly independent', 'indépendantes', 'de rang plein'], tex: 'linéairement indépendantes' },
    } },

  { id: 'lr5', ch: 1, type: 'def', title: 'Géométrie : projection orthogonale', src: 'PRML §3.1.2', srcKind: 'book',
    text: R`$\hby = \bPhi\bw_{\text{LS}}$ est la projection orthogonale de $\by$ sur l'[[a]] de $\bPhi$. Le résidu vérifie $\bPhi\T(\by-\hby) = \blank{b}$. La matrice de projection est $\bP = \blank{c}$ et elle vérifie $\bP^2 = \blank{d}$.`,
    blanks: {
      a: { kind: 'word', ans: ['espace colonne', 'espace des colonnes', 'column space', 'image', 'col'], tex: 'espace colonne' },
      b: { kind: 'expr', ans: ['0', R`\mathbf 0`], tex: R`\mathbf 0` },
      c: { kind: 'expr', ans: [R`\Phi(\Phi^\top\Phi)^{-1}\Phi^\top`, 'Phi(Phi^T Phi)^-1 Phi^T', 'Φ(ΦᵀΦ)⁻¹Φᵀ'], tex: R`\bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T` },
      d: { kind: 'expr', ans: ['P', R`\mathbf P`], tex: R`\bP` },
    },
    solution: R`Pythagore : pour tout $\mathbf z\in\operatorname{col}(\bPhi)$, $\|\by-\mathbf z\|^2 = \|\by-\hby\|^2 + \|\hby-\mathbf z\|^2$. Projeter deux fois = projeter une fois.` },

  { id: 'lr6', ch: 1, type: 'deriv', title: 'MLE = moindres carrés', src: 'Slides p.17 · HW1 Q3.(1)',
    text: R`Avec $p(y_n|\bphi_n,\bw) = \N(y_n\mid\bw\T\bphi_n,\sigma^2)$ i.i.d. :
$$\ln\mathcal L(\bw) = \blank{a} - \frac{N}{2\sigma^2}\,\EMSE(\bw).$$
Comme $\frac N{2\sigma^2}>0$, $\bw_{\text{MLE}} = \bw_{\text{LS}}$. En dérivant aussi en $\sigma^2$ : $\sigma^2_{\text{ML}} = \blank{b}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\frac{N}{2}\ln(2\pi\sigma^2)`, '-N/2 ln(2 pi sigma^2)', '-N/2 ln(2πσ²)', R`-\frac N2\ln(2\pi\sigma^2)`], tex: R`-\frac N2\ln(2\pi\sigma^2)` },
      b: { kind: 'expr', ans: [R`\EMSE(\bw_{ML})`, 'MSE(w_ML)', R`\widehat{E}_{MSE}(w_{ML})`, R`\frac{1}{N}\|y-\Phi w_{ML}\|^2`, 'E_MSE(w_ML)', 'MSE'], tex: R`\EMSE(\bw_{\text{ML}})`, hint: 'la variance estimée = l\'erreur résiduelle moyenne' },
    } },

  { id: 'lr7', ch: 1, type: 'def', title: 'Ridge : forme close', src: 'Slides p.22 · HW1 Q3.(3)',
    text: R`Le minimiseur de $\frac1N\|\by-\bPhi\bw\|^2 + \lambda\|\bw\|^2$ est
$$\bw_{\text{ridge}} = \big(\blank{a} + \bPhi\T\bPhi\big)^{-1}\bPhi\T\by,$$
unique car pour $\lambda>0$ la matrice est [[b]] : $\bv\T(\cdot)\bv = N\lambda\|\bv\|^2 + \|\bPhi\bv\|^2>0$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`N\lambda I`, 'N lambda I', 'NλI', R`N\lambda\mathbf I`, 'lambda N I'], tex: R`N\lambda\bI`, hint: 'le facteur N vient du 1/N devant la MSE' },
      b: { kind: 'word', ans: ['définie positive', 'definie positive', 'positive definite', 'sdp stricte'], tex: 'définie positive' },
    } },

  { id: 'lr8', ch: 1, type: 'deriv', title: 'MAP gaussien = ridge', src: 'Slides p.25–26 · HW1 Q3.(2)',
    text: R`Prior $\bw\sim\N(0,\bSigma)$. Le log-posterior vaut, à constante près, $-\frac1{2\sigma^2}\|\by-\bPhi\bw\|^2 - \frac12\bw\T\blank{a}\bw$, d'où
$$\bw_{\text{MAP}} = \big(\blank{b} + \bPhi\T\bPhi\big)^{-1}\bPhi\T\by.$$
Avec $\bSigma = \tau^2\bI$, on retrouve le ridge pour $\lambda = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\Sigma^{-1}`, 'Σ^-1', 'Sigma^-1', 'Σ⁻¹'], tex: R`\bSigma^{-1}` },
      b: { kind: 'expr', ans: [R`\sigma^2\Sigma^{-1}`, 'sigma^2 Sigma^-1', 'σ²Σ⁻¹', 'σ^2 Σ^-1'], tex: R`\sigma^2\bSigma^{-1}` },
      c: { kind: 'expr', ans: [R`\frac{\sigma^2}{N\tau^2}`, 'sigma^2/(N tau^2)', 'σ²/(Nτ²)', 'σ^2/(Nτ^2)'], tex: R`\frac{\sigma^2}{N\tau^2}`, hint: 'identifier σ²/τ² = Nλ' },
    } },

  { id: 'lr9', ch: 1, type: 'deriv', title: 'Lasso en 1D : seuillage doux', src: 'Hors slides', srcKind: 'extra',
    text: R`On minimise $g(w) = (w-a)^2 + \lambda|w|$. Le sous-différentiel de $|w|$ en $0$ est $\partial|w|(0) = \blank{a}$. Le minimum est en $w^* = 0$ ssi $|a|\le\blank{b}$, et sinon $w^* = \operatorname{sign}(a)\big(\blank{c}\big)$.`,
    blanks: {
      a: { kind: 'expr', ans: ['[-1,1]', '[-1, 1]'], tex: '[-1,1]' },
      b: { kind: 'expr', ans: [R`\lambda/2`, R`\frac{\lambda}{2}`, 'lambda/2', 'λ/2'], tex: R`\frac\lambda2` },
      c: { kind: 'expr', ans: [R`|a|-\lambda/2`, R`|a|-\frac{\lambda}{2}`, '|a| - lambda/2', '|a|-λ/2'], tex: R`|a|-\frac\lambda2` },
    },
    solution: R`Condition d'optimalité : $0\in2(w-a)+\lambda\partial|w|$. En $w=0$ : $0\in[-2a-\lambda,-2a+\lambda]\iff|a|\le\lambda/2$.` },

  { id: 'lr10', ch: 1, type: 'def', title: 'Mises à jour GD, momentum, SGD', src: 'Slides p.35, 37, 42, 44',
    text: R`Pour la régression linéaire : $\bw_{t+1} = \bw_t - \blank{a}\sum_{n=1}^N(\bw_t\T\bphi_n - y_n)\bphi_n$.
Momentum : $\btheta_{i+1} = \btheta_i - \gamma_i\nabla\hL(\btheta_i) + \blank{b}$.
SGD avec mini-batch $\mathcal B_t$ : $\bg_t = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{2\gamma_t}{N}`, '2 gamma/N', '2γ/N', '2gamma_t/N', '2γ_t/N', R`\frac{2\gamma}{N}`], tex: R`\frac{2\gamma_t}N` },
      b: { kind: 'expr', ans: [R`\alpha\Delta\theta_i`, R`\alpha(\theta_i-\theta_{i-1})`, 'alpha(theta_i - theta_{i-1})', 'αΔθ_i', 'alpha Delta theta_i'], tex: R`\alpha\,\Delta\btheta_i = \alpha(\btheta_i-\btheta_{i-1})` },
      c: { kind: 'expr', ans: [R`\frac{1}{|B_t|}\sum_{i\in B_t}\nabla\ell_i(w_t)`, R`\nabla\hat L_{B_t}(w_t)`, '1/|B_t| sum_{i in B_t} grad l_i(w_t)', R`\frac1{|\mathcal B_t|}\sum_{i\in\mathcal B_t}\nabla\ell_i(\bw_t)`], tex: R`\frac1{|\mathcal B_t|}\sum_{i\in\mathcal B_t}\nabla\ell_i(\bw_t)` },
    } },

  { id: 'lr11', ch: 1, type: 'deriv', title: 'SGD est sans biais', src: 'Slides p.45 · HW1 Q4.(4)',
    text: R`$\mathcal B$ est tiré uniformément parmi les sous-ensembles de taille $B$. On écrit $\sum_{i\in\mathcal B}\nabla\ell_i = \sum_{i=1}^N\blank{a}\,\nabla\ell_i$, puis $P(i\in\mathcal B) = \blank{b}$, d'où
$$\E_{\mathcal B}\Big[\frac1B\sum_{i\in\mathcal B}\nabla\ell_i\Big] = \frac1B\sum_{i=1}^N\blank{b}\,\nabla\ell_i = \blank{c}.$$`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mathbb 1[i\in B]`, '1[i in B]', R`1(i\in B)`, R`\mathbb{1}[i\in\mathcal B]`, '1_{i in B}'], tex: R`\mathbb 1[i\in\mathcal B]` },
      b: { kind: 'expr', ans: ['B/N', R`\frac{B}{N}`], tex: R`\frac BN`, hint: 'C(N−1,B−1)/C(N,B)' },
      c: { kind: 'expr', ans: [R`\nabla\hat L(\theta)`, R`\nabla \hat L`, 'grad L', R`\frac1N\sum_i\nabla\ell_i`, R`\nabla\hL(\btheta)`, 'nabla L(theta)', 'nabla hat L'], tex: R`\nabla\hL(\btheta)` },
    } },

  { id: 'lr12', ch: 1, type: 'def', title: 'Sur-apprentissage (HW1 Q2.(4))', src: 'Slides p.20',
    text: R`Base polynomiale de degré $M$ avec $N = 15$ points. Si $M+1>N$, la matrice $\bPhi\T\bPhi$ est [[a]] et l'erreur d'entraînement peut valoir exactement [[b]]. Pour détecter le sur-apprentissage on compare l'erreur d'entraînement à l'erreur de [[c]].`,
    blanks: {
      a: { kind: 'word', ans: ['singulière', 'singuliere', 'non inversible', 'singular', 'not invertible'], tex: 'singulière' },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'word', ans: ['test', 'validation', 'généralisation'], tex: 'test' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'lr13', ch: 1, type: 'calc', title: 'Un pas de descente de gradient (slides p.32)', src: 'Slides p.32–36',
    gen: r => {
      const t0 = [-6, -5, -4, -2, -1, 0, 1][r.int(7)], g = [0.001, 0.005, 0.01, 0.02][r.int(4)];
      const dL = t => 4 * t ** 3 + 21 * t ** 2 + 10 * t - 17, d = dL(t0), t1 = t0 - g * d;
      return { text: R`$\hL(\theta) = \theta^4 + 7\theta^3 + 5\theta^2 - 17\theta + 3$, $\theta_0 = ${t0}$, $\gamma = ${g}$. Calcule $\hL'(\theta_0) = \blank{a}$ puis $\theta_1 = \theta_0 - \gamma\hL'(\theta_0) = \blank{b}$.`,
        blanks: { a: { kind: 'num', ans: d, tol: 1e-4 }, b: { kind: 'num', ans: t1, tol: 1e-3 } },
        solution: R`$\hL'(\theta) = 4\theta^3 + 21\theta^2 + 10\theta - 17$, donc $\hL'(${t0}) = ${d}$ et $\theta_1 = ${t0} - ${g}\times(${d}) = ${f(t1)}$.` };
    } },

  { id: 'lr14', ch: 1, type: 'calc', title: 'Pas de GD sur une quadratique', src: 'Slides p.38–39 · DL §7.3', srcKind: 'book',
    gen: r => {
      const m1 = [2, 4, 5, 8, 10, 20][r.int(6)], m2 = [0.5, 1, 2][r.int(3)];
      return { text: R`$\hL(\bx) = \frac12\bx\T\bA\bx - \bb\T\bx$ avec $\bA = \operatorname{diag}(${m1}, ${m2})$. GD à pas constant converge ssi $0\lt\gamma\lt\blank{a}$. Le pas qui minimise le taux de convergence est $\gamma^* = \frac{2}{\mu_{\max}+\mu_{\min}} = \blank{b}$, et le taux vaut alors $\frac{\kappa-1}{\kappa+1} = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: 2 / m1 }, b: { kind: 'num', ans: 2 / (m1 + m2) }, c: { kind: 'num', ans: (m1 / m2 - 1) / (m1 / m2 + 1) } },
        solution: R`L'erreur évolue selon $e^{(i)}_{t+1} = (1-\gamma\mu_i)e^{(i)}_t$ : il faut $|1-\gamma\mu_i|<1$ pour $\mu_i = ${m1}$ et $${m2}$, soit $\gamma<2/${m1}$. $\kappa = ${m1}/${m2} = ${f(m1 / m2)}$.` };
    } },

  { id: 'lr15', ch: 1, type: 'calc', title: 'Moindres carrés à la main (3 points)', src: 'Slides p.13–14',
    gen: r => {
      const y = [r.int(5) - 1, r.int(5), r.int(5) + 1], a = (y[2] - y[0]) / 2, b = (y[0] + y[1] + y[2]) / 3 - a;
      return { text: R`Points $(0, ${y[0]})$, $(1, ${y[1]})$, $(2, ${y[2]})$ ; modèle $f(x) = w_1x + w_2$. Les moindres carrés donnent $w_1 = \blank{a}$ et $w_2 = \blank{b}$.`,
        blanks: { a: { kind: 'num', ans: a }, b: { kind: 'num', ans: b } },
        solution: R`Pente $w_1 = \frac{\sum(x_n-\bar x)(y_n-\bar y)}{\sum(x_n-\bar x)^2}$ avec $\bar x = 1$ : $= \frac{(-1)(${y[0]}-\bar y) + (1)(${y[2]}-\bar y)}{2} = \frac{${y[2]}-${y[0]}}{2}$. Puis $w_2 = \bar y - w_1\bar x = ${f(b)}$.` };
    } },

  { id: 'lr16', ch: 1, type: 'calc', title: 'Ridge scalaire', src: 'Slides p.22',
    gen: r => {
      const xs = [1, 2, 3].map(() => r.int(3) + 1), ys = xs.map(x => x * (r.int(3) + 1) - r.int(2)), lam = [0.1, 0.5, 1][r.int(3)], N = 3;
      const sxy = M.sum(xs.map((x, i) => x * ys[i])), sxx = M.sum(xs.map(x => x * x));
      return { text: R`Modèle $f(x) = wx$ (sans biais), données $(${xs[0]},${ys[0]}), (${xs[1]},${ys[1]}), (${xs[2]},${ys[2]})$, $\lambda = ${lam}$ dans $\frac1N\sum(y_n-wx_n)^2 + \lambda w^2$. Alors $w_{\text{LS}} = \blank{a}$ et $w_{\text{ridge}} = \blank{b}$.`,
        blanks: { a: { kind: 'num', ans: sxy / sxx }, b: { kind: 'num', ans: sxy / (sxx + N * lam) } },
        solution: R`En 1D, $\bPhi\T\bPhi = \sum x_n^2 = ${sxx}$ et $\bPhi\T\by = \sum x_ny_n = ${sxy}$. $w_{\text{ridge}} = \frac{${sxy}}{${sxx} + 3\times${lam}}$ : le ridge rétrécit vers 0.` };
    } },
  );
})(window.ML);
