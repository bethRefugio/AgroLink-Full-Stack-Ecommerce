import React, { useEffect, useState } from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import Loading from '../components/Loading'
import EditProductAdmin from '../components/EditProductAdmin'
import { IoSearchOutline } from "react-icons/io5"
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";


const ProductAdmin = () => {
  const [productData, setProductData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPageCount, setTotalPageCount] = useState(1)
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)
  const user = useSelector(state => state.user)


  const fetchProductData = async () => {
    try {
      setLoading(true)


      const requestData = {
        page,
        limit: 12,
        search
      }


      if (user?.role === "SELLER") {
        requestData.userId = user._id
      }


      const response = await Axios({
        ...SummaryApi.getProduct,
        data: requestData
      })


      const { data: responseData } = response


      if (responseData.success) {
        setTotalPageCount(responseData.totalNoPage)
        setProductData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchProductData()
  }, [page])


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductData()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])


  const handleNext = () => {
    if (page < totalPageCount) setPage(prev => prev + 1)
  }


  const handlePrevious = () => {
    if (page > 1) setPage(prev => prev - 1)
  }


  const handleDelete = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: { _id: id }
      })
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        fetchProductData()
      }
    } catch (err) {
      AxiosToastError(err)
    }
  }


  return (
    <section className="p-4">
      {/* Header */}
      <div className="p-2 bg-white shadow-md flex items-center justify-between gap-4 mb-4">
        <h2 className="font-semibold">
          {user?.role === "SELLER" ? "My Products" : "All Products"}
        </h2>
        <div className="h-full min-w-24 max-w-56 w-full ml-auto bg-blue-50 px-4 flex items-center gap-3 py-2 rounded border focus-within:border-primary-200">
          <IoSearchOutline size={25} />
          <input
            type="text"
            placeholder="Search product here ..."
            className="h-full w-full outline-none bg-transparent"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>


      {/* Loading */}
      {loading && <Loading />}


      {/* Product Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Unit</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              productData.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <img
                      src={Array.isArray(product.image) ? product.image[0] : product.image || "/placeholder.png"}
                      alt={product.name}
                      className="w-16 h-16 object-contain"
                    />
                  </td>
                  <td className="px-4 py-2 border">{product.name || "N/A"}</td>
                  <td className="px-4 py-2 border">{product.unit || "N/A"}</td>
                  <td className="px-4 py-2 border">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded text-xs"
                        onClick={() => setEditingProduct(product)}
                      >
                        <HiPencil size={18}/>
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-1 rounded text-xs"
                        onClick={() => handleDelete(product._id)}
                      >
                        <MdDelete size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Pagination */}
      <div className="flex justify-between items-center my-4">
        <button
          onClick={handlePrevious}
          className="border border-primary-200 px-4 py-1 hover:bg-primary-200"
        >
          Previous
        </button>
        <span className="w-full text-center">{page}/{totalPageCount}</span>
        <button
          onClick={handleNext}
          className="border border-primary-200 px-4 py-1 hover:bg-primary-200"
        >
          Next
        </button>
      </div>


      {/* Edit Modal */}
      {editingProduct && (
        <EditProductAdmin
          data={editingProduct}
          close={() => setEditingProduct(null)}
          fetchProductData={fetchProductData}
        />
      )}
    </section>
  )
}


export default ProductAdmin





