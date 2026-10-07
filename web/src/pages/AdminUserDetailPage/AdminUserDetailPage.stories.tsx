import type { Meta, StoryObj } from '@storybook/react'

import AdminUserDetailPage from './AdminUserDetailPage'

const meta: Meta<typeof AdminUserDetailPage> = {
  component: AdminUserDetailPage,
}

export default meta

type Story = StoryObj<typeof AdminUserDetailPage>

export const Primary: Story = {
  args: {
    id: 'test-id',
  },
}
