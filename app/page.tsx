import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Handshake,
  FileText,
  Bell,
  Shield,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  ChevronDown,
  Zap,
} from "lucide-react"

const features = [
  {
    title: "Deal Pipeline",
    description: "Visualize all your deals in a drag-and-drop kanban board. Never lose track of an opportunity.",
    icon: Handshake,
  },
  {
    title: "Smart Invoicing",
    description: "Generate professional invoices in seconds. Track payments and send automatic reminders.",
    icon: FileText,
  },
  {
    title: "Payment Tracking",
    description: "Never miss a payment. Get alerts for overdue invoices and automated follow-ups.",
    icon: DollarSign,
  },
  {
    title: "AI Contract Scanner",
    description: "Upload contracts and get instant risk analysis. Protect yourself with AI-powered insights.",
    icon: Shield,
  },
  {
    title: "Rate Benchmarking",
    description: "See what similar creators are charging. Negotiate with confidence using real market data.",
    icon: TrendingUp,
  },
  {
    title: "Deadline Alerts",
    description: "Never miss a deadline again. Get smart reminders for content due dates and payment follow-ups.",
    icon: Bell,
  },
]

const steps = [
  {
    step: "01",
    title: "Add Your Deals",
    description: "Import existing deals or create new ones. Track every sponsorship from inquiry to payment.",
  },
  {
    step: "02",
    title: "Manage Everything",
    description: "Generate invoices, scan contracts, and track payments—all from one dashboard.",
  },
  {
    step: "03",
    title: "Get Paid Faster",
    description: "Automated reminders and follow-ups help you collect payments 2x faster.",
  },
]

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 3 active deals",
      "Basic invoicing",
      "Payment tracking",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious creators",
    features: [
      "Unlimited deals",
      "Advanced invoicing",
      "AI contract scanner",
      "Rate benchmarking",
      "Priority support",
      "Custom branding",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For agencies and teams",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Client portal",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const testimonials = [
  {
    name: "CreatorDeal User",
    role: "Early Adopter",
    content: "Finally a tool built specifically for sponsorship management. The deal pipeline alone saves hours every week.",
    avatar: "CD",
  },
]

const faqs = [
  {
    question: "Is there a free plan?",
    answer: "Yes! Our free plan includes up to 3 active deals, basic invoicing, and payment tracking. No credit card required.",
  },
  {
    question: "How does the AI contract scanner work?",
    answer: "Upload your contract and our AI analyzes it for risky clauses, missing protections, and unfair terms. Get instant insights before you sign.",
  },
  {
    question: "Can I import existing deals?",
    answer: "Yes! You can manually add existing deals and track them through the full pipeline from inquiry to payment.",
  },
  {
    question: "What payment methods do you support?",
    answer: "You can track payments from any source — bank transfers, PayPal, Venmo, or any other method. Manual payment recording is built in.",
  },
  {
    question: "Is my data secure?",
    answer: "We use industry-standard encryption and Supabase's security infrastructure. Your data is always private and protected.",
  },
]

const logos = [
  "YouTube", "Instagram", "TikTok", "Twitch", "Twitter"
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CreatorDeal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="container mx-auto px-4 py-24 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
                <Badge variant="secondary" className="mb-6">
                <Sparkles className="mr-1 h-3 w-3 text-primary" />
                Built for Content Creators
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Manage Your Sponsorship Deals
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
                One platform for content creators to track brand deals, generate invoices, 
                and never miss a payment deadline again.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="px-8">
                    Start Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free for up to 3 active deals. No credit card required.
              </p>
            </div>

            {/* Dashboard Preview */}
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="rounded-xl border border-border bg-card p-1 shadow-2xl shadow-primary/5">
                <div className="rounded-lg bg-background p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { label: "Active Deals", value: "12", change: "+2 this week" },
                      { label: "Revenue MTD", value: "$15,200", change: "+18% vs last month" },
                      { label: "Pending Payments", value: "$8,500", change: "3 overdue" },
                      { label: "Total Earned", value: "$45,200", change: "All time" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="border-b border-border/50 py-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              Trusted by creators working with world-class brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {logos.map((logo) => (
                <div key={logo} className="text-2xl font-bold text-muted-foreground/30 select-none">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl text-foreground text-balance">
                Everything You Need to Scale Your Creator Business
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From deal tracking to payment collection, we&apos;ve got you covered.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-y border-border/50 bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                How It Works
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl text-foreground">
                Get Started in Minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps to transform your creator business.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {steps.map((step, i) => (
                <div key={step.step} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free, upgrade when you&apos;re ready. No hidden fees.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border bg-card p-8 ${
                    plan.popular
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-8 ${plan.popular ? "" : "variant-outline"}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-y border-border/50 bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl text-foreground">
                Loved by Creators Worldwide
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what other creators are saying about CreatorDeal.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                FAQ
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto max-w-2xl space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-border bg-card"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-foreground">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 bg-muted/30 py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground text-balance">
              Ready to Transform Your Creator Business?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join creators who are using CreatorDeal to close more deals and get paid faster.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" className="px-8">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CreatorDeal</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                The all-in-one platform for content creators to manage their sponsorship business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Notice</Link></li>
                <li><Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 CreatorDeal. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
