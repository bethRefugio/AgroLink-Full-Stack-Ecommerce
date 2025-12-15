import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { FaCaretRight, FaShoppingCart, FaTag } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty_cart.webp'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import ConfirmBox from './ConfirmBox'

const DisplayCartItem = ({close}) => {
    const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()
    const [showEmptyCartConfirm, setShowEmptyCartConfirm] = useState(false)
    const [emptyingCart, setEmptyingCart] = useState(false)

    const redirectToCheckoutPage = () => {
        if(user?._id){
            navigate("/checkout")
            if(close){
                close()
            }
            return
        }
        toast("Please Login")
    }

    const handleEmptyCart = async () => {
        try {
            setEmptyingCart(true)
            
            // Delete all cart items one by one
            const deletePromises = cartItem.map(item => 
                Axios({
                    ...SummaryApi.deleteCartItem,
                    data: { _id: item._id }
                })
            )
            
            await Promise.all(deletePromises)
            
            toast.success("Cart emptied successfully")
            fetchCartItem()
            setShowEmptyCartConfirm(false)
        } catch (error) {
            toast.error("Failed to empty cart")
        } finally {
            setEmptyingCart(false)
        }
    }

    return (
        <section className='bg-black fixed top-0 bottom-0 right-0 left-0 bg-opacity-50 z-50 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-md min-h-screen max-h-screen ml-auto shadow-2xl flex flex-col'>
                {/* Header */}
                <div className='flex items-center justify-between p-5 border-b border-gray-200 bg-white sticky top-0 z-10'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                            <FaShoppingCart className='text-green-600 text-lg' />
                        </div>
                        <div>
                            <h2 className='font-bold text-gray-900 text-lg'>My Cart</h2>
                            <p className='text-xs text-gray-500'>{cartItem.length} {cartItem.length === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        {cartItem[0] && (
                            <button 
                                onClick={() => setShowEmptyCartConfirm(true)}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all'
                                title='Empty Cart'
                            >
                                <MdDeleteOutline size={20} />
                                <span className='hidden sm:inline'>Clear</span>
                            </button>
                        )}
                        <button 
                            onClick={close} 
                            className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
                        >
                            <IoClose size={24}/>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-auto bg-gray-50'>
                    {cartItem[0] ? (
                        <div className='p-4 space-y-4'>
                            {/* Savings Banner */}
                            {(notDiscountTotalPrice - totalPrice) > 0 && (
                                <div className='bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-8 h-8 bg-green-200 rounded-full flex items-center justify-center'>
                                            <FaTag className='text-green-700 text-sm' />
                                        </div>
                                        <div>
                                            <p className='text-xs text-green-700 font-medium'>Total Savings</p>
                                            <p className='text-lg font-bold text-green-800'>
                                                {DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='text-green-600'>
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            <div className='space-y-3'>
                                {cartItem.map((item, index) => (
                                    <div 
                                        key={item?._id + "cartItemDisplay"} 
                                        className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
                                    >
                                        <div className='flex gap-4'>
                                            <div className='w-20 h-20 min-w-[80px] bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                                                <img
                                                    src={item?.productId?.image[0]}
                                                    alt={item?.productId?.name}
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='text-sm font-semibold text-gray-900 line-clamp-2 mb-1'>
                                                    {item?.productId?.name}
                                                </h3>
                                                <p className='text-xs text-gray-500 mb-2'>
                                                    {item?.productId?.unit}
                                                </p>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-lg font-bold text-green-600'>
                                                        {DisplayPriceInRupees(pricewithDiscount(item?.productId?.price, item?.productId?.discount))}
                                                    </span>
                                                    {item?.productId?.discount > 0 && (
                                                        <span className='text-xs text-gray-400 line-through'>
                                                            {DisplayPriceInRupees(item?.productId?.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='flex items-start'>
                                                <AddToCartButton data={item?.productId}/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bill Details */}
                            <div className='bg-white rounded-xl p-5 shadow-sm border border-gray-100'>
                                <h3 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Bill Details
                                </h3>
                                <div className='space-y-3'>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600'>Items Total</span>
                                        <div className='flex items-center gap-2'>
                                            <span className='line-through text-gray-400 text-xs'>
                                                {DisplayPriceInRupees(notDiscountTotalPrice)}
                                            </span>
                                            <span className='font-semibold text-gray-900'>
                                                {DisplayPriceInRupees(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600'>Quantity</span>
                                        <span className='font-semibold text-gray-900'>
                                            {totalQty} {totalQty === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600'>Delivery Charge</span>
                                        <span className='font-semibold text-green-600'>Free</span>
                                    </div>
                                    <div className='pt-3 border-t border-gray-200'>
                                        <div className='flex justify-between items-center'>
                                            <span className='font-bold text-gray-900'>Grand Total</span>
                                            <span className='text-2xl font-bold text-green-600'>
                                                {DisplayPriceInRupees(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col justify-center items-center h-full p-8'>
                            <div className='w-48 h-48 mb-6'>
                                <img
                                    src={imageEmpty}
                                    alt="Empty cart"
                                    className='w-full h-full object-contain' 
                                />
                            </div>
                            <h3 className='text-xl font-bold text-gray-900 mb-2'>Your cart is empty</h3>
                            <p className='text-gray-600 text-center mb-6'>Add items to get started</p>
                            <Link 
                                onClick={close} 
                                to={"/home"} 
                                className='bg-green-600 hover:bg-green-700 px-6 py-3 text-white font-semibold rounded-lg transition-colors flex items-center gap-2'
                            >
                                <FaShoppingCart />
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer - Proceed Button */}
                {cartItem[0] && (
                    <div className='p-4 bg-white border-t border-gray-200 sticky bottom-0'>
                        <button 
                            onClick={redirectToCheckoutPage} 
                            className='w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-between px-6 shadow-lg hover:shadow-xl transition-all group'
                        >
                            <div className='flex flex-col items-start'>
                                <span className='text-xs font-normal opacity-90'>Total Amount</span>
                                <span className='text-xl'>{DisplayPriceInRupees(totalPrice)}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span>Proceed to Checkout</span>
                                <FaCaretRight className='group-hover:translate-x-1 transition-transform'/>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Empty Cart Confirmation Modal */}
            {showEmptyCartConfirm && (
                <ConfirmBox
                    cancel={() => setShowEmptyCartConfirm(false)}
                    close={() => setShowEmptyCartConfirm(false)}
                    confirm={handleEmptyCart}
                    loading={emptyingCart}
                />
            )}
        </section>
    )
}

export default DisplayCartItem