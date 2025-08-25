import { useState, useCallback } from 'react';
import DataService from '../services/DataService';
import { useUser } from '../contexts/UserContext';

export const useAppFunctionality = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Post interactions
  const handleLikePost = useCallback(async (postId: string) => {
    const userId = user?.id || 'user-1';
    DataService.likePost(postId, userId);
    return DataService.getPosts();
  }, [user?.id]);

  const handleUpvotePost = useCallback(async (postId: string) => {
    const userId = user?.id || 'user-1';
    DataService.upvotePost(postId, userId);
    return DataService.getPosts();
  }, [user?.id]);

  const handleDownvotePost = useCallback(async (postId: string) => {
    const userId = user?.id || 'user-1';
    DataService.downvotePost(postId, userId);
    return DataService.getPosts();
  }, [user?.id]);

  const handleBookmarkPost = useCallback(async (postId: string) => {
    const userId = user?.id || 'user-1';
    DataService.bookmarkPost(postId, userId);
    return DataService.getPosts();
  }, [user?.id]);

  const handleSharePost = useCallback(async (postId: string) => {
    const userId = user?.id || 'user-1';
    DataService.sharePost(postId, userId);
    
    // Show share notification
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on PEDAL',
          text: 'Interesting post from the PEDAL community',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
      } catch (error) {
        showNotification('Failed to copy link', 'error');
      }
    }
    
    return DataService.getPosts();
  }, [user?.id]);

  const handleAddComment = useCallback(async (postId: string, content: string) => {
    if (!content.trim()) return null;
    
    const userId = user?.id || 'user-1';
    const commentData = {
      postId,
      authorId: userId,
      author: {
        id: userId,
        name: user?.fullName || 'User',
        username: user?.username || 'user',
        avatar: user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff'
      },
      content: content.trim()
    };
    
    return DataService.addComment(postId, commentData);
  }, [user]);

  // Navigation functions
  const handleNavigation = useCallback((destination: string, additionalData?: any) => {
    DataService.log('info', 'user', `Navigation to ${destination}`, user?.id, additionalData);
    
    switch (destination) {
      case 'profile':
        // Handle profile navigation
        break;
      case 'settings':
        // Handle settings navigation
        break;
      case 'messages':
        // Handle messages navigation
        break;
      case 'notifications':
        // Handle notifications navigation
        break;
      default:
        break;
    }
  }, [user?.id]);

  // Search functionality
  const handleSearch = useCallback(async (query: string, filters?: any) => {
    setIsLoading(true);
    DataService.log('info', 'user', `Search performed: ${query}`, user?.id, { query, filters });
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const posts = DataService.getPosts();
      const filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        post.author.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return filteredPosts;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Create post functionality
  const handleCreatePost = useCallback(async (postData: {
    content: string;
    images?: string[];
    location?: string;
    tags?: string[];
  }) => {
    setIsLoading(true);
    
    try {
      const userId = user?.id || 'user-1';
      const newPost = DataService.createPost({
        authorId: userId,
        author: {
          id: userId,
          name: user?.fullName || 'User',
          username: user?.username || 'user',
          avatar: user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff'
        },
        content: postData.content,
        images: postData.images || [],
        location: postData.location,
        tags: postData.tags || []
      });
      
      showNotification('Post created successfully!', 'success');
      return newPost;
    } catch (error) {
      showNotification('Failed to create post', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Follow/Unfollow functionality
  const handleFollowUser = useCallback(async (targetUserId: string) => {
    const userId = user?.id || 'user-1';
    DataService.log('info', 'user', `Follow action`, userId, { targetUserId });
    
    const ok = DataService.followUser(userId, targetUserId);
    if (ok) {
      showNotification('Followed successfully', 'success');
      return true;
    } else {
      showNotification('Failed to follow user', 'error');
      return false;
    }
  }, [user?.id]);

  // Notification functions
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }, []);

  // Menu actions
  const handleMenuAction = useCallback((action: string, data?: any) => {
    DataService.log('info', 'user', `Menu action: ${action}`, user?.id, data);
    
    switch (action) {
      case 'logout':
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        window.location.reload();
        break;
      case 'theme-toggle':
        // Handle theme toggle
        showNotification('Theme toggled', 'info');
        break;
      case 'clear-cache':
        localStorage.clear();
        showNotification('Cache cleared', 'success');
        break;
      default:
        showNotification(`Action: ${action}`, 'info');
        break;
    }
  }, [user?.id]);

  // File upload functionality
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    setIsLoading(true);
    
    try {
      const fileArray = Array.from(files);
      const uploadedUrls: string[] = [];
      
      for (const file of fileArray) {
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock URL (in real app, this would be actual upload)
        const mockUrl = URL.createObjectURL(file);
        uploadedUrls.push(mockUrl);
        
        DataService.log('info', 'user', `File uploaded: ${file.name}`, user?.id, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
      }
      
      // Clarify this is only an attachment, not a published post
      showNotification(`${fileArray.length} file(s) attached. They will be posted when you tap Share.`, 'info');
      return uploadedUrls;
    } catch (error) {
      showNotification('Failed to upload files', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Form submission functionality
  const handleFormSubmit = useCallback(async (formType: string, formData: any) => {
    setIsLoading(true);
    
    try {
      DataService.log('info', 'user', `Form submitted: ${formType}`, user?.id, formData);
      
      // Simulate form processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Form submitted successfully!', 'success');
      return true;
    } catch (error) {
      showNotification('Failed to submit form', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    // Post interactions
    handleLikePost,
    handleUpvotePost,
    handleDownvotePost,
    handleBookmarkPost,
    handleSharePost,
    handleAddComment,
    
    // Navigation
    handleNavigation,
    
    // Search
    handleSearch,
    
    // Create content
    handleCreatePost,
    
    // Social
    handleFollowUser,
    
    // UI
    showNotification,
    
    // Menu
    handleMenuAction,
    
    // File handling
    handleFileUpload,
    
    // Forms
    handleFormSubmit,
    
    // State
    isLoading
  };
};

export default useAppFunctionality;
