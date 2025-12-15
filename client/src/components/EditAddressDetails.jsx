import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'




import phZipCodes from '../data/ph-zip-codes.json'




// List of Mindanao provinces (same list as AddAddress)
const mindanaoProvinces = [
  "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay",
  "Bukidnon", "Lanao del Norte", "Lanao del Sur", "Misamis Occidental",
  "Misamis Oriental", "Davao del Norte", "Davao del Sur", "Davao de Oro",
  "Davao Occidental", "North Cotabato", "South Cotabato", "Sultan Kudarat",
  "Agusan del Norte", "Agusan del Sur", "Surigao del Norte", "Surigao del Sur",
  "Maguindanao", "Sarangani", "Basilan", "Sulu", "Tawi-Tawi", "Camiguin", "Dinagat Islands"
];




const EditAddressDetails = ({ close, data }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()




  const { fetchAddress } = useGlobalContext()




  // Build Mindanao city/province list from ZIP data (handles multi-word city names)
  const cityProvinceListBase = useMemo(() => {
    const parsed = phZipCodes
      .map(item => {
        const area = (item.area || '').replace(/^PH\s*-\s*/i, '').trim();




        const provinceMatch = mindanaoProvinces.find(p => area.toLowerCase().startsWith(p.toLowerCase()));
        if (!provinceMatch) return null;




        let city = area.slice(provinceMatch.length).trim();
        city = city.replace(/^,?\s*-?\s*/, '');
        city = city.replace(/\s*\(.*?\)/, '').replace(/\s*,\s*incl\..*$/i, '').trim();




        if (!city) return null;




        return { city, province: provinceMatch, zip: item.zip };
      })
      .filter(Boolean);




    const unique = parsed.filter((value, index, self) =>
      index === self.findIndex(t => t.city === value.city && t.province === value.province)
    );




    unique.sort((a, b) => a.city.localeCompare(b.city));




    return unique;
  }, []);




  // If the current address city isn't in the list (older data), include it as the first option
  const cityProvinceList = useMemo(() => {
    const list = [...cityProvinceListBase];
    if (data && data.city) {
      const exists = list.find(i => i.city === data.city && (i.province === data.province || !data.province));
      if (!exists) {
        list.unshift({ city: data.city, province: data.province || '', zip: data.zipcode || '' });
      }
    }
    return list;
  }, [cityProvinceListBase, data]);


  // Search state for city dropdown (align with AddAddress)
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    if (data && data.city) {
      setSearchTerm(data.city);
    }
  }, [data]);


  const filteredCities = useMemo(() => {
    if (!searchTerm) return cityProvinceList;
    const term = searchTerm.toLowerCase();
    return cityProvinceList.filter(item =>
      item.city.toLowerCase().includes(term) ||
      (item.province || '').toLowerCase().includes(term)
    );
  }, [searchTerm, cityProvinceList]);




  // Ensure form updates whenever `data` changes
  useEffect(() => {
    if (data) {
      reset({
        _id: data._id || "",
        userId: data.userId || "",
        purok_house: data.purok_house || "",
        barangay: data.barangay || "",
        city: data.city || "",
        province: data.province || "",
        country: data.country || "",
        zipcode: data.zipcode || "",
      })
    }
  }, [data, reset])




  const onSubmit = async (formData) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateAddress,
        data: formData,
      })




      const { data: responseData } = response




      if (responseData.success) {
        toast.success(responseData.message)
        close?.()
        reset()
        fetchAddress()
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }




  // Auto-fill ZIP & province when a city is selected
  const handleCitySelect = (e) => {
    const selectedCity = e.target.value;
    setValue("city", selectedCity);




    const found = cityProvinceList.find(i => i.city === selectedCity);
    if (found) {
      setValue("zipcode", found.zip);
      setValue("province", found.province);
    }
  }




  // New: select city from filtered list (align with AddAddress)
  const handleCitySelectItem = (item) => {
    setValue("city", item.city, { shouldValidate: true });
    setValue("zipcode", item.zip, { shouldValidate: true });
    setValue("province", item.province, { shouldValidate: true });
    setSearchTerm(item.city);
    setShowDropdown(false);
  }


  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>Edit Address</h2>
            <p className='text-sm text-gray-500 mt-1'>Update your address details below</p>
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
              {/* City / Municipality - searchable dropdown like AddAddress */}
              <div className='grid gap-2 relative'>
                <label className='text-sm font-medium text-gray-700'>
                  City / Municipality <span className='text-red-500 ml-1'>*</span>
                </label>
                <input
                  type='text'
                  placeholder='Type your City/Municipality'
                  className={`border px-4 py-2.5 rounded-lg ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                />
                <input type="hidden" {...register("city", { required: "City is required" })} />
                <input type="hidden" {...register("province")} />


                {errors.city && <p className='text-xs text-red-500'>{errors.city.message}</p>}


                {showDropdown && filteredCities.length > 0 && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10'>
                    {filteredCities.map(item => (
                      <button
                        key={`${item.city}-${item.province}`}
                        type='button'
                        className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors'
                        onClick={() => handleCitySelectItem(item)}
                      >
                        <div className='font-medium text-gray-900'>{item.city}</div>
                        <div className='text-xs text-gray-500'>{item.province}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>


              {/* ZIP Code - read-only auto-filled like AddAddress */}
              <div className='grid gap-2'>
                <label className='text-sm font-medium text-gray-700'>
                  ZIP Code <span className='text-red-500 ml-1'>*</span>
                </label>
                <input
                  type='text'
                  placeholder='Auto-filled'
                  className='border px-4 py-2.5 rounded-lg border-gray-300 bg-gray-100'
                  {...register("zipcode", { required: "ZIP code is required" })}
                  readOnly
                />
                {errors.zipcode && <p className='text-xs text-red-500'>{errors.zipcode.message}</p>}
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
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Address
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}




export default EditAddressDetails





