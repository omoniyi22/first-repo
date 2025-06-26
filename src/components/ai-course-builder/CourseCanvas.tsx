import { jumpTypes } from "@/data/aiCourseBuilder";
import { Download, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";

const CourseCanvas = ({
  designMode,
  jumps,
  arenaWidth,
  arenaLength,
  scale,
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
  const canvasPadding = 2;
  const [selectedJumpCoords, setSelectedJumpCoords] = useState<{ x: number; y: number } | null>(null);

  // Get mouse position with proper scaling
  const getMousePos = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
  x: (((event.clientX - rect.left) * scaleX - canvasPadding * scale) / scale),
  y: (((event.clientY - rect.top) * scaleY - canvasPadding * scale) / scale)
};
  }, [scale]);

  // Function to update button position
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
    
    // Calculate the actual position on the screen
    const canvasX = (selectedJumpData.x * scale + canvasPadding * scale) * (rect.width / canvas.width);
    const canvasY = (selectedJumpData.y * scale + canvasPadding * scale) * (rect.height / canvas.height);
    
    setSelectedJumpCoords({
      x: canvasX,
      y: canvasY,
    });
  }, [selectedJump, jumps, scale, canvasPadding]);

  // Canvas drawing function with error handling
const drawCourse = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  try {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear whole canvas
    ctx.translate(canvasPadding * scale, canvasPadding * scale); // Shift origin

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      for (let x = 0; x <= arenaWidth; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, arenaLength * scale);
        ctx.stroke();
      }
      for (let y = 0; y <= arenaLength; y += 5) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(arenaWidth * scale, y * scale);
        ctx.stroke();
      }
    }

    // Arena border
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, arenaWidth * scale, arenaLength * scale);

    // Draw path lines between jumps
    const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);
    if (sortedJumps.length > 1) {
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      for (let i = 0; i < sortedJumps.length - 1; i++) {
        const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);
        ctx.strokeStyle =
          distance >= 3 && distance <= 6
            ? "#ef4444"
            : distance < 8
            ? "#f59e0b"
            : "#10b981";

        ctx.beginPath();
        ctx.moveTo(sortedJumps[i].x * scale, sortedJumps[i].y * scale);
        ctx.lineTo(sortedJumps[i + 1].x * scale, sortedJumps[i + 1].y * scale);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw jumps
    sortedJumps.forEach((jump, index) => {
      const jumpType = jumpTypes.find((type) => type.id === jump.type);
      if (!jumpType) return;

      const x = jump.x * scale;
      const y = jump.y * scale;
      const width = jumpType.width * scale;
      const height = 8;
      const isSelected = selectedJump === jump.id;

      const jumpHeight = jump.height || getCurrentLevel()?.minHeight || 1.0;

      // Prepare rotation
      let angle = 0;
      if (jump.manualRotation && typeof jump.rotation === "number") {
        angle = jump.rotation; // Use manually set angle
      } else if (index < sortedJumps.length - 1) {
        const next = sortedJumps[index + 1];
        const dx = next.x - jump.x;
        const dy = next.y - jump.y;
        angle = Math.atan2(dy, dx); // Auto-rotation
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      // Highlight selected jump
      if (isSelected) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-width / 2 - 5, -height / 2 - 5, width + 10, height + 10);
        ctx.setLineDash([]);
      }

      const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
      gradient.addColorStop(0, jumpType.color);
      gradient.addColorStop(1, isSelected ? "#1e40af" : "#000000");

      ctx.fillStyle = gradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);

      ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      ctx.restore();

      // Labels (outside of rotation)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeText(jump.number.toString(), x, y + 4);
      ctx.fillText(jump.number.toString(), x, y + 4);

      ctx.fillStyle = "#374151";
      ctx.font = "11px Arial";
      ctx.fillText(`${jumpHeight.toFixed(1)}m`, x, y + 25);

      ctx.fillStyle = "#6b7280";
      ctx.font = "9px Arial";
      ctx.fillText(jumpType.name, x, y - 15);
    });

    // Draw distances between jumps
    if (sortedJumps.length > 1) {
      for (let i = 0; i < sortedJumps.length - 1; i++) {
        const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);
        const midX = ((sortedJumps[i].x + sortedJumps[i + 1].x) / 2) * scale;
        const midY = ((sortedJumps[i].y + sortedJumps[i + 1].y) / 2) * scale;

        const distanceColor =
          distance < 8
            ? distance >= 3
              ? "#ef4444"
              : "#f59e0b"
            : "#10b981";

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(midX - 15, midY - 8, 30, 16);

        ctx.fillStyle = distanceColor;
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${distance.toFixed(1)}m`, midX, midY + 3);
      }
    }
  } catch (error) {
    console.error("Error drawing course:", error);
  }
}, [jumps, arenaWidth, arenaLength, showGrid, selectedJump, scale, getCurrentLevel, calculateDistance]);

  // Update button position whenever relevant data changes
  useEffect(() => {
    updateButtonPosition();
  }, [updateButtonPosition]);

  // Update button position on window resize
  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure canvas has resized
      setTimeout(updateButtonPosition, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateButtonPosition]);

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newWidth = (arenaWidth + canvasPadding * 2) * scale;
    const newHeight = (arenaLength + canvasPadding * 2) * scale;
    
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any existing transform
        ctx.translate(canvasPadding * scale, canvasPadding * scale); // shift origin
      }
      drawCourse();
    }
  }, [arenaWidth, arenaLength, scale, drawCourse]);

  // Update canvas when data changes
  useEffect(() => {
    drawCourse();
    // Update button position after drawing
    setTimeout(updateButtonPosition, 50);
  }, [drawCourse, updateButtonPosition]);

  // Handle canvas interactions for manual design
  const handleCanvasMouseDown = useCallback((event) => {
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
      // Select and start dragging existing jump
      setSelectedJump(clickedJump.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedJump.x,
        y: y - clickedJump.y,
      });
    } else {
      // Create new jump
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
        rotation: 0, // initial rotation in radians
        manualRotation: false,
      };
      setJumps([...jumps, newJump]);
      setSelectedJump(newJump.id);
    }
  }, [designMode, getMousePos, jumps, jumpTypes, setSelectedJump, setJumps, getCurrentLevel, selectedJumpType, arenaWidth, arenaLength]);

  const handleCanvasMouseMove = useCallback((event) => {
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
  }, [isDragging, selectedJump, designMode, getMousePos, dragOffset, arenaWidth, arenaLength, jumps, setJumps]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const clearCourse = useCallback(() => {
    setJumps([]);
    setSelectedJump(null);
  }, [setJumps, setSelectedJump]);

  // Export course data
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

useEffect(() => {
  if (!selectedJump) {
    setSelectedJumpCoords(null);
  } else {
    updateButtonPosition();
  }
}, [selectedJump, updateButtonPosition]);

  return (
    <>
      {/* Course Canvas */}
      <div className="xl:col-span-3 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {designMode === "ai"
              ? "AI Generated Course"
              : "Manual Course Designer"}
          </h2>
          <div className="flex items-center space-x-3">
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

        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-green-50 relative">
          <canvas
            ref={canvasRef}
            width={(arenaWidth + canvasPadding * 2) * scale}
            height={(arenaLength + canvasPadding * 2) * scale}
            className={`w-full h-auto ${
              designMode === "manual" ? "cursor-crosshair" : ""
            }`}
            style={{ maxHeight: "600px" }}
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
                className="text-gray-700 font-bold"
                title="Rotate Left"
              >
                ↺
              </button>
              <button
                onClick={() => rotateJump(15)}
                className="text-gray-700 font-bold"
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
                  ? "Click and drag to move selected jump"
                  : "Click to add jumps • Click jumps to select"}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCanvas;