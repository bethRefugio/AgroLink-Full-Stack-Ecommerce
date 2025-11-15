import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({close}) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
    
    const { fetchAddress } = useGlobalContext()

    const onSubmit = async(data)=>{
        console.log("data",data)
    
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data : {
                    purok_house :data.purok_house,
                    barangay : data.barangay,
                    city : data.city,
                    zipcode : data.zipcode,
                    country : data.country 
                }
            })

            const { data : responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto'>
                {/* Header */}
                <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl'>
                    <div>
                        <h2 className='text-xl font-semibold text-gray-900'>Add New Address</h2>
                        <p className='text-sm text-gray-500 mt-1'>Fill in the details below to add a new address</p>
                    </div>
                    <button 
                        onClick={close} 
                        className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
                        type="button"
                    >
                        <IoClose size={24}/>
                    </button>
                </div>

                {/* Form */}
                <div className='px-6 py-6'>
                    <div className='grid gap-5'>
                        {/* Street/House Number */}
                        <div className='grid gap-2'>
                            <label htmlFor='purok_house' className='text-sm font-medium text-gray-700'>
                                Street Address / House Number
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <input
                                type='text'
                                id='purok_house' 
                                placeholder='e.g., Purok 1, House No. 123'
                                className={`border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.purok_house ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                }`}
                                {...register("purok_house", { 
                                    required: "Street address is required",
                                    minLength: { value: 3, message: "Address must be at least 3 characters" }
                                })}
                            />
                            {errors.purok_house && (
                                <span className='text-xs text-red-500 mt-1'>{errors.purok_house.message}</span>
                            )}
                        </div>

                        {/* Barangay */}
                        <div className='grid gap-2'>
                            <label htmlFor='barangay' className='text-sm font-medium text-gray-700'>
                                Barangay
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <input
                                type='text'
                                id='barangay' 
                                placeholder='Enter barangay name'
                                className={`border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.barangay ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                }`}
                                {...register("barangay", { 
                                    required: "Barangay is required",
                                    minLength: { value: 2, message: "Barangay must be at least 2 characters" }
                                })}
                            />
                            {errors.barangay && (
                                <span className='text-xs text-red-500 mt-1'>{errors.barangay.message}</span>
                            )}
                        </div>

                        {/* City and Zip Code Row */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            <div className='grid gap-2'>
                                <label htmlFor='city' className='text-sm font-medium text-gray-700'>
                                    City / Municipality
                                    <span className='text-red-500 ml-1'>*</span>
                                </label>
                                <input
                                    type='text'
                                    id='city' 
                                    placeholder='Enter city'
                                    className={`border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                    }`}
                                    {...register("city", { 
                                        required: "City is required",
                                        minLength: { value: 2, message: "City must be at least 2 characters" }
                                    })}
                                />
                                {errors.city && (
                                    <span className='text-xs text-red-500 mt-1'>{errors.city.message}</span>
                                )}
                            </div>

                            <div className='grid gap-2'>
                                <label htmlFor='zipcode' className='text-sm font-medium text-gray-700'>
                                    Zip Code
                                    <span className='text-red-500 ml-1'>*</span>
                                </label>
                                <input
                                    type='text'
                                    id='zipcode' 
                                    placeholder='e.g., 9600'
                                    className={`border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                        errors.zipcode ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                    }`}
                                    {...register("zipcode", { 
                                        required: "Zip code is required",
                                        pattern: { value: /^[0-9]{4,6}$/, message: "Enter a valid zip code" }
                                    })}
                                />
                                {errors.zipcode && (
                                    <span className='text-xs text-red-500 mt-1'>{errors.zipcode.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Country */}
                        <div className='grid gap-2'>
                            <label htmlFor='country' className='text-sm font-medium text-gray-700'>
                                Country
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <input
                                type='text'
                                id='country' 
                                placeholder='e.g., Philippines'
                                className={`border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                }`}
                                {...register("country", { 
                                    required: "Country is required",
                                    minLength: { value: 2, message: "Country must be at least 2 characters" }
                                })}
                            />
                            {errors.country && (
                                <span className='text-xs text-red-500 mt-1'>{errors.country.message}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl'>
                    <button 
                        type='button'
                        onClick={close}
                        className='px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className='px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Address
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default AddAddress