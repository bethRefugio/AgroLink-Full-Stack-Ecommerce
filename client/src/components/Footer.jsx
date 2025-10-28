import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-green-900 to-green-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-green-100 font-body text-lg">
          Smart AgroLink - Empowering Filipino Farmers Through Technology
        </p>
        <p className="text-green-300 font-body text-sm mt-2">
          © 2025 Project 404. All rights reserved.
        </p>
        
        {/* Social Media Icons */}
        <div className='flex items-center gap-4 justify-center text-2xl mt-4'>
          <a href='' className='hover:text-green-200 text-green-100'>
            <FaFacebook/>
          </a>
          <a href='' className='hover:text-green-200 text-green-100'>
            <FaInstagram/>
          </a>
          <a href='' className='hover:text-green-200 text-green-100'>
            <FaLinkedin/>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer