import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import NoData from "../components/NoData";
import SummaryApi from '../common/SummaryApi';


const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("fetch seller orders error", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-4">Loading orders...</div>;
  if (!orders || orders.length === 0) return <NoData />;

  return (
    <div className="p-4">
      <div className="bg-white shadow-md p-3 font-semibold mb-4">
        <h1>Orders from Buyers</h1>
      </div>

      {orders.map((order) => {
        const product = order.product || {};
        const buyer = order.buyer || {};
        const addr = order.address || {};
        return (
          <div key={order._id} className="order rounded p-4 mb-3 text-sm shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Order: {order.orderId || order._id}</p>
                <p className="text-xs text-gray-600">
                  Placed: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Total: ₱{order.totalAmt}</p>
                <p className="text-xs text-gray-600">{order.payment_status}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-3">
              <img
                src={
                  (product.image && (Array.isArray(product.image) ? product.image[0] : product.image)) ||
                  ""
                }
                alt={product.name || "product"}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium">{product.name || "Product"}</p>
                <p><strong>Qty:</strong> {order.quantity}</p>
                <p><strong>Buyer:</strong> {buyer.name || "N/A"}</p>
                <p><strong>Contact:</strong> {buyer.mobile || buyer.email || "N/A"}</p>
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                  <p className="font-semibold">Address</p>
                  <p>{addr.purok_house || addr.address_line || "-"}</p>
                  <p>{addr.barangay || ""} {addr.city || ""}</p>
                  <p>{addr.country || ""} {addr.zipcode || addr.pincode || ""}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SellerOrders;
