import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Play,
  TrendingUp,
  Eye,
  Lightbulb,
  ExternalLink,
  Clock,
  Users,
  Plus,
  Calendar,
  Link,
  ChevronUp,
  ChevronDown,
  Flame,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { useNotifications } from '../contexts/NotificationContext';
import { factsApi, type Fact } from '../services/factsApi';
import { useApi } from '../hooks/useApi';
import { Post, Comment as ThreadComment } from '../contexts/PostContext';
import ThreadedComments from '../components/ThreadedComments';
import Events from '../components/Events';
import EventsPage from './EventsPage';
// Backend live feed removed from Home; API imports not needed here


interface Author {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  level: number;
}



interface NewsArticle {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  image: string;
}



// Enhanced Comments Section Component with infinite threading and media upload
interface EnhancedCommentsSectionProps {
  post: Post;
  user: any;
  onAddComment: (postId: number, parentId: number | null, content: string, media?: { type: 'image' | 'video'; url: string }) => void;
  onClose: () => void;
}

const EnhancedCommentsSection: React.FC<EnhancedCommentsSectionProps> = ({ post, user, onAddComment, onClose }) => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [commentMedia, setCommentMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [replyMedia, setReplyMedia] = useState<{ [key: number]: { type: 'image' | 'video'; url: string } | null }>({});

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean = false, commentId?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const mediaUrl = event.target.result as string;
          const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
          
          if (isReply && commentId) {
            setReplyMedia(prev => ({ ...prev, [commentId]: { type: mediaType, url: mediaUrl } }));
          } else {
            setCommentMedia({ type: mediaType, url: mediaUrl });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = (isReply: boolean = false, commentId?: number) => {
    if (isReply && commentId) {
      setReplyMedia(prev => ({ ...prev, [commentId]: null }));
    } else {
      setCommentMedia(null);
    }
  };

  const submitComment = (content: string, parentId: number | null = null) => {
    if (content.trim() || commentMedia || (parentId && replyMedia[parentId])) {
      const media = parentId ? replyMedia[parentId] : commentMedia;
      onAddComment(post.id, parentId, content.trim(), media || undefined);
      
      if (parentId) {
        setReplyMedia(prev => ({ ...prev, [parentId]: null }));
        setReplyingTo(null);
      } else {
        setCommentMedia(null);
      }
    }
  };

  const renderComment = (comment: ThreadComment, depth: number = 0) => {
    const maxDepth = 6; // Maximum nesting depth
    const isMaxDepth = depth >= maxDepth;
    
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-4 mt-3' : ''}`}>
        <div className="flex gap-3">
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className={`${depth === 0 ? 'w-8 h-8' : 'w-6 h-6'} rounded-full flex-shrink-0`}
          />
          <div className="flex-1">
            <div className="bg-app-card-surface rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium text-app-text-primary ${depth === 0 ? 'text-sm' : 'text-xs'}`}>
                  {comment.author.name}
                </span>
                {comment.author.verified && (
                  <div className={`${depth === 0 ? 'w-3 h-3' : 'w-2.5 h-2.5'} bg-app-primary-accent rounded-full flex items-center justify-center`}>
                   
                  </div>
                )}
                <span className="text-xs text-app-text-muted">
                  {comment.author.username}
                </span>
                <span className="text-xs text-app-text-muted">•</span>
                <span className="text-xs text-app-text-muted">
                  {comment.timestamp}
                </span>
              </div>
              <p className={`text-app-text-primary ${depth === 0 ? 'text-sm' : 'text-xs'} leading-relaxed`}>
                {comment.content}
              </p>
              {/* Comment Media */}
              {(comment as any).media && (
                <div className="mt-2">
                  {(comment as any).media.type === 'image' ? (
                    <img src={(comment as any).media.url} alt="Comment media" className="max-w-xs rounded-lg" />
                  ) : (
                    <video src={(comment as any).media.url} controls className="max-w-xs rounded-lg" />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 ml-3">
              <button className="text-xs text-app-text-muted hover:text-app-primary-accent transition-colors">
                Like
              </button>
              {!isMaxDepth && (
                <button 
                  className="text-xs text-app-text-muted hover:text-app-primary-accent transition-colors"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  Reply
                </button>
              )}
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-3 ml-3">
                <div className="flex gap-2">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                    alt="Your avatar"
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      placeholder={`Reply to ${comment.author.name}...`}
                      className="w-full bg-app-background text-app-text-primary placeholder-app-text-muted rounded-lg px-3 py-2 text-xs border border-app-borders focus:border-app-primary-accent focus:outline-none resize-none"
                      rows={2}
                      id={`reply-textarea-${comment.id}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const content = e.currentTarget.value.trim();
                          if (content || replyMedia[comment.id]) {
                            submitComment(content, comment.id);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    
                    {/* Reply Media Preview */}
                    {replyMedia[comment.id] && (
                      <div className="mt-2">
                        <div className="relative inline-block">
                          {replyMedia[comment.id]!.type === 'image' ? (
                            <img src={replyMedia[comment.id]!.url} alt="Reply media" className="w-20 h-20 object-cover rounded-lg" />
                          ) : (
                            <video src={replyMedia[comment.id]!.url} className="w-20 h-20 object-cover rounded-lg" controls />
                          )}
                          <button
                            onClick={() => removeMedia(true, comment.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleMediaUpload(e, true, comment.id)}
                          className="hidden"
                          id={`reply-media-${comment.id}`}
                        />
                        <button
                          onClick={() => document.getElementById(`reply-media-${comment.id}`)?.click()}
                          className="text-xs text-app-text-muted hover:text-app-primary-accent transition-colors flex items-center gap-1"
                        >
                          <Link className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-xs text-app-text-muted hover:text-red-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`reply-textarea-${comment.id}`) as HTMLTextAreaElement | null;
                            const content = textarea?.value.trim() || '';
                            if (content || replyMedia[comment.id]) {
                              submitComment(content, comment.id);
                              if (textarea) textarea.value = '';
                            }
                          }}
                          className="bg-app-primary-accent hover:bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-app-borders bg-app-background/50">
      {/* Main Comment Input */}
      <div className="p-4">
        <div className="flex gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
            alt="Your avatar"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              placeholder="Write a comment..."
              className="w-full bg-app-card-surface text-app-text-primary placeholder-app-text-muted rounded-lg px-3 py-2 text-sm border border-app-borders focus:border-app-primary-accent focus:outline-none resize-none"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const content = e.currentTarget.value.trim();
                  if (content || commentMedia) {
                    submitComment(content);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            
            {/* Comment Media Preview */}
            {commentMedia && (
              <div className="mt-2">
                <div className="relative inline-block">
                  {commentMedia.type === 'image' ? (
                    <img src={commentMedia.url} alt="Comment media" className="w-24 h-24 object-cover rounded-lg" />
                  ) : (
                    <video src={commentMedia.url} className="w-24 h-24 object-cover rounded-lg" controls />
                  )}
                  <button
                    onClick={() => removeMedia()}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleMediaUpload(e)}
                  className="hidden"
                  id="comment-media-upload"
                />
                <button
                  onClick={() => document.getElementById('comment-media-upload')?.click()}
                  className="text-xs text-app-text-muted hover:text-app-primary-accent transition-colors flex items-center gap-1"
                >
                  <Link className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={(e) => {
                  const textarea = e.currentTarget.parentElement?.parentElement?.querySelector('textarea') as HTMLTextAreaElement;
                  const content = textarea?.value.trim() || '';
                  if (content || commentMedia) {
                    submitComment(content);
                    textarea.value = '';
                  }
                }}
                className="bg-app-primary-accent hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {post.comments && post.comments.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {post.comments.map((comment) => renderComment(comment, 0))}
          </div>
        </div>
      )}

      {/* Close Comments Button */}
      <div className="px-4 pb-3">
        <button
          onClick={onClose}
          className="text-xs text-app-text-muted hover:text-app-primary-accent transition-colors"
        >
          Hide comments
        </button>
      </div>
    </div>
  );
};

// Global Lightbox overlay rendered within ModernHome
// Insert after ModernHome return if not already present

const ModernHome: React.FC = () => {
  const { user } = useAuth();
  const { posts: contextPosts, addPost, setPosts, toggleBookmark } = usePosts();
  
  // Fetch posts from backend
  const { data: backendPosts, loading: postsLoading, error: postsError, refetch: refetchPosts } = useApi(
    () => import('../services/api').then(api => api.posts.getFeed(20, 0)),
    { immediate: true, cache: true, cacheKey: 'home_feed' }
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [showEventsPage, setShowEventsPage] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  // Lightbox state for gallery view
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Additional state variables
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [didYouKnowFacts, setDidYouKnowFacts] = useState<Fact[]>([]);
  const [isLoadingFacts, setIsLoadingFacts] = useState(false);
  const [menuOpenPostId, setMenuOpenPostId] = useState<number | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<number>>(new Set());
  const [mutedUsernames, setMutedUsernames] = useState<Set<string>>(new Set());
  
  // WIYM post state
  const [wiymContent, setWiymContent] = useState('');
  const [wiymImages, setWiymImages] = useState<string[]>([]);
  const [wiymVideo, setWiymVideo] = useState<string | null>(null);
  const [wiymTaggedPeople, setWiymTaggedPeople] = useState<string[]>([]);
  
  // Comment system state
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  
  // Following system state
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followVersion, setFollowVersion] = useState(0);

  const openLightbox = useCallback((images: string[], startIndex: number = 0) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(Math.max(0, Math.min(startIndex, images.length - 1)));
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % (lightboxImages.length || 1));
  }, [lightboxImages.length]);
  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + (lightboxImages.length || 1)) % (lightboxImages.length || 1));
  }, [lightboxImages.length]);

  

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

  // Load facts on component mount
  useEffect(() => {
    const loadFacts = async () => {
      setIsLoadingFacts(true);
      try {
        // Get initial random facts
        const facts = factsApi.getRandomFacts(15);
        setDidYouKnowFacts(facts);
      } catch (error) {
        console.error('Error loading facts:', error);
        // Fallback to a single fact if API fails
        setDidYouKnowFacts([factsApi.getRandomFact()]);
      } finally {
        setIsLoadingFacts(false);
      }
    };
    
    loadFacts();
  }, []);

  // Rotate facts every 10 seconds and refresh with new random facts
  useEffect(() => {
    if (didYouKnowFacts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => {
        const nextIndex = (prev + 1) % didYouKnowFacts.length;
        
        // Every 5 facts, refresh with new random facts
        if (nextIndex === 0 && didYouKnowFacts.length > 0) {
          const newFacts = factsApi.getRandomFacts(15);
          setDidYouKnowFacts(newFacts);
        }
        
        return nextIndex;
      });
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [didYouKnowFacts.length]);
  
  // Posts loaded from backend via PostContext
  
  // State variables already declared above
  const [isPostingWiym, setIsPostingWiym] = useState(false);
  const [showTagPeopleInput, setShowTagPeopleInput] = useState(false);
  // Tag People autocomplete state
  const [tagInput, setTagInput] = useState('');
  const [tagDebounced, setTagDebounced] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [tagActiveIndex, setTagActiveIndex] = useState(-1);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const tagSuppressUntilRef = useRef<number>(0);
  // Dynamic username suggestions now fetched from backend
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  // Keyboard navigation handled on input; click outside handled via onBlur logic below

  // Debounce the tag input
  useEffect(() => {
    const t = setTimeout(() => setTagDebounced(tagInput), 200);
    return () => clearTimeout(t);
  }, [tagInput]);

  // Build tag suggestions when input has an @query (dynamic via backend)
  useEffect(() => {
    const raw = (tagDebounced || '').trim();
    const match = raw.match(/^@?(\w{1,20})$/);
    if (!raw || !match) {
      setTagSuggestions([]);
      setShowTagSuggestions(false);
      setTagActiveIndex(-1);
      return;
    }
    // Suppress right after selection
    if (Date.now() < tagSuppressUntilRef.current) {
      return;
    }
    const q = match[1].toLowerCase();
    let alive = true;
    (async () => {
      try {
        const { default: userService } = await import('../services/userService');
        const results = await userService.searchUsers(q, 10);
        if (!alive) return;
        const list = (results || []).map(u => u.username);
        setTagSuggestions(list);
        setShowTagSuggestions(list.length > 0);
        setTagActiveIndex(list.length > 0 ? 0 : -1);
      } catch (e) {
        console.warn('User search failed:', e);
        if (!alive) return;
        setTagSuggestions([]);
        setShowTagSuggestions(false);
        setTagActiveIndex(-1);
      }
    })();
    return () => { alive = false; };
  }, [tagDebounced]);

  // Reverse geocode lat/lng to a compact address string like: "560001, Bengaluru, Karnataka"
  // Uses OpenStreetMap Nominatim (free). Falls back to city/state or just PIN when parts missing.
  const getPostalCodeFromCoords = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: 'json',
        addressdetails: '1',
      });
      const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const addr = data?.address || {};
      const pin: string | undefined = addr.postcode;
      const city: string | undefined = addr.city || addr.town || addr.village || addr.suburb;
      const state: string | undefined = addr.state;
      if (pin || city || state) {
        return [pin, city, state].filter(Boolean).join(', ');
      }
      return null;
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
      return null;
    }
  };


  // WIYM media handlers
  const handleWiymImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setWiymImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleWiymVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setWiymVideo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeWiymImage = (index: number) => {
    setWiymImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTaggedPerson = (person: string) => {
    if (person.trim() && !wiymTaggedPeople.includes(person.trim())) {
      setWiymTaggedPeople(prev => [...prev, person.trim()]);
    }
  };

  const removeTaggedPerson = (person: string) => {
    setWiymTaggedPeople(prev => prev.filter(p => p !== person));
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setWiymImages(prev => [...prev, imageDataUrl]);
        stopCamera();
      }
    }
  };

  // Effect to start camera when showCamera becomes true
  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  // Handle WIYM post submission
  const handleWiymPost = async () => {
    if (!wiymContent.trim() && wiymImages.length === 0 && !wiymVideo) return;
    setIsPostingWiym(true);
    try {
      const newPost: Post = {
        id: Date.now(),
        author: {
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous',
          username: `@${user?.user_metadata?.username || user?.user_metadata?.preferred_username || user?.email?.split('@')[0] || 'user'}`,
          avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User') + '&background=FF6B00&color=fff',
          verified: user && 'verified' in user ? (user as any).verified : false,
          level: user && 'level' in user ? (user as any).level : 1,
        },
        content: wiymContent.trim(),
        image: wiymImages[0] || undefined,
        video: wiymVideo || undefined,
        timestamp: 'now',
        upvotes: 1,
        downvotes: 0,
        userVote: 1,
        pedalPoints: 10,
        comments: [],
        shares: 0,
        views: 0,
        bookmarked: false,
        tags: ['#WIYM'],
        isWiym: true,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      };
      addPost(newPost);
      // Reset form
      setWiymContent('');
      setWiymImages([]);
      setWiymVideo(null);
      setWiymTaggedPeople([]);
      setShowTagPeopleInput(false);
    } catch (error) {
      console.error('Error creating WIYM post:', error);
    } finally {
      setIsPostingWiym(false);
    }
  };

  // Add a comment or reply with optional media support
  const handleAddComment = (postId: number, parentId: number | null, content: string, media?: { type: 'image' | 'video'; url: string }) => {
    setPosts((prevPosts: Post[]) => prevPosts.map((post: Post) => {
      if (post.id !== postId) return post;
      const author: Author = user ? {
        name: user.user_metadata?.full_name || user.email || 'Your Name',
        username: `@${user.user_metadata?.username || user.email?.split('@')[0] || 'username'}`,
        avatar: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: 'verified' in user ? (user as any).verified : false,
        level: 'level' in user ? (user as any).level : 1,
      } : {
        name: 'Guest', username: '@guest', avatar: '', verified: false, level: 1
      };
      const newComment: ThreadComment & { media?: { type: 'image' | 'video'; url: string } } = {
        id: Date.now(),
        author,
        content,
        timestamp: 'now',
        replies: [],
        ...(media && { media })
      };
      let pedalPoints = post.pedalPoints || 0;
      pedalPoints += 2; // +2 points for commenting
      let comments = post.comments || [];
      if (!parentId) {
        comments = [...comments, newComment];
      } else {
        // Recursive helper to add reply
        const addReply = (comments: ThreadComment[]): ThreadComment[] =>
          comments.map(c => c.id === parentId
            ? { ...c, replies: c.replies ? [...c.replies, newComment] : [newComment] }
            : { ...c, replies: c.replies ? addReply(c.replies) : [] }
          );
        comments = addReply(comments);
      }
      return { ...post, comments, pedalPoints };
    }));
  };

  // Compute total comments including all nested replies
  const getTotalComments = (comments: ThreadComment[] = []): number => {
    return comments.reduce((sum, c) => sum + 1 + getTotalComments(c.replies || []), 0);
  };

  // Share handler with Web Share API + fallback to clipboard
  const handleShare = async (postId: number) => {
    try {
      const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
      const shareData = {
        title: 'Check this out on Pedal',
        text: 'Found this interesting post on Pedal',
        url: shareUrl,
      };

      let shared = false;

      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        try {
          await (navigator as any).share(shareData);
          shared = true;
        } catch (err: any) {
          // If user cancels the share, do nothing
          if (err && err.name !== 'AbortError') {
            console.warn('Web Share failed, falling back to clipboard:', err);
          }
        }
      }

      if (!shared) {
        // Fallback: copy link to clipboard
        if ((navigator as any)?.clipboard?.writeText) {
          await (navigator as any).clipboard.writeText(shareUrl);
          if (typeof window !== 'undefined') window.alert('Link copied to clipboard!');
          shared = true;
        } else if (typeof document !== 'undefined') {
          // Legacy copy method
          const input = document.createElement('input');
          input.value = shareUrl;
          document.body.appendChild(input);
          input.select();
          try {
            document.execCommand('copy');
            if (typeof window !== 'undefined') window.alert('Link copied to clipboard!');
            shared = true;
          } finally {
            document.body.removeChild(input);
          }
        }
      }

      if (shared) {
        setPosts((prevPosts: Post[]) => prevPosts.map((post: Post) => {
          if (post.id !== postId) return post;
          return { ...post, shares: (post.shares || 0) + 1 };
        }));
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Upvote/Downvote logic
  const handleVote = (postId: number, vote: 1 | -1) => {
    setPosts((prevPosts: Post[]) => prevPosts.map((post: Post) => {
      if (post.id !== postId) return post;
      let upvotes = post.upvotes;
      let downvotes = post.downvotes;
      let userVote = post.userVote ?? 0;
      let pedalPoints = post.pedalPoints || 0;
      if (userVote === vote) {
        // Remove vote
        if (vote === 1) upvotes -= 1;
        else downvotes -= 1;
        userVote = 0;
        pedalPoints -= 1; // Remove point for removing vote
      } else {
        // Change or add vote
        if (vote === 1) {
          upvotes += 1;
          if (userVote === -1) downvotes -= 1;
          pedalPoints += 1;
        } else {
          downvotes += 1;
          if (userVote === 1) upvotes -= 1;
          pedalPoints -= 1;
        }
        userVote = vote;
      }
      return { ...post, upvotes, downvotes, userVote, pedalPoints };
    }));
  };

  // removed local toggleBookmark; using context toggleBookmark

  // Load news and facts from backend

  // Posts loaded from backend via PostContext
  
  // Infinite scroll functionality - now loads from backend
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;
    
    setIsLoadingMore(true);
    
    try {
      // Load more posts from backend via PostContext
      // This will be handled by the PostContext's fetchMorePosts method
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
    
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePosts]);
  
  // Scroll event listener for infinite scroll (works for both mobile and desktop)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target;
      
      // Check if we're scrolling in a container with overflow-y-auto (desktop feed container)
      if (target && target instanceof HTMLElement && target.classList.contains('overflow-y-auto')) {
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (scrollTop + clientHeight >= scrollHeight - 1000) {
          loadMorePosts();
        }
        return;
      }
      
      // Check for document/window scroll (mobile or fallback)
      if (target === document.documentElement || target === document || !target) {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
          loadMorePosts();
        }
      }
    };
    
    // Add listeners for both window (mobile) and potential desktop containers
    window.addEventListener('scroll', handleScroll, true); // Use capture phase
    document.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [loadMorePosts]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // State variables already declared above

  // Helper: render post content with clickable hashtags
  const renderContentWithHashtags = useCallback((text: string) => {
    const parts = text.split(/(#[A-Za-z0-9_]+)/g);
    return (
      <>
        {parts.map((part, idx) => {
          const isHash = /^#[A-Za-z0-9_]+$/.test(part);
          if (!isHash) return <span key={idx}>{part}</span>;
          return (
            <button
              key={idx}
              className="text-app-primary-accent hover:underline inline"
              onClick={() => {
                setHashtagFilter(part);
                // Scroll near top of feed for context
                try {
                  const feedTitle = document.querySelector('#community-feed-title');
                  (feedTitle as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch {}
              }}
            >
              {part}
            </button>
          );
        })}
      </>
    );
  }, []);

  // Filter posts by hashtag (checks tags array and content text) and hidden/muted states
  useEffect(() => {
    const bump = () => setFollowVersion(v => v + 1);
    window.addEventListener('realtime:follow' as any, bump as any);
    window.addEventListener('realtime:unfollow' as any, bump as any);
    window.addEventListener('realtime:follow_accept' as any, bump as any);
    return () => {
      window.removeEventListener('realtime:follow' as any, bump as any);
      window.removeEventListener('realtime:unfollow' as any, bump as any);
      window.removeEventListener('realtime:follow_accept' as any, bump as any);
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const base = (contextPosts as any[]).filter((p: any) => !hiddenPostIds.has(p.id) && !mutedUsernames.has(p.author.username));
    // Follow filter: include self posts and accepted following
    const currentUserId = user?.id;
    const following = currentUserId ? new Set([]) : new Set<string>(); // TODO: Implement followService
    const byFollow = base.filter((p: any) => {
      const aid = (p.author as any)?.id as string | undefined;
      if (!aid) return true; // Allow posts lacking author id
      if (currentUserId && aid === currentUserId) return true; // Always show own posts
      return following.has(aid);
    });
    if (!hashtagFilter) return byFollow;
    const tagLower = hashtagFilter.toLowerCase();
    return byFollow.filter((p: any) => {
      const inTags = (p.tags || []).some((t: any) => t.toLowerCase() === tagLower);
      const inContent = (p.content || '').toLowerCase().includes(tagLower);
      return inTags || inContent;
    });
  }, [contextPosts, hashtagFilter, hiddenPostIds, mutedUsernames, user?.id, followVersion]);

  // Handlers for menu actions
  const handleCopyLink = (postId: number) => {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      navigator.clipboard?.writeText(url);
    } catch {}
    setMenuOpenPostId(null);
  };

  const handleHidePost = (postId: number) => {
    setHiddenPostIds((prev) => new Set(prev).add(postId));
    setMenuOpenPostId(null);
  };

  const handleUnfollow = (username: string) => {
    setMutedUsernames((prev) => new Set(prev).add(username));
    setMenuOpenPostId(null);
  };

  const handleReportPost = (postId: number) => {
    console.log('Reported post', postId);
    setMenuOpenPostId(null);
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prev: Post[]) => prev.filter((p: Post) => p.id !== postId));
    setMenuOpenPostId(null);
  };

  // Handle voting on poll
  const handleVoteOnPoll = useCallback((postId: number, optionIndex: number) => {
    const userId = user?.id || 'user-1';
    setPosts((prev: Post[]) => prev.map((p: Post) => {
      if (p.id !== postId || !p.poll) return p;
      const poll = p.poll;
      const votes = Array.isArray(poll.votes) ? [...poll.votes] : [];
      // Remove previous vote by this user (if any)
      const withoutUser = votes.filter(v => v.userId !== userId);
      // Add new vote
      withoutUser.push({ optionIndex, userId });
      return { ...p, poll: { ...poll, votes: withoutUser } };
    }));
  }, [user?.id, setPosts]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: any) => {
      setMenuOpenPostId(null);
    };
    if (menuOpenPostId !== null) {
      document.addEventListener('click', handler, { capture: true });
    }
    return () => document.removeEventListener('click', handler, { capture: true } as any);
  }, [menuOpenPostId]);

  // Effect to handle events button click from sidebar
  useEffect(() => {
    const handleShowEvents = () => {
      setShowEventsPage(true);
    };
    
    window.addEventListener('showEvents', handleShowEvents);
    return () => window.removeEventListener('showEvents', handleShowEvents);
  }, []);

  // Show EventsPage if requested
  if (showEventsPage) {
    return <EventsPage onBack={() => setShowEventsPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-app-background" onScroll={(e) => {
      // Handle scroll for desktop layout
      const target = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;
      
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadMorePosts();
      }
    }}>
      <div className="pb-20 md:pb-0">
        {/* Main Container - Centered and Responsive */}
        {/* Main Content Area */}
        <div className="flex gap-4 max-w-7xl mx-auto px-4">
          {/* Posts Feed */}
          <div className="flex-1 max-w-2xl">
            {/* Did You Know Section */}
            <div className="p-4 border-b border-app-borders">
            <motion.div 
              key={currentFactIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-app-primary-accent/10 to-orange-500/10 rounded-xl p-4 border border-app-primary-accent/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-app-primary-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-app-primary-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-app-text-primary mb-1">Did You Know?</h3>
                  <p className="text-sm text-app-text-muted leading-relaxed">
                    {isLoadingFacts ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading facts...
                      </span>
                    ) : didYouKnowFacts.length > 0 ? (
                      <>
                        {didYouKnowFacts[currentFactIndex]?.text}
                        {didYouKnowFacts[currentFactIndex]?.source && (
                          <span className="block text-xs text-orange-400 mt-1">
                            Source: {didYouKnowFacts[currentFactIndex].source}
                          </span>
                        )}
                      </>
                    ) : (
                      'Loading automotive facts...'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* What's in your mind today? - Post Creation Box */}
          <div className="py-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <img
                  src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff'}
                  alt="Your avatar"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0 overflow-visible">
                  <textarea
                    placeholder="What's in your mind today?"
                    className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none text-base md:text-lg min-h-[80px] md:min-h-[100px]"
                    rows={3}
                    value={wiymContent}
                    onChange={(e) => setWiymContent(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700 overflow-visible">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {/* Responsive icon size for Add Photo */}
<>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleWiymImageUpload}
                          className="hidden"
                          id="wiym-image-upload"
                        />
                        <button 
                          className="flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-lg hover:bg-gray-700/50 flex-shrink-0"
                          title="Add Photo"
                          onClick={() => document.getElementById('wiym-image-upload')?.click()}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </>
                      <button 
                        className="flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-lg hover:bg-gray-700/50 flex-shrink-0" 
                        title="Live Camera"
                        onClick={() => setShowCamera(!showCamera)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button 
                        className="flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-lg hover:bg-gray-700/50 flex-shrink-0" 
                        title="Tag Friends"
                        onClick={() => setShowTagPeopleInput(!showTagPeopleInput)}
                      >
                        <Users className="w-5 h-5" />
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                    <button 
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium transition-colors text-sm flex-shrink-0"
                      onClick={handleWiymPost}
                      disabled={isPostingWiym || (!wiymContent.trim() && wiymImages.length === 0 && !wiymVideo)}
                    >
                      {isPostingWiym ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                  
                  {/* Tag People Input */}
                  {showTagPeopleInput && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {wiymTaggedPeople.map((person, index) => (
                          <span key={index} className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            @{person}
                            <button onClick={() => removeTaggedPerson(person)} className="hover:text-orange-300">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          const v = e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value;
                          setTagInput(v);
                        }}
                        onFocus={() => {
                          if (tagSuggestions.length > 0) setShowTagSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (showTagSuggestions && tagSuggestions.length > 0) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setTagActiveIndex((prev) => Math.min(prev + 1, tagSuggestions.length - 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setTagActiveIndex((prev) => Math.max(prev - 1, 0));
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              const pick = tagSuggestions[tagActiveIndex] || tagSuggestions[0];
                              if (pick) {
                                addTaggedPerson(pick);
                                setTagInput('');
                                setShowTagSuggestions(false);
                                tagInputRef.current?.blur();
                                tagSuppressUntilRef.current = Date.now() + 300;
                              }
                            } else if (e.key === 'Escape') {
                              setShowTagSuggestions(false);
                            }
                          } else if (e.key === 'Enter') {
                            // If no suggestions showing, treat as manual entry without '@'
                            const cleaned = tagInput.replace(/^@/, '').trim();
                            if (cleaned) {
                              addTaggedPerson(cleaned);
                              setTagInput('');
                            }
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => setShowTagSuggestions(false), 120);
                        }}
                        placeholder="Tag people..."
                        className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-orange-500 focus:outline-none"
                      />
                      {showTagSuggestions && tagSuggestions.length > 0 && (
                        <ul className="relative z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-52 overflow-auto">
                          {tagSuggestions.map((u, idx) => (
                            <li
                              key={u}
                              className={`px-3 py-2 text-sm cursor-pointer text-white hover:bg-orange-500/20 ${idx === tagActiveIndex ? 'bg-orange-500/30' : ''}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                addTaggedPerson(u);
                                setTagInput('');
                                setShowTagSuggestions(false);
                                tagInputRef.current?.blur();
                                tagSuppressUntilRef.current = Date.now() + 300;
                              }}
                              onMouseEnter={() => setTagActiveIndex(idx)}
                            >
                              @{u}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  
                  {/* Camera Modal */}
                  {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-white">Take Photo</h3>
                          <button 
                            onClick={stopCamera}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="relative mb-4">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full rounded-lg bg-black"
                            style={{ aspectRatio: '4/3' }}
                          />
                        </div>
                        
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={capturePhoto}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Capture
                          </button>
                          <button
                            onClick={stopCamera}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        
                        {/* Hidden canvas for photo capture */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                      </div>
                    </div>
                  )}
                  
                  {/* Image Previews */}
                  {wiymImages.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {wiymImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img src={image} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                            <button
                              onClick={() => removeWiymImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Video Preview */}
                  {wiymVideo && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="relative inline-block">
                        <video src={wiymVideo} className="w-32 h-24 object-cover rounded-lg" controls />
                        <button
                          onClick={() => setWiymVideo(null)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>




          {/* Posts and Events Layout */}
          <div className="py-4 flex gap-4">
            {/* Posts Feed */}
            <div className="flex-1">
            {/* Community Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-app-primary-accent" />
                <h2 className="text-xl font-bold text-app-text-primary">Feed</h2>
              </div>
              {/* Events Button - Small */}
              <button
                onClick={() => {
                  console.log('Events button clicked');
                  setShowEventsPage(true);
                }}
                className="bg-app-primary-accent hover:bg-app-primary-accent/90 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Events
              </button>
            </div>
            {hashtagFilter && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-app-text-muted">Filtering by</span>
                <span className="px-2 py-1 bg-app-primary-accent/10 text-app-primary-accent border border-app-primary-accent/20 rounded-full text-xs font-medium">
                  {hashtagFilter}
                </span>
                <button
                  onClick={() => setHashtagFilter(null)}
                  className="text-xs text-app-text-muted hover:text-app-primary-accent"
                >
                  Clear
                </button>
              </div>
            )}
            <div className="space-y-4">
              {filteredPosts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-app-card-surface rounded-xl border overflow-hidden ${
                    post.isWiym 
                      ? 'border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent' 
                      : 'border-app-borders'
                  }`}
                >
                  {/* Post Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
  <img
    src={post.author.avatar}
    alt={post.author.name}
    className="w-10 h-10 rounded-full"
  />
  {/* Removed level number overlay */}
</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-app-text-primary text-sm">
                              {post.author.name}
                            </h3>
                            {post.author.verified && (
                              <div className="w-4 h-4 bg-app-primary-accent rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-app-text-muted">
                            <span>{post.author.username}</span>
                            <span>•</span>
                            {post.isWiym && (
                               <>
                                 <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                   WIYM Post
                                 </span>
                                 <span>•</span>
                                 <span className="text-orange-400">
                                   {post.expiresAt && post.expiresAt > Date.now() 
                                     ? `${Math.ceil((post.expiresAt - Date.now()) / (1000 * 60 * 60))}h left`
                                     : 'Expired'
                                   }
                                 </span>
                                 <span>•</span>
                               </>
                             )}
                            <span>{post.timestamp}</span>
                            {post.location && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <span>{post.location}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative" data-post-menu>
                        <button
                          className="p-2 hover:bg-app-background rounded-full transition-colors"
                          aria-haspopup="menu"
                          aria-expanded={menuOpenPostId === post.id}
                          onClick={() => setMenuOpenPostId((cur) => (cur === post.id ? null : post.id))}
                        >
                          <MoreHorizontal className="w-4 h-4 text-app-text-muted" />
                        </button>
                        {menuOpenPostId === post.id && (
                          <>
                            {/* Desktop dropdown */}
                            <div className="hidden sm:block absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                              {!(user && user.user_metadata?.username === post.author.username) ? (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700/60"
                                    onClick={() => handleReportPost(post.id)}
                                  >
                                    Report
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700/60 border-t border-gray-700"
                                    onClick={() => handleUnfollow(post.author.username)}
                                  >
                                    Unfollow {post.author.username}
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700/60 border-t border-gray-700"
                                    onClick={() => handleHidePost(post.id)}
                                  >
                                    Hide
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700/60"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Mobile bottom sheet */}
                            <div className="sm:hidden fixed inset-x-0 bottom-0 z-[9999]">
                              <div className="mx-auto w-full max-w-screen-sm rounded-t-2xl bg-gray-800 border-t border-gray-700 shadow-2xl">
                                <div className="py-2 flex justify-center">
                                  <div className="w-12 h-1.5 rounded-full bg-gray-600" />
                                </div>
                                {!(user && user.user_metadata?.username === post.author.username) ? (
                                  <>
                                    <button
                                      className="w-full text-left px-5 py-4 text-base text-red-400 hover:bg-gray-700/60"
                                      onClick={() => handleReportPost(post.id)}
                                    >
                                      Report
                                    </button>
                                    <button
                                      className="w-full text-left px-5 py-4 text-base text-white hover:bg-gray-700/60 border-t border-gray-700"
                                      onClick={() => handleUnfollow(post.author.username)}
                                    >
                                      Unfollow {post.author.username}
                                    </button>
                                    <button
                                      className="w-full text-left px-5 py-4 text-base text-white hover:bg-gray-700/60 border-t border-gray-700"
                                      onClick={() => handleHidePost(post.id)}
                                    >
                                      Hide
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="w-full text-left px-5 py-4 text-base text-red-400 hover:bg-gray-700/60"
                                      onClick={() => handleDeletePost(post.id)}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                <button
                                  className="w-full text-center px-5 py-4 text-base text-white hover:bg-gray-700/60 border-t border-gray-700"
                                  onClick={() => setMenuOpenPostId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-app-text-primary leading-relaxed">{renderContentWithHashtags(post.content)}</p>
                    
                    {/* Tags */}
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag: any) => (
                          <button
                            key={tag}
                            onClick={() => setHashtagFilter(tag)}
                            className="px-2 py-1 bg-app-primary-accent/10 text-app-primary-accent border border-app-primary-accent/20 rounded-full text-xs font-medium hover:bg-app-primary-accent/20 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Media Content */}
                  {(() => {
                    // Prefer showing video if present
                    if (post.video) {
                      return (
                        <div className="relative">
                          <video
                            src={post.video}
                            className="w-full h-80 object-cover"
                            controls
                          />
                        </div>
                      );
                    }
                    const images = (post as any).images as string[] | undefined;
                    const displayImage = post.image || images?.[0];
                    if (!displayImage) return null;
                    // If multiple images, show a simple grid
                    if (images && images.length > 1) {
                      const toShow = images.slice(0, 4);
                      return (
                        <div className="grid grid-cols-2 gap-1">
                          {toShow.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`Post image ${i+1}`}
                              className={`w-full ${toShow.length > 2 ? 'h-40' : 'h-80'} object-cover cursor-pointer`}
                              onClick={() => openLightbox(images, i)}
                            />
                          ))}
                        </div>
                      );
                    }
                    // Single image
                    return (
                      <div className="relative">
                        <img
                          src={displayImage}
                          alt="Post content"
                          className="w-full h-80 object-cover cursor-pointer"
                          onClick={() => openLightbox(images ? images : [displayImage], images ? 0 : 0)}
                        />
                      </div>
                    );
                  })()}

                  {/* Poll Content */}
                  {post.poll && (
                    <div className="p-4 pt-3">
                      <div className="space-y-2">
                        {(() => {
                          const poll = post.poll;
                          const opts = (poll?.options || []).slice(0, 4);
                          return opts.map((opt: any, idx: any) => (
                          <label key={idx} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-app-borders hover:border-app-primary-accent/50 transition-colors cursor-pointer"
                            onClick={() => handleVoteOnPoll(post.id, idx)}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`poll-${post.id}`}
                                className="accent-app-primary-accent"
                                checked={Array.isArray(poll?.votes) ? poll!.votes.some((v: any) => v.userId === (user?.id || 'user-1') && v.optionIndex === idx) : false}
                                onChange={() => handleVoteOnPoll(post.id, idx)}
                              />
                              <span className="text-app-text-primary">{opt}</span>
                            </div>
                            {/* Simple vote count display (optional) */}
                            {Array.isArray(poll?.votes) && (
                              <span className="text-xs text-app-text-muted">{(poll?.votes?.filter((v: any) => v.optionIndex === idx).length) ?? 0} votes</span>
                            )}
                          </label>
                          ));
                        })()}
                      </div>
                      <div className="mt-2 text-xs text-app-text-muted">Duration: {post.poll?.duration}</div>
                    </div>
                  )}
                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <button
                            onClick={() => handleVote(post.id, 1)}
                            className={`flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-full transition-colors ${post.userVote === 1 ? 'bg-orange-500 text-white' : 'text-app-text-muted hover:bg-orange-500/70 hover:text-white'}`}
                            title="Upvote"
                            aria-label="Upvote"
                          >
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            <span className="text-xs sm:text-sm font-medium">{post.upvotes}</span>
                          </button>
                          <button
                            onClick={() => {
                              console.log('Downvote clicked for post:', post.id, 'Current userVote:', post.userVote, 'Current downvotes:', post.downvotes);
                              handleVote(post.id, -1);
                            }}
                            className={`flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-full transition-colors ${
                              post.userVote === -1 
                                ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
                                : 'text-app-text-muted hover:bg-red-500/10 hover:text-red-400'
                            }`}
                            title="Downvote"
                            aria-label="Downvote"
                          >
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            <span className="text-xs sm:text-sm font-medium">{post.downvotes}</span>
                          </button>
                        </div>
                        <button
                          className="flex items-center gap-1 sm:gap-2 text-app-text-muted hover:text-app-primary-accent transition-colors"
                          onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                          aria-label="Comments"
                        >
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span className="text-xs sm:text-sm font-medium">{getTotalComments(post.comments)}</span>
                        </button>
                        <button
                          className="flex items-center gap-1 sm:gap-2 text-app-text-muted hover:text-app-primary-accent transition-colors"
                          onClick={() => handleShare(post.id)}
                          aria-label="Share"
                        >
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span className="text-xs sm:text-sm font-medium">{formatNumber(post.shares)}</span>
                        </button>
                        <div className="flex-grow" />
                        <span className="flex items-center gap-1 text-xs sm:text-sm text-orange-400 font-bold mr-1 sm:mr-2" aria-label="Pedal Points">
                          <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm">{post.pedalPoints}</span>
                        </span>
                        <button
                          onClick={() => toggleBookmark(post.id)}
                          className={`transition-colors ${
                            post.bookmarked
                              ? 'text-app-primary-accent' 
                              : 'text-app-text-muted hover:text-app-primary-accent'
                          } flex items-center gap-1 p-1`}
                          aria-label={post.bookmarked ? 'Unsave Post' : 'Save Post'}
                        >
                          <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${post.bookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Comments Section */}
                  {activeCommentPostId === post.id && (
                    <EnhancedCommentsSection 
                      post={post} 
                      user={user} 
                      onAddComment={handleAddComment}
                      onClose={() => setActiveCommentPostId(null)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
            
          </div>
        </div>
        {/* Lightbox Overlay */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            {/* Backdrop close */}
            <button
              aria-label="Close"
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            {lightboxImages.length > 1 && (
              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <div className="max-w-5xl max-h-[85vh] px-6">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Image ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-xl"
              />
            </div>

            {/* Next */}
            {lightboxImages.length > 1 && (
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHome;
