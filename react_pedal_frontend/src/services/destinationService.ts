interface DestinationExperience {
  id: string;
  title: string;
  description: string;
  category: 'adventure' | 'cultural' | 'nature' | 'food' | 'nightlife';
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  price: string;
  location: string;
  rating: number;
  reviews: number;
  images: string[];
  tags: string[];
  bestTime: string;
  included: string[];
  requirements: string[];
}

class DestinationService {
  private readonly baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  private readonly OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || '';
  private readonly GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '';
  private readonly EXCHANGE_API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY || '';
  private readonly AMADEUS_API_KEY = process.env.REACT_APP_AMADEUS_API_KEY || '';
  private readonly FOURSQUARE_API_KEY = process.env.REACT_APP_FOURSQUARE_API_KEY || '';
  private readonly TRAVEL_ADVISORIES_API = 'https://www.travel-advisory.info/api';
  
  // Cache for API responses
  private exchangeRateCache: { [key: string]: { rate: number; timestamp: number } } = {};
  private weatherCache: { [key: string]: { data: any; timestamp: number } } = {};
  private placesCache: { [key: string]: { data: any; timestamp: number } } = {};
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async getDestinations(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/destinations`);
      if (response.ok) {
        const data = await response.json();
        return data.destinations || [];
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
    
    // Fallback destinations
    return [
      'Paris, France',
      'Tokyo, Japan',
      'New York, USA',
      'London, UK',
      'Rome, Italy',
      'Barcelona, Spain',
      'Amsterdam, Netherlands',
      'Berlin, Germany',
      'Prague, Czech Republic',
      'Vienna, Austria',
      'Budapest, Hungary',
      'Lisbon, Portugal',
      'Dublin, Ireland',
      'Edinburgh, Scotland',
      'Copenhagen, Denmark',
      'Stockholm, Sweden',
      'Oslo, Norway',
      'Helsinki, Finland',
      'Reykjavik, Iceland',
      'Zurich, Switzerland',
      'Sydney, Australia',
      'Melbourne, Australia',
      'Auckland, New Zealand',
      'Vancouver, Canada',
      'Toronto, Canada',
      'Montreal, Canada',
      'San Francisco, USA',
      'Los Angeles, USA',
      'Chicago, USA',
      'Miami, USA',
      'Las Vegas, USA',
      'Seattle, USA',
      'Boston, USA',
      'Washington DC, USA',
      'Bangkok, Thailand',
      'Singapore',
      'Hong Kong',
      'Seoul, South Korea',
      'Mumbai, India',
      'Delhi, India',
      'Dubai, UAE',
      'Istanbul, Turkey',
      'Cairo, Egypt',
      'Cape Town, South Africa',
      'Rio de Janeiro, Brazil',
      'Buenos Aires, Argentina',
      'Lima, Peru',
      'Mexico City, Mexico',
      'Havana, Cuba',
      'Marrakech, Morocco',
      'Casablanca, Morocco'
    ];
  }

  async getPopularDestinations(): Promise<string[]> {
    const destinations = await this.getDestinations();
    return destinations.slice(0, 12);
  }

  async searchDestinations(query: string): Promise<string[]> {
    const destinations = await this.getDestinations();
    return destinations.filter(dest => 
      dest.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getDestinationDetails(destination: string) {
    try {
      const response = await fetch(`${this.baseUrl}/destinations/${encodeURIComponent(destination)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching destination details:', error);
    }
    
    // Return basic destination info as fallback
    return {
      name: destination,
      description: `Discover the beauty and culture of ${destination}`,
      highlights: ['Historic landmarks', 'Local cuisine', 'Cultural experiences'],
      bestTimeToVisit: 'Year-round',
      averageStay: '3-5 days'
    };
  }

  async getExperiences(destination?: string): Promise<DestinationExperience[]> {
    try {
      const url = destination 
        ? `${this.baseUrl}/destinations/experiences?destination=${encodeURIComponent(destination)}`
        : `${this.baseUrl}/destinations/experiences`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }

    const experiences = this.getLocalExperiences();
    return destination 
      ? experiences.filter(exp => exp.location.toLowerCase().includes(destination.toLowerCase()))
      : experiences;
  }

  async getCoordinates(destination: string): Promise<{ lat: number; lon: number } | null> {
    try {
      // First try OpenWeatherMap Geocoding API
      if (this.OPENWEATHER_API_KEY) {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${this.OPENWEATHER_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
          }
        }
      }

      // Fallback to Nominatim (OpenStreetMap)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      
      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
    
    return null;
  }

  async getDestinationInfo(destination: string) {
    try {
      const coordinates = await this.getCoordinates(destination);
      
      // Get all information in parallel
      const [
        weatherData,
        cultureInfo,
        transportationInfo,
        accommodationInfo,
        thingsToDoInfo,
        nearbyPlaces,
        bestTimeToVisit,
        costBreakdown,
        safetyInfo,
        travelRequirements,
        photographyInfo,
        connectivityInfo,
        wikipediaInfo,
        elevationData,
        terrainInfo,
        climateInfo
      ] = await Promise.all([
        this.getWeatherData(destination, coordinates || undefined),
        this.getCultureInfo(destination),
        this.getTransportationInfo(destination),
        this.getAccommodationInfo(destination),
        this.getThingsToDoInfo(destination),
        this.getNearbyPlacesFromOverpass(destination, coordinates || undefined),
        this.getBestTimeToVisit(destination, coordinates || undefined),
        this.getCostBreakdown(destination),
        this.getSafetyInfo(destination),
        this.getTravelRequirements(destination),
        this.getPhotographyInfo(destination),
        this.getConnectivityInfo(destination),
        this.getWikipediaInfo(destination),
        this.getElevationData(coordinates || undefined),
        this.getTerrainInfo(destination, coordinates || undefined),
        this.getClimateInfo(coordinates || undefined)
      ]);

      return {
        name: destination,
        description: wikipediaInfo.description || `Discover the beauty and culture of ${destination}`,
        history: wikipediaInfo.history || `Rich historical heritage of ${destination}`,
        geography: {
          location: destination,
          coordinates: coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}` : 'Coordinates not available',
          altitude: elevationData ? `${elevationData}m above sea level` : 'Elevation data not available',
          terrain: terrainInfo,
          climate: climateInfo
        },
        weather: weatherData,
        culture: cultureInfo,
        transportation: transportationInfo,
        accommodation: accommodationInfo,
        thingsToDo: thingsToDoInfo,
        nearbyPlaces,
        bestTimeToVisit,
        costBreakdown,
        safety: safetyInfo,
        travelRequirements,
        photography: photographyInfo,
        connectivity: connectivityInfo,
        elevation: elevationData,
        terrain: terrainInfo,
        climate: climateInfo,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting destination info:', error);
      throw new Error(`Failed to get information for ${destination}`);
    }
  }

  async getWeatherData(destination: string, coordinates?: { lat: number; lon: number }) {
    const cacheKey = `weather_${coordinates?.lat}_${coordinates?.lon}`;
    const cached = this.weatherCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    if (coordinates && this.OPENWEATHER_API_KEY) {
      try {
        // Get current weather and 5-day forecast in parallel
        const [currentResponse, forecastResponse, airQualityResponse] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.OPENWEATHER_API_KEY}`)
        ]);

