import { render } from '@redwoodjs/testing/web'

import AdminUserDetailPage from './AdminUserDetailPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminUserDetailPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminUserDetailPage id="test-id" />)
    }).not.toThrow()
  })
})
