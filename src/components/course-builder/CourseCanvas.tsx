
import React, { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';
import { jumpTypes } from '@/data/aiCourseBuilder';

const CourseCanvas = () => {
  const {
    jumps,
    setJumps,
    arenaWidth,
    arenaLength,
    selectedJump,
    setSelectedJump,
    selectedJumpType,
    designMode
  } = useCourseBuilder();

  const canvasRef = useRef<HTMLDivElement>(null);
  const scale = 8;
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (designMode !== 'manual' || isDragging.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / scale);
    const y = ((e.clientY - rect.top) / scale);

    // Check if clicking on an existing jump
    const clickedJump = jumps.find(jump => {
      const jumpRect = {
        left: jump.x - 2,
        right: jump.x + 2,
        top: jump.y - 2,
        bottom: jump.y + 2
      };
      return x >= jumpRect.left && x <= jumpRect.right && y >= jumpRect.top && y <= jumpRect.bottom;
    });

    if (clickedJump) {
      setSelectedJump(selectedJump === clickedJump.id ? null : clickedJump.id);
    } else {
      // Add new jump
      const newJump = {
        id: Date.now(),
        x: Math.max(5, Math.min(arenaWidth - 5, x)),
        y: Math.max(5, Math.min(arenaLength - 5, y)),
        type: selectedJumpType,
        number: jumps.length + 1,
        height: 1.0
      };
      setJumps([...jumps, newJump]);
      setSelectedJump(null);
    }
  }, [designMode, jumps, selectedJump, selectedJumpType, arenaWidth, arenaLength, setJumps, setSelectedJump, scale]);

  const handleMouseDown = (e: React.MouseEvent, jumpId: number) => {
    if (designMode !== 'manual') return;
    
    e.stopPropagation();
    isDragging.current = true;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const jump = jumps.find(j => j.id === jumpId);
    if (!jump) return;

    dragOffset.current = {
      x: (e.clientX - rect.left) / scale - jump.x,
      y: (e.clientY - rect.top) / scale - jump.y
    };

    setSelectedJump(jumpId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !selectedJump) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale - dragOffset.current.x;
    const y = (e.clientY - rect.top) / scale - dragOffset.current.y;

    const constrainedX = Math.max(5, Math.min(arenaWidth - 5, x));
    const constrainedY = Math.max(5, Math.min(arenaLength - 5, y));

    setJumps(jumps.map(jump => 
      jump.id === selectedJump 
        ? { ...jump, x: constrainedX, y: constrainedY }
        : jump
    ));
  }, [selectedJump, jumps, arenaWidth, arenaLength, setJumps, scale]);

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const getJumpColor = (jumpType: string) => {
    const type = jumpTypes.find(t => t.id === jumpType);
    return type?.color || '#8B4513';
  };

  return (
    <Card className="lg:col-span-2 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
        <CardTitle className="flex items-center space-x-2 font-serif text-gray-800">
          <Map className="w-5 h-5 text-purple-600" />
          <span>Course Design Canvas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          <div
            ref={canvasRef}
            className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair bg-green-50"
            style={{
              width: `${arenaWidth * scale}px`,
              height: `${arenaLength * scale}px`,
              maxWidth: '100%',
              aspectRatio: `${arenaWidth} / ${arenaLength}`
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Arena Grid */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${arenaWidth * scale} ${arenaLength * scale}`}
            >
              {/* Grid lines */}
              {Array.from({ length: Math.floor(arenaWidth / 10) + 1 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 10 * scale}
                  y1={0}
                  x2={i * 10 * scale}
                  y2={arenaLength * scale}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: Math.floor(arenaLength / 10) + 1 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i * 10 * scale}
                  x2={arenaWidth * scale}
                  y2={i * 10 * scale}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Jumps */}
            {jumps.map((jump) => (
              <div
                key={jump.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                  selectedJump === jump.id 
                    ? 'ring-2 ring-purple-500 ring-offset-2 scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{
                  left: `${jump.x * scale}px`,
                  top: `${jump.y * scale}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, jump.id)}
              >
                <div
                  className="w-8 h-8 rounded border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getJumpColor(jump.type) }}
                >
                  <span className="text-white text-xs font-bold font-sans">
                    {jump.number}
                  </span>
                </div>
              </div>
            ))}

            {/* Course Path */}
            {jumps.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${arenaWidth * scale} ${arenaLength * scale}`}
              >
                {jumps
                  .sort((a, b) => a.number - b.number)
                  .slice(0, -1)
                  .map((jump, index) => {
                    const nextJump = jumps.find(j => j.number === jump.number + 1);
                    if (!nextJump) return null;

                    return (
                      <line
                        key={`path-${jump.id}`}
                        x1={jump.x * scale}
                        y1={jump.y * scale}
                        x2={nextJump.x * scale}
                        y2={nextJump.y * scale}
                        stroke="#7c3aed"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                    );
                  })}
              </svg>
            )}
          </div>

          {/* Canvas Info */}
          <div className="mt-4 text-sm font-sans text-gray-600 space-y-1">
            <p>Arena: {arenaWidth}m × {arenaLength}m</p>
            <p>Jumps: {jumps.length}</p>
            {designMode === 'manual' && (
              <p className="text-purple-600">
                Click to place jumps • Drag to reposition • Click jump to select
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCanvas;
