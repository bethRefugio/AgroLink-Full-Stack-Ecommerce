import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js' // Adjust path if needed

const auth = async(request, response, next) => {
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]
       
        if (!token) {
            return response.status(401).json({
                message: "Provide token"
            })
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if (!decode) {
            return response.status(401).json({
                message: "unauthorized access",
                error: true,
                success: false
            })
        }

        request.userId = decode.id // Keep this for compatibility

        // Fetch user from DB and attach to request
        const user = await UserModel.findById(decode.id)
        if (!user) {
            return response.status(401).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        request.user = user // Add this for role-based checks

        next()

    } catch (error) {
        return response.status(500).json({
            message: "You have not login",
            error: true,
            success: false
        })
    }
}

export default auth