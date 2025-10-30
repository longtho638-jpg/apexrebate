'use client';

import Head from 'next/head';
import { generateStructuredData, generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';

interface SEOProviderProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, any>;
  children: React.ReactNode;
}

export default function SEOProvider({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
  structuredData,
  children
}: SEOProviderProps) {
  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords.join(', ')} />}
        
        {/* Canonical URL */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* Robots */}
        {noindex && <meta name="robots" content="noindex,nofollow" />}
        
        {/* Open Graph */}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ApexRebate" />
        <meta property="og:locale" content="vi_VN" />
        
        {/* Twitter Card */}
        {title && <meta name="twitter:title" content={title} />}
        {description && <meta name="twitter:description" content={description} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ApexRebate" />
        <meta name="twitter:creator" content="@ApexRebate" />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="ApexRebate Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateOrganizationSchema()}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateWebsiteSchema()}
        />
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={generateStructuredData(structuredData.type, structuredData.data)}
          />
        )}
      </Head>
      {children}
    </>
  );
}