import { render } from '@redwoodjs/testing/web'

import AdminHelpPage from './AdminHelpPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminHelpPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminHelpPage />)
    }).not.toThrow()
  })
})
