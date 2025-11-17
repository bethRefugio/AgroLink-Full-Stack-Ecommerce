import React from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoArrowBack } from 'react-icons/io5'

const Dashboard = () => {
  const user = useSelector(state => state.user)
  const navigate = useNavigate()

  console.log("user dashboard",user)
  return (
    <section className='bg-white'>
        <div className='container mx-auto p-3 grid lg:grid-cols-[320px,1fr]'>
                {/**left for menu */}
                <div className='py-4 sticky top-24 max-h-[calc(100vh-96px)] overflow-y-auto hidden lg:block border-r'>
                    <UserMenu/>
                </div>

                {/**right for content */}
                <div className='bg-white min-h-[75vh]'>
                    {/* Back Button */}
                    <div className='mb-4 px-4 py-2'>
                        <button
                            onClick={() => navigate(-1)}
                            className='flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group'
                            title='Go back'
                        >
                            <IoArrowBack size={20} className='group-hover:-translate-x-1 transition-transform' />
                            <span className='font-medium'>Back</span>
                        </button>
                    </div>
                    
                    <Outlet/>
                </div>
        </div>
    </section>
  )
}

export default Dashboard