import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Tractor, BrainCircuit } from 'lucide-react';


// SVG imports (use URL imports instead of SVGR ReactComponent)
import groceryBagUrl from '../assets/grocery-bag-1.svg';
import curvedCircleUrl from '../assets/curved-circle.svg';
import circleUrl from '../assets/circle.svg';
import dotsUrl from '../assets/dots.svg';
import leaf2Url from '../assets/leaf-2.svg';
import agrolinkLogo from '../assets/agrolink-logo2.svg';


export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
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


            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>


            {/* Desktop menu */}
            <div className="hidden md:flex space-x-10 text-white font-body font-medium text-sm tracking-wider">
              <a href="/" className="hover:text-green-300 transition-all hover:scale-105">HOME</a>
              <a href="/about" className="hover:text-green-300 transition-all hover:scale-105">ABOUT US</a>
              <a href="/services" className="hover:text-green-300 transition-all hover:scale-105">SERVICES</a>
              <a href="/contact" className="hover:text-green-300 transition-all hover:scale-105">CONTACT US</a>
              <a href="/blog" className="hover:text-green-300 transition-all hover:scale-105">BLOG</a>
            </div>


            {/* Login button */}
            <div className="flex items-center space-x-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="bg-white text-green-800 font-semibold px-5 py-2 rounded-lg shadow transition-all border border-green-800 hover:bg-green-50"
              >
                Login
              </button>
            </div>
          </div>


          {/* Mobile horizontal scrolling menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 font-body overflow-x-auto">
              <div className="flex space-x-6 whitespace-nowrap px-2 py-2">
                <a href="/" className="text-white hover:text-green-300">HOME</a>
                <a href="/about" className="text-white hover:text-green-300">ABOUT US</a>
                <a href="/services" className="text-white hover:text-green-300">SERVICES</a>
                <a href="/contact" className="text-white hover:text-green-300">CONTACT US</a>
                <a href="/blog" className="text-white hover:text-green-300">BLOG</a>
              </div>
            </div>
          )}
        </div>
      </nav>


      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 -mt-8 lg:-mt-4 overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative z-10 space-y-8">
            {/* Logo centered (leaf removed) */}
            <div className="flex items-center">
              <img
                src={agrolinkLogo}
                alt="AgroLink logo"
                className="w-40 md:w-48 lg:w-56"
              />
            </div>




            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight tracking-tight">
              <span className="text-gray-900 block mb-2">CONNECT SMART</span>
              <span className="text-green-800 bg-clip-text">GROW TOGETHER</span>
            </h1>
           
            <p className="text-gray-700 font-body text-base md:text-lg leading-relaxed max-w-xl font-light">
              Smart AgroLink bridges the gap between farmers and markets through an AI-powered
              farm-to-market platform. We make buying and selling farm produce simpler, smarter,
              and more sustainable.
            </p>




            <button
                type="button"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white font-body font-bold px-10 py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg tracking-wide"
            >
              Get Started
            </button>




            {/* Carousel dots */}
            <div className="flex space-x-3 pt-6">
              <div className="w-4 h-4 bg-green-800 rounded-full shadow-lg"></div>
              <div className="w-4 h-4 bg-green-400 rounded-full shadow-md hover:bg-green-500 cursor-pointer transition-colors"></div>
              <div className="w-4 h-4 bg-green-400 rounded-full shadow-md hover:bg-green-500 cursor-pointer transition-colors"></div>
            </div>
          </div>




          {/* Right Image Section */}
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 left-1/4 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-green-600 rounded-full opacity-25 animate-bounce" style={{animationDuration: '3s'}}></div>
           
            {/* Dotted pattern background (kept as small dots for texture) */}
            <div className="absolute top-1/4 left-0 grid grid-cols-10 gap-1 opacity-15">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-green-800 rounded-full"></div>
              ))}
            </div>




            {/* SVG composition */}
            <div className="relative z-10 w-full aspect-square max-w-lg mx-auto">
              {/* Background curved shapes */}
              <img src={curvedCircleUrl} alt="curved background" className="absolute -left-20 -top-16 w-[450px] h-[450px] opacity-25 animate-spin-slow" style={{animationDuration: '30s'}} />
              <img src={circleUrl} alt="circle background" className="absolute right-0 top-8 w-80 h-80 opacity-20" />




              {/* Dots SVG (pattern) positioned and slightly transparent */}
              <img src={dotsUrl} alt="dots pattern" className="absolute -left-4 top-16 w-64 h-64 opacity-15" />




              {/* Main grocery bag / produce SVG centered */}
              <div className="relative z-20 flex items-center justify-center w-full h-full">
                {/* Grocery bag SVG — scaled responsively */}
                <img src={groceryBagUrl} alt="grocery bag" className="w-100 h-100 drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
              </div>




              {/* Decorative floating vegetable / leaf SVG */}
              <img src={leaf2Url} alt="leaf decorative" className="absolute -right-10 bottom-8 w-50 h-36 opacity-25 hover:opacity-40 transition-opacity" />
            </div>
          </div>
        </div>
      </div>




      {/* Features Section */}
      <div className="bg-lime-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
           
            {/* Card 1: Always Fresh */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Icon holder (Centered with mx-auto) */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Leaf size={36} className="text-green-700" />
              </div>
              {/* Text content (Centered with text-center) */}
              <div className="text-center">
                <h3 className="text-green-900 font-display text-2xl font-bold mb-3">Always Fresh</h3>
                <p className="text-gray-600 font-body leading-relaxed">
                  We ensure every product comes straight from trusted local farms. Our technology tracks and verifies the freshness of every harvest.
                </p>
              </div>
            </div>




            {/* Card 2: Smart & Sustainable */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Icon holder (Centered with mx-auto) */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <BrainCircuit size={36} className="text-green-700" />
              </div>
              {/* Text content (Centered with text-center) */}
              <div className="text-center">
                <h3 className="text-green-900 font-display text-2xl font-bold mb-3">Smart & Sustainable</h3>
                <p className="text-gray-600 font-body leading-relaxed">
                  Using AI-powered insights, Smart AgroLink helps farmers plan, forecast, and sell efficiently while helping consumers access affordable, high-quality produce.
                </p>
              </div>
            </div>




            {/* Card 3: Empowering Farmers */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Icon holder (Centered with mx-auto) */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Tractor size={36} className="text-green-700" />
              </div>
              {/* Text content (Centered with text-center) */}
              <div className="text-center">
                <h3 className="text-green-900 font-display text-2xl font-bold mb-3">Empowering Farmers</h3>
                <p className="text-gray-600 font-body leading-relaxed">
                  We believe technology can uplift communities. Through our platform, farmers gain market access, fair pricing, and real-time support.
                </p>
              </div>
            </div>




          </div>
        </div>
      </div>
    </div>
  );
}

