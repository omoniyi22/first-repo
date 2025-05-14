
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UsageChart = () => {
  // Sample data - in a real app this would come from the API
  const data = [
    { name: 'Jan', dressage: 4, jumping: 3 },
    { name: 'Feb', dressage: 5, jumping: 4 },
    { name: 'Mar', dressage: 7, jumping: 6 },
    { name: 'Apr', dressage: 8, jumping: 7 },
    { name: 'May', dressage: 10, jumping: 9 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            width={30}
          />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="dressage" 
            name="Dressage" 
            stroke="#7b4a97" 
            strokeWidth={2} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="jumping" 
            name="Jumping" 
            stroke="#4a6da7" 
            strokeWidth={2}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
