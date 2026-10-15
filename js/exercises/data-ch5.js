/* Exercices — Chapitre 5 : réseaux de neurones, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.add(
  { id: 'nn1', ch: 5, type: 'deriv', title: 'XOR n\'est pas linéairement séparable', src: 'Slides p.5–8 (preuve hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> XOR sur $\{0,1\}^2$ : classe 1 en $(0,1)$ et $(1,0)$, classe 0 en $(0,0)$ et $(1,1)$. Un classifieur linéaire $f(\bx) = w_1x_1+w_2x_2+b$ prédit la classe 1 ssi $f(\bx)\ge0$.</p>
<p class="claim"><b>Proposition.</b> Aucun $(w_1,w_2,b)$ ne classe correctement les 4 points.</p>
<p><b>Preuve.</b> Par l'absurde, supposons les 4 points bien classés.</p>
$$\begin{aligned}
\text{classe 1 :}\quad f(0,1) = \blank{a}\ge0,\ \ f(1,0) = w_1+b\ge0\ &\Longrightarrow\ w_1+w_2+2b\ge0 &&\text{(i)}\\
\text{classe 0 :}\quad f(0,0) = \blank{b}\lt0,\ \ f(1,1) = \blank{c}\lt0\ &\Longrightarrow\ w_1+w_2+2b\lt0 &&\text{(ii)}
\end{aligned}$$
<p>On obtient (i) et (ii) en [[d]] les deux inégalités. Le même nombre ne peut pas être à la fois $\ge0$ et $\lt0$ : contradiction. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['w_2+b', 'w2+b', 'b+w_2'], tex: 'w_2+b' },
      b: { kind: 'expr', ans: ['b'], tex: 'b' },
      c: { kind: 'expr', ans: ['w_1+w_2+b', 'w1+w2+b'], tex: 'w_1+w_2+b' },
      d: { kind: 'word', ans: ['additionnant', 'sommant', 'ajoutant', 'adding'], tex: 'additionnant' },
    } },

  { id: 'nn2', ch: 5, type: 'deriv', title: 'XOR avec deux unités cachées', src: 'Slides p.9',
    text: R`<p class="hyp"><b>Cadre.</b> $\bx\in\{0,1\}^2$, $\mathrm{sign}(t) = +1$ si $t\ge0$ et $-1$ sinon. $h_1 = \mathrm{sign}(x_1+x_2-0.5)$, $h_2 = \mathrm{sign}(x_1+x_2-1.5)$, $\hat y = \mathrm{sign}\big(\frac12h_1-\frac12h_2-\frac12\big)$.</p>
<p class="claim"><b>Proposition.</b> $\hat y = +1$ exactement sur la classe 1 de XOR.</p>
<p><b>Preuve.</b> On vérifie les 4 coins :</p>
$$\begin{aligned}
(0,0):\ &h_1 = -1,\ h_2 = -1,\quad\tfrac12h_1-\tfrac12h_2-\tfrac12 = -\tfrac12\ \Longrightarrow\ \hat y = -1\\
(0,1),(1,0):\ &h_1 = +1,\ h_2 = \blank{a},\quad\tfrac12h_1-\tfrac12h_2-\tfrac12 = \blank{b}\ \Longrightarrow\ \hat y = +1\\
(1,1):\ &h_1 = +1,\ h_2 = +1,\quad\tfrac12h_1-\tfrac12h_2-\tfrac12 = \blank{c}\ \Longrightarrow\ \hat y = -1
\end{aligned}$$
<p>$h_1$ calcule un [[d]] logique, $h_2$ un [[e]] logique, et la sortie « OU mais pas ET ». $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: -1, tol: 0 },
      b: { kind: 'num', ans: 0.5, tol: 0 },
      c: { kind: 'num', ans: -0.5, tol: 0 },
      d: { kind: 'word', ans: ['OU', 'or', 'ou logique'], tex: 'OU' },
      e: { kind: 'word', ans: ['ET', 'and', 'et logique'], tex: 'ET' },
    } },

  { id: 'nn3', ch: 5, type: 'deriv', title: 'Un ET de $K$ unités cachées', src: 'Slides p.11',
    text: R`<p class="hyp"><b>Cadre.</b> $K$ unités cachées $h_i\in\{-1,+1\}$ ; sortie $\mathrm{sign}\big(\sum_ih_i-(K-1)\big)$.</p>
<p class="claim"><b>Proposition.</b> La sortie vaut $+1$ ssi toutes les unités valent $+1$ (c'est un ET).</p>
<p><b>Preuve.</b> Soit $m$ le nombre d'unités valant $+1$.</p>
$$\begin{aligned}
\textstyle\sum_ih_i &= m-(K-m) = \blank{a} &&\text{(i)}\\
\textstyle\sum_ih_i-(K-1) &= 2m-2K+1\ge0\ \iff\ m\ge K-\tfrac12\ \iff\ m = \blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>Pour un triangle ($K = 3$ demi-plans), le seuil vaut $K-1 = \blank{c}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['2m-K', '2m - K'], tex: '2m-K' },
      b: { kind: 'expr', ans: ['K'], tex: 'K' },
      c: { kind: 'num', ans: 2, tol: 0 },
    } },

  { id: 'nn15', ch: 5, type: 'deriv', title: 'Toute fonction booléenne à deux entrées avec 4 détecteurs', src: 'Slides p.12',
    text: R`<p class="hyp"><b>Cadre.</b> Pour chaque coin $(a,b)\in\{0,1\}^2$, un détecteur $h_{ab}(\bx) = \mathrm{sign}\big((2a-1)x_1-a+(2b-1)x_2-b+\frac12\big)$. Pour une fonction $f:\{0,1\}^2\to\{-1,+1\}$, on pose $w_{ab} = f(a,b)$, $b_{\text{out}} = \sum_{a,b}w_{ab}$ et $\hat y = \mathrm{sign}\big(\sum_{a,b}w_{ab}h_{ab}+b_{\text{out}}\big)$.</p>
<p class="claim"><b>Proposition.</b> En chaque coin, exactement un détecteur vaut $+1$, et $\hat y = f$.</p>
<p><b>Preuve.</b> Pour une coordonnée $a'\in\{0,1\}$ et $a\in\{0,1\}$ (donc $a^2 = a$) :</p>
$$\begin{aligned}
a' = a:\quad(2a-1)a-a &= 2a^2-2a = \blank{a} &&\text{(i)}\\
a' = 1-a:\quad(2a-1)(1-a)-a &= \blank{b} &&\text{(ii)}\\
\textstyle\sum_{(a',b')}w_{a'b'}h_{a'b'}+b_{\text{out}} &= w_{ab}-\textstyle\sum_{\text{autres}}w+\big(w_{ab}+\sum_{\text{autres}}w\big) = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>Par (i)–(ii), l'argument de $h_{ab}$ au coin $\bx$ vaut $\frac12-(\text{nombre de coordonnées différentes})$ : $+\frac12$ seulement au coin $(a,b)$, d'où un seul détecteur allumé. (iii) est calculé au coin $(a,b)$ ; son signe est celui de $w_{ab} = f(a,b)$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'num', ans: -1, tol: 0 },
      c: { kind: 'expr', ans: ['2w_{ab}', '2 w_ab', '2w_ab'], tex: '2w_{ab}' },
    } },

  { id: 'nn4', ch: 5, type: 'def', title: 'Le perceptron multicouche', src: 'Slides p.15–16',
    text: R`<p class="hyp"><b>Cadre.</b> MLP à $L$ couches affines, d'entrée $\bx$, avec des activations $\varphi_\ell$ appliquées composante par composante.</p>
<p><b>Définition.</b>
$$\bh^{(0)} = \bx,\qquad\bz^{(\ell)} = \blank{a},\qquad\bh^{(\ell)} = \varphi_\ell\big(\bz^{(\ell)}\big)\ (\ell\lt L),\qquad f_\theta(\bx) = \bz^{(L)}.$$
Si $\bh^{(\ell-1)}\in\R^D$ et $\bz^{(\ell)}\in\R^H$, alors $W_\ell\in\R^{\blank{b}}$. La sortie $\bz^{(L)}$ s'appelle les [[c]], et un MLP à $L$ couches a $L-1$ couches cachées.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`W_\ell h^{(\ell-1)}+b_\ell`, 'W_l h^(l-1) + b_l', R`W_{\ell}h^{(\ell-1)}+b_{\ell}`, 'W h + b'], tex: R`W_\ell\bh^{(\ell-1)}+\bb_\ell` },
      b: { kind: 'expr', ans: [R`H\times D`, 'H x D', 'HxD', 'H*D'], tex: R`H\times D` },
      c: { kind: 'word', ans: ['logits', 'scores', 'scores de classe'], tex: 'logits' },
    } },

  { id: 'nn5', ch: 5, type: 'deriv', title: 'Sans activation, un MLP reste affine ; nombre de paramètres', src: 'Slides p.15–17',
    text: R`<p class="hyp"><b>Cadre.</b> Couches affines $\bz^{(\ell)} = W_\ell\bh^{(\ell-1)}+\bb_\ell$ avec $W_\ell\in\R^{d_\ell\times d_{\ell-1}}$.</p>
<p class="claim"><b>Proposition.</b> Sans activation non linéaire, le réseau est une seule application affine. La couche $\ell$ a $d_\ell(d_{\ell-1}+1)$ paramètres.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
W_2(W_1\bx+\bb_1)+\bb_2 &= \blank{a}\,\bx+\blank{b} &&\text{(i)}\\
\#\text{paramètres de la couche } \ell &= \underbrace{d_\ell\,d_{\ell-1}}_{W_\ell}+\underbrace{\blank{c}}_{\bb_\ell}. &&\text{(ii)}
\end{aligned}$$
<p>Par (i) et par [[d]], $L$ couches affines composées restent affines : la frontière resterait un hyperplan et XOR impossible. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['W_2W_1', 'W2 W1', 'W_2 W_1'], tex: 'W_2W_1' },
      b: { kind: 'expr', ans: ['W_2b_1+b_2', 'W2 b1 + b2', 'W_2 b_1 + b_2'], tex: R`W_2\bb_1+\bb_2` },
      c: { kind: 'expr', ans: ['d_l', R`d_\ell`, 'd_ell'], tex: R`d_\ell` },
      d: { kind: 'word', ans: ['recurrence', 'récurrence', 'induction'], tex: 'récurrence' },
    } },

  { id: 'd5a', ch: 5, type: 'deriv', title: 'Dérivées des activations', src: 'Chapitre 5, §3',
    text: R`<p class="hyp"><b>Cadre.</b> $\sigma(z) = \frac1{1+e^{-z}}$, $\tanh z = \frac{e^z-e^{-z}}{e^z+e^{-z}}$, $\mathrm{ReLU}(z) = \max\{0,z\}$.</p>
<p class="claim"><b>Proposition.</b> $\sigma' = \sigma(1-\sigma)$, $\tanh z = 2\sigma(2z)-1$, $\tanh' = 1-\tanh^2$, et $\mathrm{ReLU}'(z) = \mathbb 1[z>0]$ ($z\ne0$).</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\sigma'(z) &= \frac{e^{-z}}{(1+e^{-z})^2} = \blank{a} &&\text{(i)}\\
\tanh z &= \frac{1-e^{-2z}}{1+e^{-2z}} = \frac{2}{1+e^{-2z}}-1 = 2\sigma(\blank{b})-1 &&\text{(ii)}\\
\tanh'(z) &= 4\sigma'(2z) = 4\sigma(2z)\big(1-\sigma(2z)\big) = \blank{c} &&\text{(iii)}
\end{aligned}$$
<p>(ii) : on divise numérateur et dénominateur par $e^z$. (iii) : avec $s = \sigma(2z)$, $\tanh = 2s-1$ et $1-(2s-1)^2 = 4s(1-s)$. La ReLU a pour dérivée $\blank{d}$ si $z>0$ et $0$ si $z\lt0$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sigma(z)(1-\sigma(z))`, 'sigma(z)(1-sigma(z))', 'σ(z)(1-σ(z))'], tex: R`\sigma(z)(1-\sigma(z))` },
      b: { kind: 'expr', ans: ['2z'], tex: '2z' },
      c: { kind: 'expr', ans: [R`1-\tanh^2z`, '1-tanh(z)^2', '1-tanh^2(z)', R`1-\tanh^2(z)`, '1 - tanh^2 z'], tex: R`1-\tanh^2z` },
      d: { kind: 'num', ans: 1, tol: 0 },
    } },

  { id: 'nn6', ch: 5, type: 'deriv', title: 'Gradient de la BCE par rapport au logit', src: 'Slides p.23',
    text: R`<p class="hyp"><b>Cadre.</b> $y\in\{0,1\}$, logit $z$, $p = \sigma(z)$, perte $\ell = -y\log p-(1-y)\log(1-p)$.</p>
<p class="claim"><b>Proposition.</b> $\frac{\partial\ell}{\partial z} = p-y$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\frac{\partial\ell}{\partial p} &= -\frac yp+\blank{a} &&\text{(i)}\\
\frac{dp}{dz} &= \blank{b} &&\text{(ii)}\\
\frac{\partial\ell}{\partial z} &= \Big(-\frac yp+\frac{1-y}{1-p}\Big)p(1-p) = -y(1-p)+\blank{c} = p-y. &&\text{(iii)}
\end{aligned}$$
<p>(iii) est la règle de la [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1-y}{1-p}`, '(1-y)/(1-p)'], tex: R`\frac{1-y}{1-p}` },
      b: { kind: 'expr', ans: ['p(1-p)', R`\sigma(z)(1-\sigma(z))`, 'sigma(z)(1-sigma(z))'], tex: 'p(1-p)' },
      c: { kind: 'expr', ans: ['(1-y)p', 'p(1-y)', 'p - yp'], tex: '(1-y)p' },
      d: { kind: 'word', ans: ['chaine', 'chaîne', 'chain rule', 'derivation en chaine'], tex: 'chaîne' },
    } },

  { id: 'nn7', ch: 5, type: 'deriv', title: 'Les propriétés de la softmax', src: 'Slides p.24',
    text: R`<p class="hyp"><b>Cadre.</b> Logits $\bz\in\R^K$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$ ; température $T>0$ : $p_k(T) = \frac{e^{z_k/T}}{\sum_je^{z_j/T}}$.</p>
<p class="claim"><b>Proposition.</b> $(p_k)$ est une loi de probabilité ; elle est invariante si l'on ajoute une constante à tous les logits ; la température ne change pas l'argmax ; et $\ln p_k = z_k-m-\ln\sum_je^{z_j-m}$ avec $m = \max_jz_j$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p_k>0,\qquad\textstyle\sum_kp_k &= \frac{\sum_ke^{z_k}}{\sum_je^{z_j}} = \blank{a} &&\text{(i)}\\
\frac{e^{z_k+c}}{\sum_je^{z_j+c}} &= \frac{\blank{b}\,e^{z_k}}{\blank{b}\sum_je^{z_j}} = p_k &&\text{(ii)}\\
\frac{p_k(T)}{p_j(T)} &= e^{\blank{c}} &&\text{(iii)}\\
p_k &= \frac{e^{z_k-m}}{\sum_je^{z_j-m}}\ \Longrightarrow\ \ln p_k = z_k-m-\ln\textstyle\sum_je^{z_j-m}. &&\text{(iv)}
\end{aligned}$$
<p>(iii) : comme $T>0$, son signe est celui de $z_k-z_j$, donc l'ordre des $p_k$ ne change pas. (iv) est (ii) avec $c = -m$ : tous les exposants sont $\le\blank{d}$, ce qui évite les débordements. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 1, tol: 0 },
      b: { kind: 'expr', ans: ['e^c', R`\exp(c)`, 'exp(c)'], tex: 'e^c' },
      c: { kind: 'expr', ans: [R`(z_k-z_j)/T`, R`\frac{z_k-z_j}{T}`, '(z_k - z_j)/T'], tex: R`(z_k-z_j)/T` },
      d: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'nn8', ch: 5, type: 'deriv', title: 'Softmax + cross-entropy : gradient $p_k-y_k$', src: 'Slides p.25–26',
    text: R`<p class="hyp"><b>Cadre.</b> Logits $\bz\in\R^K$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, bonne classe $y$, one-hot $y_k = \mathbb 1[k = y]$, perte $\ell = -\log p_y$.</p>
<p class="claim"><b>Proposition.</b> $\frac{\partial\ell}{\partial z_k} = p_k-y_k$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\ell &= -\log\frac{e^{z_y}}{\sum_je^{z_j}} = -z_y+\blank{a} &&\text{(i)}\\
\frac{\partial(-z_y)}{\partial z_k} &= -y_k,\qquad\frac{\partial}{\partial z_k}\log\textstyle\sum_je^{z_j} = \frac{e^{z_k}}{\sum_je^{z_j}} = \blank{b} &&\text{(ii)}\\
\frac{\partial\ell}{\partial z_k} &= p_k-y_k. &&\text{(iii)}
\end{aligned}$$
<p>Le gradient est [[c]] sur la bonne classe ($p_y-1$) et positif sur les autres ; ses composantes somment à 0. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\log\sum_je^{z_j}`, 'log sum_j e^(z_j)', R`\log\sum_j\exp(z_j)`, 'log sum_j exp(z_j)'], tex: R`\log\sum_je^{z_j}` },
      b: { kind: 'expr', ans: ['p_k'], tex: 'p_k' },
      c: { kind: 'word', ans: ['negatif', 'négatif', 'negative'], tex: 'négatif' },
    } },

  { id: 'nn12', ch: 5, type: 'deriv', title: 'Pourquoi on additionne les gradients aux branches', src: 'Slides p.36',
    text: R`<p class="hyp"><b>Cadre.</b> Une variable $x$ atteint la perte par deux chemins : $z_1 = g_1(x)$, $z_2 = g_2(x)$ et $\hL = h(z_1,z_2)$.</p>
<p class="claim"><b>Proposition.</b> $\frac{d\hL}{dx} = \frac{\partial h}{\partial z_1}g_1'(x)+\frac{\partial h}{\partial z_2}g_2'(x)$.</p>
<p><b>Preuve.</b> On bouge $x$ d'un petit $\Delta x$ :</p>
$$\begin{aligned}
\Delta z_1\approx g_1'(x)\Delta x,\qquad\Delta z_2 &\approx\blank{a} &&\text{(i)}\\
\Delta\hL &\approx\frac{\partial h}{\partial z_1}\Delta z_1+\blank{b} &&\text{(ii)}\\
&= \Big(\frac{\partial h}{\partial z_1}g_1'(x)+\frac{\partial h}{\partial z_2}g_2'(x)\Big)\Delta x. &&\text{(iii)}
\end{aligned}$$
<p>(ii) est le développement à l'ordre 1 de $h$ (la variation est la somme des effets de chaque argument). On divise par $\Delta x$ et on fait $\Delta x\to0$. Pour un vecteur activé composante par composante, $\bh = \varphi(\bz)$, la même règle donne $\frac{\partial\hL}{\partial\bz} = \frac{\partial\hL}{\partial\bh}\,\blank{c}\,\varphi'(\bz)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`g_2'(x)\Delta x`, "g_2'(x) Delta x", "g2'(x)Δx", R`g_2'(x)\,\Delta x`], tex: R`g_2'(x)\Delta x` },
      b: { kind: 'expr', ans: [R`\frac{\partial h}{\partial z_2}\Delta z_2`, 'dh/dz_2 Delta z_2', R`\partial h/\partial z_2\,\Delta z_2`, 'dh/dz2 Δz2'], tex: R`\frac{\partial h}{\partial z_2}\Delta z_2` },
      c: { kind: 'expr', ans: [R`\odot`, 'odot', '⊙', '*'], tex: R`\odot` },
    } },

  { id: 'nn11', ch: 5, type: 'deriv', title: 'Rétropropagation dans une couche affine', src: 'Slides p.37',
    text: R`<p class="hyp"><b>Cadre.</b> Couche $\bz = W\bh+\bb$, $W\in\R^{H\times D}$, dans un réseau de perte scalaire $\hL$ ; on connaît $\boldsymbol\delta = \partial\hL/\partial\bz\in\R^H$.</p>
<p class="claim"><b>Proposition.</b> $\frac{\partial\hL}{\partial W} = \boldsymbol\delta\bh\T$, $\frac{\partial\hL}{\partial\bb} = \boldsymbol\delta$, $\frac{\partial\hL}{\partial\bh} = W\T\boldsymbol\delta$.</p>
<p><b>Preuve.</b> Composante par composante, $z_i = \sum_kW_{ik}h_k+b_i$ :</p>
$$\begin{aligned}
\frac{\partial\hL}{\partial W_{ij}} &= \delta_i\,\frac{\partial z_i}{\partial W_{ij}} = \delta_i\,\blank{a} &&\text{(i)}\\
\frac{\partial\hL}{\partial b_i} &= \delta_i\cdot\blank{b} &&\text{(ii)}\\
\frac{\partial\hL}{\partial h_j} &= \sum_i\delta_i\,\frac{\partial z_i}{\partial h_j} = \sum_i\delta_i\,\blank{c} = (W\T\boldsymbol\delta)_j. &&\text{(iii)}
\end{aligned}$$
<p>Dans (iii), on somme sur $i$ car $h_j$ intervient dans tous les $z_i$ : c'est la règle des [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['h_j'], tex: 'h_j' },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'expr', ans: ['W_{ij}', 'W_ij'], tex: 'W_{ij}' },
      d: { kind: 'word', ans: ['branches', 'branche', 'chemins multiples'], tex: 'branches' },
    } },

  { id: 'd5c', ch: 5, type: 'deriv', title: 'La récurrence de la rétropropagation', src: 'Chapitre 5, §5 (slide 39)',
    text: R`<p class="hyp"><b>Cadre.</b> MLP : $\bz^{(\ell)} = W_\ell\bh^{(\ell-1)}+\bb_\ell$, $\bh^{(\ell)} = \varphi(\bz^{(\ell)})$, logits $\bz^{(L)}$ suivis d'une softmax et d'une cross-entropy de perte $\hL$. On note $\boldsymbol\delta^{(\ell)} = \partial\hL/\partial\bz^{(\ell)}$.</p>
<p class="claim"><b>Proposition.</b> $\boldsymbol\delta^{(L)} = \mathbf p-\by$, $\frac{\partial\hL}{\partial W_\ell} = \boldsymbol\delta^{(\ell)}\bh^{(\ell-1)\top}$ et $\boldsymbol\delta^{(\ell-1)} = \big(W_\ell\T\boldsymbol\delta^{(\ell)}\big)\odot\varphi'(\bz^{(\ell-1)})$.</p>
<p><b>Preuve.</b> On applique les règles locales de la sortie vers l'entrée :</p>
$$\begin{aligned}
\boldsymbol\delta^{(L)} &= \blank{a} &&\text{(i)}\\
\frac{\partial\hL}{\partial W_\ell} &= \blank{b},\qquad\frac{\partial\hL}{\partial\bh^{(\ell-1)}} = \blank{c} &&\text{(ii)}\\
\boldsymbol\delta^{(\ell-1)} &= \frac{\partial\hL}{\partial\bh^{(\ell-1)}}\odot\varphi'(\bz^{(\ell-1)}). &&\text{(iii)}
\end{aligned}$$
<p>(i) est le gradient softmax + cross-entropy ; (ii) la règle de la couche affine ; (iii) celle de l'activation. On parcourt les couches dans l'ordre [[d]], car $\boldsymbol\delta^{(\ell)}$ dépend de toutes les couches au-dessus de $\ell$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['p-y', R`\mathbf p-\by`, 'p - y'], tex: R`\mathbf p-\by` },
      b: { kind: 'expr', ans: [R`\delta^{(\ell)}h^{(\ell-1)\top}`, 'delta^(l) h^(l-1)^T', R`\delta^{(l)}h^{(l-1)^T}`, 'δ h^T', R`\delta h^\top`], tex: R`\boldsymbol\delta^{(\ell)}\bh^{(\ell-1)\top}` },
      c: { kind: 'expr', ans: [R`W_\ell^\top\delta^{(\ell)}`, 'W_l^T delta^(l)', 'W^T delta', 'Wᵀδ', R`W^\top\delta`], tex: R`W_\ell\T\boldsymbol\delta^{(\ell)}` },
      d: { kind: 'word', ans: ['inverse', 'decroissant', 'décroissant', 'de la sortie vers l entree', 'reverse'], tex: 'inverse' },
    } },

  { id: 'nn14', ch: 5, type: 'def', title: 'Mini-batchs et boucle d\'entraînement', src: 'Slides p.42–44',
    text: R`<p class="hyp"><b>Cadre.</b> Descente de gradient stochastique sur $N$ exemples, mini-batchs de taille $B$, en PyTorch.</p>
<p><b>Définitions.</b> Une époque (un passage sur toutes les données) fait environ $\blank{a}$ mises à jour. <code>loss.backward()</code> exécute la [[b]] ; <code>optimizer.step()</code> applique la [[c]] des paramètres. <code>CrossEntropyLoss</code> doit recevoir des [[d]], pas des probabilités.</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['N/B', R`\frac{N}{B}`], tex: 'N/B' },
      b: { kind: 'word', ans: ['rétropropagation', 'retropropagation', 'backpropagation', 'passe arrière', 'differentiation automatique'], tex: 'rétropropagation' },
      c: { kind: 'word', ans: ['mise à jour', 'mise a jour', 'update', 'descente de gradient'], tex: 'mise à jour' },
      d: { kind: 'word', ans: ['logits', 'scores', 'scores de classe'], tex: 'logits' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'nn9', ch: 5, type: 'calc', title: 'Softmax et cross-entropy à la main', src: 'Slides p.24–25',
    gen: r => {
      const z = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = z.map(v => Math.exp(v)), S = M.sum(e), p = e.map(v => v / S), y = r.int(3);
      return { text: R`<p class="hyp"><b>Données.</b> Logits $\bz = (${z.join(', ')})$, bonne classe $y = ${y + 1}$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, $\ell = -\log p_y$, $\frac{\partial\ell}{\partial z_k} = p_k-\mathbb 1[k = y]$.</p>
<p><b>Calcul.</b>
$$\begin{aligned}
\textstyle\sum_je^{z_j} &= \blank{a},\qquad p_1 = \blank{b}\\
\ell &= \blank{c},\qquad\frac{\partial\ell}{\partial z_{${y + 1}}} = \blank{d}
\end{aligned}$$</p>`,
        blanks: { a: { kind: 'num', ans: S, tol: 0.01 }, b: { kind: 'num', ans: p[0], tol: 0.01 }, c: { kind: 'num', ans: -Math.log(p[y]), tol: 0.01 }, d: { kind: 'num', ans: p[y] - 1, tol: 0.01 } },
        solution: R`$\mathbf p = (${p.map(v => f(v, 3)).join(', ')})$.` };
    } },

  { id: 'nn10', ch: 5, type: 'calc', title: 'Graphe de calcul de $f = (x+y)z$', src: 'Slides p.33–34',
    gen: r => {
      const x = r.int(7) - 3, y = r.int(7) - 3, z = r.int(7) - 3, q = x + y;
      return { text: R`<p class="hyp"><b>Données.</b> Nœud « $+$ » : $q = x+y$ ; nœud « $\times$ » : $f = qz$. Dérivées locales : $\frac{\partial f}{\partial q} = z$, $\frac{\partial f}{\partial z} = q$, $\frac{\partial q}{\partial x} = \frac{\partial q}{\partial y} = 1$. Valeurs $x = ${x}$, $y = ${y}$, $z = ${z}$.</p>
<p><b>Calcul.</b>
$$\begin{aligned}
\text{passe avant :}\quad q &= \blank{a},\qquad f = \blank{b}\\
\text{passe arrière :}\quad\frac{\partial f}{\partial z} &= \blank{c},\qquad\frac{\partial f}{\partial x} = \frac{\partial f}{\partial q}\frac{\partial q}{\partial x} = \blank{d}
\end{aligned}$$</p>`,
        blanks: { a: { kind: 'num', ans: q, tol: 0 }, b: { kind: 'num', ans: q * z, tol: 0 }, c: { kind: 'num', ans: q, tol: 0 }, d: { kind: 'num', ans: z, tol: 0 } } };
    } },

  { id: 'nn13', ch: 5, type: 'calc', title: 'Compter les paramètres d\'un MLP', src: 'Slides p.15–16',
    gen: r => {
      const d0 = 2 + r.int(3), d1 = 4 + 2 * r.int(4), d2 = r.int(2) ? 1 : 3;
      return { text: R`<p class="hyp"><b>Données.</b> MLP $${d0}\to${d1}\to${d2}$ ; une couche de $D$ vers $H$ dimensions a $W\in\R^{H\times D}$ et $\bb\in\R^H$.</p>
<p><b>Calcul.</b>
$$\#W_1 = \blank{a},\qquad\#(W_1,\bb_1) = \blank{b},\qquad\#\text{total} = \blank{c}.$$</p>`,
        blanks: { a: { kind: 'num', ans: d0 * d1, tol: 0 }, b: { kind: 'num', ans: d1 * (d0 + 1), tol: 0 }, c: { kind: 'num', ans: d1 * (d0 + 1) + d2 * (d1 + 1), tol: 0 } } };
    } },
  );
})(window.ML);
