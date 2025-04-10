import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { API_ENDPOINTS } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Settings.css';

function Settings() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
    access_level: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    newPassword: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Memoize the fetchUserProfile function to prevent unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    // Skip if we've already initialized and have user data
    if (isInitialized && userData) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from auth context
      const userId = user?.user_id;
      console.log('Current user context:', user);
      console.log('User ID from context:', userId);
      
      let response;
      try {
        // First try to get user by ID
        if (userId) {
          response = await axios.get(`${API_ENDPOINTS.USERS}/${userId}`);
          console.log('Response from user ID fetch:', response.data);
        }
      } catch (error) {
        console.log('Failed to fetch by ID, trying username');
        // If that fails, try by username
        if (user?.username) {
          response = await axios.get(`${API_ENDPOINTS.USERS}/username/${user.username}`);
          console.log('Response from username fetch:', response.data);
        }
      }

      if (!response || !response.data) {
        throw new Error('No user data received from the server');
      }

      // Get the actual user data from the response
      const responseData = response.data.data || response.data;
      console.log('Processed response data:', responseData);

      // Update the userData state
      setUserData(responseData);

      // Update form data with user information, checking all possible field names
      const newFormData = {
        username: responseData.username || responseData.user_name || '',
        email: responseData.email || responseData.user_email || '',
        firstname: responseData.firstname || responseData.first_name || responseData.firstName || '',
        lastname: responseData.lastname || responseData.last_name || responseData.lastName || '',
        phone: responseData.phone || responseData.phone_number || responseData.phoneNumber || '',
        access_level: responseData.access_level || responseData.accessLevel || user?.access_level || ''
      };

      console.log('Setting form data to:', newFormData);
      setFormData(newFormData);
      setIsInitialized(true);

    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError('Failed to load user profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, isInitialized, userData]);

  // Only fetch user profile on initial mount or when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Handling input change for ${name}:`, value);
    
    // Format phone number as user types
    if (name === 'phone') {
      // Remove all non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      
      // Format as (XXX) XXX-XXXX
      let formattedValue = '';
      if (numericValue.length > 0) {
        formattedValue = '(' + numericValue.substring(0, 3);
        if (numericValue.length > 3) {
          formattedValue += ') ' + numericValue.substring(3, 6);
          if (numericValue.length > 6) {
            formattedValue += '-' + numericValue.substring(6, 10);
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Submitting form data:', formData);
      
      // Validate required fields
      if (!formData.username || !formData.email) {
        setError('Username and email are required fields');
        return;
      }
      
      // Get the user ID from user or userData
      const userId = user?.user_id || userData?.id || userData?.user_id;
      console.log('User ID for update:', userId);
      
      if (!userId) {
        setError('User ID not found. Please try logging out and back in.');
        return;
      }
      
      // Make sure access_level is included in the form data
      const dataToSend = {
        ...formData,
        access_level: formData.access_level || user?.access_level || ''
      };
      
      console.log('Data being sent to API:', dataToSend);
      
      // Make API call to update user profile
      const response = await axios.put(`${API_ENDPOINTS.USERS}/${userId}`, dataToSend);
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        
        // Update the user context with the new user data
        logout(prev => ({
          ...prev,
          ...formData
        }));
        
        // Update local userData state
        setUserData(prev => ({
          ...prev,
          ...formData
        }));
      } else {
        // Check for specific error messages from the server
        if (response.data.message && response.data.message.includes('required fields')) {
          setError(`Server error: ${response.data.message}. Please check all required fields.`);
        } else {
          setError(response.data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Provide more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 400) {
          if (error.response.data.message && error.response.data.message.includes('required fields')) {
            setError(`Server error: ${error.response.data.message}. Please check all required fields.`);
          } else {
            setError(`Server error: ${error.response.data.message || 'Missing required fields'}`);
          }
        } else {
          setError(`Failed to update profile: ${error.response.data.message || 'Server error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('Failed to update profile: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError(`Failed to update profile: ${error.message}`);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    try {
      // Validate password fields
      if (!passwordData.current_password || !passwordData.newPassword || !passwordData.confirm_password) {
        setPasswordError('All password fields are required');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirm_password) {
        setPasswordError('New passwords do not match');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long');
        return;
      }
      
      // Get the user ID from user or userData
      const userId = user?.user_id || userData?.id || userData?.user_id;
      
      if (!userId) {
        setPasswordError('User ID not found. Please try logging out and back in.');
        return;
      }
      
      // Make API call to update password
      const response = await axios.put(`${API_ENDPOINTS.USERS}/${userId}/password`, {
        current_password: passwordData.current_password,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setPasswordSuccess('Password updated successfully!');
        
        // Clear password fields
        setPasswordData({
          current_password: '',
          newPassword: '',
          confirm_password: ''
        });
      } else {
        setPasswordError(response.data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again later.');
    }
  };

  if (loading && !isInitialized) {
    return <div className="settings-container">Loading user profile...</div>;
  }

  return (
    <div className="settings-container">
      <h1 className="text-center mb-4">User Settings</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="settings-section h-100">
            <h2>Profile Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="firstname">First Name</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastname">Last Name</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(XXX) XXX-XXXX"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="access_level">Access Level</label>
                <input
                  type="text"
                  id="access_level"
                  name="access_level"
                  value={formData.access_level}
                  onChange={handleInputChange}
                  readOnly
                  className="form-control readonly-field"
                />
                <small className="form-text text-muted">Access level cannot be changed here</small>
              </div>
              
              <button type="submit" className="btn btn-primary w-100 mt-3">Save Profile</button>
            </form>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="settings-section h-100">
            <h2>Change Password</h2>
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current_password">Current Password</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  className="form-control"
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-100 mt-3">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 