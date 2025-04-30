
import { ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

const DashboardStats = () => {
  // Example statistics - in a real app, these would come from your backend
  const stats = [
    {
      title: 'Average Score',
      value: '64.8%',
      change: '+2.4%',
      positive: true,
    },
    {
      title: 'Tests Analyzed',
      value: '12',
      change: '+3',
      positive: true,
    },
    {
      title: 'Strongest Movement',
      value: 'Trot',
      subValue: 'Extended',
      change: '',
      positive: true,
    },
    {
      title: 'Focus Area',
      value: 'Canter',
      subValue: 'Transitions',
      change: '',
      positive: false,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-serif font-semibold text-purple-900 mb-4">
        Performance Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 border border-purple-100 hover:border-purple-300 transition-all duration-200">
            <h3 className="text-sm font-medium text-purple-600">
              {stat.title}
            </h3>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <p className="text-3xl font-semibold text-purple-900">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-sm text-purple-700">
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
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
