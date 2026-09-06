// Custom preview for the "posts" collection: approximates the real page
// (src/routes/blog/[slug]/+page.svelte + src/lib/components/Blocks.svelte)
// using the same Tailwind/shadcn-svelte design tokens, since the admin has
// no build step to run actual Svelte components in. Built with the
// h()/createClass() globals Sveltia CMS exposes for non-JSX previews.
//
// This is an approximation, not a 1:1 mirror: the shadcn-svelte Card,
// AspectRatio and Carousel *components* only exist inside the SvelteKit
// app, so here their visual effect is reproduced with the same Tailwind
// utility classes on plain elements (aspect-video/aspect-[4/3] instead of
// <AspectRatio>, a scrollable flex row instead of the real embla carousel).
// The colors, spacing and radius still come from the real src/app.css via
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
						return h(
							'div',
							{ key: key, className: 'flex gap-4 overflow-x-auto pb-2' },
							images.map(function (img, j) {
								return h(
									'div',
									{
										key: j,
										className:
											'w-64 shrink-0 overflow-hidden rounded-4xl bg-card shadow-md ring-1 ring-foreground/5'
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
								);
							})
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

	CMS.registerPreviewStyle('preview.css');
	CMS.registerPreviewTemplate('posts', PostPreview);
})();
