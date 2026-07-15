import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { TRPCProvider } from "@/lib/trpc/provider"
import { AuthProvider } from "@/lib/auth/context"
import { I18nProvider } from "@/components/i18n-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "CreatorDeal - Sponsorship Management for Creators",
  description: "Manage your brand deals, track revenue, and generate invoices all in one place.",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo.png",
    other: [
      { rel: "icon", url: "/logo.png", type: "image/png" },
    ],
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
