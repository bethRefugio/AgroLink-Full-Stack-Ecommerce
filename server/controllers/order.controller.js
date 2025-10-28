import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import AddressModel from "../models/address.model.js";
import mongoose from "mongoose";


 export async function CashOnDeliveryOrderController(request, response) {
  try {
    const { userId, list_items, totalAmt, addressId, subTotalAmt } = request.body;

    // 1. Get all unique product IDs from the cart list
    const productIds = list_items.map((el) => el.productId._id);

    // 2. Fetch the products from ProductModel to get seller/userId
    const products = await ProductModel.find({ _id: { $in: productIds } }).select("userId sellerId");
    const productSellerMap = products.reduce((acc, product) => {
      acc[product._id.toString()] =
        (product.userId || product.sellerId)
          ? (product.userId || product.sellerId).toString()
          : null;
      return acc;
    }, {});

    // 3. Prepare payload
    const payload = list_items.map((el) => {
      const currentProductId = el.productId._id.toString();
      const sellerId =
        productSellerMap[currentProductId] ||
        el.productId.userId ||
        el.productId.sellerId ||
        null;

      return {
        userId: userId,
        sellerId: sellerId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        quantity: el.quantity ?? 1,
        paymentId: "",
        payment_status: "CASH ON DELIVERY",
        delivery_address: addressId || null,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });

    // 4. Insert orders
    const generatedOrder = await OrderModel.insertMany(payload);

    // 5. Remove from cart
    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order successfully",
      error: false,
      success: true,
      data: generatedOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


// ...existing code...
export const CashOnPickupOrderController = async (req, res) => {
  try {
    const userId = req.userId;
    const { list_items, totalAmt, subTotalAmt } = req.body;

    if (!list_items || list_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    // 1. Get unique seller IDs from the cart (use userId fallback)
    const sellerIds = [
    ...new Set(
        cartItemsList.map(item => {
        if (!item.productId) return null;
        return item.productId.userId || item.productId.sellerId || item.productId?._id;
        }).filter(Boolean)
    )
    ];


    // 2. Fetch pickup addresses for all sellers
    const sellerPickupAddresses = await AddressModel.find({
      userId: { $in: sellerIds },
      isPickupAddress: true
    });

    if (!sellerPickupAddresses || sellerPickupAddresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Seller's pickup addresses are not available.",
      });
    }

    // 3. Create the order payload
    const payload = list_items.map(el => {
      return {
        userId: userId,
        sellerId: el.productId.sellerId,
       sellerId: (el.productId.userId || el.productId.sellerId) || null,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image
        },
        quantity: el.quantity ?? 1,
        paymentId: "",
        payment_status: "CASH ON PICKUP",
        delivery_address: null, // Since it's pickup, not delivery
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });

    const generatedOrder = await OrderModel.insertMany(payload);

    // Remove items from the cart
    await CartProductModel.deleteMany({ userId: userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return res.json({
      success: true,
      message: "Order placed successfully. Here are the pickup addresses.",
      data: {
        orders: generatedOrder,
        pickupAddresses: sellerPickupAddresses
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};
 // ...existing code...



export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
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

// ✅ New simpler version
export const getSellerPickupAddressController = async (req, res) => {
  try {
    const { sellerIds } = req.body;

    if (!Array.isArray(sellerIds) || sellerIds.length === 0) {
      return res.status(400).json({
        message: "No seller IDs provided",
        success: false,
      });
    }

    // Find sellers' addresses
    const allAddresses = await AddressModel.find({
      userId: { $in: sellerIds },
      status: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v -status");

    // Get seller names
    const sellers = await UserModel.find({ _id: { $in: sellerIds } }).select("name");
    const sellerMap = {};
    sellers.forEach((s) => {
      sellerMap[s._id.toString()] = s.name;
    });

    // Combine names and addresses
    const addressesWithNames = allAddresses.map((addr) => ({
      ...addr.toObject(),
      sellerName: sellerMap[addr.userId.toString()] || "Unknown Seller",
    }));

    res.json({
      data: addressesWithNames,
      success: true,
      message: "Seller pickup addresses fetched successfully",
    });
  } catch (err) {
    console.error("Error fetching pickup addresses:", err);
    res.status(500).json({
      message: err.message || "Server error fetching seller pickup addresses",
      success: false,
    });
  }
};


// ...existing code...
export async function getSellerOrdersController(req, res) {
  try {
    const sellerId = req.userId;

    const ordersRaw = await OrderModel.find({ sellerId })
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "name email mobile" }) // buyer
      .populate({ path: "productId", select: "name image" }) // product
      .populate({ path: "delivery_address" }) // address
      .lean();

    const orders = ordersRaw.map((o) => ({
      _id: o._id,
      orderId: o.orderId,
      buyer: o.userId ? { _id: o.userId._id, name: o.userId.name, email: o.userId.email, mobile: o.userId.mobile } : null,
      // prefer populated productId, fallback to product_details stored on order
      product: o.productId
        ? { _id: o.productId._id, name: o.productId.name, image: o.productId.image }
        : (o.product_details ? { name: o.product_details.name, image: o.product_details.image } : null),
      // quantity may be stored or absent; fallback to 1
      quantity: o.quantity ?? o.product_details?.quantity ?? 1,
      totalAmt: o.totalAmt ?? o.subTotalAmt ?? 0,
      address: o.delivery_address || null,
      payment_status: o.payment_status || null,
      createdAt: o.createdAt,
    }));

    return res.json({
      success: true,
      message: "Seller orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
// ...existing code...


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
                payment_status : payment_status,
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

    // Handle the event
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
            payment_status : session.payment_status,
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

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

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

    // category can be an id or a name
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) filter.category = category;
      else filter["categoryName"] = category; // fallback if you store name
    }

    // subCategory can be an id, array of ids, or names
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

    // optional: only active products if your schema uses status
    // filter.status = true;

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

    const query = {}; // add filters from req.query if needed (status, payment_status, sellerId, etc.)

    const [ordersRaw, totalCount] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "userId", select: "name email mobile" }) // buyer
        .populate({ path: "productId", select: "name image price" }) // product
        .populate({ path: "delivery_address" }) // address
        .populate({ path: "sellerId", select: "name email" }) // seller
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
      payment_status: o.payment_status || null,
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