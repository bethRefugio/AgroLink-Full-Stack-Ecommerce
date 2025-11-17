import React, { useEffect, useState } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import DisplayTable from '../components/DisplayTable'
import { createColumnHelper } from '@tanstack/react-table'
import ViewImage from '../components/ViewImage'
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import EditSubCategory from '../components/EditSubCategory'
import CofirmBox from '../components/CofirmBox'
import toast from 'react-hot-toast'
import { IoSearch } from "react-icons/io5";

const SubCategoryPage = () => {
  const [openAddSubCategory,setOpenAddSubCategory] = useState(false)
  const [data,setData] = useState([]) 
  const [filteredData, setFilteredData] = useState([])
  const [loading,setLoading] = useState(false)
  const columnHelper = createColumnHelper()
  const [ImageURL,setImageURL] = useState("")
  const [openEdit,setOpenEdit] = useState(false)
  const [editData,setEditData] = useState({
    _id : ""
  })
  const [deleteSubCategory,setDeleteSubCategory] = useState({
      _id : ""
  })
  const [openDeleteConfirmBox,setOpenDeleteConfirmBox] = useState(false)
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false)
  const [selectedDescription, setSelectedDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchSubCategory = async()=>{
    try {
        setLoading(true)
        const response = await Axios({
          ...SummaryApi.getSubCategory
        })
        const { data : responseData } = response

        if(responseData.success){
          console.log("SubCategory Data:", responseData.data) 
          responseData.data.forEach((item, index) => {
           console.log(`Item ${index}:`, item.name, "Description:", item.description)
        })
          setData(responseData.data)
          setFilteredData(responseData.data)
        }
    } catch (error) {
       AxiosToastError(error)
    } finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchSubCategory()
  },[])

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.some(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }, [searchTerm, data])

  const DescriptionModal = () => {
    return (
      <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4'>
        <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full'>
          <div className='flex justify-between items-center p-6 border-b border-gray-200'>
            <h3 className='font-semibold text-lg text-gray-900'>Description</h3>
            <button 
              onClick={() => setOpenDescriptionModal(false)}
              className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
          <div className='p-6 max-h-96 overflow-y-auto'>
            <p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>
              {selectedDescription || "No description provided"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const column = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => (
        <div className='text-gray-700 font-medium'>{row.index + 1}</div>
      )
    }),
    columnHelper.accessor('name',{
      header : "SUB CATEGORY",
      cell: ({row}) => (
        <div className='flex items-center gap-3'>
          <img 
            src={row.original.image}
            alt={row.original.name}
            className='w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-200'
            onClick={()=>{
              setImageURL(row.original.image)
            }}      
          />
          <span className='font-medium text-gray-900'>{row.original.name}</span>
        </div>
      )
    }),
    columnHelper.accessor("category",{
       header : "CATEGORY",
       cell : ({row})=>{
        return(
          <div className='text-gray-700'>
            {
              row.original.category.map((c,index)=>{
                return(
                  <span key={c._id+"table"}>
                    {c.name}{index < row.original.category.length - 1 ? ', ' : ''}
                  </span>
                )
              })
            }
          </div>
        )
       }
    }),
    columnHelper.accessor('description',{
      header : "DESCRIPTION",
      cell : ({row})=>{
        const description = row.original.description || "No description provided"
        const isLongDescription = description.length > 60
        
        return (
          <div className='max-w-[400px]'>
            <div className='text-gray-600 truncate' title={description}>
              {description}
            </div>
            {isLongDescription && (
              <button 
                onClick={() => {
                  setSelectedDescription(description)
                  setOpenDescriptionModal(true)
                }}
                className='text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                See More
              </button>
            )}
          </div>
        )
      }
    }),
    columnHelper.accessor("_id",{
      header : "ACTION",
      cell : ({row})=>{
        return(
          <div className='flex items-center gap-3'>
              <button 
                onClick={()=>{
                    setOpenEdit(true)
                    setEditData(row.original)
                }} 
                className='text-gray-500 hover:text-gray-700 transition-colors'
                title='Edit'
              >
                  <HiPencil size={22}/>
              </button>
              <button 
                onClick={()=>{
                  setOpenDeleteConfirmBox(true)
                  setDeleteSubCategory(row.original)
                }} 
                className='text-gray-500 hover:text-gray-700 transition-colors'
                title='Delete'
              >
                  <MdDelete size={22}/>
              </button>
          </div>
        )
      }
    })
  ]

  const handleDeleteSubCategory = async()=>{
      try {
          const response = await Axios({
              ...SummaryApi.deleteSubCategory,
              data : deleteSubCategory
          })

          const { data : responseData } = response

          if(responseData.success){
             toast.success(responseData.message)
             fetchSubCategory()
             setOpenDeleteConfirmBox(false)
             setDeleteSubCategory({_id : ""})
          }
      } catch (error) {
        AxiosToastError(error)
      }
  }

  return (
    <section className='max-w-5xl mx-auto'>
      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900 mb-1'>Sub Category</h1>
        <p className='text-sm text-gray-500'>Manage your product sub categories</p>
      </div>

      {/* Search and Actions Bar */}
      <div className='bg-white p-4 mb-6 flex items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-xs'>
          <IoSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        
        <div className='flex items-center gap-3'>
          <button className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4' />
            </svg>
            Sort
          </button>
          
          <button className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
            </svg>
            Filter
          </button>
          
          <button 
            onClick={()=>setOpenAddSubCategory(true)} 
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <DisplayTable
            data={filteredData}
            column={column}
          />
        </div>
      </div>

      {/* Results Info */}
      {searchTerm && (
        <div className='mt-4 text-sm text-gray-600'>
          Showing {filteredData.length} of {data.length} results
        </div>
      )}

      {/* Modals */}
      {
        openAddSubCategory && (
          <UploadSubCategoryModel 
            close={()=>setOpenAddSubCategory(false)}
            fetchData={fetchSubCategory}
          />
        )
      }

      {
        ImageURL &&
        <ViewImage url={ImageURL} close={()=>setImageURL("")}/>
      }

      {
        openEdit && 
        <EditSubCategory 
          data={editData} 
          close={()=>setOpenEdit(false)}
          fetchData={fetchSubCategory}
        />
      }

      {
        openDeleteConfirmBox && (
          <CofirmBox 
            cancel={()=>setOpenDeleteConfirmBox(false)}
            close={()=>setOpenDeleteConfirmBox(false)}
            confirm={handleDeleteSubCategory}
          />
        )
      }

      {
        openDescriptionModal && (
          <DescriptionModal />
        )
      }
    </section>
  )
}

export default SubCategoryPage;