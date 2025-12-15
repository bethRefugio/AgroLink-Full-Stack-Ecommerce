import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/agrolink-logo2.svg';
import Search from './Search';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';

const Header = () => {
    const [isMobile] = useMobile();
    const location = useLocation();
    const isSearchPage = location.pathname === "/search";
    const navigate = useNavigate();
    const user = useSelector((state) => state?.user);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const cartItem = useSelector(state => state.cartItem.cart);
    const { totalPrice, totalQty } = useGlobalContext();
    const [openCartSection, setOpenCartSection] = useState(false);
    const menuRef = useRef(null);
 
    const redirectToLoginPage = () => {
        navigate("/login");
    };

    const handleCloseUserMenu = () => {
        setOpenUserMenu(false);
    };

    const handleMobileUser = () => {
        if(!user._id) {
            navigate("/login");
            return;
        }
        navigate("/user");
    };

    const isUserLoggedIn = user?._id;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenUserMenu(false);
            }
        };

        if (openUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openUserMenu]);

    return (
        <header className='shadow-sm sticky top-0 z-40 bg-white'>
            {/* Main header */}
            {!(isSearchPage && isMobile) && (
                <div className='container mx-auto px-4'>
                    <div className='flex items-center justify-between h-20'>
                        {/* Logo */}
                        <div className='flex items-center'>
                            <Link to={isUserLoggedIn ? "/home" : "/"} className='flex items-center'>
                                <img 
                                    src={logo}
                                    width={170}
                                    height={60}
                                    alt='logo'
                                    className='hidden lg:block'
                                />
                                <img 
                                    src={logo}
                                    width={120}
                                    height={60}
                                    alt='logo'
                                    className='lg:hidden'
                                />
                            </Link>
                        </div>

                        {/* Search - Desktop only, show if user is logged in */}
                        {isUserLoggedIn && (
                            <div className='hidden lg:block flex-1 max-w-2xl mx-8'>
                                <Search/>
                            </div>
                        )}

                        {/* Right side actions */}
                        <div className='flex items-center gap-6'>
                            {/* Mobile user icon */}
                            {isUserLoggedIn && (
                                <button className='text-gray-600 lg:hidden hover:text-green-600' onClick={handleMobileUser}>
                                    <FaRegCircleUser size={24}/>
                                </button>
                            )}

                            {/* Desktop actions */}
                            <div className='hidden lg:flex items-center gap-6'>
                                {/* Account dropdown */}
                                {user?._id ? (
                                    <div className='relative' ref={menuRef}>
                                        <button 
                                            onClick={() => setOpenUserMenu(prev => !prev)} 
                                            className='flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200'
                                        >
                                            <div className='w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
                                                {user.name ? user.name.charAt(0).toUpperCase() : user.mobile?.charAt(0) || 'U'}
                                            </div>
                                            <span className='text-sm font-medium'>Account</span>
                                            {openUserMenu ? <GoTriangleUp size={16}/> : <GoTriangleDown size={16}/>}
                                        </button>
                                        
                                        {/* Dropdown Menu with Animation */}
                                        <div 
                                            className={`absolute right-0 top-full mt-2 z-50 transition-all duration-200 origin-top-right ${
                                                openUserMenu 
                                                    ? 'opacity-100 scale-100 translate-y-0' 
                                                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                            }`}
                                        >
                                            <div className='bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden'>
                                                <UserMenu close={handleCloseUserMenu}/>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={redirectToLoginPage} 
                                        className='px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors'
                                    >
                                        Login
                                    </button>
                                )}

                                {/* Cart button - Show only if user is NOT a seller */}
                                {user?.role !== "SELLER" && isUserLoggedIn && (
                                    <button 
                                        onClick={() => setOpenCartSection(true)} 
                                        className='relative flex items-center gap-3 bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-lg text-white transition-all duration-200 shadow-sm hover:shadow-md'
                                    >
                                        <BsCart4 size={22}/>
                                        {cartItem[0] ? (
                                            <div className='flex items-center gap-2'>
                                                <div className='h-8 w-px bg-green-500'></div>
                                                <div className='text-left'>
                                                    <p className='text-xs font-medium'>{totalQty} Items</p>
                                                    <p className='text-sm font-bold'>{DisplayPriceInRupees(totalPrice)}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className='text-sm font-medium'>Cart</span>
                                        )}
                                        {cartItem[0] && (
                                            <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse'>
                                                {totalQty}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile search bar - Only show if user is logged in AND not on search page */}
            {isUserLoggedIn && !isSearchPage && (
                <div className='container mx-auto px-4 pb-3 lg:hidden'>
                    <Search/>
                </div>
            )}

            {/* Cart modal */}
            {openCartSection && (
                <DisplayCartItem close={() => setOpenCartSection(false)}/>
            )}
        </header>
    );
};

export default Header;