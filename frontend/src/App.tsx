import './App.css'
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OwnerLayout from './components/owner/OwnerLayout';
import OwnerHome from './components/home/OwnerHome';
import OwnerPetsPage from './pages/owner/OwnerPetsPage';
import OwnerPlansPage from './pages/owner/OwnerPlansPage';
import OwnerAddPetPage from './pages/owner/OwnerAddPetPage';
import VetHomePage from './pages/vet/VetHomePage';
import AdminHomePage from './pages/admin/AdminHomePage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/home/owner" element={<ProtectedRoute><OwnerLayout /></ProtectedRoute>}>
          <Route index element={<OwnerHome />} />
          <Route path="pets" element={<OwnerPetsPage />} />
          <Route path="plans" element={<OwnerPlansPage />} />
          <Route path="add-pet" element={<OwnerAddPetPage />} />
        </Route>
        <Route path="/home/vet" element={<ProtectedRoute><VetHomePage /></ProtectedRoute>} />
        <Route path="/home/admin" element={<ProtectedRoute><AdminHomePage /></ProtectedRoute>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
