import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Type, 
  Image, 
  Video, 
  Map, 
  BarChart3, 
  MapPin, 
  Hash, 
  Send,
  Paperclip,
  Smile
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'video' | 'route' | 'poll'>('text');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'photo', label: 'Photo', icon: Image },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'route', label: 'Route', icon: Map },
    { id: 'poll', label: 'Poll', icon: BarChart3 },
  ];

  const suggestedTags = [
    '#TripToSpiti', '#RoyalEnfield', '#BikeLife', '#MountainRides',
    '#CruiserLife', '#SportBike', '#TouringBike', '#OffRoad',
    '#CityRides', '#WeekendRider', '#BikeModification', '#RideSafe'
  ];

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const postData = {
        type: activeTab,
        content: content.trim(),
        location: location.trim(),
        tags,
        timestamp: new Date().toISOString(),
        author: user
      };
      
      await onSubmit(postData);
      
      // Reset form
      setContent('');
      setLocation('');
      setTags([]);
      setTagInput('');
      setActiveTab('text');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your riding experience..."
              className="w-full h-32 p-4 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted resize-none focus:outline-none focus:border-app-primary-accent transition-colors"
              maxLength={500}
            />
            <div className="text-right text-sm text-app-text-muted">
              {content.length}/500
            </div>
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-app-borders rounded-xl p-8 text-center hover:border-app-primary-accent transition-colors cursor-pointer">
              <Image className="w-12 h-12 text-app-text-muted mx-auto mb-4" />
              <p className="text-app-text-primary font-semibold mb-2">Upload Photos</p>
              <p className="text-sm text-app-text-muted">Drag and drop or click to select</p>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a caption to your photos..."
              className="w-full h-24 p-4 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted resize-none focus:outline-none focus:border-app-primary-accent transition-colors"
              maxLength={300}
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-app-borders rounded-xl p-8 text-center hover:border-app-primary-accent transition-colors cursor-pointer">
              <Video className="w-12 h-12 text-app-text-muted mx-auto mb-4" />
              <p className="text-app-text-primary font-semibold mb-2">Upload Video</p>
              <p className="text-sm text-app-text-muted">Max 100MB, MP4 format recommended</p>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your video..."
              className="w-full h-24 p-4 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted resize-none focus:outline-none focus:border-app-primary-accent transition-colors"
              maxLength={300}
            />
          </div>
        );

      case 'route':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-app-borders rounded-xl p-8 text-center hover:border-app-primary-accent transition-colors cursor-pointer">
              <Map className="w-12 h-12 text-app-text-muted mx-auto mb-4" />
              <p className="text-app-text-primary font-semibold mb-2">Share Your Route</p>
              <p className="text-sm text-app-text-muted">Upload GPX file or draw on map</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-app-text-primary mb-2">
                  Distance
                </label>
                <input
                  type="text"
                  placeholder="e.g., 250 km"
                  className="w-full p-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app-text-primary mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g., 6 hours"
                  className="w-full p-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your route, road conditions, highlights..."
              className="w-full h-24 p-4 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted resize-none focus:outline-none focus:border-app-primary-accent transition-colors"
              maxLength={500}
            />
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask a question..."
              className="w-full p-4 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
              maxLength={200}
            />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-app-primary-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <input
                  type="text"
                  placeholder="Option A"
                  className="flex-1 p-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-app-primary-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                  B
                </div>
                <input
                  type="text"
                  placeholder="Option B"
                  className="flex-1 p-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />
              </div>
              <button className="text-app-primary-accent text-sm font-medium hover:underline">
                + Add another option
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:h-auto bg-app-card-surface rounded-2xl border border-app-borders z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-app-borders">
              <h2 className="text-xl font-bold text-app-text-primary">Create Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-app-background rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-app-text-muted" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-app-borders overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-app-primary-accent border-b-2 border-app-primary-accent'
                        : 'text-app-text-muted hover:text-app-text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {renderTabContent()}

              {/* Location */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-app-text-muted" />
                  <label className="text-sm font-medium text-app-text-primary">
                    Location (Optional)
                  </label>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you riding?"
                  className="w-full p-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />
              </div>

              {/* Tags */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-app-text-muted" />
                  <label className="text-sm font-medium text-app-text-primary">
                    Tags
                  </label>
                </div>
                
                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-app-primary-accent/10 text-app-primary-accent rounded-full text-sm border border-app-primary-accent/20"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-app-primary-accent/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      handleAddTag(tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`);
                    }
                  }}
                  placeholder="Add tags... (press Enter)"
                  className="w-full p-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
                />

                {/* Suggested Tags */}
                <div className="mt-3">
                  <p className="text-xs text-app-text-muted mb-2">Suggested:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        disabled={tags.includes(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          tags.includes(tag)
                            ? 'bg-app-borders text-app-text-muted cursor-not-allowed'
                            : 'bg-app-background hover:bg-app-primary-accent/10 text-app-text-muted hover:text-app-primary-accent border border-app-borders hover:border-app-primary-accent/20'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-app-borders">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-app-background rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-app-text-muted" />
                </button>
                <button className="p-2 hover:bg-app-background rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-app-text-muted hover:text-app-text-primary transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-app-primary-accent hover:bg-primary-600 disabled:bg-app-borders disabled:text-app-text-muted text-white rounded-lg font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
