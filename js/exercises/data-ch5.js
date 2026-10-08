/* Exercices — Chapitre 5 : réseaux de neurones */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  { id: 'nn1', ch: 5, type: 'deriv', title: 'XOR n\'est pas linéairement séparable', src: 'Slides p.5–8 (preuve hors slides)', srcKind: 'extra',
    text: R`Supposons $f(\bx) = w_1x_1+w_2x_2+b$ correct sur XOR. Classe 1 : $f(0,1) = \blank{a}\ge0$ et $f(1,0)\ge0$, donc $w_1+w_2+2b\ge0$. Classe 0 : $f(0,0) = \blank{b}<0$ et $f(1,1)<0$, donc $w_1+w_2+2b\,\blank{c}\,0$ : contradiction.`,
    blanks: {
      a: { kind: 'expr', ans: ['w_2+b', 'w2+b', 'b+w_2'], tex: 'w_2+b' },
      b: { kind: 'expr', ans: ['b'], tex: 'b' },
      c: { kind: 'expr', ans: ['<'], tex: '<' },
    },
    solution: R`Les deux diagonales du carré ont le même milieu ; $f$ affine y prend la moyenne de ses valeurs aux extrémités.` },

  { id: 'nn2', ch: 5, type: 'def', title: 'XOR avec deux unités cachées', src: 'Slides p.9',
    text: R`$h_1(\bx) = \mathrm{sign}(x_1+x_2-0.5)$ calcule le [[a]], $h_2(\bx) = \mathrm{sign}(x_1+x_2-1.5)$ calcule le [[b]], et $\hat y = \mathrm{sign}(\tfrac12h_1-\tfrac12h_2-\blank{c})$. En $(0,1)$ : $h_1 = +1$, $h_2 = \blank{d}$.`,
    blanks: {
      a: { kind: 'word', ans: ['OU', 'or', 'ou logique'], tex: 'OU' },
      b: { kind: 'word', ans: ['ET', 'and', 'et logique'], tex: 'ET' },
      c: { kind: 'num', ans: 0.5, tol: 0 },
      d: { kind: 'num', ans: -1, tol: 0 },
    },
    solution: R`En $(0,1)$ : $\tfrac12+\tfrac12-\tfrac12 = \tfrac12>0$, donc $\hat y = +1$.` },

  { id: 'nn3', ch: 5, type: 'deriv', title: 'Un ET de K unités', src: 'Slides p.11',
    text: R`Avec $K$ unités $h_i\in\{-1,+1\}$ dont $m$ valent $+1$, $\sum_ih_i = \blank{a}$. La sortie $\mathrm{sign}\big(\sum_ih_i-(K-1)\big)$ vaut $+1$ ssi $m = \blank{b}$. Pour le triangle ($K = 3$), le seuil vaut $\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['2m-K', '2m - K', 'm-(K-m)'], tex: '2m-K' },
      b: { kind: 'expr', ans: ['K'], tex: 'K' },
      c: { kind: 'num', ans: 2, tol: 0 },
    } },

  { id: 'nn4', ch: 5, type: 'def', title: 'Perceptron multicouche', src: 'Slides p.15–16',
    text: R`$\bh^{(0)} = \bx$, $\bz^{(\ell)} = \blank{a}$, $\bh^{(\ell)} = \varphi_\ell(\bz^{(\ell)})$ pour $\ell = 1,\dots,L-1$, et $f_\theta(\bx) = \bz^{(L)}$. Si $\bh^{(\ell-1)}\in\R^D$ et $\bz^{(\ell)}\in\R^H$, alors $W_\ell\in\R^{\blank{b}}$. Un MLP à $L$ couches a [[c]] couches cachées.`,
    blanks: {
      a: { kind: 'expr', ans: [R`W_\ell h^{(\ell-1)}+b_\ell`, 'W_l h^(l-1) + b_l', R`W_{\ell}h^{(\ell-1)}+b_{\ell}`, 'W h + b'], tex: R`W_\ell\bh^{(\ell-1)}+\bb_\ell` },
      b: { kind: 'expr', ans: [R`H\times D`, 'H x D', 'HxD', 'H*D'], tex: R`H\times D` },
      c: { kind: 'word', ans: ['L-1', 'L − 1', 'L moins 1'], tex: '$L-1$' },
    } },

  { id: 'nn5', ch: 5, type: 'def', title: 'Pourquoi des activations non linéaires et lisses', src: 'Slides p.15–17',
    text: R`Sans activation, $W_2(W_1\bx+\bb_1)+\bb_2 = W'\bx+\bb'$ avec $W' = \blank{a}$ : le réseau resterait [[b]]. Avec sign, la dérivée vaut [[c]] presque partout : le gradient ne passe pas. La ReLU $\max\{0,z\}$ a pour dérivée 1 si $z>0$ et $\blank{d}$ si $z<0$.`,
    blanks: {
      a: { kind: 'expr', ans: ['W_2W_1', 'W2 W1', 'W_2 W_1'], tex: 'W_2W_1' },
      b: { kind: 'word', ans: ['linéaire', 'lineaire', 'affine', 'linear'], tex: 'affine (linéaire)' },
      c: { kind: 'word', ans: ['zéro', 'zero', '0', 'nulle'], tex: '0' },
      d: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'nn6', ch: 5, type: 'deriv', title: 'Gradient de la BCE', src: 'Slides p.23',
    text: R`$p = \sigma(z)$, $\ell = -y\log p-(1-y)\log(1-p)$. $\frac{\partial\ell}{\partial p} = -\frac yp+\blank{a}$ et $\frac{dp}{dz} = \blank{b}$, donc $\frac{\partial\ell}{\partial z} = \blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1-y}{1-p}`, '(1-y)/(1-p)'], tex: R`\frac{1-y}{1-p}` },
      b: { kind: 'expr', ans: ['p(1-p)', R`\sigma(z)(1-\sigma(z))`, 'sigma(z)(1-sigma(z))'], tex: 'p(1-p)' },
      c: { kind: 'expr', ans: ['p-y', 'p - y'], tex: 'p-y' },
    } },

  { id: 'nn7', ch: 5, type: 'def', title: 'Softmax', src: 'Slides p.24',
    text: R`$p_k = \blank{a}$. Ajouter une constante $c$ à tous les logits multiplie numérateur et dénominateur par [[b]], donc les $p_k$ sont [[c]]. Avec une température $T>0$, l'argmax est [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{\exp(z_k)}{\sum_j\exp(z_j)}`, 'exp(z_k)/sum_j exp(z_j)', R`\frac{e^{z_k}}{\sum_je^{z_j}}`, 'e^(z_k)/sum_j e^(z_j)'], tex: R`\frac{e^{z_k}}{\sum_je^{z_j}}` },
      b: { kind: 'expr', ans: ['e^c', R`\exp(c)`, 'exp(c)'], tex: 'e^c' },
      c: { kind: 'word', ans: ['inchangés', 'inchanges', 'inchangées', 'les mêmes', 'unchanged', 'identiques'], tex: 'inchangés' },
      d: { kind: 'word', ans: ['inchangé', 'inchange', 'le même', 'unchanged', 'identique'], tex: 'inchangé' },
    } },

  { id: 'nn8', ch: 5, type: 'deriv', title: 'Softmax + cross-entropy', src: 'Slides p.25–26',
    text: R`$\ell = -\log p_y = -z_y+\blank{a}$. Donc $\frac{\partial\ell}{\partial z_k} = -y_k+\blank{b} = \blank{c}$. La bonne classe reçoit un gradient [[d]], les autres un gradient positif.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\log\sum_je^{z_j}`, 'log sum_j e^(z_j)', R`\log\sum_j\exp(z_j)`, 'log sum_j exp(z_j)'], tex: R`\log\sum_je^{z_j}` },
      b: { kind: 'expr', ans: ['p_k'], tex: 'p_k' },
      c: { kind: 'expr', ans: ['p_k-y_k', 'p_k - y_k'], tex: 'p_k-y_k' },
      d: { kind: 'word', ans: ['négatif', 'negatif', 'negative', 'négatif (p_y − 1)'], tex: 'négatif ($p_y-1$)' },
    } },

  { id: 'nn9', ch: 5, type: 'calc', title: 'Softmax à la main', src: 'Slides p.24–25',
    gen: r => {
      const z = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = z.map(v => Math.exp(v)), S = M.sum(e), p = e.map(v => v / S), y = r.int(3);
      return { text: R`Logits $\bz = (${z.join(', ')})$, bonne classe $y = ${y + 1}$. Calculer $p_1 = \blank{a}$, $\ell_{\text{CE}} = -\log p_y = \blank{b}$ et $\partial\ell/\partial z_${y + 1} = \blank{c}$.`,
        blanks: { a: { kind: 'num', ans: p[0], tol: 0.01 }, b: { kind: 'num', ans: -Math.log(p[y]), tol: 0.01 }, c: { kind: 'num', ans: p[y] - 1, tol: 0.01 } },
        solution: R`$\sum_je^{z_j} = ${f(S)}$ ; $\mathbf p = (${p.map(v => f(v, 3)).join(', ')})$ ; $\ell = ${f(-Math.log(p[y]))}$ ; gradient de la bonne classe $p_y-1 = ${f(p[y] - 1)}$.` };
    } },

  { id: 'nn10', ch: 5, type: 'calc', title: 'Graphe de calcul $f = (x+y)z$', src: 'Slides p.33–34',
    gen: r => {
      const x = r.int(7) - 3, y = r.int(7) - 3, z = r.int(7) - 3, q = x + y;
      return { text: R`$x = ${x}$, $y = ${y}$, $z = ${z}$. Passe avant : $q = x+y = \blank{a}$, $f = \blank{b}$. Passe arrière : $\partial f/\partial x = \blank{c}$, $\partial f/\partial z = \blank{d}$.`,
        blanks: { a: { kind: 'num', ans: q, tol: 0 }, b: { kind: 'num', ans: q * z, tol: 0 }, c: { kind: 'num', ans: z, tol: 0 }, d: { kind: 'num', ans: q, tol: 0 } },
        solution: R`Nœud $\times$ : $\partial f/\partial q = z = ${z}$, $\partial f/\partial z = q = ${q}$ ; nœud $+$ : dérivée locale 1, donc $\partial f/\partial x = \partial f/\partial y = ${z}$.` };
    } },

  { id: 'nn11', ch: 5, type: 'deriv', title: 'Rétropropagation dans une couche affine', src: 'Slides p.37',
    text: R`$\bz = W\bh+\bb$, $\boldsymbol\delta = \partial\hL/\partial\bz$. Comme $z_i = \sum_kW_{ik}h_k+b_i$ : $\frac{\partial\hL}{\partial W_{ij}} = \blank{a}$, donc $\frac{\partial\hL}{\partial W} = \blank{b}$ ; $\frac{\partial\hL}{\partial\bb} = \blank{c}$ ; et $\frac{\partial\hL}{\partial h_j} = \sum_i\delta_iW_{ij}$, soit $\frac{\partial\hL}{\partial\bh} = \blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\delta_ih_j`, 'delta_i h_j', 'δ_i h_j'], tex: R`\delta_ih_j` },
      b: { kind: 'expr', ans: [R`\delta h^\top`, 'delta h^T', 'δ h^T', 'δhᵀ'], tex: R`\boldsymbol\delta\bh\T` },
      c: { kind: 'expr', ans: [R`\delta`, 'delta', 'δ'], tex: R`\boldsymbol\delta` },
      d: { kind: 'expr', ans: [R`W^\top\delta`, 'W^T delta', 'W^T δ', 'Wᵀδ'], tex: R`W\T\boldsymbol\delta` },
    } },

  { id: 'nn12', ch: 5, type: 'def', title: 'Activation et branches', src: 'Slides p.36, 38',
    text: R`Pour $\bh = \varphi(\bz)$ composante par composante : $\frac{\partial\hL}{\partial\bz} = \frac{\partial\hL}{\partial\bh}\,\blank{a}\,\varphi'(\bz)$ (produit [[b]]). Si $x$ atteint la perte par deux chemins $z_1,z_2$, les contributions s'[[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\odot`, 'odot', '⊙', '*'], tex: R`\odot` },
      b: { kind: 'word', ans: ['composante par composante', 'élément par élément', 'de hadamard', 'hadamard', 'elementwise', 'terme à terme'], tex: 'composante par composante' },
      c: { kind: 'word', ans: ['additionnent', 'ajoutent', 'somment', 'add'], tex: 'additionnent' },
    } },

  { id: 'nn13', ch: 5, type: 'calc', title: 'Compter les paramètres d\'un MLP', src: 'Slides p.15–16',
    gen: r => {
      const d0 = 2 + r.int(3), d1 = 4 + 2 * r.int(4), d2 = r.int(2) ? 1 : 3;
      return { text: R`MLP $${d0}\to${d1}\to${d2}$ (une couche cachée). Nombre de poids de $W_1$ : $\blank{a}$ ; nombre total de paramètres (poids et biais) : $\blank{b}$.`,
        blanks: { a: { kind: 'num', ans: d0 * d1, tol: 0 }, b: { kind: 'num', ans: d1 * (d0 + 1) + d2 * (d1 + 1), tol: 0 } },
        solution: R`Couche $\ell$ : $d_\ell(d_{\ell-1}+1)$ paramètres. Ici $${d1}\cdot${d0 + 1}+${d2}\cdot${d1 + 1} = ${d1 * (d0 + 1) + d2 * (d1 + 1)}$.` };
    } },

  { id: 'nn14', ch: 5, type: 'def', title: 'Mini-batchs et boucle d\'entraînement', src: 'Slides p.42–44',
    text: R`Avec $N$ exemples et des mini-batchs de taille $B$, une époque fait environ $\blank{a}$ mises à jour. Dans la boucle PyTorch, <code>loss.backward()</code> exécute la [[b]], et <code>optimizer.step()</code> applique la [[c]] des paramètres. <code>CrossEntropyLoss</code> doit recevoir des [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: ['N/B', R`\frac{N}{B}`], tex: 'N/B' },
      b: { kind: 'word', ans: ['rétropropagation', 'retropropagation', 'backpropagation', 'passe arrière', 'differentiation automatique'], tex: 'rétropropagation' },
      c: { kind: 'word', ans: ['mise à jour', 'mise a jour', 'update', 'descente de gradient'], tex: 'mise à jour' },
      d: { kind: 'word', ans: ['logits', 'scores', 'scores de classe'], tex: 'logits' },
    } },
  );
})(window.ML);
