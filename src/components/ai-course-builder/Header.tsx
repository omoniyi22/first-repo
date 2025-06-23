import { Settings, Sparkles, Trash2, Upload } from "lucide-react";
import React from "react";

interface CompetitionLevelData {
  description?: string;
  minHeight?: number;
  maxHeight?: number;
  maxJumps?: number;
  [key: string]: any;
}

interface HeaderProps {
  setDesignMode: any;
  designMode: any;
  discipline: any;
  setDiscipline: any;
  level: any;
  setLevel: any;
  competitionLevels: {
    [discipline: string]: {
      [level: string]: CompetitionLevelData;
    };
  };
  arenaWidth: any;
  setArenaWidth: any;
  arenaLength: any;
  setArenaLength: any;
  targetJumps: any;
  setTargetJumps: any;
  courseStyle: any;
  setCourseStyle: any;
  difficultyPreference: any;
  setDifficultyPreference: any;
  jumpTypes: any;
  selectedJumpType: any;
  setSelectedJumpType: any;
  currentLevel: any;
  generateAICourse: any;
  isGenerating: any;
  generationSettings: any;
  setGenerationSettings: any;
  courseText: any;
  setCourseText: any;
  parseCourseText: any;
  selectedJump: any;
  deleteSelectedJump: any;
}
const Header: React.FC<HeaderProps> = ({
  setDesignMode,
  designMode,
  discipline,
  setDiscipline,
  level,
  setLevel,
  competitionLevels,
  arenaWidth,
  setArenaWidth,
  arenaLength,
  setArenaLength,
  targetJumps,
  setTargetJumps,
  courseStyle,
  setCourseStyle,
  difficultyPreference,
  setDifficultyPreference,
  jumpTypes,
  selectedJumpType,
  setSelectedJumpType,
  currentLevel,
  generateAICourse,
  isGenerating,
  generationSettings,
  setGenerationSettings,
  courseText,
  setCourseText,
  parseCourseText,
  selectedJump,
  deleteSelectedJump,
}) => {
  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              AI Jump Course Generator
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered intelligent course design for all competition levels
            </p>
          </div>
        </div>

        {/* Design Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDesignMode("ai")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                designMode === "ai"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              AI Course Generator
            </button>
            <button
              onClick={() => setDesignMode("manual")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                designMode === "manual"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Manual Designer
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {designMode === "ai"
                ? "AI Course Parameters"
                : "Manual Design Settings"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discipline
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="showjumping">Show Jumping</option>
                  <option value="eventing">Eventing</option>
                  <option value="ponyclub">Pony Club</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(competitionLevels[discipline]).map(
                    ([key, levelData]) => (
                      <option key={key} value={key}>
                        {levelData.description}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arena Width (m)
                </label>
                <input
                  type="number"
                  value={arenaWidth}
                  onChange={(e) => setArenaWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="20"
                  // max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arena Length (m)
                </label>
                <input
                  type="number"
                  value={arenaLength}
                  onChange={(e) =>
                    setArenaLength(parseInt(e.target.value) || 40)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="20"
                  // max="100"
                />
              </div>
            </div>

            {designMode === "ai" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Jumps
                    </label>
                    <input
                      type="number"
                      value={targetJumps}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 4;
                        setTargetJumps(
                          Math.min(newValue, currentLevel?.maxJumps || 8)
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="4"
                      max={currentLevel?.maxJumps || 8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max for {level}: {currentLevel?.maxJumps || 8}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Style
                    </label>
                    <select
                      value={courseStyle}
                      onChange={(e) => setCourseStyle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="flowing">Flowing & Smooth</option>
                      <option value="technical">Technical & Challenging</option>
                      <option value="educational">Educational & Simple</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Preference
                  </label>
                  <select
                    value={difficultyPreference}
                    onChange={(e) => setDifficultyPreference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">
                      Easy - Simple jumps, smooth flow
                    </option>
                    <option value="medium">Medium - Balanced challenge</option>
                    <option value="challenging">
                      Challenging - Complex jumps, tight turns
                    </option>
                  </select>
                </div>
              </>
            )}

            {designMode === "manual" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Jump Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {jumpTypes.map((jumpType) => (
                    <button
                      key={jumpType.id}
                      onClick={() => setSelectedJumpType(jumpType.id)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selectedJumpType === jumpType.id
                          ? "bg-blue-100 border-2 border-blue-500"
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
            )}
          </div>

          {/* Right Column - AI Settings or Manual Tools */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {designMode === "ai"
                ? "AI Generation Settings"
                : "Course Upload & Tools"}
            </h2>

            {designMode === "ai" && (
              <>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={generationSettings.allowCombinations}
                      onChange={(e) =>
                        setGenerationSettings({
                          ...generationSettings,
                          allowCombinations: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Allow combination jumps (less than 8m spacing)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={generationSettings.preferSmoothTurns}
                      onChange={(e) =>
                        setGenerationSettings({
                          ...generationSettings,
                          preferSmoothTurns: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Prefer smooth turns (less than 90° changes)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={generationSettings.includeSpecialtyJumps}
                      onChange={(e) =>
                        setGenerationSettings({
                          ...generationSettings,
                          includeSpecialtyJumps: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Include specialty jumps (water, liverpool, etc.)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={generationSettings.optimizeForFlow}
                      onChange={(e) =>
                        setGenerationSettings({
                          ...generationSettings,
                          optimizeForFlow: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Optimize for horse & rider flow
                    </span>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Selected Level: {currentLevel?.description || "Loading..."}
                  </h3>
                  <div className="text-sm text-blue-600 space-y-1">
                    <p>
                      • Height Range: {currentLevel?.minHeight || 0.8}m -{" "}
                      {currentLevel?.maxHeight || 1.0}m
                    </p>
                    <p>• Maximum Jumps: {currentLevel?.maxJumps || 8}</p>
                    <p>
                      • Current Arena: {arenaWidth}m × {arenaLength}m
                    </p>
                  </div>
                </div>

                <button
                  onClick={generateAICourse}
                  disabled={isGenerating}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    isGenerating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      AI Generating Course...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Course
                    </div>
                  )}
                </button>
              </>
            )}

            {designMode === "manual" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Upload Course Description
                  </h3>
                  <textarea
                    value={courseText}
                    onChange={(e) => setCourseText(e.target.value)}
                    placeholder="Enter course description... e.g.:
            Jump 1: Vertical
            Jump 2: Oxer
            Jump 3: Water jump
            Jump 4: Triple bar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm"
                  />
                  <button
                    onClick={parseCourseText}
                    disabled={!courseText.trim()}
                    className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Parse & Create Course
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Manual Design Tools
                  </h3>
                  <button
                    onClick={deleteSelectedJump}
                    disabled={!selectedJump}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete Selected Jump
                  </button>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">
                    Manual Design Tips
                  </h3>
                  <div className="text-sm text-green-600 space-y-1">
                    <p>• Click arena to add jumps</p>
                    <p>• Click jumps to select them</p>
                    <p>• Drag selected jumps to move</p>
                    <p>• Upload text for bulk creation</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
