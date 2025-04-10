import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../AuthContext';
import { API_ENDPOINTS } from '../config';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Home() {
  const [salesData, setSalesData] = useState([]);
  const [yesterdayData, setYesterdayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yesterdayLoading, setYesterdayLoading] = useState(false);
  const [error, setError] = useState(null);
  const [yesterdayError, setYesterdayError] = useState(null);
  const [storeName, setStoreName] = useState('');
  const { access_level, selectedStore } = useAuth();
  const [sevenDayData, setSevenDayData] = useState([]);
  const [sevenDayLoading, setSevenDayLoading] = useState(false);
  const [sevenDayError, setSevenDayError] = useState(null);

  // Add function to fetch store name
  const fetchStoreName = async (storeId) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.STORE_BRANCHES}/${storeId}`);
       if (response.data && response.data.data && response.data.data.store_name) {
        setStoreName(response.data.data.store_name);
      }
    } catch (error) {
      console.error('Error fetching store name:', error);
      setStoreName('');
    }
  };

  // Add function to fetch last 7 days sales data
  const fetchLastSevenDaysSales = async () => {
    try {
      setSevenDayLoading(true);
      setSevenDayError(null);
      
      // Calculate date range for the past 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      // Format dates as YYYY-MM-DD
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const startDate = formatDate(sevenDaysAgo);
      const endDate = formatDate(today);
      
      // Prepare parameters
      const params = {
        startDate,
        endDate,
        storeId: selectedStore
      };
      
      const response = await axios.get(API_ENDPOINTS.WEEKLY_SALES_REPORT, { params });
      console.log('Last 7 Days Sales Response:', response.data);
      
      // Handle different possible response structures
      let data = response.data;
      
      // If data is not an array, try to extract it from the response
      if (!Array.isArray(data)) {
        // Check if data is in a property of the response
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.weeklySales && Array.isArray(data.weeklySales)) {
          data = data.weeklySales;
        } else if (data.sales && Array.isArray(data.sales)) {
          data = data.sales;
        } else {
          // If we can't find an array, create an empty one
          console.error('Response data is not in the expected format:', data);
          data = [];
        }
      }
      
      setSevenDayData(data);
    } catch (error) {
      console.error('Error fetching last 7 days sales:', error);
      setSevenDayError('Failed to load last 7 days sales data. Please try again later.');
      setSevenDayData([]); // Set empty array on error
    } finally {
      setSevenDayLoading(false);
    }
  };

  useEffect(() => {
    if (access_level === 1000) {
      fetchWeeklySalesReport();
    }
    if (access_level === 2000) {
      fetchYesterdaySalesReport();
      fetchWeeklySalesReport();
      if (selectedStore) {
        fetchStoreName(selectedStore);
        fetchLastSevenDaysSales();
      }
    }
  }, [access_level, selectedStore]);

  const fetchWeeklySalesReport = async (timeframe) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        store_id: selectedStore,
        timeframe: timeframe
      };
      
      const response = await axios.get(API_ENDPOINTS.WEEKLY_SALES_REPORT, { params });
      
      if (response.data.success) {
        setSalesData(response.data.data);
      } else {
        setError('Failed to load weekly sales report');
      }
    } catch (error) {
      console.error('Error fetching weekly sales report:', error);
      setError('Failed to load weekly sales report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchYesterdaySalesReport = async () => {
    try {
      setYesterdayLoading(true);
      setYesterdayError(null);
      
      // Calculate yesterday's date
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Format dates as YYYY-MM-DD
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const startDate = formatDate(yesterday);
      const endDate = formatDate(yesterday);
      
      // Prepare parameters
      const params = {
        startDate,
        endDate,
        storeId: selectedStore
      };
      
      const response = await axios.get(API_ENDPOINTS.WEEKLY_SALES_REPORT, { params });
      console.log('Yesterday Sales Report Response:', response.data);
      
      // Handle different possible response structures
      let data = response.data;
      
      if (!Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.sales && Array.isArray(data.sales)) {
          data = data.sales;
        } else {
          console.error('Response data is not in the expected format:', data);
          data = [];
        }
      }
      
      // Get the first item from the array (should be yesterday's data)
      setYesterdayData(data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching yesterday sales report:', error);
      setYesterdayError('Failed to load yesterday sales report. Please try again later.');
      setYesterdayData(null);
    } finally {
      setYesterdayLoading(false);
    }
  };

  // Prepare data for the chart with proper type conversion
  const chartData = {
    labels: salesData.map(item => {
      // Format the date to be more readable
      const date = new Date(item.daily_date);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData.map(item => parseFloat(item.daily_summary) || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Total Drawers',
        data: salesData.map(item => parseFloat(item.total_daily_drawers) || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      },
      {
        label: 'Total Tips',
        data: salesData.map(item => parseFloat(item.total_tips) || 0),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Sales Report'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Calculate summary statistics with proper type conversion and error handling
  const totalSales = salesData.reduce((sum, item) => {
    const value = parseFloat(item.daily_summary) || 0;
    return sum + value;
  }, 0);
  
  const totalDrawers = salesData.reduce((sum, item) => {
    const value = parseFloat(item.total_daily_drawers) || 0;
    return sum + value;
  }, 0);
  
  const totalTips = salesData.reduce((sum, item) => {
    const value = parseFloat(item.total_tips) || 0;
    return sum + value;
  }, 0);
  
  const averageDailySales = salesData.length > 0 ? totalSales / salesData.length : 0;

  // Prepare data for the 7-day chart
  const sevenDayChartData = {
    labels: sevenDayData.map(item => {
      const date = new Date(item.daily_date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'Daily Sales',
        data: sevenDayData.map(item => parseFloat(item.daily_summary) || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const sevenDayChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Last 7 Days Sales'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Day'
        }
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Dashboard</h1>
          {access_level === 2000 && selectedStore && (
            <p className="text-center text-muted mb-4">Showing data for store: <span className="fw-bold fs-5">{storeName || 'Loading...'}</span></p>
          )}
          <hr className="mb-4" />
        </div>
      </div>

      {/* Yesterday's Sales Report - Only visible to supervisors */}
      {access_level === 2000 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h2 className="card-title mb-0">Yesterday's Sales Report</h2>
              </div>
              <div className="card-body">
                {yesterdayLoading && (
                  <div className="text-center">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading yesterday's sales report...</p>
                  </div>
                )}
                
                {yesterdayError && (
                  <div className="alert alert-danger" role="alert">
                    {yesterdayError}
                  </div>
                )}
                
                {!yesterdayLoading && !yesterdayError && !yesterdayData && (
                  <div className="alert alert-info" role="alert">
                    No sales data available for yesterday.
                  </div>
                )}
                
                {!yesterdayLoading && !yesterdayError && yesterdayData && (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="card-title">Sales</h5>
                          <p className="card-text h3">${(parseFloat(yesterdayData.daily_summary) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="card-title">Drawers</h5>
                          <p className="card-text h3">${(parseFloat(yesterdayData.total_daily_drawers) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="card-title">Tips</h5>
                          <p className="card-text h3">${(parseFloat(yesterdayData.total_tips) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="card-title">Date</h5>
                          <p className="card-text h4">
                            {new Date(yesterdayData.daily_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Sales Report - Only visible to admins */}
      {access_level === 1000 && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h2 className="card-title mb-0">Weekly Sales Report</h2>
              </div>
              <div className="card-body">
                {loading && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading weekly sales report...</p>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {!loading && !error && salesData.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    No sales data available.
                  </div>
                )}
                
                {!loading && !error && salesData.length > 0 && (
                  <>
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Sales</h5>
                            <p className="card-text h3">${totalSales.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Drawers</h5>
                            <p className="card-text h3">${totalDrawers.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Tips</h5>
                            <p className="card-text h3">${totalTips.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Avg. Daily Sales</h5>
                            <p className="card-text h3">${averageDailySales.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                    
                    <div className="table-responsive mt-4">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Date</th>
                            <th>Daily Sales</th>
                            <th>Total Drawers</th>
                            <th>Total Tips</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map((item, index) => {
                            const date = new Date(item.daily_date);
                            const formattedDate = date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                            
                            return (
                              <tr key={index}>
                                <td>{formattedDate}</td>
                                <td>${(parseFloat(item.daily_summary) || 0).toFixed(2)}</td>
                                <td>${(parseFloat(item.total_daily_drawers) || 0).toFixed(2)}</td>
                                <td>${(parseFloat(item.total_tips) || 0).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last 7 Days Sales Graph - Only visible to supervisors */}
      {access_level === 2000 && selectedStore && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h2 className="card-title mb-0">Last 7 Days Sales</h2>
              </div>
              <div className="card-body">
                {sevenDayLoading && (
                  <div className="text-center">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading last 7 days sales data...</p>
                  </div>
                )}
                
                {sevenDayError && (
                  <div className="alert alert-danger" role="alert">
                    {sevenDayError}
                  </div>
                )}
                
                {!sevenDayLoading && !sevenDayError && sevenDayData.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    No sales data available for the last 7 days.
                  </div>
                )}
                
                {!sevenDayLoading && !sevenDayError && sevenDayData.length > 0 && (
                  <div className="chart-container" style={{ height: '400px' }}>
                    <Line data={sevenDayChartData} options={sevenDayChartOptions} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message for users without appropriate access level */}
      {access_level !== 1000 && access_level !== 2000 && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">No Reports Available</h4>
              <p>You don't have permission to view sales reports. Please contact your administrator if you believe this is an error.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;