        if (currentResponse.ok && forecastResponse.ok) {
          const [currentData, forecastData, airQualityData] = await Promise.all([
            currentResponse.json(),
            forecastResponse.json(),
            airQualityResponse.ok ? airQualityResponse.json() : null
          ]);

          // Process 7-day forecast (taking one reading per day)
          const dailyForecasts = this.processDailyForecast(forecastData.list);
          
          // Get air quality info
          const airQuality = airQualityData ? this.getAirQualityDescription(airQualityData.list[0].main.aqi) : 'Not available';
          
          // Calculate sunrise/sunset times in local timezone
          const sunrise = new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          const sunset = new Date(currentData.sys.sunset * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

          const weatherData = {
            current: `Current weather in ${destination}: ${this.formatWeatherCondition(currentData.weather[0].description)}`,
            temperature: `${Math.round(currentData.main.temp)}°C`,
            condition: `${this.formatWeatherCondition(currentData.weather[0].description)} (feels like ${Math.round(currentData.main.feels_like)}°C)`,
            humidity: `${currentData.main.humidity}%`,
            windSpeed: `${Math.round(currentData.wind?.speed * 3.6 || 0)} km/h ${this.getWindDirection(currentData.wind?.deg || 0)}`,
            pressure: `${currentData.main.pressure} hPa`,
            visibility: `${(currentData.visibility / 1000).toFixed(1)} km`,
            uvIndex: currentData.uvi ? `${currentData.uvi} (${this.getUVDescription(currentData.uvi)})` : 'Not available',
            airQuality,
            sunrise,
            sunset,
            forecast: dailyForecasts,
            alerts: currentData.alerts || [],
            lastUpdated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          };

          // Cache the result
          this.weatherCache[cacheKey] = { data: weatherData, timestamp: Date.now() };
          return weatherData;
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
    
    return this.getFallbackWeatherData(destination);
  }

  private formatWeatherCondition(condition: string): string {
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  }

  private getWindDirection(degrees: number): string {
    if (degrees >= 337.5 || degrees < 22.5) return 'N';
    if (degrees >= 22.5 && degrees < 67.5) return 'NE';
    if (degrees >= 67.5 && degrees < 112.5) return 'E';
    if (degrees >= 112.5 && degrees < 157.5) return 'SE';
    if (degrees >= 157.5 && degrees < 202.5) return 'S';
    if (degrees >= 202.5 && degrees < 247.5) return 'SW';
    if (degrees >= 247.5 && degrees < 292.5) return 'W';
    return 'NW';
  }

  private processDailyForecast(forecastList: any[]): any[] {
    const dailyData: { [key: string]: any } = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          temps: [],
          conditions: [],
          humidity: [],
          wind: []
        };
      }
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].conditions.push(item.weather[0].description);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].wind.push(item.wind?.speed || 0);
    });

    return Object.values(dailyData).slice(0, 7).map((day: any, index) => {
      const maxTemp = Math.round(Math.max(...day.temps));
      const minTemp = Math.round(Math.min(...day.temps));
      const avgHumidity = Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length);
      const avgWind = Math.round(day.wind.reduce((a: number, b: number) => a + b, 0) / day.wind.length * 3.6);
      const mostCommonCondition = this.getMostFrequent(day.conditions);
      
      return {
        day: index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        temp: `${maxTemp}°/${minTemp}°C`,
        condition: this.formatWeatherCondition(mostCommonCondition),
        humidity: `${avgHumidity}%`,
        wind: `${avgWind} km/h`
      };
    });
  }

  private getMostFrequent(arr: string[]): string {
    const frequency: { [key: string]: number } = {};
    arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  }

  private getAirQualityDescription(aqi: number): string {
    const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return `${levels[aqi - 1] || 'Unknown'} (AQI: ${aqi})`;
  }

  private getUVDescription(uv: number): string {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  }

  private getFallbackWeatherData(destination: string) {
    // Provide realistic fallback data based on Indian climate patterns
    const currentMonth = new Date().getMonth(); // 0-11
    const destLower = destination.toLowerCase();
    
    let temp = 25, condition = 'Pleasant', humidity = 65, wind = 8;
    
    // Adjust based on season and location
    if (currentMonth >= 3 && currentMonth <= 5) { // Summer
      temp = destLower.includes('rajasthan') || destLower.includes('delhi') ? 38 : 32;
      condition = 'Hot and sunny';
      humidity = 45;
      wind = 12;
    } else if (currentMonth >= 6 && currentMonth <= 9) { // Monsoon
      temp = 28;
      condition = 'Cloudy with possible showers';
      humidity = 85;
      wind = 15;
    } else if (currentMonth >= 10 && currentMonth <= 2) { // Winter
      temp = destLower.includes('himachal') || destLower.includes('kashmir') ? 8 : 22;
      condition = 'Clear and pleasant';
      humidity = 55;
      wind = 6;
    }
    
    return {
      current: `Current weather in ${destination}: ${condition}`,
      temperature: `${temp}°C`,
      condition: `${condition} (feels like ${temp + 2}°C)`,
      humidity: `${humidity}%`,
      windSpeed: `${wind} km/h`,
      pressure: '1013 hPa',
      visibility: '10.0 km',
      uvIndex: currentMonth >= 3 && currentMonth <= 5 ? '8 (Very High)' : '5 (Moderate)',
      airQuality: 'Moderate (AQI: 85)',
      sunrise: '06:30',
      sunset: '18:45',
      forecast: [
        { day: 'Today', temp: `${temp}°/${temp-5}°C`, condition, humidity: `${humidity}%`, wind: `${wind} km/h` },
        { day: 'Tomorrow', temp: `${temp+1}°/${temp-4}°C`, condition, humidity: `${humidity-5}%`, wind: `${wind+2} km/h` },
        { day: 'Day 3', temp: `${temp-1}°/${temp-6}°C`, condition: 'Partly cloudy', humidity: `${humidity}%`, wind: `${wind} km/h` },
        { day: 'Day 4', temp: `${temp+2}°/${temp-3}°C`, condition, humidity: `${humidity+5}%`, wind: `${wind-1} km/h` },
        { day: 'Day 5', temp: `${temp}°/${temp-5}°C`, condition: 'Clear', humidity: `${humidity-10}%`, wind: `${wind+3} km/h` }
      ],
      alerts: [],
      lastUpdated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
  }

  async getCultureInfo(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Indian cultural data
    const indianCulture: { [key: string]: any } = {
      'delhi': {
        language: ['Hindi', 'English', 'Punjabi', 'Urdu'],
        religion: ['Hinduism (80%)', 'Islam (13%)', 'Sikhism (4%)', 'Christianity', 'Buddhism'],
        festivals: ['Diwali (Oct/Nov)', 'Holi (Mar)', 'Dussehra (Sep/Oct)', 'Eid', 'Christmas', 'Karva Chauth'],
        localCustoms: ['Namaste greeting', 'Remove shoes in temples/homes', 'Respect for elders', 'Joint family traditions'],
        cuisine: ['Butter Chicken', 'Dal Makhani', 'Chole Bhature', 'Paranthas', 'Kebabs', 'Chaat', 'Kulfi']
      },
      'mumbai': {
        language: ['Marathi', 'Hindi', 'English', 'Gujarati'],
        religion: ['Hinduism (66%)', 'Islam (21%)', 'Buddhism (5%)', 'Christianity', 'Jainism'],
        festivals: ['Ganesh Chaturthi (Aug/Sep)', 'Navratri (Sep/Oct)', 'Gudi Padwa (Mar/Apr)', 'Diwali'],
        localCustoms: ['Fast-paced lifestyle', 'Local train etiquette', 'Street food culture', 'Bollywood influence'],
        cuisine: ['Vada Pav', 'Pav Bhaji', 'Bhel Puri', 'Misal Pav', 'Solkadhi', 'Modak', 'Puran Poli']
      },
      'goa': {
        language: ['Konkani', 'Portuguese', 'English', 'Hindi', 'Marathi'],
        religion: ['Hinduism (66%)', 'Christianity (25%)', 'Islam (8%)'],
        festivals: ['Carnival (Feb/Mar)', 'Shigmo (Mar)', 'Feast of St. Francis Xavier (Dec)', 'Diwali'],
        localCustoms: ['Siesta culture', 'Beach lifestyle', 'Portuguese influence', 'Feni drinking traditions'],
        cuisine: ['Fish Curry Rice', 'Vindaloo', 'Xacuti', 'Bebinca', 'Feni', 'Sorpotel', 'Prawn Balchão']
      },
      'kerala': {
        language: ['Malayalam', 'English', 'Tamil'],
        religion: ['Hinduism (55%)', 'Islam (27%)', 'Christianity (18%)'],
        festivals: ['Onam (Aug/Sep)', 'Vishu (Apr)', 'Thrissur Pooram (Apr/May)', 'Christmas', 'Eid'],
        localCustoms: ['Ayurveda traditions', 'Kathakali performances', 'Boat races', 'Matrilineal system'],
        cuisine: ['Sadhya', 'Appam & Stew', 'Karimeen Curry', 'Puttu', 'Payasam', 'Toddy', 'Banana Chips']
      },
      'rajasthan': {
        language: ['Hindi', 'Rajasthani', 'English'],
        religion: ['Hinduism (89%)', 'Islam (9%)', 'Jainism (1%)'],
        festivals: ['Teej (Jul/Aug)', 'Gangaur (Mar/Apr)', 'Pushkar Fair (Oct/Nov)', 'Desert Festival (Feb)'],
        localCustoms: ['Colorful turbans', 'Folk music & dance', 'Hospitality culture', 'Camel traditions'],
        cuisine: ['Dal Baati Churma', 'Laal Maas', 'Gatte ki Sabzi', 'Ker Sangri', 'Ghevar', 'Lassi']
      }
    };

    // Check for Indian destinations
    for (const [location, culture] of Object.entries(indianCulture)) {
      if (destLower.includes(location)) {
        return culture;
      }
    }

    // Default Indian culture
    return {
      language: ['Hindi', 'English', 'Local regional language'],
      religion: ['Hinduism (majority)', 'Islam', 'Christianity', 'Sikhism', 'Buddhism'],
      festivals: ['Diwali', 'Holi', 'Dussehra', 'Regional festivals'],
      localCustoms: ['Namaste greeting', 'Respect for elders', 'Joint family values', 'Diverse traditions'],
      cuisine: ['Regional specialties', 'Vegetarian options', 'Spiced curries', 'Traditional sweets']
    };
  }

  async getTransportationInfo(destination: string) {
    try {
      const coordinates = await this.getCoordinates(destination);
      const transportData = await this.getRealTransportationData(destination, coordinates || undefined);
      
      if (transportData) {
        return transportData;
      }
    } catch (error) {
      console.error('Error fetching transportation data:', error);
    }

    return this.getIndianTransportationInfo(destination);
  }

  private async getRealTransportationData(destination: string, coordinates?: { lat: number; lon: number }) {
    // This would integrate with Google Directions API, Indian Railways API, etc.
    // For now, return enhanced static data based on Indian destinations
    return null;
  }

  private getIndianTransportationInfo(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Major Indian destinations with specific transport info
    const indianDestinations: { [key: string]: any } = {
      'delhi': {
        howToReach: {
          byAir: 'Indira Gandhi International Airport (DEL) - 23km from city center. Terminal 1 (domestic), Terminal 3 (international). Airport Express Metro: ₹60, Taxi: ₹400-800, Bus: ₹50. Flight connections: Mumbai (₹4,000-12,000), Bangalore (₹5,000-15,000), Chennai (₹6,000-18,000)',
          byRoad: 'NH1 (to Punjab), NH2 (to Agra), NH8 (to Jaipur). Major bus terminals: ISBT Kashmere Gate (North India), ISBT Anand Vihar (East India), ISBT Sarai Kale Khan (South India). Delhi-Mumbai: ₹800-1,500, Delhi-Jaipur: ₹300-600, Delhi-Agra: ₹200-400',
          byTrain: 'Major stations: New Delhi (NDLS) - main hub, Old Delhi (DLI) - heritage trains, Hazrat Nizamuddin (NZM) - South India trains, Anand Vihar (ANVT) - East India. Pre-paid taxi: ₹200-400 to city center. Key routes: Rajdhani Express (Mumbai 16hrs ₹2,000-8,000), Shatabdi Express (Agra 2hrs ₹500-1,200)'
        },
        localTransport: [
          'Delhi Metro: 6 lines, ₹10-60, Rajiv Chowk & Connaught Place central hubs',
          'DTC Buses: ₹5-25, major routes via Connaught Place',
          'Auto-rickshaw: ₹30-150, use meter or negotiate',
          'Uber/Ola: ₹80-300, widely available'
        ],
        roadConditions: 'Excellent highways, heavy traffic 8-10 AM & 6-8 PM',
        fuelStations: true,
        parkingInfo: 'Metro stations: ₹20-40/day, Malls: ₹30-100/day, Connaught Place: ₹20/hour'
      },
      'mumbai': {
        howToReach: {
          byAir: 'Chhatrapati Shivaji Maharaj International Airport (BOM) - 30km from city. Terminal 1 (domestic), Terminal 2 (international). Airport bus: ₹85, Taxi: ₹600-1200, Local train to Andheri: ₹10. Flight connections: Delhi (₹4,000-12,000), Bangalore (₹3,500-10,000), Goa (₹3,000-8,000)',
          byRoad: 'Mumbai-Pune Expressway (NH48), Mumbai-Ahmedabad Highway (NH8). Major bus terminals: Mumbai Central Bus Depot, Borivali Bus Station, Thane Bus Station. Routes: Pune (₹300-500), Goa (₹800-1,200), Nashik (₹400-600)',
          byTrain: 'Major stations: Chhatrapati Shivaji Maharaj Terminus/CST (CSMT) - heritage terminus, Mumbai Central (BCT) - Western Railway, Lokmanya Tilak Terminus (LTT) - long distance, Dadar (DR) - central hub. Pre-paid taxi: ₹300-600. Key routes: Rajdhani Express (Delhi 16hrs ₹2,500-9,000), Konkan Railway (Goa 12hrs ₹400-1,500)'
        },
        localTransport: [
          'Local trains: Western, Central, Harbour lines, ₹5-15, Churchgate-Virar, CST-Kalyan',
          'BEST buses: ₹8-45, AC buses ₹15-50, covers entire city',
          'Auto-rickshaw: ₹25-200, available in suburbs only',
          'Uber/Ola: ₹100-400, surge pricing during peak hours'
        ],
        roadConditions: 'Good highways, severe waterlogging during monsoon',
        fuelStations: true,
        parkingInfo: 'Railway stations: ₹10-30/day, Malls: ₹50-150/day, Street parking limited'
      },
      'bangalore': {
        howToReach: {
          byAir: 'Kempegowda International Airport (BLR) - 40km from city center. Terminal 1 (domestic), Terminal 2 (international). KIAL bus: ₹250, Taxi: ₹800-1,500, Uber: ₹600-1,200. Flight connections: Delhi (₹5,000-15,000), Mumbai (₹3,500-10,000), Chennai (₹3,000-8,000), Hyderabad (₹2,500-7,000)',
          byRoad: 'NH44 (Chennai), NH48 (Mumbai), NH75 (Mangalore). Major bus terminals: Kempegowda Bus Station (Majestic), Shantinagar Bus Station, Electronic City Bus Station. Routes: Chennai (₹400-800), Hyderabad (₹600-1,000), Mysore (₹200-400), Coorg (₹300-600)',
          byTrain: 'Major stations: Bangalore City/Krantiveera Sangolli Rayanna (SBC) - main terminus, Yeshwantpur (YPR) - North India trains, Bangalore East (BNC), Whitefield (WFD). Pre-paid taxi: ₹200-500. Key routes: Rajdhani Express (Delhi 34hrs ₹3,000-12,000), Shatabdi Express (Chennai 5hrs ₹600-1,800), Mysore Express (3hrs ₹100-400)'
        },
        localTransport: ['Namma Metro (₹10-50)', 'BMTC buses (₹5-30)', 'Auto-rickshaw (₹30-180)', 'Uber/Ola (₹80-350)'],
        roadConditions: 'Good IT corridor roads, traffic congestion in peak hours',
        fuelStations: true,
        parkingInfo: 'IT parks: ₹20-50/day, Commercial areas: ₹30-100/day'
      },
      'goa': {
        howToReach: {
          byAir: 'Goa International Airport/Dabolim (GOI) - 29km from Panaji, 4km from Vasco. Single terminal for domestic/international. Pre-paid taxi: ₹700-1000, KTC bus: ₹50, to Panaji/Margao. Flight connections: Mumbai (₹3,000-8,000), Delhi (₹6,000-15,000), Bangalore (₹3,000-8,000)',
          byRoad: 'NH66 (coastal highway), NH4A (inland). Major bus terminals: Kadamba Bus Stand Panaji, Margao Bus Stand, Mapusa Bus Stand. Routes: Mumbai (₹800-1,200), Pune (₹600-1,000), Bangalore (₹1,000-1,800)',
          byTrain: 'Major stations: Margao/Madgaon (MAO) - main junction 2km from city, Vasco da Gama (VSG) - 1km from port, Thivim (THVM) - North Goa 12km from Mapusa. Key routes: Konkan Railway Mumbai (12hrs ₹400-1,500), Rajdhani Express Delhi (26hrs ₹2,000-8,000)'
        },
        localTransport: [
          'Rental scooters: ₹300-500/day, license required, helmet mandatory',
          'Kadamba buses: ₹10-50, connect all major beaches and towns',
          'Taxis: ₹500-1,500/day, pre-paid counters at airport/stations',
          'Auto-rickshaw: ₹50-300, negotiate fare, limited in beach areas'
        ],
        roadConditions: 'Good coastal roads, narrow village roads, monsoon flooding possible',
        fuelStations: true,
        parkingInfo: 'Beach areas: ₹20-100/day, Hotels: usually free, Panaji: ₹10-30/hour'
      },
      'jaipur': {
        howToReach: {
          byAir: 'Jaipur International Airport (JAI) - 13km from city center. Terminal building for domestic/international. Pre-paid taxi: ₹300-500, Bus: ₹50. Flight connections: Delhi (₹3,000-8,000), Mumbai (₹4,000-12,000), Bangalore (₹5,000-15,000)',
          byRoad: 'NH8 (Delhi), NH11 (Agra), NH12 (Jodhpur). Major bus terminals: Sindhi Camp Bus Stand, Narayan Singh Circle. Routes: Delhi (₹300-600), Agra (₹200-400), Udaipur (₹400-800)',
          byTrain: 'Major stations: Jaipur Junction (JP) - main station, Gandhinagar (GDG), Durgapura (DPA). Pre-paid taxi: ₹150-300. Key routes: Shatabdi Express Delhi (4.5hrs ₹700-1,500), Pink City Express (₹300-800)'
        },
        localTransport: ['Jaipur Metro (₹5-25)', 'JCTSL buses (₹5-20)', 'Auto-rickshaw (₹30-150)', 'Uber/Ola (₹80-300)'],
        roadConditions: 'Good highways, narrow old city roads',
        fuelStations: true,
        parkingInfo: 'Tourist spots: ₹20-50/day, Hotels: usually free, City Palace area: ₹10-30/hour'
      },
      'kerala': {
        howToReach: {
          byAir: 'Cochin International Airport (COK) - 30km from Kochi, Trivandrum International (TRV) - 6km from city, Calicut International (CCJ) - 28km from Kozhikode. Flight connections: Delhi (₹6,000-18,000), Mumbai (₹4,000-12,000), Bangalore (₹3,000-8,000)',
          byRoad: 'NH66 (coastal), NH544 (Tamil Nadu). Major terminals: KSRTC Ernakulam, Trivandrum Central Bus Station. Routes: Bangalore (₹600-1,200), Chennai (₹500-1,000), Coimbatore (₹300-600)',
          byTrain: 'Major stations: Ernakulam Junction (ERS), Trivandrum Central (TVC), Kozhikode (CLT), Thrissur (TCR). Key routes: Rajdhani Express Delhi (42hrs ₹3,500-15,000), Island Express Bangalore (11hrs ₹400-1,200)'
        },
        localTransport: ['KSRTC buses (₹10-80)', 'Auto-rickshaw (₹30-200)', 'Taxi/Uber (₹100-500)', 'Houseboats Alleppey (₹3,000-15,000/day)'],
        roadConditions: 'Good coastal highways, narrow hill roads in Western Ghats',
        fuelStations: true,
        parkingInfo: 'Beach resorts: usually free, Backwater areas: ₹50-200/day, Cities: ₹20-100/day'
      }
    };

    // Check if destination matches any Indian city
    for (const [city, info] of Object.entries(indianDestinations)) {
      if (destLower.includes(city)) {
        return info;
      }
    }

    // Default Indian transportation info
    return {
      howToReach: {
        byAir: `Nearest domestic airport - ₹5,000-20,000 from major cities. Pre-paid taxi/bus to city center`,
        byRoad: `State/National highways, main bus stand in city center - ₹500-1,500 by bus from major cities`,
        byTrain: `Railway station connected to major cities - ₹300-2,000 depending on distance and class`
      },
      localTransport: [
        'Local buses: ₹5-30, connect major areas and tourist spots',
        'Auto-rickshaw: ₹20-150, negotiate fare or use meter',
        'Taxi/Cab services: ₹100-500, app-based cabs available',
        'Rental vehicles: ₹1,000-3,000/day, driving license required'
      ],
      roadConditions: 'Generally good state highways, avoid travel during heavy monsoon',
      fuelStations: true,
      parkingInfo: 'Railway stations: ₹10-30/day, Tourist areas: ₹20-100/day, Hotels: usually free'
    };
  }

  async getAccommodationInfo(destination: string) {
    return {
      types: ['Hotels', 'Hostels', 'Guesthouses', 'Vacation Rentals', 'Resorts'],
      priceRange: '$50-300 per night depending on location and season',
      recommendations: [
        'Book in advance during peak season',
        'Consider location proximity to attractions',
        'Check for local hospitality standards'
      ],
      bookingTips: [
        'Compare prices across multiple platforms',
        'Read recent reviews from travelers',
        'Check cancellation policies',
        'Verify amenities and services included'
      ]
    };
  }

  async getThingsToDoInfo(destination: string) {
    try {
      const attractionsData = await this.getRealAttractionsData(destination);
      if (attractionsData) {
        return attractionsData;
      }
    } catch (error) {
      console.error('Error fetching attractions data:', error);
    }

    return this.getDestinationSpecificActivities(destination);
  }

  private async getRealAttractionsData(destination: string) {
    // This would integrate with Google Places API, TripAdvisor API, etc.
    return null;
  }

  private getDestinationSpecificActivities(destination: string) {
    const destinationLower = destination.toLowerCase();
    
    // Comprehensive India-specific activities
    const indianActivities: { [key: string]: any } = {
      'delhi': {
        cultural: [
          'Red Fort (₹35) - UNESCO World Heritage Site, Mughal architecture masterpiece, Light & Sound show (₹80)',
          'India Gate (Free) - War memorial, evening illumination, perfect for picnics and walks',
          'Qutub Minar (₹30) - 73m tall victory tower, Indo-Islamic architecture, UNESCO site',
          'Humayun\'s Tomb (₹30) - Precursor to Taj Mahal, beautiful Mughal gardens, UNESCO site',
          'Lotus Temple (Free) - Baháʼí House of Worship, stunning lotus-shaped architecture',
          'Akshardham Temple (₹170) - Modern Hindu temple complex, cultural boat ride, exhibitions',
          'Jama Masjid (Free) - India\'s largest mosque, climb minaret (₹100), Old Delhi views'
        ],
        food: [
          'Chandni Chowk food walk (₹100-300) - Paranthe Wali Gali, Karim\'s kebabs, Ghantewala sweets',
          'Khan Market (₹500-1500) - Upscale cafes, Big Chill, Cafe Turtle, international cuisine',
          'Connaught Place (₹800-2000) - Central Delhi dining, Wenger\'s bakery, United Coffee House',
          'Lajpat Nagar Market (₹200-600) - South Indian food, chaat, local Delhi favorites',
          'Dilli Haat (₹100-500) - Crafts bazaar with regional Indian cuisine from all states'
        ],
        adventure: [
          'Hot air balloon rides (₹12,000-18,000) - Aerial views of Delhi, early morning flights',
          'Yamuna Sports Complex (₹100-500) - Boating, water sports, adventure activities',
          'Adventure Island (₹800-1,200) - Amusement park, roller coasters, water rides',
          'Sanjay Van (Free) - Nature trails, bird watching, cycling paths in South Delhi',
          'Rock climbing at Indian Mountaineering Foundation (₹500-1,000)'
        ],
        nature: [
          'Lodhi Gardens (Free) - 90 acres, jogging track, historical tombs, rose garden',
          'Deer Park (Free) - Hauz Khas, spotted deer, lake views, perfect for morning walks',
          'Garden of Five Senses (₹35) - Themed garden, food court, cultural events venue',
          'Sunder Nursery (₹35) - 90-acre park, Mughal-era monuments, butterfly conservatory',
          'Raj Ghat (Free) - Mahatma Gandhi memorial, peaceful gardens, eternal flame'
        ],
        photography: [
          'India Gate golden hour - Best at sunrise/sunset, Republic Day parade route',
          'Red Fort details - Intricate Mughal carvings, Diwan-i-Khas, peacock throne replica',
          'Chandni Chowk street life - Rickshaw rides, spice markets, narrow lanes',
          'Lotus Temple symmetry - 27 marble petals, reflection pools, architectural marvel',
          'Humayun\'s Tomb gardens - Charbagh layout, tomb reflections, Mughal geometry'
        ]
      },
      'mumbai': {
        cultural: ['Gateway of India (Free)', 'Chhatrapati Shivaji Terminus (Free)', 'Elephanta Caves (₹40 + ₹15 ferry)', 'Chhatrapati Shivaji Museum (₹70)', 'Mani Bhavan Gandhi Museum (₹5)', 'Crawford Market', 'Dhobi Ghat'],
        food: ['Vada Pav at local stalls (₹15-30)', 'Mohammed Ali Road food tour (₹500-1000)', 'Trishna seafood (₹2000-4000)', 'Leopold Cafe (₹800-1500)', 'Britannia & Co. Parsi cuisine'],
        adventure: ['Bollywood studio tours (₹1500-3000)', 'Elephanta Island ferry (₹15)', 'Slum tours (₹1000-2000)', 'Parasailing at Juhu Beach (₹2000-3000)', 'Scuba diving at Malvan'],
        nature: ['Marine Drive promenade (Free)', 'Hanging Gardens (Free)', 'Sanjay Gandhi National Park (₹46)', 'Juhu Beach (Free)', 'Worli Sea Face'],
        photography: ['Marine Drive at night', 'Dhobi Ghat laundry', 'Gateway of India', 'Worli Sea Link', 'Chhatrapati Shivaji Terminus architecture']
      },
      'goa': {
        cultural: ['Basilica of Bom Jesus (Free)', 'Se Cathedral (Free)', 'Fort Aguada (Free)', 'Chapora Fort (Free)', 'Goa State Museum (₹10)', 'Ancestral Goa (₹25)', 'Shantadurga Temple'],
        food: ['Beach shack seafood (₹500-1500)', 'Goan fish curry rice (₹200-500)', 'Bebinca dessert', 'Feni tasting (₹200-500)', 'Saturday Night Market food'],
        adventure: ['Water sports at Baga (₹500-3000)', 'Scuba diving (₹3000-5000)', 'Parasailing (₹800-1500)', 'Jet skiing (₹800-1200)', 'Dolphin watching (₹500-800)', 'Dudhsagar Falls trek (₹1500-2500)'],
        nature: ['Dudhsagar Waterfalls (₹30)', 'Bhagwan Mahavir Sanctuary (₹25)', 'Salim Ali Bird Sanctuary (₹25)', 'Cotigao Wildlife Sanctuary (₹25)', 'Butterfly Conservatory (₹30)'],
        photography: ['Sunset at Anjuna Beach', 'Portuguese architecture in Panaji', 'Dudhsagar Falls', 'Chapora Fort views', 'Colorful houses in Fontainhas']
      },
      'kerala': {
        cultural: ['Mattancherry Palace (₹15)', 'Jewish Synagogue (₹5)', 'Padmanabhapuram Palace (₹25)', 'Hill Palace Museum (₹20)', 'Folklore Museum (₹75)', 'Kathakali performances (₹150-500)'],
        food: ['Kerala Sadhya on banana leaf (₹150-400)', 'Appam and stew (₹100-250)', 'Karimeen fish curry (₹300-600)', 'Toddy shops (₹100-300)', 'Spice plantation tours (₹200-500)'],
        adventure: ['Houseboat stays (₹4000-15000/night)', 'Backwater cruises (₹500-2000)', 'Munnar trekking (₹1000-3000)', 'Thekkady wildlife safari (₹300-800)', 'Bamboo rafting (₹500-1000)'],
        nature: ['Periyar Wildlife Sanctuary (₹300)', 'Eravikulam National Park (₹125)', 'Kumarakom Bird Sanctuary (₹40)', 'Athirapally Falls (Free)', 'Tea plantations in Munnar'],
        photography: ['Backwater reflections', 'Tea plantation landscapes', 'Chinese fishing nets at Kochi', 'Munnar hill stations', 'Traditional houseboats']
      },
      'rajasthan': {
        cultural: ['Amber Fort (₹100)', 'City Palace Jaipur (₹300)', 'Hawa Mahal (₹50)', 'Mehrangarh Fort (₹100)', 'Lake Palace Udaipur', 'Jaisalmer Fort (₹30)', 'Pushkar Temple (Free)'],
        food: ['Dal Baati Churma (₹200-500)', 'Laal Maas (₹400-800)', 'Ghevar sweets (₹100-300)', 'Rajasthani thali (₹300-800)', 'Camel milk products'],
        adventure: ['Camel safari in Thar Desert (₹2000-5000)', 'Hot air balloon rides (₹10000-15000)', 'Desert camping (₹3000-8000)', 'Zip-lining at Mehrangarh (₹500)', 'Heritage walks'],
        nature: ['Ranthambore National Park (₹1500-3000)', 'Keoladeo National Park (₹200)', 'Desert National Park (₹200)', 'Mount Abu hill station', 'Sambhar Salt Lake'],
        photography: ['Jaisalmer golden fort', 'Rajasthani architecture', 'Desert landscapes', 'Colorful turbans and saris', 'Camel silhouettes at sunset']
      }
    };

    // Check for specific destinations
    for (const [location, activities] of Object.entries(indianActivities)) {
      if (destinationLower.includes(location)) {
        return activities;
      }
    }

    // Check for broader regions
    if (destinationLower.includes('himachal') || destinationLower.includes('shimla') || destinationLower.includes('manali')) {
      return {
        cultural: ['Viceregal Lodge (₹30)', 'Hadimba Temple (Free)', 'Manu Temple (Free)', 'Christ Church (Free)', 'Tibetan monasteries'],
        food: ['Himachali Dham (₹200-500)', 'Siddu (₹50-100)', 'Trout fish (₹400-800)', 'Apple products', 'Tibetan momos (₹100-200)'],
        adventure: ['Trekking (₹1000-5000/day)', 'Paragliding (₹2000-4000)', 'River rafting (₹800-2000)', 'Skiing in winter (₹1500-3000)', 'Mountain biking'],
        nature: ['Great Himalayan National Park (₹200)', 'Rohtang Pass (₹50)', 'Solang Valley', 'Pin Valley National Park (₹200)', 'Apple orchards'],
        photography: ['Snow-capped mountains', 'Apple orchards', 'Tibetan architecture', 'Valley landscapes', 'Adventure sports action']
      };
    }

    // Default enhanced activities for other Indian destinations
    return {
      adventure: ['Local trekking trails (₹500-2000)', 'River activities (₹300-1000)', 'Cycling tours (₹800-1500)', 'Wildlife safaris (₹1000-3000)', 'Adventure sports'],
      cultural: ['Local museums (₹20-100)', 'Historical monuments (₹25-100)', 'Art galleries (₹50-200)', 'Cultural performances (₹200-1000)', 'Heritage walks (₹500-1500)'],
      nature: ['National parks (₹100-500)', 'Wildlife viewing (₹500-2000)', 'Scenic viewpoints (Free-₹50)', 'Nature walks (₹200-800)', 'Botanical gardens (₹20-100)'],
      photography: ['Sunrise/sunset spots', 'Local architecture', 'Street photography', 'Landscape views', 'Cultural portraits'],
      food: ['Local restaurants (₹200-1000)', 'Street food tours (₹500-1500)', 'Cooking classes (₹1000-3000)', 'Food markets (₹100-500)', 'Regional specialties']
    };
  }

  async getBestTimeToVisit(destination: string, coordinates?: { lat: number; lon: number }) {
    try {
      const seasonalData = await this.getSeasonalRecommendations(destination, coordinates);
      if (seasonalData) {
        return seasonalData;
      }
    } catch (error) {
      console.error('Error fetching seasonal data:', error);
    }

    return this.getIndianSeasonalRecommendations(destination);
  }

  private async getSeasonalRecommendations(destination: string, coordinates?: { lat: number; lon: number }) {
    // This would integrate with climate APIs for historical weather patterns
    return null;
  }

  private getIndianSeasonalRecommendations(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Seasonal data for Indian destinations
    const indianSeasons: { [key: string]: any } = {
      'delhi': {
        peak: 'October to March - Pleasant weather (15-25°C), ideal for sightseeing',
        offPeak: 'July to September - Monsoon season, fewer crowds but humid',
        avoid: 'April to June - Extreme heat (35-45°C), very uncomfortable for outdoor activities',
        weatherDetails: 'Winter (Dec-Feb): 5-20°C, Spring (Mar-Apr): 20-30°C, Summer (May-Jun): 30-45°C, Monsoon (Jul-Sep): 25-35°C with heavy rains'
      },
      'mumbai': {
        peak: 'November to February - Cool and dry (20-30°C), perfect weather',
        offPeak: 'March to May - Hot but manageable (25-35°C), good for indoor activities',
        avoid: 'June to September - Heavy monsoon, flooding possible, transport disruptions',
        weatherDetails: 'Winter (Nov-Feb): 20-30°C, Summer (Mar-May): 25-35°C, Monsoon (Jun-Sep): 24-30°C with 2000mm+ rainfall'
      },
      'goa': {
        peak: 'November to February - Perfect beach weather (20-32°C), dry and sunny',
        offPeak: 'March to May - Hot but good for water activities (25-35°C)',
        avoid: 'June to September - Heavy monsoon, beaches unsafe, many shacks closed',
        weatherDetails: 'Peak season: Clear skies, calm seas. Monsoon: 3000mm+ rainfall, rough seas, many establishments closed'
      },
      'kerala': {
        peak: 'October to March - Pleasant weather (23-32°C), ideal for backwaters and hill stations',
        offPeak: 'April to May - Hot but good for hill stations (25-35°C)',
        avoid: 'June to September - Heavy monsoon, though beautiful for nature lovers',
        weatherDetails: 'Monsoon brings lush greenery but heavy rains. Hill stations like Munnar are cooler year-round (15-25°C)'
      },
      'rajasthan': {
        peak: 'October to March - Pleasant weather (10-30°C), ideal for desert and palace visits',
        offPeak: 'April to June - Very hot (30-45°C) but fewer crowds, early morning/evening activities only',
        avoid: 'July to September - Monsoon in some areas, extreme heat in desert regions',
        weatherDetails: 'Desert areas: Extreme temperature variations. Hill stations like Mount Abu are cooler. Winter nights can be cold (5-15°C)'
      },
      'himachal': {
        peak: 'March to June - Pleasant weather (15-25°C), snow melted, all roads open',
        offPeak: 'October to February - Cold but beautiful (0-15°C), snow activities, some roads closed',
        avoid: 'July to September - Heavy monsoon, landslides possible, limited visibility',
        weatherDetails: 'High altitude areas remain cold year-round. Shimla, Manali accessible most of year. Spiti, Ladakh only May-September'
      },
      'uttarakhand': {
        peak: 'April to June & September to November - Pleasant weather (15-25°C), clear mountain views',
        offPeak: 'December to March - Cold (5-15°C) but clear skies, some high altitude areas inaccessible',
        avoid: 'July to August - Heavy monsoon, landslides, trekking dangerous',
        weatherDetails: 'Char Dham Yatra: May-October. High altitude treks: May-June, September-October. Valley areas milder year-round'
      }
    };

    // Check for specific Indian regions
    for (const [region, seasons] of Object.entries(indianSeasons)) {
      if (destLower.includes(region)) {
        return seasons;
      }
    }

    // Default based on general Indian climate patterns
    if (destLower.includes('north') || destLower.includes('punjab') || destLower.includes('haryana')) {
      return indianSeasons['delhi'];
    }
    if (destLower.includes('south') || destLower.includes('tamil') || destLower.includes('karnataka') || destLower.includes('andhra')) {
      return {
        peak: 'November to February - Pleasant weather (20-30°C), ideal for sightseeing',
        offPeak: 'March to May - Hot (25-35°C) but manageable with AC',
        avoid: 'June to September - Monsoon season, heavy rains in coastal areas',
        weatherDetails: 'South India has tropical climate. Coastal areas receive heavy monsoon. Hill stations like Ooty, Kodaikanal are cooler year-round'
      };
    }
    if (destLower.includes('west') || destLower.includes('gujarat') || destLower.includes('maharashtra')) {
      return indianSeasons['mumbai'];
    }
    if (destLower.includes('east') || destLower.includes('bengal') || destLower.includes('odisha') || destLower.includes('assam')) {
      return {
        peak: 'October to March - Pleasant weather (15-28°C), ideal for sightseeing',
        offPeak: 'April to June - Hot and humid (25-38°C)',
        avoid: 'July to September - Heavy monsoon, flooding possible in low-lying areas',
        weatherDetails: 'Eastern India receives heavy monsoon. Darjeeling and hill stations are pleasant year-round. Cyclones possible in coastal areas Oct-Nov'
      };
    }

    // Generic Indian destination
    return {
      peak: 'October to March - Pleasant weather, ideal for most activities',
      offPeak: 'April to June - Hot weather, early morning/evening activities recommended',
      avoid: 'July to September - Monsoon season, heavy rains possible',
      weatherDetails: 'India has tropical monsoon climate. Best travel weather is during winter months. Summer can be extremely hot in plains'
    };
  }

  async getCostBreakdown(destination: string) {
    try {
      const exchangeRate = await this.getUSDToINRRate();
      const costData = await this.getRealCostData(destination, exchangeRate);
      
      if (costData) {
        return costData;
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
    }

    return this.getIndianCostBreakdown(destination);
  }

  private async getUSDToINRRate(): Promise<number> {
    const cacheKey = 'USD_INR';
    const cached = this.exchangeRateCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hour cache
      return cached.rate;
    }

    try {
      // Try multiple exchange rate APIs
      const apis = [
        'https://api.exchangerate-api.com/v4/latest/USD',
        'https://api.fixer.io/latest?base=USD&access_key=' + this.EXCHANGE_API_KEY,
        'https://open.er-api.com/v6/latest/USD'
      ];

      for (const api of apis) {
        try {
          const response = await fetch(api);
          if (response.ok) {
            const data = await response.json();
            const rate = data.rates?.INR || data.conversion_rates?.INR;
            if (rate) {
              this.exchangeRateCache[cacheKey] = { rate, timestamp: Date.now() };
              return rate;
            }
          }
        } catch (error) {
          console.warn('Exchange rate API failed:', api);
          continue;
        }
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }

    // Fallback rate (approximate)
    return 83;
  }

  private async getRealCostData(destination: string, exchangeRate: number) {
    // This would integrate with booking APIs, cost of living APIs, etc.
    return null;
  }

  private getIndianCostBreakdown(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Detailed costs for different destination types with seasonal adjustments
    const currentMonth = new Date().getMonth();
    const isPeakSeason = (currentMonth >= 10 && currentMonth <= 2) || (currentMonth >= 3 && currentMonth <= 5);
    const seasonMultiplier = isPeakSeason ? 1.3 : 1.0;
    
    let accommodationRange = { budget: 800, mid: 2500, luxury: 8000 };
    let foodCosts = { street: 50, restaurant: 300, fine: 1200 };
    let transportCosts = { local: 20, intercity: 500, flight: 4000, taxi: 15, auto: 12 };
    let activityCosts = { free: 0, paid: 200, premium: 1500, guide: 500 };
    let shoppingCosts = { souvenirs: 100, handicrafts: 500, textiles: 1000 };
    
    // Metro cities - higher costs
    if (destLower.includes('mumbai') || destLower.includes('delhi') || destLower.includes('bangalore') || destLower.includes('chennai') || destLower.includes('kolkata') || destLower.includes('hyderabad')) {
      accommodationRange = { budget: 1200, mid: 3500, luxury: 15000 };
      foodCosts = { street: 80, restaurant: 450, fine: 2500 };
      transportCosts = { local: 30, intercity: 800, flight: 5000, taxi: 25, auto: 20 };
      activityCosts = { free: 0, paid: 300, premium: 2000, guide: 800 };
      shoppingCosts = { souvenirs: 150, handicrafts: 800, textiles: 1500 };
    }
    // Tourist destinations - premium pricing
    else if (destLower.includes('goa') || destLower.includes('kerala') || destLower.includes('rajasthan') || destLower.includes('kashmir') || destLower.includes('himachal')) {
      accommodationRange = { budget: 1000, mid: 3000, luxury: 12000 };
      foodCosts = { street: 60, restaurant: 350, fine: 1800 };
      transportCosts = { local: 25, intercity: 600, flight: 4500, taxi: 20, auto: 15 };
      activityCosts = { free: 0, paid: 300, premium: 2500, guide: 600 };
      shoppingCosts = { souvenirs: 120, handicrafts: 600, textiles: 1200 };
    }
    // Hill stations and adventure destinations
    else if (destLower.includes('manali') || destLower.includes('shimla') || destLower.includes('darjeeling') || destLower.includes('ooty') || destLower.includes('mussoorie')) {
      accommodationRange = { budget: 900, mid: 2800, luxury: 10000 };
      foodCosts = { street: 70, restaurant: 400, fine: 1500 };
      transportCosts = { local: 30, intercity: 700, flight: 5500, taxi: 30, auto: 25 };
      activityCosts = { free: 0, paid: 400, premium: 3000, guide: 700 };
      shoppingCosts = { souvenirs: 100, handicrafts: 400, textiles: 800 };
    }
    
    // Apply seasonal pricing
    Object.keys(accommodationRange).forEach(key => {
      accommodationRange[key as keyof typeof accommodationRange] = Math.round(accommodationRange[key as keyof typeof accommodationRange] * seasonMultiplier);
    });
    
    const dailyBudgetCalc = {
      budget: accommodationRange.budget + (foodCosts.street * 3) + (transportCosts.local * 3) + activityCosts.paid + shoppingCosts.souvenirs,
      midRange: accommodationRange.mid + (foodCosts.restaurant * 2) + (transportCosts.taxi * 2) + activityCosts.premium + shoppingCosts.handicrafts,
      luxury: accommodationRange.luxury + (foodCosts.fine * 2) + (transportCosts.taxi * 4) + (activityCosts.premium * 2) + shoppingCosts.textiles
    };
    
    return {
      currency: 'INR',
      exchangeRate: 'USD 1 = ₹83.20 (approx)',
      seasonalNote: isPeakSeason ? 'Peak season rates (30% higher)' : 'Off-season rates (better deals available)',
      dailyBudget: {
        budget: `₹${dailyBudgetCalc.budget} ($${Math.round(dailyBudgetCalc.budget / 83.2)})`,
        midRange: `₹${dailyBudgetCalc.midRange} ($${Math.round(dailyBudgetCalc.midRange / 83.2)})`,
        luxury: `₹${dailyBudgetCalc.luxury}+ ($${Math.round(dailyBudgetCalc.luxury / 83.2)}+)`
      },
      breakdown: {
        accommodation: {
          budget: `₹${accommodationRange.budget} - ₹${accommodationRange.budget + 500} (Hostels, budget hotels)`,
          midRange: `₹${accommodationRange.mid} - ₹${accommodationRange.mid + 1500} (3-star hotels, boutique stays)`,
          luxury: `₹${accommodationRange.luxury}+ (5-star hotels, resorts, heritage properties)`
        },
        food: {
          streetFood: `₹${foodCosts.street} - ₹${foodCosts.street + 50} per meal (Local dhabas, street vendors)`,
          restaurants: `₹${foodCosts.restaurant} - ₹${foodCosts.restaurant + 300} per meal (Mid-range restaurants)`,
          fineDining: `₹${foodCosts.fine}+ per meal (Fine dining, hotel restaurants)`
        },
        transportation: {
          local: `₹${transportCosts.local} - ₹${transportCosts.local + 30} (Bus, metro, shared auto)`,
          taxi: `₹${transportCosts.taxi}/km (Ola, Uber, local taxis)`,
          autoRickshaw: `₹${transportCosts.auto}/km (Auto-rickshaws)`,
          intercity: `₹${transportCosts.intercity} - ₹${transportCosts.intercity + 800} (Trains, buses)`,
          flights: `₹${transportCosts.flight}+ (Domestic flights)`
        },
        activities: {
          free: 'Free (Temples, beaches, markets, hiking trails)',
          paid: `₹${activityCosts.paid} - ₹${activityCosts.paid + 500} (Museums, monuments, boat rides)`,
          premium: `₹${activityCosts.premium}+ (Adventure sports, luxury experiences)`,
          guide: `₹${activityCosts.guide} - ₹${activityCosts.guide + 300} per day (Local guides)`
        },
        shopping: {
          souvenirs: `₹${shoppingCosts.souvenirs} - ₹${shoppingCosts.souvenirs + 200} (Small items, postcards)`,
          handicrafts: `₹${shoppingCosts.handicrafts} - ₹${shoppingCosts.handicrafts + 1000} (Local crafts, jewelry)`,
          textiles: `₹${shoppingCosts.textiles}+ (Silk, cotton, traditional wear)`
        },
        miscellaneous: {
          tips: '₹50 - ₹200 per service (Restaurants, guides, drivers)',
          internet: '₹200 - ₹500 (Local SIM card with data)',
          laundry: '₹100 - ₹300 per load',
          bottledWater: '₹20 - ₹50 per liter'
        }
      },
      budgetTips: [
        `Book accommodations 2-3 weeks in advance for ${isPeakSeason ? '20-30%' : '10-15%'} savings`,
        'Eat at local dhabas and street food stalls for authentic and budget meals',
        'Use public transport and shared rides instead of private taxis',
        'Look for combo tickets and group discounts for attractions',
        'Bargain at local markets - start at 50% of quoted price',
        'Carry cash as many places don\'t accept cards',
        'Book train tickets in advance for better prices and availability',
        `Visit during ${isPeakSeason ? 'monsoon (July-September)' : 'current season'} for lower accommodation rates`
      ],
      weeklyEstimate: {
        budget: `₹${dailyBudgetCalc.budget * 7} ($${Math.round((dailyBudgetCalc.budget * 7) / 83.2)})`,
        midRange: `₹${dailyBudgetCalc.midRange * 7} ($${Math.round((dailyBudgetCalc.midRange * 7) / 83.2)})`,
        luxury: `₹${dailyBudgetCalc.luxury * 7}+ ($${Math.round((dailyBudgetCalc.luxury * 7) / 83.2)}+)`
      }
    };
  }

  async getSafetyInfo(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Indian safety information by region
    const indianSafety: { [key: string]: any } = {
      'delhi': {
        generalSafety: [
          'Generally safe but be cautious in crowded areas like Chandni Chowk',
          'Avoid isolated areas after dark, especially for solo female travelers',
          'Use prepaid taxis or app-based cabs (Uber/Ola)',
          'Be wary of pickpockets in metro stations and tourist areas',
          'Paharganj area requires extra caution at night'
        ],
        healthPrecautions: [
          'Air pollution can be severe (AQI 200-400), carry masks',
          'Drink bottled water, avoid street vendor ice',
          'Carry hand sanitizer, especially during winter months',
          'Dengue risk during monsoon (July-September)'
        ],
        emergencyContacts: [
          'Police: 100 | Fire: 101 | Ambulance: 108',
          'Tourist Helpline: 1363',
          'Delhi Police Control Room: 011-23490000',
          'All India Institute of Medical Sciences: 011-26588500'
        ],
        travelInsurance: 'Essential for medical emergencies. Delhi hospitals are expensive (₹5,000-50,000/day)'
      },
      'mumbai': {
        generalSafety: [
          'Generally safe, but crowded local trains need caution',
          'Avoid displaying expensive items in crowded areas',
          'Colaba and Fort areas are safer for tourists',
          'Be cautious during monsoon - flooding and slippery roads',
          'Avoid isolated beaches after sunset'
        ],
        healthPrecautions: [
          'Monsoon brings waterborne diseases (June-September)',
          'High humidity can cause dehydration',
          'Street food safety varies - choose busy stalls',
          'Malaria risk in slum areas during monsoon'
        ],
        emergencyContacts: [
          'Police: 100 | Fire: 101 | Ambulance: 108',
          'Mumbai Police: 022-22621855',
          'Tourist Helpline: 1363',
          'Bombay Hospital: 022-22067676'
        ],
        travelInsurance: 'Recommended. Private hospitals cost ₹8,000-80,000/day'
      },
      'goa': {
        generalSafety: [
          'Generally very safe for tourists',
          'Beach safety: strong currents during monsoon',
          'Avoid isolated beaches at night',
          'Drug-related incidents - avoid suspicious offers',
          'Rental scooter accidents common - wear helmets'
        ],
        healthPrecautions: [
          'Sun protection essential - high UV index',
          'Seafood safety - choose reputable restaurants',
          'Monsoon brings dengue and chikungunya risk',
          'Alcohol poisoning cases reported - drink responsibly'
        ],
        emergencyContacts: [
          'Police: 100 | Fire: 101 | Ambulance: 108',
          'Goa Police: 0832-2420016',
          'Tourist Helpline: 1363',
          'Goa Medical College: 0832-2458700'
        ],
        travelInsurance: 'Important for water sports and adventure activities'
      },
      'kerala': {
        generalSafety: [
          'Very safe for tourists, including solo female travelers',
          'Houseboat safety - choose licensed operators',
          'Hill station roads can be dangerous during monsoon',
          'Wildlife areas - follow guide instructions',
          'Backwater areas - inform someone of your itinerary'
        ],
        healthPrecautions: [
          'Monsoon diseases: dengue, chikungunya, malaria',
          'Spicy food may cause stomach issues for first-timers',
          'Ayurvedic treatments - choose certified centers',
          'Hill stations can be cold - carry warm clothes'
        ],
        emergencyContacts: [
          'Police: 100 | Fire: 101 | Ambulance: 108',
          'Kerala Police: 0471-2721547',
          'Tourist Helpline: 0471-2321132',
          'Medical College Trivandrum: 0471-2528300'
        ],
        travelInsurance: 'Recommended for houseboat stays and adventure activities'
      },
      'rajasthan': {
        generalSafety: [
          'Generally safe, but extreme heat can be dangerous',
          'Desert areas - always travel with guide and water',
          'Camel safari operators - choose reputable ones',
          'Tourist-focused scams in Jaipur and Udaipur',
          'Road conditions vary - some rural areas challenging'
        ],
        healthPrecautions: [
          'Heat stroke risk (April-June) - stay hydrated',
          'Desert areas - carry extra water and sun protection',
          'Food safety - avoid raw vegetables in summer',
          'Dust storms can trigger respiratory issues'
        ],
        emergencyContacts: [
          'Police: 100 | Fire: 101 | Ambulance: 108',
          'Rajasthan Police: 0141-2744000',
          'Tourist Helpline: 1363',
          'SMS Hospital Jaipur: 0141-2560291'
        ],
        travelInsurance: 'Essential for desert activities and extreme weather'
      }
    };

    // Check for specific destinations
    for (const [location, safety] of Object.entries(indianSafety)) {
      if (destLower.includes(location)) {
        return safety;
      }
    }

    // Default Indian safety information
    return {
      generalSafety: [
        'India is generally safe for tourists with proper precautions',
        'Avoid displaying expensive items and large amounts of cash',
        'Use registered taxis or app-based cabs',
        'Stay in well-reviewed accommodations',
        'Inform someone of your travel plans'
      ],
      healthPrecautions: [
        'Drink bottled or boiled water',
        'Eat at busy restaurants with high turnover',
        'Carry basic medications and first aid',
        'Get travel vaccinations as recommended',
        'Monsoon season increases disease risk'
      ],
      emergencyContacts: [
        'Police: 100 | Fire: 101 | Ambulance: 108',
        'Tourist Helpline: 1363',
        'Women Helpline: 1091',
        'Disaster Management: 108'
      ],
      travelInsurance: 'Highly recommended. Medical costs can be ₹5,000-50,000/day in private hospitals'
    };
  }

  async getTravelRequirements(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Indian travel requirements by region
    const indianRequirements: { [key: string]: any } = {
      'kashmir': {
        permits: ['No special permits for Srinagar, Gulmarg, Pahalgam', 'Inner Line Permit for some border areas'],
        documents: ['Valid ID proof (Aadhaar/Passport)', 'Hotel bookings confirmation', 'Travel insurance recommended'],
        vaccinations: ['No special vaccinations required', 'Altitude sickness medication for high areas'],
        restrictions: ['Check current security situation', 'Some areas may have mobile internet restrictions']
      },
      'ladakh': {
        permits: ['Inner Line Permit required for Nubra Valley, Pangong Tso', 'Protected Area Permit for some regions'],
        documents: ['Valid ID proof', 'Medical fitness certificate recommended', 'Travel insurance mandatory'],
        vaccinations: ['Altitude sickness medication essential', 'Hepatitis A/B recommended'],
        restrictions: ['Accessible only May-September', 'Acclimatization required (24-48 hours in Leh)']
      },
      'sikkim': {
        permits: ['Inner Line Permit required for all tourists', 'Available online or at entry points'],
        documents: ['Valid ID proof', 'Passport-size photos', 'Travel insurance'],
        vaccinations: ['Hepatitis A/B', 'Typhoid', 'Japanese Encephalitis in some areas'],
        restrictions: ['Permit valid for 30 days', 'Some border areas restricted']
      },
      'andaman': {
        permits: ['No permit required for Port Blair and main islands', 'RAP required for tribal areas'],
        documents: ['Valid ID proof', 'Flight/ship tickets', 'Hotel bookings'],
        vaccinations: ['Hepatitis A/B', 'Typhoid', 'Malaria prophylaxis during monsoon'],
        restrictions: ['Tribal areas strictly prohibited', 'Some islands require forest permits']
      }
    };

    // Check for special permit areas
    for (const [area, requirements] of Object.entries(indianRequirements)) {
      if (destLower.includes(area)) {
        return requirements;
      }
    }

    // Default Indian travel requirements
    return {
      permits: ['No special permits required for most Indian destinations', 'Some border areas may need permits'],
      documents: ['Valid government ID (Aadhaar/Passport/Driving License)', 'Travel insurance recommended', 'Hotel booking confirmations'],
      vaccinations: ['Hepatitis A and B recommended', 'Typhoid vaccination', 'Japanese Encephalitis in rural areas', 'Malaria prophylaxis in endemic areas'],
      restrictions: ['Check monsoon season travel advisories', 'Some hill stations may be inaccessible in winter', 'Festival seasons may have accommodation shortages']
    };
  }

  async getPhotographyInfo(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Photography info for Indian destinations
    const indianPhotography: { [key: string]: any } = {
      'delhi': {
        bestSpots: ['India Gate at sunset', 'Red Fort architecture', 'Jama Masjid courtyard', 'Lotus Temple reflection', 'Chandni Chowk street life', 'Humayun\'s Tomb gardens'],
        bestTimes: ['Early morning (6-8 AM) for monuments', 'Golden hour (5-7 PM)', 'Blue hour for India Gate', 'Avoid midday harsh light'],
        equipment: ['Wide-angle for monuments', 'Telephoto for street photography', 'Tripod for night shots', 'Pollution filter recommended'],
        restrictions: ['₹300 camera fee at most ASI monuments', 'No photography inside Jama Masjid prayer hall', 'Respect privacy in Chandni Chowk']
      },
      'mumbai': {
        bestSpots: ['Marine Drive at night', 'Gateway of India', 'Dhobi Ghat laundry', 'Chhatrapati Shivaji Terminus', 'Worli Sea Link', 'Hanging Gardens city view'],
        bestTimes: ['Monsoon season for dramatic skies', 'Evening for Marine Drive', 'Early morning for Dhobi Ghat', 'Sunset from Worli Sea Link'],
        equipment: ['Weather protection during monsoon', 'Long exposure for traffic trails', 'Portrait lens for street photography'],
        restrictions: ['No tripods at Gateway of India', 'Dhobi Ghat - ask permission', 'Commercial photography needs permits']
      },
      'goa': {
        bestSpots: ['Anjuna Beach sunset', 'Chapora Fort panoramic views', 'Fontainhas colorful houses', 'Dudhsagar Falls', 'Basilica of Bom Jesus', 'Saturday Night Market'],
        bestTimes: ['Golden hour at beaches', 'Early morning for waterfalls', 'Monsoon for lush landscapes', 'Avoid harsh midday sun'],
        equipment: ['Waterproof gear for monsoon', 'Polarizing filter for beaches', 'Macro lens for details', 'Drone (with permits)'],
        restrictions: ['No photography inside churches during service', 'Drone permits required', 'Respect local privacy at markets']
      }
    };

    // Check for specific destinations
    for (const [location, photo] of Object.entries(indianPhotography)) {
      if (destLower.includes(location)) {
        return photo;
      }
    }

    // Default photography info
    return {
      bestSpots: ['Historical monuments', 'Local markets and streets', 'Natural landscapes', 'Cultural performances', 'Architectural details'],
      bestTimes: ['Golden hour (sunrise/sunset)', 'Early morning for fewer crowds', 'Blue hour for city lights', 'Avoid harsh midday sun'],
      equipment: ['DSLR/mirrorless camera', 'Wide-angle and portrait lenses', 'Tripod for stability', 'Extra batteries and memory cards'],
      restrictions: ['Camera fees at monuments (₹25-300)', 'No flash in museums', 'Respect local customs and privacy', 'Ask permission for portraits']
    };
  }

  async getConnectivityInfo(destination: string) {
    const destLower = destination.toLowerCase();
    
    // Connectivity info for Indian destinations
    const indianConnectivity: { [key: string]: any } = {
      'delhi': {
        internetSpeed: '4G/5G: 20-50 Mbps, Fiber: 50-200 Mbps in hotels/cafes',
        mobileNetwork: ['Jio, Airtel, Vi - excellent 4G/5G coverage', 'Free WiFi at Metro stations', 'Airport WiFi: 30 min free'],
        wifiAvailability: 'Hotels, malls, cafes, restaurants - mostly free with purchase',
        chargingPoints: 'Type C/D/M plugs (230V), USB ports in Metro, power banks recommended'
      },
      'mumbai': {
        internetSpeed: '4G/5G: 15-40 Mbps, varies during peak hours and monsoon',
        mobileNetwork: ['Jio, Airtel, Vi - good coverage', 'Railway stations have free WiFi', 'Airport WiFi: 45 min free'],
        wifiAvailability: 'Hotels, malls, cafes - free WiFi common, password required',
        chargingPoints: 'Type C/D/M plugs (230V), charging stations in malls, carry power bank'
      },
      'goa': {
        internetSpeed: '4G: 10-30 Mbps, slower in remote beaches, better in Panaji/Margao',
        mobileNetwork: ['Jio, Airtel coverage good', 'Beach shacks often have WiFi', 'Airport WiFi: 30 min free'],
        wifiAvailability: 'Hotels, restaurants, beach shacks - usually free for customers',
        chargingPoints: 'Type C/D/M plugs (230V), power cuts during monsoon, UPS backup common'
      }
    };

    // Check for specific destinations
    for (const [location, connectivity] of Object.entries(indianConnectivity)) {
      if (destLower.includes(location)) {
        return connectivity;
      }
    }

    // Default connectivity info
    return {
      internetSpeed: '4G coverage: 10-40 Mbps in cities, 2-10 Mbps in rural areas',
      mobileNetwork: ['Jio, Airtel, Vi networks available', 'Roaming charges apply for international visitors', 'Prepaid SIM cards available'],
      wifiAvailability: 'Hotels, restaurants, cafes usually provide free WiFi',
      chargingPoints: 'Type C/D/M plugs (230V, 50Hz), carry universal adapter and power bank'
    };
  }

  async getWikipediaInfo(destination: string): Promise<{ description: string; history: string }> {
    try {
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destination)}`
      );
      
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        return {
          description: data.extract || '',
          history: data.extract || ''
        };
      }
    } catch (error) {
      console.error('Error fetching Wikipedia info:', error);
    }
    
    return { description: '', history: '' };
  }

  async getElevationData(coordinates?: { lat: number; lon: number }): Promise<number | null> {
    if (!coordinates) return null;
    
    try {
      const response = await fetch(
        `https://api.open-elevation.com/api/v1/lookup?locations=${coordinates.lat},${coordinates.lon}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.results?.[0]?.elevation || null;
      }
    } catch (error) {
      console.error('Error fetching elevation:', error);
    }
    
    return null;
  }

  async getTerrainInfo(destination: string, coordinates?: { lat: number; lon: number }): Promise<string> {
    if (!coordinates) {
      return `${destination} features diverse terrain with varied topography and natural landscapes.`;
    }
    
    const { lat } = coordinates;
    if (lat > 60) return 'Arctic tundra and mountainous terrain';
    if (lat > 45) return 'Temperate forests and rolling hills';
    if (lat > 23.5) return 'Varied terrain with plains and hills';
    if (lat > -23.5) return 'Tropical landscapes and coastal plains';
    return 'Diverse terrain with unique geographical features';
  }

  async getClimateInfo(coordinates?: { lat: number; lon: number }): Promise<string> {
    if (!coordinates) {
      return 'Temperate climate with seasonal variations';
    }
    
    const { lat } = coordinates;
    if (lat > 60) return 'Arctic climate with long, cold winters';
    if (lat > 45) return 'Continental climate with distinct seasons';
    if (lat > 23.5) return 'Temperate climate with moderate temperatures';
    if (lat > -23.5) return 'Tropical climate with warm temperatures year-round';
    return 'Varied climate depending on elevation and proximity to water bodies';
  }

  async getNearbyPlacesFromOverpass(destination: string, coordinates?: { lat: number; lon: number }) {
    if (!coordinates) return [];
    
    try {
      const radius = 0.1;
      const bbox = {
        south: coordinates.lat - radius,
        west: coordinates.lon - radius,
        north: coordinates.lat + radius,
        east: coordinates.lon + radius
      };

      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"~"^(attraction|museum|monument)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
          way["tourism"~"^(attraction|museum|monument)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
          relation["tourism"~"^(attraction|museum|monument)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        );
        out center meta;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });

      if (response.ok) {
        const data = await response.json();
        
        return data.elements?.slice(0, 5).map((element: any) => {
          const distance = this.calculateDistance(coordinates.lat, coordinates.lon, 
            element.lat || element.center?.lat, element.lon || element.center?.lon);
          
          return {
            name: element.tags?.name || 'Unnamed Place',
            distance: `${distance.toFixed(1)} km`,
            description: element.tags?.description || `${element.tags?.tourism || 'Tourist'} attraction`,
            travelTime: `${Math.round(distance * 2)} minutes by car`
          };
        }) || [];
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }

    return [];
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const lat1Rad = this.toRad(lat1);
    const lat2Rad = this.toRad(lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private getLocalExperiences(): DestinationExperience[] {
    return [
      {
        id: '1',
        title: 'Historic City Walking Tour',
        description: 'Explore the historic heart of the city with a knowledgeable local guide',
        category: 'cultural',
        duration: '3 hours',
        difficulty: 'easy',
        price: '$25-40',
        location: 'City Center',
        rating: 4.5,
        reviews: 128,
        images: [],
        tags: ['history', 'walking', 'guided'],
        bestTime: 'Morning or afternoon',
        included: ['Professional guide', 'Historical insights', 'Photo opportunities'],
        requirements: ['Comfortable walking shoes', 'Weather-appropriate clothing']
      },
      {
        id: '2',
        title: 'Local Food Market Tour',
        description: 'Discover authentic local flavors and ingredients at traditional markets',
        category: 'food',
        duration: '2.5 hours',
        difficulty: 'easy',
        price: '$35-55',
        location: 'Local Markets',
        rating: 4.7,
        reviews: 89,
        images: [],
        tags: ['food', 'culture', 'tasting'],
        bestTime: 'Morning when markets are fresh',
        included: ['Market tastings', 'Local guide', 'Cultural insights'],
        requirements: ['Appetite for adventure', 'Open mind for new flavors']
      },
      {
        id: '3',
        title: 'Scenic Nature Hike',
        description: 'Experience breathtaking natural landscapes and wildlife',
        category: 'nature',
        duration: '4-6 hours',
        difficulty: 'moderate',
        price: '$30-50',
        location: 'Natural Areas',
        rating: 4.6,
        reviews: 156,
        images: [],
        tags: ['hiking', 'nature', 'photography'],
        bestTime: 'Early morning or late afternoon',
        included: ['Trail guide', 'Safety equipment', 'Nature interpretation'],
        requirements: ['Good fitness level', 'Hiking boots', 'Water and snacks']
      }
    ];
  }
}

export default new DestinationService();
