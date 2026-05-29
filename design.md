# Design — Arraylist (Interactive Technical Reference)

**Current direction (2026-05-29 onward)**

This document captures the evolved design system for the Arraylist documentation website. The site has moved beyond its original locked "austere technical manual / Memory Manual" phase (preserved in git history and the reference image below) into a more demonstrative and readable **Interactive Technical Reference**.

Historical reference (original Memory Manual concept that seeded the project):

`/home/cr89/.codex/generated_images/019e71de-9dfb-7e92-9ca0-508a4330c8dd/ig_0211708fc8709925016a19100aebe08191af2c1eafe4c69bb9.png`

The new direction directly addresses readability for long-form technical prose, brings the core memory model and API behaviors to life through purposeful animation, and unifies the feel of the home and documentation experiences.

## Genre

Interactive technical reference for systems programming in C. Precision and trust remain non-negotiable; the primary teaching tools are now live, state-driven visuals that make invisible rules (ownership, invalidation, growth, checked failure) tangible.

## Macrostructure

- **Home / index**: Strong hero featuring a prominent interactive core model, concise orientation text, and clear pathways into the reference material. Visual models are first-class citizens.
- **Documentation pages**: Comfortable long-form reading experience (mixed typography optimized for prose) with contextual live visual explainers placed alongside or triggered by the relevant API contracts, examples, and edge-case discussions. Sidebar navigation + in-page outline.
- **Unified language**: Home and docs pages share typography, spacing rhythm, color language, and component vocabulary so readers never feel a jarring shift in density or tone when moving between overview and deep reference.

## Theme & Color (evolved)

Core technical palette is retained and refined:

- `--color-paper` / near-white backgrounds
- `--color-ink` / cool near-black for primary text
- Supporting grays for secondary text and rules
- `--color-accent` (green) for checked / safe paths
- `--color-warn` (amber) for unchecked compatibility paths

Surfaces gain subtle layering and better focus states. The previous faint dot-grid background texture has been retired in favor of cleaner paper with purposeful rule lines.

## Typography (split system — the key readability improvement)

- **Prose / long-form body**: Highly legible sans-serif stack (Inter or high-quality system-ui) with comfortable size, generous leading (1.7+), and optimal measure (~70-75ch) for extended reading of contracts, explanations, and examples.
- **Code, pre, filenames, paths, nav labels, UI chrome**: JetBrains Mono (preserved for authenticity with C source and terminal-adjacent tooling).
- Strong but restrained display scale. Optical sizing and weight choices tuned per context (hero vs body vs caption).
- All code remains copy-paste ready and visually distinct.

## Visual System (the heart of the experience)

A small, focused library of reusable, stateful animated diagram components illustrates the exact semantics described in the reference:

Priority initial set (mapped to the major sections of the API reference and overview):

1. Memory layout & ownership (Array(T) block vs Slice(T) range vs Span(T) borrowed view, allocation, free)
2. Growth dynamics (array_reserve, geometric doubling on array_try_push, realloc consequences)
3. Checked access & failure (array_try_at, bounds, null handling)
4. Slice and span creation (array_try_slice_t, array_try_span_t, lifetime rules, reallocation effects)
5. Iteration (array_for_each_t stepping, pointer validity)
6. Nullable helpers (array_length_or0 / is_empty_or_true behavior on NULL)

Characteristics:
- Every transition and state change corresponds to documented macro behavior or edge case.
- Interactive controls (step, reset, trigger failure path) where they aid understanding.
- Fully accessible: respects `prefers-reduced-motion`, provides ARIA labels and descriptions, keyboard operable.
- Registry-driven so content authors can reference them from documentation without duplicating logic.

Implementation starts with pure React + CSS (zero new runtime dependencies for the first prototypes), with room to adopt a lightweight animation primitive later if orchestration needs grow.

## Component & Content Rules

- Code examples and snippets stay authentic, syntax-highlighted, and equipped with copy controls. No fake IDE chrome.
- Visuals are the primary vehicle for teaching dynamic behavior; prose remains authoritative for preconditions, failure modes, complexity, and portability notes.
- Navigation stays compact and text-first (`arraylist` / `home` / `docs` / `github`).
- No decorative badges, pills, gradient blobs, repetitive card grids, or terminal cosplay.
- Visual callouts in markdown are lightweight and do not interfere with the compile-verified C snippets.

## Motion & Accessibility

- Motion is purposeful (demonstrating state change, growth, invalidation) rather than decorative.
- Global, automatic respect for `prefers-reduced-motion`.
- All interactive visuals are operable by keyboard and announce changes to assistive tech where feasible.
- High contrast maintained; focus rings are clear and consistent.

## Integration with Canonical Documentation

The four files in `docs/` (`overview.md`, `quickstart.md`, `api-reference.md`, `examples.md`) remain the single source of truth for all contracts and code examples. They continue to be synced into the site at build time and are verified by the existing strict C compile test suite.

Visuals are referenced from within the prose (via a convention such as special code fences or component embeds once the markdown pipeline is extended). They illustrate; they never replace the tested code.

## What Home and Documentation Pages Share

- The split typography system (prose + code)
- The same color tokens, focus language, and spacing rhythm
- Access to the same live visual model library (exploratory and prominent on home; contextual and embedded on docs pages)
- Clean, docs-first density with breathing room for careful reading
- Strong semantic structure and accessibility baseline

## Historical Note on Previous Phase

The first production site (commit `fa5fa2b` and the subsequent Memory Manual pass) deliberately adopted an extremely austere terminal-free manual aesthetic with a single static CSS diagram. That phase successfully removed all decorative noise and aligned implementation with the original locked spec. The current Interactive Technical Reference direction keeps the hard-won precision and trustworthiness while adding the missing readability and demonstrative power that long-form C systems documentation requires.

Future page work should follow the principles in this document rather than the earlier austere manual ruleset.

---

This design is intentionally scoped: a small, high-signal set of visuals (not one bespoke animation per micro-API), excellent reading typography, and a single coherent experience language across the entire site.
