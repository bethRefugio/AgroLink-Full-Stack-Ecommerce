import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import agrolinkLogo from '../assets/agrolink-logo2.svg';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "" 
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

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

        if(data.password !== data.confirmPassword){
            toast.error("password and confirm password must be same");
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data
            });
            
            if(response.data.error){
                toast.error(response.data.message);
            }

            if(response.data.success){
                toast.success(response.data.message);
                setData({
                    name : "",
                    email : "",
                    password : "",
                    confirmPassword : "",
                    role: ""
                });
                navigate("/login");
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
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="mb-6 text-center">
                            <img
                                src={agrolinkLogo}
                                alt="AgroLink logo"
                                className="w-40 mx-auto mb-4"
                            />
                            <h2 className="text-2xl font-display font-bold text-gray-900">
                                Create Your Account
                            </h2>
                            <p className="text-gray-600 font-body text-sm mt-1">Register to join Smart AgroLink</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-green-800 w-[400px]">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="name" className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        autoFocus
                                        className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50"
                                    />
                                </div>
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
                                        placeholder="Enter your email"
                                        className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50"
                                    />
                                </div>
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
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={data.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Enter your confirm password"
                                            className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(prev => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-gray-700 font-body font-medium mb-1.5 text-sm">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-all font-body text-sm bg-gray-50"
                                    >
                                        <option value="" disabled>Select your role</option>
                                        <option className="bg-white text-gray-800 hover:bg-green-50" value="BUYER">Buyer</option>
                                        <option className="bg-white text-gray-800 hover:bg-green-50" value="SELLER">Seller</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!valideValue}
                                    className={`w-full py-3 rounded-lg font-body font-semibold text-base tracking-wide transition-all duration-300 ${
                                        valideValue 
                                            ? 'bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 text-white shadow-lg hover:shadow-xl' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Register
                                </button>
                            </form>

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
                                <p className="text-gray-600 font-body text-sm">
                                    <Link 
                                        to="/login" 
                                        className="text-green-700 hover:text-green-800 font-semibold"
                                    >
                                        Login
                                    </Link>
                                </p>
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

export default Register;