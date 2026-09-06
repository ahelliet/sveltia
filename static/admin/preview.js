// Custom preview for the "posts" collection: renders the same block types as
// src/lib/components/Blocks.svelte (text, image, image+text, quote, gallery)
// instead of Sveltia's default raw-field preview, so editors see something
// close to the real page. No build step here, so this uses the `h()` /
// `createClass()` globals Sveltia CMS exposes on `window` for writing
// preview components without JSX/React. Marked (same library the site uses
// to render markdown) is loaded via CDN in index.html, just for this preview.

(function () {
	function toPlain(value) {
		return value && typeof value.toJS === 'function' ? value.toJS() : value;
	}

	function renderMarkdown(text) {
		return text && window.marked ? window.marked.parse(text) : '';
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

			var children = [h('h1', { key: 'title' }, data.title || '')];

			if (data.date) {
				children.push(
					h('p', { key: 'date' }, new Date(data.date).toLocaleDateString('fr-FR'))
				);
			}

			if (data.heroImage) {
				children.push(
					h('img', { key: 'hero', src: resolveImage(data.heroImage), alt: data.title || '' })
				);
			}

			blocks.forEach(function (block, i) {
				if (!block || !block.type) return;
				var key = 'block-' + i;

				if (block.type === 'text') {
					children.push(
						h('div', {
							key: key,
							className: 'block block-text',
							dangerouslySetInnerHTML: { __html: renderMarkdown(block.body) }
						})
					);
				} else if (block.type === 'image') {
					children.push(
						h(
							'figure',
							{ key: key, className: 'block block-image' },
							h('img', { src: resolveImage(block.image), alt: block.alt || '' }),
							block.caption ? h('figcaption', {}, block.caption) : null
						)
					);
				} else if (block.type === 'image_text') {
					children.push(
						h(
							'div',
							{
								key: key,
								className: 'block block-image-text' + (block.imageOnRight ? ' reverse' : '')
							},
							h('img', { src: resolveImage(block.image), alt: '' }),
							h('div', {
								className: 'text',
								dangerouslySetInnerHTML: { __html: renderMarkdown(block.body) }
							})
						)
					);
				} else if (block.type === 'quote') {
					children.push(
						h(
							'blockquote',
							{ key: key, className: 'block block-quote' },
							h('p', {}, block.quote),
							block.author ? h('cite', {}, '— ' + block.author) : null
						)
					);
				} else if (block.type === 'gallery') {
					var images = Array.isArray(block.images) ? block.images : [];
					children.push(
						h(
							'div',
							{ key: key, className: 'block block-gallery' },
							images.map(function (img, j) {
								return h('img', { key: j, src: resolveImage(img.image), alt: img.alt || '' });
							})
						)
					);
				}
			});

			return h('article', {}, children);
		}
	});

	CMS.registerPreviewStyle('preview.css');
	CMS.registerPreviewTemplate('posts', PostPreview);
})();
