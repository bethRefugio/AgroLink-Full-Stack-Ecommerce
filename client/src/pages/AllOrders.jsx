import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { MdVisibility } from "react-icons/md"
import { IoClose } from "react-icons/io5"
import { createColumnHelper } from '@tanstack/react-table'
import DisplayTable from '../components/DisplayTable'

const AllOrders = () => {
  const [buyerOrders, setBuyerOrders] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('buyer')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const columnHelper = createColumnHelper()

  const fetchAllOrdersGrouped = async () => {
    try {
      setLoading(true)

      const buyerRes = await Axios({ ...SummaryApi.getOrdersByBuyer })
      if (buyerRes.data?.success) {
        setBuyerOrders(buyerRes.data.data || [])
      } else {
        toast.error(buyerRes.data?.message || 'Failed to load buyer orders')
      }

      const sellerRes = await Axios({ ...SummaryApi.getOrdersBySeller })
      if (sellerRes.data?.success) {
        setSellerOrders(sellerRes.data.data || [])
      } else {
        toast.error(sellerRes.data?.message || 'Failed to load seller orders')
      }
    } catch (err) {
      AxiosToastError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllOrdersGrouped()
  }, [])

  const handleViewOrders = (group) => {
    setSelectedGroup(group)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedGroup(null)
  }

  // Buyer columns
  const buyerColumns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => (
        <div className='text-gray-700 font-medium'>{row.index + 1}</div>
      )
    }),
    columnHelper.accessor('buyer.name', {
      header: 'BUYER NAME',
      cell: ({ row }) => (
        <span className='font-medium text-gray-900'>{row.original.buyer?.name || 'N/A'}</span>
      )
    }),
    columnHelper.accessor('buyer.email', {
      header: 'EMAIL',
      cell: ({ row }) => (
        <span className='text-gray-700'>{row.original.buyer?.email || 'N/A'}</span>
      )
    }),
    columnHelper.accessor('totalOrders', {
      header: 'TOTAL ORDERS',
      cell: ({ row }) => (
        <span className='text-gray-700 text-center block'>{row.original.totalOrders || 0}</span>
      )
    }),
    columnHelper.accessor('totalAmount', {
      header: 'TOTAL AMOUNT',
      cell: ({ row }) => (
        <span className='text-gray-700 text-center block font-semibold'>₱{row.original.totalAmount || 0}</span>
      )
    }),
    columnHelper.display({
      id: 'action',
      header: 'ACTION',
      cell: ({ row }) => (
        <div className='text-center'>
          <button
            className='text-blue-600 hover:text-blue-800 transition-colors'
            onClick={() => handleViewOrders(row.original)}
            title='View Orders'
          >
            <MdVisibility size={22} />
          </button>
        </div>
      )
    })
  ]

  // Seller columns
  const sellerColumns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => (
        <div className='text-gray-700 font-medium'>{row.index + 1}</div>
      )
    }),
    columnHelper.accessor('seller.name', {
      header: 'SELLER NAME',
      cell: ({ row }) => (
        <span className='font-medium text-gray-900'>{row.original.seller?.name || 'N/A'}</span>
      )
    }),
    columnHelper.accessor('seller.email', {
      header: 'EMAIL',
      cell: ({ row }) => (
        <span className='text-gray-700'>{row.original.seller?.email || 'N/A'}</span>
      )
    }),
    columnHelper.accessor('productsSold', {
      header: 'PRODUCTS SOLD',
      cell: ({ row }) => (
        <span className='text-gray-700 text-center block'>{row.original.productsSold || 0}</span>
      )
    }),
    columnHelper.accessor('totalRevenue', {
      header: 'REVENUE',
      cell: ({ row }) => (
        <span className='text-gray-700 text-center block font-semibold'>₱{row.original.totalRevenue || 0}</span>
      )
    }),
    columnHelper.display({
      id: 'action',
      header: 'ACTION',
      cell: ({ row }) => (
        <div className='text-center'>
          <button
            className='text-blue-600 hover:text-blue-800 transition-colors'
            onClick={() => handleViewOrders(row.original)}
            title='View Orders'
          >
            <MdVisibility size={22} />
          </button>
        </div>
      )
    })
  ]

  // Modal for Order Details
  const OrderDetailsModal = () => {
    if (!showModal || !selectedGroup) return null

    const isSeller = activeTab === 'seller'
    const orderColumnHelper = createColumnHelper()

    const orderColumns = [
      orderColumnHelper.display({
        id: 'serialNumber',
        header: 'No.',
        cell: ({ row }) => (
          <div className='text-gray-700 font-medium'>{row.index + 1}</div>
        )
      }),
      orderColumnHelper.accessor('orderId', {
        header: 'ORDER ID',
        cell: ({ row }) => (
          <span className='text-gray-700 font-mono text-xs'>{row.original.orderId}</span>
        )
      }),
      orderColumnHelper.accessor('product_details.name', {
        header: 'PRODUCT',
        cell: ({ row }) => (
          <span className='text-gray-700'>{row.original.product_details?.name || 'N/A'}</span>
        )
      }),
      ...(isSeller ? [
        orderColumnHelper.accessor('userId.name', {
          header: 'BUYER',
          cell: ({ row }) => (
            <span className='text-gray-700'>{row.original.userId?.name || 'N/A'}</span>
          )
        })
      ] : []),
      orderColumnHelper.accessor('totalAmt', {
        header: 'AMOUNT',
        cell: ({ row }) => (
          <span className='text-gray-700 font-semibold'>₱{row.original.totalAmt || 0}</span>
        )
      }),
      orderColumnHelper.accessor('payment_status', {
        header: 'PAYMENT',
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.payment_status === 'paid' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {row.original.payment_status || 'pending'}
          </span>
        )
      }),
      orderColumnHelper.accessor('status', {
        header: 'STATUS',
        cell: ({ row }) => (
          <span className='text-gray-700 capitalize'>{row.original.status || 'pending'}</span>
        )
      })
    ]

    const person = isSeller ? selectedGroup.seller : selectedGroup.buyer

    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col'>
          {/* Modal Header */}
          <div className='flex justify-between items-center p-6 border-b border-gray-200'>
            <div>
              <h3 className='font-semibold text-xl text-gray-900'>
                {isSeller ? 'Seller' : 'Buyer'} Order Details
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                {person?.name} ({person?.email})
              </p>
            </div>
            <button
              onClick={closeModal}
              className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <DisplayTable data={selectedGroup.orders || []} column={orderColumns} />
            </div>
          </div>

          {/* Modal Footer */}
          <div className='p-6 border-t border-gray-200 flex justify-end'>
            <button
              onClick={closeModal}
              className='px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Orders</h1>
          <p className="text-sm text-gray-500 mt-1">View all buyer and seller orders</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'buyer'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('buyer')}
          >
            List of Buyers
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'seller'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('seller')}
          >
            List of Sellers
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      )}

      {/* Buyer Orders Table */}
      {activeTab === 'buyer' && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {buyerOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No buyer orders found.</div>
          ) : (
            <DisplayTable data={buyerOrders} column={buyerColumns} />
          )}
        </div>
      )}

      {/* Seller Orders Table */}
      {activeTab === 'seller' && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {sellerOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No seller orders found.</div>
          ) : (
            <DisplayTable data={sellerOrders} column={sellerColumns} />
          )}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal />
    </section>
  )
}

export default AllOrders