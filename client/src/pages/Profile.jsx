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
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";

const Profile = () => {
    const user = useSelector(state => state.user)
    const [openProfileAvatarEdit,setProfileAvatarEdit] = useState(false)
    const [openAddAddress,setOpenAddAddress] = useState(false)
    const [userData,setUserData] = useState({
        name : user.name,
        email : user.email,
        mobile : user.mobile,
    })
    const [loading,setLoading] = useState(false)

    const [passwordData, setPasswordData] = useState({
        password: "",
        newPassword: "",
        confirmPassword: ""
        })
    const [passwordLoading, setPasswordLoading] = useState(false)

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    })

    const dispatch = useDispatch()

    useEffect(()=>{
        setUserData({
            name : user.name,
            email : user.email,
            mobile : user.mobile,
        })
    },[user])

    const handleOnChange  = (e)=>{
        const { name, value} = e.target 
        setUserData((preve)=>({
            ...preve,
            [name] : value
        }))
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data : userData
            })
            const { data : responseData } = response
            if(responseData.success){
                toast.success(responseData.message)
                const userData = await fetchUserDetails()
                dispatch(setUserDetails(userData.data))
            }
        } catch (error) {
            AxiosToastError(error)
        } finally{
            setLoading(false)
        }
    }

    // ✅ handle password change
    const handlePasswordChange = async(e) => {
        e.preventDefault()
        if(passwordData.newPassword !== passwordData.confirmPassword){
            toast.error("New passwords do not match")
            return
        }
        try {
            setPasswordLoading(true)
            const response = await Axios({
                ...SummaryApi.changePassword,   // make sure you have this in your API
                data: {
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                }
            })
            const { data: responseData } = response
            if(responseData.success){
                toast.success(responseData.message)
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className='p-4'>

            {/* profile avatar */}
            <div className='w-20 h-20 bg-red-500 flex items-center justify-center rounded-full overflow-hidden drop-shadow-sm'>
                {
                    user.avatar ? (
                        <img alt={user.name} src={user.avatar} className='w-full h-full'/>
                    ) : (
                        <FaRegUserCircle size={65}/>
                    )
                }
            </div>
            <button 
                onClick={()=>setProfileAvatarEdit(true)} 
                className='text-sm min-w-20 border border-primary-100 hover:border-primary-200 hover:bg-primary-200 px-3 py-1 rounded-full mt-3'>
                Edit
            </button>
            
            {openProfileAvatarEdit && (
                <UserProfileAvatarEdit close={()=>setProfileAvatarEdit(false)}/>
            )}

            {/* user details form */}
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
                    />
                </div>
                <div className='grid'>
                    <label htmlFor='email'>Email</label>
                    <input
                        type='email'
                        id='email'
                        placeholder='Enter your email' 
                        className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded'
                        value={userData.email}
                        name='email'
                        onChange={handleOnChange}
                    />
                </div>
                <div className='grid'>
                    <label htmlFor='mobile'>Mobile</label>
                    <input
                        type='text'
                        id='mobile'
                        placeholder='Enter your mobile' 
                        className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded'
                        value={userData.mobile}
                        name='mobile'
                        onChange={handleOnChange}
                    />
                </div>

                {/* Address button */}
                <div className='grid'>
                    <label>Address</label>
                    <button 
                        type="button" 
                        onClick={()=>setOpenAddAddress(true)}
                        className='border px-3 py-2 rounded bg-blue-50 hover:bg-primary-100 text-left'>
                        Add Address
                    </button>
                </div>

                <button className='border px-4 py-2 font-semibold hover:bg-primary-100 border-primary-100 text-primary-200 hover:text-neutral-800 rounded'>
                    {loading ? "Loading..." : "Save Profile"}
                </button>
            </form>

            {/* ✅ Change Password Form */}
            <form className='my-6 grid gap-4 border-t pt-4' onSubmit={handlePasswordChange}>
                <h2 className='font-semibold text-lg'>Change Password</h2>

                {/* Current Password */}
                <div className='grid'>
                <label>Current Password :</label>
                    <div className='relative'>
                        <input
                        type={showPassword.old ? "text" : "password"}   // ✅ use old, not showPassword directly
                        placeholder='Enter current password'
                        className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded w-full'
                        value={passwordData.oldPassword}
                        onChange={(e)=>setPasswordData({...passwordData, oldPassword:e.target.value})}
                        required
                        />

                        <button 
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-2 text-gray-600"
                            onClick={() => setShowPassword(prev => ({...prev, old: !prev.old}))} 
                            >
                           {showPassword.old ? <FaRegEye/> : <FaRegEyeSlash/>}
                        </button>
                    </div>
                </div>


                {/* New Password */}
                <div className='grid'>
                    <label>New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword.new ? "text" : "password"}
                            placeholder='Enter new password' 
                            className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded w-full'
                            value={passwordData.newPassword}
                            onChange={(e)=>setPasswordData({...passwordData, newPassword:e.target.value})}
                            required
                        />
                        <button 
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-2 text-gray-600"
                            onClick={()=>setShowPassword(prev => ({...prev, new: !prev.new}))}
                        >
                            {showPassword.new ? <FaRegEye/> : <FaRegEyeSlash/>}
                        </button>
                    </div>
                </div>

                {/* Confirm New Password */}
                <div className='grid'>
                    <label>Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword.confirm ? "text" : "password"}
                            placeholder='Confirm new password' 
                            className='p-2 bg-blue-50 outline-none border focus-within:border-primary-200 rounded w-full'
                            value={passwordData.confirmPassword}
                            onChange={(e)=>setPasswordData({...passwordData, confirmPassword:e.target.value})}
                            required
                        />
                        <button 
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-2 text-gray-600"
                            onClick={()=>setShowPassword(prev => ({...prev, confirm: !prev.confirm}))}
                        >
                            {showPassword.new ? <FaRegEye/> : <FaRegEyeSlash/>}
                        </button>
                    </div>
                </div>

                <button className='border px-4 py-2 font-semibold hover:bg-primary-100 border-primary-100 text-primary-200 hover:text-neutral-800 rounded'>
                    {passwordLoading ? "Changing..." : "Change Password"}
                </button>
            </form>

            {/* Address Modal */}
            {openAddAddress && (
                <AddAddress close={()=>setOpenAddAddress(false)}/>
            )}
        </div>
    )
}

export default Profile
