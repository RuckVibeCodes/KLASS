import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  BookOpen,
  FolderOpen,
  Calendar,
  Palette,
  CreditCard,
  ArrowRight,
  Check,
  Smartphone,
  Settings,
  Sparkles,
  Brain,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Cpu,
} from "lucide-react";

const faqs = [
  {
    question: "How is Klass different from Skool?",
    answer:
      "Skool is a hosted platform — you rent space inside their ecosystem. Klass gives you your own branded platform powered by our infrastructure. Your logo, your colors, your content, your members — without being locked into someone else's roadmap. And unlike Skool, Klass is AI-native — built for 2026, not 2023.",
  },
  {
    question: "Is Klass a SaaS tool or a custom build?",
    answer:
      "Klass is a self-serve SaaS platform. On the DIY plan, you sign up and set everything up yourself. On higher-tier plans, we help configure, brand, and launch your community so you can focus on content.",
  },
  {
    question: "Why do some plans have a setup fee?",
    answer:
      "The Done-With-You and Done-For-You plans include hands-on setup by our team — branding, configuration, migration, and launch support. The DIY plan has no setup fee at all.",
  },
  {
    question: "What does the monthly fee cover?",
    answer:
      "Your monthly subscription covers full platform access, hosting and infrastructure, ongoing updates and improvements, platform support, and long-term stability. Think of it as everything you need to run your branded platform.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Custom domains are supported. We'll help you connect your platform to your own branded domain as part of setup or shortly after launch.",
  },
  {
    question: "Do my members need to create new accounts?",
    answer:
      "Yes, members will create accounts inside your platform. If you're migrating from another platform, we'll guide you on best practices to make the transition smooth for your community.",
  },
  {
    question: "Does Klass have a mobile app?",
    answer:
      "Klass is fully mobile-ready out of the box. Native iOS and Android apps — branded with your name and logo — are available as an upgrade for creators who want an App Store presence.",
  },
  {
    question: "Will Apple take a percentage of my subscriptions?",
    answer:
      "No. All payments are handled on the web via Stripe. The mobile app (if enabled) is for access and engagement only, not in-app purchases.",
  },
  {
    question: "Is this suitable for beginners?",
    answer:
      "Klass is built for creators who are already monetizing or actively growing a community. If you're just getting started and looking for a free tool, Klass is likely not the right fit.",
  },
  {
    question: "Can I cancel if it's not a fit?",
    answer:
      "Yes. You can cancel the monthly maintenance at any time. Your setup fee covers the initial build and configuration and is non-refundable.",
  },
  {
    question: "Who owns the platform and data?",
    answer:
      "You own your brand, content, and community. Klass provides the underlying infrastructure and ongoing support to keep everything running.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Most platforms are branded and ready to launch within 7–14 days, depending on complexity and content readiness.",
  },
  {
    question: "Can I add custom features later?",
    answer:
      "Yes. Custom features, integrations, and advanced options (including dedicated mobile apps) are available as paid upgrades.",
  },
  {
    question: "Is Klass right for me?",
    answer:
      "Klass is ideal if you already monetize a community or content, you want full branding control, and you're ready to own your platform instead of renting one. If that describes you, Klass is likely a strong fit.",
  },
];

const aiFeatures = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI Lesson Builder",
    description: "Generate complete course outlines from a single topic. AI structures your content, suggests modules, and builds lesson plans in seconds.",
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "AI Playbook Generator",
    description: "Turn any topic into a structured, actionable playbook automatically. Members get step-by-step guides they can follow and check off.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Smart Content Suggestions",
    description: "AI analyzes your community and tells you what content to create next based on member questions, engagement patterns, and gaps.",
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Community Insights",
    description: "AI-driven analytics on member engagement, sentiment, and churn risk. Know what's working before it becomes a problem.",
  },
  {
    icon: <Cpu className="h-8 w-8" />,
    title: "Smart Onboarding",
    description: "Automated welcome flows that adapt to each new member. Personalize their journey based on interests and goals.",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "AI Templates & Workflows",
    description: "Pre-built templates for courses, programs, and community structures — AI-enhanced and optimized for conversion.",
  },
];

