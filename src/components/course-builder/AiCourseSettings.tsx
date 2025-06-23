
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Settings, Sparkles } from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';
import { competitionLevels } from '@/data/aiCourseBuilder';
import { generateAICourse } from './utils/courseGenerator';

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
    setAnalysis
  } = useCourseBuilder();

  const handleGenerateCourse = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAICourse({
        discipline,
        level,
        arenaWidth,
        arenaLength,
        targetJumps,
        courseStyle,
        difficultyPreference,
        generationSettings
      });
      
      if (result) {
        setJumps(result.jumps);
        setAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Failed to generate course:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentLevel = () => {
    const levels = competitionLevels[discipline as keyof typeof competitionLevels];
    if (!levels || !levels[level as keyof typeof levels]) {
      return { maxHeight: 1.0, minHeight: 0.8, maxJumps: 8, description: "Default Level" };
    }
    return levels[level as keyof typeof levels];
  };

  const currentLevel = getCurrentLevel();

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
        <CardTitle className="flex items-center space-x-2 font-serif text-gray-800">
          <Bot className="w-5 h-5 text-purple-600" />
          <span>AI Course Generation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Discipline</Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="showjumping">Show Jumping</SelectItem>
                <SelectItem value="eventing">Eventing</SelectItem>
                <SelectItem value="ponyclub">Pony Club</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Competition Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(competitionLevels[discipline as keyof typeof competitionLevels] || {}).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {(value as any).description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Arena Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Arena Width (m)</Label>
            <Input
              type="number"
              value={arenaWidth}
              onChange={(e) => setArenaWidth(Number(e.target.value))}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Arena Length (m)</Label>
            <Input
              type="number"
              value={arenaLength}
              onChange={(e) => setArenaLength(Number(e.target.value))}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Course Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Number of Jumps</Label>
            <Input
              type="number"
              value={targetJumps}
              onChange={(e) => setTargetJumps(Number(e.target.value))}
              max={currentLevel.maxJumps}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs font-sans text-gray-500">Max {currentLevel.maxJumps} for {currentLevel.description}</p>
          </div>

          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Course Style</Label>
            <Select value={courseStyle} onValueChange={setCourseStyle}>
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flowing">Flowing</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="power">Power</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-sans text-gray-700 font-medium">Difficulty</Label>
            <Select value={difficultyPreference} onValueChange={setDifficultyPreference}>
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="challenging">Challenging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4 text-purple-600" />
            <Label className="font-sans text-gray-700 font-medium">Advanced Options</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={generationSettings.allowCombinations}
                onCheckedChange={(checked) => 
                  setGenerationSettings({
                    ...generationSettings,
                    allowCombinations: checked as boolean
                  })
                }
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label className="font-sans text-sm text-gray-700">Allow Combinations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={generationSettings.preferSmoothTurns}
                onCheckedChange={(checked) => 
                  setGenerationSettings({
                    ...generationSettings,
                    preferSmoothTurns: checked as boolean
                  })
                }
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label className="font-sans text-sm text-gray-700">Prefer Smooth Turns</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={generationSettings.includeSpecialtyJumps}
                onCheckedChange={(checked) => 
                  setGenerationSettings({
                    ...generationSettings,
                    includeSpecialtyJumps: checked as boolean
                  })
                }
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label className="font-sans text-sm text-gray-700">Include Specialty Jumps</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={generationSettings.optimizeForFlow}
                onCheckedChange={(checked) => 
                  setGenerationSettings({
                    ...generationSettings,
                    optimizeForFlow: checked as boolean
                  })
                }
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label className="font-sans text-sm text-gray-700">Optimize for Flow</Label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateCourse}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-sans font-medium py-3 rounded-lg shadow-lg transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating Course...' : 'Generate AI Course'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AiCourseSettings;
