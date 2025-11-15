import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    },

    sellerId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User' 
    },
    orderId : {
        type : String,
        required : [true, "Provide orderId"],
        unique : true
    },
    productId : {
        type : mongoose.Schema.ObjectId,
        ref : "product"
    },
    product_details : {
        name : String,
        image : Array,
    },
    paymentId : {
        type : String,
        default : ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    delivery_address : {
        type : mongoose.Schema.ObjectId,
        ref : 'address'
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0
    },
    invoice_receipt : {
        type : String,
        default : ""
    },
    quantity: {
        type: Number,
        default: 1,
        required: true
    },
    order_status: {
        type: String,
        default: "Order Placed",
        enum: ['Order Placed', 'Processing', 'Out for Delivery', 'Ready For PickUp', 'Delivered', 'Cancelled']
    },




},{
    timestamps : true
})

const OrderModel = mongoose.model('order',orderSchema)

export default OrderModel