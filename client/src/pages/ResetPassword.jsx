import React, { useEffect, useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import agrolinkLogo from '../assets/agrolink-logo2.svg';

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data,setData] = useState({
    email : "",
    newPassword : "",
    confirmPassword : ""
  })
  const [showPassword,setShowPassword] = useState(false)
  const [showConfirmPassword,setShowConfirmPassword] = useState(false)

  const valideValue = Object.values(data).every(el => el)

  useEffect(()=>{
    if(!(location?.state?.data?.success)){
        navigate("/")
    }

    if(location?.state?.email){
        setData((preve)=>{
            return{
                ...preve,
                email : location?.state?.email
            }
        })
    }
  },[])

  const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

  const handleSubmit = async(e)=>{
    e.preventDefault()

    if(data.newPassword !== data.confirmPassword){
        toast.error("New password and confirm password must be same.")
        return
    }

    try {
        const response = await Axios({
            ...SummaryApi.resetPassword,
            data : data
        })
        
        if(response.data.error){
            toast.error(response.data.message)
        }

        if(response.data.success){
            toast.success(response.data.message)
            navigate("/login")
            setData({
                email : "",
                newPassword : "",
                confirmPassword : ""
            })
        }

    } catch (error) {
        AxiosToastError(error)
    }
  }

  return (
    <div className="min-h-screen bg-green font-sans flex items-center justify-center">
        {/* Google Fonts Import */}
        <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
                
                .font-display {
                    font-family: 'Playfair Display', serif;
                }
                
                .font-body {
                    font-family: 'Poppins', sans-serif;
                }
            `}
        </style>

        <div className="container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
            <div className="flex items-center justify-center py-12 px-8">
                <div className="w-full max-w-md mx-auto">
                    <div className="mb-6 text-center">
                        <img
                            src={agrolinkLogo}
                            alt="AgroLink logo"
                            className="w-40 mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-display font-bold text-gray-900">
                            Reset Password
                        </h2>
                        <p className="text-gray-600 font-body text-sm mt-1">
                            Enter your new password to secure your account
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-green-800">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* New Password Field */}
                            <div>
                                <label htmlFor='newPassword' className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                    New Password
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id='newPassword'
                                        className='w-full px-3.5 py-2.5 pr-10 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50'
                                        name='newPassword'
                                        value={data.newPassword}
                                        onChange={handleChange}
                                        placeholder='Enter your new password'
                                    />
                                    <div 
                                        onClick={() => setShowPassword(preve => !preve)} 
                                        className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700'
                                    >
                                        {showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor='confirmPassword' className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                    Confirm Password
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id='confirmPassword'
                                        className='w-full px-3.5 py-2.5 pr-10 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50'
                                        name='confirmPassword'
                                        value={data.confirmPassword}
                                        onChange={handleChange}
                                        placeholder='Confirm your new password'
                                    />
                                    <div 
                                        onClick={() => setShowConfirmPassword(preve => !preve)} 
                                        className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700'
                                    >
                                        {showConfirmPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                                    </div>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 font-body mb-1.5 font-medium">Password must contain:</p>
                                <ul className="text-xs text-gray-600 font-body space-y-1 ml-4 list-disc">
                                    <li>At least 8 characters</li>
                                    <li>One uppercase letter</li>
                                    <li>One number</li>
                                </ul>
                            </div>

                            {/* Reset Button */}
                            <button
                                type="submit"
                                disabled={!valideValue}
                                className={`w-full py-3 rounded-lg font-body font-semibold text-base tracking-wide transition-all duration-300 ${
                                    valideValue 
                                        ? 'bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white shadow-lg hover:shadow-xl' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Reset Password
                            </button>

                            {/* Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-white text-gray-500 font-body">Already have an account?</span>
                                </div>
                            </div>

                            {/* Login Link */}
                            <div className="text-center">
                                <Link 
                                    to="/login" 
                                    className="text-green-700 hover:text-green-800 font-semibold font-body text-sm"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-5 text-center space-y-2">
                        <p className="text-xs text-gray-500 font-body">
                            Protected by enterprise-grade security
                        </p>
                        <div className="flex justify-center gap-3 text-xs font-body">
                            <Link to="/about" className="text-green-700 hover:text-green-800">About Us</Link>
                            <span className="text-gray-300">|</span>
                            <Link to="/contact" className="text-green-700 hover:text-green-800">Contact</Link>
                            <span className="text-gray-300">|</span>
                            <Link to="/services" className="text-green-700 hover:text-green-800">Services</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ResetPassword