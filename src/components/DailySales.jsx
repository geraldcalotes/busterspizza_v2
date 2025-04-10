import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../AuthContext';
import { API_ENDPOINTS } from '../config';

function DailySales() {
  const [dailyMainRecords, setDailyMainRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    store_id: '',
    daily_date: '',
    am_float: '',
    am_safe: '',
    am_name: '',
    am_remarks: '',
    pm_float: '',
    pm_safe: '',
    pm_name: '',
    adj_gross_sales: '',
    delivery_charge: '',
    cash_out: '',
    daily_summary: '',
    total_daily_drawers: '',
    difference: '',
    instores_sales: '',
    skip_dishes: '',
    door_dash: '',
    uber_eats: '',
    debit_tips: '',
    cash_tips: '',
    public_drawer_dtips: '',
    pm_remarks: ''
  });
  const [stores, setStores] = useState([]);
  const [storeNames, setStoreNames] = useState({});
  const { access_level, selectedStore } = useAuth();
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    fetchStores();
    fetchDailyMainRecords();
  }, [selectedStore]);

  useEffect(() => {
    if (selectedStore && dailyMainRecords.length > 0) {
      
      const filtered = dailyMainRecords.filter(record => {
        // Convert both to numbers for comparison
        const recordStoreId = Number(record.store_id);
        const selectedStoreId = Number(selectedStore);
        return recordStoreId === selectedStoreId;
      });
      
      // Sort by date from latest to oldest
      const sorted = [...filtered].sort((a, b) => {
        const dateA = new Date(a.daily_date);
        const dateB = new Date(b.daily_date);
        return dateB - dateA; // Descending order (latest first)
      });
      setFilteredRecords(sorted);
    } else {
      // Sort all records by date from latest to oldest
      const sorted = [...dailyMainRecords].sort((a, b) => {
        const dateA = new Date(a.daily_date);
        const dateB = new Date(b.daily_date);
        return dateB - dateA; // Descending order (latest first)
      });
      setFilteredRecords(sorted);
    }
  }, [selectedStore, dailyMainRecords]);

  const fetchStores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BRANCHES);
      console.log('Stores Response:', response.data);
      
      // Handle different possible response structures
      let storesData = response.data;
      
      // If data is not an array, try to extract it from the response
      if (!Array.isArray(storesData)) {
        if (storesData.data && Array.isArray(storesData.data)) {
          storesData = storesData.data;
        } else if (storesData.stores && Array.isArray(storesData.stores)) {
          storesData = storesData.stores;
        } else {
          console.error('Stores data is not in the expected format:', storesData);
          storesData = [];
        }
      }
      
      setStores(storesData);
      
      // Create a mapping of store IDs to store names
      const storeNameMap = {};
      storesData.forEach(store => {
        const storeId = store.id || store.store_id || store._id;
        const storeName = store.name || store.store_name;
        if (storeId && storeName) {
          storeNameMap[storeId] = storeName;
        }
      });
      
      setStoreNames(storeNameMap);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load store information. Please try again later.');
    }
  };

  const fetchDailyMainRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = API_ENDPOINTS.DAILY_MAIN;
      
      // If user is a supervisor (access_level 2000), only show data for their selected store
      if (access_level === 2000 && selectedStore) {
        url = `${API_ENDPOINTS.DAILY_MAIN}/by-store/${selectedStore}`;
      }
      // For access_level 1000, use the base endpoint to get all records
      
      console.log('Fetching data from URL:', url);
      const response = await axios.get(url);
      
      // Handle different possible response structures
      let data = response.data;
      
      // If data is not an array, try to extract it from the response
      if (!Array.isArray(data)) {
        // Check if data is in a property of the response
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.records && Array.isArray(data.records)) {
          data = data.records;
        } else {
          // If we can't find an array, create an empty one
          console.error('Response data is not in the expected format:', data);
          data = [];
        }
      }
      
      console.log('Processed Daily Main Records:', data);
      setDailyMainRecords(data);
    } catch (error) {
      console.error('Error fetching daily main records:', error);
      setError('Failed to load daily main records. Please try again later.');
      setDailyMainRecords([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the single record to get the latest data
      const response = await axios.get(`${API_ENDPOINTS.DAILY_MAIN}/${record.dailymain_id || record.id || record._id}`);
      const recordData = response.data.data || response.data;
      
      setEditingId(recordData.dailymain_id || recordData.id || recordData._id);
      setEditForm({
        store_id: recordData.store_id,
        daily_date: recordData.daily_date ? new Date(recordData.daily_date).toISOString().split('T')[0] : '',
        am_float: recordData.am_float || '',
        am_safe: recordData.am_safe || '',
        am_name: recordData.am_name || '',
        am_remarks: recordData.am_remarks || '',
        pm_float: recordData.pm_float || '',
        pm_safe: recordData.pm_safe || '',
        pm_name: recordData.pm_name || '',
        adj_gross_sales: recordData.adj_gross_sales || '',
        delivery_charge: recordData.delivery_charge || '',
        cash_out: recordData.cash_out || '',
        daily_summary: recordData.daily_summary || '',
        total_daily_drawers: recordData.total_daily_drawers || '',
        difference: recordData.difference || '',
        instores_sales: recordData.instores_sales || '',
        skip_dishes: recordData.skip_dishes || '',
        door_dash: recordData.door_dash || '',
        uber_eats: recordData.uber_eats || '',
        debit_tips: recordData.debit_tips || '',
        cash_tips: recordData.cash_tips || '',
        public_drawer_dtips: recordData.public_drawer_dtips || '',
        pm_remarks: recordData.notes || ''
      });
    } catch (error) {
      console.error('Error fetching record details:', error);
      setError('Failed to load record details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (recordId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Make API call to update the record
      const response = await axios.put(`${API_ENDPOINTS.DAILY_MAIN}/${recordId}`, editForm);
      
      if (response.data.success) {
        // Refresh the records list
        fetchDailyMainRecords();
        
        // Reset the editing state
        setEditingId(null);
        setEditForm({});
        
        // Show success message
        setSuccess('Daily main record updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to update daily main record. Please try again.');
      }
    } catch (error) {
      console.error('Error updating daily main record:', error);
      setError('Failed to update daily main record. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this daily main record?')) {
      try {
        setLoading(true);
        
        // Make API call to delete the record
        const response = await axios.delete(`${API_ENDPOINTS.DAILY_MAIN}/${recordId}`);
        
        if (response.data.success) {
          // Refresh the records list
          fetchDailyMainRecords();
          
          // Show success message
          setSuccess('Daily main record deleted successfully!');
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        } else {
          setError('Failed to delete daily main record. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting daily main record:', error);
        setError('Failed to delete daily main record. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddRecord = () => {
    setNewRecord(prev => ({
      ...prev,
      store_id: selectedStore || ''
    }));
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewRecord({
      store_id: selectedStore || '',
      daily_date: '',
      am_float: '',
      am_safe: '',
      am_name: '',
      am_remarks: '',
      pm_float: '',
      pm_safe: '',
      pm_name: '',
      adj_gross_sales: '',
      delivery_charge: '',
      cash_out: '',
      daily_summary: '',
      total_daily_drawers: '',
      difference: '',
      instores_sales: '',
      skip_dishes: '',
      door_dash: '',
      uber_eats: '',
      debit_tips: '',
      cash_tips: '',
      public_drawer_dtips: '',
      pm_remarks: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Log the data being sent to help with debugging
      console.log('Sending daily main record data:', newRecord);
      
      // Make sure all required fields are present
      console.log('New Record:', newRecord);
      newRecord.store_id = selectedStore;
      console.log('New Record:', newRecord);
      console.log('New Record Store ID:', newRecord.store_id);
      if (!newRecord.store_id || !newRecord.daily_date || !newRecord.daily_summary) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(API_ENDPOINTS.DAILY_MAIN, newRecord);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Refresh the records list
        fetchDailyMainRecords();
        
        // Reset the form and hide it
        setNewRecord({
          store_id: selectedStore || '',
          daily_date: '',
          am_float: '',
          am_safe: '',
          am_name: '',
          am_remarks: '',
          pm_float: '',
          pm_safe: '',
          pm_name: '',
          adj_gross_sales: '',
          delivery_charge: '',
          cash_out: '',
          daily_summary: '',
          total_daily_drawers: '',
          difference: '',
          instores_sales: '',
          skip_dishes: '',
          door_dash: '',
          uber_eats: '',
          debit_tips: '',
          cash_tips: '',
          public_drawer_dtips: '',
          pm_remarks: ''
        });
        setShowAddForm(false);
        
        // Show success message
        setSuccess('Daily main record added successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to add daily main record. Please try again.');
      }
    } catch (error) {
      console.error('Error adding daily main record:', error);
      
      // Provide more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(`Failed to add daily main record: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('Failed to add daily main record: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError(`Failed to add daily main record: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Daily Main Records Management</h1>
          <hr className="mb-4" />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="card-title mb-0">Daily Main Records</h2>
              <button 
                className="btn btn-light btn-sm" 
                onClick={handleAddRecord}
                disabled={showAddForm}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Daily Main Record
              </button>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading daily main records...</p>
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
              
              {showAddForm && (
                <div className="card mb-4">
                  <div className="card-header bg-info text-white">
                    <h3 className="card-title mb-0">Add New Daily Main Record</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitAdd}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="store_id" className="form-label">Store</label>
                          {access_level === 2000 && selectedStore ? (
                            <input
                              type="text"
                              className="form-control"
                              id="store_id"
                              name="store_id"
                              value={newRecord.store_id}
                              onChange={handleInputChange}
                              required
                              disabled
                            />
                          ) : (
                            <select
                              className="form-select"
                              id="store_id"
                              name="store_id"
                              value={newRecord.store_id}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select a store</option>
                              {stores.map(store => (
                                <option key={store.id || store.store_id || store._id} value={store.id || store.store_id || store._id}>
                                  {store.name || store.store_name}
                                </option>
                              ))}
                            </select>
                          )}
                          {access_level === 2000 && selectedStore && (
                            <small className="text-muted">Store is automatically set based on your selection.{selectedStore}</small>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="daily_date" className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="daily_date"
                            name="daily_date"
                            value={newRecord.daily_date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <h4 className="mt-3 mb-2">Morning Shift</h4>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="am_float" className="form-label">AM Float</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="am_float"
                            name="am_float"
                            value={newRecord.am_float}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="am_safe" className="form-label">AM Safe</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="am_safe"
                            name="am_safe"
                            value={newRecord.am_safe}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="am_name" className="form-label">AM Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="am_name"
                            name="am_name"
                            value={newRecord.am_name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="am_remarks" className="form-label">AM Remarks</label>
                          <input
                            type="text"
                            className="form-control"
                            id="am_remarks"
                            name="am_remarks"
                            value={newRecord.am_remarks}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <h4 className="mt-3 mb-2">Afternoon Shift</h4>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="pm_float" className="form-label">PM Float</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="pm_float"
                            name="pm_float"
                            value={newRecord.pm_float}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="pm_safe" className="form-label">PM Safe</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="pm_safe"
                            name="pm_safe"
                            value={newRecord.pm_safe}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="pm_name" className="form-label">PM Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="pm_name"
                            name="pm_name"
                            value={newRecord.pm_name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <h4 className="mt-3 mb-2">Sales Information</h4>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="adj_gross_sales" className="form-label">Adjusted Gross Sales</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="adj_gross_sales"
                            name="adj_gross_sales"
                            value={newRecord.adj_gross_sales}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="delivery_charge" className="form-label">Delivery Charge</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="delivery_charge"
                            name="delivery_charge"
                            value={newRecord.delivery_charge}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="cash_out" className="form-label">Cash Out</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="cash_out"
                            name="cash_out"
                            value={newRecord.cash_out}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="daily_summary" className="form-label">Daily Summary</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="daily_summary"
                            name="daily_summary"
                            value={newRecord.daily_summary}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="total_daily_drawers" className="form-label">Total Daily Drawers</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="total_daily_drawers"
                            name="total_daily_drawers"
                            value={newRecord.total_daily_drawers}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="difference" className="form-label">Difference</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="difference"
                            name="difference"
                            value={newRecord.difference}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="instores_sales" className="form-label">In-Store Sales</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="instores_sales"
                            name="instores_sales"
                            value={newRecord.instores_sales}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <h4 className="mt-3 mb-2">Delivery Services</h4>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="skip_dishes" className="form-label">Skip Dishes</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="skip_dishes"
                            name="skip_dishes"
                            value={newRecord.skip_dishes}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="door_dash" className="form-label">Door Dash</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="door_dash"
                            name="door_dash"
                            value={newRecord.door_dash}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="uber_eats" className="form-label">Uber Eats</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="uber_eats"
                            name="uber_eats"
                            value={newRecord.uber_eats}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <h4 className="mt-3 mb-2">Tips</h4>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="debit_tips" className="form-label">Debit Tips</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="debit_tips"
                            name="debit_tips"
                            value={newRecord.debit_tips}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="cash_tips" className="form-label">Cash Tips</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="cash_tips"
                            name="cash_tips"
                            value={newRecord.cash_tips}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="public_drawer_dtips" className="form-label">Public Drawer Tips</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="public_drawer_dtips"
                            name="public_drawer_dtips"
                            value={newRecord.public_drawer_dtips}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label htmlFor="pm_remarks" className="form-label">PM Remarks</label>
                          <textarea
                            className="form-control"
                            id="pm_remarks"
                            name="pm_remarks"
                            rows="3"
                            value={newRecord.pm_remarks}
                            onChange={handleInputChange}
                          ></textarea>
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
                            'Save Daily Main Record'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {!loading && !error && filteredRecords.length === 0 && (
                <div className="alert alert-info" role="alert">
                  No daily main records found.
                </div>
              )}
              
              {!loading && !error && filteredRecords.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Store</th>
                        <th>Date</th>
                        <th>AM Float</th>
                        <th>AM Safe</th>
                        <th>AM Name</th>
                        <th>PM Float</th>
                        <th>PM Safe</th>
                        <th>PM Name</th>
                        <th>Daily Sales</th>
                        <th>Total Drawers</th>
                        <th>Difference</th>
                        <th>Tips</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => {
                        const recordId = record.dailymain_id || record.id || record._id;
                        const isEditing = editingId === recordId;
                        const storeName = storeNames[record.store_id] || record.store_id;
                        
                        // Calculate total tips
                        const totalTips = (
                          (parseFloat(record.debit_tips) || 0) + 
                          (parseFloat(record.cash_tips) || 0) + 
                          (parseFloat(record.public_drawer_dtips) || 0)
                        );
                        
                        return (
                          <tr key={recordId}>
                            <td>
                              {isEditing ? (
                                access_level === 2000 && selectedStore ? (
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    value={editForm.store_id || ''} 
                                    onChange={(e) => setEditForm({...editForm, store_id: e.target.value})}
                                    disabled
                                  />
                                ) : (
                                  <select
                                    className="form-select form-select-sm"
                                    value={editForm.store_id || ''}
                                    onChange={(e) => setEditForm({...editForm, store_id: e.target.value})}
                                  >
                                    {stores.map(store => (
                                      <option key={store.id || store.store_id || store._id} value={store.id || store.store_id || store._id}>
                                        {store.name || store.store_name}
                                      </option>
                                    ))}
                                  </select>
                                )
                              ) : (
                                storeName
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="date" 
                                  className="form-control form-control-sm" 
                                  value={editForm.daily_date || ''} 
                                  onChange={(e) => setEditForm({...editForm, daily_date: e.target.value})}
                                />
                              ) : (
                                new Date(record.daily_date).toLocaleDateString()
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.am_float || ''} 
                                  onChange={(e) => setEditForm({...editForm, am_float: e.target.value})}
                                />
                              ) : (
                                record.am_float ? `$${parseFloat(record.am_float).toFixed(2)}` : ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.am_safe || ''} 
                                  onChange={(e) => setEditForm({...editForm, am_safe: e.target.value})}
                                />
                              ) : (
                                record.am_safe ? `$${parseFloat(record.am_safe).toFixed(2)}` : ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.am_name || ''} 
                                  onChange={(e) => setEditForm({...editForm, am_name: e.target.value})}
                                />
                              ) : (
                                record.am_name || ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.pm_float || ''} 
                                  onChange={(e) => setEditForm({...editForm, pm_float: e.target.value})}
                                />
                              ) : (
                                record.pm_float ? `$${parseFloat(record.pm_float).toFixed(2)}` : ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.pm_safe || ''} 
                                  onChange={(e) => setEditForm({...editForm, pm_safe: e.target.value})}
                                />
                              ) : (
                                record.pm_safe ? `$${parseFloat(record.pm_safe).toFixed(2)}` : ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={editForm.pm_name || ''} 
                                  onChange={(e) => setEditForm({...editForm, pm_name: e.target.value})}
                                />
                              ) : (
                                record.pm_name || ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.daily_summary || ''} 
                                  onChange={(e) => setEditForm({...editForm, daily_summary: e.target.value})}
                                />
                              ) : (
                                `$${parseFloat(record.daily_summary).toFixed(2)}`
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.total_daily_drawers || ''} 
                                  onChange={(e) => setEditForm({...editForm, total_daily_drawers: e.target.value})}
                                />
                              ) : (
                                `$${parseFloat(record.total_daily_drawers).toFixed(2)}`
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="form-control form-control-sm" 
                                  value={editForm.difference || ''} 
                                  onChange={(e) => setEditForm({...editForm, difference: e.target.value})}
                                />
                              ) : (
                                record.difference ? `$${parseFloat(record.difference).toFixed(2)}` : ''
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <div>
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="form-control form-control-sm mb-1" 
                                    placeholder="Debit Tips"
                                    value={editForm.debit_tips || ''} 
                                    onChange={(e) => setEditForm({...editForm, debit_tips: e.target.value})}
                                  />
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="form-control form-control-sm mb-1" 
                                    placeholder="Cash Tips"
                                    value={editForm.cash_tips || ''} 
                                    onChange={(e) => setEditForm({...editForm, cash_tips: e.target.value})}
                                  />
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="form-control form-control-sm" 
                                    placeholder="Public Drawer Tips"
                                    value={editForm.public_drawer_dtips || ''} 
                                    onChange={(e) => setEditForm({...editForm, public_drawer_dtips: e.target.value})}
                                  />
                                </div>
                              ) : (
                                totalTips > 0 ? `$${totalTips.toFixed(2)}` : ''
                              )}
                            </td>
                            <td className="text-center">
                              {isEditing ? (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm me-2" 
                                    onClick={() => handleSave(recordId)}
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
                                    onClick={() => handleEdit(record)}
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => handleDelete(recordId)}
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

export default DailySales;