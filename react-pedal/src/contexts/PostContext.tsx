import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

export interface Author {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  level: number;
}

export interface Comment {
  id: number;
  author: Author;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface Poll {
  options: string[];
  duration: '1 day' | '3 days' | '7 days' | string;
  votes: Array<{ optionIndex: number; userId: string }>;
}

export interface Event {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  requireVerification: boolean;
  interestedUsers: string[];
  notInterestedUsers?: string[];
  verificationQuestions: string[];
}

export interface Post {
  id: number;
  author: Author;
  content: string;
  image?: string;
  images?: string[];
  video?: string;
  timestamp: string;
  location?: string;
  upvotes: number;
  downvotes: number;
  userVote?: 1 | -1 | 0;
  comments: Comment[];
  shares: number;
  views?: number;
  bookmarked: boolean;
  tags?: string[];
  pedalPoints: number;
  isWiym?: boolean;
  expiresAt?: number;
  poll?: Poll;
  event?: Event;
}

interface PostContextType {
  posts: Post[];
  addPost: (post: Post) => void;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  cleanupExpiredPosts: () => void;
  toggleBookmark: (postId: number) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  // Filter out expired WIYM posts in real-time
  const posts = useMemo(() => {
    const now = Date.now();
    return allPosts.filter(post => {
      if (post.isWiym && post.expiresAt && post.expiresAt < now) {
        return false; // Filter out expired WIYM posts
      }
      return true;
    });
  }, [allPosts]);

  const addPost = (post: Post) => {
    setAllPosts(prev => [post, ...prev]);
  };

  const setPosts = (updater: React.SetStateAction<Post[]>) => {
    if (typeof updater === 'function') {
      setAllPosts(prev => updater(prev));
    } else {
      setAllPosts(updater);
    }
  };

  const cleanupExpiredPosts = () => {
    const now = Date.now();
    setAllPosts(prev => prev.filter(post => {
      if (post.isWiym && post.expiresAt && post.expiresAt < now) {
        return false; // Remove expired WIYM posts
      }
      return true;
    }));
  };

  const toggleBookmark = (postId: number) => {
    setAllPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const next = { ...p, bookmarked: !p.bookmarked };
      try {
        window.dispatchEvent(new CustomEvent('realtime:bookmark', { detail: { postId, bookmarked: next.bookmarked, ts: Date.now() } }));
      } catch {}
      return next;
    }));
  };

  // Cleanup expired posts every 5 minutes
  useEffect(() => {
    const interval = setInterval(cleanupExpiredPosts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PostContext.Provider value={{ posts, addPost, setPosts, cleanupExpiredPosts, toggleBookmark }}>
      {children}
    </PostContext.Provider>
  );
};
