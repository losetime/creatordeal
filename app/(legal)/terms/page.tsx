import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 3, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using CreatorDeal (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              CreatorDeal is a sponsorship management platform for content creators. The Service provides tools for 
              tracking brand deals, generating invoices, managing contracts, and monitoring payments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must provide accurate and complete information when creating an account. You are responsible for 
              maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, 
              or impair the Service. You shall not attempt to gain unauthorized access to any portion of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by CreatorDeal and are 
              protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit to the Service. By submitting content, you grant 
              CreatorDeal a limited license to use, store, and display that content solely for the purpose of 
              providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Free tier usage is subject to the limitations described on our pricing page. Paid subscriptions 
              are billed in advance on a monthly or annual basis. All payments are non-refundable except as 
              described in our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account at any time for conduct that we determine violates these 
              Terms or is harmful to other users, third parties, or the business interests of CreatorDeal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              CreatorDeal shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of the Service. Our total liability shall not exceed the amount 
              paid by you to CreatorDeal in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes 
              by posting the new Terms on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at support@creatordeal.app.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
