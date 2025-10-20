import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js"; 

export const addAddressController = async(request,response)=>{
    try {
<<<<<<< HEAD
        const userId = request.userId 
        const { purok_house, barangay, city, zipcode, country } = request.body
=======
        const userId = request.userId // middleware
        const { purok_house, barangay, city, pincode, country } = request.body
>>>>>>> 658dbf4941224fed76acb886956eceb847861abd

        const createAddress = new AddressModel({
            purok_house,
            barangay,
            city,
            pincode,
            country,
            userId : userId
        })
        const saveAddress = await createAddress.save()

        const addUserAddressId = await UserModel.findByIdAndUpdate(userId,{
            $push : {
                address_details : saveAddress._id
            }
        })

        return response.json({
            message : "Address Created Successfully",
            error : false,
            success : true,
            data : saveAddress
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getAddressController = async(request,response)=>{
    try {
        const userId = request.userId 

        const data = await AddressModel.find({ userId : userId }).sort({ createdAt : -1})

        return response.json({
            data : data,
            message : "List of address",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const getSellerPickupAddressController = async (request, response) => {
  try {
    const { sellerIds } = request.body;

    if (!sellerIds || !Array.isArray(sellerIds) || sellerIds.length === 0) {
      return response.status(400).json({
        message: "sellerIds array is required",
        error: true,
        success: false,
      });
    }

    
    const allAddresses = await AddressModel.find({
      userId: { $in: sellerIds },
      status: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v -status");

    
    const latestAddresses = [];
    const seen = new Set();

    for (const addr of allAddresses) {
      if (!seen.has(addr.userId.toString())) {
        seen.add(addr.userId.toString());
        latestAddresses.push(addr);
      }
    }

    if (!latestAddresses.length) {
      return response.json({
        message: "No active pickup addresses found for sellers",
        data: [],
        error: false,
        success: true,
      });
    }

    
    const sellerIdsSet = latestAddresses.map(a => a.userId);
    const sellers = await UserModel.find({ _id: { $in: sellerIdsSet } }).select("name");

    
    const sellerMap = {};
    sellers.forEach(s => {
      sellerMap[s._id.toString()] = s.name;
    });

    
    const addressesWithNames = latestAddresses.map(addr => ({
      ...addr.toObject(),
      sellerName: sellerMap[addr.userId.toString()] || "Unknown Seller",
    }));

    return response.json({
      data: addressesWithNames,
      message: "Seller pickup addresses found",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Failed to fetch sellers' pickup addresses",
      error: true,
      success: false,
    });
  }
};


export const updateAddressController = async(request,response)=>{
    try {
<<<<<<< HEAD
        const userId = request.userId 
        const { _id, purok_house, barangay, city, zipcode, country } = request.body
=======
        const userId = request.userId // middleware auth 
        const { _id, purok_house, barangay, city, pincode, country } = request.body
>>>>>>> 658dbf4941224fed76acb886956eceb847861abd

        const updateAddress = await AddressModel.updateOne({ _id : _id, userId : userId },{
            purok_house,
            barangay,
            city,
            pincode,
            country
        })

        return response.json({
            message : "Address Updated",
            error : false,
            success : true,
            data : updateAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteAddresscontroller = async(request,response)=>{
    try {
        const userId = request.userId 
        const { _id } = request.body 

        const disableAddress = await AddressModel.updateOne({ _id : _id, userId},{
            status : false
        })

        return response.json({
            message : "Address remove",
            error : false,
            success : true,
            data : disableAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

