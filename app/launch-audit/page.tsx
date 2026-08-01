import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDollarSign, Clock3, Sparkles, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const auditSections = [
  {
    title: "Audience proof",
    icon: Users,
    checks: [
      "A clear niche with at least one public demand signal: comments, DMs, waitlist replies, paid calls, or repeated questions.",
      "A named starter cohort: 25-100 people who would immediately understand why the community exists.",
      "Three transformation promises written in the audience's language, not platform feature language.",
    ],
  },
  {
    title: "Offer clarity",
    icon: Target,
    checks: [
      "One flagship outcome that members can describe in a sentence.",
      "A first-month curriculum, resource vault, or challenge that creates a quick win within seven days.",
      "A simple pricing hypothesis with an annual option and a reason to join before the first cohort closes.",
    ],
  },
  {
    title: "Revenue readiness",
    icon: CircleDollarSign,
    checks: [
      "Stripe products, success/cancel URLs, and webhook secrets are configured before launch traffic arrives.",
      "Founding-member math is documented: member cap, revenue target, upgrade path, and support load.",
      "Refund, cancellation, and access rules are written before the first checkout link is shared.",
    ],
  },
  {
    title: "Launch operations",
    icon: Clock3,
    checks: [
      "A 14-day launch calendar exists with content, emails/DMs, live calls, and close-cart reminders.",
      "Admin dashboard has starter posts, pinned welcome content, and an onboarding path for new members.",
      "Support owner is assigned for payment issues, login issues, and migration questions during launch week.",
    ],
  },
];

const launchPlan = [
  "Day 0: Publish the transformation promise and collect replies from warm audience members.",
  "Days 1-3: Invite the first 10 beta members manually; record objections and missing setup work.",
  "Days 4-7: Add the first challenge, resource, or live workshop so members get a visible early win.",
  "Days 8-11: Open founding-member checkout, share proof from beta members, and answer objections publicly.",
  "Days 12-14: Run a close-cart push, migrate committed members, and schedule the next cohort milestone.",
];

export default function LaunchAuditPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800/80 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_42%)]">
        <div className="container py-12 md:py-16">
          <Button asChild variant="ghost" className="mb-8 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to KLASS
            </Link>
          </Button>

          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-200">
              <Sparkles className="h-4 w-4" /> Creator launch readiness audit
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Know whether your community is ready to sell before you open the cart.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Use this quick audit to turn a course or community idea into a founder-grade launch plan. If you can check these boxes, KLASS can become the branded home for your members, payments, content, and onboarding.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500">
                <Link href="/sign-up">
                  Start building free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-900">
                <Link href="/demo">View demo community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-2 md:py-16">
        {auditSections.map((section) => {
          const Icon = section.icon;
          return (
            <article key={section.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold">{section.title}</h2>
              </div>
              <ul className="space-y-4 text-sm leading-6 text-zinc-300">
                {section.checks.map((check) => (
                  <li key={check} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-400" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="container pb-16">
        <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/60 via-zinc-900 to-zinc-950 p-6 md:p-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold">14-day launch sprint</h2>
            <p className="mt-3 text-zinc-300">
              Keep the first launch intentionally small. The goal is not a perfect platform; it is proof that the audience will pay for the transformation and return for the community.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {launchPlan.map((step, index) => (
              <li key={step} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-6 text-zinc-300">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
                  {index + 1}
                </div>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
