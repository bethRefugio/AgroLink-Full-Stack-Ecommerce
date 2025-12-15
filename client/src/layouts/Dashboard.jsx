import React, { useState } from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoArrowBack } from 'react-icons/io5'


const Dashboard = () => {
  const user = useSelector(state => state.user)
  const navigate = useNavigate()


  // Desktop collapse
  const [collapsed, setCollapsed] = useState(false)


  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false)


  return (
    <section className="bg-white">
      <div className="container mx-auto p-3 grid lg:grid-cols-[auto,1fr] h-screen overflow-hidden">


        {/* ======================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ======================= */}
        <div
          className={`
            hidden md:block
            py-4 sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto border-r
            transition-all duration-300
            ${collapsed ? 'w-20' : 'w-80'}
          `}
        >
          <UserMenu collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>


        {/* ======================= */}
        {/* MOBILE MENU + BACK BUTTON */}
        {/* ======================= */}
        <div className="md:hidden px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-700 text-lg font-medium"
              aria-label="Open menu"
            >
              ☰ Menu
            </button>


            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 text-sm font-medium"
              title="Go back"
              aria-label="Go back"
            >
              <IoArrowBack size={18} />
              <span>Back</span>
            </button>
          </div>
        </div>


        {/* ======================= */}
        {/* MOBILE MENU OVERLAY */}
        {/* ======================= */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}


        {/* ======================= */}
        {/* MOBILE SLIDE-IN MENU */}
        {/* ======================= */}
        <div
          className={`
            fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg
            transform transition-transform duration-300 md:hidden
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="p-3 flex justify-end">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>


          <div className="px-3 overflow-y-auto h-full pb-10">
            <UserMenu /> {/* MOBILE MENU VERSION */}
          </div>
        </div>


        {/* ======================= */}
        {/* RIGHT CONTENT */}
        {/* ======================= */}
        <div
          className={`bg-white h-screen overflow-y-auto transition-all duration-300
            ${collapsed ? 'lg:ml-30' : 'lg:ml-50'}
          `}
        >
          {/* Back Button (desktop only) */}
          <div className="mb-4 px-4 py-2 hidden md:block">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
              title="Go back"
            >
              <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          </div>


          <Outlet />
        </div>
      </div>
    </section>
  )
}


export default Dashboard





