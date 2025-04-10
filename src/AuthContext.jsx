import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [access_level, setAccessLevel] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  const login = async (username, password, store_id = null) => {
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        username,
        password,
        store_id
      });

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setAccessLevel(userData.access_level);
        setSelectedStore(store_id || userData.store_id);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setAccessLevel(null);
    setSelectedStore(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    access_level,
    selectedStore,
    login,
    logout,
    setSelectedStore
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;