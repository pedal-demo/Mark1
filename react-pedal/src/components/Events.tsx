import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight,
  Filter,
  X,
  Star,
  Navigation
} from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { useUser } from '../contexts/UserContext';

interface EventData {
  id: number;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  organizer: {
    name: string;
    username: string;
    avatar: string;
  };
  interestedUsers: string[];
  requireVerification: boolean;
  distance?: number;
}

interface EventsProps {
  variant?: 'mobile' | 'desktop';
  maxEvents?: number;
  showFilters?: boolean;
}

const Events: React.FC<EventsProps> = ({ 
  variant = 'mobile', 
  maxEvents = variant === 'desktop' ? 5 : 10,
  showFilters = variant === 'mobile'
}) => {
  const { posts } = usePosts();
  const { user } = useUser();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [filterDistance, setFilterDistance] = useState(100); // 100km default
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Extract events from posts and add mock events for demonstration
  const events = useMemo(() => {
    const eventPosts = posts.filter(post => post.event);
    
    const postEvents = eventPosts.map(post => {
      const event = post.event!;
      let distance: number | undefined;
      
      // Calculate distance if both user and event have coordinates
      if (userLocation && event.latitude && event.longitude) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.latitude,
          event.longitude
        );
      }
      
      return {
        id: post.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        startTime: event.startTime,
        endDate: event.endDate,
        endTime: event.endTime,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        organizer: {
          name: post.author.name,
          username: post.author.username,
          avatar: post.author.avatar
        },
        interestedUsers: event.interestedUsers || [],
        requireVerification: event.requireVerification,
        distance
      } as EventData;
    });

    // Add mock events for demonstration
    const mockEvents: EventData[] = [
      {
        id: 9001,
        title: 'Weekend Mountain Bike Trail',
        description: 'Join us for an exciting mountain bike adventure',
        startDate: '2024-08-25',
        startTime: '08:00',
        location: 'Blue Mountain Trail',
        latitude: 39.7392,
        longitude: -104.9903,
        organizer: {
          name: 'Alex Rodriguez',
          username: 'alexr',
          avatar: 'https://ui-avatars.com/api/?name=Alex+Rodriguez&background=ff6b00&color=fff'
        },
        interestedUsers: ['user1', 'user2', 'user3'],
        requireVerification: false,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, 39.7392, -104.9903) : 15.2
      },
      {
        id: 9002,
        title: 'City Cycling Tour',
        description: 'Casual city ride with coffee stop',
        startDate: '2024-08-26',
        startTime: '10:00',
        location: 'Downtown Park',
        latitude: 39.7392,
        longitude: -104.9903,
        organizer: {
          name: 'Sarah Chen',
          username: 'sarahc',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ff6b00&color=fff'
        },
        interestedUsers: ['user1', 'user4'],
        requireVerification: false,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, 39.7392, -104.9903) : 8.5
      }
    ];

    return [...postEvents, ...mockEvents];
  }, [posts, userLocation]);

  // Filter events by distance
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Filter by distance if user location is available
    if (userLocation) {
      filtered = events.filter(event => 
        !event.distance || event.distance <= filterDistance
      );
    }
    
    // Sort by date (upcoming first) and then by distance
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime}`);
      const dateB = new Date(`${b.startDate} ${b.startTime}`);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If dates are same, sort by distance
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      
      return 0;
    });
    
    return filtered.slice(0, maxEvents);
  }, [events, userLocation, filterDistance, maxEvents]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowLocationPrompt(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setShowLocationPrompt(false);
        }
      );
    }
  };

  // Format date for display
  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(`${date} ${time}`);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    
    return eventDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Show location prompt on first load
  useEffect(() => {
    if (!userLocation && variant === 'mobile') {
      setShowLocationPrompt(true);
    }
  }, [userLocation, variant]);

  const handleInterestedToggle = (eventId: number) => {
    // This would typically update the backend
    console.log('Toggle interest for event:', eventId);
  };

  if (variant === 'desktop') {
    return (
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="w-8 h-8 text-app-text-muted mx-auto mb-2" />
            <p className="text-sm text-app-text-muted">No upcoming events</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-app-background rounded-lg border border-app-borders hover:border-app-primary-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-app-text-primary line-clamp-1">
                  {event.title}
                </h4>
                <span className="text-xs text-app-primary-accent font-medium">
                  {formatEventDate(event.startDate, event.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-app-text-muted mb-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.location}</span>
                {event.distance && (
                  <span className="text-app-primary-accent">
                    {event.distance.toFixed(1)}km
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <img
                    src={event.organizer.avatar}
                    alt={event.organizer.name}
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-xs text-app-text-muted">
                    {event.organizer.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-app-text-muted">
                  <Users className="w-3 h-3" />
                  {event.interestedUsers.length}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-app-text-primary flex items-center gap-2">
          <Calendar className="w-5 h-5 text-app-primary-accent" />
          Nearby Events
        </h2>
        {showFilters && (
          <div className="flex items-center gap-2">
            {!userLocation && (
              <button
                onClick={getUserLocation}
                className="p-2 rounded-full bg-app-primary-accent/10 hover:bg-app-primary-accent/20 transition-colors"
                title="Enable location for nearby events"
              >
                <Navigation className="w-4 h-4 text-app-primary-accent" />
              </button>
            )}
            <button
              onClick={() => setShowFiltersPanel(true)}
              className="p-2 rounded-full hover:bg-app-surface transition-colors"
            >
              <Filter className="w-4 h-4 text-app-text-muted" />
            </button>
          </div>
        )}
      </div>

      {/* Location prompt */}
      <AnimatePresence>
        {showLocationPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-app-primary-accent/10 border border-app-primary-accent/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-app-primary-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-app-text-primary mb-1">
                  Find Events Near You
                </h3>
                <p className="text-xs text-app-text-muted mb-3">
                  Enable location access to see events within 100km of your location
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={getUserLocation}
                    className="px-3 py-1.5 bg-app-primary-accent text-black rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Enable Location
                  </button>
                  <button
                    onClick={() => setShowLocationPrompt(false)}
                    className="px-3 py-1.5 text-app-text-muted hover:text-app-text-primary text-xs transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events list */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
            <h3 className="text-sm font-medium text-app-text-primary mb-1">
              No Events Found
            </h3>
            <p className="text-xs text-app-text-muted">
              {userLocation 
                ? `No events within ${filterDistance}km of your location`
                : 'Enable location to find nearby events'
              }
            </p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-app-card-surface rounded-xl border border-app-borders overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-app-text-primary mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-app-text-muted line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-app-primary-accent/10 text-app-primary-accent rounded-full text-xs font-medium ml-3">
                    {formatEventDate(event.startDate, event.startTime)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-app-text-muted">
                    <Clock className="w-4 h-4" />
                    <span>
                      {event.startTime}
                      {event.endTime && ` - ${event.endTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-app-text-muted">
                    <MapPin className="w-4 h-4" />
                    <span className="flex-1">{event.location}</span>
                    {event.distance && (
                      <span className="text-app-primary-accent font-medium">
                        {event.distance.toFixed(1)}km away
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-app-text-primary">
                        {event.organizer.name}
                      </p>
                      <p className="text-xs text-app-text-muted">
                        {event.organizer.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-app-text-muted">
                      <Users className="w-4 h-4" />
                      {event.interestedUsers.length} interested
                    </div>
                    <button
                      onClick={() => handleInterestedToggle(event.id)}
                      className="px-4 py-2 bg-app-primary-accent hover:bg-app-primary-accent/80 text-black rounded-lg text-sm font-medium transition-colors"
                    >
                      Interested
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowFiltersPanel(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-app-card-surface rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-app-text-primary">
                  Event Filters
                </h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="p-2 hover:bg-app-background rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-app-text-primary mb-2">
                    Distance Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={filterDistance}
                      onChange={(e) => setFilterDistance(Number(e.target.value))}
                      className="w-full accent-app-primary-accent"
                    />
                    <div className="flex justify-between text-xs text-app-text-muted">
                      <span>10km</span>
                      <span className="text-app-primary-accent font-medium">
                        {filterDistance}km
                      </span>
                      <span>200km</span>
                    </div>
                  </div>
                </div>

                {!userLocation && (
                  <div className="p-3 bg-app-primary-accent/10 rounded-lg border border-app-primary-accent/20">
                    <p className="text-sm text-app-text-primary mb-2">
                      Location access required for distance filtering
                    </p>
                    <button
                      onClick={getUserLocation}
                      className="px-3 py-1.5 bg-app-primary-accent text-black rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Enable Location
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="px-4 py-2 bg-app-primary-accent text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
