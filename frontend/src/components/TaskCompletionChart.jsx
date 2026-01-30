import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TaskCompletionChart = ({ data, size = 200, showLegend = true, innerRadius = 60 }) => {
  const COLORS = {
    completed: '#10b981', // green-500
    pending: '#f59e0b',   // amber-500
    notStarted: '#ef4444' // red-500
  };

  const chartData = [
    { name: 'Completed', value: data.completed, color: COLORS.completed },
    { name: 'Pending', value: data.pending, color: COLORS.pending },
    { name: 'Not Started', value: data.notStarted, color: COLORS.notStarted }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} task{data.value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 flex items-center gap-1">
              {entry.value === 'Completed' && <CheckCircle size={14} />}
              {entry.value === 'Pending' && <Clock size={14} />}
              {entry.value === 'Not Started' && <AlertCircle size={14} />}
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: size }}>
        <AlertCircle size={48} className="text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">No tasks assigned</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={size / 2 - 10}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text showing completion percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">
            {data.completionRate}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>
      
      {showLegend && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-green-600">{data.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-amber-600">{data.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-red-600">{data.notStarted}</div>
            <div className="text-xs text-gray-500">Not Started</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCompletionChart;