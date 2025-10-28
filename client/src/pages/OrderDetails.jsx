import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await Axios({
        url: `${SummaryApi.getOrderById.url}/${orderId}`,
        method: SummaryApi.getOrderById.method,
      });
      setOrder(response.data.data);
    };
    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  const checkOutDate = new Date(order.checkOutAt);
  const dateStr = checkOutDate.toLocaleDateString();
  const timeStr = checkOutDate.toLocaleTimeString();

  return (
    <div className="order-details">
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order.orderId}</p>
      <p><strong>Check Out Date:</strong> {dateStr}</p>
      <p><strong>Check Out Time:</strong> {timeStr}</p>
      <div>
        <h3>Product Details</h3>
        <p>Name: {order.product_details?.name}</p>
        <p>Quantity: {order.quantity || 1}</p>
        <p>Seller: {order.productId?.userId?.name || "N/A"}</p>
        <p>Payment Status: {order.payment_status}</p>
        <p>Subtotal: ₹{order.subTotalAmt}</p>
      </div>
      <p><strong>Total Amount:</strong> ₹{order.totalAmt}</p>
    </div>
  );
};

export default OrderDetails;