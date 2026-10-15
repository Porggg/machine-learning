/* English version — Chapter 3: SVMs */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);
  const SETUP = R`<p class="hyp"><b>Setup.</b> Data $(\bx_i,y_i)_{i=1}^N$, $y_i\in\{-1,+1\}$, classifier $f(\bx) = \bw\T\bx+b$. Hard-margin SVM: $\min_{\bw,b}\frac12\|\bw\|^2$ subject to $y_i(\bw\T\bx_i+b)\ge1$ for all $i$.</p>`;

  ML.EX.en({
  sv1: { title: 'Distance from a point to a hyperplane',
    text: R`<p class="hyp"><b>Setup.</b> $f(\bx) = \bw\T\bx+b$ with $\bw\ne0$, hyperplane $H = \{\bx : f(\bx) = 0\}$.</p>
<p class="claim"><b>Proposition.</b> $\bw$ is orthogonal to $H$, and the distance from $\bx$ to $H$ is $\frac{|f(\bx)|}{\|\bw\|}$.</p>
<p><b>Proof.</b> For $\bx_1,\bx_2\in H$, then for $\bx = \bx_p+\tau\frac{\bw}{\|\bw\|}$ with $\bx_p\in H$ its orthogonal projection:</p>
$$\begin{aligned}
\bw\T(\bx_1-\bx_2) &= f(\bx_1)-f(\bx_2) = \blank{a} &&\text{(i)}\\
0 = f(\bx_p) &= \bw\T\bx-\tau\frac{\bw\T\bw}{\|\bw\|}+b = f(\bx)-\tau\,\blank{b} &&\text{(ii)}\\
\tau &= \blank{c},\qquad\mathrm{dist}(\bx,H) = |\tau| = \frac{|f(\bx)|}{\|\bw\|}. &&\text{(iii)}
\end{aligned}$$
<p>By (i), $\bw$ is [[d]] to every direction contained in $H$. $\square$</p>`,
    words: { d: { ans: ['orthogonal', 'normal', 'perpendicular'], tex: 'orthogonal' } } },

  sv2: { title: 'From maximum margin to the canonical problem',
    text: R`<p class="hyp"><b>Setup.</b> Linearly separable data $(\bx_j,y_j)$, $y_j\in\{-1,+1\}$; margin of $(\bw,b)$: $\rho(\bw,b) = \min_j\frac{y_j(\bw\T\bx_j+b)}{\|\bw\|}$.</p>
<p class="claim"><b>Proposition.</b> Maximizing $\rho$ is equivalent to $\min_{\bw,b}\frac12\|\bw\|^2$ subject to $y_i(\bw\T\bx_i+b)\ge1$, and the optimal margin is $1/\|\bw^*\|$.</p>
<p><b>Proof.</b> For $\lambda>0$:</p>
$$\begin{aligned}
\rho(\lambda\bw,\lambda b) &= \frac{\min_j\lambda\,y_j(\bw\T\bx_j+b)}{\|\lambda\bw\|} = \frac{\blank{a}\min_jy_j(\bw\T\bx_j+b)}{\blank{a}\,\|\bw\|} = \rho(\bw,b) &&\text{(i)}\\
\text{normalization}\ \min_jy_j(\bw\T\bx_j+b) = \blank{b}\ &\Longrightarrow\ \rho(\bw,b) = \blank{c} &&\text{(ii)}\\
\max\frac1{\|\bw\|}\ &\iff\ \min\frac12\|\bw\|^2. &&\text{(iii)}
\end{aligned}$$
<p>By (i), rescaling changes neither the boundary nor the margin: we can impose (ii). (iii) holds because $t\mapsto1/t$ is decreasing and $t\mapsto\frac12t^2$ increasing on $(0,\infty)$. Finally "$\min = 1$" can be replaced by "$\ge1$ for all $i$", because an optimum always attains the minimum with [[d]]. $\square$</p>`,
    words: { d: { ans: ['equality'], tex: 'equality' } } },

  sv3: { title: 'Lagrangian and dual problem',
    text: R`<p class="hyp"><b>Setup.</b> Primal problem $\min_\bx L(\bx)$ subject to $g_i(\bx)\le0$, $i = 1,\dots,m$; optimal value $p^*$.</p>
<p><b>Definition.</b>
$$\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx)+\sum_i\lambda_ig_i(\bx),\quad\lambda_i\,\blank{a};\qquad D(\boldsymbol\lambda) = \blank{b};\qquad d^* = \max_{\boldsymbol\lambda\ge0}D(\boldsymbol\lambda).$$
We always have $d^*\le p^*$ ([[c]] duality); if $d^* = p^*$, duality is [[d]].</p>`,
    words: { c: { ans: ['weak'], tex: 'weak' }, d: { ans: ['strong'], tex: 'strong' } } },

  d3a: { title: 'The Lagrangian is a relaxation of the objective',
    text: R`<p class="hyp"><b>Setup.</b> Primal $\min L(\bx)$ subject to $g_i(\bx)\le0$; Lagrangian $\mathfrak L(\bx,\boldsymbol\lambda) = L(\bx)+\sum_i\lambda_ig_i(\bx)$; penalized objective $J(\bx) = L(\bx)$ if all constraints hold, $+\infty$ otherwise.</p>
<p class="claim"><b>Proposition.</b> $J(\bx) = \max_{\boldsymbol\lambda\ge0}\mathfrak L(\bx,\boldsymbol\lambda)$; in particular $\mathfrak L(\bx,\boldsymbol\lambda)\le J(\bx)$ for all $\boldsymbol\lambda\ge0$.</p>
<p><b>Proof.</b> The $\lambda_i$ are independent, so $\max_{\boldsymbol\lambda\ge0}\mathfrak L = L(\bx)+\sum_i\max_{\lambda_i\ge0}\lambda_ig_i(\bx)$, and</p>
$$\begin{aligned}
g_i(\bx)\le0:\quad\max_{\lambda_i\ge0}\lambda_ig_i(\bx) &= 0,\ \text{attained at } \lambda_i = \blank{a} &&\text{(i)}\\
g_i(\bx)>0:\quad\max_{\lambda_i\ge0}\lambda_ig_i(\bx) &= \blank{b}\quad(\lambda_i\to\infty) &&\text{(ii)}
\end{aligned}$$
<p>This is exactly $J$. A maximum is larger than each value, so $\mathfrak L(\bx,\boldsymbol\lambda)\,\blank{c}\,J(\bx)$. $\square$</p>` },

  sv4: { title: 'The minimax inequality (weak duality)',
    text: R`<p class="hyp"><b>Setup.</b> $\rho(x,y)$ a function of two variables (for which the min and max exist).</p>
<p class="claim"><b>Proposition.</b> $\max_y\min_x\rho(x,y)\le\min_x\max_y\rho(x,y)$. Applied to the Lagrangian, it gives $d^*\le p^*$.</p>
<p><b>Proof.</b> Let $\psi(y) = \min_{x'}\rho(x',y)$.</p>
$$\begin{aligned}
\forall x,y:\quad\psi(y) &\,\blank{a}\,\rho(x,y) &&\text{(i)}\\
\forall x:\quad\max_y\psi(y) &\le\blank{b} &&\text{(ii)}\\
\max_y\min_x\rho(x,y) &\le\min_x\max_y\rho(x,y). &&\text{(iii)}
\end{aligned}$$
<p>(i): a minimum is below each of the values. (ii): take the max over $y$ on both sides. (iii): the left-hand side does not depend on $x$, so we can take the [[c]] over $x$ on the right. With $\rho = \mathfrak L$, $\max_{\boldsymbol\lambda}\mathfrak L = J$ and $\min_\bx J = p^*$. $\square$</p>`,
    words: { c: { ans: ['min', 'minimum'], tex: 'min' } } },

  sv5: { title: 'Equality constraints: multiplier of any sign',
    text: R`<p class="hyp"><b>Setup.</b> An equality constraint $h(\bx) = 0$, written as two inequalities $h(\bx)\le0$ and $-h(\bx)\le0$, with multipliers $\lambda_1,\lambda_2\ge0$.</p>
<p class="claim"><b>Proposition.</b> In the Lagrangian the constraint $h(\bx) = 0$ appears as $\nu\,h(\bx)$ with $\nu\in\R$ of unrestricted sign.</p>
<p><b>Proof.</b></p>
$$\lambda_1h(\bx)+\lambda_2\big(-h(\bx)\big) = (\blank{a})\,h(\bx) = \nu\,h(\bx).$$
<p>When $\lambda_1$ and $\lambda_2$ range over $[0,\infty)$, their difference $\nu$ ranges over [[b]]. $\square$</p>`,
    words: { b: { ans: ['R', 'all of R', 'the reals', 'real numbers', 'all reals'], tex: R`all of $\R$` } } },

  sv6: { title: 'The dual of the hard-margin SVM',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> The dual is $\max_{\boldsymbol\alpha\ge0}\ \sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\bx_i\T\bx_j$ subject to $\sum_i\alpha_iy_i = 0$, and $\bw^* = \sum_i\alpha_i^*y_i\bx_i$.</p>
<p><b>Proof.</b> Lagrangian, $\alpha_i\ge0$: $\mathfrak L = \frac12\|\bw\|^2+\sum_i\alpha_i\big(1-y_i(\bw\T\bx_i+b)\big)$.</p>
$$\begin{aligned}
\nabla_\bw\mathfrak L &= \bw-\blank{a} = 0 &&\text{(i)}\\
\frac{\partial\mathfrak L}{\partial b} &= -\blank{b} = 0 &&\text{(ii)}\\
D(\boldsymbol\alpha) &= \tfrac12\|\bw\|^2-\textstyle\sum_i\alpha_iy_i\bw\T\bx_i+\sum_i\alpha_i = \tfrac12\|\bw\|^2-\|\bw\|^2+\sum_i\alpha_i &&\text{(iii)}\\
&= \textstyle\sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_j\,\blank{c}. &&\text{(iv)}
\end{aligned}$$
<p>In (iii), $\bw$ was replaced using (i) and the term in $b$ vanishes thanks to (ii). If $\sum_i\alpha_iy_i\ne0$, $\mathfrak L$ is affine in $b$ with nonzero slope and $D(\boldsymbol\alpha) = \blank{d}$: hence the equality constraint of the dual. $\square$</p>` },

  sv7: { title: 'Support vectors and computing the bias',
    text: SETUP + R`<p class="hyp">Let $(\bw^*,b^*)$ and $\boldsymbol\alpha^*$ be primal and dual solutions; assume complementary slackness $\alpha_i^*\big(1-y_i(\bw^{*\top}\bx_i+b^*)\big) = 0$ for all $i$.</p>
<p class="claim"><b>Proposition.</b> If $\alpha_s^*>0$, then $\bx_s$ lies on the margin boundary and $b^* = y_s-\bw^{*\top}\bx_s$. If $y_if(\bx_i)>1$, then $\alpha_i^* = 0$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\alpha_s^*>0\ &\Longrightarrow\ 1-y_s(\bw^{*\top}\bx_s+b^*) = \blank{a} &&\text{(i)}\\
&\Longrightarrow\ \bw^{*\top}\bx_s+b^* = y_s &&\text{(ii)}\\
y_if(\bx_i)>1\ &\Longrightarrow\ 1-y_if(\bx_i)\ne0\ \Longrightarrow\ \alpha_i^* = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii): multiply (i) by $y_s$ and use $y_s^2 = \blank{c}$. The points with $\alpha_i^*>0$ are the [[d]]; only they appear in $\bw^* = \sum_i\alpha_i^*y_i\bx_i$. $\square$</p>`,
    words: { d: { ans: ['support vectors', 'support vector'], tex: 'support vectors' } } },

  sv8: { title: 'Soft margin: the box constraint $0\\le\\alpha_i\\le C$',
    text: R`<p class="hyp"><b>Setup.</b> Soft-margin SVM: $\min_{\bw,b,\boldsymbol\xi}\frac12\|\bw\|^2+C\sum_i\xi_i$ subject to $y_i(\bw\T\bx_i+b)\ge1-\xi_i$ and $\xi_i\ge0$ ($C>0$). Multipliers $\alpha_i\ge0$ (margin) and $\beta_i\ge0$ ($\xi_i\ge0$).</p>
<p class="claim"><b>Proposition.</b> The dual is that of the hard margin, with the extra constraint $\alpha_i\le C$.</p>
<p><b>Proof.</b> $\mathfrak L = \frac12\|\bw\|^2+C\sum_i\xi_i+\sum_i\alpha_i\big(1-\xi_i-y_i(\bw\T\bx_i+b)\big)-\sum_i\beta_i\xi_i$.</p>
$$\begin{aligned}
\frac{\partial\mathfrak L}{\partial\xi_i} &= \blank{a} = 0 &&\text{(i)}\\
\beta_i\ge0\ &\Longrightarrow\ \alpha_i = C-\beta_i\le\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>With (i), the terms in $\xi_i$ disappear from $\mathfrak L$; the conditions in $\bw$ and $b$ are those of the hard margin. The dual is therefore identical, with the constraint $\blank{c}\le\alpha_i\le C$. $\square$</p>` },

  d3b: { title: 'Optimal slack = hinge loss',
    text: R`<p class="hyp"><b>Setup.</b> Soft-margin SVM: $\min_{\bw,b,\boldsymbol\xi}\frac12\|\bw\|^2+C\sum_i\xi_i$ subject to $y_i(\bw\T\bx_i+b)\ge1-\xi_i$ and $\xi_i\ge0$, $C>0$. Let $t_i = y_i(\bw\T\bx_i+b)$.</p>
<p class="claim"><b>Proposition.</b> For fixed $(\bw,b)$, $\xi_i^* = \max\{0,1-t_i\}$, and the soft SVM is equivalent to $\min_{\bw,b}\frac12\|\bw\|^2+C\sum_i\max\{0,1-t_i\}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\xi_i\ge1-t_i\ \text{and}\ \xi_i\ge0\ &\iff\ \xi_i\ge\blank{a} &&\text{(i)}\\
\xi_i^* &= \max\{0,1-t_i\} &&\text{(ii)}
\end{aligned}$$
<p>The constraints on the $\xi_i$ are decoupled. The objective contains $+C\xi_i$ with $C>0$: it is [[b]] in $\xi_i$, so we take the smallest feasible $\xi_i$, which gives (ii). Plugging back in, we get the sum of the [[c]] losses. $\square$</p>`,
    words: { b: { ans: ['increasing', 'strictly increasing'], tex: 'increasing' }, c: { ans: ['hinge'], tex: 'hinge' } } },

  sv9: { title: 'Kernels (kernel trick)',
    text: R`<p class="hyp"><b>Setup.</b> SVM on features $\bphi(\bx)$; in the dual the data only appear through the inner products $\bphi(\bx_i)\T\bphi(\bx_j)$.</p>
<p><b>Definition.</b> A kernel is a function $\kappa(\bx,\bx') = \blank{a}$ that can be computed without building $\bphi$. The prediction is
$$f(\bx) = \sum_i\alpha_iy_i\,\blank{b}+b.$$
RBF kernel: $\kappa(\bx,\bx') = \exp\big(\blank{c}\big)$.</p>` },

  d3c: { title: 'The kernel $(\\bx\\T\\bx\')^2$ is an inner product',
    text: R`<p class="hyp"><b>Setup.</b> $\bx = (x_1,x_2)$, $\bx' = (x_1',x_2')$ in $\R^2$; polynomial kernel $\kappa(\bx,\bx') = (\bx\T\bx')^2$.</p>
<p class="claim"><b>Proposition.</b> $\kappa(\bx,\bx') = \bphi(\bx)\T\bphi(\bx')$ with $\bphi(\bx) = (x_1^2,\sqrt2x_1x_2,x_2^2)\in\R^3$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
(\bx\T\bx')^2 &= (x_1x_1'+x_2x_2')^2 = x_1^2x_1'^2+\blank{a}+x_2^2x_2'^2 &&\text{(i)}\\
&= (x_1^2,\ \blank{b},\ x_2^2)\cdot(x_1'^2,\ \sqrt2x_1'x_2',\ x_2'^2). &&\text{(ii)}
\end{aligned}$$
<p>Computing $\kappa$ costs $O(D)$, whereas $\bphi$ has $\binom{D+d-1}{d}$ coordinates for degree $d$: this is the gain of the kernel trick. $\square$</p>` },

  d3d: { title: 'The RBF kernel has infinite-dimensional features',
    text: R`<p class="hyp"><b>Setup.</b> RBF kernel in 1D: $\kappa(x,x') = e^{-(x-x')^2/2\sigma^2}$, $\sigma>0$.</p>
<p class="claim"><b>Proposition.</b> $\kappa(x,x') = \bphi(x)\T\bphi(x')$ with $\bphi(x) = e^{-x^2/2\sigma^2}\Big(\frac{x^k}{\sqrt{k!}\,\sigma^k}\Big)_{k\ge0}$, which is infinite-dimensional.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
e^{-(x-x')^2/2\sigma^2} &= e^{-x^2/2\sigma^2}\,e^{-x'^2/2\sigma^2}\,e^{\blank{a}} &&\text{(i)}\\
e^{xx'/\sigma^2} &= \sum_{k=0}^\infty\frac{(xx')^k}{\blank{b}} = \sum_{k=0}^\infty\frac{x^k}{\sqrt{k!}\,\sigma^k}\cdot\frac{x'^k}{\sqrt{k!}\,\sigma^k}. &&\text{(ii)}
\end{aligned}$$
<p>(i) comes from $(x-x')^2 = x^2-2xx'+x'^2$; (ii) is the [[c]] series of the exponential. $\square$</p>`,
    words: { c: { ans: ['taylor', 'power', 'maclaurin'], tex: 'Taylor' } } },

  sv10: { title: 'Point–hyperplane distance',
    gen: r => {
      const w = [[3, 4], [1, 1], [2, 0], [5, 12]][r.int(4)], b = r.int(5) - 2, x = [r.int(5) - 2, r.int(5) - 2], fx = M.dot(w, x) + b;
      return { text: R`<p class="hyp"><b>Data.</b> $\bw = (${w.join(', ')})$, $b = ${b}$, $\bx = (${x.join(', ')})$; $f(\bx) = \bw\T\bx+b$ and $\rho(\bx) = \frac{|f(\bx)|}{\|\bw\|}$.</p>
<p><b>Computation.</b>
$$f(\bx) = \blank{a},\qquad\|\bw\| = \blank{b},\qquad\rho(\bx) = \blank{c}.$$</p>`, solution: R`$f(\bx) = ${w[0]}\cdot${x[0]}+${w[1]}\cdot${x[1]}+${b} = ${fx}$.` };
    } },

  sv11: { title: 'A 1D SVM by hand',
    gen: r => {
      const p = r.int(3) - 2, q = p + 1 + r.int(3);
      return { text: R`<p class="hyp"><b>Data.</b> In 1D, $f(x) = wx+b$. The closest negative point is at $${p}$, the closest positive at $${q}$; at the optimum they lie on the margin boundaries: $w\cdot(${p})+b = -1$ and $w\cdot${q}+b = 1$.</p>
<p><b>Computation.</b>
$$w = \blank{a},\qquad b = \blank{b},\qquad\text{margin } \frac1{|w|} = \blank{c}.$$</p>`, solution: R`Subtracting: $w(${q}-(${p})) = 2$; the boundary is in the middle, at $x = ${(p + q) / 2}$.` };
    } },

  sv12: { title: 'Evaluating kernels',
    gen: r => {
      const x = [r.int(3), r.int(3) - 1], y = [r.int(3) - 1, r.int(3)], s = [0.5, 1, 2][r.int(3)];
      return { text: R`<p class="hyp"><b>Data.</b> $\bx = (${x.join(', ')})$, $\bx' = (${y.join(', ')})$, $\sigma = ${s}$.</p>
<p><b>Computation.</b>
$$\begin{aligned}
\bx\T\bx' &= \blank{a},\qquad(\bx\T\bx')^2 = \blank{b}\\
\|\bx-\bx'\|^2 &= \blank{c},\qquad\exp\Big(-\frac{\|\bx-\bx'\|^2}{2\sigma^2}\Big) = \blank{d}
\end{aligned}$$</p>` };
    } },

  sv13: { title: 'Duality on a small problem',
    gen: r => {
      const a = 2 + r.int(3), c = r.int(2);
      return { text: R`<p class="hyp"><b>Data.</b> Primal $\min_x(x-${a})^2$ subject to $x\le${c}$; Lagrangian $\mathfrak L(x,\lambda) = (x-${a})^2+\lambda(x-${c})$, $\lambda\ge0$.</p>
<p><b>Computation.</b>
$$\begin{aligned}
\tfrac{\partial\mathfrak L}{\partial x} = 2(x-${a})+\lambda = 0\ &\Longrightarrow\ x(\lambda) = \blank{a}\\
D(\lambda) = \lambda(${a}-${c})-\tfrac{\lambda^2}{4}\ &\Longrightarrow\ \lambda^* = \blank{b},\quad d^* = \blank{c}
\end{aligned}$$
The primal value is $p^* = (${c}-${a})^2$: duality is strong.</p>` };
    } },
  });
})(window.ML);
