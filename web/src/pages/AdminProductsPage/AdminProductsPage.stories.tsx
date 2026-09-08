import type { Meta, StoryObj } from '@storybook/react'

import AdminProductsPage from './AdminProductsPage'

const meta: Meta<typeof AdminProductsPage> = {
  component: AdminProductsPage,
}

export default meta

type Story = StoryObj<typeof AdminProductsPage>

export const Primary: Story = {}
