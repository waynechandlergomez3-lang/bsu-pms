import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Rect, Group, Transformer, Text, Line, Circle } from 'react-konva';
import styles from './ParkingLayoutEditor.module.css';
import axios from 'axios';
import { FaEdit, FaDrawPolygon, FaHandPaper, FaTrash, FaSave, FaCopy } from 'react-icons/fa';
import { BsSquare } from 'react-icons/bs';

const ParkingLayoutEditor = ({ 
  layoutId, 
  backgroundImage, 
  initialLayoutData, 
  mode, 
  spaceColor, 
  lineColor,
  lineWidth,
  textSize,
  textColor,
  textInput,
  onTextInputChange,
  onSave 
}) => {
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: '50%' });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleToolbarMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't start drag if clicking a button
    setIsDragging(true);
    const toolbar = e.currentTarget;
    const rect = toolbar.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleToolbarMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    setToolbarPosition({ x, y });
  };

  const handleToolbarMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleToolbarMouseMove);
      document.addEventListener('mouseup', handleToolbarMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleToolbarMouseMove);
        document.removeEventListener('mouseup', handleToolbarMouseUp);
      };
    }
  }, [isDragging]);
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 1024, height: 768 });
  const [parkingSpaces, setParkingSpaces] = useState(initialLayoutData?.spaces || []);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRectangle, setNewRectangle] = useState(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [editorMode, setMode] = useState(mode || 'view');
  const [spaceType, setSpaceType] = useState('standard'); // standard, compact, handicap, ev
  const [lines, setLines] = useState(initialLayoutData?.lines || []);
  const [texts, setTexts] = useState(initialLayoutData?.texts || []);
  const [drawingLine, setDrawingLine] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  // Load background image when it changes
  useEffect(() => {
    if (backgroundImage) {
      const loadImage = async () => {
        try {
          // If backgroundImage is a base64 string or URL, use it directly
          const img = new window.Image();
          img.src = backgroundImage;
          img.crossOrigin = 'anonymous';  // Add this to handle CORS

          img.onload = () => {
            setImageSize({
              width: 1024,
              height: 768
            });
            setImage(img);
          };

          img.onerror = async () => {
            // If direct loading fails, try to fetch it
            try {
              const response = await fetch(backgroundImage);
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              
              const newImg = new window.Image();
              newImg.src = objectUrl;
              
              newImg.onload = () => {
                setImageSize({
                  width: 1024,
                  height: 768
                });
                setImage(newImg);
                URL.revokeObjectURL(objectUrl);
              };
            } catch (error) {
              console.error('Failed to load image:', error);
            }
          };
        } catch (error) {
          console.error('Error loading image:', error);
        }
      };
      
      loadImage();
    }
  }, [backgroundImage]);

  const handleMouseDown = (e) => {
    // Don't handle if clicking on an existing object in edit mode
    if (editorMode === 'edit' && e.target !== e.target.getStage()) {
      return;
    }

    const pos = e.target.getStage().getPointerPosition();
    const stagePos = {
      x: (pos.x - stagePosition.x) / stageScale,
      y: (pos.y - stagePosition.y) / stageScale
    };
    
    switch (editorMode) {
      case 'draw':
        setIsDrawing(true);
        setStartPoint(stagePos);
        setNewRectangle({
          x: stagePos.x,
          y: stagePos.y,
          width: 0,
          height: 0
        });
        break;
      case 'line':
        setIsDrawing(true);
        setDrawingLine({
          points: [stagePos.x, stagePos.y, stagePos.x, stagePos.y],
          stroke: lineColor || '#fff',
          strokeWidth: lineWidth || 2
        });
        break;
      case 'text':
        const newText = {
          x: stagePos.x,
          y: stagePos.y,
          text: textInput || 'Double click to edit',
          fontSize: textSize || 16,
          fill: textColor || '#fff',
        };
        setTexts([...texts, newText]);
        break;
      case 'view':
        e.target.getStage().startPos = pos;
        break;
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const pos = {
      x: (point.x - stagePosition.x) / stageScale,
      y: (point.y - stagePosition.y) / stageScale
    };

    if (editorMode === 'view' && stage.startPos && e.evt.buttons === 1) {
      // Calculate new position for panning
      const dx = point.x - stage.startPos.x;
      const dy = point.y - stage.startPos.y;
      setStagePosition({
        x: stagePosition.x + dx,
        y: stagePosition.y + dy
      });
      stage.startPos = point;
      return;
    }

    if (!isDrawing) return;

    if (editorMode === 'line' && drawingLine) {
      const newPoints = drawingLine.points.slice();
      newPoints[2] = pos.x;
      newPoints[3] = pos.y;
      setDrawingLine({
        ...drawingLine,
        points: newPoints
      });
      return;
    }
    
    const width = (point.x - stagePosition.x) / stageScale - startPoint.x;
    const height = (point.y - stagePosition.y) / stageScale - startPoint.y;

    setNewRectangle({
      x: startPoint.x,
      y: startPoint.y,
      width: width,
      height: height,
    });
    const pos2 = {
      x: (point.x - stagePosition.x) / stageScale,
      y: (point.y - stagePosition.y) / stageScale
    };

    setNewRectangle({
      x: Math.min(pos2.x, startPoint.x),
      y: Math.min(pos2.y, startPoint.y),
      width: Math.abs(pos2.x - startPoint.x),
      height: Math.abs(pos2.y - startPoint.y)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (editorMode === 'draw' && newRectangle && newRectangle.width > 10 && newRectangle.height > 10) {
      const newSpaceNumber = parkingSpaces.length + 1;
      const newSpace = {
        ...newRectangle,
        id: `space-${newSpaceNumber}`,
        name: `Space ${newSpaceNumber}`,
        type: spaceType,
        status: 'available',
        fill: spaceColor,
        space_number: `Space ${newSpaceNumber}`,
        space_type: spaceType,
        space_status: 'available'
      };
      setParkingSpaces([...parkingSpaces, newSpace]);
      setNewRectangle(null);
    } else if (editorMode === 'line' && drawingLine) {
      // Only add the line if it has some length
      const [x1, y1, x2, y2] = drawingLine.points;
      if (Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5) {
        setLines([...lines, drawingLine]);
      }
      setDrawingLine(null);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setStageScale(newScale);
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePosition(newPos);
  };
  
  useEffect(() => {
    if (backgroundImage) {
      const loadImage = async () => {
        try {
          // Fetch the image through our API
          const response = await fetch(backgroundImage);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          
          const img = new window.Image();
          img.src = objectUrl;
          
          img.onload = () => {
            // Use fixed dimensions of 1024x768
            setImageSize({
              width: 1024,
              height: 768
            });
            setImage(img);
            URL.revokeObjectURL(objectUrl); // Clean up
          };
          
          img.onerror = (e) => {
            console.error('Error loading image:', e);
            URL.revokeObjectURL(objectUrl); // Clean up
          };
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      };
      
      loadImage();
    }
  }, [backgroundImage]);

  useEffect(() => {
    if (initialLayoutData) {
      // Convert saved spaces back to the format needed for the editor
      const spaces = initialLayoutData.parking_slots || initialLayoutData.spaces || [];
      const loadedLines = initialLayoutData.lines || [];
      const loadedTexts = initialLayoutData.texts || [];
      
      // Load the lines and texts from initialLayoutData
      if (loadedLines && loadedLines.length > 0) {
        setLines(loadedLines);
      }
      if (loadedTexts && loadedTexts.length > 0) {
        setTexts(loadedTexts);
      }
      
      console.log('Loading layout elements:', {
        spaces: spaces.length,
        lines: loadedLines.length,
        texts: loadedTexts.length
      });
      
      const convertedSpaces = spaces.map(space => ({
        id: space.id,
        name: space.name || space.space_number,
        type: space.type || space.space_type,
        status: space.status || space.space_status,
        x: space.metadata?.x || space.position_x || 0,
        y: space.metadata?.y || space.position_y || 0,
        width: space.metadata?.width || space.width || 100,
        height: space.metadata?.height || space.height || 200,
        fill: space.metadata?.fill || spaceColor
      }));
      setParkingSpaces(convertedSpaces);
    }
  }, [initialLayoutData, spaceColor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return; // Don't handle if user is typing in an input

      switch (e.key.toLowerCase()) {
        case 'v':
          setMode('edit');
          break;
        case 'd':
          setMode('draw');
          break;
        case 'h':
          setMode('view');
          break;
        case 'delete':
        case 'backspace':
          if (selectedSpace && editorMode === 'edit') {
            setParkingSpaces(spaces => spaces.filter(space => space.id !== selectedSpace.id));
            setSelectedSpace(null);
          }
          break;
        case 'escape':
          setSelectedSpace(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorMode, selectedSpace]);

  const handleAddSpace = () => {
    const newSpace = {
      x: 50,
      y: 50,
      width: 100,
      height: 200,
      id: Date.now(),
      status: 'available',
      label: `Space ${parkingSpaces.length + 1}`,
      type: 'standard'
    };
    setParkingSpaces([...parkingSpaces, newSpace]);
  };

  const handleSpaceClick = (space) => {
    if (editorMode === 'edit') {
      setSelectedSpace(space);
    }
  };

  const handleDragEnd = (e, id) => {
    const updatedSpaces = parkingSpaces.map(space => {
      if (space.id === id) {
        return {
          ...space,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return space;
    });
    setParkingSpaces(updatedSpaces);
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Reset scale to 1 and update width/height instead
    node.scaleX(1);
    node.scaleY(1);

    const updatedSpaces = parkingSpaces.map(space => {
      if (space.id === id) {
        return {
          ...space,
          x: node.x(),
          y: node.y(),
          width: Math.max(50, node.width() * scaleX), // minimum width of 50
          height: Math.max(50, node.height() * scaleY), // minimum height of 50
          rotation: rotation // add rotation
        };
      }
      return space;
    });
    setParkingSpaces(updatedSpaces);
  };

  const handleSave = async () => {
    try {
      // Format the spaces data according to the API requirements
      const formattedSpaces = parkingSpaces.map(space => {
        // Ensure all required fields have non-null values
        const spaceNumber = space.name || `Space ${space.id}`;
        const spaceType = space.type || 'standard';
        const spaceStatus = space.status || 'available';
        
        return {
          id: space.id,
          space_number: spaceNumber,
          space_type: spaceType,
          space_status: spaceStatus,
          position_x: Math.round(space.x),
          position_y: Math.round(space.y),
          width: Math.round(space.width),
          height: Math.round(space.height),
          rotation: space.rotation || 0, // Add rotation directly to the slot
          metadata: {
            rotation: space.rotation || 0, // Also keep in metadata for backwards compatibility
            fill: space.fill || spaceColor,
            type: spaceType,
            name: spaceNumber
          }
        };
      });
      // Format the data and log counts
      const formattedLines = lines.map(line => ({
        points: line.points,
        color: line.stroke,
        width: line.strokeWidth
      }));
      
      const formattedTexts = texts.map(text => ({
        x: text.x,
        y: text.y,
        text: text.text,
        size: text.fontSize,
        color: text.fill
      }));

      console.log('Saving layout elements:', {
        spaces: formattedSpaces.length,
        lines: formattedLines.length,
        texts: formattedTexts.length
      });

      // Create the layout data
      const layoutData = {
        parking_slots: formattedSpaces,
        lines: formattedLines,
        texts: formattedTexts
      };

      console.log('About to save layout data:', {
        rawLines: lines,
        rawTexts: texts,
        formattedLines,
        formattedTexts,
        fullLayoutData: layoutData
      });

      // Create the final layout data structure
      const finalLayoutData = {
        parking_slots: formattedSpaces,
        lines: formattedLines.map(line => ({
          points: line.points,
          stroke: line.stroke || lineColor,
          strokeWidth: line.strokeWidth || lineWidth
        })),
        texts: formattedTexts.map(text => ({
          x: text.x,
          y: text.y,
          text: text.text,
          fontSize: text.fontSize || textSize,
          fill: text.fill || textColor
        }))
      };

      console.log('Final layout data:', finalLayoutData);

      if (onSave) {
        await onSave(finalLayoutData);
      } else {
        throw new Error('No save handler provided');
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      
      let errorMessage = 'Failed to save layout: ';
      
      if (error.response) {
        // The server responded with an error
        if (error.response.data && error.response.data.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage += error.response.data.error;
        } else {
          errorMessage += `Server error (${error.response.status})`;
        }
        
        // Log the detailed error for debugging
        console.log('Server Error Details:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className={styles.editorContainer}>
      
      <div 
        className={styles.toolbar}
        style={{
          left: typeof toolbarPosition.x === 'number' ? `${toolbarPosition.x}px` : toolbarPosition.x,
          top: typeof toolbarPosition.y === 'number' ? `${toolbarPosition.y}px` : toolbarPosition.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleToolbarMouseDown}
      >
        {/* Drawing Tools */}
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolButton} ${editorMode === 'view' ? styles.active : ''}`}
            onClick={() => setMode('view')}
            title="View Mode (H)"
          >
            <FaHandPaper />
          </button>
          <button
            className={`${styles.toolButton} ${editorMode === 'draw' ? styles.active : ''}`}
            onClick={() => setMode('draw')}
            title="Draw Mode (D)"
          >
            <FaDrawPolygon />
          </button>
          <button
            className={`${styles.toolButton} ${editorMode === 'edit' ? styles.active : ''}`}
            onClick={() => setMode('edit')}
            title="Edit Mode (V)"
          >
            <FaEdit />
          </button>
          <button
            className={`${styles.toolButton} ${editorMode === 'line' ? styles.active : ''}`}
            onClick={() => setMode('line')}
            title="Draw Line"
          >
            <span>╱</span>
          </button>
          <button
            className={`${styles.toolButton} ${editorMode === 'text' ? styles.active : ''}`}
            onClick={() => setMode('text')}
            title="Add Text"
          >
            <span>T</span>
          </button>
        </div>

        {/* Space Types */}
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolButton} ${spaceType === 'standard' ? styles.active : ''}`}
            onClick={() => setSpaceType('standard')}
            title="Standard Parking Space"
          >
            <BsSquare />
            <span className={styles.indicator}>S</span>
          </button>
          <button
            className={`${styles.toolButton} ${spaceType === 'compact' ? styles.active : ''}`}
            onClick={() => setSpaceType('compact')}
            title="Compact Parking Space"
          >
            <BsSquare />
            <span className={styles.indicator}>C</span>
          </button>
          <button
            className={`${styles.toolButton} ${spaceType === 'handicap' ? styles.active : ''}`}
            onClick={() => setSpaceType('handicap')}
            title="Handicap Parking Space"
          >
            <BsSquare />
            <span className={styles.indicator}>H</span>
          </button>
          <button
            className={`${styles.toolButton} ${spaceType === 'ev' ? styles.active : ''}`}
            onClick={() => setSpaceType('ev')}
            title="Electric Vehicle Parking Space"
          >
            <BsSquare />
            <span className={styles.indicator}>EV</span>
          </button>
        </div>

        {/* Actions */}
        <div className={styles.toolGroup}>
          {selectedSpace && (
            <>
              <button
                className={styles.toolButton}
                onClick={() => {
                  const newSpace = {
                    ...selectedSpace,
                    id: `space-${Date.now()}`,
                    x: selectedSpace.x + 20,
                    y: selectedSpace.y + 20,
                    name: `${selectedSpace.name || 'Space'} (Copy)`,
                    rotation: selectedSpace.rotation || 0
                  };
                  setParkingSpaces([...parkingSpaces, newSpace]);
                }}
                title="Duplicate Space"
              >
                <FaCopy />
              </button>
              <button
                className={styles.toolButton}
                onClick={() => {
                  setParkingSpaces(spaces => spaces.filter(space => space.id !== selectedSpace.id));
                  setSelectedSpace(null);
                }}
                title="Delete Selected Space"
              >
                <FaTrash />
              </button>
            </>
          )}
          <button
            className={styles.toolButton}
            onClick={handleSave}
            title="Save Layout"
          >
            <FaSave />
          </button>
        </div>
      </div>
      <div className={styles.stageContainer} style={{ width: '1024px', height: '768px', margin: '0 auto', position: 'relative' }}>
        <Stage
          ref={stageRef}
          width={1024}
          height={768}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          style={{ background: '#1a1a1a' }}
      >
        <Layer>
          {image && (
            <Image
              image={image}
              width={imageSize.width}
              height={imageSize.height}
            />
          )}
          {/* Render lines */}
          {lines.map((line, i) => (
            <Line
              key={`line-${i}`}
              points={line.points}
              stroke="#E76F6F"
              strokeWidth={2}
              opacity={0.6}
              draggable={editorMode === 'edit'}
              onClick={() => {
                if (editorMode === 'edit') {
                  setSelectedElement({ type: 'line', index: i });
                }
              }}
            />
          ))}
          {/* Render text elements */}
          {texts.map((text, i) => (
            <Text
              key={`text-${i}`}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize || textSize}
              fill={text.fill || textColor}
              draggable={editorMode === 'edit'}
              onClick={() => {
                if (editorMode === 'edit') {
                  setSelectedElement({ type: 'text', index: i });
                }
              }}
              onDblClick={() => {
                const newText = prompt('Enter new text:', text.text);
                if (newText !== null) {
                  const updatedTexts = [...texts];
                  updatedTexts[i] = { ...text, text: newText };
                  setTexts(updatedTexts);
                }
              }}
            />
          ))}
          {parkingSpaces.map((space, i) => (
            <Group key={space.id || i}>
              <React.Fragment>
                <Rect
                  x={space.x}
                  y={space.y}
                  width={space.width}
                  height={space.height}
                  fill="#FFE5E5"
                  stroke="#E76F6F"
                  strokeWidth={2}
                  draggable={editorMode === 'edit'}
                  rotation={space.rotation || 0}
                  onClick={() => {
                    if (editorMode === 'edit') {
                      setSelectedSpace(space);
                    }
                  }}
                  onDragEnd={(e) => handleDragEnd(e, space.id)}
                  onTransform={(e) => {
                    const node = e.target;
                    const rotation = node.rotation();
                    const updatedSpaces = parkingSpaces.map(s => 
                      s.id === space.id 
                        ? { ...s, rotation }
                        : s
                    );
                    setParkingSpaces(updatedSpaces);
                  }}
                />
                <Text
                  x={space.x}
                  y={space.y + space.height / 2 - 6} // Adjusted to be more centered vertically
                  width={space.width}
                  align="center"
                  text={space.name || `Space ${space.id}`}
                  fill="#E76F6F"
                  fontSize={14}
                  fontWeight={500}
                  rotation={space.rotation || 0}
                  verticalAlign="middle"
                  onDblClick={() => {
                    const newName = prompt('Enter new space name:', space.name);
                    if (newName !== null) {
                      const updatedSpaces = parkingSpaces.map(s => 
                        s.id === space.id 
                          ? { ...s, name: newName }
                          : s
                      );
                      setParkingSpaces(updatedSpaces);
                    }
                  }}
                />
                {selectedSpace?.id === space.id && editorMode === 'edit' && (
                  <React.Fragment>
                    <Transformer
                      ref={(node) => {
                        // Make sure rotation handle is on top
                        if (node) node.getLayer().batchDraw();
                      }}
                      boundBoxFunc={(oldBox, newBox) => {
                        newBox.width = Math.max(30, newBox.width);
                        newBox.height = Math.max(30, newBox.height);
                        return newBox;
                      }}
                      rotateEnabled={false}
                      borderStroke="#E76F6F"
                      borderStrokeWidth={2}
                      enabledAnchors={[
                        'top-left', 'top-right',
                        'bottom-left', 'bottom-right'
                      ]}
                      anchorFill="#E76F6F"
                      anchorStroke="#FFFFFF"
                      anchorSize={10}
                      padding={10}
                    />
                    <Group>
                      {/* Rotation control circle */}
                      <Circle
                        x={space.x + space.width / 2}
                        y={space.y - 25}
                        radius={8}
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      {/* Draggable circle for interaction */}
                      <Circle
                        x={space.x + space.width / 2}
                        y={space.y - 25}
                        radius={15}
                        fill="transparent"
                        draggable={true}
                        onDragMove={(e) => {
                          const center = {
                            x: space.x + space.width / 2,
                            y: space.y + space.height / 2
                          };
                          const angle = Math.atan2(
                            e.target.y() - center.y,
                            e.target.x() - center.x
                          ) * 180 / Math.PI + 90;
                          
                          // Snap to 5-degree intervals for finer control
                          const snappedAngle = Math.round(angle / 5) * 5;
                          
                          const radius = 40;
                          e.target.position({
                            x: center.x + radius * Math.sin(snappedAngle * Math.PI / 180),
                            y: center.y - radius * Math.cos(snappedAngle * Math.PI / 180)
                          });

                          const updatedSpaces = parkingSpaces.map(s =>
                            s.id === space.id
                              ? { ...s, rotation: snappedAngle }
                              : s
                          );
                          setParkingSpaces(updatedSpaces);
                        }}
                      />
                    </Group>
                  </React.Fragment>
                )}
              </React.Fragment>
            </Group>
          ))}
          {newRectangle && (
            <Rect
              x={newRectangle.x}
              y={newRectangle.y}
              width={newRectangle.width}
              height={newRectangle.height}
              fill={spaceColor}
              stroke="#fff"
              strokeWidth={1}
            />
          )}
        </Layer>
      </Stage>
      </div>
      {selectedSpace && editorMode === 'edit' && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Parking Space</h3>
              <button 
                onClick={() => setSelectedSpace(null)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={styles.label}>
                  Space Name
                </label>
                <input 
                  type="text"
                  value={selectedSpace.name || ''}
                  onChange={(e) => {
                    const updatedSpaces = parkingSpaces.map(space => 
                      space.id === selectedSpace.id 
                        ? { ...space, name: e.target.value }
                        : space
                    );
                    setParkingSpaces(updatedSpaces);
                    setSelectedSpace({ ...selectedSpace, name: e.target.value });
                  }}
                  className={styles.input}
                  placeholder="Enter space name"
                />
                <label className={styles.label}>
                  Status
                </label>
                <select 
                  value={selectedSpace.status}
                  onChange={(e) => {
                    const updatedSpaces = parkingSpaces.map(space => 
                      space.id === selectedSpace.id 
                        ? { ...space, status: e.target.value }
                        : space
                    );
                    setParkingSpaces(updatedSpaces);
                    setSelectedSpace({ ...selectedSpace, status: e.target.value });
                  }}
                  className={styles.select}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>

                {/* Action Buttons */}
                <div className={styles.modalActions}>
                  <button
                    className={styles.toolButton}
                    onClick={() => {
                      const newSpace = {
                        ...selectedSpace,
                        id: `space-${Date.now()}`,
                        x: selectedSpace.x + 20,
                        y: selectedSpace.y + 20,
                        name: `${selectedSpace.name || 'Space'} (Copy)`,
                        rotation: selectedSpace.rotation || 0
                      };
                      setParkingSpaces([...parkingSpaces, newSpace]);
                      setSelectedSpace(null);
                    }}
                    title="Duplicate Space"
                  >
                    <FaCopy />
                  </button>
                  <button
                    className={styles.toolButton}
                    onClick={() => {
                      setParkingSpaces(spaces => spaces.filter(space => space.id !== selectedSpace.id));
                      setSelectedSpace(null);
                    }}
                    title="Delete Space"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingLayoutEditor;
