import type { Meta, StoryObj } from '@storybook/react'

import AdminProfilesPage from './AdminProfilesPage'

const meta: Meta<typeof AdminProfilesPage> = {
  component: AdminProfilesPage,
}

export default meta

type Story = StoryObj<typeof AdminProfilesPage>

export const Primary: Story = {}
