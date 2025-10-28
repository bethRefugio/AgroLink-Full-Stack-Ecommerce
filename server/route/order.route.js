import { Router } from 'express'
import auth from '../middleware/auth.js'
<<<<<<< Updated upstream
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe } from '../controllers/order.controller.js'
import { getAllOrdersController } from '../controllers/order.controller.js'
=======
import { CashOnDeliveryOrderController, getOrderDetailsController,  getSellerOrdersController,paymentController, webhookStripe } from '../controllers/order.controller.js'
>>>>>>> Stashed changes

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
<<<<<<< Updated upstream
orderRouter.get('/allorders',auth, getAllOrdersController)
=======
orderRouter.get('/seller-orders', auth, getSellerOrdersController);
>>>>>>> Stashed changes



export default orderRouter