import type { Meta, StoryObj } from '@storybook/react'

import AdminOverviewPage from './AdminOverviewPage'

const meta: Meta<typeof AdminOverviewPage> = {
  component: AdminOverviewPage,
}

export default meta

type Story = StoryObj<typeof AdminOverviewPage>

export const Primary: Story = {}
