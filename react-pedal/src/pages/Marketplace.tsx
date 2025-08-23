import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Star, 
  Heart, 
  Plus, 
  Minus,
  Filter,
  Grid,
  List,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw,
  Check
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  brand: string;
  description: string;
  inStock: boolean;
  freeShipping: boolean;
  discount?: number;
}

interface CartItem extends Product {
  quantity: number;
}

const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Responsive search bar state
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [hasRoomForFullSearch, setHasRoomForFullSearch] = useState(true);
  const controlsRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (controlsRowRef.current) {
        // If the controls row is too small, collapse search
        setHasRoomForFullSearch(controlsRowRef.current.offsetWidth > 520);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [addToCartAnimation, setAddToCartAnimation] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'All Products', icon: '🛍️', count: 156 },
    { id: 'accessories', label: 'Accessories', icon: '🔧', count: 45 },
    { id: 'merchandise', label: 'Merchandise', icon: '👕', count: 32 },
    { id: 'spare-parts', label: 'Spare Parts', icon: '⚙️', count: 28 },
    { id: 'camping', label: 'Camping', icon: '⛺', count: 24 },
    { id: 'gear', label: 'Gear', icon: '🎒', count: 27 }
  ];

  const [products] = useState<Product[]>([]);

  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.reviews - a.reviews;
    }
  });

  const addToCart = (product: Product) => {
    setAddToCartAnimation(product.id);
    setTimeout(() => setAddToCartAnimation(null), 1000);
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Category Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 h-full bg-gray-800 border-r border-gray-700 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Categories</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        activeCategory === category.id
                          ? 'bg-orange-500 text-white'
                          : 'text-white hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <span className={`text-sm ${
                        activeCategory === category.id ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Cart ({getTotalItems()})
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-xl">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
                            <p className="text-orange-500 font-bold">${item.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-600 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-300" />
                            </button>
                            <span className="text-white font-medium min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-600 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-300" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-white">Total:</span>
                        <span className="text-xl font-bold text-orange-500">${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pb-20 md:pb-0">
        {/* Main Content Container Start */}
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">PEDAL Store</h1>
              </div>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sticky Controls Row */}
          <div ref={controlsRowRef} className="sticky top-20 z-30 bg-gray-900/90 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-gray-800 py-4">

            <div className="flex-1 flex items-center gap-3 min-w-0">
              {/* Responsive Search: Collapses to icon if too small */}
              <div className={`relative flex-grow min-w-[40px] max-w-xl transition-all duration-200 ${searchExpanded ? 'w-full' : 'w-10 md:w-80'}`}>
                {(!searchExpanded && (windowWidth < 600 || !hasRoomForFullSearch)) ? (
                  <button
                    className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-xl text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
                    onClick={() => setSearchExpanded(true)}
                    aria-label="Expand search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search products, brands, or categories..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400"
                      autoFocus={searchExpanded && (windowWidth < 600 || !hasRoomForFullSearch)}
                      onBlur={() => { if (windowWidth < 600 || !hasRoomForFullSearch) setSearchExpanded(false); }}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-orange-500 transition-colors focus:outline-none"
                >
                  <Menu className="w-5 h-5" />
                  
                </button>
              </div>
              <div className="relative ml-2">
                <button
                  onClick={() => setSortDropdownOpen(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-orange-500 transition-colors focus:outline-none min-w-[90px]"
                  type="button"
                >
                  <span>Price</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50">
                    <button
                      onClick={() => { setSortBy('price-low'); setSortDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-t-xl hover:bg-orange-500 transition-colors ${sortBy === 'price-low' ? 'bg-orange-500 text-white' : 'text-white'}`}
                    >
                      Low to High
                    </button>
                    <button
                      onClick={() => { setSortBy('price-high'); setSortDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-b-xl hover:bg-orange-500 transition-colors ${sortBy === 'price-high' ? 'bg-orange-500 text-white' : 'text-white'}`}
                    >
                      High to Low
                    </button>
                  </div>
                )}
              </div>
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

              {/* Products Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-orange-500 transition-all group"
                  >
                    <div className="relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          -{product.discount}%
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-orange-500 text-sm font-medium">{product.brand}</span>
                        <h3 className="text-white font-bold text-lg">{product.name}</h3>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">({product.reviews})</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        {product.freeShipping && (
                          <div className="flex items-center gap-1 text-green-400 text-sm">
                            <Truck className="w-4 h-4" />
                            <span>Free Ship</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full py-3 rounded-xl font-bold transition-all relative overflow-hidden ${
                          product.inStock
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {addToCartAnimation === product.id ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            Added!
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </div>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2 text-white">No products found</h3>
                  <p className="text-gray-400">Try adjusting your search or category filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
};

export default Marketplace;
