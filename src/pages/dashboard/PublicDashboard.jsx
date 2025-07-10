import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supabaseApi from '../../services/supabaseApi';

// Shared Components
import { DashboardHeader, DashboardSidebar, MetricCard } from '../../components/dashboard';
import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import NotificationCenter from '../../components/NotificationCenter';
import ContactSupportForm from '../../components/ContactSupportForm';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor
} from '../../services/notificationService';

// Icons
import { 
  Home, User, Package, BarChart3, Settings, Bell, MessageSquare,
  CheckCircle, Clock, Truck, Recycle, Award, Calendar, MapPin,
  Phone, Mail, Edit3, X, Plus, Activity, TrendingUp, Star,
  Upload, Eye, EyeOff, AlertTriangle, XCircle, Target, Users,
  FileText, Camera, Zap, Heart, Leaf, Check
} from 'lucide-react';

// Lazy load heavy components
const RequestPickupForm = lazy(() => import('../../components/RequestPickupForm'));

// Navigation configuration
const NAVIGATION_TABS = [
  { id: 'overview', name: 'Overview', icon: Home },
  { id: 'requests', name: 'My Requests', icon: Package },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'achievements', name: 'Achievements', icon: Award },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'settings', name: 'Settings', icon: Settings }
];

// Metric configuration for overview
const METRIC_CONFIGS = [
  {
    key: 'totalRequests',
    icon: Package,
    label: 'Total Requests',
    iconColor: 'text-blue-400',
    iconBgColor: 'bg-blue-500/20'
  },
  {
    key: 'completedRequests', 
    icon: CheckCircle,
    label: 'Completed',
    iconColor: 'text-green-400',
    iconBgColor: 'bg-green-500/20'
  },
  {
    key: 'totalItems',
    icon: Activity,
    label: 'Items Recycled',
    iconColor: 'text-purple-400',
    iconBgColor: 'bg-purple-500/20'
  },
  {
    key: 'sustainabilityContribution',
    icon: Heart,
    label: 'Sustainability Fund',
    iconColor: 'text-pink-400',
    iconBgColor: 'bg-pink-500/20'
  }
];

