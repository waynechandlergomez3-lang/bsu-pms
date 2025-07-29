import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import axios from 'axios';
import styles from './ParkingAssignment.module.css';

const ParkingAssignment = ({ show, onHide, layout, onAssignmentComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showBackground, setShowBackground] = useState(true);
    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [layoutElements, setLayoutElements] = useState({ lines: [], texts: [] });
    const [parkingSpaces, setParkingSpaces] = useState([]);

    useEffect(() => {
        if (layout) {
            // Set parking spaces
            setParkingSpaces(layout.parking_slots || []);
            // Set layout elements (lines and texts)
            setLayoutElements(layout.layout_elements || { lines: [], texts: [] });
        }
    }, [layout]);
    const [formData, setFormData] = useState({
        parking_slot_id: '',
        user_id: '',
        guest_name: '',
        guest_contact: '',
        vehicle_plate: '',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: '',
        notes: ''
    });
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [assignmentType, setAssignmentType] = useState('guest'); // guest or faculty

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            
            // Prepare the assignment data
            const assignmentData = {
                parking_slot_id: selectedSlot.id,
                assignee_type: formData.assignee_type,
                name: formData.name,
                contact_number: formData.contact,
                vehicle_type: formData.vehicle_type,
                plate_number: formData.vehicle_plate,
                start_time: formData.start_time,
                end_time: formData.end_time || null,
                purpose: formData.purpose
            };

            console.log('Sending assignment data:', assignmentData);

            const response = await axios.post(
                'http://localhost:8000/api/parking-assignments',
                assignmentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (onAssignmentComplete) {
                onAssignmentComplete(response.data.assignment);
            }
            onHide();
        } catch (error) {
            console.error('Error creating assignment:', error);
            setError(error.response?.data?.message || 'Failed to create parking assignment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2>{layout.name} - Select a Space to Assign</h2>
                            <button
                                onClick={() => setShowBackground(!showBackground)}
                                style={{
                                    padding: '4px 8px',
                                    background: showBackground ? '#2563eb' : '#4b5563',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {showBackground ? 'Hide Background' : 'Show Background'}
                            </button>
                        </div>
                        <button onClick={onHide}>&times;</button>
                    </div>

                    <div 
                        className={`${styles.layoutContainer} ${!showBackground ? styles.hideBg : ''}`}
                        style={{
                            backgroundImage: `url(http://localhost:8000/storage/${layout.background_image})`,
                            width: `${layout.width}px`,
                            height: `${layout.height}px`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            margin: 'auto',
                            border: '1px solid #333'
                        }}
                    >
                        {console.log('Layout dimensions:', layout.width, layout.height)}
                        {console.log('Parking slots:', layout.parking_slots)}
                        {layout.parking_slots.map(slot => (
                            <div
                                key={slot.id}
                                className={`${styles.parkingSpace} ${slot.space_status === 'occupied' ? styles.occupied : styles.available} ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                                style={{
                                    left: `${slot.position_x}px`,
                                    top: `${slot.position_y}px`,
                                    width: `${slot.width}px`,
                                    height: `${slot.height}px`,
                                    transform: `rotate(${slot.rotation || 0}deg)`,
                                    position: 'absolute'
                                }}
                                onClick={() => {
                                    setSelectedSlot(slot);
                                    setFormData(prev => ({ ...prev, parking_slot_id: slot.id }));
                                }}
                            >
                                <span className={styles.spaceNumber}>{slot.space_number}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedSlot && (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Assignment Type</label>
                        <div className={styles.radioGroup}>
                            <label>
                                <input
                                    type="radio"
                                    name="assignmentType"
                                    value="guest"
                                    checked={assignmentType === 'guest'}
                                    onChange={(e) => {
                                        setAssignmentType(e.target.value);
                                        setFormData(prev => ({ ...prev, assignee_type: 'guest' }));
                                    }}
                                />
                                Guest
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="assignmentType"
                                    value="faculty"
                                    checked={assignmentType === 'faculty'}
                                    onChange={(e) => {
                                        setAssignmentType(e.target.value);
                                        setFormData(prev => ({ ...prev, assignee_type: 'faculty' }));
                                    }}
                                />
                                Faculty
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{assignmentType === 'faculty' ? 'Faculty Name' : 'Guest Name'}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label>Contact Number</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Vehicle Type</label>
                        <select
                            name="vehicle_type"
                            value={formData.vehicle_type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select vehicle type</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="bicycle">Bicycle</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Vehicle Plate Number</label>
                        <input
                            type="text"
                            name="vehicle_plate"
                            value={formData.vehicle_plate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>End Time (Optional)</label>
                        <input
                            type="datetime-local"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Purpose of Visit</label>
                        <textarea
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            rows="3"
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.formActions}>
                        <button 
                            type="button" 
                            onClick={onHide}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Assigning...' : 'Assign Space'}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};

export default ParkingAssignment;
