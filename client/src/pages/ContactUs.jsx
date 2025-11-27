import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart, Mail, MapPin, Send, Github, Linkedin, User, Check } from 'lucide-react';
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'


export default function ContactUs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });


  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Axios({
        ...SummaryApi.contactCreate,
        data: formData
      })
      if (res.data?.success) {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.data?.message || "Failed to send message")
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message")
    }
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const developers = [
    {
      name: "Elizabeth R. Refugio",
      role: "Project Leader",
      email: "elizabeth.refugio@g.msuiit.edu.ph",
      specialization: "Full-Stack Development & AI Integration",
      color: "from-purple-500 to-purple-600",
      github: "https://github.com/elizabeth-refugio",
      linkedin: "https://linkedin.com/in/elizabeth-refugio"
    },
    {
      name: "Kimberly D. Baganao",
      role: "Lead Developer",
      email: "kimberly.baganao@g.msuiit.edu.ph",
      specialization: "Frontend Development & UI/UX Design",
      color: "from-pink-500 to-pink-600",
      github: "https://github.com/mik-baganao",
      linkedin: "https://linkedin.com/in/kimberly-baganao"
    },
    {
      name: "Daphne Lavina B. Belecario",
      role: "Backend Developer",
      email: "daphne.belecario@g.msuiit.edu.ph",
      specialization: "Database Architecture & API Development",
      color: "from-blue-500 to-blue-600",
      github: "https://github.com/what-dafff",
      linkedin: "https://linkedin.com/in/daphne-belecario"
    },
    {
      name: "Elaine Joy A. Fajardo",
      role: "AI/ML Specialist",
      email: "elaine.fajardo@g.msuiit.edu.ph",
      specialization: "Machine Learning & Data Analytics",
      color: "from-teal-500 to-teal-600",
      github: "https://github.com/ejoy1020",
      linkedin: "https://linkedin.com/in/elaine-fajardo"
    },
    {
      name: "Carlos Troy R. Inao",
      role: "Systems Analyst",
      email: "carlos.inao@g.msuiit.edu.ph",
      specialization: "System Design & Quality Assurance",
      color: "from-orange-500 to-orange-600",
      github: "https://github.com/carlostroyinao",
      linkedin: "https://linkedin.com/in/carlos-inao"
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
        `}
      </style>


      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>


            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>
            </div>


            {/* Content */}
            <div className="text-center">
              <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Thank You!
              </h3>
              <p className="text-lg font-body text-gray-600 mb-6 leading-relaxed">
                Your message has been successfully sent. We appreciate you reaching out to us and will get back to you as soon as possible.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white font-body font-semibold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-x-hidden">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-gray-900 leading-tight">
            Get In <span className="text-green-800">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl font-body text-gray-600 max-w-3xl mx-auto font-light">
            We'd love to hear from you. Reach out to our team anytime!
          </p>
        </div>
      </div>


      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-green-800 mb-2">Location</h3>
            <p className="text-gray-600 font-body">MSU-Iligan Institute of Technology</p>
            <p className="text-gray-600 font-body">Iligan City, Philippines</p>
          </div>


          <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-green-800 mb-2">Email</h3>
            <p className="text-gray-600 font-body">info@smartagrolink.com</p>
            <p className="text-gray-600 font-body">support@smartagrolink.com</p>
          </div>


          <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Phone size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-green-800 mb-2">Phone</h3>
            <p className="text-gray-600 font-body">+63 (012) 345-6789</p>
            <p className="text-gray-600 font-body">Mon-Fri: 8AM - 5PM</p>
          </div>
        </div>


        {/* Contact Form and Map */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <div className="bg-white p-10 rounded-3xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Your email"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>


              <div>
                <label htmlFor="subject" className="sr-only">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>


              <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Write your message..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
                />
              </div>


              <div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white font-body font-bold px-6 py-3 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>


          {/* Info Section */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-800 to-green-900 p-10 rounded-3xl shadow-2xl text-white">
              <h2 className="text-3xl font-display font-bold mb-6">Project 404</h2>
              <p className="font-body text-green-100 leading-relaxed mb-6">
                Smart AgroLink is an innovative farm-to-market platform developed as part of the ITE183 Project.
                Our mission is to empower Filipino farmers through AI-powered technology that ensures fair pricing
                and direct market access.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2"></div>
                  <p className="text-green-100 font-body">Eliminating unfair middlemen practices</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2"></div>
                  <p className="text-green-100 font-body">AI-driven pricing and buyer matching</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2"></div>
                  <p className="text-green-100 font-body">Supporting sustainable agriculture</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-300 rounded-full mt-2"></div>
                  <p className="text-green-100 font-body">Building stronger rural communities</p>
                </div>
              </div>
            </div>


            <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-display font-bold text-green-800 mb-4">Office Hours</h3>
              <div className="space-y-3 font-body text-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Monday - Friday</span>
                  <span>8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Saturday</span>
                  <span>9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Development Team Section */}
        <div className="py-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">
              Meet Our <span className="text-green-800">Development Team</span>
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
              The brilliant minds behind Smart AgroLink - Project 404
            </p>
          </div>


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-8 border-green-800"
              >
                <div className="text-center">
                  <div className={`w-24 h-24 bg-gradient-to-br ${dev.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                    <User size={40} className="text-white" />
                  </div>
                 
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    {dev.name}
                  </h3>
                 
                  <p className="text-green-800 font-body font-semibold mb-3 text-sm tracking-wide uppercase">
                    {dev.role}
                  </p>
                 
                  <p className="text-gray-600 font-body text-sm mb-4 leading-relaxed">
                    {dev.specialization}
                  </p>
                 
                  <div className="flex items-center justify-center gap-2 text-gray-600 font-body text-sm mb-4">
                    <Mail size={16} className="text-green-800" />
                    <a href={`mailto:${dev.email}`} className="hover:text-green-800 transition-colors break-all">
                      {dev.email}
                    </a>
                  </div>
                 
                  <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 hover:bg-green-800 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Github size={18} className="text-gray-600 group-hover:text-white" />
                    </a>
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 hover:bg-green-800 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Linkedin size={18} className="text-gray-600 group-hover:text-white" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

