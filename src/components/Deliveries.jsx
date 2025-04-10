import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../AuthContext';
import { API_ENDPOINTS } from '../config';

function Deliveries() {
  const [driverReports, setDriverReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    driver_id: '',
    store_id: '',
    trans_date: new Date().toISOString().split('T')[0],
    cash_amount: '',
    debit_amount: '',
    online_amount: '',
    delivery_fee: '',
    cash_due: ''
  });
  const { access_level, selectedStore } = useAuth();
  const { user } = useAuth();

  useEffect(() => {
    fetchDriverReports();
  }, [access_level]);

  const fetchDriverReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!access_level) {
        setError('Access level not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_ENDPOINTS.DRIVER_REPORTS}/driver/${user.user_id}`);
      
      let data = response.data;
      console.log('Response data:', data);
            // Handle different possible response structures
      if (!Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.reports && Array.isArray(data.reports)) {
          data = data.reports;
        } else {
          console.error('Response data is not in the expected format:', data);
          data = [];
        }
      }
      
      // Sort by date from latest to oldest
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.delivery_date || a.date);
        const dateB = new Date(b.delivery_date || b.date);
        return dateB - dateA;
      });
      
      setDriverReports(sorted);
    } catch (error) {
      console.error('Error fetching driver reports:', error);
      setError('Failed to load driver reports. Please try again later.');
      setDriverReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingId(report.driver_report_id || report.id || report._id);
    setEditForm({
      trans_date: report.trans_date ? new Date(report.trans_date).toISOString().split('T')[0] : '',
      supervisor: report.supervisor || '',
      cash_amount: report.cash_amount || '',
      debit_amount: report.debit_amount || '',
      online_amount: report.online_amount || '',
      delivery_fee: report.delivery_fee || '',
      cash_due: report.cash_due || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (reportId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.put(`${API_ENDPOINTS.DRIVER_REPORTS}/${reportId}`, editForm);
      
      if (response.data.success) {
        fetchDriverReports();
        setEditingId(null);
        setEditForm({});
        setSuccess('Driver report updated successfully!');
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to update driver report. Please try again.');
      }
    } catch (error) {
      console.error('Error updating driver report:', error);
      setError('Failed to update driver report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this driver report?')) {
      try {
        setLoading(true);
        
        const response = await axios.delete(`${API_ENDPOINTS.DRIVER_REPORTS}/${reportId}`);
        
        if (response.data.success) {
          fetchDriverReports();
          setSuccess('Driver report deleted successfully!');
          
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        } else {
          setError('Failed to delete driver report. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting driver report:', error);
        setError('Failed to delete driver report. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Create a copy of newDelivery with the user's ID as driver_id
      const reportData = {
        ...newDelivery,
        driver_id: user.user_id // Add the user's ID as driver_id
      };
      
      console.log('Submitting report data:', reportData);
      
      const response = await axios.post(`${API_ENDPOINTS.DRIVER_REPORTS}/`, reportData);
      
      if (response.data.success) {
        fetchDriverReports();
        setShowAddForm(false);
        setNewDelivery({
          driver_id: '',
          store_id: '',
          trans_date: '',
          cash_amount: '',
          debit_amount: '',
          online_amount: '',
          delivery_fee: '',
          cash_due: ''
        });
        setSuccess('New driver report added successfully!');
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to add new driver report. Please try again.');
      }
    } catch (error) {
      console.error('Error adding new driver report:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Error: ${error.response.data.error}`);
      } else {
        setError('Failed to add new driver report. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    // Special handling for numeric fields to ensure they're valid numbers
    if (['cash_amount', 'debit_amount', 'online_amount', 'delivery_fee', 'cash_due'].includes(id)) {
      // Allow empty string or valid numbers
      if (value === '' || !isNaN(parseFloat(value))) {
        setNewDelivery({ ...newDelivery, [id]: value });
      }
    } else {
      setNewDelivery({ ...newDelivery, [id]: value });
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Driver Reports</h1>
          <hr className="mb-4" />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="card-title mb-0">My Delivery Reports</h2>
              <button 
                className="btn btn-light btn-sm" 
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Report
              </button>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading driver reports...</p>
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
                    <h3 className="card-title mb-0">Add New Delivery Report</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitAdd}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="trans_date" className="form-label">Transaction Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            id="trans_date"
                            name="trans_date"
                            value={newDelivery.trans_date || ''}
                            onChange={handleInputChange}
                            required
                          />
                          <div className="form-text text-danger">Required field</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="supervisor" className="form-label">Supervisor</label>
                          <input
                            type="text"
                            className="form-control"
                            id="supervisor"
                            name="supervisor"
                            value={newDelivery.supervisor || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="cash_amount" className="form-label">Cash Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="cash_amount"
                            name="cash_amount"
                            value={newDelivery.cash_amount || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="debit_amount" className="form-label">Debit Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="debit_amount"
                            name="debit_amount"
                            value={newDelivery.debit_amount || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="online_amount" className="form-label">Online Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="online_amount"
                            name="online_amount"
                            value={newDelivery.online_amount || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="delivery_fee" className="form-label">Delivery Fee</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="delivery_fee"
                            name="delivery_fee"
                            value={newDelivery.delivery_fee || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="cash_due" className="form-label">Cash Due</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="cash_due"
                            name="cash_due"
                            value={newDelivery.cash_due || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={() => setShowAddForm(false)}
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
                            'Save Report'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {!loading && !error && driverReports.length === 0 && (
                <div className="alert alert-info" role="alert">
                  No driver reports found. Add a new report to get started.
                </div>
              )}
              
              {!loading && !error && driverReports.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Driver ID</th>
                        <th>Transaction Date</th>
                        <th>Supervisor</th>
                        <th>Cash Amount</th>
                        <th>Debit Amount</th>
                        <th>Online Amount</th>
                        <th>Delivery Fee</th>
                        <th>Cash Due</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverReports.map((report) => {
                        const reportId = report.driver_report_id || report.id || report._id;
                        const isEditing = editingId === reportId;
                        
                        return (
                          <tr key={reportId}>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.driver_id || ''} 
                                  onChange={(e) => setEditForm({...editForm, driver_id: e.target.value})}
                                />
                              ) : (
                                report.driver_id || ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="date" 
                                  className="form-control form-control-sm" 
                                  value={editForm.trans_date || ''} 
                                  onChange={(e) => setEditForm({...editForm, trans_date: e.target.value})}
                                />
                              ) : (
                                new Date(report.trans_date).toLocaleDateString()
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.supervisor || ''} 
                                  onChange={(e) => setEditForm({...editForm, supervisor: e.target.value})}
                                />
                              ) : (
                                report.supervisor || ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.cash_amount || ''} 
                                  onChange={(e) => setEditForm({...editForm, cash_amount: e.target.value})}
                                />
                              ) : (
                                report.cash_amount ? `$${parseFloat(report.cash_amount).toFixed(2)}` : '$0.00'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.debit_amount || ''} 
                                  onChange={(e) => setEditForm({...editForm, debit_amount: e.target.value})}
                                />
                              ) : (
                                report.debit_amount ? `$${parseFloat(report.debit_amount).toFixed(2)}` : '$0.00'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.online_amount || ''} 
                                  onChange={(e) => setEditForm({...editForm, online_amount: e.target.value})}
                                />
                              ) : (
                                report.online_amount ? `$${parseFloat(report.online_amount).toFixed(2)}` : '$0.00'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.delivery_fee || ''} 
                                  onChange={(e) => setEditForm({...editForm, delivery_fee: e.target.value})}
                                />
                              ) : (
                                report.delivery_fee ? `$${parseFloat(report.delivery_fee).toFixed(2)}` : '$0.00'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.cash_due || ''} 
                                  onChange={(e) => setEditForm({...editForm, cash_due: e.target.value})}
                                />
                              ) : (
                                report.cash_due ? `$${parseFloat(report.cash_due).toFixed(2)}` : '$0.00'
                              )}
                            </td>
                            <td className="text-center">
                              {isEditing ? (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm me-2" 
                                    onClick={() => handleSave(reportId)}
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
                                    onClick={() => handleEdit(report)}
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => handleDelete(reportId)}
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

export default Deliveries; 