import { Router } from 'express'
import auth from '../middleware/auth.js'
import {
  CashOnDeliveryOrderController,
  CashOnPickupOrderController,
  getOrderDetailsController,
  getSellerOrdersController,
  paymentController,
  webhookStripe,
  getAllOrdersController,
  setupPickupAddresses,
  updateOrderStatusController,
  getOrdersGroupedByBuyer,
  getOrdersGroupedBySeller,
} from '../controllers/order.controller.js'


const orderRouter = Router()


orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.post("/cash-on-pickup", auth, CashOnPickupOrderController)
orderRouter.post('/checkout', auth, paymentController)
orderRouter.post('/webhook', webhookStripe)
orderRouter.get("/order-list", auth, getOrderDetailsController)
orderRouter.get('/allorders', auth, getAllOrdersController)
orderRouter.get('/seller-orders', auth, getSellerOrdersController)
orderRouter.post("/setup-pickup-addresses", auth, setupPickupAddresses);
orderRouter.put('/update-order-status', auth, updateOrderStatusController);
orderRouter.get("/order/by-buyer", auth, getOrdersGroupedByBuyer);
orderRouter.get("/order/by-seller", auth, getOrdersGroupedBySeller);


export default orderRouter



