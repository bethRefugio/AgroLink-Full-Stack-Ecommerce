import React, { useMemo } from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'


import phZipCodes from '../data/ph-zip-codes.json';


// List of Mindanao provinces
const mindanaoProvinces = [
  "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay",
  "Bukidnon", "Lanao del Norte", "Lanao del Sur", "Misamis Occidental",
  "Misamis Oriental", "Davao del Norte", "Davao del Sur", "Davao de Oro",
  "Davao Occidental", "North Cotabato", "South Cotabato", "Sultan Kudarat",
  "Agusan del Norte", "Agusan del Sur", "Surigao del Norte", "Surigao del Sur",
  "Maguindanao", "Sarangani", "Basilan", "Sulu", "Tawi-Tawi", "Camiguin", "Dinagat Islands"
];


const AddAddress = ({ close }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()
  const { fetchAddress } = useGlobalContext()


  // Filter ZIP codes to only Mindanao cities/municipalities
  const cityProvinceList = useMemo(() => {
    const parsed = phZipCodes
      .map(item => {
        // Extract city and province from "PH - Province CityName" format
        const parts = item.area.split(" - ")[1].trim();
        const words = parts.split(" ");
        const city = words.pop();
        const province = words.join(" ");
        return { city, province, zip: item.zip }
      })
      .filter(item => mindanaoProvinces.includes(item.province)); // Mindanao only


    // Remove duplicates
    const unique = parsed.filter((value, index, self) =>
      index === self.findIndex(t => t.city === value.city && t.province === value.province)
    );


    return unique;
  }, []);


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


  const onSubmit = async (data) => {
    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: {
          purok_house: data.purok_house,
          barangay: data.barangay,
          city: data.city,
          province: data.province,
          zipcode: data.zipcode,
          country: data.country
        }
      });


      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message)
        close()
        reset()
        fetchAddress()
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
          <button onClick={close} className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors' type="button">
            <IoClose size={24} />
          </button>
        </div>


        {/* Form */}
        <div className='px-6 py-6'>
          <div className='grid gap-5'>
            {/* House Number */}
            <div className='grid gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Street Address / House Number <span className='text-red-500 ml-1'>*</span>
              </label>
              <input
                type='text'
                placeholder='e.g., Purok 1, House No. 123'
                className={`border px-4 py-2.5 rounded-lg ${errors.purok_house ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                {...register("purok_house", { required: "Street address is required" })}
              />
            </div>


            {/* Barangay */}
            <div className='grid gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Barangay <span className='text-red-500 ml-1'>*</span>
              </label>
              <input
                type='text'
                placeholder='Enter barangay'
                className={`border px-4 py-2.5 rounded-lg ${errors.barangay ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                {...register("barangay", { required: "Barangay is required" })}
              />
            </div>


            {/* City + Province */}
            <div className='grid gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                City / Municipality <span className='text-red-500 ml-1'>*</span>
              </label>
              <select
                className='border px-4 py-2.5 rounded-lg border-gray-300'
                {...register("city", { required: "City is required" })}
                onChange={handleCitySelect}
              >
                <option value="">Select City/Municipality</option>
                {cityProvinceList.map(item => (
                  <option key={`${item.city}-${item.province}`} value={item.city}>
                    {item.city}, {item.province}
                  </option>
                ))}
              </select>
            </div>


            {/* Hidden Province Field */}
            <input type="hidden" {...register("province")} />


            {/* ZIP Code */}
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
            </div>


            {/* Country */}
            <div className='grid gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Country <span className='text-red-500 ml-1'>*</span>
              </label>
              <input
                type='text'
                defaultValue="Philippines"
                className='border px-4 py-2.5 rounded-lg border-gray-300'
                {...register("country", { required: "Country is required" })}
                readOnly
              />
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className='sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3'>
          <button type='button' onClick={close} className='px-5 py-2.5 text-sm font-medium bg-white border rounded-lg'>
            Cancel
          </button>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg'>
            Save Address
          </button>
        </div>
      </div>
    </section>
  )
}


export default AddAddress;



