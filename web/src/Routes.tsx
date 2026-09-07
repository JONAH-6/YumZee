import { Router, Route, Set } from '@redwoodjs/router'
import { useAuth } from 'src/contexts/AuthContexts'

import MainLayout from 'src/layouts/MainLayout/MainLayout'
import WelcomePage from 'src/pages/WelcomePage/WelcomePage'
import HomePage from 'src/pages/HomePage/HomePage'
import SearchPage from 'src/pages/SearchPage/SearchPage'
import ProductDetailPage from 'src/pages/ProductDetailPage/ProductDetailPage'
import BasketPage from 'src/pages/BasketPage/BasketPage'
import OrdersPage from 'src/pages/OrdersPage/OrdersPage'
import ProfilePage from 'src/pages/ProfilePage/ProfilePage'
import NotFoundPage from 'src/pages/NotFoundPage/NotFoundPage'

// NEW ADMIN IMPORTS
import AdminLoginPage from 'src/pages/AdminLoginPage/AdminLoginPage'
import AdminPortalPage from 'src/pages/AdminPortalPage/AdminPortalPage'

const Routes = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      {isAuthenticated ? (
        <Set wrap={MainLayout}>
          <Route path="/" page={HomePage} name="home" />
          <Route path="/search" page={SearchPage} name="search" />
          <Route path="/product/{id}" page={ProductDetailPage} name="productDetail" />
          <Route path="/basket" page={BasketPage} name="basket" />
          <Route path="/orders" page={OrdersPage} name="orders" />
          <Route path="/profile" page={ProfilePage} name="profile" />
        </Set>
      ) : (
        <Route path="/" page={WelcomePage} name="welcome" />
      )}

      {/* ADMIN ROUTES (Outside MainLayout so there is no mobile bottom nav) */}
      <Route path="/admin-login" page={AdminLoginPage} name="adminLogin" />
      <Route path="/admin" page={AdminPortalPage} name="admin" />

      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
