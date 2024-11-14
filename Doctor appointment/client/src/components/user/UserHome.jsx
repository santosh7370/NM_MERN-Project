import React, { useEffect, useState } from 'react';
import { Badge, Row } from 'antd';
import Notification from '../common/Notification';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Container } from 'react-bootstrap';

import ApplyDoctor from './ApplyDoctor';
import UserAppointments from './UserAppointments';
import DoctorList from './DoctorList';

const UserHome = () => {
   const [doctors, setDoctors] = useState([]);
   const [userdata, setUserData] = useState({});
   const [activeMenuItem, setActiveMenuItem] = useState('');

   const getUser = () => {
      const user = JSON.parse(localStorage.getItem('userData'));
      if (user) {
         setUserData(user);
      }
   };

   const getUserData = async () => {
      try {
         const res = await axios.post('http://localhost:8001/api/user/getuserdata', {}, {
            headers: {
               Authorization: "Bearer " + localStorage.getItem('token'),
            },
         });
         if (res.data.success) {
            setUserData(res.data.data); // Store user data in state
         }
      } catch (error) {
         console.error("Error fetching user data:", error);
      }
   };

   const getDoctorData = async () => {
      try {
         const res = await axios.get('http://localhost:8001/api/user/getalldoctorsu', {
            headers: {
               Authorization: "Bearer " + localStorage.getItem('token'),
            },
         });
         if (res.data.success) {
            setDoctors(res.data.data);
         }
      } catch (error) {
         console.error("Error fetching doctor data:", error);
      }
   };

   useEffect(() => {
      getUser();
      getUserData();
      getDoctorData();
   }, []);

   const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      window.location.href = "/";
   };

   const handleMenuItemClick = (menuItem) => {
      setActiveMenuItem(menuItem);
   };

   return (
      <>
         <div className='main'>
            <div className="layout">
               <div className="sidebar">
                  <div className="logo">
                     <h2>MediCareBook</h2>
                  </div>
                  <div className="menu">
                     <div className={`menu-items ${activeMenuItem === 'userappointments' ? 'active' : ''}`} onClick={() => handleMenuItemClick('userappointments')}>
                        <CalendarMonthIcon className='icon' /><Link>Appointments</Link>
                     </div>
                     {userdata?.isdoctor === true ? null : (
                        <div className={`menu-items ${activeMenuItem === 'applyDoctor' ? 'active' : ''}`} onClick={() => handleMenuItemClick('applyDoctor')}>
                           <MedicationIcon className='icon' /><Link>Apply doctor</Link>
                        </div>
                     )}
                     <div className="menu-items" onClick={logout}>
                        <LogoutIcon className='icon' /><Link>Logout</Link>
                     </div>
                  </div>
               </div>
               <div className="content">
                  <div className="header">
                     <div className="header-content">
                        <Badge className={`notify ${activeMenuItem === 'notification' ? 'active' : ''}`} onClick={() => handleMenuItemClick('notification')} count={userdata?.notification ? userdata.notification.length : 0}>
                           <NotificationsIcon className="icon" />
                        </Badge>
                        {userdata?.isdoctor && <h3>Dr. </h3>}
                        <h3>{userdata?.fullName || 'Loading...'}</h3>
                     </div>
                  </div>
                  <div className="body">
                     {activeMenuItem === 'applyDoctor' && <ApplyDoctor userId={userdata._id} />}
                     {activeMenuItem === 'notification' && <Notification />}
                     {activeMenuItem === 'userappointments' && <UserAppointments />}
                     {activeMenuItem !== 'applyDoctor' && activeMenuItem !== 'notification' && activeMenuItem !== 'userappointments' && (
                        <Container>
                           <h2 className="text-center p-2">Home</h2>
                           {userdata?.isdoctor ? null : (
                              <Row>
                                 {doctors?.map((doctor, i) => {
                                    let notifyDoc = doctor.userId;
                                    return (
                                       <DoctorList userDoctorId={notifyDoc} doctor={doctor} userdata={userdata} key={i} />
                                    );
                                 })}
                              </Row>
                           )}
                        </Container>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default UserHome;
