import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { TRPCProvider } from "@/lib/trpc/provider"
import { AuthProvider } from "@/lib/auth/context"
import { I18nProvider } from "@/components/i18n-provider"
import "./globals.css"

const SITE_URL = "https://creatordeal.app"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CreatorDeal - Sponsorship Management for Creators",
    template: "%s | CreatorDeal",
  },
  description:
    "All-in-one sponsorship management platform for content creators. Track brand deals, generate influencer invoices, manage contracts, and get paid faster.",
  keywords: [
    "sponsorship management for creators",
    "invoice template for influencers",
    "creator deal tracker",
    "brand deal management",
    "invoicing for content creators",
    "sponsorship tracking",
    "creator business tools",
    "influencer payment tracking",
  ],
  authors: [{ name: "CreatorDeal" }],
  creator: "CreatorDeal",
  publisher: "CreatorDeal",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "CreatorDeal",
    title: "CreatorDeal - Sponsorship Management for Creators",
    description:
      "All-in-one sponsorship management platform for content creators. Track brand deals, generate influencer invoices, and get paid faster.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CreatorDeal - Sponsorship Management for Creators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorDeal - Sponsorship Management for Creators",
    description:
      "All-in-one sponsorship management platform for content creators. Track brand deals, generate influencer invoices, and get paid faster.",
    images: ["/og-image.png"],
  },
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
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo.png",
    other: [{ rel: "icon", url: "/logo.png", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TRPCProvider>
          <AuthProvider>
            <I18nProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </I18nProvider>
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
