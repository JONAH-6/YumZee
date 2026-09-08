import type { Meta, StoryObj } from '@storybook/react'

import AdminLoggedInUsersPage from './AdminLoggedInUsersPage'

const meta: Meta<typeof AdminLoggedInUsersPage> = {
  component: AdminLoggedInUsersPage,
}

export default meta

type Story = StoryObj<typeof AdminLoggedInUsersPage>

export const Primary: Story = {}
