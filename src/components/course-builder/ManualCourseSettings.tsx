
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Upload, Trash2, FileText } from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';
import { competitionLevels, jumpTypes } from '@/data/aiCourseBuilder';
import { parseCourseText } from './utils/courseParser';

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
    jumps,
    setJumps
  } = useCourseBuilder();

  const handleParseCourseText = () => {
    if (!courseText.trim()) return;
    
    const newJumps = parseCourseText(courseText, arenaWidth, arenaLength);
    setJumps(newJumps);
    setCourseText('');
  };

  const clearCourse = () => {
    setJumps([]);
  };

  const deleteSelectedJump = () => {
    if (selectedJump) {
      const updatedJumps = jumps.filter((jump) => jump.id !== selectedJump);
      const renumberedJumps = updatedJumps.map((jump, index) => ({
        ...jump,
        number: index + 1,
      }));
      setJumps(renumberedJumps);
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
          <Palette className="w-5 h-5 text-purple-600" />
          <span>Manual Course Design</span>
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

        {/* Jump Type Selection */}
        <div className="space-y-2">
          <Label className="font-sans text-gray-700 font-medium">Selected Jump Type</Label>
          <Select value={selectedJumpType} onValueChange={setSelectedJumpType}>
            <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
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
          <p className="text-xs font-sans text-gray-500">
            Click on the canvas to place jumps of this type
          </p>
        </div>

        {/* Course Text Upload */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <Label className="font-sans text-gray-700 font-medium">Import Course Description</Label>
          </div>
          
          <Textarea
            value={courseText}
            onChange={(e) => setCourseText(e.target.value)}
            placeholder="Paste course description here (e.g., 'Jump 1: Vertical, Jump 2: Oxer, Jump 3: Water jump...')"
            className="min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 font-sans"
          />
          
          <Button
            onClick={handleParseCourseText}
            disabled={!courseText.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-sans font-medium"
          >
            <Upload className="w-4 h-4 mr-2" />
            Parse Course Text
          </Button>
        </div>

        {/* Course Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={deleteSelectedJump}
            disabled={!selectedJump}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-sans"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected Jump
          </Button>

          <Button
            onClick={clearCourse}
            disabled={jumps.length === 0}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50 font-sans"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Jumps
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-serif font-semibold text-blue-800 mb-2">Manual Design Instructions</h4>
          <ul className="text-sm font-sans text-blue-700 space-y-1">
            <li>• Click on the canvas to place jumps</li>
            <li>• Drag jumps to reposition them</li>
            <li>• Click jumps to select/edit them</li>
            <li>• Use the course text parser for bulk import</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualCourseSettings;