const PublicDashboard = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // UI states
  const [notifications, setNotifications] = useState([]);
  const [dbNotifications, setDbNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // User data
  const [userStats, setUserStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    totalItems: 0,
    sustainabilityContribution: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    district: '',
    area: '',
    defaultPickupAddress: '',
    dateOfBirth: '',
    bio: '',
    profilePictureUrl: ''
  });
  
  // Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    phone: '',
    district: '',
    area: '',
    defaultPickupAddress: '',
    dateOfBirth: '',
    bio: ''
  });
  
  // Additional data
  const [userSupportTickets, setUserSupportTickets] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [userFeedbackHistory, setUserFeedbackHistory] = useState([]);
  const [recyclingCenters, setRecyclingCenters] = useState([]);

  // Navigation tabs with dynamic counts
  const tabs = useMemo(() => 
    NAVIGATION_TABS.map(tab => ({
      ...tab,
      count: tab.id === 'requests' ? requests.filter(r => r.status === 'pending').length :
             tab.id === 'achievements' ? achievements.length :
             tab.id === 'notifications' ? notifications.filter(n => !n.read).length :
             0
    })), [requests, achievements, notifications]
  );

  // Enhanced notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    let completion = 0;
    const totalFields = 8; // Total number of profile fields
    let filledFields = 0;
    
    // Required fields check
    const fields = [
      profileData.name || user?.name,           // Name (12.5%)
      user?.email,                              // Email (12.5%)
      profileData.phone || user?.phone,         // Phone (12.5%)
      profileData.district,                     // District (12.5%)
      profileData.area,                         // Area (12.5%)
      profileData.defaultPickupAddress || user?.address, // Address (12.5%)
      profileData.dateOfBirth,                  // Date of Birth (12.5%)
      profileData.profilePictureUrl || user?.profile_picture_url // Profile Picture (12.5%)
    ];
    
    fields.forEach((field, index) => {
      if (field && field.toString().trim() !== '') {
        filledFields++;
      }
    });
    
    completion = Math.round((filledFields / totalFields) * 100);
    
    // Debug logging for profile completion
    console.log('Profile completion calculation:', {
      fields: fields.map((field, index) => ({
        index,
        value: field,
        filled: field && field.toString().trim() !== ''
      })),
      filledFields,
      totalFields,
      completion
    });
    
    return completion;
  }, [
    profileData.name, 
    user?.name, 
    user?.email, 
    profileData.phone, 
    user?.phone, 
    profileData.district,
    profileData.area,
    profileData.defaultPickupAddress, 
    user?.address, 
    profileData.dateOfBirth,
    profileData.profilePictureUrl,
    user?.profile_picture_url
  ]);

  // Load user's collection requests
  const loadRequests = async () => {
    if (!user?.id) {
      console.log('No user ID available for loading requests');
      return;
    }
    
    console.log('Loading requests for user:', user.id);
    
    try {
      const requests = await supabaseApi.collection.getUserRequests(user.id);
      console.log('Raw requests data from database:', requests);
      
      setRequests(requests || []);
      
      // Calculate user stats
      const completed = (requests || []).filter(req => req.status === 'completed');
      const totalItems = completed.reduce((sum, req) => {
        const items = req.items || [];
        return sum + (Array.isArray(items) ? items.reduce((count, item) => count + (item.quantity || 1), 0) : 0);
      }, 0);
      
      // Calculate sustainability fund contributions
      const sustainabilityContribution = completed.reduce((sum, req) => {
        const totalAmount = req.total_amount || 0;
        return sum + (totalAmount * 0.10); // 10% goes to sustainability fund
      }, 0);
      
      const stats = {
        totalRequests: (requests || []).length,
        completedRequests: completed.length,
        totalItems: totalItems,
        sustainabilityContribution: sustainabilityContribution
      };
      
      console.log('Calculated user stats:', stats);
      console.log('Requests breakdown:', {
        total: (requests || []).length,
        completed: completed.length,
        pending: (requests || []).filter(req => req.status === 'pending').length,
        confirmed: (requests || []).filter(req => req.status === 'confirmed').length
      });
      setUserStats(stats);
      
      if (requests && requests.length === 0) {
        console.log('No requests found for user');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setError(`Failed to load your requests: ${error.message}`);
    }
  };

  // Load user achievements
  const loadAchievements = async () => {
    if (!user?.id) return;
    
    try {
      const userAchievements = await supabaseApi.achievement.getUserAchievements(user.id);
      const allAchievements = await supabaseApi.achievement.getAllAchievements();
      
      setAchievements(userAchievements || []);
      setAllAchievements(allAchievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  // Load enhanced profile data
  const loadEnhancedProfile = async () => {
      if (!user?.id) return;
      
    try {
      const profile = await supabaseApi.auth.getProfile(user.id);
      console.log('Loaded profile data for completion calculation:', profile);
      if (profile) {
        setProfileData({
          name: profile.name || profile.full_name || '',
          phone: profile.phone || '',
          district: profile.district || '',
          area: profile.area || '',
          defaultPickupAddress: profile.default_pickup_address || profile.address || '',
          dateOfBirth: profile.date_of_birth || '',
          bio: profile.bio || '',
          profilePictureUrl: profile.profile_picture_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Load user support tickets
  const loadUserSupportTickets = async () => {
    if (!user?.id) return;
    
    try {
      const tickets = await supabaseApi.support.getSupportRequests();
      // Filter tickets for current user
      const userTickets = (tickets || []).filter(ticket => ticket.user_id === user.id);
      setUserSupportTickets(userTickets);
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  // Load material types
  const loadMaterialTypes = async () => {
    try {
      const types = await supabaseApi.material.getAllMaterials();
      setMaterialTypes(types || []);
    } catch (error) {
      console.error('Error loading material types:', error);
      // Set default material types if database fails
      setMaterialTypes([
        { id: 1, name: 'Electronics', category: 'electronic' },
        { id: 2, name: 'Batteries', category: 'battery' },
        { id: 3, name: 'Appliances', category: 'appliance' },
        { id: 4, name: 'Computers', category: 'computer' },
        { id: 5, name: 'Mobile Devices', category: 'mobile' }
      ]);
    }
  };

  // Load user feedback history
  const loadUserFeedbackHistory = async () => {
    if (!user?.id) return;
    
    try {
      const allFeedback = await supabaseApi.feedback.getAllFeedback();
      // Filter feedback for current user
      const userFeedback = (allFeedback || []).filter(feedback => feedback.user_id === user.id);
      setUserFeedbackHistory(userFeedback);
    } catch (error) {
      console.error('Error loading feedback history:', error);
    }
  };

  // Load recycling centers
  const loadRecyclingCenters = async () => {
    try {
      const centers = await supabaseApi.recyclingCenter.getAllCenters();
      setRecyclingCenters(centers || []);
    } catch (error) {
      console.error('Error loading recycling centers:', error);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const [notificationsResult, countResult] = await Promise.all([
        getUserNotifications(user.id, 20),
        getUnreadNotificationCount(user.id)
      ]);

      if (notificationsResult.success) {
        setDbNotifications(notificationsResult.data);
      }

      if (countResult.success) {
        setUnreadNotificationCount(countResult.count);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Test database connectivity
  const testDatabaseConnection = async () => {
    console.log('Testing database connection...');
    try {
      // Test basic connection with a simple query
      const testUser = await supabaseApi.auth.getCurrentUser();
      console.log('Database connection test - Current user:', testUser);
      
      // Test collection requests table access
      const testRequests = await supabaseApi.collection.getUserRequests(user?.id || 'test');
      console.log('Database connection test - Collection requests access:', testRequests !== undefined);
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      setError(`Database connection failed: ${error.message}`);
      return false;
    }
  };

  // Main dashboard data loading function
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test database connection first
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        console.log('Skipping data loading due to connection issues');
        return;
      }
      
      console.log('Loading dashboard data for user:', user?.id);
      
      await Promise.all([
        loadRequests(),
        loadAchievements(),
        loadEnhancedProfile(),
        loadUserSupportTickets(),
        loadMaterialTypes(),
        loadUserFeedbackHistory(),
        loadRecyclingCenters()
      ]);
      
      loadNotifications();
      
      console.log('Dashboard data loading completed');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      collected: 'bg-purple-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      in_progress: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      collected: 'Collected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      in_progress: 'In Progress'
    };
    return statusMap[status] || status;
  };

  // Helper function to generate user-friendly request numbers
  const getRequestDisplayNumber = (requestId, prefix = 'REQ') => {
    if (!requestId) return 'N/A';
    
    // For sample/demo requests, use simple numbers
    if (requestId.toString().startsWith('sample')) {
      const num = requestId.replace('sample-', '');
      return `${prefix}${num.padStart(3, '0')}`;
    }
    
    // For UUIDs, create a short meaningful number
    const numericPart = parseInt(requestId.toString().slice(-6), 16) % 999999;
    return `${prefix}${numericPart.toString().padStart(6, '0')}`;
  };

  // Helper function to get a short display version for UI badges
  const getShortRequestNumber = (requestId, prefix = 'REQ') => {
    if (!requestId) return 'N/A';
    
    if (requestId.toString().startsWith('sample')) {
      const num = requestId.replace('sample-', '');
      return `${prefix}${num}`;
    }
    
    const numericPart = parseInt(requestId.toString().slice(-4), 16) % 9999;
    return `${prefix}${numericPart}`;
  };

  // Navigation functions
  const handleLogout = async () => {
    try {
      await logout();
      addNotification('Logged out successfully!', 'success');
      navigate('/');
    } catch (error) {
      addNotification('Error logging out', 'error');
      console.error('Logout error:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load initial data when user is available
  useEffect(() => {
    console.log('🔄 PublicDashboard useEffect triggered');
    console.log('📋 Current user:', user);
    console.log('🎯 Active tab:', activeTab);
    console.log('📊 Current requests:', requests);
    console.log('📈 Current userStats:', userStats);
    
    if (user?.id) {
      console.log('✅ User ID found, loading dashboard data...');
      loadDashboardData();
      
      // Check if this is the first time visiting the dashboard
      const hasSeenWelcome = localStorage.getItem(`welcome_shown_${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcomePopup(true);
        localStorage.setItem(`welcome_shown_${user.id}`, 'true');
      }
    } else {
      console.log('❌ No user ID found, skipping data load');
    }
  }, [user?.id]);

  // Force refresh data when returning to overview tab
  useEffect(() => {
    if (activeTab === 'overview' && user?.id) {
      console.log('🔄 Returning to overview tab, refreshing data...');
      loadDashboardData();
    }
  }, [activeTab]);

  // Initialize edit profile form when modal opens or profile data changes
  useEffect(() => {
    if (showEditProfile || profileData) {
      setEditProfileForm({
        name: profileData.name || user?.name || '',
        phone: profileData.phone || user?.phone || '',
        district: profileData.district || '',
        area: profileData.area || '',
        defaultPickupAddress: profileData.defaultPickupAddress || user?.address || '',
        dateOfBirth: profileData.dateOfBirth || '',
        bio: profileData.bio || ''
      });
    }
  }, [showEditProfile, profileData, user]);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔄 Requests state changed:', {
      requestsLength: requests?.length || 0,
      requests: requests,
      safeRequestsLength: safeRequests?.length || 0,
      safeRequests: safeRequests
    });
  }, [requests]);

  useEffect(() => {
    console.log('🔄 Active tab changed to:', activeTab);
  }, [activeTab]);

  // Initialize empty arrays if data is not loaded yet
  const safeRequests = requests || [];
  const safeAchievements = achievements || [];
  const safeAllAchievements = allAchievements || [];

  // Test data creation function for debugging
  const createTestData = async () => {
    if (!user?.id) {
      console.log('❌ No user ID for creating test data');
      return;
    }

    console.log('🧪 Creating test data for user:', user.id);
    
    try {
      // Create a test collection request
      const testRequest = {
        user_id: user.id,
        item_types: ['Electronics', 'Batteries'],
        quantities: 'Electronics: 2, Batteries: 5',

        preferred_date: new Date().toISOString().split('T')[0],
        preferred_time: '10:00-12:00',
        contact_person: user.name || 'Test User',
        contact_phone: user.phone || '1234567890',
        address: user.address || '123 Test Street, Test City',
        pickup_floor: '2nd Floor',
        special_instructions: 'Test collection request created for debugging',
        status: 'pending'
      };

      console.log('📝 Creating test request:', testRequest);
      
      const result = await supabaseApi.collection.createRequest(testRequest);
      console.log('✅ Test request created:', result);
      
      setSuccessMessage('Test data created successfully!');
      
      // Reload data
      await loadDashboardData();
      
    } catch (error) {
      console.error('❌ Error creating test data:', error);
      setError(`Failed to create test data: ${error.message}`);
    }
  };

  // Loading state
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we load your personal dashboard...</p>
          </div>
      </div>
    );
  }

  // Get current tab title
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const tabTitle = currentTab?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
              notification.type === 'success' 
                ? 'bg-emerald-500/90 text-white border border-emerald-400' 
                : notification.type === 'warning'
                ? 'bg-yellow-500/90 text-white border border-yellow-400'
                : notification.type === 'info'
                ? 'bg-blue-500/90 text-white border border-blue-400'
                : 'bg-red-500/90 text-white border border-red-400'
            }`}
          >
            <span className="font-medium text-sm">{notification.message}</span>
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
        {/* Sidebar */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={{
            ...user,
            profile_picture_url: profileData.profilePictureUrl || user?.profile_picture_url
          }}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onGoHome={handleBackToHome}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Header - Only show in overview tab */}
          {activeTab === 'overview' && (
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Title Section */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-1">
                    {tabTitle}
                  </h1>

                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                  {/* Date Display - Aligned to right */}
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Today's Date</p>
                    <p className="text-white font-medium text-sm">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Notification Bell */}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}



        {/* Error Message */}
        {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300">
              <div className="flex items-center text-sm">
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
            {error}
                </div>
          </div>
        )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-300">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {successMessage}
              </div>
            </div>
          )}

        {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {METRIC_CONFIGS.map((config) => (
                  <MetricCard
                    key={config.key}
                    icon={config.icon}
                    value={config.key === 'sustainabilityContribution' ? `LKR ${(userStats[config.key] || 0).toFixed(2)}` : (userStats[config.key] || 0)}
                    label={config.label}
                    iconColor={config.iconColor}
                    iconBgColor={config.iconBgColor}
                  />
                ))}
              </div>

              {/* Recent Activity */}
              <MagicCard className="p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Requests</h3>
                {safeRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base lg:text-lg font-semibold text-white mb-2">No Requests Yet</h3>
                    <p className="text-gray-300 mb-6 text-sm lg:text-base">Start your eco-journey by submitting your first collection request!</p>
                    <div className="space-y-3">
                      <ShimmerButton onClick={() => setShowRequestForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Request
                      </ShimmerButton>
                      <div className="text-center">
                        <button
                          onClick={createTestData}
                          className="text-sm text-gray-400 hover:text-gray-300 underline"
                        >
                          🧪 Create Test Data (Debug)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safeRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="border border-slate-700 rounded-xl p-3 lg:p-4 bg-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`}></div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono font-bold">
                                {getShortRequestNumber(request.id)}
                              </span>
                              <h4 className="font-semibold text-white text-sm lg:text-base">Collection Request</h4>
                            </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                              request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              request.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {formatStatus(request.status)}
                          </span>
                        </div>
                          <p className="text-xs text-gray-400">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-300 text-xs lg:text-sm">
                          {Array.isArray(request.item_types) ? request.item_types.join(', ') : request.item_types || 'Mixed waste'} - {Array.isArray(request.items) ? request.items.reduce((count, item) => count + (item.quantity || 1), 0) : 'N/A'} items
                        </p>
                      </div>
                    ))}
                    {safeRequests.length > 3 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setActiveTab('requests')}
                          className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
                        >
                          View All Requests ({safeRequests.length})
                        </button>
                  </div>
                )}
                  </div>
                )}
              </MagicCard>
            </div>
          )}

          {/* My Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">My Collection Requests</h2>
                <ShimmerButton onClick={() => setShowRequestForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </ShimmerButton>
              </div>

              {safeRequests.length === 0 ? (
                <MagicCard className="p-8 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Collection Requests</h3>
                  <p className="text-gray-300 mb-6">You haven't submitted any collection requests yet. Start your eco-journey today!</p>
                  <div className="space-y-3">
                    <ShimmerButton onClick={() => setShowRequestForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Request
                    </ShimmerButton>
                    <div className="text-center">
                      <button
                        onClick={createTestData}
                        className="text-sm text-gray-400 hover:text-gray-300 underline"
                      >
                        🧪 Create Test Data (Debug)
                      </button>
                    </div>
                  </div>
                </MagicCard>
              ) : (
                <div className="grid gap-4">
                  {safeRequests.map((request) => (
                    <MagicCard key={request.id} className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div className="flex items-center space-x-3 mb-2 lg:mb-0">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(request.status)}`}></div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono font-bold">
                              {getShortRequestNumber(request.id)}
                            </span>
                            <h3 className="text-lg font-semibold text-white">Collection Request</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            request.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {formatStatus(request.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                          {request.preferred_date && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(request.preferred_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Items</h4>
                          <p className="text-white">
                            {Array.isArray(request.item_types) ? request.item_types.join(', ') : request.item_types || 'Mixed waste'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Total Items</h4>
                          <p className="text-white">
                            {Array.isArray(request.items) 
                              ? request.items.reduce((count, item) => count + (item.quantity || 1), 0)
                              : 'N/A'
                            } items
                          </p>
                        </div>
                        {request.address && (
                          <div className="lg:col-span-2">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Pickup Address</h4>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                              <p className="text-white">{request.address}</p>
                            </div>
                          </div>
                        )}
                        {request.special_instructions && (
                          <div className="lg:col-span-2">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Special Instructions</h4>
                            <p className="text-white">{request.special_instructions}</p>
                          </div>
                        )}
                      </div>

                      {request.collector && (
                        <div className="border-t border-slate-700 pt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Assigned Collector</h4>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {request.collector.name?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{request.collector.name || 'Collector'}</p>
                              {request.collector.phone && (
                                <div className="flex items-center text-sm text-gray-400">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {request.collector.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </MagicCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-6">Analytics</h2>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MagicCard className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{userStats.totalRequests}</p>
                  <p className="text-sm text-gray-300">Total Requests</p>
                </MagicCard>
                <MagicCard className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{userStats.completedRequests}</p>
                  <p className="text-sm text-gray-300">Completed</p>
                </MagicCard>
                <MagicCard className="p-4 text-center">
                  <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{userStats.totalItems}</p>
                                      <p className="text-sm text-gray-300">Items Recycled</p>
                </MagicCard>
                <MagicCard className="p-4 text-center">
                  <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">LKR {userStats.sustainabilityContribution.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Sustainability Fund</p>
                </MagicCard>
              </div>

              {/* Monthly Activity */}
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Activity</h3>
                {safeRequests.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      safeRequests.reduce((acc, req) => {
                        const month = new Date(req.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        });
                        acc[month] = (acc[month] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([month, count]) => (
                      <div key={month} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-white">{month}</span>
                        <span className="text-emerald-400 font-semibold">{count} requests</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-center py-8">No data available yet. Submit your first request to see analytics!</p>
                )}
              </MagicCard>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-6">Achievements</h2>
              
              {safeAchievements.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {safeAchievements.map((achievement) => (
                    <MagicCard key={achievement.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{achievement.title}</h3>
                          <p className="text-gray-300 text-sm">{achievement.description}</p>
                          <p className="text-emerald-400 text-xs mt-1">
                            Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </MagicCard>
                  ))}
                </div>
              ) : (
                <MagicCard className="p-8 text-center">
                  <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Achievements Yet</h3>
                  <p className="text-gray-300">Complete collection requests to unlock achievements!</p>
                </MagicCard>
              )}

              {/* Available Achievements */}
              {safeAllAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Available Achievements</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {safeAllAchievements
                      .filter(allAch => !safeAchievements.some(userAch => userAch.achievement_id === allAch.id))
                      .map((achievement) => (
                      <MagicCard key={achievement.id} className="p-6 opacity-60">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                            <Target className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-300">{achievement.title}</h3>
                            <p className="text-gray-400 text-sm">{achievement.description}</p>
                            <p className="text-gray-500 text-xs mt-1">Not earned yet</p>
                          </div>
                        </div>
                      </MagicCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Notifications</h2>
                {dbNotifications.length > 0 && (
                  <button
                    onClick={async () => {
                      const result = await markAllNotificationsAsRead(user.id);
                      if (result.success) {
                        loadNotifications();
                        addNotification('All notifications marked as read', 'success');
                      }
                    }}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {dbNotifications.length > 0 ? (
                <div className="space-y-3">
                  {dbNotifications.map((notification) => (
                    <MagicCard key={notification.id} className={`p-4 ${!notification.read ? 'border-l-4 border-emerald-500' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="text-white font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500 ml-2 mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-gray-300 mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-sm mt-2">{formatNotificationTime(notification.created_at)}</p>
                            
                            {/* Show additional data for reschedule notifications */}
                            {notification.type === 'reschedule' && notification.data && (
                              <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Original:</span>
                                    <span className="text-white ml-1">{notification.data.old_date} at {notification.data.old_time}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">New:</span>
                                    <span className="text-emerald-400 ml-1">{notification.data.new_date} at {notification.data.new_time}</span>
                                  </div>
                                  {notification.data.collector_name && (
                                    <div className="col-span-2">
                                      <span className="text-gray-400">Collector:</span>
                                      <span className="text-white ml-1">{notification.data.collector_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={async () => {
                                const result = await markNotificationAsRead(notification.id);
                                if (result.success) {
                                  loadNotifications();
                                }
                              }}
                              className="text-emerald-400 hover:text-emerald-300 text-sm"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              const result = await deleteNotification(notification.id);
                              if (result.success) {
                                loadNotifications();
                                addNotification('Notification deleted', 'success');
                              }
                            }}
                            className="text-gray-400 hover:text-red-400"
                            title="Delete notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </MagicCard>
                  ))}
                </div>
              ) : (
                <MagicCard className="p-8 text-center">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
                  <p className="text-gray-300">You're all caught up! We'll notify you when there are updates about your collections.</p>
                </MagicCard>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Profile</h2>
                <ShimmerButton onClick={() => setShowEditProfile(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </ShimmerButton>
              </div>
              
              {/* Profile Header Card */}
              <MagicCard className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border-4 border-emerald-500/20">
                      {profileData.profilePictureUrl || user?.profile_picture_url ? (
                        <img 
                          src={profileData.profilePictureUrl || user?.profile_picture_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl md:text-4xl font-bold">
                          {(profileData.name || user?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => document.getElementById('profile-picture-input').click()}
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                    <input
                      id="profile-picture-input"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const result = await supabaseApi.auth.uploadProfilePicture(user.id, file);
                            if (result.profilePictureUrl) {
                              // Update profile data state
                              setProfileData(prev => ({ ...prev, profilePictureUrl: result.profilePictureUrl }));
                              
                              // Update AuthContext user state to reflect changes in navbar
                              const profileUpdateResult = await updateProfile({ 
                                profile_picture_url: result.profilePictureUrl 
                              });
                              
                              if (profileUpdateResult.error) {
                                console.error('Failed to update user context:', profileUpdateResult.error);
                              }
                              
                              // Reload profile data
                              await loadEnhancedProfile();
                              
                              addNotification('Profile picture updated successfully!', 'success');
                            }
                          } catch (error) {
                            console.error('Error uploading profile picture:', error);
                            addNotification('Failed to upload profile picture', 'error');
                          } finally {
                            setUploading(false);
                          }
                        }
                      }}
                      className="hidden"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {profileData.name || user?.name || 'User'}
                    </h3>
                    <p className="text-gray-300 mb-3">{user?.email}</p>
                    
                    {/* Profile Completion */}
                    <div className="mb-4">
                      <div className="flex items-center justify-center md:justify-start mb-2">
                        <span className="text-sm text-gray-300 mr-2">Profile Completion</span>
                        <span className="text-sm font-semibold text-emerald-400">{profileCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-center md:justify-start space-x-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{userStats.totalRequests}</p>
                        <p className="text-xs text-gray-400">Requests</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400">{userStats.completedRequests}</p>
                        <p className="text-xs text-gray-400">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-400">{userStats.totalItems}</p>
                        <p className="text-xs text-gray-400">Items</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <MagicCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-emerald-400" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <p className="text-white mt-1">{profileData.name || user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Email</label>
                      <p className="text-white mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Phone Number</label>
                      <p className="text-white mt-1 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {profileData.phone || user?.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Date of Birth</label>
                      <p className="text-white mt-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </MagicCard>

                {/* Location Information */}
                <MagicCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-emerald-400" />
                    Location Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">District</label>
                      <p className="text-white mt-1">{profileData.district || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Area</label>
                      <p className="text-white mt-1">{profileData.area || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Default Pickup Address</label>
                      <p className="text-white mt-1">{profileData.defaultPickupAddress || user?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </MagicCard>

                {/* Bio Section */}
                {profileData.bio && (
                  <MagicCard className="p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-emerald-400" />
                      About Me
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{profileData.bio}</p>
                  </MagicCard>
                )}

                {/* Account Status */}
                <MagicCard className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Account Type</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                          {user?.role || 'PUBLIC'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Member Since</span>
                        <span className="text-white text-sm">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Status</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-6">Settings</h2>
              
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Change Password</p>
                      <p className="text-gray-400 text-sm">Update your account password</p>
                    </div>
                    <ShimmerButton onClick={() => setShowChangePassword(true)}>
                      Change
                    </ShimmerButton>
                  </div>
                </div>
              </MagicCard>

              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-white font-medium">Contact Support</p>
                      <p className="text-gray-400 text-sm">Get help with your account</p>
                    </div>
                    <ShimmerButton onClick={() => setShowContactSupport(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </ShimmerButton>
                  </div>
                </div>
              </MagicCard>
            </div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
          <div className="bg-gray-900 rounded-lg p-4 lg:p-6 relative max-h-[90vh] overflow-y-auto shadow-xl border border-gray-700">
              <button
                onClick={() => setShowRequestForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl z-10 bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                ×
              </button>
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-500"></div>
              </div>
            }>
              <RequestPickupForm onSuccess={async () => {
                setShowRequestForm(false);
                await loadDashboardData();
                setActiveTab('requests');
              }} />
            </Suspense>
            </div>
          </div>
        </div>
      )}

             {/* Change Password Modal */}
       {showChangePassword && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700/50">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-white">Change Password</h2>
               <button
                 onClick={() => {
                   setShowChangePassword(false);
                   setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                 }}
                 className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>

             <form onSubmit={async (e) => {
               e.preventDefault();
               if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                 setError('Passwords do not match');
                 return;
               }
               if (passwordForm.newPassword.length < 8) {
                 setError('Password must be at least 8 characters');
                 return;
               }
               
               try {
                 const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                 if (result.success) {
                   setShowChangePassword(false);
                   setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                   addNotification('Password changed successfully', 'success');
                 } else {
                   setError(result.error || 'Failed to change password');
                 }
               } catch (err) {
                 setError('Failed to change password');
               }
             }} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                 <input
                   type="password"
                   value={passwordForm.currentPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                   required
                   className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   placeholder="Enter current password"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                 <input
                   type="password"
                   value={passwordForm.newPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                   required
                   minLength={8}
                   className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   placeholder="Enter new password"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                 <input
                   type="password"
                   value={passwordForm.confirmPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                   required
                   className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   placeholder="Confirm new password"
                 />
               </div>

               <div className="flex space-x-4 pt-4">
                 <button
                   type="button"
                   onClick={() => {
                     setShowChangePassword(false);
                     setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                   }}
                   className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-medium"
                 >
                   Change Password
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

             {/* Contact Support Modal */}
       {showContactSupport && (
         <ContactSupportForm 
           isOpen={showContactSupport}
           onClose={() => setShowContactSupport(false)}
         />
       )}

             {/* Edit Profile Modal */}
       {showEditProfile && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
           <div className="w-full max-w-2xl my-8">
             <div className="bg-slate-900 rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-xl border border-gray-700/50">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                 <button
                   onClick={() => {
                     setShowEditProfile(false);
                     setEditProfileForm({
                       name: profileData.name || user?.name || '',
                       phone: profileData.phone || user?.phone || '',
                       district: profileData.district || '',
                       area: profileData.area || '',
                       defaultPickupAddress: profileData.defaultPickupAddress || user?.address || '',
                       dateOfBirth: profileData.dateOfBirth || '',
                       bio: profileData.bio || ''
                     });
                   }}
                   className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                 >
                   <X className="w-6 h-6" />
                 </button>
               </div>

               <form onSubmit={async (e) => {
                 e.preventDefault();
                 setLoading(true);
                 
                 try {
                   const updates = {
                     name: editProfileForm.name,
                     phone: editProfileForm.phone,
                     district: editProfileForm.district,
                     area: editProfileForm.area,
                     default_pickup_address: editProfileForm.defaultPickupAddress,
                     date_of_birth: editProfileForm.dateOfBirth || null,
                     bio: editProfileForm.bio
                   };
                   
                   const result = await updateProfile(updates);
                   if (result.user) {
                     setShowEditProfile(false);
                     await loadEnhancedProfile(); // Reload profile data
                     addNotification('Profile updated successfully', 'success');
                   } else {
                     setError(result.error || 'Failed to update profile');
                   }
                 } catch (err) {
                   setError('Failed to update profile');
                 } finally {
                   setLoading(false);
                 }
               }} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                     <input
                       type="text"
                       value={editProfileForm.name}
                       onChange={(e) => setEditProfileForm(prev => ({ ...prev, name: e.target.value }))}
                       className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       placeholder="Enter your full name"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                     <input
                       type="tel"
                       value={editProfileForm.phone}
                       onChange={(e) => setEditProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                       className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       placeholder="Enter your phone number"
                     />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">District</label>
                     <input
                       type="text"
                       value={editProfileForm.district}
                       onChange={(e) => setEditProfileForm(prev => ({ ...prev, district: e.target.value }))}
                       className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       placeholder="Enter your district"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Area</label>
                     <input
                       type="text"
                       value={editProfileForm.area}
                       onChange={(e) => setEditProfileForm(prev => ({ ...prev, area: e.target.value }))}
                       className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       placeholder="Enter your area"
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                   <input
                     type="date"
                     value={editProfileForm.dateOfBirth}
                     onChange={(e) => setEditProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                     className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Default Pickup Address</label>
                   <textarea
                     value={editProfileForm.defaultPickupAddress}
                     onChange={(e) => setEditProfileForm(prev => ({ ...prev, defaultPickupAddress: e.target.value }))}
                     rows={3}
                     className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                     placeholder="Enter your default pickup address"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                   <textarea
                     value={editProfileForm.bio}
                     onChange={(e) => setEditProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                     rows={3}
                     className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                     placeholder="Tell us about yourself"
                   />
                 </div>

                 <div className="flex space-x-4 pt-4">
                   <button
                     type="button"
                     onClick={() => {
                       setShowEditProfile(false);
                       setEditProfileForm({
                         name: profileData.name || user?.name || '',
                         phone: profileData.phone || user?.phone || '',
                         district: profileData.district || '',
                         area: profileData.area || '',
                         defaultPickupAddress: profileData.defaultPickupAddress || user?.address || '',
                         dateOfBirth: profileData.dateOfBirth || '',
                         bio: profileData.bio || ''
                       });
                     }}
                     className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     disabled={loading}
                     className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? 'Saving...' : 'Save Changes'}
                   </button>
                 </div>
               </form>
             </div>
           </div>
         </div>
       )}

       {/* Welcome Popup - First Time Login */}
       {showWelcomePopup && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-emerald-500/20">
             <div className="mb-6">
               <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               </div>
               <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                 Welcome To Your Profile
               </h2>
               <p className="text-gray-300 text-sm">
                 Hello {user?.name}! You're now part of the EcoTech community. Start your eco-friendly journey today!
               </p>
             </div>
             
             <div className="space-y-3">
               <button
                 onClick={() => setShowWelcomePopup(false)}
                 className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-medium"
               >
                 Get Started
               </button>
               <button
                 onClick={() => {
                   setShowWelcomePopup(false);
                   setActiveTab('profile');
                 }}
                 className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
               >
                 Complete Profile
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default PublicDashboard;

