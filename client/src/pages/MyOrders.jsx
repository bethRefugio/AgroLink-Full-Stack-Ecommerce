import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'


const MyOrders = () => {
  const orders = useSelector(state => state.orders?.order || [])
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('')


  console.log("order Items", orders)


  const handleCancelClick = (orderId, currentStatus) => {
    setSelectedOrder(orderId)
    setSelectedOrderStatus(currentStatus)
    setShowCancelModal(true)
  }


  const handleCancelConfirm = async () => {
    if (!selectedOrder) return


    console.log("🔄 Cancelling order:", selectedOrder, "Current status:", selectedOrderStatus)
   
    // Check if order can be cancelled
    if (selectedOrderStatus !== 'Order Placed') {
      toast.error('Order cannot be cancelled as it is already being processed.')
      setShowCancelModal(false)
      return
    }


    try {
      console.log("📤 Sending cancellation request...")
     
      const response = await Axios({
        method: SummaryApi.updateOrderStatus.method,
        url: SummaryApi.updateOrderStatus.url,
        data: {
          orderId: selectedOrder,
          status: 'Cancelled'
        }
      })


      console.log("✅ Cancellation response:", response.data)


      if (response.data.success) {
        toast.success('Order cancelled!')
        window.location.reload()
      } else {
        toast.error(response.data.message || 'Failed to cancel order. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error cancelling order:', error)
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
        return 'text-blue-600 bg-blue-50 px-2 py-1 rounded'
      case 'Processing':
        return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded'
      case 'Out for Delivery':
        return 'text-purple-600 bg-purple-50 px-2 py-1 rounded'
      case 'Ready For PickUp':
        return 'text-orange-600 bg-orange-50 px-2 py-1 rounded'
      case 'Delivered':
        return 'text-green-600 bg-green-50 px-2 py-1 rounded'
      case 'Cancelled':
        return 'text-red-600 bg-red-50 px-2 py-1 rounded'
      default:
        return 'text-gray-600 bg-gray-50 px-2 py-1 rounded'
    }
  }


  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }


  if (!orders || orders.length === 0) return <NoData />


  return (
    <div className="p-4">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-6">Do you want to cancel this order?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelCancel}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="bg-white shadow-md p-3 font-semibold mb-4">
        <h1>My Orders</h1>
        <p className="text-sm text-gray-600 font-normal">
          Total Orders: {orders.length}
        </p>
      </div>


      {orders.map((order, index) => {
        const product = order.product_details || {};
        const address = order.delivery_address || {};
       
        // Use order_status instead of payment_status
        const orderStatus = order.order_status || 'Order Placed';
        const canCancel = orderStatus === 'Order Placed';
        const isExpanded = expandedOrder === order._id;


        return (
          <div key={order._id + index + "order"} className="order rounded p-4 mb-3 text-sm shadow-sm bg-white border">
            {/* Compact Order Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <img
                    src={
                      (product.image && (Array.isArray(product.image) ? product.image[0] : product.image)) ||
                      "/default-product.png"
                    }
                    alt={product.name || "product"}
                    className="w-12 h-12 object-cover rounded border"
                    onError={(e) => {
                      e.target.src = "/default-product.png";
                    }}
                  />
                  <div>
                    <p className="font-semibold text-lg">{product.name || "Product"}</p>
                    <p className="text-sm text-gray-600">Order: {order.orderId || order._id}</p>
                  </div>
                </div>
               
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Placed:</p>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className={`font-semibold ${getStatusColor(orderStatus)}`}>
                      {orderStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment:</p>
                    <p>{order.payment_status || 'Not specified'}</p>
                  </div>
                </div>
              </div>
             
              <div className="text-right">
                <p className="font-medium text-lg">₱{order.totalAmt}</p>
                <p className="text-sm text-gray-600">Qty: {order.quantity || 1}</p>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => toggleOrderDetails(order._id)}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {isExpanded ? 'Hide Details' : 'Order Details'}
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
             
              <div>
                {canCancel && (
                  <button
                    onClick={() => handleCancelClick(order.orderId || order._id, orderStatus)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
                {!canCancel && orderStatus !== 'Cancelled' && (
                  <span className="text-gray-500 text-sm italic">
                    Cannot cancel - order processing
                  </span>
                )}
                {orderStatus === 'Cancelled' && (
                  <span className="text-red-500 text-sm italic">
                    Order cancelled
                  </span>
                )}
              </div>
            </div>


            {/* Expanded Order Details */}
            {isExpanded && (
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Details */}
                  <div className="border rounded p-4 bg-gray-50">
                    <p className="font-semibold mb-3 text-lg">Product Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product Name:</span>
                        <span className="font-medium">{product.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium">₱{order.totalAmt / (order.quantity || 1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{order.quantity || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium text-lg">₱{order.totalAmt}</span>
                      </div>
                    </div>
                  </div>


                  {/* Order Information */}
                  <div className="border rounded p-4 bg-gray-50">
                    <p className="font-semibold mb-3 text-lg">Order Information</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{order.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Status:</span>
                        <span className={`font-medium ${getStatusColor(orderStatus)}`}>
                          {orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{order.payment_status || 'N/A'}</span>
                      </div>
                    </div>
                  </div>


                  {/* Delivery Address */}
                  {address && Object.keys(address).length > 0 && (
                    <div className="border rounded p-4 bg-gray-50 md:col-span-2">
                      <p className="font-semibold mb-3 text-lg">Delivery Address</p>
                      <div className="space-y-1">
                        <p className="font-medium">{address.purok_house || address.address_line || "-"}</p>
                        <p className="text-gray-600">
                          {address.barangay || ""} {address.city || ""}
                        </p>
                        <p className="text-gray-600">
                          {address.country || ""} {address.zipcode || address.pincode || ""}
                        </p>
                      </div>
                    </div>
                  )}


                  {/* Order Summary */}
                  <div className="border rounded p-4 bg-blue-50 md:col-span-2">
                    <p className="font-semibold mb-3 text-lg">Order Summary</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-sm mb-2">Payment Information</p>
                        <div className="space-y-1 text-sm">
                          <p>Method: {order.payment_status || 'N/A'}</p>
                          <p>Status: {orderStatus}</p>
                          <p>Total Paid: ₱{order.totalAmt}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2">Order Timeline</p>
                        <div className="space-y-1 text-sm">
                          <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p>Last Updated: {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</p>
                          <p>Order ID: {order.orderId}</p>
                        </div>
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
  )
}


export default MyOrders

