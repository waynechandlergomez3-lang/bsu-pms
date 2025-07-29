import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaPlus } from 'react-icons/fa';
import './parkingspaces.css';

const Parkingspaces = () => {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showBackgrounds, setShowBackgrounds] = useState(false);

  const fetchLayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/parking-layouts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Extract the layouts array from the response
      const layouts = response.data.data || [];
      
      const layoutsWithCounts = layouts.map(layout => {
        const spaces = layout.parking_slots || [];
        const total = spaces.length;
        const occupied = spaces.filter(space => space.space_status === 'occupied').length;

        return {
          id: layout.id,
          name: layout.name,
          current: occupied,
          total: total,
          background_image: layout.background_image,
          parking_slots: spaces
        };
      });

      setLayouts(layoutsWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching layouts:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load parking layouts';
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const filteredLayouts = layouts
    .filter(layout => layout.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.current / b.total) - (a.current / a.total);
    });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <div className="loading-text">Loading parking layouts...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="parking-container">
      <div className="parking-header">
        <h1>Parking Spaces</h1>
        <div className="parking-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search parking spaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="occupancy">Sort by Occupancy</option>
          </select>
          <button 
            className="add-parking-btn" 
            onClick={() => navigate('/home/manage-parking-layout')}
          >
            <FaPlus />
            <span>Add Space</span>
          </button>
        </div>
      </div>

      {filteredLayouts.length === 0 ? (
        <div className="empty-message">
          No parking layouts found
        </div>
      ) : (
        <div className="parking-grid">
          {filteredLayouts.map(layout => {
            const occupancyRate = (layout.current / layout.total) * 100;
            let statusClass = 'available';
            if (occupancyRate >= 90) statusClass = 'busy';
            else if (occupancyRate >= 70) statusClass = 'moderate';

            return (
              <div
                key={layout.id}
                className="parking-card"
                onClick={() => navigate(`/home/parking-assignment/${layout.id}`)}
              >
                <div className="thumbnail-container">
                  {layout.background_image && (
                    <img
                      src={`http://localhost:8000/storage/${layout.background_image}`}
                      alt={layout.name}
                      className="layout-thumbnail"
                    />
                  )}
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title">{layout.name}</h3>
                    <div className={`status-badge ${statusClass}`}>
                      {occupancyRate.toFixed(0)}%
                    </div>
                  </div>
                  <div className="card-stats">
                    <div className="stat-item">
                      <div className="stat-value">{layout.total}</div>
                      <div className="stat-label">Total Spaces</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{layout.total - layout.current}</div>
                      <div className="stat-label">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="add-parking-button-container">
        <button 
          className="add-parking-btn" 
          onClick={() => navigate('/home/manage-parking-layout')}
        >
          Add Parking Space
        </button>
      </div>
    </div>
  );
};

export default Parkingspaces;
