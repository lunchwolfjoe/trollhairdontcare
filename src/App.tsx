import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './styles/theme';
import { fetchSession } from './features/auth/authSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SupabaseTest from './components/SupabaseTest';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in
    dispatch(fetchSession());
  }, [dispatch]);

  if (status === 'loading') {
    // You could add a loading spinner here
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/supabase-test" element={<SupabaseTest />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App; 