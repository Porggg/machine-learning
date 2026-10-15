/* Exercices — Chapitre 3 : SVM, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<p class="hyp"><b>Cadre.</b> Données $(\bx_i,y_i)_{i=1}^N$, $y_i\in\{-1,+1\}$, classifieur $f(\bx) = \bw\T\bx+b$. SVM à marge dure : $\min_{\bw,b}\frac12\|\bw\|^2$ sous $y_i(\bw\T\bx_i+b)\ge1$ pour tout $i$.</p>`;

  ML.EX.add(
  { id: 'sv1', ch: 3, type: 'deriv', title: 'Distance d\'un point à un hyperplan', src: 'Slides p.4–5',
    text: R`<p class="hyp"><b>Cadre.</b> $f(\bx) = \bw\T\bx+b$ avec $\bw\ne0$, hyperplan $H = \{\bx : f(\bx) = 0\}$.</p>
<p class="claim"><b>Proposition.</b> $\bw$ est orthogonal à $H$, et la distance de $\bx$ à $H$ vaut $\frac{|f(\bx)|}{\|\bw\|}$.</p>
<p><b>Preuve.</b> Pour $\bx_1,\bx_2\in H$, puis pour $\bx = \bx_p+\tau\frac{\bw}{\|\bw\|}$ avec $\bx_p\in H$ son projeté orthogonal :</p>
$$\begin{aligned}
\bw\T(\bx_1-\bx_2) &= f(\bx_1)-f(\bx_2) = \blank{a} &&\text{(i)}\\
0 = f(\bx_p) &= \bw\T\bx-\tau\frac{\bw\T\bw}{\|\bw\|}+b = f(\bx)-\tau\,\blank{b} &&\text{(ii)}\\
\tau &= \blank{c},\qquad\mathrm{dist}(\bx,H) = |\tau| = \frac{|f(\bx)|}{\|\bw\|}. &&\text{(iii)}
\end{aligned}$$
<p>Par (i), $\bw$ est [[d]] à toute direction contenue dans $H$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`\|w\|`, '||w||', '‖w‖'], tex: R`\|\bw\|` },
      c: { kind: 'expr', ans: [R`\frac{f(x)}{\|w\|}`, 'f(x)/||w||', 'f(x)/‖w‖'], tex: R`\frac{f(\bx)}{\|\bw\|}` },
      d: { kind: 'word', ans: ['orthogonal', 'normal', 'perpendiculaire'], tex: 'orthogonal' },
    } },

  { id: 'sv2', ch: 3, type: 'deriv', title: 'De la marge maximale au problème canonique', src: 'Slides p.7–8 · HW3 P1.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> Données linéairement séparables $(\bx_j,y_j)$, $y_j\in\{-1,+1\}$ ; marge de $(\bw,b)$ : $\rho(\bw,b) = \min_j\frac{y_j(\bw\T\bx_j+b)}{\|\bw\|}$.</p>
<p class="claim"><b>Proposition.</b> Maximiser $\rho$ équivaut à $\min_{\bw,b}\frac12\|\bw\|^2$ sous $y_i(\bw\T\bx_i+b)\ge1$, et la marge optimale vaut $1/\|\bw^*\|$.</p>
<p><b>Preuve.</b> Pour $\lambda>0$ :</p>
$$\begin{aligned}
\rho(\lambda\bw,\lambda b) &= \frac{\min_j\lambda\,y_j(\bw\T\bx_j+b)}{\|\lambda\bw\|} = \frac{\blank{a}\min_jy_j(\bw\T\bx_j+b)}{\blank{a}\,\|\bw\|} = \rho(\bw,b) &&\text{(i)}\\
\text{normalisation}\ \min_jy_j(\bw\T\bx_j+b) = \blank{b}\ &\Longrightarrow\ \rho(\bw,b) = \blank{c} &&\text{(ii)}\\
\max\frac1{\|\bw\|}\ &\iff\ \min\frac12\|\bw\|^2. &&\text{(iii)}
\end{aligned}$$
<p>Par (i), changer d'échelle ne change ni la frontière ni la marge : on peut imposer (ii). (iii) vient de la décroissance de $t\mapsto1/t$ et de la croissance de $t\mapsto\frac12t^2$ sur $(0,\infty)$. Enfin, « $\min = 1$ » peut être remplacé par « $\ge1$ pour tout $i$ », car un optimum vérifie toujours le minimum avec [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda`, 'lambda', 'λ'], tex: R`\lambda` },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: [R`\frac{1}{\|w\|}`, '1/||w||', '1/‖w‖'], tex: R`\frac1{\|\bw\|}` },
      d: { kind: 'word', ans: ['egalite', 'égalité', 'equality'], tex: 'égalité' },
    } },

  { id: 'sv3', ch: 3, type: 'def', title: 'Lagrangien et problème dual', src: 'Slides p.14–17',
    text: R`<p class="hyp"><b>Cadre.</b> Problème primal $\min_\bx L(\bx)$ sous $g_i(\bx)\le0$, $i = 1,\dots,m$ ; valeur optimale $p^*$.</p>
<p><b>Définition.</b>
$$\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx)+\sum_i\lambda_ig_i(\bx),\quad\lambda_i\,\blank{a};\qquad D(\boldsymbol\lambda) = \blank{b};\qquad d^* = \max_{\boldsymbol\lambda\ge0}D(\boldsymbol\lambda).$$
On a toujours $d^*\le p^*$ (dualité [[c]]) ; si $d^* = p^*$, la dualité est [[d]].</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['>=0', R`\ge0`, '≥0', R`\geq 0`], tex: R`\ge0` },
      b: { kind: 'expr', ans: [R`\min_x\mathfrak L(x,\lambda)`, 'min_x L(x,lambda)', R`\min_x\mathcal L(x,\lambda)`, 'min_x L(x,λ)', R`\inf_x\mathfrak L(x,\lambda)`, 'inf_x L(x,lambda)'], tex: R`\min_\bx\mathfrak L(\bx,\boldsymbol\lambda)` },
      c: { kind: 'word', ans: ['faible', 'weak'], tex: 'faible' },
      d: { kind: 'word', ans: ['forte', 'strong'], tex: 'forte' },
    } },

  { id: 'd3a', ch: 3, type: 'deriv', title: 'Le Lagrangien est une relaxation de l\'objectif', src: 'Chapitre 3, §3',
    text: R`<p class="hyp"><b>Cadre.</b> Primal $\min L(\bx)$ sous $g_i(\bx)\le0$ ; Lagrangien $\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx)+\sum_i\lambda_ig_i(\bx)$ ; objectif pénalisé $J(\bx) = L(\bx)$ si toutes les contraintes sont satisfaites, $+\infty$ sinon.</p>
<p class="claim"><b>Proposition.</b> $J(\bx) = \max_{\boldsymbol\lambda\ge0}\mathfrak L(\bx,\boldsymbol\lambda)$ ; en particulier $\mathfrak L(\bx,\boldsymbol\lambda)\le J(\bx)$ pour tout $\boldsymbol\lambda\ge0$.</p>
<p><b>Preuve.</b> Les $\lambda_i$ sont indépendants, donc $\max_{\boldsymbol\lambda\ge0}\mathfrak L = L(\bx)+\sum_i\max_{\lambda_i\ge0}\lambda_ig_i(\bx)$, et</p>
$$\begin{aligned}
g_i(\bx)\le0:\quad\max_{\lambda_i\ge0}\lambda_ig_i(\bx) &= 0,\ \text{atteint en } \lambda_i = \blank{a} &&\text{(i)}\\
g_i(\bx)>0:\quad\max_{\lambda_i\ge0}\lambda_ig_i(\bx) &= \blank{b}\quad(\lambda_i\to\infty) &&\text{(ii)}
\end{aligned}$$
<p>On retrouve exactement $J$. Un maximum est supérieur à chaque valeur, donc $\mathfrak L(\bx,\boldsymbol\lambda)\,\blank{c}\,J(\bx)$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`+\infty`, 'infinity', '+inf', 'inf', '∞', R`\infty`], tex: R`+\infty` },
      c: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
    } },

  { id: 'sv4', ch: 3, type: 'deriv', title: 'L\'inégalité minimax (dualité faible)', src: 'Slides p.18–19',
    text: R`<p class="hyp"><b>Cadre.</b> $\rho(x,y)$ une fonction de deux variables (pour lesquelles les min et max existent).</p>
<p class="claim"><b>Proposition.</b> $\max_y\min_x\rho(x,y)\le\min_x\max_y\rho(x,y)$. Appliquée au Lagrangien, elle donne $d^*\le p^*$.</p>
<p><b>Preuve.</b> Posons $\psi(y) = \min_{x'}\rho(x',y)$.</p>
$$\begin{aligned}
\forall x,y:\quad\psi(y) &\,\blank{a}\,\rho(x,y) &&\text{(i)}\\
\forall x:\quad\max_y\psi(y) &\le\blank{b} &&\text{(ii)}\\
\max_y\min_x\rho(x,y) &\le\min_x\max_y\rho(x,y). &&\text{(iii)}
\end{aligned}$$
<p>(i) : un minimum est inférieur à chacune des valeurs. (ii) : on prend le max en $y$ des deux côtés. (iii) : le membre de gauche ne dépend pas de $x$, on peut donc prendre le [[c]] en $x$ à droite. Avec $\rho = \mathfrak L$, $\max_{\boldsymbol\lambda}\mathfrak L = J$ et $\min_\bx J = p^*$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['<=', R`\le`, '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: [R`\max_y\rho(x,y)`, 'max_y rho(x,y)', 'max_y ρ(x,y)'], tex: R`\max_y\rho(x,y)` },
      c: { kind: 'word', ans: ['min', 'minimum'], tex: 'min' },
    } },

  { id: 'sv5', ch: 3, type: 'deriv', title: 'Contraintes d\'égalité : multiplicateur de signe quelconque', src: 'Slides p.21–22',
    text: R`<p class="hyp"><b>Cadre.</b> Une contrainte d'égalité $h(\bx) = 0$, écrite comme deux inégalités $h(\bx)\le0$ et $-h(\bx)\le0$, de multiplicateurs $\lambda_1,\lambda_2\ge0$.</p>
<p class="claim"><b>Proposition.</b> Dans le Lagrangien, la contrainte $h(\bx) = 0$ apparaît comme $\nu\,h(\bx)$ avec $\nu\in\R$ sans contrainte de signe.</p>
<p><b>Preuve.</b></p>
$$\lambda_1h(\bx)+\lambda_2\big(-h(\bx)\big) = (\blank{a})\,h(\bx) = \nu\,h(\bx).$$
<p>Quand $\lambda_1$ et $\lambda_2$ parcourent $[0,\infty)$, leur différence $\nu$ parcourt [[b]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda_1-\lambda_2`, 'lambda_1 - lambda_2', 'λ1-λ2', 'λ_1-λ_2'], tex: R`\lambda_1-\lambda_2` },
      b: { kind: 'word', ans: ['R', 'ℝ', 'tout R', 'tous les reels', 'les réels', 'reels', 'réels'], tex: R`tout $\R$` },
    } },

  { id: 'sv6', ch: 3, type: 'deriv', title: 'Le dual de la SVM à marge dure', src: 'Slides p.26–28 · HW3 P1.(2)',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Le dual est $\max_{\boldsymbol\alpha\ge0}\ \sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\bx_i\T\bx_j$ sous $\sum_i\alpha_iy_i = 0$, et $\bw^* = \sum_i\alpha_i^*y_i\bx_i$.</p>
<p><b>Preuve.</b> Lagrangien, $\alpha_i\ge0$ : $\mathfrak L = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$.</p>
$$\begin{aligned}
\nabla_\bw\mathfrak L &= \bw-\blank{a} = 0 &&\text{(i)}\\
\frac{\partial\mathfrak L}{\partial b} &= -\blank{b} = 0 &&\text{(ii)}\\
D(\boldsymbol\alpha) &= \tfrac12\|\bw\|^2-\textstyle\sum_i\alpha_iy_i\bw\T\bx_i+\sum_i\alpha_i = \tfrac12\|\bw\|^2-\|\bw\|^2+\sum_i\alpha_i &&\text{(iii)}\\
&= \textstyle\sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_j\,\blank{c}. &&\text{(iv)}
\end{aligned}$$
<p>Dans (iii), on a remplacé $\bw$ par (i) et le terme en $b$ disparaît grâce à (ii). Si $\sum_i\alpha_iy_i\ne0$, $\mathfrak L$ est affine en $b$ de pente non nulle et $D(\boldsymbol\alpha) = \blank{d}$ : d'où la contrainte d'égalité du dual. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sum_i\alpha_iy_ix_i`, 'sum_i alpha_i y_i x_i', 'Σα_i y_i x_i', R`\sum_{i=1}^N\alpha_iy_ix_i`, 'sum alpha_i y_i x_i'], tex: R`\sum_i\alpha_iy_i\bx_i` },
      b: { kind: 'expr', ans: [R`\sum_i\alpha_iy_i`, 'sum_i alpha_i y_i', 'Σα_i y_i', R`\sum_{i=1}^N\alpha_iy_i`, 'sum alpha_i y_i'], tex: R`\sum_i\alpha_iy_i` },
      c: { kind: 'expr', ans: [R`y_iy_jx_i^\top x_j`, 'y_i y_j x_i^T x_j', 'y_i y_j x_iᵀx_j'], tex: R`y_iy_j\bx_i\T\bx_j` },
      d: { kind: 'expr', ans: [R`-\infty`, '-inf', '-infinity', '-∞'], tex: R`-\infty` },
    } },

  { id: 'sv7', ch: 3, type: 'deriv', title: 'Vecteurs de support et calcul du biais', src: 'Slides p.29–30 · HW3 P1.(3)',
    text: CADRE + R`<p class="hyp">Soient $(\bw^*,b^*)$ et $\boldsymbol\alpha^*$ des solutions primale et duale ; on admet la complémentarité $\alpha_i^*\big(1-y_i(\bw^{*\top}\bx_i+b^*)\big) = 0$ pour tout $i$.</p>
<p class="claim"><b>Proposition.</b> Si $\alpha_s^*>0$, alors $\bx_s$ est sur le bord de la marge et $b^* = y_s-\bw^{*\top}\bx_s$. Si $y_if(\bx_i)>1$, alors $\alpha_i^* = 0$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\alpha_s^*>0\ &\Longrightarrow\ 1-y_s(\bw^{*\top}\bx_s+b^*) = \blank{a} &&\text{(i)}\\
&\Longrightarrow\ \bw^{*\top}\bx_s+b^* = y_s &&\text{(ii)}\\
y_if(\bx_i)>1\ &\Longrightarrow\ 1-y_if(\bx_i)\ne0\ \Longrightarrow\ \alpha_i^* = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : on multiplie (i) par $y_s$ et on utilise $y_s^2 = \blank{c}$. Les points avec $\alpha_i^*>0$ sont les [[d]] ; seuls eux interviennent dans $\bw^* = \sum_i\alpha_i^*y_i\bx_i$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'num', ans: 1, tol: 0 },
      d: { kind: 'word', ans: ['vecteurs de support', 'vecteur de support', 'support vectors', 'vecteurs supports'], tex: 'vecteurs de support' },
    } },

  { id: 'sv8', ch: 3, type: 'deriv', title: 'Marge souple : la contrainte de boîte $0\\le\\alpha_i\\le C$', src: 'Slides p.32–35',
    text: R`<p class="hyp"><b>Cadre.</b> SVM à marge souple : $\min_{\bw,b,\boldsymbol\xi}\frac12\|\bw\|^2+C\sum_i\xi_i$ sous $y_i(\bw\T\bx_i+b)\ge1-\xi_i$ et $\xi_i\ge0$ ($C>0$). Multiplicateurs $\alpha_i\ge0$ (marge) et $\beta_i\ge0$ ($\xi_i\ge0$).</p>
<p class="claim"><b>Proposition.</b> Le dual est celui de la marge dure, avec en plus $\alpha_i\le C$.</p>
<p><b>Preuve.</b> $\mathfrak L = \frac12\|\bw\|^2+C\sum_i\xi_i+\sum_i\alpha_i\big(1-\xi_i-y_i(\bw\T\bx_i+b)\big)-\sum_i\beta_i\xi_i$.</p>
$$\begin{aligned}
\frac{\partial\mathfrak L}{\partial\xi_i} &= \blank{a} = 0 &&\text{(i)}\\
\beta_i\ge0\ &\Longrightarrow\ \alpha_i = C-\beta_i\le\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>Avec (i), les termes en $\xi_i$ disparaissent de $\mathfrak L$ ; les conditions en $\bw$ et $b$ sont celles de la marge dure. Le dual est donc identique, avec la contrainte $\blank{c}\le\alpha_i\le C$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`C-\alpha_i-\beta_i`, 'C - alpha_i - beta_i', 'C-α_i-β_i'], tex: R`C-\alpha_i-\beta_i` },
      b: { kind: 'expr', ans: ['C'], tex: 'C' },
      c: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'd3b', ch: 3, type: 'deriv', title: 'Écart optimal = hinge loss', src: 'Chapitre 3, §5 · HW3 P2.(1)',
    text: R`<p class="hyp"><b>Cadre.</b> SVM à marge souple : $\min_{\bw,b,\boldsymbol\xi}\frac12\|\bw\|^2+C\sum_i\xi_i$ sous $y_i(\bw\T\bx_i+b)\ge1-\xi_i$ et $\xi_i\ge0$, $C>0$. On note $t_i = y_i(\bw\T\bx_i+b)$.</p>
<p class="claim"><b>Proposition.</b> À $(\bw,b)$ fixés, $\xi_i^* = \max\{0,1-t_i\}$, et la SVM souple équivaut à $\min_{\bw,b}\frac12\|\bw\|^2+C\sum_i\max\{0,1-t_i\}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\xi_i\ge1-t_i\ \text{et}\ \xi_i\ge0\ &\iff\ \xi_i\ge\blank{a} &&\text{(i)}\\
\xi_i^* &= \max\{0,1-t_i\} &&\text{(ii)}
\end{aligned}$$
<p>Les contraintes sur les $\xi_i$ sont découplées. L'objectif contient $+C\xi_i$ avec $C>0$ : il est [[b]] en $\xi_i$, donc on prend le plus petit $\xi_i$ admissible, d'où (ii). En réinjectant, on obtient la somme des [[c]] losses. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\max\{0,1-t_i\}`, 'max(0,1-t_i)', 'max{0,1-t_i}', 'max(0, 1 - t_i)'], tex: R`\max\{0,1-t_i\}` },
      b: { kind: 'word', ans: ['croissant', 'strictement croissant', 'increasing'], tex: 'croissant' },
      c: { kind: 'word', ans: ['hinge', 'charniere', 'charnière'], tex: 'hinge' },
    } },

  { id: 'sv9', ch: 3, type: 'def', title: 'Noyaux (kernel trick)', src: 'Slides p.39–43',
    text: R`<p class="hyp"><b>Cadre.</b> SVM sur des features $\bphi(\bx)$ ; dans le dual, les données n'interviennent que par les produits scalaires $\bphi(\bx_i)\T\bphi(\bx_j)$.</p>
<p><b>Définition.</b> Un noyau est une fonction $\kappa(\bx,\bx') = \blank{a}$ qu'on sait calculer sans construire $\bphi$. La prédiction s'écrit
$$f(\bx) = \sum_i\alpha_iy_i\,\blank{b}+b.$$
Noyau RBF : $\kappa(\bx,\bx') = \exp\big(\blank{c}\big)$.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\phi(x)^\top\phi(x')`, "phi(x)^T phi(x')", "φ(x)ᵀφ(x')"], tex: R`\bphi(\bx)\T\bphi(\bx')` },
      b: { kind: 'expr', ans: [R`\kappa(x_i,x)`, 'k(x_i,x)', 'kappa(x_i,x)', 'κ(x_i,x)', R`\kappa(x,x_i)`], tex: R`\kappa(\bx_i,\bx)` },
      c: { kind: 'expr', ans: [R`-\frac{\|x-x'\|^2}{2\sigma^2}`, "-||x-x'||^2/(2 sigma^2)", "-‖x-x'‖²/(2σ²)", "-||x-x'||^2/(2σ^2)"], tex: R`-\frac{\|\bx-\bx'\|^2}{2\sigma^2}` },
    } },

  { id: 'd3c', ch: 3, type: 'deriv', title: 'Le noyau $(\\bx\\T\\bx\')^2$ est un produit scalaire', src: 'Chapitre 3, §6',
    text: R`<p class="hyp"><b>Cadre.</b> $\bx = (x_1,x_2)$, $\bx' = (x_1',x_2')$ dans $\R^2$ ; noyau polynomial $\kappa(\bx,\bx') = (\bx\T\bx')^2$.</p>
<p class="claim"><b>Proposition.</b> $\kappa(\bx,\bx') = \bphi(\bx)\T\bphi(\bx')$ avec $\bphi(\bx) = (x_1^2,\sqrt2x_1x_2,x_2^2)\in\R^3$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
(\bx\T\bx')^2 &= (x_1x_1'+x_2x_2')^2 = x_1^2x_1'^2+\blank{a}+x_2^2x_2'^2 &&\text{(i)}\\
&= (x_1^2,\ \blank{b},\ x_2^2)\cdot(x_1'^2,\ \sqrt2x_1'x_2',\ x_2'^2). &&\text{(ii)}
\end{aligned}$$
<p>Calculer $\kappa$ coûte $O(D)$, alors que $\bphi$ a $\binom{D+d-1}{d}$ coordonnées en degré $d$ : c'est le gain du kernel trick. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`2x_1x_2x_1'x_2'`, "2 x1 x2 x1' x2'", "2x_1x_1'x_2x_2'", "2x1x1'x2x2'"], tex: R`2x_1x_2x_1'x_2'` },
      b: { kind: 'expr', ans: [R`\sqrt{2}x_1x_2`, 'sqrt(2) x1 x2', 'sqrt2 x_1 x_2', R`\sqrt2x_1x_2`, '√2 x1 x2'], tex: R`\sqrt2\,x_1x_2` },
    } },

  { id: 'd3d', ch: 3, type: 'deriv', title: 'Le noyau RBF a des features de dimension infinie', src: 'Chapitre 3, §6 (slide 43)',
    text: R`<p class="hyp"><b>Cadre.</b> Noyau RBF en 1D : $\kappa(x,x') = e^{-(x-x')^2/2\sigma^2}$, $\sigma>0$.</p>
<p class="claim"><b>Proposition.</b> $\kappa(x,x') = \bphi(x)\T\bphi(x')$ avec $\bphi(x) = e^{-x^2/2\sigma^2}\Big(\frac{x^k}{\sqrt{k!}\,\sigma^k}\Big)_{k\ge0}$, de dimension infinie.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
e^{-(x-x')^2/2\sigma^2} &= e^{-x^2/2\sigma^2}\,e^{-x'^2/2\sigma^2}\,e^{\blank{a}} &&\text{(i)}\\
e^{xx'/\sigma^2} &= \sum_{k=0}^\infty\frac{(xx')^k}{\blank{b}} = \sum_{k=0}^\infty\frac{x^k}{\sqrt{k!}\,\sigma^k}\cdot\frac{x'^k}{\sqrt{k!}\,\sigma^k}. &&\text{(ii)}
\end{aligned}$$
<p>(i) vient de $(x-x')^2 = x^2-2xx'+x'^2$ ; (ii) est la série de [[c]] de l'exponentielle. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`xx'/\sigma^2`, "x x'/sigma^2", R`\frac{xx'}{\sigma^2}`, "xx'/σ^2"], tex: R`xx'/\sigma^2` },
      b: { kind: 'expr', ans: [R`k!\sigma^{2k}`, 'k! sigma^(2k)', 'k!σ^(2k)', R`k!\,\sigma^{2k}`], tex: R`k!\,\sigma^{2k}` },
      c: { kind: 'word', ans: ['taylor', 'taylor-maclaurin', 'maclaurin'], tex: 'Taylor' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'sv10', ch: 3, type: 'calc', title: 'Distance point–hyperplan', src: 'Slides p.4',
    gen: r => {
      const w = [[3, 4], [1, 1], [2, 0], [5, 12]][r.int(4)], b = r.int(5) - 2, x = [r.int(5) - 2, r.int(5) - 2];
      const fx = M.dot(w, x) + b, n = M.norm(w);
      return { text: R`<p class="hyp"><b>Données.</b> $\bw = (${w.join(', ')})$, $b = ${b}$, $\bx = (${x.join(', ')})$ ; $f(\bx) = \bw\T\bx+b$ et $\rho(\bx) = \frac{|f(\bx)|}{\|\bw\|}$.</p>
<p><b>Calcul.</b>
$$f(\bx) = \blank{a},\qquad\|\bw\| = \blank{b},\qquad\rho(\bx) = \blank{c}.$$</p>`,
        blanks: { a: { kind: 'num', ans: fx, tol: 0 }, b: { kind: 'num', ans: n }, c: { kind: 'num', ans: Math.abs(fx) / n } },
        solution: R`$f(\bx) = ${w[0]}\cdot${x[0]}+${w[1]}\cdot${x[1]}+${b} = ${fx}$.` };
    } },

  { id: 'sv11', ch: 3, type: 'calc', title: 'SVM en 1D à la main', src: 'Slides p.11',
    gen: r => {
      const p = r.int(3) - 2, q = p + 1 + r.int(3);
      const w = 2 / (q - p), b = -(q + p) / (q - p);
      return { text: R`<p class="hyp"><b>Données.</b> En 1D, $f(x) = wx+b$. Le négatif le plus proche est en $${p}$, le positif le plus proche en $${q}$ ; à l'optimum ils sont sur les bords de la marge : $w\cdot(${p})+b = -1$ et $w\cdot${q}+b = 1$.</p>
<p><b>Calcul.</b>
$$w = \blank{a},\qquad b = \blank{b},\qquad\text{marge } \frac1{|w|} = \blank{c}.$$</p>`,
        blanks: { a: { kind: 'num', ans: w }, b: { kind: 'num', ans: b }, c: { kind: 'num', ans: (q - p) / 2 } },
        solution: R`En soustrayant : $w(${q}-(${p})) = 2$ ; la frontière est au milieu, en $x = ${(p + q) / 2}$.` };
    } },

  { id: 'sv12', ch: 3, type: 'calc', title: 'Évaluer des noyaux', src: 'Slides p.40–43',
    gen: r => {
      const x = [r.int(3), r.int(3) - 1], y = [r.int(3) - 1, r.int(3)], s = [0.5, 1, 2][r.int(3)];
      const lin = M.dot(x, y), d2 = (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2;
      return { text: R`<p class="hyp"><b>Données.</b> $\bx = (${x.join(', ')})$, $\bx' = (${y.join(', ')})$, $\sigma = ${s}$.</p>
<p><b>Calcul.</b>
$$\begin{aligned}
\bx\T\bx' &= \blank{a},\qquad(\bx\T\bx')^2 = \blank{b}\\
\|\bx-\bx'\|^2 &= \blank{c},\qquad\exp\Big(-\frac{\|\bx-\bx'\|^2}{2\sigma^2}\Big) = \blank{d}
\end{aligned}$$</p>`,
        blanks: { a: { kind: 'num', ans: lin, tol: 0 }, b: { kind: 'num', ans: lin * lin, tol: 0 }, c: { kind: 'num', ans: d2, tol: 0 }, d: { kind: 'num', ans: Math.exp(-d2 / (2 * s * s)) } } };
    } },

  { id: 'sv13', ch: 3, type: 'calc', title: 'Dualité sur un petit problème', src: 'Hors slides', srcKind: 'extra',
    gen: r => {
      const a = 2 + r.int(3), c = r.int(2);
      return { text: R`<p class="hyp"><b>Données.</b> Primal $\min_x(x-${a})^2$ sous $x\le${c}$ ; Lagrangien $\mathfrak L(x,\lambda) = (x-${a})^2+\lambda(x-${c})$, $\lambda\ge0$.</p>
<p><b>Calcul.</b>
$$\begin{aligned}
\tfrac{\partial\mathfrak L}{\partial x} = 2(x-${a})+\lambda = 0\ &\Longrightarrow\ x(\lambda) = \blank{a}\\
D(\lambda) = \lambda(${a}-${c})-\tfrac{\lambda^2}{4}\ &\Longrightarrow\ \lambda^* = \blank{b},\quad d^* = \blank{c}
\end{aligned}$$
Le primal vaut $p^* = (${c}-${a})^2$ : la dualité est forte.</p>`,
        blanks: { a: { kind: 'expr', ans: [R`${a}-\lambda/2`, `${a} - lambda/2`, `${a}-λ/2`, R`${a}-\frac{\lambda}{2}`], tex: R`${a}-\frac\lambda2` }, b: { kind: 'num', ans: 2 * (a - c) }, c: { kind: 'num', ans: (a - c) ** 2 } } };
    } },
  );
})(window.ML);
