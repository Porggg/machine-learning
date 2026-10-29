/* Exercices — Chapitre 8 : transformers, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw;
  const ATT = R`<p class="hyp"><b>Cadre.</b> $N$ tokens de vecteurs $x_1,\dots,x_N\in\R^D$, rangés en lignes dans $X\in\R^{N\times D}$. $\mathrm{Softmax}[S]$ applique l'exponentielle à chaque coefficient puis normalise chaque <b>ligne</b>.</p>`;

  ML.EX.add(
  { id: 'tf1', ch: 8, type: 'def', title: 'Règle de la chaîne et modèle de Markov', src: 'Slide p.3 · DL §12.2.4',
    text: R`<p class="hyp"><b>Cadre.</b> Séquences $x_1,\dots,x_N$ de tokens d'un vocabulaire fini $\mathcal V$.</p>
<p><b>Définition.</b> Pour toute loi sur les séquences,
$$p(x_1,\dots,x_N) = \prod_{n=1}^N\blank{a}.$$
Un modèle qui calcule ces conditionnelles et génère token par token est dit [[b]]. Le modèle de Markov (d'ordre 1) suppose $p(x_n\mid x_1,\dots,x_{n-1}) = \blank{c}$. À l'ordre $L$, une table complète a $\blank{d}$ paramètres libres.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`p(x_n|x_1,\dots,x_{n-1})`, R`p(x_n\mid x_1,\dots,x_{n-1})`, 'p(x_n|x_1,...,x_{n-1})', 'p(x_n|x_1..x_{n-1})', R`p(x_n|x_{<n})`, R`p(x_n\mid x_{\lt n})`, 'p(x_n|x_<n)'], tex: R`p(x_n\mid x_1,\dots,x_{n-1})` },
      b: { kind: 'word', ans: ['autoregressif', 'autorégressif', 'autoregressive'], tex: 'autorégressif' },
      c: { kind: 'expr', ans: ['p(x_n|x_{n-1})', R`p(x_n\mid x_{n-1})`, 'p(x_n|x_n-1)'], tex: R`p(x_n\mid x_{n-1})` },
      d: { kind: 'expr', ans: [R`|\mathcal V|^L(|\mathcal V|-1)`, '|V|^L(|V|-1)', '|V|^L*(|V|-1)', '(|V|-1)|V|^L', R`(|\mathcal V|-1)|\mathcal V|^L`], tex: R`|\mathcal V|^L(|\mathcal V|-1)` },
    } },

  { id: 'tf2', ch: 8, type: 'def', title: 'Coefficients d\'attention et self-attention', src: 'Slides p.9–10',
    text: ATT + R`<p><b>Définition.</b> L'attention produit $y_n = \sum_ma_{nm}x_m$ avec $a_{nm}\blank{a}0$ et $\sum_ma_{nm} = \blank{b}$ ; $y_n$ appartient donc à l'enveloppe [[c]] des entrées. En self-attention,
$$a_{nm} = \frac{\exp(x_n^\top x_m)}{\blank{d}},\qquad Y = \mathrm{Softmax}\big[\blank{e}\big]\,X.$$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\ge`, '>=', '≥', R`\geq`, '>'], tex: R`\ge` },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
      d: { kind: 'expr', ans: [R`\sum_{m'}\exp(x_n^\top x_{m'})`, R`\sum_{m'=1}^N\exp(x_n^\top x_{m'})`, "sum_m' exp(x_n^t x_m')", R`\sum_{m'}e^{x_n^\top x_{m'}}`, R`\sum_m\exp(x_n^\top x_m)`, 'sum_m exp(x_n^t x_m)'], tex: R`\sum_{m'=1}^N\exp(x_n^\top x_{m'})` },
      e: { kind: 'expr', ans: [R`XX^\top`, 'XX^T', 'X X^T', 'XX^t'], tex: R`XX^\top` },
    } },

  { id: 'tf3', ch: 8, type: 'def', title: 'Requêtes, clés, valeurs et attention mise à l\'échelle', src: 'Slides p.12–14',
    text: ATT + R`<p><b>Définition.</b> Avec $W^{(q)},W^{(k)}\in\R^{D\times D_k}$ et $W^{(v)}\in\R^{D\times D_v}$ : $Q = X\blank{a}$, $K = XW^{(k)}$, $V = XW^{(v)}$ et
$$\mathrm{Attention}(Q,K,V) = \mathrm{Softmax}\Big[\frac{QK^\top}{\blank{b}}\Big]V.$$
La matrice $QK^\top$ est de taille $N\times\blank{c}$, la sortie de taille $N\times\blank{d}$. Les noms requête, clé, valeur viennent de la recherche d'[[e]].</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['W^{(q)}', 'W^(q)', 'W_q', 'Wq'], tex: 'W^{(q)}' },
      b: { kind: 'expr', ans: [R`\sqrt{D_k}`, 'sqrt(D_k)', '√D_k', 'sqrt(Dk)'], tex: R`\sqrt{D_k}` },
      c: { kind: 'expr', ans: ['N'], tex: 'N' },
      d: { kind: 'expr', ans: ['D_v', 'Dv'], tex: 'D_v' },
      e: { kind: 'word', ans: ['information', 'informations'], tex: 'information' },
    } },

  { id: 'tf4', ch: 8, type: 'def', title: 'Une couche de transformer', src: 'Slides p.16, 19',
    text: R`<p class="hyp"><b>Cadre.</b> $Y(X)\in\R^{N\times D}$ la sortie de l'attention multi-têtes, $\mathrm{MLP}:\R^D\to\R^D$.</p>
<p><b>Définition.</b>
$$Z = \mathrm{LayerNorm}\big[\blank{a}\big],\qquad\tilde X = \mathrm{TransformerLayer}[X] = \mathrm{LayerNorm}\big[\blank{b}\big].$$
Le MLP est appliqué à chaque [[c]] de $Z$ avec les mêmes poids. Les connexions résiduelles atténuent l'évanouissement du [[d]]. On peut empiler les couches car la sortie a la même taille $\blank{e}$ que l'entrée.</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['Y(X)+X', 'X+Y(X)', 'Y+X', 'X+Y'], tex: 'Y(X)+X' },
      b: { kind: 'expr', ans: [R`\mathrm{MLP}[Z]+Z`, 'MLP[Z]+Z', 'MLP(Z)+Z', 'Z+MLP[Z]', 'Z+MLP(Z)'], tex: R`\mathrm{MLP}[Z]+Z` },
      c: { kind: 'word', ans: ['ligne', 'row', 'token', 'position', 'lignes'], tex: 'ligne (token)' },
      d: { kind: 'word', ans: ['gradient', 'gradients'], tex: 'gradient' },
      e: { kind: 'expr', ans: [R`N\times D`, 'N*D', 'NxD', 'N x D'], tex: R`N\times D` },
    } },

  { id: 'tf5', ch: 8, type: 'deriv', title: 'Les scores $XUU^\\top X^\\top$ sont symétriques', src: 'Slide p.11',
    text: ATT + R`<p class="claim"><b>Proposition.</b> Avec $U\in\R^{D\times D}$ et $S = XUU^\top X^\top$ : $S^\top = S$, et les poids $a_{nm} = e^{s_{nm}}/Z_n$ (où $Z_n = \sum_{m'}e^{s_{nm'}}$) vérifient $a_{nm}Z_n = a_{mn}Z_m$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
S^\top &= (XUU^\top X^\top)^\top = (X^\top)^\top(U^\top)^\top\,\blank{a}\,X^\top = XUU^\top X^\top = S &&\text{(i)}\\
a_{mn} &= \frac{e^{s_{mn}}}{Z_m} = \frac{e^{\blank{b}}}{Z_m} &&\text{(ii)}\\
a_{nm}Z_n &= \blank{c} = a_{mn}Z_m. &&\text{(iii)}
\end{aligned}$$
<p>(i) : $(ABCD)^\top = D^\top C^\top B^\top A^\top$. Une matrice symétrique $N\times N$ n'a que $\blank{d}$ coefficients libres : moins de degrés de liberté qu'avec $Q$ et $K$ séparées. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`U^\top`, 'U^T', 'U^t'], tex: R`U^\top` },
      b: { kind: 'expr', ans: ['s_{nm}', 's_nm', 'snm'], tex: 's_{nm}' },
      c: { kind: 'expr', ans: ['e^{s_{nm}}', R`\exp(s_{nm})`, 'exp(s_nm)', 'e^s_nm', 'e^{s_nm}'], tex: 'e^{s_{nm}}' },
      d: { kind: 'expr', ans: ['N(N+1)/2', R`\frac{N(N+1)}{2}`, '(N^2+N)/2', 'N(N+1)/2'], tex: R`N(N+1)/2` },
    } },

  { id: 'tf6', ch: 8, type: 'deriv', title: 'Pourquoi $\\sqrt{D_k}$ : la variance de $q^\\top k$', src: 'Slide p.14 · DL ex. 12.4',
    text: R`<p class="hyp"><b>Cadre.</b> $q,k\in\R^{D_k}$ ; les $2D_k$ coordonnées sont indépendantes, de moyenne 0 et de variance 1.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{Var}(q^\top k) = D_k$, donc $q^\top k/\sqrt{D_k}$ est de variance 1.</p>
<p><b>Preuve.</b> On écrit $q^\top k = \sum_{i=1}^{D_k}q_ik_i$.</p>
$$\begin{aligned}
\E[q_ik_i] &= \E[q_i]\,\E[k_i] = \blank{a} &&\text{(i)}\\
\mathrm{Var}(q_ik_i) &= \E[q_i^2]\,\E[k_i^2] = \blank{b} &&\text{(ii)}\\
\mathrm{Cov}(q_ik_i,\,q_jk_j) &= \blank{c}\quad(i\ne j) &&\text{(iii)}\\
\mathrm{Var}(q^\top k) &= \blank{d},\qquad\mathrm{Var}\big(q^\top k/\sqrt{D_k}\big) = \blank{e}. &&\text{(iv)}
\end{aligned}$$
<p>(i)–(iii) utilisent l'indépendance ; (iv) : la variance d'une somme de termes décorrélés est la somme des variances. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 }, b: { kind: 'num', ans: 1, tol: 0 }, c: { kind: 'num', ans: 0, tol: 0 },
      d: { kind: 'expr', ans: ['D_k', 'Dk'], tex: 'D_k' },
      e: { kind: 'num', ans: 1, tol: 0 },
    } },

  { id: 'tf7', ch: 8, type: 'deriv', title: 'Jacobien du softmax et saturation', src: 'Slides p.12, 14 (preuve hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $a = \mathrm{softmax}(s)\in\R^N$, $a_i = e^{s_i}/Z$ avec $Z = \sum_le^{s_l}$.</p>
<p class="claim"><b>Proposition.</b> $J = \partial a/\partial s = \mathrm{diag}(a)-aa^\top$, et $J\to0$ quand $a$ devient un vecteur one-hot.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\frac{\partial a_i}{\partial s_j} &= \frac{\delta_{ij}e^{s_i}}{Z}-\frac{e^{s_i}e^{s_j}}{Z^2} = \blank{a} &&\text{(i)}\\
J &= \mathrm{diag}(a)-\blank{b} &&\text{(ii)}\\
a = (1,0,\dots,0)\ \Rightarrow\ J &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>Le gradient par rapport aux scores est $J^\top\nabla_a\ell$ : quand le softmax sature (grands scores), il [[d]], et $W^{(q)}$, $W^{(k)}$ n'apprennent plus. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`a_i(\delta_{ij}-a_j)`, 'a_i(delta_ij-a_j)', R`a_i\delta_{ij}-a_ia_j`, 'a_i delta_ij - a_i a_j'], tex: R`a_i(\delta_{ij}-a_j)` },
      b: { kind: 'expr', ans: [R`aa^\top`, 'aa^T', 'a a^T', 'aa^t'], tex: R`aa^\top` },
      c: { kind: 'num', ans: 0, tol: 0 },
      d: { kind: 'word', ans: ['s annule', 'tend vers 0', 'disparait', 'disparaît', 'vanishes', 'tend vers zero', 'devient nul', 's eteint', 's éteint'], tex: 's\'annule' },
    } },

  { id: 'tf8', ch: 8, type: 'deriv', title: 'Équivariance par permutation d\'une couche', src: 'Slide p.17 (« Why? »)',
    text: ATT + R`<p class="hyp">$P$ est une matrice de permutation : la ligne $n$ de $PX$ est la ligne $\pi(n)$ de $X$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{TransformerLayer}[PX] = P\,\mathrm{TransformerLayer}[X]$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
(PSP^\top)_{nm} &= S_{\blank{a}} &&\text{(i)}\\
\mathrm{Softmax}[PSP^\top] &= P\,\mathrm{Softmax}[S]\,\blank{b} &&\text{(ii)}\\
Q' = PXW^{(q)} &= \blank{c},\quad K' = PK,\quad V' = PV &&\text{(iii)}\\
\mathrm{Attention}(Q',K',V') &= P\,\mathrm{Softmax}\Big[\tfrac{QK^\top}{\sqrt{D_k}}\Big]P^\top PV = P\,\mathrm{Attention}(Q,K,V)\quad\text{car } P^\top P = \blank{d} &&\text{(iv)}\\
\mathrm{LayerNorm}[PZ] &= \blank{e}. &&\text{(v)}
\end{aligned}$$
<p>(ii) : le softmax agit ligne par ligne, et une permutation des colonnes ne change pas la somme d'une ligne. (v) : LayerNorm, MLP et résidus agissent ligne par ligne avec les mêmes poids. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\pi(n)\pi(m)`, 'pi(n)pi(m)', 'pi(n),pi(m)', R`\pi(n),\pi(m)`], tex: R`\pi(n)\pi(m)` },
      b: { kind: 'expr', ans: [R`P^\top`, 'P^T', 'P^t', 'P^{-1}'], tex: R`P^\top` },
      c: { kind: 'expr', ans: ['PQ'], tex: 'PQ' },
      d: { kind: 'expr', ans: ['I', 'Id', 'I_N'], tex: 'I' },
      e: { kind: 'expr', ans: [R`P\,\mathrm{LayerNorm}[Z]`, 'P LayerNorm[Z]', 'PLayerNorm[Z]', 'P LayerNorm(Z)', 'PLayerNorm(Z)'], tex: R`P\,\mathrm{LayerNorm}[Z]` },
    } },

  { id: 'tf9', ch: 8, type: 'deriv', title: 'Encodage sinusoïdal : un décalage est une rotation', src: 'Slide p.18 · DL ex. 12.10 (hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $r_{n,2j} = \sin(n\omega_j)$, $r_{n,2j+1} = \cos(n\omega_j)$, avec $\omega_j = b^{-2j/D}$.</p>
<p class="claim"><b>Proposition.</b> $r_{n+k} = M_kr_n$ avec $M_k$ indépendante de $n$, et $r_n^\top r_m$ ne dépend que de $n-m$.</p>
<p><b>Preuve.</b> Pour une fréquence $\omega$ :</p>
$$\begin{aligned}
\sin((n+k)\omega) &= \sin n\omega\cos k\omega+\blank{a} &&\text{(i)}\\
\cos((n+k)\omega) &= \cos n\omega\cos k\omega-\blank{b} &&\text{(ii)}\\
\sin n\omega\sin m\omega+\cos n\omega\cos m\omega &= \cos\big(\blank{c}\big). &&\text{(iii)}
\end{aligned}$$
<p>Par (i)–(ii), chaque paire subit une rotation dont l'angle ne dépend que de [[d]] ; $M_k$ est diagonale par blocs. (iii), sommé sur les paires, donne $r_n^\top r_m = \sum_j\cos((n-m)\omega_j)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\cos n\omega\sin k\omega`, R`\cos(n\omega)\sin(k\omega)`, 'cos(nw)sin(kw)', 'cos n omega sin k omega', R`\sin k\omega\cos n\omega`], tex: R`\cos n\omega\sin k\omega` },
      b: { kind: 'expr', ans: [R`\sin n\omega\sin k\omega`, R`\sin(n\omega)\sin(k\omega)`, 'sin(nw)sin(kw)', 'sin n omega sin k omega', R`\sin k\omega\sin n\omega`], tex: R`\sin n\omega\sin k\omega` },
      c: { kind: 'expr', ans: [R`(n-m)\omega`, '(n-m)omega', '(n-m)w', R`(m-n)\omega`, '(m-n)omega'], tex: R`(n-m)\omega` },
      d: { kind: 'word', ans: ['k', 'du decalage k', 'decalage', 'offset', 'the offset k'], tex: 'k' },
    } },

  { id: 'tf10', ch: 8, type: 'deriv', title: 'Attention masquée : la sortie $n$ ne voit que le passé', src: 'Slides p.20–21 · DL §12.3.1',
    text: R`<p class="hyp"><b>Cadre.</b> Décodeur : entrée $\langle\text{start}\rangle,x_1,\dots,x_N$ (plongement + position), $L$ couches à attention masquée, sortie LSM à chaque position.</p>
<p class="claim"><b>Proposition.</b> La sortie $y_n$ (qui prédit $x_n$) ne dépend que de $\langle\text{start}\rangle,x_1,\dots,x_{n-1}$.</p>
<p><b>Preuve.</b> Le masque impose $a_{nm} = 0$ pour $m\blank{a}n$, en mettant ces scores à $\blank{b}$ avant le softmax. Ainsi
$$y_n^{\text{att}} = \sum_{m\,\blank{c}\,n}a_{nm}v_m$$
ne fait intervenir que les lignes d'indice $\le n$. Les autres opérations agissent ligne par ligne ; par récurrence sur les [[d]], la ligne $n$ ne dépend que des entrées $1,\dots,n$. Avec le décalage par ⟨start⟩, ce sont $\langle\text{start}\rangle,x_1,\dots,x_{\blank{e}}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['>', R`\gt`], tex: '>' },
      b: { kind: 'expr', ans: [R`-\infty`, '-inf', '-∞', '-infinity'], tex: R`-\infty` },
      c: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      d: { kind: 'word', ans: ['couches', 'couche', 'layers', 'layer'], tex: 'couches' },
      e: { kind: 'expr', ans: ['n-1'], tex: 'n-1' },
    } },

  { id: 'tf11', ch: 8, type: 'deriv', title: 'Prédire le token suivant = maximum de vraisemblance', src: 'Slides p.24, 26',
    text: R`<p class="hyp"><b>Cadre.</b> Un décodeur de paramètres $\theta$ donne, à chaque position $t$, une loi $y_{t+1} = p_\theta(\cdot\mid x_{\le t})$ sur $\mathcal V$. Séquence d'entraînement $x_1,\dots,x_T$.</p>
<p class="claim"><b>Proposition.</b> La somme des pertes d'entropie croisée vaut $-\log p_\theta(x_1,\dots,x_T)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
-\sum_{v\in\mathcal V}\mathbb 1[v = x_{t+1}]\log y_{t+1,v} &= \blank{a} &&\text{(i)}\\
\sum_{t=0}^{T-1}-\log p_\theta(x_{t+1}\mid x_{\le t}) &= -\log\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) est la règle de la chaîne. Minimiser la perte moyenne de NTP revient donc à maximiser la [[c]] ; pour un grand corpus, c'est minimiser $\mathrm{KL}(\blank{d}\,\|\,p_\theta)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\log p_\theta(x_{t+1}|x_{\le t})`, R`-\log p_\theta(x_{t+1}\mid x_{\le t})`, '-log p_theta(x_{t+1}|x_{<=t})', '-log p(x_{t+1}|x_{<=t})', R`-\log y_{t+1,x_{t+1}}`], tex: R`-\log p_\theta(x_{t+1}\mid x_{\le t})` },
      b: { kind: 'expr', ans: [R`p_\theta(x_1,\dots,x_T)`, 'p_theta(x_1,...,x_T)', 'p(x_1,...,x_T)', R`p_\theta(x_{1:T})`, 'p_theta(x_1..x_T)'], tex: R`p_\theta(x_1,\dots,x_T)` },
      c: { kind: 'word', ans: ['vraisemblance', 'log-vraisemblance', 'likelihood', 'log-likelihood'], tex: 'vraisemblance' },
      d: { kind: 'expr', ans: [R`p_{\text{data}}`, 'p_data', 'pdata'], tex: R`p_{\text{data}}` },
    } },

  { id: 'tf12', ch: 8, type: 'deriv', title: 'Attention multi-têtes : une somme sur les têtes', src: 'Slide p.15 · DL ex. 12.5',
    text: R`<p class="hyp"><b>Cadre.</b> $H$ têtes $H_h\in\R^{N\times D_v}$, $W^{(o)}\in\R^{HD_v\times D}$ découpée en blocs de lignes $W_h^{(o)}\in\R^{D_v\times D}$ ; chaque tête a $W_h^{(q)},W_h^{(k)},W_h^{(v)}\in\R^{D\times D_v}$.</p>
<p class="claim"><b>Proposition.</b> $Y = \mathrm{Concat}[H_1,\dots,H_H]W^{(o)} = \sum_hH_hW_h^{(o)}$, et la couche a $4D^2$ paramètres si $D_v = D/H$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
[H_1\ \cdots\ H_H]\begin{bmatrix}W_1^{(o)}\\\vdots\\W_H^{(o)}\end{bmatrix} &= \sum_{h=1}^H\blank{a} &&\text{(i)}\\
\#\text{param.} &= H\cdot3DD_v+\blank{b} = \blank{c}\quad\text{si } D_v = D/H. &&\text{(ii)}
\end{aligned}$$
<p>(i) est le produit par blocs. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['H_hW_h^{(o)}', 'H_h W_h^(o)', 'H_hW_h^(o)', 'H_h W_h^o'], tex: 'H_hW_h^{(o)}' },
      b: { kind: 'expr', ans: ['HD_vD', 'H D_v D', 'HDD_v', 'DHD_v', 'HD_v*D'], tex: 'HD_vD' },
      c: { kind: 'expr', ans: ['4D^2', '4D²', '4 D^2'], tex: '4D^2' },
    } },

  { id: 'tf13', ch: 8, type: 'calc', title: 'Une self-attention à la main', src: 'Slide p.10',
    text: R`<p class="hyp"><b>Données.</b> $D = 2$, trois tokens $x_1 = (1,0)$, $x_2 = (0,1)$, $x_3 = (1,1)$. Self-attention sans paramètres : $a_{3m} = \mathrm{softmax}_m(x_3^\top x_m)$.</p>
<p><b>Calcul.</b> Les scores de la requête 3 sont $(1,1,2)$.
$$a_{31}\approx\blank{a},\qquad a_{33}\approx\blank{b},\qquad y_3 = \sum_ma_{3m}x_m\approx(\blank{c},\ \blank{c}).$$</p>`,
    blanks: { a: { kind: 'num', ans: 1 / (2 + Math.E), tol: 0.01 }, b: { kind: 'num', ans: Math.E / (2 + Math.E), tol: 0.01 }, c: { kind: 'num', ans: (1 + Math.E) / (2 + Math.E), tol: 0.01 } } },

  { id: 'tf14', ch: 8, type: 'calc', title: 'Attention mise à l\'échelle et masquée', src: 'Slides p.14, 21',
    text: R`<p class="hyp"><b>Données.</b> $D_k = 2$, requête du token 2 : $q_2 = (2,2)$ ; clés $k_1 = (1,0)$, $k_2 = (0,1)$, $k_3 = (3,3)$. Scores $s_{2m} = q_2^\top k_m/\sqrt{D_k}$.</p>
<p><b>Calcul.</b>
$$s_{21}\approx\blank{a};\qquad\text{avec masque causal : } a_{21} = \blank{b},\ a_{23} = \blank{c};\qquad\text{sans masque : } a_{23}\approx\blank{d}.$$</p>`,
    blanks: {
      a: { kind: 'num', ans: Math.SQRT2, tol: 0.01 }, b: { kind: 'num', ans: 0.5, tol: 0.01 }, c: { kind: 'num', ans: 0, tol: 0 },
      d: { kind: 'num', ans: Math.exp(12 / Math.SQRT2) / (2 * Math.exp(Math.SQRT2) + Math.exp(12 / Math.SQRT2)), tol: 0.002 },
    } },

  { id: 'tf15', ch: 8, type: 'calc', title: 'Génération gloutonne contre séquence la plus probable', src: 'DL §12.3.2 (hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Données.</b> $p(x_1 = \mathrm A) = 0{,}55$, $p(x_1 = \mathrm B) = 0{,}45$. Sachant A, $x_2$ est uniforme sur 4 tokens ; sachant B, $p(x_2 = \mathrm C\mid\mathrm B) = 0{,}8$.</p>
<p><b>Calcul.</b> Le glouton choisit d'abord le token [[a]] ; la séquence qu'il produit a la probabilité $\blank{b}$. Or $p(\mathrm B,\mathrm C) = \blank{c}$.</p>`,
    blanks: { a: { kind: 'word', ans: ['A'], tex: 'A' }, b: { kind: 'num', ans: 0.1375, tol: 0.01 }, c: { kind: 'num', ans: 0.36, tol: 0.01 } } },

  { id: 'tf16', ch: 8, type: 'calc', title: 'Compter les paramètres', src: 'Slide p.15 · DL §12.1.8',
    text: R`<p class="hyp"><b>Données.</b> Attention multi-têtes avec $D = 512$, $H = 8$, $D_v = D_k = 64$ (sans biais). Modèle de Markov d'ordre $L = 2$ sur $|\mathcal V| = 1000$ tokens.</p>
<p><b>Calcul.</b>
$$\#(W_h^{(q)},W_h^{(k)},W_h^{(v)})\text{ pour une tête} = \blank{a},\qquad\#W^{(o)} = \blank{b},\qquad\text{total} = \blank{c},\qquad\text{table de Markov} = \blank{d}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 3 * 512 * 64, tol: 0 }, b: { kind: 'num', ans: 512 * 512, tol: 0 }, c: { kind: 'num', ans: 4 * 512 * 512, tol: 0 }, d: { kind: 'num', ans: 1000 ** 2 * 999, tol: 0.001 } } },
  );
})(window.ML);
