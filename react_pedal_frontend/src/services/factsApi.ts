// Dynamic Facts API Service for Automotive, Travel, Cycling & Adventure
export interface Fact {
  id: string;
  text: string;
  category: 'automotive' | 'travel' | 'cycling' | 'adventure' | 'motorcycle' | 'electric';
  source?: string;
}

class FactsApiService {
  private facts: Fact[] = [
    // Automotive Facts
    {
      id: 'auto_1',
      text: 'From 2024, all new EU cars must have autonomous emergency braking and driver monitoring systems - expected to save 25,000+ lives by 2038.',
      category: 'automotive',
      source: 'EU General Safety Regulation 2024'
    },
    {
      id: 'auto_2', 
      text: 'Modern Formula 1 cars can generate up to 1000 HP and accelerate 0-60 mph in 2.6 seconds.',
      category: 'automotive'
    },
    {
      id: 'auto_3',
      text: 'The first car was invented in 1885 by Karl Benz, reaching a top speed of 10 mph.',
      category: 'automotive'
    },
    {
      id: 'auto_4',
      text: 'Cars now communicate with each other using V2X (Vehicle-to-Everything) technology powered by 5G networks.',
      category: 'automotive',
      source: 'Automotive World 2024'
    },
    {
      id: 'auto_5',
      text: 'Amazon started selling cars directly on their US platform in 2024, beginning with Hyundai vehicles.',
      category: 'automotive',
      source: 'Automotive Industry 2024'
    },

    // Electric Vehicle Facts
    {
      id: 'ev_1',
      text: 'The global EV market hit $500+ billion in 2024, doubling from $250 billion in 2020.',
      category: 'electric',
      source: 'Fortune Business Insights 2024'
    },
    {
      id: 'ev_2',
      text: 'There are now over 40 million electric vehicles on roads worldwide, up from just 200,000 in 2012.',
      category: 'electric'
    },
    {
      id: 'ev_3',
      text: 'Norway leads the world with 82.7% of all new vehicle registrations being electric (57.3% battery + 25.4% plug-in hybrid).',
      category: 'electric',
      source: 'PwC Electric Vehicle Report 2024'
    },
    {
      id: 'ev_4',
      text: 'New hydrogen fuel cell cars have 5x the range of traditional EVs and can recharge in minutes instead of hours.',
      category: 'electric'
    },
    {
      id: 'ev_5',
      text: 'China produces almost all global EV batteries and has 8x more public charging stations than any other country.',
      category: 'electric'
    },

    // Motorcycle & Adventure Facts
    {
      id: 'moto_1',
      text: 'Adventure motorcycling has more than doubled in the last 10 years and is now the fastest-growing motorcycle segment.',
      category: 'motorcycle',
      source: 'BMW North America 2024'
    },
    {
      id: 'moto_2',
      text: 'Modern adventure bikes can replace off-road, touring, commuting, and sport bikes in a single package.',
      category: 'motorcycle'
    },
    {
      id: 'moto_3',
      text: 'MotoGP bikes can lean at angles up to 64 degrees while cornering at speeds over 200 mph.',
      category: 'motorcycle'
    },
    {
      id: 'moto_4',
      text: 'The fastest production motorcycle is the Kawasaki Ninja H2R at 249 mph.',
      category: 'motorcycle'
    },
    {
      id: 'moto_5',
      text: 'Motorcyclists can now reach Mount Everest Base Camp, crossing the highest Himalayan peaks on specialized adventure bikes.',
      category: 'adventure',
      source: 'Adventure Travel 2024'
    },

    // Cycling Facts
    {
      id: 'cycle_1',
      text: 'Professional cyclists can sustain 400+ watts of power for hours during races like the Tour de France.',
      category: 'cycling'
    },
    {
      id: 'cycle_2',
      text: 'The Tour de France covers approximately 2,200 miles over 21 stages through diverse terrains.',
      category: 'cycling'
    },
    {
      id: 'cycle_3',
      text: 'Cycling at 12-14 mph burns about 480 calories per hour, making it an excellent fitness activity.',
      category: 'cycling'
    },
    {
      id: 'cycle_4',
      text: 'The fastest recorded bicycle speed is 183.9 mph, achieved with motor-pacing assistance.',
      category: 'cycling'
    },

    // Travel & Adventure Facts
    {
      id: 'travel_1',
      text: 'The longest road in the world is the Pan-American Highway at 19,000 miles, connecting Alaska to Argentina.',
      category: 'travel'
    },
    {
      id: 'travel_2',
      text: 'Colombia is ranked as the world\'s #1 motorcycle touring destination, followed by Peru and Tibet.',
      category: 'adventure',
      source: 'MotoDreamer 2024'
    },
    {
      id: 'travel_3',
      text: 'The Dakar Rally covers 5,000+ miles through deserts using modified trucks, motorcycles, and ATVs.',
      category: 'adventure'
    },
    {
      id: 'travel_4',
      text: 'Alaska\'s Dalton Highway (414 miles) is one of the most dangerous roads, used by ice road truckers.',
      category: 'travel'
    },
    {
      id: 'travel_5',
      text: 'The highest drivable road is in Ladakh, India at 18,380 feet elevation.',
      category: 'travel'
    },
    {
      id: 'travel_6',
      text: 'Michigan\'s Upper Peninsula offers some of the world\'s best motorcycle "color rides" from spring through fall.',
      category: 'adventure',
      source: 'Global Adventure Travel 2024'
    },

    // Extreme Vehicle Facts
    {
      id: 'extreme_1',
      text: 'Land Rover Defenders can wade through 35.4 inches of water and climb 45-degree slopes.',
      category: 'automotive'
    },
    {
      id: 'extreme_2',
      text: 'The Nürburgring Nordschleife in Germany has 154 turns over 12.9 miles - called "The Green Hell".',
      category: 'automotive'
    },
    {
      id: 'extreme_3',
      text: 'Rally cars can jump 130+ feet and land safely due to specialized suspension systems.',
      category: 'automotive'
    },
    {
      id: 'extreme_4',
      text: 'The longest motorcycle journey was 457,000 miles by Emilio Scotto across 214 countries.',
      category: 'adventure'
    },
    {
      id: 'extreme_5',
      text: 'Isle of Man TT motorcycle racers average 135+ mph on public roads with 200+ corners.',
      category: 'motorcycle'
    }
  ];

