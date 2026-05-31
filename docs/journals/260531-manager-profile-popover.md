# Manager Profile Popover — Clean Backward-Compatible Extension

**Date**: 2026-05-31
**Severity**: Low
**Component**: AppShell / AdminDashboard
**Status**: Resolved

## What Happened

Added a `profile` prop to `AppShell` that conditionally wires the header avatar into a Radix Popover for manager role. When present, clicking the avatar shows a card with name, position (ShieldCheck icon), email (Mail icon), phone (Phone icon), and a rose-gradient logout button. When absent (other roles), avatar stays inert — zero behavior change.

## The Brutal Truth

This was a textbook boring feature. The kind that should be boring. No yak shaving, no dependency hell, no `any` casts smuggled in. The only thing worth mentioning is that we resisted the urge to over-engineer it — no new file, no new component, no popover abstraction layer "for future use." It's 53 lines in AppShell and a one-liner in the admin dashboard.

## Technical Details

- **AppShell.tsx**: +53 lines — added `Profile | null` to props, wrapped avatar in Radix `<Popover.Root>` conditionally, profile card uses the same gradient-card + shadow pattern as the existing notification popover
- **AdminDashboard/index.tsx**: +1 line — passes dummy manager data (hardcoded for now, awaiting backend hookup)
- **Tests**: 32/32 pass, no regressions
- **Build**: 10.5s
- **Dependencies**: 0 added (Radix Popover already in the tree)

## What We Tried

Nothing to try — this was a straight shot. The only decision point was "new component file vs inline" and we chose inline because the profile card is presentation-only and won't be reused elsewhere in this sprint.

## Root Cause Analysis

No failure here. The need arose because manager wireframes showed a profile popover, but the `AppShell` only had a static avatar. The prop-based approach keeps the shell agnostic about roles — it just renders what it's given.

## Lessons Learned

- Conditional popover wrapping is a clean pattern when the trigger element already exists
- Radix Popover is battle-tested in this codebase (notification bell uses it); reusing the same primitives keeps styling consistent
- Hardcoded manager data is fine for now — the contract (`Profile` interface) is what matters. Backend integration just has to match the shape.

## Next Steps

1. Replace hardcoded manager data in `AdminDashboard` with API response when auth backend is wired
2. No other follow-up — this feature is closed
