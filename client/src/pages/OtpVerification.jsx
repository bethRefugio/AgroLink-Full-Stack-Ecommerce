import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import agrolinkLogo from '../assets/agrolink-logo2.svg';

const OtpVerification = () => {
    const [data, setData] = useState(["","","","","",""])
    const navigate = useNavigate()
    const inputRef = useRef([])
    const location = useLocation()

    useEffect(()=>{
        if(!location?.state?.email){
            navigate("/forgot-password")
        }
    },[])

    const valideValue = data.every(el => el)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification,
                data : {
                    otp : data.join(""),
                    email : location?.state?.email
                }
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData(["","","","","",""])
                navigate("/reset-password",{
                    state : {
                        data : response.data,
                        email : location?.state?.email
                    }
                })
            }

        } catch (error) {
            console.log('error',error)
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
                                Verify OTP
                            </h2>
                            <p className="text-gray-600 font-body text-sm mt-1">
                                Enter the 6-digit code sent to {location?.state?.email}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-green-800">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* OTP Input Fields */}
                                <div>
                                    <label className="block text-gray-700 font-body font-medium mb-3 text-sm text-center">
                                        Enter Your OTP
                                    </label>
                                    <div className='flex items-center gap-2 justify-center'>
                                        {
                                            data.map((element,index)=>{
                                                return(
                                                    <input
                                                        key={"otp"+index}
                                                        type='text'
                                                        ref={(ref)=>{
                                                            inputRef.current[index] = ref
                                                            return ref 
                                                        }}
                                                        value={data[index]}
                                                        onChange={(e)=>{
                                                            const value = e.target.value
                                                            
                                                            const newData = [...data]
                                                            newData[index] = value
                                                            setData(newData)

                                                            if(value && index < 5){
                                                                inputRef.current[index+1].focus()
                                                            }
                                                        }}
                                                        maxLength={1}
                                                        className='w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-800 focus:outline-none transition-all bg-gray-50 font-body'
                                                    />
                                                )
                                            })
                                        }
                                    </div>
                                </div>

                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    disabled={!valideValue}
                                    className={`w-full py-3 rounded-lg font-body font-semibold text-base tracking-wide transition-all duration-300 ${
                                        valideValue 
                                            ? 'bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white shadow-lg hover:shadow-xl' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Verify OTP
                                </button>

                                {/* Resend Code */}
                                <div className="text-center">
                                    <p className="text-gray-600 font-body text-sm">
                                        Didn't receive the code?{' '}
                                        <button 
                                            type="button"
                                            className="text-green-700 hover:text-green-800 font-semibold"
                                        >
                                            Resend
                                        </button>
                                    </p>
                                </div>

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

export default OtpVerification