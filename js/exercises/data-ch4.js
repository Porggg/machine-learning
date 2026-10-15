/* Exercices — Chapitre 4 : généralisation et sélection de modèle, format « sujet d'examen » */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<p class="hyp"><b>Cadre.</b> Les exemples $(x,y)$ suivent une loi $P$ inconnue et $S = \{(x_i,y_i)\}_{i=1}^N\sim P^N$ (i.i.d.). Pour une perte $\ell\ge0$ et un prédicteur $f$ : $\hL_S(f) = \frac1N\sum_i\ell(y_i,f(x_i))$ (erreur empirique), $L(f) = \E_{(x,y)\sim P}[\ell(y,f(x))]$ (erreur de généralisation).</p>`;

  ML.EX.add(
  { id: 'ms1', ch: 4, type: 'def', title: 'Minimisation du risque empirique (ERM)', src: 'Slides p.4',
    text: R`<p class="hyp"><b>Cadre.</b> Un échantillon $S = \{(x_i,y_i)\}_{i=1}^N$, une perte $\ell(y,\hat y)\ge0$, un ensemble de prédicteurs $\mathcal H$.</p>
<p><b>Définition.</b> L'ERM choisit
$$\hat f\in\arg\min_{f\in\mathcal H}\hL_S(f),\qquad\hL_S(f) = \blank{a}.$$
L'ensemble $\mathcal H$ s'appelle la [[b]].</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac1N\sum_{i=1}^N\ell(y_i,f(x_i))`, '1/N sum_i l(y_i, f(x_i))', R`\frac{1}{N}\sum_i\ell(y_i,f(x_i))`, '1/N sum l(y_i,f(x_i))', '(1/N) Σ ℓ(y_i, f(x_i))'], tex: R`\frac1N\sum_{i=1}^N\ell\big(y_i,f(x_i)\big)` },
      b: { kind: 'word', ans: ['classe d\'hypothèses', 'classe d hypotheses', 'hypothesis class', 'classe d\'hypothese', 'classe de modèles', 'espace d hypotheses'], tex: 'classe d\'hypothèses' },
    } },

  { id: 'ms2', ch: 4, type: 'def', title: 'Erreur de généralisation', src: 'Slides p.5–6',
    text: R`<p class="hyp"><b>Cadre.</b> L'échantillon d'entraînement suit $S\sim P^N$ ; un nouvel exemple $(x,y)$ suit la même loi $P$ et est [[a]] de $S$.</p>
<p><b>Définition.</b> L'erreur de généralisation d'un prédicteur $f$ est
$$L(f) := \blank{b}.$$
Pour la perte 0-1 $\ell(y,\hat y) = \mathbb 1[\hat y\ne y]$, c'est la probabilité $L(f) = \Pr\big(\blank{c}\big)$.</p>`,
    blanks: {
      a: { kind: 'word', ans: ['indépendant', 'independant', 'independent'], tex: 'indépendant' },
      b: { kind: 'expr', ans: [R`\E_{(x,y)\sim P}[\ell(y,f(x))]`, R`\mathbb E_{(x,y)\sim P}[\ell(y,f(x))]`, 'E[l(y,f(x))]', 'E_{(x,y)~P}[l(y,f(x))]', R`\E[\ell(y,f(x))]`, 'E[ℓ(y,f(x))]'], tex: R`\E_{(x,y)\sim P}\big[\ell(y,f(x))\big]` },
      c: { kind: 'expr', ans: [R`f(x)\ne y`, 'f(x) != y', 'f(x)≠y', R`f(x)\neq y`, R`y\ne f(x)`, 'y != f(x)'], tex: R`f(x)\ne y` },
    } },

  { id: 'ms3', ch: 4, type: 'def', title: 'Écart de généralisation', src: 'Slides p.7',
    text: CADRE + R`<p><b>Définition.</b> Pour $\hat f$ appris sur $S$, l'écart de généralisation est
$$\blank{a}.$$
S'il est grand et positif, l'erreur d'entraînement est trop [[b]]. Un petit écart n'implique [[c]] une petite erreur de généralisation (un modèle trop simple a un petit écart mais deux erreurs élevées).</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)-\hL_S(\hat f)`, 'L(f)-L_S(f)', R`L(\hat f)-\hat L_S(\hat f)`, 'L(fhat) - Lhat_S(fhat)', R`L(\hat{f})-\hat{L}_S(\hat{f})`], tex: R`L(\hat f)-\hL_S(\hat f)` },
      b: { kind: 'word', ans: ['optimiste', 'optimistic', 'petite', 'basse'], tex: 'optimiste' },
      c: { kind: 'word', ans: ['pas', 'pas forcément', 'not'], tex: 'pas' },
    } },

  { id: 'ms4', ch: 4, type: 'deriv', title: 'Pour $f$ fixé, l\'erreur empirique est sans biais', src: 'Slides p.8',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Si $f$ ne dépend pas de $S$, alors $\E_S[\hL_S(f)] = L(f)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E_S[\hL_S(f)] &= \frac1N\sum_{i=1}^N\E\big[\blank{a}\big] &&\text{(i)}\\
&= \frac1N\sum_{i=1}^N\blank{b} = L(f). &&\text{(ii)}
\end{aligned}$$
<p>(i) vient de la [[c]] de l'espérance ; (ii) de ce que chaque $(x_i,y_i)$ suit $P$ et que $f$ est fixé. Pour $\hat f = A(S)$, l'argument tombe car $(x_i,y_i)$ et $\hat f$ ne sont pas [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\ell(y_i,f(x_i))`, 'l(y_i,f(x_i))', 'ℓ(y_i,f(x_i))'], tex: R`\ell(y_i,f(x_i))` },
      b: { kind: 'expr', ans: ['L(f)'], tex: 'L(f)' },
      c: { kind: 'word', ans: ['linearite', 'linéarité', 'linearity'], tex: 'linéarité' },
      d: { kind: 'word', ans: ['indépendants', 'independants', 'independent'], tex: 'indépendants' },
    } },

  { id: 'd4b', ch: 4, type: 'deriv', title: 'L\'erreur d\'entraînement de l\'ERM est optimiste', src: 'Chapitre 4, §2',
    text: CADRE + R`<p class="hyp">$\hat f\in\arg\min_{f\in\mathcal H}\hL_S(f)$ (ERM), et $f^*_{\mathcal H} = \arg\min_{f\in\mathcal H}L(f)$, qui ne dépend pas de $S$.</p>
<p class="claim"><b>Proposition.</b> $\E_S[\hL_S(\hat f)]\le L(f^*_{\mathcal H})\le\E_S[L(\hat f)]$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\hL_S(\hat f) &\le\blank{a} &&\text{(i)}\\
\E_S[\hL_S(\hat f)] &\le\E_S[\hL_S(f^*_{\mathcal H})] = \blank{b} &&\text{(ii)}\\
L(\hat f) &\ge L(f^*_{\mathcal H})\ \Longrightarrow\ \E_S[L(\hat f)]\ge L(f^*_{\mathcal H}). &&\text{(iii)}
\end{aligned}$$
<p>(i) : $\hat f$ minimise l'erreur empirique sur $\mathcal H$, et $f^*_{\mathcal H}\in\mathcal H$. (ii) : l'erreur empirique d'un prédicteur [[c]] est sans biais. (iii) : $\hat f\in\mathcal H$ et $f^*_{\mathcal H}$ minimise $L$ sur $\mathcal H$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\hat L_S(f^*_H)`, 'L_S(f*_H)', R`\hL_S(f^*_{\mathcal H})`, 'L_S(f*)', R`\hat L_S(f^*)`], tex: R`\hL_S(f^*_{\mathcal H})` },
      b: { kind: 'expr', ans: [R`L(f^*_H)`, 'L(f*_H)', R`L(f^*_{\mathcal H})`, 'L(f*)'], tex: R`L(f^*_{\mathcal H})` },
      c: { kind: 'word', ans: ['fixe', 'fixé', 'independant de s', 'fixed'], tex: 'fixé' },
    } },

  { id: 'd4c', ch: 4, type: 'deriv', title: '$\\E[\\text{MSE train}] = \\sigma^2(1-p/N)$', src: 'Chapitre 4, §2 (hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $\by = \bPhi\bw^\star+\boldsymbol\varepsilon$ avec $\bPhi\in\R^{N\times p}$ de rang $p$, $\E[\boldsymbol\varepsilon] = 0$, $\E[\boldsymbol\varepsilon\boldsymbol\varepsilon\T] = \sigma^2\bI$. $\bP = \bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T$ (projecteur sur l'espace colonne), MSE train $= \frac1N\|\by-\bP\by\|^2$. On admet $\E[\boldsymbol\varepsilon\T\mathbf A\boldsymbol\varepsilon] = \sigma^2\,\mathrm{tr}(\mathbf A)$.</p>
<p class="claim"><b>Proposition.</b> $\E[\text{MSE train}] = \sigma^2\big(1-\frac pN\big)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\by-\bP\by &= (\bI-\bP)(\bPhi\bw^\star+\boldsymbol\varepsilon) = (\bI-\bP)\boldsymbol\varepsilon &&\text{(i)}\\
\|(\bI-\bP)\boldsymbol\varepsilon\|^2 &= \boldsymbol\varepsilon\T(\bI-\bP)\T(\bI-\bP)\boldsymbol\varepsilon = \boldsymbol\varepsilon\T(\bI-\bP)\boldsymbol\varepsilon &&\text{(ii)}\\
\E\big[\boldsymbol\varepsilon\T(\bI-\bP)\boldsymbol\varepsilon\big] &= \sigma^2\,\mathrm{tr}(\bI-\bP) = \sigma^2\,(\blank{a}). &&\text{(iii)}
\end{aligned}$$
<p>(i) car $(\bI-\bP)\bPhi = \blank{b}$ : le projecteur laisse les colonnes de $\bPhi$ inchangées. (ii) car $\bI-\bP$ est un projecteur [[c]] ($\mathbf Q\T\mathbf Q = \mathbf Q$ pour $\mathbf Q = \bI-\bP$). (iii) car la trace d'un projecteur vaut sa dimension, et $\mathrm{tr}(\bP) = p$. On divise par $N$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['N-p', 'N - p'], tex: 'N-p' },
      b: { kind: 'expr', ans: ['0'], tex: '0' },
      c: { kind: 'word', ans: ['symetrique', 'symétrique', 'orthogonal', 'symmetric'], tex: 'symétrique' },
    } },

  { id: 'ms5', ch: 4, type: 'deriv', title: 'Une évaluation sur données indépendantes est sans biais', src: 'Slides p.9 · HW4 P1.(3)',
    text: CADRE + R`<p class="hyp">$\hat f = A(S)$ avec $A$ déterministe ; $S_{\text{eval}} = \{(\tilde x_j,\tilde y_j)\}_{j=1}^m\sim P^m$ indépendant de $S$ ; $\hL_{\text{eval}}(f) = \frac1m\sum_j\ell(\tilde y_j,f(\tilde x_j))$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[\hL_{\text{eval}}(\hat f)\big] = \E_S\big[L(\hat f)\big]$, et sachant $S$, $\Var\big(\hL_{\text{eval}}(\hat f)\big) = \frac{\Var(\ell)}m$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E\big[\hL_{\text{eval}}(\hat f)\mid S\big] &= \frac1m\sum_j\E\big[\ell(\tilde y_j,\hat f(\tilde x_j))\mid S\big] = \blank{a} &&\text{(i)}\\
\E\big[\hL_{\text{eval}}(\hat f)\big] &= \E\Big[\E\big[\hL_{\text{eval}}(\hat f)\mid S\big]\Big] = \blank{b} &&\text{(ii)}\\
\Var\big(\hL_{\text{eval}}(\hat f)\mid S\big) &= \frac1{m^2}\cdot m\cdot\Var(\ell) = \frac{\Var(\ell)}{\blank{c}}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : sachant $S$, $\hat f$ est fixé et chaque $(\tilde x_j,\tilde y_j)$ suit encore $P$ par [[d]]. (ii) : loi des espérances totales. (iii) : les $m$ termes sont i.i.d. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)`, 'L(fhat)', 'L(f)', R`L(\hat{f})`], tex: R`L(\hat f)` },
      b: { kind: 'expr', ans: [R`\E_S[L(\hat f)]`, 'E_S[L(fhat)]', R`E[L(\hat f)]`, 'E[L(f^)]', R`\E_S[L(A(S))]`, 'E_S[L(A(S))]'], tex: R`\E_S[L(\hat f)]` },
      c: { kind: 'expr', ans: ['m'], tex: 'm' },
      d: { kind: 'word', ans: ['independance', 'indépendance', 'independence'], tex: 'indépendance' },
    } },

  { id: 'ms6', ch: 4, type: 'def', title: 'Sous- et sur-apprentissage', src: 'Slides p.12–13',
    text: R`<p class="hyp"><b>Cadre.</b> On compare l'erreur d'entraînement (données vues) et l'erreur de généralisation (données neuves) d'un modèle appris.</p>
<p><b>Définitions.</b> [[a]] : le modèle manque une structure importante des données, les deux erreurs sont élevées. [[b]] : le modèle s'adapte aux fluctuations de l'échantillon, l'erreur d'entraînement est basse mais l'erreur de généralisation élevée. Le risque de sur-apprentissage dépend de la complexité du modèle, mais aussi de la [[c]] de l'échantillon et de la régularisation.</p>`,
    blanks: {
      a: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'Sous-apprentissage' },
      b: { kind: 'word', ans: ['sur-apprentissage', 'sur apprentissage', 'overfitting'], tex: 'Sur-apprentissage' },
      c: { kind: 'word', ans: ['taille', 'size', 'quantité'], tex: 'taille' },
    } },

  { id: 'ms7', ch: 4, type: 'def', title: 'ERM régularisé', src: 'Slides p.14',
    text: R`<p class="hyp"><b>Cadre.</b> Modèle paramétré $f_\bw$, erreur d'entraînement $\hL_{\text{train}}(f_\bw)$, pénalité $\Omega(\bw)\ge0$.</p>
<p><b>Définition.</b>
$$\hat\bw_\lambda\in\arg\min_\bw\big\{\hL_{\text{train}}(f_\bw)+\blank{a}\big\},\qquad\lambda\ge0.$$
Pour le ridge, $\Omega(\bw) = \blank{b}$. Un $\lambda$ trop grand écrase les coefficients et mène au [[c]].</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda\Omega(w)`, 'lambda Omega(w)', 'λΩ(w)', R`\lambda\,\Omega(w)`], tex: R`\lambda\,\Omega(\bw)` },
      b: { kind: 'expr', ans: [R`\|w\|^2`, '||w||^2', '‖w‖²', R`\|w\|_2^2`], tex: R`\|\bw\|^2` },
      c: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'sous-apprentissage' },
    } },

  { id: 'd4d', ch: 4, type: 'deriv', title: 'Classes emboîtées : l\'erreur d\'entraînement minimale décroît', src: 'Chapitre 4, §3 (slide 11)',
    text: R`<p class="hyp"><b>Cadre.</b> $\mathcal H_d$ = polynômes de degré $\le d$ ; $\hL_S$ = erreur d'entraînement sur un échantillon fixé $S$.</p>
<p class="claim"><b>Proposition.</b> $\min_{f\in\mathcal H_{d+1}}\hL_S(f)\le\min_{f\in\mathcal H_d}\hL_S(f)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
f\in\mathcal H_d\ &\Longrightarrow\ f\in\mathcal H_{d+1}\quad(\text{coefficient } w_{d+1} = \blank{a}) &&\text{(i)}\\
\mathcal H_d\subseteq\mathcal H_{d+1}\ &\Longrightarrow\ \min_{\mathcal H_{d+1}}\hL_S\ \blank{b}\ \min_{\mathcal H_d}\hL_S. &&\text{(ii)}
\end{aligned}$$
<p>(ii) : minimiser sur un ensemble plus grand ne peut que faire mieux. Rien de tel pour l'erreur de [[c]] : $\hat f_{d+1}$ est choisi pour coller à $S$, pas pour minimiser $L$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      c: { kind: 'word', ans: ['generalisation', 'généralisation', 'test', 'generalization'], tex: 'généralisation' },
    } },

  { id: 'ms8', ch: 4, type: 'def', title: 'Paramètres et hyperparamètres', src: 'Slides p.17',
    text: R`<p class="hyp"><b>Cadre.</b> Une méthode d'apprentissage a des quantités apprises sur l'entraînement et des réglages fixés avant.</p>
<p><b>Définitions.</b> En régression polynomiale, les coefficients $\bw$ sont des [[a]] (appris par minimisation) et le degré $d$ est un [[b]]. Pour une SVM à noyau RBF, $C$ et $\sigma$ sont des hyperparamètres. On choisit les hyperparamètres en comparant des erreurs mesurées sur des données de [[c]].</p>`,
    blanks: {
      a: { kind: 'word', ans: ['paramètres', 'parametres', 'parameters', 'paramètre'], tex: 'paramètres' },
      b: { kind: 'word', ans: ['hyperparamètre', 'hyperparametre', 'hyperparameter', 'hyper-paramètre'], tex: 'hyperparamètre' },
      c: { kind: 'word', ans: ['validation', 'validation croisee', 'validation croisée'], tex: 'validation' },
    } },

  { id: 'ms9', ch: 4, type: 'def', title: 'Sélection par un ensemble de validation', src: 'Slides p.18',
    text: R`<p class="hyp"><b>Cadre.</b> Les données sont découpées en $S_{\text{train}}$ et $S_{\text{val}}$ ; chaque hyperparamètre $\psi\in\Psi$ donne un modèle $\hat f_\psi$.</p>
<p><b>Définition.</b>
$$\hat f_\psi = \mathrm{Train}\big(\blank{a};\psi\big),\qquad\hat\psi\in\arg\min_{\psi\in\Psi}\blank{b}.$$
L'erreur de validation du modèle choisi [[c]] en moyenne son erreur de généralisation, car $S_{\text{val}}$ a servi à faire le choix.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`S_{\text{train}}`, 'S_train', 'S_{train}', 'Strain'], tex: R`S_{\text{train}}` },
      b: { kind: 'expr', ans: [R`\hL_{\text{val}}(\hat f_\psi)`, 'L_val(f_psi)', R`\hat L_{val}(\hat f_\psi)`, 'Lhat_val(fhat_psi)', 'L_val(fhat_psi)', R`\hat{L}_{\text{val}}(\hat{f}_\psi)`], tex: R`\hL_{\text{val}}(\hat f_\psi)` },
      c: { kind: 'word', ans: ['sous-estime', 'sous estime', 'underestimates', 'est inférieure à', 'minore'], tex: 'sous-estime' },
    } },

  { id: 'ms10', ch: 4, type: 'deriv', title: 'Le minimum des erreurs de validation est biaisé vers le bas', src: 'Slides p.19 (preuve hors slides) · HW4 P2.(3)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> On compare $K$ modèles ; $V_k$ est l'erreur de validation (aléatoire) du modèle $k$, d'espérance $L_k = \E[V_k]$. On annonce $\min_kV_k$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[\min_kV_k\big]\le\min_kL_k$ : l'erreur annoncée est optimiste en moyenne.</p>
<p><b>Preuve.</b> Soit $j$ quelconque.</p>
$$\begin{aligned}
\min_kV_k &\ \blank{a}\ V_j &&\text{(i)}\\
\E\big[\min_kV_k\big] &\le\E[V_j] = \blank{b} &&\text{(ii)}\\
\E\big[\min_kV_k\big] &\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : un minimum est inférieur à chacun des termes. (ii) : l'espérance est [[d]]. (iii) : (ii) vaut pour tout $j$, donc aussi pour le plus petit $L_j$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['<=', R`\le`, '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: ['L_j'], tex: 'L_j' },
      c: { kind: 'expr', ans: [R`\min_jL_j`, 'min_j L_j', R`\min_kL_k`, 'min_k L_k', 'min L_j'], tex: R`\min_jL_j` },
      d: { kind: 'word', ans: ['croissante', 'monotone', 'increasing'], tex: 'croissante' },
    } },

  { id: 'ms11', ch: 4, type: 'def', title: 'Entraînement, validation, test', src: 'Slides p.20–22',
    text: R`<p class="hyp"><b>Cadre.</b> Les données disponibles sont découpées en trois ensembles disjoints.</p>
<p><b>Définitions.</b> L'ensemble d'entraînement sert à ajuster les [[a]] ; l'ensemble de validation sert à choisir les [[b]] (le modèle) ; l'ensemble de test donne l'évaluation finale publiée. Le test doit être mis de côté [[c]] tout ajustement ou toute sélection, et ne servir qu'une fois.</p>`,
    blanks: {
      a: { kind: 'word', ans: ['paramètres', 'parametres', 'parameters', 'poids'], tex: 'paramètres' },
      b: { kind: 'word', ans: ['hyperparamètres', 'hyperparametres', 'hyperparameters'], tex: 'hyperparamètres' },
      c: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
    } },

  { id: 'ms12', ch: 4, type: 'def', title: 'Validation croisée à $K$ plis', src: 'Slides p.25–26',
    text: R`<p class="hyp"><b>Cadre.</b> $S_{\text{dev}}$ découpé en $K$ plis disjoints $S_1,\dots,S_K$ de même taille ; un hyperparamètre $\psi$ à évaluer.</p>
<p><b>Définition.</b>
$$\hat f_\psi^{(-k)} = \mathrm{Train}\big(\blank{a};\psi\big),\qquad\hL_{\text{CV}}(\psi) = \frac1K\sum_{k=1}^K\hL_{S_k}\big(\hat f_\psi^{(-k)}\big).$$
Chaque exemple sert $\blank{b}$ fois en validation et $\blank{c}$ fois en entraînement. Le cas $K = N$ s'appelle [[d]].</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`S_{\text{dev}}\setminus S_k`, R`S_{dev}\setminus S_k`, 'S_dev \\ S_k', 'S_dev - S_k', R`S_{\text{dev}}\backslash S_k`], tex: R`S_{\text{dev}}\setminus S_k` },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: ['K-1'], tex: 'K-1' },
      d: { kind: 'word', ans: ['leave-one-out', 'leave one out', 'loo', 'loocv'], tex: 'leave-one-out' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'ms13', ch: 4, type: 'calc', title: 'Optimisme des moindres carrés', src: 'Hors slides', srcKind: 'extra',
    gen: r => {
      const N = [20, 30, 40, 50][r.int(4)], p = [2, 4, 5, 10][r.int(4)], s2 = [0.04, 0.09, 0.25, 1][r.int(4)];
      return { text: R`<p class="hyp"><b>Données.</b> Moindres carrés, $p = ${p}$ paramètres, $N = ${N}$ points, bruit de variance $\sigma^2 = ${s2}$, vraie fonction dans la classe. On admet $\E[\text{MSE train}] = \sigma^2(1-p/N)$ et, aux mêmes entrées avec un bruit neuf, $\E[\text{MSE}] = \sigma^2(1+p/N)$.</p>
<p><b>Calcul.</b>
$$\E[\text{MSE train}] = \blank{a},\qquad\E[\text{MSE, bruit neuf}] = \blank{b},\qquad\text{écart} = \blank{c}.$$</p>`,
        blanks: { a: { kind: 'num', ans: s2 * (1 - p / N) }, b: { kind: 'num', ans: s2 * (1 + p / N) }, c: { kind: 'num', ans: 2 * s2 * p / N } },
        solution: R`L'écart vaut $2\sigma^2p/N$ : il grandit avec $p$ et diminue avec $N$.` };
    } },

  { id: 'ms14', ch: 4, type: 'calc', title: 'Précision d\'un ensemble de test', src: 'Slides p.9 (calcul hors slides)', srcKind: 'extra',
    gen: r => {
      const p = [0.1, 0.2, 0.3][r.int(3)], m = [100, 400, 2500][r.int(3)], sd = Math.sqrt(p * (1 - p) / m);
      return { text: R`<p class="hyp"><b>Données.</b> Vraie erreur $p = ${p}$, $m = ${m}$ exemples de test indépendants ; l'erreur de test a pour écart-type $\sqrt{p(1-p)/m}$.</p>
<p><b>Calcul.</b>
$$\text{écart-type} = \blank{a},\qquad\text{exemples nécessaires pour le diviser par 2 : } m' = \blank{b}.$$</p>`,
        blanks: { a: { kind: 'num', ans: sd, tol: 0.02 }, b: { kind: 'num', ans: 4 * m, tol: 0 } },
        solution: R`L'écart-type est en $1/\sqrt m$ : diviser par 2 demande 4 fois plus d'exemples.` };
    } },

  { id: 'ms15', ch: 4, type: 'calc', title: 'Coût de la validation croisée', src: 'Slides p.27',
    gen: r => {
      const K = [5, 10][r.int(2)], P = 3 + r.int(10), N = [50, 100, 200][r.int(3)];
      return { text: R`<p class="hyp"><b>Données.</b> $|\Psi| = ${P}$ candidats, $N = ${N}$ exemples de développement, validation croisée à $K = ${K}$ plis (un entraînement par pli et par candidat).</p>
<p><b>Calcul.</b>
$$\text{entraînements (sans le modèle final)} = \blank{a},\qquad\text{validation simple} = \blank{b},\qquad\text{taille d'un pli} = \blank{c}.$$</p>`,
        blanks: { a: { kind: 'num', ans: K * P, tol: 0 }, b: { kind: 'num', ans: P, tol: 0 }, c: { kind: 'num', ans: N / K, tol: 0 } } };
    } },
  );
})(window.ML);
