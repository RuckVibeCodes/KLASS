import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

const migrationSteps = [
  {
    title: "Map the community",
    duration: "Day 1",
    description:
      "Export your member list, current tiers, spaces, courses, resources, and live-event cadence so nothing valuable gets stranded.",
    checklist: ["Member CSV", "Tier access map", "Course/resource inventory"],
  },
  {
    title: "Rebuild the branded experience",
    duration: "Days 2–3",
    description:
      "Create the KLASS community shell with your domain, colors, sections, paid tiers, Stripe products, and starter posts before inviting members.",
    checklist: ["Custom domain", "Stripe products", "Welcome + FAQ posts"],
  },
  {
    title: "Invite in waves",
    duration: "Days 4–5",
    description:
      "Move power users first, validate login/payment access, then invite the full member base with clear instructions and support windows.",
    checklist: ["Pilot invite", "Full import", "Support office hours"],
  },
  {
    title: "Retire the old platform",
    duration: "Days 6–7",
    description:
      "Pin redirect notices, close duplicate conversations, and archive exports so the new branded home becomes the single source of truth.",
    checklist: ["Redirect post", "Final export", "Cancellation reminder"],
  },
];

const assets = [
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Launch copy",
    detail: "Email, DM, and pinned-post language that explains why members are moving and what they need to do next.",
  },
  {
    icon: <Download className="h-5 w-5" />,
    title: "Export checklist",
    detail: "A platform-by-platform list for Skool, Circle, Kajabi, Patreon, Discord, and course-hosting assets.",
  },
  {
    icon: <MessageSquareText className="h-5 w-5" />,
    title: "Member support scripts",
    detail: "Short answers for login issues, billing questions, app expectations, and why the branded community is better.",
  },
];

const riskControls = [
  "Keep the old community read-only for at least 14 days after launch.",
  "Invite moderators and best members first so the new feed feels alive before the mass announcement.",
  "Send one billing clarification before moving paid tiers so members know Stripe charges are still yours.",
  "Use KLASS resources and welcome posts to centralize the links people ask for repeatedly.",
];

export default function MigrationPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="relative overflow-hidden border-b border-zinc-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-zinc-950 to-zinc-950" />
        <div className="container relative py-24 md:py-32">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            ← Back to KLASS
          </Link>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
              <Rocket className="h-3.5 w-3.5" />
              Migration playbook for creator communities
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              Move from Skool, Circle, or Discord without losing momentum.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              KLASS gives founders a one-week migration path: preserve your members, rebuild your branded home, and make the switch feel like an upgrade instead of a disruption.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500">
                <Link href="/sign-up">
                  Start the move <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                <Link href="/founders">See founding member offer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">7-day plan</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">A migration sequence your members can follow.</h2>
          </div>
          <p className="max-w-xl text-zinc-400">
            The goal is not a messy copy/paste job. It is a controlled relaunch that makes KLASS feel like the official home from the first login.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {migrationSteps.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                  <span className="text-sm font-bold">0{index + 1}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  {step.duration}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{step.description}</p>
              <ul className="mt-5 space-y-2">
                {step.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40 py-16 md:py-20">
        <div className="container grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">Included assets</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Bring the move, the message, and the members.</h2>
            <p className="mt-4 text-zinc-400">
              KLASS should replace the platform tax and the brand compromise without creating extra launch anxiety for the founder.
            </p>
          </div>
          <div className="grid gap-4">
            {assets.map((asset) => (
              <div key={asset.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <div className="mb-3 flex items-center gap-3 text-violet-300">
                  {asset.icon}
                  <h3 className="font-semibold text-white">{asset.title}</h3>
                </div>
                <p className="text-sm leading-6 text-zinc-400">{asset.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container grid gap-8 py-16 md:grid-cols-2 md:py-24">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Reduce churn during the switch.</h2>
          <ul className="mt-6 space-y-4">
            {riskControls.map((control) => (
              <li key={control} className="flex gap-3 text-sm leading-6 text-zinc-300">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-400" />
                {control}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Turn migration into a relaunch moment.</h2>
          <p className="mt-4 leading-7 text-zinc-300">
            Announce the move as a better member experience: one branded domain, cleaner courses, direct founder billing, and no platform logo competing with yours.
          </p>
          <Button asChild size="lg" className="mt-8 border-0 bg-white text-zinc-950 hover:bg-zinc-200">
            <Link href="/sign-up">
              Create your KLASS community <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
