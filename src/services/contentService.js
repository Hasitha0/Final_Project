import supabaseApi from './supabaseApi';

class ContentService {
  // Content Categories
  async getCategories() {
    try {
      const categories = await supabaseApi.content.getCategories();
      // Filter out recycling centers category
      return categories.filter(cat => cat.slug !== 'recycling-centers');
    } catch (error) {
      console.warn('Falling back to mock categories:', error);
      return this.getMockCategories();
    }
  }

  async createCategory(categoryData) {
    try {
      return await supabaseApi.content.createCategory(categoryData);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId, updates) {
    try {
      return await supabaseApi.content.updateCategory(categoryId, updates);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId) {
    try {
      return await supabaseApi.content.deleteCategory(categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Educational Content
  async getPublishedContent(categoryId = null) {
    try {
      const content = await supabaseApi.content.getPublishedContent(categoryId);
      // Filter out content from recycling centers category
      return content.filter(item => 
        !item.category || item.category.slug !== 'recycling-centers'
      );
    } catch (error) {
      console.warn('Falling back to mock content:', error);
      return this.getMockContent(categoryId);
    }
  }

  async getAllContent(filters = {}) {
    try {
      const content = await supabaseApi.content.getAllContent(filters);
      // Filter out content from recycling centers category
      return content.filter(item => 
        !item.category || item.category.slug !== 'recycling-centers'
      );
    } catch (error) {
      console.warn('Falling back to mock content:', error);
      return this.getMockAllContent(filters);
    }
  }

  async getContentById(contentId) {
    try {
      return await supabaseApi.content.getContentById(contentId);
    } catch (error) {
      console.warn('Falling back to mock content:', error);
      return this.getMockContentById(contentId);
    }
  }

  async getContentBySlug(slug) {
    try {
      return await supabaseApi.content.getContentBySlug(slug);
    } catch (error) {
      console.warn('Falling back to mock content:', error);
      return this.getMockContentBySlug(slug);
    }
  }

  async createContent(contentData) {
    try {
      return await supabaseApi.content.createContent(contentData);
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  async updateContent(contentId, updates) {
    try {
      return await supabaseApi.content.updateContent(contentId, updates);
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async deleteContent(contentId) {
    try {
      return await supabaseApi.content.deleteContent(contentId);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  async publishContent(contentId) {
    try {
      return await supabaseApi.content.publishContent(contentId);
    } catch (error) {
      console.error('Error publishing content:', error);
      throw error;
    }
  }

  async trackContentView(contentId, userId = null) {
    try {
      return await supabaseApi.content.trackContentView(contentId, userId);
    } catch (error) {
      console.warn('Failed to track content view:', error);
      // Don't throw error for analytics tracking
    }
  }

  // Content Analytics
  async getContentAnalytics(contentId = null, dateRange = null) {
    try {
      return await supabaseApi.content.getContentAnalytics(contentId, dateRange);
    } catch (error) {
      console.warn('Failed to get content analytics:', error);
      return this.getMockAnalytics();
    }
  }

  // Mock Data Methods
  getMockCategories() {
    return [
      {
        id: 'cat-1',
        name: 'E-Waste Basics',
        description: 'Learn about different types of electronic waste and their impact on the environment.',
        slug: 'e-waste-basics',
        icon: 'Laptop',
        sort_order: 1,
        is_active: true
      },
      {
        id: 'cat-2',
        name: 'Proper Disposal Methods',
        description: 'Discover the right ways to dispose of different electronic devices.',
        slug: 'proper-disposal',
        icon: 'Recycle',
        sort_order: 2,
        is_active: true
      },
      {
        id: 'cat-3',
        name: 'Sustainability Tips',
        description: 'Learn how to reduce e-waste through sustainable practices.',
        slug: 'sustainability-tips',
        icon: 'Leaf',
        sort_order: 3,
        is_active: true
      }
    ];
  }

  getMockContent(categoryId = null) {
    const allContent = [
      {
        id: 'eb1',
        title: 'What is E-Waste?',
        slug: 'what-is-e-waste',
        excerpt: 'Electronic waste, or e-waste, refers to discarded electronic devices...',
        content: `<h2>Understanding Electronic Waste</h2>
<p>Electronic waste, commonly known as e-waste, encompasses any discarded electronic devices or components that have reached the end of their useful life. This includes computers, smartphones, tablets, televisions, printers, and countless other electronic items that have become integral to our daily lives.</p>

<h3>Why E-Waste Matters</h3>
<p>As technology advances rapidly, the volume of e-waste generated globally continues to grow exponentially. Understanding what constitutes e-waste is the first step toward responsible disposal and environmental protection.</p>

<h3>Common Types of E-Waste</h3>
<ul>
<li>Computers and laptops</li>
<li>Mobile phones and smartphones</li>
<li>Televisions and monitors</li>
<li>Printers and scanners</li>
<li>Gaming consoles</li>
<li>Small appliances</li>
</ul>`,
        category_id: 'cat-1',
        category: { name: 'E-Waste Basics', slug: 'e-waste-basics' },
        status: 'published',
        read_time_minutes: 5,
        views_count: 0,
        is_featured: false,
        tags: ['e-waste', 'electronics', 'environment', 'recycling'],
        published_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'eb2',
        title: 'Common Types of E-Waste',
        slug: 'common-types-of-e-waste',
        excerpt: 'The most common types of e-waste include computers, smartphones...',
        content: `<h2>Understanding Different Categories of E-Waste</h2>
<p>Electronic waste comes in many forms, each requiring specific handling and disposal methods. Understanding these categories helps ensure proper recycling and environmental protection.</p>

<h3>Large Appliances</h3>
<ul>
<li>Refrigerators and freezers</li>
<li>Washing machines and dryers</li>
<li>Air conditioners</li>
<li>Dishwashers</li>
</ul>

<h3>IT Equipment</h3>
<ul>
<li>Desktop computers and servers</li>
<li>Laptops and tablets</li>
<li>Printers and scanners</li>
<li>Network equipment</li>
</ul>

<h3>Consumer Electronics</h3>
<ul>
<li>Smartphones and tablets</li>
<li>Televisions and monitors</li>
<li>Audio equipment</li>
<li>Gaming devices</li>
</ul>`,
        category_id: 'cat-1',
        category: { name: 'E-Waste Basics', slug: 'e-waste-basics' },
        status: 'published',
        read_time_minutes: 7,
        views_count: 0,
        is_featured: false,
        tags: ['e-waste', 'categories', 'electronics', 'classification'],
        published_at: '2024-01-12T14:30:00Z'
      },
      {
        id: 'pd1',
        title: 'Safe Disposal Guidelines',
        slug: 'safe-disposal-guidelines',
        excerpt: 'Follow these steps to safely dispose of your electronic devices...',
        content: `<h2>Safe Electronic Device Disposal</h2>
<p>Proper disposal of electronic devices is crucial for environmental protection and personal data security. Follow these comprehensive guidelines to ensure your e-waste is handled responsibly.</p>

<h3>Before Disposal</h3>
<ol>
<li><strong>Back up important data</strong> - Save any files you want to keep</li>
<li><strong>Sign out of all accounts</strong> - Remove your personal accounts from the device</li>
<li><strong>Perform a factory reset</strong> - Wipe all personal data from the device</li>
<li><strong>Remove batteries if possible</strong> - Separate batteries for special handling</li>
</ol>

<h3>Disposal Options</h3>
<p>Choose from several responsible disposal methods:</p>
<ul>
<li>Certified e-waste recycling centers</li>
<li>Manufacturer take-back programs</li>
<li>Retail store recycling programs</li>
<li>Community e-waste collection events</li>
</ul>`,
        category_id: 'cat-2',
        category: { name: 'Proper Disposal Methods', slug: 'proper-disposal' },
        status: 'published',
        read_time_minutes: 8,
        views_count: 0,
        is_featured: false,
        tags: ['disposal', 'safety', 'data-security', 'recycling'],
        published_at: '2024-01-10T09:15:00Z'
      },
      {
        id: 'st1',
        title: 'Extending Device Lifespan',
        slug: 'extending-device-lifespan',
        excerpt: 'Tips and tricks to make your electronics last longer...',
        content: `<h2>Making Your Electronics Last Longer</h2>
<p>By following proper care practices and maintenance routines, you can significantly extend the lifespan of your electronic devices, reducing e-waste and saving money.</p>

<h3>General Care Tips</h3>
<ul>
<li><strong>Keep devices clean</strong> - Regular cleaning prevents dust buildup</li>
<li><strong>Use protective cases</strong> - Protect from physical damage</li>
<li><strong>Manage temperature</strong> - Avoid extreme heat or cold</li>
<li><strong>Handle with care</strong> - Gentle usage prevents wear and tear</li>
</ul>

<h3>Software Maintenance</h3>
<p>Keep your devices running smoothly:</p>
<ul>
<li>Regular software updates</li>
<li>Remove unused applications</li>
<li>Clear cache and temporary files</li>
<li>Use reputable antivirus software</li>
</ul>

<h3>Battery Care</h3>
<p>Extend battery life with these practices:</p>
<ul>
<li>Avoid complete battery drain</li>
<li>Use original chargers when possible</li>
<li>Store devices with 50% charge if not used long-term</li>
</ul>`,
        category_id: 'cat-3',
        category: { name: 'Sustainability Tips', slug: 'sustainability-tips' },
        status: 'published',
        read_time_minutes: 6,
        views_count: 0,
        is_featured: false,
        tags: ['maintenance', 'battery-care', 'sustainability', 'device-care'],
        published_at: '2024-01-08T16:45:00Z'
      }
    ];

    if (categoryId) {
      return allContent.filter(content => content.category_id === categoryId);
    }
    return allContent;
  }

  getMockAllContent(filters = {}) {
    const allContent = this.getMockContent();
    
    // Add draft content for admin view
    const draftContent = [
      {
        id: 'draft-1',
        title: 'Upcoming Recycling Regulations',
        slug: 'upcoming-recycling-regulations',
        excerpt: 'New regulations coming in 2024 for e-waste recycling...',
        content: 'Draft content about upcoming regulations...',
        category_id: 'cat-2',
        category: { name: 'Proper Disposal Methods', slug: 'proper-disposal' },
        status: 'draft',
        read_time_minutes: 5,
        views_count: 0,
        is_featured: false,
        tags: ['regulations', 'policy', 'compliance'],
        published_at: null
      }
    ];

    const combinedContent = [...allContent, ...draftContent];

    // Apply filters
    let filteredContent = combinedContent;

    if (filters.status) {
      filteredContent = filteredContent.filter(content => content.status === filters.status);
    }

    if (filters.category_id) {
      filteredContent = filteredContent.filter(content => content.category_id === filters.category_id);
    }



    return filteredContent;
  }

  getMockContentById(contentId) {
    const allContent = this.getMockAllContent();
    return allContent.find(content => content.id === contentId) || null;
  }

  getMockContentBySlug(slug) {
    const allContent = this.getMockAllContent();
    return allContent.find(content => content.slug === slug) || null;
  }

  getMockAnalytics() {
    return {
      total_views: 0,
      unique_visitors: 0,
      most_popular_content: [
        { title: 'Safe Disposal Guidelines', views: 0 },
        { title: 'What is E-Waste?', views: 0 },
        { title: 'Common Types of E-Waste', views: 0 }
      ],
      views_by_category: [
        { category: 'Proper Disposal Methods', views: 1567 },
        { category: 'E-Waste Basics', views: 2139 },
        { category: 'Sustainability Tips', views: 743 }
      ]
    };
  }
}

export default new ContentService(); 