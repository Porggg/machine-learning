/* Exercices — Chapitre 6 : apprentissage en ligne (cadre explicite, trous dans les étapes) */
(function (ML) {
  'use strict';
  const R = String.raw;
  const CADRE = R`<b>Cadre.</b> À chaque tour $t = 1,\dots,T$, l'apprenant prédit, puis la vérité est révélée. $\mathcal H = \{h_1,\dots,h_K\}$ est un ensemble fini d'experts ; $\ell_t(i)\in[0,1]$ est la perte de l'expert $i$ au tour $t$, et $L_{T,i} = \sum_{t\le T}\ell_t(i)$ sa perte cumulée.<br>`;
  const EW = R`Exponential weighting : $w_1(i) = 1$, $w_{t+1}(i) = w_t(i)\,e^{-\eta\ell_t(i)}$, $p_t(i) = w_t(i)/W_t$ avec $W_t = \sum_iw_t(i)$, et l'apprenant suit un expert $I_t\sim p_t$.<br>`;

  ML.EX.add(
  { id: 'ol1', ch: 6, type: 'def', title: 'Le regret', src: 'Slide p.7',
    text: CADRE + R`L'apprenant utilise le prédicteur $h_t$ au tour $t$. Son regret est
$$\mathrm{Reg}_T := \sum_{t=1}^T\ell\big(y_t,h_t(x_t)\big)-\blank{a}\sum_{t=1}^T\ell\big(y_t,h(x_t)\big).$$
Le comparateur est le meilleur expert [[b]] (choisi après avoir vu les $T$ tours) et il reste [[c]] pendant tous les tours. On cherche un regret sous-linéaire : $\mathrm{Reg}_T/T\to\blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\min_{h\in\mathcal H}`, R`\min_{h \in H}`, 'min_h', 'min_{h in H}', 'min'], tex: R`\min_{h\in\mathcal H}` },
      b: { kind: 'word', ans: ['a posteriori', 'in hindsight', 'apres coup'], tex: 'a posteriori' },
      c: { kind: 'word', ans: ['fixe', 'le meme', 'constant', 'fixed'], tex: 'fixe' },
      d: { kind: 'num', ans: 0, tol: 0 },
    },
    solution: R`C'est le regret <b>statique</b> ; le regret dynamique autorise une suite $(h_1,\dots,h_T)\in\mathcal H^T$.` },

  { id: 'ol2', ch: 6, type: 'calc', title: 'Calculer un regret', src: 'Slides p.5–7',
    text: R`<b>Cadre.</b> Perte 0-1, $T = 100$ tours, trois experts. L'apprenant fait 31 erreurs ; les experts en font 27, 35 et 52 (sur toute la séquence). Regret $=$ (erreurs de l'apprenant) $-$ (erreurs du meilleur expert a posteriori).<br>
Meilleur expert : $\blank{a}$ erreurs. Regret : $\blank{b}$. Regret moyen par tour : $\blank{c}$.`,
    blanks: { a: { kind: 'num', ans: 27, tol: 0 }, b: { kind: 'num', ans: 4, tol: 0 }, c: { kind: 'num', ans: 0.04, tol: 0.01 } } },

  { id: 'ol3', ch: 6, type: 'deriv', title: 'Démo : un apprenant déterministe a un regret $\\ge T/2$', src: 'Slides p.11–12',
    text: R`<b>Cadre.</b> Classification binaire $y_t\in\{-1,+1\}$, perte 0-1. L'apprenant est déterministe : sa prédiction $\hat y_t$ est une fonction connue du passé. L'adversaire, qui connaît l'algorithme, choisit $y_t$ après avoir vu le passé. Experts : $\mathcal H = \{h_{-1},h_{+1}\}$, où $h_y$ prédit toujours $y$.<br>
L'adversaire calcule $\hat y_t$ et joue $y_t = \blank{a}$ : l'apprenant se trompe à chaque tour et perd $\blank{b}$ au total. À chaque tour, exactement un des deux experts a raison, donc $L(h_{-1})+L(h_{+1}) = \blank{c}$, et le meilleur des deux a au plus $\blank{d}$ erreurs. D'où $\mathrm{Reg}_T\ge T-\frac T2 = \frac T2$.`,
    blanks: {
      a: { kind: 'expr', ans: [R`-\hat y_t`, '-yhat_t', '-ŷ_t'], tex: R`-\hat y_t` },
      b: { kind: 'expr', ans: ['T'], tex: 'T' },
      c: { kind: 'expr', ans: ['T'], tex: 'T' },
      d: { kind: 'expr', ans: ['T/2', R`\frac{T}{2}`, R`\frac T2`, '0.5T'], tex: R`T/2` },
    },
    solution: R`Deux nombres de somme $T$ ne peuvent pas être tous deux $>T/2$.` },

  { id: 'ol4', ch: 6, type: 'calc', title: 'Regret sous-linéaire', src: 'Slide p.9',
    text: R`<b>Cadre.</b> Un algorithme garantit $\mathrm{Reg}_T\le3\sqrt T$ pour tout $T$. Le regret moyen par tour est donc au plus $\frac{3}{\sqrt T}$.<br>
Pour $T = 10\,000$, $\sqrt T = \blank{a}$ et le regret par tour est au plus $\blank{b}$. Pour diviser cette borne par 10, il faut multiplier $T$ par $\blank{c}$.`,
    blanks: { a: { kind: 'num', ans: 100, tol: 0 }, b: { kind: 'num', ans: 0.03, tol: 0.01 }, c: { kind: 'num', ans: 100, tol: 0 } } },

  { id: 'ol5', ch: 6, type: 'def', title: 'Adversaire non anticipant', src: 'Slides p.8, 13',
    text: R`<b>Cadre.</b> Un apprenant randomisé tire sa prédiction selon une loi $p_t$ calculée à partir du passé. Un adversaire choisit l'étiquette $y_t$.<br>
L'adversaire est dit non anticipant : il peut connaître l'algorithme, le passé et même la loi $p_t$, mais il doit choisir $y_t$ [[a]] le tirage de la prédiction. S'il voyait $\hat y_t$, il jouerait $y_t\ne\hat y_t$ à chaque tour, et la [[b]] ne servirait à rien.`,
    blanks: {
      a: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
      b: { kind: 'word', ans: ['randomisation', 'randomization', 'aleatoire', 'le hasard'], tex: 'randomisation' },
    } },

  { id: 'ol6', ch: 6, type: 'calc', title: 'La borne de Weighted Majority', src: 'Hors slides (§4)', srcKind: 'extra',
    text: R`<b>Cadre.</b> Weighted Majority (vote pondéré, pénalité $\beta$ sur les experts fautifs quand le vote se trompe) vérifie $M\le\frac{\ln K+m^\star\ln(1/\beta)}{\ln(2/(1+\beta))}$, où $M$ est son nombre d'erreurs et $m^\star$ celui du meilleur expert. Ici $\beta = \frac12$, $K = 8$, $m^\star = 10$.<br>
Numérateur : $\ln8+10\ln2\approx\blank{a}$. Dénominateur : $\ln\frac43\approx\blank{b}$. Donc $M\le\blank{c}$. À chaque erreur de WM, le poids total est multiplié par au plus $\frac{1+\beta}2 = \blank{d}$.`,
    blanks: { a: { kind: 'num', ans: 9.0109, tol: 0.01 }, b: { kind: 'num', ans: 0.28768, tol: 0.01 }, c: { kind: 'num', ans: 31.32, tol: 0.01 }, d: { kind: 'num', ans: 0.75, tol: 0.01 } } },

  { id: 'ol7', ch: 6, type: 'deriv', title: 'Démo : de Randomized WM à l\'exponential weighting', src: 'Slide p.19',
    text: CADRE + R`Randomized Weighted Majority multiplie par $\beta\in(0,1)$ le poids des experts qui se trompent (perte 0-1). Avec $\beta := 1-\eta$, cette mise à jour s'écrit $w_{t+1}(i) = w_t(i)\,(\blank{a})^{\ell_t(i)}$, car $(1-\eta)^0 = 1$ et $(1-\eta)^1 = \beta$. Cette forme a un sens pour toute perte $\ell\in[0,1]$. Comme $\ln(1+u)\le u$ (concavité) avec $u = -\eta$ : $\ln(1-\eta)\le\blank{b}$, donc $(1-\eta)^\ell\le e^{-\eta\ell}$, et les deux sont presque égaux pour $\eta$ petit. L'exponential weighting utilise $w_{t+1}(i) = w_t(i)\,\blank{c}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['1-\\eta', '1-eta', '1 - η', '1-η'], tex: R`1-\eta` },
      b: { kind: 'expr', ans: ['-\\eta', '-eta', '−η', '-η'], tex: R`-\eta` },
      c: { kind: 'expr', ans: [R`e^{-\eta\ell_t(i)}`, R`\exp(-\eta\ell_t(i))`, 'e^(-eta l_t(i))', 'exp(-eta*l_t(i))', R`e^{-\eta \ell_t(i)}`], tex: R`e^{-\eta\ell_t(i)}` },
    } },

  { id: 'ol8', ch: 6, type: 'calc', title: 'Encadrer $\\ln(1-\\eta)$', src: 'Hors slides (§5)', srcKind: 'extra',
    text: R`<b>Cadre.</b> Pour $\eta\in[0,\frac12]$, on a l'encadrement $-\eta-\eta^2\le\ln(1-\eta)\le-\eta$. On le vérifie pour $\eta = 0.5$.<br>
$\ln(1-\eta) = \ln0.5\approx\blank{a}$ ; $-\eta = -0.5$ ; $-\eta-\eta^2 = \blank{b}$.`,
    blanks: { a: { kind: 'num', ans: -0.6931, tol: 0.01 }, b: { kind: 'num', ans: -0.75, tol: 0.01 } } },

  { id: 'ol9', ch: 6, type: 'deriv', title: 'Démo : $p_t$ est une softmax des pertes cumulées', src: 'Slide p.21 (forme close hors slides)', srcKind: 'extra',
    text: CADRE + EW + R`En déroulant la récurrence depuis $w_1(i) = 1$ : $w_{t+1}(i) = \prod_{s=1}^te^{-\eta\ell_s(i)} = \exp\big(-\eta\,\blank{a}\big) = e^{-\eta L_{t,i}}$. Donc $p_t(i) = \frac{e^{-\eta L_{t-1,i}}}{\sum_je^{-\eta L_{t-1,j}}}$ : c'est la softmax des « logits » $\blank{b}$. Quand $\eta\to\infty$, toute la masse va sur l'expert de plus petite perte cumulée ([[c]]) ; quand $\eta\to0$, $p_t$ devient [[d]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`\sum_{s=1}^t\ell_s(i)`, 'sum_s l_s(i)', R`\sum_s\ell_s(i)`, 'L_{t,i}', 'L_t,i'], tex: R`\sum_{s=1}^t\ell_s(i)` },
      b: { kind: 'expr', ans: [R`-\eta L_{t-1,i}`, '-eta L_{t-1,i}', '-ηL_{t-1,i}', R`-\eta L_{t-1}`], tex: R`-\eta L_{t-1,i}` },
      c: { kind: 'word', ans: ['suivre le meneur', 'follow the leader', 'ftl', 'le meneur'], tex: 'suivre le meneur' },
      d: { kind: 'word', ans: ['uniforme', 'uniform', 'la loi uniforme'], tex: 'uniforme' },
    } },

  { id: 'ol10', ch: 6, type: 'calc', title: 'Un tour d\'exponential weighting', src: 'Slide p.21',
    text: CADRE + EW + R`Deux experts, $\eta = \ln2$, pertes cumulées $L_{t-1} = (0,\,2)$, donc $w_t(i) = e^{-\eta L_{t-1,i}}$.<br>
$w_t = (1,\ \blank{a})$, $p_t(1) = \blank{b}$. Si les pertes du tour sont $\ell_t = (1,0)$, la perte espérée $\sum_ip_t(i)\ell_t(i)$ vaut $\blank{c}$.`,
    blanks: { a: { kind: 'num', ans: 0.25, tol: 0.01 }, b: { kind: 'num', ans: 0.8, tol: 0.01 }, c: { kind: 'num', ans: 0.8, tol: 0.01 } },
    solution: R`$e^{-2\ln2} = \frac14$ ; $p_t = (\frac{1}{1.25},\frac{0.25}{1.25}) = (0.8,0.2)$.` },

  { id: 'ol11', ch: 6, type: 'deriv', title: 'Démo : la preuve par potentiel', src: 'Slide p.22 (preuve hors slides)', srcKind: 'extra',
    text: CADRE + EW + R`On note $L^\star = \min_iL_{T,i}$ et $\langle p_t,\ell_t\rangle = \sum_ip_t(i)\ell_t(i)$. Au départ $W_1 = \blank{a}$. À la fin, $W_{T+1} = \sum_ie^{-\eta L_{T,i}}\ge e^{-\eta L^\star}$ (un seul terme de la somme). Le rapport d'un tour au suivant est $\frac{W_{t+1}}{W_t} = \sum_ip_t(i)\,\blank{b}$. Le lemme de Hoeffding donne $\ln\frac{W_{t+1}}{W_t}\le-\eta\langle p_t,\ell_t\rangle+\blank{c}$. En sommant sur $t$ et en comparant les deux bornes de $\ln\frac{W_{T+1}}{W_1}$ : $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}\eta+\frac{\eta T}8$.`,
    blanks: {
      a: { kind: 'expr', ans: ['K'], tex: 'K' },
      b: { kind: 'expr', ans: [R`e^{-\eta\ell_t(i)}`, R`\exp(-\eta\ell_t(i))`, 'e^(-eta l_t(i))', R`e^{-\eta \ell_t(i)}`, 'exp(-eta*l_t(i))'], tex: R`e^{-\eta\ell_t(i)}` },
      c: { kind: 'expr', ans: [R`\frac{\eta^2}{8}`, 'eta^2/8', R`\eta^2/8`], tex: R`\frac{\eta^2}{8}` },
    } },

  { id: 'ol12', ch: 6, type: 'calc', title: 'Choisir η', src: 'Slide p.22',
    text: R`<b>Cadre.</b> L'exponential weighting garantit $\E[\mathrm{Reg}_T]\le\frac{\ln K}\eta+\frac{\eta T}8$, minimisé en $\eta^\star = \sqrt{8\ln K/T}$ où la borne vaut $\sqrt{T\ln K/2}$. Ici $K = 4$ experts, $T = 800$ tours.<br>
$\ln K\approx\blank{a}$, $\eta^\star\approx\blank{b}$, borne optimale $\approx\blank{c}$, borne de la slide $\sqrt{T\ln K}\approx\blank{d}$.`,
    blanks: { a: { kind: 'num', ans: 1.3863, tol: 0.01 }, b: { kind: 'num', ans: 0.1177, tol: 0.01 }, c: { kind: 'num', ans: 23.55, tol: 0.01 }, d: { kind: 'num', ans: 33.30, tol: 0.01 } } },

  { id: 'ol13', ch: 6, type: 'deriv', title: 'Démo : le lemme de Hoeffding', src: 'Hors slides (§6)', srcKind: 'extra',
    text: R`<b>Cadre.</b> $X$ est une variable aléatoire à valeurs dans $[0,1]$, de moyenne $\mu$. On veut $\ln\E[e^{sX}]\le s\mu+\frac{s^2}8$ pour tout $s\in\R$.<br>
Pour $x\in[0,1]$, l'exponentielle est sous sa corde : $e^{sx}\le(1-x)+x\,e^s$ (par [[a]]). En prenant l'espérance : $\E[e^{sX}]\le1-\mu+\mu e^s$. Soit $\psi(s) = \ln(1-\mu+\mu e^s)$ : $\psi(0) = 0$ et $\psi'(0) = \blank{b}$. Avec $q = \frac{\mu e^s}{1-\mu+\mu e^s}\in[0,1]$, on a $\psi'' = q(1-q)\le\blank{c}$. Taylor à l'ordre 2 donne $\psi(s)\le s\mu+\frac{s^2}{8}$.`,
    blanks: {
      a: { kind: 'word', ans: ['convexite', 'convexité', 'convexity', 'convexite de l exponentielle'], tex: 'convexité' },
      b: { kind: 'expr', ans: [R`\mu`, 'mu', 'μ'], tex: R`\mu` },
      c: { kind: 'num', ans: 0.25, tol: 0 },
    } },

  { id: 'ol14', ch: 6, type: 'deriv', title: 'Démo : regret statique contre regret dynamique', src: 'Slide p.10',
    text: CADRE + R`Le regret statique compare l'apprenant au meilleur expert fixe : $\min_{h\in\mathcal H}\sum_t\ell(y_t,h(x_t))$ ; le regret dynamique au meilleur choix tour par tour : $\min_{(h_1,\dots,h_T)\in\mathcal H^T}\sum_t\ell(y_t,h_t(x_t))$. Les suites constantes $(h,\dots,h)$ font partie de $\mathcal H^T$, donc le comparateur dynamique est $\le$ le statique, et $\mathrm{Reg}^{\text{dynamic}}_T\,\blank{a}\,\mathrm{Reg}^{\text{static}}_T$. Avec $\mathcal H = \{h_{-1},h_{+1}\}$ et la perte 0-1, un des deux experts a raison à chaque tour, donc $\sum_t\min_h\ell(y_t,h(x_t)) = \blank{b}$ : le regret dynamique est la perte totale de l'apprenant.`,
    blanks: {
      a: { kind: 'expr', ans: ['\\ge', '>=', '≥', '\\geq'], tex: R`\ge` },
      b: { kind: 'num', ans: 0, tol: 0 },
    } },
  );
})(window.ML);
