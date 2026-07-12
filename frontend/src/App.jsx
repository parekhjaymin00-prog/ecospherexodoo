import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import { useAuth } from './hooks/useAuth.js';

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A0A0A, #1F1F1F)' }}>
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-[#A3A3A3] mb-2">Welcome, {user?.full_name}!</p>
        <p className="text-[#A3A3A3] mb-6">Role: {user?.role}</p>
        <button onClick={logout} className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