const comparisons = [
  {
    feature: "AI-Powered Course Creation",
    klass: true,
    skool: false,
    circle: false,
  },
  {
    feature: "AI Playbook Generator",
    klass: true,
    skool: false,
    circle: false,
  },
  {
    feature: "Smart Content Suggestions",
    klass: true,
    skool: false,
    circle: false,
  },
  {
    feature: "Community Insights AI",
    klass: true,
    skool: false,
    circle: false,
  },
  {
    feature: "White-Label Branding",
    klass: true,
    skool: false,
    circle: true,
  },
  {
    feature: "Custom Domain",
    klass: true,
    skool: false,
    circle: true,
  },
  {
    feature: "Native Mobile App Option",
    klass: true,
    skool: false,
    circle: false,
  },
  {
    feature: "Stripe Connect",
    klass: true,
    skool: true,
    circle: true,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              K
            </div>
            <span className="font-bold text-xl">Klass</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/demo" target="_blank">
              <Button variant="ghost">View Demo</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* AI Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            The First AI-Native Community Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build Your Community
            <br />
            <span className="text-primary">Let AI Do the Heavy Lifting</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Not another Skool group. Your own branded platform with AI that creates courses, generates playbooks, and grows your community automatically.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/demo" target="_blank">
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          No credit card required • 14-day free trial • Setup in minutes
        </p>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container text-center">
          <p className="text-muted-foreground">
            Built for creators who want AI-powered tools, not just another hosted group.
          </p>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI That Actually Does Work
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop spending hours creating content. Let Klass AI build courses, playbooks, and insights while you focus on what matters — your community.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-lg border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xl">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Klass Wins Over Skool & Circle
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See the difference AI-native makes. Skool and Circle were built for 2023. Klass is built for what's next.
            </p>
          </div>
          <div className="mx-auto overflow-x-auto max-w-4xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-left font-semibold">Feature</th>
                  <th className="py-4 text-center font-semibold text-primary">Klass</th>
                  <th className="py-4 text-center font-semibold">Skool</th>
                  <th className="py-4 text-center font-semibold">Circle</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-4 text-left">{row.feature}</td>
                    <td className="py-4 text-center">
                      {row.klass ? (
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {row.skool ? (
                        <Check className="mx-auto h-5 w-5 text-muted-foreground" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {row.circle ? (
                        <Check className="mx-auto h-5 w-5 text-muted-foreground" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Klass Section */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need, Nothing You Don't
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <BenefitCard
            icon={<Palette className="h-6 w-6" />}
            title="You Own the Brand"
            description="Your logo, colors, navigation, and domain. Klass stays invisible."
          />
          <BenefitCard
            icon={<FolderOpen className="h-6 w-6" />}
            title="One Platform, Everything Inside"
            description="Community, courses, resources, events, and memberships — no tool stacking."
          />
          <BenefitCard
            icon={<CreditCard className="h-6 w-6" />}
            title="Built to Monetize"
            description="Paid memberships, gated content, and Stripe-ready from day one."
          />
          <BenefitCard
            icon={<Smartphone className="h-6 w-6" />}
            title="Mobile-Ready Experience"
            description="Members access everything seamlessly on desktop or mobile. Native app options available."
          />
          <BenefitCard
            icon={<Settings className="h-6 w-6" />}
            title="Self-Serve or Done-For-You"
            description="Set up yourself in minutes, or let us handle everything — your choice."
          />
          <BenefitCard
            icon={<Brain className="h-6 w-6" />}
            title="AI Works While You Sleep"
            description="Content creation, insights, and automation run 24/7. Your platform grows even when you're not online."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose the plan that fits your stage. All plans include AI features. Upgrade anytime.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {/* DIY */}
            <div className="flex flex-col rounded-lg border bg-card p-8">
              <h3 className="font-semibold text-lg">DIY</h3>
              <p className="mt-1 text-sm text-muted-foreground">Self-setup, all features</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$79</span>
                <span className="ml-2 text-muted-foreground">/mo</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">No setup fee</p>
              <ul className="mt-6 flex-1 space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Full platform access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">All AI features included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Community, courses & memberships</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Stripe integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">White-label branding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Mobile-ready experience</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Email support</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/sign-up" className="block">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </div>
            </div>

            {/* Done-With-You (Most Popular) */}
            <div className="flex flex-col rounded-lg border-2 border-primary bg-primary/5 p-8 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
              <h3 className="font-semibold text-lg">Done-With-You</h3>
              <p className="mt-1 text-sm text-muted-foreground">Onboarding call + custom branding</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$99</span>
                <span className="ml-2 text-muted-foreground">/mo</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">+ $499 one-time setup</p>
              <ul className="mt-6 flex-1 space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Everything in DIY, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">1-on-1 onboarding call</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Custom branding setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI training & optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Membership & paywall configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Priority email support</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/sign-up" className="block">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>

            {/* Done-For-You */}
            <div className="flex flex-col rounded-lg border bg-card p-8">
              <h3 className="font-semibold text-lg">Done-For-You</h3>
              <p className="mt-1 text-sm text-muted-foreground">Full setup, migration & priority support</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$149</span>
                <span className="ml-2 text-muted-foreground">/mo</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">+ $1,499 one-time setup</p>
              <ul className="mt-6 flex-1 space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Everything in Done-With-You, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Full platform setup by our team</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Content & member migration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Custom domain setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI workflow optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Priority support with dedicated Slack</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Launch QA & strategy call</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/sign-in" className="block">
                  <Button className="w-full" variant="outline">Book a Call</Button>
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            All plans include hosting, updates, AI features, and platform stability. Native mobile apps available as an upgrade.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-24 text-center">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Build Something Smarter?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            If you're already monetizing a community and want AI to do the heavy lifting, Klass is the platform for you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo" target="_blank">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
              K
            </div>
            <span className="font-semibold">Klass</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Klass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
