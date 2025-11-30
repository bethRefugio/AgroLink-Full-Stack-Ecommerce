import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle } from "react-icons/fa"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit'
import AddAddress from '../components/AddAddress'
import EditAddressDetails from '../components/EditAddressDetails'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { setUserDetails } from '../store/userSlice'
import fetchUserDetails from '../utils/fetchUserDetails'
import isSeller from '../utils/isSeller'


const Profile = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()


  const seller = isSeller(user.role)


  const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false)
  const [openAddAddress, setOpenAddAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [prefLoading, setPrefLoading] = useState(false)


  const [userPreferences, setUserPreferences] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [allSubCategories, setAllSubCategories] = useState([])


  const [preferences, setPreferences] = useState({
    categoryId: '',
    subCategoryId: ''
  })


  const [addresses, setAddresses] = useState([])
  const [addressLoading, setAddressLoading] = useState(false)


  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || ""
  })


  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })


  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  })


  useEffect(() => {
    setUserData({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || ""
    })
  }, [user])


  useEffect(() => {
    if (seller) return


    const fetchCategories = async () => {
      try {
        const res = await Axios({ ...SummaryApi.getCategory })
        if (res.data.success) setCategories(res.data.data || [])
      } catch (e) {
        AxiosToastError(e)
      }
    }
    fetchCategories()
  }, [seller])


  useEffect(() => {
    if (seller) return


    const fetchAllSubCat = async () => {
      try {
        const res = await Axios({
          ...SummaryApi.getSubCategory,
          data: {}
        })
        if (res.data.success) setAllSubCategories(res.data.data || [])
      } catch (e) {
        AxiosToastError(e)
      }
    }
    fetchAllSubCat()
  }, [seller])


  useEffect(() => {
    if (seller) return


    const fetchSubCat = async () => {
      if (!preferences.categoryId) {
        setSubCategories([])
        setPreferences(p => ({ ...p, subCategoryId: '' }))
        return
      }
      try {
        const res = await Axios({
          ...SummaryApi.getSubCategory,
          data: { _id: preferences.categoryId }
        })
        if (res.data.success) setSubCategories(res.data.data || [])
      } catch (e) {
        AxiosToastError(e)
      }
    }
    fetchSubCat()
  }, [seller, preferences.categoryId])


  const handleOnChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.updateUserDetails,
        data: userData
      })
      if (response.data.success) {
        toast.success(response.data.message)
        const updatedUser = await fetchUserDetails()
        dispatch(setUserDetails(updatedUser.data))
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }


  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password must match")
      return
    }
    try {
      setPasswordLoading(true)
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: {
          email: user?.email,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }
      })
      if (response.data.success) {
        toast.success("Password changed successfully")
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast.error(response.data.message || "Failed to change password")
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setPasswordLoading(false)
    }
  }


  const handlePrefChange = (e) => {
    const { name, value } = e.target
    setPreferences(prev => ({ ...prev, [name]: value }))
  }


  const fetchPreferences = async () => {
    if (seller) return


    try {
      const response = await Axios({ ...SummaryApi.getPreferences })
      if (response.data.success) {
        setUserPreferences(response.data.data || [])
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }


  const handleAddPreference = async () => {
    if (!preferences.categoryId || !preferences.subCategoryId) {
      toast.error("Select category and subcategory")
      return
    }


    const categoryObj = categories.find(c => c._id === preferences.categoryId)
    const subCatObj = subCategories.find(sc => sc._id === preferences.subCategoryId)


    try {
      setPrefLoading(true)
      const response = await Axios({
        ...SummaryApi.addPreference,
        data: {
          categoryId: preferences.categoryId,
          subCategoryId: preferences.subCategoryId,
          category: categoryObj?.name,
          subCategory: subCatObj?.name
        }
      })
      if (response.data.success) {
        toast.success("Preference added!")
        setPreferences({ categoryId: '', subCategoryId: '' })
        fetchPreferences()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setPrefLoading(false)
    }
  }


  const handleDeletePreference = async (preferenceId) => {
    try {
      const res = await Axios({
        ...SummaryApi.deletePreference,
        data: { preferenceId }
      })
      if (res.data.success) {
        toast.success("Preference removed")
        setUserPreferences(prev => prev.filter(p => p._id !== preferenceId))
      } else {
        toast.error(res.data.message || "Failed to remove preference")
      }
    } catch (e) {
      AxiosToastError(e)
    }
  }


  const fetchAddresses = async () => {
    try {
      setAddressLoading(true)
      const res = await Axios({ ...SummaryApi.getAddress })
      if (res.data.success) setAddresses(res.data.data || [])
    } catch (e) {
      AxiosToastError(e)
    } finally {
      setAddressLoading(false)
    }
  }


  const handleDeleteAddress = async (id) => {
    try {
      const res = await Axios({
        ...SummaryApi.deleteAddress,
        data: { _id: id }
      })
      if (res.data.success) {
        toast.success("Address deleted")
        setAddresses(prev => prev.filter(a => a._id !== id))
      } else {
        toast.error(res.data.message || "Delete failed")
      }
    } catch (e) {
      AxiosToastError(e)
    }
  }


  useEffect(() => {
    fetchPreferences()
    fetchAddresses()
  }, [seller])




  const categoryMap = categories.reduce((acc, c) => {
    acc[c._id] = c.name
    return acc
  }, {})


  const subCategoryMap = allSubCategories.reduce((acc, s) => {
    acc[s._id] = s.name
    return acc
  }, {})


  const grouped = userPreferences.reduce((acc, pref) => {
    const categoryName = categoryMap[pref.categoryId] || pref.category || 'Unknown'
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(pref)
    return acc
  }, {})


  return (
    <div className='max-w-5xl mx-auto overflow-x-hidden py-8 px-4 lg:px-0'>
      <div className='mb-8'>
        <h1 className='text-2xl font-semibold text-gray-900 mb-1'>Account</h1>
      </div>


      {/* Header */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
        <div className='flex items-center gap-4'>
          <div className='w-20 h-20 bg-red-500 flex items-center justify-center rounded-full overflow-hidden'>
            {user?.avatar ? (
              <img alt={user?.name || "User"} src={user.avatar} className='w-full h-full object-cover' />
            ) : (
              <FaRegUserCircle size={65} className='text-white' />
            )}
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-lg text-gray-900'>{userData.name || 'User Name'}</h3>
            <p className='text-sm text-gray-600'>{user?.role}</p>
          </div>
          <button
            onClick={() => setProfileAvatarEdit(true)}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Upload new picture
          </button>
        </div>
      </div>


      {/* Personal Information */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
        <h3 className='font-semibold text-gray-900 mb-6'>Personal Information</h3>


        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm text-gray-600 mb-2'>Name</label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              value={userData.name}
              name='name'
              onChange={handleOnChange}
            />
          </div>


          <div>
            <label className='block text-sm text-gray-600 mb-2'>Mobile</label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              value={userData.mobile}
              name='mobile'
              onChange={handleOnChange}
            />
          </div>
        </div>


        <div className='mb-4'>
          <label className='block text-sm text-gray-600 mb-2'>Email</label>
          <input
            type='email'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
            value={userData.email}
            name='email'
            onChange={handleOnChange}
          />
        </div>


        <button
          onClick={handleSubmit}
          disabled={loading}
          className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>


      {/* Password */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
        <h3 className='font-semibold text-gray-900 mb-1'>Password</h3>
        <p className='text-sm text-gray-500 mb-4'>Modify your current password.</p>


        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm text-gray-600 mb-2'>Current password</label>
            <div className='relative'>
              <input
                type={showPassword.old ? "text" : "password"}
                className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                value={passwordData.oldPassword}
                onChange={e => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
              >
                {showPassword.old ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
              </button>
            </div>
          </div>


          <div>
            <label className='block text-sm text-gray-600 mb-2'>New password</label>
            <div className='relative'>
              <input
                type={showPassword.new ? "text" : "password"}
                className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                value={passwordData.newPassword}
                onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPassword.new ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
              </button>
            </div>
          </div>
        </div>


        <div className='mb-4'>
          <label className='block text-sm text-gray-600 mb-2'>Confirm new password</label>
          <div className='relative'>
            <input
              type={showPassword.confirm ? "text" : "password"}
              className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
            >
              {showPassword.confirm ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
            </button>
          </div>
        </div>


        <button
          onClick={handlePasswordChange}
          disabled={passwordLoading}
          className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {passwordLoading ? "Updating..." : "Update Password"}
        </button>
      </div>


      {/* Addresses */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
        <h3 className='font-semibold text-gray-900 mb-4 flex items-center justify-between'>
          <span>Address</span>
          <button
            onClick={() => setOpenAddAddress({ mode: 'create', data: null })}
            className='px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700'
          >
            Add Address
          </button>
        </h3>


        {addressLoading && <p className='text-sm text-gray-500'>Loading...</p>}
        {!addressLoading && addresses.length === 0 && (
          <p className='text-sm text-gray-500'>No address saved.</p>
        )}


        <div className='space-y-4'>
          {addresses.map(addr => (
            <div key={addr._id} className='border rounded-lg p-4 text-sm flex flex-col gap-2'>
              <div className='font-medium'>
                {addr.purok_house}, {addr.barangay}, {addr.city}, {addr.zipcode}, {addr.country}
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setOpenAddAddress({ mode: 'edit', data: addr })}
                  className='px-3 py-1.5 text-xs font-medium text-white bg-yellow-400 rounded hover:bg-yellow-500'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className='px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Preferences */}
      {!seller && (
        <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6 gap-3'>
          <h3 className='font-semibold text-gray-900 mb-4'>Preferences</h3>


          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm text-gray-600 mb-2'>Category</label>
              <select
                name="categoryId"
                value={preferences.categoryId}
                onChange={handlePrefChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>


            <div>
              <label className='block text-sm text-gray-600 mb-2'>SubCategory</label>
              <select
                name="subCategoryId"
                value={preferences.subCategoryId}
                onChange={handlePrefChange}
                disabled={!preferences.categoryId}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              >
                <option value="">Select SubCategory</option>
                {subCategories.map(sc => (
                  <option key={sc._id} value={sc._id}>{sc.name}</option>
                ))}
              </select>
            </div>
          </div>


          <button
            onClick={handleAddPreference}
            disabled={prefLoading}
            className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {prefLoading ? "Adding..." : "Add Preference"}
          </button>


          {Object.keys(grouped).length > 0 && (
            <div className='mt-6'>
              <h4 className='font-medium text-gray-900 mb-3'>Saved Preferences</h4>


              {Object.entries(grouped).map(([categoryName, prefs]) => (
                <div key={categoryName} className='mb-4'>
                  <h5 className='text-sm font-semibold text-gray-700 mb-2'>{categoryName}</h5>


                  <div className='flex flex-wrap gap-2'>
                    {prefs.map((pref, idx) => {
                      const subName = subCategoryMap[pref.subCategoryId] || pref.subCategory
                      return (
                        <span
                          key={pref._id || idx}
                          className='relative inline-flex items-center px-4 py-2 pr-8 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                        >
                          {subName}
                          <button
                            type="button"
                            aria-label="Remove preference"
                            onClick={() => handleDeletePreference(pref._id)}
                            className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white flex items-center justify-center text-xs leading-none'
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* EXTRA SPACE BELOW — mobile only */}
      <div className="block md:hidden h-8"></div>


      {openProfileAvatarEdit && (
        <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
      )}


      {openAddAddress?.mode === 'create' && (
        <AddAddress
          close={() => setOpenAddAddress(null)}
          fetchAddress={fetchAddresses}
        />
      )}


      {openAddAddress?.mode === 'edit' && (
        <EditAddressDetails
          close={() => setOpenAddAddress(null)}
          data={openAddAddress.data}
        />
      )}
    </div>
  )
}


export default Profile

