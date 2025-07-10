import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const DeliveryWorkflowStatus = ({ 
  workflowStage = 'pending', 
  deliveryDetails = {},
  onStageUpdate 
}) => {
  const stages = [
    {
      key: 'pending',
      label: 'Pickup Requested',
      icon: Package,
      description: 'Request received and pending assignment'
    },
    {
      key: 'assigned',
      label: 'Assigned',
      icon: Truck,
      description: 'Assigned to collector'
    },
    {
      key: 'in_transit',
      label: 'In Transit',
      icon: MapPin,
      description: 'Collector en route to pickup location'
    },
    {
      key: 'collected',
      label: 'Collected',
      icon: CheckCircle,
      description: 'Items collected successfully'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Delivered to recycling center'
    }
  ];

  const getStageStatus = (stageKey) => {
    const currentIndex = stages.findIndex(s => s.key === workflowStage);
    const stageIndex = stages.findIndex(s => s.key === stageKey);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'current': return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Workflow Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage.key);
            const StatusIcon = getStatusIcon(status);
            const StageIcon = stage.icon;
            
            return (
              <div 
                key={stage.key}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                  status === 'current' 
                    ? 'border-blue-200 bg-blue-50' 
                    : status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                  <StageIcon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{stage.label}</h3>
                    <Badge 
                      variant={status === 'completed' ? 'default' : status === 'current' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                  
                  {/* Show additional details for current stage */}
                  {status === 'current' && deliveryDetails[stage.key] && (
                    <div className="mt-2 text-xs text-gray-500">
                      {deliveryDetails[stage.key]}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <StatusIcon className={`h-5 w-5 ${
                    status === 'completed' ? 'text-green-500' : 
                    status === 'current' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Action button for stage updates */}
        {onStageUpdate && workflowStage !== 'delivered' && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => onStageUpdate(workflowStage)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Status
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryWorkflowStatus; 