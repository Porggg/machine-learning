# Cours interactif — ML (CSED/AIGS 515)

Ouvrir `index.html` (double-clic, aucun serveur nécessaire, fonctionne hors-ligne).

## Structure
- `index.html` — accueil (chapitres + planning avec liens vers les PDF de `../Textbooks`).
- `linear-regression.html`, `logistic-regression.html`, `svm.html`, `model-selection.html` — chapitres 1–4 (texte, blocs « Les objets en jeu », preuves repliables, emplacements `<div data-scene="…">`).
- `homework.html` — devoirs maison (énoncés, indices, corrigés, expériences du HW1 dans `js/homework/hw1.js`). Pour un nouveau devoir : ajouter une section `<h2 id="hwN">` et un fichier `js/homework/hwN.js`.
- `exercises.html` — entraînement à trous ; exercices dans `js/exercises/data-ch*.js` (format documenté en tête de `engine.js`).
- `js/core/` — le moteur :
  - `math.js` : algèbre linéaire (QR, Jacobi, ridge, lasso), logistique (Newton/IRLS), SVM (SMO + noyaux), RNG à graine, couleurs.
  - `plot2d.js` : rendu 2D (grille manim, courbes, contours, heatmaps, poignées, LaTeX en surcouche).
  - `scene3d.js` : rendu 3D Three.js (contexte WebGL partagé, caméra orbitale, surfaces, flèches, labels).
  - `ui.js` : cadres de widgets, sliders, lecteur pas-à-pas, preuves « pas à pas », sommaire.
- `js/linreg/`, `js/logreg/`, `js/svm/`, `js/modelsel/` — une scène = `ML.scene('id', host => { … })`.
- `lib/` — KaTeX et Three.js r158 en local.

## Ajouter un chapitre
1. Copier `linear-regression.html`, changer le texte et la liste des `<script>` de scènes.
2. Créer `js/<chapitre>/*.js` avec des `ML.scene('…', host => …)`.
3. Ajouter le lien dans la barre du haut et une carte dans `index.html`.

Badges de source : `src slides` (slides), `src book` (PRML/DL, lien `#page=` = page du livre + 20), `src extra` (hors slides), `src hw` (devoirs).

## Mise en ligne (GitHub Pages)
Le dépôt est publié tel quel sur GitHub Pages (branche `main`, racine). Différences avec la version locale :
- la page **Devoirs** (`homework.html`, `homework/`, `js/homework/`) n'est **pas** versionnée (voir `.gitignore`) : elle reste sur le Mac ;
- en ligne, `js/core/ui.js` masque les éléments `.local-only` (liens Devoirs, corrigés de devoirs) et désactive les liens vers les PDF du cours (`../Slides`, `../Textbooks`, `../Homework`), qui ne sont pas publiés. Ajouter `?online=1` à l'URL pour tester ce mode en local.
