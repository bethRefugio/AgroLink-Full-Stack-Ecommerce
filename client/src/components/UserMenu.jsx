import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi"
import { FiSettings, FiPackage, FiShoppingBag, FiUsers, FiLogOut } from "react-icons/fi"
import { MdCategory, MdOutlineCategory, MdEmail, MdAttachMoney } from "react-icons/md"
import isAdmin from '../utils/isAdmin'
import isSeller from '../utils/isSeller'
import isBuyer from '../utils/isBuyer'

const UserMenu = ({ close, collapsed, setCollapsed }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [avatarError, setAvatarError] = useState(false)

  const toggleSidebar = () => {
    // Only toggle on desktop
    if (setCollapsed) {
      setCollapsed(!collapsed)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await Axios({ ...SummaryApi.logout })
      if (response.data.success) {
        if (close) close()
        dispatch(logout())
        localStorage.clear()
        toast.success(response.data.message)
        navigate("/")
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  const handleClose = () => {
    if (close) close()
  }

  const MenuItem = ({ to, icon: Icon, children, onClick }) => {
    const content = (
      <>
        <Icon size={20} className="text-gray-600 flex-shrink-0" />
        {!collapsed && <span className="flex-1 text-left">{children}</span>}
      </>
    )

    if (to) {
      return (
        <Link
          to={to}
          onClick={handleClose}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`bg-white h-full flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-full"}`}>
      {/* User Info / Avatar - Fixed at top */}
      <div 
        className={`px-4 py-3 mb-2 flex items-center gap-3 flex-shrink-0 ${setCollapsed ? 'cursor-pointer' : ''}`} 
        onClick={setCollapsed ? toggleSidebar : undefined}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          {user?.avatar && !avatarError ? (
            <img
              src={user.avatar}
              alt={user.name || user.email || 'User avatar'}
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {(user?.name || user?.mobile || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{user?.name || user?.mobile}</h3>
            <p className="text-sm text-gray-500 truncate">{user?.email || user?.mobile}</p>
          </div>
        )}

        {!collapsed && (
          <Link
            to="/dashboard/profile"
            onClick={handleClose}
            className="text-gray-400 hover:text-green-600 transition-colors flex-shrink-0"
          >
            <HiOutlineExternalLink size={18} />
          </Link>
        )}
      </div>

      {/* Role Badge - Fixed */}
      {!collapsed && user?.role && (
        <div className="px-4 mb-2 flex-shrink-0">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            user.role === "ADMIN" ? "bg-red-100 text-red-700" :
            user.role === "SELLER" ? "bg-blue-100 text-blue-700" :
            user.role === "BUYER" ? "bg-green-100 text-green-700" :
            "bg-purple-100 text-purple-700"
          }`}>
            {user.role === "ADMIN" && "Admin"}
            {user.role === "BUYER" && "Buyer"}
            {user.role === "SELLER" && "Seller"}
            {user.role === "COOPERATIVE" && "Cooperative"}
          </span>
        </div>
      )}

      <div className="h-px bg-gray-200 my-2 flex-shrink-0" />

      {/* Scrollable Menu Items - Remove flex-1 to prevent taking all space */}
      <div className="overflow-y-auto px-2 max-h-[calc(100vh-280px)]">
        <MenuItem to="/dashboard/profile" icon={FiSettings}>Account Settings</MenuItem>

        {isAdmin(user?.role) && (
          <>
            <MenuItem to="/dashboard/category" icon={MdCategory}>Category</MenuItem>
            <MenuItem to="/dashboard/subcategory" icon={MdOutlineCategory}>Sub Category</MenuItem>
            <MenuItem to="/dashboard/userstable" icon={FiUsers}>Users Table</MenuItem>
          </>
        )}

        {(isAdmin(user?.role) || isSeller(user?.role)) && (
          <>
            <MenuItem to="/dashboard/upload-product" icon={FiPackage}>Upload Product</MenuItem>
            <MenuItem to="/dashboard/product" icon={FiShoppingBag}>Products</MenuItem>
          </>
        )}
       
        {isBuyer(user?.role) && <MenuItem to="/dashboard/myorders" icon={FiShoppingBag}>My Orders</MenuItem>}
        {isSeller(user?.role) && <MenuItem to="/dashboard/seller-orders" icon={FiShoppingBag}>Orders Received</MenuItem>}
        {isAdmin(user?.role) && <MenuItem to="/dashboard/allorders" icon={FiShoppingBag}>All Orders</MenuItem>}
        {isAdmin(user?.role) && <MenuItem to="/dashboard/messages" icon={MdEmail}>Messages</MenuItem>}
        {isAdmin(user?.role) && (<MenuItem to="/dashboard/price-suggestion" icon={MdAttachMoney}>Price Suggestion</MenuItem>)}
      </div>

      <div className="h-px bg-gray-200 my-2 flex-shrink-0" />

      {/* Logout - Fixed at bottom */}
      <div className="px-2 pb-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white font-semibold shadow-md transition-colors"
        >
          <FiLogOut size={20} className="text-white flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left">Log Out</span>}
        </button>
      </div>
    </div>
  )
}

export default UserMenu