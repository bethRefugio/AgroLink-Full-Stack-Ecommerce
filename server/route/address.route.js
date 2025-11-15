import { Router } from 'express'
import auth from '../middleware/auth.js'
import { addAddressController, disableAddressController, getAddressController, updateAddressController, getSellerPickupAddressController, deleteAddresscontroller } from '../controllers/address.controller.js'

const addressRouter = Router()

addressRouter.post('/create', auth, addAddressController)
addressRouter.get("/get", auth, getAddressController)
addressRouter.post("/get-seller-pickup-address", auth, getSellerPickupAddressController)
addressRouter.put('/update', auth, updateAddressController)
addressRouter.delete("/disable", auth, disableAddressController)
addressRouter.delete("/delete", auth, deleteAddresscontroller)



export default addressRouter
