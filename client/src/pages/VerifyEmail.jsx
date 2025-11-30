import React, { useEffect, useState } from "react";
import { IoCheckmarkCircle, IoCloseCircle, IoWarning } from "react-icons/io5";
import { Link } from "react-router-dom";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

function VerifyEmail() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setStatus("invalid");
      return;
    }

    Axios({
      ...SummaryApi.verify_email,
      data: { code }
    })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section className='min-h-screen flex items-center justify-center bg-gray-50 p-4 overflow-x-hidden'>
      <div className='max-w-md w-full'>
        {/* ...existing loading, invalid, error, success states... */}
        {status === "loading" && (
          <div className='bg-white rounded-lg border border-gray-200 p-8 shadow-sm'>
            <div className='text-center'>
              <div className='inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4'></div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>Verifying Email</h2>
              <p className='text-sm text-gray-600'>Please wait while we verify your email address...</p>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className='bg-white rounded-lg border border-gray-200 p-8 shadow-sm'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4'>
                <IoWarning className='text-yellow-600' size={32} />
              </div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>Invalid Verification Link</h2>
              <p className='text-sm text-gray-600 mb-6'>
                The verification link you're trying to use is invalid or malformed.
              </p>
              <Link
                to='/login'
                className='inline-block px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className='bg-white rounded-lg border border-gray-200 p-8 shadow-sm'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4'>
                <IoCloseCircle className='text-red-600' size={32} />
              </div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>Verification Failed</h2>
              <p className='text-sm text-gray-600 mb-6'>
                We couldn't verify your email address. The link may have expired or already been used.
              </p>
              <div className='flex flex-col gap-3'>
                <Link
                  to='/login'
                  className='px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className='bg-white rounded-lg border border-gray-200 p-8 shadow-sm'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4'>
                <IoCheckmarkCircle className='text-green-600' size={32} />
              </div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>Email Verified Successfully!</h2>
              <p className='text-sm text-gray-600 mb-6'>
                Your email has been verified. You can now log in to your account.
              </p>
              <Link
                to='/login'
                className='inline-block px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors'
              >
                Continue to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default VerifyEmail;