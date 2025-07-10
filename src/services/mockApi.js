import { users } from '../data/users';
import { collectionRequests, collectorTasks, deliveries, requestStatuses } from '../data/collectionRequests';
import { recyclingCenters, centerStats, centerCapacity, materialTypes, centerReviews } from '../data/recyclingCenters';

// Simulated API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate unique IDs
const generateId = () => Date.now() + Math.random();

// Mock geocoding service - in real app, use Google Maps Geocoding API, Mapbox, or similar
const geocodeAddress = async (address) => {
  await delay(500); // Simulate API call
  
  // Mock geocoding - in real app, this would call a geocoding service
  // For demo purposes, we'll create realistic coordinates based on common city names
  const cityCoordinates = {
    'seattle': [47.6062, -122.3321],
    'portland': [45.5152, -122.6784],
    'vancouver': [45.6387, -122.6615],
    'tacoma': [47.2529, -122.4443],
    'bellevue': [47.6101, -122.2015],
    'spokane': [47.6587, -117.4260],
    'everett': [47.9790, -122.2021],
    'kent': [47.3809, -122.2348],
    'renton': [47.4829, -122.2171],
    'federal way': [47.3223, -122.3126]
  };
  
  // Try to match city name in address
  const addressLower = address.toLowerCase();
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (addressLower.includes(city)) {
      // Add small random offset to simulate exact address location
      return [
        coords[0] + (Math.random() - 0.5) * 0.01, // ~0.5 mile radius
        coords[1] + (Math.random() - 0.5) * 0.01
      ];
    }
  }
  
  // Default to Seattle area with random offset if no city match
  return [
    47.6062 + (Math.random() - 0.5) * 0.1,
    -122.3321 + (Math.random() - 0.5) * 0.1
  ];
};

