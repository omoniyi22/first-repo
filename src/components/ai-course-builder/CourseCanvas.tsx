import { jumpTypes } from "@/data/aiCourseBuilder";
import { Download, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";

const CourseCanvas = ({
  designMode,
  jumps,
  arenaWidth,
  arenaLength,
  scale: baseScale,
  selectedJump,
  setJumps,
  setSelectedJump,
  getCurrentLevel,
  selectedJumpType,
  discipline,
  analyzeCourse,
  level,
  calculateDistance,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedJumpCoords, setSelectedJumpCoords] = useState<{ x: number; y: number } | null>(null);
  
  // Viewport state for pan and zoom
  const [viewport, setViewport] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const canvasPadding = 20; // Fixed padding in pixels

  // Calculate the scale to fit the arena in the viewport
  const calculateFitScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return baseScale;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = (containerWidth - canvasPadding * 2) / arenaWidth;
    const scaleY = (containerHeight - canvasPadding * 2) / arenaLength;
    
    // Use the smaller scale to ensure entire arena fits
    return Math.min(scaleX, scaleY);
  }, [arenaWidth, arenaLength, baseScale]);

  // Reset viewport to fit arena
  const resetViewport = useCallback(() => {
    const fitScale = calculateFitScale();
    setViewport({
      zoom: 1,
      offsetX: 0,
      offsetY: 0
    });
  }, [calculateFitScale]);

  // Get mouse position relative to arena coordinates
  const getMousePos = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scale = calculateFitScale() * viewport.zoom;
    
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // Convert to arena coordinates accounting for viewport
    const x = (canvasX - canvasPadding - viewport.offsetX) / scale;
    const y = (canvasY - canvasPadding - viewport.offsetY) / scale;
    
    return { x, y };
  }, [calculateFitScale, viewport]);

  // Update button position
  const updateButtonPosition = useCallback(() => {
    if (!selectedJump || !canvasRef.current) {
      setSelectedJumpCoords(null);
      return;
    }

    const selectedJumpData = jumps.find(jump => jump.id === selectedJump);
    if (!selectedJumpData) {
      setSelectedJumpCoords(null);
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = calculateFitScale() * viewport.zoom;
    
    // Calculate screen position
    const screenX = selectedJumpData.x * scale + canvasPadding + viewport.offsetX;
    const screenY = selectedJumpData.y * scale + canvasPadding + viewport.offsetY;
    
    setSelectedJumpCoords({
      x: screenX,
      y: screenY,
    });
  }, [selectedJump, jumps, calculateFitScale, viewport]);

  // Canvas drawing function
  const drawCourse = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = calculateFitScale() * viewport.zoom;

    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context
      ctx.save();
      
      // Apply viewport transformations
      ctx.translate(canvasPadding + viewport.offsetX, canvasPadding + viewport.offsetY);
      ctx.scale(viewport.zoom, viewport.zoom);

      // Draw grid
      if (showGrid) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1 / viewport.zoom;
        
        const fitScale = calculateFitScale();
        
        for (let x = 0; x <= arenaWidth; x += 5) {
          ctx.beginPath();
          ctx.moveTo(x * fitScale, 0);
          ctx.lineTo(x * fitScale, arenaLength * fitScale);
          ctx.stroke();
        }
        
        for (let y = 0; y <= arenaLength; y += 5) {
          ctx.beginPath();
          ctx.moveTo(0, y * fitScale);
          ctx.lineTo(arenaWidth * fitScale, y * fitScale);
          ctx.stroke();
        }
      }

      // Arena border
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 3 / viewport.zoom;
      const fitScale = calculateFitScale();
      ctx.strokeRect(0, 0, arenaWidth * fitScale, arenaLength * fitScale);

      // Sort jumps for drawing
      const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);
      
      // Draw path lines only for dangerous or combination distances
      if (sortedJumps.length > 1) {
        ctx.save();
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.setLineDash([8 / viewport.zoom, 4 / viewport.zoom]);
        
        for (let i = 0; i < sortedJumps.length - 1; i++) {
          const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);
          
          // Only draw line if distance is dangerous (3-6m) or combination (<8m)
          if (distance < 8) {
            ctx.strokeStyle = distance >= 3 && distance <= 6
              ? "rgba(239, 68, 68, 0.5)" // Red for dangerous
              : "rgba(245, 158, 11, 0.5)"; // Yellow for combination
            
            ctx.beginPath();
            ctx.moveTo(sortedJumps[i].x * fitScale, sortedJumps[i].y * fitScale);
            ctx.lineTo(sortedJumps[i + 1].x * fitScale, sortedJumps[i + 1].y * fitScale);
            ctx.stroke();
          }
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Draw jumps
      sortedJumps.forEach((jump, index) => {
        const jumpType = jumpTypes.find((type) => type.id === jump.type);
        if (!jumpType) return;

        const x = jump.x * fitScale;
        const y = jump.y * fitScale;
        const width = jumpType.width * fitScale;
        const height = 8 * fitScale / baseScale;
        const isSelected = selectedJump === jump.id;
        const isFirst = index === 0;
        const isLast = index === sortedJumps.length - 1;

        const jumpHeight = jump.height || getCurrentLevel()?.minHeight || 1.0;

        // Draw start/finish indicators
        if (isFirst) {
          // Start flag
          ctx.save();
          ctx.translate(x - 30 / viewport.zoom, y - 30 / viewport.zoom);
          
          // Flag pole
          ctx.strokeStyle = "#374151";
          ctx.lineWidth = 2 / viewport.zoom;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 20 / viewport.zoom);
          ctx.stroke();
          
          // Flag
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(15 / viewport.zoom, 5 / viewport.zoom);
          ctx.lineTo(0, 10 / viewport.zoom);
          ctx.closePath();
          ctx.fill();
          
          // "START" text
          ctx.fillStyle = "#065f46";
          ctx.font = `bold ${10 / viewport.zoom}px Arial`;
          ctx.fillText("START", -5 / viewport.zoom, -5 / viewport.zoom);
          
          ctx.restore();
        }
        
        if (isLast) {
          // Finish flag
          ctx.save();
          ctx.translate(x + 30 / viewport.zoom, y - 30 / viewport.zoom);
          
          // Flag pole
          ctx.strokeStyle = "#374151";
          ctx.lineWidth = 2 / viewport.zoom;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 20 / viewport.zoom);
          ctx.stroke();
          
          // Checkered flag pattern
          const flagSize = 15 / viewport.zoom;
          const checkerSize = flagSize / 3;
          ctx.fillStyle = "#000000";
          
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              if ((row + col) % 2 === 0) {
                ctx.fillRect(col * checkerSize, row * checkerSize, checkerSize, checkerSize);
              }
            }
          }
          
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1 / viewport.zoom;
          ctx.strokeRect(0, 0, flagSize, flagSize);
          
          // "FINISH" text
          ctx.fillStyle = "#dc2626";
          ctx.font = `bold ${10 / viewport.zoom}px Arial`;
          ctx.fillText("FINISH", -5 / viewport.zoom, -5 / viewport.zoom);
          
          ctx.restore();
        }

        // Calculate rotation
        let angle = 0;
        if (jump.manualRotation && typeof jump.rotation === "number") {
          angle = jump.rotation;
        } else if (index === 0 && sortedJumps.length > 1) {
          // First jump faces the second jump
          const next = sortedJumps[1];
          const dx = next.x - jump.x;
          const dy = next.y - jump.y;
          angle = Math.atan2(dy, dx) - Math.PI / 2;
        } else if (index > 0) {
          // All other jumps face their previous jump
          const prev = sortedJumps[index - 1];
          const dx = prev.x - jump.x;
          const dy = prev.y - jump.y;
          angle = Math.atan2(dy, dx) - Math.PI / 2;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Highlight selected jump
        if (isSelected) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 3 / viewport.zoom;
          ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
          ctx.strokeRect(-width / 2 - 5, -height / 2 - 5, width + 10, height + 10);
          ctx.setLineDash([]);
        }

        const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
        gradient.addColorStop(0, jumpType.color);
        gradient.addColorStop(1, isSelected ? "#1e40af" : "#000000");

        ctx.fillStyle = gradient;
        ctx.fillRect(-width / 2, -height / 2, width, height);

        ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000";
        ctx.lineWidth = isSelected ? 2 / viewport.zoom : 1 / viewport.zoom;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        ctx.restore();

        // Labels
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${14 / viewport.zoom}px Arial`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.strokeText(jump.number.toString(), x, y + 4 / viewport.zoom);
        ctx.fillText(jump.number.toString(), x, y + 4 / viewport.zoom);

        ctx.fillStyle = "#374151";
        ctx.font = `${11 / viewport.zoom}px Arial`;
        ctx.fillText(`${jumpHeight.toFixed(1)}m`, x, y + 25 / viewport.zoom);

        ctx.fillStyle = "#6b7280";
        ctx.font = `${9 / viewport.zoom}px Arial`;
        ctx.fillText(jumpType.name, x, y - 15 / viewport.zoom);
      });

      // Draw small direction indicators on each jump
      if (sortedJumps.length > 1) {
        ctx.save();
        ctx.fillStyle = "#1f2937"; // Darker color (gray-800)
        ctx.strokeStyle = "#1f2937";
        
        // Draw arrows on all jumps except the last one
        for (let i = 0; i < sortedJumps.length - 1; i++) {
          const fromJump = sortedJumps[i];
          const toJump = sortedJumps[i + 1];
          
          // Position arrow right on the jump
          const arrowX = fromJump.x * fitScale;
          const arrowY = fromJump.y * fitScale;
          
          // Calculate arrow angle
          const angle = Math.atan2(
            toJump.y - fromJump.y,
            toJump.x - fromJump.x
          );
          
          // Draw larger arrow
          ctx.save();
          ctx.translate(arrowX, arrowY);
          ctx.rotate(angle);
          
          // Move arrow to edge of jump
          const jumpType = jumpTypes.find((type) => type.id === fromJump.type);
          const jumpWidth = (jumpType?.width || 4) * fitScale;
          ctx.translate(jumpWidth / 2 + 20 / viewport.zoom, 0);
          
          // Larger arrow shape
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-8 / viewport.zoom, -5 / viewport.zoom);
          ctx.lineTo(-8 / viewport.zoom, 5 / viewport.zoom);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
        }
        ctx.restore();
      }

      // Restore context
      ctx.restore();
    } catch (error) {
      console.error("Error drawing course:", error);
    }
  }, [jumps, arenaWidth, arenaLength, showGrid, selectedJump, calculateFitScale, viewport, baseScale, getCurrentLevel, calculateDistance]);

  // Keyboard controls for zoom
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '+' || event.key === '=') {
        setViewport(prev => ({ ...prev, zoom: Math.min(5, prev.zoom + 0.1) }));
      } else if (event.key === '-' || event.key === '_') {
        setViewport(prev => ({ ...prev, zoom: Math.max(0.2, prev.zoom - 0.1) }));
      } else if (event.key === '0' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        resetViewport();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [resetViewport]);

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      drawCourse();
      updateButtonPosition();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCourse, updateButtonPosition]);

  // Redraw when relevant data changes
  useEffect(() => {
    drawCourse();
    updateButtonPosition();
  }, [drawCourse, updateButtonPosition]);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((event) => {
    // Only prevent default if mouse is over canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const isOverCanvas = 
      event.clientX >= rect.left && 
      event.clientX <= rect.right && 
      event.clientY >= rect.top && 
      event.clientY <= rect.bottom;
    
    if (isOverCanvas) {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY > 0 ? -0.05 : 0.05; // 5% increments
      setViewport(prev => ({
        ...prev,
        zoom: Math.max(0.2, Math.min(5, prev.zoom + delta))
      }));
    }
  }, []);

  // Add wheel event listener with proper options
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (event) => handleWheel(event);
    
    // Use passive: false to allow preventDefault
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);

  // Handle canvas interactions
  const handleCanvasMouseDown = useCallback((event) => {
    if (event.shiftKey || event.button === 1) {
      // Start panning with shift+click or middle mouse
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }

    if (designMode !== "manual") return;

    const { x, y } = getMousePos(event);

    // Check if clicking on existing jump
    const clickedJump = jumps.find((jump) => {
      const jumpType = jumpTypes.find((type) => type.id === jump.type);
      const jumpWidth = jumpType?.width || 4;
      return (
        Math.abs(jump.x - x) < jumpWidth / 2 + 2 && Math.abs(jump.y - y) < 4
      );
    });

    if (clickedJump) {
      setSelectedJump(clickedJump.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedJump.x,
        y: y - clickedJump.y,
      });
    } else {
      const currentLevel = getCurrentLevel();
      const newJump = {
        id: Date.now(),
        x: Math.round(Math.max(5, Math.min(x, arenaWidth - 5))),
        y: Math.round(Math.max(5, Math.min(y, arenaLength - 5))),
        type: selectedJumpType,
        number: jumps.length + 1,
        height: currentLevel?.minHeight && currentLevel?.maxHeight
          ? currentLevel.minHeight + (currentLevel.maxHeight - currentLevel.minHeight) * 0.5
          : 1.0,
        rotation: 0,
        manualRotation: false,
      };
      setJumps([...jumps, newJump]);
      setSelectedJump(newJump.id);
    }
  }, [designMode, getMousePos, jumps, jumpTypes, setSelectedJump, setJumps, getCurrentLevel, selectedJumpType, arenaWidth, arenaLength]);

  const handleCanvasMouseMove = useCallback((event) => {
    if (isPanning) {
      const dx = event.clientX - panStart.x;
      const dy = event.clientY - panStart.y;
      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
      }));
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }

    if (!isDragging || !selectedJump || designMode !== "manual") return;

    const { x, y } = getMousePos(event);

    const newX = Math.round(
      Math.max(5, Math.min(x - dragOffset.x, arenaWidth - 5))
    );
    const newY = Math.round(
      Math.max(5, Math.min(y - dragOffset.y, arenaLength - 5))
    );

    setJumps(
      jumps.map((jump) =>
        jump.id === selectedJump ? { ...jump, x: newX, y: newY } : jump
      )
    );
  }, [isPanning, panStart, isDragging, selectedJump, designMode, getMousePos, dragOffset, arenaWidth, arenaLength, jumps, setJumps]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const clearCourse = useCallback(() => {
    setJumps([]);
    setSelectedJump(null);
  }, [setJumps, setSelectedJump]);

  const exportCourse = useCallback(() => {
    try {
      const analysis = analyzeCourse();
      const exportData = {
        course: {
          name: `Course-${discipline}-${level}-${new Date().toLocaleDateString()}`,
          discipline,
          level,
          arena: { width: arenaWidth, length: arenaLength },
          jumps,
          analysis,
          metadata: {
            aiGenerated: designMode === "ai",
            designMode,
            createdAt: new Date().toISOString(),
            totalJumps: jumps.length,
          },
        },
        version: "1.0",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-course-${discipline}-${level}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting course:", error);
    }
  }, [analyzeCourse, discipline, level, arenaWidth, arenaLength, jumps, designMode]);

  const rotateJump = (angleDelta: number) => {
    if (!selectedJump) return;

    setJumps((prev) =>
      prev.map((jump) =>
        jump.id === selectedJump
          ? {
              ...jump,
              rotation: ((jump.rotation || 0) + (angleDelta * Math.PI) / 180) % (2 * Math.PI),
              manualRotation: true,
            }
          : jump
      )
    );
  };

  return (
    <>
      {/* Course Canvas */}
      <div className="xl:col-span-3 bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {designMode === "ai"
              ? "AI Generated Course"
              : "Manual Course Designer"}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-2 py-1">
              <button
                onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(5, prev.zoom + 0.05) }))}
                className="p-1 hover:bg-gray-200 rounded transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 px-2 min-w-[50px] text-center">{Math.round(viewport.zoom * 100)}%</span>
              <button
                onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.2, prev.zoom - 0.05) }))}
                className="p-1 hover:bg-gray-200 rounded transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetViewport}
                className="p-1 hover:bg-gray-200 rounded ml-1 transition-all"
                title="Reset View"
              >
                <Move className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={clearCourse}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Clear
            </button>
            <button
              onClick={exportCourse}
              disabled={jumps.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Grid</span>
            </label>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="border-2 border-gray-200 rounded-xl overflow-hidden bg-green-50 relative flex-1"
          style={{ 
            minHeight: '400px'
          }}
        >
          <canvas
            ref={canvasRef}
            className={`w-full h-full ${
              designMode === "manual" ? "cursor-crosshair" : ""
            } ${isPanning ? "cursor-move" : ""}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
          {selectedJump && selectedJumpCoords && (
            <div
              className="absolute flex space-x-1 z-50"
              style={{
                left: `${selectedJumpCoords.x}px`,
                top: `${selectedJumpCoords.y + 40}px`,
                transform: 'translate(-50%, 0)',
              }}
            >
              <button
                onClick={() => rotateJump(-15)}
                className="text-gray-700 font-bold bg-white rounded px-2 py-1 shadow-md hover:shadow-lg"
                title="Rotate Left"
              >
                ↺
              </button>
              <button
                onClick={() => rotateJump(15)}
                className="text-gray-700 font-bold bg-white rounded px-2 py-1 shadow-md hover:shadow-lg"
                title="Rotate Right"
              >
                ↻
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Safe Distance (8m+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Combination (&lt;8m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Dangerous (3-6m)</span>
            </div>
          </div>
          <div className="text-right">
            <p>
              Arena: {arenaWidth}m × {arenaLength}m | Jumps: {jumps.length}
            </p>
            {designMode === "manual" && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedJump
                  ? "Click and drag to move • Shift+drag to pan • Scroll to zoom"
                  : "Click to add jumps • Shift+drag to pan • Scroll to zoom"}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCanvas;