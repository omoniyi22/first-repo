
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface BlogFilterProps {
  disciplineFilter: string;
  categoryFilter: string;
  updateFilters: (type: 'discipline' | 'category', value: string) => void;
}

const BlogFilter = ({ disciplineFilter, categoryFilter, updateFilters }: BlogFilterProps) => {
  const disciplines = [
    { value: 'all', label: 'All Posts', color: 'bg-gray-900' },
    { value: 'jumping', label: 'Jumping', color: 'bg-blue-600' },
    { value: 'dressage', label: 'Dressage', color: 'bg-purple-600' },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'training', label: 'Training' },
    { value: 'guides', label: 'Guides' },
    { value: 'competition', label: 'Competition' },
  ];

  return (
    <div className="space-y-4">
      {/* Discipline filter buttons */}
      <div className="flex flex-wrap gap-3">
        {disciplines.map((discipline) => (
          <Button
            key={discipline.value}
            variant={disciplineFilter === discipline.value ? "default" : "outline"}
            className={`relative ${
              disciplineFilter === discipline.value 
                ? discipline.value === 'jumping' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : discipline.value === 'dressage' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : ''
                : ''
            }`}
            onClick={() => updateFilters('discipline', discipline.value)}
          >
            {discipline.value !== 'all' && (
              <span 
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${discipline.color}`}
              />
            )}
            <span className={discipline.value !== 'all' ? 'ml-2' : ''}>{discipline.label}</span>
          </Button>
        ))}
      </div>

      {/* Category filter with horizontal scrolling for mobile */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <Badge
              key={category.value}
              variant={categoryFilter === category.value ? "default" : "outline"}
              className={`cursor-pointer py-1.5 px-3 text-sm rounded-full ${
                categoryFilter === category.value
                  ? disciplineFilter === 'jumping'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : disciplineFilter === 'dressage'
                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      : ''
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => updateFilters('category', category.value)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default BlogFilter;
