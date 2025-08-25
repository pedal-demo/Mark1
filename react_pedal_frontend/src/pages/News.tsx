import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  ExternalLink,
  Clock,
  Search,
  Filter,
  Bookmark,
  Share2,
  X
} from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  image: string;
  category: string;
  readTime: string;
}

const News: React.FC = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<number>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isShareToast, setIsShareToast] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const categories = ['All', 'Technology', 'Racing', 'Safety', 'Industry', 'Events'];

  // Load news articles from backend
  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoadingMore(true);
        // TODO: Replace with actual API call
        // const articles = await newsService.getArticles();
        setNewsArticles([]);
      } catch (error) {
        console.error('Failed to load news:', error);
      } finally {
        setIsLoadingMore(false);
      }
    };
    loadNews();
  }, []);

  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (articleId: number) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleRead = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const handleOpenExternal = (article: NewsArticle) => {
    const target = article.url && article.url !== '#' ? article.url : `https://news.example.com/article/${article.id}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (article: NewsArticle) => {
    const shareUrl = article.url && article.url !== '#' ? article.url : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.description, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setIsShareToast('Link copied to clipboard');
        setTimeout(() => setIsShareToast(null), 1800);
      }
    } catch (e) {
      // user cancelled share; ignore
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextId = newsArticles.length + 1;
      // TODO: Load more articles from backend API
      const newArticles: NewsArticle[] = [];
      setNewsArticles(prev => [...prev, ...newArticles]);
      setIsLoadingMore(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-app-background">
      <div className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-app-primary-accent to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-app-text-primary">Latest Cycling News</h1>
                <p className="text-app-text-muted">Stay updated with the latest in cycling world</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-app-text-muted" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-app-card-surface border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-app-text-muted" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-app-card-surface border border-app-borders rounded-lg text-app-text-primary focus:outline-none focus:border-app-primary-accent transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* News Articles */}
          <div className="space-y-6">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-app-card-surface rounded-xl border border-app-borders overflow-hidden hover:border-app-primary-accent/30 transition-colors"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-app-primary-accent/10 text-app-primary-accent border border-app-primary-accent/20 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                      <span className="text-xs font-medium text-app-primary-accent">{article.source}</span>
                      <span className="text-xs text-app-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.publishedAt}
                      </span>
                      <span className="text-xs text-app-text-muted">•</span>
                      <span className="text-xs text-app-text-muted">{article.readTime}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-app-text-primary mb-3 line-clamp-2">
                      {article.title}
                    </h2>
                    
                    <p className="text-app-text-muted mb-4 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <button onClick={() => handleRead(article)} className="flex items-center gap-2 text-app-primary-accent hover:text-app-primary-accent/80 transition-colors font-medium">
                        <ExternalLink className="w-4 h-4" />
                        Read full article
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            bookmarkedArticles.has(article.id)
                              ? 'text-app-primary-accent bg-app-primary-accent/10' 
                              : 'text-app-text-muted hover:text-app-primary-accent hover:bg-app-primary-accent/10'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarkedArticles.has(article.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={() => handleShare(article)} className="p-2 rounded-lg text-app-text-muted hover:text-app-primary-accent hover:bg-app-primary-accent/10 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-8">
            <button onClick={handleLoadMore} disabled={isLoadingMore} className="px-6 py-3 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors font-medium disabled:opacity-60">
              {isLoadingMore ? 'Loading...' : 'Load More Articles'}
            </button>
          </div>

          {/* Read Modal */}
          <motion.div
            animate={{ opacity: selectedArticle ? 1 : 0, pointerEvents: selectedArticle ? 'auto' : 'none' }}
            className="fixed inset-0 z-40"
          >
            {selectedArticle && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
                <div className="bg-app-card-surface border border-app-borders rounded-2xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-56 object-cover" />
                    <button onClick={() => setSelectedArticle(null)} className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 text-white hover:bg-black/60">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-app-text-muted">
                      <span className="px-2 py-1 bg-app-primary-accent/10 text-app-primary-accent border border-app-primary-accent/20 rounded-full font-medium">{selectedArticle.category}</span>
                      <span className="font-medium text-app-primary-accent">{selectedArticle.source}</span>
                      <span>•</span>
                      <span>{selectedArticle.publishedAt}</span>
                      <span>•</span>
                      <span>{selectedArticle.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-app-text-primary">{selectedArticle.title}</h3>
                    <p className="text-app-text-muted leading-relaxed">{selectedArticle.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenExternal(selectedArticle)} className="px-3 py-2 rounded-lg bg-app-primary-accent text-white text-sm flex items-center gap-2">
                          <ExternalLink className="w-4 h-4"/>
                          Open in browser
                        </button>
                        <button onClick={() => handleShare(selectedArticle)} className="px-3 py-2 rounded-lg bg-app-primary-accent/10 text-app-primary-accent border border-app-primary-accent/20 text-sm flex items-center gap-2">
                          <Share2 className="w-4 h-4"/>
                          Share
                        </button>
                      </div>
                      <button onClick={() => toggleBookmark(selectedArticle.id)} className={`p-2 rounded-lg ${bookmarkedArticles.has(selectedArticle.id) ? 'text-app-primary-accent bg-app-primary-accent/10' : 'text-app-text-muted hover:text-app-primary-accent hover:bg-app-primary-accent/10'}`}>
                        <Bookmark className={`w-5 h-5 ${bookmarkedArticles.has(selectedArticle.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Share toast */}
          <motion.div
            animate={{ y: isShareToast ? 0 : 50, opacity: isShareToast ? 1 : 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            {isShareToast && (
              <div className="px-4 py-2 rounded-lg bg-black/80 text-white text-sm border border-white/10">
                {isShareToast}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default News;
