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
} from "lucide-react";

const faqs = [
  {
    question: "How is Klass different from Skool?",
    answer:
      "Skool is a hosted platform — you rent space inside their ecosystem. Klass gives you your own branded platform powered by our infrastructure. Your logo, your colors, your content, your members — without being locked into someone else's roadmap.",
  },
  {
    question: "Is Klass a SaaS tool or a custom build?",
    answer:
      "Klass is a done-for-you platform. We configure, brand, and launch your community and content system so you don't have to piece tools together or manage infrastructure yourself.",
  },
  {
    question: "Why is there a setup fee?",
    answer:
      "The setup fee covers platform provisioning, white-label branding, membership and paywall configuration, Stripe integration, and launch and QA support. This isn't a template you sign up for — it's your platform, configured and ready to use.",
  },
  {
    question: "What does the monthly fee cover?",
    answer:
      "The monthly maintenance fee covers hosting and infrastructure, ongoing updates and improvements, platform support, and long-term stability. Think of it as keeping your platform running smoothly — similar to hosting and maintenance for any serious software product.",
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
            <Link href="/demo-community" target="_blank">
              <Button variant="ghost">View Demo</Button>
            </Link>
            <Link href="/sign-in">
              <Button>Book a Setup Call</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your Branded Community
            <br />
            <span className="text-muted-foreground">& Course Platform</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Not another Skool group. Your own platform.
          </p>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Launch a fully branded community, courses, resources, and memberships — powered by our infrastructure, owned by your brand.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/demo-community" target="_blank">
            <Button size="lg" className="gap-2">
              View Demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Book a Setup Call
            </Button>
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container text-center">
          <p className="text-muted-foreground">
            Built for creators who&apos;ve outgrown Skool and want full control.
          </p>
        </div>
      </section>

      {/* Why Klass Section */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Creators Choose Klass
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
            title="Done-For-You Setup"
            description="We configure, brand, and launch your platform — you focus on content."
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Your Platform Includes
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Community"
              description="Posts, discussions, and engagement — under your brand."
            />
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Programs & Courses"
              description="Structured lessons with progress tracking and gated access."
            />
            <FeatureCard
              icon={<FolderOpen className="h-6 w-6" />}
              title="Resources Vault"
              description="Templates, files, and links organized by tier."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Live Events"
              description="Host trainings, workshops, and calls with Zoom or YouTube."
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="White-Label Branding"
              description="Rename sections, customize colors, upload your logo — make it yours."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Membership Paywalls"
              description="Free and paid tiers with full access control."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="flex flex-col rounded-lg border bg-card p-8">
            <h3 className="font-semibold text-lg">Platform Setup</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">$999</span>
              <span className="ml-2 text-muted-foreground">one-time</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Starting at</p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Branded platform setup</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Community, courses, and memberships configured</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Stripe integration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Mobile-ready experience</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Launch support</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col rounded-lg border border-primary bg-primary/5 p-8 shadow-lg">
            <h3 className="font-semibold text-lg">Ongoing Maintenance</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">$49</span>
              <span className="ml-2 text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">After setup</p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Hosting & infrastructure</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Updates & improvements</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Platform stability</span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Native mobile apps and custom features available as upgrades.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link href="/sign-in">
            <Button size="lg">Book a Setup Call</Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container">
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
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-4">Who Klass Is For</h3>
                <p className="text-muted-foreground">
                  Creators who are already monetizing courses, communities, coaching, or memberships. You understand what works. You want a platform that reflects your brand — not one that puts someone else&apos;s logo next to yours.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Who Klass Is Not For</h3>
                <p className="text-muted-foreground">
                  Beginners still figuring out their offer. Creators looking for a free tool to test ideas. If you need a hosted group to get started, Skool is fine. Klass is for what comes after.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-24 text-center">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Own Your Platform?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            If you&apos;re already monetizing a community and want more control, Klass is the next step.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo-community" target="_blank">
              <Button size="lg" className="gap-2">
                View Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Book a Setup Call
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

function FeatureCard({
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
