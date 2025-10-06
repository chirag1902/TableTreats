import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  const features = [
    { icon: '🔍', title: 'Smart Discovery', desc: 'Find the perfect restaurant with advanced filters, real reviews, and personalized recommendations based on your taste.', color: 'from-purple-500 to-pink-500' },
    { icon: '📅', title: 'Instant Reservations', desc: 'Book your table in seconds. See real-time availability and get instant confirmations—no phone calls needed.', color: 'from-blue-500 to-cyan-500' },
    { icon: '🎁', title: 'Exclusive Deals', desc: 'Unlock special discounts and offers exclusive to Tabletreats users. Save money every time you dine out.', color: 'from-orange-500 to-red-500' },
    { icon: '💳', title: 'Seamless Payments', desc: 'Pay your bill directly through the app. Split checks, add tips, and leave whenever you are ready.', color: 'from-green-500 to-teal-500' },
    { icon: '⭐', title: 'Authentic Reviews', desc: 'Read honest reviews from verified diners. Share your own experiences and help others discover great spots.', color: 'from-yellow-500 to-orange-500' },
    { icon: '🏆', title: 'Loyalty Rewards', desc: 'Earn points with every visit. Redeem rewards at your favorite restaurants and unlock VIP perks.', color: 'from-indigo-500 to-purple-500' }
  ];

  const steps = [
    { num: '1', title: 'Discover & Reserve', desc: 'Browse restaurants near you, check menus and reviews, then reserve your table instantly.' },
    { num: '2', title: 'Enjoy Your Meal', desc: 'Show up and enjoy your dining experience. Your reservation and any deals are automatically applied.' },
    { num: '3', title: 'Pay & Go', desc: 'When you are done, simply pay through the app and leave. No waiting for the check.' }
  ];

  const restaurants = [
    { name: 'The Garden Bistro', cuisine: 'Italian', rating: 4.8, price: '$$', distance: '0.5 mi', emoji: '🍝', gradient: 'from-amber-600 via-orange-500 to-red-600', deal: '20% OFF Tonight' },
    { name: 'Sunset Grill', cuisine: 'American', rating: 4.6, price: '$$$', distance: '1.2 mi', emoji: '🍔', gradient: 'from-red-700 via-orange-600 to-yellow-500', deal: 'Reserve Now' },
    { name: 'Sushi House', cuisine: 'Japanese', rating: 4.9, price: '$$', distance: '0.8 mi', emoji: '🍣', gradient: 'from-green-600 via-teal-500 to-blue-400', deal: 'Free Appetizer' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ee5a6f', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Letter T shape with modern twist */}
                  <rect x="20" y="15" width="60" height="12" rx="6" fill="url(#logoGrad1)"/>
                  <rect x="44" y="15" width="12" height="70" rx="6" fill="url(#logoGrad2)"/>
                  
                  {/* Plate at bottom of T */}
                  <ellipse cx="50" cy="78" rx="22" ry="8" fill="url(#logoGrad1)" opacity="0.3"/>
                  <ellipse cx="50" cy="75" rx="20" ry="6" fill="url(#logoGrad1)"/>
                  
                  {/* Small food/dining elements on the plate */}
                  <circle cx="42" cy="73" r="2.5" fill="white" opacity="0.9"/>
                  <circle cx="50" cy="72" r="3" fill="white" opacity="0.9"/>
                  <circle cx="58" cy="73" r="2.5" fill="white" opacity="0.9"/>
                  
                  {/* Sparkle/star effects for "treats" */}
                  <path d="M 15 35 L 17 40 L 12 40 Z" fill="#fbbf24"/>
                  <path d="M 85 45 L 87 50 L 82 50 Z" fill="#fbbf24"/>
                  <circle cx="25" cy="65" r="1.5" fill="#fbbf24"/>
                  <circle cx="75" cy="30" r="1.5" fill="#fbbf24"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">
                Tabletreats
              </div>
            </div>
            <ul className="hidden md:flex gap-8 items-center">
              <li><a href="#features" className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-pink-500' : 'text-white hover:text-pink-300'}`}>Features</a></li>
              <li><a href="#how-it-works" className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-pink-500' : 'text-white hover:text-pink-300'}`}>How It Works</a></li>
              <li><a href="#restaurants" className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-pink-500' : 'text-white hover:text-pink-300'}`}>For Restaurants</a></li>
            </ul>
            <div className="flex gap-3">
              <button 
                onClick={() => handleNavigate('/login')}
                className="px-6 py-2 rounded-full border-2 border-pink-500 text-pink-500 font-semibold hover:bg-pink-500 hover:text-white transition-all hover:scale-105"
              >
                Login
              </button>
              <button 
                onClick={() => handleNavigate('/signup')}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 transition-all hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-radial-gradient opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/5 rounded-full"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                <span className="text-sm font-semibold">More Than Just a Meal</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
                Your Complete
                <span className="block bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">
                  Dine-In Experience
                </span>
                in One App
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-xl">
                Discover restaurants, reserve tables, unlock exclusive deals, and pay seamlessly—all in one place. Say goodbye to app juggling forever.
              </p>
              
              <div className="bg-white rounded-2xl p-3 flex shadow-2xl max-w-2xl hover:shadow-pink-500/20 transition-all">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <span className="text-2xl">📍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your location or restaurant name"
                    className="flex-1 outline-none text-gray-800 text-lg"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  Find Restaurants
                </button>
              </div>

              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-4xl font-bold">5000+</div>
                  <div className="text-white/70">Restaurants</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">50K+</div>
                  <div className="text-white/70">Happy Diners</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative w-80 bg-gray-900 rounded-[50px] p-3 shadow-2xl transform hover:rotate-2 transition-all duration-500">
                <div className="bg-white rounded-[42px] overflow-hidden">
                  <div className="bg-gray-50 px-6 py-2 flex justify-between items-center text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex gap-2 text-gray-600">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-gray-50 to-white p-4 space-y-3 h-[600px] overflow-hidden">
                    <div className="bg-white rounded-2xl p-3 shadow-md flex items-center gap-2">
                      <span className="text-xl">🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search restaurants..." 
                        className="outline-none flex-1 text-sm"
                        disabled
                      />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {['Italian', 'Japanese', 'American', 'Healthy'].map((cat, i) => (
                        <div key={i} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-xs font-semibold whitespace-nowrap">
                          {cat}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {restaurants.map((restaurant, idx) => (
                        <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                          <div className={`h-32 bg-gradient-to-br ${restaurant.gradient} relative`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-7xl opacity-90">{restaurant.emoji}</div>
                            </div>
                            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                              {restaurant.cuisine}
                            </div>
                            <div className="absolute bottom-3 left-3 bg-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              ★ {restaurant.rating}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800 mb-1">{restaurant.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{restaurant.cuisine} • {restaurant.price} • {restaurant.distance}</p>
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full font-semibold">
                              {restaurant.deal}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="text-white text-center animate-bounce">
            <div className="text-sm mb-2">Scroll to explore</div>
            <div className="text-2xl">↓</div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full mb-4">
              <span className="text-purple-600 font-semibold">Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Dine Out Better
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop switching between apps. Tabletreats brings discovery, reservations, deals, and payments together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"></div>
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-4xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-white rounded-full mb-4 shadow-md">
              <span className="text-purple-600 font-semibold">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Your perfect dining experience is just three steps away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-24 left-0 w-1/3 h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
            <div className="hidden md:block absolute top-24 right-0 w-1/3 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            {steps.map((step, idx) => (
              <div key={idx} className="text-center relative">
                <div className="mb-8 relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-2xl relative z-10 transform hover:scale-110 transition-all">
                    {step.num}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-40"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/10 rounded-full"
              style={{
                width: `${Math.random() * 60 + 30}px`,
                height: `${Math.random() * 60 + 30}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            Ready to Transform Your Dining Experience?
          </h2>
          <p className="text-2xl mb-10 text-white/90">
            Join thousands of diners who have simplified their restaurant experience
          </p>
          <button 
            onClick={() => handleNavigate('/signup')}
            className="px-12 py-5 bg-white text-purple-700 rounded-full font-bold text-xl shadow-2xl hover:scale-110 transition-all hover:shadow-white/30"
          >
            Get Started Now - It is Free
          </button>
          <p className="mt-6 text-white/70">No credit card required</p>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  T
                </div>
                <div className="text-2xl font-bold">Tabletreats</div>
              </div>
              <p className="text-gray-400 mb-6">Your complete dine-in experience in one app. Discover, reserve, and enjoy!</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">For Restaurants</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#partner" className="hover:text-pink-500 transition-colors">Partner With Us</a></li>
                <li><a href="#dashboard" className="hover:text-pink-500 transition-colors">Dashboard</a></li>
                <li><a href="#pricing" className="hover:text-pink-500 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#help" className="hover:text-pink-500 transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-pink-500 transition-colors">Contact</a></li>
                <li><a href="#privacy" className="hover:text-pink-500 transition-colors">Privacy</a></li>
                <li><a href="#terms" className="hover:text-pink-500 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2025 Tabletreats. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Made with love for food lovers</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}