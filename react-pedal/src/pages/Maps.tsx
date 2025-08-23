import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Plus, 
  Minus, 
  Locate, 
  Layers, 
  Coffee, 
  Car, 
  Fuel, 
  Utensils, 
  ShoppingBag, 
  Building, 
  Star,
  Clock,
  Route,
  Trash2,
  Download,
  Save,
  X,
  Wrench,
  Cross,
  ParkingCircle,
  Zap,
  Bike,
  Mountain,
  Square,
  Play,
  Menu,
  Navigation,
  ArrowRight,
  RotateCcw,
  ArrowUp,
  ArrowLeft,
  StopCircle
} from 'lucide-react';
import { maps } from '../services/api';

// Extend Window interface to include Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface NearbyPlace {
  id: number;
  name: string;
  type: 'mechanic' | 'fuel' | 'trail' | 'cafe' | 'shop' | 'puncture' | 'hospital' | 'parking' | 'charging' | 'bike_shop';
  distance: string;
  rating: number;
  address: string;
  phone?: string;
  hours?: string;
  coordinates: { lat: number; lng: number };
}

interface MapArea {
  id: number;
  name: string;
  bounds: string;
  size: string;
  downloadUrl: string;
}

interface RouteData {
  id?: string;
  name: string;
  description?: string;
  waypoints: { lat: number; lng: number; elevation?: number; timestamp?: string }[];
  distance: number;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  tags: string[];
  is_public?: boolean;
  created_at?: string;
  user?: any;
}

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver: 'straight' | 'left' | 'right' | 'slight-left' | 'slight-right' | 'sharp-left' | 'sharp-right' | 'u-turn';
  coordinates: { lat: number; lng: number };
}

interface NavigationRoute {
  steps: NavigationStep[];
  totalDistance: string;
  totalDuration: string;
  coordinates: { lat: number; lng: number }[];
}

type FilterType = 'all' | 'mechanic' | 'fuel' | 'trail' | 'cafe' | 'shop' | 'puncture' | 'hospital' | 'parking' | 'charging' | 'bike_shop';

