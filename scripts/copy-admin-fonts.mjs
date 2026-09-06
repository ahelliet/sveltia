// static/admin/ has no bundler (see static/admin/preview.tw.css): Tailwind
// CLI compiles `@import "@fontsource-variable/inter"` verbatim, including
// its relative `url(./files/inter-*.woff2)` references. A real bundler
// (Vite, for the SvelteKit app) rewrites those into hashed asset URLs and
// copies the files; Tailwind CLI doesn't, so without this the browser
// requests them relative to the compiled stylesheet's own URL
// (static/admin/preview.css -> /admin/), i.e. `/admin/files/inter-*.woff2`,
// which 404s. This copies the actual font files there so that URL resolves.
//
// Run automatically by `pnpm run build:admin-css` (itself run by the
// `predev`/`prebuild` npm lifecycle hooks) — never run by hand.

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules/@fontsource-variable/inter/files');
const dest = join(root, 'static/admin/files');

if (!existsSync(src)) {
	console.warn(
		'[copy-admin-fonts] @fontsource-variable/inter not found — skipping font copy for the ' +
			'admin preview (run `pnpm install` first).'
	);
} else {
	mkdirSync(dest, { recursive: true });
	cpSync(src, dest, { recursive: true });
}
