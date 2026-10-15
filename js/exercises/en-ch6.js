/* English version — Chapter 6: online learning */
(function (ML) {
  'use strict';
  const R = String.raw;
  const SETUP = R`<p class="hyp"><b>Setup.</b> At each round $t = 1,\dots,T$ the learner predicts, then the truth is revealed. $\mathcal H = \{h_1,\dots,h_K\}$ is a finite set of experts; $\ell_t(i)\in[0,1]$ is the loss of expert $i$ at round $t$, $L_{T,i} = \sum_{t\le T}\ell_t(i)$, and $L^\star = \min_iL_{T,i}$.</p>`;
  const EW = R`<p class="hyp"><b>Exponential weighting.</b> $w_1(i) = 1$, $w_{t+1}(i) = w_t(i)\,e^{-\eta\ell_t(i)}$, $W_t = \sum_iw_t(i)$, $p_t(i) = w_t(i)/W_t$; the learner follows expert $I_t\sim p_t$; $\langle p_t,\ell_t\rangle = \sum_ip_t(i)\ell_t(i)$.</p>`;

  ML.EX.en({
  ol1: { title: 'Regret',
    text: SETUP + R`<p><b>Definition.</b> If the learner uses predictor $h_t$ at round $t$, its (static) regret is
$$\mathrm{Reg}_T := \sum_{t=1}^T\ell\big(y_t,h_t(x_t)\big)-\blank{a}\sum_{t=1}^T\ell\big(y_t,h(x_t)\big).$$
The comparator is the best expert [[b]], which stays [[c]] during the $T$ rounds. We look for sublinear regret: $\mathrm{Reg}_T/T\to\blank{d}$.</p>`,
    words: { b: { ans: ['in hindsight', 'a posteriori', 'after the fact'], tex: 'in hindsight' }, c: { ans: ['fixed', 'the same', 'constant'], tex: 'fixed' } } },

  ol5: { title: 'Non-anticipating adversary',
    text: R`<p class="hyp"><b>Setup.</b> A randomized learner draws its prediction $\hat y_t$ from a distribution $p_t$ computed from the past; an adversary chooses the label $y_t$.</p>
<p><b>Definition.</b> The adversary is non-anticipating: it may know the algorithm, the past and even the distribution $p_t$, but it chooses $y_t$ [[a]] the draw of $\hat y_t$. It may depend on the [[b]] predictions $\hat y_1,\dots,\hat y_{t-1}$, but not on $\hat y_t$.</p>`,
    words: { a: { ans: ['before'], tex: 'before' }, b: { ans: ['past', 'previous', 'earlier'], tex: 'past' } } },

  ol15: { title: 'Why aim at $\\mathrm{Reg}_T = O(\\sqrt T)$, and not better',
    text: R`<p class="hyp"><b>Setup.</b> Two experts whose 0-1 losses $\ell_t(1),\ell_t(2)$ are fair coin flips, independent of each other and across rounds; $L_i = \sum_t\ell_t(i)$.</p>
<p class="claim"><b>Proposition.</b> (a) If $\mathrm{Reg}_T\le c\sqrt T$, the average regret goes to 0. (b) In this example every learner has $\E[\mathrm{Reg}_T]\approx\frac12\sqrt{T/\pi}$: one cannot do better than order $\sqrt T$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\frac{\mathrm{Reg}_T}{T} &\le\frac{c\sqrt T}{T} = \blank{a}\ \xrightarrow[T\to\infty]{}\ 0 &&\text{(i)}\\
\E[\text{learner's loss}] &= \textstyle\sum_t\frac12 = \frac T2 &&\text{(ii)}\\
\min(L_1,L_2) &= \frac{L_1+L_2}2-\blank{b} &&\text{(iii)}\\
\E\big[\min(L_1,L_2)\big] &\approx\frac T2-\frac12\sqrt{T/\pi}. &&\text{(iv)}
\end{aligned}$$
<p>(ii): whatever its strategy, each expert's loss at round $t$ is independent of the past and equals 1 with probability $\frac12$. (iv): $L_1-L_2$ is a sum of $T$ centered variables of variance $\frac12$; by the [[c]] theorem, $\E|L_1-L_2|\approx\sqrt{T/\pi}$. $\square$</p>`,
    words: { c: { ans: ['central limit', 'CLT'], tex: 'central limit' } } },

  ol3: { title: 'A deterministic learner has regret $\\ge T/2$',
    text: R`<p class="hyp"><b>Setup.</b> $y_t\in\{-1,+1\}$, 0-1 loss. The learner is deterministic: $\hat y_t$ is a known function of the past. The adversary knows the algorithm. $\mathcal H = \{h_{-1},h_{+1}\}$, where $h_y$ always predicts $y$.</p>
<p class="claim"><b>Proposition.</b> There is a sequence of labels with $\mathrm{Reg}_T\ge\frac T2$.</p>
<p><b>Proof.</b> The adversary computes $\hat y_t$ and plays $y_t = \blank{a}$.</p>
$$\begin{aligned}
\textstyle\sum_t\ell(y_t,\hat y_t) &= \blank{b} &&\text{(i)}\\
\ell(y_t,h_{-1})+\ell(y_t,h_{+1}) = 1\ &\Longrightarrow\ L(h_{-1})+L(h_{+1}) = \blank{c} &&\text{(ii)}\\
\min\big(L(h_{-1}),L(h_{+1})\big) &\le\blank{d} &&\text{(iii)}\\
\mathrm{Reg}_T &\ge T-\tfrac T2 = \tfrac T2. &&\text{(iv)}
\end{aligned}$$
<p>(ii): at each round exactly one of the two experts is right. (iii): two numbers summing to $T$ cannot both exceed $\frac T2$. This works because a deterministic learner is [[e]]. $\square$</p>`,
    words: { e: { ans: ['predictable'], tex: 'predictable' } } },

  ol16: { title: 'What randomization changes',
    text: R`<p class="hyp"><b>Setup.</b> 0-1 loss, labels $\pm1$. At round $t$ the non-anticipating adversary fixes $y_t$, then the learner draws $\hat y_t$ from a distribution $q_t$ on $\{-1,+1\}$.</p>
<p class="claim"><b>Proposition.</b> The adversary can no longer force an expected loss of 1 per round: at worst it equals $\max_yq_t(y)$, i.e. $\frac12$ if $q_t$ is balanced.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E[\ell_t] = \Pr(\hat y_t\ne y_t) &= \blank{a} &&\text{(i)}\\
\max_{y_t}\Pr(\hat y_t\ne y_t) &= \max_{y}\big(1-q_t(y)\big) = 1-\min_yq_t(y) = \blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>(ii): $q_t$ takes only two values, summing to 1. If the adversary saw $\hat y_t$ before choosing, it would play $y_t = -\hat y_t$ and the loss would be [[c]]: randomization only helps against a non-anticipating adversary. $\square$</p>` },

  ol14: { title: 'Dynamic versus static regret',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> $\mathrm{Reg}^{\text{dynamic}}_T\ge\mathrm{Reg}^{\text{static}}_T$; and with $\mathcal H = \{h_{-1},h_{+1}\}$ under the 0-1 loss, the dynamic comparator has zero loss.</p>
<p><b>Proof.</b> The comparators are $\min_{h}\sum_t\ell(y_t,h(x_t))$ (static) and $\min_{(h_1,\dots,h_T)\in\mathcal H^T}\sum_t\ell(y_t,h_t(x_t))$ (dynamic).</p>
$$\begin{aligned}
(h,\dots,h)\in\mathcal H^T\ &\Longrightarrow\ \min_{\mathcal H^T}\textstyle\sum_t\ell\ \blank{a}\ \min_{h\in\mathcal H}\sum_t\ell &&\text{(i)}\\
\min_{(h_t)}\textstyle\sum_t\ell(y_t,h_t(x_t)) &= \textstyle\sum_t\blank{b} &&\text{(ii)}\\
\text{with } \{h_{-1},h_{+1}\}:\quad\min_h\ell(y_t,h(x_t)) &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i): we subtract a smaller number, so the dynamic regret is larger. (ii): the sum is minimized round by round. (iii): at each round one of the two experts is right. $\square$</p>` },

  d6a: { title: 'The mistake bound of Weighted Majority',
    text: R`<p class="hyp"><b>Setup.</b> Weighted Majority: $K$ experts, initial weights 1, prediction by weighted vote; when the vote is wrong, the weights of the wrong experts are multiplied by $\beta\in(0,1)$. $M$ = mistakes of WM, $m^\star$ = mistakes of the best expert $i^\star$, $W_t$ = total weight.</p>
<p class="claim"><b>Proposition.</b> $M\le\dfrac{\ln K+m^\star\ln(1/\beta)}{\ln\big(2/(1+\beta)\big)}$.</p>
<p><b>Proof.</b> When WM errs, the wrong experts voted with the majority, so they carry a weight $W^{\text{wrong}}\ge\frac12W_t$:</p>
$$\begin{aligned}
W_{t+1} &= W_t-(1-\beta)W^{\text{wrong}}\le\blank{a}\,W_t &&\text{(i)}\\
W_{T+1} &\le K\Big(\frac{1+\beta}2\Big)^M &&\text{(ii)}\\
w_{T+1}(i^\star) &\ge\blank{b} &&\text{(iii)}\\
\beta^{m^\star}\le K\Big(\frac{1+\beta}2\Big)^M\ &\Longrightarrow\ M\ln\frac2{1+\beta}\le\ln K+m^\star\ln\frac1\beta. &&\text{(iv)}
\end{aligned}$$
<p>(ii): $W_1 = K$, and $W$ does not change when WM is right. (iii): $i^\star$ is penalized at most $m^\star$ times. (iv): combine with $w(i^\star)\le W$ and take the [[c]]. $\square$</p>`,
    words: { c: { ans: ['logarithm', 'log', 'ln'], tex: 'logarithm' } } },

  ol7: { title: 'From Randomized WM to exponential weighting',
    text: SETUP + R`<p class="claim"><b>Proposition.</b> With $\beta = 1-\eta$, the RWM update reads $w_{t+1}(i) = w_t(i)(1-\eta)^{\ell_t(i)}$, and $(1-\eta)^{\ell}\le e^{-\eta\ell}$.</p>
<p><b>Proof.</b> RWM multiplies by $\beta$ the weight of the experts that err (0-1 loss).</p>
$$\begin{aligned}
\ell = 0:\ (1-\eta)^0 = 1,\qquad\ell = 1:\ (1-\eta)^1 &= \blank{a} &&\text{(i)}\\
\ln(1-\eta) &\le\blank{b} &&\text{(ii)}\\
(1-\eta)^\ell = e^{\ell\ln(1-\eta)} &\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii): $\ln(1+u)\le u$ by [[d]], with $u = -\eta$. The form (i) makes sense for any loss $\ell\in[0,1]$; exponential weighting replaces it by $e^{-\eta\ell}$. $\square$</p>`,
    words: { d: { ans: ['concavity'], tex: 'concavity' } } },

  d6b: { title: '$\\ln(1-\\eta)\\ge-\\eta-\\eta^2$ on $[0,\\frac12]$',
    text: R`<p class="hyp"><b>Setup.</b> $g(\eta) = \ln(1-\eta)+\eta+\eta^2$ for $\eta\in[0,\frac12]$.</p>
<p class="claim"><b>Proposition.</b> $g\ge0$, i.e. $\ln(1-\eta)\ge-\eta-\eta^2$; hence $e^{-(\eta+\eta^2)\ell}\le(1-\eta)^\ell\le e^{-\eta\ell}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
g(0) &= \blank{a} &&\text{(i)}\\
g'(\eta) &= -\frac1{1-\eta}+1+2\eta = \frac{-1+(1+2\eta)(1-\eta)}{1-\eta} = \blank{b} &&\text{(ii)}
\end{aligned}$$
<p>On $[0,\frac12]$, $g'\ge0$ since $1-2\eta\ge0$: $g$ is [[c]] and starts at 0, so $g\ge0$. $\square$</p>`,
    words: { c: { ans: ['increasing', 'nondecreasing', 'non-decreasing'], tex: 'increasing' } } },

  ol9: { title: '$p_t$ is a softmax of the cumulative losses',
    text: SETUP + EW + R`<p class="claim"><b>Proposition.</b> $p_t(i) = \frac{e^{-\eta L_{t-1,i}}}{\sum_je^{-\eta L_{t-1,j}}}$ (softmax with temperature $1/\eta$).</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
w_{t+1}(i) &= \prod_{s=1}^te^{-\eta\ell_s(i)} = \exp\Big(-\eta\,\blank{a}\Big) = e^{-\eta L_{t,i}} &&\text{(i)}\\
p_t(i) &= \frac{w_t(i)}{\sum_jw_t(j)} = \frac{e^{-\eta L_{t-1,i}}}{\sum_je^{-\eta L_{t-1,j}}} = \mathrm{softmax}\big(\blank{b}\big)_i. &&\text{(ii)}
\end{aligned}$$
<p>(i): unroll the recursion from $w_1(i) = 1$. As $\eta\to\infty$, all the mass goes to the expert with the smallest cumulative loss ([[c]]); as $\eta\to0$, $p_t$ becomes [[d]]. $\square$</p>`,
    words: { c: { ans: ['follow the leader', 'ftl'], tex: 'follow the leader' }, d: { ans: ['uniform'], tex: 'uniform' } } },

  ol13: { title: 'Hoeffding\'s lemma',
    text: R`<p class="hyp"><b>Setup.</b> $X$ a random variable with values in $[0,1]$ and mean $\mu$; $s\in\R$.</p>
<p class="claim"><b>Proposition.</b> $\ln\E[e^{sX}]\le s\mu+\frac{s^2}8$.</p>
<p><b>Proof.</b> Let $\psi(s) = \ln(1-\mu+\mu e^s)$ and $q(s) = \frac{\mu e^s}{1-\mu+\mu e^s}\in[0,1]$.</p>
$$\begin{aligned}
e^{sx} &\le(1-x)\,e^0+x\,e^s\quad(x\in[0,1])\ \Longrightarrow\ \ln\E[e^{sX}]\le\psi(s) &&\text{(i)}\\
\psi(0) &= 0,\qquad\psi'(0) = \blank{a} &&\text{(ii)}\\
\psi''(s) &= q(s)\big(1-q(s)\big)\le\blank{b} &&\text{(iii)}\\
\psi(s) &= \psi(0)+s\,\psi'(0)+\tfrac{s^2}2\psi''(\xi)\le s\mu+\tfrac{s^2}8. &&\text{(iv)}
\end{aligned}$$
<p>(i): the exponential lies below its chord between 0 and 1, by [[c]]; then take expectations. (iv): Taylor with Lagrange remainder, $\xi$ between 0 and $s$. $\square$</p>`,
    words: { c: { ans: ['convexity'], tex: 'convexity' } } },

  ol11: { title: 'The potential-based bound',
    text: SETUP + EW + R`<p class="claim"><b>Proposition.</b> For every loss sequence, $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}\eta+\frac{\eta T}8$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\ln\frac{W_{T+1}}{W_1} &\ge\ln\frac{e^{-\eta L^\star}}{\blank{a}} = -\eta L^\star-\ln K &&\text{(i)}\\
\frac{W_{t+1}}{W_t} &= \sum_ip_t(i)\,\blank{b} &&\text{(ii)}\\
\ln\frac{W_{t+1}}{W_t} &\le-\eta\langle p_t,\ell_t\rangle+\blank{c} &&\text{(iii)}\\
-\eta L^\star-\ln K &\le\ln\frac{W_{T+1}}{W_1} = \sum_t\ln\frac{W_{t+1}}{W_t}\le-\eta\sum_t\langle p_t,\ell_t\rangle+\frac{\eta^2T}8. &&\text{(iv)}
\end{aligned}$$
<p>(i): $W_{T+1} = \sum_ie^{-\eta L_{T,i}}$ is larger than its $i^\star$ term. (iii): [[d]]'s lemma with $X = \ell_t(i)$, $i\sim p_t$ and $s = -\eta$. Divide (iv) by $\eta$ and rearrange. $\square$</p>`,
    words: { d: { ans: ['Hoeffding', 'hoeffding'], tex: 'Hoeffding' } } },

  d6c: { title: 'From the deterministic bound to $\\E[\\mathrm{Reg}_T]$',
    text: SETUP + EW + R`<p class="hyp">We proved, for every loss sequence, $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}\eta+\frac{\eta T}8$. The adversary is non-anticipating.</p>
<p class="claim"><b>Proposition.</b> $\E[\mathrm{Reg}_T] = \E\big[\sum_t\ell_t(I_t)-L^\star\big]\le\frac{\ln K}\eta+\frac{\eta T}8$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
\E\big[\ell_t(I_t)\mid\text{past}\big] &= \blank{a} &&\text{(i)}\\
\E\Big[\textstyle\sum_t\ell_t(I_t)\Big] &= \E\Big[\textstyle\sum_t\langle p_t,\ell_t\rangle\Big] &&\text{(ii)}\\
\E[\mathrm{Reg}_T] &= \E\Big[\textstyle\sum_t\langle p_t,\ell_t\rangle-L^\star\Big]\le\blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i): $\ell_t$ is fixed [[c]] the draw $I_t\sim p_t$. (ii): law of total expectation. (iii): the bound holds for every realization. $\square$</p>`,
    words: { c: { ans: ['before'], tex: 'before' } } },

  d6d: { title: 'Choosing η',
    text: R`<p class="hyp"><b>Setup.</b> $f(\eta) = \frac{\ln K}\eta+\frac{\eta T}8$ for $\eta>0$ (bound on the expected regret of exponential weighting).</p>
<p class="claim"><b>Proposition.</b> $f$ is minimal at $\eta^\star = \sqrt{8\ln K/T}$, where $f(\eta^\star) = \sqrt{T\ln K/2}\le\sqrt{T\ln K}$.</p>
<p><b>Proof.</b></p>
$$\begin{aligned}
f'(\eta) &= \blank{a}+\frac T8 = 0\ \iff\ \eta = \blank{b} &&\text{(i)}\\
f''(\eta) &= \frac{2\ln K}{\eta^3}>0 &&\text{(ii)}\\
f(\eta^\star) &= \sqrt{\frac{T\ln K}8}+\sqrt{\frac{T\ln K}8} = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>By (ii), $f$ is [[d]], so the critical point (i) is its global minimum. $\square$</p>`,
    words: { d: { ans: ['convex', 'strictly convex'], tex: 'convex' } } },

  ol2: { title: 'Computing a regret',
    text: R`<p class="hyp"><b>Data.</b> 0-1 loss, $T = 100$ rounds. The learner makes 31 mistakes; three experts make 27, 35 and 52.</p>
<p><b>Computation.</b>
$$\min_hL(h) = \blank{a},\qquad\mathrm{Reg}_{100} = \blank{b},\qquad\frac{\mathrm{Reg}_{100}}{100} = \blank{c}.$$</p>` },

  ol4: { title: 'Sublinear regret',
    text: R`<p class="hyp"><b>Data.</b> An algorithm guarantees $\mathrm{Reg}_T\le3\sqrt T$, so $\frac{\mathrm{Reg}_T}T\le\frac3{\sqrt T}$; $T = 10\,000$.</p>
<p><b>Computation.</b>
$$\sqrt T = \blank{a},\qquad\frac{\mathrm{Reg}_T}T\le\blank{b},\qquad\text{factor on } T \text{ to divide the bound by 10: } \blank{c}.$$</p>` },

  ol6: { title: 'The Weighted Majority bound',
    text: R`<p class="hyp"><b>Data.</b> $M\le\frac{\ln K+m^\star\ln(1/\beta)}{\ln(2/(1+\beta))}$ with $\beta = \frac12$, $K = 8$, $m^\star = 10$.</p>
<p><b>Computation.</b>
$$\ln8+10\ln2\approx\blank{a},\qquad\ln\tfrac43\approx\blank{b},\qquad M\le\blank{c},\qquad\tfrac{1+\beta}2 = \blank{d}.$$</p>` },

  ol8: { title: 'Bounding $\\ln(1-\\eta)$',
    text: R`<p class="hyp"><b>Data.</b> $\eta = 0.5$; check $-\eta-\eta^2\le\ln(1-\eta)\le-\eta$.</p>
<p><b>Computation.</b>
$$\ln(1-\eta)\approx\blank{a},\qquad-\eta = -0.5,\qquad-\eta-\eta^2 = \blank{b}.$$</p>` },

  ol10: { title: 'One round of exponential weighting',
    text: R`<p class="hyp"><b>Data.</b> Two experts, $\eta = \ln2$, cumulative losses $L_{t-1} = (0,\,2)$, weights $w_t(i) = e^{-\eta L_{t-1,i}}$, losses of the round $\ell_t = (1,0)$.</p>
<p><b>Computation.</b>
$$w_t = (1,\ \blank{a}),\qquad p_t(1) = \blank{b},\qquad\langle p_t,\ell_t\rangle = \blank{c}.$$</p>` },

  ol12: { title: 'Choosing η numerically',
    text: R`<p class="hyp"><b>Data.</b> $K = 4$, $T = 800$; $\eta^\star = \sqrt{8\ln K/T}$ gives the bound $\sqrt{T\ln K/2}$; the slide gives $\sqrt{T\ln K}$.</p>
<p><b>Computation.</b>
$$\ln K\approx\blank{a},\qquad\eta^\star\approx\blank{b},\qquad\sqrt{T\ln K/2}\approx\blank{c},\qquad\sqrt{T\ln K}\approx\blank{d}.$$</p>` },
  });
})(window.ML);
