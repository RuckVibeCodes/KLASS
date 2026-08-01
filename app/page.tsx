import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
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
  X,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
  ChevronRight,
  Bot,
  Wand2,
} from "lucide-react";

const faqs = [
  {
    question: "How is KLASS different from Skool?",
    answer:
      "Skool charges $99/mo from day one and your community lives inside Skool's branding. KLASS lets you start free, keeps your brand front and center, and routes payments directly to your Stripe account. You own the experience — your logo, your colors, your domain.",
  },
  {
    question: "Is KLASS really free to start?",
    answer:
      "Yes. The Free tier gives you full access to every feature — community, courses, resources, events, branding — for up to 50 paying members. No credit card required. You only upgrade to Pro ($79/mo) when your community grows beyond 50 members.",
  },
  {
    question: "How do payments work?",
    answer:
      "Your members pay you directly through Stripe Connect. KLASS never touches your revenue — no cuts, no commissions, no middlemen. Money goes straight from your members' cards to your bank account.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Custom domains are fully supported. Your community lives at your URL, with your branding. KLASS is completely invisible to your members.",
  },
  {
    question: "What about mobile?",
    answer:
      "KLASS is fully responsive and mobile-optimized out of the box. Your members get a seamless experience on any device. Native iOS and Android apps — branded with your name — are available as an upgrade.",
  },
  {
    question: "Will Apple take a percentage of my subscriptions?",
    answer:
      "No. All payments are handled on the web via Stripe. The mobile app (if enabled) is for access and engagement only — no in-app purchases, no Apple tax.",
  },
  {
    question: "Can I migrate from Skool or another platform?",
    answer:
      "Yes. We provide migration guides and support to help you move your content and community over. Your members will create new accounts on your platform, and we'll help make the transition smooth.",
  },
  {
    question: "Who owns my data and content?",
    answer:
      "You do. Your brand, your content, your member data — it's all yours. KLASS provides the infrastructure and keeps everything running.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. No contracts, no lock-in. Cancel your Pro subscription anytime and you'll revert to the Free tier (up to 50 members).",
  },
];

const features = [
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI Course Builder",
    description:
      "Describe your course idea, get a complete lesson structure in seconds. AI generates outlines, descriptions, and durations.",
    highlight: true,
  },
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: "AI Onboarding",
    description:
      "Auto-generate welcome posts, first DMs, and email sequences tailored to your community's vibe. Onboarding on autopilot.",
    highlight: true,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community Feed",
    description:
      "Rich discussions, posts, and engagement — all under your brand. Keep your community active and connected.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Courses & Programs",
    description:
      "Structured lessons with progress tracking, drip content, and gated access. Deliver real transformation.",
  },
  {
    icon: <FolderOpen className="h-6 w-6" />,
    title: "Resource Vault",
    description:
      "Templates, downloads, guides, and links — organized by tier. Give members instant access to your best assets.",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Live Events",
    description:
      "Host workshops, coaching calls, and trainings with Zoom or YouTube integration. Build real-time connection.",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "White-Label Branding",
    description:
      "Your logo, your colors, your sections, your domain. KLASS stays completely invisible to your members.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics & Insights",
    description:
      "Track member engagement, course completions, revenue, and growth. Know what's working and double down.",
  },
];

const comparisonRows = [
  { feature: "AI course builder", klass: true, skool: false, circle: false },
  { feature: "AI onboarding content", klass: true, skool: false, circle: false },
  { feature: "Free tier", klass: true, skool: false, circle: false },
  { feature: "White-label branding", klass: true, skool: false, circle: "Partial" },
  { feature: "Direct Stripe payments", klass: true, skool: false, circle: true },
  { feature: "Community feed", klass: true, skool: true, circle: true },
  { feature: "Courses built-in", klass: true, skool: true, circle: true },
  { feature: "Events & calendar", klass: true, skool: true, circle: true },
  { feature: "Resource library", klass: true, skool: false, circle: "Add-on" },
  { feature: "Custom domain", klass: true, skool: false, circle: true },
  { feature: "Starting price", klass: "$0/mo", skool: "$99/mo", circle: "$89/mo" },
];

