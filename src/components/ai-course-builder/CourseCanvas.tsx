import React, { useRef, useEffect, useState } from "react";
import { MousePointer, Move } from "lucide-react";

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
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const canvasWidth = arenaWidth * scale;
    const canvasHeight = arenaLength * scale;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw arena
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // Draw jumps
    jumps.forEach((jump) => {
      const x = jump.x * scale;
      const y = jump.y * scale;
      const size = 12;

      // Jump circle
      ctx.fillStyle = selectedJump === jump.id ? "#dc2626" : "#7c3aed";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();

      // Jump number
      ctx.fillStyle = "white";
      ctx.font = "bold 10px Varela Round";
      ctx.textAlign = "center";
      ctx.fillText(jump.number.toString(), x, y + 3);

      // Jump type indicator
      ctx.fillStyle = "#4b5563";
      ctx.font = "8px Varela Round";
      ctx.fillText(jump.type.charAt(0).toUpperCase(), x, y - 15);
    });

    // Draw course path
    if (jumps.length > 1) {
      const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      sortedJumps.forEach((jump, index) => {
        const x = jump.x * scale;
        const y = jump.y * scale;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
  }, [jumps, selectedJump, arenaWidth, arenaLength, scale]);

  const handleCanvasClick = (e) => {
    if (designMode !== "manual") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check if clicking on existing jump
    const clickedJump = jumps.find((jump) => {
      const distance = Math.sqrt((jump.x - x) ** 2 + (jump.y - y) ** 2);
      return distance < 2;
    });

    if (clickedJump) {
      setSelectedJump(selectedJump === clickedJump.id ? null : clickedJump.id);
    } else {
      // Add new jump
      const currentLevel = getCurrentLevel();
      const newJump = {
        id: Date.now(),
        x: Math.round(x),
        y: Math.round(y),
        type: selectedJumpType,
        number: jumps.length + 1,
        height:
          currentLevel.minHeight +
          (currentLevel.maxHeight - currentLevel.minHeight) * 0.5,
      };
      setJumps([...jumps, newJump]);
      setSelectedJump(null);
    }
  };

  const handleMouseDown = (e) => {
    if (designMode !== "manual") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const clickedJump = jumps.find((jump) => {
      const distance = Math.sqrt((jump.x - x) ** 2 + (jump.y - y) ** 2);
      return distance < 2;
    });

    if (clickedJump) {
      setIsDragging(true);
      setSelectedJump(clickedJump.id);
      setDragOffset({
        x: x - clickedJump.x,
        y: y - clickedJump.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || designMode !== "manual") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newX = Math.max(2, Math.min(arenaWidth - 2, x - dragOffset.x));
    const newY = Math.max(2, Math.min(arenaLength - 2, y - dragOffset.y));

    setJumps(
      jumps.map((jump) =>
        jump.id === selectedJump
          ? { ...jump, x: Math.round(newX), y: Math.round(newY) }
          : jump
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="xl:col-span-3">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-gray-800">
            Course Design
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 font-sans">
            <span>{arenaWidth}m × {arenaLength}m Arena</span>
            {designMode === "manual" && (
              <div className="flex items-center space-x-1 text-purple-600">
                <MousePointer className="w-4 h-4" />
                <span>Click to add, drag to move</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border-2 border-purple-200 rounded-lg cursor-crosshair max-w-full h-auto"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>

        {jumps.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600 font-sans">
            <span className="font-medium">{jumps.length} jumps</span>
            {jumps.length > 1 && (
              <span className="ml-4">
                Total course distance: {" "}
                <span className="font-medium">
                  {jumps
                    .slice(0, -1)
                    .reduce((total, jump, index) => {
                      return total + calculateDistance(jump, jumps[index + 1]);
                    }, 0)
                    .toFixed(0)}m
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCanvas;
