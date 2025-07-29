import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/ParkingLayout.module.css';

const ParkingLayouts = () => {
  const [layouts, setLayouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const response = await axios.get('/api/parking-layouts');
      setLayouts(response.data);
    } catch (error) {
      console.error('Error fetching layouts:', error);
    }
  };

  const handleDeleteLayout = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this layout?')) return;

    try {
      await axios.delete(`/api/parking-layouts/${id}`);
      await fetchLayouts();
    } catch (error) {
      console.error('Error deleting layout:', error);
    }
  };

  const filteredLayouts = layouts.filter(layout =>
    layout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search layouts..."
            className={styles.searchBar}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className={styles.actionButton}
            onClick={() => navigate('/parking-layout/new')}
          >
            Create New Layout
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {filteredLayouts.map(layout => (
            <div
              key={layout.id}
              className={styles.layoutCard}
              onClick={() => navigate(`/parking-layout/edit/${layout.id}`)}
            >
              <div className={styles.layoutPreview}>
                {layout.backgroundImage && (
                  <img src={layout.backgroundImage} alt={layout.name} />
                )}
              </div>
              <div className={styles.layoutTitle}>{layout.name}</div>
              <div className={styles.layoutInfo}>
                <span>{layout.spaces?.length || 0} spaces</span>
                <span>Last modified: {new Date(layout.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.iconButton}
                  onClick={(e) => handleDeleteLayout(layout.id, e)}
                  title="Delete layout"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkingLayouts;
