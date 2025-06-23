
import React, { useState } from "react";
import {
  Sparkles,
  Settings,
  Upload,
  Trash2,
  Download,
  RotateCcw,
  Eye,
  MousePointer,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Header = ({
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
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mb-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-purple-800 mb-4">
          AI Course Builder
        </h1>
        <p className="text-lg text-gray-600 font-sans max-w-3xl mx-auto">
          Design and analyze show jumping courses with artificial intelligence.
          Create optimal courses for any level or design manually with expert feedback.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={() => setDesignMode("ai")}
            className={`px-6 py-2 rounded-md font-medium font-sans transition-all ${
              designMode === "ai"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-600 hover:bg-purple-50"
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2 inline" />
            AI Generate
          </button>
          <button
            onClick={() => setDesignMode("manual")}
            className={`px-6 py-2 rounded-md font-medium font-sans transition-all ${
              designMode === "manual"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-600 hover:bg-purple-50"
            }`}
          >
            <MousePointer className="w-4 h-4 mr-2 inline" />
            Manual Design
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-gray-800">
            Course Settings
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="font-sans"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? "Hide" : "Show"} Settings
          </Button>
        </div>

        {showSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Basic Settings */}
            <div>
              <Label className="text-sm font-medium text-gray-700 font-sans">Discipline</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="showjumping">Show Jumping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 font-sans">Competition Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(competitionLevels[discipline] || {}).map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 font-sans">Arena Width (m)</Label>
              <Input
                type="number"
                value={arenaWidth}
                onChange={(e) => setArenaWidth(Number(e.target.value))}
                min="40"
                max="80"
                className="font-sans"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 font-sans">Arena Length (m)</Label>
              <Input
                type="number"
                value={arenaLength}
                onChange={(e) => setArenaLength(Number(e.target.value))}
                min="30"
                max="60"
                className="font-sans"
              />
            </div>
          </div>
        )}

        {/* AI Mode Settings */}
        {designMode === "ai" && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-serif font-semibold text-gray-800 mb-4">
              AI Generation Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 font-sans">Target Jumps</Label>
                <Input
                  type="number"
                  value={targetJumps}
                  onChange={(e) => setTargetJumps(Number(e.target.value))}
                  min="4"
                  max={currentLevel?.maxJumps || 12}
                  className="font-sans"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 font-sans">Course Style</Label>
                <Select value={courseStyle} onValueChange={setCourseStyle}>
                  <SelectTrigger className="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flowing">Flowing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="power">Power</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 font-sans">Difficulty</Label>
                <Select value={difficultyPreference} onValueChange={setDifficultyPreference}>
                  <SelectTrigger className="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generation Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(generationSettings).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) =>
                      setGenerationSettings({
                        ...generationSettings,
                        [key]: e.target.checked,
                      })
                    }
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 font-sans">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>

            <Button
              onClick={generateAICourse}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-sans"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGenerating ? "Generating Course..." : "Generate AI Course"}
            </Button>
          </div>
        )}

        {/* Manual Mode Settings */}
        {designMode === "manual" && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-serif font-semibold text-gray-800 mb-4">
              Manual Design Tools
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 font-sans mb-2 block">
                  Selected Jump Type
                </Label>
                <Select value={selectedJumpType} onValueChange={setSelectedJumpType}>
                  <SelectTrigger className="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jumpTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 font-sans mb-2 block">
                  Jump Actions
                </Label>
                <Button
                  onClick={deleteSelectedJump}
                  disabled={!selectedJump}
                  variant="outline"
                  className="w-full font-sans border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected Jump
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700 font-sans mb-2 block">
                Import Course from Text
              </Label>
              <Textarea
                placeholder="Paste course description here (one jump per line)..."
                value={courseText}
                onChange={(e) => setCourseText(e.target.value)}
                className="mb-2 font-sans"
                rows={4}
              />
              <Button
                onClick={parseCourseText}
                disabled={!courseText.trim()}
                variant="outline"
                className="w-full font-sans"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Course
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
