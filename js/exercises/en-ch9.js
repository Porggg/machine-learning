/* English version — Chapter 9: k-means, soft k-means, GMM and EM */
(function (ML) {
  'use strict';
  const R = String.raw, G = ML.EX.km9;
  const KM = R`<p class="hyp"><b>Setup.</b> Data $x_1,\dots,x_N\in\R^D$, number of clusters $K$, centers $\mu_1,\dots,\mu_K$, assignments $r_{ik}\in\{0,1\}$ with $\sum_kr_{ik} = 1$, and $J(r,\mu) = \sum_i\sum_kr_{ik}\|x_i-\mu_k\|^2$.</p>`;
  const GMM = R`<p class="hyp"><b>Setup.</b> GMM $p_\theta(x) = \sum_{k=1}^K\pi_k\N(x\mid\mu_k,\Sigma_k)$, i.i.d. data $x_1,\dots,x_N$, $\mathcal L(\theta) = \sum_n\log p_\theta(x_n)$, latent variable $z_n\in[K]$ with $p_\theta(x_n,z_n = k) = \pi_k\N(x_n\mid\mu_k,\Sigma_k)$.</p>`;

  ML.EX.en({
  km1: { title: 'The k-means objective',
    text: R`<p class="hyp"><b>Setup.</b> Unlabeled data $x_1,\dots,x_N\in\R^D$, given number of clusters $K\in\{1,\dots,N\}$.</p>
<p><b>Definition.</b> K-means looks for centers $\mu = \{\mu_k\}$ and assignments $r$ solving
$$\min_{\mu,r}\ J(r,\mu) = \sum_{i\in[N]}\sum_{k\in[K]}\blank{a}\qquad\text{s.t.}\quad r_{ik}\in\blank{b}\ \ \forall i,k,\qquad\sum_{k\in[K]}r_{ik} = \blank{c}\ \ \forall i.$$
This minimization is not [[d]], so we use an iterative algorithm.</p>`,
    words: { d: { ans: ['convex', 'convexe'], tex: 'convex' } } },

  km2: { title: 'The two easy minimizations of k-means',
    text: KM + R`<p class="claim"><b>Proposition.</b> For fixed $\mu$, the best $r$ assigns each point to its nearest center; for fixed $r$, the best $\mu_k$ is the mean of its cluster.</p>
<p><b>Proof.</b> For fixed $\mu$, $J = \sum_i\sum_kr_{ik}d_{ik}$ with $d_{ik} = \|x_i-\mu_k\|^2$, and each row $r_i$ is chosen separately: set $r_{ik} = 1$ for $k = \blank{a}$. For fixed $r$,</p>
$$\begin{aligned}
\nabla_{\mu_k}J &= \blank{b} = 0 &&\text{(i)}\\
\mu_k &= \blank{c}. &&\text{(ii)}
\end{aligned}$$
<p>The Hessian in $\mu_k$ is $2\big(\sum_ir_{ik}\big)I\succ0$: the function is [[d]], so this critical point is its minimum. $\square$</p>`,
    words: { d: { ans: ['convex', 'strictly convex', 'convexe'], tex: 'convex' } } },

  km3: { title: 'Monotonicity and termination of Lloyd\'s algorithm',
    text: KM + R`<p class="claim"><b>Proposition.</b> Each step does not increase $J$, and with no empty cluster and a fixed tie rule, the algorithm stops after finitely many iterations.</p>
<p><b>Proof.</b></p>
$$J\big(r^{(t)},\mu^{(t)}\big)\ \blank{a}\ J\big(r^{(t+1)},\mu^{(t)}\big)\ \ge\ J\big(r^{(t+1)},\mu^{(t+1)}\big).$$
<p>The first inequality holds because $r^{(t+1)} = \argmin_rJ(r,\blank{b})$, the second because $\mu^{(t+1)} = \argmin_\mu J(r^{(t+1)},\mu)$: each time, the old value is a candidate. While the assignments change, $J$ after the update strictly decreases, so no partition is visited twice; there are at most $\blank{c}$ of them. Hence the algorithm stops after a [[d]] number of iterations, at a [[e]] minimum that need not be global. $\square$</p>`,
    words: { d: { ans: ['finite', 'fini'], tex: 'finite' }, e: { ans: ['local', 'block', 'blockwise', 'coordinatewise', 'locale'], tex: 'local (blockwise)' } } },

  km4: { title: 'K-means boundaries are perpendicular bisectors',
    text: R`<p class="hyp"><b>Setup.</b> Two centers $\mu_1\ne\mu_2$ in $\R^D$; a point $x$ goes to cluster 1 if $\|x-\mu_1\|^2\le\|x-\mu_2\|^2$.</p>
<p class="claim"><b>Proposition.</b> The boundary between the two clusters is the perpendicular bisector hyperplane of $[\mu_1,\mu_2]$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\|x-\mu_k\|^2 &= \|x\|^2-\blank{a}+\|\mu_k\|^2 &&\text{(i)}\\
\|x-\mu_1\|^2\le\|x-\mu_2\|^2 &\iff(\mu_2-\mu_1)^\top x\le\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) is linear in $x$ because $\|x\|^2$ cancels: the boundary is a hyperplane orthogonal to $\blank{c}$ through $\blank{d}$. With $K$ centers, each cluster is an intersection of half-spaces: a [[e]] polyhedron (Voronoi cell). $\square$</p>`,
    words: { e: { ans: ['convex', 'convexe'], tex: 'convex' } } },

  km5: { title: 'One Lloyd iteration in 1D',
    gen: r => {
      const g = G.lloyd(r);
      return { text: R`<p class="hyp"><b>Data.</b> $D = 1$, $K = 2$, points $${g.xs.join(',\\ ')}$, initial centers $\mu_1 = ${g.m[0]}$, $\mu_2 = ${g.m[1]}$.</p>
<p><b>Computation.</b> After the assignment step and then the update step:
$$|C_1| = \blank{a},\qquad\mu_1^{\text{new}} = \blank{b},\qquad\mu_2^{\text{new}} = \blank{c},\qquad J(r,\mu^{\text{new}}) = \blank{d}.$$</p>` };
    } },

  km6: { title: 'Hard k-means gets stuck (slide 14 example)',
    text: R`<p class="hyp"><b>Data.</b> $D = 1$, points $0,\ 4,\ 10$, $K = 2$, initial centers $\mu = (0,4)$.</p>
<p><b>Computation.</b> After one k-means iteration, $\mu_2 = \blank{a}$. The point at 4 is then at distance $\blank{b}$ from $\mu_1$ and $\blank{c}$ from $\mu_2$: it does not change cluster, and the algorithm stops with $J = \blank{d}$. The partition $\{0,4\},\{10\}$ would give $J = \blank{e}$.</p>` },

  km7: { title: 'Soft k-means: the optimal assignments',
    text: R`<p class="hyp"><b>Setup.</b> $\beta>0$, $d_{ik} = \|x_i-\mu_k\|^2$, and $J_{\text{soft}} = \sum_{i,k}r_{ik}d_{ik}+\frac1\beta\sum_{i,k}r_{ik}\log r_{ik}$ subject to $r_{ik}\ge0$, $\sum_kr_{ik} = 1$.</p>
<p class="claim"><b>Proposition.</b> For fixed $\mu$, $r_{ik}$ is a softmax of the $-\beta d_{ik}$.</p>
<p><b>Proof.</b> With one multiplier $\lambda_i$ per point, $A_i = \sum_kr_{ik}d_{ik}+\frac1\beta\sum_kr_{ik}\log r_{ik}+\lambda_i\big(\sum_kr_{ik}-1\big)$.</p>
$$\begin{aligned}
\frac{\partial A_i}{\partial r_{ik}} &= d_{ik}+\blank{a}+\lambda_i = 0 &&\text{(i)}\\
r_{ik} &= e^{-1-\beta\lambda_i}\,\blank{b} &&\text{(ii)}\\
r_{ik} &= \blank{c} &&\text{(iii)}
\end{aligned}$$
<p>(iii) follows from $\sum_kr_{ik} = 1$. As $\beta\to\infty$, we recover [[d]] k-means. $\square$</p>`,
    words: { d: { ans: ['hard', 'standard', 'dur'], tex: 'hard' } } },

  km8: { title: 'A soft assignment by hand',
    gen: r => {
      const g = G.soft(r);
      return { text: R`<p class="hyp"><b>Data.</b> $D = 1$, one point $x = ${g.x}$, two centers $\mu_1 = ${g.m1}$, $\mu_2 = ${g.m2}$, stiffness $\beta = ${g.b}$.</p>
<p><b>Computation.</b>
$$\|x-\mu_1\|^2 = \blank{a},\qquad\|x-\mu_2\|^2 = \blank{b},\qquad r_1 = \frac{e^{-\beta\|x-\mu_1\|^2}}{e^{-\beta\|x-\mu_1\|^2}+e^{-\beta\|x-\mu_2\|^2}} = \blank{c}.$$</p>` };
    } },

  km9: { title: 'Mixture model and GMM',
    text: R`<p class="hyp"><b>Setup.</b> $K$ component distributions $p_1,\dots,p_K$ and a latent variable $z\in[K]$.</p>
<p><b>Definition.</b> A finite mixture model is $p(x) = \sum_k\blank{a}$, with $\pi_k := \blank{b}$, $\pi_k\ge0$ and $\sum_k\pi_k = 1$. To sample a point: $z\sim$ [[c]]$(\pi_1,\dots,\pi_K)$, then $x\sim p_z$. In a GMM, $p_k = \N(\cdot\mid\mu_k,\Sigma_k)$ and
$$\N(x\mid\mu_k,\Sigma_k)\propto\exp\Big(-\frac12d_k(x)^2\Big),\qquad d_k(x)^2 = \blank{d}.$$
If $\Sigma_k = \sigma^2I$, then $d_k(x)^2 = \blank{e}$.</p>`,
    words: { c: { ans: ['categorical', 'categorielle', 'multinomial'], tex: 'Categorical' } } },

  km10: { title: 'Euclidean and Mahalanobis distances',
    gen: r => {
      const g = G.maha(r);
      return { text: R`<p class="hyp"><b>Data.</b> $\mu_k = (0,0)$, $\Sigma_k = \mathrm{diag}(${g.s1 * g.s1},\ ${g.s2 * g.s2})$, $x = (${g.u},\ ${g.v})$.</p>
<p><b>Computation.</b>
$$\|x-\mu_k\| = \blank{a},\qquad d_k(x) = \sqrt{(x-\mu_k)^\top\Sigma_k^{-1}(x-\mu_k)} = \blank{b}.$$</p>` };
    } },

  km11: { title: 'Jensen\'s lower bound',
    text: GMM + R`<p class="claim"><b>Proposition.</b> For all $r_{nk}>0$ with $\sum_kr_{nk} = 1$, $F(r,\theta) := \sum_{n,k}r_{nk}\log p_\theta(x_n,z_n = k)-\sum_{n,k}r_{nk}\log r_{nk}\le\mathcal L(\theta)$.</p>
<p><b>Proof.</b> For each $n$:</p>
$$\begin{aligned}
\log p_\theta(x_n) &= \log\sum_kr_{nk}\,\frac{p_\theta(x_n,z_n = k)}{\blank{a}} &&\text{(i)}\\
&\ge\sum_kr_{nk}\,\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) is Jensen's inequality, since $\log$ is [[c]]. Summing over $n$ gives $\mathcal L\ge F$. The exact gap is $\mathcal L(\theta)-F(r,\theta) = \sum_n\mathrm{KL}\big(r_n\,\|\,\blank{d}\big)$. $\square$</p>`,
    words: { c: { ans: ['concave'], tex: 'concave' } } },

  km12: { title: 'E-step: the posterior, and a tight bound',
    text: GMM + R`<p class="claim"><b>Proposition.</b> $\argmax_rF(r,\theta^{\text{old}})$ is $r_{nk} = p_{\theta^{\text{old}}}(z_n = k\mid x_n)$, and then $F(r,\theta^{\text{old}}) = \mathcal L(\theta^{\text{old}})$.</p>
<p><b>Proof.</b> For each $n$, with $a_{nk} = p_{\theta^{\text{old}}}(x_n,z_n = k)$, maximize $\sum_kr_{nk}(\log a_{nk}-\log r_{nk})$ subject to $\sum_kr_{nk} = 1$ (multiplier $\lambda_n$):</p>
$$\begin{aligned}
\log a_{nk}-\log r_{nk}-1+\lambda_n = 0\ &\Longrightarrow\ r_{nk} = \blank{a} &&\text{(i)}\\
\textstyle\sum_kr_{nk} = 1\ &\Longrightarrow\ r_{nk} = \blank{b} = p_{\theta^{\text{old}}}(z_n = k\mid x_n) &&\text{(ii)}
\end{aligned}$$
<p>At this point, $\log(a_{nk}/r_{nk}) = \log p_{\theta^{\text{old}}}(x_n)$ for every $k$, so $F(r,\theta^{\text{old}}) = \blank{c}$: the bound is [[d]]. $\square$</p>`,
    words: { d: { ans: ['tight', 'exact', 'serree'], tex: 'tight' } } },

  km13: { title: 'M-step: means and weights',
    text: GMM + R`<p class="claim"><b>Proposition.</b> With $N_k = \sum_nr_{nk}$: $\mu_k^{\text{new}} = \sum_nr_{nk}x_n/N_k$ and $\pi_k^{\text{new}} = N_k/N$.</p>
<p><b>Proof.</b> $Q(\theta) = \sum_{n,k}r_{nk}\big(\log\pi_k-\frac12\log|\Sigma_k|-\frac12(x_n-\mu_k)^\top\Sigma_k^{-1}(x_n-\mu_k)\big)+C$.</p>
$$\begin{aligned}
\nabla_{\mu_k}Q &= \Sigma_k^{-1}\sum_n\blank{a} = 0\ \Longrightarrow\ \mu_k^{\text{new}} = \frac{\sum_nr_{nk}x_n}{\blank{b}} &&\text{(i)}\\
A(\pi,\lambda) &= \sum_kN_k\log\pi_k+\lambda\Big(1-\sum_k\pi_k\Big),\qquad\frac{\partial A}{\partial\pi_k} = \blank{c} = 0 &&\text{(ii)}\\
\lambda &= \sum_kN_k = \blank{d}\ \Longrightarrow\ \pi_k^{\text{new}} = N_k/N. &&\text{(iii)}
\end{aligned}$$
<p>$\square$</p>` },

  km14: { title: 'M-step: covariances',
    text: GMM + R`<p class="claim"><b>Proposition.</b> With $S_k = \sum_nr_{nk}(x_n-\mu_k^{\text{new}})(x_n-\mu_k^{\text{new}})^\top$: $\Sigma_k^{\text{new}} = S_k/N_k$.</p>
<p><b>Proof.</b> Parametrize by the precision $\Lambda_k = \Sigma_k^{-1}$ and use $v^\top\Lambda_kv = \tr(\Lambda_kvv^\top)$:</p>
$$\begin{aligned}
Q_k(\Lambda_k) &= \frac{N_k}2\log|\Lambda_k|-\frac12\,\blank{a}+C &&\text{(i)}\\
\nabla_{\Lambda_k}Q_k &= \frac{N_k}2\,\blank{b}-\frac12S_k = 0 &&\text{(ii)}\\
\Sigma_k^{\text{new}} &= \blank{c} &&\text{(iii)}
\end{aligned}$$
<p>(ii) uses $\nabla_\Lambda\log|\Lambda| = \Lambda^{-1}$ and $\nabla_\Lambda\tr(\Lambda S) = \blank{d}$ for symmetric matrices. $\square$</p>` },

  km15: { title: 'EM never decreases the likelihood',
    text: GMM + R`<p class="claim"><b>Proposition.</b> An exact EM iteration satisfies $\mathcal L(\theta^{\text{new}})\ge\mathcal L(\theta^{\text{old}})$.</p>
<p><b>Proof.</b></p>
$$\mathcal L(\theta^{\text{old}})\ \blank{a}\ F(r,\theta^{\text{old}})\ \blank{b}\ F(r,\theta^{\text{new}})\ \le\ \mathcal L(\theta^{\text{new}}).$$
<p>The first relation comes from the E-step: $r$ is the [[c]] distribution of $z_n$, where the bound is tight. The second comes from the M-step: $F(r,\theta) = Q(\theta;\theta^{\text{old}})+\blank{d}$, where the second term does not depend on $\theta$, and $\theta^{\text{new}}$ maximizes $Q$. The last one is Jensen's bound. A global optimum is not guaranteed. $\square$</p>`,
    words: { c: { ans: ['posterior', 'a posteriori', 'conditional'], tex: 'posterior' } } },

  km16: { title: 'K-means as a limiting case of EM',
    text: R`<p class="hyp"><b>Setup.</b> Restricted GMM: $\pi_k = 1/K$ and $\Sigma_k = \sigma^2I$ for all $k$; only the means are learned. $d_{nk}^2 = \|x_n-\mu_k\|^2$, and $k_n$ is the unique nearest center of $x_n$.</p>
<p class="claim"><b>Proposition.</b> EM is soft k-means with $\beta = 1/(2\sigma^2)$; as $\sigma^2\to0$, it is k-means.</p>
<p><b>Proof.</b> The equal weights and the Gaussian normalizing constant cancel:</p>
$$\begin{aligned}
r_{nk} &= \frac{e^{-d_{nk}^2/\blank{a}}}{\sum_\ell e^{-d_{n\ell}^2/\blank{a}}},\qquad\beta = \blank{b} &&\text{(i)}\\
r_{nk} &= \frac{e^{-(d_{nk}^2-d_{nk_n}^2)/(2\sigma^2)}}{\sum_\ell e^{-(d_{n\ell}^2-d_{nk_n}^2)/(2\sigma^2)}}\ \xrightarrow[\sigma^2\to0]{}\ \begin{cases}1 & k = \blank{c}\\0 & \text{otherwise}\end{cases} &&\text{(ii)}\\
\mu_k^{\text{new}} &\to\blank{d}\qquad(C_k = \{n : k_n = k\}\ne\emptyset). &&\text{(iii)}
\end{aligned}$$
<p>$\square$</p>` },

  km17: { title: 'One EM iteration in 1D',
    gen: r => {
      const g = G.estep(r);
      return { text: R`<p class="hyp"><b>Data.</b> 1D GMM with two unit-variance components: $\pi_1 = ${g.p}$, $\mu_1 = ${g.m1}$, $\mu_2 = ${g.m2}$. Two points $x_1 = ${g.x1}$, $x_2 = ${g.x2}$.</p>
<p><b>Computation.</b> E-step, then M-step for component 1:
$$r_{11} = \blank{a},\qquad r_{21} = \blank{b},\qquad\mu_1^{\text{new}} = \blank{c},\qquad\pi_1^{\text{new}} = \blank{d}.$$</p>` };
    } },

  km18: { title: 'Practical properties of k-means and EM',
    text: R`<p class="hyp"><b>Setup.</b> $N$ points in $\R^D$, $K$ clusters.</p>
<p><b>Definition.</b> One k-means iteration costs $O(\blank{a})$ for the assignment and $O(\blank{b})$ for the update. K-means++ picks each new initial center with probability proportional to $\blank{c}$, the squared distance to the nearest center already chosen. For EM, the means are often initialized with the centers of a [[d]] run, and one imposes $\Sigma_k\succeq\blank{e}$ to avoid covariance collapse.</p>`,
    words: { d: { ans: ['k-means', 'kmeans', 'k means'], tex: 'k-means' } } },
  });
})(window.ML);
