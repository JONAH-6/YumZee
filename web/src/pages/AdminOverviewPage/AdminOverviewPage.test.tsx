import { render } from '@redwoodjs/testing/web'

import AdminOverviewPage from './AdminOverviewPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminOverviewPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminOverviewPage />)
    }).not.toThrow()
  })
})
