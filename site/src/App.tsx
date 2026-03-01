import { Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { docs, getDocBySlug, getDocContent, getDocNeighbors, isDocSlug } from './content/docRegistry'

function App() {
  return (
    <div className="relative min-h-screen py-10 text-slate-900 dark:text-stone-100 sm:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 sm:px-6 lg:px-8">
        <header className="panel reveal flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="font-mono text-sm uppercase tracking-[0.14em] text-slate-500 dark:text-stone-400">
              Arraylist
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Dynamic Arrays For C
            </h1>
          </div>
          <nav className="flex items-center gap-2 text-base">
            <NavButton to="/" label="Home" />
            <NavButton to="/docs/overview" label="Docs" />
            <a
              href="https://github.com/Airbus5717/Arraylist"
              className="btn-quiet"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/docs" element={<Navigate replace to="/docs/overview" />} />
            <Route path="/docs/:slug" element={<DocsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="panel reveal px-5 py-4 text-base text-slate-600 dark:text-stone-300 sm:px-7">
          Internals-first docs for memory layout, growth, and checked API contracts.
        </footer>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="panel reveal px-5 py-7 sm:px-7 sm:py-8">
        <p className="badge">Arraylist Docs</p>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Learn Arraylist quickly.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700 dark:text-stone-200">
          Start with overview, then quickstart and API.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <NavLink className="btn-strong" to="/docs/quickstart">
            Quickstart
          </NavLink>
          <NavLink className="btn-quiet" to="/docs/api-reference">
            API Reference
          </NavLink>
        </div>
      </section>

      <section className="panel reveal px-5 py-7 sm:px-7 sm:py-8" style={{ animationDelay: '120ms' }}>
        <h3 className="font-display text-2xl font-semibold">Docs</h3>
        <ul className="mt-4 space-y-2">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <NavLink
                to={`/docs/${doc.slug}`}
                className="group flex items-start justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 transition hover:border-[var(--line-strong)]"
              >
                <span>
                  <span className="block text-lg font-medium">{doc.title}</span>
                  <span className="block text-base text-slate-600 dark:text-stone-300">{doc.description}</span>
                </span>
                <span className="mt-1 font-mono text-sm text-slate-500 group-hover:text-slate-700 dark:text-stone-400 dark:group-hover:text-stone-200">
                  /{doc.slug}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function DocsPage() {
  const { slug: slugParam } = useParams()

  if (!slugParam || !isDocSlug(slugParam)) {
    return <NotFoundPage />
  }

  const currentDoc = getDocBySlug(slugParam)
  const markdown = getDocContent(slugParam)
  const { previous, next } = getDocNeighbors(slugParam)

  if (!markdown) {
    return (
      <section className="panel px-5 py-6 sm:px-6 sm:py-7">
        <h2 className="font-display text-2xl font-semibold">Missing content</h2>
        <p className="mt-3 text-slate-700 dark:text-stone-200">
          The source file for <code className="badge-inline">{currentDoc.slug}.md</code> was not found in the synced
          docs set.
        </p>
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="panel reveal h-fit px-5 py-5 sm:px-6 lg:sticky lg:top-8">
        <p className="font-mono text-sm uppercase tracking-[0.12em] text-slate-500 dark:text-stone-400">
          Documentation
        </p>
        <nav className="mt-3 space-y-1">
          {docs.map((doc) => (
            <NavLink
              key={doc.slug}
              to={`/docs/${doc.slug}`}
              className={({ isActive }) =>
                `block rounded-lg border px-3 py-2 text-base transition ${
                  isActive
                    ? 'border-[var(--line-strong)] bg-[var(--surface)] text-slate-900 dark:text-stone-100'
                    : 'border-transparent text-slate-600 hover:border-[var(--line)] hover:bg-[var(--surface-soft)] dark:text-stone-300'
                }`
              }
            >
              {doc.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="panel reveal min-w-0 px-5 py-7 sm:px-8 sm:py-9" style={{ animationDelay: '90ms' }}>
        <div className="mb-5 border-b border-[var(--line)] pb-4">
          <p className="font-mono text-sm uppercase tracking-[0.12em] text-slate-500 dark:text-stone-400">
            /docs/{currentDoc.slug}
          </p>
          <h2 className="mt-1 font-display text-4xl font-bold tracking-tight">{currentDoc.title}</h2>
          <p className="mt-2 text-lg text-slate-700 dark:text-stone-200">{currentDoc.description}</p>
        </div>

        <article className="doc-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {markdown}
          </ReactMarkdown>
        </article>

        <div className="mt-10 grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
          {previous ? (
            <NavLink className="doc-nav-link" to={`/docs/${previous.slug}`}>
              <span className="block font-mono text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-stone-400">
                Previous
              </span>
              <span className="mt-1 block font-medium">{previous.title}</span>
            </NavLink>
          ) : (
            <div />
          )}
          {next ? (
            <NavLink className="doc-nav-link text-left sm:text-right" to={`/docs/${next.slug}`}>
              <span className="block font-mono text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-stone-400">
                Next
              </span>
              <span className="mt-1 block font-medium">{next.title}</span>
            </NavLink>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function NotFoundPage() {
  return (
    <section className="panel px-5 py-8 sm:px-7">
      <p className="badge">404</p>
      <h2 className="mt-4 font-display text-3xl font-semibold">Page not found</h2>
      <p className="mt-3 text-lg text-slate-700 dark:text-stone-200">
        Use the documentation index to continue browsing the Arraylist project.
      </p>
      <div className="mt-5 flex gap-3">
        <NavLink className="btn-strong" to="/docs/overview">
          Open docs
        </NavLink>
        <NavLink className="btn-quiet" to="/">
          Return home
        </NavLink>
      </div>
    </section>
  )
}

function NavButton({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `btn-quiet ${isActive ? 'border-[var(--line-strong)] bg-[var(--surface)]' : ''}`}
    >
      {label}
    </NavLink>
  )
}

export default App
