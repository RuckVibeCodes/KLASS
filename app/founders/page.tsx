"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  FolderOpen,
  Calendar,
  Palette,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Bot,
  Clock,
  Shield,
  Gift,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { LeadCaptureForm } from "@/components/leads/LeadCaptureForm";
import { useLeadTracking } from "@/hooks/useLeadTracking";

// Countdown timer component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 justify-center">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Mins" },
        { value: timeLeft.seconds, label: "Secs" },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 min-w-[60px]">
            <span className="text-2xl font-bold text-white">{item.value.toString().padStart(2, "0")}</span>
          </div>
          <span className="text-xs text-zinc-500 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Spots remaining counter
function SpotsCounter({ total, taken }: { total: number; taken: number }) {
  const remaining = total - taken;
  const percentage = (taken / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-zinc-400">Founding spots claimed</span>
        <span className="text-violet-400 font-semibold">{taken} / {total}</span>
      </div>
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-center text-sm text-emerald-400 mt-2 font-medium">
        Only {remaining} spots remaining!
      </p>
    </div>
  );
}

const foundingBenefits = [
  {
    icon: <Gift className="h-5 w-5" />,
    title: "Lifetime Access",
    description: "$297 one time — never pay again. Ever.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Unlimited Members",
    description: "No caps. Grow to 100, 1,000, or 10,000 members.",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "All AI Features",
    description: "AI lesson outlines, onboarding content, and future AI tools.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "All Future Features",
    description: "Every update, every new feature — included forever.",
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "Founding Member Badge",
    description: "Exclusive badge on your profile. Early supporter recognition.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Priority Support",
    description: "Direct line to the team. Your feedback shapes the product.",
  },
];

const includedFeatures = [
  "Community feed & discussions",
  "Courses & programs with drip content",
  "Resource vault with gated access",
  "Events & calendar with Zoom/YouTube",
  "Full white-label branding",
  "Custom domain support",
  "Stripe Connect — direct payments",
  "Analytics dashboard",
  "AI lesson outline generator",
  "AI onboarding content creator",
  "Multi-tier memberships",
  "Affiliate tracking system",
  "Mobile-optimized (PWA)",
  "Unlimited admins",
];

const comparisonData = [
  { platform: "Skool", monthly: "$99/mo", yearly: "$1,188/yr", threeYear: "$3,564" },
  { platform: "Circle", monthly: "$89/mo", yearly: "$1,068/yr", threeYear: "$3,204" },
  { platform: "KLASS Founder", monthly: "$297", yearly: "One-time", threeYear: "$297 total" },
];

