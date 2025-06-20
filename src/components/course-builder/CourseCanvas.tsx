
import React from "react";
import { useCourseBuilder } from "./CourseBuilderContext";

const CourseCanvas = () => {
  const {
    arenaWidth,
    arenaLength,
    jumps,
    selectedJump,
    setSelectedJump,
    selectedJumpType,
    setJumps,
    jumpTypes,
    designMode,
    scale,
    showGrid,
  } = useCourseBuilder();

  const canvasWidth = arenaWidth * scale;
  const canvasHeight = arenaLength * scale;

  const handleCanvasClick = (e: React.MouseEvent<SVGElement>) => {
    if (designMode !== "manual") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / scale);
    const y = ((e.clientY - rect.top) / scale);

    // Check if clicking on existing jump
    const clickedJump = jumps.find(jump => {
      const distance = Math.sqrt(Math.pow(jump.x - x, 2) + Math.pow(jump.y - y, 2));
      return distance < 3;
    });

    if (clickedJump) {
      setSelectedJump(selectedJump === clickedJump.id ? null : clickedJump.id);
    } else {
      // Add new jump
      const newJump = {
        id: Date.now(),
        x: Math.round(x),
        y: Math.round(y),
        type: selectedJumpType,
        number: jumps.length + 1,
        height: 1.0,
      };
      setJumps([...jumps, newJump]);
    }
  };

  const getJumpColor = (jumpType: string) => {
    const type = jumpTypes.find(t => t.id === jumpType);
    return type?.color || "#8B4513";
  };

  return (
    <div className="xl:col-span-3">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-gray-800">
            Course Design Canvas
          </h2>
          <div className="text-sm text-gray-600">
            {arenaWidth}m × {arenaLength}m Arena
          </div>
        </div>

        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-green-50">
          <svg
            width={canvasWidth}
            height={canvasHeight}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="cursor-crosshair"
            onClick={handleCanvasClick}
          >
            {/* Grid lines */}
            {showGrid && (
              <defs>
                <pattern
                  id="grid"
                  width={scale * 5}
                  height={scale * 5}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${scale * 5} 0 L 0 0 0 ${scale * 5}`}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
            )}
            {showGrid && (
              <rect
                width="100%"
                height="100%"
                fill="url(#grid)"
              />
            )}

            {/* Arena boundaries */}
            <rect
              x="0"
              y="0"
              width={canvasWidth}
              height={canvasHeight}
              fill="none"
              stroke="#374151"
              strokeWidth="3"
            />

            {/* Jumps */}
            {jumps.map((jump) => (
              <g key={jump.id}>
                <circle
                  cx={jump.x * scale}
                  cy={jump.y * scale}
                  r="12"
                  fill={getJumpColor(jump.type)}
                  stroke={selectedJump === jump.id ? "#7c3aed" : "#374151"}
                  strokeWidth={selectedJump === jump.id ? "3" : "2"}
                  className="cursor-pointer"
                />
                <text
                  x={jump.x * scale}
                  y={jump.y * scale + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none"
                >
                  {jump.number}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
          <span>Jumps: {jumps.length}</span>
          {selectedJump && (
            <span className="text-purple-600 font-medium">
              Jump {jumps.find(j => j.id === selectedJump)?.number} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCanvas;
