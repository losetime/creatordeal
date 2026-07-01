import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CreatorDeal - Sponsorship Management for Creators",
  description: "Manage your brand deals, track revenue, and generate invoices all in one place.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
