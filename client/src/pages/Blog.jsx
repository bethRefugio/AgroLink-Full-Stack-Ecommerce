import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, Calendar, Tag } from 'lucide-react';




export default function BlogPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();




  // Blog posts created from the themes in your other files
  const posts = [
    {
      id: 1,
      category: "Market Insights",
      title: "Beating the Middleman: How Tech Ensures Fair Prices for Farmers",
      author: "Elizabeth R. Refugio",
      date: "November 12, 2025",
      excerpt: "The 273% markup on produce is a symptom of a broken system. We explore how direct farm-to-market platforms are fighting back...",
      imageUrl: "https://images.unsplash.com/photo-1579308013364-3c66f2647c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: "/blog/beating-the-middleman"
    },
    {
      id: 2,
      category: "Technology",
      title: "Beyond Guesswork: How AI is Revolutionizing Harvest Pricing",
      author: "Elaine Joy A. Fajardo",
      date: "November 10, 2025",
      excerpt: "Our dynamic pricing engine analyzes millions of data points to suggest fair, real-time prices. Here's how it works...",
      imageUrl: "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: "/blog/ai-harvest-pricing"
    },
    {
      id: 3,
      category: "Logistics",
      title: "From Farm to Table, Faster: Optimizing the Supply Chain",
      author: "Carlos Troy R. Inao",
      date: "November 8, 2025",
      excerpt: "Freshness is key. Learn how Smart AgroLink's logistics coordination helps reduce waste and get produce to you faster.",
      imageUrl: "https://images.unsplash.com/photo-1607987011155-9ab7f10e4399?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: "/blog/optimizing-supply-chain"
    },
    {
      id: 4,
      category: "Farmer Tips",
      title: "5 Tips for Managing Your Farm Inventory Digitally",
      author: "Kimberly D. Baganao",
      date: "November 5, 2025",
      excerpt: "Moving from a notebook to an app can be daunting. Here are 5 simple tips to make managing your stock easier...",
      imageUrl: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: "/blog/digital-inventory-tips"
    },
    {
      id: 5,
      category: "Technology",
      title: "The Science of a Perfect Match: Our Buyer Recommendation Engine",
      author: "Daphne Lavina B. Belecario",
      date: "November 2, 2025",
      excerpt: "It's not just about finding *a* buyer, it's about finding the *right* buyer. We dive into the tech behind smart matching.",
      imageUrl: "https://images.unsplash.com/photo-1556761175-59736f62329e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: "/blog/buyer-recommendation-engine"
    },
    {
      id: 6,
      category: "Community",
      title: "Why We Built This: The Mission Behind Project 404",
      author: "The Smart AgroLink Team",
      date: "October 30, 2025",
      excerpt: "Smart AgroLink is more than just a school project. It's our answer to a call for change in Philippine agriculture. Read our story.",
      imageUrl: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: "/blog/our-mission"
    }
  ];




  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 font-sans overflow-x-hidden">
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


      {/* Blog Grid Section */}
      <div className="bg-lime-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-2"
              >
                <a href={post.slug} className="block">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-56 object-cover"
                  />
                </a>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-2 text-sm font-body font-semibold text-green-800">
                      <Tag size={16} />
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-4 hover:text-green-800 transition-colors">
                    <a href={post.slug}>{post.title}</a>
                  </h3>
                  <p className="text-gray-600 font-body leading-relaxed mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-body">
                    <span className="flex items-center gap-2">
                      <User size={16} />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      {post.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}







