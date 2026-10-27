/* Exercices — Chapitre 7 : autoencodeurs et VAE, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw;
  const LVM = R`<p class="hyp"><b>Cadre.</b> Modèle à variable latente : $p(z) = \mathcal N(z;0,I)$, $p_\theta(x\mid z)$ donnée par un décodeur, $p_\theta(x,z) = p(z)p_\theta(x\mid z)$ et $p_\theta(x) = \int p_\theta(x,z)\,dz$. Pour $x$ fixé, $q(z)$ est une densité auxiliaire avec $q(z)>0$ partout où $p_\theta(x,z)>0$.</p>`;

  ML.EX.add(
  { id: 'va1', ch: 7, type: 'def', title: 'L\'autoencodeur et son objectif', src: 'Slides p.4–6',
    text: R`<p class="hyp"><b>Cadre.</b> Données non étiquetées $x_1,\dots,x_N\in\R^D$.</p>
<p><b>Définition.</b> Un encodeur est une fonction $f:\R^D\to\R^M$ avec $M\blank{a}D$ ; un décodeur $g:\R^M\to\R^D$. L'autoencodeur calcule $\hat x = \blank{b}$, et on apprend $f,g$ en minimisant l'erreur de reconstruction
$$\min_{f,g}\ \frac1N\sum_{n=1}^N\big\|x_n-\blank{c}\big\|^2.$$
Le préfixe « auto » signifie que l'entrée $x$ est sa propre [[d]].</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\ll`, '<<', '≪', '<', R`\lt`], tex: R`\ll` },
      b: { kind: 'expr', ans: ['g(f(x))', R`g\circ f(x)`, 'g o f (x)'], tex: 'g(f(x))' },
      c: { kind: 'expr', ans: ['g(f(x_n))', 'g(f(xn))', R`\hat x_n`], tex: 'g(f(x_n))' },
      d: { kind: 'word', ans: ['cible', 'target', 'étiquette', 'etiquette'], tex: 'cible' },
    } },

  { id: 'va2', ch: 7, type: 'def', title: 'Modèle à variable latente et intégrale intraitable', src: 'Slides p.12–15',
    text: R`<p class="hyp"><b>Cadre.</b> Une variable latente $z$ de loi a priori simple, et un décodeur gaussien.</p>
<p><b>Définition.</b> $p(z) = \mathcal N(z;0,I)$ et $p_\theta(x\mid z) = \mathcal N\big(x;\mu_\theta(z),\mathrm{diag}(\sigma_\theta^2(z))\big)$. Pour générer : tirer $z\sim\blank{a}$ et $\varepsilon_x\sim\mathcal N(0,I)$, puis
$$x = \mu_\theta(z)+\blank{b}\odot\varepsilon_x.$$
La vraisemblance est $p_\theta(x) = \int\blank{c}\,dz$ ; avec un décodeur non linéaire, cette intégrale n'a pas de forme [[d]]. Le décodeur sort $\ln\sigma$ plutôt que $\sigma$, et on applique [[e]] pour obtenir $\sigma>0$.</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['p(z)', R`\mathcal N(0,I)`, 'N(0,I)', 'N(0, I)'], tex: 'p(z)' },
      b: { kind: 'expr', ans: [R`\sigma_\theta(z)`, 'sigma_theta(z)', 'σ_θ(z)', R`\sigma_{x|z}`], tex: R`\sigma_\theta(z)` },
      c: { kind: 'expr', ans: [R`p(z)p_\theta(x|z)`, R`p(z)\,p_\theta(x\mid z)`, 'p(z) p_theta(x|z)', R`p_\theta(x,z)`, 'p(z)p(x|z)'], tex: R`p(z)\,p_\theta(x\mid z)` },
      d: { kind: 'word', ans: ['close', 'fermee', 'fermée', 'closed', 'closed form', 'explicite'], tex: 'close' },
      e: { kind: 'word', ans: ['exp', 'exponentielle', 'l exponentielle', 'exponential'], tex: 'l\'exponentielle' },
    } },

  { id: 'va3', ch: 7, type: 'deriv', title: 'L\'ELBO est une borne inférieure (Jensen)', src: 'Slide p.16',
    text: LVM + R`<p class="claim"><b>Proposition.</b> $\mathcal L(x,\theta;q) := \E_{z\sim q}\Big[\log\frac{p_\theta(x,z)}{q(z)}\Big]\le\log p_\theta(x)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p_\theta(x) &= \int p_\theta(x,z)\,dz = \int\blank{a}\,\frac{p_\theta(x,z)}{q(z)}\,dz = \E_{z\sim q}\Big[\frac{p_\theta(x,z)}{q(z)}\Big] &&\text{(i)}\\
\log\E[Y] &\ \blank{b}\ \E[\log Y]\quad\text{pour } Y>0 &&\text{(ii)}\\
\log p_\theta(x) &\ge\E_{z\sim q}\Big[\log\frac{p_\theta(x,z)}{q(z)}\Big] = \mathcal L(x,\theta;q). &&\text{(iii)}
\end{aligned}$$
<p>(i) utilise l'hypothèse sur le support de $q$. (ii) est l'inégalité de Jensen, valable car le log est [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['q(z)'], tex: 'q(z)' },
      b: { kind: 'expr', ans: [R`\ge`, '>=', '≥', R`\geq`], tex: R`\ge` },
      c: { kind: 'word', ans: ['concave'], tex: 'concave' },
    } },

  { id: 'va4', ch: 7, type: 'deriv', title: 'L\'écart à la log-vraisemblance est une KL', src: 'Slide p.17',
    text: LVM + R`<p class="claim"><b>Proposition.</b> Avec $r(z) := p_\theta(z\mid x)$ : $\log p_\theta(x)-\mathcal L(x,\theta;q) = \mathrm{KL}(q\,\|\,r)\ge0$, donc $\log p_\theta(x) = \max_q\mathcal L(x,\theta;q)$, atteint en $q = r$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\log p_\theta(x)-\mathcal L(x,\theta;q) &= \E_{z\sim q}\Big[\log\frac{q(z)\,\blank{a}}{p_\theta(x,z)}\Big] &&\text{(i)}\\
\frac{p_\theta(x,z)}{p_\theta(x)} &= \blank{b} &&\text{(ii)}\\
\log p_\theta(x)-\mathcal L(x,\theta;q) &= \E_{z\sim q}\Big[\log\frac{q(z)}{r(z)}\Big] = \mathrm{KL}(q\,\|\,r)\ \ge\ \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : $\log p_\theta(x)$ ne dépend pas de $z$, on le met sous l'espérance. (ii) est la règle de [[d]]. (iii) : la KL est nulle si et seulement si $q = r$, d'où le maximum. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`p_\theta(x)`, 'p_theta(x)', 'p(x)', 'p_θ(x)'], tex: R`p_\theta(x)` },
      b: { kind: 'expr', ans: [R`p_\theta(z|x)`, R`p_\theta(z\mid x)`, 'p_theta(z|x)', 'p(z|x)', 'r(z)'], tex: R`p_\theta(z\mid x)` },
      c: { kind: 'num', ans: 0, tol: 0 },
      d: { kind: 'word', ans: ['bayes'], tex: 'Bayes' },
    } },

  { id: 'va5', ch: 7, type: 'deriv', title: 'La KL est positive (inégalité de Gibbs)', src: 'Slide p.17 (preuve hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $q$, $r$ deux densités sur $\R^J$, avec $r>0$ là où $q>0$ ; $\mathrm{KL}(q\|r) = \int q\log\frac qr$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{KL}(q\,\|\,r)\ge0$, avec égalité si et seulement si $q = r$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\log u &\le\blank{a}\quad\text{pour tout } u>0 &&\text{(i)}\\
-\mathrm{KL}(q\|r) = \int_{q>0}q\log\frac rq &\le\int_{q>0}q\Big(\frac rq-1\Big) = \int_{q>0}r-\blank{b} &&\text{(ii)}\\
\int_{q>0}r &\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : le log est concave, donc sous sa [[d]] en $u = 1$ ; égalité seulement en $u = 1$, c'est-à-dire $r = q$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['u-1', 'u - 1'], tex: 'u-1' },
      b: { kind: 'num', ans: 1, tol: 0 },
      c: { kind: 'num', ans: 1, tol: 0 },
      d: { kind: 'word', ans: ['tangente', 'tangent'], tex: 'tangente' },
    } },

  { id: 'va6', ch: 7, type: 'deriv', title: 'Réécrire l\'ELBO : reconstruction − KL', src: 'Slide p.21',
    text: R`<p class="hyp"><b>Cadre.</b> Encodeur $q_\phi(z\mid x)$, décodeur $p_\theta(x\mid z)$, a priori $p(z)$ ; $\mathcal L(x,\theta,\phi) = \E_{z\sim q_\phi(\cdot\mid x)}\Big[\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\Big]$.</p>
<p class="claim"><b>Proposition.</b> $\mathcal L(x,\theta,\phi) = \E_z[\log p_\theta(x\mid z)]-\mathrm{KL}\big(q_\phi(z\mid x)\,\|\,p(z)\big)$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
p_\theta(x,z) &= p_\theta(x\mid z)\,\blank{a} &&\text{(i)}\\
\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)} &= \log p_\theta(x\mid z)-\log\frac{\blank{b}}{p(z)} &&\text{(ii)}\\
\mathcal L(x,\theta,\phi) &= \E_z[\log p_\theta(x\mid z)]-\mathrm{KL}\big(\blank{c}\,\|\,p(z)\big). &&\text{(iii)}
\end{aligned}$$
<p>(iii) : linéarité de l'espérance. Le premier terme encourage une bonne [[d]] ; le second rapproche la loi a posteriori approchée de l'a priori. Le terme KL ne dépend pas de $\theta$ : il n'entraîne que l'[[e]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['p(z)'], tex: 'p(z)' },
      b: { kind: 'expr', ans: [R`q_\phi(z|x)`, R`q_\phi(z\mid x)`, 'q_phi(z|x)', 'q(z|x)'], tex: R`q_\phi(z\mid x)` },
      c: { kind: 'expr', ans: [R`q_\phi(z|x)`, R`q_\phi(z\mid x)`, 'q_phi(z|x)', 'q(z|x)'], tex: R`q_\phi(z\mid x)` },
      d: { kind: 'word', ans: ['reconstruction'], tex: 'reconstruction' },
      e: { kind: 'word', ans: ['encodeur', 'encoder'], tex: 'encodeur' },
    } },

  { id: 'va7', ch: 7, type: 'deriv', title: 'KL entre une gaussienne et $\\mathcal N(0,1)$', src: 'Slide p.25',
    text: R`<p class="hyp"><b>Cadre.</b> Dimension 1 : $q = \mathcal N(\mu,\sigma^2)$, $p = \mathcal N(0,1)$, $\log q(z) = -\frac12\log2\pi-\ln\sigma-\frac{(z-\mu)^2}{2\sigma^2}$, $\log p(z) = -\frac12\log2\pi-\frac{z^2}2$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{KL}(q\|p) = \frac12(\mu^2+\sigma^2-1-2\ln\sigma)$ ; en dimension $J$ avec covariances diagonales, on somme sur les coordonnées.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E_q\big[(z-\mu)^2\big] &= \blank{a},\qquad \E_q[z^2] = \blank{b} &&\text{(i)}\\
\E_q[\log q] &= -\tfrac12\log2\pi-\ln\sigma-\blank{c} &&\text{(ii)}\\
\E_q[\log p] &= -\tfrac12\log2\pi-\tfrac12(\sigma^2+\mu^2) &&\text{(iii)}\\
\mathrm{KL}(q\|p) &= \E_q[\log q]-\E_q[\log p] = \tfrac12\big(\mu^2+\sigma^2-1-2\ln\sigma\big). &&\text{(iv)}
\end{aligned}$$
<p>En dimension $J$, $q$ et $p$ se factorisent (covariances diagonales), le log du produit est une [[d]], et la KL est la somme des KL des coordonnées. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sigma^2`, 'sigma^2', 'σ^2', 'σ²'], tex: R`\sigma^2` },
      b: { kind: 'expr', ans: [R`\sigma^2+\mu^2`, R`\mu^2+\sigma^2`, 'sigma^2+mu^2', 'mu^2+sigma^2', 'σ²+μ²', 'μ²+σ²'], tex: R`\sigma^2+\mu^2` },
      c: { kind: 'expr', ans: [R`\frac12`, '1/2', '0.5'], tex: R`\tfrac12` },
      d: { kind: 'word', ans: ['somme', 'sum'], tex: 'somme' },
    } },

  { id: 'va8', ch: 7, type: 'deriv', title: 'Monte-Carlo, et le gradient naïf par rapport à l\'encodeur', src: 'Slides p.22–23',
    text: R`<p class="hyp"><b>Cadre.</b> $\hat R_K = \frac1K\sum_{k=1}^K\log p_\theta(x\mid z^{(k)})$ avec $z^{(k)}\overset{\text{i.i.d.}}\sim q_\phi(\cdot\mid x)$ ; $v = \mathrm{Var}_{q_\phi}[\log p_\theta(x\mid z)]<\infty$.</p>
<p class="claim"><b>Proposition.</b> $\hat R_K$ est sans biais, de variance $v/K$. Le gradient en $\theta$ s'obtient en figeant les échantillons ; en $\phi$, figer les échantillons donne un gradient nul, ce qui est faux.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E[\hat R_K] &= \frac1K\sum_k\E\big[\log p_\theta(x\mid z^{(k)})\big] = \E_{z\sim q_\phi}\big[\log p_\theta(x\mid z)\big] &&\text{(i)}\\
\mathrm{Var}[\hat R_K] &= \frac1{K^2}\sum_kv = \blank{a} &&\text{(ii)}\\
\nabla_\theta\hat R_K &= \frac1K\sum_k\nabla_\theta\log p_\theta(x\mid z^{(k)}),\qquad \nabla_\phi\hat R_K\big|_{z^{(k)}\ \text{figés}} = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) utilise l'[[c]] des échantillons. (iii) : la loi des échantillons ne dépend pas de $\theta$, mais elle dépend de $\phi$ ; c'est cette dépendance qu'on perd en figeant les $z^{(k)}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['v/K', R`\frac{v}{K}`], tex: R`\frac vK` },
      b: { kind: 'num', ans: 0, tol: 0 },
      c: { kind: 'word', ans: ['indépendance', 'independance', 'independence'], tex: 'indépendance' },
    } },

  { id: 'va9', ch: 7, type: 'deriv', title: 'L\'astuce de reparamétrisation', src: 'Slide p.24',
    text: R`<p class="hyp"><b>Cadre.</b> $q_\phi(z\mid x) = \mathcal N\big(z;\mu_\phi(x),\mathrm{diag}(\sigma_\phi^2(x))\big)$ ; l'encodeur sort $\mu$ et $\ln\sigma$ ; $F$ est une fonction dérivable de $z$.</p>
<p class="claim"><b>Proposition.</b> $\nabla_\phi\E_{z\sim q_\phi}[F(z)] = \E_{\varepsilon\sim\mathcal N(0,I)}\big[\nabla_\phi F(\mu_\phi(x)+\sigma_\phi(x)\odot\varepsilon)\big]$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
z = \mu+\sigma\odot\varepsilon,\ \varepsilon\sim\mathcal N(0,I)\ &\Longrightarrow\ z_j\sim\mathcal N\big(\mu_j,\ \blank{a}\big)\ \text{indépendants} &&\text{(i)}\\
\E_{z\sim q_\phi}[F(z)] &= \E_{\varepsilon}\big[F(\mu_\phi(x)+\sigma_\phi(x)\odot\varepsilon)\big] &&\text{(ii)}\\
\frac{\partial F}{\partial\mu_j} = \frac{\partial F}{\partial z_j},\qquad \frac{\partial F}{\partial(\ln\sigma_j)} &= \frac{\partial F}{\partial z_j}\cdot\blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>Dans (ii), la loi de $\varepsilon$ ne dépend pas de [[c]] : on peut dériver sous l'espérance, en gardant $\varepsilon$ fixé pendant la rétropropagation. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sigma_j^2`, 'sigma_j^2', 'σ_j^2', 'σj²'], tex: R`\sigma_j^2` },
      b: { kind: 'expr', ans: [R`\sigma_j\varepsilon_j`, R`\sigma_j \epsilon_j`, 'sigma_j epsilon_j', 'sigma_j*eps_j', 'σ_j ε_j', R`\varepsilon_j\sigma_j`], tex: R`\sigma_j\varepsilon_j` },
      c: { kind: 'expr', ans: [R`\phi`, 'phi', 'φ', 'ϕ'], tex: R`\phi` },
    } },

  { id: 'va10', ch: 7, type: 'deriv', title: 'L\'autoencodeur linéaire optimal est l\'ACP', src: 'Hors slides (§1)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> Données centrées, covariance empirique $S$ de valeurs propres $\lambda_1\ge\dots\ge\lambda_D$ et vecteurs propres $u_i$ ; reconstruction par projection orthogonale sur un sous-espace de base orthonormée $V\in\R^{D\times M}$ ($V^\top V = I$).</p>
<p class="claim"><b>Proposition.</b> L'erreur moyenne de reconstruction vaut au moins $\lambda_{M+1}+\dots+\lambda_D$, atteint pour $V = [u_1,\dots,u_M]$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\|y-VV^\top y\|^2 &= \|y\|^2-\|V^\top y\|^2\ \Longrightarrow\ E(V) = \tr S-\blank{a} &&\text{(i)}\\
\tr(V^\top SV) &= \textstyle\sum_i\lambda_ic_i,\qquad c_i = \|V^\top u_i\|^2\in[0,1],\qquad\textstyle\sum_ic_i = \blank{b} &&\text{(ii)}\\
\tr(V^\top SV) &\le\lambda_1+\dots+\lambda_M\ \Longrightarrow\ E(V)\ge\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : théorème de [[d]]. Minimiser l'erreur, c'est maximiser la variance capturée $\tr(V^\top SV)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\tr(V^\top SV)`, 'tr(V^T S V)', 'tr(V^TSV)', R`\mathrm{tr}(V^\top S V)`, 'tr(VᵀSV)'], tex: R`\tr(V^\top SV)` },
      b: { kind: 'expr', ans: ['M'], tex: 'M' },
      c: { kind: 'expr', ans: [R`\lambda_{M+1}+\dots+\lambda_D`, R`\sum_{i>M}\lambda_i`, R`\sum_{i=M+1}^D\lambda_i`, 'lambda_{M+1}+...+lambda_D', 'λ_{M+1}+...+λ_D'], tex: R`\lambda_{M+1}+\dots+\lambda_D` },
      d: { kind: 'word', ans: ['pythagore', 'pythagoras'], tex: 'Pythagore' },
    } },

  { id: 'va11', ch: 7, type: 'def', title: 'Autoencodeur ou VAE ?', src: 'Slides p.20, 29',
    text: R`<p class="hyp"><b>Cadre.</b> Un autoencodeur (AE) et un autoencodeur variationnel (VAE), tous deux avec encodeur et décodeur.</p>
<p><b>Définition.</b> Un AE encode chaque entrée comme un [[a]] $z = f_\phi(x)$ ; un VAE l'encode comme une [[b]] $q_\phi(z\mid x)$. L'objectif de l'AE est la perte de reconstruction ; celui du VAE est l'ELBO, reconstruction moins le terme $\blank{c}$. Pour générer avec un VAE : tirer $z\sim\blank{d}$, puis $x\sim p_\theta(x\mid z)$. C'est le terme KL qui relie $q_\phi(z\mid x)$ à l'[[e]] $p(z)$, et donne un sens à l'échantillonnage latent.</p>`,
    blanks: {
      a: { kind: 'word', ans: ['point', 'vecteur', 'point fixe'], tex: 'point' },
      b: { kind: 'word', ans: ['loi', 'distribution', 'densite', 'densité', 'loi de probabilite'], tex: 'loi' },
      c: { kind: 'expr', ans: [R`\mathrm{KL}(q_\phi(z|x)\|p(z))`, R`KL(q_\phi(z|x)||p(z))`, 'KL(q||p)', 'KL', R`\mathrm{KL}(q_\phi(z\mid x)\,\|\,p(z))`], tex: R`\mathrm{KL}(q_\phi(z\mid x)\,\|\,p(z))` },
      d: { kind: 'expr', ans: ['p(z)', R`\mathcal N(0,I)`, 'N(0,I)', 'N(0, I)'], tex: 'p(z)' },
      e: { kind: 'word', ans: ['a priori', 'prior', 'loi a priori'], tex: 'a priori' },
    } },

  { id: 'va12', ch: 7, type: 'calc', title: 'Calculer un terme KL', src: 'Slide p.25',
    text: R`<p class="hyp"><b>Données.</b> L'encodeur sort, pour une donnée $x$, $\mu = (1,\ 0)$ et $\ln\sigma = (0,\ -\ln2)$, donc $\sigma = (1,\ \frac12)$. A priori $p(z) = \mathcal N(0,I_2)$.</p>
<p><b>Calcul.</b> Avec $\mathrm{KL} = \frac12\sum_j(\mu_j^2+\sigma_j^2-1-2\ln\sigma_j)$ :
$$\text{coordonnée 1 : }\blank{a},\qquad\text{coordonnée 2 : }\blank{b},\qquad\mathrm{KL}\approx\blank{c}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 0.5, tol: 0.01 }, b: { kind: 'num', ans: 0.5 * (0.25 - 1 + 2 * Math.log(2)), tol: 0.01 }, c: { kind: 'num', ans: 0.5 + 0.5 * (0.25 - 1 + 2 * Math.log(2)), tol: 0.01 } } },

  { id: 'va13', ch: 7, type: 'calc', title: 'Une itération du VAE, à la main', src: 'Slides p.24–26',
    text: R`<p class="hyp"><b>Données.</b> $J = D = 1$. L'encodeur sort $\mu_\phi(x) = 0.5$, $\ln\sigma_\phi(x) = 0$. Bruit tiré : $\varepsilon = -1$. Le décodeur sort $\mu_\theta(z) = 2z$, avec $\sigma_{x\mid z} = 1$. Observation $x = 1$.</p>
<p><b>Calcul.</b> $\log p_\theta(x\mid z) = -\frac12\log2\pi-\frac12(x-\mu_\theta(z))^2$.
$$z = \mu+\sigma\varepsilon = \blank{a},\qquad \mu_\theta(z) = \blank{b},\qquad \log p_\theta(x\mid z)\approx\blank{c},\qquad \mathrm{KL}\approx\blank{d},\qquad \hat{\mathcal L}_1\approx\blank{e}.$$</p>`,
    blanks: {
      a: { kind: 'num', ans: -0.5, tol: 0.01 }, b: { kind: 'num', ans: -1, tol: 0.01 },
      c: { kind: 'num', ans: -0.5 * Math.log(2 * Math.PI) - 2, tol: 0.01 }, d: { kind: 'num', ans: 0.125, tol: 0.01 },
      e: { kind: 'num', ans: -0.5 * Math.log(2 * Math.PI) - 2 - 0.125, tol: 0.01 },
    } },
  );
})(window.ML);
