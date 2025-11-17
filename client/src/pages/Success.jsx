import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaCheckCircle, FaHome, FaMapMarkerAlt, FaStore } from 'react-icons/fa'

const Success = () => {
  const location = useLocation()
  const isPickup = location?.state?.isPickup
  const pickupAddresses = location?.state?.pickupAddresses || []
  const text = location?.state?.text || "Payment"
    
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden'>
        {/* Header with Icon */}
        <div className='bg-gradient-to-r from-green-600 to-green-700 p-8 text-center'>
          <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <FaCheckCircle className='text-green-600 text-5xl' />
          </div>
          <h1 className='text-xl font-bold text-white mb-2'>{text} Successful!</h1>
          <p className='text-green-100 text-sm'>Your order has been confirmed</p>
        </div>

        {/* Content */}
        <div className='p-6 text-center'>
          <div className='mb-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-2'>
              Thank you for your order
            </h2>
            <p className='text-gray-600 text-sm leading-relaxed'>
              {isPickup 
                ? 'You can pick up your order from the location(s) below.'
                : 'Your order will be delivered to your address soon.'}
            </p>
          </div>

          {/* Pickup Addresses Section */}
          {isPickup && pickupAddresses.length > 0 && (
            <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center justify-center gap-2 mb-3'>
                <FaStore className='text-green-600' />
                <h3 className='font-semibold text-gray-900 text-sm'>Pickup Location{pickupAddresses.length > 1 ? 's' : ''}</h3>
              </div>
              <div className='space-y-3'>
                {pickupAddresses.map((address, index) => (
                  <div key={index} className='bg-white rounded-lg p-3 text-left'>
                    <p className='font-medium text-gray-900 text-sm mb-1'>
                      {address.sellerName || `Seller ${index + 1}`}
                    </p>
                    <div className='flex items-start gap-2 text-gray-600 text-xs'>
                      <FaMapMarkerAlt className='text-green-600 mt-0.5 flex-shrink-0' />
                      <div>
                        <p>{address.purok_house || address.address_line}</p>
                        <p>{address.barangay}, {address.city}</p>
                        <p>{address.country} - {address.zipcode}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Status */}
          <div className='mb-6 bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center justify-between text-sm mb-2'>
              <span className='text-gray-600'>Order Status</span>
              <span className='text-green-600 font-semibold'>Confirmed</span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-600'>Payment Status</span>
              <span className='text-green-600 font-semibold'>Completed</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Link 
              to="/dashboard/myorders" 
              className='w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg text-sm'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>View Orders</span>
            </Link>

            <Link 
              to="/home" 
              className='w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all text-sm'
            >
              <FaHome className='text-base' />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Help Text */}
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              Questions about your order? 
              <Link to="/contact" className='text-green-600 hover:text-green-700 font-medium ml-1 underline'>
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success