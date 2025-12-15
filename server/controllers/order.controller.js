import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import AddressModel from "../models/address.model.js";
import mongoose from "mongoose";

export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;


    console.log("🛒 Creating COD order with userId from auth:", userId);


    if (!userId) {
      return response.status(400).json({
        message: "User not authenticated. Please login again.",
        error: true,
        success: false
      });
    }


    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false
      });
    }


    const productIds = list_items.map((el) => el.productId._id);
    const products = await ProductModel.find({ _id: { $in: productIds } }).select("userId sellerId");
    const productSellerMap = products.reduce((acc, product) => {
      acc[product._id.toString()] =
        (product.userId || product.sellerId)
          ? (product.userId || product.sellerId).toString()
          : null;
      return acc;
    }, {});


    const payload = list_items.map((el) => {
      const currentProductId = el.productId._id.toString();
      const sellerId = productSellerMap[currentProductId] || el.productId.userId || el.productId.sellerId || null;


      return {
        userId: userId,
        sellerId: sellerId ? new mongoose.Types.ObjectId(sellerId) : null,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        quantity: el.quantity || 1,
        paymentId: "",
        payment_status: "Cash on Delivery",
        order_status: "Order Placed",
        delivery_address: addressId || null,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });


    const generatedOrder = await OrderModel.insertMany(payload);
    console.log("✅ COD Orders created successfully. Count:", generatedOrder.length);


    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });


    return response.json({
      message: "Order created successfully",
      error: false,
      success: true,
      data: generatedOrder,
    });
  } catch (error) {
    console.error("❌ COD Order creation error:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export const CashOnPickupOrderController = async (req, res) => {
  try {
    const userId = req.userId;
    const { list_items, totalAmt, subTotalAmt } = req.body;


    console.log("🏪 Creating pickup order with userId from auth:", userId);


    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated. Please login again.",
      });
    }


    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }


    if (!list_items || list_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }


    const sellerIds = [
      ...new Set(
        list_items.map(item => {
          if (!item.productId) return null;
          return item.productId.userId || item.productId.sellerId || item.productId?._id;
        }).filter(Boolean)
      )
    ];


    const sellerAddresses = await AddressModel.find({
      userId: { $in: sellerIds }
    }).populate('userId', 'name email');


    if (!sellerAddresses || sellerAddresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Seller addresses are not available.",
      });
    }


    const payload = list_items.map(el => {
      const sellerId = (el.productId.userId || el.productId.sellerId) || null;


      return {
        userId: userId,
        sellerId: sellerId ? new mongoose.Types.ObjectId(sellerId) : null,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image
        },
        quantity: el.quantity ?? 1,
        paymentId: "",
        payment_status: "Cash on Pickup",
        order_status: "Order Placed",
        delivery_address: null,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });


    const generatedOrder = await OrderModel.insertMany(payload);
    console.log("✅ Pickup orders created successfully. Count:", generatedOrder.length);


    await CartProductModel.deleteMany({ userId: userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });


    return res.json({
      success: true,
      message: "Order placed successfully. Here are the pickup addresses.",
      data: {
        orders: generatedOrder,
        pickupAddresses: sellerAddresses
      }
    });


  } catch (error) {
    console.error("❌ Pickup order creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};




export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const userId = req.userId;


    console.log("🔄 Updating order status:", { orderId, status, userId });


    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }


   
    let order;
   
   
    order = await OrderModel.findOne({ orderId: orderId });
   
 
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await OrderModel.findById(orderId);
    }


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    console.log("🔍 Found order:", {
      orderId: order.orderId,
      _id: order._id,
      sellerId: order.sellerId,
      userId: order.userId
    });


   
    const isSeller = order.sellerId && order.sellerId.toString() === userId;
    const isBuyer = order.userId && order.userId.toString() === userId;


    console.log("👤 Permission check:", { isSeller, isBuyer, userId });


    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this order"
      });
    }


   
    const validStatuses = ['Order Placed', 'Processing', 'Out for Delivery', 'Ready For PickUp', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }


   
    if (status === 'Cancelled') {
      if (order.order_status !== 'Order Placed') {
        return res.status(400).json({
          success: false,
          message: "Order cannot be cancelled as it is already being processed"
        });
      }
    }


   
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      order._id,
      { order_status: status },
      { new: true }
    ).populate('userId', 'name email mobile')
     .populate('delivery_address');


    console.log("✅ Order status updated successfully");


    return res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });


  } catch (error) {
    console.error("❌ Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};




export const setupPickupAddresses = async (req, res) => {
  try {
    const { sellerId } = req.body;
   
   
    const result = await AddressModel.updateMany(
      { userId: sellerId },
      { $set: { isPickupAddress: true } }
    );
   
    console.log("✅ Updated addresses to pickup:", result);
   
    return res.json({
      success: true,
      message: `Updated ${result.modifiedCount} addresses as pickup locations`
    });
  } catch (error) {
    console.error("❌ Setup error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};








export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}




export async function paymentController(request,response){
    try {
        const userId = request.userId
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'php',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100  
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity
            }
        })




        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }




        const session = await Stripe.checkout.sessions.create(params)




        return response.status(200).json(session)




    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}




export async function getSellerOrdersController(req, res) {
  try {
    const sellerId = req.userId;
    console.log("🔍 Fetching orders for seller:", sellerId);


    const ordersRaw = await OrderModel.find({ sellerId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        model: 'User',
        select: "name email mobile"
      })
      .populate({
        path: "productId",
        model: 'product',
        select: "name image"
      })
      .populate({
        path: "delivery_address",
        model: 'address'
      })
      .lean();


    console.log("🔍 Found orders:", ordersRaw.length);


    const orders = await Promise.all(ordersRaw.map(async (o) => {
      let buyerInfo = null;


      if (o.userId && o.userId._id && o.userId.name) {
        buyerInfo = {
          _id: o.userId._id,
          name: o.userId.name,
          email: o.userId.email,
          mobile: o.userId.mobile
        };
      } else if (o.userId) {
        try {
          let userIdToFetch = o.userId;
          if (typeof o.userId === 'object' && o.userId._id) {
            userIdToFetch = o.userId._id;
          }
          if (typeof userIdToFetch === 'string' && mongoose.Types.ObjectId.isValid(userIdToFetch)) {
            const fetchedUser = await UserModel.findById(userIdToFetch).select("name email mobile").lean();
            if (fetchedUser) {
              buyerInfo = {
                _id: fetchedUser._id,
                name: fetchedUser.name,
                email: fetchedUser.email,
                mobile: fetchedUser.mobile
              };
            }
          }
        } catch (err) {
          console.log(`❌ Order ${o.orderId}: Error fetching user:`, err.message);
        }
      }


      return {
        _id: o._id,
        orderId: o.orderId,
        buyer: buyerInfo,
        product: o.productId
          ? {
              _id: o.productId._id,
              name: o.productId.name,
              image: o.productId.image
            }
          : (o.product_details ? {
              name: o.product_details.name,
              image: o.product_details.image
            } : null),
        quantity: o.quantity || 1,
        totalAmt: o.totalAmt ?? o.subTotalAmt ?? 0,
        address: o.delivery_address || null,
        payment_status: o.payment_status || "", // Payment method
        order_status: o.order_status || "Order Placed", // Order status
        createdAt: o.createdAt,
      };
    }));


    return res.json({
      success: true,
      message: "Seller orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error fetching seller orders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}






const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []




    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)




            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId,
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : "Order Placed", // Set default status for Stripe payments
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }




            productList.push(paylod)
        }
    }




    return productList
}




