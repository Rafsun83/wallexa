import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/AppShell';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

function ProtectedRoute() {
  const { auth, isVerifying } = useAuth();
  if (isVerifying) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" />
    </div>
  );
  if (!auth) return <Navigate to="/signin" replace />;
  return <Outlet />;
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

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/home"         element={<Home />} />
          <Route path="/wallets"      element={<Wallets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/insights"     element={<Insights />} />
          <Route path="/settings"     element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
