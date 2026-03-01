import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const useProjectBase = process.env.GITHUB_ACTIONS === 'true' && repositoryName

export default defineConfig({
  plugins: [react()],
  base: useProjectBase ? `/${repositoryName.toLowerCase()}/` : '/',
})
