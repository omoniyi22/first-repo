
import React from "react";
import { Sparkles } from "lucide-react";
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
import { generateAICourse } from "./utils/courseGenerator";

const AiCourseSettings = () => {
  const {
    discipline,
    setDiscipline,
    level,
    setLevel,
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
    generationSettings,
    setGenerationSettings,
    isGenerating,
    setIsGenerating,
    setJumps,
    competitionLevels,
    getCurrentLevel,
  } = useCourseBuilder();

  const currentLevel = getCurrentLevel();

  const handleGenerateAI = async () => {
    const newJumps = await generateAICourse({
      discipline,
      level,
      arenaWidth,
      arenaLength,
      targetJumps,
      courseStyle,
      difficultyPreference,
      generationSettings,
      setIsGenerating,
      getCurrentLevel,
    });
    setJumps(newJumps);
  };

  return (
    <>
      {/* Basic Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
          AI Course Parameters
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
                {Object.entries(competitionLevels[discipline] || {}).map(
                  ([key, levelData]: [string, any]) => (
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Jumps
            </label>
            <Input
              type="number"
              value={targetJumps}
              onChange={(e) => {
                const newValue = parseInt(e.target.value) || 4;
                setTargetJumps(Math.min(newValue, currentLevel?.maxJumps || 8));
              }}
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
            <Select value={courseStyle} onValueChange={setCourseStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flowing">Flowing & Smooth</SelectItem>
                <SelectItem value="technical">Technical & Challenging</SelectItem>
                <SelectItem value="educational">Educational & Simple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Preference
          </label>
          <Select value={difficultyPreference} onValueChange={setDifficultyPreference}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy - Simple jumps, smooth flow</SelectItem>
              <SelectItem value="medium">Medium - Balanced challenge</SelectItem>
              <SelectItem value="challenging">Challenging - Complex jumps, tight turns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
          AI Generation Settings
        </h2>

        <div className="space-y-4">
          {Object.entries({
            allowCombinations: "Allow combination jumps (less than 8m spacing)",
            preferSmoothTurns: "Prefer smooth turns (less than 90° changes)",
            includeSpecialtyJumps: "Include specialty jumps (water, liverpool, etc.)",
            optimizeForFlow: "Optimize for horse & rider flow",
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={generationSettings[key]}
                onChange={(e) =>
                  setGenerationSettings({
                    ...generationSettings,
                    [key]: e.target.checked,
                  })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-800 mb-2">
            Selected Level: {currentLevel?.description || "Loading..."}
          </h3>
          <div className="text-sm text-purple-600 space-y-1">
            <p>• Height Range: {currentLevel?.minHeight || 0.8}m - {currentLevel?.maxHeight || 1.0}m</p>
            <p>• Maximum Jumps: {currentLevel?.maxJumps || 8}</p>
            <p>• Current Arena: {arenaWidth}m × {arenaLength}m</p>
          </div>
        </div>

        <Button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="w-full py-4 text-lg font-medium"
          variant="gradient"
          size="xl"
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
        </Button>
      </div>
    </>
  );
};

export default AiCourseSettings;
