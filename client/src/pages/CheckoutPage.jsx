import React, { useState, useEffect } from 'react' // 👈 ADDED useEffect
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
            toast.error(response.data.message || "No pickup addresses found.");
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
            return sellerAddresses?._id;
        }
        return addressList[selectAddress]?._id;
    };


   
    const handleCashOnDelivery = async () => {
        const addressId = getAddressIdForOrder();
       
        if (isPickup) {
            if (!addressId) {
                toast.error("Seller's pickup address is not available.");
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
            const response = await Axios({
                ...SummaryApi.CashOnDeliveryOrder,
                data: {
                    list_items: cartItemsList,
                    addressId: addressId,
                    subTotalAmt: totalPrice,
                    totalAmt: totalPrice,
                },
            });


            const { data: responseData } = response;


            if (responseData.success) {
                const message = isPickup ? "Cash on Pickup Order successful" : responseData.message;
                toast.success(message);
                if (fetchCartItem) fetchCartItem();
                if (fetchOrder) fetchOrder();
                navigate("/success", {
                    state: {
                        text: "Order",
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
      <div className="text-center py-4 text-gray-500">
        Loading sellers pickup addresses...
      </div>
    ) : sellerAddresses.length > 0 ? (
      sellerAddresses.map((address, index) => (
        <div
          key={index}
          className="border rounded p-3 bg-blue-100 flex gap-3 items-start"
        >
          <div>
            <input type="radio" checked readOnly />
          </div>
          <div>
           
            <p className="font-bold text-red-600">
              Seller: {address.sellerName || `Seller #${index + 1}`} Pickup Location
            </p>
            <p>{address.purok_house || address.address_line}</p>
            <p>
              {address.barangay}, {address.city}
            </p>
            <p>
              {address.country} - {address.zipcode || address.zipcode}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-4 text-red-500">
        No pickup addresses found for sellers.
      </div>
    );


    return (
      <>
        <h3 className="text-lg font-semibold">Pickup Locations</h3>
        <div className="bg-white p-2 grid gap-4">{AddressContent}</div>
      </>
    );
  }


 
  return (
    <>
      <h3 className="text-lg font-semibold">Choose your delivery address</h3>
      <div className="bg-white p-2 grid gap-4">
        {addressList.map((address, index) => {
          return (
            <label
              key={index}
              htmlFor={"address" + index}
              className={
                !address.status ? "hidden" : "cursor-pointer"
              }
            >
              <div className="border rounded p-3 flex gap-3 hover:bg-blue-50">
                <div>
                  <input
                    id={"address" + index}
                    type="radio"
                    value={index}
                    onChange={(e) => setSelectAddress(e.target.value)}
                    name="address"
                    checked={parseInt(selectAddress) === index}
                  />
                </div>
                <div>
                  <p>{address.address_line}</p>
                  <p>{address.city}</p>
                  <p>{address.state}</p>
                  <p>
                    {address.country} - {address.zipcode}
                  </p>
                  <p>{address.mobile}</p>
                </div>
              </div>
            </label>
          );
        })}
        <div
          onClick={() => setOpenAddress(true)}
          className="h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer"
        >
          Add address
        </div>
      </div>
    </>
  );
};






    return (
        <section className='bg-blue-50'>
            <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
                <div className='w-full'>
                    {renderAddressSection()}
                </div>


                <div className='w-full max-w-md bg-white py-4 px-2'>
                    {/**summary**/}
                    <h3 className='text-lg font-semibold'>Summary</h3>
                    <div className='bg-white p-4'>
                        <h3 className='font-semibold'>Bill details</h3>
                        <div className='flex gap-4 justify-between ml-1'>
                            <p>Items total</p>
                            <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
                        </div>
                        <div className='flex gap-4 justify-between ml-1'>
                            <p>Quntity total</p>
                            <p className='flex items-center gap-2'>{totalQty} item</p>
                        </div>
                        <div className='flex gap-4 justify-between ml-1'>
                            <p>{isPickup ? 'Pickup Fee' : 'Delivery Charge'}</p>
                            <p className='flex items-center gap-2'>Free</p>
                        </div>
                        <div className='font-semibold flex items-center justify-between gap-4'>
                            <p >Grand total</p>
                            <p>{DisplayPriceInRupees(totalPrice)}</p>
                        </div>
                    </div>
                   
                   
                    <div className='w-full flex flex-col gap-4'>
                       
                        <button
                            className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white rounded'
                            onClick={handleOnlinePayment}
                            disabled={(isPickup && !sellerAddresses) || loadingSellerAddresses}
                        >
                            Online Payment ({isPickup ? 'Pickup' : 'Pickup'})
                        </button>


                       
                        <button
                            className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white'
                            onClick={handleCashOnDelivery}
                            disabled={(isPickup && !sellerAddresses) || loadingSellerAddresses}
                        >
                            Cash on {isPickup ? 'Pickup' : 'Delivery'}
                        </button>
                       
                       
                        <button
                            className={`py-2 px-4 rounded text-white font-semibold ${isPickup ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'}`}
                            onClick={() => setIsPickup(prev => !prev)}
                        >
                            {isPickup ? 'Switch to DELIVERY' : 'Switch to PICK UP'}
                        </button>
                    </div>
                </div>
            </div>




            {
                openAddress && (
                    <AddAddress close={() => setOpenAddress(false)} />
                )
            }
        </section>
    )
}


export default CheckoutPage



