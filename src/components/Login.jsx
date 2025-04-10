import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import '../index.css';
import logo from '../assets/logo.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Fetch stores when component mounts
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BRANCHES);
      if (response.data.success) {
        setStores(response.data.data);
        // Set default selected store if available
        if (response.data.data.length > 0) {
          setSelectedStore(response.data.data[0].id || response.data.data[0].store_id || response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pass the selected store to the login function
      const result = await login(username, password, selectedStore);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="login-logo" />
        </div>
        <div className="form-group store-selector">
          <label htmlFor="store" style={{ color: 'white' }}>Store Branch</label>
          <select
            id="store"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            required
            className="form-control"
          >
            <option value="">Select a store</option>
            {stores.map(store => (
              <option 
                key={store.id || store.store_id || store._id} 
                value={store.id || store.store_id || store._id}
              >
                {store.name || store.store_name}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" style={{ color: 'white' }}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" style={{ color: 'white' }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;