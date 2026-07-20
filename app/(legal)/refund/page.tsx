import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "CreatorDeal refund policy. Learn about our 14-day full refund guarantee and subscription cancellation terms.",
  alternates: { canonical: "/refund" },
  openGraph: {
    title: "Refund Policy | CreatorDeal",
    description: "Learn about CreatorDeal's refund and cancellation terms.",
  },
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CreatorDeal" className="h-8 w-8" />
            <span className="text-xl font-bold">CreatorDeal</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">Back to Home</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 3, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Free Plan</h2>
            <p className="text-muted-foreground leading-relaxed">
              The free plan is provided at no cost. No refund is applicable as no payment is required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Paid Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              For paid subscriptions (Pro and Team plans), we offer the following refund terms:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Within 14 days of purchase:</strong> Full refund, no questions asked.</li>
              <li><strong>After 14 days:</strong> Refunds are not provided for partial billing periods. You may cancel your subscription at any time to prevent future charges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed">
              To request a refund, please contact us at support@creatordeal.app with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Your account email address</li>
              <li>The date of your purchase</li>
              <li>The reason for your refund request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Processing Time</h2>
            <p className="text-muted-foreground leading-relaxed">
              Refunds are typically processed within 5-10 business days. The refund will be credited to 
              the original payment method used for the purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cancellation</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time from your account settings. Upon cancellation:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Your subscription will remain active until the end of the current billing period</li>
              <li>You will retain access to paid features until the period ends</li>
              <li>After the period ends, your account will be downgraded to the free plan</li>
              <li>Your data will be preserved and accessible on the free plan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Exceptional Circumstances</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may issue refunds in exceptional circumstances, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Service outages lasting more than 24 hours</li>
              <li>Technical issues preventing you from using the service</li>
              <li>Billing errors</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any refund-related questions, please contact us at support@creatordeal.app.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
