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
    <section className="bg-white min-h-screen">
      <div className="container mx-auto p-3 grid lg:grid-cols-[auto,1fr]">

        {/* ======================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ======================= */}
        <div
          className={`
            hidden md:block
            sticky top-0 h-screen overflow-hidden border-r
            transition-all duration-300
            ${collapsed ? 'w-20' : 'w-80'}
          `}
        >
          <UserMenu collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* ======================= */}
        {/* MAIN CONTENT */}
        {/* ======================= */}
        <div className="bg-white min-h-screen">
          {/* Mobile Menu Button + Back Button */}
          <div className="sticky top-0 bg-white z-10 border-b mb-4 px-4 py-3 flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-700 text-lg font-medium flex items-center gap-2"
            >
              ☰ Menu
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group ml-auto"
              title="Go back"
            >
              <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          <div className="px-4 pb-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* ======================= */}
      {/* MOBILE MENU OVERLAY */}
      {/* ======================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ======================= */}
      {/* MOBILE SLIDE-IN MENU */}
      {/* ======================= */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl
          transform transition-transform duration-300 md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close Button */}
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="font-semibold text-gray-800">Menu</h3>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-600 text-2xl hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Menu Content */}
        <div className="h-[calc(100vh-65px)] overflow-hidden">
          <UserMenu close={() => setMobileOpen(false)} collapsed={false} />
        </div>
      </div>
    </section>
  )
}

export default Dashboard