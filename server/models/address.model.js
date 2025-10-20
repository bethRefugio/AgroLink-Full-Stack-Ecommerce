import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    purok_house : {
        type : String,
        default : ""
    },
    barangay : {
        type : String,
        default : ""
    },
    city : {
        type : String,
        default : ""
    },
    zipcode : {
        type : String
    },
    country : {
        type : String
    },
    status : {
        type : Boolean,
        default : true
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        default : ""
    }
},{
    timestamps : true
})

const AddressModel = mongoose.model('address',addressSchema)

export default AddressModel