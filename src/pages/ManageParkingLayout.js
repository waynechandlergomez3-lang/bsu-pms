import React, { useState } from 'react';
import ParkingLayoutEditor from '../components/ParkingLayoutEditor';
import axios from 'axios';
import { HexColorPicker } from 'react-colorful';

const ManageParkingLayout = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [layoutName, setLayoutName] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [mode, setMode] = useState('view');
  const [spaceColor, setSpaceColor] = useState('rgba(0, 255, 0, 0.3)');
  const [lineColor, setLineColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [textSize, setTextSize] = useState(16);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textInput, setTextInput] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError(null);
  };


  // Only upload the image and preview it, do not create a layout yet
  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      // Preview the image locally
      const url = URL.createObjectURL(selectedFile);
      setCurrentImage(selectedFile);
      setCurrentImageUrl(url);
      setIsImageUploaded(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to preview image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCreateLayout = async (layoutData) => {
    if (!currentImage || !layoutName.trim()) {
      alert('Please provide both a layout name and background image');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('name', layoutName);
      formData.append('background_image', selectedFile);
      formData.append('layout_data', JSON.stringify(layoutData));

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/parking-layouts',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201) {
        alert('Layout created successfully!');
        setIsImageUploaded(false);
        setCurrentImage(null);
        setCurrentImageUrl(null);
        setLayoutName('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error creating layout:', error);
      setUploadError(error.response?.data?.message || 'Error creating layout');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#FFFFFF', 
      color: '#333333',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar */}
      <div style={{ 
        minWidth: '300px',
        width: '300px',
        flexShrink: 0,
        background: '#FFFFFF', 
        padding: '20px',
        borderRight: '2px solid #FFE5E5',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 'bold',
          color: '#333333',
          marginBottom: '20px'
        }}>Upload New Layout</h2>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            color: '#666666'
          }}>Layout Name</label>
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#FFFFFF',
              border: '2px solid #FFD5D5',
              borderRadius: '8px',
              color: '#333333',
              fontSize: '14px',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="Enter layout name"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            color: '#e0e0e0'
          }}>Background Image</label>
          <div style={{
            border: '2px dashed #FFD5D5',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#FFFFFF',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.background = '#404040';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.background = '#333';
          }}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput" style={{ 
              cursor: 'pointer',
              color: '#888',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg style={{ width: '40px', height: '40px', fill: '#666' }} viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              {selectedFile ? selectedFile.name : 'Click to upload or drag image here'}
            </label>
          </div>
        </div>

        <button
          onClick={handleImageUpload}
          disabled={isUploading || !selectedFile}
          style={{
            width: '100%',
            padding: '12px',
            background: '#E76F6F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(231, 111, 111, 0.2)',
            transition: 'all 0.2s'
          }}
        >
          {isUploading ? 'Uploading...' : 'Preview Image'}
        </button>

        {uploadError && (
          <div style={{ 
            color: '#ff4444', 
            padding: '10px', 
            background: 'rgba(255,0,0,0.1)',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {uploadError}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '2px solid #FFE5E5', margin: '20px 0' }}></div>

        {/* Drawing Tools */}
        {isImageUploaded && (
          <div>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 'bold',
              color: '#333333',
              marginBottom: '12px'
            }}>Drawing Tools</h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setMode('draw')}
                style={{
                  background: mode === 'draw' ? '#E76F6F' : '#FFFFFF',
                  border: '2px solid ' + (mode === 'draw' ? '#E76F6F' : '#FFD5D5'),
                  borderRadius: '8px',
                  color: mode === 'draw' ? '#FFFFFF' : '#666666',
                  padding: '12px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: mode === 'draw' ? '0 2px 4px rgba(231, 111, 111, 0.2)' : 'none'
                }}
              >
                Draw Space
              </button>
              <button
                onClick={() => setMode('line')}
                style={{
                  background: mode === 'line' ? '#E76F6F' : '#FFFFFF',
                  border: '2px solid ' + (mode === 'line' ? '#E76F6F' : '#FFD5D5'),
                  borderRadius: '8px',
                  color: mode === 'line' ? '#FFFFFF' : '#666666',
                  padding: '12px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: mode === 'line' ? '0 2px 4px rgba(231, 111, 111, 0.2)' : 'none'
                }}
              >
                Draw Line
              </button>
              <button
                onClick={() => setMode('text')}
                style={{
                  background: mode === 'text' ? '#E76F6F' : '#FFFFFF',
                  border: '2px solid ' + (mode === 'text' ? '#E76F6F' : '#FFD5D5'),
                  borderRadius: '8px',
                  color: mode === 'text' ? '#FFFFFF' : '#666666',
                  padding: '12px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: mode === 'text' ? '0 2px 4px rgba(231, 111, 111, 0.2)' : 'none'
                }}
              >
                Add Text
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setMode('edit')}
                style={{
                  background: mode === 'edit' ? '#E76F6F' : '#FFFFFF',
                  border: '2px solid ' + (mode === 'edit' ? '#E76F6F' : '#FFD5D5'),
                  borderRadius: '8px',
                  color: mode === 'edit' ? '#FFFFFF' : '#666666',
                  padding: '12px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: mode === 'edit' ? '0 2px 4px rgba(231, 111, 111, 0.2)' : 'none'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setMode('view')}
                style={{
                  background: mode === 'view' ? '#E76F6F' : '#FFFFFF',
                  border: '2px solid ' + (mode === 'view' ? '#E76F6F' : '#FFD5D5'),
                  borderRadius: '8px',
                  color: mode === 'view' ? '#FFFFFF' : '#666666',
                  padding: '12px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: mode === 'view' ? '0 2px 4px rgba(231, 111, 111, 0.2)' : 'none'
                }}
              >
                Pan
              </button>
            </div>

            {mode === 'draw' && (
              <>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#666666'
                }}>Space Color</label>
                <HexColorPicker 
                  color={spaceColor} 
                  onChange={setSpaceColor}
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#666666'
                  }}>Space Label</label>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter space number/label"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#FFFFFF',
                      border: '2px solid #FFD5D5',
                      borderRadius: '8px',
                      color: '#333333',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                </div>
              </>
            )}

            {mode === 'line' && (
              <>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#e0e0e0'
                }}>Line Color</label>
                <HexColorPicker 
                  color={lineColor} 
                  onChange={setLineColor}
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#e0e0e0'
                  }}>Line Width</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ textAlign: 'center', color: '#e0e0e0' }}>{lineWidth}px</div>
                </div>
              </>
            )}

            {mode === 'text' && (
              <>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#e0e0e0'
                }}>Text Content</label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text (e.g., ENTRANCE, EXIT, Section A)"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#404040',
                    border: '1px solid #505050',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}
                />
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#e0e0e0'
                }}>Text Color</label>
                <HexColorPicker 
                  color={textColor} 
                  onChange={setTextColor}
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#e0e0e0'
                  }}>Text Size</label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ textAlign: 'center', color: '#e0e0e0' }}>{textSize}px</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content/Canvas Area */}
      <div style={{ flex: 1, position: 'relative', background: '#FFFFFF' }}>
        {isImageUploaded ? (
          <div style={{ width: '100%', height: '100%' }}>
            <ParkingLayoutEditor
              layoutName={layoutName}
              backgroundImage={currentImageUrl}
              backgroundImageFile={currentImage}
              mode={mode}
              spaceColor={spaceColor}
              lineColor={lineColor}
              lineWidth={lineWidth}
              textSize={textSize}
              textColor={textColor}
              textInput={textInput}
              onTextInputChange={(text) => setTextInput(text)}
              onSave={handleCreateLayout}
            />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Upload a layout image and enter a name to start editing
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageParkingLayout;
