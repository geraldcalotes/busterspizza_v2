import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Sidebar from './components/Sidebar';
import Employees from './components/Employee';
import Stores from './components/Store';
import DailySales from './components/Dailysales';
import Deliveries from './components/Deliveries';
import Settings from './components/Settings';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && <Sidebar />}
      <div className="content">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" />} />
          <Route path="/contact" element={isAuthenticated ? <Contact /> : <Navigate to="/login" />} />
          <Route path="/employees" element={isAuthenticated ? <Employees /> : <Navigate to="/login" />} />
          <Route path="/stores" element={isAuthenticated ? <Stores /> : <Navigate to="/login" />} />
          <Route path="/daily-sales" element={isAuthenticated ? <DailySales /> : <Navigate to="/login" />} />
          <Route path="/deliveries" element={isAuthenticated ? <Deliveries /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;