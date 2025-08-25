import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  X, 
  ArrowRight, 
  Star, 
  DollarSign, 
  Cloud, 
  Camera, 
  Navigation,
  Clock,
  Thermometer,
  Users,
  Heart,
  MessageCircle
} from 'lucide-react';

interface DestinationExperience {
  id: string;
  destination: string;
  budgetTips: string;
  environment: string;
  bestTime: string;
  transportation: string;
  highlights: string;
  tips: string;
  rating: number;
  author: string;
  date: string;
}

interface DestinationInfo {
  name: string;
  description: string;
  history: string;
  geography: {
    location: string;
    coordinates: string;
    altitude: string;
    terrain: string;
    climate: string;
  };
  weather: {
    current: string;
    temperature: string;
    condition: string;
    humidity: string;
    windSpeed: string;
    forecast: Array<{
      day: string;
      temp: string;
      condition: string;
    }>;
  };
  culture: {
    language: string[];
    religion: string[];
    festivals: string[];
    localCustoms: string[];
    cuisine: string[];
  };
  transportation: {
    howToReach: {
      byAir: string;
      byRoad: string;
      byTrain: string;
    };
    localTransport: string[];
    roadConditions: string;
    fuelStations: boolean;
    parkingInfo: string;
  };
  accommodation: {
    types: string[];
    priceRange: string;
    recommendations: string[];
    bookingTips: string[];
  };
  thingsToDo: {
    adventure: string[];
    cultural: string[];
    nature: string[];
    photography: string[];
    food: string[];
  };
  nearbyPlaces: Array<{
    name: string;
    distance: string;
    description: string;
    travelTime: string;
  }>;
  bestTimeToVisit: {
    peak: string;
    offPeak: string;
    avoid: string;
    weatherDetails: string;
  };
  costBreakdown: {
    currency: string;
    exchangeRate: string;
    seasonalNote: string;
    dailyBudget: {
      budget: string;
      midRange: string;
      luxury: string;
    };
    breakdown: {
      accommodation: {
        budget: string;
        midRange: string;
        luxury: string;
      };
      food: {
        streetFood: string;
        restaurants: string;
        fineDining: string;
      };
      transportation: {
        local: string;
        taxi: string;
        autoRickshaw: string;
        intercity: string;
        flights: string;
      };
      activities: {
        free: string;
        paid: string;
        premium: string;
        guide: string;
      };
      shopping: {
        souvenirs: string;
        handicrafts: string;
        textiles: string;
      };
      miscellaneous: {
        tips: string;
        internet: string;
        laundry: string;
        bottledWater: string;
      };
    };
    budgetTips: string[];
    weeklyEstimate: {
      budget: string;
      midRange: string;
      luxury: string;
    };
  };
  safety: {
    generalSafety: string[];
    healthPrecautions: string[];
    emergencyContacts: string[];
    travelInsurance: string;
  };
  travelRequirements: {
    permits: string[];
    documents: string[];
    vaccinations: string[];
    restrictions: string[];
  };
  photography: {
    bestSpots: string[];
    bestTimes: string[];
    equipment: string[];
    restrictions: string[];
  };
  connectivity: {
    internetSpeed: string;
    mobileNetwork: string[];
    wifiAvailability: string;
    chargingPoints: string;
  };
}

