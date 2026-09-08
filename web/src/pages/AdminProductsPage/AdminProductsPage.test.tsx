import { render } from '@redwoodjs/testing/web'

import AdminProductsPage from './AdminProductsPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminProductsPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminProductsPage />)
    }).not.toThrow()
  })
})
