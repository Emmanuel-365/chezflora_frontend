import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import OtpPage from './pages/OtpPage';
import OrdersPage from './pages/OrdersPage';
import AccountPage from './pages/AccountPage';
import CheckoutPage from './pages/CheckoutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import DevisPage from './pages/DevisPage';
import AbonnementsPage from './pages/AbonnementsPage';
import AteliersPage from './pages/AteliersPage';
import WishlistPage from './pages/WishlistPage';
import ArticlesPage from './pages/ArticlesPage';
import RealisationsPage from './pages/RealisationsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserStatsPage from './pages/AdminUserStatsPage';
import AdminUserBansPage from './pages/AdminUserBansPage';
import AdminWishlistsPage from './pages/AdminWishListsPage';
import AdminAddressesPage from './pages/AdminAddressesPage';
import AdminCommandsPage from './pages/AdminCommandsPage';
import AdminCommandLinesPage from './pages/AdminCommandLinesPage';
import AdminCartsPage from './pages/AdminCartsPage';
import AdminCommandsRevenuePage from './pages/AdminCommandsRevenuePage';
import AdminCommandsPendingPage from './pages/AdminCommandsPendingPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminProductsStatsPage from './pages/AdminProductsStatsPage';
import AdminPromotionsPage from './pages/AdminPromotionsPage';
import AdminLowStockPage from './pages/AdminLowStockPage';
import AdminAteliersPage from './pages/AdminAteliersPage';
import AdminAteliersStatsPage from './pages/AdminAteliersStatsPage';
import AdminAteliersParticipantsPage from './pages/AdminAteliersParticipantsPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminDevisPage from './pages/AdminDevisPage';
import AdminAbonnementsPage from './pages/AbonnementsPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import AdminCommentairesPage from './pages/AdminCommentairesPage';
import AdminRealisationsPage from './pages/AdminRealisationsPage';
import AdminPaiementsPage from './pages/AdminPayementsPage';
import AdminParametresPage from './pages/AdminParametresPage';
import AtelierDetailPage from './pages/AtelierDetailPage';
import RealisationDetailPage from './pages/RealisationDetailPage';

const App: React.FC = () => (
  <Routes>
    <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />   
    <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
    <Route path="/admin/users/stats" element={<ProtectedRoute><AdminUserStatsPage /></ProtectedRoute>} />
    <Route path="/admin/users/bans" element={<ProtectedRoute><AdminUserBansPage /></ProtectedRoute>} />
    <Route path="/admin/wishlists" element={<ProtectedRoute><AdminWishlistsPage /></ProtectedRoute>} />
    <Route path="/admin/addresses" element={<ProtectedRoute><AdminAddressesPage /></ProtectedRoute>} />

    <Route path="/admin/commands" element={<ProtectedRoute><AdminCommandsPage /></ProtectedRoute>} />
    <Route path="/admin/command-lines" element={<ProtectedRoute><AdminCommandLinesPage /></ProtectedRoute>} />
    <Route path="/admin/carts" element={<ProtectedRoute><AdminCartsPage /></ProtectedRoute>} />
    <Route path="/admin/commands/revenue" element={<ProtectedRoute><AdminCommandsRevenuePage /></ProtectedRoute>} />
    <Route path="/admin/commands/pending" element={<ProtectedRoute><AdminCommandsPendingPage /></ProtectedRoute>} />

    <Route path="/admin/products" element={<ProtectedRoute><AdminProductsPage /></ProtectedRoute>} />
    <Route path="/admin/categories" element={<ProtectedRoute><AdminCategoriesPage /></ProtectedRoute>} />
    <Route path="/admin/products/stats" element={<ProtectedRoute><AdminProductsStatsPage /></ProtectedRoute>} />
    <Route path="/admin/promotions" element={<ProtectedRoute><AdminPromotionsPage /></ProtectedRoute>} />
    <Route path="/admin/products/low-stock" element={<ProtectedRoute><AdminLowStockPage /></ProtectedRoute>} />

    <Route path="/admin/ateliers" element={<ProtectedRoute><AdminAteliersPage /></ProtectedRoute>} />
    <Route path="/admin/ateliers/stats" element={<ProtectedRoute><AdminAteliersStatsPage /></ProtectedRoute>} />
    <Route path="/admin/ateliers/:atelierId/participants" element={<ProtectedRoute><AdminAteliersParticipantsPage /></ProtectedRoute>} />

    <Route path="/admin/services" element={<ProtectedRoute><AdminServicesPage /></ProtectedRoute>} />
    <Route path="/admin/devis" element={<ProtectedRoute><AdminDevisPage /></ProtectedRoute>} />
    <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminAbonnementsPage /></ProtectedRoute>} />

    <Route path="/admin/articles" element={<ProtectedRoute><AdminArticlesPage /></ProtectedRoute>} />
    <Route path="/admin/comments" element={<ProtectedRoute><AdminCommentairesPage /></ProtectedRoute>} />
    <Route path="/admin/realisations" element={<ProtectedRoute><AdminRealisationsPage /></ProtectedRoute>} />

    <Route path="/admin/payments" element={<ProtectedRoute><AdminPaiementsPage /></ProtectedRoute>} />

    <Route path="/admin/settings/general" element={<ProtectedRoute><AdminParametresPage /></ProtectedRoute>} />

    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/services/:id" element={<ServiceDetailPage />} />
    <Route path="/blog" element={<ArticlesPage />} />
    <Route path="/blog/:id" element={<ArticleDetailPage />} />
    <Route path="/realisations" element={<RealisationsPage />} />
    <Route path="/realisations/:id" element={<RealisationDetailPage/>}/>
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/ateliers" element={<AteliersPage />} />
    <Route path="/ateliers/:id" element={<AtelierDetailPage />} />
    <Route
      path="/cart"
      element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/account"
      element={
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/devis"
      element={
        <ProtectedRoute>
          <DevisPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/abonnements"
      element={
        <ProtectedRoute>
          <AbonnementsPage />
        </ProtectedRoute>
      }
    />
    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/otp" element={<OtpPage />} />
  </Routes>
);

export default App;