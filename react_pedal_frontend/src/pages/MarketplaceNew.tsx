import React, { useState, useEffect } from 'react';
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
  Check,
  CreditCard,
  Wallet,
  MapPin,
  Phone,
  Mail,
  Home
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
  const [sortBy, setSortBy] = useState('popular');
  const [addToCartAnimation, setAddToCartAnimation] = useState<number | null>(null);

  // Checkout flow state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'address'|'payment'|'review'|'success'>('address');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [payment, setPayment] = useState<{method: 'upi'|'card'|'cod'; upi?: string; cardNumber?: string; expiry?: string; cvv?: string}>({ method: 'upi' });

  const categories = [
    { id: 'all', label: 'All Products', count: 0, icon: '🛍️' },
    { id: 'accessories', label: 'Accessories', count: 0, icon: '🎒' },
    { id: 'merchandise', label: 'Merchandise', count: 0, icon: '👕' },
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const productsData = await marketplaceService.getProducts();
        setProducts([]);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
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

  const canProceedAddress = () => {
    const { fullName, phone, line1, city, state, pincode } = address;
    return !!fullName && !!phone && !!line1 && !!city && !!state && !!pincode;
  };

  const canProceedPayment = () => {
    if (payment.method === 'upi') return !!payment.upi && payment.upi.includes('@');
    if (payment.method === 'card') return !!payment.cardNumber && payment.cardNumber.replace(/\s/g,'').length >= 12 && !!payment.expiry && !!payment.cvv;
    return true; // COD
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

      {/* Checkout Flow Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setIsCheckoutOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <h3 className="text-white font-semibold">Checkout</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className={`${checkoutStep==='address'?'text-orange-400':''}`}>Address</span>
                  <span>→</span>
                  <span className={`${checkoutStep==='payment'?'text-orange-400':''}`}>Payment</span>
                  <span>→</span>
                  <span className={`${checkoutStep==='review'?'text-orange-400':''}`}>Review</span>
                </div>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Main step content */}
                <div className="lg:col-span-2 p-6 space-y-6 overflow-y-auto max-h-[70vh] pb-24 lg:pb-6">
                  {checkoutStep === 'address' && (
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/> Delivery Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400">Full Name</label>
                          <input value={address.fullName} onChange={(e)=>setAddress({...address, fullName: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Phone</label>
                          <input value={address.phone} onChange={(e)=>setAddress({...address, phone: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-400">Email</label>
                          <input value={address.email} onChange={(e)=>setAddress({...address, email: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-400">Address Line 1</label>
                          <input value={address.line1} onChange={(e)=>setAddress({...address, line1: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-400">Address Line 2</label>
                          <input value={address.line2} onChange={(e)=>setAddress({...address, line2: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">City</label>
                          <input value={address.city} onChange={(e)=>setAddress({...address, city: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">State</label>
                          <input value={address.state} onChange={(e)=>setAddress({...address, state: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Pincode</label>
                          <input value={address.pincode} onChange={(e)=>setAddress({...address, pincode: e.target.value})} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button disabled={!canProceedAddress()} onClick={()=>setCheckoutStep('payment')} className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50">Continue to Payment</button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'payment' && (
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-orange-500"/> Payment Method</h4>
                      <div className="flex gap-2">
                        <button onClick={()=>setPayment({method:'upi'})} className={`px-3 py-2 rounded-lg border ${payment.method==='upi'?'border-orange-500 bg-orange-500/10 text-white':'border-gray-600 text-gray-300'}`}>UPI</button>
                        <button onClick={()=>setPayment({method:'card'})} className={`px-3 py-2 rounded-lg border ${payment.method==='card'?'border-orange-500 bg-orange-500/10 text-white':'border-gray-600 text-gray-300'}`}>Card</button>
                        <button onClick={()=>setPayment({method:'cod'})} className={`px-3 py-2 rounded-lg border ${payment.method==='cod'?'border-orange-500 bg-orange-500/10 text-white':'border-gray-600 text-gray-300'}`}>Cash on Delivery</button>
                      </div>
                      {payment.method === 'upi' && (
                        <div>
                          <label className="text-xs text-gray-400">UPI ID</label>
                          <input value={payment.upi||''} onChange={(e)=>setPayment({...payment, upi: e.target.value})} placeholder="name@bank" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                        </div>
                      )}
                      {payment.method === 'card' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400">Card Number</label>
                            <input value={payment.cardNumber||''} onChange={(e)=>setPayment({...payment, cardNumber: e.target.value})} placeholder="1234 5678 9012 3456" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Expiry</label>
                            <input value={payment.expiry||''} onChange={(e)=>setPayment({...payment, expiry: e.target.value})} placeholder="MM/YY" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">CVV</label>
                            <input value={payment.cvv||''} onChange={(e)=>setPayment({...payment, cvv: e.target.value})} placeholder="123" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500" />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <button onClick={()=>setCheckoutStep('address')} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Back</button>
                        <button disabled={!canProceedPayment()} onClick={()=>setCheckoutStep('review')} className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50">Review Order</button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'review' && (
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold flex items-center gap-2"><Check className="w-4 h-4 text-orange-500"/> Review & Place Order</h4>
                      <div className="bg-gray-700 rounded-xl p-4">
                        <div className="text-gray-300 text-sm">
                          <div className="font-semibold text-white mb-2">Ship to:</div>
                          <div>{address.fullName}</div>
                          <div>{address.line1}{address.line2?`, ${address.line2}`:''}</div>
                          <div>{address.city}, {address.state} {address.pincode}</div>
                          <div className="text-gray-400">{address.phone} {address.email?`• ${address.email}`:''}</div>
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded-xl p-4">
                        <div className="text-gray-300 text-sm">
                          <div className="font-semibold text-white mb-2">Payment:</div>
                          <div className="capitalize">{payment.method}{payment.method==='upi' && payment.upi?`: ${payment.upi}`:''}</div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <button onClick={()=>setCheckoutStep('payment')} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Back</button>
                        <button onClick={()=>{ setCheckoutStep('success'); setCartItems([]); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Place Order</button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'success' && (
                    <div className="text-center py-16">
                      <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h4 className="text-white text-xl font-semibold mb-2">Order Placed!</h4>
                      <p className="text-gray-300">You will receive a confirmation email shortly.</p>
                      <div className="mt-6">
                        <button onClick={()=>{ setIsCheckoutOpen(false); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Close</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary - Desktop */}
                <div className="hidden lg:block lg:border-l border-gray-700 p-6 bg-gray-850">
                  <div className="text-white font-semibold mb-4">Order Summary</div>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {cartItems.length === 0 && checkoutStep!=='success' && (
                      <div className="text-gray-400 text-sm">Your cart is empty.</div>
                    )}
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center bg-gray-700/60 rounded-lg p-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">{item.name}</div>
                          <div className="text-gray-400 text-xs">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-orange-400 font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300"><span>Items</span><span>${getTotalPrice().toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-300"><span>Shipping</span><span>$0.00</span></div>
                    <div className="flex justify-between text-white font-semibold text-base"><span>Total</span><span>${getTotalPrice().toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Bar inside modal */}
              <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="text-white font-semibold">${getTotalPrice().toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={()=>setMobileSummaryOpen(v=>!v)}
                      className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm"
                    >
                      {mobileSummaryOpen ? 'Hide Summary' : 'View Summary'}
                    </button>
                    {checkoutStep !== 'success' && (
                      <button
                        onClick={()=>{
                          if (checkoutStep==='address' && canProceedAddress()) setCheckoutStep('payment');
                          else if (checkoutStep==='payment' && canProceedPayment()) setCheckoutStep('review');
                        }}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-50"
                        disabled={(checkoutStep==='address' && !canProceedAddress()) || (checkoutStep==='payment' && !canProceedPayment())}
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {mobileSummaryOpen && (
                    <motion.div
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      className="max-h-60 overflow-y-auto border-t border-gray-700 bg-gray-850"
                    >
                      <div className="p-4 space-y-3">
                        {cartItems.length === 0 ? (
                          <div className="text-gray-400 text-sm">Your cart is empty.</div>
                        ) : (
                          cartItems.map((item) => (
                            <div key={item.id} className="flex gap-3 items-center bg-gray-700/60 rounded-lg p-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm truncate">{item.name}</div>
                                <div className="text-gray-400 text-xs">Qty: {item.quantity}</div>
                              </div>
                              <div className="text-orange-400 font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                          ))
                        )}
                        <div className="border-t border-gray-700 pt-3 space-y-2 text-sm">
                          <div className="flex justify-between text-gray-300"><span>Items</span><span>${getTotalPrice().toFixed(2)}</span></div>
                          <div className="flex justify-between text-gray-300"><span>Shipping</span><span>$0.00</span></div>
                          <div className="flex justify-between text-white font-semibold text-base"><span>Total</span><span>${getTotalPrice().toFixed(2)}</span></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                      <button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
                        onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); setCheckoutStep('address'); }}
                      >
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
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-lg font-bold text-white mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
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
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, categories..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
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
      </div>
    </div>
  );
};

export default Marketplace;
