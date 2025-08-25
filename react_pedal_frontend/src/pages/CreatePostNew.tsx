import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { 
  X, Camera, MapPin, Users, Image as ImageIcon, BarChart, Loader2, 
  Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, 
  ChevronRight, Grid3X3, Eye, Heart, MessageCircle, Share,
  Plus, Trash2, Edit3, Hash, AtSign, Calendar, Clock, UserCheck
} from 'lucide-react';
import { useAppFunctionality } from '../hooks/useAppFunctionality';
import { usePosts } from '../contexts/PostContext';
import FileUpload from '../components/FileUpload/FileUpload';
import ImagePreview from '../components/FileUpload/ImagePreview';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  aspectRatio?: number;
}

interface PostDraft {
  content: string;
  media: MediaItem[];
  location?: string;
  tags: string[];
  mentions: string[];
  poll?: {
    question: string;
    options: string[];
    duration: string;
    allowMultiple: boolean;
  };
  event?: {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location: string;
    latitude?: number;
    longitude?: number;
    requireVerification: boolean;
    interestedUsers: string[];
    verificationQuestions: string[];
  };
  audience: 'Public' | 'Friends' | 'Only me';
  scheduledFor?: Date;
}

const CreatePost: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useUser();
  const { handleCreatePost, handleFileUpload } = useAppFunctionality();
  const { addPost } = usePosts();
  
  // Core post state
  const [draft, setDraft] = useState<PostDraft>({
    content: '',
    media: [],
    tags: [],
    mentions: [],
    audience: 'Public'
  });
  
  // UI state
  const [isPosting, setIsPosting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [postError, setPostError] = useState('');
  const [activeView, setActiveView] = useState<'compose' | 'media' | 'poll' | 'event' | 'schedule'>('compose');
  const [isDragging, setIsDragging] = useState(false);
  const [characterLimit] = useState(280);
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Location state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{id: string, name: string, address: string, category: string}>>([]);
  const [selectedLocation, setSelectedLocation] = useState<{name: string, address: string} | null>(null);
  
  // Tag People state
  const [showTagPeopleModal, setShowTagPeopleModal] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [suggestedPeople, setSuggestedPeople] = useState<Array<{id: string, name: string, username: string, avatar: string}>>([]);
  const [taggedPeople, setTaggedPeople] = useState<Array<{id: string, name: string, username: string, avatar: string}>>([]);
  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState<'1 day' | '3 days' | '7 days'>('1 day');
  
  // Media preview state
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  
  // Event state
  const [showEvent, setShowEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventLatitude, setEventLatitude] = useState<number | null>(null);
  const [eventLongitude, setEventLongitude] = useState<number | null>(null);
  const [requireVerification, setRequireVerification] = useState(false);
  const [verificationQuestions, setVerificationQuestions] = useState<string[]>(['Are you an active rider?', 'Do you have proper safety gear?']);
  const addPollOption = useCallback(() => {
    setPollOptions(prev => (prev.length < 4 ? [...prev, ''] : prev));
  }, []);
  const removePollOption = useCallback((idx: number) => {
    setPollOptions(prev => prev.filter((_, i) => i !== idx));
  }, []);
  const updatePollOption = useCallback((idx: number, value: string) => {
    setPollOptions(prev => prev.map((o, i) => (i === idx ? value : o)));
  }, []);
  
  // Refs
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [draft.content]);

  // Media handling with real file upload
  const handleMediaUpload = useCallback((url: string, path: string) => {
    const newMedia: MediaItem = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'image',
      url,
      aspectRatio: 1
    };
    
    setDraft(prev => ({
      ...prev,
      media: [...prev.media, newMedia]
    }));
  }, []);

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error);
    // You could show a toast notification here
  }, []);

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
        
        const newMedia: MediaItem = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'image',
          url: imageDataUrl,
          aspectRatio: 1
        };
        
        setDraft(prev => ({
          ...prev,
          media: [...prev.media, newMedia]
        }));
        
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

  // Location functions
  const searchNearbyPlaces = async (lat: number, lng: number) => {
    // In real app, use Google Places API or similar
    // For now, show empty results - no mock data
    setNearbyPlaces([]);
  };

  const handleLocationSelect = (place: {name: string, address: string}) => {
    setSelectedLocation(place);
    setDraft(prev => ({ ...prev, location: `${place.name}, ${place.address}` }));
    setShowLocationModal(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          searchNearbyPlaces(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // No fallback mock data
          setNearbyPlaces([]);
        }
      );
    } else {
      // No mock places if geolocation not supported
      setNearbyPlaces([]);
    }
  };

  // Tag People functions
  const searchPeople = async (query: string) => {
    // In real app, search from user database
    // For now, show empty results - no mock data
    setSuggestedPeople([]);
  };

  const handlePersonTag = (person: {id: string, name: string, username: string, avatar: string}) => {
    if (!taggedPeople.find(p => p.id === person.id)) {
      const newTaggedPeople = [...taggedPeople, person];
      setTaggedPeople(newTaggedPeople);
      setDraft(prev => ({ ...prev, mentions: newTaggedPeople.map(p => p.username) }));
    }
  };

  const removeTaggedPerson = (personId: string) => {
    const newTaggedPeople = taggedPeople.filter(p => p.id !== personId);
    setTaggedPeople(newTaggedPeople);
    setDraft(prev => ({ ...prev, mentions: newTaggedPeople.map(p => p.username) }));
  };

  const openTagPeopleModal = () => {
    setShowTagPeopleModal(true);
    searchPeople('');
  };

  // Legacy media handling for backward compatibility
  const handleLegacyMediaUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    
    setIsUploadingMedia(true);
    try {
      const newMedia: MediaItem[] = [];
      
      for (const file of fileArray) {
        if (file.type.startsWith('image/')) {
          const url = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          
          // Calculate aspect ratio
          const img = new window.Image();
          const aspectRatio = await new Promise<number>((resolve) => {
            img.onload = () => resolve(img.width / img.height);
            img.src = url;
          });
          
          newMedia.push({
            id: `${Date.now()}-${Math.random()}`,
            type: 'image',
            url,
            aspectRatio
          });
        } else if (file.type.startsWith('video/')) {
          const url = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          
          newMedia.push({
            id: `${Date.now()}-${Math.random()}`,
            type: 'video',
            url
          });
        }
      }
      
      setDraft(prev => ({
        ...prev,
        media: [...prev.media, ...newMedia]
      }));
    } catch (error) {
      setPostError('Failed to upload media');
    } finally {
      setIsUploadingMedia(false);
    }
  }, []);
  
  const removeMedia = useCallback((id: string) => {
    setDraft(prev => ({
      ...prev,
      media: prev.media.filter(item => item.id !== id)
    }));
  }, []);
  
  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const mediaFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (mediaFiles.length > 0) {
      await handleLegacyMediaUpload(mediaFiles);
    }
  }, [handleLegacyMediaUpload]);
  
  // Post submission
  const handleSubmit = useCallback(async () => {
    const hasContent = draft.content.trim().length > 0;
    const hasMedia = draft.media.length > 0;
    const hasPoll = draft.poll && draft.poll.options.filter(o => o.trim()).length >= 2;
    const hasEvent = showEvent && eventTitle.trim() && eventDescription.trim() && eventStartDate && eventStartTime;
    
    if (!hasContent && !hasMedia && !hasPoll && !hasEvent) {
      setPostError('Add some content to your post');
      return;
    }
    
    if (hasEvent && (!eventTitle.trim() || !eventDescription.trim() || !eventStartDate || !eventStartTime)) {
      setPostError('Event title, description, start date and time are required');
      return;
    }
    
    if (draft.content.length > characterLimit) {
      setPostError(`Post exceeds ${characterLimit} character limit`);
      return;
    }
    
    setIsPosting(true);
    setPostError('');
    
    try {
      const newPost = {
        id: Date.now(),
        author: {
          name: user?.fullName || 'Your Name',
          username: `@${user?.username || 'username'}`,
          avatar: user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff',
          verified: false,
          level: 1,
        },
        content: draft.content.trim(),
        image: draft.media.find(m => m.type === 'image')?.url,
        images: draft.media.filter(m => m.type === 'image').map(m => m.url),
        video: draft.media.find(m => m.type === 'video')?.url,
        timestamp: 'now',
        location: draft.location,
        upvotes: 1,
        downvotes: 0,
        userVote: 1 as 1 | -1 | 0,
        pedalPoints: 10,
        comments: [],
        shares: 0,
        views: 0,
        bookmarked: false,
        tags: draft.tags,
        poll: (() => {
          const valid = pollOptions.map(o => o.trim()).filter(Boolean);
          if (valid.length >= 2) {
            return {
              options: valid,
              duration: pollDuration,
              votes: [] as Array<{ optionIndex: number; userId: string }>
            };
          }
          return undefined;
        })(),
        event: showEvent && eventTitle.trim() && eventDescription.trim() && eventStartDate && eventStartTime ? {
          title: eventTitle,
          description: eventDescription,
          startDate: eventStartDate,
          startTime: eventStartTime,
          endDate: eventEndDate,
          endTime: eventEndTime,
          location: eventLocation,
          latitude: eventLatitude,
          longitude: eventLongitude,
          requireVerification,
          interestedUsers: [],
          notInterestedUsers: [],
          verificationQuestions: requireVerification ? verificationQuestions.filter(q => q.trim()) : []
        } : undefined,
      };
      
      addPost(newPost);
      await handleCreatePost({
        content: draft.content.trim(),
        images: draft.media.filter(m => m.type === 'image').map(m => m.url),
        location: draft.location,
        tags: draft.tags
      });
      
      // Reset composer after a short delay without adding a second notification
      setTimeout(() => {
        setDraft({
          content: '',
          media: [],
          tags: [],
          mentions: [],
          audience: 'Public'
        });
        setActiveView('compose');
        setShowPoll(false);
        setPollOptions(['', '']);
        setPollDuration('1 day');
        setShowEvent(false);
        setEventTitle('');
        setEventDescription('');
        setEventStartDate('');
        setEventStartTime('');
        setEventEndDate('');
        setEventEndTime('');
        setEventLocation('');
        setEventLatitude(null);
        setEventLongitude(null);
        setRequireVerification(false);
        setSelectedLocation(null);
        setTaggedPeople([]);
      }, 1500);
      
    } catch (error) {
      setPostError('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  }, [draft, user, characterLimit, addPost, handleCreatePost, showEvent, eventTitle, eventDescription, eventStartDate, eventStartTime, eventEndDate, eventEndTime, eventLocation, eventLatitude, eventLongitude, requireVerification, verificationQuestions]);

  // Media grid component
  const MediaGrid: React.FC<{ media: MediaItem[] }> = ({ media }) => {
    if (media.length === 0) return null;

    const getGridLayout = (count: number) => {
      if (count === 1) return 'grid-cols-1';
      if (count === 2) return 'grid-cols-2';
      if (count === 3) return 'grid-cols-2 grid-rows-2';
      return 'grid-cols-2 grid-rows-2';
    };

    return (
      <div className={`grid gap-2 rounded-xl overflow-hidden ${getGridLayout(media.length)}`}>
        {media.slice(0, 4).map((item, index) => (
          <div
            key={item.id}
            className={`relative group cursor-pointer ${
              media.length === 3 && index === 0 ? 'row-span-2' : ''
            }`}
            onClick={() => {
              setSelectedMediaIndex(index);
              setShowMediaPreview(true);
            }}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
                style={{ aspectRatio: media.length === 1 ? item.aspectRatio : 1 }}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                muted
              />
            )}
            
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeMedia(item.id);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            {/* Media count overlay */}
            {index === 3 && media.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{media.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-app-background pb-28">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-app-text-primary">Create Post</h1>
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-app-surface transition-colors"
          >
            <X className="w-6 h-6 text-app-text-muted" />
          </button>
        </div>

        {/* Success Message removed to avoid duplicate notifications */}

        {/* Error Message */}
        {postError && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{postError}</p>
          </div>
        )}

        {/* Main Composer */}
        <div
          className={`bg-app-surface rounded-2xl border border-app-borders transition-all ${
            isDragging ? 'border-app-primary-accent border-2' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* User Info & Audience */}
          <div className="p-4 border-b border-app-borders">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff'}
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-app-text-primary">{user?.fullName || 'Your Name'}</p>
                  <select
                    value={draft.audience}
                    onChange={(e) => setDraft(prev => ({ ...prev, audience: e.target.value as any }))}
                    className="text-sm bg-app-background border border-app-borders rounded-lg px-2 py-1 text-app-text-muted"
                  >
                    <option value="Public">Public</option>
                    <option value="Friends">Friends</option>
                    <option value="Only me">Only me</option>
                  </select>
                </div>
              </div>
              
              {/* Location and Tag People buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setShowLocationModal(true);
                    getCurrentLocation();
                  }}
                  className="p-2 rounded-full hover:bg-app-primary-accent/10 transition-colors group"
                  title="Add Location"
                >
                  <MapPin className="w-5 h-5 text-app-text-muted group-hover:text-app-primary-accent" />
                </button>
                
                <button 
                  onClick={openTagPeopleModal}
                  className="p-2 rounded-full hover:bg-app-primary-accent/10 transition-colors group"
                  title="Tag People"
                >
                  <Users className="w-5 h-5 text-app-text-muted group-hover:text-app-primary-accent" />
                </button>
              </div>
            </div>
          </div>

          {/* Text Composer */}
          <div className="p-4">
            <textarea
              ref={textAreaRef}
              value={draft.content}
              onChange={(e) => {
                setDraft(prev => ({ ...prev, content: e.target.value }));
                setPostError('');
              }}
              placeholder="What's happening?"
              className="w-full bg-transparent text-app-text-primary placeholder-app-text-muted text-xl resize-none border-none outline-none"
              rows={3}
              maxLength={characterLimit}
            />
            
            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-app-background rounded-lg border border-app-borders">
                <MapPin className="w-4 h-4 text-app-primary-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-app-text-primary">{selectedLocation.name}</p>
                  <p className="text-xs text-app-text-muted">{selectedLocation.address}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    setDraft(prev => ({ ...prev, location: undefined }));
                  }}
                  className="p-1 rounded-full hover:bg-app-text-muted/20 transition-colors"
                >
                  <X className="w-4 h-4 text-app-text-muted" />
                </button>
              </div>
            )}
            
            {/* Tagged People Display */}
            {taggedPeople.length > 0 && (
              <div className="mt-3 p-3 bg-app-background rounded-lg border border-app-borders">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-app-primary-accent" />
                  <p className="text-sm font-medium text-app-text-primary">Tagged People</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {taggedPeople.map((person) => (
                    <div key={person.id} className="flex items-center gap-2 bg-app-surface rounded-full px-3 py-1 border border-app-borders">
                      <img src={person.avatar} alt={person.name} className="w-5 h-5 rounded-full" />
                      <span className="text-sm text-app-text-primary">@{person.username}</span>
                      <button
                        onClick={() => removeTaggedPerson(person.id)}
                        className="p-0.5 rounded-full hover:bg-app-text-muted/20 transition-colors"
                      >
                        <X className="w-3 h-3 text-app-text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Character Count */}
            <div className="flex justify-end mt-2">
              <span className={`text-sm ${
                draft.content.length > characterLimit * 0.8 
                  ? 'text-red-400' 
                  : 'text-app-text-muted'
              }`}>
                {draft.content.length}/{characterLimit}
              </span>
            </div>
          </div>

          {/* Media Preview */}
          {draft.media.length > 0 && (
            <div className="px-4 pb-4">
              <MediaGrid media={draft.media} />
            </div>
          )}

          {/* Poll Composer */}
          {showPoll && (
            <div className="px-4 pb-4">
              <div className="border border-app-borders rounded-xl p-4 bg-app-background">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-app-text-primary">Create a poll</p>
                  <button onClick={() => setShowPoll(false)} className="p-2 rounded-lg hover:bg-app-surface text-app-text-muted" aria-label="Close poll">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updatePollOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                      />
                      {pollOptions.length > 2 && (
                        <button type="button" onClick={() => removePollOption(idx)} className="p-2 rounded-lg border border-app-borders hover:border-red-500 hover:text-red-400 text-app-text-muted" aria-label="Remove option">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button type="button" onClick={addPollOption} disabled={pollOptions.length >= 4} className={`px-3 py-2 rounded-lg ${pollOptions.length >= 4 ? 'bg-app-text-muted/20 text-app-text-muted cursor-not-allowed' : 'border border-app-borders text-app-text-muted hover:border-app-primary-accent hover:text-app-primary-accent'}`}>
                    Add option
                  </button>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-app-text-muted">Duration</span>
                    <select value={pollDuration} onChange={(e) => setPollDuration(e.target.value as any)} className="px-2 py-1 bg-app-background border border-app-borders rounded-lg text-app-text-primary focus:border-app-primary-accent focus:outline-none">
                      <option>1 day</option>
                      <option>3 days</option>
                      <option>7 days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Composer */}
          {showEvent && (
            <div className="px-4 pb-4">
              <div className="border border-app-borders rounded-xl p-4 bg-app-background">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-app-text-primary">Create an event</p>
                  <button onClick={() => setShowEvent(false)} className="p-2 rounded-lg hover:bg-app-surface text-app-text-muted" aria-label="Close event">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-1">Event Title</label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Enter event title"
                      className="w-full px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                    />
                  </div>
                  
                  {/* Event Description */}
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-1">Description</label>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Describe your event"
                      rows={3}
                      className="w-full px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none resize-none"
                    />
                  </div>
                  
                  {/* Start Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-1">Start Date</label>
                      <input
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => setEventStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-1">Start Time</label>
                      <input
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* End Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-1">End Date (Optional)</label>
                      <input
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => setEventEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-1">End Time (Optional)</label>
                      <input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Event Location */}
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-1">Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Event location"
                        className="flex-1 px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                setEventLatitude(position.coords.latitude);
                                setEventLongitude(position.coords.longitude);
                                setEventLocation(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
                              },
                              (error) => {
                                console.error('Error getting location:', error);
                                alert('Unable to get your location. Please enter manually.');
                              }
                            );
                          } else {
                            alert('Geolocation is not supported by this browser.');
                          }
                        }}
                        className="px-3 py-2 bg-app-primary-accent text-black rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        GPS
                      </button>
                    </div>
                  </div>
                  
                  {/* Verification Option */}
                  <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-app-text-primary">Verify Users</p>
                      <p className="text-xs text-app-text-muted">Require interested users to verify their legitimacy</p>
                    </div>
                    <button
                      onClick={() => setRequireVerification(!requireVerification)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        requireVerification ? 'bg-app-primary-accent' : 'bg-app-text-muted/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          requireVerification ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Verification Questions */}
                  {requireVerification && (
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-2">Verification Questions</label>
                      <div className="space-y-2">
                        {verificationQuestions.map((question, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={question}
                              onChange={(e) => {
                                const newQuestions = [...verificationQuestions];
                                newQuestions[idx] = e.target.value;
                                setVerificationQuestions(newQuestions);
                              }}
                              placeholder={`Question ${idx + 1}`}
                              className="flex-1 px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                            />
                            {verificationQuestions.length > 1 && (
                              <button
                                onClick={() => {
                                  setVerificationQuestions(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-2 rounded-lg border border-app-borders hover:border-red-500 hover:text-red-400 text-app-text-muted"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {verificationQuestions.length < 5 && (
                          <button
                            onClick={() => setVerificationQuestions(prev => [...prev, ''])}
                            className="px-3 py-2 rounded-lg border border-app-borders text-app-text-muted hover:border-app-primary-accent hover:text-app-primary-accent"
                          >
                            Add question
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-app-surface rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-app-text-primary">Take Photo</h3>
                  <button 
                    onClick={stopCamera}
                    className="text-app-text-muted hover:text-app-text-primary"
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
                    className="bg-app-primary-accent hover:opacity-90 text-black px-6 py-2 rounded-lg font-medium transition-opacity"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-app-text-muted/20 hover:bg-app-text-muted/30 text-app-text-primary px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>
          )}

          {/* Location Modal */}
          {showLocationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-app-surface rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-app-borders">
                  <h3 className="text-lg font-semibold text-app-text-primary">Add Location</h3>
                  <button 
                    onClick={() => setShowLocationModal(false)}
                    className="text-app-text-muted hover:text-app-text-primary"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="p-4 border-b border-app-borders">
                  <div className="relative">
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Search for a location..."
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Current Location Option */}
                <div className="p-4 border-b border-app-borders">
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const locationString = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
                            handleLocationSelect({ name: 'Current Location', address: locationString });
                          },
                          (error) => {
                            console.error('Error getting location:', error);
                            alert('Unable to get your location. Please check permissions.');
                          }
                        );
                      }
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-app-background transition-colors"
                  >
                    <div className="w-10 h-10 bg-app-primary-accent/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-app-primary-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-app-text-primary">Use Current Location</p>
                      <p className="text-sm text-app-text-muted">Share your precise location</p>
                    </div>
                  </button>
                </div>
                
                {/* Nearby Places */}
                <div className="overflow-y-auto max-h-64">
                  {nearbyPlaces
                    .filter(place => 
                      locationSearch === '' || 
                      place.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                      place.address.toLowerCase().includes(locationSearch.toLowerCase())
                    )
                    .map((place) => (
                    <button
                      key={place.id}
                      onClick={() => handleLocationSelect({ name: place.name, address: place.address })}
                      className="flex items-center gap-3 w-full p-4 hover:bg-app-background transition-colors border-b border-app-borders last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-app-text-muted/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-app-text-muted" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-app-text-primary">{place.name}</p>
                        <p className="text-sm text-app-text-muted">{place.address}</p>
                        <p className="text-xs text-app-primary-accent">{place.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                {nearbyPlaces.length === 0 && (
                  <div className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
                    <p className="text-app-text-muted">Loading nearby places...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tag People Modal */}
          {showTagPeopleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-app-surface rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-app-borders">
                  <h3 className="text-lg font-semibold text-app-text-primary">Tag People</h3>
                  <button 
                    onClick={() => setShowTagPeopleModal(false)}
                    className="text-app-text-muted hover:text-app-text-primary"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="p-4 border-b border-app-borders">
                  <div className="relative">
                    <input
                      type="text"
                      value={peopleSearch}
                      onChange={(e) => {
                        setPeopleSearch(e.target.value);
                        searchPeople(e.target.value);
                      }}
                      placeholder="Search people..."
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* People List */}
                <div className="overflow-y-auto max-h-64">
                  {suggestedPeople.map((person) => {
                    const isTagged = taggedPeople.find(p => p.id === person.id);
                    return (
                      <button
                        key={person.id}
                        onClick={() => handlePersonTag(person)}
                        disabled={!!isTagged}
                        className={`flex items-center gap-3 w-full p-4 transition-colors border-b border-app-borders last:border-b-0 ${
                          isTagged 
                            ? 'bg-app-primary-accent/10 cursor-not-allowed' 
                            : 'hover:bg-app-background'
                        }`}
                      >
                        <img 
                          src={person.avatar} 
                          alt={person.name} 
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="text-left flex-1">
                          <p className="font-medium text-app-text-primary">{person.name}</p>
                          <p className="text-sm text-app-text-muted">@{person.username}</p>
                        </div>
                        {isTagged && (
                          <div className="w-6 h-6 bg-app-primary-accent rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {suggestedPeople.length === 0 && (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
                    <p className="text-app-text-muted">No people found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Indicator */}
          {isUploadingMedia && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-app-text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading media...</span>
              </div>
            </div>
          )}

          {/* Drag Drop Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-app-primary-accent/10 border-2 border-dashed border-app-primary-accent rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-app-primary-accent" />
                <p className="text-app-primary-accent font-medium">Drop your media here</p>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="p-4 border-t border-app-borders">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-app-primary-accent/10 transition-colors group"
                >
                  <ImageIcon className="w-5 h-5 text-app-text-muted group-hover:text-app-primary-accent" />
                </button>
                
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-app-primary-accent/10 transition-colors group"
                >
                  <svg className="w-5 h-5 text-app-text-muted group-hover:text-app-primary-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setShowPoll((v) => !v)}
                  className={`p-2 rounded-full transition-colors group ${showPoll ? 'bg-app-primary-accent/10' : 'hover:bg-app-primary-accent/10'}`}
                >
                  <BarChart className={`w-5 h-5 ${showPoll ? 'text-app-primary-accent' : 'text-app-text-muted group-hover:text-app-primary-accent'}`} />
                </button>
                
                <button
                  onClick={() => setShowCamera(!showCamera)}
                  className="p-2 rounded-full hover:bg-app-primary-accent/10 transition-colors group"
                  title="Live Camera"
                >
                  <Camera className="w-5 h-5 text-app-text-muted group-hover:text-app-primary-accent" />
                </button>
                
                
              </div>

              <button
                onClick={handleSubmit}
                disabled={(function(){
                  const hasContent = !!draft.content.trim();
                  const hasMedia = draft.media.length > 0;
                  const validPoll = showPoll && pollOptions.map(o=>o.trim()).filter(Boolean).length >= 2;
                  const validEvent = showEvent && eventTitle.trim() && eventDescription.trim();
                  return isPosting || isUploadingMedia || !(hasContent || hasMedia || validPoll || validEvent);
                })()}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  (function(){
                    const hasContent = !!draft.content.trim();
                    const hasMedia = draft.media.length > 0;
                    const validPoll = showPoll && pollOptions.map(o=>o.trim()).filter(Boolean).length >= 2;
                    const validEvent = showEvent && eventTitle.trim() && eventDescription.trim();
                    return isPosting || isUploadingMedia || !(hasContent || hasMedia || validPoll || validEvent);
                  })()
                    ? 'bg-app-text-muted/20 text-app-text-muted cursor-not-allowed'
                    : 'bg-app-primary-accent text-black hover:opacity-90'
                }`}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleLegacyMediaUpload(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files && handleLegacyMediaUpload(e.target.files)}
        />
      </div>
    </div>
  );
};

export default CreatePost;