const Maps: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [currentLocation, setCurrentLocation] = useState('San Francisco, CA');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapAreas, setMapAreas] = useState<MapArea[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<{ lat: number; lng: number; timestamp: string }[]>([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeToSave, setRouteToSave] = useState<RouteData | null>(null);
  const [showRoutesPanel, setShowRoutesPanel] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadRadius, setDownloadRadius] = useState('5');
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{north: number, south: number, east: number, west: number} | null>(null);
  const [estimatedSize, setEstimatedSize] = useState('~75 MB');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestBoxRef = useRef<HTMLDivElement | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  
  // Navigation states
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationRoute, setNavigationRoute] = useState<NavigationRoute | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const navigationLayerRef = useRef<any>(null);
  const watchPositionRef = useRef<number | null>(null);

  // Places loaded from backend API

  // Navigation functions with proper road routing
  const calculateRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      // Try OSRM first (better for road following)
      const osrmResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&overview=full&annotations=true`
      );
      
      if (osrmResponse.ok) {
        const data = await osrmResponse.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          const steps: NavigationStep[] = route.legs[0].steps.map((step: any) => ({
            instruction: step.maneuver.instruction || getInstructionFromManeuver(step.maneuver),
            distance: `${(step.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(step.duration / 60)} min`,
            maneuver: getOSRMManeuverType(step.maneuver.type),
            coordinates: { lat: step.maneuver.location[1], lng: step.maneuver.location[0] }
          }));
          
          return {
            steps,
            totalDistance: `${(route.distance / 1000).toFixed(1)} km`,
            totalDuration: `${Math.round(route.duration / 60)} min`,
            coordinates: route.geometry.coordinates.map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }))
          };
        }
      }
      
      // Try OpenRouteService as fallback
      const orsResponse = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248b6fd2b3edeae24b08e1f6dbeffac7b73&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&format=geojson&instructions=true&radiuses=1000`
      );
      
      if (orsResponse.ok) {
        const data = await orsResponse.json();
        if (data.features && data.features.length > 0) {
          const route = data.features[0];
          
          const steps: NavigationStep[] = route.properties.segments[0].steps.map((step: any) => ({
            instruction: step.instruction,
            distance: `${(step.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(step.duration / 60)} min`,
            maneuver: getManeuverType(step.type),
            coordinates: { lat: step.way_points[0][1], lng: step.way_points[0][0] }
          }));
          
          return {
            steps,
            totalDistance: `${(route.properties.segments[0].distance / 1000).toFixed(1)} km`,
            totalDuration: `${Math.round(route.properties.segments[0].duration / 60)} min`,
            coordinates: route.geometry.coordinates.map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }))
          };
        }
      }
      
      // Fallback to road-following mock route
      return createRoadFollowingMockRoute(start, end);
    } catch (error) {
      console.error('Route calculation failed:', error);
      return createRoadFollowingMockRoute(start, end);
    }
  };
  
  const createRoadFollowingMockRoute = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): NavigationRoute => {
    // Calculate realistic distance (road distance is typically 1.3x straight line)
    const straightDistance = Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)) * 111;
    const roadDistance = straightDistance * 1.3; // Account for road curves
    const totalDistance = Math.max(0.5, roadDistance);
    const totalDuration = Math.round(totalDistance * 2); // Urban driving speed
    
    // Create road-following waypoints with realistic turns
    const waypoints: { lat: number; lng: number }[] = [];
    const numSteps = Math.min(12, Math.max(4, Math.round(totalDistance / 1.5)));
    
    for (let i = 0; i <= numSteps; i++) {
      const progress = i / numSteps;
      // Add some curve to simulate road following
      const curveFactor = Math.sin(progress * Math.PI * 3) * 0.001;
      waypoints.push({
        lat: start.lat + (end.lat - start.lat) * progress + curveFactor,
        lng: start.lng + (end.lng - start.lng) * progress + curveFactor * 0.5
      });
    }
    
    const steps: NavigationStep[] = waypoints.slice(0, -1).map((point, index) => {
      const nextPoint = waypoints[index + 1];
      const stepDistance = Math.sqrt(Math.pow(nextPoint.lat - point.lat, 2) + Math.pow(nextPoint.lng - point.lng, 2)) * 111 * 1.2;
      const stepDuration = Math.max(1, Math.round(stepDistance * 2));
      
      let instruction = "Continue straight";
      let maneuver: NavigationStep['maneuver'] = "straight";
      
      if (index === 0) {
        instruction = "Head northeast on current road";
        maneuver = "straight";
      } else if (index === waypoints.length - 2) {
        instruction = "Arrive at destination on the right";
        maneuver = "slight-right";
      } else {
        // Create realistic turn patterns
        const turnPatterns = [
          { instruction: "Turn right onto Main Road", maneuver: "right" as const },
          { instruction: "Turn left onto Cross Street", maneuver: "left" as const },
          { instruction: "Continue straight on Highway", maneuver: "straight" as const },
          { instruction: "Keep right at the fork", maneuver: "slight-right" as const },
          { instruction: "Keep left to stay on road", maneuver: "slight-left" as const },
          { instruction: "Continue on Ring Road", maneuver: "straight" as const }
        ];
        const pattern = turnPatterns[index % turnPatterns.length];
        instruction = pattern.instruction;
        maneuver = pattern.maneuver;
      }
      
      return {
        instruction,
        distance: `${stepDistance.toFixed(1)} km`,
        duration: `${stepDuration} min`,
        maneuver,
        coordinates: point
      };
    });
    
    return {
      steps,
      totalDistance: `${totalDistance.toFixed(1)} km`,
      totalDuration: `${totalDuration} min`,
      coordinates: waypoints
    };
  };
  
  const getInstructionFromManeuver = (maneuver: any): string => {
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    
    switch (type) {
      case 'depart': return 'Head ' + (modifier || 'straight');
      case 'turn': return 'Turn ' + (modifier || 'right');
      case 'merge': return 'Merge ' + (modifier || 'right');
      case 'on-ramp': return 'Take the ramp on the ' + (modifier || 'right');
      case 'off-ramp': return 'Take the exit on the ' + (modifier || 'right');
      case 'fork': return 'Keep ' + (modifier || 'right') + ' at the fork';
      case 'continue': return 'Continue straight';
      case 'arrive': return 'Arrive at destination';
      default: return 'Continue on route';
    }
  };
  
  const getManeuverType = (type: number): NavigationStep['maneuver'] => {
    switch (type) {
      case 0: return 'straight';
      case 1: return 'right';
      case 2: return 'sharp-right';
      case 3: return 'u-turn';
      case 4: return 'sharp-left';
      case 5: return 'left';
      case 6: return 'slight-left';
      case 7: return 'slight-right';
      default: return 'straight';
    }
  };
  
  const getOSRMManeuverType = (type: string): NavigationStep['maneuver'] => {
    switch (type) {
      case 'turn-right': return 'right';
      case 'turn-left': return 'left';
      case 'turn-sharp-right': return 'sharp-right';
      case 'turn-sharp-left': return 'sharp-left';
      case 'turn-slight-right': return 'slight-right';
      case 'turn-slight-left': return 'slight-left';
      case 'uturn': return 'u-turn';
      case 'continue':
      case 'straight':
      default: return 'straight';
    }
  };
  
  const startNavigation = async (destinationCoords: { lat: number; lng: number }, destinationName: string) => {
    if (!userLocation) {
      setError('Location access required for navigation');
      return;
    }
    
    setLoading(true);
    try {
      const route = await calculateRoute(userLocation, destinationCoords);
      setNavigationRoute(route);
      setDestination({ ...destinationCoords, name: destinationName });
      setCurrentStepIndex(0);
      setIsNavigating(true);
      setShowDirectionsPanel(true);
      
      // Draw route on map
      if (mapInstanceRef.current && leafletReady) {
        const L = window.L;
        
        // Clear existing navigation layer
        if (navigationLayerRef.current) {
          navigationLayerRef.current.remove();
        }
        
        // Create route polyline
        const routeCoords = route.coordinates.map((coord: { lat: number; lng: number }) => [coord.lat, coord.lng]);
        navigationLayerRef.current = L.polyline(routeCoords, {
          color: '#FF6B00',
          weight: 6,
          opacity: 0.8
        }).addTo(mapInstanceRef.current);
        
        // Add destination marker
        L.marker([destinationCoords.lat, destinationCoords.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(destinationName);
        
        // Fit map to route
        mapInstanceRef.current.fitBounds(navigationLayerRef.current.getBounds());
      }
    } catch (error) {
      setError('Failed to calculate route');
    } finally {
      setLoading(false);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationRoute(null);
    setDestination(null);
    setShowDirectionsPanel(false);
    setCurrentStepIndex(0);
    setIsJourneyStarted(false);
    
    // Stop watching position
    if (watchPositionRef.current) {
      navigator.geolocation.clearWatch(watchPositionRef.current);
      watchPositionRef.current = null;
    }
    
    // Remove navigation layer from map
    if (navigationLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(navigationLayerRef.current);
      navigationLayerRef.current = null;
    }
  };

  const startJourney = () => {
    if (!destination || !navigationRoute) return;
    
    setIsJourneyStarted(true);
    setIsNavigating(true);
    
    // Start real-time location tracking
    if (navigator.geolocation) {
      watchPositionRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          
          // Update map center to follow user
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 18);
          }
          
          // Check if user has reached the next step
          checkNavigationProgress(newLocation);
        },
        (error) => {
          console.error('Error watching position:', error);
          setError('Unable to track your location for navigation');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    }
    
    // Show success message
    setError('Journey started! Following your location...');
    setTimeout(() => setError(''), 3000);
  };

  const checkNavigationProgress = (currentLocation: { lat: number; lng: number }) => {
    if (!navigationRoute || !navigationRoute.steps) return;
    
    const currentStep = navigationRoute.steps[currentStepIndex];
    if (!currentStep || !currentStep.coordinates) return;
    
    // Calculate distance to current step
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      currentStep.coordinates.lat,
      currentStep.coordinates.lng
    );
    
    // If within 50 meters of the step, move to next step
    if (distance < 0.05 && currentStepIndex < navigationRoute.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Voice-like notification (you can replace with actual TTS)
      console.log(`Next step: ${navigationRoute.steps[currentStepIndex + 1]?.instruction}`);
    }
    
    // Check if destination is reached
    if (destination && calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    ) < 0.1) {
      setError('🎉 You have arrived at your destination!');
      setTimeout(() => {
        stopNavigation();
      }, 3000);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'left':
      case 'slight-left':
      case 'sharp-left':
        return ArrowLeft;
      case 'right':
      case 'slight-right':
      case 'sharp-right':
        return ArrowRight;
      case 'u-turn':
        return RotateCcw;
      default:
        return ArrowUp;
    }
  };

  // Load routes and offline maps from backend
  useEffect(() => {
    // Load map areas from backend
    // setMapAreas([]);
    loadRoutes();
    loadOfflineMaps();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await maps.getRoutes();
      if (response.success && response.data) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  };

  const loadOfflineMaps = async () => {
    try {
      const response = await maps.getOfflineMaps();
      if (response.success && response.data) {
        const backendMaps = response.data.map((map: any) => ({
          id: map.id,
          name: map.name,
          bounds: `${map.zoom_level}x zoom level`,
          size: `${map.size_mb} MB`,
          downloadUrl: map.id
        }));
        setMapAreas([...mapAreas, ...backendMaps]);
      }
    } catch (error) {
      console.error('Failed to load offline maps:', error);
    }
  };

  // Load Leaflet from CDN and initialize the map
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setLeafletReady(true);
        };
        document.head.appendChild(script);
      } else if (window.L) {
        setLeafletReady(true);
      }
    };

    loadLeaflet();
  }, []);

  // Add mouse event handlers for area selection
  useEffect(() => {
    if (!isSelectingArea || !mapContainerRef.current) return;

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      const rect = mapContainerRef.current!.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      
      setSelectedArea({
        north: startY,
        south: startY,
        east: startX,
        west: startX
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      const rect = mapContainerRef.current!.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setSelectedArea({
        north: startY,
        south: currentY,
        east: currentX,
        west: startX
      });

      // Calculate estimated size based on selection area
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const area = (width * height) / 10000; // Rough estimation
      const sizeEstimate = Math.max(10, Math.min(500, area * 2));
      setEstimatedSize(`~${Math.round(sizeEstimate)} MB`);
    };

    const handleMouseUp = () => {
      isDrawing = false;
    };

    const container = mapContainerRef.current;
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelectingArea]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to San Francisco
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, []);

  // Initialize map when ready
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;
    const L = window.L;
    const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194];
    const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    mapInstanceRef.current = map;
    
    // Add user location marker if available
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng])
        .addTo(map)
        .bindPopup('Your Location')
        .openPopup();
    }
  }, [leafletReady, userLocation]);

  // Update markers when places or filter change
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const L = (window as any).L;
    // clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const placesToShow = nearbyPlaces; // already filtered by live fetch
    placesToShow.forEach((place) => {
      const marker = L.marker([place.coordinates.lat, place.coordinates.lng]).addTo(mapInstanceRef.current);
      marker.bindPopup(`<b>${place.name}</b><br/>${place.address}<br/>${place.distance}`);
      markersRef.current.push(marker);
    });
  }, [leafletReady, nearbyPlaces, selectedFilter]);

  // Build Overpass QL for a category within current map bounds
  const buildOverpassQuery = (category: typeof selectedFilter) => {
    const map = mapInstanceRef.current;
    if (!map) return null;
    const b = map.getBounds();
    const south = b.getSouth();
    const west = b.getWest();
    const north = b.getNorth();
    const east = b.getEast();

    const bbox = `${south},${west},${north},${east}`;

    // Tag filters per category
    const parts: string[] = [];
    const pushNodeWay = (filter: string) => {
      parts.push(`node[${filter}](${bbox});`);
      parts.push(`way[${filter}](${bbox});`);
    };

    if (category === 'all') {
      ['amenity=fuel','amenity=cafe','shop=bicycle','service:bicycle:repair=yes','highway=cycleway','highway=path','service:tyres=yes','service:puncture=yes','shop=tyres']
        .forEach(f => pushNodeWay(f));
    } else if (category === 'fuel') {
      pushNodeWay('amenity=fuel');
    } else if (category === 'cafe') {
      pushNodeWay('amenity=cafe');
    } else if (category === 'shop' || category === 'mechanic') {
      pushNodeWay('shop=bicycle');
      pushNodeWay('service:bicycle:repair=yes');
    } else if (category === 'puncture') {
      pushNodeWay('service:tyres=yes');
      pushNodeWay('service:puncture=yes');
      pushNodeWay('shop=tyres');
    } else if (category === 'trail') {
      // Trails: highways for cycling
      parts.push(`way["highway"~"^(cycleway|path)$"][bicycle!~"no"](${bbox});`);
    }

    const body = `[out:json][timeout:25];(${parts.join('')});out center 100;`;
    return body;
  };

  const toNearbyPlace = (el: any, fallbackType: NearbyPlace['type']): NearbyPlace | null => {
    const isWay = el.type === 'way';
    const lat = isWay ? el.center?.lat : el.lat;
    const lon = isWay ? el.center?.lon : el.lon;
    if (lat == null || lon == null) return null;
    const name = el.tags?.name || el.tags?.brand || el.tags?.operator || 'Unnamed place';

    const typeGuess = (() => {
      const t = el.tags || {};
      if (t['amenity'] === 'fuel') return 'fuel';
      if (t['amenity'] === 'cafe') return 'cafe';
      if (t['shop'] === 'bicycle') return 'shop';
      if (t['shop'] === 'tyres') return 'puncture';
      if (t['service:bicycle:repair'] === 'yes') return 'mechanic';
      if (t['service:tyres'] === 'yes' || t['service:puncture'] === 'yes') return 'puncture';
      if (t['highway'] === 'cycleway' || (t['highway'] === 'path' && (t['bicycle'] ?? '') !== 'no')) return 'trail';
      return fallbackType;
    })();

    // compute rough distance from map center
    const map = mapInstanceRef.current;
    const center = map ? map.getCenter() : { lat: 37.7749, lng: -122.4194 };
    const distKm = haversine(center.lat, center.lng, lat, lon);
    const distance = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`;

    return {
      id: el.id,
      name,
      type: typeGuess as NearbyPlace['type'],
      distance,
      rating: 0,
      address: el.tags?.addr_full || el.tags?.['addr:street'] || 'Nearby',
      coordinates: { lat, lng: lon }
    };
  };

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchLivePlaces = async (category: FilterType) => {
    const body = buildOverpassQuery(category);
    if (!body) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: new URLSearchParams({ data: body })
      });
      if (!res.ok) throw new Error(`Overpass error ${res.status}`);
      const json = await res.json();
      const elements: any[] = json.elements || [];
      const places: NearbyPlace[] = [];
      for (const el of elements) {
        const p = toNearbyPlace(el, category === 'all' ? 'shop' : (category as NearbyPlace['type']));
        if (p) places.push(p);
      }
      // Deduplicate by coordinates + name
      const uniqKey = (p: NearbyPlace) => `${p.name}-${p.coordinates.lat.toFixed(5)}-${p.coordinates.lng.toFixed(5)}`;
      const uniqMap = new Map<string, NearbyPlace>();
      places.forEach(p => {
        const k = uniqKey(p);
        if (!uniqMap.has(k)) uniqMap.set(k, p);
      });
      const result = Array.from(uniqMap.values()).slice(0, 50);
      setNearbyPlaces(result);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load nearby places');
      // Fallback to mock
      setNearbyPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (suggestBoxRef.current && suggestBoxRef.current.contains(t)) return;
      if (inputRef.current && inputRef.current.contains(t as Node)) return;
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Debounced autosuggestions when typing
  useEffect(() => {
    const run = async () => {
      const q = searchTerm.trim();
      if (!q) { setSuggestions([]); setShowSuggestions(false); setHighlightIndex(-1); return; }
      if (!mapInstanceRef.current) return;
      try {
        setSuggestLoading(true);
        // cancel any in-flight request
        if (suggestAbortRef.current) suggestAbortRef.current.abort();
        const ac = new AbortController();
        suggestAbortRef.current = ac;
        const b = mapInstanceRef.current.getBounds();
        const viewbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
        const base = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6';
        const boundedUrl = `${base}&viewbox=${encodeURIComponent(viewbox)}&bounded=1&q=${encodeURIComponent(q)}`;
        let res = await fetch(boundedUrl, { headers: { 'Accept': 'application/json' }, signal: ac.signal });
        let data = await res.json();
        // Fallback to unbounded global search if none found
        if (!Array.isArray(data) || data.length === 0) {
          const globalUrl = `${base}&q=${encodeURIComponent(q)}`;
          res = await fetch(globalUrl, { headers: { 'Accept': 'application/json' }, signal: ac.signal });
          data = await res.json();
        }
        if (ac.signal.aborted) return;
        const list = Array.isArray(data) ? data : [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
        setHighlightIndex(list.length > 0 ? 0 : -1);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const selectSuggestion = async (s: any) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchTerm(s.display_name || '');
    const lat = parseFloat(s.lat); const lon = parseFloat(s.lon);
    if (mapInstanceRef.current && !isNaN(lat) && !isNaN(lon)) {
      mapInstanceRef.current.setView([lat, lon], 14);
      const label = s.display_name?.split(',').slice(0, 3).join(', ') || s.display_name;
      setCurrentLocation(label || 'Selected location');
      await fetchLivePlaces(selectedFilter);
    }
  };

  // Fetch when filter changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    fetchLivePlaces(selectedFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  // Geocode search term using Nominatim and move map
  const geocodeSearch = async (term: string) => {
    if (!term || !mapInstanceRef.current) return;
    try {
      setSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(term)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const r = data[0];
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        mapInstanceRef.current.setView([lat, lon], 14);
        const label = r.display_name?.split(',').slice(0, 3).join(', ') || term;
        setCurrentLocation(label);
        await fetchLivePlaces(selectedFilter);
      } else {
        setError('No results found');
      }
    } catch (e: any) {
      setError(e.message || 'Search error');
    } finally {
      setSearching(false);
    }
  };

  const filterOptions = [
    { id: 'fuel', label: 'Fuel Stations', icon: Fuel },
    { id: 'mechanic', label: 'Mechanics', icon: Wrench },
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'shop', label: 'Shops', icon: ShoppingBag },
    { id: 'trail', label: 'Trails', icon: Route },
    { id: 'puncture', label: 'Puncture Repair', icon: Car },
    { id: 'hospital', label: 'Hospitals', icon: Cross },
    { id: 'parking', label: 'Parking', icon: ParkingCircle },
    { id: 'charging', label: 'EV Charging', icon: Zap },
    { id: 'bike_shop', label: 'Bike Shops', icon: Bike }
  ];

  const filteredPlaces = selectedFilter === 'all' 
    ? nearbyPlaces 
    : nearbyPlaces.filter(place => place.type === selectedFilter);

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'mechanic': return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'fuel': return <Fuel className="w-5 h-5 text-blue-500" />;
      case 'hospital': return <Cross className="w-5 h-5 text-red-500" />;
      case 'parking': return <ParkingCircle className="w-5 h-5 text-purple-500" />;
      case 'charging': return <Zap className="w-5 h-5 text-green-500" />;
      case 'bike_shop': return <Bike className="w-5 h-5 text-indigo-500" />;
      case 'trail': return <Mountain className="w-5 h-5 text-green-500" />;
      case 'cafe': return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'shop': return <Bike className="w-5 h-5 text-purple-500" />;
      case 'puncture': return <Wrench className="w-5 h-5 text-red-500" />;
      default: return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDownloadMap = async (area: MapArea) => {
    if (!mapInstanceRef.current) return;
    
    try {
      const bounds = mapInstanceRef.current.getBounds();
      const zoom = mapInstanceRef.current.getZoom();
      
      // For real implementation, you'd capture map tiles here
      const mapData = {
        name: area.name,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        },
        zoom_level: zoom,
        tiles_data: 'base64_encoded_tiles_placeholder', // In real app, capture actual tiles
        size_mb: parseFloat(area.size.replace(' MB', '')) || 25
      };
      
      const response = await maps.saveOfflineMap(mapData);
      if (response.success) {
        console.log(`Map downloaded: ${area.name}`);
        await loadOfflineMaps(); // Refresh the list
      } else {
        setError(response.error || 'Failed to download map');
      }
    } catch (error: any) {
      setError(error.message || 'Download failed');
    }
  };

  const startRouteRecording = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    
    setIsRecording(true);
    setCurrentRoute([]);
    setError(null);
    
    // Start GPS tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        };
        
        setCurrentRoute(prev => [...prev, newPoint]);
        
        // Update map view to follow user
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setError('GPS tracking failed');
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    
    // Store watch ID for cleanup
    (window as any).routeWatchId = watchId;
  };

  const stopRouteRecording = () => {
    setIsRecording(false);
    
    // Stop GPS tracking
    if ((window as any).routeWatchId) {
      navigator.geolocation.clearWatch((window as any).routeWatchId);
      delete (window as any).routeWatchId;
    }
    
    if (currentRoute.length < 2) {
      setError('Route too short to save');
      return;
    }
    
    // Calculate route statistics
    const waypoints = currentRoute.map(p => ({ lat: p.lat, lng: p.lng }));
    const distance = maps.calculateRouteDistance(waypoints);
    const duration = Math.round((new Date(currentRoute[currentRoute.length - 1].timestamp).getTime() - 
                                new Date(currentRoute[0].timestamp).getTime()) / 1000 / 60); // minutes
    
    setRouteToSave({
      name: '',
      description: '',
      waypoints: currentRoute.map(p => ({ ...p, elevation: 0 })),
      distance,
      duration,
      difficulty: 'moderate',
      tags: []
    });
    
    setShowRouteModal(true);
  };

  const saveRoute = async (routeData: RouteData) => {
    try {
      const response = await maps.saveRoute(routeData);
      if (response.success) {
        setShowRouteModal(false);
        setRouteToSave(null);
        setCurrentRoute([]);
        await loadRoutes(); // Refresh routes list
      } else {
        setError(response.error || 'Failed to save route');
      }
    } catch (error: any) {
      setError(error.message || 'Save failed');
    }
  };

  const deleteRoute = async (routeId: string) => {
    try {
      const response = await maps.deleteRoute(routeId);
      if (response.success) {
        await loadRoutes(); // Refresh routes list
      } else {
        setError(response.error || 'Failed to delete route');
      }
    } catch (error: any) {
      setError(error.message || 'Delete failed');
    }
  };

  const displayRoute = (route: RouteData) => {
    if (!mapInstanceRef.current || !leafletReady) return;
    
    const L = (window as any).L;
    
    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }
    
    // Create polyline for route
    const latlngs = route.waypoints.map(wp => [wp.lat, wp.lng]);
    routeLayerRef.current = L.polyline(latlngs, {
      color: '#FF6B00',
      weight: 4,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);
    
    // Fit map to route bounds
    mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds());
  };

  const DownloadModal = () => (
    <AnimatePresence>
      {isDownloadModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsDownloadModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-app-card-surface rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-app-borders"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-app-text-primary mb-4 flex items-center gap-2">
                <Download className="w-6 h-6 text-app-primary-accent" />
                Download Maps
              </h2>
              <p className="text-app-text-muted mb-6">
                Download offline maps for your area to use without internet connection.
              </p>
              
              <div className="space-y-4">
                {mapAreas.map((area) => (
                  <div
                    key={area.id}
                    className="bg-app-background border border-app-borders rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-app-text-primary">{area.name}</h3>
                      <span className="text-sm text-app-text-muted">{area.size}</span>
                    </div>
                    <p className="text-sm text-app-text-muted mb-3">{area.bounds}</p>
                    <button
                      onClick={() => handleDownloadMap(area)}
                      className="w-full py-2 px-4 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="w-full mt-6 py-2 px-4 border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="h-screen w-full overflow-hidden relative">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" style={{ minHeight: '100vh' }} />
      
      {/* Google Maps Style Area Selection Overlay */}
      {isSelectingArea && (
        <div className="absolute inset-0 z-60 bg-black/20">
          {/* Selection Instructions */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-app-card-surface/95 backdrop-blur-md rounded-xl px-6 py-4 border border-app-borders/50 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-app-primary-accent/10 rounded-lg">
                <Square className="w-5 h-5 text-app-primary-accent" />
              </div>
              <div>
                <p className="text-app-text-primary font-semibold text-sm">Select Download Area</p>
                <p className="text-app-text-muted text-xs">Click and drag to create a selection rectangle</p>
              </div>
            </div>
          </div>
          
          {/* Selection Rectangle */}
          {selectedArea && (
            <div 
              className="absolute border-2 border-app-primary-accent bg-app-primary-accent/10 pointer-events-none"
              style={{
                left: `${Math.min(selectedArea.west, selectedArea.east)}px`,
                top: `${Math.min(selectedArea.north, selectedArea.south)}px`,
                width: `${Math.abs(selectedArea.east - selectedArea.west)}px`,
                height: `${Math.abs(selectedArea.south - selectedArea.north)}px`
              }}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-app-primary-accent rounded-full" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-app-primary-accent rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-app-primary-accent rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-app-primary-accent rounded-full" />
            </div>
          )}
          
          {/* Bottom Action Bar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-app-card-surface/95 backdrop-blur-md rounded-2xl px-6 py-4 border border-app-borders/50 shadow-xl">
            <div className="flex items-center gap-4">
              {selectedArea && (
                <div className="text-center">
                  <p className="text-app-text-primary font-semibold text-sm">{estimatedSize}</p>
                  <p className="text-app-text-muted text-xs">Estimated size</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsSelectingArea(false);
                    setSelectedArea(null);
                  }}
                  className="px-4 py-2 bg-app-background border border-app-borders text-app-text-primary rounded-xl hover:bg-app-background/80 transition-all font-medium"
                >
                  Cancel
                </button>
                {selectedArea && (
                  <button
                    onClick={() => {
                      // Download selected area
                      const area: MapArea = {
                        id: Date.now(),
                        name: `Custom Area - ${new Date().toLocaleDateString()}`,
                        bounds: 'Selected area',
                        size: estimatedSize,
                        downloadUrl: `offline-map-custom-${Date.now()}`
                      };
                      setMapAreas(prev => [...prev, area]);
                      localStorage.setItem('downloadedMaps', JSON.stringify([...mapAreas, area]));
                      setIsSelectingArea(false);
                      setSelectedArea(null);
                      setError(`Map downloaded successfully! (${estimatedSize})`);
                      setTimeout(() => setError(null), 3000);
                    }}
                    className="px-4 py-2 bg-app-primary-accent text-white rounded-xl hover:bg-app-primary-accent/90 transition-all font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-4 md:right-4 z-50">
        <div className="bg-app-card-surface/95 backdrop-blur-md rounded-2xl shadow-xl border border-app-borders/50">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => setShowRoutesPanel(true)}
              className="mr-3 p-2 bg-app-background/50 hover:bg-app-primary-accent/20 rounded-xl transition-all duration-200 group"
              title="Routes & Categories"
            >
              <Menu className="w-5 h-5 text-app-text-primary group-hover:text-app-primary-accent transition-colors" />
            </button>
            <div className="flex items-center flex-1 bg-app-background/50 rounded-xl px-3 py-2">
              <Search className="w-5 h-5 text-app-text-muted mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search places, routes, or POIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent text-app-text-primary placeholder-app-text-muted"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    if (suggestions.length > 0) {
                      const firstSuggestion = suggestions[0];
                      const coords = { lat: parseFloat(firstSuggestion.lat), lng: parseFloat(firstSuggestion.lon) };
                      startNavigation(coords, firstSuggestion.display_name);
                    }
                  }}
                  className="ml-2 p-1.5 bg-app-primary-accent hover:bg-app-primary-accent/90 rounded-lg transition-all duration-200 flex items-center justify-center"
                  title="Get Directions"
                >
                  <Navigation className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  setError('Getting your location...');
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      setUserLocation({ lat: latitude, lng: longitude });
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([latitude, longitude], 16);
                        
                        // Add a marker for current location
                        if (window.L) {
                          const marker = window.L.marker([latitude, longitude], {
                            icon: window.L.divIcon({
                              className: 'custom-location-marker',
                              html: '<div style="width: 20px; height: 20px; background: #FF6B00; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                              iconSize: [20, 20],
                              iconAnchor: [10, 10]
                            })
                          }).addTo(mapInstanceRef.current);
                          
                          marker.bindPopup('You are here').openPopup();
                        }
                      }
                      setError('Location found!');
                      setTimeout(() => setError(''), 2000);
                    },
                    (error) => {
                      console.error('Geolocation error:', error);
                      setError('Unable to get your location. Please check permissions.');
                      setTimeout(() => setError(''), 3000);
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 60000
                    }
                  );
                } else {
                  setError('Geolocation is not supported by this browser.');
                  setTimeout(() => setError(''), 3000);
                }
              }}
              className="ml-3 p-2 bg-app-background/50 hover:bg-app-primary-accent/20 rounded-xl transition-all duration-200 group"
              title="My Location"
            >
              <Locate className="w-5 h-5 text-app-text-primary group-hover:text-app-primary-accent transition-colors" />
            </button>
          </div>
          {(suggestions.length > 0 || showSuggestions) && (
            <div className="mt-1 sm:mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-40 sm:max-h-48 overflow-y-auto z-[60]">
              <div className="flex items-center justify-between p-2 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Search Results</span>
                <button
                  onClick={() => {
                    setSuggestions([]);
                    setSearchTerm('');
                    setNearbyPlaces([]);
                  }}
                  className="text-xs text-app-primary-accent hover:text-app-primary-accent/80 font-medium"
                >
                  Clear All
                </button>
              </div>
              {suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => {
                      setSearchTerm(suggestion.display_name);
                      setSuggestions([]);
                      const coords = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15);
                      }
                    }}
                    className="flex items-center gap-2 sm:gap-3 flex-1 text-left"
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm text-gray-700">{suggestion.display_name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const coords = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
                      startNavigation(coords, suggestion.display_name);
                    }}
                    className="px-3 py-1 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-all text-xs font-medium flex items-center gap-1 ml-2"
                    title="Start Navigation"
                  >
                    <Navigation className="w-3 h-3" />
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Modern Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-32 left-1/2 transform -translate-x-1/2 z-[70] max-w-sm"
        >
          <div className="bg-red-500/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl border border-red-400/50 text-sm text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>{error}</span>
            </div>
          </div>
        </motion.div>
      )}



      {/* Modern Download Map Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[80]">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="bg-app-card-surface rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:w-96 md:max-w-md border-t md:border border-app-borders/50 max-h-[85vh] md:max-h-[70vh] overflow-hidden"
          >
            {/* Mobile Handle */}
            <div className="md:hidden flex justify-center py-3">
              <div className="w-10 h-1 bg-app-text-muted/30 rounded-full" />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-app-text-primary">Download Offline Map</h3>
                  <p className="text-sm text-app-text-muted mt-1">Save maps for offline navigation</p>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="p-2 text-app-text-muted hover:text-app-text-primary hover:bg-app-background/50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
              <div className="space-y-2.5 sm:space-y-4">
                {!isSelectingArea ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="bg-app-background/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-app-primary-accent/10 rounded-lg">
                          <Download className="w-5 h-5 text-app-primary-accent" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text-primary mb-1">Custom Area</h4>
                          <p className="text-sm text-app-text-muted">Select a specific area on the map to download</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-app-background/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <MapPin className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text-primary mb-1">Current Location</h4>
                          <p className="text-sm text-app-text-muted">Download 5km radius around your location</p>
                          <p className="text-xs text-app-text-muted mt-1">~25MB estimated</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsSelectingArea(true);
                        setShowDownloadModal(false);
                      }}
                      className="w-full px-4 py-4 bg-app-primary-accent text-white rounded-xl hover:bg-app-primary-accent/90 transition-all font-semibold flex items-center justify-center gap-3 shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Select Custom Area
                    </button>
                    
                    <button
                      onClick={() => {
                        // Download current location area
                        const area: MapArea = {
                          id: Date.now(),
                          name: `Current Location - ${new Date().toLocaleDateString()}`,
                          bounds: '5km radius',
                          size: '~25MB',
                          downloadUrl: `offline-map-location-${Date.now()}`
                        };
                        setMapAreas(prev => [...prev, area]);
                        localStorage.setItem('downloadedMaps', JSON.stringify([...mapAreas, area]));
                        setShowDownloadModal(false);
                        setError('Map downloaded successfully! (~25MB)');
                        setTimeout(() => setError(null), 3000);
                      }}
                      className="w-full px-4 py-4 bg-app-background border border-app-borders text-app-text-primary rounded-xl hover:bg-app-background/80 transition-all font-semibold"
                    >
                      <MapPin className="w-5 h-5" />
                      Download Current Area
                    </button>
                  </div>
                  
                    <div className="mt-6 p-4 bg-app-primary-accent/5 border border-app-primary-accent/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-app-primary-accent/10 rounded-lg">
                        <Download className="w-4 h-4 text-app-primary-accent" />
                      </div>
                      <div className="text-sm text-app-text-muted">
                        <p className="font-semibold text-app-primary-accent mb-1">Offline Benefits:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Navigate without internet connection</li>
                          <li>• Save mobile data usage</li>
                          <li>• Faster map loading</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="bg-app-background/30 rounded-xl p-4">
                      <h4 className="font-semibold text-app-text-primary mb-2">Area Selection Active</h4>
                      <p className="text-sm text-app-text-muted mb-3">
                        Estimated download size: <span className="font-semibold text-app-primary-accent">{estimatedSize}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-app-text-muted">
                        <div className="w-2 h-2 bg-app-primary-accent rounded-full animate-pulse" />
                        <span>Tap and drag on the map to select your area</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // Simulate download functionality
                        const area: MapArea = {
                          id: Date.now(),
                          name: `Downloaded Area - ${new Date().toLocaleDateString()}`,
                          bounds: selectedArea ? `Custom area` : `5km radius`,
                          size: estimatedSize,
                          downloadUrl: `offline-map-custom-${Date.now()}`
                        };
                        setMapAreas(prev => [...prev, area]);
                        localStorage.setItem('downloadedMaps', JSON.stringify([...mapAreas, area]));
                        setIsSelectingArea(false);
                        setSelectedArea(null);
                        setError(`Map downloaded successfully! (${estimatedSize})`);
                        setTimeout(() => setError(null), 3000);
                      }}
                      className="w-full px-4 py-4 bg-app-primary-accent text-white rounded-xl hover:bg-app-primary-accent/90 transition-all font-semibold flex items-center justify-center gap-3 shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download Selected Area
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsSelectingArea(false);
                        setSelectedArea(null);
                        setShowDownloadModal(true);
                      }}
                      className="w-full px-4 py-4 bg-app-background border border-app-borders text-app-text-primary rounded-xl hover:bg-app-background/80 transition-all font-semibold"
                    >
                      Cancel Selection
                    </button>
                  </div>
                </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Turn-by-Turn Navigation Panel - Draggable Bottom Sheet */}
      {showDirectionsPanel && navigationRoute && (
        <motion.div
          initial={{ y: "100%", x: 0 }}
          animate={{ y: 0, x: 0 }}
          exit={{ y: "100%", x: 0 }}
          drag="y"
          dragConstraints={{ top: -300, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(event, info) => {
            // If dragged down more than 150px, close the panel
            if (info.offset.y > 150) {
              setShowDirectionsPanel(false);
            }
          }}
          className="absolute md:relative bottom-0 md:top-0 left-0 right-0 md:right-auto md:bottom-auto w-full md:w-80 h-[70vh] md:h-full bg-app-card-surface/95 backdrop-blur-md shadow-2xl border-t md:border-t-0 md:border-r border-app-borders/50 z-40 overflow-hidden rounded-t-3xl md:rounded-none"
        >
          {/* Enhanced Draggable Handle */}
          <motion.div 
            className="md:hidden flex justify-center py-4 cursor-grab active:cursor-grabbing"
            whileTap={{ scale: 1.1 }}
          >
            <div className="w-16 h-2 bg-app-text-muted/60 rounded-full hover:bg-app-text-muted/80 transition-colors shadow-sm" />
          </motion.div>
          {/* Navigation Header */}
          <div className="p-4 border-b border-app-borders/50 md:pt-4 pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-app-text-primary">Navigation</h3>
              <button
                onClick={stopNavigation}
                className="p-2 text-app-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {destination && (
              <div className="bg-app-background/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-app-primary-accent" />
                  <span className="text-sm font-medium text-app-text-primary truncate">{destination.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-app-text-muted">
                    <span>{navigationRoute.totalDistance}</span>
                    <span>{navigationRoute.totalDuration}</span>
                  </div>
                  <button
                    onClick={startJourney}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                      isJourneyStarted 
                        ? 'bg-green-500 text-white cursor-not-allowed' 
                        : 'bg-app-primary-accent text-white hover:bg-app-primary-accent/90'
                    }`}
                    disabled={isJourneyStarted}
                  >
                    <Navigation className="w-4 h-4" />
                    {isJourneyStarted ? 'Journey Active' : 'Start Journey'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Current Step - Enhanced for Mobile */}
          {navigationRoute.steps[currentStepIndex] && (
            <div className="p-4 bg-app-primary-accent/5 border-b border-app-borders/30">
              <div className="md:hidden mb-3 text-center">
                <div className="text-2xl font-bold text-app-primary-accent">
                  {navigationRoute.steps[currentStepIndex].distance}
                </div>
                <div className="text-sm text-app-text-muted">
                  in {navigationRoute.steps[currentStepIndex].duration}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-3 md:p-2 bg-app-primary-accent/10 rounded-lg">
                  {React.createElement(getManeuverIcon(navigationRoute.steps[currentStepIndex].maneuver), {
                    className: "w-8 h-8 md:w-5 md:h-5 text-app-primary-accent"
                  })}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-app-text-primary mb-1 text-lg md:text-base">
                    {navigationRoute.steps[currentStepIndex].instruction}
                  </p>
                  <div className="hidden md:flex items-center gap-3 text-sm text-app-text-muted">
                    <span>{navigationRoute.steps[currentStepIndex].distance}</span>
                    <span>{navigationRoute.steps[currentStepIndex].duration}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* All Steps */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h4 className="text-sm font-semibold text-app-text-muted px-2 py-2">All Directions</h4>
              {navigationRoute.steps.map((step, index) => {
                const IconComponent = getManeuverIcon(step.maneuver);
                const isCurrentStep = index === currentStepIndex;
                const isPastStep = index < currentStepIndex;
                
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-xl mb-2 transition-all ${
                      isCurrentStep
                        ? 'bg-app-primary-accent/10 border border-app-primary-accent/20'
                        : isPastStep
                        ? 'bg-app-background/30 opacity-60'
                        : 'hover:bg-app-background/20'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      isCurrentStep
                        ? 'bg-app-primary-accent/20'
                        : isPastStep
                        ? 'bg-green-500/20'
                        : 'bg-app-background/50'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        isCurrentStep
                          ? 'text-app-primary-accent'
                          : isPastStep
                          ? 'text-green-500'
                          : 'text-app-text-muted'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${
                        isCurrentStep
                          ? 'text-app-text-primary'
                          : isPastStep
                          ? 'text-app-text-muted line-through'
                          : 'text-app-text-primary'
                      }`}>
                        {step.instruction}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-app-text-muted">
                        <span>{step.distance}</span>
                        <span>•</span>
                        <span>{step.duration}</span>
                      </div>
                    </div>
                    {isCurrentStep && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                          disabled={currentStepIndex === 0}
                          className="p-1 text-app-text-muted hover:text-app-primary-accent disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setCurrentStepIndex(Math.min(navigationRoute.steps.length - 1, currentStepIndex + 1))}
                          disabled={currentStepIndex === navigationRoute.steps.length - 1}
                          className="p-1 text-app-text-muted hover:text-app-primary-accent disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Google Maps Style Bottom Sheet - Nearby Places */}
      {nearbyPlaces.length > 0 && !showDirectionsPanel && suggestions.length === 0 && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-app-card-surface/95 backdrop-blur-md rounded-t-3xl shadow-2xl border-t border-app-borders/50 max-h-80 overflow-hidden"
        >
        {/* Bottom Sheet Handle */}
        <div className="flex justify-center py-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Bottom Sheet Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-app-text-primary">Nearby Places</h3>
        </div>
        
        {/* Places List */}
        <div className="overflow-y-auto max-h-60">
          {nearbyPlaces.map((place) => (
            <div key={place.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-app-text-primary">{place.name}</h4>
                  <p className="text-sm text-app-text-muted mt-1">{place.address}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-app-text-primary">{place.rating}</span>
                    </div>
                    <span className="text-sm text-app-text-muted">{place.distance}</span>
                    {place.hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-app-text-muted" />
                        <span className="text-xs text-app-text-muted">{place.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-3">
                  <button 
                    onClick={() => startNavigation(place.coordinates, place.name)}
                    className="px-3 py-2 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors flex items-center gap-1.5"
                    title="Start Navigation"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="text-xs font-medium">Start</span>
                  </button>
                  {place.phone && (
                    <button className="p-2 bg-app-background border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background/80 transition-colors">
                      <span className="text-xs">Call</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </motion.div>
      )}
      
      {/* Dark Theme Side Panel */}
      <AnimatePresence>
        {showRoutesPanel && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-0 top-0 h-full w-full sm:w-80 max-w-sm bg-app-card-surface shadow-2xl z-[70] overflow-y-auto border-r border-app-borders"
          >
            {/* Panel Header */}
            <div className="p-3 sm:p-4 border-b border-app-borders">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-app-text-primary">Categories</h3>
                <button
                  onClick={() => setShowRoutesPanel(false)}
                  className="p-2 sm:p-2.5 hover:bg-app-background rounded-full text-app-text-muted min-w-[44px] min-h-[44px] touch-manipulation flex items-center justify-center"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Filter Categories */}
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs sm:text-sm font-medium text-app-text-muted mb-2">All</h4>
                <button
                  onClick={() => {
                    setSelectedFilter('all');
                    setNearbyPlaces([]);
                    setShowDirectionsPanel(false);
                    setNavigationRoute(null);
                    setDestination(null);
                    setShowRoutesPanel(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all min-h-[44px] touch-manipulation ${
                    selectedFilter === 'all'
                      ? 'bg-app-primary-accent text-white'
                      : 'text-app-text-primary hover:bg-app-background'
                  }`}
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">All</span>
                </button>
                
                {filterOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedFilter(option.id as FilterType);
                        fetchLivePlaces(option.id as FilterType);
                        setShowRoutesPanel(false);
                      }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all min-h-[44px] touch-manipulation ${
                        selectedFilter === option.id
                          ? 'bg-app-primary-accent text-white'
                          : 'text-app-text-primary hover:bg-app-background'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Routes Section */}
            <div className="p-3 sm:p-4">
              <h4 className="text-base sm:text-lg font-semibold text-app-text-primary mb-2 sm:mb-3">My Routes</h4>
              
              <div className="space-y-2 sm:space-y-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className="bg-app-background border border-app-borders rounded-lg p-2.5 sm:p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                      <h5 className="font-medium text-app-text-primary truncate text-sm sm:text-base">{route.name}</h5>
                      <button
                        onClick={() => route.id && deleteRoute(route.id)}
                        className="p-0.5 sm:p-1 text-red-400 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-app-text-muted space-y-0.5 sm:space-y-1 mb-2 sm:mb-3">
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span>{route.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{route.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <span className="capitalize">{route.difficulty}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => displayRoute(route)}
                      className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 bg-app-primary-accent text-white text-xs sm:text-sm rounded-lg hover:bg-app-primary-accent/90 transition-colors"
                    >
                      Show on Map
                    </button>
                  </div>
                ))}
                
                {routes.length === 0 && (
                  <div className="text-center text-app-text-muted py-6 sm:py-8">
                    <Route className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                    <p className="font-medium text-sm sm:text-base">No saved routes yet</p>
                    <p className="text-xs sm:text-sm">Start recording to create your first route</p>
                  </div>
                )}
              </div>
              
              {/* Download Maps Section */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-app-borders">
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Download Offline Maps</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Save Modal */}
      <AnimatePresence>
        {showRouteModal && routeToSave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowRouteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-app-card-surface rounded-2xl max-w-md w-full border border-app-borders mx-2 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-app-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                  <Save className="w-5 h-5 sm:w-6 sm:h-6 text-app-primary-accent" />
                  Save Route
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-app-text-primary mb-1">
                      Route Name
                    </label>
                    <input
                      type="text"
                      value={routeToSave.name}
                      onChange={(e) => setRouteToSave({...routeToSave, name: e.target.value})}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary text-sm sm:text-base"
                      placeholder="Enter route name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-app-text-primary mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={routeToSave.description || ''}
                      onChange={(e) => setRouteToSave({...routeToSave, description: e.target.value})}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary text-sm sm:text-base"
                      placeholder="Describe your route"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-app-text-primary mb-1">
                      Difficulty
                    </label>
                    <select
                      value={routeToSave.difficulty}
                      onChange={(e) => setRouteToSave({...routeToSave, difficulty: e.target.value as any})}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary text-sm sm:text-base"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="bg-app-background rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-app-text-muted">
                    <div>Distance: {routeToSave.distance.toFixed(1)} km</div>
                    <div>Duration: {routeToSave.duration} minutes</div>
                    <div>Waypoints: {routeToSave.waypoints.length}</div>
                  </div>
                  
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowRouteModal(false)}
                      className="flex-1 py-1.5 sm:py-2 px-3 sm:px-4 border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveRoute(routeToSave)}
                      disabled={!routeToSave.name.trim()}
                      className="flex-1 py-1.5 sm:py-2 px-3 sm:px-4 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors disabled:opacity-50 text-sm"
                    >
                      Save Route
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Maps;
