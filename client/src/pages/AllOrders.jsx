import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'

const AllOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
  const res = await Axios({ ...SummaryApi.getAllOrders })
      console.debug('AllOrders API response:', res)
      const { data } = res
      // Show API message in console for debugging
      console.debug('AllOrders payload:', data)
      if (data?.success) setOrders(data.data || [])
      else {
        toast.error(data?.message || 'Failed to load orders')
        // If unauthorized/forbidden, log to help debugging
        if (res.status === 401 || res.status === 403) console.warn('AllOrders fetch returned auth error', res.status)
      }
    } catch (err) {
      AxiosToastError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  return (
    <section className="p-4">
      <div className="bg-white shadow-md p-3 font-semibold mb-4">
        <h1>All Transactions</h1>
      </div>
      <div className="space-y-6">
        {loading && <p>Loading...</p>}

        {!loading && orders.length === 0 && (
          <p className="text-center text-gray-500">No transactions yet.</p>
        )}

        {/* Group orders by buyer and seller */}
        {!loading && orders.length > 0 && (() => {
          const buyers = {}
          const sellers = {}

          orders.forEach(o => {
            const buyer = o.userId || { _id: 'unknown', name: 'Unknown', email: '' }
            const buyerId = buyer._id || buyer
            if (!buyers[buyerId]) buyers[buyerId] = { info: buyer, orders: [] }
            buyers[buyerId].orders.push(o)

            const seller = o.productId?.userId || { _id: 'unknown', name: 'Unknown', email: '' }
            const sellerId = seller._id || seller
            if (!sellers[sellerId]) sellers[sellerId] = { info: seller, orders: [] }
            sellers[sellerId].orders.push(o)
          })

          return (
            <div className="grid gap-8">
              {/* Buyers section */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Buyer Transactions</h2>
                <div className="space-y-4">
                  {Object.values(buyers).map(b => (
                    <div key={b.info._id} className="bg-white rounded shadow-sm p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{b.info.name || '—'}</div>
                          <div className="text-xs text-gray-500">{b.info.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600">Orders: {b.orders.length}</div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-600 border-b">
                              <th className="py-2">Order ID</th>
                              <th className="py-2">Product</th>
                              <th className="py-2">Amount</th>
                              <th className="py-2">Payment</th>
                              <th className="py-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {b.orders.map(o => (
                              <tr key={o._id} className="border-b">
                                <td className="py-2">{o.orderId}</td>
                                <td className="py-2">{o.product_details?.name || o.productId?.name || '—'}</td>
                                <td className="py-2">₹{o.totalAmt ?? '—'}</td>
                                <td className="py-2">{o.payment_status || '—'}</td>
                                <td className="py-2">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sellers section */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Seller Transactions</h2>
                <div className="space-y-4">
                  {Object.values(sellers).map(s => (
                    <div key={s.info._id} className="bg-white rounded shadow-sm p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{s.info.name || '—'}</div>
                          <div className="text-xs text-gray-500">{s.info.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600">Products Sold: {s.orders.length}</div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-600 border-b">
                              <th className="py-2">Order ID</th>
                              <th className="py-2">Product</th>
                              <th className="py-2">Buyer</th>
                              <th className="py-2">Amount</th>
                              <th className="py-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.orders.map(o => (
                              <tr key={o._id} className="border-b">
                                <td className="py-2">{o.orderId}</td>
                                <td className="py-2">{o.product_details?.name || o.productId?.name || '—'}</td>
                                <td className="py-2">{o.userId?.name || '—'}</td>
                                <td className="py-2">₹{o.totalAmt ?? '—'}</td>
                                <td className="py-2">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )
        })()}
      </div>
    </section>
  )
}

export default AllOrders