export default function FoundersPage() {
  // Set deadline to 14 days from now (or use a fixed date)
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14);

  // Simulate spots taken (you'd fetch this from API in production)
  const spotsTaken = 23;

  // Track page view for known leads
  useLeadTracking({ pageName: "founders_page" });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
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
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                ← Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-fuchsia-500/10 to-transparent rounded-full blur-3xl" />

        <div className="container relative flex flex-col items-center justify-center gap-6 py-20 text-center md:py-28">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            <span>Limited to 100 Founding Members</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Lock in KLASS
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Forever. For $297.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
            Join the first 100 creators to get <span className="text-white font-semibold">lifetime access</span> to KLASS — 
            the AI-powered community platform that puts your brand first.
          </p>

          {/* Countdown */}
          <div className="mt-4">
            <p className="text-sm text-zinc-500 mb-3">Offer ends in:</p>
            <CountdownTimer targetDate={deadline} />
          </div>

          {/* Spots Counter */}
          <div className="w-full mt-6">
            <SpotsCounter total={100} taken={spotsTaken} />
          </div>

          {/* CTA */}
          <div className="mt-6">
            {/* TODO: Replace with Stripe payment link */}
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-lg px-10 h-14"
              disabled
            >
              Claim Your Spot — $297 <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-xs text-zinc-500 mt-3">
              One-time payment · Instant access · No recurring fees
            </p>
          </div>

          {/* Lead Capture Form */}
          <div className="mt-8 max-w-md mx-auto">
            <LeadCaptureForm showSocialProof />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 border-y border-zinc-800/30 bg-zinc-900/20">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
            <span className="text-zinc-500">Join creators from:</span>
            {["Course Creators", "Coaches", "Community Leaders", "Content Creators", "Educators"].map(
              (type) => (
                <div key={type} className="flex items-center gap-2 text-zinc-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  <span>{type}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              What You Get as a Founding Member
            </h2>
            <p className="mt-3 text-zinc-400">
              Everything. Forever. No strings attached.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {foundingBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-3">
              The Math
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Save thousands. Literally.
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
              See what you'd pay on other platforms over 3 years vs. KLASS Founding Member pricing.
            </p>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Platform</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">Monthly</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">Year 1</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-violet-400">3-Year Total</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={row.platform}
                    className={`border-b border-zinc-800/50 ${
                      i === 2 ? "bg-violet-500/10" : i % 2 === 0 ? "bg-zinc-950/50" : "bg-zinc-900/30"
                    }`}
                  >
                    <td className={`px-6 py-4 text-sm ${i === 2 ? "text-white font-semibold" : "text-zinc-300"}`}>
                      {row.platform}
                      {i === 2 && <span className="ml-2 text-xs text-violet-400">(You)</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-zinc-400">{row.monthly}</td>
                    <td className="px-6 py-4 text-center text-sm text-zinc-400">{row.yearly}</td>
                    <td className={`px-6 py-4 text-center text-sm font-semibold ${i === 2 ? "text-emerald-400" : "text-zinc-300"}`}>
                      {row.threeYear}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-white">
              That's <span className="text-emerald-400">$3,267 saved</span> over 3 years vs. Skool.
            </p>
            <p className="text-zinc-500 mt-2">And it only gets better the longer you stay.</p>
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
              Full Feature List
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything included. No upsells.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {includedFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3 p-3">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-4">
              <Bot className="h-3.5 w-3.5" />
              <span>AI-Powered</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Built-in AI that actually helps
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
              No ChatGPT tab-switching. AI is baked into your workflow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">AI Lesson Outlines</h3>
              <p className="text-zinc-400 text-sm">
                Describe your course idea. Get a complete lesson structure in seconds — 
                titles, descriptions, durations. Just edit and publish.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">AI Onboarding Content</h3>
              <p className="text-zinc-400 text-sm">
                Generate welcome posts, first DMs, and email sequences tailored to your 
                community's vibe. Onboarding on autopilot.
              </p>
            </div>
          </div>

          <p className="text-center text-zinc-500 mt-8">
            More AI features coming soon — all included in your Founding Member access.
          </p>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-16">
        <div className="container text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-6">
            Join creators who are building smarter
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Course Creators", "Coaches", "Community Leaders", "Content Creators", "Educators"].map(
              (type) => (
                <div key={type} className="flex items-center gap-2 text-zinc-500">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  <span className="text-sm font-medium">{type}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Questions? Answered.</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "What happens after the 100 spots are gone?",
                a: "The Founding Member deal disappears. Future users will pay $79/month like everyone else. This is a one-time opportunity to lock in lifetime access.",
              },
              {
                q: "Is this really lifetime? No catches?",
                a: "Yes. One payment. Lifetime access. No monthly fees. No annual renewals. No 'lifetime means 10 years' fine print. As long as KLASS exists, you have access.",
              },
              {
                q: "What if KLASS shuts down?",
                a: "We're building for the long haul. But if something happens, you'll always be able to export your content and member data. Your community is yours.",
              },
              {
                q: "Can I migrate from Skool or Circle?",
                a: "Yes. We provide migration guides and support. Your content comes over, and your members create new accounts on your branded platform.",
              },
              {
                q: "Do I need to know code?",
                a: "Zero code required. Sign up, customize your branding, add content, invite members. That's it.",
              },
              {
                q: "What about mobile apps?",
                a: "KLASS is fully mobile-optimized out of the box. Native iOS/Android apps are on the roadmap — and yes, Founding Members get those too.",
              },
            ].map((faq) => (
              <div key={faq.q} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-zinc-900/50 p-10 md:p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-violet-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Ready to own your platform?
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-6">
                100 spots. $297. Lifetime access. This deal won't come back.
              </p>

              <SpotsCounter total={100} taken={spotsTaken} />

              <div className="mt-8">
                {/* TODO: Replace with Stripe payment link */}
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/25 text-lg px-10 h-14"
                  disabled
                >
                  Claim Your Founding Spot — $297 <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-xs text-zinc-500 mt-3">
                  Secure checkout · Instant access · 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-xs">
                K
              </div>
              <span className="font-semibold text-sm">KLASS</span>
            </div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} KLASS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
