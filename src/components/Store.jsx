import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../AuthContext';
import { API_ENDPOINTS } from '../config';

function Store() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({
    store_name: '',
    store_address: '',
    store_phone: '',
    store_email: '',
    store_manager: '',
    store_hours: '',
    store_status: 'active'
  });
  const { access_level } = useAuth();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(API_ENDPOINTS.STORE_BRANCHES);
      
      if (response.data.success) {
        setStores(response.data.data);
      } else {
        setError('Failed to load stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setEditingId(store.id || store._id || store.store_id);
    setEditForm({
      store_name: store.store_name,
      store_address: store.store_address,
      store_phone: store.store_phone
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (storeId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.put(`${API_ENDPOINTS.STORE_BRANCHES}/${storeId}`, editForm);
      
      if (response.data.success) {
        setSuccess('Store updated successfully!');
        fetchStores();
        setEditingId(null);
        setEditForm({});
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to update store');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setError('Failed to update store. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.delete(`${API_ENDPOINTS.STORE_BRANCHES}/${storeId}`);
        
        if (response.data.success) {
          setSuccess('Store deleted successfully!');
          fetchStores();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        } else {
          setError(response.data.message || 'Failed to delete store');
        }
      } catch (error) {
        console.error('Error deleting store:', error);
        setError('Failed to delete store. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddStore = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewStore({
      store_name: '',
      store_address: '',
      store_phone: '',
      store_email: '',
      store_manager: '',
      store_hours: '',
      store_status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone field to format as 000-000-0000
    if (name === 'store_phone') {
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
      
      setNewStore(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setNewStore(prev => ({
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
      setSuccess(null);
      
      const response = await axios.post(API_ENDPOINTS.STORE_BRANCHES, newStore);
      
      if (response.data.success) {
        setSuccess('Store added successfully!');
        fetchStores();
        setShowAddForm(false);
        setNewStore({
          store_name: '',
          store_address: '',
          store_phone: '',
          store_email: '',
          store_manager: '',
          store_hours: '',
          store_status: 'active'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to add store');
      }
    } catch (error) {
      console.error('Error adding store:', error);
      setError('Failed to add store. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Store Management</h1>
          <hr className="mb-4" />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="card-title mb-0">Stores</h2>
              <button 
                className="btn btn-light btn-sm" 
                onClick={handleAddStore}
                disabled={showAddForm}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Store
              </button>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading stores...</p>
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
              
              {showAddForm && (
                <div className="card mb-4">
                  <div className="card-header bg-info text-white">
                    <h3 className="card-title mb-0">Add New Store</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitAdd}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="name" className="form-label">Store Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="store_name"
                            value={newStore.store_name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label htmlFor="address" className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            name="store_address"
                            value={newStore.store_address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label htmlFor="phone" className="form-label">Phone (000-000-0000)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="phone"
                            name="store_phone"
                            value={newStore.store_phone}
                            onChange={handleInputChange}
                            placeholder="000-000-0000"
                            pattern="\d{3}-\d{3}-\d{4}"
                            title="Please enter a phone number in the format: 000-000-0000"
                            required
                          />
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
                            'Save Store'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {!loading && !error && stores.length === 0 && (
                <div className="alert alert-info" role="alert">
                  No stores found.
                </div>
              )}
              
              {!loading && !error && stores.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((store) => {
                        const storeId = store.id || store._id || store.store_id;
                        const isEditing = editingId === storeId;
                        
                        return (
                          <tr key={storeId}>
                            <td>{storeId}</td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.store_name || ''} 
                                  onChange={(e) => setEditForm({...editForm, store_name: e.target.value})}
                                />
                              ) : (
                                store.store_name
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.store_address || ''} 
                                  onChange={(e) => setEditForm({...editForm, store_address: e.target.value})}
                                />
                              ) : (
                                store.store_address
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.store_phone || ''} 
                                  onChange={(e) => setEditForm({...editForm, store_phone: e.target.value})}
                                />
                              ) : (
                                store.store_phone
                              )}
                            </td>
                            <td className="text-center">
                              {isEditing ? (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm me-2" 
                                    onClick={() => handleSave(storeId)}
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
                                    onClick={() => handleEdit(store)}
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => handleDelete(storeId)}
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

export default Store;