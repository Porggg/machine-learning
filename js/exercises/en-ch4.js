/* English version — Chapter 4: generalization and model selection */
(function (ML) {
  'use strict';
  const R = String.raw;
  const SETUP = R`<p class="hyp"><b>Setup.</b> Examples $(x,y)$ follow an unknown distribution $P$ and $S = \{(x_i,y_i)\}_{i=1}^N\sim P^N$ (i.i.d.). For a loss $\ell\ge0$ and a predictor $f$: $\hL_S(f) = \frac1N\sum_i\ell(y_i,f(x_i))$ (empirical error), $L(f) = \E_{(x,y)\sim P}[\ell(y,f(x))]$ (generalization error).</p>`;

  ML.EX.en({
  ms1: { title: 'Empirical risk minimization (ERM)',
    text: R`<p class="hyp"><b>Setup.</b> A sample $S = \{(x_i,y_i)\}_{i=1}^N$, a loss $\ell(y,\hat y)\ge0$, a set of predictors $\mathcal H$.</p>
<p><b>Definition.</b> ERM chooses
$$\hat f\in\arg\min_{f\in\mathcal H}\hL_S(f),\qquad\hL_S(f) = \blank{a}.$$
The set $\mathcal H$ is called the [[b]].</p>`,
    words: { b: { ans: ['hypothesis class', 'hypothesis space', 'model class', 'hypothesis set'], tex: 'hypothesis class' } } },

  ms2: { title: 'Generalization error',
    text: R`<p class="hyp"><b>Setup.</b> The training sample is $S\sim P^N$; a new example $(x,y)$ follows the same distribution $P$ and is [[a]] of $S$.</p>
<p><b>Definition.</b> The generalization error of a predictor $f$ is
$$L(f) := \blank{b}.$$
For the 0-1 loss $\ell(y,\hat y) = \mathbb 1[\hat y\ne y]$ it is the probability $L(f) = \Pr\big(\blank{c}\big)$.</p>`,
    words: { a: { ans: ['independent'], tex: 'independent' } } },

  ms3: { title: 'Generalization gap',
    text: SETUP + R`<p><b>Definition.</b> For $\hat f$ learned on $S$, the generalization gap is
$$\blank{a}.$$
If it is large and positive, the training error is too [[b]]. A small gap does [[c]] imply a small generalization error (a too-simple model has a small gap but two high errors).</p>`,
    words: { b: { ans: ['optimistic', 'low', 'small'], tex: 'optimistic' }, c: { ans: ['not'], tex: 'not' } } },

  ms4: { title: 'For a fixed $f$, the empirical error is unbiased',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> If $f$ does not depend on $S$, then $\E_S[\hL_S(f)] = L(f)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E_S[\hL_S(f)] &= \frac1N\sum_{i=1}^N\E\big[\blank{a}\big] &&\text{(i)}\\
&= \frac1N\sum_{i=1}^N\blank{b} = L(f). &&\text{(ii)}
\end{aligned}$$
<p>(i) follows from the [[c]] of expectation; (ii) from the fact that each $(x_i,y_i)$ follows $P$ and $f$ is fixed. For $\hat f = A(S)$ the argument fails because $(x_i,y_i)$ and $\hat f$ are not [[d]]. $\square$</p>`,
    words: { c: { ans: ['linearity'], tex: 'linearity' }, d: { ans: ['independent'], tex: 'independent' } } },

  d4b: { title: 'The training error of ERM is optimistic',
    text: SETUP + R`<p class="hyp">$\hat f\in\arg\min_{f\in\mathcal H}\hL_S(f)$ (ERM), and $f^*_{\mathcal H} = \arg\min_{f\in\mathcal H}L(f)$, which does not depend on $S$.</p>
<p class="claim"><b>Proposition.</b> $\E_S[\hL_S(\hat f)]\le L(f^*_{\mathcal H})\le\E_S[L(\hat f)]$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\hL_S(\hat f) &\le\blank{a} &&\text{(i)}\\
\E_S[\hL_S(\hat f)] &\le\E_S[\hL_S(f^*_{\mathcal H})] = \blank{b} &&\text{(ii)}\\
L(\hat f) &\ge L(f^*_{\mathcal H})\ \Longrightarrow\ \E_S[L(\hat f)]\ge L(f^*_{\mathcal H}). &&\text{(iii)}
\end{aligned}$$
<p>(i): $\hat f$ minimizes the empirical error over $\mathcal H$, and $f^*_{\mathcal H}\in\mathcal H$. (ii): the empirical error of a [[c]] predictor is unbiased. (iii): $\hat f\in\mathcal H$ and $f^*_{\mathcal H}$ minimizes $L$ over $\mathcal H$. $\square$</p>`,
    words: { c: { ans: ['fixed'], tex: 'fixed' } } },

  d4c: { title: '$\\E[\\text{training MSE}] = \\sigma^2(1-p/N)$',
    text: R`<p class="hyp"><b>Setup.</b> $\by = \bPhi\bw^\star+\boldsymbol\varepsilon$ with $\bPhi\in\R^{N\times p}$ of rank $p$, $\E[\boldsymbol\varepsilon] = 0$, $\E[\boldsymbol\varepsilon\boldsymbol\varepsilon\T] = \sigma^2\bI$. $\bP = \bPhi(\bPhi\T\bPhi)^{-1}\bPhi\T$ (projection onto the column space), training MSE $= \frac1N\|\by-\bP\by\|^2$. We use $\E[\boldsymbol\varepsilon\T\mathbf A\boldsymbol\varepsilon] = \sigma^2\,\mathrm{tr}(\mathbf A)$.</p>
<p class="claim"><b>Proposition.</b> $\E[\text{training MSE}] = \sigma^2\big(1-\frac pN\big)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\by-\bP\by &= (\bI-\bP)(\bPhi\bw^\star+\boldsymbol\varepsilon) = (\bI-\bP)\boldsymbol\varepsilon &&\text{(i)}\\
\|(\bI-\bP)\boldsymbol\varepsilon\|^2 &= \boldsymbol\varepsilon\T(\bI-\bP)\T(\bI-\bP)\boldsymbol\varepsilon = \boldsymbol\varepsilon\T(\bI-\bP)\boldsymbol\varepsilon &&\text{(ii)}\\
\E\big[\boldsymbol\varepsilon\T(\bI-\bP)\boldsymbol\varepsilon\big] &= \sigma^2\,\mathrm{tr}(\bI-\bP) = \sigma^2\,(\blank{a}). &&\text{(iii)}
\end{aligned}$$
<p>(i) since $(\bI-\bP)\bPhi = \blank{b}$: the projection leaves the columns of $\bPhi$ unchanged. (ii) since $\bI-\bP$ is a [[c]] projection ($\mathbf Q\T\mathbf Q = \mathbf Q$ for $\mathbf Q = \bI-\bP$). (iii) since the trace of a projection is its dimension, and $\mathrm{tr}(\bP) = p$. Divide by $N$. $\square$</p>`,
    words: { c: { ans: ['symmetric', 'orthogonal'], tex: 'symmetric' } } },

  ms5: { title: 'An evaluation on independent data is unbiased',
    text: SETUP + R`<p class="hyp">$\hat f = A(S)$ with $A$ deterministic; $S_{\text{eval}} = \{(\tilde x_j,\tilde y_j)\}_{j=1}^m\sim P^m$ independent of $S$; $\hL_{\text{eval}}(f) = \frac1m\sum_j\ell(\tilde y_j,f(\tilde x_j))$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[\hL_{\text{eval}}(\hat f)\big] = \E_S\big[L(\hat f)\big]$, and given $S$, $\Var\big(\hL_{\text{eval}}(\hat f)\big) = \frac{\Var(\ell)}m$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E\big[\hL_{\text{eval}}(\hat f)\mid S\big] &= \frac1m\sum_j\E\big[\ell(\tilde y_j,\hat f(\tilde x_j))\mid S\big] = \blank{a} &&\text{(i)}\\
\E\big[\hL_{\text{eval}}(\hat f)\big] &= \E\Big[\E\big[\hL_{\text{eval}}(\hat f)\mid S\big]\Big] = \blank{b} &&\text{(ii)}\\
\Var\big(\hL_{\text{eval}}(\hat f)\mid S\big) &= \frac1{m^2}\cdot m\cdot\Var(\ell) = \frac{\Var(\ell)}{\blank{c}}. &&\text{(iii)}
\end{aligned}$$
<p>(i): given $S$, $\hat f$ is fixed and each $(\tilde x_j,\tilde y_j)$ still follows $P$ by [[d]]. (ii): law of total expectation. (iii): the $m$ terms are i.i.d. $\square$</p>`,
    words: { d: { ans: ['independence'], tex: 'independence' } } },

  ms6: { title: 'Underfitting and overfitting',
    text: R`<p class="hyp"><b>Setup.</b> We compare the training error (seen data) and the generalization error (new data) of a learned model.</p>
<p><b>Definitions.</b> [[a]]: the model misses an important structure of the data, both errors are high. [[b]]: the model adapts to the fluctuations of the sample, the training error is low but the generalization error is high. The risk of overfitting depends on model complexity, but also on the [[c]] of the sample and on regularization.</p>`,
    words: { a: { ans: ['underfitting', 'under-fitting'], tex: 'Underfitting' }, b: { ans: ['overfitting', 'over-fitting'], tex: 'Overfitting' }, c: { ans: ['size'], tex: 'size' } } },

  ms7: { title: 'Regularized ERM',
    text: R`<p class="hyp"><b>Setup.</b> Parametric model $f_\bw$, training error $\hL_{\text{train}}(f_\bw)$, penalty $\Omega(\bw)\ge0$.</p>
<p><b>Definition.</b>
$$\hat\bw_\lambda\in\arg\min_\bw\big\{\hL_{\text{train}}(f_\bw)+\blank{a}\big\},\qquad\lambda\ge0.$$
For ridge, $\Omega(\bw) = \blank{b}$. A too large $\lambda$ crushes the coefficients and leads to [[c]].</p>`,
    words: { c: { ans: ['underfitting', 'under-fitting'], tex: 'underfitting' } } },

  d4d: { title: 'Nested classes: the minimal training error decreases',
    text: R`<p class="hyp"><b>Setup.</b> $\mathcal H_d$ = polynomials of degree $\le d$; $\hL_S$ = training error on a fixed sample $S$.</p>
<p class="claim"><b>Proposition.</b> $\min_{f\in\mathcal H_{d+1}}\hL_S(f)\le\min_{f\in\mathcal H_d}\hL_S(f)$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
f\in\mathcal H_d\ &\Longrightarrow\ f\in\mathcal H_{d+1}\quad(\text{coefficient } w_{d+1} = \blank{a}) &&\text{(i)}\\
\mathcal H_d\subseteq\mathcal H_{d+1}\ &\Longrightarrow\ \min_{\mathcal H_{d+1}}\hL_S\ \blank{b}\ \min_{\mathcal H_d}\hL_S. &&\text{(ii)}
\end{aligned}$$
<p>(ii): minimizing over a larger set can only do better. Nothing similar holds for the [[c]] error: $\hat f_{d+1}$ is chosen to fit $S$, not to minimize $L$. $\square$</p>`,
    words: { c: { ans: ['generalization', 'test'], tex: 'generalization' } } },

  ms8: { title: 'Parameters and hyperparameters',
    text: R`<p class="hyp"><b>Setup.</b> A learning method has quantities learned from the training data and settings fixed beforehand.</p>
<p><b>Definitions.</b> In polynomial regression, the coefficients $\bw$ are [[a]] (learned by minimization) and the degree $d$ is a [[b]]. For an RBF-kernel SVM, $C$ and $\sigma$ are hyperparameters. Hyperparameters are chosen by comparing errors measured on [[c]] data.</p>`,
    words: { a: { ans: ['parameters', 'parameter'], tex: 'parameters' }, b: { ans: ['hyperparameter', 'hyper-parameter'], tex: 'hyperparameter' }, c: { ans: ['validation', 'cross-validation'], tex: 'validation' } } },

  ms9: { title: 'Selection with a validation set',
    text: R`<p class="hyp"><b>Setup.</b> The data are split into $S_{\text{train}}$ and $S_{\text{val}}$; each hyperparameter $\psi\in\Psi$ gives a model $\hat f_\psi$.</p>
<p><b>Definition.</b>
$$\hat f_\psi = \mathrm{Train}\big(\blank{a};\psi\big),\qquad\hat\psi\in\arg\min_{\psi\in\Psi}\blank{b}.$$
The validation error of the selected model [[c]] its generalization error on average, because $S_{\text{val}}$ was used to make the choice.</p>`,
    words: { c: { ans: ['underestimates', 'underestimate'], tex: 'underestimates' } } },

  ms10: { title: 'The minimum of validation errors is biased downward',
    text: R`<p class="hyp"><b>Setup.</b> We compare $K$ models; $V_k$ is the (random) validation error of model $k$, with expectation $L_k = \E[V_k]$. We report $\min_kV_k$.</p>
<p class="claim"><b>Proposition.</b> $\E\big[\min_kV_k\big]\le\min_kL_k$: the reported error is optimistic on average.</p>
<p><b>Proof.</b> Let $j$ be arbitrary.</p>
$$\begin{aligned}
\min_kV_k &\ \blank{a}\ V_j &&\text{(i)}\\
\E\big[\min_kV_k\big] &\le\E[V_j] = \blank{b} &&\text{(ii)}\\
\E\big[\min_kV_k\big] &\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i): a minimum is below each term. (ii): expectation is [[d]]. (iii): (ii) holds for every $j$, hence for the smallest $L_j$. $\square$</p>`,
    words: { d: { ans: ['monotone', 'monotonic', 'increasing'], tex: 'monotone' } } },

  ms11: { title: 'Training, validation, test',
    text: R`<p class="hyp"><b>Setup.</b> The available data are split into three disjoint sets.</p>
<p><b>Definitions.</b> The training set is used to fit the [[a]]; the validation set to choose the [[b]] (the model); the test set gives the final reported evaluation. The test set must be put aside [[c]] any fitting or selection, and used only once.</p>`,
    words: { a: { ans: ['parameters', 'weights'], tex: 'parameters' }, b: { ans: ['hyperparameters', 'hyper-parameters'], tex: 'hyperparameters' }, c: { ans: ['before'], tex: 'before' } } },

  ms12: { title: '$K$-fold cross-validation',
    text: R`<p class="hyp"><b>Setup.</b> $S_{\text{dev}}$ split into $K$ disjoint folds $S_1,\dots,S_K$ of equal size; a hyperparameter $\psi$ to evaluate.</p>
<p><b>Definition.</b>
$$\hat f_\psi^{(-k)} = \mathrm{Train}\big(\blank{a};\psi\big),\qquad\hL_{\text{CV}}(\psi) = \frac1K\sum_{k=1}^K\hL_{S_k}\big(\hat f_\psi^{(-k)}\big).$$
Each example is used $\blank{b}$ time(s) for validation and $\blank{c}$ times for training. The case $K = N$ is called [[d]].</p>` },

  ms13: { title: 'Optimism of least squares',
    gen: r => {
      const N = [20, 30, 40, 50][r.int(4)], p = [2, 4, 5, 10][r.int(4)], s2 = [0.04, 0.09, 0.25, 1][r.int(4)];
      return { text: R`<p class="hyp"><b>Data.</b> Least squares, $p = ${p}$ parameters, $N = ${N}$ points, noise variance $\sigma^2 = ${s2}$, true function in the class. We use $\E[\text{training MSE}] = \sigma^2(1-p/N)$ and, at the same inputs with fresh noise, $\E[\text{MSE}] = \sigma^2(1+p/N)$.</p>
<p><b>Computation.</b>
$$\E[\text{training MSE}] = \blank{a},\qquad\E[\text{MSE, fresh noise}] = \blank{b},\qquad\text{gap} = \blank{c}.$$</p>`, solution: R`The gap $2\sigma^2p/N$ grows with $p$ and shrinks with $N$.` };
    } },

  ms14: { title: 'Precision of a test set',
    gen: r => {
      const p = [0.1, 0.2, 0.3][r.int(3)], m = [100, 400, 2500][r.int(3)];
      return { text: R`<p class="hyp"><b>Data.</b> True error $p = ${p}$, $m = ${m}$ independent test examples; the test error has standard deviation $\sqrt{p(1-p)/m}$.</p>
<p><b>Computation.</b>
$$\text{standard deviation} = \blank{a},\qquad\text{examples needed to halve it: } m' = \blank{b}.$$</p>`, solution: R`The standard deviation scales as $1/\sqrt m$: halving it needs 4 times more examples.` };
    } },

  ms15: { title: 'Cost of cross-validation',
    gen: r => {
      const K = [5, 10][r.int(2)], P = 3 + r.int(10), N = [50, 100, 200][r.int(3)];
      return { text: R`<p class="hyp"><b>Data.</b> $|\Psi| = ${P}$ candidates, $N = ${N}$ development examples, $K = ${K}$-fold cross-validation (one training per fold and per candidate).</p>
<p><b>Computation.</b>
$$\text{trainings (without the final model)} = \blank{a},\qquad\text{single validation split} = \blank{b},\qquad\text{fold size} = \blank{c}.$$</p>` };
    } },
  });
})(window.ML);
