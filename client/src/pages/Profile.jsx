import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle } from "react-icons/fa";
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit';
import AddAddress from '../components/AddAddress';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Profile = () => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()

    const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false)
    const [openAddAddress, setOpenAddAddress] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [userPreferences, setUserPreferences] = useState([]);

    const [userData, setUserData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
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

    // Update user data when Redux state changes
    useEffect(() => {
        setUserData({
            name: user.name,
            email: user.email,
            mobile: user.mobile
        })
    }, [user])

    // Handle profile input change
    const handleOnChange = (e) => {
        const { name, value } = e.target
        setUserData(prev => ({ ...prev, [name]: value }))
    }

    // Save profile details
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data: userData
            })
            const { data: responseData } = response
            if (responseData.success) {
                toast.success(responseData.message)
                const updatedUser = await fetchUserDetails()
                dispatch(setUserDetails(updatedUser.data))
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    // Change password
    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirm password must match")
            return
        }

        try {
            setPasswordLoading(true)

            // Reuse ResetPassword API
            const response = await Axios({
                ...SummaryApi.resetPassword,
                data: {
                    email: user.email,             // send current user email
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

    // Preferences form inside Profile component
    const [preferences, setPreferences] = useState({ category: "", subCategory: "" })
    const [prefLoading, setPrefLoading] = useState(false)

    const handlePrefChange = (e) => {
        const { name, value } = e.target
        setPreferences(prev => ({ ...prev, [name]: value }))
    }

    const handleAddPreference = async (e) => {
        e.preventDefault()
        if (!preferences.category || !preferences.subCategory) return toast.error("Select category & subcategory")

        try {
            setPrefLoading(true)
            const response = await Axios({
                ...SummaryApi.addPreference, // Use the spread operator to include method, url, etc.
                data: preferences
            })

            if (response.data.success) {
                toast.success("Preference added!")
                setPreferences({ category: "", subCategory: "" })
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setPrefLoading(false)
        }
    }

    useEffect(() => {
      const fetchPreferences = async () => {
        try {
          const response = await Axios({ ...SummaryApi.getPreferences });
          console.log("🟢 Preferences API Response:", response.data); // 👈 ADD THIS

          if (response.data.success) {
            setUserPreferences(response.data.data);
          } else {
            toast.error(response.data.message || "Failed to load preferences");
          }
        } catch (error) {
          AxiosToastError(error);
        }
      };

      fetchPreferences();
    }, []);

    return (
  <div className='relative p-4'>

    {/* Profile Avatar */}
    <div className='w-20 h-20 bg-red-500 flex items-center justify-center rounded-full overflow-hidden drop-shadow-sm'>
      {user.avatar ? (
        <img alt={user.name} src={user.avatar} className='w-full h-full' />
      ) : (
        <FaRegUserCircle size={65} />
      )}
    </div>

    <button
      onClick={() => setProfileAvatarEdit(true)}
      className='text-sm min-w-20 border border-primary-100 hover:border-primary-200 hover:bg-primary-200 px-3 py-1 rounded-full mt-3'
    >
      Edit
    </button>

    {/* Profile Content (everything else) */}
    <div className={`transition-all duration-300 ${openProfileAvatarEdit ? "blur-sm pointer-events-none select-none" : ""}`}>
      {/* User Details Form */}
      <form className='my-4 grid gap-4' onSubmit={handleSubmit}>
        <div className='grid'>
          <label>Name</label>
          <input
            type='text'
            placeholder='Enter your name'
            className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded'
            value={userData.name}
            name='name'
            onChange={handleOnChange}
            required
          />
        </div>

        <div className='grid'>
          <label>Email</label>
          <input
            type='email'
            placeholder='Enter your email'
            className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded'
            value={userData.email}
            name='email'
            onChange={handleOnChange}
            required
          />
        </div>

        <div className='grid'>
          <label>Mobile</label>
          <input
            type='text'
            placeholder='Enter your mobile'
            className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded'
            value={userData.mobile}
            name='mobile'
            onChange={handleOnChange}
            required
          />
        </div>

        <div className='grid'>
          <label>Address</label>
          <button
            type="button"
            onClick={() => setOpenAddAddress(true)}
            className='border px-3 py-2 rounded bg-blue-50 hover:bg-primary-100 text-left'
          >
            Add Address
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className='border px-4 py-2 font-semibold hover:bg-primary-100 border-primary-100 text-primary-200 hover:text-neutral-800 rounded'
        >
          {loading ? "Loading..." : "Save Profile"}
        </button>
      </form>

      {/* Change Password Form */}
      <form className='my-4 grid gap-4' onSubmit={handlePasswordChange}>
        <h2 className='font-semibold text-lg'>Change Password</h2>

        <div className='grid'>
          <label>Current Password</label>
          <div className='relative'>
            <input
              type={showPassword.old ? "text" : "password"}
              placeholder='Enter current password'
              className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded w-full'
              value={passwordData.oldPassword}
              onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2 text-gray-600"
              onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
            >
              {showPassword.old ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div className='grid'>
          <label>New Password</label>
          <div className='relative'>
            <input
              type={showPassword.new ? "text" : "password"}
              placeholder='Enter new password'
              className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded w-full'
              value={passwordData.newPassword}
              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2 text-gray-600"
              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
            >
              {showPassword.new ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div className='grid'>
          <label>Confirm New Password</label>
          <div className='relative'>
            <input
              type={showPassword.confirm ? "text" : "password"}
              placeholder='Confirm new password'
              className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded w-full'
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2 text-gray-600"
              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
            >
              {showPassword.confirm ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordLoading}
          className={`border px-4 py-2 font-semibold rounded ${
            passwordLoading
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "hover:bg-primary-100 border-primary-100 text-primary-200 hover:text-neutral-800"
          }`}
        >
          {passwordLoading ? "Changing..." : "Change Password"}
        </button>
      </form>

      {/* Add Preferences Form */}
      <form className="my-4 grid gap-4" onSubmit={handleAddPreference}>
        <h2 className="font-semibold text-lg">Add Preferences</h2>

        <div className="grid">
          <label>Category</label>
          <select name="category" value={preferences.category} onChange={handlePrefChange} className="p-2 rounded border bg-blue-50">
            <option value="">Select Category</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
          </select>
        </div>

        <div className="grid">
          <label>SubCategory</label>
          <select name="subCategory" value={preferences.subCategory} onChange={handlePrefChange} className="p-2 rounded border bg-blue-50">
            <option value="">Select SubCategory</option>
            {preferences.category === "Fruits" && <>
              <option value="Citrus">Citrus</option>
              <option value="Berries">Berries</option>
            </>}
            {preferences.category === "Vegetables" && <>
              <option value="Leafy">Leafy</option>
              <option value="Root">Root</option>
            </>}
          </select>
        </div>

        <button
          type="submit"
          disabled={prefLoading}
          className={`border px-4 py-2 font-semibold rounded ${prefLoading ? "bg-gray-500" : "hover:bg-primary-100 border-primary-100 text-primary-200 hover:text-neutral-800"}`}
        >
          {prefLoading ? "Adding..." : "Add Preference"}
        </button>
      </form>
    </div>

    {/* Saved Preferences Section */}
    <div className="my-6">
      <h2 className="font-semibold text-lg mb-3">Saved Preferences</h2>
      {userPreferences.length === 0 ? (
        <p className="text-gray-500 text-sm">No preferences saved yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-left px-3 py-2">SubCategory</th>
              </tr>
            </thead>
            <tbody>
              {userPreferences.map((pref, index) => (
                <tr key={pref._id} className="border-t">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">{pref.category}</td>
                  <td className="px-3 py-2">{pref.subCategory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>


    {/* Avatar Modal */}
    {openProfileAvatarEdit && (
      <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
    )}

    {/* Address Modal */}
    {openAddAddress && (
      <AddAddress close={() => setOpenAddAddress(false)} />
    )}
  </div>
)
}
export default Profile;
