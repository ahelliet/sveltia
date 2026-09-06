# sveltia

Exemple de site SvelteKit édité avec **[Sveltia CMS](https://sveltiacms.app/en/)** — un CMS Git open source, sans base de données ni backend à héberger.

## Comment ça marche

- Le contenu (`content/posts/*.md`) est du Markdown normal, versionné dans ce dépôt Git.
- `/admin/index.html` charge Sveltia CMS (un simple fichier JS depuis un CDN) qui lit/écrit ces fichiers **directement via l'API GitHub, depuis le navigateur** — pas de serveur, pas de base de données, pas de fonction à déployer.
- Le site lui-même (`src/routes/blog/...`) lit ces fichiers Markdown au build (`src/lib/posts.ts`) et génère des pages 100% statiques (`@sveltejs/adapter-static`) — déployable n'importe où : Netlify, Cloudflare Pages, GitHub Pages, un simple serveur web.

C'est nettement plus simple que l'essai précédent avec TinaCMS self-hosted (qui demandait une fonction serverless, Auth.js et une base Redis) : ici, zéro infra à maintenir.

## Installation

```sh
pnpm install
pnpm dev
```

Le site est sur `http://localhost:5173`. `/admin/index.html` fonctionnera une fois le dépôt configuré (étape suivante) — en local, Sveltia CMS a aussi un « mode local » qui écrit directement sur le disque sans passer par GitHub, pratique pour tester sans rien configurer (bouton "Work with Local Repository" sur l'écran de connexion, à condition d'autoriser l'accès au dossier depuis le navigateur — Chrome/Edge uniquement).

## Configuration avant déploiement

Édite `static/admin/config.yml` :

```yaml
backend:
  name: github
  repo: TON-USER/TON-REPO   # <- à remplacer
  branch: main
```

### Authentification des éditeurs (deux options, gratuites)

1. **Token d'accès personnel GitHub** (par défaut, zéro config) : sur l'écran de connexion de l'admin, "Sign In with Token" — génère un fine-grained PAT avec accès "Contents: Read and write" sur ce repo. Suffisant seul ou à deux, mais chacun doit créer/gérer son propre token.
2. **OAuth via un worker Cloudflare** (mieux à plusieurs) : déploie le [worker officiel `sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) (tier gratuit Cloudflare largement suffisant), crée une OAuth App GitHub pointant vers `<URL_DU_WORKER>/callback`, puis décommente `base_url` dans `config.yml` avec l'URL du worker.

## Page builder (blocs de contenu)

Tout le contenu d'un article passe par le champ `blocks` (`widget: list` avec `types`), qui permet d'empiler des blocs réordonnables dans l'admin : **Texte** (markdown libre, pour remplacer un simple paragraphe), **Image**, **Image + Texte**, **Citation**, **Galerie**. Il n'y a volontairement pas de champ "Contenu" séparé : ça évite d'avoir deux endroits différents où écrire du texte. Chaque type est défini dans `static/admin/config.yml`, et rendu côté site par `src/lib/components/Blocks.svelte` à partir des données typées dans `src/lib/blocks.ts` (type `Block`, `parseBlocks()` — partagé entre articles et pages, voir plus bas).

Pour ajouter un nouveau type de bloc :

1. Ajoute une entrée dans `types: &blockTypes` du champ `blocks` de la collection "posts" (`static/admin/config.yml`), avec un `name` unique et ses `fields` — la collection "pages" réutilise cette même liste via l'ancre YAML `*blockTypes`, pas besoin de la dupliquer.
2. Ajoute le type TypeScript correspondant et son cas dans `parseBlocks()` (`src/lib/blocks.ts`).
3. Ajoute la branche `{:else if block.type === '...'}` dans `src/lib/components/Blocks.svelte`.

L'article `content/posts/hello-world.md` contient un exemple de chaque type pour voir le rendu tout de suite (`pnpm dev` puis `/blog/hello-world`).

## Pages (multipage)

En plus des articles, la collection **Pages** (`content/pages/*.md`) permet de créer autant de pages libres que nécessaire (À propos, Contact, mentions légales...) — chacune obtient automatiquement sa propre URL (`/<slug>`), sans toucher au code. Comme demandé, ce n'est **pas un formulaire à champs prédéfinis** : une page, c'est juste un titre + le même page builder par blocs que les articles (voir ci-dessus), donc aussi flexible qu'un article pour la mise en page.

- `static/admin/config.yml` : collection `pages`, champs `title` + `blocks` (types partagés avec "posts" via l'ancre YAML `&blockTypes`/`*blockTypes`) + `seo` (voir plus bas).
- `src/lib/pages.ts` : lit `content/pages/*.md` (même principe que `src/lib/posts.ts`), expose `getAllPages()`, `getPageBySlug()`.
- `src/lib/components/PageContent.svelte` : rendu d'une page (titre + blocs + `<title>`), utilisé par `/<slug>`.
- `src/routes/[slug]/+page.svelte` (+ `+page.server.ts`) : route générique qui affiche n'importe quelle page par son slug via `PageContent`, avec un `EntryGenerator` pour que `adapter-static` prérende chaque page créée dans le CMS.
- `static/admin/preview.js` : `CMS.registerPreviewTemplate('pages', ...)` réutilise le même rendu de blocs et le même header/footer que l'aperçu des articles.
- `content/pages/a-propos.md` : exemple de page pour voir le résultat tout de suite (`/a-propos`).

**Slugs réservés** : `blog` et `admin` sont déjà pris par des routes existantes (`/blog`, et `/admin` qui est servi comme fichier statique). Une page qui utiliserait un de ces slugs est filtrée par `getAllPages()` (avec un avertissement dans la console au build) plutôt que de produire un conflit silencieux.

**Page d'accueil** : `/` n'est **pas** une page de la collection "Pages" avec une case à cocher — c'est un singleton dédié, **« Page d'accueil »** dans le menu de l'admin (`content/home.md`, déclaré sous `singletons:` dans `config.yml`, à côté de "Navigation"/"Paramètres globaux"). Mêmes blocs (`&blockTypes`) et même bloc SEO (`&seoFields`) que "Pages", mais sans champ "Titre" : contrairement aux autres pages, l'accueil n'affiche pas de `<h1>` répétant son titre (un visiteur sait déjà qu'il est sur l'accueil) — `metaTitle` (SEO) retombe alors sur le nom du site plutôt que sur un titre de page. `src/lib/home.ts` lit `content/home.md` (même principe que `src/lib/pages.ts`, mais un seul fichier importé via `?raw` plutôt qu'un `import.meta.glob`), consommé par `src/routes/+page.server.ts`/`+page.svelte`. Sans bloc défini, l'accueil affiche un message minimal invitant à en ajouter (plus la description du site et un lien vers le blog). `static/admin/preview.js` a son propre `CMS.registerPreviewTemplate('home', ...)` pour la même raison (pas de `<h1>`).

Cette approche (un singleton séparé plutôt qu'un booléen `isHomePage` sur une page) a remplacé une première version du projet : elle évite qu'une page soit accessible à deux URLs à la fois (`/` et `/<son-slug>`), qu'il faille se souvenir de cocher/décocher la bonne page si l'accueil change, et qu'un titre de page redondant s'affiche sur l'accueil.

### Design system (Tailwind + shadcn-svelte)

Les blocs sont stylés avec [Tailwind CSS v4](https://tailwindcss.com/) et des composants [shadcn-svelte](https://www.shadcn-svelte.com/) (`AspectRatio`, `Card`, `Carousel`) plutôt que du CSS écrit à la main : accessibilité (focus, clavier, ARIA) gérée par les primitives [bits-ui](https://bits-ui.com/) sous-jacentes, thème centralisé dans `src/app.css` (variables de couleur, radius — modifiable via `pnpm dlx shadcn-svelte@latest init` ou en éditant les `--variables` directement), et de nouveaux composants ajoutables à la demande (`pnpm dlx shadcn-svelte@latest add <composant>`).

- `src/app.css` : import Tailwind, plugin `@tailwindcss/typography` (classes `prose`/`prose-invert` pour le HTML issu du markdown), variables de thème shadcn-svelte.
- `src/lib/components/ui/` : composants shadcn-svelte installés (copiés dans le repo, pas une dépendance figée — tu peux les modifier librement).
- `src/lib/components/Blocks.svelte` : utilise ces composants pour chaque type de bloc (`AspectRatio` pour les images, `Card`+`Carousel` pour la galerie, classes Tailwind pour Texte/Citation).

### Aperçu réaliste dans l'admin

Par défaut, l'aperçu de Sveltia CMS affiche les blocs de façon brute (markdown non rendu, pas de mise en page). `static/admin/preview.js` remplace cet aperçu par un rendu qui se rapproche de `src/lib/components/Blocks.svelte` (via `CMS.registerPreviewTemplate`, l'API de personnalisation de Sveltia CMS), stylé avec `static/admin/preview.css`. Comme sur le vrai site chaque page est entourée du header/footer (`+layout.svelte`), l'aperçu d'un article va chercher les données de "Navigation" et "Paramètres globaux" via `getCollection()` (l'API de Sveltia CMS pour lire une autre collection depuis un aperçu) et les affiche autour de l'article — sinon l'aperçu montrerait un article "nu" que le site ne produit jamais réellement. Comme l'admin n'a pas de build step, ce script utilise les globals `h()`/`createClass()` exposés par Sveltia CMS (pas de JSX) et charge `marked` par CDN pour rendre le markdown des blocs — c'est une **approximation** pour les blocs Image/Image+Texte (les composants shadcn-svelte `AspectRatio`/`Card` n'existent que dans l'app SvelteKit, donc leur effet visuel est reproduit avec les mêmes classes Tailwind sur des éléments simples). La galerie, elle, est un vrai carousel : `embla-carousel` (la même librairie qu'utilise `embla-carousel-svelte` sous le capot du composant `Carousel`) est chargé par CDN et initialisé sur le HTML rendu — drag, snap et boutons prev/next fonctionnent réellement, pas juste visuellement.

**`static/admin/preview.css` n'est pas écrit à la main : c'est un fichier généré**, compilé par le CLI Tailwind à partir de `static/admin/preview.tw.css` (qui réimporte `src/app.css`, donc récupère exactement les mêmes variables de couleur/thème que le site) :

```sh
pnpm run build:admin-css
```

Cette commande tourne automatiquement avant `pnpm dev` et avant `pnpm build` (hooks npm `predev`/`prebuild` dans `package.json`) — donc l'aperçu admin ne peut pas devenir obsolète, que ce soit en local ou lors d'un build de déploiement (Netlify, Cloudflare Pages, une Action GitHub Pages : tous appellent `pnpm run build` à un moment). Pas besoin de CI dédiée ni d'étape manuelle avant de pousser.

Si tu ajoutes un nouveau type de bloc ou changes le style dans `Blocks.svelte`, répercute le changement dans `preview.js` (le rendu ne partage pas de code avec l'app SvelteKit) — la partie couleurs/thème, elle, se met à jour toute seule au prochain `pnpm dev`/`pnpm build` puisqu'elle vient directement de `src/app.css`.

`src/app.css` importe aussi la police `@fontsource-variable/inter`, dont les fichiers `.woff2` sont référencés en chemin relatif (`url(./files/...)`). Ça fonctionne tout seul dans l'app SvelteKit (Vite réécrit ces chemins et copie les fichiers), mais pas dans `static/admin/` qui n'a pas de bundler — d'où un 404 sur `/admin/files/inter-*.woff2` si on se contente de compiler le CSS. `pnpm run build:admin-css` copie donc aussi ces fichiers de police dans `static/admin/files/` (`scripts/copy-admin-fonts.mjs`, appelé automatiquement après la compilation Tailwind) ; ce dossier est généré (`.gitignore`), pas commité.

## Navigation et paramètres globaux

Deux entrées supplémentaires dans le menu de l'admin, pour le contenu qui n'est pas un article :

- **Navigation** (`content/navigation.json`) — liens du menu, texte et liens du pied de page.
- **Paramètres globaux** (`content/settings.json`) — nom/description du site, favicon, image de partage par défaut, email de contact, et un bloc **Référencement (SEO & GEO)** (voir section dédiée plus bas).

Ce sont des **singletons** Sveltia CMS (`singletons:` au niveau racine de `config.yml`, plutôt que des collections) : un seul document éditable, sans liste ni écran intermédiaire — cliquer sur "Navigation" ou "Paramètres globaux" dans le menu de gauche ouvre directement le formulaire. C'était avant des collections de type `files:` (qui affichaient un sélecteur listant "le" seul fichier disponible avant d'arriver au formulaire, une étape sans intérêt pour un document unique) ; converties en singletons pour supprimer cette étape (voir [la doc Sveltia CMS](https://sveltiacms.app/en/docs/collections/singletons)). Les champs actuels sont un point de départ volontairement minimal — à étoffer selon les besoins réels (ajoute simplement des `fields` dans `static/admin/config.yml`, comme pour n'importe quelle collection).

Ces fichiers sont lus par `src/lib/site.ts` (même principe que `src/lib/posts.ts`, mais avec un simple `import` de fichier `.json` — Vite le résout directement en objet, pas besoin de parsing) et utilisés par :

- `src/lib/components/Navigation.svelte` — barre du haut, sticky, avec le nom du site (lien vers l'accueil) et les liens de `navLinks`.
- `src/lib/components/Footer.svelte` — pied de page avec `footerText` et `footerLinks`.
- `src/routes/+layout.svelte` — favicon (`settings.favicon`, avec repli sur `src/lib/assets/favicon.svg` si aucun n'est défini dans le CMS).
- `src/routes/+page.svelte` — utilise `siteName`/`siteDescription` pour l'accueil et le `<title>`.

Les deux (`Navigation`/`Footer`) sont montés dans `src/routes/+layout.svelte`, donc présents sur toutes les pages. Si tu ajoutes des champs dans `config.yml`, pense à les répercuter dans `src/lib/site.ts` (les types `Navigation`/`Settings`) et dans le composant qui doit les afficher.

**Liens de navigation, un sélecteur par type de lien** : chaque lien (`navLinks`/`footerLinks`) est un widget `list` avec `types:` — même mécanisme que le page builder (voir `&blockTypes` plus haut) — plutôt qu'un unique champ "type de lien" suivi de plusieurs champs optionnels tous visibles en même temps quel que soit le choix. En ajoutant un lien, l'éditeur choisit d'abord son type — **Page du site**, **Article de blog**, **Ancre sur cette page**, **URL personnalisée**, ou (menu du haut uniquement, voir plus bas) **Sous-menu (dropdown)** — et seuls les champs utiles à ce type-là s'affichent ensuite. Les 4 premiers types sont ancrés individuellement dans `config.yml` (`&navLinkTypePage`, `&navLinkTypePost`, `&navLinkTypeAnchor`, `&navLinkTypeUrl`, au lieu d'une seule liste `&navLinkTypes` comme avant) : une liste YAML ne pouvant pas s'auto-référencer, c'est ce qui permet au type "dropdown" de réutiliser ces 4 types pour son propre sous-menu, tout en étant lui-même réutilisé (avec les 4 autres) par `navLinks` — `footerLinks` réutilise uniquement les 4 types simples, sans "dropdown" (voir ci-dessous).

Pour "Page" ou "Article de blog", un widget `relation` Sveltia CMS (`collection: "pages"` ou `"posts"`, `value_field: "{{slug}}"`) permet de choisir l'entrée directement dans une liste plutôt que de taper une URL à la main — si cette page/cet article est renommé, le lien reste correct puisqu'il pointe vers l'entrée elle-même, pas vers une chaîne figée. `dropdown_threshold: 0` force ce widget à toujours s'afficher en menu déroulant avec recherche : par défaut, Sveltia CMS affiche des boutons radio tant qu'il y a moins de 5 entrées dans la collection ciblée (ce qui, avec une ou deux pages seulement, ressemble à des cases à cocher). Ces deux types ont aussi un champ **Ancre** optionnel, pour cibler une section précise de la page/l'article visé (ex : `contact`, sans le `#`). Le type **Ancre sur cette page** couvre un lien qui reste sur la page en cours (pratique pour un menu à une seule page) ; **URL personnalisée** couvre tout le reste (lien externe, `/blog`, `/`, ou une ancre tapée à la main).

**Sous-menus (`type: "dropdown"`)** : disponible uniquement dans `navLinks` (pas `footerLinks` — un sous-menu déroulant n'a pas vraiment sa place en pied de page). Un lien "dropdown" a un **Libellé** et une liste **Liens du sous-menu** (`links`), elle-même un widget `list` avec `types:` limité aux 4 types simples — pas de "dropdown" imbriqué, pas de sous-sous-menu. Rendu par `src/lib/components/Navigation.svelte` avec `src/lib/components/ui/dropdown-menu/` (composants écrits à la main sur les primitives `bits-ui`, dans le même style que les autres composants `ui/` générés par le CLI shadcn-svelte — non exécutable dans cet environnement) : un `DropdownMenu.Trigger` affiche le libellé + un chevron, `DropdownMenu.Content` liste les sous-liens en vrais `<a href="...">` (via le snippet `child`, pour garder les comportements natifs d'un lien : ouverture dans un nouvel onglet, etc.). Dans `static/admin/preview.js`, l'aperçu n'a pas accès au runtime Svelte/bits-ui : le sous-menu y est approximé avec un `<details>`/`<summary>` natif (`renderNavLink()`) plutôt qu'un vrai popover — comportement équivalent (clic pour afficher/masquer), rendu pas pixel-identique.

`src/lib/site.ts` (`resolveLinkHref()`) transforme un lien en URL réelle selon son `type` : `/<slug>[#ancre]`, `/blog/<slug>[#ancre]`, `#ancre`, l'URL libre telle quelle, ou `#` pour un "dropdown" (qui n'a pas de destination propre — seuls ses `links` en ont une). Mirroré dans `static/admin/preview.js` pour que l'aperçu de "Navigation" corresponde exactement au rendu réel. `content/navigation.json` a été migré vers ce nouveau format (`type` remplace l'ancien champ plat `linkType`).

**Aperçu de "Navigation"** : `preview.js` a aussi un `CMS.registerPreviewTemplate('navigation', ...)` qui affiche le même header/footer (mêmes classes Tailwind que `Navigation.svelte`/`Footer.svelte`) avec les liens/le texte en cours d'édition dans cette entrée, plus le vrai nom du site (récupéré via `getCollection('settings')`, comme pour l'aperçu des articles).

**Pas d'aperçu pour "Paramètres globaux"** : `editor: { preview: false }` sur ce singleton désactive le panneau d'aperçu — ce ne sont que des données informatives (nom du site, email...), sans rendu visuel propre à prévisualiser. Ce réglage n'a fonctionné correctement sur un *singleton* (par opposition à une collection) que dans les versions récentes de Sveltia CMS ([issue #505](https://github.com/sveltia/sveltia-cms/issues/505), corrigée) — ce projet chargeant toujours la dernière version via unpkg (`static/admin/index.html`), ça devrait être déjà bon ; si un panneau d'aperçu vide réapparaît un jour, c'est le premier endroit à vérifier.

## Référencement (SEO & GEO)

- **Paramètres globaux → Référencement (SEO & GEO)** (`static/admin/config.yml`, objet `seo` dans la collection `settings`, parsé par `src/lib/site.ts`) : `siteUrl` (URL de prod, nécessaire pour des URLs absolues — **à renseigner avant de déployer**, sinon le sitemap/flux RSS contiennent des URLs invalides), `titleTemplate`, `locale`, `robotsIndexing` (interrupteur global d'indexation), `twitterHandle`/`twitterCardType`, `organizationName`/`organizationLogo` et `sameAs` (réseaux sociaux) pour les données structurées schema.org, `googleSiteVerification`.
- **Chaque page** (collection `pages`) et **chaque article** (collection `posts`) ont un objet `seo` identique (même champs, réutilisés via l'ancre YAML `&seoFields`/`*seoFields`) : `metaTitle`, `metaDescription`, `ogImage`, `noIndex`. Si `metaTitle` est vide, le `<title>` retombe sur le titre de l'entrée (`src/lib/seo.ts`, `parseSeo()`, partagé par `posts.ts`/`pages.ts`).

**SEO vs GEO** : le SEO classique (balises meta, Open Graph, sitemap...) cible les moteurs de recherche traditionnels. Le **GEO (Generative Engine Optimization)** est plus récent et cible les moteurs de réponse basés sur l'IA (résumés, citations dans une réponse générée) — il s'appuie surtout sur des données structurées claires (schema.org `Organization`/`WebSite`, d'où `organizationName`/`sameAs`) et un contenu bien balisé sémantiquement, ce que le page builder (titres, citations, texte en Markdown) fournit déjà côté contenu.

**Reste à câbler** (prochaine étape) : les balises `<meta>` Open Graph/Twitter et les données structurées JSON-LD ne sont pas encore générées dans le `<svelte:head>` des pages — seul le `<title>` (avec surcharge par `metaTitle`) est en place pour l'instant. `metaDescription`/`ogImage`/`noIndex`/`organizationName`/`sameAs` existent déjà côté CMS et types (`Seo`/`SiteSeo`), prêts à être branchés.

## Réglages admin et bonnes pratiques CMS

Quelques réglages de confort/hygiène côté `static/admin/config.yml`, indépendants des fonctionnalités ci-dessus :

- **Interface en français** (`locale: "fr"`, en haut du fichier) : les libellés propres à Sveltia CMS (boutons, menus...) s'affichent en français plutôt qu'en anglais — les champs eux-mêmes sont déjà tous en français puisque c'est nous qui les avons nommés.
- **Slugs sans accents** (`slug: { encoding: "ascii", clean_accents: true }`, top-level) : un titre comme "Bilan à mi-année" donne un slug propre (`bilan-a-mi-annee`) plutôt que des caractères non-ASCII dans l'URL.
- **Lien "Voir le site"** (`site_url`, en commentaire en haut du fichier) : à décommenter une fois le site déployé (même URL que "Paramètres globaux → Référencement → URL du site") — ajoute un lien "Voir le site" dans l'admin.
- **Logo personnalisé de l'admin** (`logo:` — `src`/`show_in_header` —, top-level ; l'ancien `logo_url` est déprécié) : remplace l'icône par défaut de Sveltia CMS dans l'en-tête de l'admin, dès le chargement du CMS. Pointe pour l'instant vers `static/images/logo.svg`, une copie du logo Svelte utilisé comme placeholder (même fichier que `src/lib/assets/favicon.svg`) — remplace ce fichier par ton propre logo (SVG ou PNG) quand tu en as un, pas besoin de retoucher `config.yml`.
- **Titre de l'admin** (`app_title`, affiché à côté du logo ci-dessus, sur l'écran de connexion et dans l'onglet du navigateur — "Sveltia CMS" par défaut) : contrairement aux autres réglages ci-dessus, il n'est pas fixé dans `config.yml` mais calculé dynamiquement au chargement, à partir du **nom du site** dans Paramètres globaux (`siteName`) — vide, il retombe sur "Sveltia CMS". Le mécanisme : `static/admin/index.html` pose `window.CMS_MANUAL_INIT = true` pour empêcher la CMS de s'initialiser toute seule ; `static/admin/preview.js` va chercher `site-meta.json` (généré par `src/routes/admin/site-meta.json/+server.ts`, prérendu comme `sitemap.xml`/`robots.txt`/`rss.xml`) puis appelle lui-même `CMS.init()`, avec `{ config: { app_title } }` si un nom de site est disponible — ce config partiel est fusionné avec `config.yml`, chargé automatiquement comme avant.
- **Listes triables et plus lisibles** : `summary`/`sortable_fields` sur `posts` (tri par titre/date, résumé "Titre — Date" dans la liste) et `pages` — sans ça, l'admin n'affiche que le nom du fichier.
- **Médias rangés par collection** (`media_folder`/`public_folder` par collection, ex : `{{media_folder}}/posts`) : les images uploadées depuis un article vont dans `static/images/uploads/posts/`, celles d'une page dans `.../pages/`, plutôt que tout mélangé dans un seul dossier — ça reste `static/images/uploads/` (racine) pour les images des paramètres globaux (favicon, image par défaut, logo d'organisation).
- **Texte alternatif de l'image principale des articles** (`heroImageAlt`, collection `posts`) : jusqu'ici l'attribut `alt` retombait toujours sur le titre de l'article, ce qui n'est pas toujours une bonne description de l'image pour un lecteur d'écran. Champ optionnel, avec ce même repli si vide.
- **Validation de champs** : `pattern` (regex + message d'erreur affiché dans l'admin) sur l'email de contact (format email), et sur `metaTitle`/`metaDescription`/`siteDescription`/`excerpt` (60/155/155/200 caractères — au-delà, Google tronque le titre/la description dans les résultats de recherche, et `excerpt` sert d'accroche dans la liste des articles).
- **Date pré-remplie** (`default: "{{now}}"` sur le champ `date` des articles) — plus besoin de la ressaisir à chaque nouvel article.
- **Bug corrigé : alt manquant sur le bloc "Image + Texte"** — ce bloc avait un champ image mais aucun champ "texte alternatif" (`alt` mis à `""` en dur dans `Blocks.svelte`), contrairement aux blocs Image et Galerie. Champ ajouté dans `config.yml`, `src/lib/blocks.ts` (`ImageTextBlock`) et `Blocks.svelte`.
- **Chargement paresseux des images** (`loading="lazy"`) sur les blocs Image/Image+Texte/Galerie dans `Blocks.svelte` — ce contenu est généralement sous la ligne de flottaison. L'image principale (`heroImage`) reste en chargement normal puisqu'elle s'affiche immédiatement. Répercuté dans `preview.js` pour la parité aperçu/site.
- **Fichiers uploadés normalisés et plafonnés** (`media_library.config.slugify_filename`/`max_file_size`) : les images uploadées depuis l'admin sont renommées sans accents/espaces (même logique que les slugs d'articles/pages), et limitées à 5 Mo — ce site n'a pas de pipeline d'optimisation d'image côté CMS, donc autant éviter qu'un gros fichier non compressé se retrouve publié tel quel.
- **Lien "Voir en ligne" depuis une entrée** (`preview_path` sur `posts`/`pages`) : un lien direct vers l'URL réelle de l'article/de la page, visible dans l'admin en train d'éditer. Fonctionne même sans "URL du site" renseignée dans Paramètres globaux — Sveltia CMS retombe sur l'origine courante (`localhost:...` en dev, le vrai domaine une fois déployé).

## Sitemap, robots.txt et flux RSS

Trois routes SvelteKit générées en fichiers statiques au build (même principe que le reste du site : `export const prerender = true`, et un segment de route avec un point — `sitemap.xml`, `robots.txt` — est traité comme un fichier, pas un dossier) :

- `src/routes/sitemap.xml/+server.ts` — liste `/`, `/blog`, toutes les pages (`getAllPages()`) et tous les articles (`getAllPosts()`), en URLs absolues via `settings.seo.siteUrl`.
- `src/routes/robots.txt/+server.ts` — `Allow: /` ou `Disallow: /` selon `settings.seo.robotsIndexing`, plus une ligne `Sitemap:` si `siteUrl` est renseigné.
- `src/routes/rss.xml/+server.ts` — flux RSS 2.0 des articles (titre, lien, date, résumé), pour la distribution de contenu et certains agrégateurs SEO.

Les trois dépendent de `settings.seo.siteUrl` pour produire des URLs absolues correctes — un avertissement s'affiche dans la console au build tant qu'il est vide.

## Page d'erreur (404)

Le site est 100 % statique (pas de serveur applicatif) : une erreur **500** n'a donc pas vraiment de sens ici, elle ne peut venir que de l'hébergeur. Seule la **404** compte, et `adapter-static` en a besoin d'une explicite pour les URLs inconnues sur un hébergeur statique. `src/routes/+error.svelte` remplace la page d'erreur générique de SvelteKit par une page au design du site (elle hérite automatiquement du header/footer, puisqu'elle est rendue à l'intérieur de `+layout.svelte` comme n'importe quelle page) — utilisée à la fois pour les `error(404, ...)` levées dans `blog/[slug]` et `[slug]` (page/article introuvable), et pour le `404.html` que SvelteKit écrit au build pour les URLs qui ne correspondent à aucune route.

## Déploiement

Fonctionne sur n'importe quel hébergeur statique. Exemple Netlify :

```toml
[build]
  command = "pnpm run build"
  publish = "build"
```

Aucune variable d'environnement, aucune fonction serverless nécessaire.

## Commandes

| Commande | Effet |
| --- | --- |
| `pnpm dev` | Site en local (régénère `static/admin/preview.css` avant de démarrer) |
| `pnpm build` | Build statique complet (`build/`), régénère `static/admin/preview.css` avant |
| `pnpm build:admin-css` | Recompile `static/admin/preview.css` depuis `preview.tw.css` + copie les polices dans `static/admin/files/` |
| `pnpm preview` | Aperçu du build |
| `pnpm check` | Vérification TypeScript/Svelte |
| `pnpm dlx shadcn-svelte@latest add <composant>` | Ajoute un nouveau composant shadcn-svelte dans `src/lib/components/ui/` |
