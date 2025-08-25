# News API Integration Setup

## Overview
The PEDAL app now integrates with Google News API to fetch real-time automotive, technology, adventure, and related news articles.

## API Setup Instructions

### 1. Get News API Key
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier provides 1,000 requests per day

### 2. Environment Configuration
Create a `.env` file in the `react-pedal` directory with:

```bash
# News API Configuration
REACT_APP_NEWS_API_KEY=your_actual_api_key_here

# Other existing API keys...
REACT_APP_OPENWEATHER_API_KEY=your_openweather_key
REACT_APP_GOOGLE_PLACES_API_KEY=your_google_places_key
```

### 3. News Categories Implemented
- **Technology**: Automotive tech, electric vehicles, self-driving cars
- **Racing**: Motorsport, Formula 1, MotoGP, rally racing
- **Safety**: Road safety, vehicle safety, crash tests
- **Industry**: Auto manufacturing, industry news
- **Events**: Auto shows, exhibitions, motor shows
- **Adventure**: Adventure travel, road trips, off-road
- **Electric**: Electric vehicles, EV news, charging stations
- **Bikes**: Motorcycle, two-wheeler, scooter news

### 4. Features Implemented
- ✅ Real-time news fetching from News API
- ✅ Category-based filtering
- ✅ Search functionality with debouncing
- ✅ Trending topics display
- ✅ Refresh functionality
- ✅ Fallback news when API unavailable
- ✅ Caching for performance (15-minute cache)
- ✅ Loading states and error handling

### 5. Usage
1. Add your API key to `.env` file
2. Restart the development server: `npm start`
3. Navigate to News page
4. Browse categories or search for specific topics
5. Click trending topics for quick searches
6. Use refresh button to get latest news

### 6. API Limits & Fallback
- **Free tier**: 1,000 requests/day
- **Fallback**: Displays curated automotive/adventure news when API unavailable
- **Caching**: Reduces API calls with 15-minute cache
- **Error handling**: Graceful fallback to sample news

### 7. News Sources
The API aggregates from major news sources including:
- Automotive publications
- Tech news sites
- Adventure/travel publications
- Racing and motorsport news
- Industry publications

## Technical Implementation

### News Service (`newsService.ts`)
- Handles API integration
- Manages caching and fallback data
- Provides category-specific queries
- Implements search functionality

### News Component (`News.tsx`)
- Real-time news display
- Category filtering
- Search with debouncing
- Trending topics
- Refresh functionality
- Responsive design

The integration provides users with up-to-date, relevant news content focused on automotive, technology, adventure, and related topics that align with the PEDAL app's target audience.
