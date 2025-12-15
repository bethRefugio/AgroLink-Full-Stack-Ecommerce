export const baseURL = import.meta.env.VITE_API_URL


const SummaryApi = {
    register : {
        url : '/api/user/register',
        method : 'post'
    },
    login : {
        url : '/api/user/login',
        method : 'post'
    },
    verify_email : {
        url : '/api/user/verify-email',
        method : 'post'
    },
    forgot_password : {
        url : "/api/user/forgot-password",
        method : 'put'
    },
    forgot_password_otp_verification : {
        url : 'api/user/verify-forgot-password-otp',
        method : 'put'
    },
    resetPassword : {
        url : "/api/user/reset-password",
        method : 'put'
    },
    refreshToken : {
        url : 'api/user/refresh-token',
        method : 'post'
    },
    userDetails : {
        url : '/api/user/user-details',
        method : "get"
    },
    logout : {
        url : "/api/user/logout",
        method : 'get'
    },
    uploadAvatar : {
        url : "/api/user/upload-avatar",
        method : 'put'
    },
    updateUserDetails : {
        url : '/api/user/update-user',
        method : 'put'
    },
    addCategory : {
        url : '/api/category/add-category',
        method : 'post'
    },
    uploadImage : {
        url : '/api/file/upload',
        method : 'post'
    },
    getCategory : {
        url : '/api/category/get',
        method : 'get'
    },
    updateCategory : {
        url : '/api/category/update',
        method : 'put'
    },
    deleteCategory : {
        url : '/api/category/delete',
        method : 'delete'
    },
    createSubCategory : {
        url : '/api/subcategory/create',
        method : 'post'
    },
    getSubCategory : {
        url : '/api/subcategory/get',
        method : 'post'
    },
    updateSubCategory : {
        url : '/api/subcategory/update',
        method : 'put'
    },
    deleteSubCategory : {
        url : '/api/subcategory/delete',
        method : 'delete'
    },
    createProduct : {
        url : '/api/product/create',
        method : 'post'
    },
    getProduct : {
        url : '/api/product/get',
        method : 'post'
    },
    getProductByCategory : {
        url : '/api/product/get-product-by-category',
        method : 'post'
    },
    getProductByCategoryAndSubCategory : {
        url : '/api/product/get-product-by-category-and-subcategory',
        method : 'post'
    },
    getProductDetails : {
        url : '/api/product/get-product-details',
        method : 'post'
    },
    updateProductDetails : {
        url : "/api/product/update-product-details",
        method : 'put'
    },
    deleteProduct : {
        url : "/api/product/delete-product",
        method : 'delete'
    },
    searchProduct : {
        url : '/api/product/search-product',
        method : 'post'
    },
    addTocart : {
        url : "/api/cart/create",
        method : 'post'
    },
    getCartItem : {
        url : '/api/cart/get',
        method : 'get'
    },
    updateCartItemQty : {
        url : '/api/cart/update-qty',
        method : 'put'
    },
    deleteCartItem : {
        url : '/api/cart/delete-cart-item',
        method : 'delete'
    },
    createAddress : {
        url : '/api/address/create',
        method : 'post'
    },
    getAddress : {
        url : '/api/address/get',
        method : 'get'
    },
    updateAddress : {
        url : '/api/address/update',
        method : 'put'
    },
    disableAddress : {
        url : '/api/address/disable',
        method : 'delete'
    },
    deleteAddress: {
        url : '/api/address/delete',
        method : 'delete'
    },
    getSellerPickupAddress : {
        url : '/api/address/get-seller-pickup-address',
        method : 'post'
    },
    CashOnDeliveryOrder : {
        url : "/api/order/cash-on-delivery",
        method : 'post'
    },
    payment_url : {
        url : "/api/order/checkout",
        method : 'post'
    },
    getOrderItems : {
        url : '/api/order/order-list',
        method : 'get'
    },
    getAllOrders : {
        url : '/api/order/all-orders',
        method : 'get'
    },
    getSellerOrders : {
        url : '/api/order/seller-orders',
        method : 'get'
    },
    getUsersTable : {
        url : '/api/user/users-table',
        method : 'get'
    },
    updateUsersTable : {
        url : '/api/user/users-table',
        method : 'put'
    },
    deleteUser : {
        url : '/api/user/delete-user',
        method : 'delete'
    },
    adminUpdateUser : {
        url : '/api/user/admin-update-user',
        method : 'put'
    },
    addPreference: {
        url: "/api/user/add-preference",
        method: "put"
    },
    getPreferences: {
        method: "get",
        url: "/api/user/preferences"
    },
    deletePreference: {
        method: "delete",
        url: "/api/user/delete-preference"
    },
    suggestPrice:{
        url: "/api/product/suggest-price",
        method: "post"
    },
    CashOnPickupOrder: {
        url: "/api/order/cash-on-pickup",
        method: 'post'
    },
    updateOrderStatus: {
        url: "/api/order/update-order-status",
        method: 'put'
    },
    getOrdersByBuyer: {
         url: '/api/order/order/by-buyer',
         method: 'get'
    },
    getOrdersBySeller: {
         url: '/api/order/order/by-seller',
         method: 'get'
    },
    getProductBySubCategory : {
        url : '/api/product/get-product-by-subcategory',
        method : 'post'
    },
    getProductBySeller : {
        url : '/api/product/get-product-by-seller',
        method : 'post'
    },
    contactCreate: {
        url: "/api/email/contact",
        method: "post",
    },
    listContacts: {
        url: "/api/email/contact",
        method: "get",
    },
    deleteContact: {
        url: (id) => `/api/email/contact/${id}`,
        method: "delete",
    },
    replyContact: {
        url: "/api/email/contact/reply",
        method: "post",
    },
    markContactAsRead: {
        url: (id) => `/api/email/contact/${id}/read`,
        method: "put",
    },
    replyContact: {
        url: "/api/email/contact/reply",
        method: "post",
    },
        // Price AI endpoints
    getLatestPrice: {
        url: "/api/price-ai/price/latest",
        method: "get",
    },
    getPriceHistory: {
        url: "/api/price-ai/price/history",
        method: "get",
    },
    getAveragePrice: {
        url: "/api/price-ai/price/average",
        method: "get",
    },
    getPriceSuggestion: {
        url: "/api/price-ai/price/suggestion",
        method: "get",
    },
    getCommodities: {
        url: "/api/price-ai/commodities",
        method: "get",
    },
    getItemsByCommodity: {
        url: "/api/price-ai/items",
        method: "get",
    },
    createPriceEntry: {
        url: "/api/price-ai/price",
        method: "post",
    },
    getAllPriceEntries: {
        url: "/api/price-ai/price/all",
        method: "get",
    },
    updatePriceEntry: {
        url: (id) => `/api/price-ai/price/${id}`,
        method: "put",
    },
    deletePriceEntry: {
        url: (id) => `/api/price-ai/price/${id}`,
        method: "delete",
    },
    bulkImportPrices: {
        url: "/api/price-ai/price/bulk-import",
        method: "post",
    },
    syncProductsToPriceAI: {
        url: "/api/price-ai/sync-products",
        method: "post",
    },
    translateText: {
        url: '/api/translate',
        method: 'post'
    },
    resendVerification: {
        url : '/api/user/resend-verification',
        method : 'post'
    },
    trainModels: {
        url: "/api/model-training/train",
        method: "post",
    },
    getBestModels: {
        url: "/api/model-training/best-models",
        method: "get",
    }
}


export default SummaryApi



