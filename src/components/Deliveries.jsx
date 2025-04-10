import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
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
    order_id: '',
    driver_id: '',
    store_id: '',
    delivery_date: '',
    delivery_time: '',
    delivery_status: 'pending',
    delivery_notes: ''
  });
  const { access_level, selectedStore } = useAuth();

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

      const response = await axios.get(`${API_ENDPOINTS.DRIVER_REPORTS}/driver/${access_level}`);
      
      let data = response.data;
      
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
      delivery_date: report.delivery_date ? new Date(report.delivery_date).toISOString().split('T')[0] : '',
      start_time: report.start_time || '',
      end_time: report.end_time || '',
      total_deliveries: report.total_deliveries || '',
      total_miles: report.total_miles || '',
      total_tips: report.total_tips || '',
      notes: report.notes || ''
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
            <div className="card-header bg-primary text-white">
              <h2 className="card-title mb-0">My Delivery Reports</h2>
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
                  <div>{success}</div>
                </div>
              )}
              
              {!loading && !error && driverReports.length === 0 && (
                <div className="alert alert-info" role="alert">
                  No driver reports found.
                </div>
              )}
              
              {!loading && !error && driverReports.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Total Deliveries</th>
                        <th>Total Miles</th>
                        <th>Total Tips</th>
                        <th>Notes</th>
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
                                  type="date" 
                                  className="form-control form-control-sm" 
                                  value={editForm.delivery_date || ''} 
                                  onChange={(e) => setEditForm({...editForm, delivery_date: e.target.value})}
                                />
                              ) : (
                                new Date(report.delivery_date || report.date).toLocaleDateString()
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="time" 
                                  className="form-control form-control-sm" 
                                  value={editForm.start_time || ''} 
                                  onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                                />
                              ) : (
                                report.start_time || ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="time" 
                                  className="form-control form-control-sm" 
                                  value={editForm.end_time || ''} 
                                  onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                                />
                              ) : (
                                report.end_time || ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  className="form-control form-control-sm" 
                                  value={editForm.total_deliveries || ''} 
                                  onChange={(e) => setEditForm({...editForm, total_deliveries: e.target.value})}
                                />
                              ) : (
                                report.total_deliveries || '0'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.1"
                                  className="form-control form-control-sm" 
                                  value={editForm.total_miles || ''} 
                                  onChange={(e) => setEditForm({...editForm, total_miles: e.target.value})}
                                />
                              ) : (
                                report.total_miles ? `${parseFloat(report.total_miles).toFixed(1)} mi` : '0 mi'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.total_tips || ''} 
                                  onChange={(e) => setEditForm({...editForm, total_tips: e.target.value})}
                                />
                              ) : (
                                report.total_tips ? `$${parseFloat(report.total_tips).toFixed(2)}` : '$0.00'
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <textarea 
                                  className="form-control form-control-sm" 
                                  value={editForm.notes || ''} 
                                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                  rows="2"
                                />
                              ) : (
                                report.notes || ''
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