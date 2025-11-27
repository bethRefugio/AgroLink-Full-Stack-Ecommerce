import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'


const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  const user = useSelector((state) => state?.user)


  const originalPrice = data.price
  const discountedPrice = pricewithDiscount(data.price, data.discount)


  return (
    <div className="w-full">
      <Link
        to={url}
        className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
      >
        {/* Image Container */}
        <div className="relative bg-gray-50 w-full h-28 sm:h-32 md:h-40 overflow-hidden flex items-center justify-center">
          <img
            src={data.image[0]}
            alt={data.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />


          {/* Discount Badge */}
          {Boolean(data.discount) && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md">
              {data.discount}% OFF
            </div>
          )}
        </div>


        {/* Content */}
        <div className="p-3 flex-1 flex flex-col space-y-1">
          {/* Date */}
          <div className="text-[10px] text-green-600 font-medium">
            {data.createdAt
              ? new Date(data.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </div>


          {/* Product Name */}
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 min-h-[2rem]">
            {data.name}
          </h3>


          {/* Unit */}
          <p className="text-gray-600 text-[11px]">{data.unit}</p>


          {/* Price + Button */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-sm sm:text-base font-bold text-gray-900">
                {DisplayPriceInRupees(discountedPrice)}
              </div>


              {Boolean(data.discount) && (
                <div className="text-[10px] text-gray-400 line-through">
                  {DisplayPriceInRupees(originalPrice)}
                </div>
              )}
            </div>


            <div>
              {data.stock === 0 ? (
                <p className="text-red-500 text-[10px] font-medium">Out of stock</p>
              ) : (
                user?.role !== "SELLER" && (
                  <AddToCartButton data={data} small />
                )
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}


export default CardProduct