const DestinationKnowledge: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'destination' | 'visited' | 'share' | 'info'>('destination');
  const [destination, setDestination] = useState('');
  const [hasVisited, setHasVisited] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data for sharing experience
  const [experienceData, setExperienceData] = useState({
    budgetTips: '',
    environment: '',
    bestTime: '',
    transportation: '',
    highlights: '',
    tips: '',
    rating: 5
  });

  // Mock destination info (in real app, this would come from APIs)
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo | null>(null);

  // Mock user experiences (in real app, this would come from database)
  const [userExperiences, setUserExperiences] = useState<DestinationExperience[]>([
    {
      id: '1',
      destination: 'Leh Ladakh',
      budgetTips: 'Stay in guesthouses, carry your own food, rent bikes locally',
      environment: 'High altitude desert, stunning landscapes, cold nights',
      bestTime: 'June to September for best weather',
      transportation: 'Fly to Leh or ride via Manali/Srinagar highways',
      highlights: 'Pangong Lake, Nubra Valley, Khardung La Pass',
      tips: 'Acclimatize properly, carry warm clothes, check permits',
      rating: 5,
      author: 'RiderAlex',
      date: '2024-01-15'
    }
  ]);

  const handleDestinationSubmit = () => {
    if (!destination.trim()) return;
    setCurrentStep('visited');
  };

  const handleVisitedResponse = (visited: boolean) => {
    setHasVisited(visited);
    if (visited) {
      setCurrentStep('share');
    } else {
      setCurrentStep('info');
      fetchDestinationInfo();
    }
  };

  const fetchDestinationInfo = async () => {
    setIsLoading(true);
    try {
      // Import and use the destination service
      const destinationService = (await import('../services/destinationService')).default;
      const info = await destinationService.getDestinationInfo(destination);
      setDestinationInfo(info);
    } catch (error) {
      console.error('Error fetching destination info:', error);
      // Show error message to user
      alert('Unable to fetch destination information. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExperienceSubmit = async () => {
    const newExperience: DestinationExperience = {
      id: Date.now().toString(),
      destination,
      ...experienceData,
      author: 'CurrentUser',
      date: new Date().toISOString().split('T')[0]
    };

    // In real app, save to backend
    setUserExperiences(prev => [newExperience, ...prev]);
    
    // Reset form
    setExperienceData({
      budgetTips: '',
      environment: '',
      bestTime: '',
      transportation: '',
      highlights: '',
      tips: '',
      rating: 5
    });
    
    setIsModalOpen(false);
    setCurrentStep('destination');
    setDestination('');
    setHasVisited(null);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setCurrentStep('destination');
    setDestination('');
    setHasVisited(null);
    setDestinationInfo(null);
    setExperienceData({
      budgetTips: '',
      environment: '',
      bestTime: '',
      transportation: '',
      highlights: '',
      tips: '',
      rating: 5
    });
  };

  return (
    <>
      {/* Know about Destination Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setIsModalOpen(true)}
        className="w-full px-6 py-4 mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <MapPin className="w-5 h-5" />
        Know about Destination
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* User Experiences Section */}
      {userExperiences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-app-text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Community Experiences
          </h3>
          <div className="space-y-4">
            {userExperiences.map((experience) => (
              <div key={experience.id} className="bg-app-card-surface border border-app-borders rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-app-text-primary">{experience.destination}</h4>
                    <p className="text-sm text-app-text-muted">by {experience.author} • {experience.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < experience.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-orange-500">Budget Tips:</span> {experience.budgetTips}</p>
                  <p><span className="font-medium text-orange-500">Environment:</span> {experience.environment}</p>
                  <p><span className="font-medium text-orange-500">Best Time:</span> {experience.bestTime}</p>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-app-borders">
                  <button className="flex items-center gap-1 text-app-text-muted hover:text-orange-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">12</span>
                  </button>
                  <button className="flex items-center gap-1 text-app-text-muted hover:text-orange-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">5</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-app-card-surface rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-app-borders"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-app-text-primary">
                  {currentStep === 'destination' && 'Tell us your destination'}
                  {currentStep === 'visited' && 'Have you visited this place?'}
                  {currentStep === 'share' && 'Share your experience'}
                  {currentStep === 'info' && `About ${destination}`}
                </h2>
                <button
                  onClick={resetModal}
                  className="p-2 hover:bg-app-borders rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>

              {/* Step 1: Destination Input */}
              {currentStep === 'destination' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      Destination Name
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., Leh Ladakh, Goa, Manali..."
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleDestinationSubmit}
                    disabled={!destination.trim()}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Visited Question */}
              {currentStep === 'visited' && (
                <div className="space-y-6">
                  <p className="text-app-text-primary text-center">
                    Have you visited <span className="font-semibold text-orange-500">{destination}</span> before?
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleVisitedResponse(true)}
                      className="py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Yes, I have
                    </button>
                    <button
                      onClick={() => handleVisitedResponse(false)}
                      className="py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                    >
                      No, I haven't
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Share Experience Form */}
              {currentStep === 'share' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      How to go there on a low budget?
                    </label>
                    <textarea
                      value={experienceData.budgetTips}
                      onChange={(e) => setExperienceData(prev => ({ ...prev, budgetTips: e.target.value }))}
                      placeholder="Share budget-friendly travel tips..."
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-orange-500 transition-colors h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      How is the environment?
                    </label>
                    <textarea
                      value={experienceData.environment}
                      onChange={(e) => setExperienceData(prev => ({ ...prev, environment: e.target.value }))}
                      placeholder="Describe the climate, scenery, atmosphere..."
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-orange-500 transition-colors h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      Best time to visit?
                    </label>
                    <input
                      type="text"
                      value={experienceData.bestTime}
                      onChange={(e) => setExperienceData(prev => ({ ...prev, bestTime: e.target.value }))}
                      placeholder="e.g., October to March"
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      Transportation tips?
                    </label>
                    <textarea
                      value={experienceData.transportation}
                      onChange={(e) => setExperienceData(prev => ({ ...prev, transportation: e.target.value }))}
                      placeholder="How to reach, local transport options..."
                      className="w-full px-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-orange-500 transition-colors h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      Rate your experience
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setExperienceData(prev => ({ ...prev, rating }))}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${rating <= experienceData.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleExperienceSubmit}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Share Experience
                  </button>
                </div>
              )}

              {/* Step 4: Comprehensive Destination Info */}
              {currentStep === 'info' && (
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-app-text-muted">Fetching comprehensive destination information...</p>
                    </div>
                  ) : destinationInfo && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                      
                      {/* Overview Section */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 text-lg">📍 Overview</h3>
                        <p className="text-app-text-muted mb-3">{destinationInfo.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-orange-500">Coordinates:</span>
                            <p className="text-app-text-muted">{destinationInfo.geography.coordinates}</p>
                          </div>
                          <div>
                            <span className="font-medium text-orange-500">Altitude:</span>
                            <p className="text-app-text-muted">{destinationInfo.geography.altitude}</p>
                          </div>
                        </div>
                      </div>

                      {/* Weather & Forecast */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-orange-500" />
                          Weather & Forecast
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-app-text-primary">{destinationInfo.weather.temperature}</div>
                            <p className="text-app-text-muted">{destinationInfo.weather.condition}</p>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-orange-500">Humidity:</span> {destinationInfo.weather.humidity}</div>
                            <div><span className="text-orange-500">Wind:</span> {destinationInfo.weather.windSpeed}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {destinationInfo.weather.forecast.map((day, index) => (
                            <div key={index} className="text-center text-xs bg-app-card-surface rounded-lg p-2">
                              <div className="font-medium text-app-text-primary">{day.day}</div>
                              <div className="text-orange-500">{day.temp}</div>
                              <div className="text-app-text-muted">{day.condition}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Transportation - HOW */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Navigation className="w-5 h-5 text-orange-500" />
                          How to Reach & Transportation
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">✈️ By Air</h4>
                            <p className="text-sm text-app-text-muted">{destinationInfo.transportation.howToReach.byAir}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">🚗 By Road</h4>
                            <p className="text-sm text-app-text-muted">{destinationInfo.transportation.howToReach.byRoad}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">🚂 By Train</h4>
                            <p className="text-sm text-app-text-muted">{destinationInfo.transportation.howToReach.byTrain}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">Local Transport</h4>
                            <div className="flex flex-wrap gap-2">
                              {destinationInfo.transportation.localTransport.map((transport, index) => (
                                <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs">
                                  {transport}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Best Time to Visit - WHEN */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-500" />
                          When to Visit
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-green-500 mb-1">🌟 Peak Season</h4>
                            <p className="text-sm text-app-text-muted">{destinationInfo.bestTimeToVisit.peak}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-500 mb-1">💰 Off-Peak Season</h4>
                            <p className="text-sm text-app-text-muted">{destinationInfo.bestTimeToVisit.offPeak}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-500 mb-1">❌ Avoid</h4>
                            <p className="text-sm text-app-text-muted">{destinationInfo.bestTimeToVisit.avoid}</p>
                          </div>
                        </div>
                      </div>

                      {/* Things to Do - WHAT */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-orange-500" />
                          What to Do
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <h4 className="font-medium text-orange-500 mb-2">🏔️ Adventure Activities</h4>
                            <div className="grid grid-cols-2 gap-1">
                              {destinationInfo.thingsToDo.adventure.map((activity, index) => (
                                <div key={index} className="text-sm text-app-text-muted flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  {activity}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-2">🏛️ Cultural Experiences</h4>
                            <div className="grid grid-cols-2 gap-1">
                              {destinationInfo.thingsToDo.cultural.map((activity, index) => (
                                <div key={index} className="text-sm text-app-text-muted flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  {activity}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-2">🌿 Nature & Photography</h4>
                            <div className="grid grid-cols-2 gap-1">
                              {destinationInfo.thingsToDo.nature.map((activity, index) => (
                                <div key={index} className="text-sm text-app-text-muted flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  {activity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nearby Places - WHERE */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          Where to Go Nearby
                        </h3>
                        <div className="space-y-3">
                          {destinationInfo.nearbyPlaces.map((place, index) => (
                            <div key={index} className="bg-app-card-surface rounded-lg p-3 border border-app-borders">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-app-text-primary">{place.name}</h4>
                                <div className="text-xs text-orange-500">{place.distance}</div>
                              </div>
                              <p className="text-sm text-app-text-muted mb-1">{place.description}</p>
                              <div className="text-xs text-app-text-muted">🕐 {place.travelTime}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cost Breakdown - WHY (Budget) */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-orange-500" />
                          Cost Breakdown & Budget Planning
                        </h3>
                        {/* Exchange Rate & Season Info */}
                        <div className="bg-blue-500/10 rounded-lg p-3 mb-4">
                          <div className="text-sm text-app-text-muted mb-1">{destinationInfo.costBreakdown.exchangeRate}</div>
                          <div className="text-sm text-app-text-muted">{destinationInfo.costBreakdown.seasonalNote}</div>
                        </div>

                        {/* Daily Budget Overview */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-green-500/10 rounded-lg p-3 text-center">
                            <div className="font-medium text-green-500 text-sm">Budget</div>
                            <div className="text-app-text-primary font-bold">{destinationInfo.costBreakdown.dailyBudget.budget}</div>
                          </div>
                          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                            <div className="font-medium text-orange-500 text-sm">Mid-Range</div>
                            <div className="text-app-text-primary font-bold">{destinationInfo.costBreakdown.dailyBudget.midRange}</div>
                          </div>
                          <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                            <div className="font-medium text-purple-500 text-sm">Luxury</div>
                            <div className="text-app-text-primary font-bold">{destinationInfo.costBreakdown.dailyBudget.luxury}</div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="space-y-4 mb-4">
                          <div>
                            <div className="font-medium text-orange-500 mb-2">🏨 Accommodation</div>
                            <div className="text-sm space-y-1">
                              <div className="text-app-text-muted">Budget: {destinationInfo.costBreakdown.breakdown.accommodation.budget}</div>
                              <div className="text-app-text-muted">Mid-Range: {destinationInfo.costBreakdown.breakdown.accommodation.midRange}</div>
                              <div className="text-app-text-muted">Luxury: {destinationInfo.costBreakdown.breakdown.accommodation.luxury}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-orange-500 mb-2">🍽️ Food</div>
                            <div className="text-sm space-y-1">
                              <div className="text-app-text-muted">Street Food: {destinationInfo.costBreakdown.breakdown.food.streetFood}</div>
                              <div className="text-app-text-muted">Restaurants: {destinationInfo.costBreakdown.breakdown.food.restaurants}</div>
                              <div className="text-app-text-muted">Fine Dining: {destinationInfo.costBreakdown.breakdown.food.fineDining}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-orange-500 mb-2">🚗 Transportation</div>
                            <div className="text-sm space-y-1">
                              <div className="text-app-text-muted">Local: {destinationInfo.costBreakdown.breakdown.transportation.local}</div>
                              <div className="text-app-text-muted">Taxi: {destinationInfo.costBreakdown.breakdown.transportation.taxi}</div>
                              <div className="text-app-text-muted">Auto: {destinationInfo.costBreakdown.breakdown.transportation.autoRickshaw}</div>
                              <div className="text-app-text-muted">Intercity: {destinationInfo.costBreakdown.breakdown.transportation.intercity}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-orange-500 mb-2">🎯 Activities</div>
                            <div className="text-sm space-y-1">
                              <div className="text-app-text-muted">Free: {destinationInfo.costBreakdown.breakdown.activities.free}</div>
                              <div className="text-app-text-muted">Paid: {destinationInfo.costBreakdown.breakdown.activities.paid}</div>
                              <div className="text-app-text-muted">Premium: {destinationInfo.costBreakdown.breakdown.activities.premium}</div>
                              <div className="text-app-text-muted">Guide: {destinationInfo.costBreakdown.breakdown.activities.guide}</div>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Estimates */}
                        <div className="bg-orange-500/20 rounded-lg p-3 mb-3">
                          <div className="font-bold text-orange-500 mb-2">📅 Weekly Estimates</div>
                          <div className="text-sm space-y-1">
                            <div className="text-app-text-muted">Budget: {destinationInfo.costBreakdown.weeklyEstimate.budget}</div>
                            <div className="text-app-text-muted">Mid-Range: {destinationInfo.costBreakdown.weeklyEstimate.midRange}</div>
                            <div className="text-app-text-muted">Luxury: {destinationInfo.costBreakdown.weeklyEstimate.luxury}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-500 mb-2">💡 Budget Tips</h4>
                          {destinationInfo.costBreakdown.budgetTips.map((tip, index) => (
                            <div key={index} className="text-sm text-app-text-muted flex items-start gap-2 mb-1">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Culture & Local Info */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-orange-500" />
                          Culture & Local Information
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">🗣️ Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {destinationInfo.culture.language.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">🎉 Festivals</h4>
                            <div className="flex flex-wrap gap-2">
                              {destinationInfo.culture.festivals.map((festival, index) => (
                                <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs">
                                  {festival}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">🍽️ Local Cuisine</h4>
                            <div className="flex flex-wrap gap-2">
                              {destinationInfo.culture.cuisine.map((food, index) => (
                                <span key={index} className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Safety & Requirements */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-orange-500" />
                          Safety & Travel Requirements
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-green-500 mb-1">✅ Safety Information</h4>
                            {destinationInfo.safety.generalSafety.map((info, index) => (
                              <div key={index} className="text-sm text-app-text-muted flex items-start gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                                {info}
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-500 mb-1">📋 Documents Required</h4>
                            {destinationInfo.travelRequirements.documents.map((doc, index) => (
                              <div key={index} className="text-sm text-app-text-muted flex items-start gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                                {doc}
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-medium text-red-500 mb-1">🚨 Emergency Contacts</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {destinationInfo.safety.emergencyContacts.map((contact, index) => (
                                <div key={index} className="text-sm text-app-text-muted bg-red-500/10 rounded px-2 py-1">
                                  {contact}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photography & Connectivity */}
                      <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                        <h3 className="font-bold text-app-text-primary mb-3 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-orange-500" />
                          Photography & Connectivity
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <h4 className="font-medium text-orange-500 mb-1">📸 Best Photography Spots</h4>
                            <div className="flex flex-wrap gap-2">
                              {destinationInfo.photography.bestSpots.map((spot, index) => (
                                <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs">
                                  {spot}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-500 mb-1">📶 Connectivity</h4>
                            <div className="text-sm space-y-1">
                              <div><span className="text-orange-500">Internet:</span> {destinationInfo.connectivity.internetSpeed}</div>
                              <div><span className="text-orange-500">WiFi:</span> {destinationInfo.connectivity.wifiAvailability}</div>
                              <div><span className="text-orange-500">Charging:</span> {destinationInfo.connectivity.chargingPoints}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DestinationKnowledge;
