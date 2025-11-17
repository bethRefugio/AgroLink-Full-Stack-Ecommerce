import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { IoArrowBack } from 'react-icons/io5'

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const params = useParams()
  const navigate = useNavigate()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const AllCategory = useSelector(state => state.product.allCategory)
  const [DisplaySubCategory, setDisplaySubCategory] = useState([])

  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  const categoryId = params.category.split("-").slice(-1)[0]
  const subCategoryId = params.subCategory.split("-").slice(-1)[0]

  // Get category name
  const currentCategory = AllCategory.find(cat => cat._id === categoryId)
  const categoryName = currentCategory?.name || ''

  const fetchProductdata = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 8,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data)
        } else {
          setData([...data, ...responseData.data])
        }
        setTotalPage(responseData.totalCount)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductdata()
  }, [params])

  useEffect(() => {
    const sub = AllSubCategory.filter(s => {
      const filterData = s.category.some(el => {
        return el._id == categoryId
      })

      return filterData ? filterData : null
    })
    setDisplaySubCategory(sub)
  }, [params, AllSubCategory])

  const createSlug = (text) => {
    return text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ''
  }

  return (
    <section className='bg-white min-h-screen'>
      {/* Header with Breadcrumb and Title */}
      <div className='bg-white shadow-sm border-b sticky top-0 z-20'>
        <div className='container mx-auto px-4 py-4'>
          {/* Breadcrumb with Back Button */}
          <div className='flex items-center gap-3 mb-3 text-sm'>
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
              
              {categoryName && (
                <>
                  <span>/</span>
                  <span className='text-gray-900 font-medium'>
                    {categoryName}
                  </span>
                </>
              )}
              
              {subCategoryName && (
                <>
                  <span>/</span>
                  <span className='text-gray-900 font-medium'>
                    {subCategoryName}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Category Title - Centered */}
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900 text-center'>
            {categoryName}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto grid grid-cols-[90px,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[280px,1fr] gap-4 p-4'>
        {/* Sub category Sidebar */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='bg-green-50 p-3 border-b'>
            <h3 className='font-semibold text-gray-800 text-sm lg:text-base'>Subcategories</h3>
          </div>
          <div className='max-h-[calc(100vh-200px)] overflow-y-auto scrollbarCustom'>
            {DisplaySubCategory.map((s, index) => {
              const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`
              return (
                <Link 
                  key={s._id}
                  to={link} 
                  className={`w-full p-2 lg:flex items-center lg:gap-4 border-b hover:bg-green-50 cursor-pointer transition-colors
                    ${subCategoryId === s._id ? "bg-green-100 border-l-4 border-l-green-600" : ""}
                  `}
                >
                  <div className='w-fit max-w-28 mx-auto lg:mx-0 bg-white rounded box-border'>
                    <img
                      src={s.image}
                      alt={s.name}
                      className='w-14 lg:h-14 lg:w-12 h-full object-scale-down'
                    />
                  </div>
                  <p className='mt-1 lg:mt-0 text-xs text-center lg:text-left lg:text-base font-medium'>
                    {s.name}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='bg-gray-50 p-4 border-b'>
            <h3 className='font-semibold text-lg text-gray-800'>{subCategoryName}</h3>
            <p className='text-sm text-gray-600 mt-1'>
              {data.length} {data.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
          
          <div className='max-h-[calc(100vh-200px)] overflow-y-auto relative p-4'>
            {loading && data.length === 0 ? (
              <div className='flex justify-center items-center min-h-[400px]'>
                <Loading />
              </div>
            ) : data.length === 0 ? (
              <div className='flex justify-center items-center min-h-[400px]'>
                <p className='text-gray-500 text-lg'>No products found in this category</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {data.map((p, index) => (
                  <CardProduct
                    data={p}
                    key={p._id + "productSubCategory" + index}
                  />
                ))}
              </div>
            )}

            {loading && data.length > 0 && (
              <div className='flex justify-center py-4'>
                <Loading />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductListPage