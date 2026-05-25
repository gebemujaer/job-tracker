import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TrackerPage from './pages/TrackerPage'
import DocsPage from './pages/DocsPage'
import GuidePage from './pages/GuidePage'
import PartnerPage from './pages/PartnerPage'
import FriendsPage from './pages/FriendsPage'
import ProfilePage from './pages/ProfilePage'
import ChangelogPage from './pages/ChangelogPage'
import TermsPage from './pages/TermsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:'13px' }}>
      loading...
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
        <Route path="tracker" element={<ErrorBoundary><TrackerPage /></ErrorBoundary>} />
        <Route path="docs" element={<ErrorBoundary><DocsPage /></ErrorBoundary>} />
        <Route path="friends" element={<ErrorBoundary><FriendsPage /></ErrorBoundary>} />
        <Route path="partner" element={<ErrorBoundary><PartnerPage /></ErrorBoundary>} />
        <Route path="profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
        <Route path="guide" element={<ErrorBoundary><GuidePage /></ErrorBoundary>} />
        <Route path="changelog" element={<ErrorBoundary><ChangelogPage /></ErrorBoundary>} />
        <Route path="terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </AuthProvider>
  )
}
