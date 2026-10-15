/* English version — Chapter 2: logistic regression */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const SETUP = R`<p class="hyp"><b>Setup.</b> Binary classification, $N$ examples $(\bx_n,y_n)$ with $y_n\in\{0,1\}$. Model $\hat y_n = \sigma(\bw\T\bx_n)$ with $\sigma(t) = \frac1{1+e^{-t}}$, and cross-entropy $L(\bw) = -\sum_{n=1}^N\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big]$.</p>`;

  ML.EX.en({
  lg1: { title: 'Symmetry, logit and derivative of the sigmoid',
    text: R`<p class="hyp"><b>Setup.</b> $\sigma(t) = \frac1{1+e^{-t}}$.</p>
<p class="claim"><b>Proposition.</b> $1-\sigma(t) = \sigma(-t)$; $\sigma^{-1}(p) = \ln\frac p{1-p}$; $\sigma'(t) = \sigma(t)\big(1-\sigma(t)\big)$, maximal at $t = 0$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
1-\sigma(t) &= \frac{1+e^{-t}-1}{1+e^{-t}} = \frac{e^{-t}}{1+e^{-t}} = \blank{a} = \sigma(-t) &&\text{(i)}\\
p = \sigma(t)\ &\iff\ e^{-t} = \blank{b}\ \iff\ t = \ln\frac{p}{1-p} &&\text{(ii)}\\
\sigma'(t) &= \frac{e^{-t}}{(1+e^{-t})^2} = \frac1{1+e^{-t}}\cdot\frac{e^{-t}}{1+e^{-t}} = \sigma(t)\,\blank{c} &&\text{(iii)}\\
\sigma'(0) &= \tfrac12\cdot\tfrac12 = \blank{d}. &&\text{(iv)}
\end{aligned}$$
<p>In (i), numerator and denominator were multiplied by [[e]]. $\square$</p>` },

  lg2: { title: 'The logistic model and its decision boundary',
    text: R`<p class="hyp"><b>Setup.</b> Binary classification $y\in\{0,1\}$; write $p_\bw(\bx) = P(y = 1\mid\bx)$.</p>
<p><b>Definition.</b> Logistic regression models the [[a]] by an affine function:
$$\ln\frac{p_\bw(\bx)}{1-p_\bw(\bx)} = \bw\T\bx+b\quad\iff\quad p_\bw(\bx) = \blank{b}.$$
We predict class 1 iff $p_\bw(\bx)\ge\frac12$, i.e. iff $\bw\T\bx+b\,\blank{c}\,0$. The boundary $\{\bx : \bw\T\bx+b = 0\}$ is a [[d]] orthogonal to $\bw$.</p>`,
    words: { a: { ans: ['log-odds', 'log odds', 'logit'], tex: 'log-odds' }, d: { ans: ['hyperplane'], tex: 'hyperplane' } } },

  d2b: { title: 'Two Gaussians with shared covariance: the posterior is a sigmoid',
    text: R`<p class="hyp"><b>Setup.</b> Two classes $C_0,C_1$ with priors $\pi_0,\pi_1$ and $p(\bx\mid C_k) = \N(\bx\mid\bmu_k,\bSigma)$ (same covariance $\bSigma$). Let $a(\bx) = \ln\frac{\pi_1\N(\bx|\bmu_1,\bSigma)}{\pi_0\N(\bx|\bmu_0,\bSigma)}$.</p>
<p class="claim"><b>Proposition.</b> $a(\bx) = \bw\T\bx+b$ with $\bw = \bSigma^{-1}(\bmu_1-\bmu_0)$, and $p(C_1\mid\bx) = \sigma(a(\bx))$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\ln\N(\bx\mid\bmu_k,\bSigma) &= -\tfrac12\bx\T\bSigma^{-1}\bx+\blank{a}-\tfrac12\bmu_k\T\bSigma^{-1}\bmu_k+c &&\text{(i)}\\
a(\bx) &= (\bmu_1-\bmu_0)\T\bSigma^{-1}\bx-\tfrac12\bmu_1\T\bSigma^{-1}\bmu_1+\tfrac12\bmu_0\T\bSigma^{-1}\bmu_0+\ln\tfrac{\pi_1}{\pi_0} &&\text{(ii)}\\
p(C_1\mid\bx) &= \frac{A}{A+B} = \frac1{1+B/A} = \frac{1}{1+e^{\blank{b}}} = \sigma(a(\bx)) &&\text{(iii)}
\end{aligned}$$
<p>In (i), $c$ does not depend on the class. In (ii), the term $-\frac12\bx\T\bSigma^{-1}\bx$ and $c$ [[c]] because the covariance is shared. In (iii), $A = \pi_1\N(\bx|\bmu_1,\bSigma)$ and $B = \pi_0\N(\bx|\bmu_0,\bSigma)$, so $\ln\frac AB = a(\bx)$. $\square$</p>`,
    words: { c: { ans: ['cancel', 'cancel out', 'vanish'], tex: 'cancel' } } },

  lg3: { title: 'Why least squares is a poor classifier',
    text: R`<p class="hyp"><b>Setup.</b> Labels $y\in\{-1,+1\}$, real score $f = f(\bx)$, margin $m = yf$ (positive iff the example is correctly classified).</p>
<p class="claim"><b>Proposition.</b> $(y-f)^2 = (1-m)^2$: the squared loss also penalizes correctly classified examples with a large margin.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
(y-f)^2 &= y^2\Big(1-\frac fy\Big)^2 &&\text{(i)}\\
&= \blank{a}\cdot\big(1-\blank{b}\,f\big)^2 = (1-m)^2. &&\text{(ii)}
\end{aligned}$$
<p>(ii) uses $y = \pm1$, so $y^2 = 1$ and $\frac1y = y$. The function $m\mapsto(1-m)^2$ is zero at $m = 1$ and then [[c]] for $m>1$. $\square$</p>`,
    words: { c: { ans: ['increases', 'grows', 'increasing'], tex: 'increases' } } },

  lg4: { title: 'The Bernoulli likelihood gives the cross-entropy',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> $-\ln\prod_np(y_n\mid\bx_n,\bw) = L(\bw)$: minimizing the cross-entropy is maximizing the likelihood.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p(y_n\mid\bx_n,\bw) &= \hat y_n^{\,\blank{a}}\,(1-\hat y_n)^{\blank{b}} &&\text{(i)}\\
-\ln\prod_np(y_n\mid\bx_n,\bw) &= -\sum_n\ln p(y_n\mid\bx_n,\bw) &&\text{(ii)}\\
&= -\sum_n\big[y_n\ln\hat y_n+(1-y_n)\ln(1-\hat y_n)\big] = L(\bw). &&\text{(iii)}
\end{aligned}$$
<p>(i) combines the two cases $P(y = 1) = \hat y$ and $P(y = 0) = 1-\hat y$. The likelihood is a product thanks to the [[c]] of the examples. The factor $p(\bx_n)$ of the joint law does not depend on $\bw$ and drops out of the optimization. $\square$</p>`,
    words: { c: { ans: ['independence'], tex: 'independence' } } },

  d2c: { title: 'From the NLL in $\\{0,1\\}$ to the logistic loss in $\\{-1,+1\\}$',
    text: R`<p class="hyp"><b>Setup.</b> Score $f = f(\bx)$, probability of the positive class $\hat y = \sigma(f)$; NLL of one example $= -\ln P(\text{true class})$. Classes are now coded $y\in\{-1,+1\}$.</p>
<p class="claim"><b>Proposition.</b> In both cases the NLL equals $\ln(1+e^{-yf})$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
y = +1:\quad -\ln\hat y &= -\ln\sigma(f) &&\text{(i)}\\
y = -1:\quad -\ln(1-\hat y) &= -\ln\sigma(\blank{a}) &&\text{(ii)}\\
\text{in both cases:}\quad -\ln\sigma(yf) &= -\ln\frac1{1+e^{-yf}} = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) uses the symmetry $1-\sigma(t) = \sigma(-t)$. The two codings are related by $y^{\{0,1\}} = \blank{c}$. $\square$</p>` },

  lg5: { title: 'Cross-entropy',
    text: R`<p class="hyp"><b>Setup.</b> $r$ and $q$ are two probability distributions on a finite set $\mathcal Y$ ($r$: the target, $q$: the prediction).</p>
<p><b>Definition.</b> The cross-entropy of $r$ relative to $q$ is
$$H(r,q) = \blank{a}.$$
With the certain target $r_n(y) = \mathbb 1[y = y_n]$ only one term remains: $H(r_n,q) = \blank{b}$, the negative log-likelihood of example $n$.</p>` },

  lg6: { title: 'The cross-entropy upper-bounds the 0-1 loss',
    text: R`<p class="hyp"><b>Setup.</b> Labels $y\in\{-1,+1\}$, margin $m = yf(\bx)$, 0-1 loss $\mathbb 1(m\le0)$, logistic loss $\ln(1+e^{-m})$.</p>
<p class="claim"><b>Proposition.</b> For every $m\in\R$: $\mathbb 1(m\le0)\le\frac1{\ln2}\ln(1+e^{-m})$.</p>
<p><b>Proof.</b> Two cases.</p>
$$\begin{aligned}
m>0:\quad \mathbb 1(m\le0) &= \blank{a}\ \le\ \tfrac1{\ln2}\ln(1+e^{-m}) &&\text{(i)}\\
m\le0:\quad e^{-m}\ge\blank{b}\ &\Longrightarrow\ \ln(1+e^{-m})\ge\blank{c}\ \Longrightarrow\ 1\le\tfrac1{\ln2}\ln(1+e^{-m}). &&\text{(ii)}
\end{aligned}$$
<p>In (i) the right-hand side is positive since $1+e^{-m}>1$. Averaging over the examples, the classification error is at most $\frac1{\ln2}$ times the mean cross-entropy: minimizing the cross-entropy minimizes an [[d]] of the error. $\square$</p>`,
    words: { d: { ans: ['upper bound', 'surrogate', 'bound'], tex: 'upper bound' } } },

  lg7: { title: 'The gradient of the cross-entropy',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> $\nabla L(\bw) = \sum_{n=1}^N(\hat y_n-y_n)\,\bx_n$.</p>
<p><b>Proof.</b> Chain rule for each term $\ell_n = -y_n\ln\hat y_n-(1-y_n)\ln(1-\hat y_n)$:</p>
$$\begin{aligned}
\frac{\partial\ell_n}{\partial\hat y_n} &= -\frac{y_n}{\hat y_n}+\blank{a} = \frac{\hat y_n-y_n}{\hat y_n(1-\hat y_n)} &&\text{(i)}\\
\nabla_\bw\hat y_n &= \sigma'(\bw\T\bx_n)\,\bx_n = \blank{b}\,\bx_n &&\text{(ii)}\\
\nabla\ell_n &= \frac{\partial\ell_n}{\partial\hat y_n}\,\nabla_\bw\hat y_n = \big(\blank{c}\big)\,\bx_n. &&\text{(iii)}
\end{aligned}$$
<p>(ii) uses $\sigma' = \sigma(1-\sigma)$; in (iii) the factors $\hat y_n(1-\hat y_n)$ cancel. Sum over $n$. $\square$</p>` },

  lg8: { title: 'Hessian of the cross-entropy and convexity',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> $\nabla^2L(\bw) = \sum_n\hat y_n(1-\hat y_n)\,\bx_n\bx_n\T$ is positive semidefinite: $L$ is convex.</p>
<p><b>Proof.</b> Start from $\nabla L = \sum_n(\hat y_n-y_n)\bx_n$; only $\hat y_n$ depends on $\bw$.</p>
$$\begin{aligned}
\nabla^2L &= \sum_n\bx_n\,\big(\nabla_\bw\hat y_n\big)\T = \sum_n\blank{a}\,\bx_n\bx_n\T &&\text{(i)}\\
\bv\T\nabla^2L\,\bv &= \sum_n\hat y_n(1-\hat y_n)\,\bv\T\bx_n\bx_n\T\bv = \sum_n\hat y_n(1-\hat y_n)\,\big(\blank{b}\big)^2\ \ge\ 0. &&\text{(ii)}
\end{aligned}$$
<p>(ii) is $\ge0$ because $\hat y_n\in\blank{c}$, so $\hat y_n(1-\hat y_n)>0$. A function whose Hessian is positive semidefinite everywhere is [[d]]. $\square$</p>`,
    words: { d: { ans: ['convex'], tex: 'convex' } } },

  lg9: { title: 'The Newton update',
    text: R`<p class="hyp"><b>Setup.</b> $L(\bw)$ twice differentiable; $\mathbf g = \nabla L(\bw^{(k)})$ and $\mathbf H = \nabla^2L(\bw^{(k)})$, assumed positive definite.</p>
<p class="claim"><b>Proposition.</b> The minimizer of the quadratic approximation of $L$ at $\bw^{(k)}$ is $\bw^{(k+1)} = \bw^{(k)}-\mathbf H^{-1}\mathbf g$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\tilde L(\bw) &= L(\bw^{(k)})+\mathbf g\T(\bw-\bw^{(k)})+\blank{a} &&\text{(i)}\\
\nabla\tilde L(\bw) &= \mathbf g+\blank{b} &&\text{(ii)}\\
\nabla\tilde L(\bw) = 0\ &\iff\ \bw = \bw^{(k)}-\mathbf H^{-1}\mathbf g. &&\text{(iii)}
\end{aligned}$$
<p>(i) is the Taylor expansion of order [[c]]. Since $\mathbf H\succ0$, $\tilde L$ is strictly convex and (iii) is its unique minimum. If $L$ is exactly quadratic, $\tilde L = L$ and Newton finishes in one step. $\square$</p>` },

  lg10: { title: 'Two-class softmax and translation invariance',
    text: R`<p class="hyp"><b>Setup.</b> Softmax regression with $K$ classes: $p(y = k\mid\bx) = \frac{e^{a_k}}{\sum_{j}e^{a_j}}$ with $a_k = \bw_k\T\bx$.</p>
<p class="claim"><b>Proposition.</b> For $K = 2$ (classes 0 and 1), $p(y = 1\mid\bx) = \sigma(a_1-a_0)$. Adding the same vector $\mathbf c$ to all $\bw_k$ changes no probability.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p(y = 1\mid\bx) &= \frac{e^{a_1}}{e^{a_0}+e^{a_1}} = \frac1{\blank{a}+1} = \sigma(a_1-a_0) &&\text{(i)}\\
\frac{e^{(\bw_k+\mathbf c)\T\bx}}{\sum_je^{(\bw_j+\mathbf c)\T\bx}} &= \frac{\blank{b}\,e^{a_k}}{\blank{b}\sum_je^{a_j}} = p(y = k\mid\bx). &&\text{(ii)}
\end{aligned}$$
<p>(i): divide numerator and denominator by $e^{a_1}$. By (ii), only differences between the $\bw_k$ matter: the parameters are not [[c]]. $\square$</p>`,
    words: { c: { ans: ['identifiable', 'unique'], tex: 'identifiable' } } },

  lg12: { title: 'Evaluating the sigmoid',
    gen: r => {
      const t = [-2, -1, -0.5, 0.5, 1, 2, 3][r.int(7)];
      return { text: R`<p class="hyp"><b>Data.</b> $t = ${t}$, $\sigma(t) = \frac1{1+e^{-t}}$, $\sigma'(t) = \sigma(t)(1-\sigma(t))$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
e^{-t} &= \blank{a},\qquad\sigma(t) = \blank{b}\\
\sigma'(t) &= \blank{c},\qquad\frac{\sigma(t)}{1-\sigma(t)} = \blank{d}
\end{aligned}$$`, solution: R`The odds always equal $e^{t}$: the logit of $\sigma(t)$ is $t$.` };
    } },

  lg13: { title: 'Loss and gradient for one example',
    gen: r => {
      const x = [1, 2, -1, 0.5][r.int(4)], w = [0.5, 1, -0.5, 2][r.int(4)], y = r.int(2), p = M.sigmoid(w * x), g = (p - y) * x;
      return { text: R`<p class="hyp"><b>Data.</b> 1D model $\hat y = \sigma(wx)$, loss $\ell = -[y\ln\hat y+(1-y)\ln(1-\hat y)]$, gradient $\frac{\partial\ell}{\partial w} = (\hat y-y)x$. Example $x = ${x}$, $y = ${y}$, weight $w = ${w}$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
wx &= \blank{a},\qquad\hat y = \blank{b}\\
\ell &= \blank{c},\qquad\frac{\partial\ell}{\partial w} = \blank{d}
\end{aligned}$$`, solution: R`Gradient $= (${f(p)}-${y})\times${x} = ${f(g)}$.` };
    } },

  lg14: { title: 'One Newton step in 1D',
    gen: r => {
      const x0 = [1, 2, 3, -2][r.int(4)], k = [4, 6][r.int(2)];
      const x1 = x0 - (k * x0 ** (k - 1)) / (k * (k - 1) * x0 ** (k - 2));
      return { text: R`<p class="hyp"><b>Data.</b> $f(x) = x^{${k}}$, Newton's method in 1D: $x_{k+1} = x_k-\frac{f'(x_k)}{f''(x_k)}$, from $x_0 = ${x0}$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
f'(x_0) &= \blank{a},\qquad f''(x_0) = \blank{b}\\
x_1 &= \blank{c}
\end{aligned}$$`, solution: R`$x_1 = x_0\big(1-\frac1{${k - 1}}\big) = ${f(x1)}$: only linear convergence, because $f''(0) = 0$.` };
    } },

  lg15: { title: 'Softmax by hand',
    gen: r => {
      const a = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1];
      return { text: R`<p class="hyp"><b>Data.</b> Scores $(a_1,a_2,a_3) = (${a.join(', ')})$, $p_k = \frac{e^{a_k}}{\sum_je^{a_j}}$.</p>
<p><b>Computation.</b></p>
$$\begin{aligned}
\textstyle\sum_je^{a_j} &= \blank{a},\qquad p_1 = \blank{b}\\
p_1\ \text{after adding 5 to all scores} &= \blank{c}
\end{aligned}$$`, solution: R`Adding a constant multiplies numerator and denominator by $e^5$: nothing changes.` };
    } },
  });
})(window.ML);
