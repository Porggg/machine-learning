/* English version — Chapter 1: linear regression (same blanks as the French version) */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const SETUP = R`<p class="hyp"><b>Setup.</b> $N$ examples $(x_n,y_n)$ and $L$ basis functions; $\bphi_n = (\phi_1(x_n),\dots,\phi_L(x_n))\T$. The design matrix $\bPhi\in\R^{N\times L}$ has rows $\bphi_n\T$, $\by = (y_1,\dots,y_N)\T$, and $\EMSE(\bw) = \frac1N\|\by-\bPhi\bw\|^2$.</p>`;

  ML.EX.en({
  lr1: { title: 'The best predictor for the MSE is $\\E[Y\\mid X]$',
    text: R`<p class="hyp"><b>Setup.</b> $(X,Y)$ is a pair of random variables, $f$ any predictor, and $m(X) := \E[Y\mid X]$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[(Y-f(X))^2\big] = \E\big[\Var(Y\mid X)\big]+\E\big[(m(X)-f(X))^2\big]$. Hence the MSE is minimized by $f = m$, and the minimal MSE is $\E[\Var(Y\mid X)]$.</p>
<p><b>Proof.</b> Write $Y-f(X) = \big(Y-m(X)\big)+\big(m(X)-f(X)\big)$ and expand the square:</p>
$$\begin{aligned}
\E\big[(Y-f(X))^2\big] &= \E\big[(Y-m(X))^2\big]+2\,\E\big[(Y-m(X))(m(X)-f(X))\big]+\E\big[(m(X)-f(X))^2\big] &&\text{(i)}\\
\E\big[(Y-m(X))(m(X)-f(X))\big] &= \E\Big[(m(X)-f(X))\;\blank{a}\Big] &&\text{(ii)}\\
\E[Y-m(X)\mid X] &= m(X)-m(X) = \blank{b} &&\text{(iii)}\\
\E\big[(Y-m(X))^2\big] &= \E\Big[\E\big[(Y-m(X))^2\mid X\big]\Big] = \E\big[\blank{c}\big]. &&\text{(iv)}
\end{aligned}$$
<p>(ii) and (iv) follow from the law of [[d]]: $\E[Z] = \E\big[\E[Z\mid X]\big]$; in (ii), $m(X)-f(X)$ comes out of the conditional expectation since it only depends on $X$. By (iii) the cross term vanishes. The first term does not depend on $f$ and the last one is $\ge0$, zero iff $f(X) = m(X)$. $\square$</p>`,
    words: { d: { ans: ['total expectation', 'law of total expectation', 'iterated expectations', 'tower property', 'tower rule'], tex: 'total expectation' } } },

  lr2: { title: 'The design matrix',
    text: R`<p class="hyp"><b>Setup.</b> $N$ examples $(x_n,y_n)$, $L$ basis functions $\phi_1,\dots,\phi_L$, model $f(x) = \sum_{\ell=1}^Lw_\ell\phi_\ell(x) = \bw\T\bphi(x)$.</p>
<p><b>Definition.</b> The design matrix $\bPhi$ has $\blank{a}$ rows (one per [[b]]) and $L$ columns (one per basis function):
$$\Phi_{n\ell} = \blank{c},\qquad\text{predictions on the data} = \blank{d}.$$
For the polynomial basis $\bphi(x) = (1,x,\dots,x^M)\T$, $L = \blank{e}$.</p>`,
    words: { b: { ans: ['example', 'data point', 'point', 'observation', 'sample'], tex: 'example' } } },

  lr3: { title: 'The normal equations',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> Every minimizer of $\EMSE$ satisfies $\bPhi\T\bPhi\,\bw = \bPhi\T\by$; if $\bPhi\T\bPhi$ is invertible, $\bw_{\text{LS}} = (\bPhi\T\bPhi)^{-1}\bPhi\T\by$.</p>
<p><b>Proof.</b> Expand the norm, then differentiate:</p>
$$\begin{aligned}
\|\by-\bPhi\bw\|^2 &= (\by-\bPhi\bw)\T(\by-\bPhi\bw) = \by\T\by-2\,\blank{a}+\bw\T\blank{b}\,\bw &&\text{(i)}\\
\nabla\EMSE(\bw) &= \tfrac1N\big(-2\bPhi\T\by+\blank{c}\big) &&\text{(ii)}\\
\nabla\EMSE(\bw) = 0 &\iff \bPhi\T\bPhi\,\bw = \bPhi\T\by. &&
\end{aligned}$$
<p>In (i), $\by\T\bPhi\bw$ and $\bw\T\bPhi\T\by$ are combined because they are equal [[d]]. (ii) uses $\nabla(\bw\T\mathbf c) = \mathbf c$ and $\nabla(\bw\T\mathbf A\bw) = 2\mathbf A\bw$ for symmetric $\mathbf A$. $\square$</p>`,
    words: { d: { ans: ['scalars', 'scalar', 'numbers', 'real numbers'], tex: 'scalars' } } },

  lr4: { title: 'The empirical MSE is convex',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> $\EMSE$ is convex; every stationary point is a global minimum.</p>
<p><b>Proof.</b> The gradient is $\frac2N\bPhi\T(\bPhi\bw-\by)$. For every direction $\bv\in\R^L$:</p>
$$\begin{aligned}
\nabla^2\EMSE &= \blank{a} &&\text{(i)}\\
\bv\T\nabla^2\EMSE\,\bv &= \tfrac2N\,(\bPhi\bv)\T(\bPhi\bv) = \tfrac2N\,\blank{b}\ \ge\ 0. &&\text{(ii)}
\end{aligned}$$
<p>By (ii), the Hessian is positive semidefinite everywhere, so $\EMSE$ is [[c]], and a point where the gradient vanishes is a [[d]] minimum. $\square$</p>`,
    words: { c: { ans: ['convex'], tex: 'convex' }, d: { ans: ['global'], tex: 'global' } } },

  lr5: { title: 'Least squares is an orthogonal projection',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> If $\bPhi\T\bPhi$ is invertible, $\hby = \bPhi\bw_{\text{LS}}$ is the orthogonal projection of $\by$ onto the column space of $\bPhi$, with matrix $\bP = \bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T$, and $\bP^2 = \bP$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\bPhi\T\bPhi\,\bw_{\text{LS}} = \bPhi\T\by\ &\iff\ \bPhi\T(\by-\hby) = \blank{a} &&\text{(i)}\\
\hby = \bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T\by &= \bP\by &&\text{(ii)}\\
\bP^2 = \bPhi(\bPhi\T\bPhi)^{-1}\,\blank{b}\,(\bPhi\T\bPhi)^{-1}\bPhi\T &= \bP. &&\text{(iii)}
\end{aligned}$$
<p>(i) says that the residual $\by-\hby$ is orthogonal to every [[c]] of $\bPhi$: this characterizes the orthogonal projection. $\square$</p>`,
    words: { c: { ans: ['column', 'columns'], tex: 'column' } } },

  lr6: { title: 'Gaussian noise: MLE = least squares',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> If $y_n = \bw\T\bphi_n+\varepsilon_n$ with independent $\varepsilon_n\sim\N(0,\sigma^2)$, then $\bw_{\text{MLE}} = \bw_{\text{LS}}$.</p>
<p><b>Proof.</b> Each example has likelihood $p(y_n\mid\bw) = \frac1{\sqrt{2\pi\sigma^2}}\exp\big(-\frac{\blank{a}}{2\sigma^2}\big)$. Hence</p>
$$\begin{aligned}
\ln\mathcal L(\bw) &= \ln\prod_{n=1}^Np(y_n\mid\bw) = \sum_{n=1}^N\ln p(y_n\mid\bw) &&\text{(i)}\\
&= \blank{b}-\frac1{2\sigma^2}\sum_{n=1}^N(y_n-\bw\T\bphi_n)^2 &&\text{(ii)}\\
&= \blank{b}-\frac{N}{2\sigma^2}\,\EMSE(\bw). &&\text{(iii)}
\end{aligned}$$
<p>(i) comes from the [[c]] of the examples. The first term does not depend on $\bw$ and $\frac N{2\sigma^2}>0$: maximizing $\ln\mathcal L$ is minimizing $\EMSE$. $\square$</p>`,
    words: { c: { ans: ['independence'], tex: 'independence' } } },

  lr7: { title: 'Closed form of ridge, always invertible',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> For $\lambda>0$, $E(\bw) = \EMSE(\bw)+\lambda\|\bw\|^2$ has the unique minimizer $\bw_{\text{ridge}} = (N\lambda\bI+\bPhi\T\bPhi)^{-1}\bPhi\T\by$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\nabla E(\bw) &= \tfrac2N\bPhi\T(\bPhi\bw-\by)+\blank{a} &&\text{(i)}\\
\nabla E(\bw) = 0\ &\iff\ \bPhi\T\bPhi\bw-\bPhi\T\by+\blank{b} = 0\ \iff\ (N\lambda\bI+\bPhi\T\bPhi)\bw = \bPhi\T\by &&\text{(ii)}\\
\forall\bv\ne0,\quad\bv\T(N\lambda\bI+\bPhi\T\bPhi)\bv &= N\lambda\|\bv\|^2+\blank{c}\ >\ 0. &&\text{(iii)}
\end{aligned}$$
<p>(ii) is (i) multiplied by $\frac N2$. By (iii) the matrix is [[d]], hence invertible even when $\bPhi\T\bPhi$ is not, and $E$ is strictly convex. $\square$</p>`,
    words: { d: { ans: ['positive definite'], tex: 'positive definite' } } },

  lr8: { title: 'Gaussian prior: MAP = ridge',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> With noise $\N(0,\sigma^2)$ and prior $\bw\sim\N(0,\bSigma)$, $\bw_{\text{MAP}} = (\sigma^2\bSigma^{-1}+\bPhi\T\bPhi)^{-1}\bPhi\T\by$; for $\bSigma = \tau^2\bI$ this is ridge with $\lambda = \frac{\sigma^2}{N\tau^2}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p(\bw\mid\by) &\propto p(\by\mid\bw)\;\blank{a} &&\text{(i)}\\
-\ln p(\bw\mid\by) &= \tfrac1{2\sigma^2}\|\by-\bPhi\bw\|^2+\blank{b}+\text{const} &&\text{(ii)}\\
0 = -\tfrac1{\sigma^2}\bPhi\T(\by-\bPhi\bw)+\bSigma^{-1}\bw\ &\iff\ (\blank{c}+\bPhi\T\bPhi)\,\bw = \bPhi\T\by. &&\text{(iii)}
\end{aligned}$$
<p>(i) is [[d]]' rule. With $\bSigma = \tau^2\bI$ we identify $\frac{\sigma^2}{\tau^2} = N\lambda$. $\square$</p>`,
    words: { d: { ans: ['Bayes', 'bayes'], tex: 'Bayes' } } },

  lr9: { title: 'Lasso in 1D: soft thresholding',
    text: R`<p class="hyp"><b>Setup.</b> $a\in\R$, $\lambda>0$, $g(w) = (w-a)^2+\lambda|w|$ (convex). Subdifferential: $\partial|w| = \{\mathrm{sign}(w)\}$ for $w\ne0$.</p>
<p class="claim"><b>Proposition.</b> The minimizer is $w^* = \mathrm{sign}(a)\max\{0,\,|a|-\frac\lambda2\}$.</p>
<p><b>Proof.</b> $w^*$ minimizes $g$ iff $0\in2(w^*-a)+\lambda\,\partial|w^*|$.</p>
$$\begin{aligned}
\partial|w|(0) &= \blank{a} &&\text{(i)}\\
w>0:\quad 2(w-a)+\lambda = 0\ &\iff\ w = \blank{b}\quad(\text{valid iff } a>\tfrac\lambda2) &&\text{(ii)}\\
w = 0:\quad 0\in[-2a-\lambda,\,-2a+\lambda]\ &\iff\ |a|\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>The case $w\lt0$ is symmetric to (ii). $\square$</p>` },

  lr10: { title: 'Gradient descent, momentum, SGD',
    text: R`<p class="hyp"><b>Setup.</b> We minimize $\hL(\bw) = \frac1N\sum_{n=1}^N\ell_n(\bw)$ with $\ell_n(\bw) = (\bw\T\bphi_n-y_n)^2$, step size $\gamma_t>0$.</p>
<p><b>Definitions.</b></p>
$$\begin{aligned}
\text{GD:}\quad&\bw_{t+1} = \bw_t-\gamma_t\nabla\hL(\bw_t) = \bw_t-\blank{a}\sum_{n=1}^N(\bw_t\T\bphi_n-y_n)\bphi_n\\
\text{Momentum:}\quad&\bw_{t+1} = \bw_t-\gamma_t\nabla\hL(\bw_t)+\blank{b}\qquad(\alpha\in[0,1))\\
\text{SGD:}\quad&\bw_{t+1} = \bw_t-\gamma_t\,\frac1{|\mathcal B_t|}\sum_{i\in\mathcal B_t}\nabla\ell_i(\bw_t)
\end{aligned}$$
<p>where $\mathcal B_t$ is a randomly drawn [[c]].</p>`,
    words: { c: { ans: ['mini-batch', 'minibatch', 'mini batch', 'batch', 'subset'], tex: 'mini-batch' } } },

  lr11: { title: 'The stochastic gradient is unbiased',
    text: R`<p class="hyp"><b>Setup.</b> $\hL(\bw) = \frac1N\sum_{i=1}^N\ell_i(\bw)$; $\mathcal B$ is drawn uniformly among the subsets of size $B$ of $\{1,\dots,N\}$; $\bw$ is fixed and $\bg = \frac1B\sum_{i\in\mathcal B}\nabla\ell_i(\bw)$.</p>
<p class="claim"><b>Proposition.</b> $\E_{\mathcal B}[\bg] = \nabla\hL(\bw)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E_{\mathcal B}[\bg] &= \E_{\mathcal B}\Big[\frac1B\sum_{i=1}^N\blank{a}\,\nabla\ell_i(\bw)\Big] &&\text{(i)}\\
&= \frac1B\sum_{i=1}^NP(i\in\mathcal B)\,\nabla\ell_i(\bw) &&\text{(ii)}\\
&= \frac1B\sum_{i=1}^N\blank{b}\,\nabla\ell_i(\bw) = \nabla\hL(\bw). &&\text{(iii)}
\end{aligned}$$
<p>(ii) follows from the [[c]] of expectation. In (iii), all probabilities $P(i\in\mathcal B)$ are equal by symmetry and sum to $\E|\mathcal B| = B$. $\square$</p>`,
    words: { c: { ans: ['linearity'], tex: 'linearity' } } },

  lr12: { title: 'Too many parameters: zero training error',
    text: R`<p class="hyp"><b>Setup.</b> Polynomial regression of degree $M$ on $N$ points with distinct inputs: $\bPhi\in\R^{N\times(M+1)}$, $\Phi_{nk} = x_n^k$.</p>
<p class="claim"><b>Proposition.</b> If $M+1>N$, $\bPhi\T\bPhi$ is singular; if $M+1\ge N$, the minimal training error is zero.</p>
<p><b>Proof.</b> The $M+1$ columns of $\bPhi$ are vectors of $\R^{\blank{a}}$. If there are more of them than the dimension, they are linearly [[b]], so $\ker\bPhi\ne\{0\}$ and $\bPhi\T\bPhi$ is not invertible. If $M+1\ge N$, a polynomial of degree $\le M$ goes through the $N$ points ([[c]]): the training error is $\blank{d}$. $\square$</p>`,
    words: { b: { ans: ['dependent', 'linearly dependent'], tex: 'dependent' }, c: { ans: ['interpolation', 'lagrange interpolation'], tex: 'interpolation' } } },

  d1a: { title: '$\\bPhi\\T\\bPhi$ invertible $\\iff$ columns of $\\bPhi$ independent',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> $\ker(\bPhi\T\bPhi) = \ker\bPhi$. In particular $\bPhi\T\bPhi$ is invertible iff the columns of $\bPhi$ are linearly independent.</p>
<p><b>Proof.</b> Let $\bv\in\R^L$.</p>
$$\begin{aligned}
\bPhi\bv = 0\ &\Longrightarrow\ \bPhi\T\bPhi\bv = \bPhi\T\mathbf 0 = 0 &&\text{(i)}\\
\bPhi\T\bPhi\bv = 0\ &\Longrightarrow\ 0 = \bv\T\bPhi\T\bPhi\bv = \blank{a}\ \Longrightarrow\ \bPhi\bv = \blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(i) gives $\ker\bPhi\subseteq\ker\bPhi\T\bPhi$ and (ii) the reverse inclusion. A square matrix is invertible iff its kernel is $\blank{c}$, and $\ker\bPhi = \{0\}$ means that no nonzero combination of the columns is 0: the columns are linearly [[d]]. $\square$</p>`,
    words: { d: { ans: ['independent', 'linearly independent'], tex: 'independent' } } },

  lr17: { title: 'The set of least-squares solutions',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> If $\hat\bw$ minimizes $\EMSE$, the set of minimizers is $\hat\bw+\ker\bPhi = \{\hat\bw+\bv : \bPhi\bv = 0\}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\bv\in\ker\bPhi\ &\Longrightarrow\ \bPhi(\hat\bw+\bv) = \bPhi\hat\bw+\blank{a} = \bPhi\hat\bw &&\text{(i)}\\
\bw_1,\bw_2\ \text{minimizers}\ &\Longrightarrow\ \bPhi\bw_1 = \bPhi\bw_2 = \hby\ \Longrightarrow\ \bw_1-\bw_2\in\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>By (i), $\hat\bw+\bv$ makes the same predictions, hence has the same MSE: it is also a minimizer. In (ii), $\hby$ is the same for both because the orthogonal projection of $\by$ onto the column space is [[c]]. $\square$</p>`,
    words: { c: { ans: ['unique'], tex: 'unique' } } },

  lr18: { title: 'The minimum-norm solution via the SVD',
    text: SETUP + R`<p class="hyp">Write the SVD $\bPhi = \mathbf U\boldsymbol\Sigma\mathbf V\T$ ($\mathbf U$, $\mathbf V$ orthogonal, singular values $\sigma_1\ge\dots\ge\sigma_r>0$, $r$ = rank), and set $\bz = \mathbf V\T\bw$, $\mathbf c = \mathbf U\T\by$.</p>
<p class="claim"><b>Proposition.</b> Among the minimizers of $\|\by-\bPhi\bw\|^2$, the one with minimal norm is $\bw^\dagger = \mathbf V\boldsymbol\Sigma^+\mathbf U\T\by = \bPhi^\dagger\by$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\|\by-\bPhi\bw\|^2 &= \|\mathbf U\T\by-\boldsymbol\Sigma\mathbf V\T\bw\|^2 = \|\mathbf c-\boldsymbol\Sigma\bz\|^2 &&\text{(i)}\\
&= \sum_{i=1}^r(c_i-\sigma_iz_i)^2+\sum_{i>r}c_i^2 &&\text{(ii)}\\
\text{minimum}\ &\iff\ z_i = \blank{a}\ \ (i\le r),\quad z_i\ \text{arbitrary}\ (i>r) &&\text{(iii)}\\
\|\bw\| = \|\bz\|\ &\Longrightarrow\ \text{minimal norm for } z_i = \blank{b}\ \ (i>r). &&\text{(iv)}
\end{aligned}$$
<p>(i) and (iv) use that an orthogonal matrix [[c]] norms. In (ii), $\sigma_i = 0$ for $i>r$. Hence $\bz^\dagger = \boldsymbol\Sigma^+\mathbf c$ and $\bw^\dagger = \mathbf V\bz^\dagger$. $\square$</p>`,
    words: { c: { ans: ['preserves', 'preserve', 'keeps'], tex: 'preserves' } } },

  d1c: { title: '$-\\nabla f$ is the steepest descent direction',
    text: R`<p class="hyp"><b>Setup.</b> $f:\R^D\to\R$ differentiable, $\bx$ a point where $\nabla f(\bx)\ne0$, and $\bu$ a unit direction.</p>
<p class="claim"><b>Proposition.</b> The directional derivative $D_\bu f(\bx)$ is minimal for $\bu = -\nabla f(\bx)/\|\nabla f(\bx)\|$, where it equals $-\|\nabla f(\bx)\|$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
f(\bx+h\bu) &= f(\bx)+h\,\blank{a}+o(h) &&\text{(i)}\\
D_\bu f(\bx) = \lim_{h\to0}\frac{f(\bx+h\bu)-f(\bx)}h &= \nabla f(\bx)\T\bu &&\text{(ii)}\\
\nabla f(\bx)\T\bu &\ge -\|\nabla f(\bx)\|\,\|\bu\| = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i) is the first-order [[c]] expansion; (iii) is the [[d]] inequality, with equality iff $\bu$ is collinear to $\nabla f$ with opposite direction. $\square$</p>`,
    words: { c: { ans: ['taylor'], tex: 'Taylor' }, d: { ans: ['Cauchy-Schwarz', 'cauchy schwarz'], tex: 'Cauchy–Schwarz' } } },

  d1d: { title: 'Convergence of gradient descent on a quadratic',
    text: R`<p class="hyp"><b>Setup.</b> $\hL(\bx) = \frac12\bx\T\bA\bx-\bb\T\bx$ with $\bA$ symmetric positive definite, eigenvalues $\mu_{\max} = \mu_1\ge\dots\ge\mu_D = \mu_{\min}>0$; minimum $\bx^* = \bA^{-1}\bb$. Gradient descent $\bx_{t+1} = \bx_t-\gamma\nabla\hL(\bx_t)$, error $\be_t = \bx_t-\bx^*$.</p>
<p class="claim"><b>Proposition.</b> Gradient descent converges iff $0\lt\gamma\lt2/\mu_{\max}$, and the best step size is $\gamma^* = \frac2{\mu_{\max}+\mu_{\min}}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\nabla\hL(\bx_t) &= \bA\bx_t-\bb = \bA(\bx_t-\bx^*) &&\text{(i)}\\
\be_{t+1} &= \be_t-\gamma\bA\be_t = (\blank{a})\,\be_t &&\text{(ii)}\\
e^{(i)}_t &= \blank{b}\;e^{(i)}_0\qquad\text{(coordinate on the } i\text{-th eigenvector)} &&\text{(iii)}\\
\text{convergence}\ &\iff\ |1-\gamma\mu_i|\lt1\ \ \forall i\ \iff\ 0\lt\gamma\lt\blank{c}. &&\text{(iv)}
\end{aligned}$$
<p>The rate $\max_i|1-\gamma\mu_i|$ is smallest when both extremes balance, $1-\gamma\mu_{\min} = -(1-\gamma\mu_{\max})$, which gives $\gamma^* = \blank{d}$. $\square$</p>` },

  lr19: { title: 'Least squares with a singular $\\bPhi\\T\\bPhi$',
    text: R`<p class="hyp"><b>Data.</b> Three examples, all at $x = 1$, with targets $\by = (1,2,3)$; model $f(x) = w_0+w_1x$, so $\bPhi$ has three rows equal to $(1,1)$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\bPhi\T\bPhi &= \begin{pmatrix}3&3\\3&3\end{pmatrix},\qquad\det(\bPhi\T\bPhi) = \blank{a}\\
\bPhi\T\by &= (6,6)\quad\Longrightarrow\quad\text{normal equations: } w_0+w_1 = \blank{b}\\
\ker\bPhi &= \{t(1,-1)\},\qquad\bw^\dagger = (\blank{c},\ \blank{c})
\end{aligned}$$
<p>$\bw^\dagger$ is the point of the line of solutions closest to the origin (minimum-norm solution).</p>` },

  lr13: { title: 'One gradient-descent step',
    gen: r => {
      const t0 = [-6, -5, -4, -2, -1, 0, 1][r.int(7)], g = [0.001, 0.005, 0.01, 0.02][r.int(4)];
      const d = 4 * t0 ** 3 + 21 * t0 ** 2 + 10 * t0 - 17, t1 = t0 - g * d;
      return { text: R`<p class="hyp"><b>Data.</b> $\hL(\theta) = \theta^4+7\theta^3+5\theta^2-17\theta+3$, gradient descent $\theta_{k+1} = \theta_k-\gamma\hL'(\theta_k)$, $\theta_0 = ${t0}$, $\gamma = ${g}$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\hL'(\theta) &= \blank{a}\\
\hL'(\theta_0) &= \blank{b}\\
\theta_1 &= \theta_0-\gamma\,\hL'(\theta_0) = \blank{c}
\end{aligned}$$`, solution: R`$\theta_1 = ${t0}-${g}\times(${d}) = ${f(t1)}$.` };
    } },

  lr14: { title: 'Step size of gradient descent on a quadratic',
    gen: r => {
      const m1 = [2, 4, 5, 8, 10, 20][r.int(6)], m2 = [0.5, 1, 2][r.int(3)];
      return { text: R`<p class="hyp"><b>Data.</b> $\hL(\bx) = \frac12\bx\T\bA\bx-\bb\T\bx$ with $\bA = \operatorname{diag}(${m1}, ${m2})$, constant step $\gamma$. Along each eigendirection the error satisfies $e^{(i)}_{t+1} = (1-\gamma\mu_i)e^{(i)}_t$; $\kappa = \mu_{\max}/\mu_{\min}$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\text{convergence}\iff|1-\gamma\mu_i|\lt1\ \forall i\ &\iff\ 0\lt\gamma\lt\blank{a}\\
\gamma^* = \frac{2}{\mu_{\max}+\mu_{\min}} &= \blank{b}\\
\text{rate}\ \frac{\kappa-1}{\kappa+1} &= \blank{c}
\end{aligned}$$`, solution: R`The binding constraint comes from $\mu_{\max} = ${m1}$; $\kappa = ${f(m1 / m2)}$.` };
    } },

  lr15: { title: 'Least squares by hand (3 points)',
    gen: r => {
      const y = [r.int(5) - 1, r.int(5), r.int(5) + 1];
      return { text: R`<p class="hyp"><b>Data.</b> Points $(0, ${y[0]})$, $(1, ${y[1]})$, $(2, ${y[2]})$; model $f(x) = w_1x+w_2$ fitted by least squares.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\bar x &= \blank{a},\qquad\bar y = \blank{b},\qquad\textstyle\sum_n(x_n-\bar x)^2 = \blank{c}\\
w_1 &= \frac{\sum_n(x_n-\bar x)(y_n-\bar y)}{\sum_n(x_n-\bar x)^2} = \blank{d}\\
w_2 &= \bar y-w_1\bar x = \blank{e}
\end{aligned}$$`, solution: R`Numerator: $(-1)(${y[0]}-\bar y)+0+(1)(${y[2]}-\bar y) = ${y[2]}-${y[0]}$.` };
    } },

  lr16: { title: 'Scalar ridge',
    gen: r => {
      const xs = [1, 2, 3].map(() => r.int(3) + 1), ys = xs.map(x => x * (r.int(3) + 1) - r.int(2)), lam = [0.1, 0.5, 1][r.int(3)];
      return { text: R`<p class="hyp"><b>Data.</b> Model $f(x) = wx$ (no bias), points $(${xs[0]},${ys[0]}), (${xs[1]},${ys[1]}), (${xs[2]},${ys[2]})$, objective $\frac1N\sum_n(y_n-wx_n)^2+\lambda w^2$, $N = 3$, $\lambda = ${lam}$. In 1D: $w = \frac{\sum_nx_ny_n}{\sum_nx_n^2+N\lambda}$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\textstyle\sum_nx_n^2 &= \blank{a},\qquad\textstyle\sum_nx_ny_n = \blank{b}\\
w_{\text{LS}}\ (\lambda = 0) &= \blank{c},\qquad w_{\text{ridge}} = \blank{d}
\end{aligned}$$`, solution: R`Ridge shrinks the coefficient towards 0.` };
    } },
  });
})(window.ML);
