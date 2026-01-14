import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navigation from './components/layout/Navigation'
import ProfileModal from './components/profile/ProfileModal'
import InvitationsInbox from './components/groups/InvitationsInbox'
import GroupsManagePage from './pages/groups/GroupsManagePage'
import Dashboard from './pages/Dashboard'
import ProductsPage from './pages/products/ProductsPage'
import MealsPage from './pages/meals/MealsPage'

function App() {
  const { loading } = useAuth()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <Navigation
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenInbox={() => setInboxOpen(true)}
          onOpenManage={() => setManageGroupsOpen(true)}
        />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/meals" element={<MealsPage />} />
        </Routes>

        <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
        <InvitationsInbox isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />
        <GroupsManagePage isOpen={manageGroupsOpen} onClose={() => setManageGroupsOpen(false)} />
      </div>
    </BrowserRouter>
  )
}

export default App