//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY




    console.log("event",event)




   
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : "Order Placed", // Set to default status
        })
   
      const order = await OrderModel.insertMany(orderProduct)




        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }




 
  response.json({received: true});
}








export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId




        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')




        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}




export const getProductByCategoryAndSubCategory = async (req, res) => {
  try {
    const { category, subCategory } = req.body || {};




    const filter = {};




   
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) filter.category = category;
      else filter["categoryName"] = category;
    }




   
    if (subCategory) {
      if (Array.isArray(subCategory)) {
        const validIds = subCategory.filter((s) => mongoose.Types.ObjectId.isValid(s));
        if (validIds.length) filter.subCategory = { $in: validIds };
        else filter["subCategoryName"] = { $in: subCategory };
      } else {
        if (mongoose.Types.ObjectId.isValid(subCategory)) filter.subCategory = subCategory;
        else filter["subCategoryName"] = subCategory;
      }
    }








    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .populate("subCategory", "name")
      .lean();




    return res.json({ success: true, data: products });
  } catch (error) {
    console.error("getProductByCategoryAndSubCategory error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};




export async function getAllOrdersController(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "50", 10));
    const skip = (page - 1) * limit;

    const query = {};

    const [ordersRaw, totalCount] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "userId", select: "name email mobile" })
        .populate({ path: "productId", select: "name image price" })
        .populate({ path: "delivery_address" })
        .populate({ path: "sellerId", select: "name email" })
        .lean(),
      OrderModel.countDocuments(query),
    ]);




    const orders = ordersRaw.map((o) => ({
      _id: o._id,
      orderId: o.orderId,
      buyer: o.userId ? { _id: o.userId._id, name: o.userId.name, email: o.userId.email, mobile: o.userId.mobile } : null,
      seller: o.sellerId ? { _id: o.sellerId._id, name: o.sellerId.name, email: o.sellerId.email } : null,
      product: o.productId
        ? { _id: o.productId._id, name: o.productId.name, image: o.productId.image, price: o.productId.price }
        : (o.product_details ? { name: o.product_details.name, image: o.product_details.image } : null),
      quantity: o.quantity ?? o.product_details?.quantity ?? 1,
      totalAmt: o.totalAmt ?? o.subTotalAmt ?? 0,
      address: o.delivery_address || null,
      payment_status: o.payment_status || "Order Placed",
      createdAt: o.createdAt,
    }));




    return res.json({
      success: true,
      message: "All orders fetched successfully",
      data: orders,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("getAllOrdersController error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}

// admin: get orders grouped by buyer
export async function getOrdersGroupedByBuyer(request, response) {
  try {
    const requesterId = request.userId
    const requester = await UserModel.findById(requesterId)
    if (!requester) return response.status(401).json({ message: 'Unauthorized', error: true, success: false })
    if (requester.role !== 'ADMIN') return response.status(403).json({ message: 'Forbidden', error: true, success: false })

    const pipeline = [
      // include buyer info
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'buyer' } },
      { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true } },

      // group orders by buyer
      {
        $group: {
          _id: '$userId',
          buyer: { $first: '$buyer' },
          orders: { 
            $push: {
              _id: '$$ROOT._id',
              orderId: '$$ROOT.orderId',
              product_details: '$$ROOT.product_details',
              userId: '$$ROOT.userId',
              totalAmt: '$$ROOT.totalAmt',
              payment_status: '$$ROOT.payment_status',
              status: '$$ROOT.order_status',
              order_status: '$$ROOT.order_status',
              createdAt: '$$ROOT.createdAt'
            }
          },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$totalAmt', 0] } }
        }
      },

      // sort (largest buyer first)
      { $sort: { totalAmount: -1, totalOrders: -1 } }
    ]

    const result = await OrderModel.aggregate(pipeline)

    return response.json({ message: 'Orders grouped by buyer', success: true, error: false, data: result })
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false })
  }
}

