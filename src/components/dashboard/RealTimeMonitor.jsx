import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  HardDrive, 
  Wifi,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const RealTimeMonitor = ({ compact = false, showAlerts = true }) => {
  const [healthData, setHealthData] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const analytics = new analyticsService();
    
    // Start monitoring
    analytics.startRealTimeMonitoring((data) => {
      setHealthData(data);
      setLastUpdate(new Date());
      setIsConnected(true);
    });

    return () => {
      analytics.stopRealTimeMonitoring();
    };
  }, []);

  if (!healthData) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
            <span className="text-white">Initializing monitoring...</span>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.error) return 'text-red-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value >= thresholds.error) return <AlertTriangle className="h-5 w-5" />;
    if (value >= thresholds.warning) return <Clock className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const formatMetric = (value, type) => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'users':
        return value.toLocaleString();
      case 'time':
        return `${value}ms`;
      default:
        return value;
    }
  };

  const metrics = [
    {
      name: 'Active Users',
      value: healthData.metrics.activeUsers,
      type: 'users',
      icon: Users,
      thresholds: { warning: 0, error: 0 }
    },
    {
      name: 'Processing Rate',
      value: healthData.metrics.processingRate,
      type: 'percentage',
      icon: TrendingUp,
      thresholds: { warning: 80, error: 90 }
    },
    {
      name: 'System Load',
      value: healthData.metrics.systemLoad,
      type: 'percentage',
      icon: Cpu,
      thresholds: { warning: 70, error: 85 }
    },
    {
      name: 'Memory Usage',
      value: healthData.metrics.memoryUsage,
      type: 'percentage',
      icon: HardDrive,
      thresholds: { warning: 75, error: 90 }
    }
  ];

  if (!compact) {
    metrics.push({
      name: 'Error Rate',
      value: healthData.metrics.errorRate,
      type: 'percentage',
      icon: AlertTriangle,
      thresholds: { warning: 0.1, error: 0.5 }
    });
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">System Health</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          <span className="text-sm text-gray-400">
            Updated {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">{metric.name}</span>
              </div>
              {getStatusIcon(metric.value, metric.thresholds)}
            </div>
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-semibold ${getStatusColor(metric.value, metric.thresholds)}`}>
                {formatMetric(metric.value, metric.type)}
              </span>
              {metric.value > metric.thresholds.warning && showAlerts && (
                <span className="text-xs text-gray-400">
                  Threshold: {formatMetric(metric.thresholds.warning, metric.type)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          System Status: 
          <span className={`ml-2 ${healthData.status === 'healthy' ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
          </span>
        </span>
        {healthData.error && (
          <span className="text-red-400 flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>{healthData.error}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default RealTimeMonitor; 