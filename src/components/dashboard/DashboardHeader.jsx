import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { AnimatedGradientText } from '../ui/animated-gradient-text';
import { ShimmerButton } from '../ui/shimmer-button';

const DashboardHeader = ({ 
  title, 
  subtitle, 
  user, 
  profileCompletion, 
  notifications = [], 
  onNotificationClick,
  showActionButton = false,
  actionButtonText = "New Request",
  onActionClick,
  className = ""
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <AnimatedGradientText className="text-2xl lg:text-3xl font-bold mb-1">
            {title}
          </AnimatedGradientText>
          <p className="text-gray-300 text-sm lg:text-base truncate">
            {subtitle || `Welcome back, ${user?.name}! Here's your EcoTech overview.`}
          </p>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
          {/* Action Button */}
          {showActionButton && onActionClick && (
            <ShimmerButton
              onClick={onActionClick}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 lg:px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{actionButtonText}</span>
              <span className="sm:hidden">New</span>
            </ShimmerButton>
          )}
          
          {/* Date Display - Aligned to right */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Today's Date</p>
            <p className="text-white font-medium text-sm">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader; 