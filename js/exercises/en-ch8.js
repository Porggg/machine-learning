/* English version — Chapter 8: transformers */
(function (ML) {
  'use strict';
  const R = String.raw;
  const ATT = R`<p class="hyp"><b>Setup.</b> $N$ tokens with vectors $x_1,\dots,x_N\in\R^D$, stacked as rows of $X\in\R^{N\times D}$. $\mathrm{Softmax}[S]$ exponentiates every entry and then normalizes each <b>row</b>.</p>`;

  ML.EX.en({
  tf1: { title: 'Chain rule and Markov model',
    text: R`<p class="hyp"><b>Setup.</b> Sequences $x_1,\dots,x_N$ of tokens from a finite vocabulary $\mathcal V$.</p>
<p><b>Definition.</b> For any distribution over sequences,
$$p(x_1,\dots,x_N) = \prod_{n=1}^N\blank{a}.$$
A model that computes these conditionals and generates token by token is called [[b]]. The (first-order) Markov model assumes $p(x_n\mid x_1,\dots,x_{n-1}) = \blank{c}$. At order $L$, a full table has $\blank{d}$ free parameters.</p>`,
    words: { b: { ans: ['autoregressive', 'autoregressif', 'autorégressif'], tex: 'autoregressive' } } },

  tf2: { title: 'Attention coefficients and self-attention',
    text: ATT + R`<p><b>Definition.</b> Attention outputs $y_n = \sum_ma_{nm}x_m$ with $a_{nm}\blank{a}0$ and $\sum_ma_{nm} = \blank{b}$; hence $y_n$ lies in the [[c]] hull of the inputs. In self-attention,
$$a_{nm} = \frac{\exp(x_n^\top x_m)}{\blank{d}},\qquad Y = \mathrm{Softmax}\big[\blank{e}\big]\,X.$$</p>`,
    words: { c: { ans: ['convex', 'convexe'], tex: 'convex' } } },

  tf3: { title: 'Queries, keys, values and scaled attention',
    text: ATT + R`<p><b>Definition.</b> With $W^{(q)},W^{(k)}\in\R^{D\times D_k}$ and $W^{(v)}\in\R^{D\times D_v}$: $Q = X\blank{a}$, $K = XW^{(k)}$, $V = XW^{(v)}$ and
$$\mathrm{Attention}(Q,K,V) = \mathrm{Softmax}\Big[\frac{QK^\top}{\blank{b}}\Big]V.$$
The matrix $QK^\top$ has size $N\times\blank{c}$, the output has size $N\times\blank{d}$. The names query, key, value come from [[e]] retrieval.</p>`,
    words: { e: { ans: ['information', 'informations'], tex: 'information' } } },

  tf4: { title: 'A transformer layer',
    text: R`<p class="hyp"><b>Setup.</b> $Y(X)\in\R^{N\times D}$ is the multi-head attention output, $\mathrm{MLP}:\R^D\to\R^D$.</p>
<p><b>Definition.</b>
$$Z = \mathrm{LayerNorm}\big[\blank{a}\big],\qquad\tilde X = \mathrm{TransformerLayer}[X] = \mathrm{LayerNorm}\big[\blank{b}\big].$$
The MLP is applied to each [[c]] of $Z$ with the same weights. Residual connections mitigate vanishing [[d]]s. Layers can be stacked because the output has the same size $\blank{e}$ as the input.</p>`,
    words: { c: { ans: ['row', 'token', 'position', 'rows', 'ligne'], tex: 'row (token)' }, d: { ans: ['gradient', 'gradients'], tex: 'gradient' } } },

  tf5: { title: 'The scores $XUU^\\top X^\\top$ are symmetric',
    text: ATT + R`<p class="claim"><b>Proposition.</b> With $U\in\R^{D\times D}$ and $S = XUU^\top X^\top$: $S^\top = S$, and the weights $a_{nm} = e^{s_{nm}}/Z_n$ (where $Z_n = \sum_{m'}e^{s_{nm'}}$) satisfy $a_{nm}Z_n = a_{mn}Z_m$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
S^\top &= (XUU^\top X^\top)^\top = (X^\top)^\top(U^\top)^\top\,\blank{a}\,X^\top = XUU^\top X^\top = S &&\text{(i)}\\
a_{mn} &= \frac{e^{s_{mn}}}{Z_m} = \frac{e^{\blank{b}}}{Z_m} &&\text{(ii)}\\
a_{nm}Z_n &= \blank{c} = a_{mn}Z_m. &&\text{(iii)}
\end{aligned}$$
<p>(i): $(ABCD)^\top = D^\top C^\top B^\top A^\top$. A symmetric $N\times N$ matrix has only $\blank{d}$ free entries: fewer degrees of freedom than with separate $Q$ and $K$. $\square$</p>` },

  tf6: { title: 'Why $\\sqrt{D_k}$: the variance of $q^\\top k$',
    text: R`<p class="hyp"><b>Setup.</b> $q,k\in\R^{D_k}$; the $2D_k$ coordinates are independent, with mean 0 and variance 1.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{Var}(q^\top k) = D_k$, so $q^\top k/\sqrt{D_k}$ has variance 1.</p>
<p><b>Proof.</b> Write $q^\top k = \sum_{i=1}^{D_k}q_ik_i$.</p>
$$\begin{aligned}
\E[q_ik_i] &= \E[q_i]\,\E[k_i] = \blank{a} &&\text{(i)}\\
\mathrm{Var}(q_ik_i) &= \E[q_i^2]\,\E[k_i^2] = \blank{b} &&\text{(ii)}\\
\mathrm{Cov}(q_ik_i,\,q_jk_j) &= \blank{c}\quad(i\ne j) &&\text{(iii)}\\
\mathrm{Var}(q^\top k) &= \blank{d},\qquad\mathrm{Var}\big(q^\top k/\sqrt{D_k}\big) = \blank{e}. &&\text{(iv)}
\end{aligned}$$
<p>(i)–(iii) use independence; (iv): the variance of a sum of uncorrelated terms is the sum of the variances. $\square$</p>` },

  tf7: { title: 'Softmax Jacobian and saturation',
    text: R`<p class="hyp"><b>Setup.</b> $a = \mathrm{softmax}(s)\in\R^N$, $a_i = e^{s_i}/Z$ with $Z = \sum_le^{s_l}$.</p>
<p class="claim"><b>Proposition.</b> $J = \partial a/\partial s = \mathrm{diag}(a)-aa^\top$, and $J\to0$ when $a$ becomes one-hot.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\frac{\partial a_i}{\partial s_j} &= \frac{\delta_{ij}e^{s_i}}{Z}-\frac{e^{s_i}e^{s_j}}{Z^2} = \blank{a} &&\text{(i)}\\
J &= \mathrm{diag}(a)-\blank{b} &&\text{(ii)}\\
a = (1,0,\dots,0)\ \Rightarrow\ J &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>The gradient with respect to the scores is $J^\top\nabla_a\ell$: when the softmax saturates (large scores), it [[d]], and $W^{(q)}$, $W^{(k)}$ stop learning. $\square$</p>`,
    words: { d: { ans: ['vanishes', 'goes to 0', 'goes to zero', 'disappears', 'tends to 0', 'tends to zero', 'vanish'], tex: 'vanishes' } } },

  tf8: { title: 'Permutation equivariance of a layer',
    text: ATT + R`<p class="hyp">$P$ is a permutation matrix: row $n$ of $PX$ is row $\pi(n)$ of $X$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{TransformerLayer}[PX] = P\,\mathrm{TransformerLayer}[X]$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
(PSP^\top)_{nm} &= S_{\blank{a}} &&\text{(i)}\\
\mathrm{Softmax}[PSP^\top] &= P\,\mathrm{Softmax}[S]\,\blank{b} &&\text{(ii)}\\
Q' = PXW^{(q)} &= \blank{c},\quad K' = PK,\quad V' = PV &&\text{(iii)}\\
\mathrm{Attention}(Q',K',V') &= P\,\mathrm{Softmax}\Big[\tfrac{QK^\top}{\sqrt{D_k}}\Big]P^\top PV = P\,\mathrm{Attention}(Q,K,V)\quad\text{since } P^\top P = \blank{d} &&\text{(iv)}\\
\mathrm{LayerNorm}[PZ] &= \blank{e}. &&\text{(v)}
\end{aligned}$$
<p>(ii): the softmax acts row by row, and permuting the columns does not change a row sum. (v): LayerNorm, the MLP and the residuals act row by row with shared weights. $\square$</p>` },

  tf9: { title: 'Sinusoidal encoding: a shift is a rotation',
    text: R`<p class="hyp"><b>Setup.</b> $r_{n,2j} = \sin(n\omega_j)$, $r_{n,2j+1} = \cos(n\omega_j)$, with $\omega_j = b^{-2j/D}$.</p>
<p class="claim"><b>Proposition.</b> $r_{n+k} = M_kr_n$ with $M_k$ independent of $n$, and $r_n^\top r_m$ depends only on $n-m$.</p>
<p><b>Proof.</b> For one frequency $\omega$:</p>
$$\begin{aligned}
\sin((n+k)\omega) &= \sin n\omega\cos k\omega+\blank{a} &&\text{(i)}\\
\cos((n+k)\omega) &= \cos n\omega\cos k\omega-\blank{b} &&\text{(ii)}\\
\sin n\omega\sin m\omega+\cos n\omega\cos m\omega &= \cos\big(\blank{c}\big). &&\text{(iii)}
\end{aligned}$$
<p>By (i)–(ii), each pair is rotated by an angle that depends only on [[d]]; $M_k$ is block diagonal. Summing (iii) over the pairs gives $r_n^\top r_m = \sum_j\cos((n-m)\omega_j)$. $\square$</p>`,
    words: { d: { ans: ['k', 'the offset k', 'offset', 'shift', 'the shift k'], tex: 'k' } } },

  tf10: { title: 'Masked attention: output $n$ only sees the past',
    text: R`<p class="hyp"><b>Setup.</b> Decoder: input $\langle\text{start}\rangle,x_1,\dots,x_N$ (embedding + position), $L$ layers with masked attention, LSM output at every position.</p>
<p class="claim"><b>Proposition.</b> The output $y_n$ (which predicts $x_n$) depends only on $\langle\text{start}\rangle,x_1,\dots,x_{n-1}$.</p>
<p><b>Proof.</b> The mask sets $a_{nm} = 0$ for $m\blank{a}n$, by setting these scores to $\blank{b}$ before the softmax. Hence
$$y_n^{\text{att}} = \sum_{m\,\blank{c}\,n}a_{nm}v_m$$
only involves rows with index $\le n$. All other operations act row by row; by induction on the [[d]], row $n$ depends only on inputs $1,\dots,n$. With the ⟨start⟩ shift, these are $\langle\text{start}\rangle,x_1,\dots,x_{\blank{e}}$. $\square$</p>`,
    words: { d: { ans: ['layers', 'layer', 'couches'], tex: 'layers' } } },

  tf11: { title: 'Next-token prediction = maximum likelihood',
    text: R`<p class="hyp"><b>Setup.</b> A decoder with parameters $\theta$ outputs, at each position $t$, a distribution $y_{t+1} = p_\theta(\cdot\mid x_{\le t})$ over $\mathcal V$. Training sequence $x_1,\dots,x_T$.</p>
<p class="claim"><b>Proposition.</b> The sum of the cross-entropy losses equals $-\log p_\theta(x_1,\dots,x_T)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
-\sum_{v\in\mathcal V}\mathbb 1[v = x_{t+1}]\log y_{t+1,v} &= \blank{a} &&\text{(i)}\\
\sum_{t=0}^{T-1}-\log p_\theta(x_{t+1}\mid x_{\le t}) &= -\log\blank{b} &&\text{(ii)}
\end{aligned}$$
<p>(ii) is the chain rule. Minimizing the average NTP loss therefore maximizes the [[c]]; for a large corpus, it minimizes $\mathrm{KL}(\blank{d}\,\|\,p_\theta)$. $\square$</p>`,
    words: { c: { ans: ['likelihood', 'log-likelihood', 'vraisemblance'], tex: 'likelihood' } } },

  tf12: { title: 'Multi-head attention: a sum over heads',
    text: R`<p class="hyp"><b>Setup.</b> $H$ heads $H_h\in\R^{N\times D_v}$, $W^{(o)}\in\R^{HD_v\times D}$ split into row blocks $W_h^{(o)}\in\R^{D_v\times D}$; each head has $W_h^{(q)},W_h^{(k)},W_h^{(v)}\in\R^{D\times D_v}$.</p>
<p class="claim"><b>Proposition.</b> $Y = \mathrm{Concat}[H_1,\dots,H_H]W^{(o)} = \sum_hH_hW_h^{(o)}$, and the layer has $4D^2$ parameters if $D_v = D/H$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
[H_1\ \cdots\ H_H]\begin{bmatrix}W_1^{(o)}\\\vdots\\W_H^{(o)}\end{bmatrix} &= \sum_{h=1}^H\blank{a} &&\text{(i)}\\
\#\text{params} &= H\cdot3DD_v+\blank{b} = \blank{c}\quad\text{if } D_v = D/H. &&\text{(ii)}
\end{aligned}$$
<p>(i) is block matrix multiplication. $\square$</p>` },

  tf13: { title: 'Self-attention by hand',
    text: R`<p class="hyp"><b>Data.</b> $D = 2$, three tokens $x_1 = (1,0)$, $x_2 = (0,1)$, $x_3 = (1,1)$. Parameter-free self-attention: $a_{3m} = \mathrm{softmax}_m(x_3^\top x_m)$.</p>
<p><b>Computation.</b> The scores of query 3 are $(1,1,2)$.
$$a_{31}\approx\blank{a},\qquad a_{33}\approx\blank{b},\qquad y_3 = \sum_ma_{3m}x_m\approx(\blank{c},\ \blank{c}).$$</p>` },

  tf14: { title: 'Scaled and masked attention',
    text: R`<p class="hyp"><b>Data.</b> $D_k = 2$, query of token 2: $q_2 = (2,2)$; keys $k_1 = (1,0)$, $k_2 = (0,1)$, $k_3 = (3,3)$. Scores $s_{2m} = q_2^\top k_m/\sqrt{D_k}$.</p>
<p><b>Computation.</b>
$$s_{21}\approx\blank{a};\qquad\text{with the causal mask: } a_{21} = \blank{b},\ a_{23} = \blank{c};\qquad\text{without mask: } a_{23}\approx\blank{d}.$$</p>` },

  tf15: { title: 'Greedy decoding vs. most probable sequence',
    text: R`<p class="hyp"><b>Data.</b> $p(x_1 = \mathrm A) = 0.55$, $p(x_1 = \mathrm B) = 0.45$. Given A, $x_2$ is uniform over 4 tokens; given B, $p(x_2 = \mathrm C\mid\mathrm B) = 0.8$.</p>
<p><b>Computation.</b> Greedy decoding first picks token [[a]]; the sequence it produces has probability $\blank{b}$. But $p(\mathrm B,\mathrm C) = \blank{c}$.</p>`,
    words: { a: { ans: ['A'], tex: 'A' } } },

  tf16: { title: 'Counting parameters',
    text: R`<p class="hyp"><b>Data.</b> Multi-head attention with $D = 512$, $H = 8$, $D_v = D_k = 64$ (no biases). Markov model of order $L = 2$ over $|\mathcal V| = 1000$ tokens.</p>
<p><b>Computation.</b>
$$\#(W_h^{(q)},W_h^{(k)},W_h^{(v)})\text{ for one head} = \blank{a},\qquad\#W^{(o)} = \blank{b},\qquad\text{total} = \blank{c},\qquad\text{Markov table} = \blank{d}.$$</p>` },
  });
})(window.ML);
