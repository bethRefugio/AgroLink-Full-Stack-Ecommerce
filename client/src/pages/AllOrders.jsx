import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { MdVisibility, MdVisibilityOff } from "react-icons/md";


// Reusable component for inner orders table
const OrdersTable = ({ orders, isSeller }) => (
  <table className="w-full text-sm border border-gray-300 rounded">
    <thead className="bg-gray-100 border-b border-gray-300">
      <tr>
        <th className="border p-2">Order ID</th>
        <th className="border p-2">Product</th>
        {isSeller && <th className="border p-2">Buyer</th>}
        <th className="border p-2">Amount</th>
        <th className="border p-2">Payment</th>
        <th className="border p-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {orders.map((order) => (
        <tr key={order._id} className="hover:bg-gray-50 transition">
          <td className="border p-2">{order.orderId}</td>
          <td className="border p-2">{order.product_details?.name}</td>
          {isSeller && <td className="border p-2">{order.userId?.name}</td>}
          <td className="border p-2">₱{order.totalAmt}</td>
          <td className="border p-2">{order.payment_status}</td>
          <td className="border p-2 capitalize">{order.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
)


const AllOrders = () => {
  const [buyerOrders, setBuyerOrders] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedBuyer, setExpandedBuyer] = useState(null)
  const [expandedSeller, setExpandedSeller] = useState(null)
  const [activeTab, setActiveTab] = useState('buyer')


  const toggleBuyer = (id) => {
    const sid = id == null ? null : String(id)
    setExpandedBuyer((prev) => (prev === sid ? null : sid))
  }


  const toggleSeller = (id) => {
    const sid = id == null ? null : String(id)
    setExpandedSeller((prev) => (prev === sid ? null : sid))
  }


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


  const renderTable = (data, type) => {
    const isSeller = type === 'seller'
    const expanded = isSeller ? expandedSeller : expandedBuyer
    const toggle = isSeller ? toggleSeller : toggleBuyer


    return (
      <table className="w-full border border-gray-300 rounded mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">{isSeller ? 'Seller Name' : 'Buyer Name'}</th>
            <th className="border p-2">Email</th>
            <th className="border p-2 text-center">{isSeller ? 'Products Sold' : 'Total Orders'}</th>
            <th className="border p-2 text-center">{isSeller ? 'Revenue' : 'Total Amount'}</th>
            <th className="border p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-3 text-gray-500">
                {isSeller ? 'No seller orders.' : 'No buyer orders.'}
              </td>
            </tr>
          ) : (
            data.map((group) => {
              const id = String(group._id)
              return (
                <React.Fragment key={id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="border p-2 font-semibold">{isSeller ? group.seller?.name : group.buyer?.name}</td>
                    <td className="border p-2">{isSeller ? group.seller?.email : group.buyer?.email}</td>
                    <td className="border p-2 text-center">{isSeller ? group.productsSold : group.totalOrders}</td>
                    <td className="border p-2 text-center">₱{isSeller ? group.totalRevenue : group.totalAmount}</td>
                    <td className="border p-2 text-center">
                      <button
                        className="px-3 py-1 bg-blue-100 text-blue rounded hover:blue-700"
                        onClick={() => toggle(group._id)}
                      >                        
                        {expanded === id ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                      </button>
                    </td>
                  </tr>


                  {expanded === id && (
                    <tr>
                      <td colSpan="5" className="bg-white border p-3 ">
                        <div className="text-sm text-gray-600 mb-3">
                          {isSeller
                            ? `Products Sold: ${group.productsSold} | Revenue: ₱${group.totalRevenue}`
                            : `Total Orders: ${group.totalOrders} | Total Amount: ₱${group.totalAmount}`}
                        </div>


                        <OrdersTable orders={group.orders} isSeller={isSeller} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>
    )
  }


  return (
    <section className="p-4">
      <div className="bg-white shadow-md p-3 font-semibold mb-6 flex justify-between items-center">
        <h1>All Orders</h1>


        {/* TAB BUTTONS */}
        <div className="flex gap-4">
          <button
            className={`px-3 py-1 rounded ${activeTab === 'buyer' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('buyer')}
          >
            List of Buyers
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === 'seller' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('seller')}
          >
            List of Sellers
          </button>
        </div>
      </div>


      {loading && <p className="text-center">Loading...</p>}


      {/* Render only the active table */}
      {activeTab === 'buyer' && renderTable(buyerOrders, 'buyer')}
      {activeTab === 'seller' && renderTable(sellerOrders, 'seller')}
    </section>
  )
}


export default AllOrders





