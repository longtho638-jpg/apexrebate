import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://apexrebate.com';
  const currentDate = new Date().toISOString();

  const locales = ['vi', 'en'];
  
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' },
    { path: '/calculator', priority: 0.9, changeFreq: 'weekly' },
    { path: '/wall-of-fame', priority: 0.8, changeFreq: 'daily' },
    { path: '/faq', priority: 0.8, changeFreq: 'weekly' },
    { path: '/how-it-works', priority: 0.7, changeFreq: 'monthly' },
    { path: '/dashboard', priority: 0.7, changeFreq: 'daily' },
    { path: '/auth/signin', priority: 0.5, changeFreq: 'monthly' },
    { path: '/auth/signup', priority: 0.5, changeFreq: 'monthly' },
    { path: '/apex-pro', priority: 0.6, changeFreq: 'weekly' },
    { path: '/hang-soi', priority: 0.6, changeFreq: 'daily' },
  ];

  const urls = staticPages.flatMap(page => 
    locales.map(locale => ({
      url: page.path ? `${baseUrl}/${locale}${page.path}` : `${baseUrl}/${locale}`,
      lastModified: currentDate,
      changeFrequency: page.changeFreq,
      priority: locale === 'vi' ? page.priority : page.priority * 0.9, // Slightly lower priority for English
    }))
  );

  // Add root redirect
  urls.unshift({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${urls
        .map(
          (page) => `
            <url>
              <loc>${page.url}</loc>
              <lastmod>${page.lastModified}</lastmod>
              <changefreq>${page.changeFrequency}</changefreq>
              <priority>${page.priority}</priority>
              ${page.url.includes('/vi') ? `
                <xhtml:link rel="alternate" hreflang="en" href="${page.url.replace('/vi', '/en')}" />
                <xhtml:link rel="alternate" hreflang="vi" href="${page.url}" />
                <xhtml:link rel="alternate" hreflang="x-default" href="${page.url}" />
              ` : ''}
              ${page.url.includes('/en') ? `
                <xhtml:link rel="alternate" hreflang="vi" href="${page.url.replace('/en', '/vi')}" />
                <xhtml:link rel="alternate" hreflang="en" href="${page.url}" />
                <xhtml:link rel="alternate" hreflang="x-default" href="${page.url.replace('/en', '/vi')}" />
              ` : ''}
            </url>
          `
        )
        .join('')}
    </urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}