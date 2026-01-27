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
  Calendar,
  Palette,
  CreditCard,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
  MessageSquare,
  GraduationCap,
  Share2,
  Star,
  Quote,
  ChevronRight,
  Globe,
  Rocket,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

/* ─────────────────────────── DATA ─────────────────────────── */

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI-Powered Course Creation",
    description:
      "Generate lesson outlines, module structures, and content drafts with AI. Go from idea to published course in minutes, not months.",
    accent: "violet",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Tiered Memberships & Stripe Connect",
    description:
      "Create free, paid, and premium membership tiers. Payments flow directly to your Stripe account — no middlemen, no commission.",
    accent: "fuchsia",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Live Events & Scheduling",
    description:
      "Host workshops, coaching calls, and webinars with built-in scheduling. Integrate with Zoom and YouTube for seamless live sessions.",
    accent: "blue",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Community Feed & Discussions",
    description:
      "Rich discussion feeds with posts, comments, reactions, and categories. Keep your community engaged and connected daily.",
    accent: "emerald",
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Programs with Structured Lessons",
    description:
      "Build multi-module programs with drip content, progress tracking, and gated access. Deliver real transformation step by step.",
    accent: "amber",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Member Management & Analytics",
    description:
      "Track engagement, revenue, course completions, and growth. Manage members with roles, tags, and automated segments.",
    accent: "cyan",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Custom Branding Per Community",
    description:
      "Your logo, your colors, your domain, your navigation. KLASS stays completely invisible — your members only see your brand.",
    accent: "rose",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Affiliate & Referral System",
    description:
      "Let your members become your sales team. Built-in affiliate tracking, custom commission rates, and automated payouts.",
    accent: "orange",
  },
];

const accentClasses: Record<string, { bg: string; text: string; hoverBorder: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", hoverBorder: "hover:border-violet-500/50" },
  fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", hoverBorder: "hover:border-fuchsia-500/50" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", hoverBorder: "hover:border-blue-500/50" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", hoverBorder: "hover:border-emerald-500/50" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", hoverBorder: "hover:border-amber-500/50" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", hoverBorder: "hover:border-cyan-500/50" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", hoverBorder: "hover:border-rose-500/50" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", hoverBorder: "hover:border-orange-500/50" },
};

const pricingTiers = [
  {
    name: "DIY",
    price: 29,
    description: "For solo creators getting started",
    features: [
      "1 community",
      "Community feed & discussions",
      "Basic course builder",
      "Event scheduling",
      "Stripe Connect payments",
      "Custom branding",
      "Email support",
      "Up to 100 members",
    ],
    cta: "Start Building",
    highlight: false,
  },
  {
    name: "Done With You",
    price: 79,
    description: "For growing creators who want more",
    features: [
      "Up to 3 communities",
      "Everything in DIY, plus:",
      "AI-powered course creation",
      "Tiered memberships",
      "Advanced analytics",
      "Affiliate & referral system",
      "Priority support",
      "Unlimited members",
      "Custom domain",
    ],
    cta: "Start Growing",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Done For You",
    price: 199,
    description: "White-glove setup & unlimited scale",
    features: [
      "Unlimited communities",
      "Everything in Done With You, plus:",
      "White-glove onboarding & setup",
      "Dedicated account manager",
      "Custom integrations",
      "Native mobile app option",
      "API access",
      "Multi-admin support",
      "Migration assistance",
    ],
    cta: "Get Started",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Fitness Coach & Course Creator",
    avatar: "SM",
    quote:
      "KLASS replaced Skool, Teachable, AND my email platform. My community feels like MY brand now — not some generic platform. Revenue is up 40% since I switched.",
    stars: 5,
  },
  {
    name: "James Rodriguez",
    role: "Business Mentor",
    avatar: "JR",
    quote:
      "The AI course builder is a game-changer. I outlined a 12-module program in 15 minutes. What used to take me weeks now takes an afternoon.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    role: "Creative Educator",
    avatar: "PS",
    quote:
      "Finally, a platform where I keep 100% of my revenue AND have full creative control. The affiliate system alone brought in 200+ new members last month.",
    stars: 5,
  },
  {
    name: "Marcus Chen",
    role: "Tech Community Leader",
    avatar: "MC",
    quote:
      "I migrated 3,000 members from Circle to KLASS. The custom branding is on another level — my members don&apos;t even know it&apos;s KLASS. It just looks like MY platform.",
    stars: 5,
  },
];

