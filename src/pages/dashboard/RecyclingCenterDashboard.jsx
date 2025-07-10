import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import supabaseApi from '../../services/supabaseApi';
import recyclingCenterService from '../../services/recyclingCenterService';
import { useNavigate } from 'react-router-dom';
import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import { AnimatedGradientText } from '../../components/ui/animated-gradient-text';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Scale, 
  FileText, 
  Eye,
  Edit,
  Star,
  Calendar,
  MapPin,
  Phone,
  User,
  Weight,
  Activity,
  TrendingUp,
  Archive,
  X,
  Bell,
  Settings,
  LogOut,
  Loader2,
  ChevronRight,
  Users,
  Zap,
  Home
} from 'lucide-react';

const RecyclingCenterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deliveries');
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [showQualityControl, setShowQualityControl] = useState(false);
  const [showProcessingUpdate, setShowProcessingUpdate] = useState(false);
  
  // Enhanced UI states
  const [notifications, setNotifications] = useState([]);
  const [processingAction, setProcessingAction] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // NEW: Facility Details states
  const [facilityData, setFacilityData] = useState({
    center_name: '',
    address: '',
    operating_hours: '',
    accepted_materials: [],
    capacity: '',
    bio: '',
    phone: '',
    email: '',
    registration_number: '',
    center_latitude: '',
    center_longitude: '',
    profile_picture_url: ''
  });
  const [showFacilityEdit, setShowFacilityEdit] = useState(false);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [availableMaterials] = useState([
    'Electronics', 'Batteries', 'Computers', 'Mobile Phones', 
    'Appliances', 'Printers', 'TVs', 'Cables', 'Circuit Boards',
    'Hard Drives', 'Monitors', 'Keyboards', 'Mice', 'Speakers'
  ]);

  // Form states
  const [qualityForm, setQualityForm] = useState({
    overallQuality: 'good',
    materialCondition: 'acceptable',
    contamination: 'none',
    notes: '',
    actionRequired: false,
    actionNotes: ''
  });
  
  const [processingForm, setProcessingForm] = useState({
    status: 'received',
    notes: '',
    processingDate: '',
    completionEstimate: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    pendingDeliveries: 0,
    processedToday: 0,
    totalItems: 0
  });

  useEffect(() => {
    if (user && user.id) {
      loadDeliveries();
      loadStats();
      loadFacilityData(); // NEW: Load facility data
    }
  }, [user]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Enhanced notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Navigation functions
  const handleLogout = async () => {
    try {
      await logout(); // Clear all session data
      addNotification('Logged out successfully!', 'success');
      navigate('/'); // Redirect to homepage
    } catch (error) {
      addNotification('Error logging out', 'error');
      console.error('Logout error:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/'); // Redirect to homepage while staying logged in
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      // Get deliveries for this recycling center using the user's profile ID
      const centerId = user.id; // Recycling center users use their profile ID
      console.log('Loading deliveries for recycling center:', centerId);
      console.log('User object:', user);
      
      const response = await supabaseApi.delivery.getDeliveries(centerId);
      console.log('Loaded deliveries response:', response);
      console.log('Number of deliveries:', response.deliveries?.length || 0);
      
      // Transform delivery data to include collection request details
      const transformedDeliveries = response.deliveries.map(delivery => ({
        ...delivery,
        requestId: delivery.collection_request?.id || delivery.collection_request_id,
        collectorName: delivery.collector?.name || 'Unknown',
        items: delivery.collection_request?.items || [],

        totalAmount: delivery.collection_request?.total_amount || 0,
        paymentStatus: delivery.collection_request?.payment_status || 'unknown'
      }));
      
      console.log('Transformed deliveries:', transformedDeliveries);
      setDeliveries(transformedDeliveries);
    } catch (err) {
      setError('Failed to load deliveries');
      console.error('Error loading deliveries:', err);
      console.error('Error details:', err.message, err.stack);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from deliveries
      const centerId = user.id; // Recycling center users use their profile ID
      const response = await supabaseApi.delivery.getDeliveries(centerId);
      const allDeliveries = response.deliveries;
      
      const pending = allDeliveries.filter(d => ['delivered', 'pending_delivery', 'received'].includes(d.status)).length;
      const processedToday = allDeliveries.filter(d => 
        d.processed_at && new Date(d.processed_at).toDateString() === new Date().toDateString()
      ).length;
      
      // Calculate total items processed
      const totalItems = allDeliveries.reduce((sum, d) => {
        const items = d.collection_request?.items || [];
        const itemCount = Array.isArray(items) ? items.reduce((count, item) => count + (item.quantity || 1), 0) : 0;
        return sum + itemCount;
      }, 0);
      
      setStats({
        pendingDeliveries: pending,
        processedToday,
        totalItems: totalItems
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const confirmDelivery = async (deliveryId, notes) => {
    try {
      setProcessingAction(deliveryId);
      
      // Use recycling center service to confirm delivery and trigger commission payment
      const result = await recyclingCenterService.confirmDelivery(deliveryId, user.id, notes);
      
      if (result.success) {
        await loadDeliveries();
        await loadStats();
        setShowDeliveryDetails(false);
        
        // Show success message with commission details
        const commissionMsg = result.data.commissionProcessed 
          ? 'Delivery confirmed successfully! Collector commission has been processed and paid.'
          : 'Delivery confirmed successfully!';
        
        addNotification(commissionMsg, 'success');
        
        // Log commission details for debugging
        if (result.data.commissionProcessed) {
          console.log('Commission processed for delivery:', {
            deliveryId,
            collectorId: result.data.delivery.collector_id,
            commissionAmount: result.data.collectionRequest.collector_commission
          });
        }
      } else {
        addNotification(`Failed to confirm delivery: ${result.error}`, 'error');
      }
    } catch (err) {
      addNotification('Failed to confirm delivery', 'error');
      console.error('Error confirming delivery:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const updateProcessingStatus = async (deliveryId, status, notes) => {
    try {
      setProcessingAction(deliveryId);
              await supabaseApi.delivery.updateProcessingStatus(deliveryId, status, notes);
      await loadDeliveries();
      await loadStats();
      setShowProcessingUpdate(false);
      setProcessingForm({ status: 'received', notes: '', processingDate: '', completionEstimate: '' });
      addNotification(`Processing status updated to ${getStatusLabel(status)}`, 'success');
    } catch (err) {
      addNotification('Failed to update processing status', 'error');
      console.error('Error updating processing:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleQualityControlSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mock quality control submission
      const qualityData = {
        deliveryId: selectedDelivery.id,
        centerId: user.centerId || 1,
        ...qualityForm,
        assessedAt: new Date().toISOString(),
        assessedBy: user.name
      };
      
      console.log('Quality control submitted:', qualityData);
      
      // Update delivery with quality notes
      await updateProcessingStatus(
        selectedDelivery.id, 
        'quality_checked', 
        `Quality: ${qualityForm.overallQuality}. ${qualityForm.notes}`
      );
      
      setShowQualityControl(false);
      setQualityForm({
        overallQuality: 'good',
        materialCondition: 'acceptable',
        contamination: 'none',
        notes: '',
        actionRequired: false,
        actionNotes: ''
      });
      addNotification('Quality control assessment submitted successfully!', 'success');
    } catch (err) {
      addNotification('Failed to submit quality control assessment', 'error');
    }
  };

  const handleProcessingSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProcessingStatus(
        selectedDelivery.id,
        processingForm.status,
        `Processing: ${processingForm.notes}`
      );
    } catch (err) {
      setError('Failed to update processing status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_delivery: 'bg-yellow-500',
      received: 'bg-blue-500',
      quality_checked: 'bg-purple-500',
      processing: 'bg-orange-500',
      processed: 'bg-green-500',
      delivered: 'bg-green-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_delivery: 'Pending Delivery',
      received: 'Received',
      quality_checked: 'Quality Checked',
      processing: 'Processing',
      processed: 'Processed',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const getQualityColor = (quality) => {
    const colors = {
      excellent: 'text-green-400',
      good: 'text-emerald-400',
      acceptable: 'text-yellow-400',
      poor: 'text-red-400'
    };
    return colors[quality] || 'text-gray-400';
  };

  // Helper function to generate user-friendly delivery numbers
  const getDeliveryDisplayNumber = (deliveryId, prefix = 'DEL') => {
    if (!deliveryId) return 'N/A';
    
    // For sample/demo deliveries, use simple numbers
    if (deliveryId.toString().startsWith('sample')) {
      const num = deliveryId.replace('sample-', '');
      return `${prefix}${num.padStart(3, '0')}`;
    }
    
    // For UUIDs, create a short meaningful number
    const numericPart = parseInt(deliveryId.toString().slice(-6), 16) % 999999;
    return `${prefix}${numericPart.toString().padStart(6, '0')}`;
  };

  // Helper function to get a short display version for UI badges
  const getShortDeliveryNumber = (deliveryId, prefix = 'DEL') => {
    if (!deliveryId) return 'N/A';
    
    if (deliveryId.toString().startsWith('sample')) {
      const num = deliveryId.replace('sample-', '');
      return `${prefix}${num}`;
    }
    
    const numericPart = parseInt(deliveryId.toString().slice(-4), 16) % 9999;
    return `${prefix}${numericPart}`;
  };

  // Helper function for collection request numbers
  const getRequestNumber = (requestId) => {
    if (!requestId) return 'N/A';
    
    if (requestId.toString().startsWith('sample')) {
      const num = requestId.replace('sample-', '');
      return `REQ${num}`;
    }
    
    const numericPart = parseInt(requestId.toString().slice(-4), 16) % 9999;
    return `REQ${numericPart}`;
  };

  // NEW: Load facility data function
  const loadFacilityData = async () => {
    try {
      setFacilityLoading(true);
      console.log('Loading facility data for user:', user.id);
      
      const profile = await supabaseApi.auth.getProfile(user.id);
      console.log('Profile data loaded:', profile);
      
      // Debug: Log the raw profile data to check coordinate values
      console.log('Raw profile data from database:', {
        center_latitude: profile.center_latitude,
        center_longitude: profile.center_longitude,
        lat_type: typeof profile.center_latitude,
        lng_type: typeof profile.center_longitude
      });

      setFacilityData({
        center_name: profile.center_name || '',
        address: profile.address || '',
        operating_hours: profile.operating_hours || '',
        accepted_materials: profile.accepted_materials || [],
        capacity: profile.capacity || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        email: profile.email || '',
        registration_number: profile.registration_number || '',
        center_latitude: profile.center_latitude || '',
        center_longitude: profile.center_longitude || '',
        profile_picture_url: profile.profile_picture_url || ''
      });
      
      console.log('Facility data set successfully with coordinates:', {
        lat: profile.center_latitude,
        lng: profile.center_longitude
      });
      addNotification('Facility details loaded successfully!', 'success');
    } catch (err) {
      console.error('Error loading facility data:', err);
      addNotification('Failed to load facility details', 'error');
    } finally {
      setFacilityLoading(false);
    }
  };

  // NEW: Update facility data function
  const updateFacilityData = async (updatedData) => {
    try {
      setFacilityLoading(true);
      
      await supabaseApi.auth.updateProfile(user.id, updatedData);
      
      setFacilityData(prev => ({ ...prev, ...updatedData }));
      addNotification('Facility details updated successfully!', 'success');
      setShowFacilityEdit(false);
    } catch (err) {
      console.error('Error updating facility data:', err);
      addNotification('Failed to update facility details', 'error');
    } finally {
      setFacilityLoading(false);
    }
  };

  // NEW: Handle material toggle for facility
  const handleMaterialToggle = (material) => {
    setFacilityData(prev => ({
      ...prev,
      accepted_materials: prev.accepted_materials.includes(material)
        ? prev.accepted_materials.filter(m => m !== material)
        : [...prev.accepted_materials, material]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-emerald-400/20 animate-ping mx-auto"></div>
          </div>
          <AnimatedGradientText className="text-xl font-semibold">
            Loading Recycling Center Dashboard...
          </AnimatedGradientText>
          <p className="text-gray-400 mt-2">Preparing your processing operations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
              notification.type === 'success' 
                ? 'bg-emerald-500/90 text-white border border-emerald-400' 
                : 'bg-red-500/90 text-white border border-red-400'
            } animate-slide-in-right`}
          >
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 min-h-screen transition-all duration-300`}>
          <div className="p-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-white font-bold text-lg">Processing Center</h2>
                  <p className="text-gray-400 text-sm">Material Management</p>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-colors"
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'deliveries', label: 'Deliveries', icon: Truck, count: stats.pendingDeliveries },
                { id: 'facility', label: 'Facility Details', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      {!sidebarCollapsed && <span className="font-medium">{tab.label}</span>}
                    </div>
                    {!sidebarCollapsed && tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {!sidebarCollapsed && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="border-t border-slate-700 pt-4 space-y-4">
                  {/* Profile Section */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm truncate">
                          {facilityData.center_name || user?.name || 'Recycling Center'}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {facilityData.email || user?.email || 'center@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="space-y-2">
                    <button 
                      onClick={handleGoHome}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 group"
                    >
                      <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Go Home</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                    >
                      <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="absolute bottom-4 left-2 right-2">
                <div className="border-t border-slate-700 pt-4 space-y-2">
                  {/* Profile Icon */}
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleGoHome}
                    className="w-full flex items-center justify-center p-3 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 group"
                    title="Go Home"
                  >
                    <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <AnimatedGradientText className="text-3xl font-bold mb-2">
                  Recycling Center Dashboard
                </AnimatedGradientText>
              </div>
              
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
                {stats.pendingDeliveries > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Active Operations: {deliveries.length}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MagicCard className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending Deliveries</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingDeliveries.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Awaiting Processing</span>
                  </div>
                </div>
                <div className="relative">
                  <Truck className="h-10 w-10 text-yellow-400" />
                  {stats.pendingDeliveries > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{stats.pendingDeliveries}</span>
                    </div>
                  )}
                </div>
              </div>
            </MagicCard>

            <MagicCard className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Processed Today</p>
                  <p className="text-3xl font-bold text-white">{stats.processedToday.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">Daily Operations</span>
                  </div>
                </div>
                <div className="relative">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse"></div>
                </div>
              </div>
            </MagicCard>

            <MagicCard className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Items</p>
                  <p className="text-3xl font-bold text-white">{stats.totalItems}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-blue-400">Items Processed</span>
                  </div>
                </div>
                <div className="relative">
                  <Weight className="h-10 w-10 text-blue-400" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </MagicCard>


      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
          { id: 'facility', label: 'Facility Details', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          {deliveries.length === 0 ? (
            <MagicCard className="p-12 text-center">
              <div className="relative mb-6">
                <Truck className="h-20 w-20 text-gray-400 mx-auto" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Active Deliveries</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Your processing center is ready for new deliveries. When collectors schedule deliveries, they'll appear here for management.
              </p>
              <ShimmerButton size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All Requests
              </ShimmerButton>
            </MagicCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deliveries.map(delivery => (
                <MagicCard key={delivery.id} className="p-6 hover:scale-[1.02] transition-all duration-200 border border-slate-700/50 hover:border-emerald-500/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(delivery.status)} animate-pulse`}></div>
                        <div className={`absolute inset-0 w-4 h-4 rounded-full ${getStatusColor(delivery.status)} opacity-30 animate-ping`}></div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-mono font-bold">
                            {getShortDeliveryNumber(delivery.id)}
                          </span>
                          <h3 className="text-lg font-bold text-white">Delivery</h3>
                        </div>
                        <p className="text-sm text-emerald-400 font-medium">{getStatusLabel(delivery.status)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-mono">
                        {getRequestNumber(delivery.requestId)}
                      </span>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-400">
                            {delivery.collectorId?.toString().slice(-2) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm">Collector: {delivery.collectorName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Weight className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm">
                        {delivery.collection_request?.items?.length || 0} items
                      </span>
                    </div>
                    
                    {delivery.totalAmount > 0 && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Package className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm">Value: LKR {delivery.totalAmount} ({delivery.paymentStatus})</span>
                      </div>
                    )}
                    
                    {delivery.deliveredAt && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm">{new Date(delivery.deliveredAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {delivery.expectedDelivery && !delivery.deliveredAt && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">Expected: {new Date(delivery.expectedDelivery).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {delivery.items && delivery.items.length > 0 ? (
                        delivery.items.map((item, index) => (
                          <span key={index} className="bg-slate-700 text-emerald-400 px-2 py-1 rounded text-xs">
                            {typeof item === 'object' ? `${item.category} (${item.quantity})` : item}
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-700 text-gray-400 px-2 py-1 rounded text-xs">
                          No items specified
                        </span>
                      )}
                    </div>
                  </div>

                  {delivery.collector_notes && (
                    <div className="mb-4 p-3 bg-slate-700 rounded">
                      <p className="text-sm text-gray-400 mb-1">Collector Notes:</p>
                      <p className="text-sm text-white">{delivery.collector_notes}</p>
                    </div>
                  )}

                  {delivery.processing_notes && (
                    <div className="mb-4 p-3 bg-emerald-500/10 rounded">
                      <p className="text-sm text-emerald-400 mb-1">Processing Notes:</p>
                      <p className="text-sm text-white">{delivery.processing_notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <ShimmerButton
                      size="sm"
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowDeliveryDetails(true);
                      }}
                      className="flex-1 min-w-[120px]"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </ShimmerButton>
                    
                    {delivery.status === 'delivered' && (
                      <button
                        onClick={() => confirmDelivery(delivery.id, 'Delivery confirmed by recycling center')}
                        disabled={processingAction === delivery.id}
                        className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                      >
                        {processingAction === delivery.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Delivery
                          </>
                        )}
                      </button>
                    )}
                    
                    {delivery.status === 'pending_delivery' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setProcessingForm({
                            ...processingForm,
                            status: 'received'
                          });
                          setShowProcessingUpdate(true);
                        }}
                        disabled={processingAction === delivery.id}
                        className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                      >
                        {processingAction === delivery.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Receipt
                          </>
                        )}
                      </button>
                    )}
                    
                    {(delivery.status === 'received' || delivery.status === 'delivered') && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowQualityControl(true);
                        }}
                        disabled={processingAction === delivery.id}
                        className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                      >
                        {processingAction === delivery.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Quality Check
                          </>
                        )}
                      </button>
                    )}
                    
                    {delivery.status === 'quality_checked' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setProcessingForm({
                            ...processingForm,
                            status: 'processing'
                          });
                          setShowProcessingUpdate(true);
                        }}
                        disabled={processingAction === delivery.id}
                        className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                      >
                        {processingAction === delivery.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Activity className="h-4 w-4 mr-2" />
                            Start Processing
                          </>
                        )}
                      </button>
                    )}
                    
                    {delivery.status === 'processing' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setProcessingForm({
                            ...processingForm,
                            status: 'processed'
                          });
                          setShowProcessingUpdate(true);
                        }}
                        disabled={processingAction === delivery.id}
                        className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                      >
                        {processingAction === delivery.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Processing
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </MagicCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW: Facility Details Tab */}
      {activeTab === 'facility' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Facility Details</h2>
              <p className="text-gray-300">Manage your recycling center information and settings</p>
            </div>
            <div className="flex items-center space-x-3">
              {facilityLoading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              )}
              <button
                onClick={loadFacilityData}
                disabled={facilityLoading}
                className="flex items-center px-3 py-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Refresh facility data"
              >
                <Activity className="h-4 w-4" />
              </button>
              <ShimmerButton
                onClick={() => setShowFacilityEdit(true)}
                disabled={facilityLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </ShimmerButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <MagicCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Basic Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Center Name</label>
                  <p className="text-white font-medium">{facilityData.center_name || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Registration Number</label>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-sm font-mono">
                      {facilityData.registration_number || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Operating Hours</label>
                  <p className="text-white">{facilityData.operating_hours || 'Not specified'}</p>
                </div>
              </div>
            </MagicCard>

            {/* Contact Information */}
            <MagicCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-white">{facilityData.phone || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89c.18.18.42.28.67.28s.49-.1.67-.28L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white">{facilityData.email || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Address</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-white">{facilityData.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </MagicCard>

            {/* Location & Coordinates */}
            <MagicCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Location & Coordinates</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">GPS Coordinates</label>
                  {facilityData.center_latitude && facilityData.center_longitude ? (
                    <div className="space-y-3">
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Latitude:</span>
                          <span className="text-emerald-400 font-mono text-sm">
                            {parseFloat(facilityData.center_latitude).toFixed(6)}°
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Longitude:</span>
                          <span className="text-emerald-400 font-mono text-sm">
                            {parseFloat(facilityData.center_longitude).toFixed(6)}°
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const lat = facilityData.center_latitude;
                            const lng = facilityData.center_longitude;
                            const url = `https://www.google.com/maps?q=${lat},${lng}`;
                            window.open(url, '_blank');
                          }}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>View on Maps</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const coords = `${facilityData.center_latitude}, ${facilityData.center_longitude}`;
                            navigator.clipboard.writeText(coords);
                            addNotification('Coordinates copied to clipboard!', 'success');
                          }}
                          className="flex items-center space-x-2 px-3 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors text-sm"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm">⚠️ No coordinates specified</p>
                      <p className="text-gray-400 text-xs mt-1">Add coordinates to enable location features</p>
                    </div>
                  )}
                </div>
              </div>
            </MagicCard>

            {/* Accepted Materials */}
            <MagicCard className="p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Archive className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-xl font-semibold text-white">Accepted Materials</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-400">
                    {facilityData.accepted_materials ? facilityData.accepted_materials.length : 0} categories
                  </span>
                </div>
              </div>
              
              {facilityData.accepted_materials && facilityData.accepted_materials.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {facilityData.accepted_materials.map(material => (
                      <div key={material} className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm border border-emerald-500/30 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="font-medium">{material}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">
                      💡 <strong>Tip:</strong> These are the waste categories your facility can process. Update your list to match your actual capabilities.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                  <Archive className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-medium">No materials specified</p>
                  <p className="text-gray-400 text-sm mt-1">Add accepted material categories to help collectors understand what you can process.</p>
                </div>
              )}
            </MagicCard>


          </div>
        </div>
      )}

      {/* Enhanced Delivery Details Modal */}
      {showDeliveryDetails && selectedDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedDelivery.status)} animate-pulse`}></div>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-mono font-bold">
                  {getDeliveryDisplayNumber(selectedDelivery.id)}
                </span>
                <h3 className="text-2xl font-bold text-white">Delivery Details</h3>
              </div>
              <button
                onClick={() => setShowDeliveryDetails(false)}
                className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedDelivery.status)}`}></div>
                    <p className="text-white">{getStatusLabel(selectedDelivery.status)}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Collection Request</label>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono font-bold">
                    {getRequestNumber(selectedDelivery.requestId)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Collector</label>
                  <p className="text-white">{selectedDelivery.collectorName}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Items</label>
                  <p className="text-white">
                    {selectedDelivery.collection_request?.items?.length || 0} items
                  </p>
                </div>
                {selectedDelivery.totalAmount > 0 && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Collection Value</label>
                    <p className="text-white">LKR {selectedDelivery.totalAmount} ({selectedDelivery.paymentStatus})</p>
                  </div>
                )}
                {selectedDelivery.deliveredAt && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Delivered At</label>
                    <p className="text-white">{new Date(selectedDelivery.deliveredAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Items</label>
                <div className="flex flex-wrap gap-2">
                  {selectedDelivery.items && selectedDelivery.items.length > 0 ? (
                    selectedDelivery.items.map((item, index) => (
                      <span key={index} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded">
                        {typeof item === 'object' ? `${item.category} (${item.quantity})` : item}
                      </span>
                    ))
                  ) : (
                    <span className="bg-slate-700 text-gray-400 px-3 py-1 rounded">
                      No items specified
                    </span>
                  )}
                </div>
              </div>

              {selectedDelivery.collector_notes && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Collector Notes</label>
                  <p className="text-white bg-slate-700 p-3 rounded">{selectedDelivery.collector_notes}</p>
                </div>
              )}

              {selectedDelivery.processing_notes && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Processing Notes</label>
                  <p className="text-white bg-emerald-500/10 p-3 rounded">{selectedDelivery.processing_notes}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {selectedDelivery.status === 'delivered' && (
                  <ShimmerButton
                    onClick={() => {
                      confirmDelivery(selectedDelivery.id, 'Delivery confirmed by recycling center');
                      setShowDeliveryDetails(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Delivery
                  </ShimmerButton>
                )}
                
                {selectedDelivery.status === 'pending_delivery' && (
                  <ShimmerButton
                    onClick={() => {
                      setShowDeliveryDetails(false);
                      setProcessingForm({
                        ...processingForm,
                        status: 'received',
                        
                      });
                      setShowProcessingUpdate(true);
                    }}
                  >
                    Confirm Receipt
                  </ShimmerButton>
                )}
                
                {(selectedDelivery.status === 'received' || selectedDelivery.status === 'delivered') && (
                  <button
                    onClick={() => {
                      setShowDeliveryDetails(false);
                      setShowQualityControl(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Quality Check
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quality Control Modal */}
      {showQualityControl && selectedDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Quality Assessment</h3>
              </div>
              <button
                onClick={() => setShowQualityControl(false)}
                className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleQualityControlSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Overall Quality</label>
                <select
                  value={qualityForm.overallQuality}
                  onChange={(e) => setQualityForm({...qualityForm, overallQuality: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Material Condition</label>
                <select
                  value={qualityForm.materialCondition}
                  onChange={(e) => setQualityForm({...qualityForm, materialCondition: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Contamination Level</label>
                <select
                  value={qualityForm.contamination}
                  onChange={(e) => setQualityForm({...qualityForm, contamination: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                >
                  <option value="none">None</option>
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Assessment Notes</label>
                <textarea
                  value={qualityForm.notes}
                  onChange={(e) => setQualityForm({...qualityForm, notes: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 h-24"
                  placeholder="Detailed quality assessment notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="actionRequired"
                  checked={qualityForm.actionRequired}
                  onChange={(e) => setQualityForm({...qualityForm, actionRequired: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="actionRequired" className="text-sm text-gray-400">
                  Special action required
                </label>
              </div>

              {qualityForm.actionRequired && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Action Notes</label>
                  <textarea
                    value={qualityForm.actionNotes}
                    onChange={(e) => setQualityForm({...qualityForm, actionNotes: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 h-20"
                    placeholder="Describe required actions..."
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowQualityControl(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                >
                  Submit Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Processing Update Modal */}
      {showProcessingUpdate && selectedDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Update Processing Status</h3>
              </div>
              <button
                onClick={() => setShowProcessingUpdate(false)}
                className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={processingForm.status}
                  onChange={(e) => setProcessingForm({...processingForm, status: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2"
                  required
                >
                  <option value="received">Received</option>
                  <option value="quality_checked">Quality Checked</option>
                  <option value="processing">Processing</option>
                  <option value="processed">Processed</option>
                </select>
              </div>



              <div>
                <label className="block text-sm text-gray-400 mb-2">Processing Notes</label>
                <textarea
                  value={processingForm.notes}
                  onChange={(e) => setProcessingForm({...processingForm, notes: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 h-24"
                  placeholder="Add processing notes..."
                />
              </div>

              {processingForm.status === 'processed' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Completion Date</label>
                  <input
                    type="date"
                    value={processingForm.processingDate}
                    onChange={(e) => setProcessingForm({...processingForm, processingDate: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProcessingUpdate(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Facility Edit Modal */}
      {showFacilityEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-emerald-400" />
                <h3 className="text-2xl font-bold text-white">Edit Facility Details</h3>
              </div>
              <button
                onClick={() => setShowFacilityEdit(false)}
                className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateFacilityData(facilityData);
            }} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-emerald-400" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Center Name *</label>
                    <input
                      type="text"
                      value={facilityData.center_name}
                      onChange={(e) => setFacilityData({...facilityData, center_name: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Registration Number</label>
                    <input
                      type="text"
                      value={facilityData.registration_number}
                      onChange={(e) => setFacilityData({...facilityData, registration_number: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Address *</label>
                    <input
                      type="text"
                      value={facilityData.address}
                      onChange={(e) => setFacilityData({...facilityData, address: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Operating Hours</label>
                    <input
                      type="text"
                      value={facilityData.operating_hours}
                      onChange={(e) => setFacilityData({...facilityData, operating_hours: e.target.value})}
                      placeholder="e.g., Mon-Fri: 8AM-5PM, Sat: 8AM-12PM"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-emerald-400" />
                  Contact Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={facilityData.phone}
                      onChange={(e) => setFacilityData({...facilityData, phone: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={facilityData.email}
                      onChange={(e) => setFacilityData({...facilityData, email: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location Coordinates Section */}
              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-emerald-400" />
                  Location Coordinates
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={facilityData.center_latitude}
                      onChange={(e) => setFacilityData({...facilityData, center_latitude: e.target.value})}
                      placeholder="e.g., 6.9271"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={facilityData.center_longitude}
                      onChange={(e) => setFacilityData({...facilityData, center_longitude: e.target.value})}
                      placeholder="e.g., 79.8612"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* Coordinate Guidance */}
                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="space-y-2">
                      <h5 className="text-blue-400 font-medium text-sm">📍 How to Find Your Coordinates</h5>
                      
                      <div className="text-xs text-gray-300">
                        <div>
                          <strong className="text-blue-300">GPS Coordinates Websites</strong>
                          <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                            <li>Visit <a href="https://latlong.net" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">latlong.net</a> and find your location on map then double click your location.</li>
                            <li>It will show Latitude Longitude</li>
                            <li>Copy the values and paste here</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accepted Materials Section */}
              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Archive className="h-5 w-5 mr-2 text-emerald-400" />
                  Accepted Materials
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableMaterials.map(material => (
                    <label key={material} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilityData.accepted_materials.includes(material)}
                        onChange={() => handleMaterialToggle(material)}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-300">{material}</span>
                    </label>
                  ))}
                </div>
              </div>



              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-600">
                <button
                  type="button"
                  onClick={() => setShowFacilityEdit(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={facilityLoading}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {facilityLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default RecyclingCenterDashboard;
