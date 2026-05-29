import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './layout/SiteLayout'
import { DocsPage } from './pages/DocsPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaygroundPage } from './pages/PlaygroundPage'

function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<Navigate replace to="/docs/overview" />} />
        <Route path="/docs/:slug" element={<DocsPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SiteLayout>
  )
}

export default App
