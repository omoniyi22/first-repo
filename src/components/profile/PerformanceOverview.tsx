
import { ArrowUp, TrendingUp, User, Award, FileText, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Legend
} from 'recharts';

const PerformanceOverview = () => {
  // Example score trend data for the chart
  const scoreTrendData = [
    { month: 'Jan', score: 62.8 },
    { month: 'Feb', score: 63.2 },
    { month: 'Mar', score: 63.9 },
    { month: 'Apr', score: 62.7 },
    { month: 'May', score: 64.5 },
    { month: 'Jun', score: 64.8 },
  ];

  // Example data for the movement radar chart
  const movementData = [
    { movement: 'Walk', score: 7.1, fullMark: 10 },
    { movement: 'Trot', score: 6.8, fullMark: 10 },
    { movement: 'Canter', score: 6.2, fullMark: 10 },
    { movement: 'Transitions', score: 6.5, fullMark: 10 },
    { movement: 'Submission', score: 6.0, fullMark: 10 },
    { movement: 'Rider Position', score: 7.3, fullMark: 10 },
  ];

  // Example statistics data with icons
  const stats = [
    {
      title: 'Average Score',
      value: '64.8%',
      change: '+2.4%',
      positive: true,
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
    },
    {
      title: 'Tests Analyzed',
      value: '12',
      change: '+3',
      positive: true,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Strongest Movement',
      value: 'Trot',
      subValue: 'Extended',
      change: '',
      positive: true,
      icon: <Award className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Focus Area',
      value: 'Canter',
      subValue: 'Transitions',
      change: '',
      positive: false,
      icon: <Star className="h-6 w-6 text-amber-600" />,
    },
  ];

  const chartConfig = {
    score: { label: "Score" }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-serif font-semibold text-gray-900 mb-4">
        Performance Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 border border-gray-100 hover:border-blue-300 transition-all duration-200">
            <CardContent className="p-0">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                {stat.icon}
              </div>
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subValue && (
                    <p className="text-sm text-gray-700">
                      {stat.subValue}
                    </p>
                  )}
                </div>
                {stat.change && (
                  <div className={`px-2 py-1 rounded-full text-sm ${stat.positive ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'} flex items-center`}>
                    {stat.positive && <ArrowUp className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Score Trend Chart */}
        <Card className="p-4 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Score Trend</h3>
          <div className="h-80 w-full">
            <ChartContainer config={chartConfig} className='max-h-full h-full max-w-full w-full' >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={scoreTrendData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a6da7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4a6da7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[60, 70]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    width={25}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4a6da7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#scoreGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Movement Radar Chart */}
        <Card className="p-4 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Movement Scores</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="70%" data={movementData}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis 
                  dataKey="movement" 
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 10]} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Radar 
                  name="Scores" 
                  dataKey="score" 
                  stroke="#4a6da7" 
                  fill="#4a6da7" 
                  fillOpacity={0.5} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '5px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceOverview;
