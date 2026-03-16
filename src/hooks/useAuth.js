// src/hooks/useAuth.js
import { useAuth as useAuthContext } from '../contexts/AuthContext'

export function useAuth() {
    const { user, login, logout, loading } = useAuthContext()

    return {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    }
}
