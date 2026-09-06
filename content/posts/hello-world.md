---
title: Bonjour tout le monde
date: 2026-09-06T00:00:00.000Z
excerpt: Le premier article de ce site, éditable depuis Sveltia CMS.
blocks:
  - type: image_text
    image: /images/sample/photo-1.svg
    body: >-
      Voici un bloc **Image + Texte**. Ce genre de bloc est composé dans
      l'admin Sveltia CMS (`/admin/index.html`) en choisissant "Ajouter un
      bloc" sur le champ "Blocs de contenu", puis en remplissant l'image et
      le texte — aucun code à toucher.
    imageOnRight: false
  - type: quote
    quote: Le contenu de la page est entièrement piloté par des blocs réordonnables.
    author: Sveltia CMS
  - type: gallery
    images:
      - image: /images/sample/photo-2.svg
        alt: Exemple de galerie 1
      - image: /images/sample/photo-3.svg
        alt: Exemple de galerie 2
---
Ceci est le contenu du premier article. Ouvre `/admin/index.html` pour l'éditer visuellement avec Sveltia CMS — aucun compte Tina Cloud, ni Sanity, ni aucun backend : le contenu est écrit directement dans ce dépôt Git via l'API GitHub.
