import { render } from '@redwoodjs/testing/web'

import AdminNotificationsPage from './AdminNotificationsPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminNotificationsPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminNotificationsPage />)
    }).not.toThrow()
  })
})
