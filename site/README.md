# Arraylist Website

Vite + React + Tailwind website for project documentation.

## Source model

- Canonical docs: `../docs/*.md`
- Synced site content: `src/content/docs/*.md`
- Sync command: `npm run docs:sync`

## Local development

```sh
npm install
npm run dev
```

## Build for production

```sh
npm run build
```

The build creates `dist/404.html` from `dist/index.html` to support client-side routing on GitHub Pages.
