import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import NoData from "../components/NoData";
import SummaryApi from '../common/SummaryApi';
import { FaBox, FaUser, FaMapMarkerAlt, FaCalendar, FaChevronDown, FaChevronUp, FaCreditCard } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';


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


        if (res?.data?.success) {
          setOrders(res.data.data || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };


    fetchOrders();
  }, []);


  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };


  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await Axios({
        method: SummaryApi.updateOrderStatus.method,
        url: SummaryApi.updateOrderStatus.url,
        data: {
          orderId: orderId,
          status: newStatus
        }
      });


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
        showToast(response.data.message || 'Failed to update order status.', "error");
      }
    } catch (error) {
      showToast('Network error. Please try again.', "error");
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
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }


  if (!orders || orders.length === 0) return <NoData />;


  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-4 overflow-x-hidden">
      <div className='max-w-5xl mx-auto overflow-x-hidden py-8 px-4 lg:px-0 mb-8'>


        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{toast.message}</span>
            </div>
          </div>
        )}


        {/* Cancel Modal */}
        {cancelModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-center mb-2">Cancel Order</h3>
              <p className="text-sm text-center mb-6">
                Are you sure you want to cancel this order?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg"
                >
                  Yes, Cancel
                </button>
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders from Buyers</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
              </p>
            </div>
          </div>
        </div>


        {/* Orders */}
        <div className="space-y-4">
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
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4">


                    {/* Image + Name */}
                    <div className="flex gap-3 sm:gap-4 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={(product.image && (Array.isArray(product.image) ? product.image[0] : product.image)) || "/default-product.png"}
                          alt={product.name || "product"}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = "/default-product.png")}
                        />
                      </div>


                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
                          {product.name || "Product"}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Order ID: {order.orderId || order._id.slice(-8)}
                        </p>


                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderStatus)}`}>
                          {orderStatus}
                        </span>


                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                          <FaUser className="text-gray-400" />
                          <span>{buyer?.name || 'N/A'}</span>
                        </div>
                      </div>
                    </div>


                    {/* Price */}
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


                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <FaCalendar className="text-gray-400 text-xs mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Order Date</p>
                        <p className="text-xs font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>


                    <div className="flex items-start gap-2">
                      <FaCreditCard className="text-gray-400 text-xs mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <p className="text-xs font-medium text-gray-900">
                          {order.payment_status || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>


                  {/* Actions */}
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>


                    <div className="flex flex-col sm:flex-row gap-2">
                      {canCancel && (
                        <button
                          onClick={() => openCancelModal(order.orderId || order._id, orderStatus)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Cancel Order
                        </button>
                      )}


                      {!isCompleted && nextStatusOptions.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateStatus(order.orderId || order._id, e.target.value)
                              e.target.value = ""
                            }
                          }}
                          className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                          defaultValue=""
                        >
                          <option value="" disabled>Update Status</option>
                          {nextStatusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}


                      {isCompleted && (
                        <span className="text-xs text-gray-500 italic py-2">
                          Order {orderStatus.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>


                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5 space-y-4">


                    {/* Product Details */}
                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <FaBox className="text-green-600" />
                        Product Details
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product Name</span>
                          <span className="font-medium text-gray-900">{product.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit Price</span>
                          <span className="font-medium text-gray-900">
                            ₱{(order.totalAmt / (order.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity</span>
                          <span className="font-medium text-gray-900">{order.quantity || 1}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold text-gray-900">Total Amount</span>
                          <span className="font-bold text-green-600">₱{order.totalAmt}</span>
                        </div>
                      </div>
                    </div>


                    {/* Buyer Info */}
                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <FaUser className="text-green-600" />
                        Buyer Information
                      </h4>
                      {buyer && buyer.name ? (
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name</span>
                            <span className="font-medium">{buyer.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="font-medium break-all">{buyer.email || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mobile</span>
                            <span className="font-medium">{buyer.mobile || "N/A"}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-red-600">Buyer information not available</p>
                      )}
                    </div>


                    {/* Delivery Address */}
                    {addr && Object.keys(addr).length > 0 && (
                      <div className="bg-white rounded-lg border p-4">
                        <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-green-600" />
                          Delivery Address
                        </h4>
                        <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{addr.purok_house || "-"}</p>
                          <p>{addr.barangay || ""} {addr.city || ""}</p>
                          <p>{addr.country || ""} {addr.zipcode || ""}</p>
                        </div>
                      </div>
                    )}


                    {/* Timeline */}
                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <FaCalendar className="text-green-600" />
                        Order Timeline
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Placed</span>
                          <span className="font-medium">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-medium">
                            {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                          </span>
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
  );
};


export default SellerOrders;





