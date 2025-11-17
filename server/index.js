import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import emailRoute from "./route/email.route.js"
import priceSuggestionRoute from "./route/price_suggestion_ai.route.js"
import translateRouter from './route/translate.route.js'

const app = express()

// IMPORTANT: Set body size limits FIRST before other middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use(cors({
    credentials : true,
    origin : process.env.FRONTEND_URL
}))
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = 8080 || process.env.PORT 

app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)
app.use("/api/email", emailRoute)
app.use("/api/price-ai", priceSuggestionRoute)
app.use("/api", translateRouter)

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)
    })
})