import './App.css'
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OwnerHomePage from './pages/owner/OwnerHomePage';
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
        <Route path="/home/owner" element={<ProtectedRoute><OwnerHomePage /></ProtectedRoute>} />
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
