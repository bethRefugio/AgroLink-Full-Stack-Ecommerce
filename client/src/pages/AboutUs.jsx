import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart, Leaf, TrendingUp, Users, Target, Sparkles, Zap, BarChart3 } from 'lucide-react';

export default function AboutUs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 font-sans">
      {/* Google Fonts Import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&family=Dancing+Script:wght@400;500;600;700&display=swap');
          
          .font-display {
            font-family: 'Playfair Display', serif;
          }
          
          .font-body {
            font-family: 'Poppins', sans-serif;
          }
          
          .font-handwriting {
            font-family: 'Dancing Script', cursive;
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-900 to-green-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:flex space-x-10 text-white font-body font-medium text-sm tracking-wider">
              <a href="/" className="hover:text-green-300 transition-all hover:scale-105">HOME</a>
              <a href="/about" className="text-green-300 border-b-2 border-green-300">ABOUT US</a>
              <a href="/services" className="hover:text-green-300 transition-all hover:scale-105">SERVICES</a>
              <a href="/contact" className="hover:text-green-300 transition-all hover:scale-105">CONTACT US</a>
              <a href="/blog" className="hover:text-green-300 transition-all hover:scale-105">BLOG</a>
            </div>

            {/* Right side icons */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 font-body">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="bg-white text-green-800 font-semibold px-5 py-2 rounded-lg shadow transition-all border border-green-800 hover:bg-green-50"
              >
                Login
              </button>
            </div>
          </div>
        </div>

          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 font-body">
              <a href="/" className="block text-white hover:text-green-300 py-2 tracking-wide">HOME</a>
              <a href="/about" className="block text-green-300 py-2 tracking-wide">ABOUT US</a>
              <a href="/services" className="block text-white hover:text-green-300 py-2 tracking-wide">SERVICES</a>
              <a href="/contact" className="block text-white hover:text-green-300 py-2 tracking-wide">CONTACT US</a>
              <a href="/blog" className="block text-white hover:text-green-300 py-2 tracking-wide">BLOG</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-gray-900 leading-tight">
            About <span className="text-green-800">Smart AgroLink</span>
          </h1>
          <p className="text-xl md:text-2xl font-body text-gray-600 max-w-3xl mx-auto font-light">
            Bridging the gap between farmers and markets through intelligent technology
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border-t-8 border-green-800 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-green-800">Our Mission</h2>
            </div>
            <p className="text-gray-700 font-body text-lg leading-relaxed">
              To empower Filipino farmers by providing a transparent, AI-powered platform that eliminates unfair middlemen, ensures fair pricing, and creates direct connections between producers and markets for sustainable agricultural growth.
            </p>
          </div>

          <div className="bg-white p-12 rounded-3xl shadow-2xl border-t-8 border-green-800 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-green-800">Our Vision</h2>
            </div>
            <p className="text-gray-700 font-body text-lg leading-relaxed">
              To build a future where every farmer in the Philippines has access to fair markets, where technology uplifts rural communities, and where fresh, affordable produce is accessible to all Filipinos.
            </p>
          </div>
        </div>
      </div>

      {/* The Problem We Solve */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">The Challenge</h2>
            <p className="text-xl text-green-100 font-body max-w-3xl mx-auto">
              Filipino farmers face persistent exploitation despite their crucial role in food security
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
              <div className="text-6xl font-display font-black text-green-300 mb-4">273%</div>
              <p className="text-white font-body text-lg">Price markup on cabbage from farm to retail</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
              <div className="text-6xl font-display font-black text-green-300 mb-4">194%</div>
              <p className="text-white font-body text-lg">Price markup on tomatoes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
              <div className="text-6xl font-display font-black text-green-300 mb-4">159%</div>
              <p className="text-white font-body text-lg">Price markup on green mangoes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unique Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">
            Unique <span className="text-green-800">AI-Powered</span> Features
          </h2>
          <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
            Cutting-edge technology designed specifically for Filipino agriculture
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Dynamic Pricing AI */}
          <div className="group bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-l-8 border-green-800 transform hover:-translate-y-2">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <TrendingUp size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-display font-bold text-green-800 mb-4">Dynamic Pricing AI</h3>
                <p className="text-gray-700 font-body text-lg leading-relaxed mb-4">
                  Our advanced AI analyzes historical and real-time market data to recommend fair farm-gate prices, protecting farmers from exploitation while ensuring competitive rates.
                </p>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Real-time market analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Historical data integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Supply & demand forecasting
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buyer Recommendation Engine */}
          <div className="group bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-l-8 border-green-800 transform hover:-translate-y-2">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <Users size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-display font-bold text-green-800 mb-4">Buyer Recommendation Engine</h3>
                <p className="text-gray-700 font-body text-lg leading-relaxed mb-4">
                  Intelligent matching system that connects farmers with the right buyers based on location, crop type, purchase history, and demand patterns.
                </p>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Smart buyer-farmer matching
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Location-based recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Demand pattern analysis
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transparent Transactions */}
          <div className="group bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-l-8 border-green-800 transform hover:-translate-y-2">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <Zap size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-display font-bold text-green-800 mb-4">Transparent Transactions</h3>
                <p className="text-gray-700 font-body text-lg leading-relaxed mb-4">
                  Secure, traceable transaction system that eliminates hidden fees and price manipulation, ensuring both parties get fair deals.
                </p>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Complete transaction logs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Secure payment processing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Digital receipts & records
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Analytics Dashboard */}
          <div className="group bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-l-8 border-green-800 transform hover:-translate-y-2">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <BarChart3 size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-display font-bold text-green-800 mb-4">Data Analytics Dashboard</h3>
                <p className="text-gray-700 font-body text-lg leading-relaxed mb-4">
                  Powerful insights and visualization tools help farmers and buyers make informed decisions about planting, harvesting, and purchasing.
                </p>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Market trend visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Sales performance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    Predictive analytics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="bg-gradient-to-br from-green-50 to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">
              Our <span className="text-green-800">Impact</span>
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
              Contributing to UN Sustainable Development Goals
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🌾</div>
              <h3 className="font-display font-bold text-green-800 text-xl mb-2">No Poverty</h3>
              <p className="text-gray-600 font-body text-sm">Fair compensation for farmers</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🍎</div>
              <h3 className="font-display font-bold text-green-800 text-xl mb-2">Zero Hunger</h3>
              <p className="text-gray-600 font-body text-sm">Efficient food distribution</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="font-display font-bold text-green-800 text-xl mb-2">Economic Growth</h3>
              <p className="text-gray-600 font-body text-sm">Strengthening rural economies</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🏭</div>
              <h3 className="font-display font-bold text-green-800 text-xl mb-2">Innovation</h3>
              <p className="text-gray-600 font-body text-sm">AI-powered agriculture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-green-100 font-body text-lg">
            Smart AgroLink - Empowering Filipino Farmers Through Technology
          </p>
          <p className="text-green-300 font-body text-sm mt-2">
            © 2025 Project 404. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}