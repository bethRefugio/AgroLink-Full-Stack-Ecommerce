import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { FaBox, FaMapMarkerAlt, FaCalendar, FaCreditCard, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'

const MyOrders = () => {
  const orders = useSelector(state => state.orders?.order || [])
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('')

  const handleCancelClick = (orderId, currentStatus) => {
    setSelectedOrder(orderId)
    setSelectedOrderStatus(currentStatus)
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return

    if (selectedOrderStatus !== 'Order Placed') {
      toast.error('Order cannot be cancelled as it is already being processed.')
      setShowCancelModal(false)
      return
    }

    try {
      const response = await Axios({
        method: SummaryApi.updateOrderStatus.method,
        url: SummaryApi.updateOrderStatus.url,
        data: {
          orderId: selectedOrder,
          status: 'Cancelled'
        }
      })

      if (response.data.success) {
        toast.success('Order cancelled!')
        window.location.reload()
      } else {
        toast.error(response.data.message || 'Failed to cancel order. Please try again.')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      if (error.response) {
        toast.error(error.response.data.message || 'Error cancelling order. Please try again.')
      } else {
        toast.error('Network error. Please check your connection and try again.')
      }
    } finally {
      setShowCancelModal(false)
      setSelectedOrder(null)
      setSelectedOrderStatus('')
    }
  }

  const handleCancelCancel = () => {
    setShowCancelModal(false)
    setSelectedOrder(null)
    setSelectedOrderStatus('')
  }

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

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (!orders || orders.length === 0) return <NoData />

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdCancel className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel Order</h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelCancel}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaBox className="text-green-600 text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order, index) => {
            const product = order.product_details || {};
            const address = order.delivery_address || {};
            const orderStatus = order.order_status || 'Order Placed';
            const canCancel = orderStatus === 'Order Placed';
            const isExpanded = expandedOrder === order._id;

            return (
              <div 
                key={order._id + index + "order"} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image & Info */}
                    <div className="flex gap-3 sm:gap-4 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={
                            (product.image && (Array.isArray(product.image) ? product.image[0] : product.image)) ||
                            "/default-product.png"
                          }
                          alt={product.name || "product"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/default-product.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
                          {product.name || "Product"}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Order ID: {order.orderId || order._id.slice(-8)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderStatus)}`}>
                            {orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex sm:flex-col justify-between sm:justify-start sm:items-end gap-2">
                      <div>
                        <p className="text-xs text-gray-500 sm:text-right">Total Amount</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">₱{order.totalAmt}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="text-sm font-semibold text-gray-700">{order.quantity || 1}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Meta Info - Mobile Optimized */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <FaCalendar className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Order Date</p>
                        <p className="text-xs font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaCreditCard className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <p className="text-xs font-medium text-gray-900">
                          {order.payment_status || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>
                    
                    <div className="flex gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(order.orderId || order._id, orderStatus)}
                          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      {!canCancel && orderStatus !== 'Cancelled' && (
                        <span className="text-xs text-gray-500 italic py-2">
                          Cannot cancel
                        </span>
                      )}
                      {orderStatus === 'Cancelled' && (
                        <span className="text-xs text-red-600 font-medium italic py-2">
                          Order cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
                    <div className="space-y-4">
                      {/* Product Details */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                          <FaBox className="text-green-600" />
                          Product Details
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Product Name</span>
                            <span className="font-medium text-gray-900 text-right">{product.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="font-medium text-gray-900">₱{(order.totalAmt / (order.quantity || 1)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-medium text-gray-900">{order.quantity || 1}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-100">
                            <span className="text-gray-900 font-semibold">Total Amount</span>
                            <span className="font-bold text-green-600">₱{order.totalAmt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      {address && Object.keys(address).length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-green-600" />
                            Delivery Address
                          </h4>
                          <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                            <p className="font-medium">{address.purok_house || address.address_line || "-"}</p>
                            <p>{address.barangay || ""} {address.city || ""}</p>
                            <p>{address.country || ""} {address.zipcode || address.pincode || ""}</p>
                          </div>
                        </div>
                      )}

                      {/* Order Timeline */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                          <FaCalendar className="text-green-600" />
                          Order Timeline
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Placed</span>
                            <span className="font-medium text-gray-900">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated</span>
                            <span className="font-medium text-gray-900">
                              {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default MyOrders