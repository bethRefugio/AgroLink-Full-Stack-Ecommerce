import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, TrendingUp, Users, Shield } from 'lucide-react';
import agrolinkLogo from '../assets/agrolink-logo2.svg';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const valideValue = Object.values(data).every(el => el);

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data: data
            });
            
            if(response.data.error) {
                toast.error(response.data.message);
            }

            if(response.data.success) {
                toast.success(response.data.message);
                localStorage.setItem('accesstoken', response.data.data.accesstoken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);

                const userDetails = await fetchUserDetails();
                dispatch(setUserDetails(userDetails.data));

                setData({
                    email: "",
                    password: "",
                });
                navigate("/home");
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

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
                                    Welcome Back
                                </h2>
                                <p className="text-gray-600 font-body text-sm mt-1">Login to continue to Smart AgroLink</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-green-800">
                                

                                <div className="space-y-4">
                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={data.email}
                                            onChange={handleChange}
                                            placeholder="juancruz@gmail.com"
                                            className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50"
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                value={data.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                                            </button>
                                        </div>
                                        <div className="mt-1.5 text-right">
                                            <Link 
                                                to="/forgot-password" 
                                                className="text-xs text-green-700 hover:text-green-800 font-body font-medium"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!valideValue}
                                        className={`w-full py-3 rounded-lg font-body font-semibold text-base tracking-wide transition-all duration-300 ${
                                            valideValue 
                                                ? 'bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white shadow-lg hover:shadow-xl' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Login
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-5">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white text-gray-500 font-body">New to Smart AgroLink?</span>
                                        </div>
                                    </div>

                                    {/* Register Link */}
                                    <div className="text-center">
                                        <p className="text-gray-600 font-body text-sm">
                                            Don't have an account?{' '}
                                            <Link 
                                                to="/register" 
                                                className="text-green-700 hover:text-green-800 font-semibold"
                                            >
                                                Create Account
                                            </Link>
                                        </p>
                                    </div>
                                </div>
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
    );
};

export default Login;