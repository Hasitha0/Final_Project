import React, { useState, useEffect } from 'react';
import { Loader2, Clock, Tag, Calendar } from 'lucide-react';
import { AnimatedGradientText } from '../components/ui/animated-gradient-text';
import { MagicCard } from '../components/ui/magic-card';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { TextReveal } from '../components/ui/text-reveal';
import { WordRotate } from '../components/ui/word-rotate';
import { BorderBeam } from '../components/ui/border-beam';
import { AnimatedShinyText } from '../components/ui/animated-shiny-text';
import { WarpBackground } from '../components/ui/warp-background';
import contentService from '../services/contentService';
import { useAuth } from '../context/AuthContext';

const LearnPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [contents, setContents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, contentsData] = await Promise.all([
        contentService.getCategories(),
        contentService.getPublishedContent()
      ]);
      
      setCategories(categoriesData);
      setContents(contentsData);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    
    try {
      await contentService.trackContentView(article.id, user?.id);
    } catch (error) {
      console.warn('Failed to track article view:', error);
    }
  };

  const getContentsByCategory = (categoryId) => {
    return contents.filter(content => content.category_id === categoryId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Loading Educational Content</h3>
          <p className="text-gray-400">Please wait while we load the latest articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <WarpBackground className="opacity-5" />
      
      {/* Premium background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-blue-500/12 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-purple-400/8 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <span className="text-blue-600 font-medium text-sm tracking-wider uppercase mb-6 block">
              Educational Resources
            </span>
            <AnimatedShinyText className="text-7xl font-black text-slate-900 tracking-tight font-roboto-slab drop-shadow-lg">
              Learn About E-Waste
            </AnimatedShinyText>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"></div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full blur-sm opacity-50"></div>
          </div>
          <WordRotate
            className="text-2xl text-slate-600 mt-6"
            words={['Educate', 'Understand', 'Act', 'Impact']}
          />
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const categoryContents = getContentsByCategory(category.id);
              return (
                <BorderBeam key={category.id} className="h-full" duration={2 + index * 0.3}>
                  <MagicCard
                    className="group cursor-pointer h-full"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="p-8 bg-white/90 backdrop-blur-2xl rounded-2xl border border-slate-300/80 hover:border-blue-400/90 transition-all duration-700 hover:shadow-3xl hover:shadow-blue-500/30 transform hover:-translate-y-2 hover:scale-[1.02]">
                      <TextReveal>
                        <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-500 mb-4">{category.name}</h2>
                        <p className="text-slate-600 mb-6">{category.description}</p>
                        
                        {categoryContents.length > 0 ? (
                          <div className="space-y-4">
                            {categoryContents.slice(0, 3).map((article) => (
                              <div
                                key={article.id}
                                className="p-4 rounded-xl bg-slate-100/80 hover:bg-blue-50/80 transition-colors duration-300 border border-slate-200/80 hover:border-blue-300/80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArticleClick(article);
                                }}
                              >
                                <h3 className="text-slate-900 font-medium mb-2">{article.title}</h3>
                                <div className="flex items-center text-slate-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{article.read_time_minutes} min read</span>
                                </div>
                              </div>
                            ))}
                            {categoryContents.length > 3 && (
                              <div className="text-center pt-4">
                                <span className="text-sm text-blue-600 font-medium">
                                  +{categoryContents.length - 3} more articles
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-slate-500">No articles available yet</p>
                          </div>
                        )}
                      </TextReveal>
                    </div>
                  </MagicCard>
                </BorderBeam>
              );
            })}
          </div>
        </div>

        {/* All Articles Grid */}
        {categories.length === 0 && contents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contents.map((article, index) => (
                <BorderBeam key={article.id} className="h-full" duration={2 + index * 0.3}>
                  <MagicCard
                    className="group cursor-pointer h-full"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="p-8 bg-white/90 backdrop-blur-2xl rounded-2xl border border-slate-300/80 hover:border-blue-400/90 transition-all duration-700 hover:shadow-3xl hover:shadow-blue-500/30 transform hover:-translate-y-2 hover:scale-[1.02]">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-500 mb-4">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-slate-600 mb-4 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center text-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">{article.read_time_minutes} min read</span>
                      </div>
                    </div>
                  </MagicCard>
                </BorderBeam>
              ))}
            </div>
          </div>
        )}

        {/* No Content State */}
        {categories.length === 0 && contents.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-slate-400 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No Educational Content Available</h3>
            <p className="text-slate-600">Check back soon for new articles and learning resources.</p>
          </div>
        )}

        {/* Article Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <MagicCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-300/90">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex-1 mr-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedArticle.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      {selectedArticle.category && (
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {selectedArticle.category.name}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {selectedArticle.read_time_minutes} min read
                      </span>
                      {selectedArticle.published_at && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(selectedArticle.published_at)}
                        </span>
                      )}
                    </div>
                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                      <div className="flex items-center mt-4">
                        <Tag className="h-4 w-4 mr-2 text-slate-400" />
                        <div className="flex flex-wrap gap-2">
                          {selectedArticle.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <ShimmerButton
                    onClick={() => setSelectedArticle(null)}
                    className="!px-4 !py-2"
                  >
                    Close
                  </ShimmerButton>
                </div>
                
                {selectedArticle.excerpt && (
                  <div className="mb-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                    <p className="text-slate-700 italic">{selectedArticle.excerpt}</p>
                  </div>
                )}
                
                <div 
                  className="prose prose-blue max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            </MagicCard>
          </div>
        )}

        {/* Category Modal */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <MagicCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-300/90">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedCategory.name}</h2>
                    <p className="text-slate-600">{selectedCategory.description}</p>
                  </div>
                  <ShimmerButton
                    onClick={() => setSelectedCategory(null)}
                    className="!px-4 !py-2"
                  >
                    Close
                  </ShimmerButton>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getContentsByCategory(selectedCategory.id).map((article) => (
                    <div
                      key={article.id}
                      className="p-6 rounded-xl bg-slate-50 hover:bg-blue-50/80 transition-colors duration-300 border border-slate-200 hover:border-blue-300/80 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(null);
                        handleArticleClick(article);
                      }}
                    >
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-slate-600 mb-4 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center text-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">{article.read_time_minutes} min read</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnPage; 