// admin: get orders grouped by seller
export async function getOrdersGroupedBySeller(request, response) {
  try {
    const requesterId = request.userId
    
    // Check if user is authenticated
    if (!requesterId) {
      return response.status(401).json({ 
        message: 'User not authenticated', 
        error: true, 
        success: false 
      })
    }

    const requester = await UserModel.findById(requesterId)
    
    if (!requester) {
      return response.status(401).json({ 
        message: 'User not found', 
        error: true, 
        success: false 
      })
    }
    
    if (requester.role !== 'ADMIN') {
      return response.status(403).json({ 
        message: 'Only admins can access this resource', 
        error: true, 
        success: false 
      })
    }

    const pipeline = [
      { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'product.userId', foreignField: '_id', as: 'seller' } },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$seller._id',
          seller: { $first: '$seller' },
          orders: { 
            $push: {
              _id: '$$ROOT._id',
              orderId: '$$ROOT.orderId',
              product_details: '$$ROOT.product_details',
              userId: '$$ROOT.userId',
              totalAmt: '$$ROOT.totalAmt',
              payment_status: '$$ROOT.payment_status',
              status: '$$ROOT.order_status',
              order_status: '$$ROOT.order_status',
              createdAt: '$$ROOT.createdAt'
            }
          },
          productsSold: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$totalAmt', 0] } }
        }
      },
      { $sort: { totalRevenue: -1, productsSold: -1 } }
    ]

    const result = await OrderModel.aggregate(pipeline)

    return response.json({ 
      message: 'Orders grouped by seller', 
      success: true, 
      error: false, 
      data: result 
    })
  } catch (error) {
    console.error("❌ getOrdersGroupedBySeller error:", error)
    return response.status(500).json({ 
      message: error.message || error, 
      error: true, 
      success: false 
    })
  }
}

