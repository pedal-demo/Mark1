import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Search, ArrowLeft, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { useApi, useMutation } from '../hooks/useApi';
import { events as EventsService } from '../services/api';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  organizer: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  attendees: number;
  maxAttendees?: number;
  tags: string[];
  distance?: number;
  isAttending: boolean;
  requireVerification?: boolean;
  verificationQuestions?: string[];
  verificationAnswers?: {
    userId: string;
    userName: string;
    userAvatar: string;
    answers: string[];
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

interface EventsPageProps {
  onBack: () => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { addPost } = usePosts();
  
  // Fetch events from backend
  const { data: backendEvents, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useApi(
    () => EventsService.getEvents(),
    { immediate: true, cache: true, cacheKey: 'events_list' }
  );
  
  // Create event mutation
  const { mutate: createEvent, loading: creatingEvent } = useMutation(EventsService.createEvent);
  
  // Join event mutation
  const { mutate: joinEvent, loading: joiningEvent } = useMutation(
    ({ eventId, verificationAnswers }: { eventId: string; verificationAnswers?: any }) => 
      EventsService.joinEvent(eventId, verificationAnswers)
  );
  
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Alias for compatibility with existing code
  const events = eventsList;
  const setEvents = setEventsList;
  
  // Create event state
  const [showCreateEvent, setShowCreateEvent] = useState(false);
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
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  
  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedEventForVerification, setSelectedEventForVerification] = useState<Event | null>(null);
  const [verificationAnswers, setVerificationAnswers] = useState<string[]>([]);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  
  // Verification review state
  const [showVerificationReview, setShowVerificationReview] = useState(false);
  const [selectedEventForReview, setSelectedEventForReview] = useState<Event | null>(null);

  // Events now loaded from backend - no dummy data needed
  useEffect(() => {
    setLoading(false);
  }, []);

  // Filter events based on search and filter
  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'attending':
          filtered = filtered.filter(event => event.isAttending);
          break;
        case 'nearby':
          filtered = filtered.filter(event => (event.distance || 0) < 25);
          break;
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          filtered = filtered.filter(event => event.startDate === today);
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedFilter]);

  const handleAttendEvent = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    
    if (event?.requireVerification && !event.isAttending) {
      // Show verification modal
      setSelectedEventForVerification(event);
      setVerificationAnswers(new Array(event.verificationQuestions?.length || 0).fill(''));
      setShowVerificationModal(true);
    } else {
      // Direct join/leave
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              isAttending: !event.isAttending,
              attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
            }
          : event
      ));
    }
  };
  
  const handleVerificationSubmit = () => {
    if (!selectedEventForVerification || !user) return;
    
    const hasEmptyAnswers = verificationAnswers.some(answer => !answer.trim());
    if (hasEmptyAnswers) {
      alert('Please answer all verification questions');
      return;
    }
    
    setIsSubmittingVerification(true);
    
    // Add verification answer to event
    const newVerificationAnswer = {
      userId: user.id || 'user-1',
      userName: user.user_metadata?.full_name || user.email || 'User',
      userAvatar: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff',
      answers: verificationAnswers,
      submittedAt: new Date().toISOString(),
      status: 'pending' as const
    };
    
    setEvents(prev => prev.map(event =>
      event.id === selectedEventForVerification.id
        ? {
            ...event,
            verificationAnswers: [...(event.verificationAnswers || []), newVerificationAnswer]
          }
        : event
    ));
    
    setTimeout(() => {
      setIsSubmittingVerification(false);
      setShowVerificationModal(false);
      setSelectedEventForVerification(null);
      setVerificationAnswers([]);
      alert('Verification submitted! The event organizer will review your answers.');
    }, 1000);
  };
  
  const handleVerificationDecision = (eventId: number, userId: string, decision: 'approved' | 'rejected') => {
    const event = events.find(e => e.id === eventId);
    const userAnswer = event?.verificationAnswers?.find(answer => answer.userId === userId);
    
    if (!event || !userAnswer) return;
    
    // Update event verification status
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? {
            ...event,
            verificationAnswers: event.verificationAnswers?.map(answer =>
              answer.userId === userId
                ? { ...answer, status: decision }
                : answer
            ),
            attendees: decision === 'approved' ? event.attendees + 1 : event.attendees
          }
        : event
    ));
    
    // Create notification for the user
    const notification = {
      id: Date.now(),
      type: 'event' as const,
      title: decision === 'approved' ? 'Event Application Approved!' : 'Event Application Rejected',
      message: decision === 'approved' 
        ? `You've been approved to join "${event.title}". See you there!`
        : `Your application for "${event.title}" was not approved this time.`,
      time: 'Just now',
      read: false,
      eventId: eventId,
      eventTitle: event.title,
      organizerName: event.organizer.name,
      organizerAvatar: event.organizer.avatar
    };
    
    // Store notification in localStorage (simulating notification system)
    const existingNotifications = JSON.parse(localStorage.getItem('eventNotifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('eventNotifications', JSON.stringify(existingNotifications));
    
    // Debug: Log notification creation
    console.log('Created notification:', notification);
    console.log('Updated notifications in localStorage:', existingNotifications);
    
    // Show success message
    alert(`User ${decision === 'approved' ? 'approved' : 'rejected'} successfully! They will be notified.`);
    
    // Force notification refresh by dispatching a custom event
    window.dispatchEvent(new CustomEvent('notificationUpdate'));
  };

  // Handle create event submission
  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDescription.trim() || !eventStartDate || !eventStartTime) {
      alert('Event title, description, start date and time are required');
      return;
    }
    
    setIsCreatingEvent(true);
    
    try {
      // Create new event
      const newEvent: Event = {
        id: Date.now(),
        title: eventTitle,
        description: eventDescription,
        startDate: eventStartDate,
        startTime: eventStartTime,
        endDate: eventEndDate,
        endTime: eventEndTime,
        location: eventLocation,
        latitude: eventLatitude,
        longitude: eventLongitude,
        organizer: {
          name: user?.user_metadata?.full_name || user?.email || 'Your Name',
          avatar: user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff',
          verified: false
        },
        attendees: 1,
        maxAttendees: undefined,
        tags: ['event'],
        distance: 0,
        isAttending: true,
        requireVerification,
        verificationQuestions: requireVerification ? verificationQuestions.filter(q => q.trim()) : [],
        verificationAnswers: []
      };
      
      // Add to events list
      setEvents(prev => [newEvent, ...prev]);
      
      // Create post for the event
      const eventPost = {
        id: Date.now() + 1,
        author: {
          name: user?.user_metadata?.full_name || user?.email || 'Your Name',
          username: `@${user?.user_metadata?.username || user?.email?.split('@')[0] || 'username'}`,
          avatar: user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=FF6B00&color=fff',
          verified: false,
          level: 1,
        },
        content: `🎉 New Event: ${eventTitle}\n\n${eventDescription}`,
        timestamp: 'now',
        location: eventLocation,
        upvotes: 1,
        downvotes: 0,
        userVote: 1 as 1 | -1 | 0,
        pedalPoints: 15,
        comments: [],
        shares: 0,
        views: 0,
        bookmarked: false,
        tags: ['#Event', '#Community'],
        event: {
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
          verificationQuestions: requireVerification ? verificationQuestions.filter(q => q.trim()) : [],
          verificationAnswers: []
        }
      };
      
      addPost(eventPost);
      
      // Reset form
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
      setVerificationQuestions(['Are you an active rider?', 'Do you have proper safety gear?']);
      setShowCreateEvent(false);
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const formatDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-app-card-surface rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-app-text-muted" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-app-text-primary">Events</h1>
              <p className="text-sm text-app-text-muted">
                {filteredEvents.length} events nearby
              </p>
            </div>
          </div>
          
          {/* Verify Q/A Button */}
          <button
            onClick={() => {
              const userEvents = events.filter(event => 
                event.organizer.name === (user?.user_metadata?.full_name || user?.email || 'Your Name') && 
                event.requireVerification &&
                event.verificationAnswers &&
                event.verificationAnswers.length > 0
              );
              if (userEvents.length > 0) {
                setSelectedEventForReview(userEvents[0]);
                setShowVerificationReview(true);
              } else {
                alert('No verification requests found for your events.');
              }
            }}
            className="bg-app-primary-accent text-white px-4 py-2 rounded-xl font-medium hover:bg-app-primary-accent/90 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Verify Q/A
          </button>
        </div>

        {/* Clean Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-app-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-card-surface border-0 rounded-xl pl-12 pr-4 py-3 text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/20"
          />
        </div>

        {/* Simple Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['All', 'Attending', 'Nearby', 'Today'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedFilter === filter.toLowerCase()
                  ? 'bg-app-primary-accent text-white shadow-lg'
                  : 'bg-app-card-surface text-app-text-muted hover:bg-app-primary-accent/10 hover:text-app-text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-app-text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-app-text-primary mb-2">
                No Events Found
              </h3>
              <p className="text-app-text-muted text-sm">
                {searchQuery || selectedFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No events nearby at the moment'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-app-card-surface rounded-2xl p-6 hover:shadow-lg transition-all duration-200 border border-app-borders/50 hover:border-app-primary-accent/30"
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-app-primary-accent to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {event.organizer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-app-text-primary text-lg leading-tight">{event.title}</h3>
                      <p className="text-sm text-app-text-muted flex items-center gap-1">
                        by {event.organizer.name}
                        {event.organizer.verified && (
                          <span className="text-app-primary-accent text-xs">✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right bg-app-primary-accent/10 rounded-lg px-3 py-2">
                    <div className="text-sm font-bold text-app-primary-accent">
                      {formatDate(event.startDate, event.startTime)}
                    </div>
                    <div className="text-xs text-app-primary-accent/70">
                      {formatTime(event.startTime)}
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <p className="text-app-text-muted mb-4 text-sm leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-app-background rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-app-primary-accent" />
                    </div>
                    <div>
                      <div className="text-app-text-primary font-medium">{event.location}</div>
                      {event.distance && (
                        <div className="text-xs text-app-primary-accent">
                          {event.distance}km away
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-app-background rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-app-primary-accent" />
                    </div>
                    <div>
                      <div className="text-app-text-primary font-medium">
                        {event.attendees}{event.maxAttendees && `/${event.maxAttendees}`}
                      </div>
                      <div className="text-xs text-app-text-muted">attending</div>
                    </div>
                  </div>
                  {event.endTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-app-background rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-app-primary-accent" />
                      </div>
                      <div>
                        <div className="text-app-text-primary font-medium">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        <div className="text-xs text-app-text-muted">duration</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-app-primary-accent/10 text-app-primary-accent text-xs font-medium rounded-full border border-app-primary-accent/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Verification Badge */}
                {event.requireVerification && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-500 font-medium">Verification Required</span>
                  </div>
                )}
                
                {/* Action Button */}
                <button
                  onClick={() => handleAttendEvent(event.id)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    event.isAttending
                      ? 'bg-app-background text-app-text-primary hover:bg-app-primary-accent/10 border border-app-borders hover:border-app-primary-accent/30'
                      : 'bg-app-primary-accent text-white shadow-lg hover:shadow-xl hover:bg-app-primary-accent/90'
                  }`}
                >
                  {event.isAttending ? '✓ Attending' : (event.requireVerification ? 'Apply to Join' : 'Join Event')}
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Floating Create Event Button */}
        <button
          onClick={() => setShowCreateEvent(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-app-primary-accent text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
        
        {/* Verification Questions Modal */}
        {showVerificationModal && selectedEventForVerification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-app-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-app-text-primary">Verification Required</h2>
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      setSelectedEventForVerification(null);
                      setVerificationAnswers([]);
                    }}
                    className="p-2 hover:bg-app-card-surface rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-app-text-muted" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-app-text-primary mb-2">{selectedEventForVerification.title}</h3>
                  <p className="text-sm text-app-text-muted mb-4">
                    The event organizer requires verification before you can join. Please answer the following questions:
                  </p>
                </div>
                
                <div className="space-y-4">
                  {selectedEventForVerification.verificationQuestions?.map((question, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-app-text-primary mb-2">
                        {index + 1}. {question}
                      </label>
                      <textarea
                        value={verificationAnswers[index] || ''}
                        onChange={(e) => {
                          const newAnswers = [...verificationAnswers];
                          newAnswers[index] = e.target.value;
                          setVerificationAnswers(newAnswers);
                        }}
                        placeholder="Your answer..."
                        rows={3}
                        className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      setSelectedEventForVerification(null);
                      setVerificationAnswers([]);
                    }}
                    className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-xl hover:bg-app-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerificationSubmit}
                    disabled={isSubmittingVerification || verificationAnswers.some(answer => !answer.trim())}
                    className="flex-1 px-4 py-3 bg-app-primary-accent text-white rounded-xl hover:bg-app-primary-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingVerification ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Verification Review Modal */}
        {showVerificationReview && selectedEventForReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-app-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-app-text-primary">Verification Requests</h2>
                  <button
                    onClick={() => {
                      setShowVerificationReview(false);
                      setSelectedEventForReview(null);
                    }}
                    className="p-2 hover:bg-app-card-surface rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-app-text-muted" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-app-text-primary mb-2">{selectedEventForReview.title}</h3>
                  <p className="text-sm text-app-text-muted">
                    Review and approve/reject user applications for your event.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {selectedEventForReview.verificationAnswers?.map((userAnswer, index) => (
                    <div key={index} className="bg-app-card-surface rounded-xl p-4 border border-app-borders">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={userAnswer.userAvatar}
                            alt={userAnswer.userName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-medium text-app-text-primary">{userAnswer.userName}</h4>
                            <p className="text-xs text-app-text-muted">
                              Applied {new Date(userAnswer.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          userAnswer.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          userAnswer.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {userAnswer.status.charAt(0).toUpperCase() + userAnswer.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedEventForReview.verificationQuestions?.map((question, qIndex) => (
                          <div key={qIndex}>
                            <p className="text-sm font-medium text-app-text-primary mb-1">
                              {qIndex + 1}. {question}
                            </p>
                            <p className="text-sm text-app-text-muted bg-app-background rounded-lg p-3">
                              {userAnswer.answers[qIndex] || 'No answer provided'}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {userAnswer.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleVerificationDecision(selectedEventForReview.id, userAnswer.userId, 'rejected');
                            }}
                            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleVerificationDecision(selectedEventForReview.id, userAnswer.userId, 'approved');
                            }}
                            className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!selectedEventForReview.verificationAnswers || selectedEventForReview.verificationAnswers.length === 0) && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-app-text-muted mx-auto mb-4 opacity-50" />
                      <p className="text-app-text-muted">No verification requests yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Create Event Modal */}
        {showCreateEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-app-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-app-text-primary">Create Event</h2>
                  <button
                    onClick={() => setShowCreateEvent(false)}
                    className="p-2 hover:bg-app-card-surface rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-app-text-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">Event Title *</label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Enter event title"
                      className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                    />
                  </div>
                  
                  {/* Event Description */}
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">Description *</label>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Describe your event"
                      rows={3}
                      className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none resize-none"
                    />
                  </div>
                  
                  {/* Start Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => setEventStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-2">Start Time *</label>
                      <input
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* End Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-2">End Date</label>
                      <input
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => setEventEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-app-text-primary mb-2">End Time</label>
                      <input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary focus:border-app-primary-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Event Location */}
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Event location"
                        className="flex-1 px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
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
                        className="px-4 py-3 bg-app-primary-accent text-white rounded-xl hover:bg-app-primary-accent/90 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        GPS
                      </button>
                    </div>
                  </div>
                  
                  {/* Verification Option */}
                  <div className="flex items-center justify-between p-4 bg-app-card-surface rounded-xl">
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
                              className="flex-1 px-4 py-3 bg-app-card-surface border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                            />
                            {verificationQuestions.length > 1 && (
                              <button
                                onClick={() => {
                                  setVerificationQuestions(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-3 rounded-xl border border-app-borders hover:border-red-500 hover:text-red-400 text-app-text-muted transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {verificationQuestions.length < 5 && (
                          <button
                            onClick={() => setVerificationQuestions(prev => [...prev, ''])}
                            className="px-4 py-3 rounded-xl border border-app-borders text-app-text-muted hover:border-app-primary-accent hover:text-app-primary-accent transition-colors"
                          >
                            Add question
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Modal Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateEvent(false)}
                    className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-xl hover:bg-app-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    disabled={isCreatingEvent || !eventTitle.trim() || !eventDescription.trim() || !eventStartDate || !eventStartTime}
                    className="flex-1 px-4 py-3 bg-app-primary-accent text-white rounded-xl hover:bg-app-primary-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingEvent ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
