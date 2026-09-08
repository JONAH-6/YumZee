import type { Meta, StoryObj } from '@storybook/react'

import AdminOrdersPage from './AdminOrdersPage'

const meta: Meta<typeof AdminOrdersPage> = {
  component: AdminOrdersPage,
}

export default meta

type Story = StoryObj<typeof AdminOrdersPage>

export const Primary: Story = {}
