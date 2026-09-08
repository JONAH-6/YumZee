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

// ADMIN IMPORTS
import AdminLoginPage from 'src/pages/AdminLoginPage/AdminLoginPage'
import AdminPortalPage from 'src/pages/AdminPortalPage/AdminPortalPage'
import AdminOverviewPage from 'src/pages/AdminOverviewPage/AdminOverviewPage'
import AdminOrdersPage from 'src/pages/AdminOrdersPage/AdminOrdersPage'
import AdminProductsPage from 'src/pages/AdminProductsPage/AdminProductsPage'
import AdminLoggedInUsersPage from 'src/pages/AdminLoggedInUsersPage/AdminLoggedInUsersPage'
import AdminProfilesPage from 'src/pages/AdminProfilesPage/AdminProfilesPage'

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

      {/* ADMIN ROUTES (Standalone pages so they don't have the mobile bottom nav) */}
      <Route path="/admin-login" page={AdminLoginPage} name="adminLogin" />
      <Route path="/admin" page={AdminPortalPage} name="admin" />
      <Route path="/admin/overview" page={AdminOverviewPage} name="adminOverview" />
      <Route path="/admin/orders" page={AdminOrdersPage} name="adminOrders" />
      <Route path="/admin/products" page={AdminProductsPage} name="adminProducts" />
      <Route path="/admin/users" page={AdminLoggedInUsersPage} name="adminLoggedInUsers" />
      <Route path="/admin/profiles" page={AdminProfilesPage} name="adminProfiles" />

      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes