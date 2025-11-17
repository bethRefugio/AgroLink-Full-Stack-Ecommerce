import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa6'
import { IoArrowBack } from 'react-icons/io5'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import Divider from '../components/Divider'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'
import { useSelector } from 'react-redux'
import CardProduct from '../components/CardProduct'
import { MdStorefront } from 'react-icons/md'

const fallbackImg =
  'https://via.placeholder.com/400x400.png?text=No+Image'

const ProductDisplayPage = () => {
  const params = useParams()
  const navigate = useNavigate()
  const productId = params?.product?.split('-')?.slice(-1)[0]

  const [data, setData] = useState({
    name: '',
    image: [],
    category: [],
    subCategory: [],
    userId: null
  })
  const [imageIndex, setImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [sellerProducts, setSellerProducts] = useState([])
  const imageContainer = useRef()
  const user = useSelector(state => state?.user)

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId }
      })
      const { data: responseData } = response
      if (responseData.success && responseData.data) {
        const prod = responseData.data
        setData({
          ...prod,
          image: Array.isArray(prod.image) ? prod.image : [],
          category: Array.isArray(prod.category) ? prod.category : [],
          subCategory: Array.isArray(prod.subCategory) ? prod.subCategory : [],
          userId: prod.userId || null
        })
        const subId = prod.subCategory?.[0]?._id
        const sellerId = prod.userId?._id
        fetchRelatedProducts(subId)
        fetchSellerProducts(sellerId)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async subCategoryId => {
    if (!subCategoryId) return
    try {
      const response = await Axios({
        ...SummaryApi.getProductBySubCategory,
        data: { id: subCategoryId }
      })
      if (response.data.success) {
        const filtered = response.data.data
          .filter(p => p._id !== productId)
          .slice(0, 12)
        setRelatedProducts(filtered)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSellerProducts = async sellerId => {
    if (!sellerId) return
    try {
      const response = await Axios({
        ...SummaryApi.getProductBySeller,
        data: { sellerId, limit: 10 }
      })
      if (response.data.success) {
        const filtered = response.data.data
          .filter(p => p._id !== productId)
          .slice(0, 10)
        setSellerProducts(filtered)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
      window.scrollTo(0, 0)
      setImageIndex(0)
    }
  }, [productId])

  const handleScrollRight = () => {
    if (imageContainer.current) imageContainer.current.scrollLeft += 120
  }
  const handleScrollLeft = () => {
    if (imageContainer.current) imageContainer.current.scrollLeft -= 120
  }

  const priceToShow = pricewithDiscount(data.price, data.discount)

  return (
    <section className='bg-gray-50 min-h-screen py-6'>
      <div className='container mx-auto px-4'>
        {/* Breadcrumb with Back Button */}
        <div className='flex items-center gap-3 mb-4 text-sm'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors'
            title='Go back'
          >
            <IoArrowBack size={20} />
          </button>
          
          <nav className='flex items-center gap-2 text-gray-600 flex-wrap'>
            <Link to='/home' className='text-green-600 hover:text-green-700 font-medium'>
              Home
            </Link>
            
            {data.category?.[0] && (
              <>
                <span>/</span>
                <span className='text-gray-700 font-medium'>
                  {data.category[0].name}
                </span>
              </>
            )}
            
            {data.subCategory?.[0] && (
              <>
                <span>/</span>
                <span className='text-gray-700 font-medium'>
                  {data.subCategory[0].name}
                </span>
              </>
            )}
            
            {data.name && (
              <>
                <span>/</span>
                <span className='text-gray-900 font-semibold truncate max-w-xs' title={data.name}>
                  {data.name}
                </span>
              </>
            )}
          </nav>
        </div>

        <div className='grid lg:grid-cols-[300px,1fr] gap-6'>
          {/* LEFT SIDEBAR */}
          <aside className='hidden lg:block'>
            <div className='bg-white rounded-lg shadow-sm p-4 sticky top-4'>
              <h3 className='font-semibold text-lg mb-4 text-gray-800'>More products</h3>
              <div className='space-y-3 max-h-[480px] overflow-y-auto'>
                {loading && relatedProducts.length === 0 && (
                  <p className='text-sm text-gray-500'>Loading…</p>
                )}
                {!loading && relatedProducts.length === 0 && (
                  <p className='text-sm text-gray-500'>
                    No other products in this subcategory.
                  </p>
                )}
                {relatedProducts.map(product => {
                  const slug =
                    product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
                    'product'
                  return (
                    <Link
                      key={product._id}
                      to={`/product/${slug}-${product._id}`}
                      className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition'
                    >
                      <img
                        src={product.image?.[0] || fallbackImg}
                        alt={product.name}
                        className='w-12 h-12 object-cover rounded'
                        loading='lazy'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-800 truncate'>
                          {product.name}
                        </p>
                        <p className='text-xs text-gray-500 truncate'>
                          {product.unit}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
              <div className='grid lg:grid-cols-2 gap-6 p-6'>
                {/* PRODUCT IMAGES */}
                <div>
                  <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-4'>
                    <div className='aspect-square flex items-center justify-center bg-gray-50'>
                      {loading ? (
                        <div className='animate-pulse w-full h-full bg-gray-100' />
                      ) : (
                        <img
                          src={data.image?.[imageIndex] || fallbackImg}
                          alt={data.name}
                          className='w-full h-full object-contain'
                        />
                      )}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className='relative'>
                    <div
                      ref={imageContainer}
                      className='flex gap-2 overflow-x-auto scrollbar-none scroll-smooth'
                    >
                      {(data.image?.length ? data.image : [fallbackImg]).map((img, idx) => (
                        <button
                          type='button'
                          key={img + idx}
                          onClick={() => setImageIndex(idx)}
                          className={`min-w-[80px] w-20 h-20 border-2 rounded-lg overflow-hidden ${
                            idx === imageIndex ? 'border-green-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={img || fallbackImg}
                            alt={`thumbnail-${idx}`}
                            className='w-full h-full object-cover'
                            loading='lazy'
                          />
                        </button>
                      ))}
                    </div>
                    {data.image?.length > 4 && (
                      <div className='absolute inset-0 flex justify-between items-center px-1 pointer-events-none'>
                        <button
                          onClick={handleScrollLeft}
                          className='pointer-events-auto bg-white rounded-full p-1 shadow-md hover:bg-gray-100'
                        >
                          <FaAngleLeft />
                        </button>
                        <button
                          onClick={handleScrollRight}
                          className='pointer-events-auto bg-white rounded-full p-1 shadow-md hover:bg-gray-100'
                        >
                          <FaAngleRight />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRODUCT INFO */}
                <div className='flex flex-col'>
                  <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>
                    {data.name || (loading ? 'Loading…' : 'Unnamed Product')}
                  </h1>

                  {data.userId && (
                    <div className='flex items-center gap-2 text-sm text-gray-600 mb-4'>
                      <MdStorefront className='text-green-600' />
                      <span>{data.userId.name}</span>
                    </div>
                  )}

                  <Divider />

                  {/* PRICE */}
                  <div className='mb-6'>
                    <div className='flex items-baseline gap-3 mb-2'>
                      <span className='text-3xl font-bold text-green-600'>
                        {DisplayPriceInRupees(priceToShow || 0)}
                      </span>
                      {data.unit && (
                        <span className='text-sm text-gray-500'>/per {data.unit}</span>
                      )}
                    </div>
                    {data.discount > 0 && (
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-500 line-through'>
                          {DisplayPriceInRupees(data.price)}
                        </span>
                        <span className='bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-semibold'>
                          {data.discount}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* META */}
                  <div className='space-y-3 mb-6'>
                    <div className='flex border-b pb-2'>
                      <span className='font-semibold text-gray-700 w-32'>Category</span>
                      <span className='text-gray-600 truncate'>
                        {data.category?.[0]?.name || '-'}{' '}
                        {data.subCategory?.[0]?.name ? `/ ${data.subCategory?.[0]?.name}` : ''}
                      </span>
                    </div>
                    <div className='flex border-b pb-2'>
                      <span className='font-semibold text-gray-700 w-32'>Unit</span>
                      <span className='text-gray-600'>{data.unit || '—'}</span>
                    </div>
                    <div className='flex border-b pb-2'>
                      <span className='font-semibold text-gray-700 w-32'>Stock</span>
                      <span
                        className={`font-semibold ${
                          data.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {data.stock > 0 ? `${data.stock} available` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION + ADD TO CART */}
                  <div className='mt-2'>
                    <h3 className='font-semibold text-lg mb-3 text-gray-800'>Description</h3>
                    <p className='text-gray-600 leading-relaxed whitespace-pre-line'>
                      {data.description || 'No description available.'}
                    </p>

                    {data?.more_details && Object.keys(data.more_details).length > 0 && (
                      <div className='mt-6 space-y-3'>
                        <h3 className='font-semibold text-lg text-gray-800'>
                          Additional Information
                        </h3>
                        {Object.keys(data.more_details).map(key => (
                          <div key={key} className='flex border-b pb-2'>
                            <span className='font-semibold text-gray-700 w-48 capitalize'>
                              {key}
                            </span>
                            <span className='text-gray-600'>
                              {String(data.more_details[key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart below description */}
                    <div className='mt-6'>
                      {data.stock > 0 ? (
                        user?.role !== 'SELLER' && <AddToCartButton data={data} />
                      ) : (
                        <button
                          disabled
                          className='w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed'
                        >
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SELLER PRODUCTS */}
            {sellerProducts.length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold text-gray-900'>Seller&apos;s Other Products</h2>
                  <Link
                    to={`/seller/${data.userId?._id}`}
                    className='text-green-600 hover:text-green-700 font-medium'
                  >
                    See all
                  </Link>
                </div>
                <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {sellerProducts.slice(0, 10).map(product => (
                    <CardProduct key={product._id} data={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDisplayPage