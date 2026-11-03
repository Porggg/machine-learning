/* Exercices — Chapitre 9 : k-means, soft k-means, GMM et EM, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math;
  const KM = R`<p class="hyp"><b>Cadre.</b> Données $x_1,\dots,x_N\in\R^D$, nombre de groupes $K$, centres $\mu_1,\dots,\mu_K$, affectations $r_{ik}\in\{0,1\}$ avec $\sum_kr_{ik} = 1$, et $J(r,\mu) = \sum_i\sum_kr_{ik}\|x_i-\mu_k\|^2$.</p>`;
  const GMM = R`<p class="hyp"><b>Cadre.</b> GMM $p_\theta(x) = \sum_{k=1}^K\pi_k\N(x\mid\mu_k,\Sigma_k)$, données i.i.d. $x_1,\dots,x_N$, $\mathcal L(\theta) = \sum_n\log p_\theta(x_n)$, variable latente $z_n\in[K]$ avec $p_\theta(x_n,z_n = k) = \pi_k\N(x_n\mid\mu_k,\Sigma_k)$.</p>`;
  const f = (v, d = 2) => String(+v.toFixed(d));

  // tirages partagés avec la version anglaise (en-ch9.js)
  const G = ML.EX.km9 = {
    lloyd: r => { // une itération de Lloyd en 1D, sans égalité ni groupe vide
      for (;;) {
        const xs = r.shuffle(M.range(13)).slice(0, 5).sort((a, b) => a - b), m = r.shuffle(M.range(13)).slice(0, 2).sort((a, b) => a - b);
        if (xs.some(x => Math.abs(x - m[0]) === Math.abs(x - m[1]))) continue;
        const c1 = xs.filter(x => Math.abs(x - m[0]) < Math.abs(x - m[1])), c2 = xs.filter(x => !c1.includes(x));
        if (!c1.length || !c2.length) continue;
        const m1 = M.mean(c1), m2 = M.mean(c2), J = M.sum(c1.map(x => (x - m1) ** 2)) + M.sum(c2.map(x => (x - m2) ** 2));
        return { xs, m, n1: c1.length, m1, m2, J };
      }
    },
    soft: r => { const x = r.int(9), m1 = r.int(4), m2 = 5 + r.int(6), b = [0.05, 0.1, 0.2][r.int(3)], d1 = (x - m1) ** 2, d2 = (x - m2) ** 2; return { x, m1, m2, b, d1, d2, r1: 1 / (1 + Math.exp(-b * (d2 - d1))) }; },
    estep: r => {
      const m1 = -r.int(2), m2 = 1 + r.int(2), p = [0.5, 0.25, 0.75][r.int(3)], x1 = -1 - r.int(2), x2 = r.int(3);
      const rr = x => { const a = p * Math.exp(-0.5 * (x - m1) ** 2), b = (1 - p) * Math.exp(-0.5 * (x - m2) ** 2); return a / (a + b); };
      const r1 = rr(x1), r2 = rr(x2);
      return { m1, m2, p, x1, x2, r1, r2, mu: (r1 * x1 + r2 * x2) / (r1 + r2), pi: (r1 + r2) / 2 };
    },
    maha: r => { const s1 = 2 + r.int(3), s2 = [0.5, 1][r.int(2)], u = 1 + r.int(4), v = r.int(2); return { s1, s2, u, v, e: Math.hypot(u, v), d: Math.sqrt(u * u / (s1 * s1) + v * v / (s2 * s2)) }; },
  };

  ML.EX.add(
  { id: 'km1', ch: 9, type: 'def', title: 'L\'objectif du k-means', src: 'Slide p.7 · PRML éq. 9.1',
    text: R`<p class="hyp"><b>Cadre.</b> Données $x_1,\dots,x_N\in\R^D$ sans étiquettes, nombre de groupes $K\in\{1,\dots,N\}$ donné.</p>
<p><b>Définition.</b> Le k-means cherche des centres $\mu = \{\mu_k\}$ et des affectations $r$ qui résolvent
$$\min_{\mu,r}\ J(r,\mu) = \sum_{i\in[N]}\sum_{k\in[K]}\blank{a}\qquad\text{s.c.}\quad r_{ik}\in\blank{b}\ \ \forall i,k,\qquad\sum_{k\in[K]}r_{ik} = \blank{c}\ \ \forall i.$$
Cette minimisation n'est pas [[d]] : on utilise un algorithme itératif.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`r_{ik}\|x_i-\mu_k\|_2^2`, R`r_{ik}\|x_i-\mu_k\|^2`, 'r_ik||x_i-mu_k||^2', 'r_ik ||x_i - mu_k||_2^2', 'r_{ik}||x_i-mu_k||^2'], tex: R`r_{ik}\|x_i-\mu_k\|_2^2` },
      b: { kind: 'expr', ans: [R`\{0,1\}`, '{0,1}', '(0,1)'], tex: R`\{0,1\}` },
      c: { kind: 'num', ans: 1, tol: 0 },
      d: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
    } },

  { id: 'km2', ch: 9, type: 'deriv', title: 'Les deux minimisations faciles du k-means', src: 'Slides p.7–9 · PRML éq. 9.2–9.4',
    text: KM + R`<p class="claim"><b>Proposition.</b> À $\mu$ fixé, le meilleur $r$ affecte chaque point au centre le plus proche ; à $r$ fixé, le meilleur $\mu_k$ est la moyenne de son groupe.</p>
<p><b>Preuve.</b> À $\mu$ fixé, $J = \sum_i\sum_kr_{ik}d_{ik}$ avec $d_{ik} = \|x_i-\mu_k\|^2$, et chaque ligne $r_i$ se choisit séparément : on met $r_{ik} = 1$ pour $k = \blank{a}$. À $r$ fixé,</p>
$$\begin{aligned}
\nabla_{\mu_k}J &= \blank{b} = 0 &&\text{(i)}\\
\mu_k &= \blank{c}. &&\text{(ii)}
\end{aligned}$$
<p>La hessienne en $\mu_k$ vaut $2\big(\sum_ir_{ik}\big)I\succ0$ : la fonction est [[d]], et ce point critique est son minimum. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\argmin_\ell\|x_i-\mu_\ell\|^2`, R`\arg\min_\ell\|x_i-\mu_\ell\|^2`, 'argmin_l ||x_i-mu_l||^2', 'argmin_l||x_i-mu_l||', R`\argmin_{\ell}\|x_i-\mu_\ell\|_2^2`, 'argmin_j ||x_i-mu_j||^2'], tex: R`\argmin_\ell\|x_i-\mu_\ell\|^2` },
      b: { kind: 'expr', ans: [R`-2\sum_ir_{ik}(x_i-\mu_k)`, '-2sum_i r_ik(x_i-mu_k)', R`2\sum_ir_{ik}(\mu_k-x_i)`, '2sum_i r_ik(mu_k-x_i)', R`-2\sum_i r_{ik}(x_i-\mu_k)`], tex: R`-2\sum_ir_{ik}(x_i-\mu_k)` },
      c: { kind: 'expr', ans: [R`\frac{\sum_ir_{ik}x_i}{\sum_ir_{ik}}`, '(sum_i r_ik x_i)/(sum_i r_ik)', 'sum_i r_ik x_i / sum_i r_ik', R`\frac{1}{|C_k|}\sum_{i\in C_k}x_i`], tex: R`\frac{\sum_ir_{ik}x_i}{\sum_ir_{ik}}` },
      d: { kind: 'word', ans: ['convexe', 'convex', 'strictement convexe', 'strictly convex'], tex: 'convexe' },
    } },

  { id: 'km3', ch: 9, type: 'deriv', title: 'Monotonie et arrêt de l\'algorithme de Lloyd', src: 'Slide p.10',
    text: KM + R`<p class="claim"><b>Proposition.</b> Chaque étape fait décroître $J$ (au sens large), et sans groupe vide, avec une règle d'égalité fixe, l'algorithme s'arrête en un nombre fini d'itérations.</p>
<p><b>Preuve.</b></p>
$$J\big(r^{(t)},\mu^{(t)}\big)\ \blank{a}\ J\big(r^{(t+1)},\mu^{(t)}\big)\ \ge\ J\big(r^{(t+1)},\mu^{(t+1)}\big).$$
<p>La première inégalité vient de $r^{(t+1)} = \argmin_rJ(r,\blank{b})$, la seconde de $\mu^{(t+1)} = \argmin_\mu J(r^{(t+1)},\mu)$ : à chaque fois, l'ancienne valeur est un candidat. Tant que les affectations changent, $J$ après la mise à jour baisse strictement, donc aucune partition n'est revisitée ; il y en a au plus $\blank{c}$. L'algorithme s'arrête donc en un nombre [[d]] d'itérations, sur un minimum [[e]] qui n'est pas forcément global. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\ge`, '>=', '≥', R`\geq`], tex: R`\ge` },
      b: { kind: 'expr', ans: [R`\mu^{(t)}`, 'mu^(t)', 'mu^t', 'mu^{(t)}'], tex: R`\mu^{(t)}` },
      c: { kind: 'expr', ans: ['K^N', 'K^{N}'], tex: 'K^N' },
      d: { kind: 'word', ans: ['fini', 'finite'], tex: 'fini' },
      e: { kind: 'word', ans: ['local', 'locale', 'par blocs', 'par bloc', 'block', 'blockwise', 'coordinatewise'], tex: 'local (par blocs)' },
    } },

  { id: 'km4', ch: 9, type: 'deriv', title: 'Les frontières du k-means sont des médiatrices', src: 'Slide p.8 · PRML fig. 9.1',
    text: R`<p class="hyp"><b>Cadre.</b> Deux centres $\mu_1\ne\mu_2$ dans $\R^D$ ; un point $x$ va au groupe 1 si $\|x-\mu_1\|^2\le\|x-\mu_2\|^2$.</p>
<p class="claim"><b>Proposition.</b> La frontière entre les deux groupes est l'hyperplan médiateur de $[\mu_1,\mu_2]$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\|x-\mu_k\|^2 &= \|x\|^2-\blank{a}+\|\mu_k\|^2 &&\text{(i)}\\
\|x-\mu_1\|^2\le\|x-\mu_2\|^2 &\iff(\mu_2-\mu_1)^\top x\le\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) est linéaire en $x$ car $\|x\|^2$ se simplifie : la frontière est un hyperplan orthogonal à $\blank{c}$ passant par $\blank{d}$. Avec $K$ centres, chaque groupe est une intersection de demi-espaces : un polyèdre [[e]] (cellule de Voronoï). $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`2\mu_k^\top x`, '2mu_k^T x', '2x^Tmu_k', R`2x^\top\mu_k`, '2 mu_k^t x'], tex: R`2\mu_k^\top x` },
      b: { kind: 'expr', ans: [R`\frac12(\|\mu_2\|^2-\|\mu_1\|^2)`, '(||mu_2||^2-||mu_1||^2)/2', R`\frac{\|\mu_2\|^2-\|\mu_1\|^2}{2}`, '1/2(||mu_2||^2-||mu_1||^2)', R`\tfrac12\big(\|\mu_2\|^2-\|\mu_1\|^2\big)`, R`\frac12\big(\|\mu_2\|^2-\|\mu_1\|^2\big)`], tex: R`\tfrac12\big(\|\mu_2\|^2-\|\mu_1\|^2\big)` },
      c: { kind: 'expr', ans: [R`\mu_2-\mu_1`, 'mu_2-mu_1', R`\mu_1-\mu_2`, 'mu_1-mu_2'], tex: R`\mu_2-\mu_1` },
      d: { kind: 'expr', ans: [R`\frac{\mu_1+\mu_2}{2}`, '(mu_1+mu_2)/2', R`\frac12(\mu_1+\mu_2)`, R`\tfrac{\mu_1+\mu_2}2`, R`\frac{\mu_1+\mu_2}2`], tex: R`\tfrac{\mu_1+\mu_2}2` },
      e: { kind: 'word', ans: ['convexe', 'convex'], tex: 'convexe' },
    } },

  { id: 'km5', ch: 9, type: 'calc', title: 'Une itération de Lloyd en 1D', src: 'Slide p.9',
    gen: r => {
      const g = G.lloyd(r);
      return { text: R`<p class="hyp"><b>Données.</b> $D = 1$, $K = 2$, points $${g.xs.join(',\\ ')}$, centres initiaux $\mu_1 = ${g.m[0]}$, $\mu_2 = ${g.m[1]}$.</p>
<p><b>Calcul.</b> Après l'étape d'affectation puis l'étape de mise à jour :
$$|C_1| = \blank{a},\qquad\mu_1^{\text{new}} = \blank{b},\qquad\mu_2^{\text{new}} = \blank{c},\qquad J(r,\mu^{\text{new}}) = \blank{d}.$$</p>`,
        blanks: { a: { kind: 'num', ans: g.n1, tol: 0 }, b: { kind: 'num', ans: g.m1 }, c: { kind: 'num', ans: g.m2 }, d: { kind: 'num', ans: g.J } } };
    } },

  { id: 'km6', ch: 9, type: 'calc', title: 'Le k-means dur bloqué (exemple de la slide 14)', src: 'Slides p.14, 18',
    text: R`<p class="hyp"><b>Données.</b> $D = 1$, points $0,\ 4,\ 10$, $K = 2$, centres initiaux $\mu = (0,4)$.</p>
<p><b>Calcul.</b> Après une itération du k-means, $\mu_2 = \blank{a}$. Le point en 4 est alors à distance $\blank{b}$ de $\mu_1$ et $\blank{c}$ de $\mu_2$ : il ne change pas de groupe, et l'algorithme s'arrête avec $J = \blank{d}$. La partition $\{0,4\},\{10\}$ donnerait $J = \blank{e}$.</p>`,
    blanks: { a: { kind: 'num', ans: 7, tol: 0 }, b: { kind: 'num', ans: 4, tol: 0 }, c: { kind: 'num', ans: 3, tol: 0 }, d: { kind: 'num', ans: 18, tol: 0 }, e: { kind: 'num', ans: 8, tol: 0 } } },

  { id: 'km7', ch: 9, type: 'deriv', title: 'Soft k-means : les affectations optimales', src: 'Slide p.16',
    text: R`<p class="hyp"><b>Cadre.</b> $\beta>0$, $d_{ik} = \|x_i-\mu_k\|^2$, et $J_{\text{soft}} = \sum_{i,k}r_{ik}d_{ik}+\frac1\beta\sum_{i,k}r_{ik}\log r_{ik}$ sous $r_{ik}\ge0$, $\sum_kr_{ik} = 1$.</p>
<p class="claim"><b>Proposition.</b> À $\mu$ fixé, $r_{ik}$ est un softmax des $-\beta d_{ik}$.</p>
<p><b>Preuve.</b> Avec un multiplicateur $\lambda_i$ par point, $A_i = \sum_kr_{ik}d_{ik}+\frac1\beta\sum_kr_{ik}\log r_{ik}+\lambda_i\big(\sum_kr_{ik}-1\big)$.</p>
$$\begin{aligned}
\frac{\partial A_i}{\partial r_{ik}} &= d_{ik}+\blank{a}+\lambda_i = 0 &&\text{(i)}\\
r_{ik} &= e^{-1-\beta\lambda_i}\,\blank{b} &&\text{(ii)}\\
r_{ik} &= \blank{c} &&\text{(iii)}
\end{aligned}$$
<p>(iii) vient de $\sum_kr_{ik} = 1$. Quand $\beta\to\infty$, on retrouve le k-means [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac1\beta(\log r_{ik}+1)`, '(log r_ik + 1)/beta', R`\frac{1}{\beta}(\log r_{ik}+1)`, '1/beta(log r_ik+1)', R`\frac{\log r_{ik}+1}{\beta}`, R`\tfrac1\beta(\log r_{ik}+1)`, R`\frac1\beta(\log r_{ik}+1)`], tex: R`\tfrac1\beta(\log r_{ik}+1)` },
      b: { kind: 'expr', ans: [R`e^{-\beta d_{ik}}`, 'e^(-beta d_ik)', R`\exp(-\beta d_{ik})`, 'exp(-beta d_ik)', R`e^{-\beta\|x_i-\mu_k\|^2}`], tex: R`e^{-\beta d_{ik}}` },
      c: { kind: 'expr', ans: [R`\frac{e^{-\beta d_{ik}}}{\sum_\ell e^{-\beta d_{i\ell}}}`, 'e^(-beta d_ik)/sum_l e^(-beta d_il)', R`\frac{\exp(-\beta d_{ik})}{\sum_\ell\exp(-\beta d_{i\ell})}`, 'exp(-beta d_ik)/sum_l exp(-beta d_il)', R`\frac{e^{-\beta d_{ik}}}{\sum_{\ell}e^{-\beta d_{i\ell}}}`], tex: R`\frac{e^{-\beta d_{ik}}}{\sum_\ell e^{-\beta d_{i\ell}}}` },
      d: { kind: 'word', ans: ['dur', 'hard', 'classique', 'standard'], tex: 'dur' },
    } },

  { id: 'km8', ch: 9, type: 'calc', title: 'Une affectation souple à la main', src: 'Slides p.16–17',
    gen: r => {
      const g = G.soft(r);
      return { text: R`<p class="hyp"><b>Données.</b> $D = 1$, un point $x = ${g.x}$, deux centres $\mu_1 = ${g.m1}$, $\mu_2 = ${g.m2}$, raideur $\beta = ${g.b}$.</p>
<p><b>Calcul.</b>
$$\|x-\mu_1\|^2 = \blank{a},\qquad\|x-\mu_2\|^2 = \blank{b},\qquad r_1 = \frac{e^{-\beta\|x-\mu_1\|^2}}{e^{-\beta\|x-\mu_1\|^2}+e^{-\beta\|x-\mu_2\|^2}} = \blank{c}.$$</p>`,
        blanks: { a: { kind: 'num', ans: g.d1, tol: 0 }, b: { kind: 'num', ans: g.d2, tol: 0 }, c: { kind: 'num', ans: g.r1, tol: 0.01 } } };
    } },

  { id: 'km9', ch: 9, type: 'def', title: 'Modèle de mélange et GMM', src: 'Slides p.20–21',
    text: R`<p class="hyp"><b>Cadre.</b> $K$ lois composantes $p_1,\dots,p_K$ et une variable latente $z\in[K]$.</p>
<p><b>Définition.</b> Un modèle de mélange fini s'écrit $p(x) = \sum_k\blank{a}$, avec $\pi_k := \blank{b}$, $\pi_k\ge0$ et $\sum_k\pi_k = 1$. Pour tirer un point : $z\sim$ loi [[c]]$(\pi_1,\dots,\pi_K)$, puis $x\sim p_z$. Dans un GMM, $p_k = \N(\cdot\mid\mu_k,\Sigma_k)$ et
$$\N(x\mid\mu_k,\Sigma_k)\propto\exp\Big(-\frac12d_k(x)^2\Big),\qquad d_k(x)^2 = \blank{d}.$$
Si $\Sigma_k = \sigma^2I$, $d_k(x)^2 = \blank{e}$.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`p_k(x)\pi_k`, R`\pi_kp_k(x)`, 'pi_k p_k(x)', 'p_k(x) pi_k', R`p_k(x)\cdot\pi_k`], tex: R`\pi_k\,p_k(x)` },
      b: { kind: 'expr', ans: ['p(z=k)', 'P(z=k)'], tex: 'p(z = k)' },
      c: { kind: 'word', ans: ['categorielle', 'catégorielle', 'categorical', 'categorique', 'multinomiale'], tex: 'catégorielle' },
      d: { kind: 'expr', ans: [R`(x-\mu_k)^\top\Sigma_k^{-1}(x-\mu_k)`, '(x-mu_k)^T Sigma_k^-1 (x-mu_k)', '(x-mu_k)^TSigma_k^{-1}(x-mu_k)', '(x-mu_k)^t sigma_k^-1 (x-mu_k)'], tex: R`(x-\mu_k)^\top\Sigma_k^{-1}(x-\mu_k)` },
      e: { kind: 'expr', ans: [R`\frac{\|x-\mu_k\|^2}{\sigma^2}`, '||x-mu_k||^2/sigma^2', R`\|x-\mu_k\|_2^2/\sigma^2`, R`\frac{\|x-\mu_k\|_2^2}{\sigma^2}`], tex: R`\|x-\mu_k\|_2^2/\sigma^2` },
    } },

  { id: 'km10', ch: 9, type: 'calc', title: 'Distance euclidienne et distance de Mahalanobis', src: 'Slides p.21–22',
    gen: r => {
      const g = G.maha(r);
      return { text: R`<p class="hyp"><b>Données.</b> $\mu_k = (0,0)$, $\Sigma_k = \mathrm{diag}(${g.s1 * g.s1},\ ${g.s2 * g.s2})$, $x = (${g.u},\ ${g.v})$.</p>
<p><b>Calcul.</b>
$$\|x-\mu_k\| = \blank{a},\qquad d_k(x) = \sqrt{(x-\mu_k)^\top\Sigma_k^{-1}(x-\mu_k)} = \blank{b}.$$</p>`,
        blanks: { a: { kind: 'num', ans: g.e }, b: { kind: 'num', ans: g.d } } };
    } },

  { id: 'km11', ch: 9, type: 'deriv', title: 'La borne inférieure de Jensen', src: 'Slide p.25',
    text: GMM + R`<p class="claim"><b>Proposition.</b> Pour tous $r_{nk}>0$ avec $\sum_kr_{nk} = 1$, $F(r,\theta) := \sum_{n,k}r_{nk}\log p_\theta(x_n,z_n = k)-\sum_{n,k}r_{nk}\log r_{nk}\le\mathcal L(\theta)$.</p>
<p><b>Preuve.</b> Pour chaque $n$ :</p>
$$\begin{aligned}
\log p_\theta(x_n) &= \log\sum_kr_{nk}\,\frac{p_\theta(x_n,z_n = k)}{\blank{a}} &&\text{(i)}\\
&\ge\sum_kr_{nk}\,\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) est l'inégalité de Jensen, car $\log$ est [[c]]. En sommant sur $n$, on obtient $\mathcal L\ge F$. L'écart exact est $\mathcal L(\theta)-F(r,\theta) = \sum_n\mathrm{KL}\big(r_n\,\|\,\blank{d}\big)$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['r_{nk}', 'r_nk', 'rnk'], tex: 'r_{nk}' },
      b: { kind: 'expr', ans: [R`\log\frac{p_\theta(x_n,z_n=k)}{r_{nk}}`, 'log(p_theta(x_n,z_n=k)/r_nk)', 'log p(x_n,z_n=k)/r_nk', R`\log\frac{p(x_n,z_n=k)}{r_{nk}}`, 'log(p(x_n,z_n=k)/r_nk)'], tex: R`\log\frac{p_\theta(x_n,z_n = k)}{r_{nk}}` },
      c: { kind: 'word', ans: ['concave'], tex: 'concave' },
      d: { kind: 'expr', ans: [R`p_\theta(z_n|x_n)`, R`p_\theta(z_n\mid x_n)`, 'p_theta(z_n|x_n)', 'p(z_n|x_n)', R`p_\theta(\cdot|x_n)`], tex: R`p_\theta(z_n\mid x_n)` },
    } },

  { id: 'km12', ch: 9, type: 'deriv', title: 'Étape E : la loi a posteriori, et une borne serrée', src: 'Slides p.31–32',
    text: GMM + R`<p class="claim"><b>Proposition.</b> $\argmax_rF(r,\theta^{\text{old}})$ est $r_{nk} = p_{\theta^{\text{old}}}(z_n = k\mid x_n)$, et alors $F(r,\theta^{\text{old}}) = \mathcal L(\theta^{\text{old}})$.</p>
<p><b>Preuve.</b> Pour chaque $n$, avec $a_{nk} = p_{\theta^{\text{old}}}(x_n,z_n = k)$, on maximise $\sum_kr_{nk}(\log a_{nk}-\log r_{nk})$ sous $\sum_kr_{nk} = 1$ (multiplicateur $\lambda_n$) :</p>
$$\begin{aligned}
\log a_{nk}-\log r_{nk}-1+\lambda_n = 0\ &\Longrightarrow\ r_{nk} = \blank{a} &&\text{(i)}\\
\textstyle\sum_kr_{nk} = 1\ &\Longrightarrow\ r_{nk} = \blank{b} = p_{\theta^{\text{old}}}(z_n = k\mid x_n) &&\text{(ii)}
\end{aligned}$$
<p>En ce point, $\log(a_{nk}/r_{nk}) = \log p_{\theta^{\text{old}}}(x_n)$ pour tout $k$, d'où $F(r,\theta^{\text{old}}) = \blank{c}$ : la borne est [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`a_{nk}e^{\lambda_n-1}`, 'a_nk e^(lambda_n-1)', R`a_{nk}\exp(\lambda_n-1)`, 'a_nk exp(lambda_n-1)', R`e^{\lambda_n-1}a_{nk}`], tex: R`a_{nk}\,e^{\lambda_n-1}` },
      b: { kind: 'expr', ans: [R`\frac{a_{nk}}{\sum_\ell a_{n\ell}}`, 'a_nk/sum_l a_nl', R`\frac{a_{nk}}{\sum_{\ell}a_{n\ell}}`, 'a_nk/(sum_l a_nl)'], tex: R`\frac{a_{nk}}{\sum_\ell a_{n\ell}}` },
      c: { kind: 'expr', ans: [R`\mathcal L(\theta^{\text{old}})`, 'L(theta^old)', R`\mathcal{L}(\theta^{old})`, 'L(θ^old)', R`\sum_n\log p_{\theta^{\text{old}}}(x_n)`], tex: R`\mathcal L(\theta^{\text{old}})` },
      d: { kind: 'word', ans: ['serree', 'serrée', 'tight', 'atteinte', 'exacte'], tex: 'serrée' },
    } },

  { id: 'km13', ch: 9, type: 'deriv', title: 'Étape M : moyennes et poids', src: 'Slides p.35, 37',
    text: GMM + R`<p class="claim"><b>Proposition.</b> Avec $N_k = \sum_nr_{nk}$ : $\mu_k^{\text{new}} = \sum_nr_{nk}x_n/N_k$ et $\pi_k^{\text{new}} = N_k/N$.</p>
<p><b>Preuve.</b> $Q(\theta) = \sum_{n,k}r_{nk}\big(\log\pi_k-\frac12\log|\Sigma_k|-\frac12(x_n-\mu_k)^\top\Sigma_k^{-1}(x_n-\mu_k)\big)+C$.</p>
$$\begin{aligned}
\nabla_{\mu_k}Q &= \Sigma_k^{-1}\sum_n\blank{a} = 0\ \Longrightarrow\ \mu_k^{\text{new}} = \frac{\sum_nr_{nk}x_n}{\blank{b}} &&\text{(i)}\\
A(\pi,\lambda) &= \sum_kN_k\log\pi_k+\lambda\Big(1-\sum_k\pi_k\Big),\qquad\frac{\partial A}{\partial\pi_k} = \blank{c} = 0 &&\text{(ii)}\\
\lambda &= \sum_kN_k = \blank{d}\ \Longrightarrow\ \pi_k^{\text{new}} = N_k/N. &&\text{(iii)}
\end{aligned}$$
<p>$\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`r_{nk}(x_n-\mu_k)`, 'r_nk(x_n-mu_k)', 'r_nk (x_n - mu_k)'], tex: R`r_{nk}(x_n-\mu_k)` },
      b: { kind: 'expr', ans: ['N_k', 'Nk', R`\sum_nr_{nk}`, 'sum_n r_nk'], tex: 'N_k' },
      c: { kind: 'expr', ans: [R`\frac{N_k}{\pi_k}-\lambda`, 'N_k/pi_k-lambda', 'N_k/pi_k - lambda'], tex: R`\frac{N_k}{\pi_k}-\lambda` },
      d: { kind: 'expr', ans: ['N'], tex: 'N' },
    } },

  { id: 'km14', ch: 9, type: 'deriv', title: 'Étape M : covariances', src: 'Slide p.36',
    text: GMM + R`<p class="claim"><b>Proposition.</b> Avec $S_k = \sum_nr_{nk}(x_n-\mu_k^{\text{new}})(x_n-\mu_k^{\text{new}})^\top$ : $\Sigma_k^{\text{new}} = S_k/N_k$.</p>
<p><b>Preuve.</b> On paramètre par la précision $\Lambda_k = \Sigma_k^{-1}$ et on utilise $v^\top\Lambda_kv = \tr(\Lambda_kvv^\top)$ :</p>
$$\begin{aligned}
Q_k(\Lambda_k) &= \frac{N_k}2\log|\Lambda_k|-\frac12\,\blank{a}+C &&\text{(i)}\\
\nabla_{\Lambda_k}Q_k &= \frac{N_k}2\,\blank{b}-\frac12S_k = 0 &&\text{(ii)}\\
\Sigma_k^{\text{new}} &= \blank{c} &&\text{(iii)}
\end{aligned}$$
<p>(ii) utilise $\nabla_\Lambda\log|\Lambda| = \Lambda^{-1}$ et $\nabla_\Lambda\tr(\Lambda S) = \blank{d}$ pour des matrices symétriques. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\tr(\Lambda_kS_k)`, 'tr(Lambda_k S_k)', R`\mathrm{tr}(\Lambda_kS_k)`, 'tr(Lambda_kS_k)', R`\operatorname{tr}(\Lambda_kS_k)`], tex: R`\tr(\Lambda_kS_k)` },
      b: { kind: 'expr', ans: [R`\Lambda_k^{-1}`, 'Lambda_k^-1', 'Lambda_k^{-1}', R`\Sigma_k`], tex: R`\Lambda_k^{-1}` },
      c: { kind: 'expr', ans: [R`\frac{S_k}{N_k}`, 'S_k/N_k'], tex: R`S_k/N_k` },
      d: { kind: 'expr', ans: ['S', 'S_k'], tex: 'S' },
    } },

  { id: 'km15', ch: 9, type: 'deriv', title: 'EM ne fait jamais baisser la vraisemblance', src: 'Slide p.38',
    text: GMM + R`<p class="claim"><b>Proposition.</b> Une itération exacte d'EM vérifie $\mathcal L(\theta^{\text{new}})\ge\mathcal L(\theta^{\text{old}})$.</p>
<p><b>Preuve.</b></p>
$$\mathcal L(\theta^{\text{old}})\ \blank{a}\ F(r,\theta^{\text{old}})\ \blank{b}\ F(r,\theta^{\text{new}})\ \le\ \mathcal L(\theta^{\text{new}}).$$
<p>La première relation vient de l'étape E : $r$ est la loi [[c]] de $z_n$, et la borne y est serrée. La deuxième vient de l'étape M : $F(r,\theta) = Q(\theta;\theta^{\text{old}})+\blank{d}$, où le second terme ne dépend pas de $\theta$, et $\theta^{\text{new}}$ maximise $Q$. La dernière est la borne de Jensen. Un optimum global n'est pas garanti. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['=', R`=`], tex: '=' },
      b: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      c: { kind: 'word', ans: ['a posteriori', 'posterior', 'posteriori', 'conditionnelle'], tex: 'a posteriori' },
      d: { kind: 'expr', ans: ['H(r)', R`-\sum_{n,k}r_{nk}\log r_{nk}`, '-sum r_nk log r_nk', 'H'], tex: 'H(r)' },
    } },

  { id: 'km16', ch: 9, type: 'deriv', title: 'Le k-means comme cas limite d\'EM', src: 'Slides p.28–29 · PRML §9.3.2',
    text: R`<p class="hyp"><b>Cadre.</b> GMM restreint : $\pi_k = 1/K$ et $\Sigma_k = \sigma^2I$ pour tout $k$ ; on n'apprend que les moyennes. $d_{nk}^2 = \|x_n-\mu_k\|^2$, et $k_n$ est l'unique centre le plus proche de $x_n$.</p>
<p class="claim"><b>Proposition.</b> EM est le soft k-means avec $\beta = 1/(2\sigma^2)$ ; quand $\sigma^2\to0$, c'est le k-means.</p>
<p><b>Preuve.</b> Les poids égaux et la constante de normalisation gaussienne se simplifient :</p>
$$\begin{aligned}
r_{nk} &= \frac{e^{-d_{nk}^2/\blank{a}}}{\sum_\ell e^{-d_{n\ell}^2/\blank{a}}},\qquad\beta = \blank{b} &&\text{(i)}\\
r_{nk} &= \frac{e^{-(d_{nk}^2-d_{nk_n}^2)/(2\sigma^2)}}{\sum_\ell e^{-(d_{n\ell}^2-d_{nk_n}^2)/(2\sigma^2)}}\ \xrightarrow[\sigma^2\to0]{}\ \begin{cases}1 & k = \blank{c}\\0 & \text{sinon}\end{cases} &&\text{(ii)}\\
\mu_k^{\text{new}} &\to\blank{d}\qquad(C_k = \{n : k_n = k\}\ne\emptyset). &&\text{(iii)}
\end{aligned}$$
<p>$\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`2\sigma^2`, '2sigma^2', '(2sigma^2)', '2σ^2'], tex: R`2\sigma^2` },
      b: { kind: 'expr', ans: [R`\frac{1}{2\sigma^2}`, '1/(2sigma^2)', '1/2sigma^2', R`\frac1{2\sigma^2}`], tex: R`\frac1{2\sigma^2}` },
      c: { kind: 'expr', ans: ['k_n', 'kn', R`\argmin_\ell d_{n\ell}`, 'argmin_l d_nl'], tex: 'k_n' },
      d: { kind: 'expr', ans: [R`\frac{1}{|C_k|}\sum_{n\in C_k}x_n`, '1/|C_k| sum_{n in C_k} x_n', R`\frac{\sum_{n\in C_k}x_n}{|C_k|}`, '(sum_{n in C_k} x_n)/|C_k|', R`\frac1{|C_k|}\sum_{n\in C_k}x_n`], tex: R`\frac1{|C_k|}\sum_{n\in C_k}x_n` },
    } },

  { id: 'km17', ch: 9, type: 'calc', title: 'Une itération d\'EM en 1D', src: 'Slide p.27',
    gen: r => {
      const g = G.estep(r);
      return { text: R`<p class="hyp"><b>Données.</b> GMM 1D à deux composantes de variance 1 : $\pi_1 = ${g.p}$, $\mu_1 = ${g.m1}$, $\mu_2 = ${g.m2}$. Deux points $x_1 = ${g.x1}$, $x_2 = ${g.x2}$.</p>
<p><b>Calcul.</b> Étape E, puis étape M pour la composante 1 :
$$r_{11} = \blank{a},\qquad r_{21} = \blank{b},\qquad\mu_1^{\text{new}} = \blank{c},\qquad\pi_1^{\text{new}} = \blank{d}.$$</p>`,
        blanks: { a: { kind: 'num', ans: g.r1 }, b: { kind: 'num', ans: g.r2 }, c: { kind: 'num', ans: g.mu, tol: 0.02 }, d: { kind: 'num', ans: g.pi } } };
    } },

  { id: 'km18', ch: 9, type: 'def', title: 'Propriétés pratiques du k-means et d\'EM', src: 'Slides p.10, 39',
    text: R`<p class="hyp"><b>Cadre.</b> $N$ points de $\R^D$, $K$ groupes.</p>
<p><b>Définition.</b> Une itération du k-means coûte $O(\blank{a})$ pour l'affectation et $O(\blank{b})$ pour la mise à jour. k-means++ choisit chaque nouveau centre initial avec une probabilité proportionnelle à $\blank{c}$, le carré de la distance au plus proche centre déjà choisi. Pour EM, on initialise souvent les moyennes avec les centres d'un [[d]], et on impose $\Sigma_k\succeq\blank{e}$ pour éviter l'effondrement d'une covariance.</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['KND', 'NKD', 'NDK', 'KDN', 'DKN', 'DNK'], tex: 'KND' },
      b: { kind: 'expr', ans: ['ND', 'DN'], tex: 'ND' },
      c: { kind: 'expr', ans: ['D(x)^2', 'D(x_i)^2', R`D(x)^2`, 'd(x)^2', R`\min_k\|x-\mu_k\|^2`], tex: 'D(x)^2' },
      d: { kind: 'word', ans: ['k-means', 'kmeans', 'k means', 'k-moyennes'], tex: 'k-means' },
      e: { kind: 'expr', ans: [R`\varepsilon I`, 'epsilon I', 'epsI', R`\epsilon I`, 'εI', 'ε I'], tex: R`\varepsilon I` },
    } },
  );
})(window.ML);
