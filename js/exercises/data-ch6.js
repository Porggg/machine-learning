/* Exercices — Chapitre 6 : apprentissage en ligne, format « sujet d'examen » (Cadre → Proposition → Preuve à trous) */
(function (ML) {
  'use strict';
  const R = String.raw;
  const CADRE = R`<p class="hyp"><b>Cadre.</b> À chaque tour $t = 1,\dots,T$, l'apprenant prédit, puis la vérité est révélée. $\mathcal H = \{h_1,\dots,h_K\}$ est un ensemble fini d'experts ; $\ell_t(i)\in[0,1]$ est la perte de l'expert $i$ au tour $t$, $L_{T,i} = \sum_{t\le T}\ell_t(i)$, et $L^\star = \min_iL_{T,i}$.</p>`;
  const EW = R`<p class="hyp"><b>Exponential weighting.</b> $w_1(i) = 1$, $w_{t+1}(i) = w_t(i)\,e^{-\eta\ell_t(i)}$, $W_t = \sum_iw_t(i)$, $p_t(i) = w_t(i)/W_t$ ; l'apprenant suit l'expert $I_t\sim p_t$ ; $\langle p_t,\ell_t\rangle = \sum_ip_t(i)\ell_t(i)$.</p>`;

  ML.EX.add(
  { id: 'ol1', ch: 6, type: 'def', title: 'Le regret', src: 'Slide p.7',
    text: CADRE + R`<p><b>Définition.</b> Si l'apprenant utilise le prédicteur $h_t$ au tour $t$, son regret (statique) est
$$\mathrm{Reg}_T := \sum_{t=1}^T\ell\big(y_t,h_t(x_t)\big)-\blank{a}\sum_{t=1}^T\ell\big(y_t,h(x_t)\big).$$
Le comparateur est le meilleur expert [[b]], qui reste [[c]] pendant les $T$ tours. On cherche un regret sous-linéaire : $\mathrm{Reg}_T/T\to\blank{d}$.</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\min_{h\in\mathcal H}`, R`\min_{h \in H}`, 'min_h', 'min_{h in H}', 'min'], tex: R`\min_{h\in\mathcal H}` },
      b: { kind: 'word', ans: ['a posteriori', 'in hindsight', 'apres coup'], tex: 'a posteriori' },
      c: { kind: 'word', ans: ['fixe', 'le meme', 'constant', 'fixed'], tex: 'fixe' },
      d: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'ol5', ch: 6, type: 'def', title: 'Adversaire non anticipant', src: 'Slides p.8, 13',
    text: R`<p class="hyp"><b>Cadre.</b> Un apprenant randomisé tire sa prédiction $\hat y_t$ selon une loi $p_t$ calculée à partir du passé ; un adversaire choisit l'étiquette $y_t$.</p>
<p><b>Définition.</b> L'adversaire est non anticipant : il peut connaître l'algorithme, le passé et la loi $p_t$, mais il choisit $y_t$ [[a]] le tirage de $\hat y_t$. Il peut dépendre des prédictions [[b]] $\hat y_1,\dots,\hat y_{t-1}$, mais pas de $\hat y_t$.</p>`,
    blanks: {
      a: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
      b: { kind: 'word', ans: ['passees', 'passées', 'precedentes', 'précédentes', 'past'], tex: 'passées' },
    } },

  { id: 'ol15', ch: 6, type: 'deriv', title: 'Pourquoi viser $\\mathrm{Reg}_T = O(\\sqrt T)$, et pas mieux', src: 'Slide p.9 (preuve hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> Deux experts dont les pertes 0-1 $\ell_t(1),\ell_t(2)$ sont des pile ou face équilibrés, indépendants entre eux et d'un tour à l'autre ; $L_i = \sum_t\ell_t(i)$.</p>
<p class="claim"><b>Proposition.</b> (a) Si $\mathrm{Reg}_T\le c\sqrt T$, le regret moyen tend vers 0. (b) Sur cet exemple, tout apprenant a $\E[\mathrm{Reg}_T]\approx\frac12\sqrt{T/\pi}$ : on ne peut pas faire mieux que l'ordre $\sqrt T$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\frac{\mathrm{Reg}_T}{T} &\le\frac{c\sqrt T}{T} = \blank{a}\ \xrightarrow[T\to\infty]{}\ 0 &&\text{(i)}\\
\E[\text{perte de l'apprenant}] &= \textstyle\sum_t\frac12 = \frac T2 &&\text{(ii)}\\
\min(L_1,L_2) &= \frac{L_1+L_2}2-\blank{b} &&\text{(iii)}\\
\E\big[\min(L_1,L_2)\big] &\approx\frac T2-\frac12\sqrt{T/\pi}. &&\text{(iv)}
\end{aligned}$$
<p>(ii) : quelle que soit sa stratégie, la perte de chaque expert au tour $t$ est indépendante du passé et vaut 1 avec probabilité $\frac12$. (iv) : $L_1-L_2$ est une somme de $T$ variables centrées de variance $\frac12$ ; par le théorème [[c]], $\E|L_1-L_2|\approx\sqrt{T/\pi}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{c}{\sqrt T}`, 'c/sqrt(T)', R`c/\sqrt{T}`, 'c/√T'], tex: R`\frac{c}{\sqrt T}` },
      b: { kind: 'expr', ans: [R`\frac{|L_1-L_2|}{2}`, '|L_1-L_2|/2', '|L1-L2|/2'], tex: R`\frac{|L_1-L_2|}2` },
      c: { kind: 'word', ans: ['central limite', 'central-limite', 'tcl', 'clt', 'central limit'], tex: 'central limite' },
    } },

  { id: 'ol3', ch: 6, type: 'deriv', title: 'Un apprenant déterministe a un regret $\\ge T/2$', src: 'Slides p.11–12',
    text: R`<p class="hyp"><b>Cadre.</b> $y_t\in\{-1,+1\}$, perte 0-1. L'apprenant est déterministe : $\hat y_t$ est une fonction connue du passé. L'adversaire connaît l'algorithme. $\mathcal H = \{h_{-1},h_{+1}\}$, où $h_y$ prédit toujours $y$.</p>
<p class="claim"><b>Proposition.</b> Il existe une suite d'étiquettes telle que $\mathrm{Reg}_T\ge\frac T2$.</p>
<p><b>Preuve.</b> L'adversaire calcule $\hat y_t$ et joue $y_t = \blank{a}$.</p>
$$\begin{aligned}
\textstyle\sum_t\ell(y_t,\hat y_t) &= \blank{b} &&\text{(i)}\\
\ell(y_t,h_{-1})+\ell(y_t,h_{+1}) = 1\ &\Longrightarrow\ L(h_{-1})+L(h_{+1}) = \blank{c} &&\text{(ii)}\\
\min\big(L(h_{-1}),L(h_{+1})\big) &\le\blank{d} &&\text{(iii)}\\
\mathrm{Reg}_T &\ge T-\tfrac T2 = \tfrac T2. &&\text{(iv)}
\end{aligned}$$
<p>(ii) : à chaque tour, exactement un des deux experts a raison. (iii) : deux nombres de somme $T$ ne peuvent pas être tous deux $>\frac T2$. Cela marche parce qu'un apprenant déterministe est [[e]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\hat y_t`, '-yhat_t', '-ŷ_t'], tex: R`-\hat y_t` },
      b: { kind: 'expr', ans: ['T'], tex: 'T' },
      c: { kind: 'expr', ans: ['T'], tex: 'T' },
      d: { kind: 'expr', ans: ['T/2', R`\frac{T}{2}`, R`\frac T2`, '0.5T'], tex: R`\frac T2` },
      e: { kind: 'word', ans: ['previsible', 'prévisible', 'predictible', 'predictable'], tex: 'prévisible' },
    } },

  { id: 'ol16', ch: 6, type: 'deriv', title: 'Ce que la randomisation change', src: 'Slide p.13 (calcul hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> Perte 0-1, étiquettes $\pm1$. Au tour $t$, l'adversaire non anticipant fixe $y_t$, puis l'apprenant tire $\hat y_t$ selon une loi $q_t$ sur $\{-1,+1\}$.</p>
<p class="claim"><b>Proposition.</b> L'adversaire ne peut plus imposer une perte espérée de 1 par tour : au pire, elle vaut $\max_yq_t(y)$, soit $\frac12$ si $q_t$ est équilibrée.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E[\ell_t] = \Pr(\hat y_t\ne y_t) &= \blank{a} &&\text{(i)}\\
\max_{y_t}\Pr(\hat y_t\ne y_t) &= \max_{y}\big(1-q_t(y)\big) = 1-\min_yq_t(y) = \blank{b}. &&\text{(ii)}
\end{aligned}$$
<p>(ii) : $q_t$ n'a que deux valeurs, de somme 1. Si l'adversaire voyait $\hat y_t$ avant de choisir, il jouerait $y_t = -\hat y_t$ et la perte vaudrait [[c]] : la randomisation ne sert que contre un adversaire non anticipant. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`1-q_t(y_t)`, '1 - q_t(y_t)', '1-q(y_t)'], tex: R`1-q_t(y_t)` },
      b: { kind: 'expr', ans: [R`\max_yq_t(y)`, 'max_y q_t(y)', 'max q_t(y)', R`\max_y q_t(y)`], tex: R`\max_yq_t(y)` },
      c: { kind: 'num', ans: 1, tol: 0 },
    } },

  { id: 'ol14', ch: 6, type: 'deriv', title: 'Regret dynamique contre regret statique', src: 'Slide p.10',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> $\mathrm{Reg}^{\text{dynamic}}_T\ge\mathrm{Reg}^{\text{static}}_T$ ; et avec $\mathcal H = \{h_{-1},h_{+1}\}$ en perte 0-1, le comparateur dynamique a une perte nulle.</p>
<p><b>Preuve.</b> Les comparateurs sont $\min_{h}\sum_t\ell(y_t,h(x_t))$ (statique) et $\min_{(h_1,\dots,h_T)\in\mathcal H^T}\sum_t\ell(y_t,h_t(x_t))$ (dynamique).</p>
$$\begin{aligned}
(h,\dots,h)\in\mathcal H^T\ &\Longrightarrow\ \min_{\mathcal H^T}\textstyle\sum_t\ell\ \blank{a}\ \min_{h\in\mathcal H}\sum_t\ell &&\text{(i)}\\
\min_{(h_t)}\textstyle\sum_t\ell(y_t,h_t(x_t)) &= \textstyle\sum_t\blank{b} &&\text{(ii)}\\
\text{avec } \{h_{-1},h_{+1}\}:\quad\min_h\ell(y_t,h(x_t)) &= \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : on retranche un nombre plus petit, donc le regret dynamique est plus grand. (ii) : la somme se minimise tour par tour. (iii) : à chaque tour, l'un des deux experts a raison. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\le`, '<=', '≤', R`\leq`], tex: R`\le` },
      b: { kind: 'expr', ans: [R`\min_{h\in\mathcal H}\ell(y_t,h(x_t))`, 'min_h l(y_t,h(x_t))', R`\min_h\ell(y_t,h(x_t))`, 'min_h ℓ(y_t,h(x_t))'], tex: R`\min_{h\in\mathcal H}\ell(y_t,h(x_t))` },
      c: { kind: 'num', ans: 0, tol: 0 },
    } },

  { id: 'd6a', ch: 6, type: 'deriv', title: 'La borne d\'erreurs de Weighted Majority', src: 'Chapitre 6, §4 (hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> Weighted Majority : $K$ experts, poids initiaux 1, prédiction par vote pondéré ; quand le vote se trompe, les poids des experts fautifs sont multipliés par $\beta\in(0,1)$. $M$ = erreurs de WM, $m^\star$ = erreurs du meilleur expert $i^\star$, $W_t$ = poids total.</p>
<p class="claim"><b>Proposition.</b> $M\le\dfrac{\ln K+m^\star\ln(1/\beta)}{\ln\big(2/(1+\beta)\big)}$.</p>
<p><b>Preuve.</b> Quand WM se trompe, les experts fautifs ont voté avec la majorité, donc portent un poids $W^{\text{faux}}\ge\frac12W_t$ :</p>
$$\begin{aligned}
W_{t+1} &= W_t-(1-\beta)W^{\text{faux}}\le\blank{a}\,W_t &&\text{(i)}\\
W_{T+1} &\le K\Big(\frac{1+\beta}2\Big)^M &&\text{(ii)}\\
w_{T+1}(i^\star) &\ge\blank{b} &&\text{(iii)}\\
\beta^{m^\star}\le K\Big(\frac{1+\beta}2\Big)^M\ &\Longrightarrow\ M\ln\frac2{1+\beta}\le\ln K+m^\star\ln\frac1\beta. &&\text{(iv)}
\end{aligned}$$
<p>(ii) : $W_1 = K$, et $W$ ne change pas quand WM a raison. (iii) : $i^\star$ n'est pénalisé qu'au plus $m^\star$ fois. (iv) : on combine avec $w(i^\star)\le W$ et on prend le [[c]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\frac{1+\beta}{2}`, '(1+beta)/2', '(1+β)/2'], tex: R`\frac{1+\beta}2` },
      b: { kind: 'expr', ans: [R`\beta^{m^\star}`, 'beta^m*', 'β^m*', R`\beta^{m^*}`, 'beta^(m*)'], tex: R`\beta^{m^\star}` },
      c: { kind: 'word', ans: ['logarithme', 'log', 'ln'], tex: 'logarithme' },
    } },

  { id: 'ol7', ch: 6, type: 'deriv', title: 'De Randomized WM à l\'exponential weighting', src: 'Slide p.19',
    text: CADRE + R`<p class="claim"><b>Proposition.</b> Avec $\beta = 1-\eta$, la mise à jour de RWM s'écrit $w_{t+1}(i) = w_t(i)(1-\eta)^{\ell_t(i)}$, et $(1-\eta)^{\ell}\le e^{-\eta\ell}$.</p>
<p><b>Preuve.</b> RWM multiplie par $\beta$ le poids des experts qui se trompent (perte 0-1).</p>
$$\begin{aligned}
\ell = 0:\ (1-\eta)^0 = 1,\qquad\ell = 1:\ (1-\eta)^1 &= \blank{a} &&\text{(i)}\\
\ln(1-\eta) &\le\blank{b} &&\text{(ii)}\\
(1-\eta)^\ell = e^{\ell\ln(1-\eta)} &\le\blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>(ii) : $\ln(1+u)\le u$ par [[d]], avec $u = -\eta$. La forme (i) a un sens pour toute perte $\ell\in[0,1]$ ; l'exponential weighting la remplace par $e^{-\eta\ell}$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\beta`, 'beta', 'β'], tex: R`\beta` },
      b: { kind: 'expr', ans: ['-\\eta', '-eta', '−η', '-η'], tex: R`-\eta` },
      c: { kind: 'expr', ans: [R`e^{-\eta\ell}`, R`\exp(-\eta\ell)`, 'e^(-eta l)', 'exp(-eta*l)', R`e^{-\eta \ell}`], tex: R`e^{-\eta\ell}` },
      d: { kind: 'word', ans: ['concavite', 'concavité', 'concavity'], tex: 'concavité' },
    } },

  { id: 'd6b', ch: 6, type: 'deriv', title: '$\\ln(1-\\eta)\\ge-\\eta-\\eta^2$ sur $[0,\\frac12]$', src: 'Chapitre 6, §5 (hors slides)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $g(\eta) = \ln(1-\eta)+\eta+\eta^2$ pour $\eta\in[0,\frac12]$.</p>
<p class="claim"><b>Proposition.</b> $g\ge0$, c'est-à-dire $\ln(1-\eta)\ge-\eta-\eta^2$ ; donc $e^{-(\eta+\eta^2)\ell}\le(1-\eta)^\ell\le e^{-\eta\ell}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
g(0) &= \blank{a} &&\text{(i)}\\
g'(\eta) &= -\frac1{1-\eta}+1+2\eta = \frac{-1+(1+2\eta)(1-\eta)}{1-\eta} = \blank{b} &&\text{(ii)}
\end{aligned}$$
<p>Sur $[0,\frac12]$, $g'\ge0$ car $1-2\eta\ge0$ : $g$ est [[c]] et part de 0, donc $g\ge0$. $\square$</p>`,
    blanks: {
      a: { kind: 'num', ans: 0, tol: 0 },
      b: { kind: 'expr', ans: [R`\frac{\eta(1-2\eta)}{1-\eta}`, 'eta(1-2eta)/(1-eta)', 'η(1-2η)/(1-η)', R`\frac{\eta-2\eta^2}{1-\eta}`, '(eta-2eta^2)/(1-eta)'], tex: R`\frac{\eta(1-2\eta)}{1-\eta}` },
      c: { kind: 'word', ans: ['croissante', 'increasing'], tex: 'croissante' },
    } },

  { id: 'ol9', ch: 6, type: 'deriv', title: '$p_t$ est une softmax des pertes cumulées', src: 'Slide p.21 (forme close hors slides)', srcKind: 'extra',
    text: CADRE + EW + R`<p class="claim"><b>Proposition.</b> $p_t(i) = \frac{e^{-\eta L_{t-1,i}}}{\sum_je^{-\eta L_{t-1,j}}}$ (softmax de température $1/\eta$).</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
w_{t+1}(i) &= \prod_{s=1}^te^{-\eta\ell_s(i)} = \exp\Big(-\eta\,\blank{a}\Big) = e^{-\eta L_{t,i}} &&\text{(i)}\\
p_t(i) &= \frac{w_t(i)}{\sum_jw_t(j)} = \frac{e^{-\eta L_{t-1,i}}}{\sum_je^{-\eta L_{t-1,j}}} = \mathrm{softmax}\big(\blank{b}\big)_i. &&\text{(ii)}
\end{aligned}$$
<p>(i) : on déroule la récurrence depuis $w_1(i) = 1$. Quand $\eta\to\infty$, toute la masse va sur l'expert de plus petite perte cumulée ([[c]]) ; quand $\eta\to0$, $p_t$ devient [[d]]. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sum_{s=1}^t\ell_s(i)`, 'sum_s l_s(i)', R`\sum_s\ell_s(i)`, 'L_{t,i}', 'L_t,i'], tex: R`\sum_{s=1}^t\ell_s(i)` },
      b: { kind: 'expr', ans: [R`-\eta L_{t-1}`, '-eta L_{t-1}', '-ηL_{t-1}', R`-\eta L_{t-1,\cdot}`], tex: R`-\eta L_{t-1}` },
      c: { kind: 'word', ans: ['suivre le meneur', 'follow the leader', 'ftl', 'le meneur'], tex: 'suivre le meneur' },
      d: { kind: 'word', ans: ['uniforme', 'uniform', 'la loi uniforme'], tex: 'uniforme' },
    } },

  { id: 'ol13', ch: 6, type: 'deriv', title: 'Le lemme de Hoeffding', src: 'Hors slides (§6)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Cadre.</b> $X$ variable aléatoire à valeurs dans $[0,1]$, de moyenne $\mu$ ; $s\in\R$.</p>
<p class="claim"><b>Proposition.</b> $\ln\E[e^{sX}]\le s\mu+\frac{s^2}8$.</p>
<p><b>Preuve.</b> On pose $\psi(s) = \ln(1-\mu+\mu e^s)$ et $q(s) = \frac{\mu e^s}{1-\mu+\mu e^s}\in[0,1]$.</p>
$$\begin{aligned}
e^{sx} &\le(1-x)\,e^0+x\,e^s\quad(x\in[0,1])\ \Longrightarrow\ \ln\E[e^{sX}]\le\psi(s) &&\text{(i)}\\
\psi(0) &= 0,\qquad\psi'(0) = \blank{a} &&\text{(ii)}\\
\psi''(s) &= q(s)\big(1-q(s)\big)\le\blank{b} &&\text{(iii)}\\
\psi(s) &= \psi(0)+s\,\psi'(0)+\tfrac{s^2}2\psi''(\xi)\le s\mu+\tfrac{s^2}8. &&\text{(iv)}
\end{aligned}$$
<p>(i) : l'exponentielle est sous sa corde entre 0 et 1, par [[c]] ; puis on prend l'espérance. (iv) : Taylor avec reste de Lagrange, $\xi$ entre 0 et $s$. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\mu`, 'mu', 'μ'], tex: R`\mu` },
      b: { kind: 'expr', ans: ['1/4', R`\frac{1}{4}`, '0.25'], tex: R`\frac14` },
      c: { kind: 'word', ans: ['convexite', 'convexité', 'convexity'], tex: 'convexité' },
    } },

  { id: 'ol11', ch: 6, type: 'deriv', title: 'La borne par potentiel', src: 'Slide p.22 (preuve hors slides)', srcKind: 'extra',
    text: CADRE + EW + R`<p class="claim"><b>Proposition.</b> Pour toute suite de pertes, $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}\eta+\frac{\eta T}8$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\ln\frac{W_{T+1}}{W_1} &\ge\ln\frac{e^{-\eta L^\star}}{\blank{a}} = -\eta L^\star-\ln K &&\text{(i)}\\
