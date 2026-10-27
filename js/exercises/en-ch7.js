/* English version — Chapter 7: autoencoders and VAE */
(function (ML) {
  'use strict';
  const R = String.raw;
  const LVM = R`<p class="hyp"><b>Setup.</b> Latent variable model: $p(z) = \mathcal N(z;0,I)$, $p_\theta(x\mid z)$ given by a decoder, $p_\theta(x,z) = p(z)p_\theta(x\mid z)$ and $p_\theta(x) = \int p_\theta(x,z)\,dz$. For a fixed $x$, $q(z)$ is an auxiliary density with $q(z)>0$ wherever $p_\theta(x,z)>0$.</p>`;

  ML.EX.en({
  va1: { title: 'The autoencoder and its objective',
    text: R`<p class="hyp"><b>Setup.</b> Unlabeled data $x_1,\dots,x_N\in\R^D$.</p>
<p><b>Definition.</b> An encoder is a function $f:\R^D\to\R^M$ with $M\blank{a}D$; a decoder is $g:\R^M\to\R^D$. The autoencoder computes $\hat x = \blank{b}$, and $f,g$ are learned by minimizing the reconstruction error
$$\min_{f,g}\ \frac1N\sum_{n=1}^N\big\|x_n-\blank{c}\big\|^2.$$
The prefix "auto" means that the input $x$ is its own reconstruction [[d]].</p>`,
    words: { d: { ans: ['target', 'cible', 'label'], tex: 'target' } } },

  va2: { title: 'Latent variable model and the intractable integral',
    text: R`<p class="hyp"><b>Setup.</b> A latent variable $z$ with a simple prior, and a Gaussian decoder.</p>
<p><b>Definition.</b> $p(z) = \mathcal N(z;0,I)$ and $p_\theta(x\mid z) = \mathcal N\big(x;\mu_\theta(z),\mathrm{diag}(\sigma_\theta^2(z))\big)$. To generate: draw $z\sim\blank{a}$ and $\varepsilon_x\sim\mathcal N(0,I)$, then
$$x = \mu_\theta(z)+\blank{b}\odot\varepsilon_x.$$
The likelihood is $p_\theta(x) = \int\blank{c}\,dz$; with a nonlinear decoder this integral generally has no [[d]] solution. The decoder outputs $\ln\sigma$ rather than $\sigma$, and [[e]] is applied to get $\sigma>0$.</p>`,
    words: { d: { ans: ['closed-form', 'closed form', 'closed', 'explicit'], tex: 'closed-form' }, e: { ans: ['exp', 'exponentiation', 'the exponential', 'exponential'], tex: 'exponentiation' } } },

  va3: { title: 'The ELBO is a lower bound (Jensen)',
    text: LVM + R`<p class="claim"><b>Proposition.</b> $\mathcal L(x,\theta;q) := \E_{z\sim q}\Big[\log\frac{p_\theta(x,z)}{q(z)}\Big]\le\log p_\theta(x)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p_\theta(x) &= \int p_\theta(x,z)\,dz = \int\blank{a}\,\frac{p_\theta(x,z)}{q(z)}\,dz = \E_{z\sim q}\Big[\frac{p_\theta(x,z)}{q(z)}\Big] &&\text{(i)}\\
\log\E[Y] &\ \blank{b}\ \E[\log Y]\quad\text{for } Y>0 &&\text{(ii)}\\
\log p_\theta(x) &\ge\E_{z\sim q}\Big[\log\frac{p_\theta(x,z)}{q(z)}\Big] = \mathcal L(x,\theta;q). &&\text{(iii)}
\end{aligned}$$
<p>(i) uses the support assumption on $q$. (ii) is Jensen's inequality, valid because log is [[c]]. $\square$</p>`,
    words: { c: { ans: ['concave'], tex: 'concave' } } },

  va4: { title: 'The gap to the log-likelihood is a KL divergence',
    text: LVM + R`<p class="claim"><b>Proposition.</b> With $r(z) := p_\theta(z\mid x)$: $\log p_\theta(x)-\mathcal L(x,\theta;q) = \mathrm{KL}(q\,\|\,r)\ge0$, hence $\log p_\theta(x) = \max_q\mathcal L(x,\theta;q)$, attained at $q = r$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\log p_\theta(x)-\mathcal L(x,\theta;q) &= \E_{z\sim q}\Big[\log\frac{q(z)\,\blank{a}}{p_\theta(x,z)}\Big] &&\text{(i)}\\
\frac{p_\theta(x,z)}{p_\theta(x)} &= \blank{b} &&\text{(ii)}\\
\log p_\theta(x)-\mathcal L(x,\theta;q) &= \E_{z\sim q}\Big[\log\frac{q(z)}{r(z)}\Big] = \mathrm{KL}(q\,\|\,r)\ \ge\ \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i): $\log p_\theta(x)$ does not depend on $z$, so it can be put inside the expectation. (ii) is [[d]]' rule. (iii): the KL is zero if and only if $q = r$, hence the maximum. $\square$</p>`,
    words: { d: { ans: ['bayes'], tex: 'Bayes' } } },

  va5: { title: 'The KL divergence is nonnegative (Gibbs\' inequality)',
    text: R`<p class="hyp"><b>Setup.</b> $q$, $r$ two densities on $\R^J$, with $r>0$ wherever $q>0$; $\mathrm{KL}(q\|r) = \int q\log\frac qr$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{KL}(q\,\|\,r)\ge0$, with equality if and only if $q = r$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\log u &\le\blank{a}\quad\text{for all } u>0 &&\text{(i)}\\
-\mathrm{KL}(q\|r) = \int_{q>0}q\log\frac rq &\le\int_{q>0}q\Big(\frac rq-1\Big) = \int_{q>0}r-\blank{b} &&\text{(ii)}\\
\int_{q>0}r &\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i): log is concave, hence below its [[d]] line at $u = 1$; equality only at $u = 1$, i.e. $r = q$. $\square$</p>`,
    words: { d: { ans: ['tangent', 'tangente'], tex: 'tangent' } } },

  va6: { title: 'Rewriting the ELBO: reconstruction − KL',
    text: R`<p class="hyp"><b>Setup.</b> Encoder $q_\phi(z\mid x)$, decoder $p_\theta(x\mid z)$, prior $p(z)$; $\mathcal L(x,\theta,\phi) = \E_{z\sim q_\phi(\cdot\mid x)}\Big[\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\Big]$.</p>
<p class="claim"><b>Proposition.</b> $\mathcal L(x,\theta,\phi) = \E_z[\log p_\theta(x\mid z)]-\mathrm{KL}\big(q_\phi(z\mid x)\,\|\,p(z)\big)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
p_\theta(x,z) &= p_\theta(x\mid z)\,\blank{a} &&\text{(i)}\\
\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)} &= \log p_\theta(x\mid z)-\log\frac{\blank{b}}{p(z)} &&\text{(ii)}\\
\mathcal L(x,\theta,\phi) &= \E_z[\log p_\theta(x\mid z)]-\mathrm{KL}\big(\blank{c}\,\|\,p(z)\big). &&\text{(iii)}
\end{aligned}$$
<p>(iii): linearity of expectation. The first term encourages better [[d]]; the second makes the approximate posterior close to the prior. The KL term does not depend on $\theta$: it only trains the [[e]]. $\square$</p>`,
    words: { d: { ans: ['reconstruction'], tex: 'reconstruction' }, e: { ans: ['encoder', 'encodeur'], tex: 'encoder' } } },

  va7: { title: 'KL between a Gaussian and $\\mathcal N(0,1)$',
    text: R`<p class="hyp"><b>Setup.</b> Dimension 1: $q = \mathcal N(\mu,\sigma^2)$, $p = \mathcal N(0,1)$, $\log q(z) = -\frac12\log2\pi-\ln\sigma-\frac{(z-\mu)^2}{2\sigma^2}$, $\log p(z) = -\frac12\log2\pi-\frac{z^2}2$.</p>
<p class="claim"><b>Proposition.</b> $\mathrm{KL}(q\|p) = \frac12(\mu^2+\sigma^2-1-2\ln\sigma)$; in dimension $J$ with diagonal covariances, sum over coordinates.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E_q\big[(z-\mu)^2\big] &= \blank{a},\qquad \E_q[z^2] = \blank{b} &&\text{(i)}\\
\E_q[\log q] &= -\tfrac12\log2\pi-\ln\sigma-\blank{c} &&\text{(ii)}\\
\E_q[\log p] &= -\tfrac12\log2\pi-\tfrac12(\sigma^2+\mu^2) &&\text{(iii)}\\
\mathrm{KL}(q\|p) &= \E_q[\log q]-\E_q[\log p] = \tfrac12\big(\mu^2+\sigma^2-1-2\ln\sigma\big). &&\text{(iv)}
\end{aligned}$$
<p>In dimension $J$, $q$ and $p$ factorize (diagonal covariances), the log of the product is a [[d]], and the KL is the sum of the per-coordinate KLs. $\square$</p>`,
    words: { d: { ans: ['sum', 'somme'], tex: 'sum' } } },

  va8: { title: 'Monte Carlo, and the naive gradient with respect to the encoder',
    text: R`<p class="hyp"><b>Setup.</b> $\hat R_K = \frac1K\sum_{k=1}^K\log p_\theta(x\mid z^{(k)})$ with $z^{(k)}\overset{\text{i.i.d.}}\sim q_\phi(\cdot\mid x)$; $v = \mathrm{Var}_{q_\phi}[\log p_\theta(x\mid z)]<\infty$.</p>
<p class="claim"><b>Proposition.</b> $\hat R_K$ is unbiased with variance $v/K$. The gradient in $\theta$ is obtained by holding the samples fixed; in $\phi$, holding the samples fixed gives a zero gradient, which is wrong.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E[\hat R_K] &= \frac1K\sum_k\E\big[\log p_\theta(x\mid z^{(k)})\big] = \E_{z\sim q_\phi}\big[\log p_\theta(x\mid z)\big] &&\text{(i)}\\
\mathrm{Var}[\hat R_K] &= \frac1{K^2}\sum_kv = \blank{a} &&\text{(ii)}\\
\nabla_\theta\hat R_K &= \frac1K\sum_k\nabla_\theta\log p_\theta(x\mid z^{(k)}),\qquad \nabla_\phi\hat R_K\big|_{z^{(k)}\ \text{fixed}} = \blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) uses the [[c]] of the samples. (iii): the distribution of the samples does not depend on $\theta$, but it does depend on $\phi$; this dependence is lost when the $z^{(k)}$ are held fixed. $\square$</p>`,
    words: { c: { ans: ['independence', 'indépendance', 'independance'], tex: 'independence' } } },

  va9: { title: 'The reparameterization trick',
    text: R`<p class="hyp"><b>Setup.</b> $q_\phi(z\mid x) = \mathcal N\big(z;\mu_\phi(x),\mathrm{diag}(\sigma_\phi^2(x))\big)$; the encoder outputs $\mu$ and $\ln\sigma$; $F$ is a differentiable function of $z$.</p>
<p class="claim"><b>Proposition.</b> $\nabla_\phi\E_{z\sim q_\phi}[F(z)] = \E_{\varepsilon\sim\mathcal N(0,I)}\big[\nabla_\phi F(\mu_\phi(x)+\sigma_\phi(x)\odot\varepsilon)\big]$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
z = \mu+\sigma\odot\varepsilon,\ \varepsilon\sim\mathcal N(0,I)\ &\Longrightarrow\ z_j\sim\mathcal N\big(\mu_j,\ \blank{a}\big)\ \text{independent} &&\text{(i)}\\
\E_{z\sim q_\phi}[F(z)] &= \E_{\varepsilon}\big[F(\mu_\phi(x)+\sigma_\phi(x)\odot\varepsilon)\big] &&\text{(ii)}\\
\frac{\partial F}{\partial\mu_j} = \frac{\partial F}{\partial z_j},\qquad \frac{\partial F}{\partial(\ln\sigma_j)} &= \frac{\partial F}{\partial z_j}\cdot\blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>In (ii), the distribution of $\varepsilon$ does not depend on [[c]]: we can differentiate inside the expectation, holding $\varepsilon$ fixed during backpropagation. $\square$</p>` },

  va10: { title: 'The optimal linear autoencoder is PCA',
    text: R`<p class="hyp"><b>Setup.</b> Centered data, empirical covariance $S$ with eigenvalues $\lambda_1\ge\dots\ge\lambda_D$ and eigenvectors $u_i$; reconstruction by orthogonal projection onto a subspace with orthonormal basis $V\in\R^{D\times M}$ ($V^\top V = I$).</p>
<p class="claim"><b>Proposition.</b> The average reconstruction error is at least $\lambda_{M+1}+\dots+\lambda_D$, attained for $V = [u_1,\dots,u_M]$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\|y-VV^\top y\|^2 &= \|y\|^2-\|V^\top y\|^2\ \Longrightarrow\ E(V) = \tr S-\blank{a} &&\text{(i)}\\
\tr(V^\top SV) &= \textstyle\sum_i\lambda_ic_i,\qquad c_i = \|V^\top u_i\|^2\in[0,1],\qquad\textstyle\sum_ic_i = \blank{b} &&\text{(ii)}\\
\tr(V^\top SV) &\le\lambda_1+\dots+\lambda_M\ \Longrightarrow\ E(V)\ge\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i): [[d]]' theorem. Minimizing the error means maximizing the captured variance $\tr(V^\top SV)$. $\square$</p>`,
    words: { d: { ans: ['pythagoras', 'pythagore', 'pythagorean'], tex: 'Pythagoras' } } },

  va11: { title: 'Autoencoder or VAE?',
    text: R`<p class="hyp"><b>Setup.</b> An autoencoder (AE) and a variational autoencoder (VAE), both with an encoder and a decoder.</p>
<p><b>Definition.</b> An AE encodes each input as a [[a]] $z = f_\phi(x)$; a VAE encodes it as a [[b]] $q_\phi(z\mid x)$. The AE objective is the reconstruction loss; the VAE objective is the ELBO, reconstruction minus the term $\blank{c}$. To generate with a VAE: draw $z\sim\blank{d}$, then $x\sim p_\theta(x\mid z)$. The KL term connects $q_\phi(z\mid x)$ to the [[e]] $p(z)$, making latent sampling meaningful.</p>`,
    words: { a: { ans: ['point', 'vector', 'single point'], tex: 'point' }, b: { ans: ['distribution', 'loi', 'density', 'probability distribution'], tex: 'distribution' }, e: { ans: ['prior', 'a priori', 'prior distribution'], tex: 'prior' } } },

  va12: { title: 'Computing a KL term',
    text: R`<p class="hyp"><b>Data.</b> For a data point $x$, the encoder outputs $\mu = (1,\ 0)$ and $\ln\sigma = (0,\ -\ln2)$, so $\sigma = (1,\ \frac12)$. Prior $p(z) = \mathcal N(0,I_2)$.</p>
<p><b>Computation.</b> With $\mathrm{KL} = \frac12\sum_j(\mu_j^2+\sigma_j^2-1-2\ln\sigma_j)$:
$$\text{coordinate 1: }\blank{a},\qquad\text{coordinate 2: }\blank{b},\qquad\mathrm{KL}\approx\blank{c}.$$</p>` },

  va13: { title: 'One VAE iteration, by hand',
    text: R`<p class="hyp"><b>Data.</b> $J = D = 1$. The encoder outputs $\mu_\phi(x) = 0.5$, $\ln\sigma_\phi(x) = 0$. Sampled noise: $\varepsilon = -1$. The decoder outputs $\mu_\theta(z) = 2z$, with $\sigma_{x\mid z} = 1$. Observation $x = 1$.</p>
<p><b>Computation.</b> $\log p_\theta(x\mid z) = -\frac12\log2\pi-\frac12(x-\mu_\theta(z))^2$.
$$z = \mu+\sigma\varepsilon = \blank{a},\qquad \mu_\theta(z) = \blank{b},\qquad \log p_\theta(x\mid z)\approx\blank{c},\qquad \mathrm{KL}\approx\blank{d},\qquad \hat{\mathcal L}_1\approx\blank{e}.$$</p>` },
  });
})(window.ML);
