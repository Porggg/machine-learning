/* Exercices — Chapitre 4 : généralisation et sélection de modèle */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  { id: 'ms1', ch: 4, type: 'def', title: 'ERM et classe d\'hypothèses', src: 'Slides p.4',
    text: R`Étant donné $S = \{(x_i,y_i)\}_{i=1}^N$, la minimisation du risque empirique choisit $\hat f\in\argmin_{f\in\blank{a}}\hL_S(f)$ avec $\hL_S(f) = \blank{b}$. L'ensemble $\mathcal H$ s'appelle la [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mathcal H`, 'H'], tex: R`\mathcal H` },
      b: { kind: 'expr', ans: [R`\frac1N\sum_{i=1}^N\ell(y_i,f(x_i))`, '1/N sum_i l(y_i, f(x_i))', R`\frac{1}{N}\sum_i\ell(y_i,f(x_i))`, '1/N sum l(y_i,f(x_i))', '(1/N) Σ ℓ(y_i, f(x_i))'], tex: R`\frac1N\sum_{i=1}^N\ell\big(y_i,f(x_i)\big)` },
      c: { kind: 'word', ans: ['classe d\'hypothèses', 'classe d hypotheses', 'hypothesis class', 'classe d\'hypothese', 'classe de modèles'], tex: 'classe d\'hypothèses' },
    } },

  { id: 'ms2', ch: 4, type: 'def', title: 'Cadre i.i.d. et erreur de généralisation', src: 'Slides p.5–6',
    text: R`$S\sim\blank{a}$ et un nouvel exemple $(x,y)\sim P$, [[b]] de $S$. L'erreur de généralisation est $L(f) := \blank{c}$. Pour la perte 0-1, $L(f) = \Pr(\blank{d})$.`,
    blanks: {
      a: { kind: 'expr', ans: ['P^N', R`P^{N}`], tex: 'P^N' },
      b: { kind: 'word', ans: ['indépendant', 'independant', 'independent'], tex: 'indépendant' },
      c: { kind: 'expr', ans: [R`\E_{(x,y)\sim P}[\ell(y,f(x))]`, R`\mathbb E_{(x,y)\sim P}[\ell(y,f(x))]`, 'E[l(y,f(x))]', 'E_{(x,y)~P}[l(y,f(x))]', R`\E[\ell(y,f(x))]`, 'E[ℓ(y,f(x))]'], tex: R`\E_{(x,y)\sim P}\big[\ell(y,f(x))\big]` },
      d: { kind: 'expr', ans: [R`f(x)\ne y`, 'f(x) != y', 'f(x)≠y', R`f(x)\neq y`, R`y\ne f(x)`, 'y != f(x)'], tex: R`f(x)\ne y` },
    } },

  { id: 'ms3', ch: 4, type: 'def', title: 'Écart de généralisation', src: 'Slides p.7',
    text: R`L'écart de généralisation de $\hat f$ est $\blank{a}$. Un grand écart positif signifie que l'erreur d'entraînement est [[b]]. Un petit écart n'implique [[c]] une petite erreur de généralisation.`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)-\hL_S(\hat f)`, 'L(f)-L_S(f)', R`L(\hat f)-\hat L_S(\hat f)`, 'L(fhat) - Lhat_S(fhat)', R`L(\hat{f})-\hat{L}_S(\hat{f})`], tex: R`L(\hat f)-\hL_S(\hat f)` },
      b: { kind: 'word', ans: ['optimiste', 'optimistic', 'trop optimiste', 'biaisée vers le bas', 'sous-estimée'], tex: 'optimiste' },
      c: { kind: 'word', ans: ['pas', 'pas forcément', 'not'], tex: 'pas' },
    },
    solution: R`Un modèle trop simple (degré 0) a un petit écart mais deux erreurs élevées (sous-apprentissage).` },

  { id: 'ms4', ch: 4, type: 'deriv', title: 'Pourquoi l\'erreur empirique d\'un $f$ fixé est sans biais', src: 'Slides p.8',
    text: R`Si $f$ est choisi indépendamment de $S$ : $\E_S[\hL_S(f)] = \frac1N\sum_{i=1}^N\E\big[\blank{a}\big] = \frac1N\cdot N\cdot\blank{b} = L(f)$ (linéarité de l'espérance et même loi $P$). Pour $\hat f = A(S)$ cela échoue car $(x_i,y_i)$ et $\hat f$ ne sont pas [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\ell(y_i,f(x_i))`, 'l(y_i,f(x_i))', 'ℓ(y_i,f(x_i))'], tex: R`\ell(y_i,f(x_i))` },
      b: { kind: 'expr', ans: ['L(f)'], tex: 'L(f)' },
      c: { kind: 'word', ans: ['indépendants', 'independants', 'independent'], tex: 'indépendants' },
    } },

  { id: 'ms5', ch: 4, type: 'deriv', title: 'Évaluation sur données indépendantes', src: 'Slides p.9',
    text: R`$S\sim P^N$ et $S_{\text{eval}}\sim P^m$ indépendants, $\hat f = A(S)$. En conditionnant par $S$ : $\E[\hL_{\text{eval}}(\hat f)\mid S] = \blank{a}$, donc $\E_{S,S_{\text{eval}}}[\hL_{\text{eval}}(A(S))] = \blank{b}$. Sachant $S$, la variance de $\hL_{\text{eval}}$ vaut $\Var(\ell)/\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`L(\hat f)`, 'L(fhat)', 'L(f)', R`L(\hat{f})`], tex: R`L(\hat f)` },
      b: { kind: 'expr', ans: [R`\E_S[L(A(S))]`, 'E_S[L(A(S))]', 'E[L(A(S))]', R`\mathbb E_S[L(A(S))]`], tex: R`\E_S[L(A(S))]` },
      c: { kind: 'expr', ans: ['m'], tex: 'm' },
    } },

  { id: 'ms6', ch: 4, type: 'def', title: 'Sous- et sur-apprentissage', src: 'Slides p.12–13',
    text: R`Le [[a]] : le modèle manque une structure importante des données (erreurs d'entraînement et de généralisation élevées). Le [[b]] : le modèle s'adapte aux fluctuations de l'échantillon (erreur d'entraînement basse, généralisation élevée). Le sur-apprentissage dépend de la complexité, mais aussi de la [[c]] de l'échantillon et de la régularisation.`,
    blanks: {
      a: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'sous-apprentissage' },
      b: { kind: 'word', ans: ['sur-apprentissage', 'sur apprentissage', 'overfitting'], tex: 'sur-apprentissage' },
      c: { kind: 'word', ans: ['taille', 'size', 'quantité'], tex: 'taille' },
    } },

  { id: 'ms7', ch: 4, type: 'def', title: 'ERM régularisé', src: 'Slides p.14',
    text: R`$\hat\bw_\lambda\in\argmin_\bw\{\hL_{\text{train}}(f_\bw) + \blank{a}\}$ avec $\lambda\ge0$. Pour ridge, $\Omega(\bw) = \blank{b}$. Un $\lambda$ trop grand risque le [[c]]. Pour la SVM, un $C$ plus [[d]] met plus de poids sur l'ajustement aux données.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\lambda\Omega(w)`, 'lambda Omega(w)', 'λΩ(w)', R`\lambda\,\Omega(w)`], tex: R`\lambda\,\Omega(\bw)` },
      b: { kind: 'expr', ans: [R`\|w\|^2`, '||w||^2', '‖w‖²', R`\|w\|_2^2`], tex: R`\|\bw\|^2` },
      c: { kind: 'word', ans: ['sous-apprentissage', 'sous apprentissage', 'underfitting'], tex: 'sous-apprentissage' },
      d: { kind: 'word', ans: ['grand', 'large', 'élevé'], tex: 'grand' },
    } },

  { id: 'ms8', ch: 4, type: 'def', title: 'Paramètres vs hyperparamètres', src: 'Slides p.17',
    text: R`En régression polynomiale, les coefficients $\bw$ sont des [[a]] et le degré est un [[b]]. Pour une SVM à noyau RBF, $C$ et la largeur $\sigma$ sont des hyperparamètres, et les $\alpha_i$ du dual sont des [[a]]. Les hyperparamètres sont choisis par [[c]].`,
    blanks: {
      a: { kind: 'word', ans: ['paramètres', 'parametres', 'parameters', 'paramètre'], tex: 'paramètres' },
      b: { kind: 'word', ans: ['hyperparamètre', 'hyperparametre', 'hyperparameter', 'hyper-paramètre'], tex: 'hyperparamètre' },
      c: { kind: 'word', ans: ['validation', 'sélection de modèle', 'validation croisée', 'model selection', 'cross-validation'], tex: 'validation' },
    } },

  { id: 'ms9', ch: 4, type: 'def', title: 'Sélection par validation', src: 'Slides p.18',
    text: R`$\hat f_\psi = \mathrm{Train}(\blank{a};\psi)$ et $\hat\psi\in\argmin_{\psi\in\Psi}\blank{b}$. L'erreur de validation du modèle choisi [[c]] l'erreur de généralisation, car le modèle a été choisi avec ces données.`,
    blanks: {
      a: { kind: 'expr', ans: [R`S_{\text{train}}`, 'S_train', 'S_{train}', 'Strain'], tex: R`S_{\text{train}}` },
      b: { kind: 'expr', ans: [R`\hL_{\text{val}}(\hat f_\psi)`, 'L_val(f_psi)', R`\hat L_{val}(\hat f_\psi)`, 'Lhat_val(fhat_psi)', 'L_val(fhat_psi)', R`\hat{L}_{\text{val}}(\hat{f}_\psi)`], tex: R`\hL_{\text{val}}(\hat f_\psi)` },
      c: { kind: 'word', ans: ['sous-estime', 'sous estime', 'underestimates', 'est inférieure à'], tex: 'sous-estime' },
    } },

  { id: 'ms10', ch: 4, type: 'deriv', title: 'Le minimum est biaisé vers le bas', src: 'Slides p.19 (preuve hors slides)', srcKind: 'extra',
    text: R`Soient $V_k$ les erreurs de validation, $\E[V_k] = L_k$. Pour tout $j$ : $\min_kV_k\,\blank{a}\,V_j$, donc $\E[\min_kV_k]\le\blank{b}$ pour tout $j$, d'où $\E[\min_kV_k]\le\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['<=', R`\le`, '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: ['L_j', R`\E[V_j]`, 'E[V_j]'], tex: 'L_j' },
      c: { kind: 'expr', ans: [R`\min_jL_j`, 'min_j L_j', R`\min_kL_k`, 'min_k L_k', 'min L_j'], tex: R`\min_jL_j` },
    } },

  { id: 'ms11', ch: 4, type: 'def', title: 'Train / validation / test', src: 'Slides p.20–22',
    text: R`L'ensemble d'entraînement détermine les [[a]], la validation détermine le [[b]] (hyperparamètres), le test donne la [[c]] publiée. Le test doit être mis de côté [[d]] tout ajustement ou sélection.`,
    blanks: {
      a: { kind: 'word', ans: ['paramètres', 'parametres', 'parameters'], tex: 'paramètres' },
      b: { kind: 'word', ans: ['modèle', 'modele', 'model', 'choix du modèle'], tex: 'modèle' },
      c: { kind: 'word', ans: ['performance', 'erreur', 'évaluation', 'evaluation'], tex: 'performance' },
      d: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
    } },

  { id: 'ms12', ch: 4, type: 'def', title: 'Validation croisée à K plis', src: 'Slides p.25–26',
    text: R`On découpe $S_{\text{dev}}$ en $K$ plis $S_1,\dots,S_K$. $\hL_{\text{CV}}(\psi) = \blank{a}$ avec $\hat f_\psi^{(-k)} = \mathrm{Train}(\blank{b};\psi)$. Chaque exemple sert $\blank{c}$ fois en validation et $\blank{d}$ fois en entraînement. Le cas $K = N$ s'appelle [[e]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac1K\sum_{k=1}^K\hL_{S_k}(\hat f_\psi^{(-k)})`, '1/K sum_k L_{S_k}(f_psi^(-k))', R`\frac{1}{K}\sum_k\hat L_{S_k}(\hat f_\psi^{(-k)})`, '1/K sum_k Lhat_S_k(fhat_psi^(-k))'], tex: R`\frac1K\sum_{k=1}^K\hL_{S_k}\big(\hat f_\psi^{(-k)}\big)` },
      b: { kind: 'expr', ans: [R`S_{\text{dev}}\setminus S_k`, R`S_{dev}\setminus S_k`, 'S_dev \\ S_k', 'S_dev - S_k', R`S_{\text{dev}}\backslash S_k`], tex: R`S_{\text{dev}}\setminus S_k` },
      c: { kind: 'num', ans: 1, tol: 0 },
      d: { kind: 'expr', ans: ['K-1'], tex: 'K-1' },
      e: { kind: 'word', ans: ['leave-one-out', 'leave one out', 'loo', 'loocv'], tex: 'leave-one-out' },
    } },

  { id: 'ms13', ch: 4, type: 'calc', title: 'Optimisme des moindres carrés', src: 'Hors slides', srcKind: 'extra',
    gen: r => {
      const N = [20, 30, 40, 50][r.int(4)], p = [2, 4, 5, 10][r.int(4)], s2 = [0.04, 0.09, 0.25, 1][r.int(4)];
      return { text: R`Moindres carrés avec $p = ${p}$ paramètres, $N = ${N}$ points, bruit de variance $\sigma^2 = ${s2}$, vraie fonction dans la classe. $\E[\text{MSE train}] = \sigma^2(1-p/N) = \blank{a}$ et l'erreur aux mêmes entrées avec un nouveau bruit vaut $\sigma^2(1+p/N) = \blank{b}$. Écart : $\blank{c}$.`,
        blanks: { a: { kind: 'num', ans: s2 * (1 - p / N) }, b: { kind: 'num', ans: s2 * (1 + p / N) }, c: { kind: 'num', ans: 2 * s2 * p / N } },
        solution: R`$\tr(\bI-\bP) = N-p$ donne $${f(s2 * (1 - p / N))}$ ; l'écart vaut $2\sigma^2p/N = ${f(2 * s2 * p / N)}$.` };
    } },

  { id: 'ms14', ch: 4, type: 'calc', title: 'Précision d\'un ensemble de test', src: 'Slides p.9 (calcul hors slides)', srcKind: 'extra',
    gen: r => {
      const p = [0.1, 0.2, 0.3][r.int(3)], m = [100, 400, 2500][r.int(3)], sd = Math.sqrt(p * (1 - p) / m);
      return { text: R`Un classifieur a une vraie erreur $p = ${p}$. Sur $m = ${m}$ exemples de test, l'erreur de test a pour écart-type $\sqrt{p(1-p)/m} = \blank{a}$. Pour diviser cet écart-type par 2, il faut $m' = \blank{b}$ exemples.`,
        blanks: { a: { kind: 'num', ans: sd, tol: 0.02 }, b: { kind: 'num', ans: 4 * m, tol: 0 } },
        solution: R`$\sqrt{${p}\cdot${f(1 - p, 2)}/${m}} = ${f(sd)}$ ; l'écart-type est en $1/\sqrt m$, donc $m' = 4m = ${4 * m}$.` };
    } },

  { id: 'ms15', ch: 4, type: 'calc', title: 'Coût de la validation croisée', src: 'Slides p.27',
    gen: r => {
      const K = [5, 10][r.int(2)], P = 3 + r.int(10), N = [50, 100, 200][r.int(3)];
      return { text: R`On compare $|\Psi| = ${P}$ candidats sur $N = ${N}$ exemples de développement. La CV à $K = ${K}$ plis demande $\blank{a}$ entraînements (sans compter le modèle final), contre $\blank{b}$ pour une validation simple. Chaque pli contient $\blank{c}$ exemples.`,
        blanks: { a: { kind: 'num', ans: K * P, tol: 0 }, b: { kind: 'num', ans: P, tol: 0 }, c: { kind: 'num', ans: N / K, tol: 0 } },
        solution: R`$K$ entraînements par candidat : $${K}\times${P} = ${K * P}$ ; un pli = $N/K = ${N / K}$ exemples.` };
    } },
  );
})(window.ML);
