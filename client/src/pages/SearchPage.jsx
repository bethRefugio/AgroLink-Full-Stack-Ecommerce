import React, { useEffect, useState } from 'react'
import CardLoading from '../components/CardLoading'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import CardProduct from '../components/CardProduct'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation, useNavigate } from 'react-router-dom'


import noDataImage from '../assets/nothing here yet.webp'
import banner from '../assets/agrolink-banner4.svg'
import agrolinkLogo from '../assets/agrolink-logo2.svg'


import useMobile from '../hooks/useMobile'
import { IoSearch } from "react-icons/io5"
import { FaArrowLeft } from "react-icons/fa"


const SearchPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)


  const loadingArrayCard = new Array(10).fill(null)


  const params = useLocation()
  const navigate = useNavigate()
  const [isMobile] = useMobile()


  const searchText = params?.search?.slice(3) || ''


  // Fetch search results
  const fetchData = async () => {
    try {
      setLoading(true)


      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: { search: searchText, page }
      })


      const { data: responseData } = response


      if (responseData.success) {
        if (responseData.page === 1) {
          setData(responseData.data)
        } else {
          setData(prev => [...prev, ...responseData.data])
        }
        setTotalPage(responseData.totalPage)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    setPage(1)
    setData([])
  }, [searchText])


  useEffect(() => {
    fetchData()
  }, [page, searchText])


  const handleFetchMore = () => {
    if (page < totalPage && !loading) {
      setPage(prev => prev + 1)
    }
  }


  return (
    <section className="w-full bg-white overflow-x-hidden">


      {/* ---- MOBILE HEADER ---- */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">


          {/* Back button + Logo */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white rounded-full shadow-md active:scale-95"
              >
                <FaArrowLeft size={20} className="text-yellow-600" />
              </button>
            )}


            {/* Logo now performs the SAME action as the back button */}
            <img
              src={agrolinkLogo}
              alt="AgroLink"
              className="h-8 md:h-10 cursor-pointer"
              onClick={() => navigate(-1)}
            />
          </div>


          {/* Right side is empty */}
          <div></div>
        </div>


        {/* Mobile Search Bar */}
        <div className="container mx-auto px-4 pb-4">
          <div className="w-full bg-slate-50 border h-11 rounded-lg flex items-center px-3 text-gray-600">
            <IoSearch className="mr-2" size={20} />
            <input
              type="text"
              autoFocus
              defaultValue={searchText}
              placeholder="Search for vegetables, fruits, etc."
              onChange={(e) => navigate(`/search?q=${e.target.value}`)}
              className="bg-transparent w-full outline-none"
            />
          </div>
        </div>
      </div>


      {/* ---- BANNER ---- */}
      <div className="w-full relative" style={{ aspectRatio: '4 / 1' }}>
        <img
          src={banner}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>


      {/* ---- RESULTS ---- */}
      <div className="container mx-auto p-4">
        <p className="font-semibold">Search Results: {data.length}</p>


        <InfiniteScroll
          dataLength={data.length}
          hasMore={page < totalPage}
          next={handleFetchMore}
          style={{ overflow: 'visible' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 py-4">
            {data.map((p, index) => (
              <CardProduct
                data={p}
                key={p?._id + "searchProduct" + index}
              />
            ))}


            {loading &&
              loadingArrayCard.map((_, index) => (
                <CardLoading key={"loadingsearchpage" + index} />
              ))}
          </div>
        </InfiniteScroll>


        {/* No data */}
        {!data[0] && !loading && (
          <div className="flex flex-col justify-center items-center w-full mx-auto">
            <img
              src={noDataImage}
              alt="No data"
              className="w-full h-full max-w-xs max-h-xs block"
            />
            <p className="font-semibold my-2">No Data found</p>
          </div>
        )}
      </div>
    </section>
  )
}


export default SearchPage



