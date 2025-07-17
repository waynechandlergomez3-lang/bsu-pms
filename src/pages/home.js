import React from 'react';
import {Outlet} from 'react-router-dom';
import 'assets/home.css'; 
import Sidebar from './sidebar';

function Home() {
  return (
    <div className="home-container">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default Home;