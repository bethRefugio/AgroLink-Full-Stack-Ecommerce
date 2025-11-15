

import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import NoData from "../components/NoData";
import SummaryApi from '../common/SummaryApi';


const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null, orderStatus: "" });


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await Axios({
          method: SummaryApi.getSellerOrders.method,
          url: SummaryApi.getSellerOrders.url,
        });


        console.log("📦 Full API Response:", res.data);
       
        if (res?.data?.success) {
          setOrders(res.data.data || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("❌ Fetch seller orders error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };


    fetchOrders();
  }, []);


  // Toast function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };


  const handleUpdateStatus = async (orderId, newStatus) => {
    console.log("🔄 Updating order status:", { orderId, newStatus });
   
    try {
      const response = await Axios({
        method: SummaryApi.updateOrderStatus.method,
        url: SummaryApi.updateOrderStatus.url,
        data: {
          orderId: orderId,
          status: newStatus
        }
      });


      console.log("✅ Status update response:", response.data);


      if (response.data.success) {
        showToast(`Order status updated to ${newStatus}!`, "success");
        setOrders(prevOrders =>
          prevOrders.map(order =>
            (order.orderId === orderId || order._id === orderId)
              ? { ...order, order_status: newStatus }
              : order
          )
        );
      } else {
        showToast(response.data.message || 'Failed to update order status. Please try again.', "error");
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      if (error.response) {
        showToast(error.response.data.message || 'Error updating order status. Please try again.', "error");
      } else {
        showToast('Network error. Please check your connection and try again.', "error");
      }
    }
  };


  const openCancelModal = (orderId, orderStatus) => {
    setCancelModal({ show: true, orderId, orderStatus });
  };


  const closeCancelModal = () => {
    setCancelModal({ show: false, orderId: null, orderStatus: "" });
  };


  const confirmCancelOrder = async () => {
    const { orderId, orderStatus } = cancelModal;
   
    if (orderStatus !== 'Order Placed') {
      showToast('Order cannot be cancelled as it is already being processed.', "error");
      closeCancelModal();
      return;
    }


    await handleUpdateStatus(orderId, 'Cancelled');
    closeCancelModal();
  };


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
  };


  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = [
      'Order Placed',
      'Processing',
      'Ready For PickUp',
      'Out for Delivery',
      'Delivered'
    ];
   
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentStatus === 'Cancelled') return [];
   
    return statusFlow.slice(currentIndex + 1);
  };


  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }


  if (loading) return <div className="p-4">Loading orders...</div>;
  if (!orders || orders.length === 0) return <NoData />;


  return (
    <div className="p-4">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}


      {/* Cancel Confirmation Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
            </div>
           
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
           
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="bg-white shadow-md p-3 font-semibold mb-4">
        <h1>Orders from Buyers</h1>
        <p className="text-sm text-gray-600 font-normal">
          Total Orders: {orders.length}
        </p>
      </div>


      {orders.map((order) => {
        const product = order.product || {};
        const buyer = order.buyer || {};
        const addr = order.address || {};
       
        const orderStatus = order.order_status || 'Order Placed';
        const canCancel = orderStatus === 'Order Placed';
        const nextStatusOptions = getNextStatusOptions(orderStatus);
        const isCompleted = orderStatus === 'Delivered' || orderStatus === 'Cancelled';
        const isExpanded = expandedOrder === order._id;


        return (
          <div key={order._id} className="order rounded p-4 mb-3 text-sm shadow-sm bg-white border">
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
               
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                  <div>
                    <p className="text-gray-600">Buyer:</p>
                    <p>{buyer?.name || 'N/A'}</p>
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
             
              <div className="flex gap-2 items-center">
                {canCancel && (
                  <button
                    onClick={() => openCancelModal(order.orderId || order._id, orderStatus)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
               
                {!isCompleted && nextStatusOptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Update Status:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleUpdateStatus(order.orderId || order._id, e.target.value)
                        }
                      }}
                      className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Select status</option>
                      {nextStatusOptions.map(status => (
                        <option key={status} value={status}>
                          Mark as {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {isCompleted && (
                  <span className="text-gray-500 text-sm italic">
                    Order {orderStatus.toLowerCase()}
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


                  {/* Buyer Information */}
                  <div className="border rounded p-4 bg-gray-50">
                    <p className="font-semibold mb-3 text-lg">Buyer Information</p>
                    {buyer && buyer.name ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{buyer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{buyer.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mobile:</span>
                          <span className="font-medium">{buyer.mobile || "N/A"}</span>
                        </div>
                        {!buyer.mobile && (
                          <p className="text-xs text-red-500 mt-1">
                            Mobile number not provided by buyer
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-500">❌ Buyer information not available</p>
                    )}
                  </div>


                  {/* Delivery Address */}
                  {addr && Object.keys(addr).length > 0 && (
                    <div className="border rounded p-4 bg-gray-50 md:col-span-2">
                      <p className="font-semibold mb-3 text-lg">Delivery Address</p>
                      <div className="space-y-1">
                        <p className="font-medium">{addr.purok_house || addr.address_line || "-"}</p>
                        <p className="text-gray-600">
                          {addr.barangay || ""} {addr.city || ""}
                        </p>
                        <p className="text-gray-600">
                          {addr.country || ""} {addr.zipcode || addr.pincode || ""}
                        </p>
                      </div>
                    </div>
                  )}


                  {/* Order Information */}
                  <div className="border rounded p-4 bg-blue-50 md:col-span-2">
                    <p className="font-semibold mb-3 text-lg">Order Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-sm mb-2">Order Details</p>
                        <div className="space-y-1 text-sm">
                          <p>Order ID: {order.orderId}</p>
                          <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p>Last Updated: {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2">Payment & Status</p>
                        <div className="space-y-1 text-sm">
                          <p>Payment Method: {order.payment_status || 'N/A'}</p>
                          <p>Order Status: <span className={getStatusColor(orderStatus)}>{orderStatus}</span></p>
                          <p>Total Amount: ₱{order.totalAmt}</p>
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
  );
};


export default SellerOrders;



