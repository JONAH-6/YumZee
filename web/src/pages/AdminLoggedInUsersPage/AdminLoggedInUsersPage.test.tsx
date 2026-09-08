import { render } from '@redwoodjs/testing/web'

import AdminLoggedInUsersPage from './AdminLoggedInUsersPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminLoggedInUsersPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminLoggedInUsersPage />)
    }).not.toThrow()
  })
})
