import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="flex flex-col items-center gap-3">
          <div className="loader w-10 h-10" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
