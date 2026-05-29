import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DocSearch } from './DocSearch'

describe('DocSearch', () => {
  it('renders the search input', () => {
    render(
      <MemoryRouter>
        <DocSearch />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/search docs/i)).toBeInTheDocument()
  })

  it('shows results when typing a known term', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DocSearch />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/search docs/i)
    await user.type(input, 'growth')

    // At least one result mentioning growth should appear
    const results = await screen.findAllByText(/growth/i)
    expect(results.length).toBeGreaterThan(0)
  })
})
