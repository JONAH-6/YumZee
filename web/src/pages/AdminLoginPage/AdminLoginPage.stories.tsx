import type { Meta, StoryObj } from '@storybook/react'

import AdminLoginPage from './AdminLoginPage'

const meta: Meta<typeof AdminLoginPage> = {
  component: AdminLoginPage,
}

export default meta

type Story = StoryObj<typeof AdminLoginPage>

export const Primary: Story = {}
