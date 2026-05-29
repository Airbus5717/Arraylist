import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GrowthVisualizer } from './GrowthVisualizer'

describe('GrowthVisualizer', () => {
  it('renders initial state and push button', () => {
    render(<GrowthVisualizer />)
    expect(screen.getByText(/Push next value/i)).toBeInTheDocument()
    expect(screen.getByText('count')).toBeInTheDocument()
  })

  it('increases count when pushing', async () => {
    const user = userEvent.setup()
    render(<GrowthVisualizer />)

    const btn = screen.getByText(/Push next value/i)
    await user.click(btn)

    expect(await screen.findByText(/c=1/i)).toBeInTheDocument()
  })

  it('renders only the current capacity as slot boxes', async () => {
    const user = userEvent.setup()
    render(<GrowthVisualizer />)

    const card = screen.getByRole('figure', { name: /GrowthVisualizer/i })
    const slots = within(card).getByRole('img', { name: /Array element slots/i })
    const btn = within(card).getByRole('button', { name: /Push next value/i })
    const renderedSlots = () => slots.querySelectorAll('.visual-prototype__slot')

    expect(renderedSlots()).toHaveLength(0)
    expect(screen.getByText(/no allocated slots yet/i)).toBeInTheDocument()

    await user.click(btn)
    expect(renderedSlots()).toHaveLength(1)
    expect(screen.getByText(/green boxes = count \(1\); total allocated boxes = capacity \(1\)/i)).toBeInTheDocument()

    await user.click(btn)
    expect(renderedSlots()).toHaveLength(2)
    expect(screen.getByText(/green boxes = count \(2\); total allocated boxes = capacity \(2\)/i)).toBeInTheDocument()

    await user.click(btn)
    expect(renderedSlots()).toHaveLength(4)
    expect(screen.getByText(/green boxes = count \(3\); total allocated boxes = capacity \(4\)/i)).toBeInTheDocument()

    await user.click(btn)
    await user.click(btn)
    expect(renderedSlots()).toHaveLength(8)
    expect(screen.getByText(/green boxes = count \(5\); total allocated boxes = capacity \(8\)/i)).toBeInTheDocument()
  })
})
