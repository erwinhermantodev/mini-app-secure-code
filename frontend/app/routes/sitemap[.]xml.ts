// routes/sitemap[.]xml.ts
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const sitemapXml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://example.com/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>https://example.com/forgot-password</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    </urlset>
  `;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
