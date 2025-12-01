import { useState } from 'react'; 
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Profile from './components/Profile.jsx'; // ✅ ADD THIS

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleSignUp = () => {
    navigate('/login');
  };

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/profile"                        // ✅ FIXED
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </>
  );
}

export default App;
