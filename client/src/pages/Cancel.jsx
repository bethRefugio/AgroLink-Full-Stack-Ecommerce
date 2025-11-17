import React from 'react'
import { Link } from 'react-router-dom'
import { MdCancel } from 'react-icons/md'
import { FaHome, FaShoppingCart, FaRedo } from 'react-icons/fa'

const Cancel = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden'>
        {/* Header with Icon */}
        <div className='bg-gradient-to-r from-red-500 to-red-600 p-8 text-center'>
          <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <MdCancel className='text-red-500 text-5xl' />
          </div>
          <h1 className='text-xl font-bold text-white mb-2'>Order Cancelled</h1>
          <p className='text-red-100 text-sm'>Your payment was not processed</p>
        </div>

        {/* Content */}
        <div className='p-6 text-center'>
          <div className='mb-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-2'>
              Transaction Unsuccessful
            </h2>
            <p className='text-gray-600 text-sm leading-relaxed'>
              Your order has been cancelled and no charges were made to your account. 
              You can try placing the order again or contact support if you need assistance.
            </p>
          </div>

          {/* Info Box */}
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-5 h-5 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-red-600 text-xs font-bold'>!</span>
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-red-900 mb-1'>Why was my order cancelled?</p>
                <p className='text-xs text-red-700'>
                  Payment could not be completed. This may be due to insufficient funds, network issues, or cancelled transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Link 
              to="/cart" 
              className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg text-sm'
            >
              <FaRedo className='text-base' />
              <span>Try Again</span>
            </Link>

            <Link 
              to="/home" 
              className='w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all text-sm'
            >
              <FaHome className='text-base' />
              <span>Return to Home</span>
            </Link>
          </div>

          {/* Help Text */}
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              Need help? 
              <Link to="/contact" className='text-red-500 hover:text-red-600 font-medium ml-1 underline'>
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cancel