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

Tout le contenu d'un article passe par le champ `blocks` (`widget: list` avec `types`), qui permet d'empiler des blocs réordonnables dans l'admin : **Texte** (markdown libre, pour remplacer un simple paragraphe), **Image**, **Image + Texte**, **Citation**, **Galerie**. Il n'y a volontairement pas de champ "Contenu" séparé : ça évite d'avoir deux endroits différents où écrire du texte. Chaque type est défini dans `static/admin/config.yml`, et rendu côté site par `src/lib/components/Blocks.svelte` à partir des données typées dans `src/lib/posts.ts` (type `Block`).

Pour ajouter un nouveau type de bloc :

1. Ajoute une entrée dans `types:` du champ `blocks` (`static/admin/config.yml`), avec un `name` unique et ses `fields`.
2. Ajoute le type TypeScript correspondant et son cas dans `parseBlocks()` (`src/lib/posts.ts`).
3. Ajoute la branche `{:else if block.type === '...'}` dans `src/lib/components/Blocks.svelte`.

L'article `content/posts/hello-world.md` contient un exemple de chaque type pour voir le rendu tout de suite (`pnpm dev` puis `/blog/hello-world`).

### Design system (Tailwind + shadcn-svelte)

Les blocs sont stylés avec [Tailwind CSS v4](https://tailwindcss.com/) et des composants [shadcn-svelte](https://www.shadcn-svelte.com/) (`AspectRatio`, `Card`, `Carousel`) plutôt que du CSS écrit à la main : accessibilité (focus, clavier, ARIA) gérée par les primitives [bits-ui](https://bits-ui.com/) sous-jacentes, thème centralisé dans `src/app.css` (variables de couleur, radius — modifiable via `pnpm dlx shadcn-svelte@latest init` ou en éditant les `--variables` directement), et de nouveaux composants ajoutables à la demande (`pnpm dlx shadcn-svelte@latest add <composant>`).

- `src/app.css` : import Tailwind, plugin `@tailwindcss/typography` (classes `prose`/`prose-invert` pour le HTML issu du markdown), variables de thème shadcn-svelte.
- `src/lib/components/ui/` : composants shadcn-svelte installés (copiés dans le repo, pas une dépendance figée — tu peux les modifier librement).
- `src/lib/components/Blocks.svelte` : utilise ces composants pour chaque type de bloc (`AspectRatio` pour les images, `Card`+`Carousel` pour la galerie, classes Tailwind pour Texte/Citation).

### Aperçu réaliste dans l'admin

Par défaut, l'aperçu de Sveltia CMS affiche les blocs de façon brute (markdown non rendu, pas de mise en page). `static/admin/preview.js` remplace cet aperçu par un rendu qui se rapproche de `src/lib/components/Blocks.svelte` (via `CMS.registerPreviewTemplate`, l'API de personnalisation de Sveltia CMS), stylé avec `static/admin/preview.css`. Comme l'admin n'a pas de build step, ce script utilise les globals `h()`/`createClass()` exposés par Sveltia CMS (pas de JSX) et charge `marked` par CDN pour rendre le markdown des blocs — c'est une **approximation** pour les blocs Image/Image+Texte (les composants shadcn-svelte `AspectRatio`/`Card` n'existent que dans l'app SvelteKit, donc leur effet visuel est reproduit avec les mêmes classes Tailwind sur des éléments simples). La galerie, elle, est un vrai carousel : `embla-carousel` (la même librairie qu'utilise `embla-carousel-svelte` sous le capot du composant `Carousel`) est chargé par CDN et initialisé sur le HTML rendu — drag, snap et boutons prev/next fonctionnent réellement, pas juste visuellement.

**`static/admin/preview.css` n'est pas écrit à la main : c'est un fichier généré**, compilé par le CLI Tailwind à partir de `static/admin/preview.tw.css` (qui réimporte `src/app.css`, donc récupère exactement les mêmes variables de couleur/thème que le site) :

```sh
pnpm run build:admin-css
```

Cette commande tourne automatiquement avant `pnpm dev` et avant `pnpm build` (hooks npm `predev`/`prebuild` dans `package.json`) — donc l'aperçu admin ne peut pas devenir obsolète, que ce soit en local ou lors d'un build de déploiement (Netlify, Cloudflare Pages, une Action GitHub Pages : tous appellent `pnpm run build` à un moment). Pas besoin de CI dédiée ni d'étape manuelle avant de pousser.

Si tu ajoutes un nouveau type de bloc ou changes le style dans `Blocks.svelte`, répercute le changement dans `preview.js` (le rendu ne partage pas de code avec l'app SvelteKit) — la partie couleurs/thème, elle, se met à jour toute seule au prochain `pnpm dev`/`pnpm build` puisqu'elle vient directement de `src/app.css`.

## Navigation et paramètres globaux

Deux entrées supplémentaires dans le menu de l'admin, pour le contenu qui n'est pas un article :

- **Navigation** (`content/navigation.json`) — liens du menu, texte et liens du pied de page.
- **Paramètres globaux** (`content/settings.json`) — nom/description du site, image de partage par défaut, email de contact.

Ce sont des "file collections" Sveltia CMS (`files:` au lieu de `folder:`) : un seul document éditable par entrée, plutôt qu'une liste d'articles. Les champs actuels sont un point de départ volontairement minimal — à étoffer selon les besoins réels (ajoute simplement des `fields` dans `static/admin/config.yml`, comme pour n'importe quelle collection). Pour l'instant ces fichiers ne sont pas encore lus par le site (pas de composant Navigation/Footer côté SvelteKit) : c'est la prochaine étape logique, sur le même principe que `src/lib/posts.ts` (un petit loader qui lit `content/navigation.json`/`content/settings.json`).

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
| `pnpm build:admin-css` | Recompile juste `static/admin/preview.css` depuis `preview.tw.css` |
| `pnpm preview` | Aperçu du build |
| `pnpm check` | Vérification TypeScript/Svelte |
| `pnpm dlx shadcn-svelte@latest add <composant>` | Ajoute un nouveau composant shadcn-svelte dans `src/lib/components/ui/` |
