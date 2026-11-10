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
  // ------------------------------------------------------------------ HW5
  h5a: { title: 'Softmax invariance and the stable version',
    text: R`<p class="hyp"><b>Setup.</b> Logits $\mathbf z\in\R^K$, $\mathrm{softmax}(\mathbf z)_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, computed in double precision ($e^z$ overflows for $z\gtrsim709$, underflows for $z\lesssim-745$).</p>
<p class="claim"><b>Proposition.</b> $\mathrm{softmax}(\mathbf z+c\mathbf 1_K) = \mathrm{softmax}(\mathbf z)$; with $c = -\max_jz_j$ the computation has neither overflow nor division by 0.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\frac{e^{z_k+c}}{\sum_je^{z_j+c}} &= \frac{\blank{a}\,e^{z_k}}{\blank{a}\sum_je^{z_j}} = \mathrm{softmax}(\mathbf z)_k &&\text{(i)}\\
c = -m,\ m = \max_jz_j:\quad z_j-m\ \blank{b}\ 0\ &\Longrightarrow\ 0\lt e^{z_j-m}\le1 &&\text{(ii)}\\
\textstyle\sum_je^{z_j-m} &\ge e^{0} = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii): no overflow. (iii): the term of the maximum equals 1, so the denominator cannot [[d]] to 0. $\square$</p>`,
    words: { d: { ans: ['underflow', 'vanish'], tex: 'underflow' } } },

  h5b: { title: 'Stable log-softmax and cross-entropy from logits',
    text: R`<p class="hyp"><b>Data.</b> $Z = \begin{pmatrix}0&-1000&-2000\\1000&0&-1000\end{pmatrix}$, labels $\mathbf y = (1,1)$ (zero-based), $L_{\mathrm{CE}} = -\frac1B\sum_n\mathrm{logsoftmax}(Z)_{n,y_n}$, double precision ($e^{-1000}$ underflows to 0).</p>
<p class="claim"><b>Proposition.</b> $\mathrm{logsoftmax}(\mathbf z)_k = (z_k-m)-\log\sum_je^{z_j-m}$ with $m = \max_jz_j$ gives a finite loss, unlike $\log(\mathrm{softmax})$.</p>
<p><b>Proof and computation.</b></p>
$$\begin{aligned}
\log\textstyle\sum_je^{z_j} &= m+\log\textstyle\sum_je^{z_j-\blank{a}} &&\text{(i)}\\
\mathrm{logsoftmax}(Z) &= \begin{pmatrix}0&-1000&-2000\\0&\blank{b}&-2000\end{pmatrix} &&\text{(ii)}\\
\log\big(\mathrm{softmax}(Z)\big)_{n,1} &= \log 0 = \blank{c} &&\text{(iii)}\\
L_{\mathrm{CE}}\ \text{(stable log-softmax)} &= \blank{d}. &&\text{(iv)}
\end{aligned}$$
<p>(i): factor out $e^m$. (iii): the true probability $e^{-1000}$ suffered an [[e]] to 0 before the $\log$; the loss computed this way is $+\infty$. $\square$</p>`,
    words: { e: { ans: ['underflow'], tex: 'underflow' } } },

  h5c: { title: 'Shapes in a self-attention block',
    text: R`<p class="hyp"><b>Data.</b> $X\in\R^{T\times D}$, $Q = XW_Q$, $K = XW_K$, $V = XW_V$, $S = QK^\top/\sqrt{d_k}$, $A = \mathrm{softmax}_{\text{row}}(S)$, $H = AV$, $O = HW_O+X$, $Z = OW_C+\mathbf 1_Tb_C^\top$. $T = 4$, $D = 6$, $d_k = 3$, $d_v = 4$, $C = 5$; $W_Q,W_K\in\R^{6\times3}$, $W_V\in\R^{6\times4}$, $W_O\in\R^{4\times6}$, $W_C\in\R^{6\times5}$.</p>
<p><b>Computation.</b> Number of columns of each matrix (all have $T = 4$ rows):
$$Q:\ \blank{a},\qquad V:\ \blank{b},\qquad S, A:\ \blank{c},\qquad O:\ \blank{d},\qquad Z:\ \blank{e}.$$
The residual sum $HW_O+X$ is only possible because $W_O$ maps dimension $d_v$ back to [[f]].</p>`,
    words: { f: { ans: ['D', 'D = 6', '6'], tex: '$D$' } } },

  h5d: { title: 'Backpropagating through $H = \\mathrm{softmax}(QK^\\top/\\sqrt{d_k})V$',
    text: R`<p class="hyp"><b>Setup.</b> $S = QK^\top/\sqrt{d_k}$, $A = \mathrm{softmax}_{\text{row}}(S)$, $H = AV$, and $G_M := \partial L/\partial M$. We know $G_H$ and $\frac{\partial A_{ij}}{\partial S_{ik}} = A_{ij}(\mathbb 1\{j = k\}-A_{ik})$.</p>
<p class="claim"><b>Proposition.</b> $G_A = G_HV^\top$, $G_V = A^\top G_H$, $G_S = A\odot(G_A-\mathbf r\mathbf 1^\top)$ with $r_i = \sum_jA_{ij}(G_A)_{ij}$, $G_Q = G_SK/\sqrt{d_k}$, $G_K = G_S^\top Q/\sqrt{d_k}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
H_{ij} = \textstyle\sum_kA_{ik}V_{kj}\ &\Longrightarrow\ (G_A)_{ik} = \textstyle\sum_j(G_H)_{ij}\,\blank{a},\qquad G_V = \blank{b} &&\text{(i)}\\
(G_S)_{ik} &= \textstyle\sum_j(G_A)_{ij}A_{ij}\big(\mathbb 1\{j = k\}-A_{ik}\big) = A_{ik}\big((G_A)_{ik}-\blank{c}\big) &&\text{(ii)}\\
S_{ij} = \tfrac1{\sqrt{d_k}}\textstyle\sum_mQ_{im}K_{jm}\ &\Longrightarrow\ G_Q = \frac{G_S\,\blank{d}}{\sqrt{d_k}},\qquad G_K = \frac{\blank{e}\,Q}{\sqrt{d_k}}. &&\text{(iii)}
\end{aligned}$$
<p>Check: each row of $G_S$ sums to $\blank{f}$, because $\sum_kA_{ik} = 1$. $\square$</p>` },

  // ------------------------------------------------------------------ HW6
  h6a: { title: 'Exponential weighting: predicting before feedback',
    text: R`<p class="hyp"><b>Setup.</b> Exponential weighting with experts $h_1,\dots,h_K$: $w_1 = (1,\dots,1)$; at round $t$, set $p_t(i) = w_t(i)/\sum_jw_t(j)$, sample $I_t\sim p_t$ and predict $\hat y_t = h_{I_t}(x_t)$, <em>then</em> observe $y_t$ and update $w_{t+1}(i) = w_t(i)\,e^{-\eta\ell_{t,i}}$ with $\ell_{t,i} = \ell(y_t,h_i(x_t))$.</p>
<p class="claim"><b>Proposition.</b> The distribution $p_t$ does not depend on the current label $y_t$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
w_t(i) &= w_1(i)\prod_{s=1}^{\blank{a}}e^{-\eta\ell_{s,i}} = \exp\Big(-\eta\textstyle\sum_{s\lt t}\ell(y_s,h_i(x_s))\Big) &&\text{(i)}\\
p_t(i) &= \frac{w_t(i)}{\sum_jw_t(j)}\ \text{involves only } y_1,\dots,y_{t-1}. &&\text{(ii)}
\end{aligned}$$
<p>In the algorithm, $y_t$ is observed [[b]] sampling $I_t$ and predicting; it is only used to compute $\blank{c}$. $\square$</p>`,
    words: { b: { ans: ['after', 'après', 'apres'], tex: 'after' } } },

  h6b: { title: 'Exponential weighting by hand: 0-1 classification',
    text: R`<p class="hyp"><b>Data.</b> Two constant experts $h_1\equiv0$, $h_2\equiv1$; labels $(y_1,y_2) = (1,1)$; 0-1 loss $\ell_{t,i} = \mathbb 1[h_i(x_t)\ne y_t]$; exponential weighting with $\eta = \ln2$, $w_1 = (1,1)$, $T = 2$. Expected loss $\E[\ell_t] = \sum_ip_t(i)\ell_{t,i}$, $L^* = \min_i\sum_t\ell_{t,i}$, regret $R = \sum_t\E[\ell_t]-L^*$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
e^{-\eta\ell} &= \blank{a}\quad(\text{for }\eta = \ln2) &&\text{(i)}\\
p_1 = \big(\tfrac12,\tfrac12\big),\ \ \ell_1 = (1,0)\ &\Longrightarrow\ \E[\ell_1] = \tfrac12,\qquad w_2 = \big(\blank{b},\ 1\big) &&\text{(ii)}\\
p_2 &= \big(\blank{c},\ \tfrac23\big),\qquad \E[\ell_2] = \blank{d} &&\text{(iii)}\\
L^* &= \blank{e},\qquad R = \tfrac12+\tfrac13-L^* = \blank{f}. &&\text{(iv)}
\end{aligned}$$
<p>EW moves its mass toward the expert that is always right, but pays for the exploration of the first round.</p>` },

  h6c: { title: 'Exponential weighting by hand: regression, realized versus expected loss',
    text: R`<p class="hyp"><b>Data.</b> Two constant experts $h_1\equiv1$, $h_2\equiv2$; targets $(y_1,y_2) = (1,3)$; squared loss $\ell_{t,i} = (h_i(x_t)-y_t)^2$; exponential weighting with $\eta = \ln2$, $w_1 = (1,1)$, $T = 2$. Expected loss $\E[\ell_t] = \sum_ip_t(i)\ell_{t,i}$, $L^* = \min_i\sum_t\ell_{t,i}$, regret $R = \sum_t\E[\ell_t]-L^*$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\ell_1 = (0,1),\ \ \ell_2 &= \big(\blank{a},\ 1\big) &&\text{(i)}\\
p_1 = \big(\tfrac12,\tfrac12\big)\ \Longrightarrow\ \E[\ell_1] = \tfrac12,\qquad w_2 &= \big(1,\ \blank{b}\big),\qquad p_2 = \big(\blank{c},\ \tfrac13\big) &&\text{(ii)}\\
\E[\ell_2] &= \blank{d} &&\text{(iii)}\\
L^* &= \min(4,2) = 2,\qquad R = \tfrac12+\E[\ell_2]-L^* = \blank{e} &&\text{(iv)}\\
I_2 = 1\ \Longrightarrow\ \hat y_2 &= 1,\qquad \ell(y_2,\hat y_2) = \blank{f}. &&\text{(v)}
\end{aligned}$$
<p>The realized loss (v) is not equal to $\E[\ell_2]$: it is a [[g]] variable, equal to 4 with probability $p_2(1)$ and 1 with probability $p_2(2)$; only its mean equals $\E[\ell_2]$.</p>`,
    words: { g: { ans: ['random', 'aléatoire', 'aleatoire'], tex: 'random' } } },
  h7a: { title: 'Reparameterization: samples and the gradient path',
    text: R`<p class="hyp"><b>Data.</b> An encoder outputs $q(z\mid x) = \mathcal N(\mu,\sigma^2)$ with $\mu = 1$ and $\sigma = 2$ (standard deviation). Sampling uses $\epsilon\sim\mathcal N(0,1)$, $z = \mu+\sigma\epsilon$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\epsilon = -1,\ 0,\ 1\ &\Longrightarrow\ z = \blank{a},\ \ \blank{b},\ \ \blank{c} &&\text{(i)}\\
\frac{\partial z}{\partial\mu} &= \blank{d},\qquad\frac{\partial z}{\partial\sigma} = \blank{e}\quad(\epsilon\text{ fixed}) &&\text{(ii)}\\
\text{if } z \text{ is treated as a constant:}\quad\frac{\partial z}{\partial\mu} &= \blank{f}\ \text{ in backpropagation.} &&\text{(iii)}
\end{aligned}$$
<p>In case (iii), no gradient from the reconstruction reaches the encoder parameters. Reparameterization moves the randomness into $\epsilon$, whose distribution does not depend on the [[g]].</p>`,
    words: { g: { ans: ['parameters', 'encoder parameters', 'paramètres', 'parametres'], tex: 'parameters (of the encoder)' } } },

  h7b: { title: 'One gradient step on the encoder, with reparameterization',
    text: R`<p class="hyp"><b>Data.</b> $x_1 = -1$, $x_2 = 1$; $p(z) = \mathcal N(0,1)$, fixed decoder $p(x\mid z) = \mathcal N(z,1)$, encoder $q_a(z\mid x) = \mathcal N(ax,1)$ with single parameter $a$. Noise $\epsilon_1 = \epsilon_2 = 0$, $z_i = ax_i+\epsilon_i$, and
$$\hat J(a) = \tfrac12\textstyle\sum_i\big[\tfrac12(x_i-z_i)^2+\tfrac12(ax_i)^2\big],\quad g_{\text{rec}} = \tfrac12\sum_i(z_i-x_i)\frac{\partial z_i}{\partial a},\quad g_{\text{KL}} = a,\quad a_{\text{new}} = a-0.1(g_{\text{rec}}+g_{\text{KL}}).$$
Start at $a = 0$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
z_1 = z_2 &= \blank{a},\qquad\frac{\partial z_1}{\partial a} = \blank{b},\quad\frac{\partial z_2}{\partial a} = 1 &&\text{(i)}\\
g_{\text{rec}} &= \blank{c},\qquad g_{\text{KL}} = \blank{d} &&\text{(ii)}\\
a_{\text{new}} &= \blank{e},\qquad a_{\text{new}}x_1 = \blank{f} &&\text{(iii)}\\
\hat J(a) = \tfrac12(1-a)^2+\tfrac12a^2\ &\Longrightarrow\ \hat J'(a) = 2a-1,\ \text{minimum at } a = \blank{g}. &&\text{(iv)}
\end{aligned}$$
<p>(iv) confirms that $g_{\text{rec}}+g_{\text{KL}} = \hat J'(0)$: reparameterization gives the true gradient.</p>` },

  h7c: { title: 'Samples treated as constants: the encoder does not learn',
    text: R`<p class="hyp"><b>Data.</b> Same model: $x_1 = -1$, $x_2 = 1$, $q_a(z\mid x) = \mathcal N(ax,1)$, $\epsilon_i = 0$, $g_{\text{rec}} = \tfrac12\sum_i(z_i-x_i)\frac{\partial z_i}{\partial a}$, $g_{\text{KL}} = a$, $a_{\text{new}} = a-0.1(g_{\text{rec}}+g_{\text{KL}})$. But $\partial z_i/\partial a = 0$ is used during backpropagation.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
a = 0:\qquad g_{\text{rec}} &= \blank{a},\qquad g_{\text{KL}} = \blank{b},\qquad a_{\text{new}} = \blank{c} &&\text{(i)}\\
a = 0.5:\qquad a_{\text{new}} &= \blank{d} &&\text{(ii)}\\
\text{after } k \text{ steps from } a_0:\qquad a_k &= \blank{e}\cdot a_0 &&\text{(iii)}
\end{aligned}$$
<p>The KL term only pulls $a$ back toward [[f]], i.e. $q_a$ toward the prior: it carries no information about the data.</p>`,
    words: { f: { ans: ['0', 'zero'], tex: '0' } } },
  // ------------------------------------------------------------------ HW8
  h8a: { title: 'A row-wise layer is equivariant, the mean is invariant',
    text: R`<p class="hyp"><b>Setup.</b> $P\in\R^{N\times N}$ a permutation matrix, $\mathbf 1\in\R^N$ the all-ones vector, $X\in\R^{N\times D}$. $H(X) = \mathrm{LN}\big(X+\varphi(XW_1+\mathbf 1b_1^\top)W_2+\mathbf 1b_2^\top\big)$, with $\varphi$ elementwise and LayerNorm row-wise (same parameters); $g(X) = \frac1N\mathbf 1^\top H(X)$.</p>
<p class="claim"><b>Proposition.</b> $H(PX) = PH(X)$ and $g(PX) = g(X)$, but equivariance does not imply invariance.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
P\mathbf 1 &= \blank{a}\quad\Longrightarrow\quad(PX)W_1+\mathbf 1b_1^\top = P\big(\blank{b}\big) &&\text{(i)}\\
\varphi(PA) &= \blank{c},\qquad\mathrm{LN}(PA) = P\,\mathrm{LN}(A) &&\text{(ii)}\\
g(PX) &= \tfrac1N\mathbf 1^\top PH(X) = \tfrac1N\big(\blank{d}\big)^\top H(X) = g(X). &&\text{(iii)}
\end{aligned}$$
<p>Counterexample: $J(X) = X$ is equivariant; with $X = (1,0)^\top$ and $P$ swapping the two rows, $J(PX) = \blank{e}\ne J(X)$. So an equivariant map need not be [[f]]. $\square$</p>`,
    words: { f: { ans: ['invariant', 'invariante'], tex: 'invariant' } } },

  h8b: { title: 'Positional encoding and equivariance: the condition on $RW$',
    text: R`<p class="hyp"><b>Setup.</b> $G(X) = (X+R)W$ with $X,R\in\R^{N\times D}$ ($N\ge2$), $W\in\R^{D\times D}$; the encoding $R$ stays fixed when the rows of $X$ are permuted.</p>
<p class="claim"><b>Proposition.</b> $G(PX) = PG(X)$ for all $X,P$ $\iff$ all rows of $RW$ are equal.</p>
<p><b>Proof.</b></p>
$$G(PX)-PG(X) = (PX+R)W-P(X+R)W = \blank{a}.$$
<p>So the condition does not depend on $X$. If $RW = \mathbf 1c^\top$, then $PRW = \blank{b}$. Conversely, with $P$ the transposition of rows $i$ and $j$, row $i$ of $PRW$ is row [[c]] of $RW$, hence the rows are equal. If $W$ is invertible, the condition becomes: all rows of $\blank{d}$ are equal, i.e. the encoding encodes no [[e]] at all. $\square$</p>`,
    words: { e: { ans: ['position', 'positions'], tex: 'position' } } },

  h8c: { title: 'Two positional encodings in dimension 2',
    text: R`<p class="hyp"><b>Data.</b> $N = D = 2$, $R = \begin{pmatrix}0&0\\0&1\end{pmatrix}$, $W_A = \begin{pmatrix}1&0\\0&0\end{pmatrix}$, $W_B = I_2$, $G_\bullet(X) = (X+R)W_\bullet$. $X_0 = \begin{pmatrix}1&2\\3&4\end{pmatrix}$, $P_0 = \begin{pmatrix}0&1\\1&0\end{pmatrix}$.</p>
<p><b>Computation.</b> The $(2,2)$ entry of $RW_A$ is $\blank{a}$; hence $G_A$ is equivariant (equal rows of $RW_A$). For $G_B$:
$$G_B(P_0X_0) = \begin{pmatrix}3&4\\1&\blank{b}\end{pmatrix},\qquad P_0G_B(X_0) = \begin{pmatrix}3&\blank{c}\\1&2\end{pmatrix}.$$</p>` },

  h8d: { title: '$QK^\\top$ symmetric for every $X$ $\\iff$ $W^{(q)}W^{(k)\\top}$ symmetric',
    text: R`<p class="hyp"><b>Setup.</b> $Q = XW^{(q)}$, $K = XW^{(k)}$, $X\in\R^{N\times D}$ ($N\ge2$), fixed $W^{(q)},W^{(k)}\in\R^{D\times D_k}$; $M := W^{(q)}W^{(k)\top}$.</p>
<p class="claim"><b>Proposition.</b> $QK^\top$ is symmetric for every $X$ if and only if $M$ is symmetric.</p>
<p><b>Proof.</b> $QK^\top = XMX^\top$ and $(QK^\top)^\top = X\blank{a}X^\top$. If $M = M^\top$ we are done. Conversely, with $A = M-M^\top$ and $X$ with rows $e_a^\top$, $e_b^\top$ (others zero), $(XAX^\top)_{12} = \blank{b} = 0$ for all $a,b$.</p>
<p>Counterexample ($D = 2$, $D_k = 1$): $W^{(q)} = (1,0)^\top$, $W^{(k)} = (0,1)^\top$, $X = I_2$: $(QK^\top)_{12} = \blank{c}$ and $(QK^\top)_{21} = \blank{d}$. $\square$</p>` },

  h8e: { title: 'Attention is permutation equivariant',
    text: R`<p class="hyp"><b>Setup.</b> $\mathrm{Att}(Q,K,V) = \mathrm{Softmax}_{\text{row}}(QK^\top/\sqrt{D_k})V$ with $Q\in\R^{N\times D_k}$, $K\in\R^{M\times D_k}$, $V\in\R^{M\times D_v}$; $P\in\R^{N\times N}$, $T\in\R^{M\times M}$ permutations; $S = QK^\top/\sqrt{D_k}$, $A = \mathrm{Softmax}_{\text{row}}(S)$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{Att}(PQ,TK,TV) = P\,\mathrm{Att}(Q,K,V)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
(PQ)(TK)^\top/\sqrt{D_k} &= PST^\top &&\text{(i)}\\
\mathrm{Softmax}_{\text{row}}(PST^\top) &= \blank{a} &&\text{(ii)}\\
\mathrm{Att}(PQ,TK,TV) &= PAT^\top TV = PA\,\blank{b}\,V = PAV. &&\text{(iii)}
\end{aligned}$$
<p>(ii): permuting rows permutes the outputs of the row-wise softmax; permuting columns reorders each row without changing its [[c]] of exponentials (the denominator). (iii): $T^\top T = I$. For self-attention $F(X) = \mathrm{Att}(XW^{(q)},XW^{(k)},XW^{(v)})$, take $T = \blank{d}$: $F(PX) = PF(X)$, with no positional encoding and no [[e]]. $\square$</p>`,
    words: { c: { ans: ['sum', 'somme'], tex: 'sum' }, e: { ans: ['mask', 'causal mask', 'attention mask', 'masque'], tex: 'mask' } } },

  // ------------------------------------------------------------------ HW9
  h9a: { title: 'One k-means iteration on four points',
    text: R`<p class="hyp"><b>Data.</b> $D = 1$, $x = 0,\ 2,\ 8,\ 10$, $K = 2$, initial centers $\mu_1^{(0)} = 0$, $\mu_2^{(0)} = 8$, $J(r,\mu) = \sum_i\sum_kr_{ik}(x_i-\mu_k)^2$.</p>
<p><b>Computation.</b> After the assignment, cluster 1 contains $\blank{a}$ points, and $J$ (with the initial centers) is $\blank{b}$. After the update, $\mu_1^{(1)} = \blank{c}$, $\mu_2^{(1)} = \blank{d}$ and $J = \blank{e}$. $J$ cannot increase because each step is an [[f]] minimization of $J$ over one block of variables.</p>`,
    words: { f: { ans: ['exact', 'exacte'], tex: 'exact' } } },

  h9b: { title: 'Soft assignment with $\\beta = \\ln 2$',
    text: R`<p class="hyp"><b>Data.</b> $x = 0$, $\mu_1 = 0$, $\mu_2 = 1$, $\beta = \ln2$, $r_k = e^{-\beta\|x-\mu_k\|^2}/\sum_\ell e^{-\beta\|x-\mu_\ell\|^2}$.</p>
<p><b>Computation.</b> $e^{-\beta\|x-\mu_2\|^2} = \blank{a}$, so $r_1 = \blank{b}$ and $r_2 = \blank{c}$. As $\beta\to\infty$ (unique nearest center), $r_1\to\blank{d}$: we recover the [[e]] assignment of k-means.</p>`,
    words: { e: { ans: ['hard', 'dure'], tex: 'hard' } } },

  // ------------------------------------------------------------------ HW10
  h10a: { title: 'The likelihood gradient equals the gradient of $Q$ at $\\theta^{(t)}$',
    text: R`<p class="hyp"><b>Setup.</b> Finite-valued latent $z$, $\mathcal L(\theta) = \log p_\theta(x)$, $q^{(t)}(z) = p_{\theta^{(t)}}(z\mid x)$, $Q(\theta;\theta^{(t)}) = \E_{z\sim q^{(t)}}[\log p_\theta(x,z)]$ ($q^{(t)}$ fixed); positive probabilities, $p_\theta$ differentiable.</p>
<p class="claim"><b>Proposition.</b> $\nabla\mathcal L(\theta^{(t)}) = \nabla_\theta Q(\theta;\theta^{(t)})\big|_{\theta^{(t)}}$.</p>
<p><b>Proof.</b></p>
$$\nabla\mathcal L(\theta) = \frac{\sum_z\nabla p_\theta(x,z)}{\blank{a}} = \sum_z\frac{p_\theta(x,z)}{p_\theta(x)}\nabla\log p_\theta(x,z) = \sum_z\blank{b}\,\nabla\log p_\theta(x,z).$$
<p>This is an expectation under the posterior at the same $\theta$. At $\theta = \theta^{(t)}$ this distribution is $\blank{c}$, which gives $\sum_zq^{(t)}(z)\nabla\log p_\theta(x,z) = \nabla_\theta Q$. Geometrically, the bound $Q(\cdot;\theta^{(t)})+H(q^{(t)})$ is [[d]] to $\mathcal L$ at $\theta^{(t)}$. $\square$</p>`,
    words: { d: { ans: ['tangent', 'tangente'], tex: 'tangent' } } },

  h10b: { title: 'The EM improvement identity',
    text: R`<p class="hyp"><b>Setup.</b> As above: $\mathcal L(\theta) = \log p_\theta(x)$, $q^{(t)} = p_{\theta^{(t)}}(\cdot\mid x)$, $Q(\theta;\theta^{(t)}) = \E_{q^{(t)}}[\log p_\theta(x,z)]$; $\theta'$ arbitrary.</p>
<p class="claim"><b>Proposition.</b> $\mathcal L(\theta')-\mathcal L(\theta^{(t)}) = Q(\theta';\theta^{(t)})-Q(\theta^{(t)};\theta^{(t)})+\mathrm{KL}\big(q^{(t)}\,\|\,p_{\theta'}(z\mid x)\big)$, and EM does not decrease $\mathcal L$.</p>
<p><b>Proof.</b> $\log p_\theta(x,z) = \mathcal L(\theta)+\blank{a}$. Taking the expectation under $q^{(t)}$:
$$Q(\theta;\theta^{(t)}) = \mathcal L(\theta)+\E_{q^{(t)}}\big[\blank{a}\big].$$
Write it for $\theta'$ and for $\theta^{(t)}$ (where $p_{\theta^{(t)}}(z\mid x) = q^{(t)}(z)$) and subtract: the difference of expectations is $-\mathrm{KL}(q^{(t)}\,\|\,\blank{b})$. With $\theta' = \theta^{(t+1)}$, the M-step gives $\Delta Q\blank{c}0$ and the KL is $\ge0$. Equality iff $\theta^{(t)}$ already maximizes $Q(\cdot;\theta^{(t)})$ and the posteriors at $\theta^{(t)}$ and $\theta^{(t+1)}$ are [[d]]. $\square$</p>`,
    words: { d: { ans: ['equal', 'identical', 'the same', 'egales'], tex: 'equal' } } },

  h10c: { title: 'Generalized EM: a small gradient step is enough',
    text: R`<p class="hyp"><b>Setup.</b> Open parameter space, $\mathcal L$ continuously differentiable, $g := \nabla_\theta Q(\theta;\theta^{(t)})|_{\theta^{(t)}}\ne0$, and $\nabla\mathcal L(\theta^{(t)}) = g$.</p>
<p class="claim"><b>Proposition.</b> $\theta^{(t)}+\alpha g$ strictly increases $\mathcal L$ for small enough $\alpha>0$; an interior fixed point of EM is stationary.</p>
<p><b>Proof.</b> With $\phi(\alpha) = \mathcal L(\theta^{(t)}+\alpha g)$: $\phi'(0) = \nabla\mathcal L(\theta^{(t)})^\top g = \blank{a}>0$. By definition of the derivative, $\phi(\alpha)>\phi(0)$ for small $\alpha$, without maximizing $Q$. If exact EM gives an interior $\theta^{(t+1)} = \theta^{(t)}$, then $\theta^{(t)}$ maximizes $Q(\cdot;\theta^{(t)})$ on an open set, so $g = \blank{b}$, hence $\nabla\mathcal L(\theta^{(t)}) = 0$: a [[c]] point, not necessarily a global maximum. $\square$</p>`,
    words: { c: { ans: ['stationary', 'critical', 'stationnaire'], tex: 'stationary' } } },

  h10d: { title: 'EM stuck on a discrete parameter space',
    text: R`<p class="hyp"><b>Data.</b> $\theta\in\{A,B\}$, $x,z\in\{0,1\}$, we observe $x = 1$. $p_A(1,0) = p_A(1,1) = \frac14$; $p_B(1,0) = \frac9{16}$, $p_B(1,1) = \frac1{16}$. Start $\theta^{(0)} = A$; $Q(\theta;A) = \sum_zq^{(0)}(z)\ln p_\theta(1,z)$.</p>
<p><b>Computation.</b> $q^{(0)}(z = 0) = \blank{a}$; $Q(A;A) = \blank{b}$, $Q(B;A) = \blank{c}$; $\mathcal L(A) = \blank{d}$, $\mathcal L(B) = \blank{e}$. The M-step therefore picks $\theta^{(1)} = $ [[f]], although $\mathcal L(B)>\mathcal L(A)$.</p>`,
    words: { f: { ans: ['A'], tex: 'A' } } },
  });
})(window.ML);
