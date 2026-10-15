/* English version — homework questions HW1–HW4 (self-contained) */
(function (ML) {
  'use strict';
  const R = String.raw;

  ML.EX.en({
  // ------------------------------------------------------------------ HW1
  h1a: { title: 'MSE decomposition and the cross term',
    text: R`<p class="hyp"><b>Setup.</b> $(X,Y)$ a pair of random variables, $f$ a predictor, $m(X) = \E[Y\mid X]$; assume $Y = g(X)+\varepsilon$ with $\varepsilon$ independent of $X$, zero-mean, of variance $\sigma^2$.</p>
<p class="claim"><b>Proposition.</b> The smallest possible MSE is $\sigma^2$, attained by $f = m$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E[(Y-f)^2] &= \E[(Y-m)^2]+2\,\E\big[(m-f)\,\blank{a}\big]+\E[(m-f)^2] &&\text{(i)}\\
\E[Y-m(X)\mid X] &= \blank{b} &&\text{(ii)}\\
\E[(Y-m)^2] &= \E\big[\Var(Y\mid X)\big] = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) uses the law of total expectation for the cross term, which vanishes by (ii). (iii): given $X$, $Y-m(X) = \varepsilon$. The last term of (i) is $\ge0$ and zero for $f = m$. $\square$</p>` },

  h1b: { title: 'Polynomial regression: normal equations and convexity',
    text: R`<p class="hyp"><b>Setup.</b> $f(x) = \sum_{k=0}^Mw_kx^k$ fitted to $N$ points by minimizing $\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2$.</p>
<p class="claim"><b>Proposition.</b> $\bPhi\in\R^{N\times(M+1)}$ with $\Phi_{nk} = x_n^k$; minimizers satisfy $\bPhi\T\bPhi\bw = \bPhi\T\by$; $\EMSE$ is convex.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\Phi_{nk} &= \blank{a},\qquad\bPhi\in\R^{N\times\blank{b}} &&\text{(i)}\\
\nabla\EMSE(\bw) &= \tfrac2N\bPhi\T(\bPhi\bw-\by) = 0\ \iff\ \blank{c} &&\text{(ii)}\\
\bv\T\nabla^2\EMSE\,\bv &= \tfrac2N\bv\T\bPhi\T\bPhi\bv = \tfrac2N\blank{d}\ \ge0. &&\text{(iii)}
\end{aligned}$$
<p>By (iii) the Hessian is positive semidefinite: every stationary point is a global minimum. $\square$</p>` },

  h1c: { title: 'Gaussian noise: MLE = least squares (and $\\hat\\sigma^2$)',
    text: R`<p class="hyp"><b>Setup.</b> $y_n\mid\bw\sim\N(\bw\T\bphi_n,\sigma^2)$ independent, $n = 1,\dots,N$; $\bPhi$ has rows $\bphi_n\T$.</p>
<p class="claim"><b>Proposition.</b> $\hat\bw_{\text{MLE}} = \hat\bw_{\text{LS}}$ for every $\sigma$, and $\hat\sigma^2_{\text{MLE}} = \frac1N\|\by-\bPhi\hat\bw\|^2$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\ln\mathcal L(\bw,\sigma^2) &= \blank{a}-\frac1{2\sigma^2}\|\by-\bPhi\bw\|^2 &&\text{(i)}\\
\arg\max_\bw\ln\mathcal L &= \arg\min_\bw\blank{b} &&\text{(ii)}\\
\frac{\partial\ln\mathcal L}{\partial\sigma^2} &= -\frac N{2\sigma^2}+\frac{\|\by-\bPhi\bw\|^2}{2\sigma^4} = 0\ \iff\ \sigma^2 = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii): the first term of (i) does not depend on $\bw$ and $\frac1{2\sigma^2}>0$. $\square$</p>` },

  h1d: { title: 'Prior $\\N(0,\\tau^2\\bI)$: MAP = ridge with $\\lambda = \\sigma^2/(N\\tau^2)$',
    text: R`<p class="hyp"><b>Setup.</b> $y_n\mid\bw\sim\N(\bw\T\bphi_n,\sigma^2)$ independent ($n = 1,\dots,N$), prior $\bw\sim\N(0,\tau^2\bI)$; ridge: $\min_\bw\frac1N\|\by-\bPhi\bw\|^2+\lambda\|\bw\|^2$.</p>
<p class="claim"><b>Proposition.</b> $\hat\bw_{\text{MAP}}$ is ridge with $\lambda = \frac{\sigma^2}{N\tau^2}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
-\ln p(\bw\mid\by) &= \tfrac1{2\sigma^2}\|\by-\bPhi\bw\|^2+\blank{a}+\text{const} &&\text{(i)}\\
\tfrac{2\sigma^2}N\times(\text{i}):\quad&\tfrac1N\|\by-\bPhi\bw\|^2+\blank{b}\,\|\bw\|^2+\text{const} &&\text{(ii)}\\
\hat\bw_{\text{MAP}} &= (\blank{c})^{-1}\bPhi\T\by. &&\text{(iii)}
\end{aligned}$$
<p>(ii): multiplying by a positive constant does not change the argmin. (iii): zero gradient of (ii). $\square$</p>` },

  h1e: { title: 'The mini-batch gradient is unbiased',
    text: R`<p class="hyp"><b>Setup.</b> $\hL(\bw) = \frac1N\sum_{i=1}^N\ell_i(\bw)$; $\mathcal B$ uniform among the subsets of size $B$ of $\{1,\dots,N\}$.</p>
<p class="claim"><b>Proposition.</b> $\E_{\mathcal B}\big[\frac1B\sum_{i\in\mathcal B}\nabla\ell_i(\bw)\big] = \nabla\hL(\bw)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\tfrac1B\textstyle\sum_{i\in\mathcal B}\nabla\ell_i &= \tfrac1B\textstyle\sum_{i=1}^N\blank{a}\,\nabla\ell_i &&\text{(i)}\\
P(i\in\mathcal B) &= \binom{N-1}{B-1}\Big/\binom NB = \blank{b} &&\text{(ii)}\\
\E_{\mathcal B}\Big[\tfrac1B\textstyle\sum_{i\in\mathcal B}\nabla\ell_i\Big] &= \tfrac1B\textstyle\sum_iP(i\in\mathcal B)\,\nabla\ell_i = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii): choose the other $B-1$ elements among $N-1$. (iii): by linearity, only the indicators are random. $\square$</p>` },

  h1f: { title: 'Polynomial degree and regularization: what we observe',
    text: R`<p class="hyp"><b>Setup.</b> A polynomial of degree $M$ is fitted to $N$ noisy points of a smooth function; the MSE is measured on these points (train) and on new points (test).</p>
<p><b>Observations to justify.</b> $M$ too small: train and test both high, this is [[a]]. $M$ close to $N-1$: train $\approx0$, test large, this is [[b]]. Ridge with large $M$, as $\lambda$ grows: $\|\hat\bw\|$ [[c]], the training MSE [[d]], and the test MSE as a function of $\lambda$ is [[e]]-shaped.</p>`,
    words: { a: { ans: ['underfitting', 'under-fitting'], tex: 'underfitting' }, b: { ans: ['overfitting', 'over-fitting'], tex: 'overfitting' }, c: { ans: ['decreases', 'shrinks', 'goes down'], tex: 'decreases' }, d: { ans: ['increases', 'grows', 'goes up'], tex: 'increases' } } },

  // ------------------------------------------------------------------ HW2
  h2a: { title: 'Two-class softmax = logistic regression',
    text: R`<p class="hyp"><b>Setup.</b> $p(Y = k\mid\bx) = \frac{e^{\bw_k\T\bx}}{e^{\bw_0\T\bx}+e^{\bw_1\T\bx}}$, $k\in\{0,1\}$.</p>
<p class="claim"><b>Proposition.</b> $p(Y = 1\mid\bx) = \sigma\big((\bw_1-\bw_0)\T\bx\big)$, and $(\bw_0+\mathbf a,\bw_1+\mathbf a)$ gives the same probabilities.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p(Y = 1\mid\bx) &= \frac{1}{e^{(\bw_0-\bw_1)\T\bx}+1} = \sigma\big(\blank{a}\big) &&\text{(i)}\\
\frac{e^{(\bw_k+\mathbf a)\T\bx}}{\sum_je^{(\bw_j+\mathbf a)\T\bx}} &= \frac{\blank{b}\,e^{\bw_k\T\bx}}{\blank{b}\sum_je^{\bw_j\T\bx}} = p(Y = k\mid\bx). &&\text{(ii)}
\end{aligned}$$
<p>(i): divide by $e^{\bw_1\T\bx}$. By (ii), the parameters $(\bw_0,\bw_1)$ are not [[c]]. $\square$</p>`,
    words: { c: { ans: ['identifiable', 'unique'], tex: 'identifiable' } } },

  h2b: { title: 'The cross-entropy is the negative log-likelihood',
    text: R`<p class="hyp"><b>Setup.</b> $\hat y_n = \sigma(\bw\T\bx_n)$, $y_n\in\{0,1\}$, $L_{\mathrm{CE}}(\bw) = -\frac1N\sum_n\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big]$. On $\{0,1\}$: $p_n(y) = \mathbb 1[y = y_n]$ and $q_{\bw,n}(y) = p(y\mid\bx_n,\bw)$.</p>
<p class="claim"><b>Proposition.</b> $L_{\mathrm{CE}}(\bw) = \frac1N\sum_nH(p_n,q_{\bw,n})$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
H(p_n,q_{\bw,n}) &= -\sum_{y\in\{0,1\}}p_n(y)\ln q_{\bw,n}(y) = \blank{a} &&\text{(i)}\\
\ln p(y_n\mid\bx_n,\bw) &= \ln\big(\hat y_n^{\,y_n}(1-\hat y_n)^{1-y_n}\big) = y_n\ln\hat y_n+\blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>(i): only the term $y = y_n$ remains. Averaging over $n$: minimizing the cross-entropy is maximizing the [[c]]. $\square$</p>`,
    words: { c: { ans: ['likelihood', 'log-likelihood'], tex: 'likelihood' } } },

  h2c: { title: 'The best constant in $L_{01}\\le C\\,L_{\\mathrm{CE}}$',
    text: R`<p class="hyp"><b>Setup.</b> $\hat y_n = \sigma(\bw\T\bx_n)$, $y_n\in\{0,1\}$, $h_\bw(\bx) = \mathbb 1[\hat y\ge\frac12]$, $L_{01} = \frac1N\sum_n\mathbb 1[h_\bw(\bx_n)\ne y_n]$, $\ell_n = -\ln p(y_n\mid\bx_n,\bw)$, $L_{\mathrm{CE}} = \frac1N\sum_n\ell_n$.</p>
<p class="claim"><b>Proposition.</b> $L_{01}\le\frac1{\ln2}L_{\mathrm{CE}}$, and $\frac1{\ln2}$ is the smallest possible constant.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\text{error with } y_n = 1:\quad\hat y_n\lt\tfrac12\ &\Longrightarrow\ \ell_n = -\ln\hat y_n\ \blank{a}\ \ln2 &&\text{(i)}\\
\text{error with } y_n = 0:\quad 1-\hat y_n\le\tfrac12\ &\Longrightarrow\ \ell_n = -\ln(1-\hat y_n)\ge\ln2 &&\text{(ii)}\\
\mathbb 1[\text{error}_n] &\le\frac{\ell_n}{\ln2}\ \Longrightarrow\ L_{01}\le\blank{b}\,L_{\mathrm{CE}}. &&\text{(iii)}
\end{aligned}$$
<p>Optimality: with a single example, $y_1 = 0$ and $\hat y_1 = \blank{c}$, the example is classified 1 (tie convention), so $L_{01} = 1$ and $L_{\mathrm{CE}} = \ln2$: equality holds. $\square$</p>` },

  h2d: { title: 'Gradient, Hessian and one Newton step by hand',
    text: R`<p class="hyp"><b>Data.</b> Logistic regression without bias, $\hat y_n = \sigma(\bw\T\bx_n)$, $N\nabla L = \sum_n(\hat y_n-y_n)\bx_n$, $N\nabla^2L = \sum_n\hat y_n(1-\hat y_n)\bx_n\bx_n\T$. $\bx_1 = (-2,-2)$, $y_1 = 1$; $\bx_2 = (-2,2)$, $y_2 = 1$; $\bx_3 = (-2,0)$, $y_3 = 0$; $\bw^{(0)} = 0$.</p>
<p><b>Computation.</b>
$$\begin{aligned}
\hat y_n &= \sigma(0) = \blank{a}\quad(n = 1,2,3)\\
N\nabla L &= -\tfrac12(-2,-2)-\tfrac12(-2,2)+\tfrac12(-2,0) = (\blank{b},\ 0)\\
N\nabla^2L &= \tfrac14\textstyle\sum_n\bx_n\bx_n\T = \mathrm{diag}(\blank{c},\ 2)\\
\bw^{(1)} &= \bw^{(0)}-(N\nabla^2L)^{-1}(N\nabla L) = (\blank{d},\ 0)
\end{aligned}$$</p>` },

  h2e: { title: 'Finding the exact minimizer',
    text: R`<p class="hyp"><b>Data.</b> Same model and points: $\bx_1 = (-2,-2)$, $y_1 = 1$; $\bx_2 = (-2,2)$, $y_2 = 1$; $\bx_3 = (-2,0)$, $y_3 = 0$; $\nabla L\propto\sum_n(\hat y_n-y_n)\bx_n$. With $\bw = (a,b)$: $\hat y_1 = \sigma(-2a-2b)$, $\hat y_2 = \sigma(-2a+2b)$, $\hat y_3 = \sigma(-2a)$.</p>
<p><b>Computation.</b>
$$\begin{aligned}
\text{2nd component:}\ 2(\hat y_2-\hat y_1) = 0\ &\Longrightarrow\ \sigma(-2a+2b) = \sigma(-2a-2b)\ \Longrightarrow\ b = \blank{a}\\
\text{1st component:}\ 3s-2 = 0\ &\Longrightarrow\ s = \sigma(-2a) = \blank{b}\ \Longrightarrow\ a = \blank{c}\\
\big\|(-\tfrac13,0)-\bw^\star\big\|_1 &\approx\blank{d}
\end{aligned}$$
The first line uses that $\sigma$ is injective.</p>`,
    solution: R`$-2a = \ln\frac{2/3}{1/3} = \ln2$; $(-\frac13,0)$ is the Newton step from 0, at distance $0.0132$ from the optimum.` },

  // ------------------------------------------------------------------ HW3
  h3a: { title: 'Geometric margin and normalization',
    text: R`<p class="hyp"><b>Setup.</b> Data $(\bx_i,y_i)$, $y_i\in\{-1,+1\}$; hyperplane $H = \{\bw\T\bx+b = 0\}$ that strictly separates: $y_i(\bw\T\bx_i+b)>0$ for all $i$.</p>
<p class="claim"><b>Proposition.</b> The margin equals $\frac{\min_iy_i(\bw\T\bx_i+b)}{\|\bw\|}$; one can impose $\min_iy_i(\bw\T\bx_i+b) = 1$; the optimal margin is $\frac1{\|\bw^\star\|}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\mathrm{dist}(\bx_i,H) &= \frac{|\bw\T\bx_i+b|}{\|\bw\|} = \frac{\blank{a}}{\|\bw\|} &&\text{(i)}\\
m = \min_iy_i(\bw\T\bx_i+b)>0,\quad\lambda = \blank{b}\ &\Longrightarrow\ \min_iy_i(\lambda\bw\T\bx_i+\lambda b) = 1 &&\text{(ii)}\\
\rho^\star &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) since $|y_i| = 1$ and $y_i(\bw\T\bx_i+b)>0$. (ii) changes neither the boundary nor the margin. $\square$</p>` },

  h3b: { title: 'Deriving the dual of the hard-margin SVM',
    text: R`<p class="hyp"><b>Setup.</b> $L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$, $\alpha_i\ge0$, $g(\boldsymbol\alpha) = \inf_{\bw,b}L$.</p>
<p class="claim"><b>Proposition.</b> $g(\boldsymbol\alpha) = -\infty$ if $\sum_i\alpha_iy_i\ne0$, and otherwise $g(\boldsymbol\alpha) = \sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\bx_i\T\bx_j$.</p>
<p><b>Proof.</b> With $\bv = \sum_i\alpha_iy_i\bx_i$ and $s = \sum_i\alpha_iy_i$:</p>
$$\begin{aligned}
L &= \tfrac12\bw\T\bw-\bw\T\bv+\textstyle\sum_i\alpha_i-b\,\blank{a} &&\text{(i)}\\
s\ne0:\quad L(0,b,\boldsymbol\alpha) &= \textstyle\sum_i\alpha_i-sb\ \xrightarrow[b\to\pm\infty]{}\ \blank{b} &&\text{(ii)}\\
s = 0:\quad\nabla_\bw L = 0\iff\bw = \bv,\quad g(\boldsymbol\alpha) &= \tfrac12\bv\T\bv-\bv\T\bv+\textstyle\sum_i\alpha_i = \sum_i\alpha_i-\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(iii): $L$ is quadratic in $\bw$ with Hessian $\bI$, hence strictly convex. Stationarity in $b$ does not determine $b^\star$, because for $s = 0$, $L$ no longer [[d]] on $b$. $\square$</p>`,
    words: { d: { ans: ['depends', 'depend'], tex: 'depends' } } },

  h3c: { title: 'Proving complementary slackness, then finding $b^\\star$',
    text: R`<p class="hyp"><b>Setup.</b> Same hard-margin Lagrangian: $L(\bw,b,\boldsymbol\alpha) = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$, $g = \inf_{\bw,b}L$. $(\bw^\star,b^\star)$ primal optimal ($p^\star = \frac12\|\bw^\star\|^2$), $\boldsymbol\alpha^\star\ge0$ dual optimal, strong duality $g(\boldsymbol\alpha^\star) = p^\star$. Write $c_i = 1-y_i(\bw^{\star\top}\bx_i+b^\star)$.</p>
<p class="claim"><b>Proposition.</b> $\alpha_i^\star c_i = 0$ for all $i$; if $\alpha_s^\star>0$, $b^\star = y_s-\bw^{\star\top}\bx_s$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
g(\boldsymbol\alpha^\star) &\le L(\bw^\star,b^\star,\boldsymbol\alpha^\star) = \tfrac12\|\bw^\star\|^2+\textstyle\sum_i\alpha_i^\star c_i\le p^\star &&\text{(i)}\\
g(\boldsymbol\alpha^\star) = p^\star\ &\Longrightarrow\ \textstyle\sum_i\alpha_i^\star c_i = \blank{a} &&\text{(ii)}\\
\alpha_s^\star>0\ &\Longrightarrow\ c_s = 0\ \Longrightarrow\ b^\star = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i): an infimum is below each value, and $\alpha_i^\star\ge0$ with $c_i\,\blank{c}\,0$ (feasibility). (ii): both ends are equal; terms that are all $\le0$ and sum to zero are all [[d]]. (iii): multiply $y_s(\bw^{\star\top}\bx_s+b^\star) = 1$ by $y_s$. $\square$</p>`,
    words: { d: { ans: ['zero', 'null', 'equal to zero'], tex: 'zero' } } },

  h3d: { title: 'Reading the slacks $\\xi_i$ of the soft margin',
    text: R`<p class="hyp"><b>Setup.</b> Soft SVM: $\min\frac12\|\bw\|^2+C\sum_i\xi_i$ subject to $y_if(\bx_i)\ge1-\xi_i$, $\xi_i\ge0$; at the optimum $\xi_i = \max\{0,1-y_if(\bx_i)\}$.</p>
<p class="claim"><b>Proposition.</b> $\sum_i\xi_i$ upper-bounds the number of training errors.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\xi_i = 0\ &\iff\ y_if(\bx_i)\ge1\quad\text{(correct, outside the street)}\\
0\lt\xi_i\lt1\ &\iff\ 0\lt y_if(\bx_i)\lt1\quad\text{(correct but inside the street)}\\
\xi_i\ge1\ &\iff\ y_if(\bx_i)\le\blank{a}\quad\text{(on the boundary or misclassified)}
\end{aligned}$$
<p>Each error therefore has $\xi_i\ge\blank{b}$, and every $\xi_i\ge0$: $\sum_i\xi_i\ge\#\text{errors}$. A very large $C$ approaches the [[c]] margin. $\square$</p>`,
    words: { c: { ans: ['hard'], tex: 'hard' } } },

  h3e: { title: 'A point that makes the hard margin infeasible',
    text: R`<p class="hyp"><b>Data.</b> Negatives $\bx_1 = (0,-1)$, $\bx_2 = (-2,0)$, $\bx_3 = (-1,-2)$; positives $(2,1)$, $(2,3)$, $(4,1)$; we add $\bx_7 = (-1,-1)$ with $y_7 = +1$.</p>
<p class="claim"><b>Proposition.</b> The hard-margin SVM becomes infeasible.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\tfrac13(\bx_1+\bx_2+\bx_3) &= \blank{a} &&\text{(i)}\\
f(\bx_7) &= \tfrac13\big(f(\bx_1)+f(\bx_2)+f(\bx_3)\big)\le\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii): $f$ is affine, and the constraints of the negatives impose $f(\bx_i)\le-1$. But $y_7 = +1$ requires $f(\bx_7)\ge1$: contradiction. With the soft margin and $\bw = (\frac13,\frac23)$, $b = -\frac13$: $\xi_7 = 1-y_7f(\bx_7) = \blank{c}$. $\square$</p>` },

  // ------------------------------------------------------------------ HW4
  h4a: { title: 'Training versus generalization error ($N = 2$)',
    text: R`<p class="hyp"><b>Setup.</b> Squared loss; $X = 0$ a.s., $Y = \pm1$ with probability $\frac12$; $S = \{(0,y_1),(0,y_2)\}$ i.i.d.; $\hat f = \bar y = \frac{y_1+y_2}2$.</p>
<p class="claim"><b>Proposition.</b> $\E_S[\hL_S(\hat f)] = \frac12$ and $\E_S[L(\hat f)] = \frac32$.</p>
<p><b>Proof.</b> The 4 pairs $(y_1,y_2)$ have probability $\frac14$.</p>
$$\begin{aligned}
y_1 = y_2:\ \hL_S(\hat f) = \blank{a};\qquad y_1\ne y_2:\ \hL_S(\hat f) = 1\ &\Longrightarrow\ \E_S[\hL_S(\hat f)] = \tfrac12 &&\text{(i)}\\
L(c) = \tfrac12(1-c)^2+\tfrac12(-1-c)^2 &= \blank{b} &&\text{(ii)}\\
\E_S[L(\hat f)] = \E[1+\bar y^2] = 1+\tfrac12\cdot1+\tfrac12\cdot0 &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(iii): $\bar y = \pm1$ with probability $\frac12$, $\bar y = 0$ otherwise. The gap comes from using $S$ both to [[d]] and to evaluate $\hat f$. $\square$</p>`,
    words: { d: { ans: ['fit', 'train', 'build', 'learn'], tex: 'fit' } } },

  h4b: { title: 'A generalization gap of $2/N$',
    text: R`<p class="hyp"><b>Setup.</b> $X = 0$ a.s., $Y = \pm1$ with probability $\frac12$; $N$ i.i.d. examples; $\hat f = \bar y = \frac1N\sum_iy_i$; squared loss.</p>
<p class="claim"><b>Proposition.</b> $\E[\hL_S(\hat f)] = 1-\frac1N$, $\E[L(\hat f)] = 1+\frac1N$, gap $\frac2N$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\hL_S(\hat f) &= \tfrac1N\textstyle\sum_iy_i^2-\bar y^2 = \blank{a} &&\text{(i)}\\
L(\hat f) &= \E[Y^2]-2\bar y\,\E[Y]+\bar y^2 = 1+\bar y^2 &&\text{(ii)}\\
\E[\bar y^2] &= \tfrac1{N^2}\textstyle\sum_{i,j}\E[y_iy_j] = \tfrac1{N^2}\cdot N = \blank{b} &&\text{(iii)}
\end{aligned}$$
<p>(iii): $\E[y_iy_j] = 0$ for $i\ne j$ (independence, zero mean) and $1$ for $i = j$. The expected gap is $\blank{c}$. $\square$</p>` },

  h4c: { title: 'An evaluation on independent data is unbiased',
    text: R`<p class="hyp"><b>Setup.</b> $S\sim P^N$, $\hat f = \mathcal A(S)$ with $\mathcal A$ deterministic; $S_{\text{eval}} = \{(\tilde\bx_i,\tilde y_i)\}_{i=1}^m\sim P^m$ independent of $S$; $\hat L_{\text{eval}}(f) = \frac1m\sum_i\ell(\tilde y_i,f(\tilde\bx_i))$; $L(f) = \E_P[\ell(y,f(\bx))]$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[\hat L_{\text{eval}}(\hat f)\big] = \E_S\big[L(\hat f)\big]$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E\big[\hat L_{\text{eval}}(\hat f)\big] &= \tfrac1m\textstyle\sum_i\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\big] &&\text{(i)}\\
\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\mid S\big] &= \blank{a} &&\text{(ii)}\\
\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\big] &= \E\Big[\E\big[\ell(\tilde y_i,\hat f(\tilde\bx_i))\mid S\big]\Big] = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i): linearity. (ii): given $S$, $\hat f$ is fixed ($\mathcal A$ deterministic) and $(\tilde\bx_i,\tilde y_i)$ still follows $P$ because it is [[c]] of $S$. (iii): law of total expectation. $\square$</p>`,
    words: { c: { ans: ['independent'], tex: 'independent' } } },

  h4d: { title: 'Reading cross-validation scores',
    text: R`<p class="hyp"><b>Data.</b> 5-fold cross-validation with equal-size folds. Validation MSEs: A $= (0.23,0.31,0.27,0.35,0.29)$, B $= (0.07,0.11,0.14,0.10,0.12)$, C $= (0.10,0.09,0.12,0.11,0.11)$. Mean training MSEs: A $0.260$, B $0.012$, C $0.080$.</p>
<p><b>Computation.</b>
$$\mathrm{CV}(A) = \blank{a},\qquad\mathrm{CV}(B) = \blank{b},\qquad\mathrm{CV}(C) = \blank{c}.$$
We choose [[d]]. Clearest underfitting (high training error, small gap): [[e]]. Clearest overfitting (near-zero training error, large gap): [[f]].</p>`,
    words: { d: { ans: ['C', 'model C', 'candidate C'], tex: 'C' }, e: { ans: ['A', 'model A', 'candidate A'], tex: 'A' }, f: { ans: ['B', 'model B', 'candidate B'], tex: 'B' } } },

  h4e: { title: 'More regularization: $Q_\\lambda$ decreases, $R_\\lambda$ increases',
    text: R`<p class="hyp"><b>Setup.</b> $\hat\bw_\lambda$ minimizes $R(\bw)+\lambda Q(\bw)$ ($R$: training error, $Q(\bw) = \sum_{j\ge1}w_j^2$); $0\le\lambda_1\lt\lambda_2$, $R_k = R(\hat\bw_{\lambda_k})$, $Q_k = Q(\hat\bw_{\lambda_k})$.</p>
<p class="claim"><b>Proposition.</b> $Q_2\le Q_1$ and $R_2\ge R_1$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
R_1+\lambda_1Q_1 &\le R_2+\lambda_1Q_2 &&\text{(i)}\\
R_2+\lambda_2Q_2 &\le\blank{a} &&\text{(ii)}\\
(\lambda_2-\lambda_1)\,Q_2 &\le\blank{b} &&\text{(iii)}\\
R_1-R_2 &\le\lambda_1(\blank{c})\le0. &&\text{(iv)}
\end{aligned}$$
<p>(i) and (ii): a minimizer does at least as well as the other point. (iii): (i) + (ii), then divide by $\lambda_2-\lambda_1>0$. (iv): rewrite (i), with $\lambda_1\ge0$ and $Q_2\le Q_1$. $\square$</p>` },

  h4f: { title: 'More regularization can generalize worse',
    text: R`<p class="hyp"><b>Setup.</b> $X$ uniform on $\{-1,1\}$, $Y = X$; $f(x) = w_0+w_1x$; ridge on $T = \{(-1,-1),(1,1)\}$: $J_\lambda = \frac12\big[(-1-w_0+w_1)^2+(1-w_0-w_1)^2\big]+\lambda w_1^2$.</p>
<p class="claim"><b>Proposition.</b> The generalization error of the fitted model is $\big(\frac\lambda{1+\lambda}\big)^2$, increasing in $\lambda$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\frac{\partial J_\lambda}{\partial w_0} &= 2w_0 = 0,\qquad\frac{\partial J_\lambda}{\partial w_1} = -2+2w_1+2\lambda w_1 = 0\ \Longrightarrow\ \hat w_1 = \blank{a} &&\text{(i)}\\
L(f) &= \E\big[((1-w_1)X-w_0)^2\big] = (1-w_1)^2+w_0^2 &&\text{(ii)}\\
L(\hat f_\lambda) &= \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii): $\E[X] = 0$, $\E[X^2] = 1$. For $\lambda = 0$, $L = 0$; for $\lambda = 1$, $L = \blank{c}$. $\square$</p>` },

  h4g: { title: 'The minimum CV score is not an evaluation',
    text: R`<p class="hyp"><b>Setup.</b> We choose $(d,\lambda)$ among candidates $c$ by cross-validation on $S_{\text{dev}}$ (scores $\mathrm{CV}(c)$), refit on all of $S_{\text{dev}}$ ($f_{\text{final}}$), and have an independent $S_{\text{test}}$ of size $m$.</p>
<p class="claim"><b>Proposition.</b> $\E[\min_c\mathrm{CV}(c)]\le\min_c\E[\mathrm{CV}(c)]$; an unbiased score is $\hat L_{S_{\text{test}}}(f_{\text{final}}) = \frac1m\sum_{S_{\text{test}}}(y-f_{\text{final}}(x))^2$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\forall c':\quad\min_c\mathrm{CV}(c) &\ \blank{a}\ \mathrm{CV}(c')\ \Longrightarrow\ \E\big[\min_c\mathrm{CV}(c)\big]\le\E[\mathrm{CV}(c')] &&\text{(i)}\\
\E\big[\hat L_{S_{\text{test}}}(f_{\text{final}})\big] &= \blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>(i): the folds were used to [[c]] the candidate, so the minimum is biased downward. (ii): the whole procedure is a deterministic algorithm applied to $S_{\text{dev}}$, and $S_{\text{test}}$ is independent of it. $\square$</p>`,
    words: { c: { ans: ['select', 'choose', 'pick'], tex: 'select' } } },
  });
})(window.ML);