const faqs = [
  {
    question: "How is KLASS different from Skool or Circle?",
    answer:
      "KLASS gives you full white-label branding, AI-powered course creation, and direct Stripe payments from day one. Skool charges $99/mo with their branding everywhere. Circle locks key features behind expensive tiers. KLASS lets you own the entire experience — your brand, your domain, your revenue.",
  },
  {
    question: "Do I need technical skills to get started?",
    answer:
      "Not at all. KLASS is designed for creators, not developers. You can set up your community, create courses, and launch memberships without writing a single line of code. Our AI tools make course creation especially fast.",
  },
  {
    question: "How do payments work?",
    answer:
      "Members pay you directly through Stripe Connect. KLASS never touches your revenue — no cuts, no commissions, no middlemen. Money flows straight from your members' cards to your bank account.",
  },
  {
    question: "Can I migrate from another platform?",
    answer:
      "Yes! We provide migration guides and hands-on support (especially on the Done For You plan). We'll help you move your content, set up your new community, and make the transition seamless for your members.",
  },
  {
    question: "What's included in the AI course creation?",
    answer:
      "Our AI helps you generate lesson outlines, module structures, and content drafts based on your topic. Just describe what you want to teach, and KLASS will create a structured curriculum you can customize. It turns weeks of planning into minutes.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes — custom domains are supported on the Done With You and Done For You plans. Your community lives at your URL, with your branding. KLASS is completely invisible to your members.",
  },
  {
    question: "How does the affiliate system work?",
    answer:
      "Enable the built-in affiliate program and your members can share unique referral links. You set the commission rate, tracking is automatic, and payouts are handled through Stripe. It's like having a sales team that only gets paid when they bring results.",
  },
  {
    question: "What if I outgrow my plan?",
    answer:
      "Upgrade anytime with zero downtime. Your community, content, and members stay exactly as they are. You just unlock more features and capacity.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. No contracts, no lock-in, no cancellation fees. If KLASS isn't the right fit, you can cancel with one click.",
  },
];

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-sm transition-transform group-hover:scale-105">
              K
            </div>
            <span className="font-bold text-xl tracking-tight">KLASS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">
              FAQ
            </a>
          </nav>
          <nav className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Sign In
              </Button>
            </Link>
            <Link href="/create-community">
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ───── Hero Section ───── */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-fuchsia-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-gradient-to-br from-blue-500/8 to-transparent rounded-full blur-3xl" />

        <div className="container relative flex flex-col items-center justify-center gap-8 py-28 text-center md:py-40">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The all-in-one creator community platform</span>
          </div>

          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                Build Premium
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Communities
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                That Earn
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
              Launch courses, memberships, events, and community spaces — all under
              your brand. AI-powered tools help you create faster. Stripe keeps you
              in control of every dollar.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row mt-2">
            <Link href="/create-community">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-base px-8 h-13 cursor-pointer"
              >
                Start Building Your Community <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white text-base px-8 h-13 cursor-pointer"
              >
                Watch Demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500 mt-2">
            No credit card required · Set up in under 5 minutes
          </p>
        </div>
      </section>

      {/* ───── Social Proof Bar ───── */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 items-center">
            <SocialStat number="2,500+" label="Active Creators" />
            <SocialStat number="8,000+" label="Communities Built" />
            <SocialStat number="500K+" label="Members Engaged" />
            <SocialStat number="$12M+" label="Creator Revenue" />
          </div>
        </div>
      </section>

      {/* ───── Features Grid ───── */}
      <section id="features" className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
              Everything You Need
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Powerful tools for powerful creators
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              Stop juggling five different platforms. KLASS gives you community,
              courses, events, memberships, analytics, and AI — all in one place.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const colors = accentClasses[feature.accent] || accentClasses.violet;
              return (
                <div
                  key={feature.title}
                  className={`group relative flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all ${colors.hoverBorder} hover:bg-zinc-900`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} ${colors.text} transition-colors`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-white">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section
        id="how-it-works"
        className="border-y border-zinc-800/80 bg-zinc-900/30 py-24 md:py-32"
      >
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-fuchsia-400 uppercase tracking-wider mb-3">
              Simple Setup
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Go live in three steps
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              No dev team. No complicated setup. From sign-up to earning revenue in
              minutes.
            </p>
          </div>
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="01"
                title="Create Your Community"
                description="Pick a name, upload your logo, set your brand colors. Your community is live in under 5 minutes — with your identity front and center."
                icon={<PlusCircle className="h-5 w-5" />}
                gradient="from-violet-500 to-violet-600"
              />
              <StepCard
                number="02"
                title="Add Content & Structure"
                description="Build courses with AI, set up membership tiers, schedule events, and organize resources. Our tools make content creation effortless."
                icon={<BookOpen className="h-5 w-5" />}
                gradient="from-fuchsia-500 to-fuchsia-600"
              />
              <StepCard
                number="03"
                title="Grow & Earn"
                description="Invite members, activate affiliates, connect Stripe, and start earning. Track everything with built-in analytics as your community scales."
                icon={<TrendingUp className="h-5 w-5" />}
                gradient="from-pink-500 to-pink-600"
              />
            </div>
            {/* Connecting line (desktop) */}
            <div className="hidden md:flex items-center justify-center mt-12">
              <Link href="/create-community">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-base px-8 h-12 cursor-pointer"
                >
                  Start Building Now <Rocket className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Pricing Section ───── */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-3">
              Simple Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Choose the plan that fits your ambition
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              No hidden fees. No revenue cuts. No surprises. Just transparent pricing
              that scales with you.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-xl p-8 transition-all ${
                  tier.highlight
                    ? "border-2 border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-zinc-900/50 shadow-xl shadow-violet-500/10 scale-[1.02] lg:scale-105"
                    : "border border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {tier.description}
                  </p>
                </div>
                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">
                    ${tier.price}
                  </span>
                  <span className="ml-2 text-zinc-500">/month</span>
                </div>
                <ul className="mt-8 flex-1 space-y-4">
                  {tier.features.map((item, i) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          tier.highlight && i === 1
                            ? "text-violet-400"
                            : "text-emerald-400"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          i === 1 && (tier.name === "Done With You" || tier.name === "Done For You")
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
                  <Link href="/create-community" className="block">
                    <Button
                      className={`w-full h-12 border-0 text-base cursor-pointer ${
                        tier.highlight
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      {tier.cta} <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-zinc-500">
              All plans include hosting, SSL, updates, and platform maintenance.
              <br />
              KLASS never takes a cut of your revenue. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
              Loved by Creators
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Hear from the community
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-zinc-400 text-lg">
              Thousands of creators have switched to KLASS. Here&apos;s what they have
              to say.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-zinc-700"
              >
                <Quote className="h-8 w-8 text-violet-500/30" />
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FAQ Section ───── */}
      <section id="faq" className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-fuchsia-400 uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Got questions? We&apos;ve got answers.
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

      {/* ───── Final CTA ───── */}
      <section className="relative overflow-hidden py-28 md:py-36">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-violet-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-to-bl from-fuchsia-500/8 to-transparent rounded-full blur-3xl" />

        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Join 2,500+ creators already building on KLASS</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white">
            Your community is waiting.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Start building today.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-400 leading-relaxed">
            Courses, memberships, events, and community — all under your brand.
            Create something extraordinary and earn what you deserve.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-community">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-base px-8 h-13 cursor-pointer"
              >
                Start Building Your Community <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-6">
            Plans from $29/mo · No credit card to explore · Cancel anytime
          </p>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                K
              </div>
              <span className="font-semibold text-zinc-300">KLASS</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="#features" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                FAQ
              </a>
              <Link
                href="/demo"
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
            </div>
            <p className="text-sm text-zinc-600">
              &copy; {new Date().getFullYear()} KLASS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────── SUB-COMPONENTS ─────────────────────── */

function SocialStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent md:text-4xl">
        {number}
      </p>
      <p className="text-sm text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
  gradient,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center gap-4 p-8 rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <span className="text-2xl font-bold text-white">
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
