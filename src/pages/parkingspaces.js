import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'assets/parkingspaces.css';

const parkingData = [
  { name: "Pimentel Hall", current: 20, total: 20 },
  { name: "Federizo Hall", current: 15, total: 20 },
  { name: "Alvarado Hall", current: 9, total: 10 },
  { name: "College of Law", current: 29, total: 35 },
  { name: "Natividad Hall", current: 6, total: 6 },
  { name: "Flores Hall", current: 6, total: 6 },
  { name: "Mendoza Hall", current: 15, total: 20 },
  { name: "Hostel Main", current: 10, total: 10 },
];

const Parkingspaces = () => {
  const navigate = useNavigate();

  const getStatusColor = (current, total) => {
    const percent = (current / total) * 100;
    if (percent === 100) return 'red';
    if (percent >= 80) return 'orange';
    return 'green';
  };

  return (
    <div className="parking-container">
      <div className="parking-header">
        <input
          type="text"
          placeholder="Search..."
          className="parking-search"
        />
      </div>

      <div className="parking-grid">
        {parkingData.map((space, index) => (
          <div key={index} className="parking-card">
            <h4>{space.name}</h4>
            <p>{space.current}/{space.total}</p>
            <span
              className={`status-indicator ${getStatusColor(space.current, space.total)}`}
            ></span>
          </div>
        ))}
      </div>

      <div className="add-parking-button-container">
        <button className="add-parking-btn" onClick={() => navigate('/editparkingspace')}>
          Add Parking Space
        </button>
      </div>
    </div>
  );
};

export default Parkingspaces;
