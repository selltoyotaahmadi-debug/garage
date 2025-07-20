import React from 'react';
import { Fuel } from 'lucide-react';

interface FuelLevelIndicatorProps {
  level: number; // 0-100
  onChange?: (level: number) => void;
}

const FuelLevelIndicator: React.FC<FuelLevelIndicatorProps> = ({ level, onChange }) => {
  // Calculate colors based on fuel level
  const getColor = () => {
    if (level <= 20) return 'text-red-500 dark:text-red-400';
    if (level <= 40) return 'text-orange-500 dark:text-orange-400';
    return 'text-green-500 dark:text-green-400';
  };

  // Calculate fill height based on level
  const fillHeight = `${level}%`;

  return (
    <div className="flex items-center space-x-4 space-x-reverse">
      <div className="relative w-16 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 transition-all duration-300`}
          style={{ height: fillHeight }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Fuel className={`w-8 h-8 ${getColor()}`} />
        </div>
        {onChange && (
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const height = rect.height;
              const y = e.clientY - rect.top;
              const newLevel = Math.max(0, Math.min(100, Math.round((1 - y / height) * 100)));
              onChange(newLevel);
            }}
          />
        )}
      </div>
      <div className="text-center">
        <div className={`text-xl font-bold ${getColor()}`}>{level}%</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">سطح سوخت</div>
      </div>
    </div>
  );
};

export default FuelLevelIndicator;