import React, { useEffect, useState } from 'react'
import UploadCategoryModel from '../components/UploadCategoryModel'
import Loading from '../components/Loading'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import EditCategory from '../components/EditCategory'
import CofirmBox from '../components/CofirmBox'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        name : "",
        image : "",
    })
    const [openConfimBoxDelete,setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory,setDeleteCategory] = useState({
        _id : ""
    })
    
    const fetchCategory = async()=>{
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getCategory
            })
            const { data : responseData } = response

            if(responseData.success){
                setCategoryData(responseData.data)
            }
        } catch (error) {
            
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchCategory()
    },[])

    const handleDeleteCategory = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data : deleteCategory
            })

            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                fetchCategory()
                setOpenConfirmBoxDelete(false)
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='max-w-5xl mx-auto'>
            {/* Page Header */}
            <div className='mb-8 flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-900 mb-1'>Category</h1>
                    <p className='text-sm text-gray-500'>Manage your product categories</p>
                </div>
                <button 
                    onClick={()=>setOpenUploadCategory(true)} 
                    className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'
                >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    Add Category
                </button>
            </div>

            {/* No Data State */}
            {
                !categoryData[0] && !loading && (
                    <NoData/>
                )
            }

            {/* Categories Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {
                    categoryData.map((category,index)=>{
                        return(
                            <div key={category._id} className='bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                                {/* Image Container */}
                                <div className='h-48 bg-gray-50 flex items-center justify-center p-4'>
                                    <img 
                                        alt={category.name}
                                        src={category.image}
                                        className='w-full h-full object-contain'
                                    />
                                </div>
                                
                                {/* Category Info */}
                                <div className='p-4 border-t border-gray-200'>
                                    <h3 className='font-semibold text-gray-900 text-center mb-3 truncate' title={category.name}>
                                        {category.name}
                                    </h3>
                                    
                                    {/* Action Buttons */}
                                    <div className='flex gap-2'>
                                        <button 
                                            onClick={()=>{
                                                setOpenEdit(true)
                                                setEditData(category)
                                            }} 
                                            className='flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors'
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={()=>{
                                                setOpenConfirmBoxDelete(true)
                                                setDeleteCategory(category)
                                            }} 
                                            className='flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            {/* Loading State */}
            {
                loading && (
                    <Loading/>
                )
            }

            {/* Modals */}
            {
                openUploadCategory && (
                    <UploadCategoryModel fetchData={fetchCategory} close={()=>setOpenUploadCategory(false)}/>
                )
            }

            {
                openEdit && (
                    <EditCategory data={editData} close={()=>setOpenEdit(false)} fetchData={fetchCategory}/>
                )
            }

            {
               openConfimBoxDelete && (
                <CofirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory}/>
               ) 
            }
        </section>
    )
}

export default CategoryPage