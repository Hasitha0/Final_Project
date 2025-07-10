import React from 'react';
import { MagicCard } from '../ui/magic-card';

const MetricCard = ({ 
  icon: Icon, 
  value, 
  label, 
  subtitle, 
  iconColor = 'text-blue-400',
  iconBgColor = 'bg-blue-500/20',
  className = ""
}) => {
  return (
    <MagicCard className={`p-4 lg:p-6 text-center ${className}`}>
      <div className={`w-10 h-10 lg:w-12 lg:h-12 ${iconBgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
        <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${iconColor}`} />
      </div>
      <p className="text-xl lg:text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-300 text-xs lg:text-sm">{label}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${iconColor}`}>{subtitle}</p>
      )}
    </MagicCard>
  );
};

export default MetricCard; 