import UserModel from "../models/user.model.js"

const seller = async (req, res, next) => {
    try {
        const userId = req.userId; // same as in admin.js
        const user = await UserModel.findById(userId);

        if (!user || user.role !== "SELLER") {
            return res.status(403).json({
                message: "Permission denied",
                error: true,
                success: false
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: true,
            success: false
        });
    }
};

export default seller;
