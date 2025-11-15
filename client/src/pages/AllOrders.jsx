import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'


const AllOrders = () => {
  const [buyerOrders, setBuyerOrders] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [loading, setLoading] = useState(false)


  // Fetch both buyer and seller grouped orders
  const fetchAllOrdersGrouped = async () => {
    try {
      setLoading(true)


      // Fetch by buyer
      const buyerRes = await Axios({ ...SummaryApi.getOrdersByBuyer })
      if (buyerRes.data?.success) {
        setBuyerOrders(buyerRes.data.data || [])
      } else {
        toast.error(buyerRes.data?.message || 'Failed to load buyer orders')
      }


      // Fetch by seller
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


  return (
    <section className="p-4">
      <div className="bg-white shadow-md p-3 font-semibold mb-4">
        <h1>All Orders</h1>
      </div>


      {loading && <p>Loading...</p>}


      {/* Buyer Orders Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">ORDERS BY BUYER</h2>
        {buyerOrders.length === 0 ? (
          <p className="text-gray-500">No buyer orders.</p>
        ) : (
          buyerOrders.map((group) => (
            <div key={group._id} className="bg-white p-4 mb-4 rounded shadow">
              <div className="mb-2">
                <h3 className="font-semibold">{group.buyer?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-600">{group.buyer?.email}</p>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Total Orders: {group.totalOrders} | Total Amount: ₱{group.totalAmount}
              </div>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Order ID</th>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.orders.map((order) => (
                    <tr key={order._id}>
                      <td className="border p-2">{order.orderId}</td>
                      <td className="border p-2">{order.product_details?.name || '—'}</td>
                      <td className="border p-2">₱{order.totalAmt}</td>
                      <td className="border p-2">{order.payment_status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>


      {/* Seller Orders Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">PRODUCTS SOLD BY THE SELLER</h2>
        {sellerOrders.length === 0 ? (
          <p className="text-gray-500">No seller orders.</p>
        ) : (
          sellerOrders.map((group) => (
            <div key={group._id} className="bg-white p-4 mb-4 rounded shadow">
              <div className="mb-2">
                <h3 className="font-semibold">{group.seller?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-600">{group.seller?.email}</p>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Products Sold: {group.productsSold} | Total Revenue: ₱{group.totalRevenue}
              </div>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Order ID</th>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Buyer</th>
                    <th className="border p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {group.orders.map((order) => (
                    <tr key={order._id}>
                      <td className="border p-2">{order.orderId}</td>
                      <td className="border p-2">{order.product_details?.name || '—'}</td>
                      <td className="border p-2">{order.userId?.name || '—'}</td>
                      <td className="border p-2">₱{order.totalAmt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </section>
  )
}


export default AllOrders

