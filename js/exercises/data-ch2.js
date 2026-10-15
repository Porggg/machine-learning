/* Exercices — Chapitre 2 : régression logistique, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<p class="hyp"><b>Cadre.</b> Classification binaire, $N$ exemples $(\bx_n,y_n)$ avec $y_n\in\{0,1\}$. Modèle $\hat y_n = \sigma(\bw\T\bx_n)$ où $\sigma(t) = \frac1{1+e^{-t}}$, et cross-entropy $L(\bw) = -\sum_{n=1}^N\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big]$.</p>`;

  ML.EX.add(
  { id: 'lg1', ch: 2, type: 'deriv', title: 'Symétrie, logit et dérivée de la sigmoïde', src: 'Slides p.9',
    text: R`<p class="hyp"><b>Cadre.</b> $\sigma(t) = \frac1{1+e^{-t}}$.</p>
<p class="claim"><b>Proposition.</b> $1-\sigma(t) = \sigma(-t)$ ; $\sigma^{-1}(p) = \ln\frac p{1-p}$ ; $\sigma'(t) = \sigma(t)\big(1-\sigma(t)\big)$, maximale en $t = 0$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
1-\sigma(t) &= \frac{1+e^{-t}-1}{1+e^{-t}} = \frac{e^{-t}}{1+e^{-t}} = \blank{a} = \sigma(-t) &&\text{(i)}\\
p = \sigma(t)\ &\iff\ e^{-t} = \blank{b}\ \iff\ t = \ln\frac{p}{1-p} &&\text{(ii)}\\
\sigma'(t) &= \frac{e^{-t}}{(1+e^{-t})^2} = \frac1{1+e^{-t}}\cdot\frac{e^{-t}}{1+e^{-t}} = \sigma(t)\,\blank{c} &&\text{(iii)}\\
\sigma'(0) &= \tfrac12\cdot\tfrac12 = \blank{d}. &&\text{(iv)}
\end{aligned}$$
<p>Dans (i), on a multiplié numérateur et dénominateur par [[e]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1}{e^t+1}`, '1/(e^t+1)', '1/(1+e^t)', R`\frac{1}{1+e^{t}}`], tex: R`\frac1{e^t+1}` },
      b: { kind: 'expr', ans: [R`\frac{1-p}{p}`, '(1-p)/p'], tex: R`\frac{1-p}{p}` },
      c: { kind: 'expr', ans: [R`(1-\sigma(t))`, '(1-sigma(t))', '1-sigma(t)', R`\sigma(-t)`, 'sigma(-t)', '(1-σ(t))'], tex: R`\big(1-\sigma(t)\big)` },
      d: { kind: 'num', ans: 0.25, tol: 0 },
      e: { kind: 'expr', ans: ['e^t', R`e^{t}`, 'exp(t)'], tex: 'e^t' },
    } },

  { id: 'lg2', ch: 2, type: 'def', title: 'Le modèle logistique et sa frontière', src: 'Slides p.10, 12–13',
    text: R`<p class="hyp"><b>Cadre.</b> Classification binaire $y\in\{0,1\}$ ; on note $p_\bw(\bx) = P(y = 1\mid\bx)$.</p>
<p><b>Définition.</b> La régression logistique modélise le [[a]] par une fonction affine :
$$\ln\frac{p_\bw(\bx)}{1-p_\bw(\bx)} = \bw\T\bx+b\quad\iff\quad p_\bw(\bx) = \blank{b}.$$
On prédit la classe 1 ssi $p_\bw(\bx)\ge\frac12$, c'est-à-dire ssi $\bw\T\bx+b\,\blank{c}\,0$. La frontière $\{\bx : \bw\T\bx+b = 0\}$ est un [[d]] orthogonal à $\bw$.</p>`,
    blanks: {
      a: { kind: 'word', ans: ['log-odds', 'log odds', 'logit', 'log-rapport des cotes', 'log de la cote'], tex: 'log-odds' },
      b: { kind: 'expr', ans: [R`\sigma(w^\top x+b)`, 'sigma(w^T x + b)', 'σ(wᵀx+b)', R`\sigma(\bw\T\bx+b)`], tex: R`\sigma(\bw\T\bx+b)` },
      c: { kind: 'expr', ans: ['>=', R`\ge`, '≥', R`\geq`], tex: R`\ge` },
      d: { kind: 'word', ans: ['hyperplan', 'hyperplane'], tex: 'hyperplan' },
    } },

  { id: 'd2b', ch: 2, type: 'deriv', title: 'Deux gaussiennes de même covariance : le posterior est une sigmoïde', src: 'Chapitre 2, §1 · PRML §4.2', srcKind: 'book',
    text: R`<p class="hyp"><b>Cadre.</b> Deux classes $C_0,C_1$ de probabilités a priori $\pi_0,\pi_1$, avec $p(\bx\mid C_k) = \N(\bx\mid\bmu_k,\bSigma)$ (même covariance $\bSigma$). On pose $a(\bx) = \ln\frac{\pi_1\N(\bx|\bmu_1,\bSigma)}{\pi_0\N(\bx|\bmu_0,\bSigma)}$.</p>
<p class="claim"><b>Proposition.</b> $a(\bx) = \bw\T\bx+b$ avec $\bw = \bSigma^{-1}(\bmu_1-\bmu_0)$, et $p(C_1\mid\bx) = \sigma(a(\bx))$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\ln\N(\bx\mid\bmu_k,\bSigma) &= -\tfrac12\bx\T\bSigma^{-1}\bx+\blank{a}-\tfrac12\bmu_k\T\bSigma^{-1}\bmu_k+c &&\text{(i)}\\
a(\bx) &= (\bmu_1-\bmu_0)\T\bSigma^{-1}\bx-\tfrac12\bmu_1\T\bSigma^{-1}\bmu_1+\tfrac12\bmu_0\T\bSigma^{-1}\bmu_0+\ln\tfrac{\pi_1}{\pi_0} &&\text{(ii)}\\
p(C_1\mid\bx) &= \frac{A}{A+B} = \frac1{1+B/A} = \frac{1}{1+e^{\blank{b}}} = \sigma(a(\bx)) &&\text{(iii)}
\end{aligned}$$
<p>Dans (i), $c$ ne dépend pas de la classe. Dans (ii), le terme $-\frac12\bx\T\bSigma^{-1}\bx$ et $c$ [[c]] car la covariance est commune. Dans (iii), $A = \pi_1\N(\bx|\bmu_1,\bSigma)$ et $B = \pi_0\N(\bx|\bmu_0,\bSigma)$, donc $\ln\frac AB = a(\bx)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mu_k^\top\Sigma^{-1}x`, 'mu_k^T Sigma^-1 x', 'μ_k^T Σ^-1 x', R`\bmu_k\T\bSigma^{-1}\bx`], tex: R`\bmu_k\T\bSigma^{-1}\bx` },
      b: { kind: 'expr', ans: ['-a(x)', R`-a(\bx)`, '-a'], tex: R`-a(\bx)` },
      c: { kind: 'word', ans: ['s annulent', 'se simplifient', 'disparaissent', 'se compensent', 'cancel'], tex: 's\'annulent' },
    } },

  { id: 'lg3', ch: 2, type: 'deriv', title: 'Pourquoi les moindres carrés classent mal', src: 'Slides p.8',
    text: R`<p class="hyp"><b>Cadre.</b> Étiquettes $y\in\{-1,+1\}$, score réel $f = f(\bx)$, marge $m = yf$ (positive ssi l'exemple est bien classé).</p>
<p class="claim"><b>Proposition.</b> $(y-f)^2 = (1-m)^2$ : la perte quadratique pénalise aussi les exemples bien classés avec une grande marge.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
(y-f)^2 &= y^2\Big(1-\frac fy\Big)^2 &&\text{(i)}\\
&= \blank{a}\cdot\big(1-\blank{b}\,f\big)^2 = (1-m)^2. &&\text{(ii)}
\end{aligned}$$
<p>(ii) utilise $y = \pm1$, donc $y^2 = 1$ et $\frac1y = y$. La fonction $m\mapsto(1-m)^2$ est nulle en $m = 1$ puis [[c]] pour $m>1$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 1, tol: 0 },
      b: { kind: 'expr', ans: ['y'], tex: 'y' },
      c: { kind: 'word', ans: ['croit', 'croît', 'augmente', 'remonte', 'increases'], tex: 'croît' },
    } },

  { id: 'lg4', ch: 2, type: 'deriv', title: 'La vraisemblance de Bernoulli donne la cross-entropy', src: 'Slides p.14–15',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> $-\ln\prod_np(y_n\mid\bx_n,\bw) = L(\bw)$ : minimiser la cross-entropy revient à maximiser la vraisemblance.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p(y_n\mid\bx_n,\bw) &= \hat y_n^{\,\blank{a}}\,(1-\hat y_n)^{\blank{b}} &&\text{(i)}\\
-\ln\prod_np(y_n\mid\bx_n,\bw) &= -\sum_n\ln p(y_n\mid\bx_n,\bw) &&\text{(ii)}\\
&= -\sum_n\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big] = L(\bw). &&\text{(iii)}
\end{aligned}$$
<p>(i) regroupe les deux cas $P(y = 1) = \hat y$ et $P(y = 0) = 1-\hat y$. La vraisemblance est un produit grâce à l'[[c]] des exemples. Le facteur $p(\bx_n)$ de la loi jointe ne dépend pas de $\bw$ et disparaît de l'optimisation. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['y_n'], tex: 'y_n' },
      b: { kind: 'expr', ans: ['1-y_n', '(1-y_n)'], tex: '1-y_n' },
      c: { kind: 'word', ans: ['independance', 'indépendance', 'independence'], tex: 'indépendance' },
    } },

  { id: 'd2c', ch: 2, type: 'deriv', title: 'De la NLL en $\\{0,1\\}$ à la logistic loss en $\\{-1,+1\\}$', src: 'Chapitre 2, §3',
    text: R`<p class="hyp"><b>Cadre.</b> Score $f = f(\bx)$, probabilité de la classe positive $\hat y = \sigma(f)$ ; NLL d'un exemple $= -\ln P(\text{vraie classe})$. On code maintenant les classes par $y\in\{-1,+1\}$.</p>
<p class="claim"><b>Proposition.</b> La NLL vaut $\ln(1+e^{-yf})$ dans les deux cas.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
y = +1:\quad -\ln\hat y &= -\ln\sigma(f) &&\text{(i)}\\
y = -1:\quad -\ln(1-\hat y) &= -\ln\sigma(\blank{a}) &&\text{(ii)}\\
\text{dans les deux cas :}\quad -\ln\sigma(yf) &= -\ln\frac1{1+e^{-yf}} = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) utilise la symétrie $1-\sigma(t) = \sigma(-t)$. Correspondance des codages : $y^{\{0,1\}} = \blank{c}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['-f'], tex: '-f' },
      b: { kind: 'expr', ans: [R`\ln(1+e^{-yf})`, 'ln(1+e^(-yf))', 'log(1+exp(-yf))', R`\log(1+e^{-yf})`], tex: R`\ln(1+e^{-yf})` },
      c: { kind: 'expr', ans: [R`\frac{1+y}{2}`, '(1+y)/2', '(y+1)/2'], tex: R`\frac{1+y}{2}` },
    } },

  { id: 'lg5', ch: 2, type: 'def', title: 'Entropie croisée', src: 'Slides p.16',
    text: R`<p class="hyp"><b>Cadre.</b> $r$ et $q$ sont deux lois de probabilité sur un ensemble fini $\mathcal Y$ ($r$ : la cible, $q$ : la prédiction).</p>
<p><b>Définition.</b> L'entropie croisée de $r$ relativement à $q$ est
$$H(r,q) = \blank{a}.$$
Avec la cible certaine $r_n(y) = \mathbb 1[y = y_n]$, un seul terme survit : $H(r_n,q) = \blank{b}$, la log-vraisemblance négative de l'exemple $n$.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\sum_{y}r(y)\ln q(y)`, '-sum r(y) ln q(y)', R`-\sum_{y\in Y}r(y)\ln q(y)`, R`-\sum_{y\in\mathcal Y}r(y)\ln q(y)`], tex: R`-\sum_{y\in\mathcal Y}r(y)\ln q(y)` },
      b: { kind: 'expr', ans: [R`-\ln q(y_n)`, '-ln q(y_n)', '-log q(y_n)'], tex: R`-\ln q(y_n)` },
    } },

  { id: 'lg6', ch: 2, type: 'deriv', title: 'La cross-entropy majore la perte 0-1', src: 'Slides p.17–18',
    text: R`<p class="hyp"><b>Cadre.</b> Étiquettes $y\in\{-1,+1\}$, marge $m = yf(\bx)$, perte 0-1 $\mathbb 1(m\le0)$, logistic loss $\ln(1+e^{-m})$.</p>
<p class="claim"><b>Proposition.</b> Pour tout $m\in\R$ : $\mathbb 1(m\le0)\le\frac1{\ln2}\ln(1+e^{-m})$.</p>
<p><b>Preuve.</b> Deux cas.</p>
$$\begin{aligned}
m>0:\quad \mathbb 1(m\le0) &= \blank{a}\ \le\ \tfrac1{\ln2}\ln(1+e^{-m}) &&\text{(i)}\\
m\le0:\quad e^{-m}\ge\blank{b}\ &\Longrightarrow\ \ln(1+e^{-m})\ge\blank{c}\ \Longrightarrow\ 1\le\tfrac1{\ln2}\ln(1+e^{-m}). &&\text{(ii)}
\end{aligned}$$
<p>Dans (i), le membre de droite est positif car $1+e^{-m}>1$. En moyennant sur les exemples, l'erreur de classification est au plus $\frac1{\ln2}$ fois la cross-entropy moyenne : minimiser la cross-entropy minimise un [[d]] de l'erreur. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: [R`\ln 2`, 'ln2', 'ln 2', 'log 2'], tex: R`\ln2` },
      d: { kind: 'word', ans: ['majorant', 'borne superieure', 'borne supérieure', 'upper bound', 'surrogate'], tex: 'majorant' },
    } },

  { id: 'lg7', ch: 2, type: 'deriv', title: 'Le gradient de la cross-entropy', src: 'Slides p.22–23',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> $\nabla L(\bw) = \sum_{n=1}^N(\hat y_n-y_n)\,\bx_n$.</p>
<p><b>Preuve.</b> Règle de la chaîne pour chaque terme $\ell_n = -y_n\ln\hat y_n-(1-y_n)\ln(1-\hat y_n)$ :</p>
$$\begin{aligned}
\frac{\partial\ell_n}{\partial\hat y_n} &= -\frac{y_n}{\hat y_n}+\blank{a} = \frac{\hat y_n-y_n}{\hat y_n(1-\hat y_n)} &&\text{(i)}\\
\nabla_\bw\hat y_n &= \sigma'(\bw\T\bx_n)\,\bx_n = \blank{b}\,\bx_n &&\text{(ii)}\\
\nabla\ell_n &= \frac{\partial\ell_n}{\partial\hat y_n}\,\nabla_\bw\hat y_n = \big(\blank{c}\big)\,\bx_n. &&\text{(iii)}
\end{aligned}$$
<p>(ii) utilise $\sigma' = \sigma(1-\sigma)$ ; dans (iii), les facteurs $\hat y_n(1-\hat y_n)$ se simplifient. On somme sur $n$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1-y_n}{1-\hat y_n}`, '(1-y_n)/(1-yhat_n)', '(1-y_n)/(1-ŷ_n)'], tex: R`\frac{1-y_n}{1-\hat y_n}` },
      b: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      c: { kind: 'expr', ans: [R`\hat y_n-y_n`, 'yhat_n - y_n', 'ŷ_n-y_n'], tex: R`\hat y_n-y_n` },
    } },

  { id: 'lg8', ch: 2, type: 'deriv', title: 'Hessienne de la cross-entropy et convexité', src: 'Slides p.33 · HW2 P1.(2)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> $\nabla^2L(\bw) = \sum_n\hat y_n(1-\hat y_n)\,\bx_n\bx_n\T$ est semi-définie positive : $L$ est convexe.</p>
<p><b>Preuve.</b> On part de $\nabla L = \sum_n(\hat y_n-y_n)\bx_n$ ; seul $\hat y_n$ dépend de $\bw$.</p>
$$\begin{aligned}
\nabla^2L &= \sum_n\bx_n\,\big(\nabla_\bw\hat y_n\big)\T = \sum_n\blank{a}\,\bx_n\bx_n\T &&\text{(i)}\\
\bv\T\nabla^2L\,\bv &= \sum_n\hat y_n(1-\hat y_n)\,\bv\T\bx_n\bx_n\T\bv = \sum_n\hat y_n(1-\hat y_n)\,\big(\blank{b}\big)^2\ \ge\ 0. &&\text{(ii)}
\end{aligned}$$
<p>(ii) est $\ge0$ car $\hat y_n\in\blank{c}$, donc $\hat y_n(1-\hat y_n)>0$. Une fonction de hessienne semi-définie positive partout est [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat y_n(1-\hat y_n)`, 'yhat_n(1-yhat_n)', 'ŷ_n(1-ŷ_n)'], tex: R`\hat y_n(1-\hat y_n)` },
      b: { kind: 'expr', ans: [R`x_n^\top v`, 'x_n^T v', R`v^\top x_n`, 'v^T x_n'], tex: R`\bx_n\T\bv` },
      c: { kind: 'expr', ans: ['(0,1)', ']0,1['], tex: '(0,1)' },
      d: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
    } },

  { id: 'lg9', ch: 2, type: 'deriv', title: 'La mise à jour de Newton', src: 'Slides p.30–31',
    text: R`<p class="hyp"><b>Cadre.</b> $L(\bw)$ deux fois dérivable ; $\mathbf g = \nabla L(\bw^{(k)})$ et $\mathbf H = \nabla^2L(\bw^{(k)})$, supposée définie positive.</p>
<p class="claim"><b>Proposition.</b> Le minimiseur de l'approximation quadratique de $L$ en $\bw^{(k)}$ est $\bw^{(k+1)} = \bw^{(k)}-\mathbf H^{-1}\mathbf g$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\tilde L(\bw) &= L(\bw^{(k)})+\mathbf g\T(\bw-\bw^{(k)})+\blank{a} &&\text{(i)}\\
\nabla\tilde L(\bw) &= \mathbf g+\blank{b} &&\text{(ii)}\\
\nabla\tilde L(\bw) = 0\ &\iff\ \bw = \bw^{(k)}-\mathbf H^{-1}\mathbf g. &&\text{(iii)}
\end{aligned}$$
<p>(i) est le développement de Taylor à l'ordre [[c]]. Comme $\mathbf H\succ0$, $\tilde L$ est strictement convexe et (iii) est son unique minimum. Si $L$ est exactement quadratique, $\tilde L = L$ et Newton conclut en un seul pas. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac12(w-w^{(k)})^\top H(w-w^{(k)})`, '1/2 (w-w_k)^T H (w-w_k)', R`\frac{1}{2}(w-w_k)^\top H(w-w_k)`, '1/2(w-w^(k))^T H(w-w^(k))'], tex: R`\tfrac12(\bw-\bw^{(k)})\T\mathbf H(\bw-\bw^{(k)})` },
      b: { kind: 'expr', ans: [R`H(w-w^{(k)})`, 'H(w-w_k)', 'H(w - w^(k))', R`H(w-w_k)`], tex: R`\mathbf H(\bw-\bw^{(k)})` },
      c: { kind: 'num', ans: 2, tol: 0 },
    } },

  { id: 'lg10', ch: 2, type: 'deriv', title: 'Softmax à deux classes et invariance par translation', src: 'Slides p.34 · HW2 P1.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> Régression softmax à $K$ classes : $p(y = k\mid\bx) = \frac{e^{a_k}}{\sum_{j}e^{a_j}}$ avec $a_k = \bw_k\T\bx$.</p>
<p class="claim"><b>Proposition.</b> Pour $K = 2$ (classes 0 et 1), $p(y = 1\mid\bx) = \sigma(a_1-a_0)$. Ajouter un même vecteur $\mathbf c$ à tous les $\bw_k$ ne change aucune probabilité.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p(y = 1\mid\bx) &= \frac{e^{a_1}}{e^{a_0}+e^{a_1}} = \frac1{\blank{a}+1} = \sigma(a_1-a_0) &&\text{(i)}\\
\frac{e^{(\bw_k+\mathbf c)\T\bx}}{\sum_je^{(\bw_j+\mathbf c)\T\bx}} &= \frac{\blank{b}\,e^{a_k}}{\blank{b}\sum_je^{a_j}} = p(y = k\mid\bx). &&\text{(ii)}
\end{aligned}$$
<p>(i) : on divise numérateur et dénominateur par $e^{a_1}$. Par (ii), seuls les écarts entre les $\bw_k$ comptent : les paramètres ne sont pas [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`e^{a_0-a_1}`, 'e^(a_0-a_1)', 'exp(a0-a1)', R`e^{-(a_1-a_0)}`], tex: R`e^{a_0-a_1}` },
      b: { kind: 'expr', ans: [R`e^{c^\top x}`, 'e^(c^T x)', 'exp(c^T x)', R`e^{\mathbf c\T\bx}`], tex: R`e^{\mathbf c\T\bx}` },
      c: { kind: 'word', ans: ['identifiables', 'identifiable', 'uniques'], tex: 'identifiables' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'lg12', ch: 2, type: 'calc', title: 'Évaluer la sigmoïde', src: 'Slides p.9',
    gen: r => {
      const t = [-2, -1, -0.5, 0.5, 1, 2, 3][r.int(7)], s = M.sigmoid(t);
      return { text: R`<p class="hyp"><b>Données.</b> $t = ${t}$, $\sigma(t) = \frac1{1+e^{-t}}$, $\sigma'(t) = \sigma(t)(1-\sigma(t))$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
e^{-t} &= \blank{a},\qquad\sigma(t) = \blank{b}\\
\sigma'(t) &= \blank{c},\qquad\frac{\sigma(t)}{1-\sigma(t)} = \blank{d}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: Math.exp(-t) }, b: { kind: 'num', ans: s }, c: { kind: 'num', ans: s * (1 - s) }, d: { kind: 'num', ans: Math.exp(t) } },
        solution: R`La cote vaut toujours $e^{t}$ : le logit de $\sigma(t)$ est $t$.` };
    } },

  { id: 'lg13', ch: 2, type: 'calc', title: 'Perte et gradient pour un exemple', src: 'Slides p.11, 22',
    gen: r => {
      const x = [1, 2, -1, 0.5][r.int(4)], w = [0.5, 1, -0.5, 2][r.int(4)], y = r.int(2), p = M.sigmoid(w * x);
      const loss = y ? -Math.log(p) : -Math.log(1 - p), g = (p - y) * x;
      return { text: R`<p class="hyp"><b>Données.</b> Modèle 1D $\hat y = \sigma(wx)$, perte $\ell = -[y\ln\hat y+(1-y)\ln(1-\hat y)]$, gradient $\frac{\partial\ell}{\partial w} = (\hat y-y)x$. Exemple $x = ${x}$, $y = ${y}$, poids $w = ${w}$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
wx &= \blank{a},\qquad\hat y = \blank{b}\\
\ell &= \blank{c},\qquad\frac{\partial\ell}{\partial w} = \blank{d}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: w * x, tol: 0 }, b: { kind: 'num', ans: p }, c: { kind: 'num', ans: loss }, d: { kind: 'num', ans: g } },
        solution: R`Gradient $= (${f(p)}-${y})\times${x} = ${f(g)}$.` };
    } },

  { id: 'lg14', ch: 2, type: 'calc', title: 'Un pas de Newton en 1D', src: 'Slides p.30',
    gen: r => {
      const x0 = [1, 2, 3, -2][r.int(4)], k = [4, 6][r.int(2)];
      const x1 = x0 - (k * x0 ** (k - 1)) / (k * (k - 1) * x0 ** (k - 2));
      return { text: R`<p class="hyp"><b>Données.</b> $f(x) = x^{${k}}$, Newton en 1D : $x_{k+1} = x_k-\frac{f'(x_k)}{f''(x_k)}$, depuis $x_0 = ${x0}$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
f'(x_0) &= \blank{a},\qquad f''(x_0) = \blank{b}\\
x_1 &= \blank{c}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: k * x0 ** (k - 1) }, b: { kind: 'num', ans: k * (k - 1) * x0 ** (k - 2) }, c: { kind: 'num', ans: x1 } },
        solution: R`$x_1 = x_0\big(1-\frac1{${k - 1}}\big) = ${f(x1)}$ : convergence seulement linéaire, car $f''(0) = 0$.` };
    } },

  { id: 'lg15', ch: 2, type: 'calc', title: 'Softmax à la main', src: 'Slides p.34',
    gen: r => {
      const a = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = a.map(Math.exp), s = M.sum(e);
      return { text: R`<p class="hyp"><b>Données.</b> Scores $(a_1,a_2,a_3) = (${a.join(', ')})$, $p_k = \frac{e^{a_k}}{\sum_je^{a_j}}$.</p>
<p><b>Calcul.</b></p>
$$\begin{aligned}
\textstyle\sum_je^{a_j} &= \blank{a},\qquad p_1 = \blank{b}\\
p_1\ \text{après avoir ajouté 5 à tous les scores} &= \blank{c}
\end{aligned}$$`,
        blanks: { a: { kind: 'num', ans: s }, b: { kind: 'num', ans: e[0] / s }, c: { kind: 'num', ans: e[0] / s } },
        solution: R`Ajouter une constante multiplie numérateur et dénominateur par $e^5$ : rien ne change.` };
    } },
  );
})(window.ML);
