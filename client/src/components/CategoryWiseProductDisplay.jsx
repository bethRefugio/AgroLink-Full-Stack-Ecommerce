import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import CardLoading from './CardLoading'
import CardProduct from './CardProduct'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'


const CategoryWiseProductDisplay = ({ id, name }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef()
    const subCategoryData = useSelector(state => state.product.allSubCategory)
    const loadingCardNumber = new Array(6).fill(null)


    const fetchCategoryWiseProduct = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getProductByCategory,
                data: { id }
            })
            if (response.data.success) {
                setData(response.data.data)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchCategoryWiseProduct()
    }, [id])


    const handleScrollRight = () => {
        containerRef.current.scrollLeft += 220
    }


    const handleScrollLeft = () => {
        containerRef.current.scrollLeft -= 220
    }


    const handleRedirectProductListpage = () => {
        const subcategory = subCategoryData.find(sub =>
            sub.category.some(c => c._id === id)
        )


        return `/${valideURLConvert(name)}-${id}/${valideURLConvert(subcategory?.name)}-${subcategory?._id}`
    }


    const redirectURL = handleRedirectProductListpage()


    return (
        <div>
            {/* Title & See All */}
            <div className='container mx-auto p-4 flex items-center justify-between gap-4'>
                <h3 className='font-semibold text-lg md:text-xl'>{name}</h3>
                <Link to={redirectURL} className='text-green-600 hover:text-green-400'>
                    See All
                </Link>
            </div>


            {/* Product Row */}
            <div className='relative flex items-center'>
                <div
                    className='container mx-auto px-4 flex gap-3 md:gap-4 overflow-x-auto scrollbar-none scroll-smooth'
                    ref={containerRef}
                >
                    {/* Loading Skeletons */}
                    {loading &&
                        loadingCardNumber.map((_, index) => (
                            <CardLoading key={'cw-load-' + index} />
                        ))
                    }


                    {/* Product Cards */}
                    {!loading && data.map((p, index) => (
                        <div
                            key={p._id + '-cw-' + index}
                            className="min-w-[48%] sm:min-w-[30%] md:min-w-[24%] lg:min-w-[20%] xl:min-w-[16%]"
                        >
                            <CardProduct data={p} />
                        </div>
                    ))}
                </div>


                {/* Desktop Scroll Buttons */}
                <div className='absolute w-full left-0 right-0 container mx-auto px-2 hidden lg:flex justify-between'>
                    <button
                        onClick={handleScrollLeft}
                        className='z-10 bg-white hover:bg-gray-100 shadow-lg text-lg p-2 rounded-full'
                    >
                        <FaAngleLeft />
                    </button>
                    <button
                        onClick={handleScrollRight}
                        className='z-10 bg-white hover:bg-gray-100 shadow-lg text-lg p-2 rounded-full'
                    >
                        <FaAngleRight />
                    </button>
                </div>
            </div>
        </div>
    )
}


export default CategoryWiseProductDisplay

