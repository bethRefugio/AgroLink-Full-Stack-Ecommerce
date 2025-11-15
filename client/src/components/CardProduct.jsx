import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'

const CARD_WIDTH = 220
const CARD_HEIGHT = 340
const IMAGE_HEIGHT = 160

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  const user = useSelector((state) => state?.user)
  const originalPrice = data.price
  const discountedPrice = pricewithDiscount(data.price, data.discount)

  return (
    <Link
      to={url}
      className="block border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 group flex flex-col"
      style={{
        width: `${CARD_WIDTH}px`,
        minWidth: `${CARD_WIDTH}px`,
        maxWidth: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        minHeight: `${CARD_HEIGHT}px`,
        maxHeight: `${CARD_HEIGHT}px`
      }}
    >
      {/* Image Container */}
      <div
        className="relative bg-gray-50 w-full overflow-hidden flex-shrink-0"
        style={{
          height: `${IMAGE_HEIGHT}px`,
          minHeight: `${IMAGE_HEIGHT}px`,
          maxHeight: `${IMAGE_HEIGHT}px`
        }}
      >
        <img
          src={data.image[0]}
          alt={data.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {/* Discount Badge */}
        {Boolean(data.discount) && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-md">
            {data.discount}% OFF
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between">
        {/* Date */}
        <div className="flex items-center text-xs">
          <div className="text-green-600 font-medium">
            {data.createdAt
              ? new Date(data.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 min-h-[1.8rem]">
          {data.name}
        </h3>

        {/* Unit */}
        <p className="text-gray-600 text-xs">
          {data.unit}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="space-y-0.5">
            <div className="text-base lg:text-lg font-bold text-gray-900">
              {DisplayPriceInRupees(discountedPrice)}
            </div>
            {Boolean(data.discount) && (
              <div className="text-xs text-gray-400 line-through">
                {DisplayPriceInRupees(originalPrice)}
              </div>
            )}
          </div>

          <div>
            {data.stock === 0 ? (
              <p className="text-red-500 text-xs font-medium">Out of stock</p>
            ) : (
              user?.role !== "SELLER" && <AddToCartButton data={data} />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CardProduct