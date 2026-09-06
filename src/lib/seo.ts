// Shared per-entry SEO override shape, used by both posts and pages (see
// the &seoFields YAML anchor in static/admin/config.yml) — kept separate
// from src/lib/site.ts's SiteSeo (the *global* SEO/GEO settings), which is
// a different shape entirely.

export type Seo = {
	metaTitle?: string;
	metaDescription?: string;
	ogImage?: string;
	noIndex?: boolean;
};

export function parseSeo(raw: unknown): Seo {
	const seo = (raw ?? {}) as Record<string, unknown>;
	return {
		metaTitle: seo.metaTitle as string | undefined,
		metaDescription: seo.metaDescription as string | undefined,
		ogImage: seo.ogImage as string | undefined,
		noIndex: Boolean(seo.noIndex)
	};
}
