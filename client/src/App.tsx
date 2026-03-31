import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { NotificationToast } from './components/common/NotificationToast'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { ShopPage } from './pages/ShopPage'
import { AdminPage } from './pages/AdminPage'
import { ProfilePage } from './pages/ProfilePage'
import { Booking3DPage } from './pages/Booking3DPage'
import { LoginPage } from './pages/LoginPage'
import { useStore } from './store/useStore'

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
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/booking-3d" element={<Booking3DPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
