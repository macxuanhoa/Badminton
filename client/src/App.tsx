import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { NotificationToast } from './components/common/NotificationToast'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireRole } from './components/auth/RequireRole'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { ShopPage } from './pages/ShopPage'
import { AdminPage } from './pages/AdminPage'
import { ProfilePage } from './pages/ProfilePage'
import { Booking3DPage } from './pages/Booking3DPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { KnowledgePage } from './pages/KnowledgePage'
import { KnowledgeDetailPage } from './pages/KnowledgeDetailPage'
import { useStore } from './store/useStore'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'

export default function App() {
  const fetchInitialData = useStore((s) => s.fetchInitialData)

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  return (
    <>
      <NotificationToast />
      <Routes>
        <Route element={<PageShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/knowledge/:slug" element={<KnowledgeDetailPage />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/admin" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout /></RequireRole>}>
            <Route index element={<AdminPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="users" element={<RequireRole roles={['ADMIN']}><AdminUsersPage /></RequireRole>} />
          </Route>
        </Route>
        <Route path="/booking-3d" element={<Booking3DPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
