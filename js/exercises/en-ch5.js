/* English version — Chapter 5: neural networks */
(function (ML) {
  'use strict';
  const R = String.raw, M = ML.math, f = (x, d = 4) => +(+x).toFixed(d);

  ML.EX.en({
  nn1: { title: 'XOR is not linearly separable',
    text: R`<p class="hyp"><b>Setup.</b> XOR on $\{0,1\}^2$: class 1 at $(0,1)$ and $(1,0)$, class 0 at $(0,0)$ and $(1,1)$. A linear classifier $f(\bx) = w_1x_1+w_2x_2+b$ predicts class 1 iff $f(\bx)\ge0$.</p>
<p class="claim"><b>Proposition.</b> No $(w_1,w_2,b)$ classifies the 4 points correctly.</p>
<p><b>Proof.</b> By contradiction, assume all 4 points are correctly classified.</p>
$$\begin{aligned}
\text{class 1:}\quad f(0,1) = \blank{a}\ge0,\ \ f(1,0) = w_1+b\ge0\ &\Longrightarrow\ w_1+w_2+2b\ge0 &&\text{(i)}\\
\text{class 0:}\quad f(0,0) = \blank{b}\lt0,\ \ f(1,1) = \blank{c}\lt0\ &\Longrightarrow\ w_1+w_2+2b\lt0 &&\text{(ii)}
\end{aligned}$$
<p>(i) and (ii) are obtained by [[d]] the two inequalities. The same number cannot be both $\ge0$ and $\lt0$: contradiction. $\square$</p>`,
    words: { d: { ans: ['adding', 'summing'], tex: 'adding' } } },

  nn2: { title: 'XOR with two hidden units',
    text: R`<p class="hyp"><b>Setup.</b> $\bx\in\{0,1\}^2$, $\mathrm{sign}(t) = +1$ if $t\ge0$ and $-1$ otherwise. $h_1 = \mathrm{sign}(x_1+x_2-0.5)$, $h_2 = \mathrm{sign}(x_1+x_2-1.5)$, $\hat y = \mathrm{sign}\big(\frac12h_1-\frac12h_2-\frac12\big)$.</p>
<p class="claim"><b>Proposition.</b> $\hat y = +1$ exactly on class 1 of XOR.</p>
<p><b>Proof.</b> Check the 4 corners:</p>
$$\begin{aligned}
(0,0):\ &h_1 = -1,\ h_2 = -1,\quad\tfrac12h_1-\tfrac12h_2-\tfrac12 = -\tfrac12\ \Longrightarrow\ \hat y = -1\\
(0,1),(1,0):\ &h_1 = +1,\ h_2 = \blank{a},\quad\tfrac12h_1-\tfrac12h_2-\tfrac12 = \blank{b}\ \Longrightarrow\ \hat y = +1\\
(1,1):\ &h_1 = +1,\ h_2 = +1,\quad\tfrac12h_1-\tfrac12h_2-\tfrac12 = \blank{c}\ \Longrightarrow\ \hat y = -1
\end{aligned}$$
<p>$h_1$ computes a logical [[d]], $h_2$ a logical [[e]], and the output "OR but not AND". $\square$</p>`,
    words: { d: { ans: ['OR'], tex: 'OR' }, e: { ans: ['AND'], tex: 'AND' } } },

  nn3: { title: 'An AND of $K$ hidden units',
    text: R`<p class="hyp"><b>Setup.</b> $K$ hidden units $h_i\in\{-1,+1\}$; output $\mathrm{sign}\big(\sum_ih_i-(K-1)\big)$.</p>
<p class="claim"><b>Proposition.</b> The output is $+1$ iff all units are $+1$ (it is an AND).</p>
<p><b>Proof.</b> Let $m$ be the number of units equal to $+1$.</p>
$$\begin{aligned}
\textstyle\sum_ih_i &= m-(K-m) = \blank{a} &&\text{(i)}\\
\textstyle\sum_ih_i-(K-1) &= 2m-2K+1\ge0\ \iff\ m\ge K-\tfrac12\ \iff\ m = \blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>For a triangle ($K = 3$ half-planes), the threshold is $K-1 = \blank{c}$. $\square$</p>` },

  nn15: { title: 'Any boolean function of two inputs with 4 detectors',
    text: R`<p class="hyp"><b>Setup.</b> For each corner $(a,b)\in\{0,1\}^2$, a detector $h_{ab}(\bx) = \mathrm{sign}\big((2a-1)x_1-a+(2b-1)x_2-b+\frac12\big)$. For $f:\{0,1\}^2\to\{-1,+1\}$, set $w_{ab} = f(a,b)$, $b_{\text{out}} = \sum_{a,b}w_{ab}$ and $\hat y = \mathrm{sign}\big(\sum_{a,b}w_{ab}h_{ab}+b_{\text{out}}\big)$.</p>
<p class="claim"><b>Proposition.</b> At each corner exactly one detector is $+1$, and $\hat y = f$.</p>
<p><b>Proof.</b> For one coordinate $a'\in\{0,1\}$ and $a\in\{0,1\}$ (so $a^2 = a$):</p>
$$\begin{aligned}
a' = a:\quad(2a-1)a-a &= 2a^2-2a = \blank{a} &&\text{(i)}\\
a' = 1-a:\quad(2a-1)(1-a)-a &= \blank{b} &&\text{(ii)}\\
\textstyle\sum_{(a',b')}w_{a'b'}h_{a'b'}+b_{\text{out}} &= w_{ab}-\textstyle\sum_{\text{others}}w+\big(w_{ab}+\sum_{\text{others}}w\big) = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>By (i)–(ii), the argument of $h_{ab}$ at corner $\bx$ is $\frac12-(\text{number of differing coordinates})$: $+\frac12$ only at corner $(a,b)$, hence a single detector fires. (iii) is computed at corner $(a,b)$; its sign is that of $w_{ab} = f(a,b)$. $\square$</p>` },

  nn4: { title: 'The multilayer perceptron',
    text: R`<p class="hyp"><b>Setup.</b> MLP with $L$ affine layers, input $\bx$, activations $\varphi_\ell$ applied componentwise.</p>
<p><b>Definition.</b>
$$\bh^{(0)} = \bx,\qquad\bz^{(\ell)} = \blank{a},\qquad\bh^{(\ell)} = \varphi_\ell\big(\bz^{(\ell)}\big)\ (\ell\lt L),\qquad f_\theta(\bx) = \bz^{(L)}.$$
If $\bh^{(\ell-1)}\in\R^D$ and $\bz^{(\ell)}\in\R^H$, then $W_\ell\in\R^{\blank{b}}$. The output $\bz^{(L)}$ is called the [[c]], and an MLP with $L$ layers has $L-1$ hidden layers.</p>`,
    words: { c: { ans: ['logits', 'scores', 'class scores'], tex: 'logits' } } },

  nn5: { title: 'Without activation an MLP stays affine; number of parameters',
    text: R`<p class="hyp"><b>Setup.</b> Affine layers $\bz^{(\ell)} = W_\ell\bh^{(\ell-1)}+\bb_\ell$ with $W_\ell\in\R^{d_\ell\times d_{\ell-1}}$.</p>
<p class="claim"><b>Proposition.</b> Without nonlinear activation, the network is a single affine map. Layer $\ell$ has $d_\ell(d_{\ell-1}+1)$ parameters.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
W_2(W_1\bx+\bb_1)+\bb_2 &= \blank{a}\,\bx+\blank{b} &&\text{(i)}\\
\#\text{parameters of layer } \ell &= \underbrace{d_\ell\,d_{\ell-1}}_{W_\ell}+\underbrace{\blank{c}}_{\bb_\ell}. &&\text{(ii)}
\end{aligned}$$
<p>By (i) and by [[d]], $L$ composed affine layers remain affine: the boundary would stay a hyperplane and XOR impossible. $\square$</p>`,
    words: { d: { ans: ['induction', 'recursion'], tex: 'induction' } } },

  d5a: { title: 'Derivatives of the activations',
    text: R`<p class="hyp"><b>Setup.</b> $\sigma(z) = \frac1{1+e^{-z}}$, $\tanh z = \frac{e^z-e^{-z}}{e^z+e^{-z}}$, $\mathrm{ReLU}(z) = \max\{0,z\}$.</p>
<p class="claim"><b>Proposition.</b> $\sigma' = \sigma(1-\sigma)$, $\tanh z = 2\sigma(2z)-1$, $\tanh' = 1-\tanh^2$, and $\mathrm{ReLU}'(z) = \mathbb 1[z>0]$ ($z\ne0$).</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\sigma'(z) &= \frac{e^{-z}}{(1+e^{-z})^2} = \blank{a} &&\text{(i)}\\
\tanh z &= \frac{1-e^{-2z}}{1+e^{-2z}} = \frac{2}{1+e^{-2z}}-1 = 2\sigma(\blank{b})-1 &&\text{(ii)}\\
\tanh'(z) &= 4\sigma'(2z) = 4\sigma(2z)\big(1-\sigma(2z)\big) = \blank{c} &&\text{(iii)}
\end{aligned}$$
<p>(ii): divide numerator and denominator by $e^z$. (iii): with $s = \sigma(2z)$, $\tanh = 2s-1$ and $1-(2s-1)^2 = 4s(1-s)$. The ReLU has derivative $\blank{d}$ for $z>0$ and $0$ for $z\lt0$. $\square$</p>` },

  nn6: { title: 'Gradient of the BCE with respect to the logit',
    text: R`<p class="hyp"><b>Setup.</b> $y\in\{0,1\}$, logit $z$, $p = \sigma(z)$, loss $\ell = -y\log p-(1-y)\log(1-p)$.</p>
<p class="claim"><b>Proposition.</b> $\frac{\partial\ell}{\partial z} = p-y$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\frac{\partial\ell}{\partial p} &= -\frac yp+\blank{a} &&\text{(i)}\\
\frac{dp}{dz} &= \blank{b} &&\text{(ii)}\\
\frac{\partial\ell}{\partial z} &= \Big(-\frac yp+\frac{1-y}{1-p}\Big)p(1-p) = -y(1-p)+\blank{c} = p-y. &&\text{(iii)}
\end{aligned}$$
<p>(iii) is the [[d]] rule. $\square$</p>`,
    words: { d: { ans: ['chain'], tex: 'chain' } } },

  nn7: { title: 'Properties of the softmax',
    text: R`<p class="hyp"><b>Setup.</b> Logits $\bz\in\R^K$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$; temperature $T>0$: $p_k(T) = \frac{e^{z_k/T}}{\sum_je^{z_j/T}}$.</p>
<p class="claim"><b>Proposition.</b> $(p_k)$ is a probability distribution; it is invariant when a constant is added to all logits; the temperature does not change the argmax; and $\ln p_k = z_k-m-\ln\sum_je^{z_j-m}$ with $m = \max_jz_j$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p_k>0,\qquad\textstyle\sum_kp_k &= \frac{\sum_ke^{z_k}}{\sum_je^{z_j}} = \blank{a} &&\text{(i)}\\
\frac{e^{z_k+c}}{\sum_je^{z_j+c}} &= \frac{\blank{b}\,e^{z_k}}{\blank{b}\sum_je^{z_j}} = p_k &&\text{(ii)}\\
\frac{p_k(T)}{p_j(T)} &= e^{\blank{c}} &&\text{(iii)}\\
p_k &= \frac{e^{z_k-m}}{\sum_je^{z_j-m}}\ \Longrightarrow\ \ln p_k = z_k-m-\ln\textstyle\sum_je^{z_j-m}. &&\text{(iv)}
\end{aligned}$$
<p>(iii): since $T>0$, its sign is that of $z_k-z_j$, so the order of the $p_k$ is unchanged. (iv) is (ii) with $c = -m$: all exponents are $\le\blank{d}$, which avoids overflow. $\square$</p>` },

  nn8: { title: 'Softmax + cross-entropy: gradient $p_k-y_k$',
    text: R`<p class="hyp"><b>Setup.</b> Logits $\bz\in\R^K$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, true class $y$, one-hot $y_k = \mathbb 1[k = y]$, loss $\ell = -\log p_y$.</p>
<p class="claim"><b>Proposition.</b> $\frac{\partial\ell}{\partial z_k} = p_k-y_k$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\ell &= -\log\frac{e^{z_y}}{\sum_je^{z_j}} = -z_y+\blank{a} &&\text{(i)}\\
\frac{\partial(-z_y)}{\partial z_k} &= -y_k,\qquad\frac{\partial}{\partial z_k}\log\textstyle\sum_je^{z_j} = \frac{e^{z_k}}{\sum_je^{z_j}} = \blank{b} &&\text{(ii)}\\
\frac{\partial\ell}{\partial z_k} &= p_k-y_k. &&\text{(iii)}
\end{aligned}$$
<p>The gradient is [[c]] on the true class ($p_y-1$) and positive on the others; its components sum to 0. $\square$</p>`,
    words: { c: { ans: ['negative'], tex: 'negative' } } },

  nn12: { title: 'Why gradients add up at branches',
    text: R`<p class="hyp"><b>Setup.</b> A variable $x$ reaches the loss through two paths: $z_1 = g_1(x)$, $z_2 = g_2(x)$ and $\hL = h(z_1,z_2)$.</p>
<p class="claim"><b>Proposition.</b> $\frac{d\hL}{dx} = \frac{\partial h}{\partial z_1}g_1'(x)+\frac{\partial h}{\partial z_2}g_2'(x)$.</p>
<p><b>Proof.</b> Move $x$ by a small $\Delta x$:</p>
$$\begin{aligned}
\Delta z_1\approx g_1'(x)\Delta x,\qquad\Delta z_2 &\approx\blank{a} &&\text{(i)}\\
\Delta\hL &\approx\frac{\partial h}{\partial z_1}\Delta z_1+\blank{b} &&\text{(ii)}\\
&= \Big(\frac{\partial h}{\partial z_1}g_1'(x)+\frac{\partial h}{\partial z_2}g_2'(x)\Big)\Delta x. &&\text{(iii)}
\end{aligned}$$
<p>(ii) is the first-order expansion of $h$ (the change is the sum of the effects of each argument). Divide by $\Delta x$ and let $\Delta x\to0$. For a vector activated componentwise, $\bh = \varphi(\bz)$, the same rule gives $\frac{\partial\hL}{\partial\bz} = \frac{\partial\hL}{\partial\bh}\,\blank{c}\,\varphi'(\bz)$. $\square$</p>` },

  nn11: { title: 'Backpropagation through an affine layer',
    text: R`<p class="hyp"><b>Setup.</b> Layer $\bz = W\bh+\bb$, $W\in\R^{H\times D}$, inside a network with scalar loss $\hL$; we know $\boldsymbol\delta = \partial\hL/\partial\bz\in\R^H$.</p>
<p class="claim"><b>Proposition.</b> $\frac{\partial\hL}{\partial W} = \boldsymbol\delta\bh\T$, $\frac{\partial\hL}{\partial\bb} = \boldsymbol\delta$, $\frac{\partial\hL}{\partial\bh} = W\T\boldsymbol\delta$.</p>
<p><b>Proof.</b> Componentwise, $z_i = \sum_kW_{ik}h_k+b_i$:</p>
$$\begin{aligned}
\frac{\partial\hL}{\partial W_{ij}} &= \delta_i\,\frac{\partial z_i}{\partial W_{ij}} = \delta_i\,\blank{a} &&\text{(i)}\\
\frac{\partial\hL}{\partial b_i} &= \delta_i\cdot\blank{b} &&\text{(ii)}\\
\frac{\partial\hL}{\partial h_j} &= \sum_i\delta_i\,\frac{\partial z_i}{\partial h_j} = \sum_i\delta_i\,\blank{c} = (W\T\boldsymbol\delta)_j. &&\text{(iii)}
\end{aligned}$$
<p>In (iii) we sum over $i$ because $h_j$ enters every $z_i$: this is the [[d]] rule. $\square$</p>`,
    words: { d: { ans: ['branch', 'branches', 'multiple paths', 'multivariable chain'], tex: 'branch' } } },

  d5c: { title: 'The backpropagation recursion',
    text: R`<p class="hyp"><b>Setup.</b> MLP: $\bz^{(\ell)} = W_\ell\bh^{(\ell-1)}+\bb_\ell$, $\bh^{(\ell)} = \varphi(\bz^{(\ell)})$, logits $\bz^{(L)}$ followed by a softmax and a cross-entropy with loss $\hL$. Write $\boldsymbol\delta^{(\ell)} = \partial\hL/\partial\bz^{(\ell)}$.</p>
<p class="claim"><b>Proposition.</b> $\boldsymbol\delta^{(L)} = \mathbf p-\by$, $\frac{\partial\hL}{\partial W_\ell} = \boldsymbol\delta^{(\ell)}\bh^{(\ell-1)\top}$ and $\boldsymbol\delta^{(\ell-1)} = \big(W_\ell\T\boldsymbol\delta^{(\ell)}\big)\odot\varphi'(\bz^{(\ell-1)})$.</p>
<p><b>Proof.</b> Apply the local rules from the output back to the input:</p>
$$\begin{aligned}
\boldsymbol\delta^{(L)} &= \blank{a} &&\text{(i)}\\
\frac{\partial\hL}{\partial W_\ell} &= \blank{b},\qquad\frac{\partial\hL}{\partial\bh^{(\ell-1)}} = \blank{c} &&\text{(ii)}\\
\boldsymbol\delta^{(\ell-1)} &= \frac{\partial\hL}{\partial\bh^{(\ell-1)}}\odot\varphi'(\bz^{(\ell-1)}). &&\text{(iii)}
\end{aligned}$$
<p>(i) is the softmax + cross-entropy gradient; (ii) the affine-layer rule; (iii) the activation rule. Layers are visited in [[d]] order, because $\boldsymbol\delta^{(\ell)}$ depends on all layers above $\ell$. $\square$</p>`,
    words: { d: { ans: ['reverse', 'backward', 'decreasing'], tex: 'reverse' } } },

  nn14: { title: 'Mini-batches and the training loop',
    text: R`<p class="hyp"><b>Setup.</b> Stochastic gradient descent on $N$ examples, mini-batches of size $B$, in PyTorch.</p>
<p><b>Definitions.</b> One epoch (one pass over all the data) makes about $\blank{a}$ updates. <code>loss.backward()</code> runs [[b]]; <code>optimizer.step()</code> applies the [[c]] of the parameters. <code>CrossEntropyLoss</code> must receive [[d]], not probabilities.</p>`,
    words: { b: { ans: ['backpropagation', 'backprop', 'backward pass', 'automatic differentiation'], tex: 'backpropagation' }, c: { ans: ['update', 'gradient step'], tex: 'update' }, d: { ans: ['logits', 'scores'], tex: 'logits' } } },

  nn9: { title: 'Softmax and cross-entropy by hand',
    gen: r => {
      const z = [r.int(4) - 1, r.int(4) - 1, r.int(4) - 1], e = z.map(v => Math.exp(v)), S = M.sum(e), p = e.map(v => v / S), y = r.int(3);
      return { text: R`<p class="hyp"><b>Data.</b> Logits $\bz = (${z.join(', ')})$, true class $y = ${y + 1}$, $p_k = \frac{e^{z_k}}{\sum_je^{z_j}}$, $\ell = -\log p_y$, $\frac{\partial\ell}{\partial z_k} = p_k-\mathbb 1[k = y]$.</p>
<p><b>Computation.</b>
$$\begin{aligned}
\textstyle\sum_je^{z_j} &= \blank{a},\qquad p_1 = \blank{b}\\
\ell &= \blank{c},\qquad\frac{\partial\ell}{\partial z_{${y + 1}}} = \blank{d}
\end{aligned}$$</p>`, solution: R`$\mathbf p = (${p.map(v => f(v, 3)).join(', ')})$.` };
    } },

  nn10: { title: 'Computational graph of $f = (x+y)z$',
    gen: r => {
      const x = r.int(7) - 3, y = r.int(7) - 3, z = r.int(7) - 3;
      return { text: R`<p class="hyp"><b>Data.</b> Node "$+$": $q = x+y$; node "$\times$": $f = qz$. Local derivatives: $\frac{\partial f}{\partial q} = z$, $\frac{\partial f}{\partial z} = q$, $\frac{\partial q}{\partial x} = \frac{\partial q}{\partial y} = 1$. Values $x = ${x}$, $y = ${y}$, $z = ${z}$.</p>
<p><b>Computation.</b>
$$\begin{aligned}
\text{forward pass:}\quad q &= \blank{a},\qquad f = \blank{b}\\
\text{backward pass:}\quad\frac{\partial f}{\partial z} &= \blank{c},\qquad\frac{\partial f}{\partial x} = \frac{\partial f}{\partial q}\frac{\partial q}{\partial x} = \blank{d}
\end{aligned}$$</p>` };
    } },

  nn13: { title: 'Counting the parameters of an MLP',
    gen: r => {
      const d0 = 2 + r.int(3), d1 = 4 + 2 * r.int(4), d2 = r.int(2) ? 1 : 3;
      return { text: R`<p class="hyp"><b>Data.</b> MLP $${d0}\to${d1}\to${d2}$; a layer from $D$ to $H$ dimensions has $W\in\R^{H\times D}$ and $\bb\in\R^H$.</p>
<p><b>Computation.</b>
$$\#W_1 = \blank{a},\qquad\#(W_1,\bb_1) = \blank{b},\qquad\#\text{total} = \blank{c}.$$</p>` };
    } },
  });
})(window.ML);
