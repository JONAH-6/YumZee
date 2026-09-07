import { render } from '@redwoodjs/testing/web'

import AdminLoginPage from './AdminLoginPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminLoginPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminLoginPage />)
    }).not.toThrow()
  })
})
