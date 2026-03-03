import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import { supabase } from '@/utils/supabase'

// Pages
import HomePage from '@/pages/HomePage'
import EditorPage from '@/pages/EditorPage'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import PricingPage from '@/pages/PricingPage'
import SettingsPage from '@/pages/SettingsPage'

// Components
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function App() {
  const { isDark } = useThemeStore()
  const { setUser, setSession } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession])

  return (
    <div className={isDark ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/editor" element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          } />
          <Route path="/editor/:id" element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1e2030' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#1a202c',
            border: isDark ? '1px solid #2d3748' : '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  )
}

export default App
