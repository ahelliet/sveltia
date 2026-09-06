// Custom preview for the "posts" collection: approximates the real page
// (src/routes/blog/[slug]/+page.svelte + src/lib/components/Blocks.svelte)
// using the same Tailwind/shadcn-svelte design tokens, since the admin has
// no build step to run actual Svelte components in. Built with the
// h()/createClass() globals Sveltia CMS exposes for non-JSX previews.
//
// This is an approximation, not a 1:1 mirror: the shadcn-svelte Card and
// AspectRatio *components* only exist inside the SvelteKit app, so their
// visual effect is reproduced with the same Tailwind utility classes on
// plain elements (aspect-video/aspect-[4/3] instead of <AspectRatio>). The
// gallery is the exception: it initializes a real embla-carousel instance
// (loaded via CDN, same library embla-carousel-svelte wraps) on the
// rendered markup in componentDidMount/componentDidUpdate, so it actually
// drags/snaps/has working prev-next buttons, not just a static mock.
// Colors, spacing and radius come from the real src/app.css via
// static/admin/preview.tw.css -> preview.css, so it stays visually close.
//
// If you change the layout/classes in Blocks.svelte or +page.svelte,
// mirror the change here too.

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

	var PostPreview = createClass({
		// Real embla-carousel (the same library embla-carousel-svelte wraps for
		// the shadcn-svelte Carousel component) instead of a static scroller, so
		// the gallery in the preview actually drags/snaps like on the live site.
		componentDidMount: function () {
			this._initCarousels();
		},

		componentDidUpdate: function () {
			this._destroyCarousels();
			this._initCarousels();
		},

		componentWillUnmount: function () {
			this._destroyCarousels();
		},

		_initCarousels: function () {
			var doc = this.props.document || document;
			if (typeof window.EmblaCarousel !== 'function') return;

			this._emblaApis = [];

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

				this._emblaApis.push(api);
			}, this);
		},

		_destroyCarousels: function () {
			(this._emblaApis || []).forEach(function (api) {
				api.destroy();
			});
			this._emblaApis = [];
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
							alt: data.title || '',
							className: 'h-full w-full object-cover'
						})
					)
				);
			}

			var blockEls = blocks
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
									alt: '',
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

			children.push(
				h('div', { key: 'blocks', className: 'mt-8 flex flex-col gap-10' }, blockEls)
			);

			return h('article', { className: 'mx-auto max-w-3xl px-4 py-12' }, children);
		}
	});

	// Preview for the "navigation" file entry (Navigation.svelte + Footer.svelte
	// on the real site): mocks the same header/footer layout and Tailwind
	// classes so an editor sees roughly where their links/text will land. The
	// site name shown here is a static placeholder — it actually lives in the
	// separate "Paramètres globaux" entry, which has no data connection to
	// this one in a plain preview template.
	var NavigationPreview = createClass({
		render: function () {
			var entry = this.props.entry;
			var data = toPlain(entry.get('data')) || {};
			var navLinks = Array.isArray(data.navLinks) ? data.navLinks : [];
			var footerLinks = Array.isArray(data.footerLinks) ? data.footerLinks : [];

			return h(
				'div',
				{ className: 'flex min-h-[420px] flex-col justify-between' },
				h(
					'header',
					{ className: 'border-b border-border bg-background/80 backdrop-blur' },
					h(
						'div',
						{
							className:
								'mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4'
						},
						h('span', { className: 'text-lg font-semibold tracking-tight' }, 'Nom du site'),
						navLinks.length
							? h(
									'nav',
									{ className: 'flex flex-wrap items-center gap-6 text-sm' },
									navLinks.map(function (link, i) {
										return h(
											'span',
											{ key: i, className: 'text-muted-foreground' },
											link.label || ''
										);
									})
								)
							: null
					)
				),
				h(
					'div',
					{ className: 'flex-1 px-4 py-10 text-center text-sm text-muted-foreground' },
					'← le contenu des articles s\'affiche ici'
				),
				h(
					'footer',
					{ className: 'border-t border-border' },
					h(
						'div',
						{
							className:
								'mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'
						},
						h('p', {}, data.footerText || ''),
						footerLinks.length
							? h(
									'nav',
									{ className: 'flex flex-wrap gap-4' },
									footerLinks.map(function (link, i) {
										return h('span', { key: i }, link.label || '');
									})
								)
							: null
					)
				)
			);
		}
	});

	CMS.registerPreviewStyle('preview.css');
	CMS.registerPreviewTemplate('posts', PostPreview);
	CMS.registerPreviewTemplate('navigation', NavigationPreview);
})();
