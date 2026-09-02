# KLASS PR Stack Merge Plan — 2026-09-02

KLASS has a long but mostly mergeable Geoffrey PR stack. This plan turns the open work into a practical review order so Matt can reduce drift without accidentally merging overlapping funnel/admin changes out of sequence.

## Current snapshot

- Open Geoffrey PRs reviewed: #10 through #22.
- GitHub reports every PR in this set as `MERGEABLE` as of 2026-09-02 03:00 UTC.
- Checks show one successful required check plus one pending/non-conclusive Vercel-style status entry on each PR; re-run final checks before merging.
- Largest overlap areas:
  - `app/founders/page.tsx`: #10, #11, #19, #21
  - `app/(platform)/[community-slug]/admin/page.tsx`: #10, #11, #16
  - `app/page.tsx`: #20, #22
  - README/env setup: #10, #11, #14

## Recommended merge order

| Order | PR | Recommendation | Why |
| --- | --- | --- | --- |
| 1 | #14 — `chore: add environment readiness check` | Merge first | Low-risk operations/docs improvement. Helps validate env setup before touching AI, Stripe, or admin flows. |
| 2 | #17 — `fix: count comment activity in member signals` | Merge next | Small correctness fix isolated to `lib/member-signals.ts`; low conflict risk and improves member analytics quality. |
| 3 | #12 — `feat: wire lesson outline route to AI client` | Merge with #13 review | Isolated AI route work. Verify env handling from #14 before release. |
| 4 | #13 — `feat: add quiz AI fallback` | Merge after #12 | Complements lesson AI reliability. Only overlaps AI client/generate quiz path, not funnel/admin work. |
| 5 | #15 — `feat: add monetization playbook` | Merge | Isolated playbook template content. Useful for creator activation and unlikely to conflict. |
| 6 | #18 — `feat: add platform growth metrics` | Merge | System-admin metrics are isolated from founder/admin funnel stack. |
| 7 | #16 — `feat: add launch readiness checklist` | Rebase after #10/#11 decision, then merge | Touches admin landing page that also changed in #10/#11. Keep, but avoid reviewing before the founder checkout stack is settled. |
| 8 | #20 — `feat: add creator launch audit page` | Merge before #22 or rebase #22 after it | Both #20 and #22 add top-level marketing navigation on `app/page.tsx`; choose this first because launch audit supports activation. |
| 9 | #22 — `feat: add migration playbook page` | Rebase after #20, then merge | Valuable conversion page, but it shares `app/page.tsx` with #20. |
| 10 | #19 — `feat: add founder ROI calculator` | Rebase with #21, then merge | High-value founder-funnel calculator, but it touches the same page as #21. |
| 11 | #21 — `feat: add founders checkout fallback` | Merge with/after #19 | Production checkout resilience. Reconcile copy/button placement with #19 on `app/founders/page.tsx`. |
| 12 | #10 — `feat: enable founders checkout with Stripe` | Decide if superseded by #21 before merge | Important but older and broad. It overlaps README/env/admin/founders files and may be partly superseded by #21. |
| 13 | #11 — `feat: add playbook progress overview` | Split or rebase last | Broadest overlap with #10 plus adds playbook admin page. Best handled after the founder checkout direction is clear. |

## Decision calls

### Merge quickly

- #14, #17, #12, #13, #15, #18 are the least entangled and should reduce backlog without increasing merge risk.

### Rebase before review

- #16, #20, #22, #19, #21 should be rebased against fresh `main` in the listed order because they touch shared funnel/admin pages.

### Explicit product decision needed

- #10 vs #21: both affect founder checkout. Decide whether #21 is a fallback layer on top of #10 or whether it replaces part of #10.
- #11 depends on that checkout/admin direction because it repeats several files from #10 and adds the playbook progress page.

## Suggested commands for Matt

```bash
# Low-risk first pass
gh pr checkout 14 --repo RuckVibeCodes/KLASS && npm run lint && npm run build
gh pr checkout 17 --repo RuckVibeCodes/KLASS && npm run lint && npm run build
gh pr checkout 12 --repo RuckVibeCodes/KLASS && npm run lint && npm run build
gh pr checkout 13 --repo RuckVibeCodes/KLASS && npm run lint && npm run build

# Then review/rebase the overlapping funnel stack in sequence:
# 20 -> 22 -> 19 -> 21 -> decide 10 -> decide/split 11
```

## Merge-risk notes

- Do not merge #10 and #11 blindly back-to-back; they share most of the same founder/admin files and may represent older stacked work.
- Do not merge #20 and #22 without checking `app/page.tsx` navigation/CTA copy after the second merge.
- Do not merge #19 and #21 without reviewing the final founder page for duplicate calculators, duplicate fallback messaging, or conflicting checkout CTAs.
- After each merge, refresh the next candidate branch and rerun lint/build; all PRs are currently mergeable, but the shared-page stack will drift once the first one lands.
