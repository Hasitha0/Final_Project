// Analytics Service for EcoTech Platform
// Handles data collection, processing, and reporting

import supabaseApi from './supabaseApi';

class AnalyticsService {
  constructor() {
    this.eventQueue = [];
    this.isProcessing = false;
  }

  // Event tracking
  trackEvent(eventType, eventData) {
    const event = {
      id: Date.now() + Math.random(),
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      userId: eventData.userId || null,
      sessionId: this.getSessionId()
    };

    this.eventQueue.push(event);
    this.processEventQueue();
  }

  // Session management
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Process event queue
  async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    try {
      // In a real implementation, this would send to analytics backend
      console.log('Processing analytics events:', this.eventQueue);
      this.eventQueue = [];
    } catch (error) {
      console.error('Error processing analytics events:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Usage pattern analytics
  async getUsagePatterns(dateRange = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    try {
      // Get real data from database
      const systemStats = await supabaseApi.analytics.getSystemStats();
      const collectionStats = await supabaseApi.analytics.getCollectionStats();
      
    const patterns = {
      dailyActiveUsers: this.generateDailyData(dateRange, 50, 200),
      featureUsage: {
          'Collection Requests': collectionStats.totalRequests || 45,
        'Find Centers': 30,
        'Dashboard Views': 85,
        'Profile Updates': 15,
        'Feedback Submissions': 10
      },
      peakHours: this.generateHourlyData(),
      deviceTypes: {
        'Desktop': 60,
        'Mobile': 35,
        'Tablet': 5
      },
      userRetention: {
        'Day 1': 85,
        'Day 7': 65,
        'Day 30': 45,
        'Day 90': 30
      }
    };

    return patterns;
    } catch (error) {
      console.error('Error getting usage patterns:', error);
      // Return fallback data
      return {
        dailyActiveUsers: this.generateDailyData(dateRange, 50, 200),
        featureUsage: {
          'Collection Requests': 45,
          'Find Centers': 30,
          'Dashboard Views': 85,
          'Profile Updates': 15,
          'Feedback Submissions': 10
        },
        peakHours: this.generateHourlyData(),
        deviceTypes: {
          'Desktop': 60,
          'Mobile': 35,
          'Tablet': 5
        },
        userRetention: {
          'Day 1': 85,
          'Day 7': 65,
          'Day 30': 45,
          'Day 90': 30
        }
      };
    }
  }

  // Performance metrics
  async getPerformanceMetrics() {
    try {
      const systemStats = await supabaseApi.analytics.getSystemStats();
      const collectionStats = await supabaseApi.analytics.getCollectionStats();
      const userStats = await supabaseApi.analytics.getUserStats();
    
    const metrics = {
      collectorPerformance: {
        averageCompletionTime: 2.3,
          successRate: collectionStats.successRate || 94.5,
        customerSatisfaction: 4.7,
          totalCollections: collectionStats.completedRequests || 0,
        topPerformers: [
          { id: 'COL001', name: 'Mike Johnson', completionRate: 98, avgTime: 1.8 },
          { id: 'COL002', name: 'Sarah Chen', completionRate: 96, avgTime: 2.1 },
          { id: 'COL003', name: 'David Wilson', completionRate: 95, avgTime: 2.0 }
        ]
      },
      centerThroughput: {
        averageProcessingTime: 1.5,
        capacityUtilization: 78,
        qualityScore: 4.8,
          totalProcessed: systemStats.totalProcessed || 0,
        topCenters: [
          { id: 'RC001', name: 'GreenTech Recycling', throughput: 450, efficiency: 92 },
          { id: 'RC002', name: 'EcoProcess Solutions', throughput: 380, efficiency: 89 },
          { id: 'RC003', name: 'Urban Waste Management', throughput: 320, efficiency: 87 }
        ]
      },
      systemHealth: {
        uptime: 99.8,
        responseTime: 145,
        errorRate: 0.2,
          activeConnections: userStats.activeUsers || 0,
        memoryUsage: 68,
        cpuUsage: 45
      }
    };

    return metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      // Return fallback data
      return {
        collectorPerformance: {
          averageCompletionTime: 2.3,
          successRate: 94.5,
          customerSatisfaction: 4.7,
          totalCollections: 0,
          topPerformers: []
        },
        centerThroughput: {
          averageProcessingTime: 1.5,
          capacityUtilization: 78,
          qualityScore: 4.8,
          totalProcessed: 0,
          topCenters: []
        },
        systemHealth: {
          uptime: 99.8,
          responseTime: 145,
          errorRate: 0.2,
          activeConnections: 0,
          memoryUsage: 68,
          cpuUsage: 45
        }
      };
    }
  }

  // User engagement analytics
  async getUserEngagement() {
    const engagement = {
      totalSessions: 15420,
      averageSessionDuration: 8.5, // minutes
      bounceRate: 25.3,
      pageViews: 45680,
      uniqueVisitors: 3240,
      returningUsers: 68.5,
      conversionRates: {
        'Registration': 12.5,
        'Request Submission': 78.3,
        'Feedback Completion': 34.2
      },
      userJourney: [
        { step: 'Landing Page', users: 1000, dropoff: 15 },
        { step: 'Registration', users: 850, dropoff: 8 },
        { step: 'Dashboard', users: 782, dropoff: 5 },
        { step: 'Request Creation', users: 743, dropoff: 12 },
        { step: 'Request Completion', users: 654, dropoff: 0 }
      ],
      contentEngagement: {
        'How It Works': { views: 2340, avgTime: 3.2 },
        'Find Centers': { views: 1890, avgTime: 4.1 },
        'About Us': { views: 1560, avgTime: 2.8 },
        'Blog Posts': { views: 890, avgTime: 5.4 }
      }
    };

    return engagement;
  }

  // Environmental impact analytics
  async getEnvironmentalImpact() {
    try {
      const systemStats = await supabaseApi.analytics.getSystemStats();
      const collectionStats = await supabaseApi.analytics.getCollectionStats();
    
    const impact = {
        totalItems: collectionStats.totalItems || 0,
        co2Saved: collectionStats.co2Saved || 0,
      energySaved: 12450, // kWh
      waterSaved: 8920, // Liters
      materialsRecovered: {
        'Metals': 2340,
        'Plastics': 1890,
        'Glass': 1560,
        'Rare Earth Elements': 234,
        'Batteries': 890
      },
      monthlyTrends: this.generateMonthlyEnvironmentalData(),
      projectedImpact: {
        yearEnd: {
            co2Saved: (collectionStats.co2Saved || 0) * 1.8,
          energySaved: 22410,
          waterSaved: 16056
        }
      },
      comparisonMetrics: {
          treesEquivalent: Math.round((collectionStats.co2Saved || 0) / 22), // 1 tree = ~22kg CO2/year
          carsOffRoad: Math.round((collectionStats.co2Saved || 0) / 4600), // Average car = 4.6 tons CO2/year
        householdsPowered: Math.round(12450 / 10649) // Average household = 10,649 kWh/year
      }
    };

    return impact;
    } catch (error) {
      console.error('Error getting environmental impact:', error);
      // Return fallback data
      return {
        totalItems: 0,
        co2Saved: 0,
        energySaved: 12450,
        waterSaved: 8920,
        materialsRecovered: {
          'Metals': 0,
          'Plastics': 0,
          'Glass': 0,
          'Rare Earth Elements': 0,
          'Batteries': 0
        },
        monthlyTrends: this.generateMonthlyEnvironmentalData(),
        projectedImpact: {
          yearEnd: {
            co2Saved: 0,
            energySaved: 22410,
            waterSaved: 16056
          }
        },
        comparisonMetrics: {
          treesEquivalent: 0,
          carsOffRoad: 0,
          householdsPowered: Math.round(12450 / 10649)
        }
      };
    }
  }

  // Financial analytics
  async getFinancialMetrics() {
    const metrics = {
      revenue: {
        monthly: 24580,
        quarterly: 73740,
        yearly: 294960,
        growth: 15.3
      },
      costs: {
        operational: 18200,
        marketing: 3400,
        technology: 2980,
        total: 24580
      },
      profitability: {
        grossMargin: 26.0,
        netMargin: 15.8,
        roi: 23.4
      },
      revenueStreams: {
        'Collection Fees': 45,
        'Processing Fees': 30,
        'Partnerships': 15,
        'Premium Services': 10
      },
      costBreakdown: {
        'Personnel': 40,
        'Transportation': 25,
        'Technology': 15,
        'Marketing': 12,
        'Operations': 8
      }
    };

    return metrics;
  }

  // Generate reports
  async generateReport(reportType, options = {}) {
    const { dateRange = 30, format = 'json' } = options;
    
    let reportData = {};

    switch (reportType) {
      case 'usage':
        reportData = await this.getUsagePatterns(dateRange);
        break;
      case 'performance':
        reportData = await this.getPerformanceMetrics();
        break;
      case 'engagement':
        reportData = await this.getUserEngagement();
        break;
      case 'environmental':
        reportData = await this.getEnvironmentalImpact();
        break;
      case 'financial':
        reportData = await this.getFinancialMetrics();
        break;
      case 'comprehensive':
        reportData = {
          usage: await this.getUsagePatterns(dateRange),
          performance: await this.getPerformanceMetrics(),
          engagement: await this.getUserEngagement(),
          environmental: await this.getEnvironmentalImpact(),
          financial: await this.getFinancialMetrics()
        };
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    const report = {
      type: reportType,
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      data: reportData
    };

    if (format === 'csv') {
      return this.convertToCSV(report);
    }

    return report;
  }

  // Export functionality
  exportReport(report, filename) {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename || `ecotech-report-${Date.now()}.json`;
    link.click();
  }

  exportCSV(data, filename) {
    const csv = this.convertToCSV(data);
    const dataBlob = new Blob([csv], { type: 'text/csv' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename || `ecotech-data-${Date.now()}.csv`;
    link.click();
  }

  // Utility functions
  generateDailyData(days, min, max) {
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * (max - min + 1)) + min
      });
    }
    return data;
  }

  generateHourlyData() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      // Simulate realistic usage patterns (higher during business hours)
      let baseValue = 20;
      if (i >= 9 && i <= 17) baseValue = 80; // Business hours
      if (i >= 19 && i <= 22) baseValue = 60; // Evening peak
      
      hours.push({
        hour: i,
        users: baseValue + Math.floor(Math.random() * 30)
      });
    }
    return hours;
  }

  generateMonthlyEnvironmentalData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      co2Saved: 800 + (index * 50) + Math.floor(Math.random() * 200),
      energySaved: 1000 + (index * 80) + Math.floor(Math.random() * 300),
      waterSaved: 700 + (index * 60) + Math.floor(Math.random() * 250)
    }));
  }

  convertToCSV(data) {
    // Simple CSV conversion - in a real app, use a proper CSV library
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    // For complex objects, flatten them
    const flattened = this.flattenObject(data);
    return Object.entries(flattened).map(([key, value]) => `${key},${value}`).join('\n');
  }

  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  // Core analytics methods
  async getSystemAnalytics() {
    try {
      // Get real data from database
      const systemStats = await supabaseApi.analytics.getSystemStats();
      const collectionStats = await supabaseApi.analytics.getCollectionStats();
      const userStats = await supabaseApi.analytics.getUserStats();
      
      // Calculate key metrics
      const successRate = collectionStats.total > 0 
        ? ((collectionStats.completed / collectionStats.total) * 100).toFixed(1) 
        : 0;
      
      const processingRate = collectionStats.total > 0
        ? (((collectionStats.total - collectionStats.pending) / collectionStats.total) * 100).toFixed(1)
        : 0;
        
      const averageRequestValue = collectionStats.total > 0
        ? (collectionStats.totalRevenue / collectionStats.total).toFixed(2)
        : 0;

      return {
        users: {
          total: userStats.total || 0,
          active: userStats.active || 0,
          byRole: {
            public: userStats.users || 0,
            collectors: userStats.collectors || 0,
            recyclingCenters: userStats.recycling_centers || 0,
            admins: userStats.admins || 0
          },
          activePercentage: userStats.total > 0 
            ? ((userStats.active / userStats.total) * 100).toFixed(1)
            : 0
        },
        requests: {
          total: collectionStats.total || 0,
          completed: collectionStats.completed || 0,
          pending: collectionStats.pending || 0,
          inProgress: collectionStats.in_progress || 0,
          successRate: successRate,
          processingRate: processingRate,
          monthlyTrends: collectionStats.monthly || {}
        },
        financial: {
          totalRevenue: collectionStats.totalRevenue || 0,
          averageRequestValue: averageRequestValue,
          revenueByMonth: this.calculateMonthlyRevenue(collectionStats.monthly || {})
        },
        environmental: {
          totalProcessed: systemStats.totalProcessed || 0,
          co2Saved: systemStats.co2Saved || 0,
          treesEquivalent: Math.round((systemStats.co2Saved || 0) / 22), // 1 tree ≈ 22kg CO2/year
          carsEquivalent: Math.round((systemStats.co2Saved || 0) / 4600) // Average car ≈ 4.6 tons CO2/year
        },
        system: {
          uptime: 99.9,
          lastUpdate: new Date().toISOString(),
          activeCenters: systemStats.activeCenters || 0,
          totalCenters: systemStats.totalCenters || 0
        }
      };
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  }

  // Helper method to calculate monthly revenue
  calculateMonthlyRevenue(monthlyRequests) {
    const monthlyRevenue = {};
    Object.entries(monthlyRequests).forEach(([month, count]) => {
      // Estimate revenue based on average request value
      monthlyRevenue[month] = count * 400; // Assuming $400 average per request
    });
    return monthlyRevenue;
  }

  // Real-time monitoring methods
  startRealTimeMonitoring(callback) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Initial update
    this.updateRealTimeStats(callback);

    // Set up interval for regular updates
    this.monitoringInterval = setInterval(() => {
      this.updateRealTimeStats(callback);
    }, 30000); // Update every 30 seconds
  }

  stopRealTimeMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async updateRealTimeStats(callback) {
    try {
      const stats = await this.getSystemAnalytics();
      callback({
        status: 'healthy',
        lastUpdate: new Date().toISOString(),
        metrics: {
          activeUsers: stats.users.active,
          pendingRequests: stats.requests.pending,
          processingRate: stats.requests.processingRate,
          systemLoad: Math.random() * 30 + 40, // Simulated system load between 40-70%
          memoryUsage: Math.random() * 20 + 50, // Simulated memory usage between 50-70%
          errorRate: Math.random() * 0.5 // Simulated error rate 0-0.5%
        }
      });
    } catch (error) {
      console.error('Error updating real-time stats:', error);
      callback({
        status: 'error',
        lastUpdate: new Date().toISOString(),
        error: error.message
      });
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Event tracking helpers
export const trackEvent = (eventType, eventData) => {
  analyticsService.trackEvent(eventType, eventData);
};

export const trackPageView = (page, userId = null) => {
  trackEvent('page_view', { page, userId });
};

export const trackUserAction = (action, details, userId = null) => {
  trackEvent('user_action', { action, details, userId });
};

export const trackError = (error, context, userId = null) => {
  trackEvent('error', { error: error.message, context, userId });
};

export default analyticsService; 