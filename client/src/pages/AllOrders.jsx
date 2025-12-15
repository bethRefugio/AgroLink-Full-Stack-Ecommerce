import React, { useEffect, useState, useMemo } from 'react'
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


  // Pagination states
  const pageSize = 20
  const [buyerPage, setBuyerPage] = useState(1)
  const [sellerPage, setSellerPage] = useState(1)


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


  // PAGINATION LOGIC
  const paginate = (data, page) => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }


  const buyerTotalPages = Math.max(1, Math.ceil(buyerOrders.length / pageSize))
  const sellerTotalPages = Math.max(1, Math.ceil(sellerOrders.length / pageSize))


  const paginatedBuyer = useMemo(() => paginate(buyerOrders, buyerPage), [buyerOrders, buyerPage])
  const paginatedSeller = useMemo(() => paginate(sellerOrders, sellerPage), [sellerOrders, sellerPage])


  // BUYER COLUMNS
  const buyerColumns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => <div>{row.index + 1}</div>
    }),
    columnHelper.accessor('buyer.name', {
      header: 'BUYER NAME',
      cell: ({ row }) => <span>{row.original.buyer?.name || 'N/A'}</span>
    }),
    columnHelper.accessor('buyer.email', {
      header: 'EMAIL',
      cell: ({ row }) => <span>{row.original.buyer?.email || 'N/A'}</span>
    }),
    columnHelper.accessor('totalOrders', {
      header: 'TOTAL ORDERS',
      cell: ({ row }) => <span>{row.original.totalOrders || 0}</span>
    }),
    columnHelper.accessor('totalAmount', {
      header: 'TOTAL AMOUNT',
      cell: ({ row }) => <span className="font-semibold">₱{row.original.totalAmount || 0}</span>
    }),
    columnHelper.display({
      id: 'action',
      header: 'ACTION',
      cell: ({ row }) => (
        <button
          className="text-blue-600"
          onClick={() => handleViewOrders(row.original)}
        >
          <MdVisibility size={22} />
        </button>
      )
    })
  ]


  // SELLER COLUMNS
  const sellerColumns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => <div>{row.index + 1}</div>
    }),
    columnHelper.accessor('seller.name', {
      header: 'SELLER NAME',
      cell: ({ row }) => <span>{row.original.seller?.name || 'N/A'}</span>
    }),
    columnHelper.accessor('seller.email', {
      header: 'EMAIL',
      cell: ({ row }) => <span>{row.original.seller?.email || 'N/A'}</span>
    }),
    columnHelper.accessor('productsSold', {
      header: 'PRODUCTS SOLD',
      cell: ({ row }) => <span>{row.original.productsSold || 0}</span>
    }),
    columnHelper.accessor('totalRevenue', {
      header: 'REVENUE',
      cell: ({ row }) => <span className="font-semibold">₱{row.original.totalRevenue || 0}</span>
    }),
    columnHelper.display({
      id: 'action',
      header: 'ACTION',
      cell: ({ row }) => (
        <button
          className="text-blue-600"
          onClick={() => handleViewOrders(row.original)}
        >
          <MdVisibility size={22} />
        </button>
      )
    })
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Ready For PickUp':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }



  const OrderDetailsModal = () => {
  if (!showModal || !selectedGroup) return null

  const isSeller = activeTab === "seller"
  const orderColumnHelper = createColumnHelper()

  let orderColumns = [
    orderColumnHelper.display({
      id: "serialNumber",
      header: "No.",
      cell: ({ row }) => <div>{row.index + 1}</div>
    }),
    orderColumnHelper.accessor("orderId", {
      header: "ORDER ID",
      cell: ({ row }) => <span>{row.original.orderId}</span>
    }),
    orderColumnHelper.accessor("product_details.name", {
      header: "PRODUCT",
      cell: ({ row }) => <span>{row.original.product_details?.name || 'N/A'}</span>
    }),
    ...(isSeller
      ? [
          orderColumnHelper.accessor("userId.name", {
            header: "BUYER",
            cell: ({ row }) => (
              <span>{row.original.userId?.name || "N/A"}</span>
            )
          })
        ]
      : []),
    orderColumnHelper.accessor("totalAmt", {
      header: "AMOUNT",
      cell: ({ row }) => (
        <span className="font-semibold">₱{row.original.totalAmt}</span>
      )
    }),
    orderColumnHelper.accessor("payment_status", {
      header: "PAYMENT",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.original.payment_status === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.original.payment_status}
        </span>
      )
    }),
    orderColumnHelper.accessor("status", {
      header: "STATUS",
      cell: ({ row }) => (
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      )
    })
  ]


    const person = isSeller ? selectedGroup.seller : selectedGroup.buyer


    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">


          {/* Header */}
          <div className="p-6 border-b flex justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {isSeller ? "Seller" : "Buyer"} Order Details
              </h2>
              <p className="text-sm text-gray-500">{person?.name} ({person?.email})</p>
            </div>
            <button onClick={closeModal} className="text-gray-500">
              <IoClose size={28} />
            </button>
          </div>


          {/* Table */}
          <div className="flex-1 overflow-y-auto p-6">
            <DisplayTable data={selectedGroup.orders || []} column={orderColumns} />
          </div>


          {/* Footer */}
          <div className="p-4 border-t flex justify-end">
            <button
              className="px-4 py-2 bg-white border rounded-lg"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <section className="max-w-5xl mx-auto px-3 pb-20 sm:pb-10 overflow-x-hidden">
     
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">All Orders</h1>
          <p className="text-gray-500 text-sm">View all buyer and seller orders</p>
        </div>


        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "buyer"
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
            onClick={() => setActiveTab("buyer")}
          >
            Buyers
          </button>


          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "seller"
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
            onClick={() => setActiveTab("seller")}
          >
            Sellers
          </button>
        </div>
      </div>


      {/* Buyers Table */}
      {activeTab === "buyer" && (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            {paginatedBuyer.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No buyer orders found.</div>
            ) : (
              <DisplayTable data={paginatedBuyer} column={buyerColumns} />
            )}
          </div>


          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 mb-10 text-sm">
            <span>
              Showing{" "}
              <strong>
                {buyerOrders.length === 0 ? 0 : (buyerPage - 1) * pageSize + 1}
                {" - "}
                {Math.min(buyerPage * pageSize, buyerOrders.length)}
              </strong>{" "}
              of {buyerOrders.length}
            </span>


            <div className="flex items-center gap-2">
              <button
                disabled={buyerPage === 1}
                onClick={() => setBuyerPage(p => p - 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>Page {buyerPage} of {buyerTotalPages}</span>
              <button
                disabled={buyerPage === buyerTotalPages}
                onClick={() => setBuyerPage(p => p + 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}


      {/* Sellers Table */}
      {activeTab === "seller" && (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            {paginatedSeller.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No seller orders found.</div>
            ) : (
              <DisplayTable data={paginatedSeller} column={sellerColumns} />
            )}
          </div>


          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 mb-10 text-sm">
            <span>
              Showing{" "}
              <strong>
                {sellerOrders.length === 0 ? 0 : (sellerPage - 1) * pageSize + 1}
                {" - "}
                {Math.min(sellerPage * pageSize, sellerOrders.length)}
              </strong>{" "}
              of {sellerOrders.length}
            </span>


            <div className="flex items-center gap-2">
              <button
                disabled={sellerPage === 1}
                onClick={() => setSellerPage(p => p - 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>Page {sellerPage} of {sellerTotalPages}</span>
              <button
                disabled={sellerPage === sellerTotalPages}
                onClick={() => setSellerPage(p => p + 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}


      <OrderDetailsModal />
    </section>
  )
}


export default AllOrders

