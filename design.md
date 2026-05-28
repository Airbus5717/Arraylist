# Design — Arraylist

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre

editorial

## Macrostructure family

- Home / index pages: **Index-First** — categorized link rows, hairline dividers, no hero cards
- Content / docs pages: **Long Document** — single prose column (~65ch), inline section heads, side doc rail on lg+

## Theme

- `--color-paper`   oklch(14% 0.02 260)
- `--color-paper-2` oklch(17% 0.025 260)
- `--color-ink`     oklch(88% 0.02 145)
- `--color-ink-2`   oklch(62% 0.04 145)
- `--color-rule`    oklch(26% 0.02 260)
- `--color-accent`  oklch(78% 0.19 145)
- `--color-focus`   oklch(78% 0.19 145)

## Typography

- Display: JetBrains Mono, weight 500, style normal
- Body:    JetBrains Mono, weight 400
- Mono:    JetBrains Mono, weight 400
- Display tracking: -0.02em
- Type scale anchor: `--text-display` = clamp(1.75rem, 3vw + 1rem, 2.75rem)

## Spacing

4-point named scale. Values live in `site/src/tokens.css`. Pages must use named
tokens (`var(--space-md)`), never raw values.

## Motion

- Easings: cubic-bezier(0.16, 1, 0.3, 1) named `--ease-out`
- Reveal pattern: none on pages; micro-interactions on buttons and copy only
- Reduced-motion fallback: opacity-only, ≤ 150 ms

## Microinteractions stance

- Silent success on copy; no toasts
- Hover delay 0 ms on nav links; focus ring instant
- Copy button fades in on hover (desktop) or stays visible (touch)

## CTA voice

- Primary CTA: typographic link with arrow (`Quickstart →`), accent colour, 1px underline on hover
- Secondary CTA: muted ink-2 link, same arrow pattern

## Navigation & footer

- Nav: **N8 Terminal command** — `> arraylist --home --docs --github`
- Footer: **Ft4 Dense typographic** — colophon block in small mono

## Per-page allowances

- Home: Index-First link index only; no enrichment
- Docs: Long Document prose; typography-only; no hero enrichment
- 404: minimal prose + typographic links

## What pages MUST share

- Terminal dark palette and phosphor accent
- JetBrains Mono across display, body, mono
- N8 nav and Ft4 footer
- Typographic link CTAs (no filled button blocks)
- Hairline `--color-rule` dividers

## What pages MAY differ on

- Home uses full-width index rows; docs use 65ch prose + side rail
- Docs page adds TOC and prev/next navigation

## Exports

### tokens.css

See `site/src/tokens.css`.

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:   oklch(14% 0.02 260);
  --color-ink:     oklch(88% 0.02 145);
  --color-accent:  oklch(78% 0.19 145);
  --font-display:  "JetBrains Mono", monospace;
  --font-body:     "JetBrains Mono", monospace;
  --spacing-md:    1.5rem;
  --text-md:       1rem;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG tokens.json

```json
{
  "color": {
    "paper":  { "$value": "oklch(14% 0.02 260)", "$type": "color" },
    "ink":    { "$value": "oklch(88% 0.02 145)", "$type": "color" },
    "accent": { "$value": "oklch(78% 0.19 145)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "JetBrains Mono", "$type": "fontFamily" },
    "body":    { "$value": "JetBrains Mono", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:         14% 0.02 260;
  --foreground:         88% 0.02 145;
  --primary:            78% 0.19 145;
  --primary-foreground: 12% 0.03 145;
  --muted:              26% 0.02 260;
  --muted-foreground:   62% 0.04 145;
  --border:             26% 0.02 260;
  --input:              26% 0.02 260;
  --ring:               78% 0.19 145;
  --radius:             0.375rem;
}
```