\frac{W_{t+1}}{W_t} &= \sum_ip_t(i)\,\blank{b} &&\text{(ii)}\\
\ln\frac{W_{t+1}}{W_t} &\le-\eta\langle p_t,\ell_t\rangle+\blank{c} &&\text{(iii)}\\
-\eta L^\star-\ln K &\le\ln\frac{W_{T+1}}{W_1} = \sum_t\ln\frac{W_{t+1}}{W_t}\le-\eta\sum_t\langle p_t,\ell_t\rangle+\frac{\eta^2T}8. &&\text{(iv)}
\end{aligned}$$
<p>(i) : $W_{T+1} = \sum_ie^{-\eta L_{T,i}}$ est plus grand que son terme $i^\star$. (iii) : lemme de [[d]] avec $X = \ell_t(i)$, $i\sim p_t$ et $s = -\eta$. On divise (iv) par $\eta$ et on réarrange. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: ['K'], tex: 'K' },
      b: { kind: 'expr', ans: [R`e^{-\eta\ell_t(i)}`, R`\exp(-\eta\ell_t(i))`, 'e^(-eta l_t(i))', R`e^{-\eta \ell_t(i)}`, 'exp(-eta*l_t(i))'], tex: R`e^{-\eta\ell_t(i)}` },
      c: { kind: 'expr', ans: [R`\frac{\eta^2}{8}`, 'eta^2/8', R`\eta^2/8`], tex: R`\frac{\eta^2}{8}` },
      d: { kind: 'word', ans: ['hoeffding'], tex: 'Hoeffding' },
    } },

  { id: 'd6c', ch: 6, type: 'deriv', title: 'De la borne déterministe à $\\E[\\mathrm{Reg}_T]$', src: 'Chapitre 6, §6',
    text: CADRE + EW + R`<p class="hyp">On a prouvé, pour toute suite de pertes, $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}\eta+\frac{\eta T}8$. L'adversaire est non anticipant.</p>
<p class="claim"><b>Proposition.</b> $\E[\mathrm{Reg}_T] = \E\big[\sum_t\ell_t(I_t)-L^\star\big]\le\frac{\ln K}\eta+\frac{\eta T}8$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
\E\big[\ell_t(I_t)\mid\text{passé}\big] &= \blank{a} &&\text{(i)}\\
\E\Big[\textstyle\sum_t\ell_t(I_t)\Big] &= \E\Big[\textstyle\sum_t\langle p_t,\ell_t\rangle\Big] &&\text{(ii)}\\
\E[\mathrm{Reg}_T] &= \E\Big[\textstyle\sum_t\langle p_t,\ell_t\rangle-L^\star\Big]\le\blank{b}. &&\text{(iii)}
\end{aligned}$$
<p>(i) : $\ell_t$ est fixé [[c]] le tirage $I_t\sim p_t$. (ii) : loi des espérances totales. (iii) : la borne vaut pour chaque réalisation. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sum_ip_t(i)\ell_t(i)`, 'sum_i p_t(i) l_t(i)', R`\langle p_t,\ell_t\rangle`, '<p_t,l_t>', R`\sum_i p_t(i)\ell_t(i)`], tex: R`\sum_ip_t(i)\ell_t(i)` },
      b: { kind: 'expr', ans: [R`\frac{\ln K}{\eta}+\frac{\eta T}{8}`, 'ln K/eta + eta T/8', 'lnK/η + ηT/8', R`\ln K/\eta+\eta T/8`], tex: R`\frac{\ln K}\eta+\frac{\eta T}8` },
      c: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
    } },

  { id: 'd6d', ch: 6, type: 'deriv', title: 'Choisir η', src: 'Chapitre 6, §6 (slide 22)',
    text: R`<p class="hyp"><b>Cadre.</b> $f(\eta) = \frac{\ln K}\eta+\frac{\eta T}8$ pour $\eta>0$ (borne du regret espéré de l'exponential weighting).</p>
<p class="claim"><b>Proposition.</b> $f$ est minimale en $\eta^\star = \sqrt{8\ln K/T}$, où $f(\eta^\star) = \sqrt{T\ln K/2}\le\sqrt{T\ln K}$.</p>
<p><b>Preuve.</b></p>
$$\begin{aligned}
f'(\eta) &= \blank{a}+\frac T8 = 0\ \iff\ \eta = \blank{b} &&\text{(i)}\\
f''(\eta) &= \frac{2\ln K}{\eta^3}>0 &&\text{(ii)}\\
f(\eta^\star) &= \sqrt{\frac{T\ln K}8}+\sqrt{\frac{T\ln K}8} = \blank{c}. &&\text{(iii)}
\end{aligned}$$
<p>Par (ii), $f$ est [[d]], donc le point critique (i) est son minimum global. $\square$</p>`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\frac{\ln K}{\eta^2}`, '-ln K/eta^2', '-lnK/η^2', R`-\ln K/\eta^2`], tex: R`-\frac{\ln K}{\eta^2}` },
      b: { kind: 'expr', ans: [R`\sqrt{\frac{8\ln K}{T}}`, 'sqrt(8 ln K/T)', 'sqrt(8lnK/T)', R`\sqrt{8\ln K/T}`], tex: R`\sqrt{\frac{8\ln K}T}` },
      c: { kind: 'expr', ans: [R`\sqrt{\frac{T\ln K}{2}}`, 'sqrt(T ln K/2)', 'sqrt(TlnK/2)', R`\sqrt{T\ln K/2}`], tex: R`\sqrt{\frac{T\ln K}2}` },
      d: { kind: 'word', ans: ['convexe', 'convex', 'strictement convexe'], tex: 'convexe' },
    } },

  // ---------------------------------------------------------------- calculs
  { id: 'ol2', ch: 6, type: 'calc', title: 'Calculer un regret', src: 'Slides p.5–7',
    text: R`<p class="hyp"><b>Données.</b> Perte 0-1, $T = 100$ tours. L'apprenant fait 31 erreurs ; trois experts en font 27, 35 et 52.</p>
<p><b>Calcul.</b>
$$\min_hL(h) = \blank{a},\qquad\mathrm{Reg}_{100} = \blank{b},\qquad\frac{\mathrm{Reg}_{100}}{100} = \blank{c}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 27, tol: 0 }, b: { kind: 'num', ans: 4, tol: 0 }, c: { kind: 'num', ans: 0.04, tol: 0.01 } } },

  { id: 'ol4', ch: 6, type: 'calc', title: 'Regret sous-linéaire', src: 'Slide p.9',
    text: R`<p class="hyp"><b>Données.</b> Un algorithme garantit $\mathrm{Reg}_T\le3\sqrt T$, donc $\frac{\mathrm{Reg}_T}T\le\frac3{\sqrt T}$ ; $T = 10\,000$.</p>
<p><b>Calcul.</b>
$$\sqrt T = \blank{a},\qquad\frac{\mathrm{Reg}_T}T\le\blank{b},\qquad\text{facteur sur } T \text{ pour diviser la borne par 10 : } \blank{c}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 100, tol: 0 }, b: { kind: 'num', ans: 0.03, tol: 0.01 }, c: { kind: 'num', ans: 100, tol: 0 } } },

  { id: 'ol6', ch: 6, type: 'calc', title: 'La borne de Weighted Majority', src: 'Hors slides (§4)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Données.</b> $M\le\frac{\ln K+m^\star\ln(1/\beta)}{\ln(2/(1+\beta))}$ avec $\beta = \frac12$, $K = 8$, $m^\star = 10$.</p>
<p><b>Calcul.</b>
$$\ln8+10\ln2\approx\blank{a},\qquad\ln\tfrac43\approx\blank{b},\qquad M\le\blank{c},\qquad\tfrac{1+\beta}2 = \blank{d}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 9.0109, tol: 0.01 }, b: { kind: 'num', ans: 0.28768, tol: 0.01 }, c: { kind: 'num', ans: 31.32, tol: 0.01 }, d: { kind: 'num', ans: 0.75, tol: 0.01 } } },

  { id: 'ol8', ch: 6, type: 'calc', title: 'Encadrer $\\ln(1-\\eta)$', src: 'Hors slides (§5)', srcKind: 'extra',
    text: R`<p class="hyp"><b>Données.</b> $\eta = 0.5$ ; on vérifie $-\eta-\eta^2\le\ln(1-\eta)\le-\eta$.</p>
<p><b>Calcul.</b>
$$\ln(1-\eta)\approx\blank{a},\qquad-\eta = -0.5,\qquad-\eta-\eta^2 = \blank{b}.$$</p>`,
    blanks: { a: { kind: 'num', ans: -0.6931, tol: 0.01 }, b: { kind: 'num', ans: -0.75, tol: 0.01 } } },

  { id: 'ol10', ch: 6, type: 'calc', title: 'Un tour d\'exponential weighting', src: 'Slide p.21',
    text: R`<p class="hyp"><b>Données.</b> Deux experts, $\eta = \ln2$, pertes cumulées $L_{t-1} = (0,\,2)$, poids $w_t(i) = e^{-\eta L_{t-1,i}}$, pertes du tour $\ell_t = (1,0)$.</p>
<p><b>Calcul.</b>
$$w_t = (1,\ \blank{a}),\qquad p_t(1) = \blank{b},\qquad\langle p_t,\ell_t\rangle = \blank{c}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 0.25, tol: 0.01 }, b: { kind: 'num', ans: 0.8, tol: 0.01 }, c: { kind: 'num', ans: 0.8, tol: 0.01 } } },

  { id: 'ol12', ch: 6, type: 'calc', title: 'Choisir η numériquement', src: 'Slide p.22',
    text: R`<p class="hyp"><b>Données.</b> $K = 4$, $T = 800$ ; $\eta^\star = \sqrt{8\ln K/T}$ donne la borne $\sqrt{T\ln K/2}$ ; la slide donne $\sqrt{T\ln K}$.</p>
<p><b>Calcul.</b>
$$\ln K\approx\blank{a},\qquad\eta^\star\approx\blank{b},\qquad\sqrt{T\ln K/2}\approx\blank{c},\qquad\sqrt{T\ln K}\approx\blank{d}.$$</p>`,
    blanks: { a: { kind: 'num', ans: 1.3863, tol: 0.01 }, b: { kind: 'num', ans: 0.1177, tol: 0.01 }, c: { kind: 'num', ans: 23.55, tol: 0.01 }, d: { kind: 'num', ans: 33.30, tol: 0.01 } } },
  );
})(window.ML);
