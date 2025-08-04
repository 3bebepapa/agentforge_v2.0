import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentForge - AI Agent Development Platform",
  description:
    "Create, deploy, and manage AI agents with our comprehensive development platform. Build workflows, integrate APIs, and automate processes with ease.",
  keywords: [
    "AI agents",
    "workflow automation",
    "agent development",
    "AI platform",
    "process automation",
    "machine learning",
    "artificial intelligence",
    "no-code AI",
    "agent builder",
    "workflow builder",
  ],
  authors: [{ name: "AgentForge Team" }],
  creator: "AgentForge",
  publisher: "AgentForge",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app",
    title: "AgentForge - AI Agent Development Platform",
    description:
      "Create, deploy, and manage AI agents with our comprehensive development platform. Build workflows, integrate APIs, and automate processes with ease.",
    siteName: "AgentForge",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentForge - AI Agent Development Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentForge - AI Agent Development Platform",
    description: "Create, deploy, and manage AI agents with our comprehensive development platform.",
    images: ["/images/og-image.png"],
    creator: "@agentforge",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 추가 SEO 메타 태그 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AgentForge" />
        <meta name="application-name" content="AgentForge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AgentForge",
              description: "AI Agent Development Platform for creating, deploying, and managing AI agents",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "AgentForge Team",
              },
            }),
          }}
        />

        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