export default async function LandingPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Founding Member Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-center py-2 px-4 text-sm">
        <Link href="/founders" className="hover:underline flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span><strong>Founding Member Deal:</strong> $297 lifetime access — only 100 spots</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-sm transition-transform group-hover:scale-105">
              K
            </div>
            <span className="font-bold text-xl tracking-tight">KLASS</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/founders">
              <Button variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-zinc-800">
                Founding Members
              </Button>
            </Link>
            <Link href="/launch-audit">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Launch Audit
              </Button>
            </Link>
            <Link href="/demo" target="_blank">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                View Demo
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/redirect">
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25">
                    Go to Dashboard
                  </Button>
                </Link>
                <SignOutButton>
                  <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-500/10 to-transparent rounded-full blur-3xl" />

        <div className="container relative flex flex-col items-center justify-center gap-8 py-28 text-center md:py-40">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Bot className="h-3.5 w-3.5" />
            <span>AI-powered community platform — free to start</span>
          </div>

          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                Your Brand.
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Your Money.
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                Your Community.
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
              Build a branded community with <span className="text-violet-400">AI that helps you create</span> — 
              courses, onboarding, content. Your fans pay you directly via Stripe.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row mt-2">
            <Link href={isLoggedIn ? "/redirect" : "/sign-up"}>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-base px-8 h-12"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white text-base px-8 h-12"
              >
                View Demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500 mt-2">
            Free up to 50 members · Full features · No credit card
          </p>
        </div>
      </section>

      {/* Social Proof / Trust Bar */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-10">
        <div className="container">
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              Trusted by creators who demand more
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {["Course Creators", "Coaches", "Community Leaders", "Content Creators", "Educators"].map(
                (type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 text-zinc-500"
                  >
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                )
              )}
            </div>
            <div className="flex items-center gap-8 mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">$0</p>
                <p className="text-xs text-zinc-500">to start</p>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-zinc-500">of your revenue</p>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">0%</p>
                <p className="text-xs text-zinc-500">KLASS branding</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
              AI-Powered Platform
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Everything Skool does.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Plus AI.
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              Stop stitching together tools and ChatGPT tabs. KLASS has AI built in — 
              generating courses, onboarding content, and more.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative flex flex-col gap-4 rounded-xl border p-6 transition-all hover:bg-zinc-900 ${
                  (feature as any).highlight 
                    ? "border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-zinc-900/50 hover:border-violet-500/70" 
                    : "border-zinc-800 bg-zinc-900/50 hover:border-violet-500/50"
                }`}
              >
                {(feature as any).highlight && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                      AI
                    </span>
                  </div>
                )}
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors group-hover:bg-violet-500/20 ${
                  (feature as any).highlight ? "bg-violet-500/20 text-violet-300" : "bg-violet-500/10 text-violet-400"
                }`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-white">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Not Skool? — Competitive Positioning */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-fuchsia-400 uppercase tracking-wider mb-3">
              The KLASS Difference
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Why creators switch to KLASS
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              Skool charges $99/mo before you earn a dime. Circle locks branding behind premium tiers.
              KLASS gives you everything from day one — for free.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-violet-400">
                      KLASS
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                      Skool
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                      Circle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-b border-zinc-800/50 ${
                        i % 2 === 0 ? "bg-zinc-950/50" : "bg-zinc-900/30"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.klass === "boolean" ? (
                          row.klass ? (
                            <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-zinc-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold text-emerald-400">
                            {row.klass}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.skool === "boolean" ? (
                          row.skool ? (
                            <Check className="h-5 w-5 text-zinc-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-zinc-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-zinc-400">
                            {row.skool}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.circle === "boolean" ? (
                          row.circle ? (
                            <Check className="h-5 w-5 text-zinc-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-zinc-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-zinc-400">
                            {row.circle}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
              Simple Setup
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Launch in three steps
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              No dev team needed. No complicated setup. Go from sign-up to live community in minutes.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="01"
                title="Sign Up Free"
                description="Create your account in 30 seconds. No credit card, no commitments. Just pick a name and go."
                icon={<Zap className="h-5 w-5" />}
              />
              <StepCard
                number="02"
                title="Customize & Brand"
                description="Upload your logo, set your colors, configure your sections. Make it unmistakably yours."
                icon={<Palette className="h-5 w-5" />}
              />
              <StepCard
                number="03"
                title="Launch & Earn"
                description="Invite members, connect Stripe, and start earning. Your community is live — your brand, your revenue."
                icon={<CreditCard className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-3">
              Simple Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Start free. Upgrade when you grow.
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              No hidden fees, no revenue cuts, no surprises. Pay only when your community outgrows the free tier.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
            {/* Free Tier */}
            <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">Free</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Everything you need to start
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Shield className="h-5 w-5 text-zinc-400" />
                </div>
              </div>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-white">$0</span>
                <span className="ml-2 text-zinc-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Free forever · Up to 50 members
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {[
                  "Up to 50 paying members",
                  "Community feed & discussions",
                  "Courses & programs",
                  "Resource vault",
                  "Events & calendar",
                  "Full white-label branding",
                  "Stripe Connect integration",
                  "Custom domain support",
                  "Analytics dashboard",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/sign-up" className="block">
                  <Button className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-white border-0 text-base">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="relative flex flex-col rounded-xl border-2 border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-zinc-900/50 p-8 shadow-xl shadow-violet-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  Most Popular
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">Pro</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    For growing communities
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                  <Zap className="h-5 w-5 text-violet-400" />
                </div>
              </div>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-white">$79</span>
                <span className="ml-2 text-zinc-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Cancel anytime · No setup fees
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {[
                  "Unlimited members",
                  "Everything in Free, plus:",
                  "Priority support",
                  "Advanced analytics",
                  "Custom integrations",
                  "Dedicated onboarding",
                  "Native mobile app option",
                  "API access",
                  "Multi-admin support",
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        i === 1 ? "text-violet-400" : "text-emerald-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        i === 1
                          ? "font-medium text-violet-300"
                          : "text-zinc-300"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/sign-up" className="block">
                  <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 text-base shadow-lg shadow-violet-500/25">
                    Start Free, Upgrade Later
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500">
              All plans include hosting, SSL, updates, and platform maintenance.
              <br />
              KLASS never takes a cut of your revenue. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 mb-4">
                  <CreditCard className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  Direct Payments
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Stripe Connect means money goes from your members straight to your bank account. No middleman. No commission.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500/10 mb-4">
                  <Palette className="h-6 w-6 text-fuchsia-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  Your Brand, Not Ours
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Your logo, colors, domain, and navigation. Your members will never know KLASS exists — and that&apos;s the point.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  Zero Risk to Start
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Build your entire community before paying a dime. Upgrade only when you hit 50 members and you&apos;re ready to scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Got questions?
            </h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-zinc-800"
                >
                  <AccordionTrigger className="text-left text-zinc-200 hover:text-white hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden py-28 md:py-36">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-violet-500/10 to-transparent rounded-full blur-3xl" />

        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Join creators who own their platform</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white">
            Stop renting.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Start owning.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-400 leading-relaxed">
            Your community deserves your brand, not someone else&apos;s. Launch your
            white-label platform today — free, fast, and fully yours.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-base px-8 h-12"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white text-base px-8 h-12"
              >
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-6">
            Free forever up to 50 members · Upgrade to Pro at $79/mo
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
              K
            </div>
            <span className="font-semibold text-zinc-300">KLASS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/demo"
              target="_blank"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/sign-up"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/terms"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/acceptable-use"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Acceptable Use
            </Link>
          </div>
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} KLASS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col items-center text-center gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
        <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          {number}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-violet-400">{icon}</span>
        <h3 className="font-semibold text-lg text-white">{title}</h3>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