  // Get random fact from all categories
  getRandomFact(): Fact {
    const randomIndex = Math.floor(Math.random() * this.facts.length);
    return this.facts[randomIndex];
  }

  // Get random fact from specific category
  getRandomFactByCategory(category: Fact['category']): Fact {
    const categoryFacts = this.facts.filter(fact => fact.category === category);
    if (categoryFacts.length === 0) return this.getRandomFact();
    const randomIndex = Math.floor(Math.random() * categoryFacts.length);
    return categoryFacts[randomIndex];
  }

  // Get multiple random facts
  getRandomFacts(count: number = 5): Fact[] {
    const shuffled = [...this.facts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get facts by categories
  getFactsByCategories(categories: Fact['category'][]): Fact[] {
    return this.facts.filter(fact => categories.includes(fact.category));
  }

  // Get all facts
  getAllFacts(): Fact[] {
    return this.facts;
  }

  // Add new fact (for future dynamic loading)
  addFact(fact: Omit<Fact, 'id'>): void {
    const newFact: Fact = {
      ...fact,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.facts.push(newFact);
  }

  // Simulate fetching facts from external API (for future implementation)
  async fetchLatestFacts(): Promise<Fact[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return current facts (in future, this would fetch from real API)
    return this.getRandomFacts(10);
  }
}

// Export singleton instance
export const factsApi = new FactsApiService();
export default factsApi;
