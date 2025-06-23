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

  // Get mouse position with proper scaling
  const getMousePos = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: ((event.clientX - rect.left) * scaleX) / scale,
      y: ((event.clientY - rect.top) * scaleY) / scale
    };
  }, [scale]);

  // Canvas drawing function with error handling
  const drawCourse = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = 0; x <= arenaWidth; x += 5) {
          ctx.beginPath();
          ctx.moveTo(x * scale, 0);
          ctx.lineTo(x * scale, arenaLength * scale);
          ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y <= arenaLength; y += 5) {
          ctx.beginPath();
          ctx.moveTo(0, y * scale);
          ctx.lineTo(arenaWidth * scale, y * scale);
          ctx.stroke();
        }
      }

      // Draw arena border
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, arenaWidth * scale, arenaLength * scale);

      // Draw course path if multiple jumps exist
      if (jumps.length > 1) {
        const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);

        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);

        for (let i = 0; i < sortedJumps.length - 1; i++) {
          const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);

          // Set line color based on distance
          if (distance >= 3 && distance <= 6) {
            ctx.strokeStyle = "#ef4444"; // Red - dangerous
          } else if (distance < 8) {
            ctx.strokeStyle = "#f59e0b"; // Yellow - combination
          } else {
            ctx.strokeStyle = "#10b981"; // Green - safe
          }

          ctx.beginPath();
          ctx.moveTo(sortedJumps[i].x * scale, sortedJumps[i].y * scale);
          ctx.lineTo(sortedJumps[i + 1].x * scale, sortedJumps[i + 1].y * scale);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // Draw jumps
      jumps.forEach((jump) => {
        const jumpType = jumpTypes.find((type) => type.id === jump.type);
        if (!jumpType) return; // Skip if jump type not found

        const x = jump.x * scale;
        const y = jump.y * scale;
        const width = jumpType.width * scale;
        const height = 8;

        const isSelected = selectedJump === jump.id;

        // Draw selection highlight
        if (isSelected) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            x - width / 2 - 5,
            y - height / 2 - 5,
            width + 10,
            height + 10
          );
          ctx.setLineDash([]);
        }

        // Create gradient for jump
        const gradient = ctx.createLinearGradient(
          x - width / 2,
          y - height / 2,
          x + width / 2,
          y + height / 2
        );
        gradient.addColorStop(0, jumpType.color);
        gradient.addColorStop(1, isSelected ? "#1e40af" : "#000000");

        // Draw jump rectangle
        ctx.fillStyle = gradient;
        ctx.fillRect(x - width / 2, y - height / 2, width, height);

        ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);

        // Draw jump number
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeText(jump.number.toString(), x, y + 4);
        ctx.fillText(jump.number.toString(), x, y + 4);

        // Draw jump height
        const jumpHeight = jump.height || getCurrentLevel()?.minHeight || 1.0;
        ctx.fillStyle = "#374151";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${jumpHeight.toFixed(1)}m`, x, y + 25);

        // Draw jump type
        ctx.fillStyle = "#6b7280";
        ctx.font = "9px Arial";
        ctx.fillText(jumpType.name, x, y - 15);
      });

      // Draw distance labels
      if (jumps.length > 1) {
        const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);
        for (let i = 0; i < sortedJumps.length - 1; i++) {
          const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);
          const midX = ((sortedJumps[i].x + sortedJumps[i + 1].x) / 2) * scale;
          const midY = ((sortedJumps[i].y + sortedJumps[i + 1].y) / 2) * scale;

          let distanceColor = "#10b981"; // Green - safe
          if (distance < 8) distanceColor = "#f59e0b"; // Yellow - combination
          if (distance >= 3 && distance <= 6) distanceColor = "#ef4444"; // Red - dangerous

          // Draw background for distance text
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(midX - 15, midY - 8, 30, 16);

          // Draw distance text
          ctx.fillStyle = distanceColor;
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`${distance.toFixed(1)}m`, midX, midY + 3);
        }
      }
    } catch (error) {
      console.error("Error drawing course:", error);
    }
  }, [jumps, arenaWidth, arenaLength, showGrid, selectedJump, scale, jumpTypes, getCurrentLevel, calculateDistance]);

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newWidth = arenaWidth * scale;
    const newHeight = arenaLength * scale;
    
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      drawCourse();
    }
  }, [arenaWidth, arenaLength, scale, drawCourse]);

  // Update canvas when data changes
  useEffect(() => {
    drawCourse();
  }, [drawCourse]);

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

        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-green-50">
          <canvas
            ref={canvasRef}
            width={arenaWidth * scale}
            height={arenaLength * scale}
            className={`w-full h-auto ${
              designMode === "manual" ? "cursor-crosshair" : ""
            }`}
            style={{ maxHeight: "600px" }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
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