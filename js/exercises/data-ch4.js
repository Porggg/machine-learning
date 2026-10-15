/* Exercices — Chapitre 4 : généralisation et sélection de modèle (cadre explicite, trous dans les étapes) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const CADRE = R`<b>Cadre.</b> Les exemples $(x,y)$ suivent une loi $P$ inconnue ; $S = \{(x_i,y_i)\}_{i=1}^N\sim P^N$ (i.i.d.). Pour une perte $\ell$ et un prédicteur $f$ : erreur empirique $\hL_S(f) = \frac1N\sum_i\ell(y_i,f(x_i))$, erreur de généralisation $L(f) = \E_{(x,y)\sim P}[\ell(y,f(x))]$.<br>`;

  ML.EX.add(
  { id: 'ms1', ch: 4, type: 'def', title: 'Minimisation du risque empirique (ERM)', src: 'Slides p.4',
    text: R`<b>Cadre.</b> Un échantillon $S = \{(x_i,y_i)\}_{i=1}^N$, une perte $\ell(y,\hat y)\ge0$ et un ensemble de prédicteurs $\mathcal H$.<br>
L'ERM choisit $\hat f\in\arg\min_{f\in\mathcal H}\hL_S(f)$, où l'erreur empirique est $\hL_S(f) = \blank{a}$. L'ensemble $\mathcal H$ dans lequel on cherche s'appelle la [[b]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac1N\sum_{i=1}^N\ell(y_i,f(x_i))`, '1/N sum_i l(y_i, f(x_i))', R`\frac{1}{N}\sum_i\ell(y_i,f(x_i))`, '1/N sum l(y_i,f(x_i))', '(1/N) Σ ℓ(y_i, f(x_i))'], tex: R`\frac1N\sum_{i=1}^N\ell\big(y_i,f(x_i)\big)` },
      b: { kind: 'word', ans: ['classe d\'hypothèses', 'classe d hypotheses', 'hypothesis class', 'classe d\'hypothese', 'classe de modèles', 'espace d hypotheses'], tex: 'classe d\'hypothèses' },
    } },

  { id: 'ms2', ch: 4, type: 'def', title: 'Erreur de généralisation', src: 'Slides p.5–6',
    text: R`<b>Cadre.</b> Hypothèse statistique : l'échantillon d'entraînement suit $S\sim P^N$ et un nouvel exemple $(x,y)$ suit la même loi $P$.<br>
Le nouvel exemple est [[a]] de $S$. L'erreur de généralisation d'un prédicteur $f$ est $L(f) := \blank{b}$. Pour la perte 0-1 $\ell(y,\hat y) = \mathbb 1[\hat y\ne y]$, c'est la probabilité $L(f) = \Pr\big(\blank{c}\big)$.`,
    blanks: {
      a: { kind: 'word', ans: ['indépendant', 'independant', 'independent'], tex: 'indépendant' },
      b: { kind: 'expr', ans: [R`\E_{(x,y)\sim P}[\ell(y,f(x))]`, R`\mathbb E_{(x,y)\sim P}[\ell(y,f(x))]`, 'E[l(y,f(x))]', 'E_{(x,y)~P}[l(y,f(x))]', R`\E[\ell(y,f(x))]`, 'E[ℓ(y,f(x))]'], tex: R`\E_{(x,y)\sim P}\big[\ell(y,f(x))\big]` },
      c: { kind: 'expr', ans: [R`f(x)\ne y`, 'f(x) != y', 'f(x)≠y', R`f(x)\neq y`, R`y\ne f(x)`, 'y != f(x)'], tex: R`f(x)\ne y` },
    } },

  { id: 'ms3', ch: 4, type: 'def', title: 'Écart de généralisation', src: 'Slides p.7',
    text: CADRE + R`On apprend $\hat f$ à partir de $S$. L'écart de généralisation est $\blank{a}$. S'il est grand et positif, l'erreur d'entraînement est trop [[b]]. Un petit écart n'implique [[c]] une petite erreur de généralisation : un modèle trop simple a un petit écart mais deux erreurs élevées.`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)-\hL_S(\hat f)`, 'L(f)-L_S(f)', R`L(\hat f)-\hat L_S(\hat f)`, 'L(fhat) - Lhat_S(fhat)', R`L(\hat{f})-\hat{L}_S(\hat{f})`], tex: R`L(\hat f)-\hL_S(\hat f)` },
      b: { kind: 'word', ans: ['optimiste', 'optimistic', 'petite', 'basse'], tex: 'optimiste' },
      c: { kind: 'word', ans: ['pas', 'pas forcément', 'not'], tex: 'pas' },
    } },

  { id: 'ms4', ch: 4, type: 'deriv', title: 'Démo : pour $f$ fixé, l\'erreur empirique est sans biais', src: 'Slides p.8',
    text: CADRE + R`Soit $f$ un prédicteur choisi <b>sans regarder</b> $S$. Par [[a]] de l'espérance : $\E_S[\hL_S(f)] = \frac1N\sum_{i=1}^N\E\big[\blank{b}\big]$. Chaque $(x_i,y_i)$ suit $P$, donc chaque terme vaut $\blank{c}$, et $\E_S[\hL_S(f)] = L(f)$. Pour $\hat f$ appris sur $S$, l'argument tombe : $(x_i,y_i)$ et $\hat f$ ne sont pas [[d]].`,
    blanks: {
      a: { kind: 'word', ans: ['linearite', 'linéarité', 'linearity'], tex: 'linéarité' },
      b: { kind: 'expr', ans: [R`\ell(y_i,f(x_i))`, 'l(y_i,f(x_i))', 'ℓ(y_i,f(x_i))'], tex: R`\ell(y_i,f(x_i))` },
      c: { kind: 'expr', ans: ['L(f)'], tex: 'L(f)' },
      d: { kind: 'word', ans: ['indépendants', 'independants', 'independent'], tex: 'indépendants' },
    } },

  { id: 'ms5', ch: 4, type: 'deriv', title: 'Démo : une évaluation indépendante est sans biais', src: 'Slides p.9 · HW4 P1.(3)',
    text: CADRE + R`$\hat f = A(S)$ avec $A$ déterministe, et $S_{\text{eval}}\sim P^m$ indépendant de $S$, d'erreur $\hL_{\text{eval}}(f) = \frac1m\sum_{j=1}^m\ell(\tilde y_j,f(\tilde x_j))$. Sachant $S$, $\hat f$ est fixé et chaque $(\tilde x_j,\tilde y_j)$ suit encore $P$, donc $\E[\hL_{\text{eval}}(\hat f)\mid S] = \blank{a}$. Par la loi des espérances totales, $\E[\hL_{\text{eval}}(\hat f)] = \blank{b}$. Sachant $S$, c'est une moyenne de $m$ termes i.i.d., donc sa variance vaut $\Var(\ell)/\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)`, 'L(fhat)', 'L(f)', R`L(\hat{f})`], tex: R`L(\hat f)` },
      b: { kind: 'expr', ans: [R`\E_S[L(\hat f)]`, 'E_S[L(fhat)]', R`E[L(\hat f)]`, 'E[L(f^)]', R`\E_S[L(A(S))]`, 'E_S[L(A(S))]'], tex: R`\E_S[L(\hat f)]` },
      c: { kind: 'expr', ans: ['m'], tex: 'm' },
    } },

  { id: 'ms6', ch: 4, type: 'def', title: 'Sous- et sur-apprentissage', src: 'Slides p.12–13',
    text: R`<b>Cadre.</b> On compare l'erreur d'entraînement (sur les données vues) et l'erreur de généralisation (sur des données neuves) d'un modèle appris.<br>
[[a]] : le modèle manque une structure importante des données, les deux erreurs sont élevées. [[b]] : le modèle s'adapte aux fluctuations de l'échantillon, l'erreur d'entraînement est basse mais l'erreur de généralisation élevée. Le risque de sur-apprentissage dépend de la complexité du modèle, mais aussi de la [[c]] de l'échantillon et de la régularisation.`,
    blanks: {
      a: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'Sous-apprentissage' },
      b: { kind: 'word', ans: ['sur-apprentissage', 'sur apprentissage', 'overfitting'], tex: 'Sur-apprentissage' },
      c: { kind: 'word', ans: ['taille', 'size', 'quantité'], tex: 'taille' },
    } },

  { id: 'ms7', ch: 4, type: 'def', title: 'ERM régularisé', src: 'Slides p.14',
    text: R`<b>Cadre.</b> Modèle paramétré $f_\bw$, erreur d'entraînement $\hL_{\text{train}}(f_\bw)$, fonction de pénalité $\Omega(\bw)\ge0$.<br>
L'ERM régularisé choisit $\hat\bw_\lambda\in\arg\min_\bw\big\{\hL_{\text{train}}(f_\bw)+\blank{a}\big\}$ avec $\lambda\ge0$. Pour le ridge, $\Omega(\bw) = \blank{b}$. Un $\lambda$ trop grand écrase les coefficients et mène au [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda\Omega(w)`, 'lambda Omega(w)', 'λΩ(w)', R`\lambda\,\Omega(w)`], tex: R`\lambda\,\Omega(\bw)` },
      b: { kind: 'expr', ans: [R`\|w\|^2`, '||w||^2', '‖w‖²', R`\|w\|_2^2`], tex: R`\|\bw\|^2` },
      c: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'sous-apprentissage' },
    } },

  { id: 'ms8', ch: 4, type: 'def', title: 'Paramètres et hyperparamètres', src: 'Slides p.17',
    text: R`<b>Cadre.</b> Une méthode d'apprentissage a des quantités apprises sur les données d'entraînement, et des réglages fixés avant l'entraînement.<br>
En régression polynomiale, les coefficients $\bw$ sont des [[a]] (appris par minimisation) et le degré $d$ est un [[b]]. Pour une SVM à noyau RBF, $C$ et $\sigma$ sont des hyperparamètres. On choisit les hyperparamètres en comparant des erreurs mesurées sur des données de [[c]].`,
    blanks: {
      a: { kind: 'word', ans: ['paramètres', 'parametres', 'parameters', 'paramètre'], tex: 'paramètres' },
      b: { kind: 'word', ans: ['hyperparamètre', 'hyperparametre', 'hyperparameter', 'hyper-paramètre'], tex: 'hyperparamètre' },
      c: { kind: 'word', ans: ['validation', 'validation croisee', 'validation croisée'], tex: 'validation' },
    } },

  { id: 'ms9', ch: 4, type: 'def', title: 'Sélection par un ensemble de validation', src: 'Slides p.18',
    text: R`<b>Cadre.</b> On découpe les données en $S_{\text{train}}$ et $S_{\text{val}}$ ; chaque valeur d'hyperparamètre $\psi\in\Psi$ donne un modèle $\hat f_\psi$.<br>
On entraîne $\hat f_\psi$ sur $\blank{a}$, puis on choisit $\hat\psi\in\arg\min_{\psi\in\Psi}\blank{b}$. L'erreur de validation du modèle choisi [[c]] en moyenne son erreur de généralisation, car $S_{\text{val}}$ a servi à faire le choix.`,
    blanks: {
      a: { kind: 'expr', ans: [R`S_{\text{train}}`, 'S_train', 'S_{train}', 'Strain'], tex: R`S_{\text{train}}` },
      b: { kind: 'expr', ans: [R`\hL_{\text{val}}(\hat f_\psi)`, 'L_val(f_psi)', R`\hat L_{val}(\hat f_\psi)`, 'Lhat_val(fhat_psi)', 'L_val(fhat_psi)', R`\hat{L}_{\text{val}}(\hat{f}_\psi)`], tex: R`\hL_{\text{val}}(\hat f_\psi)` },
      c: { kind: 'word', ans: ['sous-estime', 'sous estime', 'underestimates', 'est inférieure à', 'minore'], tex: 'sous-estime' },
    } },

  { id: 'ms10', ch: 4, type: 'deriv', title: 'Démo : le minimum des erreurs de validation est biaisé vers le bas', src: 'Slides p.19 (preuve hors slides) · HW4 P2.(3)', srcKind: 'extra',
    text: R`<b>Cadre.</b> On compare $K$ modèles ; $V_k$ est l'erreur de validation (aléatoire) du modèle $k$, d'espérance $L_k = \E[V_k]$. On sélectionne le modèle de plus petite $V_k$ et on annonce $\min_kV_k$.<br>
Pour tout $j$, un minimum est inférieur à chacun des termes : $\min_kV_k\,\blank{a}\,V_j$. En prenant l'espérance : $\E[\min_kV_k]\le\blank{b}$ pour tout $j$. C'est vrai pour tout $j$, donc aussi pour le plus petit : $\E[\min_kV_k]\le\blank{c}$. L'erreur annoncée est optimiste en moyenne.`,
    blanks: {
      a: { kind: 'expr', ans: ['<=', R`\le`, '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: ['L_j', R`\E[V_j]`, 'E[V_j]'], tex: 'L_j' },
      c: { kind: 'expr', ans: [R`\min_jL_j`, 'min_j L_j', R`\min_kL_k`, 'min_k L_k', 'min L_j'], tex: R`\min_jL_j` },
    } },

  { id: 'ms11', ch: 4, type: 'def', title: 'Entraînement, validation, test', src: 'Slides p.20–22',
    text: R`<b>Cadre.</b> On découpe les données disponibles en trois ensembles disjoints, chacun avec un rôle.<br>
L'ensemble d'entraînement sert à ajuster les [[a]], l'ensemble de validation sert à choisir les [[b]] (le modèle), et l'ensemble de test donne l'évaluation finale publiée. Le test doit être mis de côté [[c]] tout ajustement ou toute sélection, et ne servir qu'une fois.`,
    blanks: {
      a: { kind: 'word', ans: ['paramètres', 'parametres', 'parameters', 'poids'], tex: 'paramètres' },
      b: { kind: 'word', ans: ['hyperparamètres', 'hyperparametres', 'hyperparameters'], tex: 'hyperparamètres' },
      c: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
    } },

  { id: 'ms12', ch: 4, type: 'def', title: 'Validation croisée à $K$ plis', src: 'Slides p.25–26',
    text: R`<b>Cadre.</b> Un ensemble de développement $S_{\text{dev}}$ découpé en $K$ plis disjoints $S_1,\dots,S_K$ de même taille ; un hyperparamètre $\psi$ à évaluer.<br>
Pour chaque $k$, on entraîne $\hat f_\psi^{(-k)}$ sur $\blank{a}$ et on mesure son erreur sur $S_k$. Le score est la moyenne $\hL_{\text{CV}}(\psi) = \frac1K\sum_k\hL_{S_k}\big(\hat f_\psi^{(-k)}\big)$. Chaque exemple sert $\blank{b}$ fois en validation et $\blank{c}$ fois en entraînement. Le cas $K = N$ s'appelle [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`S_{\text{dev}}\setminus S_k`, R`S_{dev}\setminus S_k`, 'S_dev \\ S_k', 'S_dev - S_k', R`S_{\text{dev}}\backslash S_k`], tex: R`S_{\text{dev}}\setminus S_k` },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: ['K-1'], tex: 'K-1' },
      d: { kind: 'word', ans: ['leave-one-out', 'leave one out', 'loo', 'loocv'], tex: 'leave-one-out' },
    } },

  { id: 'ms13', ch: 4, type: 'calc', title: 'Optimisme des moindres carrés', src: 'Hors slides', srcKind: 'extra',
    gen: r => {
      const N = [20, 30, 40, 50][r.int(4)], p = [2, 4, 5, 10][r.int(4)], s2 = [0.04, 0.09, 0.25, 1][r.int(4)];
      return { text: R`<b>Cadre.</b> Moindres carrés avec $p$ paramètres sur $N$ points, bruit de variance $\sigma^2$, vraie fonction dans la classe. On admet $\E[\text{MSE train}] = \sigma^2(1-p/N)$ et, aux mêmes entrées avec un bruit neuf, $\E[\text{MSE}] = \sigma^2(1+p/N)$. Ici $p = ${p}$, $N = ${N}$, $\sigma^2 = ${s2}$.<br>$\E[\text{MSE train}] = \blank{a}$, erreur sur bruit neuf $= \blank{b}$, écart $= \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: s2 * (1 - p / N) }, b: { kind: 'num', ans: s2 * (1 + p / N) }, c: { kind: 'num', ans: 2 * s2 * p / N } },
        solution: R`L'écart vaut $2\sigma^2p/N = ${f(2 * s2 * p / N)}$ : il grandit avec le nombre de paramètres et diminue avec $N$.` };
    } },

  { id: 'ms14', ch: 4, type: 'calc', title: 'Précision d\'un ensemble de test', src: 'Slides p.9 (calcul hors slides)', srcKind: 'extra',
    gen: r => {
      const p = [0.1, 0.2, 0.3][r.int(3)], m = [100, 400, 2500][r.int(3)], sd = Math.sqrt(p * (1 - p) / m);
      return { text: R`<b>Cadre.</b> Un classifieur a une vraie erreur $p = ${p}$. Sur $m$ exemples de test indépendants, le nombre d'erreurs suit une loi binomiale, et l'erreur de test a pour écart-type $\sqrt{p(1-p)/m}$. Ici $m = ${m}$.<br>Écart-type $= \blank{a}$. Pour le diviser par 2, il faut $m' = \blank{b}$ exemples.`,
        blanks: { a: { kind: 'num', ans: sd, tol: 0.02 }, b: { kind: 'num', ans: 4 * m, tol: 0 } },
        solution: R`L'écart-type est en $1/\sqrt m$ : diviser par 2 demande 4 fois plus d'exemples.` };
    } },

  { id: 'ms15', ch: 4, type: 'calc', title: 'Coût de la validation croisée', src: 'Slides p.27',
    gen: r => {
      const K = [5, 10][r.int(2)], P = 3 + r.int(10), N = [50, 100, 200][r.int(3)];
      return { text: R`<b>Cadre.</b> On compare $|\Psi| = ${P}$ candidats sur $N = ${N}$ exemples de développement, par validation croisée à $K = ${K}$ plis (un entraînement par pli et par candidat).<br>Nombre d'entraînements, sans compter le modèle final : $\blank{a}$, contre $\blank{b}$ pour une validation simple. Chaque pli contient $\blank{c}$ exemples.`,
        blanks: { a: { kind: 'num', ans: K * P, tol: 0 }, b: { kind: 'num', ans: P, tol: 0 }, c: { kind: 'num', ans: N / K, tol: 0 } },
        solution: R`$${K}\times${P} = ${K * P}$ entraînements ; un pli contient $N/K = ${N / K}$ exemples.` };
    } },
  );
})(window.ML);
