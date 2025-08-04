import { NextResponse } from "next/server"

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Allow all search engines to crawl the site
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Sitemap location
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app"}/sitemap.xml

# Crawl-delay (optional, in seconds)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
