import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Tag, 
  Calendar,
  Clock,
  Users,
  FileText,
  Image as ImageIcon,
  BarChart3
} from 'lucide-react';
import contentService from '../../services/contentService';
import { useAuth } from '../../context/AuthContext';

const ContentManagement = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('list');
  const [categories, setCategories] = useState([]);
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for creating/editing content
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft',
    read_time_minutes: 5,
    tags: [],
    meta_description: '',
    featured_image_url: ''
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    console.log('ContentManagement mounted, user:', user);
    loadData();
  }, []);

  useEffect(() => {
    console.log('User changed in ContentManagement:', user);
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading content management data...');
      
      const [categoriesData, contentsData] = await Promise.all([
        contentService.getCategories(),
        contentService.getAllContent()
      ]);
      
      console.log('Categories loaded:', categoriesData);
      console.log('Contents loaded:', contentsData);
      
      // Filter out recycling centers category
      const filteredCategories = (categoriesData || []).filter(cat => cat.slug !== 'recycling-centers');
      const filteredContents = (contentsData || []).filter(content => 
        !content.category || content.category.slug !== 'recycling-centers'
      );
      
      setCategories(filteredCategories);
      setContents(filteredContents);
    } catch (error) {
      console.error('Error loading content data:', error);
      // Set empty arrays as fallback
      setCategories([]);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreateContent = () => {
    setSelectedContent(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category_id: '',
      status: 'draft',
      read_time_minutes: 5,
      tags: [],
      meta_description: '',
      featured_image_url: ''
    });
    setIsEditing(true);
    setActiveSection('editor');
  };

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setFormData({
      title: content.title,
      excerpt: content.excerpt || '',
      content: content.content,
      category_id: content.category_id,
      status: content.status,
      read_time_minutes: content.read_time_minutes || 5,
      tags: content.tags || [],
      meta_description: content.meta_description || '',
      featured_image_url: content.featured_image_url || ''
    });
    setIsEditing(true);
    setActiveSection('editor');
  };

  const handleSaveContent = async () => {
    try {
      setLoading(true);
      
      // Validate user authentication
      if (!user || !user.id) {
        throw new Error('User not authenticated or missing ID');
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      if (!formData.category_id) {
        throw new Error('Category is required');
      }

      const contentData = {
        ...formData,
        slug: generateSlug(formData.title),
        author_id: user.id
      };

      console.log('Saving content with data:', contentData);

      if (selectedContent) {
        await contentService.updateContent(selectedContent.id, contentData);
      } else {
        await contentService.createContent(contentData);
      }

      await loadData();
      setActiveSection('list');
      setIsEditing(false);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert(`Error saving content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishContent = async (contentId) => {
    try {
      setLoading(true);
      await contentService.publishContent(contentId);
      await loadData();
    } catch (error) {
      console.error('Error publishing content:', error);
      alert('Error publishing content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      setLoading(true);
      await contentService.deleteContent(contentId);
      await loadData();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getFilteredContents = () => {
    let filtered = contents;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(content => content.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(content => content.category_id === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeSection === 'editor') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            {selectedContent ? 'Edit Content' : 'Create New Content'}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveSection('list');
                setIsEditing(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSaveContent}
              disabled={loading || !formData.title.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter content title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description or excerpt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Write your content here... (HTML supported)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.read_time_minutes}
                    onChange={(e) => setFormData({ ...formData, read_time_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="1"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Tags</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Add tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-emerald-600 text-white text-xs rounded"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-emerald-200 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Content Management</h3>
        <button
          onClick={handleCreateContent}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Create Content</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search content..."
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {getFilteredContents().map((content) => (
                <tr key={content.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {content.title}
                        </div>
                        {content.excerpt && (
                          <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {content.excerpt}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {content.read_time_minutes} min read
                          </span>
                          {content.tags && content.tags.length > 0 && (
                            <span className="flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {content.tags.slice(0, 2).join(', ')}
                              {content.tags.length > 2 && ` +${content.tags.length - 2}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">
                      {content.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(content.status)}`}>
                      {content.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">
                      {content.views_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">
                      {content.updated_at ? new Date(content.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {content.status === 'draft' && (
                        <button
                          onClick={() => handlePublishContent(content.id)}
                          className="p-1 text-green-400 hover:text-green-300"
                          title="Publish"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditContent(content)}
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getFilteredContents().length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No content found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first piece of content'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement; 