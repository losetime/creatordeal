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
  Globe,
  Users,
} from "lucide-react"

const features = [
  {
    title: "Deal Pipeline",
    description: "Visualize all your deals in a drag-and-drop kanban board. Never lose track of an opportunity.",
    icon: Handshake,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "Smart Invoicing",
    description: "Generate professional invoices in seconds. Track payments and send automatic reminders.",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Payment Tracking",
    description: "Never miss a payment. Get alerts for overdue invoices and automated follow-ups.",
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "AI Contract Scanner",
    description: "Upload contracts and get instant risk analysis. Protect yourself with AI-powered insights.",
    icon: Shield,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Rate Benchmarking",
    description: "See what similar creators are charging. Negotiate with confidence using real market data.",
    icon: TrendingUp,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Deadline Alerts",
    description: "Never miss a deadline again. Get smart reminders for content due dates and payment follow-ups.",
    icon: Bell,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
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
    name: "Sarah Chen",
    role: "Tech Creator · 250K followers",
    content: "CreatorDeal helped me close $40K in brand deals last month. The AI contract scanner saved me from a bad deal.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Lifestyle Creator · 180K followers",
    content: "I used to spend hours on invoicing. Now it takes 2 minutes. The payment tracking alone is worth the price.",
    avatar: "MJ",
  },
  {
    name: "Elena Rodriguez",
    role: "Fitness Creator · 320K followers",
    content: "The rate benchmarking feature is game-changing. I increased my rates by 40% after seeing market data.",
    avatar: "ER",
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
    answer: "Yes! You can manually add existing deals or import them from a CSV file. We also support email forwarding for automatic deal capture.",
  },
  {
    question: "What payment methods do you support?",
    answer: "We integrate with Stripe for payments. You can accept bank transfers, credit cards, and ACH payments.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption and are SOC 2 compliant. Your data is always private and secure.",
  },
]

const logos = [
  "Nike", "Apple", "Samsung", "Netflix", "Tesla", "Spotify", "Adobe", "Shopify"
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">CreatorDeal</span>
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
              <Button size="sm" className="gradient-primary text-white border-0">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-hero">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="container mx-auto px-4 py-24 lg:py-32 relative">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
                <Sparkles className="mr-1 h-3 w-3" />
                Trusted by 2,000+ creators
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Turn Your Creativity
                <br />
                <span className="gradient-text">Into Revenue</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
                The all-in-one platform for content creators to manage brand deals, 
                generate invoices, and never miss a payment deadline again.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gradient-primary text-white border-0 px-8 text-lg">
                    Start Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 text-lg">
                    View Demo
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Free for up to 3 active deals. No credit card required.
              </p>
            </div>

            {/* Dashboard Preview */}
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                <div className="rounded-lg bg-background p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { label: "Active Deals", value: "12", change: "+2 this week" },
                      { label: "Revenue MTD", value: "$15,200", change: "+18% vs last month" },
                      { label: "Pending Payments", value: "$8,500", change: "3 overdue" },
                      { label: "Total Earned", value: "$45,200", change: "All time" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
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
        <section className="border-y bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              Trusted by creators working with world-class brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {logos.map((logo) => (
                <div key={logo} className="text-2xl font-bold text-muted-foreground/40">
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
              <h2 className="text-3xl font-bold sm:text-4xl">
                Everything You Need to
                <br />
                <span className="gradient-text">Scale Your Creator Business</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From deal tracking to payment collection, we&apos;ve got you covered.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                How It Works
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Get Started in Minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps to transform your creator business.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.step} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
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
              <h2 className="text-3xl font-bold sm:text-4xl">
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
                    plan.popular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-8 ${
                      plan.popular
                        ? "gradient-primary text-white border-0"
                        : ""
                    }`}
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
        <section id="testimonials" className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Loved by Creators Worldwide
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what other creators are saying about CreatorDeal.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-xl border bg-card p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
              <h2 className="text-3xl font-bold sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto max-w-2xl space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border bg-card"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-medium">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="gradient-hero py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Creator Business?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              Join 2,000+ creators who are already using CreatorDeal to close more deals and get paid faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gradient-primary text-white border-0 px-8 text-lg">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">CreatorDeal</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                The all-in-one platform for content creators to manage their sponsorship business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
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
