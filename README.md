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

En plus du champ `body` (markdown libre), la collection `posts` a un champ `blocks` (`widget: list` avec `types`) qui permet d'empiler des blocs réordonnables dans l'admin : **Texte**, **Image**, **Image + Texte**, **Citation**, **Galerie**. Chaque type est défini dans `static/admin/config.yml`, et rendu côté site par `src/lib/components/Blocks.svelte` à partir des données typées dans `src/lib/posts.ts` (type `Block`).

Pour ajouter un nouveau type de bloc :

1. Ajoute une entrée dans `types:` du champ `blocks` (`static/admin/config.yml`), avec un `name` unique et ses `fields`.
2. Ajoute le type TypeScript correspondant et son cas dans `parseBlocks()` (`src/lib/posts.ts`).
3. Ajoute la branche `{:else if block.type === '...'}` dans `src/lib/components/Blocks.svelte`.

L'article `content/posts/hello-world.md` contient un exemple de chaque type pour voir le rendu tout de suite (`pnpm dev` puis `/blog/hello-world`).

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
| `pnpm dev` | Site en local |
| `pnpm build` | Build statique complet (`build/`) |
| `pnpm preview` | Aperçu du build |
| `pnpm check` | Vérification TypeScript/Svelte |
