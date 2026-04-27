import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/signin" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { auth } = useAuth();
  if (auth) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
