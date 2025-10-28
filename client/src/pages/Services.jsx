import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart, TrendingUp, Users, Shield, BarChart3, Zap, Search, Bell, FileText, Truck, CheckCircle } from 'lucide-react';

export default function Services() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const services = [
    {
      icon: TrendingUp,
      title: "Dynamic Pricing Intelligence",
      description: "AI-powered pricing recommendations based on real-time market data",
      features: [
        "Real-time market price analysis",
        "Historical data integration",
        "Supply and demand forecasting",
        "Fair price suggestions",
        "Automated price alerts"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Smart Buyer Matching",
      description: "Connect with the right buyers for your produce automatically",
      features: [
        "AI-driven buyer recommendations",
        "Location-based matching",
        "Purchase history analysis",
        "Demand pattern recognition",
        "Direct buyer communication"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Protected and transparent trading with full transaction records",
      features: [
        "Encrypted payment processing",
        "Digital transaction logs",
        "Automatic receipt generation",
        "Dispute resolution support",
        "Fraud prevention measures"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive data visualization and reporting tools",
      features: [
        "Sales performance dashboards",
        "Market trend analysis",
        "Crop yield predictions",
        "Revenue tracking",
        "Custom report generation"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Search,
      title: "Product Discovery",
      description: "Easy search and browse for fresh produce",
      features: [
        "Advanced search filters",
        "Category browsing",
        "Quality ratings and reviews",
        "Product availability tracking",
        "Seasonal produce highlights"
      ],
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay updated with market opportunities and price changes",
      features: [
        "Price change alerts",
        "New buyer notifications",
        "Order status updates",
        "Market opportunity alerts",
        "Customizable notification preferences"
      ],
      color: "from-red-500 to-red-600"
    },
    {
      icon: FileText,
      title: "Inventory Management",
      description: "Track and manage your agricultural inventory efficiently",
      features: [
        "Real-time stock monitoring",
        "Harvest planning tools",
        "Expiry date tracking",
        "Automated reorder suggestions",
        "Multi-crop management"
      ],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Truck,
      title: "Logistics Coordination",
      description: "Streamlined delivery and transportation management",
      features: [
        "Delivery scheduling",
        "Route optimization",
        "Tracking and monitoring",
        "Logistics partner network",
        "Cost estimation tools"
      ],
      color: "from-pink-500 to-pink-600"
    }
  ];

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
              <a href="/about" className="hover:text-green-300 transition-all hover:scale-105">ABOUT US</a>
              <a href="/services" className="text-green-300 border-b-2 border-green-300">SERVICES</a>
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
              <a href="/about" className="block text-white hover:text-green-300 py-2 tracking-wide">ABOUT US</a>
              <a href="/services" className="block text-green-300 py-2 tracking-wide">SERVICES</a>
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
            Our <span className="text-green-800">Services</span>
          </h1>
          <p className="text-xl md:text-2xl font-body text-gray-600 max-w-3xl mx-auto font-light">
            Comprehensive solutions to revolutionize farm-to-market connections
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-l-8 border-green-800 transform hover:-translate-y-2"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform flex-shrink-0`}>
                    <Icon size={36} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-bold text-green-800 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 font-body text-base leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <div className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                          <span className="text-gray-700 font-body text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 py-20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">
              How It <span className="text-green-300">Works</span>
            </h2>
            <p className="text-xl text-green-100 font-body max-w-3xl mx-auto">
              Simple steps to connect, trade, and grow your agricultural business
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl font-display font-black text-green-800">1</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Sign Up</h3>
              <p className="text-green-100 font-body">Create your account as a farmer or buyer in minutes</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl font-display font-black text-green-800">2</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">List or Browse</h3>
              <p className="text-green-100 font-body">Farmers list produce, buyers search for fresh products</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl font-display font-black text-green-800">3</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Get Matched</h3>
              <p className="text-green-100 font-body">AI connects you with the best buyers or suppliers</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl font-display font-black text-green-800">4</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Trade Securely</h3>
              <p className="text-green-100 font-body">Complete transactions with transparency and security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">
            Why Choose <span className="text-green-800">Smart AgroLink?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-6">🎯</div>
            <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Fair Pricing</h3>
            <p className="text-gray-700 font-body leading-relaxed">
              AI-driven pricing ensures farmers get fair compensation while buyers enjoy competitive rates without middleman markups.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Faster Transactions</h3>
            <p className="text-gray-700 font-body leading-relaxed">
              Direct connections eliminate unnecessary delays, getting fresh produce from farm to table in record time.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-6">📊</div>
            <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Data-Driven Decisions</h3>
            <p className="text-gray-700 font-body leading-relaxed">
              Access powerful analytics and insights to make informed decisions about planting, harvesting, and selling.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-6">🔒</div>
            <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Secure Platform</h3>
            <p className="text-gray-700 font-body leading-relaxed">
              Enterprise-grade security protects your data and transactions, ensuring safe business operations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-6">🌱</div>
            <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Sustainability Focus</h3>
            <p className="text-gray-700 font-body leading-relaxed">
              Support sustainable agriculture by reducing waste, optimizing supply chains, and promoting local sourcing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
            <div className="text-5xl mb-6">💪</div>
            <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Farmer Empowerment</h3>
            <p className="text-gray-700 font-body leading-relaxed">
              Give farmers the tools and market access they need to thrive independently and build sustainable businesses.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-green-50 to-amber-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 font-body mb-10 max-w-2xl mx-auto">
            Join thousands of farmers and buyers already using Smart AgroLink to transform Philippine agriculture
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white font-body font-bold px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg tracking-wide">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  );
}