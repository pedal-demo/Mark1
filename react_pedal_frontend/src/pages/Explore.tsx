import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, X } from 'lucide-react';
import userService from '../services/userService';
import DestinationKnowledge from '../components/DestinationKnowledge';

const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Search state and logic
  const [isSearching, setIsSearching] = useState(false);
  const [searchUsers, setSearchUsers] = useState<{_id?: string; username: string}[]>([]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSearchUsers([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        // backend users
        let sUsers: {_id?: string; username: string}[] = [];
        try {
          sUsers = await userService.searchUsers(q, 5);
        } catch (e) {
          // ignore, fallback handled in service
        }
        if (!cancelled) {
          setSearchUsers(sUsers);
          setIsSearching(false);
        }
      } catch {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-app-background">
      <div className="pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-app-text-primary">Explore</h1>
            <p className="text-app-text-muted">Discover stories, people, and trending content</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
              <input
                type="text"
                placeholder="Search users, stories, trending..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className="w-full pl-12 pr-11 py-4 bg-app-card-surface border border-app-borders rounded-2xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors text-lg"
              />
              {searchTerm && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-app-borders/50"
                >
                  <X className="w-4 h-4 text-app-text-muted" />
                </button>
              )}

              {/* Results dropdown */}
              {searchTerm.trim().length >= 2 && (
                <div className="absolute z-20 mt-2 w-full bg-app-card-surface border border-app-borders rounded-xl shadow-lg overflow-hidden">
                  {isSearching && (
                    <div className="px-4 py-3 text-sm text-app-text-muted">Searching…</div>
                  )}
                  {!isSearching && (
                    <div className="max-h-80 overflow-y-auto">
                      {/* Users */}
                      {searchUsers.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs uppercase tracking-wide text-app-text-muted">Users</div>
                          {searchUsers.map((u, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-3 flex items-center gap-3 hover:bg-black/20 cursor-pointer"
                              onClick={() => {
                                // Navigate to Followers page with prefilled query
                                window.dispatchEvent(new CustomEvent('nav:followers', { detail: { q: u.username } }));
                              }}
                            >
                              <div className="w-8 h-8 rounded-full bg-app-borders flex items-center justify-center">
                                <Users className="w-4 h-4 text-app-text-muted" />
                              </div>
                              <div className="text-app-text-primary">{u.username}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {searchUsers.length === 0 && (
                        <div className="px-4 py-3 text-sm text-app-text-muted">No results</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Destination Knowledge Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="mb-12 mt-16"
          >
            <DestinationKnowledge />
          </motion.div>

          {/* Empty State - Centered */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-8">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-app-text-primary mb-4">Ready to Explore</h3>
            <p className="text-app-text-muted mb-8 max-w-md mx-auto leading-relaxed">
              Use the search bar above to discover users, stories, and trending content. Share your daily routine to get started!
            </p>
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors text-lg"
            >
              Start Searching
            </button>
          </motion.div>

        </div>
      </div>
      
    </div>
  );
};

export default Explore;
