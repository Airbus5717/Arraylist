import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const useProjectBase = process.env.GITHUB_ACTIONS === 'true' && repositoryName

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project paths are case-sensitive and must match the repo name.
  base: useProjectBase ? `/${repositoryName}/` : '/',
})
