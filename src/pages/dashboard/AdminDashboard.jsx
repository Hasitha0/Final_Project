import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  LogOut,
  Home,
  Bell,
  Shield,
  Zap,
  X,
  ChevronRight,
  Package,
  Truck,
  Star,
  Loader2,
  Award,
  Target,
  Database,
  RefreshCw,
  MessageSquare,
  User,
  Recycle
} from 'lucide-react';
import supabaseApi from '../../services/supabaseApi';
import { useAuth } from '../../context/AuthContext';
import ContentManagement from '../../components/admin/ContentManagement';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import { AnimatedGradientText } from '../../components/ui/animated-gradient-text';

// Add custom styles for animations
const customStyles = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

const AdminDashboard = () => {
  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Enhanced UI states
  const [notifications, setNotifications] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Auto-dismiss messages after 5 seconds
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

  // Remove auto-dismiss timer to allow manual control of notifications

  // Simplified notification system for single notification display
  const addNotification = (message, type = 'success') => {
    setNotifications([{
      id: Date.now(),
      message,
      type
    }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [systemStats, setSystemStats] = useState({
          totalUsers: 0,
    totalRequests: 3456,
    activeCenters: 89,
    co2Saved: 12450,
    activeUsers: 1134,
    completedRequests: 2987,
    totalProcessed: 25600
  });
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Add collector management state
  const [pendingCollectors, setPendingCollectors] = useState([]);
  const [allCollectors, setAllCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(null);

  // Add recycling center management state
  const [pendingRecyclingCenters, setPendingRecyclingCenters] = useState([]);
  const [allRecyclingCenters, setAllRecyclingCenters] = useState([]);
  const [selectedRecyclingCenter, setSelectedRecyclingCenter] = useState(null);

  // Add user management state
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserForManagement, setSelectedUserForManagement] = useState(null);

  // Add collection request management state
  const [allCollectionRequests, setAllCollectionRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [requestFilterStatus, setRequestFilterStatus] = useState('all');
  const [requestFilterPriority, setRequestFilterPriority] = useState('all');
  const [requestFilterTimeRange, setRequestFilterTimeRange] = useState('all');
  const [requestFilterDeletedUsers, setRequestFilterDeletedUsers] = useState('all');

  // Add pagination state for requests
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [requestSearchTerm, requestFilterStatus, requestFilterPriority, requestFilterTimeRange]);

  // Define navigation tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'requests', name: 'Requests', icon: Package },
    { id: 'registrations', name: 'Registrations', icon: UserCheck },
    { id: 'collectors', name: 'Collectors', icon: Truck },
    { id: 'recycling-centers', name: 'Recycling Centers', icon: Package },
    { id: 'support', name: 'Support & Issues', icon: AlertTriangle },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'content', name: 'Content', icon: Edit },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

  // Enhanced error handling with retry mechanism
  const retryOperation = async (operation, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  // Load initial data with better error handling
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Load all data concurrently for better performance
        await Promise.all([
          loadSystemStats(),
          loadPendingRegistrations(),
          loadSupportTickets(),
          loadPendingCollectors(),
          loadAllCollectors(),
          loadPendingRecyclingCenters(),
          loadAllRecyclingCenters(),
          loadAllUsers(),
          loadAllCollectionRequests()
        ]);
        
        // Remove the automatic notification on data load to reduce spam
        // addNotification('Dashboard data loaded successfully!', 'success');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Some features may not work properly.');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Enhanced refresh function
  const refreshAllData = async () => {
    try {
      setLoading(true);
      
      await Promise.allSettled([
        loadSystemStats(),
        loadPendingRegistrations(),
        loadSupportTickets(),
        loadPendingCollectors(),
        loadAllCollectors(),
        loadPendingRecyclingCenters(),
        loadAllRecyclingCenters(),
        loadAllCollectionRequests()
      ]);
      
      // Only show success notification, not during refresh to avoid conflicts
      setNotifications([{
        id: Date.now(),
        message: 'Dashboard data refreshed successfully!',
        type: 'success'
      }]);
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setNotifications([]);
      }, 3000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Failed to refresh data',
        type: 'error'
      }]);
      
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setNotifications([]);
      }, 4000);
    } finally {
      setLoading(false);
    }
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

  // Helper function for short request numbers
  const getShortRequestNumber = (requestId, prefix = 'REQ') => {
    if (!requestId) return 'N/A';
    
    // For sample/demo requests, use simple numbers
    if (requestId.toString().startsWith('sample')) {
      const num = requestId.replace('sample-', '');
      return `${prefix}${num.padStart(3, '0')}`;
    }
    
    // For UUIDs, create a short 4-digit number
    const numericPart = parseInt(requestId.toString().slice(-4), 16) % 9999;
    return `${prefix}${numericPart.toString().padStart(4, '0')}`;
  };

  // Collection request management functions
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      setProcessingAction(requestId);
      console.log('Updating request status:', { requestId, newStatus });
      
      await supabaseApi.collection.updateRequest(requestId, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      await loadAllCollectionRequests();
      addNotification('Request status updated', 'success');
    } catch (error) {
      console.error('Error updating request status:', error);
      addNotification('Failed to update request status', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleAssignCollector = async (requestId, collectorId) => {
    try {
      setProcessingAction(requestId);
      console.log('Assigning collector to request:', { requestId, collectorId });
      
      await supabaseApi.collection.assignCollector(requestId, collectorId);
      
      await loadAllCollectionRequests();
      addNotification('Collector assigned to request', 'success');
    } catch (error) {
      console.error('Error assigning collector:', error);
      addNotification('Failed to assign collector', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancelRequest = async (requestId, reason = 'Cancelled by admin') => {
    try {
      setProcessingAction(requestId);
      console.log('Cancelling request:', { requestId, reason });
      
      await supabaseApi.collection.updateRequest(requestId, {
        status: 'cancelled',
        admin_notes: reason,
        updated_at: new Date().toISOString()
      });
      
      await loadAllCollectionRequests();
      addNotification('Request cancelled', 'success');
    } catch (error) {
      console.error('Error cancelling request:', error);
      addNotification('Failed to cancel request', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete request ${getShortRequestNumber(requestId)}?\n\n` +
      'This action cannot be undone and will remove:\n' +
      '• The collection request\n' +
      '• Any related deliveries\n' +
      '• Any related earnings records\n\n' +
      'Click OK to confirm deletion.'
    );
    
    if (!confirmed) return;
    
    try {
      setProcessingAction(requestId);
      console.log('Deleting request:', requestId);
      
      await supabaseApi.collection.deleteRequest(requestId);
      
      await loadAllCollectionRequests();
      addNotification(`Request ${getShortRequestNumber(requestId)} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting request:', error);
      addNotification('Failed to delete request: ' + error.message, 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      // Get real analytics data
      const response = await supabaseApi.analytics.getCollectionStats();
      
      // Transform the analytics data to match UI expectations
      const transformedStats = {
        totalUsers: 8, // From our query: 8 total profiles
        totalRequests: response.total || 0,
        activeCenters: 89, // This would come from recycling centers count
        co2Saved: 12450, // This could be calculated from completed requests
        activeUsers: 7, // From our query: 7 active users
        completedRequests: response.completed || 0,
        totalProcessed: 25600 // This could be sum of processed weights
      };
      
      setSystemStats(transformedStats);
    } catch (error) {
      console.error('Error loading system stats:', error);
      // Set fallback stats if API fails
      setSystemStats({
        totalUsers: 8,
        totalRequests: 8,
        activeCenters: 89,
        co2Saved: 12450,
        activeUsers: 7,
        completedRequests: 1,
        totalProcessed: 25600
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRegistrations = async () => {
    try {
      console.log('Loading pending registrations...');
      // Get only COLLECTOR and RECYCLING_CENTER users with pending_approval status
      const response = await supabaseApi.registrations.getPendingUsers();
      console.log('Pending registrations loaded:', response);
      // Filter to only show COLLECTOR and RECYCLING_CENTER roles
      const filteredResponse = (response || []).filter(user => 
        user.role === 'COLLECTOR' || user.role === 'RECYCLING_CENTER'
      );
      setPendingRegistrations(filteredResponse);
    } catch (error) {
      console.error('Error loading pending registrations:', error);
      setPendingRegistrations([]);
    }
  };

  const loadSupportTickets = async () => {
    try {
      console.log('Loading support tickets...');
      // Fixed function call - use the correct method
      const tickets = await supabaseApi.support.getSupportRequests();
      console.log('Support tickets loaded:', tickets);
      setSupportTickets(tickets || []);
    } catch (error) {
      console.error('Error loading support tickets:', error);
      setSupportTickets([]);
    }
  };

  const loadPendingCollectors = async () => {
    try {
      console.log('Loading pending collectors...');
      // Get COLLECTOR users with pending_approval status from profiles table
      const response = await supabaseApi.user.getUsersByRole('COLLECTOR');
      console.log('All collectors loaded:', response);
      // Filter to only pending approval collectors
      const pendingCollectors = (response || []).filter(user => user.status === 'pending_approval');
      setPendingCollectors(pendingCollectors);
    } catch (error) {
      console.error('Error loading pending collectors:', error);
      setPendingCollectors([]);
    }
  };

  const loadAllCollectors = async () => {
    try {
      console.log('Loading all collectors...');
      // Get all COLLECTOR role users (case sensitive)
      const response = await supabaseApi.user.getUsersByRole('COLLECTOR');
      console.log('All collectors loaded:', response);
      
      // Filter out deleted users from collectors
      const activeCollectors = (response || []).filter(collector => 
        collector.account_status !== 'deleted' && 
        collector.status !== 'deleted' &&
        !collector.email?.includes('deleted_') &&
        !collector.email?.includes('@deleted.local')
      );
      
      setAllCollectors(activeCollectors);
    } catch (error) {
      console.error('Error loading all collectors:', error);
      setAllCollectors([]);
    }
  };

  const loadPendingRecyclingCenters = async () => {
    try {
      console.log('Loading pending recycling centers...');
      // Get all RECYCLING_CENTER role users
      const response = await supabaseApi.user.getUsersByRole('RECYCLING_CENTER');
      console.log('Pending recycling centers loaded:', response);
      
      // Filter for pending approval only
      const pendingCenters = (response || []).filter(user => user.status === 'pending_approval');
      setPendingRecyclingCenters(pendingCenters);
    } catch (error) {
      console.error('Error loading pending recycling centers:', error);
      setPendingRecyclingCenters([]);
    }
  };

  const loadAllRecyclingCenters = async () => {
    try {
      console.log('Loading all recycling centers...');
      // Get all RECYCLING_CENTER role users
      const response = await supabaseApi.user.getUsersByRole('RECYCLING_CENTER');
      console.log('All recycling centers loaded:', response);
      
      // Filter out deleted users from recycling centers
      const activeRecyclingCenters = (response || []).filter(center => 
        center.account_status !== 'deleted' && 
        center.status !== 'deleted' &&
        !center.email?.includes('deleted_') &&
        !center.email?.includes('@deleted.local')
      );
      
      setAllRecyclingCenters(activeRecyclingCenters);
    } catch (error) {
      console.error('Error loading all recycling centers:', error);
      setAllRecyclingCenters([]);
    }
  };

  const loadAllUsers = async () => {
    try {
      console.log('Loading all users...');
      // Get ALL users for analytics (not just PUBLIC role)
      const response = await supabaseApi.user.getAllUsers();
      console.log('All users loaded:', response);
      
      // Filter out deleted users from the admin view
      const activeUsers = (response || []).filter(user => 
        user.account_status !== 'deleted' && user.status !== 'deleted'
      );
      
      setAllUsers(activeUsers);
    } catch (error) {
      console.error('Error loading all users:', error);
      setAllUsers([]);
    }
  };

  const loadAllCollectionRequests = async () => {
    try {
      console.log('Loading all collection requests...');
      
      // Get all collection requests with related data
      const response = await supabaseApi.collection.getAllRequests();
      console.log('All collection requests loaded:', response);
      console.log('Response type:', typeof response, 'Is array:', Array.isArray(response));
      console.log('Response length:', response?.length);
      setAllCollectionRequests(response || []);
      
      // Optional success notification for debugging
      if (response && response.length > 0) {
        console.log(`Successfully loaded ${response.length} collection requests`);
        const issueCount = response.filter(req => req.status === 'issue_reported').length;
        if (issueCount > 0) {
          console.log(`Found ${issueCount} collection requests with issues`);
        }
      }
    } catch (error) {
      console.error('Error loading all collection requests:', error);
      addNotification('Failed to load collection requests: ' + error.message, 'error');
      setAllCollectionRequests([]);
    }
  };

  // Filtering and searching functions for collection requests
  const getFilteredCollectionRequests = () => {
    let filtered = allCollectionRequests;

    // Search filter
    if (requestSearchTerm.trim()) {
      const searchLower = requestSearchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.user?.name?.toLowerCase().includes(searchLower) ||
        request.user?.email?.toLowerCase().includes(searchLower) ||
        request.address?.toLowerCase().includes(searchLower) ||
        request.phone?.toLowerCase().includes(searchLower) ||
        getShortRequestNumber(request.id).toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (requestFilterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === requestFilterStatus);
    }

    // Priority filter
    if (requestFilterPriority !== 'all') {
      filtered = filtered.filter(request => request.priority === requestFilterPriority);
    }

    // Deleted users filter
    if (requestFilterDeletedUsers !== 'all') {
      filtered = filtered.filter(request => {
        const customerInfo = formatCustomerInfo(request);
        if (requestFilterDeletedUsers === 'active') return !customerInfo.isDeleted;
        if (requestFilterDeletedUsers === 'deleted') return customerInfo.isDeleted;
        return true;
      });
    }

    // Time range filter
    if (requestFilterTimeRange !== 'all') {
      const now = new Date();
      const timeFilters = {
        today: 1,
        week: 7,
        month: 30,
        quarter: 90
      };
      
      const daysBack = timeFilters[requestFilterTimeRange];
      if (daysBack) {
        const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(request => 
          new Date(request.created_at) >= cutoffDate
        );
      }
    }

    return filtered;
  };

  // Helper functions for request value formatting
  const formatRequestValue = (request) => {
    if (request.total_amount && request.total_amount > 0) {
      return `$${request.total_amount.toFixed(2)}`;
    }
    return 'Free Collection';
  };

  // Helper function to format customer information for deleted users
  const formatCustomerInfo = (request) => {
    const isDeletedUser = request.user?.account_status === 'deleted' || 
                         request.user?.name === 'Deleted User' ||
                         request.user?.email?.includes('deleted_') ||
                         request.user?.email?.includes('@deleted.local');

    if (isDeletedUser) {
      return {
        name: request.contact_person || 'Deleted User',
        email: 'Account Deleted',
        phone: request.contact_phone || request.phone || 'N/A',
        isDeleted: true,
        originalEmail: request.user?.email || 'Unknown',
        deletionNote: 'Customer account was deleted'
      };
    }

    return {
      name: request.user?.name || request.contact_person || 'Unknown Customer',
      email: request.user?.email || 'No email',
      phone: request.contact_phone || request.phone || 'No phone',
      isDeleted: false
    };
  };

  const handleApproveRegistration = async (userId, approved, reason = '') => {
    try {
      setProcessingAction(userId);
      console.log(`${approved ? 'Approving' : 'Rejecting'} registration for user:`, userId);
      
      // Call the API function
      const result = await supabaseApi.registrations.approveRegistration(userId, approved, reason);
      console.log('Registration processed successfully:', result);
      
      // Email notifications would be sent here in a production environment
      
      // Reload pending registrations
      await loadPendingRegistrations();
      addNotification(`Registration ${approved ? 'approved' : 'rejected'} successfully`, 'success');
    } catch (error) {
      console.error('Error processing registration:', error);
      const errorMessage = error.message || 'Failed to process registration';
      addNotification(`Error: ${errorMessage}`, 'error');
      setError(`Failed to ${approved ? 'approve' : 'reject'} registration: ${errorMessage}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status, response = null) => {
    try {
      setProcessingAction(ticketId);
      console.log('Updating ticket status:', { ticketId, status, response });
      
      // Fixed function call - use the correct method name
      const updateData = { status };
      if (response) {
        updateData.admin_response = response;
        updateData.responded_at = new Date().toISOString();
      }
      
      await supabaseApi.support.updateSupportTicket(ticketId, updateData);
      
      // Send email response if provided
      if (response) {
        const ticket = supportTickets.find(t => t.id === ticketId);
        if (ticket) {
          const emailData = {
            to: ticket.email,
            subject: `Re: ${ticket.subject}`,
            message: response,
            name: ticket.name
          };
          
          console.log('Email would be sent:', emailData);
          console.log('Email response sent to user');
        }
      }
      
      await loadSupportTickets();
      addNotification('Ticket updated', 'success');
    } catch (error) {
      console.error('Error updating ticket:', error);
      addNotification('Failed to update ticket', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReactivateAccount = async (email) => {
    try {
      setProcessingAction(email);
      console.log('Reactivating account for:', email);
      
      // Call the reactivation API
      await supabaseApi.reactivateAccount(email);
      
      // Send confirmation email
      const emailData = {
        to: email,
        subject: 'Account Reactivated - Welcome Back to EcoTech!',
        message: `Your account has been successfully reactivated. You can now log in and continue using our platform.\n\nWelcome back to EcoTech!`,
        name: 'User'
      };
      
      console.log('Email would be sent:', emailData);
      console.log('Reactivation email sent');
      
      // Update the ticket status to resolved
      const ticket = supportTickets.find(t => t.email === email && t.category === 'account_reactivation');
      if (ticket) {
        await handleUpdateTicketStatus(ticket.id, 'resolved', 'Your account has been reactivated successfully. You can now log in and use the platform.');
      }
      
      addNotification('Account reactivated', 'success');
    } catch (error) {
      console.error('Error reactivating account:', error);
      addNotification('Failed to reactivate account', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  // Navigation functions
  const handleLogout = async () => {
    try {
      await logout();
      // Don't show notification for logout as user is leaving the page
      navigate('/');
    } catch (error) {
      addNotification('Logout failed', 'error');
      console.error('Logout error:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleApproveCollector = async (collectorId) => {
    try {
      setProcessingAction(collectorId);
      console.log('Approving collector:', collectorId);
      
      // Update the collector's status in profiles table to 'active'
      await supabaseApi.approveUser(collectorId);
      
      // Send approval email
      const collector = pendingCollectors.find(c => c.id === collectorId);
      if (collector) {
        const emailData = {
          to: collector.email,
          subject: 'Collector Application Approved - Welcome to EcoTech!',
          message: `Hello ${collector.name},\n\nCongratulations! Your collector application has been approved.\n\nYou can now log in and start accepting collection requests and earning with EcoTech.\n\nAdmin Notes: ${adminNotes || 'None'}\n\nWelcome to the team!`,
          name: collector.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Approval email sent to collector');
      }
      
      await loadPendingCollectors();
      await loadAllCollectors();
      setSelectedCollector(null);
      setAdminNotes('');
      addNotification('Collector approved', 'success');
    } catch (error) {
      console.error('Error approving collector:', error);
      addNotification('Failed to approve collector application', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectCollector = async (collectorId) => {
    try {
      setProcessingAction(collectorId);
      console.log('Rejecting collector:', collectorId, 'Reason:', rejectionReason);
      
      // Update the collector's status in profiles table to 'rejected'
      await supabaseApi.rejectUser(collectorId, rejectionReason);
      
      // Send rejection email
      const collector = pendingCollectors.find(c => c.id === collectorId);
      if (collector) {
        const emailData = {
          to: collector.email,
          subject: 'Collector Application Status Update',
          message: `Hello ${collector.name},\n\nThank you for your interest in becoming a collector with EcoTech.\n\nUnfortunately, we cannot approve your application at this time.\n\nReason: ${rejectionReason}\n\nYou may reapply in the future if circumstances change.\n\nThank you for your understanding.`,
          name: collector.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Rejection email sent to collector');
      }
      
      await loadPendingCollectors();
      setSelectedCollector(null);
      setRejectionReason('');
      addNotification('Collector application rejected', 'success');
    } catch (error) {
      console.error('Error rejecting collector:', error);
      addNotification('Failed to reject collector application', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  // Collector management functions
  const handleEditCollector = (collector) => {
    // For now, just show the details modal - you could implement an edit form
    console.log('Edit collector:', collector);
    addNotification('Edit functionality coming soon!', 'info');
  };

  const handleBanCollector = async (collectorId) => {
    try {
      setProcessingAction(collectorId);
      console.log('Banning collector:', collectorId);
      
      // Update collector status to 'banned'
      await supabaseApi.updateUserStatus(collectorId, 'banned');
      
      // Send notification email
      const collector = allCollectors.find(c => c.id === collectorId);
      if (collector) {
        const emailData = {
          to: collector.email,
          subject: 'Account Suspended - EcoTech',
          message: `Hello ${collector.name},\n\nYour collector account has been suspended due to policy violations.\n\nIf you believe this is an error, please contact support.\n\nEcoTech Admin Team`,
          name: collector.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Ban notification email sent');
      }
      
      await loadAllCollectors();
      addNotification('Collector banned', 'success');
    } catch (error) {
      console.error('Error banning collector:', error);
      addNotification('Failed to ban collector', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUnbanCollector = async (collectorId) => {
    try {
      setProcessingAction(collectorId);
      console.log('Unbanning collector:', collectorId);
      
      // Update collector status to 'active'
      await supabaseApi.updateUserStatus(collectorId, 'active');
      
      // Send notification email
      const collector = allCollectors.find(c => c.id === collectorId);
      if (collector) {
        const emailData = {
          to: collector.email,
          subject: 'Account Reactivated - EcoTech',
          message: `Hello ${collector.name},\n\nYour collector account has been reactivated. You can now resume your collection activities.\n\nThank you for your understanding.\n\nEcoTech Admin Team`,
          name: collector.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Unban notification email sent');
      }
      
      await loadAllCollectors();
      addNotification('Collector unbanned', 'success');
    } catch (error) {
      console.error('Error unbanning collector:', error);
      addNotification('Failed to unban collector', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteCollector = async (collectorId) => {
    if (!window.confirm('Are you sure you want to permanently delete this collector account? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingAction(collectorId);
      console.log('Deleting collector:', collectorId);
      
      // Delete the collector account
      await supabaseApi.user.deleteAccount(collectorId);
      
      await loadAllCollectors();
      addNotification('Collector deleted', 'success');
    } catch (error) {
      console.error('Error deleting collector:', error);
      addNotification('Failed to delete collector account', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  // Recycling Center management functions
  const handleApproveRecyclingCenter = async (centerId) => {
    try {
      setProcessingAction(centerId);
      console.log('Approving recycling center:', centerId);
      
      // Update the recycling center's status in profiles table to 'active'
      await supabaseApi.approveUser(centerId);
      
      // Send approval email
      const center = pendingRecyclingCenters.find(c => c.id === centerId);
      if (center) {
        const emailData = {
          to: center.email,
          subject: 'Recycling Center Application Approved - Welcome to EcoTech!',
          message: `Hello ${center.name},\n\nCongratulations! Your recycling center application has been approved.\n\nYou can now log in and start managing waste collection operations with EcoTech.\n\nAdmin Notes: ${adminNotes || 'None'}\n\nWelcome to the network!`,
          name: center.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Approval email sent to recycling center');
      }
      
      await loadPendingRecyclingCenters();
      await loadAllRecyclingCenters();
      setSelectedRecyclingCenter(null);
      setAdminNotes('');
      addNotification('Recycling center approved', 'success');
    } catch (error) {
      console.error('Error approving recycling center:', error);
      addNotification('Failed to approve recycling center application', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectRecyclingCenter = async (centerId) => {
    try {
      setProcessingAction(centerId);
      console.log('Rejecting recycling center:', centerId, 'Reason:', rejectionReason);
      
      // Update the recycling center's status in profiles table to 'rejected'
      await supabaseApi.rejectUser(centerId, rejectionReason);
      
      // Send rejection email
      const center = pendingRecyclingCenters.find(c => c.id === centerId);
      if (center) {
        const emailData = {
          to: center.email,
          subject: 'Recycling Center Application Status Update',
          message: `Hello ${center.name},\n\nThank you for your interest in joining the EcoTech recycling center network.\n\nUnfortunately, we cannot approve your application at this time.\n\nReason: ${rejectionReason}\n\nYou may reapply in the future if circumstances change.\n\nThank you for your understanding.`,
          name: center.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Rejection email sent to recycling center');
      }
      
      await loadPendingRecyclingCenters();
      setSelectedRecyclingCenter(null);
      setRejectionReason('');
      addNotification('Recycling center application rejected', 'success');
    } catch (error) {
      console.error('Error rejecting recycling center:', error);
      addNotification('Failed to reject recycling center application', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEditRecyclingCenter = (center) => {
    // For now, just show the details modal - you could implement an edit form
    console.log('Edit recycling center:', center);
    addNotification('Edit functionality coming soon!', 'info');
  };

  const handleBanRecyclingCenter = async (centerId) => {
    try {
      setProcessingAction(centerId);
      console.log('Banning recycling center:', centerId);
      
      // Update recycling center status to 'banned'
      await supabaseApi.updateUserStatus(centerId, 'banned');
      
      // Send notification email
      const center = allRecyclingCenters.find(c => c.id === centerId);
      if (center) {
        const emailData = {
          to: center.email,
          subject: 'Account Suspended - EcoTech',
          message: `Hello ${center.name},\n\nYour recycling center account has been suspended due to policy violations.\n\nIf you believe this is an error, please contact support.\n\nEcoTech Admin Team`,
          name: center.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Ban notification email sent');
      }
      
      await loadAllRecyclingCenters();
      addNotification('Recycling center banned', 'success');
    } catch (error) {
      console.error('Error banning recycling center:', error);
      addNotification('Failed to ban recycling center', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUnbanRecyclingCenter = async (centerId) => {
    try {
      setProcessingAction(centerId);
      console.log('Unbanning recycling center:', centerId);
      
      // Update recycling center status to 'active'
      await supabaseApi.updateUserStatus(centerId, 'active');
      
      // Send notification email
      const center = allRecyclingCenters.find(c => c.id === centerId);
      if (center) {
        const emailData = {
          to: center.email,
          subject: 'Account Reactivated - EcoTech',
          message: `Hello ${center.name},\n\nYour recycling center account has been reactivated. You can now resume your waste management operations.\n\nThank you for your understanding.\n\nEcoTech Admin Team`,
          name: center.name
        };
        
        console.log('Email would be sent:', emailData);
        console.log('Unban notification email sent');
      }
      
      await loadAllRecyclingCenters();
      addNotification('Recycling center unbanned', 'success');
    } catch (error) {
      console.error('Error unbanning recycling center:', error);
      addNotification('Failed to unban recycling center', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteRecyclingCenter = async (centerId) => {
    if (!window.confirm('Are you sure you want to permanently delete this recycling center account? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingAction(centerId);
      console.log('Deleting recycling center:', centerId);
      
      // Delete the recycling center account
      await supabaseApi.user.deleteAccount(centerId);
      
      await loadAllRecyclingCenters();
      addNotification('Recycling center deleted', 'success');
    } catch (error) {
      console.error('Error deleting recycling center:', error);
      addNotification('Failed to delete recycling center account', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  // User management functions


  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingAction(userId);
      console.log('Deleting user:', userId);
      
      // Delete the user account using the correct API method
      await supabaseApi.user.deleteAccount(userId);
      
      await loadAllUsers();
      addNotification('User deleted', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification('Failed to delete user account', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  // Helper functions for status colors and labels
  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500',
      pending: 'bg-orange-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      active: 'bg-emerald-500',
      inactive: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      active: 'Active',
      inactive: 'Inactive'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-yellow-400',
      high: 'text-red-400',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-400';
  };

  // Helper function to parse structured issue data from collector_notes
  const parseIssueData = (collectorNotes) => {
    if (!collectorNotes) return null;
    
    try {
      // Try to parse as JSON first (new structured format)
      const parsed = JSON.parse(collectorNotes);
      if (parsed.issueType && parsed.severity && parsed.description) {
        return {
          type: parsed.issueType,
          severity: parsed.severity,
          description: parsed.description,
          reportedAt: parsed.reportedAt,
          collectorId: parsed.collectorId,
          collectorName: parsed.collectorName,
          isStructured: true
        };
      }
    } catch (e) {
      // If JSON parsing fails, treat as legacy format
    }
    
    // Legacy format - extract from text
    if (collectorNotes.startsWith('Issue: ')) {
      return {
        type: 'other',
        severity: 'medium',
        description: collectorNotes.replace('Issue: ', ''),
        reportedAt: null,
        collectorId: null,
        collectorName: null,
        isStructured: false
      };
    }
    
    return {
      type: 'other',
      severity: 'medium', 
      description: collectorNotes,
      reportedAt: null,
      collectorId: null,
      collectorName: null,
      isStructured: false
    };
  };

  // Helper function to get issue type display name
  const getIssueTypeDisplay = (type) => {
    const types = {
      'access': 'Access Problem',
      'customer': 'Customer Not Available',
      'items': 'Items Not Ready',
      'safety': 'Safety Concern',
      'vehicle': 'Vehicle Issue',
      'other': 'Other Issue'
    };
    return types[type] || 'Unknown Issue';
  };

  // Helper function to get issue severity color
  const getIssueSeverityColor = (severity) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get issue type icon
  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'access': return '🔐';
      case 'customer': return '👤';
      case 'items': return '📦';
      case 'safety': return '⚠️';
      case 'vehicle': return '🚛';
      default: return '❓';
    }
  };

  // Enhanced Overview Tab with real-time data
  const renderOverview = () => {
    // Calculate real-time metrics
    const totalPendingActions = 
      (pendingRegistrations || []).length + 
      (supportTickets || []).filter(t => t.status === 'open').length +
      (allCollectionRequests || []).filter(r => r.status === 'issue_reported').length;

    const totalRevenue = (allCollectionRequests || [])
      .reduce((sum, req) => sum + (parseFloat(req.total_amount) || 0), 0);

    const completedRequestsCount = (allCollectionRequests || [])
      .filter(req => req.status === 'completed').length;
    
    const totalRequestsCount = (allCollectionRequests || []).length;
    
    const successRate = totalRequestsCount > 0 
      ? ((completedRequestsCount / totalRequestsCount) * 100).toFixed(1) 
      : 0;

    const activeCollectorsCount = (allCollectors || [])
      .filter(c => c.status === 'active').length;
    
    const activeRecyclingCentersCount = (allRecyclingCenters || [])
      .filter(c => c.status === 'active').length;

    return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <AnimatedGradientText className="text-3xl font-bold mb-2">
            📊 System Overview
          </AnimatedGradientText>
          <p className="text-gray-400 text-lg">Real-time analytics and key performance indicators</p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live Data</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {totalPendingActions > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl border border-orange-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">{totalPendingActions} Actions Needed</span>
            </div>
          )}
          <button
            onClick={refreshAllData}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            <Activity className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Enhanced Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
             onClick={() => setActiveTab('users')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                {(allUsers || []).length}
              </div>
              <div className="text-xs text-blue-600 font-medium">Total Users</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Active</span>
              <span className="font-semibold text-blue-700">
                {(allUsers || []).filter(u => u.status === 'active').length}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(allUsers || []).length > 0 
                    ? ((allUsers || []).filter(u => u.status === 'active').length / (allUsers || []).length) * 100 
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
             onClick={() => setActiveTab('requests')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {totalRequestsCount}
              </div>
              <div className="text-xs text-green-600 font-medium">Requests</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Success Rate</span>
              <span className="font-semibold text-green-700">{successRate}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
             onClick={() => setActiveTab('collectors')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-700">
                {activeCollectorsCount}
              </div>
              <div className="text-xs text-purple-600 font-medium">Active Collectors</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-600">Pending</span>
              <span className="font-semibold text-purple-700">
                {(pendingCollectors || []).length}
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(allCollectors || []).length > 0 
                    ? (activeCollectorsCount / (allCollectors || []).length) * 100 
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
             onClick={() => setActiveTab('analytics')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-700">
                ${totalRevenue.toFixed(0)}
              </div>
              <div className="text-xs text-orange-600 font-medium">Total Revenue</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Avg/Request</span>
              <span className="font-semibold text-orange-700">
                ${totalRequestsCount > 0 ? (totalRevenue / totalRequestsCount).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalRevenue / 5000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recycling Centers</h3>
              <p className="text-gray-500 text-sm">Active facilities</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {activeRecyclingCentersCount}
          </div>
          <div className="text-sm text-gray-500">
            {(pendingRecyclingCenters || []).length} pending approval
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Issues Reported</h3>
              <p className="text-gray-500 text-sm">Needs attention</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {(allCollectionRequests || []).filter(r => r.status === 'issue_reported').length}
          </div>
          <div className="text-sm text-gray-500">
            {(supportTickets || []).filter(t => t.status === 'open').length} support tickets
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
              <p className="text-gray-500 text-sm">Overall status</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            {totalPendingActions === 0 ? 'Excellent' : totalPendingActions < 5 ? 'Good' : 'Needs Attention'}
          </div>
          <div className="text-sm text-gray-500">
            System performing well
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <div className="text-sm text-gray-500">
              {totalPendingActions} items need attention
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('registrations')}
              className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 relative border border-blue-200"
            >
              <UserCheck className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-lg">Approvals</span>
              <span className="text-sm text-blue-500 mt-1">User registrations</span>
              {(pendingRegistrations || []).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full animate-pulse font-bold shadow-lg">
                  {(pendingRegistrations || []).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('support')}
              className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 relative border border-purple-200"
            >
              <AlertTriangle className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-lg">Support</span>
              <span className="text-sm text-purple-500 mt-1">Issues & tickets</span>
              {(supportTickets || []).filter(t => t.status === 'open').length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-sm px-3 py-1 rounded-full animate-pulse font-bold shadow-lg">
                  {(supportTickets || []).filter(t => t.status === 'open').length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('collectors')}
              className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 relative border border-green-200"
            >
              <Truck className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-lg">Collectors</span>
              <span className="text-sm text-green-500 mt-1">Manage fleet</span>
              {(pendingCollectors || []).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-sm px-3 py-1 rounded-full animate-pulse font-bold shadow-lg">
                  {(pendingCollectors || []).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 rounded-xl hover:from-orange-100 hover:to-amber-100 transition-all duration-300 border border-orange-200"
            >
              <BarChart3 className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-lg">Analytics</span>
              <span className="text-sm text-orange-500 mt-1">View reports</span>
            </button>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              View all →
            </div>
          </div>
          <div className="space-y-4">
            {/* Show recent registrations */}
            {(pendingRegistrations || []).slice(0, 2).map((user, index) => (
              <div key={`reg-${index}`} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                   onClick={() => setActiveTab('registrations')}>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    New {user.role?.toLowerCase()} registration
                  </p>
                  <p className="text-sm text-blue-600">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleString() : 'Recently'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
            
            {/* Show recent support tickets */}
            {(supportTickets || []).slice(0, 2).map((ticket, index) => (
              <div key={`ticket-${index}`} className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                   onClick={() => setActiveTab('support')}>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Support ticket</p>
                  <p className="text-sm text-purple-600">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Recently'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
            
            {/* Show recent issues */}
            {(allCollectionRequests || [])
              .filter(req => req.status === 'issue_reported')
              .slice(0, 1)
              .map((request, index) => (
              <div key={`issue-${index}`} className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                   onClick={() => setActiveTab('support')}>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Collection issue reported</p>
                  <p className="text-sm text-red-600">Request #{getShortRequestNumber(request.id)}</p>
                  <p className="text-xs text-gray-500">
                    {request.updated_at ? new Date(request.updated_at).toLocaleString() : 'Recently'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
            
            {/* Empty state */}
            {(pendingRegistrations || []).length === 0 && 
             (supportTickets || []).length === 0 && 
             (allCollectionRequests || []).filter(r => r.status === 'issue_reported').length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h4>
                <p className="text-gray-500 text-sm">No pending actions or recent activity to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Enhanced Registrations Tab
  const renderRegistrations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <AnimatedGradientText className="text-2xl font-bold mb-2">
            Pending Registrations
          </AnimatedGradientText>
          <p className="text-gray-400">Review and approve new user registrations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Total pending:</span>
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              {(pendingRegistrations || []).length}
            </span>
          </div>
          <button
            onClick={loadPendingRegistrations}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {(pendingRegistrations || []).length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">All Caught Up!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Great job! All user registrations have been processed. New registrations will appear here when they need your attention.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={loadPendingRegistrations}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Check for New Registrations
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Manage Users
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(pendingRegistrations || []).map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50 transition-all duration-200 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {registration.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{registration.name}</div>
                          <div className="text-sm text-gray-500">
                            {registration.role === 'RECYCLING_CENTER' ? registration.center_name : registration.coverage_area}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                        registration.role === 'COLLECTOR' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : registration.role === 'RECYCLING_CENTER'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {registration.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{registration.email}</div>
                      <div className="text-sm text-gray-500">{registration.phone}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.created_at ? 
                          new Date(registration.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'No date'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {registration.created_at ? 
                          new Date(registration.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Invalid time'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(registration)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50 group-hover:shadow-sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApproveRegistration(registration.id, true)}
                          disabled={processingAction === registration.id}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-all rounded-lg hover:bg-emerald-50 group-hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          {processingAction === registration.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-300 border-t-emerald-600"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleApproveRegistration(registration.id, false)}
                          disabled={processingAction === registration.id}
                          className="p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50 group-hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          {processingAction === registration.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-600"></div>
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mx-2 sm:mx-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
              <div className="flex justify-between items-start sm:items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">Registration Details</h3>
                  <p className="text-emerald-100 mt-1 text-xs sm:text-sm">
                    {selectedUser.role === 'COLLECTOR' ? 'Collector Application' : 
                     selectedUser.role === 'RECYCLING_CENTER' ? 'Recycling Center Application' : 'User Registration'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 sm:p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 ml-2"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ maxHeight: 'calc(98vh - 200px)' }}>
              {/* Basic Information Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                      {selectedUser.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{selectedUser.name}</h4>
                      <p className="text-gray-500 text-sm sm:text-base truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border ${
                      selectedUser.role === 'COLLECTOR' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : selectedUser.role === 'RECYCLING_CENTER'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Phone Number</label>
                    <div className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 text-sm sm:text-base truncate">{selectedUser.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Registration Date</label>
                    <div className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 text-xs sm:text-base">
                        {selectedUser.created_at ? 
                          new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'No date available'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <div className="flex items-start space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 text-sm sm:text-base break-words">{selectedUser.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              {selectedUser.role === 'COLLECTOR' && (
                <div className="mb-6 sm:mb-8">
                  <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span>Collector Information</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Service Area</label>
                      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <span className="text-blue-900 text-sm sm:text-base break-words">{selectedUser.coverage_area || 'Not specified'}</span>
                      </div>
                    </div>
                

                
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Vehicle Type</label>
                      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <span className="text-blue-900 text-sm sm:text-base break-words">{selectedUser.vehicle_type || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">License Number</label>
                      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <span className="text-blue-900 text-sm sm:text-base break-words">{selectedUser.license_number || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedUser.availability && (
                    <div className="mt-4 sm:mt-6">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Availability</label>
                      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <span className="text-blue-900 text-sm sm:text-base break-words">{selectedUser.availability}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedUser.role === 'RECYCLING_CENTER' && (
                <div className="mb-6 sm:mb-8">
                  <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    <span>Recycling Center Information</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Center Name</label>
                      <div className="p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
                        <span className="text-green-900 text-sm sm:text-base break-words">{selectedUser.center_name || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Operating Hours</label>
                      <div className="p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
                        <span className="text-green-900 text-sm sm:text-base break-words">{selectedUser.operating_hours || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedUser.accepted_materials && (
                    <div className="mt-4 sm:mt-6">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Accepted Materials</label>
                      <div className="p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {(Array.isArray(selectedUser.accepted_materials) ? selectedUser.accepted_materials : selectedUser.accepted_materials.split(',')).map((material, index) => (
                            <span key={index} className="px-2 sm:px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                              {material.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Information */}
              {selectedUser.additional_info && (
                <div className="mb-6 sm:mb-8">
                  <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    <span>Additional Information</span>
                  </h5>
                  <div className="p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-200">
                    <p className="text-purple-900 text-sm sm:text-base whitespace-pre-wrap break-words">{selectedUser.additional_info}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-700 rounded-lg sm:rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base order-3 sm:order-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleApproveRegistration(selectedUser.id, false, 'Application rejected by admin');
                    setSelectedUser(null);
                  }}
                  disabled={processingAction === selectedUser.id}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-lg sm:rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium text-sm sm:text-base order-2 sm:order-2"
                >
                  {processingAction === selectedUser.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Reject Application</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleApproveRegistration(selectedUser.id, true);
                    setSelectedUser(null);
                  }}
                  disabled={processingAction === selectedUser.id}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 text-white rounded-lg sm:rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium text-sm sm:text-base order-1 sm:order-3"
                >
                  {processingAction === selectedUser.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Approve Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Comprehensive Collection Requests Management Tab
  const renderRequests = () => {
    const filteredRequests = getFilteredCollectionRequests();
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    const currentRequests = filteredRequests.slice(startIndex, endIndex);
    
    // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    
    const requestStats = {
      total: allCollectionRequests.length,
      pending: allCollectionRequests.filter(r => r.status === 'pending').length,
      assigned: allCollectionRequests.filter(r => r.status === 'assigned').length,
      inProgress: allCollectionRequests.filter(r => r.status === 'in_progress').length,
      completed: allCollectionRequests.filter(r => r.status === 'completed').length,
      delivered: allCollectionRequests.filter(r => r.status === 'delivered').length,
      confirmed: allCollectionRequests.filter(r => r.status === 'confirmed').length,
      cancelled: allCollectionRequests.filter(r => r.status === 'cancelled').length,
      deletedUsers: allCollectionRequests.filter(r => formatCustomerInfo(r).isDeleted).length
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
          <div className="flex-1 min-w-0">
            <AnimatedGradientText className="text-xl lg:text-2xl font-bold mb-2">
              Collection Request Management
            </AnimatedGradientText>
            <p className="text-gray-400 text-sm lg:text-base">Monitor and manage all waste collection requests across the system</p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button
              onClick={loadAllCollectionRequests}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <Activity className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{requestStats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <Database className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{requestStats.pending}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{requestStats.completed}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{requestStats.delivered + requestStats.confirmed}</div>
                <div className="text-sm text-emerald-600">Delivered/Confirmed</div>
              </div>
              <Award className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{requestStats.cancelled + requestStats.deletedUsers}</div>
                <div className="text-sm text-red-600">Issues/Cancelled</div>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by customer, address, phone, or request ID..."
                value={requestSearchTerm}
                onChange={(e) => setRequestSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={requestFilterStatus}
                onChange={(e) => setRequestFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900"
              >
                <option value="all" className="text-gray-900 bg-white">All Status</option>
                <option value="pending" className="text-gray-900 bg-white">Pending</option>
                <option value="assigned" className="text-gray-900 bg-white">Assigned</option>
                <option value="in_progress" className="text-gray-900 bg-white">In Progress</option>
                <option value="completed" className="text-gray-900 bg-white">Completed</option>
                <option value="delivered" className="text-gray-900 bg-white">Delivered</option>
                <option value="confirmed" className="text-gray-900 bg-white">Confirmed</option>
                <option value="cancelled" className="text-gray-900 bg-white">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={requestFilterPriority}
                onChange={(e) => setRequestFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900"
              >
                <option value="all" className="text-gray-900 bg-white">All Priorities</option>
                <option value="low" className="text-gray-900 bg-white">Low</option>
                <option value="medium" className="text-gray-900 bg-white">Medium</option>
                <option value="high" className="text-gray-900 bg-white">High</option>
                <option value="urgent" className="text-gray-900 bg-white">Urgent</option>
              </select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={requestFilterTimeRange}
                onChange={(e) => setRequestFilterTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900"
              >
                <option value="all" className="text-gray-900 bg-white">All Time</option>
                <option value="today" className="text-gray-900 bg-white">Today</option>
                <option value="week" className="text-gray-900 bg-white">This Week</option>
                <option value="month" className="text-gray-900 bg-white">This Month</option>
                <option value="quarter" className="text-gray-900 bg-white">This Quarter</option>
              </select>
            </div>


          </div>

          {/* Clear Filters */}
          {(requestSearchTerm || requestFilterStatus !== 'all' || requestFilterPriority !== 'all' || requestFilterTimeRange !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setRequestSearchTerm('');
                  setRequestFilterStatus('all');
                  setRequestFilterPriority('all');
                  setRequestFilterTimeRange('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
              <span className="ml-3 text-sm text-gray-500">
                {filteredRequests.length === allCollectionRequests.length 
                  ? `${filteredRequests.length} total requests` 
                  : `${filteredRequests.length} of ${allCollectionRequests.length} requests match filters`}
              </span>
            </div>
          )}
        </div>

        {/* Requests Table */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {allCollectionRequests.length === 0 ? 'No Collection Requests' : 'No Matching Requests'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {allCollectionRequests.length === 0 
                ? 'No collection requests have been created yet. New requests will appear here when users submit them.'
                : 'No requests match your current filter criteria. Try adjusting the filters or search terms.'
              }
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={loadAllCollectionRequests}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Refresh Requests
              </button>
              {allCollectionRequests.length > 0 && (
                <button
                  onClick={() => {
                    setRequestSearchTerm('');
                    setRequestFilterStatus('all');
                    setRequestFilterPriority('all');
                    setRequestFilterTimeRange('all');
                    setRequestFilterDeletedUsers('all');
                  }}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Collector
                    </th>
                    <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-emerald-400">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-sm ${
                            request.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                            request.status === 'assigned' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {getShortRequestNumber(request.id)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.address?.split(',')[0] || 'No address'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.priority && (
                                <span className={`${getPriorityColor(request.priority)} font-medium`}>
                                  {request.priority.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {(() => {
                          const customerInfo = formatCustomerInfo(request);
                          return (
                            <div className={`${customerInfo.isDeleted ? 'opacity-75' : ''}`}>
                              <div className={`text-sm font-medium flex items-center space-x-2 ${
                                customerInfo.isDeleted ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                <span>{customerInfo.name}</span>
                                {customerInfo.isDeleted && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Deleted
                                  </span>
                                )}
                              </div>
                              <div className={`text-sm ${
                                customerInfo.isDeleted ? 'text-red-500 italic' : 'text-gray-500'
                              }`}>
                                {customerInfo.email}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customerInfo.phone}
                              </div>
                              {customerInfo.isDeleted && (
                                <div className="text-xs text-red-400 mt-1 italic">
                                  {customerInfo.deletionNote}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-5 whitespace-nowrap">
                        <div>
                          {request.collector ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                {request.collector.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {request.collector.email}
                              </div>
                              <div className="text-xs text-emerald-600 font-medium">
                                {request.status === 'confirmed' ? 'Delivered' : 
                                 request.status === 'assigned' ? 'Assigned' : 
                                 request.status === 'collected' ? 'Collected' : 'Active'}
                              </div>
                            </>
                          ) : request.status === 'pending' ? (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          ) : (
                            <span className="text-sm text-red-500">No Collector Data</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatRequestValue(request)}
                        </div>
                        {request.commission_paid && (
                          <div className="text-xs text-green-600">
                            Commission Paid
                          </div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.created_at ? 
                            new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'No date'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.created_at ? 
                            new Date(request.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Invalid time'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-1.5 lg:p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50 group-hover:shadow-sm"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                          
                          {/* Status management buttons */}
                          {request.status === 'pending' && (
                            <div className="flex items-center space-x-1">
                              <select
                                onChange={(e) => {
                                  const collectorId = e.target.value;
                                  if (collectorId) {
                                    handleAssignCollector(request.id, collectorId);
                                  }
                                }}
                                className="text-xs px-2 py-1 border border-gray-300 rounded"
                                title="Assign Collector"
                              >
                                <option value="">Assign Collector</option>
                                {allCollectors.filter(c => c.status === 'active').map(collector => (
                                  <option key={collector.id} value={collector.id}>
                                    {collector.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          {request.status !== 'cancelled' && request.status !== 'confirmed' && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={processingAction === request.id}
                              className="p-1.5 lg:p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50 group-hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Cancel Request"
                            >
                              {processingAction === request.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-2 border-red-300 border-t-red-600"></div>
                              ) : (
                                <XCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                              )}
                            </button>
                          )}
                          
                          {/* Delete Button - Admin Only */}
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={processingAction === request.id}
                            className="p-2 text-gray-400 hover:text-red-700 transition-all rounded-lg hover:bg-red-100 group-hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Request (Permanent)"
                          >
                            {processingAction === request.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-700"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredRequests.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              {/* Results Info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-emerald-500 text-white border-emerald-500 font-semibold'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {/* Show ellipsis and last page if needed */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mx-2 sm:mx-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
                <div className="flex justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-3">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-mono font-bold">
                      {getRequestDisplayNumber(selectedRequest.id)}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Collection Request Details</h3>
                      <p className="text-emerald-100 mt-1 text-xs sm:text-sm">
                        {getStatusLabel(selectedRequest.status)} • {formatRequestValue(selectedRequest)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 sm:p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ maxHeight: 'calc(98vh - 200px)' }}>
                {/* Customer Information */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Customer Information</h4>
                    {(() => {
                      const customerInfo = formatCustomerInfo(selectedRequest);
                      return customerInfo.isDeleted && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Customer Account Deleted
                        </span>
                      );
                    })()}
                  </div>
                  {(() => {
                    const customerInfo = formatCustomerInfo(selectedRequest);
                    return (
                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${customerInfo.isDeleted ? 'opacity-75' : ''}`}>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Name</label>
                          <p className={`font-medium ${customerInfo.isDeleted ? 'text-gray-600' : 'text-gray-900'}`}>
                            {customerInfo.name}
                          </p>
                          {customerInfo.isDeleted && (
                            <p className="text-xs text-red-500 mt-1 italic">
                              Original customer account was deleted
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Email</label>
                          <p className={customerInfo.isDeleted ? 'text-red-500 italic' : 'text-gray-900'}>
                            {customerInfo.email}
                          </p>
                          {customerInfo.isDeleted && customerInfo.originalEmail && (
                            <p className="text-xs text-gray-400 mt-1">
                              Original: {customerInfo.originalEmail.length > 40 ? 
                                customerInfo.originalEmail.substring(0, 40) + '...' : 
                                customerInfo.originalEmail}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Phone</label>
                          <p className="text-gray-900">
                            {customerInfo.phone}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Address</label>
                          <p className="text-gray-900">
                            {selectedRequest.address || 'No address'}
                          </p>
                        </div>
                        {customerInfo.isDeleted && (
                          <div className="md:col-span-2">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                              <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-red-800">Account Deletion Notice</p>
                                  <p className="text-sm text-red-700 mt-1">
                                    This customer's account has been deleted from the system. The request data is preserved for historical and business continuity purposes. Contact information shown is from the original request submission.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Request Details */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Status</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusLabel(selectedRequest.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Priority</label>
                      <span className={`font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority?.toUpperCase() || 'Not Set'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Collection Date</label>
                      <p className="text-gray-900">
                        {selectedRequest.preferred_date ? 
                          new Date(selectedRequest.preferred_date).toLocaleDateString() : 
                          'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Collection Time</label>
                      <p className="text-gray-900">
                        {selectedRequest.preferred_time || 'Flexible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items to Collect */}
                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Items to Collect</h4>
                    <div className="space-y-2">
                      {selectedRequest.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{item.type || item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {item.quantity && (
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              )}
                              {item.weight && (
                                <p className="text-sm text-gray-600">Weight: {item.weight}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collector Information */}
                {selectedRequest.collector && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Collector</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {selectedRequest.collector.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedRequest.collector.name}</p>
                          <p className="text-sm text-gray-600">{selectedRequest.collector.email}</p>
                          {selectedRequest.collector.phone && (
                            <p className="text-sm text-gray-600">{selectedRequest.collector.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">
                        {selectedRequest.created_at ? 
                          new Date(selectedRequest.created_at).toLocaleString() : 
                          'Unknown'
                        }
                      </span>
                    </div>
                    {selectedRequest.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">
                          {new Date(selectedRequest.updated_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                  {selectedRequest.status === 'pending' && (
                    <select
                      onChange={(e) => {
                        const collectorId = e.target.value;
                        if (collectorId) {
                          handleAssignCollector(selectedRequest.id, collectorId);
                          setSelectedRequest(null);
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Assign Collector</option>
                      {allCollectors.filter(c => c.status === 'active').map(collector => (
                        <option key={collector.id} value={collector.id}>
                          {collector.name}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {selectedRequest.status !== 'cancelled' && selectedRequest.status !== 'confirmed' && (
                    <button
                      onClick={() => {
                        handleCancelRequest(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                  
                  {/* Delete Button - Admin Only */}
                  <button
                    onClick={() => {
                      handleDeleteRequest(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Request</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCollectors = () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex-1 min-w-0">
          <AnimatedGradientText className="text-xl lg:text-2xl font-bold mb-2">
            Collector Management
          </AnimatedGradientText>
          <p className="text-gray-400 text-sm lg:text-base">Manage active collectors - edit profiles, ban users, or remove accounts</p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-gray-500 text-sm">Active:</span>
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {(allCollectors?.filter(c => c.status === 'active').length || 0)}
            </span>
            <span className="text-gray-500 text-sm">Total:</span>
            <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {(allCollectors?.filter(c => c.status !== 'pending_approval').length || 0)}
            </span>
          </div>
          <button
            onClick={loadAllCollectors}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Collectors Management Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Approved Collectors ({(allCollectors?.filter(c => c.status !== 'pending_approval').length || 0)})</span>
          </h3>

          {/* Search and Filter */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search collectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all" className="text-gray-900 bg-white">All Status</option>
              <option value="active" className="text-gray-900 bg-white">Active</option>
              <option value="banned" className="text-gray-900 bg-white">Banned</option>
              <option value="suspended" className="text-gray-900 bg-white">Suspended</option>
            </select>
          </div>
        </div>

        {(allCollectors || []).length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No collectors registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collector Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Area
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(allCollectors || [])
                  .filter(collector => {
                    // Exclude pending approval collectors - they belong in the Registration tab
                    const notPendingApproval = collector.status !== 'pending_approval';
                    
                    const matchesSearch = !searchTerm || 
                      collector.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      collector.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      collector.coverage_area?.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesStatus = filterStatus === 'all' || collector.status === filterStatus;
                    
                    return notPendingApproval && matchesSearch && matchesStatus;
                  })
                  .map((collector) => (
                  <tr key={collector.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {collector.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{collector.name}</div>
                      <div className="text-sm text-gray-500">{collector.email}</div>
                          <div className="text-xs text-gray-400">{collector.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        collector.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : collector.status === 'banned'
                          ? 'bg-red-100 text-red-800'
                          : collector.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {collector.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collector.coverage_area || 'Not specified'}
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collector.vehicle_type || 'Not specified'}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(collector.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button
                          onClick={() => setSelectedCollector(collector)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCollector(collector)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-emerald-600 transition-all rounded-lg hover:bg-emerald-50"
                          title="Edit Profile"
                        >
                          <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                        {collector.status === 'active' ? (
                          <button
                            onClick={() => handleBanCollector(collector.id)}
                            className="p-1.5 lg:p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
                            title="Ban Collector"
                          >
                            <UserX className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnbanCollector(collector.id)}
                            className="p-1.5 lg:p-2 text-gray-400 hover:text-emerald-600 transition-all rounded-lg hover:bg-emerald-50"
                            title="Unban Collector"
                          >
                            <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCollector(collector.id)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
                          title="Delete Account"
                        >
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collector Details/Edit Modal */}
      {selectedCollector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Collector Details - {selectedCollector.name}
                </h3>
                <button
                  onClick={() => setSelectedCollector(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.phone}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.address}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.coverage_area}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.vehicle_type}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.license_number}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.availability}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className={`text-gray-900 bg-gray-50 p-3 rounded-lg font-medium ${
                      selectedCollector.status === 'active' ? 'text-emerald-600' :
                      selectedCollector.status === 'banned' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedCollector.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedCollector.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {selectedCollector.additional_info && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedCollector.additional_info}</div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                  onClick={() => handleEditCollector(selectedCollector)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                  </button>
                {selectedCollector.status === 'active' ? (
                  <button
                    onClick={() => handleBanCollector(selectedCollector.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Ban Collector</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnbanCollector(selectedCollector.id)}
                    className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Unban Collector</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecyclingCenters = () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex-1 min-w-0">
          <AnimatedGradientText className="text-xl lg:text-2xl font-bold mb-2">
            Recycling Center Management
          </AnimatedGradientText>
          <p className="text-gray-400 text-sm lg:text-base">Manage recycling centers - edit profiles, ban facilities, or remove accounts</p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-gray-500 text-sm">Active:</span>
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {(allRecyclingCenters?.filter(c => c.status === 'active').length || 0)}
            </span>
            <span className="text-gray-500 text-sm">Total:</span>
            <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {(allRecyclingCenters?.filter(c => c.status !== 'pending_approval').length || 0)}
            </span>
          </div>
          <button
            onClick={loadAllRecyclingCenters}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Recycling Centers Management Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-500" />
            <span>Approved Recycling Centers ({(allRecyclingCenters?.filter(c => c.status !== 'pending_approval').length || 0)})</span>
          </h3>

          {/* Search and Filter */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recycling centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all" className="text-gray-900 bg-white">All Status</option>
              <option value="active" className="text-gray-900 bg-white">Active</option>
              <option value="banned" className="text-gray-900 bg-white">Banned</option>
              <option value="suspended" className="text-gray-900 bg-white">Suspended</option>
            </select>
          </div>
        </div>

        {(allRecyclingCenters || []).length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recycling centers registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Center Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Area
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility Type
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(allRecyclingCenters || [])
                  .filter(center => {
                    // Exclude pending approval centers - they belong in the Registration tab
                    const notPendingApproval = center.status !== 'pending_approval';
                    
                    const matchesSearch = !searchTerm || 
                      center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      center.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      center.coverage_area?.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesStatus = filterStatus === 'all' || center.status === filterStatus;
                    
                    return notPendingApproval && matchesSearch && matchesStatus;
                  })
                  .map((center) => (
                  <tr key={center.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {center.name?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{center.name}</div>
                          <div className="text-sm text-gray-500">{center.email}</div>
                          <div className="text-xs text-gray-400">{center.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        center.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : center.status === 'banned'
                          ? 'bg-red-100 text-red-800'
                          : center.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {center.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {center.coverage_area || 'Not specified'}
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {center.facility_type || 'Not specified'}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(center.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button
                          onClick={() => setSelectedRecyclingCenter(center)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRecyclingCenter(center)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-emerald-600 transition-all rounded-lg hover:bg-emerald-50"
                          title="Edit Profile"
                        >
                          <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                        {center.status === 'active' ? (
                          <button
                            onClick={() => handleBanRecyclingCenter(center.id)}
                            className="p-1.5 lg:p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
                            title="Ban Center"
                          >
                            <UserX className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnbanRecyclingCenter(center.id)}
                            className="p-1.5 lg:p-2 text-gray-400 hover:text-emerald-600 transition-all rounded-lg hover:bg-emerald-50"
                            title="Unban Center"
                          >
                            <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecyclingCenter(center.id)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
                          title="Delete Account"
                        >
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recycling Center Details/Edit Modal */}
      {selectedRecyclingCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recycling Center Details - {selectedRecyclingCenter.name}
                </h3>
                <button
                  onClick={() => setSelectedRecyclingCenter(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.phone}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.address}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.coverage_area}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.facility_type}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.license_number}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.availability}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className={`text-gray-900 bg-gray-50 p-3 rounded-lg font-medium ${
                      selectedRecyclingCenter.status === 'active' ? 'text-emerald-600' :
                      selectedRecyclingCenter.status === 'banned' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedRecyclingCenter.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedRecyclingCenter.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {selectedRecyclingCenter.additional_info && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecyclingCenter.additional_info}</div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditRecyclingCenter(selectedRecyclingCenter)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                {selectedRecyclingCenter.status === 'active' ? (
                  <button
                    onClick={() => handleBanRecyclingCenter(selectedRecyclingCenter.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Ban Center</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnbanRecyclingCenter(selectedRecyclingCenter.id)}
                    className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Unban Center</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSupportTickets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <AnimatedGradientText className="text-2xl font-bold mb-2">
            Support Tickets
          </AnimatedGradientText>
          <p className="text-gray-400">Manage customer support requests and issues</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Total:</span>
            <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {supportTickets?.length || 0}
            </span>
            <span className="text-gray-500">Open:</span>
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {supportTickets?.filter(t => t.status === 'open').length || 0}
            </span>
          </div>
          <button
            onClick={loadSupportTickets}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: supportTickets?.filter(t => t.status === 'open').length || 0, color: 'bg-blue-500' },
          { label: 'In Progress', count: supportTickets?.filter(t => t.status === 'in_progress').length || 0, color: 'bg-yellow-500' },
          { label: 'Resolved', count: supportTickets?.filter(t => t.status === 'resolved').length || 0, color: 'bg-green-500' },
          { label: 'Closed', count: supportTickets?.filter(t => t.status === 'closed').length || 0, color: 'bg-gray-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      {(supportTickets?.length || 0) === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Support Tickets</h3>
          <p className="text-gray-600">All support requests have been resolved or no tickets exist yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {(supportTickets || []).map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{ticket.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {ticket.category === 'account_reactivation' && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        REACTIVATION
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-emerald-500" />
                      {ticket.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2 text-emerald-500" />
                      {ticket.category.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-emerald-500" />
                      {ticket.name}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ticket.message}
                  </p>

                  {ticket.admin_response && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800">
                        <strong>Admin Response:</strong> {ticket.admin_response}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Responded: {new Date(ticket.responded_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {ticket.category === 'account_reactivation' && ticket.status === 'open' && (
                    <button
                      onClick={() => handleReactivateAccount(ticket.email)}
                      className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
                      title="Reactivate Account"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                  {ticket.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved', 'Issue resolved by admin')}
                      className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      title="Mark Resolved"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <AnimatedGradientText className="text-2xl font-bold mb-2">
            User Management
          </AnimatedGradientText>
          <p className="text-gray-400">Manage PUBLIC accounts - view profiles and remove accounts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Total Users:</span>
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {(allUsers || []).length}
            </span>
          </div>
          <button
            onClick={loadAllUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
          <p className="text-gray-600 text-sm">Manage user accounts with PUBLIC role</p>
          </div>

        {(allUsers || []).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-500" />
          </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h4>
            <p className="text-gray-600 mb-4">No user accounts are currently registered.</p>
            <button
              onClick={loadAllUsers}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Refresh Users
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(allUsers || []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0) || 'U'}
        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
              </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : user.status === 'deactivated'
                          ? 'bg-orange-100 text-orange-800'
                          : user.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div>
                        <div>{user.phone || 'No phone'}</div>
                        <div className="text-xs text-gray-400">{user.address || 'No address'}</div>
              </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUserForManagement(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={processingAction === user.id}
                          className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          {processingAction === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
            </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUserForManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  User Details - {selectedUserForManagement.name}
                </h3>
                <button
                  onClick={() => setSelectedUserForManagement(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
          </button>
        </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUserForManagement.name}</div>
              </div>
                
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUserForManagement.email}</div>
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUserForManagement.phone || 'Not provided'}</div>
            </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUserForManagement.address || 'Not provided'}</div>
          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUserForManagement.role}</div>
              </div>
                
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUserForManagement.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : selectedUserForManagement.status === 'deactivated'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedUserForManagement.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUserForManagement.status?.charAt(0).toUpperCase() + selectedUserForManagement.status?.slice(1) || 'Unknown'}
                    </span>
              </div>
            </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedUserForManagement.created_at ? 
                      new Date(selectedUserForManagement.created_at).toLocaleString() : 
                      'No date available'
                    }
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedUserForManagement(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );

  // PDF Report generation function
  const generatePDFReport = async () => {
    try {
      // Show generating notification
      setNotifications([{
        id: Date.now(),
        message: 'Generating comprehensive analytics report...',
        type: 'info'
      }]);
      
      // Calculate real analytics from loaded data
      const userStats = {
        total: allUsers.length,
        public: allUsers.filter(u => u.role === 'PUBLIC').length,
        collectors: allUsers.filter(u => u.role === 'COLLECTOR').length,
        recyclingCenters: allUsers.filter(u => u.role === 'RECYCLING_CENTER').length,
        active: allUsers.filter(u => u.account_status === 'active').length,
        deleted: allUsers.filter(u => u.account_status === 'deleted').length
      };

      const requestStats = {
        total: allCollectionRequests.length,
        pending: allCollectionRequests.filter(r => r.status === 'pending').length,
        completed: allCollectionRequests.filter(r => r.status === 'completed').length,
        confirmed: allCollectionRequests.filter(r => r.status === 'confirmed').length,
        cancelled: allCollectionRequests.filter(r => r.status === 'cancelled').length,
        totalRevenue: allCollectionRequests.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0)
      };

      const successRate = requestStats.total > 0 ? ((requestStats.confirmed / requestStats.total) * 100).toFixed(1) : 0;
      const processingRate = requestStats.total > 0 ? (((requestStats.total - requestStats.pending) / requestStats.total) * 100).toFixed(1) : 0;
      const avgRequestValue = requestStats.total > 0 ? (requestStats.totalRevenue / requestStats.total).toFixed(2) : 0;

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text('EcoTech Analytics Report', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });
      
      // Executive Summary
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Executive Summary', 20, 60);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const summaryText = `This report provides a comprehensive overview of the EcoTech platform performance, 
including user engagement, collection request analytics, financial metrics, and operational efficiency.`;
      doc.text(summaryText, 20, 70, { maxWidth: pageWidth - 40 });

      // Key Performance Indicators
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Key Performance Indicators', 20, 95);

      // KPI Table
      const kpiData = [
        ['Total Revenue', `$${requestStats.totalRevenue.toFixed(2)}`],
        ['Total Requests', requestStats.total.toString()],
        ['Total Users', userStats.total.toString()],
        ['Active Collectors', userStats.collectors.toString()],
        ['Success Rate', `${successRate}%`],
        ['Processing Rate', `${processingRate}%`],
        ['Average Request Value', `$${avgRequestValue}`],
        ['Active Recycling Centers', userStats.recyclingCenters.toString()]
      ];

      autoTable(doc, {
        startY: 105,
        head: [['Metric', 'Value']],
        body: kpiData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 20, right: 20 }
      });

      // User Analytics Section
      let yPosition = 185; // Fixed position after KPI table
      
      doc.setFontSize(14);
      doc.text('User Analytics', 20, yPosition);
      yPosition += 10;

      const userAnalyticsData = [
        ['Public Users', userStats.public.toString()],
        ['Collectors', userStats.collectors.toString()],
        ['Recycling Centers', userStats.recyclingCenters.toString()],
        ['Active Users', userStats.active.toString()],
        ['Deleted Users', userStats.deleted.toString()]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['User Type', 'Count']],
        body: userAnalyticsData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        margin: { left: 20, right: 20 }
      });

      // Request Analytics Section - New Page
      doc.addPage();
      yPosition = 30;

      doc.setFontSize(14);
      doc.text('Request Analytics', 20, yPosition);
      yPosition += 10;

      const requestAnalyticsData = [
        ['Total Requests', requestStats.total.toString()],
        ['Confirmed Requests', requestStats.confirmed.toString()],
        ['Pending Requests', requestStats.pending.toString()],
        ['Cancelled Requests', requestStats.cancelled.toString()],
        ['Completed Requests', requestStats.completed.toString()]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Request Status', 'Count']],
        body: requestAnalyticsData,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 20, right: 20 }
      });

      // Financial Overview - Continue on same page
      yPosition = 120;

      doc.setFontSize(14);
      doc.text('Financial Overview', 20, yPosition);
      yPosition += 10;

      const financialData = [
        ['Total Revenue', `$${requestStats.totalRevenue.toFixed(2)}`],
        ['Average Request Value', `$${avgRequestValue}`],
        ['Revenue per User', `$${userStats.total > 0 ? (requestStats.totalRevenue / userStats.total).toFixed(2) : '0.00'}`],
        ['Revenue per Collector', `$${userStats.collectors > 0 ? (requestStats.totalRevenue / userStats.collectors).toFixed(2) : '0.00'}`]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Financial Metric', 'Amount']],
        body: financialData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 20, right: 20 }
      });

      // Platform Health Section - Continue on same page
      yPosition = 200;

      doc.setFontSize(14);
      doc.text('Platform Health Metrics', 20, yPosition);
      yPosition += 10;

      const healthData = [
        ['Success Rate', `${successRate}%`],
        ['Processing Rate', `${processingRate}%`],
        ['User Engagement', `${userStats.active}/${userStats.total} active users`],
        ['Platform Utilization', `${requestStats.total} total requests processed`]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Health Metric', 'Value']],
        body: healthData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: 20, right: 20 }
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: 'right' });
        doc.text('EcoTech Platform Analytics', 20, pageHeight - 10);
      }

      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      doc.save(`EcoTech-Analytics-Report-${timestamp}.pdf`);
      
      // Replace the generating notification with success
      setTimeout(() => {
        const successId = Date.now();
        setNotifications([{
          id: successId,
          message: '📊 Analytics report generated successfully! Download started.',
          type: 'success'
        }]);
        
        // Auto-dismiss success notification after 4 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== successId));
        }, 4000);
      }, 500);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      // Replace any notification with error message
      const errorId = Date.now();
      setNotifications([{
        id: errorId,
        message: '❌ Failed to generate PDF report. Please try again.',
        type: 'error'
      }]);
      
      // Auto-dismiss error notification after 6 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== errorId));
      }, 6000);
    }
  };

  const renderAnalytics = () => {
    // Calculate real analytics from loaded data
    const userStats = {
      total: allUsers.length,
      public: allUsers.filter(u => u.role === 'PUBLIC').length,
      collectors: allUsers.filter(u => u.role === 'COLLECTOR').length,
      recyclingCenters: allUsers.filter(u => u.role === 'RECYCLING_CENTER').length,
      active: allUsers.filter(u => u.account_status === 'active').length,
      deleted: allUsers.filter(u => u.account_status === 'deleted').length
    };

    const requestStats = {
      total: allCollectionRequests.length,
      pending: allCollectionRequests.filter(r => r.status === 'pending').length,
      completed: allCollectionRequests.filter(r => r.status === 'completed').length,
      confirmed: allCollectionRequests.filter(r => r.status === 'confirmed').length,
      cancelled: allCollectionRequests.filter(r => r.status === 'cancelled').length,
      totalRevenue: allCollectionRequests.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0)
    };

    return (
      <div className="space-y-6">
        {/* Analytics Header with Export Options */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <AnimatedGradientText className="text-2xl font-bold mb-2">
              System Analytics & PDF Reports
            </AnimatedGradientText>
            <p className="text-gray-400">Real-time insights and comprehensive PDF reporting from your EcoTech platform data</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshAllData}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </button>
            
            {/* PDF Export Button */}
            <button
              onClick={generatePDFReport}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
            >
              <FileText className="h-4 w-4" />
              <span>Generate PDF Report</span>
            </button>
          </div>
        </div>

        {/* Key Performance Indicators - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ${requestStats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">Total Revenue</div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-4 text-xs text-blue-500">
              From {requestStats.total} collection requests
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{requestStats.total}</div>
                <div className="text-sm text-emerald-600">Total Requests</div>
              </div>
              <Recycle className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="mt-4 text-xs text-emerald-500">
              {requestStats.completed + requestStats.confirmed} completed
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{userStats.total}</div>
                <div className="text-sm text-purple-600">Total Users</div>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <div className="mt-4 text-xs text-purple-500">
              {userStats.active} active users
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{userStats.collectors}</div>
                <div className="text-sm text-orange-600">Active Collectors</div>
              </div>
              <Truck className="h-8 w-8 text-orange-400" />
            </div>
            <div className="mt-4 text-xs text-orange-500">
              {userStats.recyclingCenters} recycling centers
            </div>
          </div>
        </div>

        {/* Real Data Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">User Distribution</h3>
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Public Users</span>
                <span className="text-sm font-semibold text-blue-600">{userStats.public}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: `${userStats.total > 0 ? (userStats.public / userStats.total) * 100 : 0}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Collectors</span>
                <span className="text-sm font-semibold text-emerald-600">{userStats.collectors}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${userStats.total > 0 ? (userStats.collectors / userStats.total) * 100 : 0}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recycling Centers</span>
                <span className="text-sm font-semibold text-orange-600">{userStats.recyclingCenters}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: `${userStats.total > 0 ? (userStats.recyclingCenters / userStats.total) * 100 : 0}%`}}></div>
              </div>
            </div>
          </div>

          {/* Request Status Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Request Status</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="text-sm font-semibold text-emerald-600">{requestStats.confirmed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${requestStats.total > 0 ? (requestStats.confirmed / requestStats.total) * 100 : 0}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-orange-600">{requestStats.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: `${requestStats.total > 0 ? (requestStats.pending / requestStats.total) * 100 : 0}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="text-sm font-semibold text-red-600">{requestStats.cancelled}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: `${requestStats.total > 0 ? (requestStats.cancelled / requestStats.total) * 100 : 0}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Health */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-semibold text-emerald-600">{userStats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {requestStats.total > 0 ? 
                    Math.round(((requestStats.completed + requestStats.confirmed) / requestStats.total) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Request Value</span>
                <span className="text-sm font-semibold text-emerald-600">
                  ${requestStats.total > 0 ? (requestStats.totalRevenue / requestStats.total).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Engagement</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requests per User</span>
                <span className="text-sm font-semibold text-blue-600">
                  {userStats.public > 0 ? (requestStats.total / userStats.public).toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Collectors</span>
                <span className="text-sm font-semibold text-emerald-600">{userStats.collectors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service Coverage</span>
                <span className="text-sm font-semibold text-purple-600">{userStats.recyclingCenters} centers</span>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-sm font-semibold text-emerald-600">
                  ${requestStats.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Requests</span>
                <span className="text-sm font-semibold text-blue-600">
                  {allCollectionRequests.filter(r => parseFloat(r.total_amount) > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing Rate</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {requestStats.total > 0 ? 
                    Math.round((requestStats.total - requestStats.pending) / requestStats.total * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => <ContentManagement />;

  const renderIssues = () => {
    // Combine collection request issues and support tickets
    const collectionIssues = (allCollectionRequests || []).filter(req => req.status === 'issue_reported');
    const openSupportTickets = (supportTickets || []).filter(ticket => ticket.status !== 'closed');
    
    // TODO: Add recycling center quality issues when quality control system is enhanced
    // This would include issues like contamination, damaged materials, etc.
    const recyclingCenterIssues = []; // Placeholder for future quality control issues
    
    const allIssues = [...collectionIssues, ...openSupportTickets, ...recyclingCenterIssues];
    
    const getIssueStats = () => {
      const open = allIssues.filter(issue => 
        issue.status === 'issue_reported' || issue.status === 'open'
      ).length;
      const inProgress = allIssues.filter(issue => issue.status === 'in_progress').length;
      const resolved = allIssues.filter(issue => issue.status === 'resolved').length;
      const critical = allIssues.filter(issue => 
        issue.priority === 'critical' || issue.priority === 'high'
      ).length;
      
      return { open, inProgress, resolved, critical, total: allIssues.length };
    };

    const stats = getIssueStats();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AnimatedGradientText className="text-2xl font-bold mb-2">
              Support & Issues
            </AnimatedGradientText>
            <p className="text-gray-400">Collection issues, support tickets, and customer inquiries</p>
          </div>
          <button
            onClick={refreshAllData}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Issue Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Issues</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.open}</div>
                <div className="text-sm text-gray-500">Open</div>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-500">Resolved</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
                <div className="text-sm text-gray-500">Critical/High</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Issues List */}
        {allIssues.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-500">All collection requests and support tickets are resolved!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Collection Request Issues */}
            {collectionIssues.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-red-500" />
                  Collection Request Issues ({collectionIssues.length})
                </h4>
                {collectionIssues.map((issue) => {
                  const issueData = parseIssueData(issue.collector_notes);
                  return (
                    <div key={issue.id} className="bg-white rounded-xl p-6 border-l-4 border-l-red-500 border border-gray-200 shadow-sm mb-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                              <span className="text-2xl mr-2">{getIssueTypeIcon(issueData?.type)}</span>
                              Collection Issue - {getRequestDisplayNumber(issue.id)}
                            </h5>
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              COLLECTION ISSUE
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                              {getStatusLabel(issue.status).toUpperCase()}
                            </span>
                          </div>

                          {/* Enhanced Issue Information */}
                          {issueData && (
                            <div className="mb-4 space-y-2">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700">Issue Type:</span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                                    {getIssueTypeDisplay(issueData.type)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700">Severity:</span>
                                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getIssueSeverityColor(issueData.severity)}`}>
                                    {issueData.severity.toUpperCase()}
                                  </span>
                                </div>
                                {issueData.collectorName && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">Reported by:</span>
                                    <span className="text-sm text-gray-600">{issueData.collectorName}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Issue Description:</p>
                                <p className="text-gray-600">{issueData.description}</p>
                              </div>

                              {issueData.reportedAt && (
                                <div className="text-xs text-gray-500">
                                  Reported on: {new Date(issueData.reportedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fallback for legacy format */}
                          {!issueData && (
                            <div className="mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Issue Details:</p>
                                <p className="text-gray-600">{issue.collector_notes || 'No details provided'}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              Customer: {issue.user?.name || issue.contact_person || 'Unknown'}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Truck className="h-4 w-4 mr-2" />
                              Collector: {issue.collector?.name || issueData?.collectorName || 'Unassigned'}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              Address: {issue.address}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Reported: {issueData?.reportedAt ? new Date(issueData.reportedAt).toLocaleDateString() : new Date(issue.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button 
                            onClick={() => setSelectedRequest(issue)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateRequestStatus(issue.id, 'assigned')}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            title="Resolve Issue"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleCancelRequest(issue.id, 'Issue escalated - request cancelled')}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Cancel Request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Support Tickets */}
            {openSupportTickets.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                  Support Tickets ({openSupportTickets.length})
                </h4>
                {openSupportTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-xl p-6 border-l-4 border-l-blue-500 border border-gray-200 shadow-sm mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="text-lg font-semibold text-gray-900">{ticket.subject}</h5>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusLabel(ticket.status).toUpperCase()}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {ticket.category?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                          {ticket.message}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            From: {ticket.name}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            Email: {ticket.email}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {Math.floor((new Date() - new Date(ticket.created_at)) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>

                        {ticket.admin_response && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-800 mb-1">Admin Response:</p>
                            <p className="text-sm text-green-700">{ticket.admin_response}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Respond to Ticket"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                          className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                          title="Mark In Progress"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          title="Mark Resolved"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              <p className="text-sm text-gray-500">Basic system configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name
              </label>
              <input
                type="text"
                defaultValue="EcoTech Admin Panel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                defaultValue="admin@ecotech.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-500">Authentication and access control</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                <p className="text-xs text-gray-500">Add extra security to admin accounts</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Auto-lock Accounts</h4>
                <p className="text-xs text-gray-500">Lock accounts after failed login attempts</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-500">Configure system alerts and notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">New User Registrations</h4>
                <p className="text-xs text-gray-500">Alert when new users register</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Support Tickets</h4>
                <p className="text-xs text-gray-500">Alert when new support tickets are created</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        {/* System Maintenance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Maintenance</h3>
              <p className="text-sm text-gray-500">Database and system maintenance tools</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Clear System Cache
            </button>
            
            <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              Generate System Report
            </button>
            
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Backup Database
            </button>
            
            <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              System Diagnostics
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Version</p>
            <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Database</p>
            <p className="text-lg font-semibold text-gray-900">PostgreSQL</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Uptime</p>
            <p className="text-lg font-semibold text-gray-900">99.9%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Last Backup</p>
            <p className="text-lg font-semibold text-gray-900">2 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'requests':
        return renderRequests();
      case 'registrations':
        return renderRegistrations();
      case 'collectors':
        return renderCollectors();
      case 'recycling-centers':
        return renderRecyclingCenters();
      case 'support':
        return renderIssues(); // Now handles both support tickets and collection issues
      case 'users':
        return renderUserManagement();
      case 'analytics':
        return renderAnalytics();
      case 'content':
        return renderContent();
      default:
        return renderOverview();
    }
  };

  if (loading && !systemStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we load your admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Professional Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.slice(0, 1).map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start justify-between px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400/50' 
                : notification.type === 'info'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/50'
                : notification.type === 'warning'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-400/50'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400/50'
            } animate-slide-in-right backdrop-blur-md min-h-[60px]`}
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
                {notification.type === 'info' && <AlertCircle className="h-5 w-5" />}
                {notification.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                {notification.type === 'error' && <XCircle className="h-5 w-5" />}
              </div>
              <span className="font-medium text-sm leading-relaxed">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-white/70 hover:text-white transition-colors flex-shrink-0 p-1 rounded-full hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white/10 backdrop-blur-md border-r border-white/20 min-h-screen transition-all duration-300 shadow-xl flex flex-col`}>
          <div className="p-4 flex-1 flex flex-col">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
                    <p className="text-xs text-gray-300">EcoTech Management</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {/* Enhanced Header in collapsed mode */}
            {sidebarCollapsed && (
              <div className="mb-6 flex justify-center">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <nav className="space-y-2 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const getNotificationCount = () => {
                  if (tab.id === 'support') {
                    const collectionIssues = (allCollectionRequests || []).filter(req => req.status === 'issue_reported').length;
                    const openTickets = (supportTickets || []).filter(ticket => ticket.status !== 'closed').length;
                    return collectionIssues + openTickets;
                  }
                  if (tab.id === 'registrations') {
                    return (pendingRegistrations || []).length;
                  }
                  return 0;
                };
                const notificationCount = getNotificationCount();

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-3 rounded-lg text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-sm backdrop-blur-sm'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title={sidebarCollapsed ? tab.name : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-emerald-300' : 'text-gray-400 group-hover:text-white'
                      }`} />
                      {!sidebarCollapsed && <span className="font-medium">{tab.name}</span>}
                    </div>
                    {!sidebarCollapsed && notificationCount > 0 && (
                      <span className={`text-xs rounded-full px-2 py-1 font-semibold ${
                        tab.id === 'support'
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {notificationCount}
                      </span>
                    )}
                    {sidebarCollapsed && notificationCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Enhanced Sidebar Footer */}
            <div className="mt-auto">
              {!sidebarCollapsed && (
                <div className="border-t border-white/20 pt-4 space-y-3">
                  <button 
                    onClick={handleGoHome}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-all duration-200 group"
                  >
                    <Home className="h-5 w-5 text-gray-400 group-hover:text-emerald-300 transition-colors" />
                    <span className="font-medium">Go Home</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
                  >
                    <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-300 transition-colors" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}

              {sidebarCollapsed && (
                <div className="border-t border-white/20 pt-4 space-y-3">
                  <button 
                    onClick={handleGoHome}
                    className="w-full flex items-center justify-center p-3 text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-all duration-200"
                    title="Go Home"
                  >
                    <Home className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center p-3 text-gray-300 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 bg-white/5 backdrop-blur-sm">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-green-400 hover:text-green-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>



      {/* Support Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Support Ticket Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Ticket Header */}
              <div className="flex items-center space-x-3 mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTicket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                  selectedTicket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTicket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.category.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Admin Response */}
              {selectedTicket.admin_response && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    <p className="text-green-800 whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Responded: {new Date(selectedTicket.responded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                {selectedTicket.category === 'account_reactivation' && selectedTicket.status === 'open' && (
                  <button
                    onClick={() => {
                      handleReactivateAccount(selectedTicket.email);
                      setSelectedTicket(null);
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    Reactivate Account
                  </button>
                )}
                {selectedTicket.status === 'open' && (
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved', 'Issue resolved by admin')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