export const mockApi = {
  // Authentication
  login: async (email, password) => {
    await delay(500);
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  },

  register: async (userData) => {
    await delay(500);
    
    // Check if user already exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      status: userData.role === 'COLLECTOR' ? 'pending_approval' : 'active'
    };
    
    // Add to users array (in real app, this would be saved to database)
    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
  },

  // Collection Requests
  getCollectionRequests: async (userId = null, status = null) => {
    await delay(300);
    
    let requests = [...collectionRequests];
    
    if (userId) {
      requests = requests.filter(req => req.userId === userId);
    }
    
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    
    return { requests };
  },

  createCollectionRequest: async (requestData) => {
    await delay(800);
    
    const newRequest = {
      id: generateId(),
      ...requestData,
      status: 'pending',
      collectorId: null,
      recyclingCenterId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 'medium'
    };
    
    collectionRequests.push(newRequest);
    return { request: newRequest };
  },

  updateCollectionRequestStatus: async (requestId, status, notes = '') => {
    await delay(400);
    
    const requestIndex = collectionRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    
    collectionRequests[requestIndex] = {
      ...collectionRequests[requestIndex],
      status,
      updatedAt: new Date().toISOString(),
      ...(notes && { collectorNotes: notes }),
      ...(status === 'completed' && { completedAt: new Date().toISOString() })
    };
    
    return { request: collectionRequests[requestIndex] };
  },

  assignCollector: async (requestId, collectorId) => {
    await delay(400);
    
    const requestIndex = collectionRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    
    collectionRequests[requestIndex] = {
      ...collectionRequests[requestIndex],
      collectorId,
      status: 'assigned',
      updatedAt: new Date().toISOString()
    };
    
    return { request: collectionRequests[requestIndex] };
  },

  // Collector Tasks
  getCollectorTasks: async (collectorId, status = null) => {
    await delay(300);
    
    let tasks = collectorTasks.filter(task => task.collectorId === collectorId);
    
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    return { tasks };
  },

  updateTaskStatus: async (taskId, status, notes = '') => {
    await delay(400);
    
    const taskIndex = collectorTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    collectorTasks[taskIndex] = {
      ...collectorTasks[taskIndex],
      status,
      updatedAt: new Date().toISOString(),
      ...(notes && { notes }),
      ...(status === 'in_progress' && { startedAt: new Date().toISOString() }),
      ...(status === 'completed' && { completedAt: new Date().toISOString() })
    };
    
    return { task: collectorTasks[taskIndex] };
  },

  // Recycling Centers
  getRecyclingCenters: async (filters = {}) => {
    await delay(300);
    
    let centers = [...recyclingCenters];
    
    if (filters.materials && filters.materials.length > 0) {
      centers = centers.filter(center => 
        filters.materials.every(material => center.materials.includes(material))
      );
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      centers = centers.filter(center => 
        center.name.toLowerCase().includes(searchTerm) ||
        center.address.toLowerCase().includes(searchTerm)
      );
    }
    
    return { centers };
  },

  addRecyclingCenter: async (centerData) => {
    await delay(1000);
    
    // Geocode the address to get coordinates
    const coordinates = await geocodeAddress(centerData.address);
    
    const newCenter = {
      id: generateId(),
      ...centerData,
      coordinates,
      rating: 0,
      reviews: 0,
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    };
    
    recyclingCenters.push(newCenter);
    return { center: newCenter };
  },

  getCenterStats: async (centerId) => {
    await delay(300);
    
    const stats = centerStats.find(stat => stat.centerId === centerId);
    if (!stats) {
      throw new Error('Center stats not found');
    }
    
    return { stats };
  },

  getCenterCapacity: async (centerId) => {
    await delay(200);
    
    const capacity = centerCapacity.find(cap => cap.centerId === centerId);
    if (!capacity) {
      throw new Error('Center capacity not found');
    }
    
    return { capacity };
  },

  // Deliveries
  getDeliveries: async (centerId = null, status = null) => {
    await delay(300);
    
    let centerDeliveries = [...deliveries];
    
    if (centerId) {
      centerDeliveries = centerDeliveries.filter(delivery => delivery.recyclingCenterId === centerId);
    }
    
    if (status) {
      centerDeliveries = centerDeliveries.filter(delivery => delivery.status === status);
    }
    
    return { deliveries: centerDeliveries };
  },

  confirmDelivery: async (deliveryId, actualWeight, processingNotes) => {
    await delay(500);
    
    const deliveryIndex = deliveries.findIndex(delivery => delivery.id === deliveryId);
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found');
    }
    
    deliveries[deliveryIndex] = {
      ...deliveries[deliveryIndex],
      status: 'delivered',
      actualWeight,
      processingNotes,
      deliveredAt: new Date().toISOString()
    };
    
    return { delivery: deliveries[deliveryIndex] };
  },

  updateProcessingStatus: async (deliveryId, status, notes) => {
    await delay(400);
    
    const deliveryIndex = deliveries.findIndex(delivery => delivery.id === deliveryId);
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found');
    }
    
    deliveries[deliveryIndex] = {
      ...deliveries[deliveryIndex],
      processingStatus: status,
      processingNotes: notes,
      ...(status === 'processed' && { processedAt: new Date().toISOString() })
    };
    
    return { delivery: deliveries[deliveryIndex] };
  },

  // Feedback
  submitFeedback: async (feedbackData) => {
    await delay(600);
    
    const feedback = {
      id: generateId(),
      ...feedbackData,
      createdAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    // In real app, this would be saved to database
    console.log('Feedback submitted:', feedback);
    
    return { feedback };
  },

  // Admin functions
  getPendingRegistrations: async () => {
    await delay(400);
    
    const pendingUsers = users.filter(user => user.status === 'pending_approval');
    return { registrations: pendingUsers };
  },

  getAllUsers: async () => {
    await delay(300);
    
    // Return all users without passwords
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return { users: usersWithoutPasswords };
  },

  approveRegistration: async (userId, approved, reason = '') => {
    await delay(500);
    
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      status: approved ? 'active' : 'rejected',
      approvedAt: new Date().toISOString(),
      ...(reason && { rejectionReason: reason })
    };
    
    return { user: users[userIndex] };
  },

  getSystemStats: async () => {
    await delay(400);
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalRequests: collectionRequests.length,
      completedRequests: collectionRequests.filter(r => r.status === 'completed').length,
      totalCenters: recyclingCenters.length,
      activeCenters: recyclingCenters.filter(c => c.status === 'active').length,
      totalProcessed: centerStats.reduce((sum, stat) => sum + stat.totalProcessed, 0),
      co2Saved: centerStats.reduce((sum, stat) => sum + stat.co2Reduced, 0)
    };
    
    return { stats };
  },

  // Material Types
  getMaterialTypes: async () => {
    await delay(200);
    return { materials: materialTypes };
  },

  // Reviews
  getCenterReviews: async (centerId) => {
    await delay(300);
    
    const reviews = centerReviews.filter(review => review.centerId === centerId);
    return { reviews };
  },

  submitCenterReview: async (reviewData) => {
    await delay(500);
    
    const review = {
      id: generateId(),
      ...reviewData,
      date: new Date().toISOString(),
      verified: true
    };
    
    centerReviews.push(review);
    return { review };
  },

  // User Profile
  updateUserProfile: async (userId, profileData) => {
    await delay(400);
    
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { user: userWithoutPassword };
  },

  // Notifications (mock)
  getNotifications: async (userId) => {
    await delay(300);
    
    // Mock notifications based on user's requests and role
    const userRequests = collectionRequests.filter(req => req.userId === userId);
    const notifications = userRequests.map(req => ({
      id: generateId(),
      type: 'status_update',
      title: `Request #${req.id} Status Update`,
      message: `Your request status has been updated to: ${req.status}`,
      read: false,
      createdAt: req.updatedAt
    }));
    
    return { notifications };
  },

  markNotificationRead: async (notificationId) => {
    await delay(200);
    // Mock implementation
    return { success: true };
  },

  // Collector Management Functions
  getPendingCollectors: async () => {
    await delay(300);
    
    const pendingCollectors = users.filter(user => 
      user.role === 'COLLECTOR' && user.status === 'pending_approval'
    );
    
    // Remove passwords from response
    const sanitizedCollectors = pendingCollectors.map(({ password, ...user }) => user);
    
    return { collectors: sanitizedCollectors };
  },

  approveCollector: async (collectorId, adminNotes = '') => {
    await delay(500);
    
    const userIndex = users.findIndex(user => user.id === collectorId);
    if (userIndex === -1) {
      throw new Error('Collector not found');
    }
    
    if (users[userIndex].role !== 'COLLECTOR') {
      throw new Error('User is not a collector');
    }
    
    // Update user status
    users[userIndex] = {
      ...users[userIndex],
      status: 'active',
      approvedAt: new Date().toISOString(),
      adminNotes
    };
    
    // Send approval email (simulated)
    await mockApi.sendCollectorApprovalEmail(users[userIndex], 'approved');
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { collector: userWithoutPassword };
  },

  rejectCollector: async (collectorId, rejectionReason = '') => {
    await delay(500);
    
    const userIndex = users.findIndex(user => user.id === collectorId);
    if (userIndex === -1) {
      throw new Error('Collector not found');
    }
    
    if (users[userIndex].role !== 'COLLECTOR') {
      throw new Error('User is not a collector');
    }
    
    // Update user status
    users[userIndex] = {
      ...users[userIndex],
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason
    };
    
    // Send rejection email (simulated)
    await mockApi.sendCollectorApprovalEmail(users[userIndex], 'rejected');
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { collector: userWithoutPassword };
  },

  sendCollectorApprovalEmail: async (collector, decision) => {
    await delay(800); // Simulate email sending time
    
    console.log(`📧 Email Notification Sent:`);
    console.log(`To: ${collector.email}`);
    console.log(`Subject: ${decision === 'approved' ? 'Welcome to EcoTech - Application Approved!' : 'EcoTech Application Update'}`);
    
    if (decision === 'approved') {
      console.log(`
        Dear ${collector.name},

        🎉 Congratulations! Your application to become a waste collector with EcoTech has been APPROVED!

        Welcome to our team! You can now:
        ✅ Log in to your collector dashboard
        ✅ Start accepting collection requests
        ✅ Track your earnings and performance
        ✅ Access collector training materials

        Next Steps:
        1. Log in to your account at ${window.location.origin}/login
        2. Complete your profile setup
        3. Start collecting and make a difference!

        Service Area: ${collector.serviceArea || collector.coverageArea || 'Not specified'}
        Vehicle Type: ${collector.vehicleType || 'Not specified'}

        Thank you for joining our mission to create a cleaner, more sustainable future!

        Best regards,
        The EcoTech Team
        careers@ecotech.com
      `);
    } else {
      console.log(`
        Dear ${collector.name},

        Thank you for your interest in becoming a waste collector with EcoTech.

        After careful review, we regret to inform you that we cannot approve your application at this time.

        ${collector.rejectionReason ? `Reason: ${collector.rejectionReason}` : ''}

        We encourage you to reapply in the future when you meet our requirements. If you have any questions, please don't hesitate to contact us.

        Thank you for your interest in environmental sustainability.

        Best regards,
        The EcoTech Team
        careers@ecotech.com
      `);
    }
    
    // In a real application, this would integrate with:
    // - SendGrid, Mailgun, or AWS SES for email delivery
    // - Email templates stored in the database
    // - Proper error handling and retry logic
    
    return { 
      success: true, 
      messageId: `msg_${Date.now()}`,
      recipient: collector.email,
      subject: decision === 'approved' ? 'Welcome to EcoTech - Application Approved!' : 'EcoTech Application Update'
    };
  },

  // Get all collectors (for admin dashboard)
  getAllCollectors: async (status = null) => {
    await delay(300);
    
    let collectors = users.filter(user => user.role === 'COLLECTOR');
    
    if (status) {
      collectors = collectors.filter(collector => collector.status === status);
    }
    
    // Remove passwords from response
    const sanitizedCollectors = collectors.map(({ password, ...user }) => user);
    
    return { collectors: sanitizedCollectors };
  },
};
