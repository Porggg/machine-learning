/* Exercices — Chapitre 6 : apprentissage en ligne (regret, exponential weighting) */
(function (ML) {
  'use strict';
  const R = String.raw;

  ML.EX.add(
  { id: 'ol1', ch: 6, type: 'def', title: 'Le regret', src: 'Slide p.7',
    text: R`$\mathrm{Reg}_T := \sum_{t=1}^T\ell\big(y_t,h_t(x_t)\big)-\blank{a}\sum_{t=1}^T\ell\big(y_t,h(x_t)\big)$. Le comparateur est le meilleur expert [[b]] (choisi après avoir vu les $T$ tours), et il est [[c]] pour tous les tours.`,
    blanks: {
      a: { kind: 'expr', ans: [R`\min_{h\in\mathcal H}`, R`\min_{h \in H}`, 'min_h', 'min_{h in H}', 'min'], tex: R`\min_{h\in\mathcal H}` },
      b: { kind: 'word', ans: ['a posteriori', 'in hindsight', 'apres coup'], tex: 'a posteriori' },
      c: { kind: 'word', ans: ['fixe', 'le meme', 'constant', 'fixed'], tex: 'fixe' },
    },
    solution: R`C'est le regret <b>statique</b> ; le regret dynamique autorise une suite $(h_1,\dots,h_T)\in\mathcal H^T$.` },

  { id: 'ol2', ch: 6, type: 'calc', title: 'Calculer un regret', src: 'Slides p.5–7',
    text: R`Sur $T = 100$ tours, l'apprenant fait 31 erreurs ; les trois experts en font 27, 35 et 52. Le regret vaut $\blank{a}$, et le regret moyen par tour $\blank{b}$.`,
    blanks: { a: { kind: 'num', ans: 4, tol: 0 }, b: { kind: 'num', ans: 0.04, tol: 0.01 } },
    solution: R`$\mathrm{Reg}_{100} = 31-\min(27,35,52) = 4$, soit $0.04$ par tour.` },

  { id: 'ol3', ch: 6, type: 'deriv', title: 'Le résultat négatif', src: 'Slides p.11–12',
    text: R`L'adversaire joue $y_t = -\hat y_t$ : l'apprenant déterministe perd $\blank{a}$. Avec $\mathcal H = \{h_{-1},h_{+1}\}$, à chaque tour exactement un expert a raison, donc $L(h_{-1})+L(h_{+1}) = \blank{b}$ et $\min_hL(h)\le\blank{c}$. D'où $\mathrm{Reg}_T\ge\blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['T'], tex: 'T' },
      b: { kind: 'expr', ans: ['T'], tex: 'T' },
      c: { kind: 'expr', ans: ['T/2', R`\frac{T}{2}`, R`\frac T2`, '0.5T'], tex: R`T/2` },
      d: { kind: 'expr', ans: ['T/2', R`\frac{T}{2}`, R`\frac T2`, '0.5T'], tex: R`T/2` },
    },
    solution: R`Deux nombres de somme $T$ ne peuvent pas être tous deux $>T/2$.` },

  { id: 'ol4', ch: 6, type: 'calc', title: 'Regret sous-linéaire', src: 'Slide p.9',
    text: R`Un algorithme a $\mathrm{Reg}_T\le3\sqrt T$. Pour $T = 10\,000$, le regret par tour est au plus $\blank{a}$. Pour diviser cette borne par 10, il faut multiplier $T$ par $\blank{b}$.`,
    blanks: { a: { kind: 'num', ans: 0.03, tol: 0.01 }, b: { kind: 'num', ans: 100, tol: 0 } },
    solution: R`$\mathrm{Reg}_T/T\le3/\sqrt T = 3/100$ ; c'est en $1/\sqrt T$, donc $T\to100\,T$ divise par 10.` },

  { id: 'ol5', ch: 6, type: 'def', title: 'Pourquoi « non anticipant »', src: 'Slides p.8, 13',
    text: R`L'adversaire peut connaître l'algorithme, le passé et la loi $p_t$, mais doit choisir $y_t$ [[a]] de voir la prédiction. S'il voyait $\hat y_t$, il jouerait $y_t\ne\hat y_t$ et la [[b]] ne servirait à rien.`,
    blanks: {
      a: { kind: 'word', ans: ['avant', 'before'], tex: 'avant' },
      b: { kind: 'word', ans: ['randomisation', 'randomization', 'aleatoire', 'le hasard'], tex: 'randomisation' },
    } },

  { id: 'ol6', ch: 6, type: 'calc', title: 'La borne de Weighted Majority', src: 'Hors slides (§4)', srcKind: 'extra',
    text: R`Avec $\beta = \frac12$, $K = 8$ experts et un meilleur expert à $m^\star = 10$ erreurs, $M\le\frac{\ln K+m^\star\ln(1/\beta)}{\ln(2/(1+\beta))}\approx\blank{a}$. Après une erreur de WM, le poids total est multiplié par au plus $\blank{b}$.`,
    blanks: { a: { kind: 'num', ans: 31.32, tol: 0.01 }, b: { kind: 'num', ans: 0.75, tol: 0.01 } },
    solution: R`$(\ln8+10\ln2)/\ln(4/3) = 9.011/0.2877\approx31.3$ ; facteur $(1+\beta)/2 = 3/4$.` },

  { id: 'ol7', ch: 6, type: 'def', title: 'De RWM à l\'exponential weighting', src: 'Slide p.19',
    text: R`Avec $\beta := \blank{a}$ et la perte 0-1, la mise à jour de RWM s'écrit $w_{t+1}(i) = w_t(i)\,(1-\eta)^{\ell}$. Pour $\eta$ petit, $(1-\eta)^{\ell}\approx\blank{b}$, et on a toujours $1-\eta\le e^{\blank{c}}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['1-\\eta', '1-eta', '1 - η'], tex: R`1-\eta` },
      b: { kind: 'expr', ans: [R`e^{-\eta\ell}`, R`\exp(-\eta\ell)`, 'e^(-eta l)', 'exp(-eta*l)', R`e^{-\eta \ell}`], tex: R`e^{-\eta\ell}` },
      c: { kind: 'expr', ans: ['-\\eta', '-eta', '−η'], tex: R`-\eta` },
    },
    solution: R`Concavité : $\ln(1+u)\le u$ avec $u = -\eta$.` },

  { id: 'ol8', ch: 6, type: 'calc', title: 'Encadrer $\\ln(1-\\eta)$', src: 'Hors slides (§5)', srcKind: 'extra',
    text: R`Pour $\eta = 0.5$ : $\ln(1-\eta)\approx\blank{a}$, $-\eta = -0.5$ et $-\eta-\eta^2 = \blank{b}$. L'encadrement $-\eta-\eta^2\le\ln(1-\eta)\le-\eta$ est vérifié.`,
    blanks: { a: { kind: 'num', ans: -0.6931, tol: 0.01 }, b: { kind: 'num', ans: -0.75, tol: 0.01 } } },

  { id: 'ol9', ch: 6, type: 'def', title: 'Forme close des poids', src: 'Slide p.21 (forme close hors slides)', srcKind: 'extra',
    text: R`Avec $w_1(i) = 1$ et $w_{t+1}(i) = w_t(i)e^{-\eta\ell_t(i)}$, on a $w_{t+1}(i) = \blank{a}$ où $L_{t,i} = \sum_{s\le t}\ell_s(i)$. Donc $p_t = \mathrm{softmax}(-\eta L_{t-1})$ : quand $\eta\to\infty$, c'est [[b]] ; quand $\eta\to0$, $p_t$ devient [[c]].`,
    blanks: {
      a: { kind: 'expr', ans: [R`e^{-\eta L_{t,i}}`, R`\exp(-\eta L_{t,i})`, 'exp(-eta L_{t,i})', 'e^(-eta L)', R`e^{-\eta L}`], tex: R`e^{-\eta L_{t,i}}` },
      b: { kind: 'word', ans: ['suivre le meneur', 'follow the leader', 'ftl', 'le meneur'], tex: 'suivre le meneur' },
      c: { kind: 'word', ans: ['uniforme', 'uniform', 'la loi uniforme'], tex: 'uniforme' },
    } },

  { id: 'ol10', ch: 6, type: 'calc', title: 'Un tour d\'exponential weighting', src: 'Slide p.21',
    text: R`Deux experts, $\eta = \ln2$, pertes cumulées $L_{t-1} = (0,\,2)$. Alors $w_t = (1,\ \blank{a})$ et $p_t(1) = \blank{b}$. Si au tour $t$ les pertes sont $\ell_t = (1,0)$, la perte espérée de l'apprenant vaut $\blank{c}$.`,
    blanks: { a: { kind: 'num', ans: 0.25, tol: 0.01 }, b: { kind: 'num', ans: 0.8, tol: 0.01 }, c: { kind: 'num', ans: 0.8, tol: 0.01 } },
    solution: R`$e^{-2\ln2} = \frac14$ ; $p_t = (\frac{1}{1.25},\frac{0.25}{1.25}) = (0.8,0.2)$ ; $\langle p_t,\ell_t\rangle = 0.8$.` },

  { id: 'ol11', ch: 6, type: 'deriv', title: 'La preuve par potentiel', src: 'Slide p.22 (preuve hors slides)', srcKind: 'extra',
    text: R`$W_1 = \blank{a}$ et $W_{T+1}\ge e^{-\eta L^\star}$. Le rapport $\frac{W_{t+1}}{W_t} = \sum_ip_t(i)\,\blank{b}$. Hoeffding donne $\ln\frac{W_{t+1}}{W_t}\le-\eta\langle p_t,\ell_t\rangle+\blank{c}$, d'où $\sum_t\langle p_t,\ell_t\rangle-L^\star\le\frac{\ln K}{\eta}+\blank{d}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['K'], tex: 'K' },
      b: { kind: 'expr', ans: [R`e^{-\eta\ell_t(i)}`, R`\exp(-\eta\ell_t(i))`, 'e^(-eta l_t(i))', R`e^{-\eta \ell_t(i)}`, 'exp(-eta*l_t(i))'], tex: R`e^{-\eta\ell_t(i)}` },
      c: { kind: 'expr', ans: [R`\frac{\eta^2}{8}`, 'eta^2/8', R`\eta^2/8`], tex: R`\frac{\eta^2}{8}` },
      d: { kind: 'expr', ans: [R`\frac{\eta T}{8}`, 'eta T/8', R`\eta T/8`, 'T eta/8'], tex: R`\frac{\eta T}{8}` },
    } },

  { id: 'ol12', ch: 6, type: 'calc', title: 'Choisir η', src: 'Slide p.22',
    text: R`$K = 4$ experts, $T = 800$ tours. $\eta^\star = \sqrt{8\ln K/T}\approx\blank{a}$, la borne $\frac{\ln K}{\eta^\star}+\frac{\eta^\star T}8 = \sqrt{T\ln K/2}\approx\blank{b}$, et la borne de la slide $\sqrt{T\ln K}\approx\blank{c}$.`,
    blanks: { a: { kind: 'num', ans: 0.1177, tol: 0.01 }, b: { kind: 'num', ans: 23.55, tol: 0.01 }, c: { kind: 'num', ans: 33.30, tol: 0.01 } },
    solution: R`$\ln4 = 1.386$ ; $\sqrt{8\cdot1.386/800} = 0.118$ ; $\sqrt{800\cdot1.386/2} = 23.5$ ; $\sqrt{800\cdot1.386} = 33.3$.` },

  { id: 'ol13', ch: 6, type: 'deriv', title: 'Le lemme de Hoeffding', src: 'Hors slides (§6)', srcKind: 'extra',
    text: R`Pour $X\in[0,1]$ de moyenne $\mu$ : $\E[e^{sX}]\le1-\mu+\mu e^s$ par [[a]]. Avec $\psi(s) = \ln(1-\mu+\mu e^s)$ : $\psi(0) = 0$, $\psi'(0) = \blank{b}$ et $\psi''\le\blank{c}$, d'où $\psi(s)\le s\mu+\frac{s^2}{8}$.`,
    blanks: {
      a: { kind: 'word', ans: ['convexite', 'convexité', 'convexity', 'convexite de l exponentielle'], tex: 'convexité' },
      b: { kind: 'expr', ans: [R`\mu`, 'mu', 'μ'], tex: R`\mu` },
      c: { kind: 'num', ans: 0.25, tol: 0 },
    },
    solution: R`$\psi'' = q(1-q)$ avec $q\in[0,1]$, maximum $\frac14$ en $q = \frac12$.` },

  { id: 'ol14', ch: 6, type: 'def', title: 'Regret statique et dynamique', src: 'Slide p.10',
    text: R`Le comparateur dynamique minimise sur $\mathcal H^T$, qui contient les suites constantes, donc $\mathrm{Reg}^{\text{dynamic}}_T\,\blank{a}\,\mathrm{Reg}^{\text{static}}_T$. Avec $\mathcal H = \{h_{-1},h_{+1}\}$ et la perte 0-1, $\sum_t\min_h\ell(y_t,h(x_t)) = \blank{b}$.`,
    blanks: {
      a: { kind: 'expr', ans: ['\\ge', '>=', '≥', '\\geq'], tex: R`\ge` },
      b: { kind: 'num', ans: 0, tol: 0 },
    },
    solution: R`À chaque tour l'un des deux experts a raison : le comparateur dynamique ne se trompe jamais.` },
  );
})(window.ML);
