import './App.css'
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OwnerLayout from './components/owner/OwnerLayout';
import OwnerHome from './components/home/OwnerHome';
import OwnerPetsPage from './pages/owner/OwnerPetsPage';
import OwnerPlansPage from './pages/owner/OwnerPlansPage';
import OwnerCarePlanDetailPage from './pages/owner/OwnerCarePlanDetailPage';
import OwnerAddPetPage from './pages/owner/OwnerAddPetPage';
import VetLayout from './components/vet/VetLayout';
import VetHome from './components/home/VetHome';
import VetPatientsPage from './pages/vet/VetPatientsPage';
import VetCarePlansPage from './pages/vet/VetCarePlansPage';
import VetCarePlanDetailPage from './pages/vet/VetCarePlanDetailPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './components/home/AdminHome';
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
          <Route path="plans/:planId" element={<OwnerCarePlanDetailPage />} />
          <Route path="add-pet" element={<OwnerAddPetPage />} />
        </Route>
        <Route path="/home/vet" element={<ProtectedRoute><VetLayout /></ProtectedRoute>}>
          <Route index element={<VetHome />} />
          <Route path="patients" element={<VetPatientsPage />} />
          <Route path="plans" element={<VetCarePlansPage />} />
          <Route path="plans/:planId" element={<VetCarePlanDetailPage />} />
        </Route>
        <Route path="/home/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminHome />} />
        </Route>
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
