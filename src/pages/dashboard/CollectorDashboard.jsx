import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supabaseApi from '../../services/supabaseApi';
import { supabase } from '../../lib/supabase';
import { paidCollectionService } from '../../services/paidCollectionService';
import recyclingCenterService from '../../services/recyclingCenterService';
import { MagicCard } from '../../components/ui/magic-card';
import { ShimmerButton } from '../../components/ui/shimmer-button';
import { AnimatedGradientText } from '../../components/ui/animated-gradient-text';
import DeliveryWorkflowStatus from '../../components/ui/DeliveryWorkflowStatus';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Package, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Truck,
  Calendar,
  Weight,
  Star,
  FileText,
  Upload,
  Home,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Users,
  X,
  DollarSign
} from 'lucide-react';

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
`;

const CollectorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [collectorStatus, setCollectorStatus] = useState('inactive');
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
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
      await logout();
      addNotification('Logged out successfully!', 'success');
      navigate('/');
    } catch (error) {
      addNotification('Error logging out', 'error');
      console.error('Logout error:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);
  const [showCenterSelection, setShowCenterSelection] = useState(false);
  const [availableCenters, setAvailableCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [requestToClaim, setRequestToClaim] = useState(null);

  // Form states
  const [issueForm, setIssueForm] = useState({
    type: '',
    description: '',
    severity: 'medium'
  });
  const [deliveryForm, setDeliveryForm] = useState({
    condition: 'good',
    notes: ''
  });
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Earnings states
  const [earnings, setEarnings] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState({
    totalEarnings: 0,
    paidEarnings: 0,
    totalTransactions: 0,
    paidTransactions: 0
  });

  // Helper function to transform task data for display
  const transformTaskData = (task) => {
    if (!task) return null;
    
    return {
      ...task,
      // Ensure we have the required display fields
      customerName: task.contact_person || task.user?.name || task.customer_name || 'Unknown Customer',
      customerPhone: task.contact_phone || task.user?.phone || task.customer_phone || task.phone || 'No phone provided',
      address: task.address || task.pickup_address || 'No address provided',
      scheduledDate: task.scheduled_date || task.preferred_date || new Date().toISOString().split('T')[0],
      scheduledTime: task.scheduled_time || task.preferred_time || '10:00',
      items: task.item_types || task.items || [],
      specialInstructions: task.special_instructions || task.building_access_info || task.notes || '',
      priority: task.priority || 'medium',
      totalAmount: task.total_amount || 0
    };
  };

  // Generate sample data for testing (when database is empty)
  const generateSampleData = () => {
    const sampleTasks = [
      {
        id: 'sample-1',
        customerName: 'John Smith',
        customerPhone: '+1 (555) 123-4567',
        address: '123 Main St, Downtown',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '10:00',
        totalAmount: 45.50,
        items: ['Laptops', 'Mobile Phones', 'Cables'],
        specialInstructions: 'Ring doorbell twice',
        priority: 'high',
        status: 'assigned'
      },
      {
        id: 'sample-2',
        customerName: 'Sarah Johnson',
        customerPhone: '+1 (555) 234-5678',
        address: '456 Oak Ave, Uptown',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '14:00',
        totalAmount: 32.25,
        items: ['Desktop Computer', 'Printer', 'Batteries'],
        specialInstructions: 'Call before arrival',
        priority: 'medium',
        status: 'in_progress'
      }
    ];

    const samplePending = [
      {
        id: 'pending-1',
        customerName: 'Mike Wilson',
        customerPhone: '+1 (555) 345-6789',
        address: '789 Pine St, Westside',
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: '16:00',
        totalAmount: 67.80,
        items: ['Television', 'Gaming Console', 'Speakers'],
        specialInstructions: 'Heavy items, bring extra help',
        priority: 'high',
        status: 'pending'
      }
    ];

    return { sampleTasks, samplePending };
  };

  useEffect(() => {
    if (user?.id) {
      loadCollectorData();
      loadEarningsData();
    }
  }, [user]);

  const loadCollectorData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load collector profile to get status
      try {
        const profile = await supabaseApi.auth.getProfile(user.id);
        setCollectorStatus(profile?.collector_status || 'inactive');
      } catch (profileError) {
        console.log('Could not fetch collector status, using default');
        setCollectorStatus('active');
      }
      
      // Load assigned tasks for this collector
      try {
        const tasksResponse = await supabaseApi.collection.getCollectorRequests(user.id);
        console.log('Loaded collector tasks:', tasksResponse);
        // Transform the tasks to ensure proper display fields
        const transformedTasks = (tasksResponse || []).map(transformTaskData).filter(Boolean);
        setTasks(transformedTasks);
      } catch (tasksError) {
        console.error('Error loading collector tasks:', tasksError);
        // If complex query fails, try simple query
        try {
          const { data: simpleTasks, error: simpleError } = await supabase
            .from('collection_requests')
            .select('*')
            .eq('collector_id', user.id)
            .order('created_at', { ascending: false });
          
          if (simpleError) throw simpleError;
          const transformedTasks = (simpleTasks || []).map(transformTaskData).filter(Boolean);
          setTasks(transformedTasks);
        } catch (simpleError) {
          console.error('Even simple tasks query failed:', simpleError);
          console.log('Using sample task data for demonstration');
          const { sampleTasks } = generateSampleData();
          setTasks(sampleTasks);
        }
      }
      
      // Load pending requests (not assigned to anyone yet)
      try {
        const pendingResponse = await supabaseApi.collection.getAllRequests();
        // Filter for requests that are not assigned yet
        const pendingRequests = (pendingResponse || []).filter(req => 
          req.status === 'pending' && !req.collector_id
        );
        console.log('Loaded pending requests:', pendingRequests);
        // Transform the pending requests
        const transformedPending = pendingRequests.map(transformTaskData).filter(Boolean);
        setPendingRequests(transformedPending);
      } catch (pendingError) {
        console.error('Error loading pending requests:', pendingError);
        // Try simple query for pending requests
        try {
          const { data: simplePending, error: simpleError } = await supabase
            .from('collection_requests')
            .select('*')
            .eq('status', 'pending')
            .is('collector_id', null)
            .order('created_at', { ascending: false });
          
          if (simpleError) throw simpleError;
          const transformedPending = (simplePending || []).map(transformTaskData).filter(Boolean);
          setPendingRequests(transformedPending);
        } catch (simpleError) {
          console.error('Even simple pending query failed:', simpleError);  
          console.log('Using sample pending data for demonstration');
          const { samplePending } = generateSampleData();
          setPendingRequests(samplePending);
        }
      }
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Error loading collector data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEarningsData = async () => {
    try {
      if (!user?.id) return;
      
      console.log('Loading earnings data for collector:', user.id);
      
      // Load earnings summary
      const summary = await supabaseApi.earnings.getEarningsSummary(user.id);
      console.log('Earnings summary:', summary);
      setEarningsSummary(summary);
      
      // Load detailed earnings
      const earningsData = await supabaseApi.earnings.getCollectorEarnings(user.id);
      console.log('Detailed earnings:', earningsData);
      setEarnings(earningsData || []);
      
    } catch (error) {
      console.error('Error loading earnings data:', error);
      // Don't show error to user, just log it
    }
  };

  const toggleCollectorStatus = async () => {
    try {
      const newStatus = collectorStatus === 'active' ? 'inactive' : 'active';
      
      // Update collector status in database
      await supabaseApi.auth.updateProfile(user.id, {
        collector_status: newStatus
      });
      
      setCollectorStatus(newStatus);
      setSuccessMessage(`Status updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Reload data to update pending requests visibility
      await loadCollectorData();
    } catch (err) {
      setError('Failed to update status: ' + err.message);
      console.error('Error updating collector status:', err);
    }
  };

  const claimRequest = async (requestId) => {
    try {
      // Check if collector already has active tasks
      if (hasActiveTasks()) {
        const blockingTask = getBlockingTask();
        throw new Error(`You cannot claim new requests while you have an active task (${getTaskDisplayNumber(blockingTask.id)}). Please complete and deliver your current task first.`);
      }
      
      // Find the request to claim
      const request = pendingRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Set the request to claim and load available recycling centers
      setRequestToClaim(request);
      
      // Load recycling centers that accept the request's materials
      const materials = request.items || [];
      console.log('Loading recycling centers for materials:', materials);
      
      // First try to ensure recycling centers exist (will create sample if none found)
      const centersResult = await recyclingCenterService.ensureRecyclingCentersExist();
      console.log('Recycling centers result:', centersResult);
      
      if (centersResult.success && centersResult.data.length > 0) {
        setAvailableCenters(centersResult.data);
        setShowCenterSelection(true);
        addNotification(`Found ${centersResult.data.length} recycling center(s)`, 'success');
      } else {
        // Show specific error message
        const errorMsg = centersResult.error || 'No recycling centers found and unable to create sample data';
        addNotification(`Cannot claim request: ${errorMsg}`, 'error');
        console.error('No recycling centers available:', centersResult);
        
        // Still show modal but with empty state and better messaging
        setAvailableCenters([]);
        setShowCenterSelection(true);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to claim request');
      console.error('Error claiming request:', err);
    }
  };

  const confirmClaimWithCenter = async () => {
    try {
      if (!requestToClaim || !selectedCenter) {
        throw new Error('Missing request or recycling center selection');
      }
      
      // Handle sample data
      if (requestToClaim.id.toString().startsWith('pending')) {
        // Mock functionality for sample data
          const newTask = {
          ...requestToClaim,
            id: `task-${Date.now()}`,
            status: 'assigned',
            collector_id: user.id,
          recycling_center_id: selectedCenter.id,
          recycling_center_name: selectedCenter.name,
          recycling_center_address: selectedCenter.address,
          scheduledDate: requestToClaim.preferredDate,
          scheduledTime: requestToClaim.preferredTime
          };
          
          setTasks(prevTasks => [...prevTasks, newTask]);
        setPendingRequests(prevPending => prevPending.filter(req => req.id !== requestToClaim.id));
        setSuccessMessage(`Request claimed successfully! Delivering to ${selectedCenter.name} (Demo Mode)`);
      } else {
        // Real database operation - assign recycling center and collector
        const result = await recyclingCenterService.assignRecyclingCenter(
          requestToClaim.id, 
          selectedCenter.id, 
          user.id
        );
        
        if (result.success) {
        // Reload data to update both pending requests and assigned tasks
        await loadCollectorData();
          setSuccessMessage(`Request claimed successfully! Delivering to ${selectedCenter.name}`);
        } else {
          throw new Error(result.error);
      }
      }
      
      // Close modal and reset state
      setShowCenterSelection(false);
      setRequestToClaim(null);
      setSelectedCenter(null);
      setAvailableCenters([]);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to claim request');
      console.error('Error claiming request:', err);
    }
  };

  // Helper function to check if collector has active tasks that prevent claiming new ones
  const hasActiveTasks = () => {
    return tasks.some(task => ['assigned', 'in_progress', 'completed', 'delivered'].includes(task.status));
  };

  // Helper function to get the active task that's blocking new claims
  const getBlockingTask = () => {
    return tasks.find(task => ['assigned', 'in_progress', 'completed', 'delivered'].includes(task.status));
  };

  const updateTaskStatus = async (taskId, status, notes = '', photoData = null) => {
    try {
      // Handle sample data
      if (taskId.toString().startsWith('sample') || taskId.toString().startsWith('task-')) {
        // Mock functionality for sample data
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  status, 
                  notes, 
                  collection_photos: photoData ? uploadedPhotos.map(p => p.name) : task.collection_photos,
                  updated_at: new Date().toISOString() 
                }
              : task
          )
        );
        setSuccessMessage(`Task status updated to ${status} (Demo Mode)`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        // Real database operation - use collector_notes instead of notes
        const updateData = { status };
        if (notes) {
          updateData.collector_notes = notes;
        }
        
        // Add photo information if provided
        if (photoData && uploadedPhotos.length > 0) {
          updateData.collection_photos = uploadedPhotos.map(p => p.name); // URLs are now stored in the name field
          updateData.photo_count = uploadedPhotos.length;
          updateData.photos_uploaded_at = new Date().toISOString();
        }
        
        // Add completion timestamp for completed status
        if (status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
        
        await supabaseApi.collection.updateRequest(taskId, updateData);
        await loadCollectorData();
        
        // Reload earnings data if task was completed or delivered (potential commission)
        if (['completed', 'delivered', 'confirmed', 'processed'].includes(status)) {
          await loadEarningsData();
        }
        
        setSuccessMessage(`Task status updated to ${status}`);
      }
      
      // Close modals if task is completed
      if (status === 'completed') {
        setShowTaskDetails(false);
        setSelectedTask(null);
        // Clear uploaded photos after successful completion
        setUploadedPhotos([]);
      }
    } catch (err) {
      setError('Failed to update task status: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleIssueReport = async (e) => {
    e.preventDefault();
    try {
      // Create structured issue data
      const issueData = {
        taskId: selectedTask.id,
        collectorId: user.id,
        collectorName: user.name,
        type: issueForm.type,
        description: issueForm.description,
        severity: issueForm.severity,
        reportedAt: new Date().toISOString(),
        customerName: selectedTask.customerName,
        customerPhone: selectedTask.customerPhone,
        address: selectedTask.address
      };
      
      console.log('Issue reported:', issueData);
      
      // Create structured collector notes with issue data
      const structuredNotes = JSON.stringify({
        issueType: issueForm.type,
        severity: issueForm.severity,
        description: issueForm.description,
        reportedAt: new Date().toISOString(),
        collectorId: user.id,
        collectorName: user.name
      });
      
      // Update task with structured issue notes
      await updateTaskStatus(selectedTask.id, 'issue_reported', structuredNotes);
      
      setShowIssueReport(false);
      setIssueForm({ type: '', description: '', severity: 'medium' });
      
      // Show success notification
      addNotification('Issue reported successfully. Admin has been notified.', 'success');
    } catch (err) {
      console.error('Error reporting issue:', err);
      setError('Failed to report issue: ' + err.message);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Please upload only images under 5MB.');
      return;
    }

    try {
      // Upload files to Supabase Storage
      const uploadResult = await supabaseApi.collection.uploadCollectionPhotos(validFiles, user.id);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload photos');
      }

      // Create photo objects with URLs
      const newPhotos = validFiles.map((file, index) => ({
        id: Date.now() + Math.random(),
        file,
        url: uploadResult.data[index], // Use the actual public URL from Supabase
        name: uploadResult.data[index] // Store the full URL instead of just filename
      }));

      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError('Failed to upload photos: ' + error.message);
    }
  };

  const handleDeliveryDetailsUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingDelivery(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Updating delivery details for task:', selectedTask.id);
      
      // Validate recycling center assignment
      if (!selectedTask.recycling_center_id) {
        throw new Error('No recycling center assigned to this task. Please contact support.');
      }
      
      // Create or update delivery record
      const deliveryData = {
        collection_request_id: selectedTask.id,
        collector_id: user.id,
        recycling_center_id: selectedTask.recycling_center_id,
        item_condition: deliveryForm.condition,
        collector_notes: deliveryForm.notes,
        delivery_photos: uploadedPhotos.map(p => p.name), // URLs are now stored in the name field
        status: 'delivered', // Waiting for recycling center confirmation
        delivered_at: new Date().toISOString()
      };
      
      console.log('Creating delivery record:', deliveryData);
      
      // Try to create the delivery record
      let deliveryResponse;
      try {
        deliveryResponse = await supabaseApi.delivery.createDelivery(deliveryData);
        console.log('Delivery record created:', deliveryResponse);
      } catch (deliveryError) {
        console.log('Failed to create delivery record:', deliveryError.message);
        // Continue with task status update even if delivery record fails
      }
      
      // Update the collection request status to 'delivered'
      await supabaseApi.collection.updateRequest(selectedTask.id, {
        status: 'delivered',
        collector_notes: deliveryForm.notes,
        completed_at: new Date().toISOString()
      });
      
      console.log('Task status updated to delivered');
      
      // Process Sri Lankan payment structure when delivered to recycling center
      if (selectedTask.total_amount) {
        try {
          // Process collector commission (30%)
          const commissionResult = await paidCollectionService.processCollectorCommission(
            selectedTask.id, 
            user.id, 
            selectedTask.total_amount
          );
          
          if (commissionResult.success) {
            console.log('Collector commission processed:', commissionResult.commission);
          }
          
          // Process sustainability fund and platform revenue
          const paymentResult = await paidCollectionService.processPaymentCompletion(
            selectedTask.id,
            selectedTask.user_id,
            selectedTask.total_amount
          );
          
          if (paymentResult.success) {
            console.log('Payment completion processed successfully');
            
            // Send sustainability fund notification to customer
            const sustainabilityAmount = paidCollectionService.calculateSustainabilityFund(selectedTask.total_amount);
            await paidCollectionService.sendSustainabilityNotification(
              selectedTask.user_id,
              selectedTask.id,
              sustainabilityAmount
            );
          }
          
        } catch (paymentError) {
          console.error('Error processing payment structure:', paymentError);
          // Continue with the flow even if payment processing fails
        }
      }
      
      // Reload data to reflect changes
      await loadCollectorData();
      
      // Reload earnings data as delivery might trigger commission
      await loadEarningsData();
      
      // Close modal and reset form
      setShowDeliveryConfirm(false);
      setDeliveryForm({ condition: 'good', notes: '' });
      setUploadedPhotos([]);
      setSelectedTask(null);
      
      // Show success message
      setSuccessMessage('Delivery details updated successfully! Task moved to history.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      console.error('Error updating delivery details:', err);
      setError('Failed to update delivery details: ' + err.message);
      
      // Clear error message after 10 seconds
      setTimeout(() => {
        setError('');
      }, 10000);
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      delivered: 'bg-purple-500',
      confirmed: 'bg-emerald-500',
      issue_reported: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      delivered: 'Delivered (Awaiting Confirmation)',
      confirmed: 'Confirmed & Paid',
      issue_reported: 'Issue Reported'
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

  // Helper function to generate user-friendly task numbers
  const getTaskDisplayNumber = (taskId, prefix = 'T') => {
    if (!taskId) return 'N/A';
    
    // For sample/demo tasks, use simple numbers
    if (taskId.toString().startsWith('sample')) {
      const num = taskId.replace('sample-', '');
      return `${prefix}${num.padStart(3, '0')}`;
    }
    
    // For UUIDs, create a short meaningful number
    const shortId = taskId.toString().slice(-6).toUpperCase();
    
    // Convert last 6 characters to a number for better readability
    const numericPart = parseInt(taskId.toString().slice(-6), 16) % 999999;
    return `${prefix}${numericPart.toString().padStart(6, '0')}`;
  };

  // Helper function for collection request numbers  
  const getCollectionNumber = (requestId) => {
    return getTaskDisplayNumber(requestId, 'CR');
  };

  // Helper function to get a short display version for UI badges
  const getShortTaskNumber = (taskId, prefix = 'T') => {
    if (!taskId) return 'N/A';
    
    if (taskId.toString().startsWith('sample')) {
      const num = taskId.replace('sample-', '');
      return `${prefix}${num}`;
    }
    
    const numericPart = parseInt(taskId.toString().slice(-4), 16) % 9999;
    return `${prefix}${numericPart}`;
  };

  // Reschedule appointment functionality
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    taskId: '',
    newDate: '',
    newTime: '',
    reason: ''
  });

  const handleRescheduleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First get current values to save original schedule if this is the first reschedule
      const { data: currentData, error: fetchError } = await supabase
        .from('collection_requests')
        .select('scheduled_date, scheduled_time, original_scheduled_date, original_scheduled_time, reschedule_count')
        .eq('id', rescheduleForm.taskId)
        .single();

      if (fetchError) throw fetchError;

      const updateData = {
        scheduled_date: rescheduleForm.newDate,
        scheduled_time: rescheduleForm.newTime,
        reschedule_reason: rescheduleForm.reason,
        last_rescheduled_at: new Date().toISOString(),
        reschedule_count: (currentData.reschedule_count || 0) + 1,
        updated_at: new Date().toISOString()
      };

      // Set original values if this is the first reschedule (save current values as original)
      if (!currentData.original_scheduled_date && currentData.scheduled_date) {
        updateData.original_scheduled_date = currentData.scheduled_date;
        updateData.original_scheduled_time = currentData.scheduled_time;
      }

      console.log('Updating collection request with reschedule data:', updateData);

      const { data, error } = await supabase
        .from('collection_requests')
        .update(updateData)
        .eq('id', rescheduleForm.taskId)
        .eq('collector_id', user.id);

      if (error) throw error;

      addNotification('Appointment rescheduled successfully! Customer will be notified.', 'success');
      setShowRescheduleModal(false);
      setRescheduleForm({ taskId: '', newDate: '', newTime: '', reason: '' });
      
      // Reload data
      await loadCollectorData();
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      addNotification('Failed to reschedule appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (task) => {
    setRescheduleForm({
      taskId: task.id,
      newDate: task.scheduledDate,
      newTime: task.scheduledTime,
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Dashboard</h3>
          <p className="text-gray-600">Getting your tasks and requests ready...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
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
                    <h2 className="text-white font-bold text-lg">Collector Hub</h2>
                    <p className="text-gray-400 text-sm">Collection Management</p>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-colors"
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>
              </div>

              {/* Status Toggle */}
              {!sidebarCollapsed && (
                <div className="mb-6">
                  <button
                    onClick={toggleCollectorStatus}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ${
                      collectorStatus === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-gray-400 border border-slate-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        collectorStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                      }`}></div>
                      <span className="font-medium capitalize">{collectorStatus}</span>
                    </div>
                    <span className="text-xs">
                      {collectorStatus === 'active' ? 'Online' : 'Offline'}
                    </span>
                  </button>
                </div>
              )}

              <nav className="space-y-2">
                {[
                                  { id: 'overview', label: 'Dashboard', icon: Truck },
                { id: 'pending', label: 'Available Jobs', icon: AlertTriangle, count: collectorStatus === 'active' ? pendingRequests.length : 0 },
                { id: 'tasks', label: 'My Tasks', icon: Package, count: tasks.filter(t => ['assigned', 'in_progress', 'completed'].includes(t.status)).length },
                { id: 'earnings', label: 'My Earnings', icon: DollarSign },
                { id: 'schedule', label: 'Today\'s Schedule', icon: Calendar, count: tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length },
                { id: 'history', label: 'Completed Jobs', icon: FileText },
                { id: 'profile', label: 'Settings', icon: Settings }
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
                  <div className="border-t border-slate-700 pt-4 space-y-2">
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
              )}

              {sidebarCollapsed && (
                <div className="absolute bottom-4 left-2 right-2">
                  <div className="border-t border-slate-700 pt-4 space-y-2">
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

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {/* Enhanced Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <AnimatedGradientText className="text-3xl font-bold mb-2">
                    Collector Dashboard
                  </AnimatedGradientText>
                  <p className="text-gray-300">Welcome back, {user?.name}! Manage your collection tasks and earnings.</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Today's Date</p>
                    <p className="text-white font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Bell className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" 
                           onClick={() => setActiveTab('tasks')} />
                      {tasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length > 0 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                      <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="text-sm">
                        <p className="text-white font-medium">{user?.name}</p>
                        <p className="text-gray-400">Collection Specialist</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-emerald-400">
                      <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">System Online</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Active Tasks: {tasks.filter(t => ['assigned', 'in_progress', 'completed'].includes(t.status)).length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Available Jobs: {collectorStatus === 'active' ? pendingRequests.length : 0}</span>
                </div>
              </div>
            </div>
      {/* Enhanced Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm animate-slide-down">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-red-100 rounded-full">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Connection Issue</p>
                <p className="text-sm">{error}</p>
                {(tasks.length > 0 || pendingRequests.length > 0) && (
                  <p className="text-xs mt-1 text-red-600">
                    📡 Using demo data - Dashboard fully functional for testing
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 shadow-sm animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-400 hover:text-green-600 transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Demo Mode Notification - Enhanced */}
      {(tasks.some(t => t.id?.toString().startsWith('sample')) || 
        pendingRequests.some(p => p.id?.toString().startsWith('pending'))) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-800">🚀 Demo Mode Active</p>
                <p className="text-sm text-blue-600 mt-1">
                  You're viewing sample data. All features work perfectly for testing! 
                  Try claiming jobs, updating statuses, and exploring the interface.
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-blue-500">
                  <span>✅ Fully Functional</span>
                  <span>🔄 Real-time Updates</span>
                  <span>📱 Mobile Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Enhanced Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Collector'}! 👋</h2>
                    <p className="text-emerald-100 text-lg">
                      You're currently <span className="font-semibold">{collectorStatus}</span>
                      {collectorStatus === 'active' && ' and ready for collections'}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Truck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {collectorStatus === 'inactive' && (
                  <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-xl">
                    <p className="text-emerald-100 mb-3">🚀 Ready to start collecting? Go active to see available jobs!</p>
                    <button
                      onClick={toggleCollectorStatus}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                    >
                      Go Active Now
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Stats - Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                     onClick={() => setActiveTab('pending')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${collectorStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className="text-orange-500 text-sm font-medium">Available</span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">New Jobs</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {collectorStatus === 'active' ? pendingRequests.length : 0}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {collectorStatus === 'active' ? 'ready to claim' : 'go active to see jobs'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                     onClick={() => setActiveTab('tasks')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-500 text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">My Tasks</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {tasks.filter(t => ['assigned', 'in_progress', 'completed', 'delivered'].includes(t.status)).length}
                  </p>
                  <p className="text-gray-400 text-xs">in progress</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                     onClick={() => setActiveTab('earnings')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500 text-sm font-medium">
                        {earningsSummary.pendingTransactions > 0 ? 'Pending' : 'Updated'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Total Earnings</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    LKR {earningsSummary.totalEarnings.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    LKR {earningsSummary.paidEarnings.toFixed(2)} total earned
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                     onClick={toggleCollectorStatus}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      collectorStatus === 'active' ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }`}>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        collectorStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}>
                        <div className="h-3 w-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${
                        collectorStatus === 'active' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {collectorStatus === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Status</h3>
                  <p className={`text-3xl font-bold mb-1 ${
                    collectorStatus === 'active' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {collectorStatus === 'active' ? 'ACTIVE' : 'OFFLINE'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {collectorStatus === 'active' ? 'receiving jobs' : 'click to go active'}
                  </p>
                </div>
            </div>

              {/* Today's Tasks Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
                  <span className="text-sm text-gray-500">
                    {tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length} scheduled
                  </span>
          </div>
                
                <div className="space-y-4">
                  {tasks
                    .filter(task => task.scheduledDate === new Date().toISOString().split('T')[0])
                    .slice(0, 3)
                    .map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-lg">{task.scheduledTime}</div>
                          <div>
                            <p className="text-gray-900 font-medium">{task.customerName}</p>
                            <p className="text-gray-500 text-sm">{task.address}</p>
      </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                      </div>
                    ))}
                  
                  {tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}



          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">My Earnings</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Track your commission payments</span>
                  <button 
                    onClick={loadEarningsData}
                    className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Earnings Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        LKR {earningsSummary.totalEarnings.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Total Earnings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        LKR {earningsSummary.paidEarnings.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Paid Out</p>
                      <p className="text-xs text-emerald-600">
                        {earningsSummary.paidTransactions} payment{earningsSummary.paidTransactions !== 1 ? 's' : ''} received
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {earningsSummary.paidTransactions}
                      </p>
                      <p className="text-sm text-gray-500">Total Payments</p>
                      <p className="text-xs text-blue-600">
                        commission payments received
                      </p>
                    </div>
                  </div>
                </div>
              </div>



              {/* Earnings History */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h4>
                
                {earnings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Earnings Yet</h3>
                    <p className="text-gray-600">Complete and deliver collection requests to start earning commissions!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-mono font-bold">
                                {getShortTaskNumber(earning.collection_request?.id, 'CR')}
                              </span>
                              <p className="font-medium text-gray-900">Collection Request</p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {earning.collection_request?.address || 'Address not available'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {earning.created_at ? new Date(earning.created_at).toLocaleDateString() : 'Date not available'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            LKR {parseFloat(earning.amount || 0).toFixed(2)}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            ✅ Paid
                          </p>
                          {earning.paid_at && (
                            <p className="text-xs text-gray-400">
                              Paid: {new Date(earning.paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile & Settings Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Profile & Settings</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Manage your account settings</span>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Small Van</option>
                      <option>Large Van</option>
                      <option>Truck</option>
                      <option>Pickup</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                    Update Profile
            </button>
                </div>
      </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">New Task Notifications</p>
                      <p className="text-sm text-gray-500">Get notified when new tasks are assigned</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Active Task Warning */}
          {collectorStatus === 'active' && hasActiveTasks() && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 border-yellow-500 mb-6">
              <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Task in Progress</h3>
                      <p className="text-gray-600 mb-3">
                    You currently have an active task ({getTaskDisplayNumber(getBlockingTask().id)}) that must be completed and delivered 
                    before you can claim new requests.
                  </p>
                  <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Current Task Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(getBlockingTask().status)}`}>
                      {getStatusLabel(getBlockingTask().status)}
                    </span>
                  </div>
                </div>
              </div>
                </div>
          )}
          
          {collectorStatus === 'inactive' ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">You're Currently Inactive</h3>
                  <p className="text-gray-600 mb-6">Set your status to "Active" to see and claim pending pickup requests.</p>
              <button
                onClick={toggleCollectorStatus}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                Go Active
              </button>
                </div>
          ) : pendingRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">All pickup requests have been claimed. Check back later for new requests.</p>
                </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          <span className="text-emerald-600 font-semibold text-sm">
                            {request.customerName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-mono font-bold">
                            {getShortTaskNumber(request.id, 'CR')}
                          </span>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {request.customerName}
                        </h3>
                        </div>
                        <p className="text-sm text-emerald-600 font-medium">📦 New Collection Request</p>
                        <p className="text-xs text-gray-500">📞 {request.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {request.priority === 'high' ? '🔥 HIGH' : 
                         request.priority === 'medium' ? '⚡ MEDIUM' : '📋 LOW'}
                      </span>

                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{request.address}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">{request.preferredDate} • {request.preferredTime}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">{request.customerPhone}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Weight className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">Value: LKR {request.totalAmount || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.items?.map((item, index) => (
                            <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {request.specialInstructions && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-900">{request.specialInstructions}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={() => claimRequest(request.id)}
                      disabled={hasActiveTasks()}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        hasActiveTasks() 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      <Package className="h-4 w-4" />
                      <span>{hasActiveTasks() ? 'Busy - Cannot Claim' : '✨ Claim This Job'}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedTask(request);
                        setShowTaskDetails(true);
                      }}
                      className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all font-medium border border-blue-200 hover:border-blue-300"
                    >
                      👁️ Details
                    </button>
                  </div>
                  
                  {hasActiveTasks() && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <p className="text-yellow-700 text-xs">
                        ⚠️ Complete your current task ({getTaskDisplayNumber(getBlockingTask().id)}) before claiming new requests
                      </p>
                    </div>
                  )}
                    </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {tasks.filter(task => !['delivered', 'confirmed', 'processed'].includes(task.status)).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Tasks</h3>
                  <p className="text-gray-600">You don't have any assigned tasks at the moment.</p>
                </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tasks.filter(task => !['delivered', 'confirmed', 'processed'].includes(task.status)).map(task => (
                <div key={task.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)} ${
                          task.status === 'in_progress' ? 'animate-pulse' : ''
                        }`}></div>
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <span className="text-blue-600 font-semibold text-sm">
                            {task.customerName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono font-bold">
                            {getShortTaskNumber(task.id)}
                          </span>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {task.customerName}
                        </h3>
                        </div>
                        <p className="text-sm text-blue-600 font-medium">
                          {task.status === 'assigned' ? '📋 Ready to Start' :
                           task.status === 'in_progress' ? '🚛 In Progress' :
                           task.status === 'completed' ? '✅ Ready for Delivery' : getStatusLabel(task.status)}
                        </p>
                        <p className="text-xs text-gray-500">📞 {task.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {task.priority === 'high' ? '🔥 HIGH' : 
                         task.priority === 'medium' ? '⚡ MEDIUM' : '📋 LOW'}
                      </span>

                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{task.address}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">{task.scheduledDate} • {task.scheduledTime}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">{task.customerPhone}</span>
                    </div>
                    
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Weight className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">Value: LKR {task.totalAmount || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {task.items?.map((item, index) => (
                            <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {task.specialInstructions && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-900">{task.specialInstructions}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetails(true);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all font-medium border border-blue-200 hover:border-blue-300"
                    >
                      👁️ Details
                    </button>

                    {(task.status === 'assigned' || task.status === 'in_progress') && (
                      <button
                        onClick={() => openRescheduleModal(task)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 hover:text-indigo-700 transition-all font-medium border border-indigo-200 hover:border-indigo-300"
                      >
                        📅 Reschedule
                      </button>
                    )}
                    
                    {task.status === 'assigned' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Truck className="h-4 w-4" />
                        <span>🚀 Start Collection</span>
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowPhotoUpload(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>📸 Mark as Collected</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowIssueReport(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium border border-red-600"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span>⚠️ Issue</span>
                        </button>
                      </>
                    )}
                    
                    {task.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDeliveryConfirm(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Package className="h-4 w-4" />
                        <span>📦 Deliver Items</span>
                      </button>
                    )}
                  </div>
                    </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">📅 Today's Schedule</h3>
                <p className="text-blue-100">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length}
                </p>
                <p className="text-blue-100 text-sm">collections</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              {tasks
                .filter(task => task.scheduledDate === new Date().toISOString().split('T')[0])
                .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-100 hover:border-gray-200 group">
                    <div className="flex items-center space-x-4">
                      <div className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg text-lg min-w-[80px] text-center group-hover:bg-emerald-100 transition-colors">
                        {task.scheduledTime}
                      </div>
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <span className="text-blue-600 font-semibold text-sm">
                          {task.customerName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold group-hover:text-blue-700 transition-colors">
                          {task.customerName}
                        </p>
                        <p className="text-gray-500 text-sm">📍 {task.address}</p>
                        <p className="text-gray-400 text-xs">
                          {task.items?.join(', ') || 'Mixed items'} • LKR {task.totalAmount || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'assigned' ? '📋 Ready' :
                         task.status === 'in_progress' ? '🚛 Active' :
                         task.status === 'completed' ? '✅ Done' : task.status}
                      </span>
                      <button
                        onClick={() => openRescheduleModal(task)}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium"
                      >
                        📅
                      </button>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)} ${
                        task.status === 'in_progress' ? 'animate-pulse' : ''
                      }`}></div>
                    </div>
                  </div>
                ))}
              
              {tasks.filter(task => task.scheduledDate === new Date().toISOString().split('T')[0]).length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-emerald-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">🎉 No tasks scheduled for today!</h4>
                  <p className="text-gray-600 mb-4">You're all caught up. Check available jobs to claim new collections.</p>
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
                  >
                    View Available Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* History Tab */}
      {activeTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Task History</h3>
          <div className="space-y-4">
            {tasks
              .filter(task => ['delivered', 'confirmed', 'processed'].includes(task.status))
              .length === 0 ? (
              <div className="text-center py-8">
                    <div className="p-4 bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No completed tasks yet.</p>
              </div>
            ) : (
              tasks
                .filter(task => ['delivered', 'confirmed', 'processed'].includes(task.status))
              .map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono font-bold">
                              {getShortTaskNumber(task.id)}
                            </span>
                            <p className="text-gray-900 font-medium">{task.customerName}</p>
                          </div>
                          <p className="text-gray-600 text-sm">{task.address}</p>
                    <p className="text-gray-500 text-xs">{task.scheduledDate}</p>
                  </div>
                  <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </div>
  
                  </div>
                </div>
                ))
            )}
          </div>
            </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-mono font-bold">
                      {getTaskDisplayNumber(selectedTask.id)}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
                  </div>
              <button
                onClick={() => setShowTaskDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.customerName}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.customerPhone}</p>
                </div>
                <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.address}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedTask.status === 'pending' ? 'Preferred Date' : 'Scheduled Date'}
                  </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.scheduledDate || selectedTask.preferredDate}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedTask.status === 'pending' ? 'Preferred Time' : 'Time Slot'}
                  </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.scheduledTime || selectedTask.preferredTime}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Collection Value</label>
                      <p className="text-gray-900 bg-emerald-50 p-3 rounded-lg font-semibold text-emerald-700">
                        LKR {selectedTask.totalAmount || 'N/A'}
                      </p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <p className={`font-medium ${getPriorityColor(selectedTask.priority)} bg-gray-50 p-3 rounded-lg`}>
                    {selectedTask.priority?.toUpperCase()}
                  </p>
                </div>
                {selectedTask.recycling_center_name && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Recycling Center</label>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <p className="font-medium text-emerald-800">{selectedTask.recycling_center_name}</p>
                      <p className="text-sm text-emerald-600">{selectedTask.recycling_center_address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items to Collect</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.items?.map((item, index) => (
                        <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTask.specialInstructions && (
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.specialInstructions}</p>
                </div>
              )}

              {/* Delivery Status Info */}
              {selectedTask.status === 'completed' && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <p className="text-sm font-medium text-emerald-800">Ready for Delivery</p>
                  </div>
                      <p className="text-xs text-emerald-600">
                    Task completed. Use "Update Delivery Details" to provide actual delivery information and complete the delivery process.
                  </p>
                </div>
              )}

              {/* Commission Status Info */}
              {selectedTask.status === 'delivered' && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <p className="text-sm font-medium text-yellow-800">Awaiting Center Confirmation</p>
                  </div>
                  <p className="text-xs text-yellow-600">
                                            Items delivered to recycling center. Your 30% commission will be processed once the center confirms receipt.
                  </p>
                </div>
              )}

              {selectedTask.status === 'confirmed' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-sm font-medium text-green-800">✅ Commission Paid</p>
                  </div>
                  <p className="text-xs text-green-600">
                                            Recycling center has confirmed receipt. Your 30% commission has been processed and paid.
                  </p>
                </div>
              )}

              {/* Action buttons - only show for assigned/active tasks, not pending requests */}
              {selectedTask.status && selectedTask.status !== 'pending' && (
              <div className="flex space-x-3 pt-4">
                      <button
                  onClick={() => {
                    setShowPhotoUpload(true);
                  }}
                        className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                      </button>
                
                <button
                  onClick={() => {
                    setShowIssueReport(true);
                  }}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">📸 Collection Evidence</h3>
                <p className="text-sm text-gray-500 mt-1">Upload photos to document the collected items</p>
              </div>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Drag and drop photos or click to select</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                      className="cursor-pointer bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Select Photos
                </label>
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                      <p className="text-gray-900 mb-2 font-medium">Uploaded Photos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedPhotos.map(photo => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.name}
                              className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter(p => p.id !== photo.id))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPhotoUpload(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (uploadedPhotos.length === 0) {
                      addNotification('Please upload at least one photo to mark as collected', 'error');
                      return;
                    }
                    
                    try {
                      // Update task status to completed with photo evidence
                      await updateTaskStatus(
                        selectedTask.id, 
                        'completed', 
                        `Collection completed with ${uploadedPhotos.length} photos uploaded`, 
                        true // photoData flag
                      );
                      
                      // Close modal
                      setShowPhotoUpload(false);
                      setSelectedTask(null);
                      
                      addNotification('Collection marked as completed with photo evidence!', 'success');
                    } catch (error) {
                      console.error('Error completing collection:', error);
                      addNotification('Error completing collection: ' + error.message, 'error');
                    }
                  }}
                  disabled={uploadedPhotos.length === 0}
                  className={`flex-1 px-4 py-2 rounded-xl transition-colors font-medium ${
                    uploadedPhotos.length > 0
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ✅ Mark as Collected ({uploadedPhotos.length} photos)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Report Modal */}
      {showIssueReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Report Issue</h3>
              <button
                onClick={() => setShowIssueReport(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueReport} className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={issueForm.type}
                  onChange={(e) => setIssueForm({...issueForm, type: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="access">Access Problem</option>
                  <option value="customer">Customer Not Available</option>
                  <option value="items">Items Not Ready</option>
                  <option value="safety">Safety Concern</option>
                  <option value="vehicle">Vehicle Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={issueForm.severity}
                  onChange={(e) => setIssueForm({...issueForm, severity: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe the issue in detail..."
                  required
                />
        </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIssueReport(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Report Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Details Update Modal */}
      {showDeliveryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                    <h3 className="text-xl font-semibold text-gray-900">Update Delivery Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Provide actual delivery information for the recycling center</p>
              </div>
              <button
                onClick={() => setShowDeliveryConfirm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliveryDetailsUpdate} className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Condition</label>
                <select
                  value={deliveryForm.condition}
                  onChange={(e) => setDeliveryForm({...deliveryForm, condition: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                <textarea
                  value={deliveryForm.notes}
                  onChange={(e) => setDeliveryForm({...deliveryForm, notes: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Any additional notes about the delivery..."
                />
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                      <p className="text-sm text-gray-700 mb-2 font-medium">Attached Photos: {uploadedPhotos.length}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryConfirm(false)}
                  disabled={isUpdatingDelivery}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDelivery}
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdatingDelivery ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Delivery Details'
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
      )}

      {/* Recycling Center Selection Modal */}
      {showCenterSelection && requestToClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Choose Recycling Center</h3>
                <p className="text-sm text-gray-500 mt-1">Select where you'll deliver the collected items</p>
        </div>
              <button
                onClick={() => {
                  setShowCenterSelection(false);
                  setRequestToClaim(null);
                  setSelectedCenter(null);
                  setAvailableCenters([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Collection Request Details</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Customer:</strong> {requestToClaim.customerName}</p>
                <p><strong>Address:</strong> {requestToClaim.address}</p>
                <p><strong>Items:</strong> {requestToClaim.items?.join(', ')}</p>

              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Available Recycling Centers</h4>
              {availableCenters.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Recycling Centers Available</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    No recycling centers are currently available. This could be due to:
                  </p>
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    <li>• No recycling centers registered in the system</li>
                    <li>• All centers are currently inactive</li>
                    <li>• Database connection issues</li>
                  </ul>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-700">
                      <strong>For Admins:</strong> Add profiles with role='RECYCLING_CENTER' and status='active' to the profiles table
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700">
                      <strong>Auto-Fix:</strong> The system will automatically create a sample recycling center if none exist
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableCenters.map(center => (
                    <div
                      key={center.id}
                      onClick={() => setSelectedCenter(center)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedCenter?.id === center.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{center.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{center.address}</p>
                          <p className="text-sm text-gray-500 mt-1">{center.phone}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < Math.floor(center.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">({center.reviews} reviews)</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {center.materials.map((material, index) => (
                              <span key={index} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
                                {material}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          {selectedCenter?.id === center.id && (
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCenterSelection(false);
                  setRequestToClaim(null);
                  setSelectedCenter(null);
                  setAvailableCenters([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClaimWithCenter}
                disabled={!selectedCenter}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Claim Request & Assign Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">📅 Reschedule Appointment</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, newDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleForm.newTime}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, newTime: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Reschedule</label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Please explain why you need to reschedule..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Reschedule Appointment'
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
    </>
  );
};

export default CollectorDashboard;
