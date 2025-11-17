import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { FaMapMarkerAlt, FaPhone, FaStore, FaTruck, FaCheckCircle } from 'react-icons/fa'
import { IoAdd } from 'react-icons/io5'
import { MdArrowBack } from 'react-icons/md'

const CheckoutPage = () => {
    const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
    const addressList = useSelector(state => state.addresses.addressList)
    const cartItemsList = useSelector(state => state.cartItem.cart)
    const navigate = useNavigate()

    const [openAddress, setOpenAddress] = useState(false)
    const [selectAddress, setSelectAddress] = useState(0)
    const [isPickup, setIsPickup] = useState(false)
    const [sellerAddresses, setSellerAddresses] = useState([])  
    const [loadingSellerAddresses, setLoadingSellerAddresses] = useState(false)

    const fetchSellerPickupAddresses = async () => {
        setLoadingSellerAddresses(true);
        setSellerAddresses([]);

        const sellerIds = [...new Set(cartItemsList.map(item => item.productId.userId))];

        if (sellerIds.length === 0) {
            toast.error("No sellers found in cart.");
            setLoadingSellerAddresses(false);
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.getSellerPickupAddress,
                data: { sellerIds }
            });

            if (response.data.success && Array.isArray(response.data.data)) {
                setSellerAddresses(response.data.data);
            } else {
                toast.error(response.data.message || "No addresses found for sellers.");
                setIsPickup(false);
            }
        } catch (error) {
            AxiosToastError(error);
            setIsPickup(false);
        } finally {
            setLoadingSellerAddresses(false);
        }
    };

    useEffect(() => {
        if (isPickup && cartItemsList.length > 0) {
            fetchSellerPickupAddresses();
        }
    }, [isPickup, cartItemsList.length]);

    const getAddressIdForOrder = () => {
        if (isPickup) {
            return sellerAddresses.length > 0 ? "PICKUP_MODE" : null;
        }
        return addressList[selectAddress]?._id;
    };

    const handleCashOnDelivery = async () => {
        const addressId = getAddressIdForOrder();
        
        if (isPickup) {
            if (!sellerAddresses.length) {
                toast.error("Seller's pickup addresses are not available.");
                return;
            }
        } else {
            if (!addressList.length) {
                toast.error("Please add an address first");
                return;
            }
            if (!addressId) {
                toast.error("Please select an address before continuing");
                return;
            }
        }

        try {
            const apiEndpoint = isPickup
                ? SummaryApi.CashOnPickupOrder  
                : SummaryApi.CashOnDeliveryOrder;

            const response = await Axios({
                ...apiEndpoint,
                data: {
                    list_items: cartItemsList,
                    addressId: isPickup ? null : addressId,
                    subTotalAmt: totalPrice,
                    totalAmt: totalPrice,
                },
            });

            const { data: responseData } = response;

            if (responseData.success) {
                const message = isPickup
                    ? "Cash on Pickup Order successful"
                    : responseData.message;
                
                toast.success(message);
                
                if (isPickup && responseData.data?.pickupAddresses) {
                    console.log("Pickup addresses:", responseData.data.pickupAddresses);
                }
                
                if (fetchCartItem) fetchCartItem();
                if (fetchOrder) fetchOrder();
                
                navigate("/success", {
                    state: {
                        text: "Order",
                        pickupAddresses: isPickup ? responseData.data?.pickupAddresses : null,
                        isPickup: isPickup
                    },
                });
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    const handleOnlinePayment = async () => {
        const addressId = getAddressIdForOrder();

        if (isPickup) {
            if (!addressId) {
                toast.error("Seller's pickup address is not available.");
                return;
            }
        } else {
            if (!addressId) {
                toast.error("Please select an address before continuing");
                return;
            }
        }
        
        try {
            toast.loading("Loading...")
            const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
            const stripePromise = await loadStripe(stripePublicKey)

            const response = await Axios({
                ...SummaryApi.payment_url,
                data: {
                    list_items: cartItemsList,
                    addressId: addressId,
                    subTotalAmt: totalPrice,
                    totalAmt: totalPrice,
                }
            })

            const { data: responseData } = response

            stripePromise.redirectToCheckout({ sessionId: responseData.id })

            if (fetchCartItem) {
                fetchCartItem()
            }
            if (fetchOrder) {
                fetchOrder()
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    const renderAddressSection = () => {
        if (isPickup) {
            const AddressContent = loadingSellerAddresses ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading pickup locations...</p>
                    </div>
                </div>
            ) : sellerAddresses.length > 0 ? (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-green-800">
                                Pickup available from {sellerAddresses.length} seller{sellerAddresses.length > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                You can collect your items from the location(s) below
                            </p>
                        </div>
                    </div>
                    
                    {sellerAddresses.map((address, index) => (
                        <div
                            key={index}
                            className="bg-white border-2 border-green-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaStore className="text-green-600 text-xl" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg mb-3">
                                        {address.sellerName || `Seller #${index + 1}`}
                                    </h4>
                                    
                                    <div className="space-y-2 text-gray-700">
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">{address.purok_house || address.address_line}</p>
                                                <p className="text-sm">{address.barangay}, {address.city}</p>
                                                <p className="text-sm">{address.state || address.province}</p>
                                                <p className="text-sm">{address.country} - {address.zipcode}</p>
                                            </div>
                                        </div>
                                        
                                        {address.mobile && (
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-green-600" />
                                                <p className="font-medium">{address.mobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaStore className="text-red-600 text-2xl" />
                    </div>
                    <p className="text-red-600 font-semibold mb-2">No pickup locations available</p>
                    <p className="text-gray-600 text-sm">Please switch to delivery mode or try again later</p>
                </div>
            );

            return AddressContent;
        }

        // Delivery mode
        return (
            <div className="space-y-4">
                {addressList.map((address, index) => {
                    if (!address.status) return null;
                    
                    const isSelected = parseInt(selectAddress) === index;
                    
                    return (
                        <label
                            key={index}
                            htmlFor={"address" + index}
                            className="cursor-pointer block"
                        >
                            <div className={`border-2 rounded-xl p-5 transition-all ${
                                isSelected 
                                    ? 'border-green-600 bg-green-50 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                            }`}>
                                <div className="flex items-start gap-4">
                                    <div className="pt-1">
                                        <input
                                            id={"address" + index}
                                            type="radio"
                                            value={index}
                                            onChange={(e) => setSelectAddress(e.target.value)}
                                            name="address"
                                            checked={isSelected}
                                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start gap-2 mb-3">
                                            <FaMapMarkerAlt className={`mt-1 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="font-semibold text-gray-900">{address.address_line}</p>
                                                <p className="text-gray-700 text-sm">{address.city}, {address.state}</p>
                                                <p className="text-gray-600 text-sm">{address.country} - {address.zipcode}</p>
                                            </div>
                                        </div>
                                        {address.mobile && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaPhone className={isSelected ? 'text-green-600' : 'text-gray-400'} />
                                                <p>{address.mobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </label>
                    );
                })}
                
                <button
                    onClick={() => setOpenAddress(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                    <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-green-600">
                        <IoAdd className="text-2xl" />
                        <span className="font-medium">Add New Address</span>
                    </div>
                </button>
            </div>
        );
    };

    return (
        <section className='bg-gray-50 min-h-screen py-8'>
            <div className='container mx-auto px-4'>
              {/* Header with back on the left */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    aria-label="Back"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <MdArrowBack className="text-base" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Complete your order by choosing delivery method and payment
                </p>
              </div>

                <div className='flex flex-col lg:flex-row gap-6'>
                    {/* Left Column - Address/Pickup */}
                    <div className='flex-1'>
                        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                            {/* Mode Toggle */}
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                                    {isPickup ? (
                                        <>
                                            <FaStore className="text-green-600" />
                                            Pickup Locations
                                        </>
                                    ) : (
                                        <>
                                            <FaTruck className="text-green-600" />
                                            Delivery Address
                                        </>
                                    )}
                                </h2>
                                
                                <button
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        isPickup 
                                            ? 'bg-green-500 text-white hover:bg-green-600' 
                                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                    }`}
                                    onClick={() => setIsPickup(prev => !prev)}
                                >
                                    {isPickup ? 'Switch to Delivery' : 'Switch to Pickup'}
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                {isPickup 
                                    ? 'Collect your order from the seller\'s location' 
                                    : 'Choose where you want your order delivered'}
                            </p>

                            {/* Address/Pickup Content */}
                            {renderAddressSection()}
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className='w-full lg:w-96'>
                        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4'>
                            <h2 className='text-xl font-bold text-gray-900 mb-6'>Order Summary</h2>
                            
                            {/* Bill Details */}
                            <div className='space-y-4 pb-4 border-b border-gray-200'>
                                <div className='flex justify-between text-gray-700'>
                                    <span>Items Total</span>
                                    <div className='flex items-center gap-2'>
                                        <span className='line-through text-gray-400 text-sm'>
                                            {DisplayPriceInRupees(notDiscountTotalPrice)}
                                        </span>
                                        <span className='font-semibold'>
                                            {DisplayPriceInRupees(totalPrice)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className='flex justify-between text-gray-700'>
                                    <span>Quantity</span>
                                    <span className='font-semibold'>{totalQty} item{totalQty > 1 ? 's' : ''}</span>
                                </div>
                                
                                <div className='flex justify-between text-gray-700'>
                                    <span>{isPickup ? 'Pickup Fee' : 'Delivery Charge'}</span>
                                    <span className='font-semibold text-green-600'>Free</span>
                                </div>
                            </div>
                            
                            {/* Grand Total */}
                            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                                <span className='text-lg font-bold text-gray-900'>Grand Total</span>
                                <span className='text-2xl font-bold text-green-600'>
                                    {DisplayPriceInRupees(totalPrice)}
                                </span>
                            </div>
                            
                            {/* Payment Buttons */}
                            <div className='mt-6 space-y-3'>
                                <button
                                    className='w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    onClick={handleOnlinePayment}
                                    disabled={(isPickup && !sellerAddresses.length) || loadingSellerAddresses}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Pay Online
                                </button>

                                <button
                                    className='w-full py-3 px-4 bg-white border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    onClick={handleCashOnDelivery}
                                    disabled={(isPickup && !sellerAddresses.length) || loadingSellerAddresses}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Cash on {isPickup ? 'Pickup' : 'Delivery'}
                                </button>
                            </div>

                            {/* Security Badge */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {openAddress && (
                <AddAddress close={() => setOpenAddress(false)} />
            )}
        </section>
    )
}

export default CheckoutPage