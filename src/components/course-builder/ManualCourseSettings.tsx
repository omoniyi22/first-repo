
import React from "react";
import { Upload, Trash2 } from "lucide-react";
import { useCourseBuilder } from "./CourseBuilderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseCourseText } from "../utils/courseParser";

const ManualCourseSettings = () => {
  const {
    discipline,
    setDiscipline,
    level,
    setLevel,
    arenaWidth,
    setArenaWidth,
    arenaLength,
    setArenaLength,
    selectedJumpType,
    setSelectedJumpType,
    courseText,
    setCourseText,
    selectedJump,
    setJumps,
    jumps,
    setSelectedJump,
    competitionLevels,
    jumpTypes,
    getCurrentLevel,
  } = useCourseBuilder();

  const handleParseCourseText = () => {
    const newJumps = parseCourseText(courseText, arenaWidth, arenaLength, getCurrentLevel);
    setJumps(newJumps);
    setCourseText("");
  };

  const deleteSelectedJump = () => {
    if (selectedJump) {
      const updatedJumps = jumps.filter((jump) => jump.id !== selectedJump);
      const renumberedJumps = updatedJumps.map((jump, index) => ({
        ...jump,
        number: index + 1,
      }));
      setJumps(renumberedJumps);
      setSelectedJump(null);
    }
  };

  return (
    <>
      {/* Basic Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
          Manual Design Settings
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discipline
            </label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="showjumping">Show Jumping</SelectItem>
                <SelectItem value="eventing">Eventing</SelectItem>
                <SelectItem value="ponyclub">Pony Club</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competition Level
            </label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(competitionLevels[discipline]).map(
                  ([key, levelData]) => (
                    <SelectItem key={key} value={key}>
                      {levelData.description}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arena Width (m)
            </label>
            <Input
              type="number"
              value={arenaWidth}
              onChange={(e) => setArenaWidth(parseInt(e.target.value) || 60)}
              min="20"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arena Length (m)
            </label>
            <Input
              type="number"
              value={arenaLength}
              onChange={(e) => setArenaLength(parseInt(e.target.value) || 40)}
              min="20"
              max="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Jump Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {jumpTypes.map((jumpType) => (
              <button
                key={jumpType.id}
                onClick={() => setSelectedJumpType(jumpType.id)}
                className={`p-3 rounded-lg text-sm transition-all duration-200 ${
                  selectedJumpType === jumpType.id
                    ? "bg-purple-100 border-2 border-purple-500 shadow-md"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: jumpType.color }}
                  ></div>
                  <span className="font-medium">{jumpType.name}</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click to select, then click on arena to place jumps
          </p>
        </div>
      </div>

      {/* Tools and Upload */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
          Course Upload & Tools
        </h2>

        <div>
          <h3 className="text-lg font-serif font-semibold text-gray-800 mb-3">
            Upload Course Description
          </h3>
          <Textarea
            value={courseText}
            onChange={(e) => setCourseText(e.target.value)}
            placeholder="Enter course description... e.g.:
Jump 1: Vertical
Jump 2: Oxer
Jump 3: Water jump
Jump 4: Triple bar"
            className="h-32 text-sm"
          />
          <Button
            onClick={handleParseCourseText}
            disabled={!courseText.trim()}
            className="w-full mt-2"
            variant="gradient"
          >
            <Upload className="w-4 h-4 mr-2" />
            Parse & Create Course
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-serif font-semibold text-gray-800 mb-2">
            Manual Design Tools
          </h3>
          <Button
            onClick={deleteSelectedJump}
            disabled={!selectedJump}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected Jump
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Manual Design Tips</h3>
          <div className="text-sm text-blue-600 space-y-1">
            <p>• Click arena to add jumps</p>
            <p>• Click jumps to select them</p>
            <p>• Drag selected jumps to move</p>
            <p>• Upload text for bulk creation</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManualCourseSettings;
