import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaUser, FaHouseUser, FaCalendar, FaCog, FaTruck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './Sidebar.css';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

function Sidebar() {
  const location = useLocation();
  const isAboutPage = location.pathname.startsWith('/about');
  const { logout, user, access_level, selectedStore } = useAuth();
  const navigate = useNavigate();
  const urlpath = location.pathname;
  const [storeName, setStoreName] = useState('');
  
  useEffect(() => {
    const fetchStoreName = async () => {
      if (selectedStore) {
        try {
          const response = await axios.get(`${API_ENDPOINTS.STORE_BRANCHES}/${selectedStore}`);
          if (response.data && response.data.data && response.data.data.store_name) {
            setStoreName(response.data.data.store_name);
          }
        } catch (error) {
          console.error('Error fetching store name:', error);
          setStoreName('');
        }
      }
    };
    
    fetchStoreName();
  }, [selectedStore]);

  const menuOptions = [
    {label:'Home',path:'/',icon:<FaHome />},
    {label:'Employees',path:'/employees',icon:<FaUser />},
    {label:'Stores',path:'/stores',icon:<FaHouseUser />},
    {label:'Daily Sales',path:'/daily-sales',icon:<FaCalendar />},
    {label:'Deliveries',path:'/deliveries',icon:<FaTruck />},
    {label:'Settings',path:'/settings',icon:<FaCog />}
  ]

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Specify the indices you want to display
  let indicesToShow =[]; 
  
  switch(location.pathname){
    case '/':
        switch(access_level){
            case 1000:
                indicesToShow=[0,1,2,3,4,5];
                break;
            case 2000:
                indicesToShow=[0,3,5];
                break;
            case 3000:
                indicesToShow=[0,3,5];
                break;
            case 5000:
                indicesToShow=[0,4,5];
                break;
        }
        break;
    case '/employees':
        switch(access_level){
          case 1000:
              indicesToShow=[0,1,2,3,4];
              break;
          case 2000:
              indicesToShow=[0,3,4];
              break;
            case 3000:
                indicesToShow=[0,3,4];
                break;
          case 5000:
              indicesToShow=[0,3,4];
              break;
      }
        break;
    case '/stores':
        switch(access_level){
            case 1000:
                indicesToShow=[0,1,2,3,4];
                break;
            case 2000:
                indicesToShow=[0,3,4];
                break;
            case 3000:
                indicesToShow=[0,3,4];
                break;
            case 5000:
                indicesToShow=[0,3,4];
                break;
        }
    case '/daily-sales':
        switch(access_level){
            case 1000:
                indicesToShow=[0,1,2,3,4];
                break;
            case 2000:
                indicesToShow=[0,3,4];
                break;
            case 3000:
                indicesToShow=[0,3,4];
                break;
            case 5000:
                indicesToShow=[0,3,4];
                break;
        }
        break;
    case '/settings':
        switch(access_level){
            case 1000:
                indicesToShow=[0,1,2,3,4];
                break;
            case 2000:
                indicesToShow=[0,3,4];
                break;
            case 3000:
                indicesToShow=[0,3,4];
                break;
            case 5000:
                indicesToShow=[0,3,4];
                break;
        }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Company Logo" className="sidebar-logo mb-3" style={{ maxWidth: '150px' }} />
        <h4>Login User</h4>
        <h5>[{user?.username || 'User'}]</h5>
        <h5>Branch: {storeName || 'Branch'}</h5>
      </div>
      <div className="sidebar-content">
        <ul className="sidebar-menu">
          {menuOptions
            .filter((_, index) => indicesToShow.includes(index))
            .map((option, index) => (
              <li key={index}>
                <Link to={option.path}>{option.icon} &nbsp;&nbsp; {option.label}</Link>
              </li>
            ))}
        </ul>
      </div>
      <div className="sidebar-footer">
        <button className="btn btn-danger w-100" onClick={handleLogout}>
          <FaSignOutAlt /> &nbsp; Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;