import React, { useState } from 'react'
import EditProductAdmin from './EditProductAdmin'
import { IoClose } from 'react-icons/io5'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleDeleteCancel = () => {
    setOpenDelete(false)
  }

  const handleDelete = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: { _id: data._id },
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        if (fetchProductData) fetchProductData()
        setOpenDelete(false)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-72'>
      
      <div className='h-36 bg-gray-100 flex items-center justify-center p-2'>
        <img
          src={data?.image?.[0]}
          alt={data?.name}
          className='w-full h-full object-contain'
        />
      </div>

      <div className='flex-1 flex flex-col items-center justify-center p-3 border-t border-gray-200'>
        <p className='font-bold text-sm text-center truncate w-full' title={data?.name}>
          {data?.name}
        </p>
        <p className='text-slate-500 text-xs mt-1'>{data?.unit}</p>
      </div>

      <div className='flex gap-2 p-3 border-t border-gray-200 mt-auto'>
        <button
          onClick={() => setEditOpen(true)}
          className='flex-1 bg-green-100 hover:bg-green-200 text-green-600 font-medium py-2 rounded text-xs transition-colors'
        >
          Edit
        </button>
        <button
          onClick={() => setOpenDelete(true)}
          className='flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 rounded text-xs transition-colors'
        >
          Delete
        </button>
      </div>


      {editOpen && (
        <EditProductAdmin
          fetchProductData={fetchProductData}
          data={data}
          close={() => setEditOpen(false)}
        />
      )}

      {openDelete && (
        <section className='fixed inset-0 bg-neutral-600 bg-opacity-70 z-50 p-4 flex justify-center items-center'>
          <div className='bg-white p-4 w-full max-w-md rounded-md'>
            <div className='flex items-center justify-between gap-4'>
              <h3 className='font-semibold'>Permanent Delete</h3>
              <button onClick={() => setOpenDelete(false)}>
                <IoClose size={25} />
              </button>
            </div>
            <p className='my-3 text-sm text-gray-700'>
              Are you sure you want to permanently delete this product?
            </p>
            <div className='flex justify-end gap-3 pt-3'>
              <button
                onClick={handleDeleteCancel}
                className='border px-3 py-1 rounded bg-red-100 border-red-500 text-red-500 hover:bg-red-200 text-sm'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='border px-3 py-1 rounded bg-green-100 border-green-500 text-green-500 hover:bg-green-200 text-sm'
              >
                Delete
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductCardAdmin
