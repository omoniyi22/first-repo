import { Download, RotateCcw } from "lucide-react";
import React from "react";

const CourseCanvas = ({
  designMode,
  clearCourse,
  exportCourse,
  jumps,
  showGrid,
  setShowGrid,
  canvasRef,
  arenaWidth,
  arenaLength,
  scale,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  selectedJump,
}) => {
    
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
