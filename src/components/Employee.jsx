import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faPlus, faCheckCircle, faKey } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../AuthContext';
import { API_ENDPOINTS } from '../config';

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
    access_level: '',
    store_id: ''
  });
  const { access_level, selectedStore } = useAuth();
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(API_ENDPOINTS.EMPLOYEES);
      
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        setError('Failed to load employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id || employee._id || employee.user_id);
    setEditForm({
      username: employee.username,
      firstname: employee.firstname,
      lastname: employee.lastname,
      email: employee.email,
      phone: employee.phone,
      access_level: employee.access_level
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${API_ENDPOINTS.EMPLOYEES}/${editingId}`, editForm);
      
      if (response.data.success) {
        setSuccess('Employee updated successfully');
        setEditingId(null);
        setEditForm({});
        fetchEmployees();
      } else {
        setError('Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('Failed to update employee. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.delete(`${API_ENDPOINTS.EMPLOYEES}/${id}`);
        
        if (response.data.success) {
          setSuccess('Employee deleted successfully');
          fetchEmployees();
        } else {
          setError('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Failed to delete employee. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddEmployee = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewEmployee({
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      access_level: '',
      store_id: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone field to format as 000-000-0000
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format the phone number as 000-000-0000
      let formattedPhone = '';
      if (digitsOnly.length > 0) {
        formattedPhone = digitsOnly.substring(0, 3);
        if (digitsOnly.length > 3) {
          formattedPhone += '-' + digitsOnly.substring(3, 6);
          if (digitsOnly.length > 6) {
            formattedPhone += '-' + digitsOnly.substring(6, 10);
          }
        }
      }
      
      setNewEmployee(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setNewEmployee(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(API_ENDPOINTS.EMPLOYEES, newEmployee);
      
      if (response.data.success) {
        setSuccess('Employee added successfully');
        setNewEmployee({
          username: '',
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          access_level: '',
          store_id: ''
        });
        setShowAddForm(false);
        fetchEmployees();
      } else {
        setError('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setError('Failed to add employee. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (userId) => {
    setResetPasswordId(userId);
    setResetPasswordForm({
      password: '',
      confirmPassword: ''
    });
  };

  const handleCancelResetPassword = () => {
    setResetPasswordId(null);
    setResetPasswordForm({
      password: '',
      confirmPassword: ''
    });
  };

  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitResetPassword = async (e) => {
    e.preventDefault();
    let error_msg = null;
    // Validate passwords match
    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      setError('Passwords do not match');
      error_msg = 'Passwords do not match';
      return;
    }
    
    // Validate password is not empty
    if (!resetPasswordForm.password) {
      setError('Password cannot be empty');
      error_msg = 'Password cannot be empty';
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
     
      console.log('Resetting password for user ID:', resetPasswordId);
      console.log('Reset password form:', resetPasswordForm.password);
      // Make API call to reset the user's password using the correct endpoint
      const response = await axios.put(`${API_ENDPOINTS.EMPLOYEES}/${resetPasswordId}/password`, {
        newPassword: resetPasswordForm.password
      });
     

      if (response.data.success) {
        // Show success message
        setSuccess(`Password reset successfully for user ID: ${resetPasswordId}`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
        
        // Reset the form and hide it
        setResetPasswordId(null);
        setResetPasswordForm({
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(error_msg);
      }
    } catch (error) {
      
      error_msg = error.response.data.error;
      console.error('Error resetting password:', error);
      setError(error_msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Employee Menu</h1>
          <hr className="mb-4" />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="card-title mb-0">Users</h2>
              <button 
                className="btn btn-light btn-sm" 
                onClick={handleAddEmployee}
                disabled={showAddForm}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Add User
              </button>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading users...</p>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>{success}</div>
                </div>
              )}
              
              {resetPasswordId && (
                <div className="card mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h3 className="card-title mb-0">Reset Password</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitResetPassword}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="reset-password" className="form-label">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="reset-password"
                            name="password"
                            value={resetPasswordForm.password}
                            onChange={handleResetPasswordChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirm-password"
                            name="confirmPassword"
                            value={resetPasswordForm.confirmPassword}
                            onChange={handleResetPasswordChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={handleCancelResetPassword}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-warning"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Resetting...
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {showAddForm && (
                <div className="card mb-4">
                  <div className="card-header bg-info text-white">
                    <h3 className="card-title mb-0">Add New User</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitAdd}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="username" className="form-label">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={newUser.username}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="password" className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={newUser.password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="firstname" className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstname"
                            name="firstname"
                            value={newUser.firstname}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="lastname" className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastname"
                            name="lastname"
                            value={newUser.lastname}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="phone" className="form-label">Phone (000-000-0000)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={newUser.phone}
                            onChange={handleInputChange}
                            placeholder="000-000-0000"
                            pattern="\d{3}-\d{3}-\d{4}"
                            title="Please enter a phone number in the format: 000-000-0000"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={newUser.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="access_level" className="form-label">Access Level</label>
                          <select
                            className="form-select"
                            id="access_level"
                            name="access_level"
                            value={newUser.access_level}
                            onChange={handleInputChange}
                            required
                          >
                            <option value={1000}>Admin</option>
                            <option value={2000}>Supervisor</option>
                            <option value={3000}>Staff</option>
                            <option value={5000}>Driver</option>
                          </select>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={handleCancelAdd}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-success"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            'Save User'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {!loading && !error && users.length === 0 && (
                <div className="alert alert-info" role="alert">
                  No users found.
                </div>
              )}
              
              {!loading && !error && users.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Access Level</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const userId = user.id || user._id || user.user_id;
                        const isEditing = editingId === userId;
                        
                        return (
                          <tr key={userId}>
                            <td>{userId}</td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.username || ''} 
                                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                />
                              ) : (
                                user.username
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.firstname || ''} 
                                  onChange={(e) => setEditForm({...editForm, firstname: e.target.value})}
                                />
                              ) : (
                                user.firstname
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.lastname || ''} 
                                  onChange={(e) => setEditForm({...editForm, lastname: e.target.value})}
                                />
                              ) : (
                                user.lastname
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="email" 
                                  className="form-control form-control-sm" 
                                  value={editForm.email || ''} 
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                />
                              ) : (
                                user.email
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.phone || ''} 
                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                />
                              ) : (
                                user.phone
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <select
                                  className="form-select form-select-sm"
                                  value={editForm.access_level || ''}
                                  onChange={(e) => setEditForm({...editForm, access_level: parseInt(e.target.value)})}
                                >
                                  <option value={1000}>Admin</option>
                                  <option value={2000}>Supervisor</option>
                                  <option value={3000}>Staff</option>
                                  <option value={5000}>Driver</option>
                                </select>
                              ) : (
                                user.access_level === 1000 ? 'Admin' :
                                user.access_level === 2000 ? 'Supervisor' :
                                user.access_level === 3000 ? 'Staff' :
                                user.access_level === 5000 ? 'Driver' : user.access_level
                              )}
                            </td>
                            <td className="text-center">
                              {isEditing ? (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm me-2" 
                                    onClick={handleSave}
                                    title="Save"
                                  >
                                    <FontAwesomeIcon icon={faSave} />
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={handleCancel}
                                    title="Cancel"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    className="btn btn-primary btn-sm me-2" 
                                    onClick={() => handleEdit(user)}
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button 
                                    className="btn btn-warning btn-sm me-2" 
                                    onClick={() => handleResetPassword(userId)}
                                    title="Reset Password"
                                  >
                                    <FontAwesomeIcon icon={faKey} />
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => handleDelete(userId)}
                                    title="Delete"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div> 
      </div> 
    </div>
  );
}

export default Employee;