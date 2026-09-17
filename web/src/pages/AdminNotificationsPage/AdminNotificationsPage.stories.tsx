import type { Meta, StoryObj } from '@storybook/react'

import AdminNotificationsPage from './AdminNotificationsPage'

const meta: Meta<typeof AdminNotificationsPage> = {
  component: AdminNotificationsPage,
}

export default meta

type Story = StoryObj<typeof AdminNotificationsPage>

export const Primary: Story = {}
