// Custom previews for the Sveltia CMS admin, built with the h()/createClass()
// globals Sveltia exposes for non-JSX preview templates (no build step in
// static/admin/). Approximates the real pages using the same Tailwind/
// shadcn-svelte design tokens (via static/admin/preview.tw.css ->
// preview.css, which re-imports src/app.css) — not a 1:1 mirror: the
// shadcn-svelte Card/AspectRatio *components* only exist inside the
// SvelteKit app, so their visual effect is reproduced with the same
// Tailwind classes on plain elements. The gallery is the exception: it
// runs a real embla-carousel instance (see PostPreview._initCarousels).
//
// Every page on the real site is wrapped in the site header/footer
// (src/routes/+layout.svelte -> Navigation.svelte/Footer.svelte), reading
// content/navigation.json and content/settings.json. So the "posts" and
// "pages" previews fetch both via getCollection() and wrap their content
// the same way — otherwise an editor previewing an entry would see
// something the live site never actually shows (content with no chrome
// around it).
//
// If you change Blocks.svelte, +page.svelte, [slug]/+page.svelte,
// Navigation.svelte or Footer.svelte, mirror the change here too.

(function () {
	function toPlain(value) {
		return value && typeof value.toJS === 'function' ? value.toJS() : value;
	}

	function renderMarkdown(text) {
		return text && window.marked ? window.marked.parse(text) : '';
	}

	function proseHtml(html) {
		return h('div', {
			className: 'prose dark:prose-invert max-w-none',
			dangerouslySetInnerHTML: { __html: html }
		});
	}

	// Reads one field out of whatever getCollection(name) resolves to. Not
	// documented precisely, so this handles the shapes it could plausibly be:
	// a single Immutable entry Map, an Immutable List of entries, or a plain
	// array — file/singleton collections aren't explicitly covered by
	// Sveltia's docs, so better to be defensive than to assume one shape and
	// silently show nothing if it's another.
	function firstEntry(result) {
		if (!result) return null;
		if (typeof result.getIn === 'function') return result;
		if (typeof result.first === 'function') return result.first();
		if (typeof result.get === 'function') return result.get(0);
		if (Array.isArray(result)) return result[0];
		return null;
	}

	function entryData(entry) {
		if (!entry) return {};
		if (typeof entry.getIn === 'function') return toPlain(entry.get('data')) || {};
		var plain = toPlain(entry);
		return (plain && plain.data) || plain || {};
	}

	// Same link resolution as resolveLinkHref() in src/lib/site.ts: a nav
	// link points at a CMS page, a blog article, an anchor on the current
	// page, or a free-typed URL depending on `type` (the list-with-types
	// discriminator, see &navLinkTypes in config.yml) — mirrored here (plain
	// JS, no shared import possible since this file has no bundler) so the
	// preview never shows a different link than the real site would produce
	// for the same data.
	function resolveLinkHref(link) {
		var anchor = link.anchor ? '#' + link.anchor : '';

		if (link.type === 'page' && link.page) return '/' + link.page + anchor;
		if (link.type === 'post' && link.post) return '/blog/' + link.post + anchor;
		if (link.type === 'anchor' && link.anchor) return '#' + link.anchor;
		return link.url || '#';
	}

	// Same header/footer markup + Tailwind classes as
	// src/lib/components/Navigation.svelte and Footer.svelte, shared between
	// the "posts"/"pages" previews (wrap the whole page) and the
	// "navigation" preview (previews the header/footer content itself).
	// Same tag (<a>, with a real href), same classes, same wrapper structure
	// as Navigation.svelte/Footer.svelte — not just visually similar markup,
	// so there's no discrepancy left to spot between preview and live site.
	function renderSiteHeader(siteName, navLinks) {
		return h(
			'header',
			{ className: 'sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur' },
			h(
				'div',
				{
					className:
						'mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4'
				},
				h(
					'a',
					{ href: '/', className: 'text-lg font-semibold tracking-tight' },
					siteName || 'Nom du site'
				),
				navLinks && navLinks.length
					? h(
							'nav',
							{ className: 'flex flex-wrap items-center gap-6 text-sm' },
							navLinks.map(function (link, i) {
								return h(
									'a',
									{
										key: i,
										href: resolveLinkHref(link),
										className: 'text-muted-foreground transition-colors hover:text-foreground'
									},
									link.label || ''
								);
							})
						)
					: null
			)
		);
	}

	function renderSiteFooter(footerText, footerLinks, siteName) {
		return h(
			'footer',
			{ className: 'border-t border-border' },
			h(
				'div',
				{
					className:
						'mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'
				},
				// Same fallback as Footer.svelte: footerText, or the site name.
				h('p', {}, footerText || siteName || ''),
				footerLinks && footerLinks.length
					? h(
							'nav',
							{ className: 'flex flex-wrap gap-4' },
							footerLinks.map(function (link, i) {
								return h(
									'a',
									{
										key: i,
										href: resolveLinkHref(link),
										className: 'transition-colors hover:text-foreground'
									},
									link.label || ''
								);
							})
						)
					: null
			)
		);
	}

	// Fetches content/settings.json (siteName) and content/navigation.json
	// (navLinks/footerText/footerLinks) via getCollection, for anything that
	// needs to render the site chrome around its own content.
	function fetchSiteChrome(getCollection) {
		if (typeof getCollection !== 'function') {
			return Promise.resolve({ siteName: '', navLinks: [], footerText: '', footerLinks: [] });
		}

		return Promise.all([
			getCollection('settings').catch(function () {
				return null;
			}),
			getCollection('navigation').catch(function () {
				return null;
			})
		]).then(function (results) {
			var settingsData = entryData(firstEntry(results[0]));
			var navigationData = entryData(firstEntry(results[1]));

			return {
				siteName: settingsData.siteName || '',
				navLinks: Array.isArray(navigationData.navLinks) ? navigationData.navLinks : [],
				footerText: navigationData.footerText || '',
				footerLinks: Array.isArray(navigationData.footerLinks) ? navigationData.footerLinks : []
			};
		});
	}

	// Renders the "blocks" page-builder array (same shape for the "posts"
	// and "pages" collections — see the &blockTypes YAML anchor in
	// config.yml) into the same markup/Tailwind classes as
	// src/lib/components/Blocks.svelte. Shared by PostPreview and
	// PagePreview so the two previews can't drift apart from each other.
	function renderBlocks(blocks, getAsset) {
		function resolveImage(path) {
			if (!path) return null;
			var asset = getAsset(path);
			if (!asset) return path;
			return typeof asset === 'string' ? asset : asset.toString();
		}

		return blocks
			.map(function (block, i) {
				if (!block || !block.type) return null;
				var key = 'block-' + i;

				if (block.type === 'text') {
					return h('div', { key: key }, proseHtml(renderMarkdown(block.body)));
				}

				if (block.type === 'image') {
					return h(
						'figure',
						{ key: key },
						h(
							'div',
							{ className: 'aspect-video overflow-hidden rounded-2xl bg-muted' },
							h('img', {
								src: resolveImage(block.image),
								alt: block.alt || '',
								loading: 'lazy',
								className: 'h-full w-full object-cover'
							})
						),
						block.caption
							? h(
									'figcaption',
									{ className: 'mt-2 text-center text-sm text-muted-foreground' },
									block.caption
								)
							: null
					);
				}

				if (block.type === 'image_text') {
					return h(
						'div',
						{ key: key, className: 'grid items-center gap-6 md:grid-cols-2' },
						h(
							'div',
							{
								className:
									'aspect-[4/3] overflow-hidden rounded-2xl bg-muted' +
									(block.imageOnRight ? ' md:order-2' : '')
							},
							h('img', {
								src: resolveImage(block.image),
								alt: block.alt || '',
								loading: 'lazy',
								className: 'h-full w-full object-cover'
							})
						),
						proseHtml(renderMarkdown(block.body))
					);
				}

				if (block.type === 'quote') {
					return h(
						'blockquote',
						{ key: key, className: 'border-l-2 pl-6 italic' },
						h('p', {}, block.quote),
						block.author
							? h(
									'cite',
									{ className: 'mt-2 block text-sm not-italic text-muted-foreground' },
									'— ' + block.author
								)
							: null
					);
				}

				if (block.type === 'gallery') {
					var images = Array.isArray(block.images) ? block.images : [];
					var carouselKey = 'gallery-' + i;
					var buttonBase =
						'absolute inset-y-0 my-auto flex size-8 items-center justify-center rounded-full border border-border bg-background text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50';

					return h(
						'div',
						{ key: key, className: 'relative' },
						h(
							'div',
							{ className: 'overflow-hidden', 'data-embla-viewport': carouselKey },
							h(
								'div',
								{ className: 'flex -ms-4', 'data-embla-container': carouselKey },
								images.map(function (img, j) {
									return h(
										'div',
										{ key: j, className: 'min-w-0 shrink-0 grow-0 basis-full ps-4' },
										h(
											'div',
											{
												className:
													'overflow-hidden rounded-4xl bg-card shadow-md ring-1 ring-foreground/5'
											},
											h(
												'div',
												{ className: 'aspect-[4/3] overflow-hidden' },
												h('img', {
													src: resolveImage(img.image),
													alt: img.alt || '',
													loading: 'lazy',
													className: 'h-full w-full object-cover'
												})
											)
										)
									);
								})
							)
						),
						h(
							'button',
							{
								type: 'button',
								className: buttonBase + ' -start-12',
								'data-embla-prev': carouselKey
							},
							'‹'
						),
						h(
							'button',
							{
								type: 'button',
								className: buttonBase + ' -end-12',
								'data-embla-next': carouselKey
							},
							'›'
						)
					);
				}

				return null;
			})
			.filter(Boolean);
	}

	// Real embla-carousel (the same library embla-carousel-svelte wraps for
	// the shadcn-svelte Carousel component) instead of a static scroller, so
	// any gallery block in a preview actually drags/snaps like on the live
	// site. Shared by PostPreview and PagePreview.
	function initCarousels(doc) {
		if (typeof window.EmblaCarousel !== 'function') return [];
		var apis = [];

		doc.querySelectorAll('[data-embla-viewport]').forEach(function (viewport) {
			var key = viewport.getAttribute('data-embla-viewport');
			var api = window.EmblaCarousel(viewport, { loop: false });
			var prevBtn = doc.querySelector('[data-embla-prev="' + key + '"]');
			var nextBtn = doc.querySelector('[data-embla-next="' + key + '"]');

			function updateButtons() {
				if (prevBtn) prevBtn.disabled = !api.canScrollPrev();
				if (nextBtn) nextBtn.disabled = !api.canScrollNext();
			}

			if (prevBtn) prevBtn.addEventListener('click', function () { api.scrollPrev(); });
			if (nextBtn) nextBtn.addEventListener('click', function () { api.scrollNext(); });

			api.on('select', updateButtons);
			api.on('reInit', updateButtons);
			updateButtons();

			apis.push(api);
		});

		return apis;
	}

	function destroyCarousels(apis) {
		(apis || []).forEach(function (api) {
			api.destroy();
		});
	}

	var PostPreview = createClass({
		getInitialState: function () {
			return { siteName: '', navLinks: [], footerText: '', footerLinks: [] };
		},

		componentDidMount: function () {
			var self = this;

			fetchSiteChrome(this.props.getCollection).then(function (chrome) {
				self.setState(chrome);
			});

			this._emblaApis = initCarousels(this.props.document || document);
		},

		componentDidUpdate: function () {
			destroyCarousels(this._emblaApis);
			this._emblaApis = initCarousels(this.props.document || document);
		},

		componentWillUnmount: function () {
			destroyCarousels(this._emblaApis);
		},

		render: function () {
			var entry = this.props.entry;
			var getAsset = this.props.getAsset;
			var data = toPlain(entry.get('data')) || {};
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];

			function resolveImage(path) {
				if (!path) return null;
				var asset = getAsset(path);
				if (!asset) return path;
				return typeof asset === 'string' ? asset : asset.toString();
			}

			var children = [
				h('h1', { key: 'title', className: 'text-3xl font-bold tracking-tight' }, data.title || '')
			];

			if (data.date) {
				children.push(
					h(
						'p',
						{ key: 'date', className: 'mt-2 text-sm text-muted-foreground' },
						new Date(data.date).toLocaleDateString('fr-FR')
					)
				);
			}

			if (data.heroImage) {
				children.push(
					h(
						'div',
						{ key: 'hero', className: 'mt-6 aspect-video overflow-hidden rounded-2xl bg-muted' },
						h('img', {
							src: resolveImage(data.heroImage),
							alt: data.heroImageAlt || data.title || '',
							className: 'h-full w-full object-cover'
						})
					)
				);
			}

			children.push(
				h(
					'div',
					{ key: 'blocks', className: 'mt-8 flex flex-col gap-10' },
					renderBlocks(blocks, getAsset)
				)
			);

			return h(
				'div',
				{},
				renderSiteHeader(this.state.siteName, this.state.navLinks),
				h('article', { className: 'mx-auto max-w-3xl px-4 py-12' }, children),
				renderSiteFooter(this.state.footerText, this.state.footerLinks, this.state.siteName)
			);
		}
	});

	// Preview for the "pages" collection (the multipage page builder — same
	// blocks as "posts", just without date/heroImage). Wrapped in the real
	// site header/footer exactly like PostPreview, for the same reason.
	var PagePreview = createClass({
		getInitialState: function () {
			return { siteName: '', navLinks: [], footerText: '', footerLinks: [] };
		},

		componentDidMount: function () {
			var self = this;

			fetchSiteChrome(this.props.getCollection).then(function (chrome) {
				self.setState(chrome);
			});

			this._emblaApis = initCarousels(this.props.document || document);
		},

		componentDidUpdate: function () {
			destroyCarousels(this._emblaApis);
			this._emblaApis = initCarousels(this.props.document || document);
		},

		componentWillUnmount: function () {
			destroyCarousels(this._emblaApis);
		},

		render: function () {
			var entry = this.props.entry;
			var getAsset = this.props.getAsset;
			var data = toPlain(entry.get('data')) || {};
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];

			var children = [
				h('h1', { key: 'title', className: 'text-3xl font-bold tracking-tight' }, data.title || ''),
				h(
					'div',
					{ key: 'blocks', className: 'mt-8 flex flex-col gap-10' },
					renderBlocks(blocks, getAsset)
				)
			];

			return h(
				'div',
				{},
				renderSiteHeader(this.state.siteName, this.state.navLinks),
				h('article', { className: 'mx-auto max-w-3xl px-4 py-12' }, children),
				renderSiteFooter(this.state.footerText, this.state.footerLinks, this.state.siteName)
			);
		}
	});

	// Preview for the "home" singleton (content/home.md) — same chrome as
	// PostPreview/PagePreview, but no <h1>/title at all: the homepage
	// doesn't show one (see src/routes/+page.svelte, PageContent.svelte).
	var HomePreview = createClass({
		getInitialState: function () {
			return { siteName: '', navLinks: [], footerText: '', footerLinks: [] };
		},

		componentDidMount: function () {
			var self = this;

			fetchSiteChrome(this.props.getCollection).then(function (chrome) {
				self.setState(chrome);
			});

			this._emblaApis = initCarousels(this.props.document || document);
		},

		componentDidUpdate: function () {
			destroyCarousels(this._emblaApis);
			this._emblaApis = initCarousels(this.props.document || document);
		},

		componentWillUnmount: function () {
			destroyCarousels(this._emblaApis);
		},

		render: function () {
			var entry = this.props.entry;
			var getAsset = this.props.getAsset;
			var data = toPlain(entry.get('data')) || {};
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];

			return h(
				'div',
				{},
				renderSiteHeader(this.state.siteName, this.state.navLinks),
				h(
					'div',
					{ className: 'mx-auto max-w-3xl px-4 py-12 flex flex-col gap-10' },
					renderBlocks(blocks, getAsset)
				),
				renderSiteFooter(this.state.footerText, this.state.footerLinks, this.state.siteName)
			);
		}
	});

	// Preview for the "navigation" file entry: same header/footer markup as
	// above, but built from THIS entry's own (currently edited, possibly
	// unsaved) navLinks/footerText/footerLinks, with just the site name
	// fetched from "Paramètres globaux" since this entry doesn't own it.
	var NavigationPreview = createClass({
		getInitialState: function () {
			return { siteName: '' };
		},

		componentDidMount: function () {
			var self = this;
			if (typeof this.props.getCollection !== 'function') return;

			this.props
				.getCollection('settings')
				.then(function (result) {
					var siteName = entryData(firstEntry(result)).siteName;
					if (siteName) self.setState({ siteName: siteName });
				})
				.catch(function () {
					// Best-effort only — keep the placeholder on failure.
				});
		},

		render: function () {
			var entry = this.props.entry;
			var data = toPlain(entry.get('data')) || {};
			var navLinks = Array.isArray(data.navLinks) ? data.navLinks : [];
			var footerLinks = Array.isArray(data.footerLinks) ? data.footerLinks : [];
			var siteName = this.state.siteName || 'Nom du site';

			return h(
				'div',
				{ className: 'flex min-h-[420px] flex-col justify-between' },
				renderSiteHeader(siteName, navLinks),
				h(
					'div',
					{ className: 'flex-1 px-4 py-10 text-center text-sm text-muted-foreground' },
					'← le contenu des articles/pages s\'affiche ici'
				),
				renderSiteFooter(data.footerText, footerLinks, siteName)
			);
		}
	});

	CMS.registerPreviewStyle('preview.css');
	CMS.registerPreviewTemplate('posts', PostPreview);
	CMS.registerPreviewTemplate('pages', PagePreview);
	CMS.registerPreviewTemplate('home', HomePreview);
	CMS.registerPreviewTemplate('navigation', NavigationPreview);

	// Titre de l'admin ("Sveltia CMS" par défaut, affiché à côté du logo sur
	// l'écran de connexion et dans l'onglet du navigateur) : on le remplace
	// par le nom du site dès qu'il est renseigné dans Paramètres globaux.
	// index.html a mis window.CMS_MANUAL_INIT = true pour empêcher la CMS de
	// s'initialiser toute seule le temps qu'on récupère site-meta.json (voir
	// src/routes/admin/site-meta.json/+server.ts) ; on l'initialise nous-
	// mêmes juste après, avec ou sans nom de site selon que la requête a
	// abouti. CMS.init({ config }) fusionne ce config partiel avec celui de
	// config.yml (chargé automatiquement), donc rien d'autre ne change.
	fetch('site-meta.json')
		.then(function (res) {
			return res.ok ? res.json() : null;
		})
		.catch(function () {
			return null;
		})
		.then(function (meta) {
			var siteName = meta && meta.siteName;
			CMS.init(siteName ? { config: { app_title: siteName } } : {});
		});
})();
