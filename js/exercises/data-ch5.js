/* Exercices — Chapitre 5 : réseaux de neurones (cadre explicite, trous dans les étapes) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  { id: 'nn1', ch: 5, type: 'deriv', title: 'Démo : XOR n\'est pas linéairement séparable', src: 'Slides p.5–8 (preuve hors slides)', srcKind: 'extra',
    text: R`<b>Cadre.</b> XOR sur $\{0,1\}^2$ : classe 1 en $(0,1)$ et $(1,0)$, classe 0 en $(0,0)$ et $(1,1)$. Un classifieur linéaire $f(\bx) = w_1x_1+w_2x_2+b$ prédit la classe 1 ssi $f(\bx)\ge0$. On suppose par l'absurde qu'il classe bien les 4 points.<br>
Classe 1 : $f(0,1) = \blank{a}\ge0$ et $f(1,0) = w_1+b\ge0$ ; en additionnant, $w_1+w_2+2b\ge0$. Classe 0 : $f(0,0) = \blank{b}\lt0$ et $f(1,1) = \blank{c}\lt0$ ; en additionnant, $w_1+w_2+2b\lt0$. Le même nombre ne peut pas être à la fois $\ge0$ et $\lt0$ : [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: ['w_2+b', 'w2+b', 'b+w_2'], tex: 'w_2+b' },
      b: { kind: 'expr', ans: ['b'], tex: 'b' },
      c: { kind: 'expr', ans: ['w_1+w_2+b', 'w1+w2+b'], tex: 'w_1+w_2+b' },
      d: { kind: 'word', ans: ['contradiction', 'absurde', 'impossible'], tex: 'contradiction' },
    },
    solution: R`Géométriquement : les deux diagonales du carré ont le même milieu, et $f$ affine y vaut la moyenne de ses valeurs aux extrémités.` },

  { id: 'nn2', ch: 5, type: 'deriv', title: 'Démo : XOR avec deux unités cachées', src: 'Slides p.9',
    text: R`<b>Cadre.</b> Entrées $\bx\in\{0,1\}^2$, $\mathrm{sign}(t) = +1$ si $t\ge0$, $-1$ sinon. Unités cachées $h_1 = \mathrm{sign}(x_1+x_2-0.5)$ et $h_2 = \mathrm{sign}(x_1+x_2-1.5)$ ; sortie $\hat y = \mathrm{sign}(\frac12h_1-\frac12h_2-\frac12)$.<br>
$h_1 = +1$ ssi au moins un bit vaut 1 : c'est un [[a]]. $h_2 = +1$ ssi les deux bits valent 1 : c'est un [[b]]. En $(0,1)$ : $h_1 = +1$, $h_2 = \blank{c}$, et $\hat y = \mathrm{sign}(\frac12+\frac12-\frac12) = +1$. En $(1,1)$ : $h_1 = h_2 = +1$ et $\hat y = \mathrm{sign}(\blank{d}) = -1$.`,
    blanks: {
      a: { kind: 'word', ans: ['OU', 'or', 'ou logique'], tex: 'OU' },
      b: { kind: 'word', ans: ['ET', 'and', 'et logique'], tex: 'ET' },
      c: { kind: 'num', ans: -1, tol: 0 },
      d: { kind: 'num', ans: -0.5, tol: 0 },
    } },

  { id: 'nn3', ch: 5, type: 'deriv', title: 'Démo : un ET de $K$ unités', src: 'Slides p.11',
    text: R`<b>Cadre.</b> $K$ unités cachées $h_i\in\{-1,+1\}$ (chacune teste un demi-plan) ; on veut une sortie $+1$ ssi <b>toutes</b> valent $+1$. Sortie proposée : $\mathrm{sign}\big(\sum_ih_i-(K-1)\big)$.<br>
Si $m$ unités valent $+1$ et $K-m$ valent $-1$ : $\sum_ih_i = m-(K-m) = \blank{a}$. Alors $\sum_ih_i-(K-1) = 2m-2K+1\ge0$ ssi $m\ge K-\frac12$, c'est-à-dire ssi $m = \blank{b}$. Pour un triangle ($K = 3$), le seuil vaut $K-1 = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['2m-K', '2m - K'], tex: '2m-K' },
      b: { kind: 'expr', ans: ['K'], tex: 'K' },
      c: { kind: 'num', ans: 2, tol: 0 },
    } },

  { id: 'nn4', ch: 5, type: 'def', title: 'Le perceptron multicouche', src: 'Slides p.15–16',
    text: R`<b>Cadre.</b> Un MLP à $L$ couches affines, d'entrée $\bx$, avec des activations $\varphi_\ell$ appliquées composante par composante.<br>
$\bh^{(0)} = \bx$ ; pour $\ell = 1,\dots,L$ : $\bz^{(\ell)} = \blank{a}$ ; $\bh^{(\ell)} = \varphi_\ell(\bz^{(\ell)})$ pour $\ell\lt L$ ; la sortie est $f_\theta(\bx) = \bz^{(L)}$ (les logits). Si $\bh^{(\ell-1)}\in\R^D$ et $\bz^{(\ell)}\in\R^H$, alors $W_\ell\in\R^{\blank{b}}$ et $\bb_\ell\in\R^H$. Un MLP à $L$ couches a [[c]] couches cachées.`,
    blanks: {
      a: { kind: 'expr', ans: [R`W_\ell h^{(\ell-1)}+b_\ell`, 'W_l h^(l-1) + b_l', R`W_{\ell}h^{(\ell-1)}+b_{\ell}`, 'W h + b'], tex: R`W_\ell\bh^{(\ell-1)}+\bb_\ell` },
      b: { kind: 'expr', ans: [R`H\times D`, 'H x D', 'HxD', 'H*D'], tex: R`H\times D` },
      c: { kind: 'word', ans: ['L-1', 'L − 1', 'L moins 1'], tex: '$L-1$' },
    } },

  { id: 'nn5', ch: 5, type: 'deriv', title: 'Démo : sans activation, un MLP reste affine', src: 'Slides p.15–17',
    text: R`<b>Cadre.</b> Deux couches affines sans activation : $\bh = W_1\bx+\bb_1$, puis $\bz = W_2\bh+\bb_2$.<br>
En remplaçant : $\bz = W_2(W_1\bx+\bb_1)+\bb_2 = \blank{a}\,\bx+\blank{b}$, une seule couche affine. Empiler des couches ne sert donc à rien sans [[c]]. On ne peut pas non plus utiliser $\mathrm{sign}$ : sa dérivée vaut $\blank{d}$ presque partout, et le gradient ne passerait pas.`,
    blanks: {
      a: { kind: 'expr', ans: ['W_2W_1', 'W2 W1', 'W_2 W_1'], tex: 'W_2W_1' },
      b: { kind: 'expr', ans: ['W_2b_1+b_2', 'W2 b1 + b2', 'W_2 b_1 + b_2'], tex: R`W_2\bb_1+\bb_2` },
      c: { kind: 'word', ans: ['activation non lineaire', 'activation non linéaire', 'non-linearite', 'non linéarité', 'activation', 'nonlinearity'], tex: 'activation non linéaire' },
      d: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'nn6', ch: 5, type: 'deriv', title: 'Démo : gradient de la BCE par rapport au logit', src: 'Slides p.23',
    text: R`<b>Cadre.</b> Classification binaire, $y\in\{0,1\}$, logit $z$, probabilité $p = \sigma(z)$ et perte $\ell = -y\log p-(1-y)\log(1-p)$.<br>
$\frac{\partial\ell}{\partial p} = -\frac yp+\blank{a}$ et $\frac{dp}{dz} = \blank{b}$. Règle de la chaîne : $\frac{\partial\ell}{\partial z} = \Big(-\frac yp+\frac{1-y}{1-p}\Big)p(1-p) = -y(1-p)+\blank{c} = p-y$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1-y}{1-p}`, '(1-y)/(1-p)'], tex: R`\frac{1-y}{1-p}` },
      b: { kind: 'expr', ans: ['p(1-p)', R`\sigma(z)(1-\sigma(z))`, 'sigma(z)(1-sigma(z))'], tex: 'p(1-p)' },
      c: { kind: 'expr', ans: ['(1-y)p', 'p(1-y)', 'p - yp'], tex: '(1-y)p' },
    } },

  { id: 'nn7', ch: 5, type: 'def', title: 'La softmax', src: 'Slides p.24',
    text: R`<b>Cadre.</b> $K$ classes, logits $\bz = (z_1,\dots,z_K)$ ; la softmax les transforme en probabilités $p_1,\dots,p_K$.<br>
$p_k = \blank{a}$ : chaque $p_k>0$ et $\sum_kp_k = 1$. Ajouter une même constante $c$ à tous les logits multiplie numérateur et dénominateur par $\blank{b}$ : les probabilités sont [[c]]. Avec une température $T>0$ (logits divisés par $T$), la classe la plus probable est [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{\exp(z_k)}{\sum_j\exp(z_j)}`, 'exp(z_k)/sum_j exp(z_j)', R`\frac{e^{z_k}}{\sum_je^{z_j}}`, 'e^(z_k)/sum_j e^(z_j)'], tex: R`\frac{e^{z_k}}{\sum_je^{z_j}}` },
      b: { kind: 'expr', ans: ['e^c', R`\exp(c)`, 'exp(c)'], tex: 'e^c' },
      c: { kind: 'word', ans: ['inchangés', 'inchanges', 'inchangées', 'les mêmes', 'unchanged', 'identiques'], tex: 'inchangées' },
      d: { kind: 'word', ans: ['inchangé', 'inchange', 'inchangee', 'la même', 'unchanged', 'identique'], tex: 'inchangée' },
    } },

  { id: 'nn8', ch: 5, type: 'deriv', title: 'Démo : softmax + cross-entropy, gradient $p_k-y_k$', src: 'Slides p.25–26',
    text: R`<b>Cadre.</b> Logits $\bz\in\R^K$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, bonne classe $y$, codage one-hot $y_k = \mathbb 1[k = y]$, perte $\ell = -\log p_y$.<br>
$\ell = -\log\frac{e^{z_y}}{\sum_je^{z_j}} = -z_y+\blank{a}$. La dérivée de $-z_y$ par rapport à $z_k$ vaut $-y_k$, et celle de $\log\sum_je^{z_j}$ vaut $\frac{e^{z_k}}{\sum_je^{z_j}} = \blank{b}$. Donc $\frac{\partial\ell}{\partial z_k} = p_k-y_k$ : le gradient est [[c]] sur la bonne classe ($p_y-1$) et positif sur les autres.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\log\sum_je^{z_j}`, 'log sum_j e^(z_j)', R`\log\sum_j\exp(z_j)`, 'log sum_j exp(z_j)'], tex: R`\log\sum_je^{z_j}` },
      b: { kind: 'expr', ans: ['p_k'], tex: 'p_k' },
      c: { kind: 'word', ans: ['negatif', 'négatif', 'negative'], tex: 'négatif' },
    } },

  { id: 'nn9', ch: 5, type: 'calc', title: 'Softmax et cross-entropy à la main', src: 'Slides p.24–25',
    gen: r => {
      const z = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = z.map(v => Math.exp(v)), S = M.sum(e), p = e.map(v => v / S), y = r.int(3);
      return { text: R`<b>Cadre.</b> Trois classes, logits $\bz = (${z.join(', ')})$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, bonne classe $y = ${y + 1}$, perte $\ell = -\log p_y$ et $\frac{\partial\ell}{\partial z_k} = p_k-\mathbb 1[k = y]$.<br>$\sum_je^{z_j} = \blank{a}$, $p_1 = \blank{b}$, $\ell = \blank{c}$, $\partial\ell/\partial z_{${y + 1}} = \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: S, tol: 0.01 }, b: { kind: 'num', ans: p[0], tol: 0.01 }, c: { kind: 'num', ans: -Math.log(p[y]), tol: 0.01 }, d: { kind: 'num', ans: p[y] - 1, tol: 0.01 } },
        solution: R`$\mathbf p = (${p.map(v => f(v, 3)).join(', ')})$ ; le gradient de la bonne classe vaut $p_y-1 = ${f(p[y] - 1)}$.` };
    } },

  { id: 'nn10', ch: 5, type: 'calc', title: 'Graphe de calcul de $f = (x+y)z$', src: 'Slides p.33–34',
    gen: r => {
      const x = r.int(7) - 3, y = r.int(7) - 3, z = r.int(7) - 3, q = x + y;
      return { text: R`<b>Cadre.</b> Graphe de calcul : un nœud « $+$ » calcule $q = x+y$, puis un nœud « $\times$ » calcule $f = qz$. Dérivées locales : $\frac{\partial f}{\partial q} = z$, $\frac{\partial f}{\partial z} = q$, $\frac{\partial q}{\partial x} = \frac{\partial q}{\partial y} = 1$. Valeurs $x = ${x}$, $y = ${y}$, $z = ${z}$.<br>Passe avant : $q = \blank{a}$, $f = \blank{b}$. Passe arrière : $\frac{\partial f}{\partial z} = \blank{c}$, $\frac{\partial f}{\partial x} = \frac{\partial f}{\partial q}\frac{\partial q}{\partial x} = \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: q, tol: 0 }, b: { kind: 'num', ans: q * z, tol: 0 }, c: { kind: 'num', ans: q, tol: 0 }, d: { kind: 'num', ans: z, tol: 0 } },
        solution: R`Le nœud $+$ transmet le gradient tel quel : $\partial f/\partial x = \partial f/\partial y = z = ${z}$.` };
    } },

  { id: 'nn11', ch: 5, type: 'deriv', title: 'Démo : rétropropagation dans une couche affine', src: 'Slides p.37',
    text: R`<b>Cadre.</b> Une couche $\bz = W\bh+\bb$ ($W\in\R^{H\times D}$) dans un réseau dont la perte scalaire est $\hL$. On connaît $\boldsymbol\delta = \partial\hL/\partial\bz\in\R^H$ (venu des couches suivantes).<br>
Composante par composante, $z_i = \sum_kW_{ik}h_k+b_i$, donc $\frac{\partial z_i}{\partial W_{ij}} = \blank{a}$ et $\frac{\partial\hL}{\partial W_{ij}} = \delta_ih_j$ : en matrice, $\frac{\partial\hL}{\partial W} = \boldsymbol\delta\bh\T$. De même $\frac{\partial z_i}{\partial b_i} = 1$, donc $\frac{\partial\hL}{\partial\bb} = \blank{b}$. Enfin $h_j$ intervient dans <b>tous</b> les $z_i$ : $\frac{\partial\hL}{\partial h_j} = \sum_i\delta_i\,\blank{c}$, soit $\frac{\partial\hL}{\partial\bh} = W\T\boldsymbol\delta$.`,
    blanks: {
      a: { kind: 'expr', ans: ['h_j'], tex: 'h_j' },
      b: { kind: 'expr', ans: [R`\delta`, 'delta', 'δ'], tex: R`\boldsymbol\delta` },
      c: { kind: 'expr', ans: ['W_{ij}', 'W_ij'], tex: 'W_{ij}' },
    } },

  { id: 'nn12', ch: 5, type: 'def', title: 'Rétropropagation : activations et branches', src: 'Slides p.36, 38',
    text: R`<b>Cadre.</b> Dans un graphe de calcul, on propage $\partial\hL/\partial(\cdot)$ de la sortie vers l'entrée avec des règles locales.<br>
Pour une activation $\bh = \varphi(\bz)$ appliquée composante par composante : $\frac{\partial\hL}{\partial\bz} = \frac{\partial\hL}{\partial\bh}\,\blank{a}\,\varphi'(\bz)$, un produit [[b]]. Si une variable atteint la perte par plusieurs chemins (branches), les contributions de chaque chemin s'[[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\odot`, 'odot', '⊙', '*'], tex: R`\odot` },
      b: { kind: 'word', ans: ['composante par composante', 'élément par élément', 'de hadamard', 'hadamard', 'elementwise', 'terme à terme'], tex: 'composante par composante (Hadamard)' },
      c: { kind: 'word', ans: ['additionnent', 'ajoutent', 'somment', 'add'], tex: 'additionnent' },
    } },

  { id: 'nn13', ch: 5, type: 'calc', title: 'Compter les paramètres d\'un MLP', src: 'Slides p.15–16',
    gen: r => {
      const d0 = 2 + r.int(3), d1 = 4 + 2 * r.int(4), d2 = r.int(2) ? 1 : 3;
      return { text: R`<b>Cadre.</b> MLP $${d0}\to${d1}\to${d2}$ : une couche cachée de $${d1}$ unités. Une couche qui passe de $D$ à $H$ dimensions a une matrice $W\in\R^{H\times D}$ et un biais $\bb\in\R^H$.<br>Poids de $W_1$ : $\blank{a}$ ; paramètres de la couche 1 (poids et biais) : $\blank{b}$ ; total du réseau : $\blank{c}$.`,
        blanks: { a: { kind: 'num', ans: d0 * d1, tol: 0 }, b: { kind: 'num', ans: d1 * (d0 + 1), tol: 0 }, c: { kind: 'num', ans: d1 * (d0 + 1) + d2 * (d1 + 1), tol: 0 } },
        solution: R`Couche $\ell$ : $d_\ell(d_{\ell-1}+1)$ paramètres. Total $${d1}\cdot${d0 + 1}+${d2}\cdot${d1 + 1} = ${d1 * (d0 + 1) + d2 * (d1 + 1)}$.` };
    } },

  { id: 'nn14', ch: 5, type: 'def', title: 'Mini-batchs et boucle d\'entraînement', src: 'Slides p.42–44',
    text: R`<b>Cadre.</b> Entraînement par descente de gradient stochastique sur $N$ exemples, par mini-batchs de taille $B$, en PyTorch.<br>
Une époque (un passage sur toutes les données) fait environ $\blank{a}$ mises à jour. Dans la boucle, <code>loss.backward()</code> exécute la [[b]] (calcul des gradients), et <code>optimizer.step()</code> applique la [[c]] des paramètres. <code>CrossEntropyLoss</code> doit recevoir des [[d]], pas des probabilités.`,
    blanks: {
      a: { kind: 'expr', ans: ['N/B', R`\frac{N}{B}`], tex: 'N/B' },
      b: { kind: 'word', ans: ['rétropropagation', 'retropropagation', 'backpropagation', 'passe arrière', 'differentiation automatique'], tex: 'rétropropagation' },
      c: { kind: 'word', ans: ['mise à jour', 'mise a jour', 'update', 'descente de gradient'], tex: 'mise à jour' },
      d: { kind: 'word', ans: ['logits', 'scores', 'scores de classe'], tex: 'logits' },
    } },
  );
})(window.ML);
